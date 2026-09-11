import json
import os
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
import numpy as np
from scipy.spatial import KDTree
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import GATConv

TOPOLOGY_PATH = "data/corridor/bengaluru_topology.json"
WEIGHTS_PATH = "data/corridor/stgat_weights_bengaluru.pt"

if not os.path.exists(TOPOLOGY_PATH):
    raise FileNotFoundError(f"Missing {TOPOLOGY_PATH}. Run extract_bengaluru_corridor.py first.")

with open(TOPOLOGY_PATH, "r") as f:
    topo_data = json.load(f)

CORRIDOR_NODES = topo_data["nodes"]
NODE_CODE_TO_IDX = {node["id"]: idx for idx, node in enumerate(CORRIDOR_NODES)}
NUM_NODES = len(CORRIDOR_NODES)

coords = np.array([[n["lat"], n["lon"]] for n in CORRIDOR_NODES])
SPATIAL_INDEX = KDTree(coords)

HOP_DISTANCES = {}
src_list, dst_list = [], []
for link in topo_data.get("links", []):
    u = NODE_CODE_TO_IDX[link["source"]]
    v = NODE_CODE_TO_IDX[link["target"]]
    src_list.extend([u, v])
    dst_list.extend([v, u])
    dist = float(link.get("distance_km", 8.0))
    HOP_DISTANCES[(u, v)] = dist
    HOP_DISTANCES[(v, u)] = dist

EDGE_INDEX = torch.tensor([src_list, dst_list], dtype=torch.long)

# Indian Railways Rolling Stock Priority Tiers & Punctuality Cost Weights
TRAIN_METADATA = {
    "20608": {
        "name": "Vande Bharat Express",
        "priority": 1.0,
        "type": "SUPERFAST_PREMIUM",
        "max_speed": 130.0,
        "delay_cost_weight": 5.0  # High penalty for delaying premium rake
    },
    "06527": {
        "name": "Bangarapet MEMU",
        "priority": 0.5,
        "type": "SUBURBAN_COMMUTER",
        "max_speed": 60.0,
        "delay_cost_weight": 1.0
    },
    "FREIGHT_DEFAULT": {
        "name": "Container Freight",
        "priority": 0.2,
        "type": "FREIGHT",
        "max_speed": 75.0,
        "delay_cost_weight": 0.5
    }
}

def get_train_meta(train_number: str) -> Dict[str, Any]:
    return TRAIN_METADATA.get(train_number, {
        "name": f"Special {train_number}",
        "priority": 0.4,
        "type": "CONVENTIONAL",
        "max_speed": 80.0,
        "delay_cost_weight": 1.0
    })

class STGATDelayModel(nn.Module):
    def __init__(self, in_features=5, hidden_dim=32):
        super().__init__()
        self.gat = GATConv(in_channels=in_features, out_channels=hidden_dim, heads=1)
        self.gru = nn.GRUCell(hidden_dim, hidden_dim)
        self.delay_head = nn.Linear(hidden_dim, 1)
        self.risk_head = nn.Sequential(nn.Linear(hidden_dim, 1), nn.Sigmoid())

    def forward(self, x, edge_index, h_prev):
        spatial_out = F.relu(self.gat(x, edge_index))
        h_next = self.gru(spatial_out, h_prev)
        return self.delay_head(h_next), self.risk_head(h_next), h_next

DEVICE = torch.device("cpu")
MODEL = STGATDelayModel(in_features=5, hidden_dim=32).to(DEVICE)

if os.path.exists(WEIGHTS_PATH):
    try:
        MODEL.load_state_dict(torch.load(WEIGHTS_PATH, map_location=DEVICE))
    except Exception:
        pass

MODEL.eval()
TEMPORAL_STATE = torch.zeros((NUM_NODES, 32), device=DEVICE)

ACTIVE_TRAIN_POSITIONS: Dict[str, Dict[str, Any]] = {}
BENCHMARK_LOGS: List[Dict[str, Any]] = []
DISPATCHER_DIRECTIVES_LOG: List[Dict[str, Any]] = []

def predict_cascade(train_number: str, lat: float, lon: float, speed: float, signal: str):
    global TEMPORAL_STATE
    _, idx = SPATIAL_INDEX.query([lat, lon])
    current_node = CORRIDOR_NODES[idx]
    meta = get_train_meta(train_number)

    sig_weight = {"GREEN": 1.0, "DOUBLE_YELLOW": 0.6, "YELLOW": 0.3, "RED": 0.0}.get(signal, 1.0)
    weather_penalty = 0.8 if current_node.get("visibility_m", 8000) < 1000 else 0.1

    features = np.zeros((NUM_NODES, 5), dtype=np.float32)
    features[idx] = [1.0, min(speed / 130.0, 1.0), sig_weight, weather_penalty, meta["priority"]]

    with torch.no_grad():
        x_tensor = torch.tensor(features, dtype=torch.float, device=DEVICE)
        pred_delays, risks, TEMPORAL_STATE = MODEL(x_tensor, EDGE_INDEX, TEMPORAL_STATE)

    forecasts = []
    now = datetime.now(timezone.utc)
    cumulative_km = 0.0

    for i in range(idx + 1, NUM_NODES):
        stn = CORRIDOR_NODES[i]
        default_hop = 5.0 if i <= 5 else 20.0
        segment_dist = HOP_DISTANCES.get((i - 1, i), default_hop)
        cumulative_km += segment_dist

        gnn_delay_min = float(torch.clamp(torch.abs(pred_delays[i]), min=0.0, max=60.0).item())
        risk_val = float(risks[i].item())

        kinematic_transit_min = (cumulative_km / max(speed, 20.0)) * 60.0
        baseline_eta = now + timedelta(minutes=kinematic_transit_min)
        dynamic_eta = now + timedelta(minutes=kinematic_transit_min + gnn_delay_min)

        forecasts.append({
            "station": stn["id"],
            "distance_remaining_km": round(cumulative_km, 1),
            "baseline_static_eta": baseline_eta.strftime("%H:%M UTC"),
            "dynamic_gnn_eta": dynamic_eta.strftime("%H:%M UTC"),
            "predicted_delay_min": round(gnn_delay_min, 1),
            "cascade_risk": round(risk_val, 2)
        })

    ACTIVE_TRAIN_POSITIONS[train_number] = {
        "train_number": train_number,
        "name": meta["name"],
        "priority": meta["priority"],
        "block_idx": idx,
        "station_id": current_node["id"],
        "speed": speed,
        "signal": signal,
        "forecasts": forecasts,
        "updated_at": now.isoformat()
    }

    bottleneck_alert = evaluate_bottlenecks_and_precedence(train_number, idx, forecasts, threshold=0.15)

    if forecasts:
        BENCHMARK_LOGS.append({
            "timestamp": now.strftime("%H:%M:%S"),
            "train_number": train_number,
            "current_block": current_node["id"],
            "target_station": forecasts[0]["station"],
            "baseline_delay_min": 0.0,
            "gnn_predicted_delay_min": forecasts[0]["predicted_delay_min"],
            "variance_captured_min": forecasts[0]["predicted_delay_min"]
        })
        if len(BENCHMARK_LOGS) > 100:
            BENCHMARK_LOGS.pop(0)

    return {
        "train_number": train_number,
        "train_name": meta["name"],
        "priority_tier": meta["priority"],
        "current_block": current_node["id"],
        "telemetry": {"lat": lat, "lon": lon, "speed_kmh": speed, "signal": signal},
        "forecasts": forecasts,
        "copilot_alert": bottleneck_alert
    }

def evaluate_bottlenecks_and_precedence(source_train: str, current_node_idx: int, forecasts: List[Dict[str, Any]], threshold: float = 0.15) -> Optional[Dict[str, Any]]:
    source_meta = get_train_meta(source_train)

    for fc in forecasts:
        if fc["cascade_risk"] >= threshold:
            target_stn = fc["station"]
            target_stn_idx = NODE_CODE_TO_IDX[target_stn]

            affected_trains = []
            precedence_action = None

            for t_num, t_data in ACTIVE_TRAIN_POSITIONS.items():
                if t_num == source_train:
                    continue

                if t_data["block_idx"] <= target_stn_idx:
                    affected_trains.append(t_num)
                    trailing_meta = get_train_meta(t_num)

                    # Higher priority train behind a lower priority train in the corridor
                    if trailing_meta["priority"] > source_meta["priority"]:
                        # Lookahead 1 hop for loop line station
                        loop_station_idx = min(current_node_idx + 1, NUM_NODES - 1)
                        loop_station = CORRIDOR_NODES[loop_station_idx]["id"]

                        # Quantitative trade-off calculation:
                        status_quo_vb_delay = round(fc["predicted_delay_min"] * 1.8, 1)
                        status_quo_memu_delay = round(fc["predicted_delay_min"], 1)
                        status_quo_total_cost = (
                            (status_quo_vb_delay * trailing_meta["delay_cost_weight"]) +
                            (status_quo_memu_delay * source_meta["delay_cost_weight"])
                        )

                        overtake_vb_delay = 0.0
                        overtake_memu_delay = round(status_quo_memu_delay + 6.0, 1)  # 6 min loop dwell
                        overtake_total_cost = (
                            (overtake_vb_delay * trailing_meta["delay_cost_weight"]) +
                            (overtake_memu_delay * source_meta["delay_cost_weight"])
                        )

                        net_savings = round(status_quo_total_cost - overtake_total_cost, 1)

                        precedence_action = {
                            "action_code": "PRECEDENCE_OVERTAKE_RECOMMENDED",
                            "status": "PENDING_DISPATCHER_APPROVAL",
                            "priority_train": {
                                "train_number": t_num,
                                "name": trailing_meta["name"],
                                "current_block": t_data["station_id"],
                                "speed_kmh": t_data["speed"]
                            },
                            "preempted_train": {
                                "train_number": source_train,
                                "name": source_meta["name"],
                                "current_block": CORRIDOR_NODES[current_node_idx]["id"]
                            },
                            "recommended_loop_station": loop_station,
                            "tradeoff_analysis": {
                                "status_quo": {
                                    "vande_bharat_delay_min": status_quo_vb_delay,
                                    "memu_delay_min": status_quo_memu_delay,
                                    "corridor_penalty_cost": status_quo_total_cost
                                },
                                "recommended_overtake": {
                                    "vande_bharat_delay_min": overtake_vb_delay,
                                    "memu_delay_min": overtake_memu_delay,
                                    "corridor_penalty_cost": overtake_total_cost
                                },
                                "net_system_efficiency_gain": f"+{net_savings} points"
                            },
                            "advisory_directive": (
                                f"Route {source_meta['name']} ({source_train}) into Loop Line 2 at {loop_station}. "
                                f"Clear Main Line for {trailing_meta['name']} ({t_num}). "
                                f"Net network delay savings: {status_quo_vb_delay} min for high-priority rake."
                            )
                        }

            return {
                "bottleneck_station": target_stn,
                "delayed_train": source_train,
                "delayed_train_name": source_meta["name"],
                "predicted_delay_min": round(fc["predicted_delay_min"], 1),
                "downstream_cascade_risk": round(fc["cascade_risk"], 2),
                "affected_trains": affected_trains,
                "dispatcher_precedence_action": precedence_action
            }

    return None

def format_bottleneck_payload(source_train: str, current_node_idx: int, forecasts: List[Dict[str, Any]], threshold: float = 0.15) -> Optional[Dict[str, Any]]:
    return evaluate_bottlenecks_and_precedence(source_train, current_node_idx, forecasts, threshold)
import json
import os
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
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

class STGATDelayModel(nn.Module):
    def __init__(self, in_features=4, hidden_dim=32):
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
MODEL = STGATDelayModel(in_features=4, hidden_dim=32).to(DEVICE)

if os.path.exists(WEIGHTS_PATH):
    MODEL.load_state_dict(torch.load(WEIGHTS_PATH, map_location=DEVICE))

MODEL.eval()
TEMPORAL_STATE = torch.zeros((NUM_NODES, 32), device=DEVICE)

ACTIVE_TRAIN_POSITIONS: Dict[str, Dict[str, Any]] = {}

def predict_cascade(train_number: str, lat: float, lon: float, speed: float, signal: str):
    global TEMPORAL_STATE
    _, idx = SPATIAL_INDEX.query([lat, lon])
    current_node = CORRIDOR_NODES[idx]

    sig_weight = {"GREEN": 1.0, "DOUBLE_YELLOW": 0.6, "YELLOW": 0.3, "RED": 0.0}.get(signal, 1.0)
    weather_penalty = 0.8 if current_node.get("visibility_m", 8000) < 1000 else 0.1

    features = np.zeros((NUM_NODES, 4), dtype=np.float32)
    features[idx] = [1.0, min(speed / 130.0, 1.0), sig_weight, weather_penalty]

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

        delay_min = float(torch.clamp(torch.abs(pred_delays[i]), min=0.0, max=60.0).item())
        risk_val = float(risks[i].item())

        transit_time_min = (cumulative_km / max(speed, 20.0)) * 60.0
        eta = now + timedelta(minutes=transit_time_min + delay_min)

        forecasts.append({
            "station": stn["id"],
            "distance_remaining_km": round(cumulative_km, 1),
            "dynamic_eta": eta.strftime("%H:%M UTC"),
            "predicted_delay_min": round(delay_min, 1),
            "cascade_risk": round(risk_val, 2)
        })

    ACTIVE_TRAIN_POSITIONS[train_number] = {
        "block_idx": idx,
        "station_id": current_node["id"],
        "speed": speed,
        "forecasts": forecasts
    }

    # Trigger alert if downstream risk reaches or exceeds 0.15
    bottleneck_alert = format_bottleneck_payload(train_number, idx, forecasts, threshold=0.15)

    return {
        "train_number": train_number,
        "current_block": current_node["id"],
        "telemetry": {"lat": lat, "lon": lon, "speed_kmh": speed, "signal": signal},
        "forecasts": forecasts,
        "copilot_alert": bottleneck_alert
    }

def format_bottleneck_payload(source_train: str, current_node_idx: int, forecasts: List[Dict[str, Any]], threshold: float = 0.15) -> Dict[str, Any]:
    for fc in forecasts:
        if fc["cascade_risk"] >= threshold:
            target_stn = fc["station"]
            target_stn_idx = NODE_CODE_TO_IDX[target_stn]

            affected_trains = [
                t_num for t_num, t_data in ACTIVE_TRAIN_POSITIONS.items()
                if t_num != source_train and t_data["block_idx"] <= target_stn_idx
            ]

            return {
                "bottleneck_station": target_stn,
                "delayed_train": source_train,
                "predicted_delay_min": round(fc["predicted_delay_min"], 1),
                "downstream_cascade_risk": round(fc["cascade_risk"], 2),
                "affected_trains": affected_trains
            }

    return None
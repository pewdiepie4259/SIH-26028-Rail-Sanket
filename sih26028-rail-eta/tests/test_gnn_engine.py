# Save as tests/test_gnn_engine.py
import pytest
import torch
from app.graph_engine import predict_cascade, CORRIDOR_NODES, MODEL, EDGE_INDEX

def test_corridor_nodes_loaded():
    assert len(CORRIDOR_NODES) >= 6, "Bengaluru corridor must have at least 6 stations."
    station_ids = [n["id"] for n in CORRIDOR_NODES]
    assert "SBC" in station_ids
    assert "BWT" in station_ids

def test_model_forward_pass_dimensions():
    # Model expects 5 features: [occupied, norm_speed, signal_weight, weather_pen, priority]
    num_nodes = len(CORRIDOR_NODES)
    dummy_x = torch.zeros((num_nodes, 5), dtype=torch.float)
    dummy_h = torch.zeros((num_nodes, 32), dtype=torch.float)
    
    delays, risks, next_h = MODEL(dummy_x, EDGE_INDEX, dummy_h)
    
    assert delays.shape == (num_nodes, 1), "Delay head output dimension mismatch"
    assert risks.shape == (num_nodes, 1), "Risk head output dimension mismatch"
    assert next_h.shape == (num_nodes, 32), "GRU hidden state dimension mismatch"
    assert torch.all(risks >= 0.0) and torch.all(risks <= 1.0), "Risk values must be bounded [0, 1]"

def test_stgnn_end_to_end_cascade_trigger():
    # Simulate a slowed down commuter at Malur (MLO)
    res = predict_cascade(
        train_number="06527",
        lat=13.0034,
        lon=77.9380,
        speed=20.0,
        signal="YELLOW"
    )
    assert res["current_block"] == "MLO"
    assert len(res["forecasts"]) > 0
    # Downstream station must be Bangarapet (BWT)
    assert res["forecasts"][0]["station"] == "BWT"
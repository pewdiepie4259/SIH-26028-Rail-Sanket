import os
import random
import torch
import torch.nn as nn
from app.graph_engine import STGATDelayModel, EDGE_INDEX, NUM_NODES

MODEL_SAVE_PATH = "data/corridor/stgat_weights_bengaluru.pt"

def generate_synthetic_training_data(samples=1000):
    X_list, y_delay_list, y_risk_list = [], [], []

    signal_choices = [1.0, 0.6, 0.3, 0.0]     # GREEN, DOUBLE_YELLOW, YELLOW, RED
    weather_choices = [0.1, 0.8]              # Clear vs Weather disruption

    for _ in range(samples):
        active_idx = random.randint(0, NUM_NODES - 1)
        speed = random.uniform(20.0, 110.0)
        signal_val = random.choice(signal_choices)
        weather_penalty = random.choice(weather_choices)

        x = torch.zeros((NUM_NODES, 4), dtype=torch.float)
        x[active_idx] = torch.tensor([1.0, speed / 130.0, signal_val, weather_penalty])

        # Ground truth physics-informed delay propagation
        target_delay = torch.zeros((NUM_NODES, 1), dtype=torch.float)
        target_risk = torch.zeros((NUM_NODES, 1), dtype=torch.float)

        base_penalty = (1.0 - signal_val) * 15.0 + (weather_penalty * 10.0) + max(0.0, (50.0 - speed) * 0.25)
        for i in range(active_idx + 1, NUM_NODES):
            decay = 0.85 ** (i - active_idx)
            target_delay[i] = base_penalty * decay
            target_risk[i] = min(1.0, (base_penalty / 25.0) * decay)

        X_list.append(x)
        y_delay_list.append(target_delay)
        y_risk_list.append(target_risk)

    return X_list, y_delay_list, y_risk_list

def train_model():
    print(f"Generating training dataset for Bengaluru corridor ({NUM_NODES} stations)...")
    X_data, y_delays, y_risks = generate_synthetic_training_data(samples=1200)

    model = STGATDelayModel(in_features=4, hidden_dim=32)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.005)
    mse_loss = nn.MSELoss()
    bce_loss = nn.BCELoss()

    print("Training Spatio-Temporal GNN delay weights...")
    model.train()
    epochs = 20

    for epoch in range(epochs):
        total_loss = 0.0
        h = torch.zeros((NUM_NODES, 32))

        for x, y_d, y_r in zip(X_data, y_delays, y_risks):
            optimizer.zero_grad()
            pred_d, pred_r, h = model(x, EDGE_INDEX, h.detach())
            loss = mse_loss(pred_d, y_d) + bce_loss(pred_r, y_r)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        if (epoch + 1) % 5 == 0:
            print(f"Epoch [{epoch+1}/{epochs}] - Loss: {total_loss / len(X_data):.4f}")

    os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
    torch.save(model.state_dict(), MODEL_SAVE_PATH)
    print(f"\nModel weights saved to {MODEL_SAVE_PATH}")

if __name__ == "__main__":
    train_model()
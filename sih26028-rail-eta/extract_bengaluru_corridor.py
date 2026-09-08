import json
import os

# Primary stations along the KSR Bengaluru - Krishnarajapuram - Bangarapet corridor
BENGALURU_STATIONS = [
    {"id": "SBC",  "name": "KSR Bengaluru City",     "lat": 12.9784, "lon": 77.5696, "visibility_m": 8000},
    {"id": "BNC",  "name": "Bengaluru Cantt",         "lat": 12.9934, "lon": 77.5983, "visibility_m": 8000},
    {"id": "BNCE", "name": "Bengaluru East",          "lat": 12.9981, "lon": 77.6163, "visibility_m": 8000},
    {"id": "BYPL", "name": "Baiyyappanahalli",        "lat": 12.9912, "lon": 77.6528, "visibility_m": 8000},
    {"id": "KJM",  "name": "Krishnarajapuram",        "lat": 13.0012, "lon": 77.6780, "visibility_m": 8000},
    {"id": "WFD",  "name": "Whitefield",              "lat": 12.9942, "lon": 77.7583, "visibility_m": 8000},
    {"id": "MLO",  "name": "Malur",                   "lat": 13.0039, "lon": 77.9392, "visibility_m": 8000},
    {"id": "BWT",  "name": "Bangarapet Junction",     "lat": 12.9988, "lon": 78.1969, "visibility_m": 8000}
]

# Physical track hops with real approximate distances and sectional line speeds
LINKS = [
    {"source": "SBC",  "target": "BNC",  "distance_km": 4.5,  "max_speed_kmh": 60.0},
    {"source": "BNC",  "target": "BNCE", "distance_km": 2.7,  "max_speed_kmh": 60.0},
    {"source": "BNCE", "target": "BYPL", "distance_km": 4.2,  "max_speed_kmh": 80.0},
    {"source": "BYPL", "target": "KJM",  "distance_km": 3.8,  "max_speed_kmh": 80.0},
    {"source": "KJM",  "target": "WFD",  "distance_km": 9.0,  "max_speed_kmh": 100.0},
    {"source": "WFD",  "target": "MLO",  "distance_km": 20.0, "max_speed_kmh": 110.0},
    {"source": "MLO",  "target": "BWT",  "distance_km": 26.8, "max_speed_kmh": 110.0}
]

os.makedirs("data/corridor", exist_ok=True)
output_path = "data/corridor/bengaluru_topology.json"

with open(output_path, "w") as f:
    json.dump({"nodes": BENGALURU_STATIONS, "links": LINKS}, f, indent=2)

print(f"Bengaluru rail topology successfully created at: {output_path}")
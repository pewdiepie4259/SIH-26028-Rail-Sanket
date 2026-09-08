import json
import os
import requests
import networkx as nx
import osmnx as ox

# Corridor checkpoints: New Delhi to Kanpur Central
TARGET_STATIONS = [
    {"code": "NDLS", "name": "New Delhi", "lat": 28.6424, "lon": 77.2195},
    {"code": "GZB",  "name": "Ghaziabad Jn", "lat": 28.6678, "lon": 77.4339},
    {"code": "ALJN", "name": "Aligarh Jn", "lat": 27.8974, "lon": 78.0880},
    {"code": "TDL",  "name": "Tundla Jn", "lat": 27.2046, "lon": 78.2410},
    {"code": "ETW",  "name": "Etawah Jn", "lat": 26.7855, "lon": 79.0270},
    {"code": "CNB",  "name": "Kanpur Central", "lat": 26.4547, "lon": 80.3507}
]

def fetch_weather_for_node(lat: float, lon: float):
    """Fetches real-time visibility, rain, and wind metrics from Open-Meteo."""
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=visibility,rain,wind_speed_10m"
    try:
        res = requests.get(url, timeout=5).json()
        current = res.get("current", {})
        return {
            "visibility_m": current.get("visibility", 10000.0),
            "rain_mm": current.get("rain", 0.0),
            "wind_speed_kmh": current.get("wind_speed_10m", 0.0)
        }
    except Exception:
        return {"visibility_m": 10000.0, "rain_mm": 0.0, "wind_speed_kmh": 0.0}

def build_corridor_graph():
    print("Building corridor graph with live weather telemetry...")
    corridor_graph = nx.DiGraph()
    previous_node = None

    for stn in TARGET_STATIONS:
        weather = fetch_weather_for_node(stn["lat"], stn["lon"])
        corridor_graph.add_node(
            stn["code"],
            name=stn["name"],
            lat=stn["lat"],
            lon=stn["lon"],
            visibility_m=weather["visibility_m"],
            rain_mm=weather["rain_mm"],
            wind_speed_kmh=weather["wind_speed_kmh"]
        )

        if previous_node:
            dist_km = round(ox.distance.great_circle(
                previous_node["lat"], previous_node["lon"], stn["lat"], stn["lon"]
            ) / 1000.0, 2)

            corridor_graph.add_edge(
                previous_node["code"],
                stn["code"],
                distance_km=dist_km,
                max_speed_kmh=130.0
            )
            print(f" Linked: {previous_node['code']} -> {stn['code']} ({dist_km} km)")

        previous_node = stn

    os.makedirs("data/corridor", exist_ok=True)
    output_path = "data/corridor/ndls_cnb_topology.json"
    data = nx.node_link_data(corridor_graph)
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)

    print(f"\n Topology graph successfully saved to: {output_path}")

if __name__ == "__main__":
    build_corridor_graph()
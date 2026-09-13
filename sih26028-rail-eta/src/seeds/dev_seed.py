import sys
import os
from datetime import time

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from sqlalchemy.orm import sessionmaker
from src.database import engine
from src.models import (
    Station, Train, TrainRoute, RouteSection, ScheduledStop,
    ModelVersion, ModelType
)

# Robust session resolution
try:
    from src.database import SessionLocal
except ImportError:
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def run_seed():
    db = SessionLocal()
    print("Seeding full dashboard rail network...")

    try:
        # 1. All Required Corridor Stations
        stations_data = [
            {"code": "SBC", "name": "KSR Bengaluru City", "platforms": 10, "lat": 12.9781, "lon": 77.5694, "junction": True, "terminal": True},
            {"code": "BNC", "name": "Bengaluru Cantonment", "platforms": 3, "lat": 12.9934, "lon": 77.5983, "junction": False, "terminal": False},
            {"code": "BNCE", "name": "Bengaluru East", "platforms": 2, "lat": 12.9978, "lon": 77.6200, "junction": False, "terminal": False},
            {"code": "BYPL", "name": "Baiyyappanahalli", "platforms": 2, "lat": 12.9926, "lon": 77.6525, "junction": True, "terminal": False},
            {"code": "KJM", "name": "Krishnarajapuram", "platforms": 4, "lat": 13.0012, "lon": 77.6750, "junction": True, "terminal": False},
            {"code": "WFD", "name": "Whitefield", "platforms": 4, "lat": 12.9958, "lon": 77.7609, "junction": False, "terminal": False},
            {"code": "KGI", "name": "Kengeri", "platforms": 4, "lat": 12.9090, "lon": 77.4840, "junction": False, "terminal": False},
            {"code": "MYA", "name": "Mandya", "platforms": 3, "lat": 12.5234, "lon": 76.8986, "junction": False, "terminal": False},
            {"code": "MYS", "name": "Mysuru Junction", "platforms": 6, "lat": 12.3160, "lon": 76.6450, "junction": True, "terminal": True},
            {"code": "YPR", "name": "Yesvantpur Junction", "platforms": 6, "lat": 13.0238, "lon": 77.5503, "junction": True, "terminal": True},
            {"code": "SMVB", "name": "Sir M. Visvesvaraya Terminal", "platforms": 7, "lat": 12.9972, "lon": 77.6567, "junction": False, "terminal": True},
            {"code": "MAS", "name": "Chennai Central", "platforms": 12, "lat": 13.0827, "lon": 80.2707, "junction": True, "terminal": True}
        ]

        station_map = {}
        for s in stations_data:
            st = db.query(Station).filter_by(station_code=s["code"]).first()
            if not st:
                st = Station(
                    station_code=s["code"],
                    station_name=s["name"],
                    division="SBC",
                    zone="SWR",
                    latitude=s["lat"],
                    longitude=s["lon"],
                    total_platforms=s["platforms"],
                    is_junction=s["junction"],
                    is_terminal=s["terminal"]
                )
                db.add(st)
                db.flush()
            station_map[s["code"]] = st

        # 2. All Monitored Trains Matching Official trains.db Database
        trains_data = [
            {"num": "12245", "name": "Howrah - SMVT Bengaluru Duronto Express", "type": "DURONTO_PREMIUM", "prio": 1, "orig": "HWH", "dest": "SMVB"},
            {"num": "12246", "name": "SMVT Bengaluru - Howrah Duronto Express", "type": "DURONTO_PREMIUM", "prio": 1, "orig": "SMVB", "dest": "HWH"},
            {"num": "20608", "name": "Mysore - MGR Chennai Central Vande Bharat Express", "type": "VANDE_BHARAT", "prio": 1, "orig": "MYS", "dest": "MAS"},
            {"num": "12301", "name": "Howrah-New Delhi Rajdhani Express", "type": "RAJDHANI_PREMIUM", "prio": 1, "orig": "HWH", "dest": "NDLS"},
            {"num": "12627", "name": "Karnataka Express", "type": "SUPERFAST", "prio": 2, "orig": "SBC", "dest": "NDLS"},
            {"num": "12639", "name": "Brindavan Express", "type": "SUPERFAST", "prio": 2, "orig": "MAS", "dest": "SBC"},
            {"num": "12613", "name": "Tippu Express", "type": "SUPERFAST", "prio": 2, "orig": "MYS", "dest": "SBC"},
            {"num": "12610", "name": "Mysuru - Chennai Central Superfast Express", "type": "SUPERFAST", "prio": 2, "orig": "SBC", "dest": "MAS"},
            {"num": "12608", "name": "Lalbagh Express", "type": "SUPERFAST", "prio": 2, "orig": "SBC", "dest": "MAS"},
            {"num": "06527", "name": "Bangarapet MEMU Commuter", "type": "COMMUTER", "prio": 4, "orig": "SBC", "dest": "BWT"},
            {"num": "10111", "name": "Konkan Kanya Express", "type": "EXPRESS", "prio": 3, "orig": "CSTM", "dest": "MAO"},
            {"num": "04601", "name": "Jammu Tawi Udhampur Special", "type": "DEMU", "prio": 4, "orig": "JAT", "dest": "UHP"},
            {"num": "16591", "name": "Hampi Express", "type": "EXPRESS", "prio": 3, "orig": "UBL", "dest": "SBC"},
            {"num": "20661", "name": "SBC-DWR Vande Bharat Express", "type": "VANDE_BHARAT", "prio": 1, "orig": "SBC", "dest": "DWR"},
        ]

        train_map = {}
        for t in trains_data:
            tr = db.query(Train).filter_by(train_number=t["num"]).first()
            if not tr:
                tr = Train(
                    train_number=t["num"],
                    train_name=t["name"],
                    train_type=t["type"],
                    priority_level=t["prio"],
                    origin_station_code=t["orig"],
                    destination_station_code=t["dest"]
                )
                db.add(tr)
                db.flush()
            train_map[t["num"]] = tr

        # 3. Track Segments
        corridor_edges = [
            ("SBC", "BNC", 4.3, 80.0, 7.0),
            ("BNC", "BNCE", 2.2, 70.0, 3.0),
            ("BNCE", "BYPL", 3.0, 75.0, 5.0),
            ("BYPL", "KJM", 3.8, 85.0, 6.0),
            ("KJM", "WFD", 9.1, 90.0, 10.0),
            ("WFD", "MAS", 340.0, 110.0, 300.0),
            ("SBC", "KGI", 12.4, 85.0, 14.0),
            ("KGI", "MYA", 80.5, 95.0, 60.0),
            ("MYA", "MYS", 45.2, 90.0, 35.0),
            ("SBC", "YPR", 5.6, 60.0, 11.0),
            ("YPR", "SBC", 5.6, 60.0, 11.0),
            ("MYA", "SBC", 92.9, 90.0, 74.0),
        ]

        # 4. Configure Routes & Stops
        train_stop_configs = {
            "12627": [
                ("SBC", time(19, 20), None, 0),
                ("KGI", time(19, 40), time(19, 42), 2),
                ("BNC", time(20, 10), time(20, 12), 2),
            ],
            "12613": [
                ("SBC", time(6, 15), None, 0),
                ("KGI", time(6, 32), time(6, 34), 2),
                ("MYA", time(7, 40), time(7, 42), 2),
                ("MYS", time(8, 45), None, 0),
            ],
            "12639": [
                ("SBC", time(7, 0), None, 0),
                ("BNC", time(7, 10), time(7, 12), 2),
                ("KJM", time(7, 28), time(7, 30), 2),
                ("MAS", time(13, 40), None, 0),
            ],
            "12610": [
                ("MYS", time(22, 15), None, 0),
                ("MYA", time(23, 0), time(23, 2), 2),
                ("SBC", time(0, 30), time(0, 45), 15),
                ("BNC", time(0, 55), time(0, 57), 2),
                ("MAS", time(5, 30), None, 0),
            ],
            "12608": [
                ("SBC", time(6, 20), None, 0),
                ("BNC", time(6, 30), time(6, 32), 2),
                ("BNCE", time(6, 38), time(6, 39), 1),
                ("KJM", time(6, 49), time(6, 50), 1),
                ("MAS", time(12, 35), None, 0),
            ],
            "16591": [
                ("YPR", time(5, 45), time(5, 50), 5),
                ("SBC", time(6, 0), time(6, 10), 10),
                ("KGI", time(6, 28), time(6, 30), 2),
                ("MYA", time(7, 45), time(7, 47), 2),
                ("MYS", time(8, 50), None, 0),
            ],
            "20661": [
                ("SBC", time(5, 45), None, 0),
                ("BNC", time(5, 53), time(5, 55), 2),
                ("BYPL", time(6, 2), time(6, 3), 1),
                ("KJM", time(6, 11), time(6, 12), 1),
            ]
        }

        for t_num, tr in train_map.items():
            route = db.query(TrainRoute).filter_by(train_id=tr.id).first()
            if not route:
                route = TrainRoute(train_id=tr.id, route_code=f"{t_num}-MAIN", direction="UP", is_active=True)
                db.add(route)
                db.flush()

                # Add Sections
                seq = 1
                for src, dst, dist, spd, nom in corridor_edges:
                    s_id = station_map[src].id
                    d_id = station_map[dst].id
                    if not db.query(RouteSection).filter_by(route_id=route.id, from_station_id=s_id, to_station_id=d_id).first():
                        db.add(RouteSection(
                            route_id=route.id,
                            from_station_id=s_id,
                            to_station_id=d_id,
                            section_sequence=seq,
                            distance_km=dist,
                            max_sectional_speed_kmh=spd,
                            nominal_traversal_minutes=nom
                        ))
                        seq += 1

                # Add Stops
                stops_list = train_stop_configs.get(t_num, [])
                for stop_seq, (st_code, arr, dep, dwell) in enumerate(stops_list, start=1):
                    s_id = station_map[st_code].id
                    if not db.query(ScheduledStop).filter_by(route_id=route.id, station_id=s_id).first():
                        db.add(ScheduledStop(
                            route_id=route.id,
                            station_id=s_id,
                            stop_sequence=stop_seq,
                            scheduled_arrival_time=arr,
                            scheduled_departure_time=dep,
                            scheduled_dwell_minutes=dwell
                        ))

        # 5. Default Model Version
        mv = db.query(ModelVersion).filter_by(version_tag="v1.0.0-lgbm").first()
        if not mv:
            db.add(ModelVersion(
                model_name="LightGBMSectionalETA",
                model_type=ModelType.LIGHTGBM_REGRESSOR,
                version_tag="v1.0.0-lgbm",
                metrics={"mae": 0.42, "rmse": 0.58},
                is_active=True
            ))

        db.commit()
        print("[SUCCESS] All 7 dashboard trains, 12 stations, and corridor segments are seeded!")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding failed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
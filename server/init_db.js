// Railway-ETA/init_db.js
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./trains.db');

db.serialize(() => {
    console.log("Creating database tables...");

    // 1. Stations Table
    db.run(`CREATE TABLE IF NOT EXISTS stations (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    state TEXT,
    zone TEXT,
    latitude REAL,
    longitude REAL
  )`);

    // 2. Trains Master Table
    db.run(`CREATE TABLE IF NOT EXISTS trains (
    train_number TEXT PRIMARY KEY,
    train_name TEXT NOT NULL,
    train_type TEXT,
    source_station_code TEXT,
    dest_station_code TEXT,
    total_distance_km REAL
  )`);

    // 3. Train Stop Schedules (Route)
    db.run(`CREATE TABLE IF NOT EXISTS train_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_number TEXT,
    station_code TEXT,
    stop_sequence INTEGER NOT NULL,
    scheduled_arrival TEXT,
    scheduled_departure TEXT,
    day_count INTEGER DEFAULT 1,
    distance_from_source_km REAL,
    halt_minutes INTEGER DEFAULT 0,
    UNIQUE(train_number, stop_sequence)
  )`);

    // 4. Live Running Status Snapshot
    db.run(`CREATE TABLE IF NOT EXISTS live_train_status (
    train_number TEXT PRIMARY KEY,
    journey_date TEXT,
    current_station_code TEXT,
    last_reported_station TEXT,
    delay_minutes INTEGER DEFAULT 0,
    status TEXT,
    current_lat REAL,
    current_lng REAL,
    next_station_code TEXT,
    eta_next_station TEXT,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

    // 5. Delay History (For ML ETA prediction model)
    db.run(`CREATE TABLE IF NOT EXISTS train_delay_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_number TEXT,
    journey_date TEXT,
    station_code TEXT,
    delay_arrival_minutes INTEGER,
    delay_departure_minutes INTEGER,
    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

    console.log("Database initialized: trains.db successfully created!");
});

db.close();
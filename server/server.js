// server/server.js
import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { DB_PATH, initializeDatabase } from './init_db.js';

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) console.error("Database connection error:", err.message);
    else {
        console.log(`Connected to trains.db SQLite database at: ${DB_PATH}`);
        initializeDatabase(db);
    }
});

app.get('/health', (req, res) => {
    res.json({ status: "healthy", service: "RailDrishti Trains & Schedules SQLite API" });
});

// ==========================================
// 1. SEARCH TRAINS (By Name or Number)
// ==========================================
// 1. SEARCH TRAINS (By Name, Number, or Station)
// ==========================================
app.get('/api/trains/search', (req, res) => {
    const query = (req.query.q || '').trim();
    const limit = parseInt(req.query.limit) || 100;

    if (!query) {
        // Return active corridor rakes first, followed by general database trains
        const sql = `
        SELECT 
          t.train_number, 
          t.train_name, 
          t.train_type, 
          t.source_station_code, 
          t.dest_station_code, 
          t.total_distance_km,
          COALESCE(s1.name, t.source_station_code) as source_station_name,
          COALESCE(s2.name, t.dest_station_code) as dest_station_name
        FROM trains t
        LEFT JOIN stations s1 ON t.source_station_code = s1.code
        LEFT JOIN stations s2 ON t.dest_station_code = s2.code
        ORDER BY 
          CASE 
            WHEN t.train_number IN ('12246', '12245', '20608', '12301', '12627', '20661', '12639', '12613', '12610', '12608', '06527', '10111', '04601', '16591') THEN 0
            WHEN t.train_number LIKE '20%' OR t.train_number LIKE '123%' OR t.train_number LIKE '122%' THEN 1
            WHEN t.train_number LIKE '12%' THEN 2
            ELSE 3
          END,
          t.train_number ASC
        LIMIT ?
      `;
        return db.all(sql, [limit], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ trains: rows || [] });
        });
    }

    const searchPattern = `%${query}%`;
    const exactStart = `${query}%`;
    const sql = `
    SELECT DISTINCT
      t.train_number, 
      t.train_name, 
      t.train_type, 
      t.source_station_code, 
      t.dest_station_code, 
      t.total_distance_km,
      COALESCE(s1.name, t.source_station_code) as source_station_name,
      COALESCE(s2.name, t.dest_station_code) as dest_station_name
    FROM trains t
    LEFT JOIN stations s1 ON t.source_station_code = s1.code
    LEFT JOIN stations s2 ON t.dest_station_code = s2.code
    WHERE t.train_number LIKE ? 
       OR t.train_name LIKE ? 
       OR t.source_station_code LIKE ? 
       OR t.dest_station_code LIKE ? 
       OR s1.name LIKE ? 
       OR s2.name LIKE ?
       OR t.train_number IN (SELECT train_number FROM train_schedules WHERE station_code = ? OR station_code LIKE ?)
    ORDER BY 
      CASE 
        WHEN t.source_station_code = ? OR t.dest_station_code = ? THEN 1
        WHEN t.train_number LIKE ? THEN 2
        WHEN t.train_number LIKE ? THEN 3
        WHEN t.train_name LIKE ? THEN 4
        ELSE 5
      END,
      t.train_number ASC
    LIMIT ?
  `;
    db.all(sql, [
      searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern,
      query, searchPattern,
      query, query, exactStart, searchPattern, searchPattern,
      limit
    ], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ trains: rows || [] });
    });
});

// ==========================================
// 2. TRAIN ROUTE & COORDINATES (For Leaflet Map)
// ==========================================
app.get('/api/trains/:trainNo/route', (req, res) => {
    const trainNo = req.params.trainNo.trim();

    // Query station stops from train_schedules joined with stations
    const scheduleSql = `
    SELECT 
      ts.stop_sequence, 
      ts.station_code, 
      ts.scheduled_arrival, 
      ts.scheduled_departure, 
      ts.day_count, 
      ts.halt_minutes,
      COALESCE(s.name, ts.station_code) as station_name, 
      s.latitude, 
      s.longitude 
    FROM train_schedules ts 
    LEFT JOIN stations s ON ts.station_code = s.code 
    WHERE ts.train_number = ? 
    ORDER BY ts.stop_sequence ASC
  `;

    db.all(scheduleSql, [trainNo], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        // Agar schedule table me stops mil gaye toh return karo
        if (rows && rows.length > 0) {
            return res.json({
                train_number: trainNo,
                total_stops: rows.length,
                route: rows
            });
        }

        // Fallback: Agar schedule table abhi empty hai, toh train ke source & dest stations return karo
        const fallbackSql = `
      SELECT 
        t.train_number, t.train_name,
        1 as stop_sequence,
        t.source_station_code as station_code,
        s1.name as station_name,
        s1.latitude, s1.longitude
      FROM trains t
      LEFT JOIN stations s1 ON t.source_station_code = s1.code
      WHERE t.train_number = ?
      UNION ALL
      SELECT 
        t.train_number, t.train_name,
        2 as stop_sequence,
        t.dest_station_code as station_code,
        s2.name as station_name,
        s2.latitude, s2.longitude
      FROM trains t
      LEFT JOIN stations s2 ON t.dest_station_code = s2.code
      WHERE t.train_number = ?
    `;

        db.all(fallbackSql, [trainNo, trainNo], (err2, fallbackRows) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({
                train_number: trainNo,
                total_stops: fallbackRows.length,
                route: fallbackRows || []
            });
        });
    });
});

// ==========================================
// 3. REAL-TIME LIVE RUNNING STATUS & ETA
// ==========================================
app.get('/api/trains/:trainNo/live', (req, res) => {
    const trainNo = req.params.trainNo.trim();

    // 1. Pehle database se check karo
    db.get(`SELECT * FROM live_train_status WHERE train_number = ?`, [trainNo], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) return res.json(row);

        // 2. Fallback / Live simulation generator (Demo ke liye taaki map pe real-time motion dikhe)
        const sql = `
      SELECT 
        t.train_number, t.train_name,
        t.source_station_code, t.dest_station_code,
        s.latitude, s.longitude, s.name as current_station_name
      FROM trains t
      LEFT JOIN stations s ON t.source_station_code = s.code
      WHERE t.train_number = ?
    `;

        db.get(sql, [trainNo], (err2, trainInfo) => {
            if (!trainInfo) {
                return res.status(404).json({ error: "Train not found" });
            }

            // Demo Live Status Payload
            res.json({
                train_number: trainNo,
                train_name: trainInfo.train_name,
                journey_date: new Date().toISOString().slice(0, 10),
                status: "RUNNING",
                delay_minutes: 12, // Example delay
                current_station_code: trainInfo.source_station_code,
                current_station_name: trainInfo.current_station_name,
                current_lat: trainInfo.latitude || 28.6139,
                current_lng: trainInfo.longitude || 77.2090,
                speed_kmh: 78,
                eta_next_station: new Date(Date.now() + 25 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                last_updated: new Date().toLocaleTimeString()
            });
        });
    });
});

// ==========================================
// 4. SEARCH STATIONS (By Name or Code)
// ==========================================
app.get('/api/stations/search', (req, res) => {
    const query = (req.query.q || '').trim();
    const limit = parseInt(req.query.limit) || 100;

    const searchPattern = `%${query}%`;
    const exactStart = `${query}%`;
    const sql = `
    SELECT 
      s.code, 
      s.name, 
      s.state, 
      s.zone, 
      s.latitude, 
      s.longitude,
      COALESCE(sc.train_count, 0) AS train_count
    FROM stations s
    LEFT JOIN station_counts sc ON s.code = sc.code
    WHERE (s.code NOT LIKE 'XX%' AND s.code NOT LIKE 'YY%')
      AND (s.code LIKE ? OR s.name LIKE ? OR (s.state IS NOT NULL AND s.state LIKE ?) OR (s.zone IS NOT NULL AND s.zone LIKE ?))
    ORDER BY 
      CASE 
        WHEN s.code IN ('SBC', 'HWH', 'SMVB', 'NDLS', 'MAS', 'MYS', 'JAT', 'YPR', 'BDTS', 'BKN', 'CBE', 'CSTM', 'UHP', 'BNC', 'KJM', 'BYPL', 'WFD', 'BWT') THEN 0
        WHEN s.code LIKE ? THEN 1
        WHEN s.name LIKE ? THEN 2
        ELSE 3
      END,
      sc.train_count DESC,
      s.code ASC
    LIMIT ?
  `;
    db.all(sql, [searchPattern, searchPattern, searchPattern, searchPattern, exactStart, searchPattern, limit], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ stations: rows || [] });
    });
});

// ==========================================
// 5. ALL STATIONS LIST (For Dropdowns & Map)
// ==========================================
app.get('/api/stations/all', (req, res) => {
    db.all(
        `SELECT code, name, state, zone, latitude, longitude FROM stations WHERE latitude IS NOT NULL LIMIT 5000`,
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ stations: rows || [] });
        }
    );
});

// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend API successfully running on http://localhost:${PORT}`);
});
// server/init_db.js
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const DB_PATH = path.resolve(__dirname, '../trains.db');

export function initializeDatabase(db, callback) {
    db.serialize(() => {
        console.log("Creating database tables in trains.db...");

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

        // Check if data already exists
        db.get("SELECT COUNT(*) as count FROM trains", (err, row) => {
            if (err || !row || row.count === 0) {
                console.log("Seeding core national trains, stations and schedules...");
                seedCoreData(db, callback);
            } else {
                console.log(`Database already populated with ${row.count} trains.`);
                if (callback) callback();
            }
        });
    });
}

function seedCoreData(db, callback) {
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        // Seed Stations
        const stations = [
            // Konkan Corridor
            ['CSMT', 'Mumbai Chhatrapati Shivaji Maharaj Terminus', 'Maharashtra', 'CR', 18.9400, 72.8355],
            ['DR', 'Dadar Central', 'Maharashtra', 'CR', 19.0180, 72.8430],
            ['TNA', 'Thane', 'Maharashtra', 'CR', 19.1860, 72.9760],
            ['PNVL', 'Panvel', 'Maharashtra', 'CR', 18.9894, 73.1175],
            ['ROHA', 'Roha', 'Maharashtra', 'CR', 18.4410, 73.1180],
            ['MNI', 'Mangaon', 'Maharashtra', 'KR', 18.2500, 73.2800],
            ['VEER', 'Veer', 'Maharashtra', 'KR', 18.1500, 73.3400],
            ['KHED', 'Khed', 'Maharashtra', 'KR', 17.7170, 73.3930],
            ['CHI', 'Chiplun', 'Maharashtra', 'KR', 17.5320, 73.5180],
            ['SGR', 'Sangameshwar Road', 'Maharashtra', 'KR', 17.1940, 73.5510],
            ['RN', 'Ratnagiri', 'Maharashtra', 'KR', 16.9800, 73.3300],
            ['VID', 'Vilavade', 'Maharashtra', 'KR', 16.7200, 73.5300],
            ['RAJP', 'Rajapur Road', 'Maharashtra', 'KR', 16.6500, 73.5200],
            ['VBW', 'Vaibhavwadi Road', 'Maharashtra', 'KR', 16.5100, 73.6800],
            ['KKW', 'Kankavali', 'Maharashtra', 'KR', 16.2700, 73.7100],
            ['SNDD', 'Sindhudurg', 'Maharashtra', 'KR', 16.1200, 73.6900],
            ['KUDL', 'Kudal', 'Maharashtra', 'KR', 15.9900, 73.6800],
            ['SWV', 'Sawantwadi Road', 'Maharashtra', 'KR', 15.8900, 73.7800],
            ['PERN', 'Pernem', 'Goa', 'KR', 15.7200, 73.8000],
            ['THVM', 'Thivim', 'Goa', 'KR', 15.6200, 73.8700],
            ['KRMI', 'Karmali', 'Goa', 'KR', 15.4900, 73.9200],
            ['MAO', 'Madgaon Junction', 'Goa', 'KR', 15.2740, 73.9800],

            // Northern Jammu Corridor
            ['JAT', 'Jammu Tawi', 'Jammu and Kashmir', 'NR', 32.7058, 74.8778],
            ['BLA', 'Bajalta', 'Jammu and Kashmir', 'NR', 32.7485, 74.9620],
            ['SGRR', 'Sangar', 'Jammu and Kashmir', 'NR', 32.8120, 75.0350],
            ['MNWL', 'Manwal', 'Jammu and Kashmir', 'NR', 32.8680, 75.0780],
            ['RMJK', 'Ram Nagar Jk', 'Jammu and Kashmir', 'NR', 32.8980, 75.1120],
            ['UHP', 'Udhampur', 'Jammu and Kashmir', 'NR', 32.9268, 75.1416],
            ['SVDK', 'Shri Mata Vaishno Devi Katra', 'Jammu and Kashmir', 'NR', 32.9900, 74.9300],

            // South - Bengaluru / Chennai Corridors
            ['SBC', 'KSR Bengaluru City Junction', 'Karnataka', 'SWR', 12.9781, 77.5695],
            ['BNC', 'Bengaluru Cantt', 'Karnataka', 'SWR', 12.9934, 77.5980],
            ['KJM', 'Krishnarajapuram', 'Karnataka', 'SWR', 12.9912, 77.6525],
            ['WFD', 'Whitefield', 'Karnataka', 'SWR', 13.0012, 77.6880],
            ['MLO', 'Malur', 'Karnataka', 'SWR', 12.9934, 77.7500],
            ['BWT', 'Bangarapet Junction', 'Karnataka', 'SWR', 12.9860, 78.1970],
            ['KPN', 'Kuppam', 'Andhra Pradesh', 'SWR', 12.7500, 78.3600],
            ['JTJ', 'Jolarpettai Junction', 'Tamil Nadu', 'SR', 12.5694, 78.5833],
            ['KPD', 'Katpadi Junction', 'Tamil Nadu', 'SR', 12.9698, 79.1384],
            ['AJJ', 'Arakkonam Junction', 'Tamil Nadu', 'SR', 13.0800, 79.6700],
            ['PER', 'Perambur', 'Tamil Nadu', 'SR', 13.1100, 80.2300],
            ['MAS', 'MGR Chennai Central', 'Tamil Nadu', 'SR', 13.0827, 80.2755],
            ['SMVB', 'Sir M. Visvesvaraya Terminal Bengaluru', 'Karnataka', 'SWR', 13.0117, 77.6534],
            ['YPR', 'Yesvantpur Junction', 'Karnataka', 'SWR', 13.0238, 77.5516],
            ['MYS', 'Mysuru Junction', 'Karnataka', 'SWR', 12.3100, 76.6500],

            // Trunk Northern / Eastern Corridors
            ['NDLS', 'New Delhi', 'Delhi', 'NR', 28.6140, 77.2090],
            ['CNB', 'Kanpur Central', 'Uttar Pradesh', 'NCR', 26.4547, 80.3507],
            ['PRYJ', 'Prayagraj Junction', 'Uttar Pradesh', 'NCR', 25.4484, 81.8286],
            ['DDU', 'Pt. Deen Dayal Upadhyaya Junction', 'Uttar Pradesh', 'ECR', 25.2818, 83.1234],
            ['HWH', 'Howrah Junction', 'West Bengal', 'ER', 22.5839, 88.3426],
            ['BPL', 'Bhopal Junction', 'Madhya Pradesh', 'WCR', 23.2600, 77.4100],
            ['ET', 'Itarsi Junction', 'Madhya Pradesh', 'WCR', 22.6100, 77.7600],
            ['BSL', 'Bhusaval Junction', 'Maharashtra', 'CR', 21.0500, 75.8000]
        ];

        const stationStmt = db.prepare(`
            INSERT OR REPLACE INTO stations (code, name, state, zone, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        stations.forEach(s => stationStmt.run(...s));
        stationStmt.finalize();

        // Seed Trains
        const trains = [
            ['10111', 'Konkan Kanya Express', 'Express', 'CSMT', 'MAO', 750],
            ['04601', 'Jammu Tawi - Udhampur Express Special', 'Special', 'JAT', 'UHP', 53],
            ['20608', 'Vande Bharat Express (SBC-MAS)', 'Superfast', 'SBC', 'MAS', 359],
            ['12627', 'Karnataka Express', 'Superfast', 'SBC', 'NDLS', 2400],
            ['12301', 'Howrah - New Delhi Rajdhani Express', 'Rajdhani', 'HWH', 'NDLS', 1450],
            ['06527', 'Bangarapet MEMU Commuter', 'Suburban', 'SBC', 'BWT', 70],
            ['12246', 'SMVT Bengaluru - Howrah Duronto Express', 'Duronto', 'SMVB', 'HWH', 1945]
        ];

        const trainStmt = db.prepare(`
            INSERT OR REPLACE INTO trains (train_number, train_name, train_type, source_station_code, dest_station_code, total_distance_km)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        trains.forEach(t => trainStmt.run(...t));
        trainStmt.finalize();

        // Seed Schedules for 10111 (Konkan Kanya)
        const schedules10111 = [
            ['10111', 'CSMT', 1, null, '23:05', 1, 0, 0],
            ['10111', 'DR', 2, '23:17', '23:20', 1, 9, 3],
            ['10111', 'TNA', 3, '23:42', '23:45', 1, 33, 3],
            ['10111', 'PNVL', 4, '00:25', '00:30', 2, 68, 5],
            ['10111', 'ROHA', 5, '02:00', '02:05', 2, 143, 5],
            ['10111', 'MNI', 6, '02:30', '02:32', 2, 174, 2],
            ['10111', 'VEER', 7, '02:50', '02:52', 2, 190, 2],
            ['10111', 'KHED', 8, '03:40', '03:42', 2, 241, 2],
            ['10111', 'CHI', 9, '04:12', '04:14', 2, 271, 2],
            ['10111', 'SGR', 10, '05:00', '05:02', 2, 314, 2],
            ['10111', 'RN', 11, '05:55', '06:00', 2, 346, 5],
            ['10111', 'VID', 12, '06:40', '06:42', 2, 393, 2],
            ['10111', 'RAJP', 13, '07:00', '07:02', 2, 410, 2],
            ['10111', 'VBW', 14, '07:20', '07:22', 2, 426, 2],
            ['10111', 'KKW', 15, '07:50', '07:52', 2, 457, 2],
            ['10111', 'SNDD', 16, '08:10', '08:12', 2, 475, 2],
            ['10111', 'KUDL', 17, '08:24', '08:26', 2, 486, 2],
            ['10111', 'SWV', 18, '08:50', '08:52', 2, 507, 2],
            ['10111', 'PERN', 19, '09:22', '09:24', 2, 525, 2],
            ['10111', 'THVM', 20, '09:36', '09:38', 2, 536, 2],
            ['10111', 'KRMI', 21, '10:00', '10:02', 2, 554, 2],
            ['10111', 'MAO', 22, '11:45', null, 2, 587, 0]
        ];

        // Seed Schedules for 04601 (Jammu - Udhampur)
        const schedules04601 = [
            ['04601', 'JAT', 1, null, '10:15', 1, 0, 0],
            ['04601', 'BLA', 2, '10:30', '10:32', 1, 11, 2],
            ['04601', 'SGRR', 3, '10:45', '10:47', 1, 21, 2],
            ['04601', 'MNWL', 4, '11:00', '11:02', 1, 31, 2],
            ['04601', 'RMJK', 5, '11:15', '11:17', 1, 41, 2],
            ['04601', 'UHP', 6, '11:40', null, 1, 53, 0]
        ];

        // Seed Schedules for 20608 (Vande Bharat SBC-MAS)
        const schedules20608 = [
            ['20608', 'SBC', 1, null, '05:45', 1, 0, 0],
            ['20608', 'BNC', 2, '05:53', '05:55', 1, 5, 2],
            ['20608', 'KJM', 3, '06:08', '06:10', 1, 15, 2],
            ['20608', 'WFD', 4, '06:20', '06:22', 1, 24, 2],
            ['20608', 'BWT', 5, '07:00', '07:02', 1, 70, 2],
            ['20608', 'JTJ', 6, '08:05', '08:07', 1, 145, 2],
            ['20608', 'KPD', 7, '09:12', '09:15', 1, 229, 3],
            ['20608', 'MAS', 8, '10:45', null, 1, 359, 0]
        ];

        const schedStmt = db.prepare(`
            INSERT OR REPLACE INTO train_schedules 
            (train_number, station_code, stop_sequence, scheduled_arrival, scheduled_departure, day_count, distance_from_source_km, halt_minutes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        [...schedules10111, ...schedules04601, ...schedules20608].forEach(row => schedStmt.run(...row));
        schedStmt.finalize();

        // Seed Live Status
        const liveStatusStmt = db.prepare(`
            INSERT OR REPLACE INTO live_train_status
            (train_number, journey_date, current_station_code, last_reported_station, delay_minutes, status, current_lat, current_lng, next_station_code, eta_next_station, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);

        liveStatusStmt.run('10111', new Date().toISOString().slice(0, 10), 'RN', 'Ratnagiri', 8, 'RUNNING', 16.9800, 73.3300, 'VID', '06:48');
        liveStatusStmt.run('04601', new Date().toISOString().slice(0, 10), 'BLA', 'Bajalta', 0, 'RUNNING', 32.7485, 74.9620, 'SGRR', '10:45');
        liveStatusStmt.run('20608', new Date().toISOString().slice(0, 10), 'KJM', 'Krishnarajapuram', 2, 'RUNNING', 12.9912, 77.6525, 'WFD', '06:22');
        liveStatusStmt.finalize();

        db.run("COMMIT", (err) => {
            if (err) console.error("Database commit error:", err.message);
            else console.log("Database initialized & successfully seeded with trains, stations and schedules!");
            if (callback) callback();
        });
    });
}

// Standalone execution: node server/init_db.js
if (process.argv[1] && process.argv[1].endsWith('init_db.js')) {
    const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) console.error("Failed to connect to SQLite DB:", err.message);
        else {
            initializeDatabase(db, () => {
                db.close();
            });
        }
    });
}
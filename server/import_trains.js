// server/import_trains.js
import sqlite3 from 'sqlite3';
import axios from 'axios';

const db = new sqlite3.Database('./trains.db');

async function importData() {
    try {
        // ==========================================
        // 1. IMPORT STATIONS (With Fixed Lat/Lng)
        // ==========================================
        console.log("Fetching stations dataset...");
        const stationsRes = await axios.get('https://raw.githubusercontent.com/datameet/railways/master/stations.json', { timeout: 30000 });
        const stations = stationsRes.data.features || [];

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            const stmt = db.prepare(`
        INSERT OR REPLACE INTO stations 
        (code, name, state, zone, latitude, longitude) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);

            let stationCount = 0;
            stations.forEach(st => {
                const p = st.properties || {};
                const coords = st.geometry ? st.geometry.coordinates : null;

                if (p.code && p.name && coords && coords.length >= 2) {
                    const lon = parseFloat(coords[0]); // Index 0 = Longitude
                    const lat = parseFloat(coords); // Index 1 = Latitude (FIXED:)

                    if (!isNaN(lat) && !isNaN(lon)) {
                        stmt.run(p.code.toUpperCase().trim(), p.name.trim(), p.state || null, p.zone || null, lat, lon);
                        stationCount++;
                    }
                }
            });
            stmt.finalize();

            db.run("COMMIT", (err) => {
                if (err) console.error("Stations commit error:", err);
                else console.log(`Successfully saved ${stationCount} stations with valid Lat/Lng numbers!`);
            });
        });

        // ==========================================
        // 2. IMPORT ALL-INDIA TRAINS MASTER
        // ==========================================
        console.log("Fetching trains dataset...");
        const trainsRes = await axios.get('https://raw.githubusercontent.com/datameet/railways/master/trains.json', { timeout: 30000 });
        const trains = trainsRes.data.features || [];

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            const stmt = db.prepare(`
        INSERT OR REPLACE INTO trains 
        (train_number, train_name, train_type, source_station_code, dest_station_code, total_distance_km) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);

            let trainCount = 0;
            trains.forEach(tr => {
                const p = tr.properties || {};
                if (p.number && p.name) {
                    stmt.run(
                        String(p.number).trim(),
                        p.name.trim(),
                        p.type || 'Express',
                        p.from_station_code ? p.from_station_code.toUpperCase().trim() : null,
                        p.to_station_code ? p.to_station_code.toUpperCase().trim() : null,
                        p.distance ? parseFloat(p.distance) : 0
                    );
                    trainCount++;
                }
            });
            stmt.finalize();

            db.run("COMMIT", (err) => {
                if (err) console.error("Trains commit error:", err);
                else console.log(`Successfully saved ${trainCount} trains!`);
                db.close();
            });
        });

    } catch (err) {
        console.error("Data import failed:", err.message);
    }
}

importData();
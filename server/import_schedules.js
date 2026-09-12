// server/import_schedules.js
import sqlite3 from 'sqlite3';
import axios from 'axios';

const db = new sqlite3.Database('./trains.db');

async function loadSchedules() {
    console.log("Downloading Indian Railways all-train schedules from GitHub dataset...");
    try {
        const res = await axios.get('https://raw.githubusercontent.com/datameet/railways/master/schedules.json', {
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 30000
        });

        const schedules = res.data;
        console.log(`Downloaded ${schedules.length} stops! Inserting into database...`);

        db.serialize(() => {
            // Fast bulk insert using SQLite transaction
            db.run("BEGIN TRANSACTION");

            const stmt = db.prepare(`
        INSERT OR IGNORE INTO train_schedules 
        (train_number, station_code, stop_sequence, scheduled_arrival, scheduled_departure, day_count, halt_minutes) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

            let count = 0;
            schedules.forEach((item, i) => {
                const trainNo = String(item.train_number || '').trim();
                const stnCode = String(item.station_code || '').trim().toUpperCase();
                const seq = item.id || (i + 1);
                const arr = item.arrival && item.arrival !== "None" ? item.arrival : null;
                const dep = item.departure && item.departure !== "None" ? item.departure : null;
                const day = parseInt(item.day || 1);
                const halt = parseInt(item.halt || 0);

                if (trainNo && stnCode) {
                    stmt.run(trainNo, stnCode, seq, arr, dep, day, halt);
                    count++;
                }
            });

            stmt.finalize();

            db.run("COMMIT", (err) => {
                if (err) {
                    console.error("Commit error:", err);
                } else {
                    console.log(`Successfully loaded ${count} stops for all trains in India!`);
                }
                db.close();
            });
        });

    } catch (err) {
        console.error("Download failed:", err.message);
    }
}

loadSchedules();
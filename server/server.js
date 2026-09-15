// server/server.js
import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { DB_PATH, initializeDatabase, hashPassword, verifyPassword, INITIAL_CREDENTIALS } from './init_db.js';

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
// AUTHENTICATION & CREDENTIALS API
// ==========================================

// Get pre-provisioned demo credentials for frontend ease-of-use
app.get('/api/auth/credentials', (req, res) => {
    res.json({
        success: true,
        credentials: INITIAL_CREDENTIALS.map(c => ({
            id: c.id,
            name: c.name,
            role: c.role,
            username: c.username,
            email: c.email,
            phone: c.phone,
            password: c.password,
            department: c.department,
            operationalRole: c.operational_role
        }))
    });
});

// User & Staff Login
app.post('/api/auth/login', (req, res) => {
    const { role, method = 'password', emailOrPhone, password, otp, employeeId, controllerId, adminId } = req.body;
    const identifier = (
        role === 'admin' ? (adminId || emailOrPhone) :
        role === 'controller' ? (controllerId || emailOrPhone) :
        role === 'employee' ? (employeeId || emailOrPhone) :
        emailOrPhone
    );

    if (!role) {
        return res.status(400).json({ success: false, message: "User role is required for authentication." });
    }

    if (!identifier) {
        return res.status(400).json({ success: false, message: "Please provide your login ID or registered email/phone." });
    }

    const cleanId = identifier.trim().toLowerCase();

    // Query user by username, email, or phone
    const sql = `
        SELECT * FROM users 
        WHERE (LOWER(username) = ? OR LOWER(email) = ? OR phone = ? OR LOWER(admin_id) = ? OR LOWER(controller_id) = ? OR LOWER(employee_id) = ?)
        LIMIT 1
    `;

    db.get(sql, [cleanId, cleanId, cleanId, cleanId, cleanId, cleanId], (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Database error during authentication: " + err.message });
        }

        // Handle OTP login for Passenger
        if (role === 'user' && method === 'otp') {
            if (!otp || (otp !== '123456' && otp.length < 6)) {
                return res.status(400).json({ success: false, message: "Invalid or expired OTP. Use demo code 123456." });
            }

            if (user) {
                const userPayload = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    status: user.status,
                    createdAt: user.created_at
                };
                return res.json({ success: true, user: userPayload, token: `token_otp_${Date.now()}` });
            }

            // Create new passenger user record on successful OTP if not existing
            const newId = `usr_pass_${Date.now()}`;
            const isPhone = /^[6-9]\d{9}$/.test(cleanId.replace(/\D/g, ''));
            const name = isPhone ? `Passenger (${cleanId.slice(-4)})` : cleanId.split('@')[0];
            const email = cleanId.includes('@') ? cleanId : `${cleanId}@passenger.raildrishti.gov.in`;
            const phone = isPhone ? cleanId : null;
            const { hash, salt } = hashPassword('User@RailDrishti2026');

            db.run(
                `INSERT INTO users (id, username, name, email, phone, password_hash, salt, role, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'user', 'active')`,
                [newId, cleanId, name, email, phone, hash, salt],
                function (insertErr) {
                    if (insertErr) {
                        return res.status(500).json({ success: false, message: "Failed to create user session." });
                    }
                    const newUser = { id: newId, name, email, phone, role: 'user', status: 'active', createdAt: new Date().toISOString() };
                    return res.json({ success: true, user: newUser, token: `token_otp_${Date.now()}` });
                }
            );
            return;
        }

        if (!user) {
            return res.status(401).json({ success: false, message: `No registered account found with identifier '${identifier}' for role '${role}'.` });
        }

        if (user.role !== role) {
            return res.status(403).json({ success: false, message: `Access denied. This account has role '${user.role}', not '${role}'.` });
        }

        if (user.status === 'pending_review') {
            return res.status(403).json({ success: false, message: "Your employee account is currently pending administrative approval." });
        }

        if (user.status === 'suspended') {
            return res.status(403).json({ success: false, message: "This account has been suspended. Please contact RailDrishti admin." });
        }

        // Verify password
        const isPasswordValid = verifyPassword(password, user.password_hash, user.salt);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid password. Access denied." });
        }

        const userPayload = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            adminId: user.admin_id,
            controllerId: user.controller_id,
            employeeId: user.employee_id,
            department: user.department,
            operationalRole: user.operational_role,
            status: user.status,
            createdAt: user.created_at
        };

        return res.json({
            success: true,
            user: userPayload,
            token: `token_${user.role}_${Date.now()}`
        });
    });
});

// Register Passenger or Submit Employee Application
app.post('/api/auth/register', (req, res) => {
    const {
        role = 'user',
        // User registration
        fullName, phoneNumber, email, password,
        // Employee registration
        employeeId, officialEmail, department, requestedRole
    } = req.body;

    if (role === 'user') {
        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanPhone = (phoneNumber || '').trim().replace(/\D/g, '');

        if (!fullName || !cleanEmail || !password) {
            return res.status(400).json({ success: false, message: "Full name, email, and password are required." });
        }

        // Check if duplicate
        db.get(`SELECT id FROM users WHERE LOWER(email) = ? OR phone = ?`, [cleanEmail, cleanPhone], (err, existing) => {
            if (existing) {
                return res.status(409).json({ success: false, message: "An account with this email or mobile number already exists." });
            }

            const newId = `usr_pass_${Date.now()}`;
            const { hash, salt } = hashPassword(password);

            db.run(
                `INSERT INTO users (id, username, name, email, phone, password_hash, salt, role, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'user', 'active')`,
                [newId, cleanEmail, fullName.trim(), cleanEmail, cleanPhone || null, hash, salt],
                function (insertErr) {
                    if (insertErr) {
                        return res.status(500).json({ success: false, message: "Database error registering user: " + insertErr.message });
                    }
                    const newUser = {
                        id: newId,
                        name: fullName.trim(),
                        email: cleanEmail,
                        phone: cleanPhone,
                        role: 'user',
                        status: 'active',
                        createdAt: new Date().toISOString()
                    };
                    res.status(201).json({
                        success: true,
                        user: newUser,
                        token: `token_user_${Date.now()}`,
                        message: "Registration completed successfully! You can now sign in."
                    });
                }
            );
        });
    } else {
        // Employee registration application
        const cleanEmpId = (employeeId || '').trim().toUpperCase();
        const cleanEmail = (officialEmail || '').trim().toLowerCase();

        if (!fullName || !cleanEmpId || !cleanEmail || !department) {
            return res.status(400).json({ success: false, message: "Full name, Employee ID, official email, and department are required." });
        }

        const appId = `app_${Date.now()}`;
        db.run(
            `INSERT INTO employee_applications (id, full_name, employee_id, official_email, department, requested_role, status) VALUES (?, ?, ?, ?, ?, ?, 'pending_review')`,
            [appId, fullName.trim(), cleanEmpId, cleanEmail, department, requestedRole || 'employee'],
            function (appErr) {
                if (appErr) {
                    return res.status(500).json({ success: false, message: "Failed to submit employee application: " + appErr.message });
                }

                // Also record in users with pending_review
                const { hash, salt } = hashPassword('Employee@RailDrishti2026');
                db.run(
                    `INSERT OR IGNORE INTO users (id, username, name, email, password_hash, salt, role, employee_id, department, status) VALUES (?, ?, ?, ?, ?, ?, 'employee', ?, ?, 'pending_review')`,
                    [`usr_emp_${Date.now()}`, cleanEmpId.toLowerCase(), fullName.trim(), cleanEmail, hash, salt, cleanEmpId, department]
                );

                res.status(201).json({
                    success: true,
                    requiresReview: true,
                    message: "Your employee account registration has been submitted and is under review by Railway Administration."
                });
            }
        );
    }
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
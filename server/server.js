// server/server.js
import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { DB_PATH, initializeDatabase, hashPassword, verifyPassword, INITIAL_CREDENTIALS } from './init_db.js';
import {
  initializeMailService,
  sendDispatch,
  getInbox,
  getSent,
  acknowledgeDispatch,
  getMailStats,
  STAFF_DIRECTORY,
  getAllDispatchesForAdmin,
  reviewDispatch
} from './mail_service.js';
import {
  initializeCaseService,
  createCase,
  getCases,
  getCaseById,
  acknowledgeCase,
  reviewCase,
  assignCase,
  updateCaseStatus,
  verifyCase,
  addCaseComment,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from './case_service.js';
import {
  initializeAuditService,
  getAuditLogs,
  createAuditLog,
  getAuditStats,
  buildServerPdf
} from './audit_service.js';
import {
  initializeWeatherService,
  getAdminWeatherStatus,
  getControllerWeatherStatus,
  testWeatherApiConnection,
  saveWeatherConfig,
  getWeatherConfig,
  refreshRealtimeWeatherData
} from './weather_service.js';

const app = express();
app.use(cors());
app.use(express.json());

const RAILRADAR_API_KEY = process.env.RAILRADAR_API_KEY || 'rg_e5d566785ee841099a832f6182e216b8';

// ==========================================
// ACTIVE REAL-TIME TELEMETRY POOL & CACHE
// ==========================================
const ACTIVE_MONITORED_TRAINS = ['12245', '12246', '12860', '12627', '20608', '12301', '12639', '12610'];
const liveTelemetryCache = new Map();
const sseClients = new Set();


const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error("Database connection error:", err.message);
  else {
    console.log(`Connected to trains.db SQLite database at: ${DB_PATH}`);
    initializeDatabase(db);
    initializeMailService(db);
    initializeCaseService(db);
    initializeAuditService(db);
    initializeWeatherService(db);

    // Initialize Historical Corridor Delay Bias Matrix Table
    db.run(`
      CREATE TABLE IF NOT EXISTS corridor_historical_delays (
        corridor_id TEXT PRIMARY KEY,
        from_zone TEXT,
        to_zone TEXT,
        peak_hour_delay_bias INTEGER,
        avg_clearance_minutes INTEGER
      )
    `, () => {
      const seedCorridors = [
        ['SWR-SCR', 'SWR', 'SCR', 8, 12],
        ['SCR-ECoR', 'SCR', 'ECoR', 11, 15],
        ['ECoR-ER', 'ECoR', 'ER', 14, 18],
        ['NR-NCR', 'NR', 'NCR', 16, 20],
        ['CR-WR', 'CR', 'WR', 9, 10]
      ];
      seedCorridors.forEach(([id, fz, tz, bias, clr]) => {
        db.run(
          `INSERT OR IGNORE INTO corridor_historical_delays (corridor_id, from_zone, to_zone, peak_hour_delay_bias, avg_clearance_minutes) VALUES (?, ?, ?, ?, ?)`,
          [id, fz, tz, bias, clr]
        );
      });
    });

    startBackgroundTelemetryDaemon();

  }
});

app.get('/health', (req, res) => {
  res.json({
    status: "healthy",
    service: "RailDrishti Real-Time Autonomous Telemetry Daemon & SQLite API",
    monitored_trains: ACTIVE_MONITORED_TRAINS.length,
    active_stream_subscribers: sseClients.size
  });
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
      emergencyContactName: user.emergency_contact_name,
      emergencyContactPhone: user.emergency_contact_phone,
      emergencyRelationship: user.emergency_relationship,
      bloodGroup: user.blood_group,
      address: user.address,
      dob: user.dob,
      gender: user.gender,
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
    fullName, phoneNumber, email, password,
    employeeId, officialEmail, department, requestedRole
  } = req.body;

  if (role === 'user') {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phoneNumber || '').trim().replace(/\D/g, '');

    if (!fullName || !cleanEmail || !password) {
      return res.status(400).json({ success: false, message: "Full name, email, and password are required." });
    }

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
// 1. SEARCH TRAINS (By Name, Number, or Station)
// ==========================================
app.get('/api/trains/search', (req, res) => {
  const query = (req.query.q || '').trim();
  const limit = parseInt(req.query.limit) || 100;

  if (!query) {
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
// 2. TRAIN ROUTE & COORDINATES (Sequential & Clean)
// ==========================================
app.get('/api/trains/:trainNo/route', (req, res) => {
  const trainNo = req.params.trainNo.trim();

  if (!ACTIVE_MONITORED_TRAINS.includes(trainNo)) {
    ACTIVE_MONITORED_TRAINS.push(trainNo);
  }

  const scheduleSql = `
    SELECT 
      MIN(ts.stop_sequence) as stop_sequence,
      ts.station_code, 
      ts.scheduled_arrival, 
      ts.scheduled_departure, 
      ts.day_count, 
      ts.halt_minutes,
      COALESCE(s.name, ts.station_code) as station_name, 
      s.latitude, 
      s.longitude 
    FROM train_schedules ts 
    JOIN stations s ON ts.station_code = s.code 
    WHERE ts.train_number = ? 
      AND s.latitude IS NOT NULL 
      AND s.longitude IS NOT NULL 
      AND s.latitude BETWEEN 8.0 AND 36.0 
      AND s.longitude BETWEEN 68.0 AND 97.0
    GROUP BY ts.station_code
    ORDER BY MIN(ts.stop_sequence) ASC
  `;

  db.all(scheduleSql, [trainNo], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    if (rows && rows.length >= 2) {
      return res.json({
        train_number: trainNo,
        total_stops: rows.length,
        route: rows
      });
    }

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
// 3. REAL-TIME LIVE RUNNING STATUS (Local DB)
// ==========================================
app.get('/api/trains/:trainNo/live', (req, res) => {
  const trainNo = req.params.trainNo.trim();

  db.get(`SELECT * FROM live_train_status WHERE train_number = ?`, [trainNo], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) return res.json(row);

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

      res.json({
        train_number: trainNo,
        train_name: trainInfo.train_name,
        journey_date: new Date().toISOString().slice(0, 10),
        status: "RUNNING",
        delay_minutes: 0,
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
    `SELECT code, name, state, zone, latitude, longitude 
     FROM stations 
     WHERE latitude IS NOT NULL 
       AND latitude BETWEEN 8.0 AND 36.0 
       AND longitude BETWEEN 68.0 AND 97.0 
     LIMIT 5000`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ stations: rows || [] });
    }
  );
});

// ==========================================
// 6. OFFICIAL DISPATCHES & RAILMAIL API
// ==========================================

app.get('/api/mail/directory', (req, res) => {
  res.json({ success: true, directory: STAFF_DIRECTORY });
});

app.post('/api/mail/send', async (req, res) => {
  try {
    const record = await sendDispatch(db, req.body);
    res.json({ success: true, message: 'Official dispatch sent successfully.', dispatch: record });
  } catch (err) {
    console.error('[RailMail API Error]:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

app.get('/api/mail/inbox', async (req, res) => {
  try {
    const { email, role, userId } = req.query;
    const items = await getInbox(db, { email, role, userId });
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/mail/sent', async (req, res) => {
  try {
    const { email, userId } = req.query;
    const items = await getSent(db, { email, userId });
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.patch('/api/mail/:id/acknowledge', async (req, res) => {
  try {
    const record = await acknowledgeDispatch(db, req.params.id, req.body.acknowledgedBy);
    res.json({ success: true, message: 'Dispatch marked as acknowledged.', dispatch: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/mail/stats', async (req, res) => {
  try {
    const { email, role, userId } = req.query;
    const stats = await getMailStats(db, { email, role, userId });
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin fetch all dispatches across the organization (Employee & Controller)
app.get('/api/mail/all', async (req, res) => {
  try {
    const { senderRole, approvalStatus, category, limit } = req.query;
    const items = await getAllDispatchesForAdmin(db, {
      senderRole,
      approvalStatus,
      category,
      limit: limit ? parseInt(limit, 10) : 150,
    });
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin review dispatch (Approve / Reject) and automatically send Return Mail
app.post('/api/mail/:id/review', async (req, res) => {
  try {
    const { decision, reviewerNotes, reviewerName, reviewerEmail, reviewerId } = req.body;
    const result = await reviewDispatch(db, {
      dispatchId: req.params.id,
      decision,
      reviewerNotes,
      reviewerName,
      reviewerEmail,
      reviewerId,
    });
    res.json({
      success: true,
      message: `Dispatch ${decision === 'approved' ? 'approved' : 'rejected'} and official return mail dispatched.`,
      original: result.original,
      returnDispatch: result.returnDispatch,
    });
  } catch (err) {
    console.error('[RailMail Review Error]:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==========================================
// USER & EMPLOYEE PROFILE PERSISTENCE API
// ==========================================

// Update user/employee personal & emergency profile details
app.put('/api/user/profile', (req, res) => {
  const {
    id,
    userId,
    name,
    phone,
    emergencyContactName,
    emergencyContactPhone,
    emergencyRelationship,
    bloodGroup,
    address,
    dob,
    gender,
  } = req.body;

  const targetId = id || userId;
  if (!targetId) {
    return res.status(400).json({ success: false, message: 'User ID is required to update profile.' });
  }

  const sql = `
    UPDATE users SET
      name = COALESCE(?, name),
      phone = COALESCE(?, phone),
      emergency_contact_name = ?,
      emergency_contact_phone = ?,
      emergency_relationship = ?,
      blood_group = ?,
      address = ?,
      dob = COALESCE(?, dob),
      gender = COALESCE(?, gender)
    WHERE id = ? OR LOWER(email) = LOWER(?) OR employee_id = ?
  `;

  db.run(
    sql,
    [
      name || null,
      phone || null,
      emergencyContactName || null,
      emergencyContactPhone || null,
      emergencyRelationship || null,
      bloodGroup || null,
      address || null,
      dob || null,
      gender || null,
      targetId,
      targetId,
      targetId,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error updating profile: ' + err.message });
      }

      db.get(
        `SELECT id, username, name, email, phone, role, employee_id, controller_id, admin_id,
                department, operational_role, emergency_contact_name, emergency_contact_phone,
                emergency_relationship, blood_group, address, dob, gender, status
         FROM users WHERE id = ? OR LOWER(email) = LOWER(?) OR employee_id = ?`,
        [targetId, targetId, targetId],
        (err2, user) => {
          if (err2 || !user) {
            return res.json({ success: true, message: 'Profile updated in database.' });
          }
          res.json({
            success: true,
            message: 'Profile records updated and saved to database successfully.',
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.role,
              employeeId: user.employee_id,
              controllerId: user.controller_id,
              adminId: user.admin_id,
              department: user.department,
              operationalRole: user.operational_role,
              emergencyContactName: user.emergency_contact_name,
              emergencyContactPhone: user.emergency_contact_phone,
              emergencyRelationship: user.emergency_relationship,
              bloodGroup: user.blood_group,
              address: user.address,
              dob: user.dob,
              gender: user.gender,
              status: user.status,
            },
          });
        }
      );
    }
  );
});

// Fetch user profile from DB
app.get('/api/user/profile/:id', (req, res) => {
  const targetId = req.params.id;
  db.get(
    `SELECT id, username, name, email, phone, role, employee_id, controller_id, admin_id,
            department, operational_role, emergency_contact_name, emergency_contact_phone,
            emergency_relationship, blood_group, address, dob, gender, status
     FROM users WHERE id = ? OR LOWER(email) = LOWER(?) OR employee_id = ?`,
    [targetId, targetId, targetId],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ success: false, message: 'User not found in database.' });
      }
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          employeeId: user.employee_id,
          controllerId: user.controller_id,
          adminId: user.admin_id,
          department: user.department,
          operationalRole: user.operational_role,
          emergencyContactName: user.emergency_contact_name,
          emergencyContactPhone: user.emergency_contact_phone,
          emergencyRelationship: user.emergency_relationship,
          bloodGroup: user.blood_group,
          address: user.address,
          dob: user.dob,
          gender: user.gender,
          status: user.status,
        },
      });
    }
  );
});

// ==========================================
// CONTROLLER OPERATIONAL ROLE ALLOTMENT API
// ==========================================

// Controller assign / update employee operational role
app.post('/api/controller/assign-role', (req, res) => {
  const { employeeId, operationalRole, department, assignedBy = 'Section Controller' } = req.body;

  if (!employeeId || !operationalRole) {
    return res.status(400).json({ success: false, message: 'Employee identifier and operational role are required.' });
  }

  const sql = `
    UPDATE users SET
      operational_role = ?,
      department = COALESCE(?, department)
    WHERE id = ? OR employee_id = ? OR LOWER(email) = LOWER(?)
  `;

  db.run(sql, [operationalRole, department || null, employeeId, employeeId, employeeId], function (err) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error updating role: ' + err.message });
    }

    db.get(
      `SELECT id, name, email, employee_id, department, operational_role FROM users
       WHERE id = ? OR employee_id = ? OR LOWER(email) = LOWER(?)`,
      [employeeId, employeeId, employeeId],
      (err2, user) => {
        if (err2 || !user) {
          return res.json({ success: true, message: `Operational role assigned: ${operationalRole}` });
        }

        console.log(`[Role Assignment] Controller ${assignedBy} assigned role '${operationalRole}' to ${user.name} (${user.employee_id})`);
        res.json({
          success: true,
          message: `Operational role for ${user.name} updated to '${operationalRole}' successfully.`,
          user,
        });
      }
    );
  });
});

// Controller fetch all division staff & operational assignments
app.get('/api/controller/staff', (req, res) => {
  db.all(
    `SELECT id, name, email, phone, role, employee_id, department, operational_role, emergency_contact_name, emergency_relationship, status, created_at
     FROM users WHERE role = 'employee' OR role = 'controller'
     ORDER BY role ASC, name ASC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, staff: rows || [] });
    }
  );
});

// Employee poll live operational role status
app.get('/api/employee/status/:id', (req, res) => {
  const targetId = req.params.id;
  db.get(
    `SELECT id, name, email, employee_id, department, operational_role, status
     FROM users WHERE id = ? OR employee_id = ? OR LOWER(email) = LOWER(?)`,
    [targetId, targetId, targetId],
    (err, row) => {
      if (err || !row) {
        return res.status(404).json({ success: false, message: 'Employee not found.' });
      }
      res.json({
        success: true,
        operationalRole: row.operational_role,
        department: row.department,
        status: row.status,
        employeeId: row.employee_id,
        name: row.name,
      });
    }
  );
});

// ==========================================
// 7. OPERATIONAL CASES & INCIDENTS WORKFLOW API
// ==========================================

app.post('/api/cases', async (req, res) => {
  try {
    const newCase = await createCase(db, req.body);
    res.status(201).json({ success: true, case: newCase, message: 'Case created successfully.' });
  } catch (err) {
    console.error('[Case API Error - Create]:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

app.get('/api/cases', async (req, res) => {
  try {
    const cases = await getCases(db, req.query);
    res.json({ success: true, cases });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/cases/notifications', async (req, res) => {
  try {
    const notifications = await getNotifications(db, req.query);
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.patch('/api/cases/notifications/:id/read', async (req, res) => {
  try {
    const result = await markNotificationRead(db, req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.patch('/api/cases/notifications/mark-all-read', async (req, res) => {
  try {
    const result = await markAllNotificationsRead(db, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/cases/:id', async (req, res) => {
  try {
    const caseData = await getCaseById(db, req.params.id);
    if (!caseData) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }
    res.json({ success: true, case: caseData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.patch('/api/cases/:id/acknowledge', async (req, res) => {
  try {
    const result = await acknowledgeCase(db, req.params.id, req.body.actor || {});
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.patch('/api/cases/:id/review', async (req, res) => {
  try {
    const result = await reviewCase(db, req.params.id, req.body.actor || {}, req.body.notes);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.patch('/api/cases/:id/assign', async (req, res) => {
  try {
    const result = await assignCase(db, req.params.id, req.body.actor || {}, req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.patch('/api/cases/:id/status', async (req, res) => {
  try {
    const { status, remarks, actor } = req.body;
    const result = await updateCaseStatus(db, req.params.id, actor || {}, status, remarks);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.patch('/api/cases/:id/verify', async (req, res) => {
  try {
    const result = await verifyCase(db, req.params.id, req.body.actor || {}, req.body.notes);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.post('/api/cases/:id/comments', async (req, res) => {
  try {
    const comment = await addCaseComment(db, req.params.id, req.body);
    res.status(201).json({ success: true, comment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==========================================
// 6. ROUTE WEATHER SERVICE (Open-Meteo)
// ==========================================
const fetchRouteWeather = async (lat, lon) => {
  if (!lat || !lon) return null;
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,visibility&timezone=Asia%2FKolkata`;
    const response = await fetch(weatherUrl, { signal: AbortSignal.timeout(2000) });
    if (!response.ok) return null;
    const data = await response.json();
    const current = data.current;

    const code = current.weather_code || 0;
    let condition = 'Clear Sky';
    let impact = 'NONE';
    let delayBufferMins = 0;

    if ([45, 48].includes(code) || (current.visibility && current.visibility < 1200)) {
      condition = 'Dense Fog / Low Visibility';
      impact = 'HIGH_CAUTION';
      delayBufferMins = 15;
    } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code) || current.precipitation > 2.0) {
      condition = 'Heavy Rain / Track Caution';
      impact = 'MODERATE';
      delayBufferMins = 8;
    } else if ([95, 96, 99].includes(code)) {
      condition = 'Thunderstorm Alert';
      impact = 'HIGH_CAUTION';
      delayBufferMins = 12;
    } else if (code >= 1 && code <= 3) {
      condition = 'Partly Cloudy';
    }

    return {
      temperature_c: Math.round(current.temperature_2m),
      condition,
      visibility_meters: current.visibility || 5000,
      impact,
      weather_delay_buffer_mins: delayBufferMins
    };
  } catch (err) {
    return null;
  }
};

// ==========================================
// 7. PREDICTIVE TELEMETRY LOGIC
// ==========================================
const calculatePredictiveMetrics = (speed, delayMinutes, isMidSectionHalt, weatherData, junctionDensity = 1, historicalBias = 6) => {
  let confidence = 94;
  if (delayMinutes > 30) confidence -= 18;
  else if (delayMinutes > 10) confidence -= 8;

  if (isMidSectionHalt) confidence -= 20;
  if (speed < 40 && !isMidSectionHalt) confidence -= 10;
  if (weatherData?.impact === 'HIGH_CAUTION') confidence -= 14;
  else if (weatherData?.impact === 'MODERATE') confidence -= 7;

  if (junctionDensity > 2) confidence -= 6;
  if (historicalBias > 10) confidence -= 5;

  confidence = Math.max(42, Math.min(98, confidence));
  const stability = confidence >= 84 ? 'HIGH' : confidence >= 64 ? 'MODERATE' : 'VOLATILE';

  const baseVariance = confidence >= 84 ? 3 : confidence >= 64 ? 6 : 12;
  const windowVariance = baseVariance + (weatherData?.weather_delay_buffer_mins || 0) + Math.round(historicalBias * 0.25);

  const recoverableMinutes = delayMinutes > 10 ? Math.min(Math.round(delayMinutes * 0.22), 18) : 0;
  const hasTSR = speed > 0 && speed <= 45;
  const tsrMessage = hasTSR ? 'Active Caution Order: 45 km/h Engineering Speed Restriction' : null;
  const congestionLevel = junctionDensity >= 3 ? 'CRITICAL' : junctionDensity === 2 ? 'MODERATE' : 'NORMAL';

  const cascadingConflicts = delayMinutes > 12 ? [
    {
      affected_train: '12860',
      train_name: 'Gitanjali Express',
      conflict_junction: 'BZA',
      junction_name: 'Vijayawada Jn',
      headway_risk: 'CRITICAL',
      projected_delay_addition_mins: Math.round(delayMinutes * 0.42),
      reason: 'Block section headway suppression behind delayed rake'
    },
    {
      affected_train: '12627',
      train_name: 'Karnataka Express',
      conflict_junction: 'RU',
      junction_name: 'Renigunta Jn',
      headway_risk: 'MODERATE',
      projected_delay_addition_mins: Math.round(delayMinutes * 0.2),
      reason: 'Platform clearance window conflict'
    }
  ] : [];

  return {
    eta_confidence: confidence,
    eta_stability: stability,
    eta_variance_mins: windowVariance,
    predicted_recovery_mins: recoverableMinutes,
    historical_delay_bias_mins: historicalBias,
    is_unscheduled_halt: isMidSectionHalt,
    active_caution_order: tsrMessage,
    congestion_level: congestionLevel,
    junction_density_count: junctionDensity,
    cascading_conflicts: cascadingConflicts,
    weather: weatherData
  };
};

// ==========================================
// 8. AUTONOMOUS BACKGROUND TELEMETRY DAEMON
// ==========================================
const syncTrainState = async (trainNo) => {
  return new Promise((resolve) => {
    const scheduleSql = `
      SELECT 
        MIN(ts.stop_sequence) as stop_sequence,
        ts.station_code, 
        ts.scheduled_arrival, 
        ts.scheduled_departure, 
        COALESCE(s.name, ts.station_code) as station_name, 
        s.latitude, 
        s.longitude 
      FROM train_schedules ts 
      JOIN stations s ON ts.station_code = s.code 
      WHERE ts.train_number = ? 
        AND s.latitude BETWEEN 8.0 AND 36.0 
        AND s.longitude BETWEEN 68.0 AND 97.0
      GROUP BY ts.station_code
      ORDER BY MIN(ts.stop_sequence) ASC
    `;

    db.all(scheduleSql, [trainNo], async (err, stops) => {
      if (err || !stops || stops.length === 0) return resolve(null);

      const now = new Date();
      const istStr = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' });
      const [nowH, nowM] = istStr.split(':').map(Number);
      const nowTotalMins = nowH * 60 + nowM;

      let activeIdx = 0;
      for (let i = 0; i < stops.length; i++) {
        const timeStr = stops[i].scheduled_departure || stops[i].scheduled_arrival;
        if (timeStr && timeStr.includes(':')) {
          const [h, m] = timeStr.split(':').map(Number);
          if (nowTotalMins >= (h * 60 + m)) {
            activeIdx = i;
          } else {
            break;
          }
        }
      }

      const curr = stops[activeIdx] || stops[0];
      const nxt = stops[Math.min(activeIdx + 1, stops.length - 1)];

      const weather = await fetchRouteWeather(curr.latitude, curr.longitude);
      const speed = weather?.impact === 'HIGH_CAUTION' ? 52 : 76;
      const metrics = calculatePredictiveMetrics(speed, 0, false, weather, 1, 7);

      const state = {
        train_number: trainNo,
        current_station: curr.station_code,
        current_station_name: curr.station_name,
        next_station: nxt.station_code,
        next_station_name: nxt.station_name,
        train_status_message: `Running on schedule near ${curr.station_name}`,
        terminated: activeIdx >= stops.length - 1,
        delay_minutes: 0,
        speed_kmh: speed,
        latitude: curr.latitude,
        longitude: curr.longitude,
        last_updated: new Date().toISOString(),
        ...metrics,
        stations: stops.map((st, idx) => {
          const isCrewPoint = ['BZA', 'VSKP', 'HWH', 'RU', 'KGP', 'NDLS', 'SBC'].includes(st.station_code.toUpperCase());
          return {
            stationCode: st.station_code,
            stationName: st.station_name,
            arrivalTime: st.scheduled_arrival,
            departureTime: st.scheduled_departure,
            status: idx <= activeIdx ? 'PASSED' : 'UPCOMING',
            actual_departure_time: idx <= activeIdx ? st.scheduled_departure : '--',
            predicted_platform: `PF #${(Math.abs(st.station_code.charCodeAt(0) * 3 + idx) % 6) + 1}`,
            is_crew_change: isCrewPoint,
            crew_duty_status: isCrewPoint ? 'Driver/Guard Handover Point' : null
          };
        })
      };

      liveTelemetryCache.set(trainNo, state);

      // Persist state to SQLite live table matching existing schema
      db.run(
        `INSERT OR REPLACE INTO live_train_status (
          train_number, last_updated, status, delay_minutes, current_station_code,
          current_lat, current_lng, speed_kmh, eta_next_station
        ) VALUES (?, ?, 'RUNNING', ?, ?, ?, ?, ?, ?)`,
        [
          trainNo,
          state.last_updated,
          state.delay_minutes,
          state.current_station,
          state.latitude,
          state.longitude,
          state.speed_kmh,
          nxt.scheduled_arrival || '--'
        ],
        () => { }
      );

      resolve(state);
    });
  });
};

const startBackgroundTelemetryDaemon = () => {
  console.log(`[DAEMON] Telemetry background engine running. Polling ${ACTIVE_MONITORED_TRAINS.length} corridor rakes.`);

  const cycle = async () => {
    for (const trainNo of ACTIVE_MONITORED_TRAINS) {
      await syncTrainState(trainNo);
    }

    try {
      await refreshRealtimeWeatherData(db, liveTelemetryCache);
    } catch (e) {
      // Background weather refresh error non-blocking
    }

    if (sseClients.size > 0) {
      const allStates = Array.from(liveTelemetryCache.values());
      const payload = `data: ${JSON.stringify({ type: 'TELEMETRY_SNAPSHOT', timestamp: Date.now(), data: allStates })}\n\n`;
      sseClients.forEach((client) => client.write(payload));
    }
  };

  cycle();
  setInterval(cycle, 15000);
};

// ==========================================
// 9. LIVE NTES REST & STREAMING SSE ENDPOINTS
// ==========================================

app.get('/api/trains/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  sseClients.add(res);

  const currentStates = Array.from(liveTelemetryCache.values());
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', data: currentStates })}\n\n`);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

app.get('/api/trains/:trainNo/live-ntes', async (req, res) => {
  const { trainNo } = req.params;

  if (liveTelemetryCache.has(trainNo)) {
    return res.json({
      source: 'RAILDRISHTI_REALTIME_CACHE',
      body: liveTelemetryCache.get(trainNo)
    });
  }

  const newState = await syncTrainState(trainNo);
  if (newState) {
    return res.json({
      source: 'ANUGAMAN_SCHEDULE_SYNCHRONIZED',
      body: newState
    });
  }

  res.status(404).json({ error: "Train state unavailable" });
});

// ==========================================
// AUDIT LOGS & COMPLIANCE SERVICE API
// ==========================================

// 1. Get Audit Logs with search & filters
app.get('/api/admin/audit-logs', async (req, res) => {
  try {
    const { search, type, severity, status, limit } = req.query;
    const logs = await getAuditLogs(db, { search, type, severity, status, limit });
    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    console.error('Failed to query audit logs:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Get Audit Statistics
app.get('/api/admin/audit-logs/stats', async (req, res) => {
  try {
    const stats = await getAuditStats(db);
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Create Audit Log
app.post('/api/admin/audit-logs', async (req, res) => {
  try {
    const log = await createAuditLog(db, req.body);
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Export Audit Logs (CSV / JSON / PDF)
app.get('/api/admin/audit-logs/export', async (req, res) => {
  try {
    const { format = 'csv', search, type, severity, status } = req.query;
    const logs = await getAuditLogs(db, { search, type, severity, status });
    const dateStr = new Date().toISOString().slice(0, 10);

    if (format === 'csv') {
      const headers = ["Log ID", "Timestamp (IST)", "Event", "Event Type", "Severity", "User", "User Role", "Resource", "Action", "Status", "IP Address"];
      const escapeCsv = (val) => `"${String(val || '').replace(/"/g, '""')}"`;
      const rows = logs.map(l => [
        escapeCsv(l.id),
        escapeCsv(l.timestamp),
        escapeCsv(l.event),
        escapeCsv(l.eventType),
        escapeCsv(l.severity),
        escapeCsv(l.user),
        escapeCsv(l.userRole),
        escapeCsv(l.resource),
        escapeCsv(l.action),
        escapeCsv(l.status),
        escapeCsv(l.ipAddress)
      ].join(','));
      const csv = "\uFEFF" + [headers.join(','), ...rows].join('\r\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="RailDrishti_Audit_Logs_${dateStr}.csv"`);
      return res.send(csv);
    }

    if (format === 'json') {
      const json = JSON.stringify({
        system: "RailDrishti Governance & Access Compliance Audit Ledger",
        exportedAt: new Date().toISOString(),
        totalRecords: logs.length,
        records: logs
      }, null, 2);

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="RailDrishti_Audit_Logs_${dateStr}.json"`);
      return res.send(json);
    }

    if (format === 'pdf') {
      const pdfHeaders = [
        { label: "LOG ID", key: "id", xOffset: 0, maxLen: 14 },
        { label: "TIMESTAMP", key: "timestamp", xOffset: 70, maxLen: 16 },
        { label: "EVENT", key: "event", xOffset: 85, maxLen: 28 },
        { label: "TYPE", key: "eventType", xOffset: 135, maxLen: 12 },
        { label: "SEVERITY", key: "severity", xOffset: 65, maxLen: 10 },
        { label: "STATUS", key: "status", xOffset: 60, maxLen: 10 },
        { label: "ACTOR / USER", key: "user", xOffset: 55, maxLen: 14 }
      ];
      const pdfBuf = buildServerPdf(
        "GOVERNMENT OF INDIA - MINISTRY OF RAILWAYS",
        "RAIL DRISHTI GOVERNANCE & ACCESS COMPLIANCE AUDIT LEDGER",
        pdfHeaders,
        logs,
        `Total Events: ${logs.length}`
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="RailDrishti_Audit_Logs_${dateStr}.pdf"`);
      return res.send(pdfBuf);
    }

    res.status(400).json({ error: 'Unsupported format. Use csv, json, or pdf.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// OPERATIONAL REPORTS & CASES EXPORT API
// ==========================================

// Direct PDF download endpoint for Controller Reports
app.get(['/api/reports/export/pdf', '/api/cases/export/pdf'], (req, res) => {
  db.all('SELECT * FROM operational_cases ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    const dateStr = new Date().toISOString().slice(0, 10);
    const pdfHeaders = [
      { label: "CASE ID", key: "id", xOffset: 0, maxLen: 14 },
      { label: "TYPE", key: "case_type", xOffset: 68, maxLen: 12 },
      { label: "SEVERITY", key: "severity", xOffset: 55, maxLen: 10 },
      { label: "LOCATION", key: "location", xOffset: 62, maxLen: 22 },
      { label: "DEPARTMENT", key: "department", xOffset: 130, maxLen: 18 },
      { label: "STATUS", key: "status", xOffset: 105, maxLen: 12 },
      { label: "REPORTER", key: "reporter_name", xOffset: 60, maxLen: 12 }
    ];

    const criticalCount = (rows || []).filter(r => r.severity === 'CRITICAL').length;
    const pdfBuf = buildServerPdf(
      "GOVERNMENT OF INDIA - MINISTRY OF RAILWAYS",
      "RAIL DRISHTI SECTION CONTROL - BENGALURU CENTRAL DIVISION",
      pdfHeaders,
      rows || [],
      `Total Cases: ${(rows || []).length} | Critical: ${criticalCount}`
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="RailDrishti_Operational_Report_${dateStr}.pdf"`);
    res.send(pdfBuf);
  });
});

// Direct CSV download endpoint
app.get(['/api/reports/export/csv', '/api/cases/export/csv'], (req, res) => {
  db.all('SELECT * FROM operational_cases ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const dateStr = new Date().toISOString().slice(0, 10);
    const headers = ["Case ID", "Type", "Title", "Severity", "Location", "Status", "Reporter", "Department", "Created At"];
    const escapeCsv = (val) => `"${String(val || '').replace(/"/g, '""')}"`;
    const csvRows = (rows || []).map(r => [
      escapeCsv(r.id),
      escapeCsv(r.case_type),
      escapeCsv(r.title),
      escapeCsv(r.severity),
      escapeCsv(r.location),
      escapeCsv(r.status),
      escapeCsv(r.reporter_name),
      escapeCsv(r.department),
      escapeCsv(r.created_at)
    ].join(','));
    const csv = "\uFEFF" + [headers.join(','), ...csvRows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="RailDrishti_Operational_Report_${dateStr}.csv"`);
    res.send(csv);
  });
});

// Direct JSON download endpoint
app.get(['/api/reports/export/json', '/api/cases/export/json'], (req, res) => {
  db.all('SELECT * FROM operational_cases ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const dateStr = new Date().toISOString().slice(0, 10);
    const json = JSON.stringify({
      system: "RailDrishti Section Control Operational Incidents & Audit Desk",
      exportedAt: new Date().toISOString(),
      totalRecords: (rows || []).length,
      cases: rows || []
    }, null, 2);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="RailDrishti_Operational_Report_${dateStr}.json"`);
    res.send(json);
  });
});

// ==========================================
// WEATHER & METEOROLOGICAL TELEMETRY API
// ==========================================

// 1. Admin Weather Service Status & Telemetry Link
app.get('/api/admin/weather/status', async (req, res) => {
  try {
    const status = await getAdminWeatherStatus(db, liveTelemetryCache);
    res.json({ success: true, ...status });
  } catch (err) {
    console.error('Failed to get weather status:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Test Upstream Weather API Connection
app.post('/api/admin/weather/test', async (req, res) => {
  try {
    const { endpoint } = req.body || {};
    const result = await testWeatherApiConnection(endpoint);
    res.json(result);
  } catch (err) {
    console.error('Failed to test weather API connection:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Get Saved Weather Configuration
app.get('/api/admin/weather/config', async (req, res) => {
  try {
    const config = await getWeatherConfig(db);
    res.json({ success: true, config });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Save Weather Configuration
app.post('/api/admin/weather/config', async (req, res) => {
  try {
    const result = await saveWeatherConfig(db, req.body);
    try {
      await createAuditLog(db, {
        event: 'Weather Monitoring Configuration Updated',
        eventType: 'CONFIG_CHANGE',
        severity: 'LOW',
        user: req.body.adminUser || 'Admin Desk',
        userRole: 'admin',
        resource: 'Weather Service',
        action: 'UPDATE_CONFIG',
        status: 'SUCCESS'
      });
    } catch (e) {
      // Audit non-fatal
    }
    res.json({
      success: true,
      message: 'Weather configuration saved successfully to central database and synced with telemetry daemon.',
      ...result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Controller Weather Impact & Active Telemetry Correlated Advisories
app.get(['/api/weather/controller', '/api/weather/sections'], async (req, res) => {
  try {
    const data = await getControllerWeatherStatus(db, liveTelemetryCache);
    res.json(data);
  } catch (err) {
    console.error('Failed to get controller weather:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend API successfully running on http://localhost:${PORT}`);
});
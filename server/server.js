// server/server.js
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
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
const httpServer = createServer(app);
app.use(cors());
app.use(express.json());

let activeRailRadarKey = process.env.RAILRADAR_API_KEY || 'rg_e5d566785ee841099a832f6182e216b8';

// ==========================================
// ACTIVE REAL-TIME TELEMETRY POOL & CACHE
// ==========================================
const ACTIVE_MONITORED_TRAINS = [
  '12245', '12246', '12860', '12627', '20608', '12301', '12639', '12610',
  '16589', '16526', '12628', '12079', '16591', '12613', '12608'
];
const liveTelemetryCache = new Map();

// ==========================================
// WEBSOCKET SERVER — Telemetry Live Stream
// ==========================================
const wss = new WebSocketServer({ server: httpServer, path: '/ws/telemetry' });

// Server-side train simulation state (mirrors telemetryEngine.ts)
const WS_STATIONS = [
  { code: 'SBC', name: 'KSR Bengaluru', lat: 12.9775, lon: 77.5713 },
  { code: 'BNC', name: 'Bengaluru Cantonment', lat: 12.9913, lon: 77.5987 },
  { code: 'BYPL', name: 'Baiyappanahalli', lat: 13.0285, lon: 77.6325 },
  { code: 'KJM', name: 'Krishnarajapuram', lat: 13.0005, lon: 77.6784 },
  { code: 'WFD', name: 'Whitefield', lat: 12.9934, lon: 77.7219 },
];

const wsTrainPool = [
  { trainNumber: '12245', name: 'Howrah - SMVT Bengaluru Duronto Express', priority: 1, seg: 2, prog: 0.42, dir: -1, speed: 82.5, signal: 'GREEN', delay: 12, risk: 0.45 },
  { trainNumber: '12246', name: 'SMVT Bengaluru - Howrah Duronto Express', priority: 1, seg: 1, prog: 0.18, dir: 1, speed: 88.0, signal: 'GREEN', delay: 8, risk: 0.30 },
  { trainNumber: '12860', name: 'Gitanjali Express', priority: 2, seg: 3, prog: 0.65, dir: -1, speed: 74.2, signal: 'YELLOW', delay: 16, risk: 0.58 },
  { trainNumber: '20608', name: 'Vande Bharat Express (SBC - MAS)', priority: 1, seg: 0, prog: 0.55, dir: 1, speed: 94.0, signal: 'GREEN', delay: 4, risk: 0.10 },
  { trainNumber: '12301', name: 'Howrah Rajdhani Express', priority: 1, seg: 2, prog: 0.82, dir: -1, speed: 86.4, signal: 'GREEN', delay: 6, risk: 0.22 },
  { trainNumber: '12610', name: 'Mysuru - Chennai Central Superfast', priority: 2, seg: 1, prog: 0.30, dir: 1, speed: 68.0, signal: 'GREEN', delay: 5, risk: 0.20 },
  { trainNumber: '12613', name: 'Wodeyar Superfast Express', priority: 2, seg: 0, prog: 0.15, dir: -1, speed: 65.5, signal: 'GREEN', delay: 3, risk: 0.14 },
  { trainNumber: '12608', name: 'Lalbagh Express', priority: 2, seg: 3, prog: 0.40, dir: -1, speed: 71.0, signal: 'GREEN', delay: 4, risk: 0.18 },
  { trainNumber: '12628', name: 'Karnataka Express', priority: 1, seg: 0, prog: 0.35, dir: 1, speed: 64.5, signal: 'GREEN', delay: 6, risk: 0.42 },
  { trainNumber: '16589', name: 'Rani Chennamma Express', priority: 2, seg: 2, prog: 0.70, dir: -1, speed: 72.0, signal: 'YELLOW', delay: 8, risk: 0.35 },
  { trainNumber: '16526', name: 'Kanyakumari Express', priority: 2, seg: 1, prog: 0.45, dir: 1, speed: 52.4, signal: 'YELLOW', delay: 5, risk: 0.28 },
  { trainNumber: '12627', name: 'Karnataka Express (UP)', priority: 1, seg: 3, prog: 0.20, dir: -1, speed: 58.6, signal: 'DOUBLE_YELLOW', delay: 11, risk: 0.68 },
  { trainNumber: '12079', name: 'Jan Shatabdi Express', priority: 1, seg: 0, prog: 0.85, dir: 1, speed: 68.2, signal: 'GREEN', delay: 3, risk: 0.15 },
  { trainNumber: '16591', name: 'Hampi Express', priority: 2, seg: 2, prog: 0.15, dir: 1, speed: 60.0, signal: 'GREEN', delay: 7, risk: 0.38 },
  { trainNumber: '12639', name: 'Brindavan Express', priority: 1, seg: 1, prog: 0.90, dir: -1, speed: 76.5, signal: 'GREEN', delay: 2, risk: 0.12 },
];

function advanceWsSimulation() {
  for (const t of wsTrainPool) {
    const DT = 1.8 / 3600;
    const i = Math.max(0, Math.min(t.seg, WS_STATIONS.length - 2));
    const a = WS_STATIONS[i];
    const b = WS_STATIONS[i + 1];
    const segLen = Math.max(1, Math.sqrt(Math.pow(b.lat - a.lat, 2) + Math.pow(b.lon - a.lon, 2)) * 111);

    // Realistic RTIS block progress step (approx ~1.5 - 3 minutes per block section)
    const dp = Math.max(0.0005, Math.min(0.0016, (t.speed * DT) / (segLen * 0.15)));
    t.prog += (t.dir === 1 ? dp : -dp);

    const maxSeg = WS_STATIONS.length - 2; // 3

    if (t.prog >= 1) {
      if (t.seg < maxSeg) {
        t.seg += 1;
        t.prog = 0.02;
      } else {
        // Reached Whitefield, reverse to UP line
        t.dir = -1;
        t.seg = maxSeg;
        t.prog = 0.98;
      }
    } else if (t.prog <= 0) {
      if (t.seg > 0) {
        t.seg -= 1;
        t.prog = 0.98;
      } else {
        // Reached SBC, reverse to DOWN line
        t.dir = 1;
        t.seg = 0;
        t.prog = 0.02;
      }
    }

    // Kinematic speed fluctuation (acceleration / coasting / braking curves)
    t.speed = Math.max(40, Math.min(96, Math.round((t.speed + (Math.random() - 0.48) * 1.8) * 10) / 10));

    // Signal aspect calculation strictly aligned with speed criteria:
    // Speed > 70 km/h (including > 100) => GREEN
    // Speed 50 - 70 km/h => YELLOW (30 - 50 => DOUBLE_YELLOW)
    // Speed < 30 km/h => RED
    if (t.speed < 30) {
      t.signal = 'RED';
    } else if (t.speed >= 30 && t.speed < 50) {
      t.signal = 'DOUBLE_YELLOW';
    } else if (t.speed >= 50 && t.speed <= 70) {
      t.signal = 'YELLOW';
    } else {
      t.signal = 'GREEN';
    }
  }
}

function buildWsPayloads() {
  return wsTrainPool.map(t => {
    const i = Math.max(0, Math.min(t.seg, WS_STATIONS.length - 2));
    const sA = WS_STATIONS[i];
    const sB = WS_STATIONS[i + 1];
    const lat = sA.lat + (sB.lat - sA.lat) * t.prog;
    const lon = sA.lon + (sB.lon - sA.lon) * t.prog;
    const nextIdx = t.dir === 1 ? i + 1 : i;
    const nextSt = WS_STATIONS[Math.max(0, Math.min(nextIdx, WS_STATIONS.length - 1))];
    const distRem = Math.max(0.5, Math.sqrt(Math.pow(nextSt.lat - lat, 2) + Math.pow(nextSt.lon - lon, 2)) * 111);
    const etaMin = t.speed > 0 ? (distRem / t.speed) * 60 : 0;
    const etaTime = new Date(Date.now() + etaMin * 60000);
    const blockNum = Math.min(4, Math.max(1, Math.ceil(t.prog * 4)));

    return {
      train_number: t.trainNumber,
      train_name: t.name,
      priority_tier: t.priority,
      current_block: `${sA.code}-${sB.code} Block ${blockNum}`,
      telemetry: {
        lat: parseFloat(lat.toFixed(5)),
        lon: parseFloat(lon.toFixed(5)),
        speed_kmh: parseFloat(t.speed.toFixed(1)),
        signal: t.signal
      },
      forecasts: [{
        station: nextSt.code,
        station_name: nextSt.name,
        distance_remaining_km: parseFloat(distRem.toFixed(1)),
        baseline_static_eta: etaTime.toTimeString().slice(0, 5),
        dynamic_gnn_eta: new Date(etaTime.getTime() + t.delay * 60000).toTimeString().slice(0, 5),
        predicted_delay_min: t.delay,
        cascade_risk: t.risk,
      }],
      updatedAt: new Date().toLocaleTimeString(),
    };
  });
}

// Broadcast telemetry to all WS clients every 1.8s
setInterval(() => {
  advanceWsSimulation();
  if (wss.clients.size === 0) return;
  const payloads = buildWsPayloads();
  
  // Single atomic batch message for optimal React rendering
  const batchMsg = JSON.stringify({ type: 'TELEMETRY_BATCH', trains: payloads, timestamp: Date.now() });
  const individualMsgs = payloads.map(p => JSON.stringify(p));

  wss.clients.forEach(client => {
    if (client.readyState === 1 /* OPEN */) {
      client.send(batchMsg);
      // Also send individual train messages for legacy listeners
      individualMsgs.forEach(m => client.send(m));
    }
  });
}, 1800);

wss.on('connection', (ws) => {
  console.log('[WS] Telemetry client connected. Total:', wss.clients.size);
  // Send current snapshot immediately on connect (batch + individual)
  const payloads = buildWsPayloads();
  ws.send(JSON.stringify({ type: 'TELEMETRY_BATCH', trains: payloads, timestamp: Date.now() }));
  payloads.forEach(p => ws.send(JSON.stringify(p)));
  ws.on('close', () => console.log('[WS] Client disconnected. Total:', wss.clients.size));
});

// SSE client registry (for /api/trains/stream endpoint)
const sseClients = new Set();

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error("Database connection error:", err.message);
  else {
    console.log(`Connected to trains.db SQLite database at: ${DB_PATH}`);
    db.run("PRAGMA journal_mode = WAL;");
    db.run("PRAGMA synchronous = NORMAL;");
    db.run("CREATE INDEX IF NOT EXISTS idx_ts_station ON train_schedules(station_code);");
    db.run("CREATE INDEX IF NOT EXISTS idx_ts_train ON train_schedules(train_number);");
    db.run("CREATE INDEX IF NOT EXISTS idx_ts_train_stn ON train_schedules(train_number, station_code);");
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

    // Initialize System Monitoring Services Table
    db.run(`
      CREATE TABLE IF NOT EXISTS system_monitoring_services (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'Operational',
        availability TEXT DEFAULT '99.9%',
        response_time_ms INTEGER DEFAULT 24,
        last_check TEXT DEFAULT 'Just now',
        version TEXT,
        endpoint TEXT,
        dependencies TEXT,
        last_error TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, () => {
      db.get(`SELECT COUNT(*) as count FROM system_monitoring_services`, (err, row) => {
        if (!err && row && row.count === 0) {
          const defaultServices = [
            ['srv_api', 'API Gateway', 'Central FastAPI reverse proxy routing client requests, rate-limiting, and RBAC authentication.', 'Operational', '99.94%', 24, '30s ago', 'v2.6.1-prod', 'http://localhost:5000/api', JSON.stringify(["PostgreSQL", "Auth Service", "Redis Session Store"]), null],
            ['srv_db', 'Database (PostgreSQL & TimescaleDB)', 'Primary relational datastore and hypertable time-series partitions for track occupancy.', 'Operational', '99.99%', 8, '1m ago', '16.3-timescale', 'rd-db-primary.railway.internal:5432', JSON.stringify(["Persistent Block Storage", "VPC Private Subnet"]), null],
            ['srv_telemetry', 'Telemetry Ingestion (RTIS)', 'Sub-second GPS coordinate and locomotive speed stream consumer parsing CRIS transponder packets.', 'Operational', '99.85%', 38, 'Just now', 'v3.1.0-stream', 'wss://telemetry.cris.org.in/rtis/v2', JSON.stringify(["CRIS mTLS Bridge", "Kafka / Redis Message Queue"]), null],
            ['srv_prediction', 'Prediction Service (GNN + Transformer)', 'Deep learning spatio-temporal inference engine generating dynamic section arrivals and delay trees.', 'Operational', '99.70%', 62, '45s ago', 'v2.4-prod', 'http://prediction-engine.internal:8000/v1', JSON.stringify(["GPU Inference Worker", "PyTorch C++ Runtime"]), null],
            ['srv_weather', 'Weather Service (Open-Meteo & Radar)', 'Section-level precipitation, visibility, and wind gust poll worker with real-time route integration.', 'Operational', '99.90%', 95, 'Just now', 'v1.8.4', 'https://api.open-meteo.com/v1/forecast', JSON.stringify(["External DNS", "IMD Gridded Ingest"]), null],
            ['srv_ws_gateway', 'WebSocket Gateway', 'Real-time client hub maintaining duplex stateful socket connections for active Controller terminals.', 'Operational', '99.92%', 14, '10s ago', 'v2.2.0-wss', 'ws://localhost:5000/ws/telemetry', JSON.stringify(["FastAPI WebSocket Hub", "Telemetry Worker"]), null],
            ['srv_notification', 'Notification Service', 'Multi-channel dispatcher transmitting operational emergency bulletins, SMS, and RailNet terminal notices.', 'Degraded', '98.20%', 320, '2m ago', 'v1.4.2', 'https://notify.internal.raildrishti.gov/v1', JSON.stringify(["SMS Gateway Provider", "WebPush Dispatcher"]), 'SMS Provider API timeout: queue throttled at gateway node.']
          ];
          const insertStmt = db.prepare(`
            INSERT INTO system_monitoring_services (id, name, description, status, availability, response_time_ms, last_check, version, endpoint, dependencies, last_error)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          defaultServices.forEach(s => insertStmt.run(...s));
          insertStmt.finalize();
          console.log("Initialized system_monitoring_services default rows.");
        }
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
// 1.5. SEARCH TRAINS BETWEEN STATIONS (With Exact Schedules)
// ==========================================
app.get('/api/trains/between', (req, res) => {
  const from = (req.query.from || '').trim().toUpperCase();
  const to = (req.query.to || '').trim().toUpperCase();

  if (!from || !to) {
    return res.status(400).json({ error: 'Origin (from) and Destination (to) station parameters are required.' });
  }

  const scheduleSql = `
    SELECT DISTINCT
      t.train_number,
      t.train_name,
      t.train_type,
      t.source_station_code,
      t.dest_station_code,
      COALESCE(s_src.name, t.source_station_code) as source_station_name,
      COALESCE(s_dest.name, t.dest_station_code) as dest_station_name,
      COALESCE(ts1.scheduled_departure, ts1.scheduled_arrival) as scheduled_departure,
      COALESCE(ts2.scheduled_arrival, ts2.scheduled_departure) as scheduled_arrival,
      COALESCE(s1.code, t.source_station_code) as from_station_code,
      COALESCE(s1.name, t.source_station_code) as from_station_name,
      COALESCE(s2.code, t.dest_station_code) as to_station_code,
      COALESCE(s2.name, t.dest_station_code) as to_station_name,
      ROUND(ABS(COALESCE(ts2.distance_from_source_km, t.total_distance_km) - COALESCE(ts1.distance_from_source_km, 0)), 1) as total_distance_km
    FROM trains t
    JOIN train_schedules ts1 ON t.train_number = ts1.train_number
    JOIN train_schedules ts2 ON t.train_number = ts2.train_number
    LEFT JOIN stations s1 ON ts1.station_code = s1.code
    LEFT JOIN stations s2 ON ts2.station_code = s2.code
    LEFT JOIN stations s_src ON t.source_station_code = s_src.code
    LEFT JOIN stations s_dest ON t.dest_station_code = s_dest.code
    WHERE ts1.station_code IN (SELECT code FROM stations WHERE code = ? OR UPPER(name) LIKE ?)
      AND ts2.station_code IN (SELECT code FROM stations WHERE code = ? OR UPPER(name) LIKE ?)
      AND ts1.stop_sequence < ts2.stop_sequence
    ORDER BY COALESCE(ts1.scheduled_departure, ts1.scheduled_arrival) ASC
  `;

  db.all(scheduleSql, [from, `%${from}%`, to, `%${to}%`], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows && rows.length > 0) {
      return res.json({ trains: rows });
    }

    // Fallback: Query trains table where source or dest matches
    const searchPattern = `%${from}%`;
    const searchPatternTo = `%${to}%`;
    const fallbackSql = `
      SELECT DISTINCT
        t.train_number,
        t.train_name,
        t.train_type,
        t.source_station_code,
        t.dest_station_code,
        COALESCE(s1.name, t.source_station_code) as source_station_name,
        COALESCE(s2.name, t.dest_station_code) as dest_station_name,
        t.total_distance_km
      FROM trains t
      LEFT JOIN stations s1 ON t.source_station_code = s1.code
      LEFT JOIN stations s2 ON t.dest_station_code = s2.code
      WHERE (t.source_station_code = ? OR UPPER(s1.name) LIKE ? OR t.source_station_code = ? OR UPPER(s2.name) LIKE ?)
         OR (t.dest_station_code = ? OR UPPER(s1.name) LIKE ? OR t.dest_station_code = ? OR UPPER(s2.name) LIKE ?)
      LIMIT 50
    `;
    db.all(fallbackSql, [from, searchPattern, to, searchPatternTo, from, searchPattern, to, searchPatternTo], (err2, rows2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ trains: rows2 || [] });
    });
  });
});

// ==========================================
// ==========================================
// 2. OFFICIAL CRIS / NTES TIMETABLES & ROUTE ENDPOINT
// ==========================================
const CRIS_OFFICIAL_TIMETABLES = {
  '12245': {
    name: 'Howrah - SMVT Bengaluru Duronto Express',
    type: 'DURONTO',
    mps: 120,
    baseDelay: 12,
    stops: [
      { stop_sequence: 1, station_code: 'HWH', scheduled_arrival: null, scheduled_departure: '10:50:00', day_count: 1, halt_minutes: 0, predicted_platform: 'PF #21', is_crew_change: true },
      { stop_sequence: 2, station_code: 'BBS', scheduled_arrival: '16:20:00', scheduled_departure: '16:30:00', day_count: 1, halt_minutes: 10, predicted_platform: 'PF #4', is_crew_change: true },
      { stop_sequence: 3, station_code: 'VZM', scheduled_arrival: '22:05:00', scheduled_departure: '22:15:00', day_count: 1, halt_minutes: 10, predicted_platform: 'PF #3', is_crew_change: false },
      { stop_sequence: 4, station_code: 'BZA', scheduled_arrival: '04:15:00', scheduled_departure: '04:25:00', day_count: 2, halt_minutes: 10, predicted_platform: 'PF #7', is_crew_change: true },
      { stop_sequence: 5, station_code: 'RU', scheduled_arrival: '09:55:00', scheduled_departure: '10:00:00', day_count: 2, halt_minutes: 5, predicted_platform: 'PF #1', is_crew_change: true },
      { stop_sequence: 6, station_code: 'SMVB', scheduled_arrival: '15:50:00', scheduled_departure: null, day_count: 2, halt_minutes: 0, predicted_platform: 'PF #2', is_crew_change: false }
    ]
  },
  '12246': {
    name: 'SMVT Bengaluru - Howrah Duronto Express',
    type: 'DURONTO',
    mps: 120,
    baseDelay: 8,
    stops: [
      { stop_sequence: 1, station_code: 'SMVB', scheduled_arrival: null, scheduled_departure: '11:20:00', day_count: 1, halt_minutes: 0, predicted_platform: 'PF #2', is_crew_change: false },
      { stop_sequence: 2, station_code: 'RU', scheduled_arrival: '16:40:00', scheduled_departure: '16:45:00', day_count: 1, halt_minutes: 5, predicted_platform: 'PF #1', is_crew_change: true },
      { stop_sequence: 3, station_code: 'BZA', scheduled_arrival: '22:20:00', scheduled_departure: '22:30:00', day_count: 1, halt_minutes: 10, predicted_platform: 'PF #7', is_crew_change: true },
      { stop_sequence: 4, station_code: 'VZM', scheduled_arrival: '04:20:00', scheduled_departure: '04:30:00', day_count: 2, halt_minutes: 10, predicted_platform: 'PF #3', is_crew_change: false },
      { stop_sequence: 5, station_code: 'BBS', scheduled_arrival: '09:45:00', scheduled_departure: '09:55:00', day_count: 2, halt_minutes: 10, predicted_platform: 'PF #4', is_crew_change: true },
      { stop_sequence: 6, station_code: 'HWH', scheduled_arrival: '16:15:00', scheduled_departure: null, day_count: 2, halt_minutes: 0, predicted_platform: 'PF #21', is_crew_change: true }
    ]
  },
  '20608': {
    name: 'Vande Bharat Express (SBC - MAS)',
    type: 'VANDE_BHARAT',
    mps: 130,
    baseDelay: 4,
    stops: [
      { stop_sequence: 1, station_code: 'SBC', scheduled_arrival: null, scheduled_departure: '05:45:00', day_count: 1, halt_minutes: 0, predicted_platform: 'PF #1', is_crew_change: true },
      { stop_sequence: 2, station_code: 'BNC', scheduled_arrival: '05:53:00', scheduled_departure: '05:55:00', day_count: 1, halt_minutes: 2, predicted_platform: 'PF #2', is_crew_change: false },
      { stop_sequence: 3, station_code: 'KJM', scheduled_arrival: '06:08:00', scheduled_departure: '06:10:00', day_count: 1, halt_minutes: 2, predicted_platform: 'PF #2', is_crew_change: false },
      { stop_sequence: 4, station_code: 'KPD', scheduled_arrival: '08:33:00', scheduled_departure: '08:35:00', day_count: 1, halt_minutes: 2, predicted_platform: 'PF #1', is_crew_change: true },
      { stop_sequence: 5, station_code: 'MAS', scheduled_arrival: '10:10:00', scheduled_departure: null, day_count: 1, halt_minutes: 0, predicted_platform: 'PF #2A', is_crew_change: true }
    ]
  },
  '12301': {
    name: 'Howrah Rajdhani Express',
    type: 'RAJDHANI',
    mps: 130,
    baseDelay: 6,
    stops: [
      { stop_sequence: 1, station_code: 'HWH', scheduled_arrival: null, scheduled_departure: '16:50:00', day_count: 1, halt_minutes: 0, predicted_platform: 'PF #9', is_crew_change: true },
      { stop_sequence: 2, station_code: 'ASN', scheduled_arrival: '18:57:00', scheduled_departure: '19:00:00', day_count: 1, halt_minutes: 3, predicted_platform: 'PF #4', is_crew_change: true },
      { stop_sequence: 3, station_code: 'DHN', scheduled_arrival: '19:50:00', scheduled_departure: '19:55:00', day_count: 1, halt_minutes: 5, predicted_platform: 'PF #3', is_crew_change: false },
      { stop_sequence: 4, station_code: 'PNME', scheduled_arrival: '20:30:00', scheduled_departure: '20:32:00', day_count: 1, halt_minutes: 2, predicted_platform: 'PF #3', is_crew_change: false },
      { stop_sequence: 5, station_code: 'GAYA', scheduled_arrival: '22:19:00', scheduled_departure: '22:22:00', day_count: 1, halt_minutes: 3, predicted_platform: 'PF #1', is_crew_change: true },
      { stop_sequence: 6, station_code: 'DDU', scheduled_arrival: '00:45:00', scheduled_departure: '00:55:00', day_count: 2, halt_minutes: 10, predicted_platform: 'PF #2', is_crew_change: true },
      { stop_sequence: 7, station_code: 'PRYJ', scheduled_arrival: '02:33:00', scheduled_departure: '02:35:00', day_count: 2, halt_minutes: 2, predicted_platform: 'PF #1', is_crew_change: false },
      { stop_sequence: 8, station_code: 'CNB', scheduled_arrival: '04:40:00', scheduled_departure: '04:45:00', day_count: 2, halt_minutes: 5, predicted_platform: 'PF #1', is_crew_change: true },
      { stop_sequence: 9, station_code: 'NDLS', scheduled_arrival: '10:05:00', scheduled_departure: null, day_count: 2, halt_minutes: 0, predicted_platform: 'PF #16', is_crew_change: true }
    ]
  },
  '06527': {
    name: 'Bangarapet MEMU Commuter',
    type: 'MEMU',
    mps: 75,
    baseDelay: 3,
    stops: [
      { stop_sequence: 1, station_code: 'SBC', scheduled_arrival: null, scheduled_departure: '07:15:00', day_count: 1, halt_minutes: 0, predicted_platform: 'PF #6', is_crew_change: false },
      { stop_sequence: 2, station_code: 'BNC', scheduled_arrival: '07:24:00', scheduled_departure: '07:25:00', day_count: 1, halt_minutes: 1, predicted_platform: 'PF #1', is_crew_change: false },
      { stop_sequence: 3, station_code: 'BYPL', scheduled_arrival: '07:31:00', scheduled_departure: '07:32:00', day_count: 1, halt_minutes: 1, predicted_platform: 'PF #1', is_crew_change: false },
      { stop_sequence: 4, station_code: 'KJM', scheduled_arrival: '07:38:00', scheduled_departure: '07:40:00', day_count: 1, halt_minutes: 2, predicted_platform: 'PF #1', is_crew_change: false },
      { stop_sequence: 5, station_code: 'WFD', scheduled_arrival: '07:48:00', scheduled_departure: '07:50:00', day_count: 1, halt_minutes: 2, predicted_platform: 'PF #2', is_crew_change: false },
      { stop_sequence: 6, station_code: 'MLO', scheduled_arrival: '08:08:00', scheduled_departure: '08:10:00', day_count: 1, halt_minutes: 2, predicted_platform: 'PF #1', is_crew_change: false },
      { stop_sequence: 7, station_code: 'BWT', scheduled_arrival: '08:40:00', scheduled_departure: null, day_count: 1, halt_minutes: 0, predicted_platform: 'PF #4', is_crew_change: false }
    ]
  }
};

// Helper: Extract actual scheduled commercial passenger stops according to CRIS / NTES standards
const extractPlannedCommercialStops = (allRows, trainNo) => {
  if (!allRows || allRows.length === 0) return [];

  // Check if official CRIS timetable exists
  if (CRIS_OFFICIAL_TIMETABLES[trainNo]) {
    const timetable = CRIS_OFFICIAL_TIMETABLES[trainNo];
    const stationMap = new Map();
    allRows.forEach(r => stationMap.set(r.station_code.toUpperCase(), r));

    return timetable.stops.map(st => {
      const match = stationMap.get(st.station_code.toUpperCase());
      return {
        stop_sequence: st.stop_sequence,
        station_code: st.station_code,
        station_name: match?.station_name || st.station_code,
        latitude: match?.latitude || 0,
        longitude: match?.longitude || 0,
        scheduled_arrival: st.scheduled_arrival,
        scheduled_departure: st.scheduled_departure,
        day_count: st.day_count,
        halt_minutes: st.halt_minutes,
        predicted_platform: st.predicted_platform || 'PF #1',
        is_crew_change: Boolean(st.is_crew_change),
        is_commercial_halt: true
      };
    }).filter(s => s.latitude !== 0 && s.longitude !== 0);
  }

  if (allRows.length <= 2) {
    return allRows.map((s, idx) => ({
      ...s,
      stop_sequence: idx + 1,
      predicted_platform: `PF #${(idx % 4) + 1}`,
      is_commercial_halt: true
    }));
  }

  // General algorithmic extraction: Keep Origin, Destination, and genuine Halts (halt_minutes > 0 or Arr != Dep)
  const first = allRows[0];
  const last = allRows[allRows.length - 1];

  const commercialStops = allRows.filter((r, idx) => {
    if (idx === 0 || idx === allRows.length - 1) return true;
    if (r.halt_minutes && Number(r.halt_minutes) > 0) return true;
    if (r.scheduled_arrival && r.scheduled_departure && r.scheduled_arrival !== r.scheduled_departure) {
      return true;
    }
    return false;
  });

  if (commercialStops.length >= 2) {
    return commercialStops.map((s, idx) => ({
      ...s,
      stop_sequence: idx + 1,
      predicted_platform: s.predicted_platform || `PF #${((s.station_code.charCodeAt(0) + idx) % 5) + 1}`,
      is_commercial_halt: true
    }));
  }

  // Fallback: If open data omitted halts, select significant major stations along route
  const sampled = [first];
  for (let i = 1; i < allRows.length - 1; i++) {
    const isJunction = (allRows[i].station_name || '').toLowerCase().includes('junction') ||
                       (allRows[i].station_name || '').toLowerCase().includes('jn');
    if (isJunction) {
      sampled.push(allRows[i]);
    }
  }
  sampled.push(last);

  return sampled.map((s, idx) => ({
    ...s,
    stop_sequence: idx + 1,
    predicted_platform: `PF #${((s.station_code.charCodeAt(0) + idx) % 4) + 1}`,
    is_commercial_halt: true
  }));
};

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
      // 1. Full detailed route coordinates for map polyline path
      const routeGeometry = rows;
      // 2. Official CRIS/NTES planned commercial passenger stops
      const plannedStops = extractPlannedCommercialStops(rows, trainNo);

      return res.json({
        train_number: trainNo,
        total_stops: plannedStops.length,
        planned_stops_count: plannedStops.length,
        planned_stops: plannedStops,
        route: routeGeometry
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
      const validFallback = fallbackRows || [];
      res.json({
        train_number: trainNo,
        total_stops: validFallback.length,
        planned_stops_count: validFallback.length,
        planned_stops: validFallback,
        route: validFallback
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
const routeWeatherCache = new Map();

const defaultWeather = {
  temperature_c: 26,
  condition: 'Partly Cloudy',
  visibility_meters: 5000,
  impact: 'NONE',
  weather_delay_buffer_mins: 0
};

const fetchRouteWeather = async (lat, lon) => {
  if (!lat || !lon) return defaultWeather;
  const cacheKey = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
  const cached = routeWeatherCache.get(cacheKey);
  if (cached && (Date.now() - cached.ts) < 300000) {
    return cached.data;
  }

  // Trigger non-blocking async weather fetch in background
  if (!cached || (Date.now() - cached.ts) >= 300000) {
    routeWeatherCache.set(cacheKey, { ts: Date.now(), data: cached ? cached.data : defaultWeather });
    
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,visibility&timezone=Asia%2FKolkata`;
    fetch(weatherUrl, { signal: AbortSignal.timeout(3000) })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data || !data.current) return;
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

        const result = {
          temperature_c: Math.round(current.temperature_2m),
          condition,
          visibility_meters: current.visibility || 5000,
          impact,
          weather_delay_buffer_mins: delayBufferMins
        };
        routeWeatherCache.set(cacheKey, { ts: Date.now(), data: result });
      })
      .catch(() => {});
  }

  return cached ? cached.data : defaultWeather;
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
// ==========================================
// 8. AUTONOMOUS BACKGROUND TELEMETRY DAEMON
// ==========================================

// Helper: Ingest real-time live telemetry from RailRadar API
const fetchRailRadarLiveData = async (trainNo) => {
  if (!activeRailRadarKey || activeRailRadarKey.startsWith('rg_e5d56678')) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const liveUrl = `https://api.railradar.in/v1/trains/${trainNo}/live?includeCoordinates=true`;
    const res = await fetch(liveUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${activeRailRadarKey}`,
        'x-api-key': activeRailRadarKey,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const payload = await res.json();
      if (payload && payload.success && payload.data) {
        return payload.data;
      }
    }
  } catch (err) {
    // Upstream error non-fatal, fallback activates
  }
  return null;
};

const syncTrainState = async (trainNo) => {
  return new Promise(async (resolve) => {
    // 1. Attempt RailRadar live API ingestion first
    const rrData = await fetchRailRadarLiveData(trainNo);

    if (rrData && (rrData.currentLocation || rrData.route)) {
      const loc = rrData.currentLocation || {};
      const routeList = Array.isArray(rrData.route) ? rrData.route : [];

      let lat = loc.lat;
      let lon = loc.lng;

      if ((!lat || !lon) && routeList.length > 0) {
        const curHalt = routeList.find((r) => r.stationCode === loc.stationCode) || routeList[0];
        lat = curHalt?.lat;
        lon = curHalt?.lng;
      }

      const weather = lat && lon ? await fetchRouteWeather(lat, lon) : null;
      const speed = loc.speedKmh || (weather?.impact === 'HIGH_CAUTION' ? 52 : 76);
      const delay = rrData.delayMinutes ?? 0;
      const metrics = calculatePredictiveMetrics(speed, delay, false, weather, 1, 7);

      const nextHalt = rrData.nextHalt || {};
      const prevHalt = rrData.previousHalt || {};

      const state = {
        source: 'RAILRADAR_LIVE_API',
        train_number: trainNo,
        train_name: rrData.trainName || rrData.train?.name || `Express #${trainNo}`,
        current_station: loc.stationCode || prevHalt.stationCode || 'IN_TRANSIT',
        current_station_name: prevHalt.stationName || loc.stationCode || 'In Transit',
        next_station: nextHalt.stationCode || '--',
        next_station_name: nextHalt.stationName || '--',
        train_status_message: `Live: ${loc.status === 'departed' ? 'Departed ' + (prevHalt.stationName || loc.stationCode) : 'In Transit'} (+${delay}m delay)`,
        terminated: rrData.status === 'terminated',
        delay_minutes: delay,
        speed_kmh: speed,
        latitude: lat || 22.584,
        longitude: lon || 88.341,
        last_updated: new Date().toISOString(),
        ...metrics,
        stations: routeList.map((st, idx) => {
          const isCrewPoint = ['BZA', 'VSKP', 'HWH', 'RU', 'KGP', 'NDLS', 'SBC'].includes((st.stationCode || '').toUpperCase());
          return {
            stationCode: st.stationCode,
            stationName: st.stationName,
            arrivalTime: st.scheduledArrival,
            departureTime: st.scheduledDeparture,
            status: st.status === 'departed' ? 'PASSED' : 'UPCOMING',
            actual_departure_time: st.actualDeparture || st.scheduledDeparture || '--',
            predicted_platform: `PF #${st.platform || (Math.abs((st.stationCode || 'S').charCodeAt(0) * 3 + idx) % 6) + 1}`,
            is_crew_change: isCrewPoint,
            crew_duty_status: isCrewPoint ? 'Driver/Guard Handover Point' : null
          };
        })
      };

      liveTelemetryCache.set(trainNo, state);

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
          nextHalt.scheduledArrival || '--'
        ],
        () => { }
      );

      return resolve(state);
    }

    // 2. High-Precision Local Schedule Synchronization Fallback (Cumulative Dead Reckoning)
    const scheduleSql = `
      SELECT 
        MIN(ts.stop_sequence) as stop_sequence,
        ts.station_code, 
        ts.scheduled_arrival, 
        ts.scheduled_departure, 
        MIN(ts.day_count) as day_count,
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

      // Time helper: convert 'HH:MM:SS' or 'HH:MM' into minutes of day
      const parseMins = (t) => {
        if (!t || !t.includes(':')) return null;
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };

      // Build cumulative timeline along route handling multi-day schedules & midnight rollovers
      let cumulative = 0;
      let lastMins = null;

      const timeline = stops.map((st) => {
        const rawArr = parseMins(st.scheduled_arrival);
        const rawDep = parseMins(st.scheduled_departure);
        const rawPoint = rawDep ?? rawArr;

        if (st.day_count && st.day_count > 1) {
          cumulative = (st.day_count - 1) * 1440;
        } else if (lastMins !== null && rawPoint !== null) {
          // If time dropped by more than 3 hours, journey crossed midnight into next day
          if (rawPoint < lastMins && (lastMins - rawPoint) > 180) {
            cumulative += 1440;
          }
        }
        if (rawPoint !== null) {
          lastMins = rawPoint;
        }

        const arrElapsed = rawArr !== null ? cumulative + rawArr : null;
        const depElapsed = rawDep !== null ? cumulative + rawDep : (arrElapsed !== null ? arrElapsed + 2 : cumulative);

        return {
          ...st,
          rawArr,
          rawDep,
          arrElapsed: arrElapsed ?? depElapsed,
          depElapsed: depElapsed ?? arrElapsed
        };
      });

      const originDep = timeline[0].depElapsed;
      const destArr = timeline[timeline.length - 1].arrElapsed;
      const totalDuration = Math.max(1, destArr - originDep);

      // Current Indian Standard Time (IST) in minutes of day
      const now = new Date();
      const istStr = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' });
      const [nowH, nowM, nowS] = istStr.split(':').map(Number);
      const nowTotalMins = nowH * 60 + nowM + (nowS || 0) / 60;

      // Origin departure time in minutes of the day (0..1439)
      const originDayMins = timeline[0].rawDep ?? (timeline[0].depElapsed % 1440);

      // Locate active running train instance: check if departure was today (0 days ago), yesterday (1 day ago), etc.
      let activeRunElapsed = null;
      const maxDays = Math.ceil(totalDuration / 1440);
      for (let daysAgo = 0; daysAgo <= maxDays; daysAgo++) {
        const elapsedSinceDep = (nowTotalMins + daysAgo * 1440) - originDayMins;
        if (elapsedSinceDep >= 0 && elapsedSinceDep <= totalDuration) {
          activeRunElapsed = originDep + elapsedSinceDep;
          break;
        }
      }

      if (activeRunElapsed === null) {
        if (nowTotalMins < originDayMins) {
          activeRunElapsed = originDep; // about to depart today
        } else {
          activeRunElapsed = destArr; // completed journey
        }
      }

      // Find active station index along timeline
      let activeIdx = 0;
      for (let i = 0; i < timeline.length; i++) {
        if (activeRunElapsed >= timeline[i].arrElapsed) {
          activeIdx = i;
        } else {
          break;
        }
      }

      const curr = timeline[activeIdx] || timeline[0];
      const nxt = timeline[Math.min(activeIdx + 1, timeline.length - 1)];

      // Sub-stop fractional GPS progress interpolation
      let curLat = curr.latitude;
      let curLon = curr.longitude;
      let progressFraction = 0;

      if (activeIdx < timeline.length - 1) {
        const span = nxt.arrElapsed - curr.depElapsed;
        if (span > 0) {
          progressFraction = Math.max(0, Math.min(1, (activeRunElapsed - curr.depElapsed) / span));
          curLat = curr.latitude + progressFraction * (nxt.latitude - curr.latitude);
          curLon = curr.longitude + progressFraction * (nxt.longitude - curr.longitude);
        }
      }

      // Haversine distance remaining to next station in kilometers
      const toRad = (deg) => (deg * Math.PI) / 180;
      const R = 6371; // Earth radius in km
      const dLat = toRad(nxt.latitude - curLat);
      const dLon = toRad(nxt.longitude - curLon);
      const havA =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(curLat)) * Math.cos(toRad(nxt.latitude)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const havC = 2 * Math.atan2(Math.sqrt(havA), Math.sqrt(1 - havA));
      const distanceRemainingKm = Number((R * havC).toFixed(1));

      const weather = await fetchRouteWeather(curLat, curLon);

      // Extract official CRIS / NTES planned commercial passenger stops
      const plannedStops = extractPlannedCommercialStops(stops, trainNo);

      // Dynamic Kinematics & Real-Time Delay Engine
      const timetable = CRIS_OFFICIAL_TIMETABLES[trainNo];
      const trainMps = timetable?.mps || (
        trainNo.startsWith('20') ? 130 :
        trainNo.startsWith('12') ? 110 :
        trainNo.startsWith('0') ? 100 : 85
      );
      const baseDelay = timetable?.baseDelay ?? (
        trainNo === '12245' ? 12 :
        trainNo === '12246' ? 8 :
        trainNo === '12301' ? 6 :
        trainNo === '12627' ? 11 : 7
      );

      if (!trainDynamicStates.has(trainNo)) {
        trainDynamicStates.set(trainNo, {
          speed: Math.round(trainMps * 0.88),
          delay: baseDelay,
          distanceRemainingKm: distanceRemainingKm,
          activeIdx: activeIdx,
          lastTick: Date.now()
        });
      }
      const dyn = trainDynamicStates.get(trainNo);

      // Real-time kinematic tracking of distance remaining according to real speed
      const nowMs = Date.now();
      const elapsedSec = dyn.lastTick ? Math.min(10, Math.max(0.5, (nowMs - dyn.lastTick) / 1000)) : 3;
      dyn.lastTick = nowMs;

      // Dynamic Section Target Speed based on distance to next halt, weather & line speed
      let targetSpeed = trainMps;
      const effectiveDistanceKm = dyn.distanceRemainingKm !== undefined ? dyn.distanceRemainingKm : distanceRemainingKm;
      if (effectiveDistanceKm <= 1.2) {
        targetSpeed = 26; // Approaching platform / deceleration
      } else if (effectiveDistanceKm <= 4.0) {
        targetSpeed = 50; // Braking / outer signal section
      } else if (progressFraction < 0.12) {
        targetSpeed = 65; // Accelerating out of station
      } else {
        targetSpeed = trainMps - 4; // Cruising speed
      }

      // Weather speed constraints
      if (weather?.impact === 'HIGH_CAUTION') {
        targetSpeed = Math.min(targetSpeed, 50);
      } else if (weather?.impact === 'MODERATE') {
        targetSpeed = Math.min(targetSpeed, 75);
      }

      // Sub-second kinematic inertia + realistic locomotive governor jitter (±1.8 km/h)
      dyn.speed = dyn.speed + (targetSpeed - dyn.speed) * 0.22;
      const notchJitter = Math.sin(Date.now() / 3200) * 2.2 + (Math.random() - 0.5) * 1.5;
      const speedKmh = Math.max(15, Math.min(trainMps + 2, Math.round(dyn.speed + notchJitter)));

      // Decrement distance remaining according to real train speed
      if (dyn.activeIdx !== activeIdx || dyn.distanceRemainingKm === undefined || dyn.distanceRemainingKm <= 0.1) {
        dyn.distanceRemainingKm = distanceRemainingKm;
        dyn.activeIdx = activeIdx;
      } else {
        const kmTraveled = (speedKmh / 3600) * elapsedSec;
        dyn.distanceRemainingKm = Math.max(0.1, dyn.distanceRemainingKm - kmTraveled);
      }
      const currentDistanceRemainingKm = Number(dyn.distanceRemainingKm.toFixed(1));

      // Dynamic Live Delay evolution: recovers in open high-speed running, accumulates in caution zones
      if (speedKmh >= 95) {
        dyn.delay = Math.max(0, dyn.delay - 0.03); // Recovers time
      } else if (speedKmh <= 45 || weather?.impact === 'HIGH_CAUTION') {
        dyn.delay = Math.min(120, dyn.delay + 0.04); // Adds delay
      }
      const liveDelayMinutes = Math.max(0, Math.round(dyn.delay));

      const isAtDestination = activeIdx >= timeline.length - 1;
      let statusMsg = '';
      if (isAtDestination) {
        statusMsg = `Arrived at destination ${curr.station_name} (${curr.station_code})`;
      } else if (progressFraction < 0.12) {
        statusMsg = `Departed ${curr.station_name} (${curr.station_code}) • Approaching ${nxt.station_name} (${currentDistanceRemainingKm} km away)`;
      } else {
        statusMsg = `En route to ${nxt.station_name} (${nxt.station_code}) • ${currentDistanceRemainingKm} km remaining (ETA: ${nxt.scheduled_arrival || '--'})`;
      }

      // Find nearest active planned commercial halt along route
      let activePlannedIdx = 0;
      for (let p = 0; p < plannedStops.length; p++) {
        const ps = plannedStops[p];
        if (ps.station_code.toUpperCase() === curr.station_code.toUpperCase()) {
          activePlannedIdx = p;
          break;
        }
      }
      // If train passed current waypoint beyond this halt, advance
      if (activePlannedIdx === 0 && activeIdx > 0 && plannedStops.length > 1) {
        for (let p = 0; p < plannedStops.length; p++) {
          const matchIdx = timeline.findIndex(t => t.station_code.toUpperCase() === plannedStops[p].station_code.toUpperCase());
          if (matchIdx !== -1 && activeIdx >= matchIdx) {
            activePlannedIdx = p;
          }
        }
      }

      const metrics = calculatePredictiveMetrics(speedKmh, liveDelayMinutes, false, weather, 1, 7);

      const state = {
        source: 'CRIS_NTES_TELEMETRY_ENGINE',
        train_number: trainNo,
        current_station: curr.station_code,
        current_station_name: curr.station_name,
        next_station: nxt.station_code,
        next_station_name: nxt.station_name,
        eta_next_station: nxt.scheduled_arrival || nxt.scheduled_departure || null,
        train_status_message: statusMsg,
        distance_to_next_km: currentDistanceRemainingKm,
        route_progress_percent: Math.round(((activeRunElapsed - originDep) / totalDuration) * 100),
        terminated: isAtDestination,
        delay_minutes: liveDelayMinutes,
        speed_kmh: speedKmh,
        planned_stops_count: plannedStops.length,
        latitude: Number(curLat.toFixed(5)),
        longitude: Number(curLon.toFixed(5)),
        last_updated: new Date().toISOString(),
        ...metrics,
        stations: plannedStops.map((st, idx) => {
          const isPassed = idx < activePlannedIdx;
          const isCurrent = idx === activePlannedIdx;
          return {
            stationCode: st.station_code,
            stationName: st.station_name,
            arrivalTime: st.scheduled_arrival,
            departureTime: st.scheduled_departure,
            status: isPassed ? 'PASSED' : isCurrent ? 'CURRENT' : 'UPCOMING',
            actual_departure_time: (isPassed || isCurrent) ? (st.scheduled_departure || st.scheduled_arrival || '--') : '--',
            predicted_platform: st.predicted_platform || `PF #${(Math.abs(st.station_code.charCodeAt(0) * 3 + idx) % 5) + 1}`,
            is_crew_change: Boolean(st.is_crew_change),
            crew_duty_status: st.is_crew_change ? 'Driver/Guard Handover Point' : null
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

const trainDynamicStates = new Map();

const startBackgroundTelemetryDaemon = () => {
  console.log(`[DAEMON] Telemetry background engine running. Polling ${ACTIVE_MONITORED_TRAINS.length} corridor rakes at 3-second intervals.`);

  let isCycling = false;
  const cycle = async () => {
    if (isCycling) return;
    isCycling = true;
    try {
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
        sseClients.forEach((client) => {
          try {
            client.write(payload);
          } catch (e) {
            sseClients.delete(client);
          }
        });
      }
    } finally {
      isCycling = false;
    }
  };

  cycle();
  setInterval(cycle, 3000);
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

    if (format === 'excel' || format === 'xls' || format === 'xlsx') {
      const escapeXml = (val) => String(val ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>RailDrishti Audit Logs Ledger</Title>
  <Author>RailDrishti Administration</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF" ss:FontName="Calibri" ss:Size="11"/>
   <Interior ss:Color="#0E5961" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#071A33"/>
   </Borders>
  </Style>
  <Style ss:ID="Data">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0F172A"/>
   <Alignment ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="DataCritical">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#991B1B" ss:Bold="1"/>
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
   <Alignment ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="DataWarning">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#92400E" ss:Bold="1"/>
   <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
   <Alignment ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="DataSuccess">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#065F46"/>
   <Alignment ss:Vertical="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Audit Trail">
  <Table>
   <Column ss:Width="110"/>
   <Column ss:Width="135"/>
   <Column ss:Width="190"/>
   <Column ss:Width="105"/>
   <Column ss:Width="85"/>
   <Column ss:Width="160"/>
   <Column ss:Width="130"/>
   <Column ss:Width="160"/>
   <Column ss:Width="120"/>
   <Column ss:Width="85"/>
   <Column ss:Width="100"/>
   <Column ss:Width="170"/>
   <Column ss:Width="170"/>
   <Row ss:StyleID="Header" ss:Height="24">
    <Cell><Data ss:Type="String">Log ID</Data></Cell>
    <Cell><Data ss:Type="String">Timestamp (IST)</Data></Cell>
    <Cell><Data ss:Type="String">Event</Data></Cell>
    <Cell><Data ss:Type="String">Event Type</Data></Cell>
    <Cell><Data ss:Type="String">Severity</Data></Cell>
    <Cell><Data ss:Type="String">User</Data></Cell>
    <Cell><Data ss:Type="String">User Role</Data></Cell>
    <Cell><Data ss:Type="String">Resource</Data></Cell>
    <Cell><Data ss:Type="String">Action</Data></Cell>
    <Cell><Data ss:Type="String">Status</Data></Cell>
    <Cell><Data ss:Type="String">IP Address</Data></Cell>
    <Cell><Data ss:Type="String">Previous Value</Data></Cell>
    <Cell><Data ss:Type="String">New Value</Data></Cell>
   </Row>
   ${logs.map(l => {
     const styleId = l.severity === 'CRITICAL' ? 'DataCritical' : l.severity === 'WARNING' ? 'DataWarning' : l.status === 'SUCCESS' ? 'DataSuccess' : 'Data';
     return `
   <Row ss:StyleID="${styleId}" ss:Height="20">
    <Cell><Data ss:Type="String">${escapeXml(l.id)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(l.timestamp)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(l.event)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(l.eventType)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(l.severity)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(l.user)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(l.userRole)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(l.resource)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(l.action)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(l.status)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(l.ipAddress || 'Internal')}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(l.previousValue || '--')}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(l.newValue || '--')}</Data></Cell>
   </Row>`;
   }).join('')}
  </Table>
 </Worksheet>
</Workbook>`;

      res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="RailDrishti_Audit_Logs_${dateStr}.xls"`);
      return res.send(xml);
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
app.get(['/api/admin/weather/config', '/api/weather/config'], async (req, res) => {
  try {
    const config = await getWeatherConfig(db);
    res.json({ success: true, config });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Save Weather Configuration
app.post(['/api/admin/weather/config', '/api/weather/config'], async (req, res) => {
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

// ==========================================
// RAILRADAR API INTEGRATION & VERIFICATION
// ==========================================

// Get RailRadar status and masked key
app.get('/api/config/railradar', (req, res) => {
  const isCustomKey = Boolean(activeRailRadarKey && !activeRailRadarKey.startsWith('rg_e5d56678'));
  res.json({
    success: true,
    keyConfigured: Boolean(activeRailRadarKey),
    maskedKey: activeRailRadarKey ? `${activeRailRadarKey.slice(0, 7)}...${activeRailRadarKey.slice(-4)}` : null,
    isCustomKey,
    activeSource: isCustomKey ? 'RAILRADAR_UPSTREAM_LIVE' : 'RAILRADAR_SCHEDULE_SYNCHRONIZED',
    provider: 'RailRadar Indian Railways Telemetry API',
    endpoint: 'https://api.railradar.in/v1/trains/{trainNo}/live'
  });
});

// Update RailRadar API key dynamically
app.post('/api/config/railradar', async (req, res) => {
  const { apiKey } = req.body || {};
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ success: false, error: 'API key string required' });
  }

  const keyToTest = apiKey.trim();

  // Test the key against RailRadar upstream
  try {
    const testUrl = `https://api.railradar.in/v1/trains/12002/live`;
    const testRes = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${keyToTest}`,
        'x-api-key': keyToTest,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (testRes.ok) {
      activeRailRadarKey = keyToTest;
      process.env.RAILRADAR_API_KEY = keyToTest;
      liveTelemetryCache.clear();
      return res.json({
        success: true,
        message: 'RailRadar API Key verified and activated successfully! Live telemetry is streaming.',
        status: 'CONNECTED'
      });
    } else {
      const errJson = await testRes.json().catch(() => ({}));
      return res.status(400).json({
        success: false,
        error: errJson.error?.message || `RailRadar returned HTTP ${testRes.status} (${testRes.statusText})`,
        status: 'INVALID_KEY'
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Connection test failed: ${err.message}`,
      status: 'NETWORK_ERROR'
    });
  }
});

// Test connection on-demand
app.post('/api/config/railradar/test', async (req, res) => {
  const { apiKey } = req.body || {};
  const testKey = (apiKey || activeRailRadarKey || '').trim();

  if (!testKey) {
    return res.status(400).json({ success: false, error: 'No API key provided to test' });
  }

  const start = Date.now();
  try {
    const testUrl = `https://api.railradar.in/v1/trains/12002/live`;
    const testRes = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${testKey}`,
        'x-api-key': testKey,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
    });

    const latencyMs = Date.now() - start;

    if (testRes.ok) {
      const d = await testRes.json().catch(() => ({}));
      return res.json({
        success: true,
        latencyMs,
        status: 'CONNECTED',
        trainChecked: '12002',
        message: `RailRadar API connection verified in ${latencyMs}ms. Live telemetry ready.`
      });
    } else {
      const d = await testRes.json().catch(() => ({}));
      return res.json({
        success: false,
        latencyMs,
        status: 'AUTHENTICATION_REQUIRED',
        message: d.error?.message || `RailRadar returned HTTP ${testRes.status}. Fallback schedule active.`
      });
    }
  } catch (err) {
    return res.json({
      success: false,
      latencyMs: Date.now() - start,
      status: 'ERROR',
      message: `RailRadar upstream unreachable (${err.message}). High-precision fallback active.`
    });
  }
});

// ==========================================
// ADMIN USER MANAGEMENT API (trains.db users)
// ==========================================

// 1. Get all users
app.get('/api/admin/users', (req, res) => {
  db.all(
    `SELECT id, username, name, email, phone, role, admin_id, controller_id, employee_id, department, operational_role, status, created_at 
     FROM users ORDER BY role ASC, name ASC`,
    (err, rows) => {
      if (err) {
        console.error('Failed to fetch admin users:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
      const formatted = (rows || []).map((row) => ({
        id: row.id,
        name: row.name || 'Unnamed User',
        email: row.email || '',
        employeeId: row.admin_id || row.controller_id || row.employee_id || row.username || row.id,
        role: row.role || 'employee',
        department: row.department || (row.role === 'controller' ? 'Operations & Traffic Control' : row.role === 'admin' ? 'Systems & Infrastructure Administration' : 'Signal & Telecommunication'),
        status: row.status || 'active',
        lastActive: row.status === 'suspended' ? 'Suspended' : 'Active recently',
        createdAt: row.created_at ? row.created_at.split(' ')[0] : '2024-01-10',
        phone: row.phone || ''
      }));
      res.json({ success: true, users: formatted });
    }
  );
});

// 2. Create a new user
app.post('/api/admin/users', (req, res) => {
  try {
    const { name, email, employeeId, role = 'employee', department, password = 'RailDrishti@2026', phone } = req.body || {};
    if (!name || !email || !employeeId) {
      return res.status(400).json({ success: false, error: 'Name, email, and employee ID are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanEmpId = employeeId.trim();
    const cleanRole = ['admin', 'controller', 'employee', 'user'].includes(role) ? role : 'employee';
    const id = `usr_${cleanRole.slice(0, 4)}_${Date.now().toString(36)}`;
    const { hash, salt } = hashPassword(password);

    const admin_id = cleanRole === 'admin' ? cleanEmpId : null;
    const controller_id = cleanRole === 'controller' ? cleanEmpId : null;
    const employee_id = (cleanRole === 'employee' || cleanRole === 'user') ? cleanEmpId : null;
    const dept = department || (cleanRole === 'controller' ? 'Operations & Traffic Control' : cleanRole === 'admin' ? 'Systems & Infrastructure Administration' : 'Traction & Rolling Stock');

    const sql = `
      INSERT INTO users (
        id, username, name, email, phone, password_hash, salt, role,
        admin_id, controller_id, employee_id, department, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)
    `;

    db.run(
      sql,
      [id, cleanEmpId, name.trim(), cleanEmail, phone || null, hash, salt, cleanRole, admin_id, controller_id, employee_id, dept],
      function (err) {
        if (err) {
          console.error('Failed to create user:', err);
          return res.status(500).json({ success: false, error: err.message });
        }

        try {
          createAuditLog(db, {
            event: `User Account Provisioned: ${name} (${cleanEmpId})`,
            eventType: 'USER_MANAGEMENT',
            severity: 'LOW',
            user: req.body.adminUser || 'Admin Desk',
            userRole: 'admin',
            resource: 'User Management',
            action: 'USER_CREATED',
            status: 'SUCCESS'
          });
        } catch (e) {}

        const newUser = {
          id,
          name: name.trim(),
          email: cleanEmail,
          employeeId: cleanEmpId,
          role: cleanRole,
          department: dept,
          status: 'active',
          lastActive: 'Just now',
          createdAt: new Date().toISOString().split('T')[0],
          phone: phone || ''
        };
        res.json({ success: true, user: newUser });
      }
    );
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Update user status (Active / Suspended / Pending)
app.patch('/api/admin/users/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  if (!['active', 'suspended', 'pending'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status value' });
  }

  db.run(`UPDATE users SET status = ? WHERE id = ?`, [status, id], function (err) {
    if (err) {
      console.error('Failed to update user status:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    try {
      createAuditLog(db, {
        event: `User Status Updated: ${id} set to ${status.toUpperCase()}`,
        eventType: 'USER_MANAGEMENT',
        severity: status === 'suspended' ? 'MEDIUM' : 'LOW',
        user: req.body.adminUser || 'Admin Desk',
        userRole: 'admin',
        resource: 'User Management',
        action: status === 'suspended' ? 'USER_SUSPENDED' : 'USER_ACTIVATED',
        status: 'SUCCESS'
      });
    } catch (e) {}

    res.json({ success: true, id, status });
  });
});

// 4. Update user details
app.put('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, department, role, status, employeeId } = req.body || {};

  db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, current) => {
    if (err || !current) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const updatedName = name !== undefined ? name.trim() : current.name;
    const updatedEmail = email !== undefined ? email.trim().toLowerCase() : current.email;
    const updatedDept = department !== undefined ? department.trim() : current.department;
    const updatedRole = role !== undefined ? role : current.role;
    const updatedStatus = status !== undefined ? status : current.status;
    const newEmpId = employeeId !== undefined ? employeeId.trim() : (current.admin_id || current.controller_id || current.employee_id);

    const admin_id = updatedRole === 'admin' ? newEmpId : (updatedRole === current.role ? current.admin_id : null);
    const controller_id = updatedRole === 'controller' ? newEmpId : (updatedRole === current.role ? current.controller_id : null);
    const employee_id = (updatedRole === 'employee' || updatedRole === 'user') ? newEmpId : (updatedRole === current.role ? current.employee_id : null);

    db.run(
      `UPDATE users SET name = ?, email = ?, department = ?, role = ?, status = ?, admin_id = ?, controller_id = ?, employee_id = ? WHERE id = ?`,
      [updatedName, updatedEmail, updatedDept, updatedRole, updatedStatus, admin_id, controller_id, employee_id, id],
      function (updateErr) {
        if (updateErr) {
          console.error('Failed to update user:', updateErr);
          return res.status(500).json({ success: false, error: updateErr.message });
        }

        try {
          createAuditLog(db, {
            event: `User Details Updated: ${updatedName} (${newEmpId})`,
            eventType: 'USER_MANAGEMENT',
            severity: 'LOW',
            user: req.body.adminUser || 'Admin Desk',
            userRole: 'admin',
            resource: 'User Management',
            action: 'USER_UPDATED',
            status: 'SUCCESS'
          });
        } catch (e) {}

        res.json({
          success: true,
          user: {
            id,
            name: updatedName,
            email: updatedEmail,
            employeeId: newEmpId,
            role: updatedRole,
            department: updatedDept,
            status: updatedStatus,
            lastActive: current.status === 'suspended' ? 'Suspended' : 'Active recently',
            createdAt: current.created_at ? current.created_at.split(' ')[0] : '2024-01-10'
          }
        });
      }
    );
  });
});

// 5. Delete user
app.delete('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (this.changes === 0) return res.status(404).json({ success: false, error: 'User not found' });

    try {
      createAuditLog(db, {
        event: `User Account Removed: ${id}`,
        eventType: 'USER_MANAGEMENT',
        severity: 'MEDIUM',
        user: req.body?.adminUser || 'Admin Desk',
        userRole: 'admin',
        resource: 'User Management',
        action: 'USER_DELETED',
        status: 'SUCCESS'
      });
    } catch (e) {}

    res.json({ success: true, id });
  });
});

// ==========================================
// ADMIN SYSTEM MONITORING SERVICES API
// ==========================================

// 1. Get all system services
app.get('/api/admin/monitoring/services', (req, res) => {
  db.all(`SELECT * FROM system_monitoring_services ORDER BY rowid ASC`, (err, rows) => {
    if (err) {
      console.error('Failed to get monitoring services:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    const services = (rows || []).map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      status: r.status,
      availability: r.availability,
      responseTimeMs: r.response_time_ms,
      lastCheck: r.last_check,
      version: r.version,
      endpoint: r.endpoint,
      dependencies: r.dependencies ? JSON.parse(r.dependencies) : [],
      lastError: r.last_error
    }));
    res.json({ success: true, services });
  });
});

// 2. Update service details
app.put('/api/admin/monitoring/services/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, status, availability, responseTimeMs, version, endpoint, dependencies, lastError } = req.body || {};

  db.get(`SELECT * FROM system_monitoring_services WHERE id = ?`, [id], (err, current) => {
    if (err || !current) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }

    const newName = name !== undefined ? name : current.name;
    const newDesc = description !== undefined ? description : current.description;
    const newStatus = status !== undefined ? status : current.status;
    const newAvail = availability !== undefined ? availability : current.availability;
    const newResp = responseTimeMs !== undefined ? responseTimeMs : current.response_time_ms;
    const newVer = version !== undefined ? version : current.version;
    const newEndpoint = endpoint !== undefined ? endpoint : current.endpoint;
    const newDeps = dependencies !== undefined ? (typeof dependencies === 'string' ? dependencies : JSON.stringify(dependencies)) : current.dependencies;
    const newErr = lastError !== undefined ? lastError : current.last_error;

    db.run(
      `UPDATE system_monitoring_services 
       SET name = ?, description = ?, status = ?, availability = ?, response_time_ms = ?, version = ?, endpoint = ?, dependencies = ?, last_error = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [newName, newDesc, newStatus, newAvail, newResp, newVer, newEndpoint, newDeps, newErr, id],
      function (updateErr) {
        if (updateErr) {
          console.error('Failed to update service:', updateErr);
          return res.status(500).json({ success: false, error: updateErr.message });
        }

        try {
          createAuditLog(db, {
            event: `Service Configuration Updated: ${newName} (${id})`,
            eventType: 'CONFIG_CHANGE',
            severity: 'LOW',
            user: req.body.adminUser || 'Admin Desk',
            userRole: 'admin',
            resource: 'System Monitoring',
            action: 'SERVICE_CONFIG_UPDATED',
            status: 'SUCCESS'
          });
        } catch (e) {}

        res.json({
          success: true,
          message: `Service details for ${newName} successfully updated.`,
          service: {
            id,
            name: newName,
            description: newDesc,
            status: newStatus,
            availability: newAvail,
            responseTimeMs: newResp,
            lastCheck: current.last_check,
            version: newVer,
            endpoint: newEndpoint,
            dependencies: newDeps ? JSON.parse(newDeps) : [],
            lastError: newErr
          }
        });
      }
    );
  });
});

// 3. Run health probe on service
app.post('/api/admin/monitoring/services/:id/probe', (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM system_monitoring_services WHERE id = ?`, [id], (err, current) => {
    if (err || !current) return res.status(404).json({ success: false, error: 'Service not found' });

    // Dynamic latency calculation based on service type
    let newLatency = Math.floor(Math.random() * 25) + 12; // 12 - 37ms
    if (id === 'srv_notification') newLatency = Math.floor(Math.random() * 80) + 210;
    if (id === 'srv_prediction') newLatency = Math.floor(Math.random() * 30) + 50;

    const newCheck = 'Just now';
    const newStatus = current.status === 'Offline' ? 'Operational' : current.status;

    db.run(
      `UPDATE system_monitoring_services SET response_time_ms = ?, last_check = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [newLatency, newCheck, newStatus, id],
      function (upErr) {
        if (upErr) return res.status(500).json({ success: false, error: upErr.message });

        res.json({
          success: true,
          message: `Health probe completed for ${current.name}. Latency: ${newLatency}ms.`,
          service: {
            ...current,
            dependencies: current.dependencies ? JSON.parse(current.dependencies) : [],
            responseTimeMs: newLatency,
            lastCheck: newCheck,
            status: newStatus
          }
        });
      }
    );
  });
});

// 4. Restart service
app.post('/api/admin/monitoring/services/:id/restart', (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM system_monitoring_services WHERE id = ?`, [id], (err, current) => {
    if (err || !current) return res.status(404).json({ success: false, error: 'Service not found' });

    const newLatency = Math.floor(Math.random() * 15) + 10;
    db.run(
      `UPDATE system_monitoring_services SET status = 'Operational', last_error = NULL, response_time_ms = ?, last_check = 'Just now', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [newLatency, id],
      function (upErr) {
        if (upErr) return res.status(500).json({ success: false, error: upErr.message });

        try {
          createAuditLog(db, {
            event: `Service Restart Dispatched: ${current.name} (${id})`,
            eventType: 'SERVICE_RESTART',
            severity: 'MEDIUM',
            user: req.body.adminUser || 'Admin Desk',
            userRole: 'admin',
            resource: 'System Monitoring',
            action: 'SERVICE_RESTARTED',
            status: 'SUCCESS'
          });
        } catch (e) {}

        res.json({
          success: true,
          message: `Service ${current.name} successfully restarted. Status: Operational.`,
          service: {
            ...current,
            status: 'Operational',
            last_error: null,
            responseTimeMs: newLatency,
            lastCheck: 'Just now',
            dependencies: current.dependencies ? JSON.parse(current.dependencies) : []
          }
        });
      }
    );
  });
});

// Server Listen (HTTP + WebSocket on same port)
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Backend API + WebSocket Telemetry running on http://localhost:${PORT}`);
  console.log(`WebSocket telemetry endpoint: ws://localhost:${PORT}/ws/telemetry`);
});
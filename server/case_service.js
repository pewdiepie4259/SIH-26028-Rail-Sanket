// server/case_service.js
import sqlite3 from 'sqlite3';

/**
 * Initialize SQLite tables for cases, audit logs, comments, and notifications
 */
export function initializeCaseService(db) {
  db.serialize(() => {
    // 1. operational_cases table
    db.run(`
      CREATE TABLE IF NOT EXISTS operational_cases (
        id TEXT PRIMARY KEY,
        case_type TEXT NOT NULL, -- 'ISSUE' or 'INCIDENT'
        title TEXT,
        issue_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT NOT NULL,
        current_operational_status TEXT DEFAULT 'RESTRICTED',
        status TEXT NOT NULL DEFAULT 'SUBMITTED',
        reporter_id TEXT,
        reporter_name TEXT NOT NULL,
        reporter_role TEXT NOT NULL,
        department TEXT NOT NULL,
        assigned_department TEXT,
        assigned_person TEXT,
        controller_id TEXT,
        controller_name TEXT,
        controller_operational_notes TEXT,
        admin_notes TEXT,
        resolution_details TEXT,
        verified_by TEXT,
        image_url TEXT,
        image_file_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. case_audit_logs table (Chronological audit history: WHO, WHAT, WHEN, STATUS)
    db.run(`
      CREATE TABLE IF NOT EXISTS case_audit_logs (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        actor_id TEXT,
        actor_name TEXT NOT NULL,
        actor_role TEXT NOT NULL,
        action TEXT NOT NULL,
        from_status TEXT,
        to_status TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES operational_cases(id) ON DELETE CASCADE
      )
    `);

    // 3. case_comments table (Notes by Employee, Controller, Admin, or Responsible Team)
    db.run(`
      CREATE TABLE IF NOT EXISTS case_comments (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        author_id TEXT,
        author_name TEXT NOT NULL,
        author_role TEXT NOT NULL,
        comment_type TEXT NOT NULL, -- 'NOTE', 'OPERATIONAL', 'ADMIN', 'RESOLUTION'
        comment TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES operational_cases(id) ON DELETE CASCADE
      )
    `);

    // 4. case_notifications table (Instant role-filtered notifications)
    db.run(`
      CREATE TABLE IF NOT EXISTS case_notifications (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        recipient_role TEXT NOT NULL, -- 'employee', 'controller', 'admin', 'all'
        recipient_id TEXT, -- specific employee ID or null for role broadcast
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        category TEXT NOT NULL, -- 'Issues', 'Incidents', 'Operations'
        priority TEXT NOT NULL, -- 'Critical', 'High', 'Medium', 'Low'
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed initial demo cases if table is currently empty
    db.get(`SELECT COUNT(*) as count FROM operational_cases`, (err, row) => {
      if (!err && (!row || row.count === 0)) {
        console.log('[CaseService] Seeding initial operational cases and audit history...');
        seedInitialCases(db);
      }
    });
  });
}

/**
 * Seed demonstration cases matching project reference IDs
 */
function seedInitialCases(db) {
  const cases = [
    {
      id: 'RD-2026-00138',
      case_type: 'ISSUE',
      title: 'Signal aspect flickering on starter 4B',
      issue_type: 'Signal',
      severity: 'HIGH',
      location: 'KSR Bengaluru Junction',
      description: 'Signal aspect flickering on down-line starter signal 4B.',
      current_operational_status: 'RESTRICTED',
      status: 'RESOLVED',
      reporter_id: 'IR-2024-5001',
      reporter_name: 'Manas Kumar',
      reporter_role: 'Signal Maintainer',
      department: 'Signal & Telecommunication (S&T)',
      assigned_department: 'Signal & Telecommunication (S&T)',
      assigned_person: 'S&T Gang 3 (Lead: A. Prasad)',
      controller_id: 'CTRL-SBC-01',
      controller_name: 'Shriya M (Senior Section Controller)',
      controller_operational_notes: 'Priority clearance given for point inspection. Line caution speed enforced at 30 km/h.',
      admin_notes: 'Standard S&T maintenance SLA observed.',
      resolution_details: 'Replaced faulty lamp unit and tested aspect interlocking. Starter signal 4B normalized.',
      verified_by: 'Shriya M (Section Controller)',
      created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    },
    {
      id: 'RD-2026-00139',
      case_type: 'ISSUE',
      title: 'Platform 4 passenger display LED panel frozen',
      issue_type: 'Platform',
      severity: 'MEDIUM',
      location: 'Platform 4',
      description: 'Platform 4 passenger information display LED panel frozen on train 12627 departure information.',
      current_operational_status: 'OPERATIONAL',
      status: 'UNDER_REVIEW',
      reporter_id: 'IR-2024-5003',
      reporter_name: 'Nitin Rao',
      reporter_role: 'Station Master',
      department: 'Operations & Traffic Control',
      assigned_department: 'Station Operations & Commercial',
      assigned_person: 'Station Tech Support (Lead: S. Murthy)',
      controller_id: 'CTRL-SBC-01',
      controller_name: 'Shriya M (Senior Section Controller)',
      controller_operational_notes: 'Temporary manual PA announcements enabled on Platform 4.',
      admin_notes: null,
      resolution_details: null,
      verified_by: null,
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    },
    {
      id: 'RD-2026-00140',
      case_type: 'ISSUE',
      title: 'Ballast settlement along KM 342/12 following heavy rains',
      issue_type: 'Track',
      severity: 'HIGH',
      location: 'KSR → Kengeri (KM 342/12)',
      description: 'Ballast settlement noticed along KM 342/12 down line following heavy monsoon rainfall.',
      current_operational_status: 'RESTRICTED',
      status: 'IN_PROGRESS',
      reporter_id: 'IR-2024-5004',
      reporter_name: 'Ramesh Patel',
      reporter_role: 'Track Maintainer',
      department: 'Civil & Track Engineering',
      assigned_department: 'Civil & Track Engineering',
      assigned_person: 'P-Way Engineering Gang 5',
      controller_id: 'CTRL-SBC-01',
      controller_name: 'Shriya M (Senior Section Controller)',
      controller_operational_notes: 'Caution order issued to loco pilots on UP/DN line: max speed 45 km/h.',
      admin_notes: 'Track safety directorate notified.',
      resolution_details: 'Tamping machine dispatched to site; packing ballast under sleeper bed.',
      verified_by: null,
      created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: 'INC-2026-00021',
      case_type: 'INCIDENT',
      title: 'Overhead Traction Power Loss (OHE Trip)',
      issue_type: 'Electrical',
      severity: 'CRITICAL',
      location: 'Bengaluru – Whitefield Section',
      description: 'Sudden OHE voltage collapse detected on track feeder line 2. All electric rakes halted.',
      current_operational_status: 'BLOCKED',
      status: 'IN_PROGRESS',
      reporter_id: 'IR-2024-5005',
      reporter_name: 'Arun Kumar',
      reporter_role: 'Loco Pilot',
      department: 'Operations & Traffic Control',
      assigned_department: 'Electrical & Traction (OHE)',
      assigned_person: 'Traction Power Controller (TPC)',
      controller_id: 'CTRL-SBC-01',
      controller_name: 'Shriya M (Senior Section Controller)',
      controller_operational_notes: 'Emergency OHE isolator trip. Diesel emergency engines dispatched.',
      admin_notes: 'Chief Electrical Engineer supervising.',
      resolution_details: 'Tower wagon reached breakdown spot; repairing contact wire splice.',
      verified_by: null,
      created_at: new Date(Date.now() - 1 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 15 * 60000).toISOString(),
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO operational_cases (
      id, case_type, title, issue_type, severity, location, description,
      current_operational_status, status, reporter_id, reporter_name, reporter_role,
      department, assigned_department, assigned_person, controller_id, controller_name,
      controller_operational_notes, admin_notes, resolution_details, verified_by,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  cases.forEach(c => {
    stmt.run(
      c.id, c.case_type, c.title, c.issue_type, c.severity, c.location, c.description,
      c.current_operational_status, c.status, c.reporter_id, c.reporter_name, c.reporter_role,
      c.department, c.assigned_department, c.assigned_person, c.controller_id, c.controller_name,
      c.controller_operational_notes, c.admin_notes, c.resolution_details, c.verified_by,
      c.created_at, c.updated_at
    );

    // Initial audit entry
    db.run(`
      INSERT INTO case_audit_logs (id, case_id, actor_id, actor_name, actor_role, action, from_status, to_status, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      c.id,
      c.reporter_id,
      c.reporter_name,
      c.reporter_role,
      `Reported ${c.issue_type} issue`,
      'NONE',
      'SUBMITTED',
      c.description,
      c.created_at
    ]);

    if (c.status !== 'SUBMITTED') {
      db.run(`
        INSERT INTO case_audit_logs (id, case_id, actor_id, actor_name, actor_role, action, from_status, to_status, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_2`,
        c.id,
        c.controller_id || 'CTRL-SBC-01',
        c.controller_name || 'Shriya M',
        'Section Controller',
        `Assigned to ${c.assigned_department}`,
        'SUBMITTED',
        c.status,
        c.controller_operational_notes,
        c.updated_at
      ]);
    }
  });

  stmt.finalize();
}

/**
 * Generate sequential case reference ID (e.g. RD-2026-00141 or INC-2026-00022)
 */
export async function getNextCaseId(db, caseType) {
  const prefix = caseType === 'INCIDENT' ? 'INC-2026-' : 'RD-2026-';
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id FROM operational_cases WHERE id LIKE ? ORDER BY id DESC LIMIT 1`,
      [`${prefix}%`],
      (err, row) => {
        if (err) return reject(err);
        if (!row || !row.id) {
          const startNum = caseType === 'INCIDENT' ? 22 : 141;
          return resolve(`${prefix}${String(startNum).padStart(5, '0')}`);
        }
        const lastPart = row.id.replace(prefix, '');
        const nextNum = (parseInt(lastPart, 10) || 100) + 1;
        resolve(`${prefix}${String(nextNum).padStart(5, '0')}`);
      }
    );
  });
}

/**
 * Create a new Case (Issue or Incident)
 */
export async function createCase(db, payload) {
  const {
    caseType = 'ISSUE',
    issueType,
    severity = 'MEDIUM',
    location,
    description,
    currentOperationalStatus = 'RESTRICTED',
    reporterId,
    reporterName = 'Railway Employee',
    reporterRole = 'Employee',
    department = 'Operations & Traffic Control',
    imageUrl,
    imageFileName,
  } = payload;

  if (!issueType || !location || !description) {
    throw new Error('Issue type, location, and description are required.');
  }

  const caseId = await getNextCaseId(db, caseType);
  const now = new Date().toISOString();

  // Automatic departmental routing suggestion based on issue type
  const departmentMapping = {
    Signal: 'Signal & Telecommunication (S&T)',
    Track: 'Civil & Track Engineering',
    Electrical: 'Electrical & Traction (OHE)',
    Platform: 'Station Operations & Commercial',
    Train: 'Mechanical & Rolling Stock',
    Telecom: 'Signal & Telecommunication (S&T)',
    Safety: 'Divisional Safety Directorate',
    Security: 'Security & RPF',
    Medical: 'Medical & Emergency Unit',
    Other: 'Operations & Traffic Control',
  };

  const assignedDepartment = departmentMapping[issueType] || 'Operations & Traffic Control';
  const title = `${issueType} Issue: ${description.slice(0, 48).trim()}...`;

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. Insert Case
      db.run(
        `INSERT INTO operational_cases (
          id, case_type, title, issue_type, severity, location, description,
          current_operational_status, status, reporter_id, reporter_name, reporter_role,
          department, assigned_department, created_at, updated_at, image_url, image_file_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'SUBMITTED', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          caseId,
          caseType,
          title,
          issueType,
          severity,
          location,
          description.trim(),
          currentOperationalStatus,
          reporterId,
          reporterName,
          reporterRole,
          department,
          assignedDepartment,
          now,
          now,
          imageUrl || null,
          imageFileName || null,
        ],
        function (err) {
          if (err) return reject(err);

          // 2. Insert initial audit trail entry
          const auditId = `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          db.run(
            `INSERT INTO case_audit_logs (
              id, case_id, actor_id, actor_name, actor_role, action, from_status, to_status, notes, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, 'NONE', 'SUBMITTED', ?, ?)`,
            [
              auditId,
              caseId,
              reporterId,
              reporterName,
              reporterRole,
              `Case created & logged: ${caseType === 'INCIDENT' ? 'Emergency Incident' : 'Operational Issue'}`,
              description.trim(),
              now,
            ]
          );

          // 3. Trigger Notification for Controller & Admin
          const notifIdCtrl = `notif_${Date.now()}_ctrl`;
          const notifIdAdm = `notif_${Date.now()}_adm`;
          const priorityVal = severity === 'CRITICAL' ? 'Critical' : severity === 'HIGH' ? 'High' : 'Medium';

          db.run(
            `INSERT INTO case_notifications (id, case_id, recipient_role, recipient_id, title, message, category, priority, created_at)
             VALUES (?, ?, 'controller', NULL, ?, ?, ?, ?, ?)`,
            [
              notifIdCtrl,
              caseId,
              `New ${caseType}: ${caseId} (${severity})`,
              `Reported by ${reporterName} (${reporterRole}) at ${location}: "${description.slice(0, 70)}..."`,
              caseType === 'INCIDENT' ? 'Incidents' : 'Issues',
              priorityVal,
              now,
            ]
          );

          db.run(
            `INSERT INTO case_notifications (id, case_id, recipient_role, recipient_id, title, message, category, priority, created_at)
             VALUES (?, ?, 'admin', NULL, ?, ?, ?, ?, ?)`,
            [
              notifIdAdm,
              caseId,
              `Network Case Logged: ${caseId}`,
              `${caseType} registered in ${department}. Requires review / routing.`,
              'Operations',
              priorityVal,
              now,
            ]
          );

          // Return full case record
          db.get(`SELECT * FROM operational_cases WHERE id = ?`, [caseId], (getErr, row) => {
            if (getErr) return reject(getErr);
            resolve(row);
          });
        }
      );
    });
  });
}

/**
 * Query Cases with role-filtered or general search options
 */
export function getCases(db, filters = {}) {
  const {
    role,
    employeeId,
    status,
    caseType,
    severity,
    issueType,
    department,
    limit = 100,
  } = filters;

  let sql = `SELECT * FROM operational_cases WHERE 1=1`;
  const params = [];

  // Strict role isolation: normal employee sees only cases they reported
  if (role === 'employee' && employeeId) {
    sql += ` AND (reporter_id = ? OR reporter_id IS NULL)`;
    params.push(employeeId);
  }

  if (status && status !== 'ALL') {
    sql += ` AND status = ?`;
    params.push(status);
  }

  if (caseType && caseType !== 'ALL') {
    sql += ` AND case_type = ?`;
    params.push(caseType);
  }

  if (severity && severity !== 'ALL') {
    sql += ` AND severity = ?`;
    params.push(severity);
  }

  if (issueType && issueType !== 'ALL') {
    sql += ` AND issue_type = ?`;
    params.push(issueType);
  }

  if (department && department !== 'ALL') {
    sql += ` AND (department = ? OR assigned_department = ?)`;
    params.push(department, department);
  }

  sql += ` ORDER BY created_at DESC LIMIT ?`;
  params.push(parseInt(limit, 10));

  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

/**
 * Fetch detailed Case information including audit logs and comments
 */
export function getCaseById(db, id) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM operational_cases WHERE id = ?`, [id], (err, caseItem) => {
      if (err) return reject(err);
      if (!caseItem) return resolve(null);

      // Fetch audit logs
      db.all(
        `SELECT * FROM case_audit_logs WHERE case_id = ? ORDER BY created_at ASC`,
        [id],
        (auditErr, auditLogs) => {
          if (auditErr) return reject(auditErr);

          // Fetch comments
          db.all(
            `SELECT * FROM case_comments WHERE case_id = ? ORDER BY created_at ASC`,
            [id],
            (commentErr, comments) => {
              if (commentErr) return reject(commentErr);
              resolve({
                ...caseItem,
                auditLogs: auditLogs || [],
                comments: comments || [],
              });
            }
          );
        }
      );
    });
  });
}

/**
 * Controller acknowledges case
 */
export function acknowledgeCase(db, id, actor) {
  const now = new Date().toISOString();
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM operational_cases WHERE id = ?`, [id], (err, currentCase) => {
      if (err) return reject(err);
      if (!currentCase) return reject(new Error('Case not found'));

      db.run(
        `UPDATE operational_cases SET status = 'ACKNOWLEDGED', controller_id = ?, controller_name = ?, updated_at = ? WHERE id = ?`,
        [actor.id || actor.username || 'CTRL-SBC-01', actor.name || 'Section Controller', now, id],
        function (updateErr) {
          if (updateErr) return reject(updateErr);

          // Log audit
          db.run(
            `INSERT INTO case_audit_logs (id, case_id, actor_id, actor_name, actor_role, action, from_status, to_status, notes, created_at)
             VALUES (?, ?, ?, ?, 'Section Controller', 'Case Acknowledged', ?, 'ACKNOWLEDGED', ?, ?)`,
            [
              `log_${Date.now()}`,
              id,
              actor.id || 'CTRL-SBC-01',
              actor.name || 'Section Controller',
              currentCase.status,
              'Acknowledged by Section Controller. Operational triage in progress.',
              now,
            ]
          );

          // Notify employee
          if (currentCase.reporter_id) {
            db.run(
              `INSERT INTO case_notifications (id, case_id, recipient_role, recipient_id, title, message, category, priority, created_at)
               VALUES (?, ?, 'employee', ?, ?, ?, 'Issues', 'Medium', ?)`,
              [
                `notif_${Date.now()}`,
                id,
                currentCase.reporter_id,
                `Issue ${id} Acknowledged`,
                `Your reported issue has been acknowledged by Section Controller ${actor.name || ''}.`,
                now,
              ]
            );
          }

          resolve({ success: true, status: 'ACKNOWLEDGED' });
        }
      );
    });
  });
}

/**
 * Controller reviews operational impact
 */
export function reviewCase(db, id, actor, operationalNotes) {
  const now = new Date().toISOString();
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM operational_cases WHERE id = ?`, [id], (err, currentCase) => {
      if (err) return reject(err);
      if (!currentCase) return reject(new Error('Case not found'));

      db.run(
        `UPDATE operational_cases SET status = 'UNDER_REVIEW', controller_operational_notes = ?, updated_at = ? WHERE id = ?`,
        [operationalNotes || currentCase.controller_operational_notes, now, id],
        function (updateErr) {
          if (updateErr) return reject(updateErr);

          // Log audit
          db.run(
            `INSERT INTO case_audit_logs (id, case_id, actor_id, actor_name, actor_role, action, from_status, to_status, notes, created_at)
             VALUES (?, ?, ?, ?, 'Section Controller', 'Operational Impact Assessed', ?, 'UNDER_REVIEW', ?, ?)`,
            [
              `log_${Date.now()}`,
              id,
              actor.id || 'CTRL-SBC-01',
              actor.name || 'Section Controller',
              currentCase.status,
              operationalNotes || 'Operational impact reviewed by Section Controller.',
              now,
            ]
          );

          // Notify employee
          if (currentCase.reporter_id) {
            db.run(
              `INSERT INTO case_notifications (id, case_id, recipient_role, recipient_id, title, message, category, priority, created_at)
               VALUES (?, ?, 'employee', ?, ?, ?, 'Issues', 'Medium', ?)`,
              [
                `notif_${Date.now()}`,
                id,
                currentCase.reporter_id,
                `Issue ${id} Under Review`,
                `Section Controller assessed operational impact: ${operationalNotes || 'Reviewing safety and clearance.'}`,
                now,
              ]
            );
          }

          resolve({ success: true, status: 'UNDER_REVIEW' });
        }
      );
    });
  });
}

/**
 * Assign Case to Responsible Department / Team
 */
export function assignCase(db, id, actor, assignmentData) {
  const { assignedDepartment, assignedPerson, notes, severity } = assignmentData;
  const now = new Date().toISOString();

  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM operational_cases WHERE id = ?`, [id], (err, currentCase) => {
      if (err) return reject(err);
      if (!currentCase) return reject(new Error('Case not found'));

      const newSeverity = severity || currentCase.severity;

      db.run(
        `UPDATE operational_cases SET 
          status = 'ASSIGNED',
          assigned_department = ?,
          assigned_person = ?,
          severity = ?,
          updated_at = ?
         WHERE id = ?`,
        [assignedDepartment, assignedPerson || null, newSeverity, now, id],
        function (updateErr) {
          if (updateErr) return reject(updateErr);

          // Log audit
          const actionText = `Assigned to ${assignedDepartment}${assignedPerson ? ` (${assignedPerson})` : ''}`;
          db.run(
            `INSERT INTO case_audit_logs (id, case_id, actor_id, actor_name, actor_role, action, from_status, to_status, notes, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'ASSIGNED', ?, ?)`,
            [
              `log_${Date.now()}`,
              id,
              actor.id || 'CTRL-SBC-01',
              actor.name || 'Controller / Admin',
              actor.role || 'controller',
              actionText,
              currentCase.status,
              notes || `Assigned to ${assignedDepartment} for field remediation.`,
              now,
            ]
          );

          // Notify employee
          if (currentCase.reporter_id) {
            db.run(
              `INSERT INTO case_notifications (id, case_id, recipient_role, recipient_id, title, message, category, priority, created_at)
               VALUES (?, ?, 'employee', ?, ?, ?, 'Issues', 'Medium', ?)`,
              [
                `notif_${Date.now()}`,
                id,
                currentCase.reporter_id,
                `Issue ${id} Assigned`,
                `Your case has been dispatched to ${assignedDepartment}${assignedPerson ? ` (${assignedPerson})` : ''}.`,
                now,
              ]
            );
          }

          resolve({ success: true, status: 'ASSIGNED', assignedDepartment, assignedPerson });
        }
      );
    });
  });
}

/**
 * Update Case Status (e.g. IN_PROGRESS, RESOLVED, ESCALATED, REJECTED)
 */
export function updateCaseStatus(db, id, actor, newStatus, remarks) {
  const now = new Date().toISOString();

  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM operational_cases WHERE id = ?`, [id], (err, currentCase) => {
      if (err) return reject(err);
      if (!currentCase) return reject(new Error('Case not found'));

      let sql = `UPDATE operational_cases SET status = ?, updated_at = ?`;
      const params = [newStatus, now];

      if (newStatus === 'RESOLVED') {
        sql += `, resolution_details = ?`;
        params.push(remarks || 'Remediation completed by responsible maintenance gang.');
      }

      sql += ` WHERE id = ?`;
      params.push(id);

      db.run(sql, params, function (updateErr) {
        if (updateErr) return reject(updateErr);

        // Audit Log
        db.run(
          `INSERT INTO case_audit_logs (id, case_id, actor_id, actor_name, actor_role, action, from_status, to_status, notes, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `log_${Date.now()}`,
            id,
            actor.id || 'STAFF-01',
            actor.name || 'Operational Personnel',
            actor.role || 'staff',
            `Status updated to ${newStatus}`,
            currentCase.status,
            newStatus,
            remarks || `Status transitioned to ${newStatus}`,
            now,
          ]
        );

        // Notify reporter
        if (currentCase.reporter_id) {
          db.run(
            `INSERT INTO case_notifications (id, case_id, recipient_role, recipient_id, title, message, category, priority, created_at)
             VALUES (?, ?, 'employee', ?, ?, ?, 'Issues', 'High', ?)`,
            [
              `notif_${Date.now()}`,
              id,
              currentCase.reporter_id,
              `Issue ${id} Update: ${newStatus}`,
              remarks || `Your reported issue status has been updated to ${newStatus}.`,
              now,
            ]
          );
        }

        // Also notify controller if resolved
        if (newStatus === 'RESOLVED') {
          db.run(
            `INSERT INTO case_notifications (id, case_id, recipient_role, recipient_id, title, message, category, priority, created_at)
             VALUES (?, ?, 'controller', NULL, ?, ?, 'Issues', 'High', ?)`,
            [
              `notif_${Date.now()}_ctrl_res`,
              id,
              `Case ${id} Resolved: Verification Required`,
              `${currentCase.assigned_department || 'Responsible Team'} marked ${id} as RESOLVED: "${remarks || 'Work completed'}". Please verify operational clearance.`,
              now,
            ]
          );
        }

        resolve({ success: true, status: newStatus });
      });
    });
  });
}

/**
 * Controller verifies resolution and closes case
 */
export function verifyCase(db, id, actor, verificationNotes) {
  const now = new Date().toISOString();

  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM operational_cases WHERE id = ?`, [id], (err, currentCase) => {
      if (err) return reject(err);
      if (!currentCase) return reject(new Error('Case not found'));

      db.run(
        `UPDATE operational_cases SET 
          status = 'CLOSED',
          verified_by = ?,
          current_operational_status = 'OPERATIONAL',
          updated_at = ?
         WHERE id = ?`,
        [actor.name || 'Section Controller', now, id],
        function (updateErr) {
          if (updateErr) return reject(updateErr);

          // Audit Log
          db.run(
            `INSERT INTO case_audit_logs (id, case_id, actor_id, actor_name, actor_role, action, from_status, to_status, notes, created_at)
             VALUES (?, ?, ?, ?, 'Section Controller', 'Resolution Verified & Case Closed', ?, 'CLOSED', ?, ?)`,
            [
              `log_${Date.now()}`,
              id,
              actor.id || 'CTRL-SBC-01',
              actor.name || 'Section Controller',
              currentCase.status,
              verificationNotes || 'Operational verification complete. Track / equipment clearance certified.',
              now,
            ]
          );

          // Notify employee of final closure
          if (currentCase.reporter_id) {
            db.run(
              `INSERT INTO case_notifications (id, case_id, recipient_role, recipient_id, title, message, category, priority, created_at)
               VALUES (?, ?, 'employee', ?, ?, ?, 'Issues', 'Medium', ?)`,
              [
                `notif_${Date.now()}`,
                id,
                currentCase.reporter_id,
                `Issue ${id} Verified & Closed`,
                `Resolution certified by Controller ${actor.name || ''}. Normal operations restored.`,
                now,
              ]
            );
          }

          resolve({ success: true, status: 'CLOSED', verifiedBy: actor.name || 'Section Controller' });
        }
      );
    });
  });
}

/**
 * Add Comment / Operational Note
 */
export function addCaseComment(db, id, commentData) {
  const { authorId, authorName, authorRole, commentType = 'NOTE', comment } = commentData;
  const now = new Date().toISOString();
  const commentId = `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO case_comments (id, case_id, author_id, author_name, author_role, comment_type, comment, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [commentId, id, authorId, authorName, authorRole, commentType, comment.trim(), now],
      function (err) {
        if (err) return reject(err);

        // Update updated_at on case
        db.run(`UPDATE operational_cases SET updated_at = ? WHERE id = ?`, [now, id]);

        resolve({
          id: commentId,
          caseId: id,
          authorId,
          authorName,
          authorRole,
          commentType,
          comment: comment.trim(),
          createdAt: now,
        });
      }
    );
  });
}

/**
 * Query notifications
 */
export function getNotifications(db, query = {}) {
  const { role, employeeId, limit = 50 } = query;

  let sql = `SELECT * FROM case_notifications WHERE 1=1`;
  const params = [];

  if (role === 'employee') {
    if (employeeId) {
      sql += ` AND (recipient_role = 'employee' AND (recipient_id = ? OR recipient_id IS NULL))`;
      params.push(employeeId);
    } else {
      sql += ` AND recipient_role = 'employee'`;
    }
  } else if (role === 'controller') {
    sql += ` AND (recipient_role = 'controller' OR recipient_role = 'all')`;
  } else if (role === 'admin') {
    sql += ` AND (recipient_role = 'admin' OR recipient_role = 'all')`;
  }

  sql += ` ORDER BY created_at DESC LIMIT ?`;
  params.push(parseInt(limit, 10));

  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

/**
 * Mark notification as read
 */
export function markNotificationRead(db, id) {
  return new Promise((resolve, reject) => {
    db.run(`UPDATE case_notifications SET is_read = 1 WHERE id = ?`, [id], function (err) {
      if (err) return reject(err);
      resolve({ success: true, id });
    });
  });
}

/**
 * Mark all notifications as read for a recipient
 */
export function markAllNotificationsRead(db, query = {}) {
  const { role, employeeId } = query;
  let sql = `UPDATE case_notifications SET is_read = 1 WHERE 1=1`;
  const params = [];

  if (role === 'employee' && employeeId) {
    sql += ` AND recipient_id = ?`;
    params.push(employeeId);
  } else if (role) {
    sql += ` AND recipient_role = ?`;
    params.push(role);
  }

  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ success: true, updatedCount: this.changes });
    });
  });
}

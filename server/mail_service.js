// server/mail_service.js
import nodemailer from 'nodemailer';

let transporter = null;
let testAccount = null;

// Initialize Nodemailer transporter with SMTP or Ethereal test inbox fallback
async function getTransporter() {
  if (transporter) return transporter;

  // 1. Production SMTP if configured in process.env
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log(`[RailMail] Configured custom SMTP transport (${process.env.SMTP_HOST})`);
    return transporter;
  }

  // 2. Automated Ethereal test account fallback (Zero setup needed, gives live web preview URLs)
  try {
    testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[RailMail] Created Ethereal test mail transport for previewing real emails: ${testAccount.user}`);
    return transporter;
  } catch (err) {
    console.warn('[RailMail] Could not create Ethereal test account (running in offline simulation mode):', err.message);
    return null;
  }
}

// Initial realistic dispatches for Indian Railways operations
const SEED_DISPATCHES = [
  {
    id: 'disp_2026_001',
    sender_id: 'usr_emp_5001',
    sender_name: 'Manas Kumar',
    sender_role: 'employee',
    sender_email: 'manas.kumar@raildrishti.gov.in',
    recipient_id: 'usr_ctrl_2001',
    recipient_name: 'Shriya M',
    recipient_role: 'controller',
    recipient_email: 'shriya.m@raildrishti.gov.in',
    category: 'work_completion',
    priority: 'routine',
    subject: 'Work Completion Memo: Track Circuit TC-42B Restored at Whitefield (WFD)',
    body: 'Official confirmation that track circuit glitch at WFD KM 342/12 has been replaced, tested, and cleared for normal mainline speeds (110 km/h). Relay room log entry #8841 recorded.',
    train_number: '12628',
    section: 'SBC - WFD Fast Line',
    station_code: 'WFD',
    status: 'acknowledged',
    acknowledged_at: new Date(Date.now() - 3600000).toISOString(),
    smtp_status: 'delivered',
    smtp_preview_url: null,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'disp_2026_002',
    sender_id: 'usr_emp_5002',
    sender_name: 'Krutika Girennavar',
    sender_role: 'employee',
    sender_email: 'krutika.g@raildrishti.gov.in',
    recipient_id: 'usr_ctrl_2001',
    recipient_name: 'Shriya M',
    recipient_role: 'controller',
    recipient_email: 'shriya.m@raildrishti.gov.in',
    category: 'problem_report',
    priority: 'urgent',
    subject: 'Defect Notice: Point Machine No. 14 Sluggish Operation at SBC Yard',
    body: 'Point No. 14 reverse detection is sluggish and intermittent during route setting for Platform 3. Requesting immediate S&T attention before express departure at 12:45. Hand cranking standby team alerted.',
    train_number: '16526',
    section: 'Bengaluru City Yard',
    station_code: 'SBC',
    status: 'delivered',
    acknowledged_at: null,
    smtp_status: 'delivered',
    smtp_preview_url: null,
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'disp_2026_003',
    sender_id: 'usr_ctrl_2001',
    sender_name: 'Shriya M',
    sender_role: 'controller',
    sender_email: 'shriya.m@raildrishti.gov.in',
    recipient_id: 'usr_emp_5002',
    recipient_name: 'Krutika Girennavar',
    recipient_role: 'employee',
    recipient_email: 'krutika.g@raildrishti.gov.in',
    category: 'operational_directive',
    priority: 'high',
    subject: 'Operational Directive: Platform 4 Precedence for 12628 Karnataka Express',
    body: 'Due to 15-minute headway delay on Down Line, prioritize reception of 12628 Karnataka Express onto Platform 4 ahead of freight train BCNA-202. Hold 56504 Passenger at Home Signal until clearance is registered.',
    train_number: '12628',
    section: 'Bengaluru Division Control',
    station_code: 'SBC',
    status: 'acknowledged',
    acknowledged_at: new Date(Date.now() - 900000).toISOString(),
    smtp_status: 'delivered',
    smtp_preview_url: null,
    approval_status: 'approved',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'disp_2026_004',
    sender_id: 'usr_emp_5001',
    sender_name: 'Manas Kumar',
    sender_role: 'employee',
    sender_email: 'manas.kumar@raildrishti.gov.in',
    recipient_id: 'usr_adm_1001',
    recipient_name: 'Souvik Saha (Admin)',
    recipient_role: 'admin',
    recipient_email: 'admin@raildrishti.gov.in',
    category: 'work_completion',
    priority: 'high',
    subject: 'Work Approval Request: Electronic Interlocking Relay Cabin Overhaul at SBC',
    body: 'Phase-2 overhaul of the Electronic Interlocking (EI) Siemens Grade-4 relay cabin at KSR Bengaluru (SBC) has completed full diagnostic sweep. All 14 point motors and 22 track circuits are verified. Requesting formal Administrative Approval to certify and recommission mainline operations.',
    train_number: null,
    section: 'Bengaluru Eastern Division',
    station_code: 'SBC',
    status: 'delivered',
    acknowledged_at: null,
    smtp_status: 'delivered',
    smtp_preview_url: null,
    approval_status: 'pending_review',
    created_at: new Date(Date.now() - 2400000).toISOString(),
  },
  {
    id: 'disp_2026_005',
    sender_id: 'usr_ctrl_2001',
    sender_name: 'Shriya M',
    sender_role: 'controller',
    sender_email: 'shriya.m@raildrishti.gov.in',
    recipient_id: 'usr_adm_1001',
    recipient_name: 'Souvik Saha (Admin)',
    recipient_role: 'admin',
    recipient_email: 'admin@raildrishti.gov.in',
    category: 'speed_restriction',
    priority: 'urgent',
    subject: 'Operational Approval Request: TSR 45 km/h Relaxation for High-Density Chord',
    body: 'Due to completion of ballast tamping between BYPL KM 342/10 and KJM KM 343/00, section control recommends lifting TSR 45 km/h restriction and restoring standard line speed of 80 km/h for Vande Bharat (20608) and Karnataka Express (12628). Controller desk requires Director/Admin sign-off.',
    train_number: '20608',
    section: 'BYPL - KJM Corridor Section',
    station_code: 'BYPL',
    status: 'delivered',
    acknowledged_at: null,
    smtp_status: 'delivered',
    smtp_preview_url: null,
    approval_status: 'pending_review',
    created_at: new Date(Date.now() - 1200000).toISOString(),
  },
];

// RailDrishti Staff & Controller Directory for recipient selection
export const STAFF_DIRECTORY = [
  {
    id: 'usr_ctrl_2001',
    name: 'Shriya M',
    role: 'controller',
    email: 'shriya.m@raildrishti.gov.in',
    designation: 'Senior Section Controller (Bengaluru Section - SBC)',
    department: 'Operations & Traffic Control',
    section: 'Bengaluru (SBC) - Jolarpettai (JTJ)',
  },
  {
    id: 'usr_ctrl_2002',
    name: 'Rohit Roy',
    role: 'controller',
    email: 'rohit.roy@raildrishti.gov.in',
    designation: 'Traffic Dispatch & Section Controller',
    department: 'Operations & Traffic Control',
    section: 'Northern Corridor & High-Density Route (NDLS)',
  },
  {
    id: 'usr_emp_5001',
    name: 'Manas Kumar',
    role: 'employee',
    email: 'manas.kumar@raildrishti.gov.in',
    designation: 'Senior Signal & Telecom Maintainer',
    department: 'Signal & Telecommunication (S&T)',
    operationalRole: 'signal_maintainer',
    section: 'Bengaluru Division (SBC-WFD)',
  },
  {
    id: 'usr_emp_5002',
    name: 'Krutika Girennavar',
    role: 'employee',
    email: 'krutika.g@raildrishti.gov.in',
    designation: 'Assistant Station Master (ASM)',
    department: 'Operations & Traffic Control',
    operationalRole: 'station_master',
    section: 'KSR Bengaluru City (SBC)',
  },
  {
    id: 'usr_adm_1001',
    name: 'Souvik Saha',
    role: 'admin',
    email: 'souvik.saha@raildrishti.gov.in',
    designation: 'Principal System Administrator & Operations Director',
    department: 'Railway Operations & Safety Directorate',
    section: 'Central Command & Safety Oversight',
  },
  {
    id: 'usr_adm_1002',
    name: 'Neeraj Singh Gaira',
    role: 'admin',
    email: 'neeraj.gaira@raildrishti.gov.in',
    designation: 'Executive Director (Operations & Traffic)',
    department: 'Operations & Traffic Control Directorate',
    section: 'Railway Board Operational Directorate',
  },
];

// Initialize table & seed demo records
export function initializeMailService(db) {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS official_dispatches (
        id TEXT PRIMARY KEY,
        sender_id TEXT,
        sender_name TEXT NOT NULL,
        sender_role TEXT NOT NULL,
        sender_email TEXT NOT NULL,
        recipient_id TEXT,
        recipient_name TEXT NOT NULL,
        recipient_role TEXT NOT NULL,
        recipient_email TEXT NOT NULL,
        category TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'routine',
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        train_number TEXT,
        section TEXT,
        station_code TEXT,
        status TEXT NOT NULL DEFAULT 'delivered',
        acknowledged_at DATETIME,
        smtp_status TEXT DEFAULT 'simulated',
        smtp_preview_url TEXT,
        approval_status TEXT DEFAULT 'pending_review',
        reviewed_by TEXT,
        reviewed_at DATETIME,
        reviewer_notes TEXT,
        return_dispatch_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Safe migration columns for existing tables
    const extraCols = [
      "approval_status TEXT DEFAULT 'pending_review'",
      "reviewed_by TEXT",
      "reviewed_at DATETIME",
      "reviewer_notes TEXT",
      "return_dispatch_id TEXT"
    ];
    extraCols.forEach(col => {
      db.run(`ALTER TABLE official_dispatches ADD COLUMN ${col}`, () => {});
    });

    db.get(`SELECT COUNT(*) as count FROM official_dispatches`, (err, row) => {
      if (!err && (!row || row.count === 0)) {
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO official_dispatches (
            id, sender_id, sender_name, sender_role, sender_email,
            recipient_id, recipient_name, recipient_role, recipient_email,
            category, priority, subject, body, train_number, section, station_code,
            status, acknowledged_at, smtp_status, smtp_preview_url,
            approval_status, reviewed_by, reviewed_at, reviewer_notes, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        SEED_DISPATCHES.forEach((d) => {
          stmt.run(
            d.id,
            d.sender_id,
            d.sender_name,
            d.sender_role,
            d.sender_email,
            d.recipient_id,
            d.recipient_name,
            d.recipient_role,
            d.recipient_email,
            d.category,
            d.priority,
            d.subject,
            d.body,
            d.train_number,
            d.section,
            d.station_code,
            d.status,
            d.acknowledged_at,
            d.smtp_status,
            d.smtp_preview_url,
            d.approval_status || 'pending_review',
            d.reviewed_by || null,
            d.reviewed_at || null,
            d.reviewer_notes || null,
            d.created_at
          );
        });
        stmt.finalize();
        console.log('[RailMail] Initialized official_dispatches schema and seeded operational dispatches.');
      }
    });
  });
}

// Generate official Indian Railways HTML email template
function generateEmailHtml({
  dispatchId,
  senderName,
  senderRole,
  senderEmail,
  recipientName,
  category,
  priority,
  subject,
  body,
  trainNumber,
  section,
  stationCode,
  createdAt,
}) {
  const priorityColor =
    priority === 'urgent' ? '#DC2626' : priority === 'high' ? '#D97706' : '#2563EB';
  const priorityLabel = priority.toUpperCase();

  const categoryTitles = {
    problem_report: 'OFFICIAL FIELD DEFECT / PROBLEM REPORT',
    work_completion: 'MAINTENANCE & WORK COMPLETION MEMO',
    operational_directive: 'SECTION CONTROLLER OPERATIONAL DIRECTIVE',
    speed_restriction: 'TEMPORARY SPEED RESTRICTION (TSR) ORDER',
    safety_circular: 'SAFETY & EMERGENCY CIRCULAR',
    general: 'OFFICIAL OPERATIONAL DISPATCH',
  };

  const formattedCategory = categoryTitles[category] || category.toUpperCase().replace(/_/g, ' ');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 24px; background-color: #07131B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E2E8F0;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #0F1F2C; border: 1px solid #1E3A52; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
        
        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(135deg, #092032 0%, #0F324D 100%); padding: 20px 24px; border-bottom: 2px solid #F59E0B;">
            <table width="100%" border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="font-size: 20px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.5px;">RAIL<span style="color: #F59E0B;">DRISHTI</span></span>
                  <div style="font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">
                    Ministry of Railways · Traffic & Operations Control System
                  </div>
                </td>
                <td align="right">
                  <span style="background-color: ${priorityColor}; color: #FFFFFF; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">
                    ${priorityLabel} PRIORITY
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Category Banner -->
        <tr>
          <td style="background-color: #14293A; padding: 12px 24px; border-bottom: 1px solid #1E3A52;">
            <div style="font-size: 12px; font-weight: 700; color: #38BDF8; letter-spacing: 0.8px;">
              ${formattedCategory}
            </div>
            <div style="font-size: 11px; color: #64748B; margin-top: 2px;">
              Dispatch Ref: <strong style="color: #CBD5E1;">${dispatchId}</strong> · Sent: ${new Date(createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
            </div>
          </td>
        </tr>

        <!-- Operational Context Metadata -->
        <tr>
          <td style="padding: 18px 24px; background-color: #0A1622; border-bottom: 1px solid #1A2F42;">
            <table width="100%" border="0" cellpadding="4" cellspacing="0" style="font-size: 12px;">
              <tr>
                <td width="30%" style="color: #64748B; font-weight: 600;">FROM:</td>
                <td style="color: #F8FAFC; font-weight: 700;">${senderName} (${senderRole.toUpperCase()}) &lt;${senderEmail}&gt;</td>
              </tr>
              <tr>
                <td style="color: #64748B; font-weight: 600;">TO:</td>
                <td style="color: #F8FAFC; font-weight: 700;">${recipientName}</td>
              </tr>
              ${trainNumber ? `<tr><td style="color: #64748B; font-weight: 600;">TRAIN NO:</td><td style="color: #F59E0B; font-weight: 800;">${trainNumber}</td></tr>` : ''}
              ${section ? `<tr><td style="color: #64748B; font-weight: 600;">SECTION / BEAT:</td><td style="color: #E2E8F0;">${section}</td></tr>` : ''}
              ${stationCode ? `<tr><td style="color: #64748B; font-weight: 600;">STATION:</td><td style="color: #38BDF8; font-weight: 700;">${stationCode}</td></tr>` : ''}
            </table>
          </td>
        </tr>

        <!-- Subject & Content -->
        <tr>
          <td style="padding: 24px;">
            <div style="font-size: 17px; font-weight: 700; color: #FFFFFF; line-height: 1.4; margin-bottom: 14px;">
              ${subject}
            </div>
            <div style="background-color: #081119; padding: 18px; border-radius: 6px; border-left: 4px solid #F59E0B; font-size: 14px; line-height: 1.6; color: #D1D5DB; white-space: pre-wrap;">
${body}
            </div>
          </td>
        </tr>

        <!-- Official Sign-off & Footer -->
        <tr>
          <td style="background-color: #091520; padding: 16px 24px; border-top: 1px solid #1E3A52; font-size: 11px; color: #64748B; line-height: 1.5;">
            <table width="100%" border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <strong>CONFIDENTIAL & OFFICIAL RAILWAY CORRESPONDENCE</strong><br />
                  This operational memo was automatically generated & verified by the RailDrishti Control Architecture.
                </td>
                <td align="right">
                  <span style="display: inline-block; padding: 6px 12px; background-color: #0E2A3E; border: 1px solid #1D4E6D; border-radius: 4px; color: #38BDF8; font-weight: 600;">
                    RailDrishti Verified
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// Send an official email and save record in SQLite database
export async function sendDispatch(db, payload) {
  const {
    senderId = 'usr_unknown',
    senderName = 'Rail Staff',
    senderRole = 'staff',
    senderEmail,
    recipientId,
    recipientName,
    recipientRole = 'controller',
    recipientEmail,
    category = 'general',
    priority = 'routine',
    subject,
    body,
    trainNumber,
    section,
    stationCode,
  } = payload;

  if (!recipientEmail || !subject || !body) {
    throw new Error('Missing required fields: recipientEmail, subject, and body are mandatory.');
  }

  const dispatchId = `disp_${Date.now()}_${Math.floor(Math.random() * 900 + 100)}`;
  const createdAt = new Date().toISOString();

  let smtpStatus = 'simulated';
  let smtpPreviewUrl = null;

  // Prepare and attempt sending email via Nodemailer
  try {
    const activeTransporter = await getTransporter();
    if (activeTransporter) {
      const html = generateEmailHtml({
        dispatchId,
        senderName,
        senderRole,
        senderEmail: senderEmail || 'operations@raildrishti.gov.in',
        recipientName: recipientName || recipientEmail,
        category,
        priority,
        subject,
        body,
        trainNumber,
        section,
        stationCode,
        createdAt,
      });

      const mailOptions = {
        from: `"${senderName} (RailDrishti Operations)" <${process.env.SMTP_FROM || 'operations@raildrishti.gov.in'}>`,
        to: recipientEmail,
        replyTo: senderEmail,
        subject: `[${priority.toUpperCase()}][${category.toUpperCase().replace(/_/g, ' ')}] ${subject}`,
        text: `RAILDRISHTI OFFICIAL DISPATCH\nRef: ${dispatchId}\nFrom: ${senderName} (${senderEmail})\nPriority: ${priority}\nSubject: ${subject}\n\n${body}`,
        html,
      };

      const info = await activeTransporter.sendMail(mailOptions);
      console.log(`[RailMail] Sent email ${dispatchId} -> ${recipientEmail}, MessageId: ${info.messageId}`);

      if (testAccount) {
        smtpPreviewUrl = nodemailer.getTestMessageUrl(info) || null;
        smtpStatus = 'ethereal_preview';
        console.log(`[RailMail] Live Ethereal preview link: ${smtpPreviewUrl}`);
      } else {
        smtpStatus = 'delivered';
      }
    }
  } catch (err) {
    console.warn('[RailMail] SMTP delivery notice (recording locally):', err.message);
    smtpStatus = 'simulated';
  }

  // Insert into SQLite database
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO official_dispatches (
        id, sender_id, sender_name, sender_role, sender_email,
        recipient_id, recipient_name, recipient_role, recipient_email,
        category, priority, subject, body, train_number, section, station_code,
        status, acknowledged_at, smtp_status, smtp_preview_url, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?)
    `);

    stmt.run(
      dispatchId,
      senderId,
      senderName,
      senderRole,
      senderEmail || 'operations@raildrishti.gov.in',
      recipientId || null,
      recipientName || recipientEmail,
      recipientRole,
      recipientEmail,
      category,
      priority,
      subject,
      body,
      trainNumber || null,
      section || null,
      stationCode || null,
      'delivered',
      smtpStatus,
      smtpPreviewUrl,
      createdAt,
      function (err) {
        if (err) return reject(err);

        // Fetch inserted row to return
        db.get(`SELECT * FROM official_dispatches WHERE id = ?`, [dispatchId], (err2, row) => {
          if (err2) return reject(err2);
          resolve(row);
        });
      }
    );
    stmt.finalize();
  });
}

// Fetch inbox for a given user email or role
export function getInbox(db, { email, role, userId }) {
  return new Promise((resolve, reject) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanRole = (role || '').trim().toLowerCase();
    const cleanUserId = (userId || '').trim();

    const sql = `
      SELECT * FROM official_dispatches
      WHERE LOWER(recipient_email) = ?
         OR recipient_id = ?
         OR (recipient_role = ? AND recipient_email LIKE '%raildrishti.gov.in')
      ORDER BY 
        CASE WHEN priority = 'urgent' THEN 0 WHEN priority = 'high' THEN 1 ELSE 2 END,
        created_at DESC
      LIMIT 100
    `;

    db.all(sql, [cleanEmail, cleanUserId, cleanRole], (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

// Fetch sent dispatches for a given user
export function getSent(db, { email, userId }) {
  return new Promise((resolve, reject) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanUserId = (userId || '').trim();

    const sql = `
      SELECT * FROM official_dispatches
      WHERE LOWER(sender_email) = ? OR sender_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `;

    db.all(sql, [cleanEmail, cleanUserId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

// Acknowledge receipt of a directive or memo
export function acknowledgeDispatch(db, id, acknowledgedBy) {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();
    db.run(
      `UPDATE official_dispatches SET status = 'acknowledged', acknowledged_at = ? WHERE id = ?`,
      [now, id],
      function (err) {
        if (err) return reject(err);
        db.get(`SELECT * FROM official_dispatches WHERE id = ?`, [id], (err2, row) => {
          if (err2) return reject(err2);
          resolve(row);
        });
      }
    );
  });
}

// Quick stats for badges
export function getMailStats(db, { email, role, userId }) {
  return new Promise((resolve, reject) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanRole = (role || '').trim().toLowerCase();
    const cleanUserId = (userId || '').trim();

    const sql = `
      SELECT 
        COUNT(*) as total_inbox,
        SUM(CASE WHEN status != 'acknowledged' THEN 1 ELSE 0 END) as unacknowledged,
        SUM(CASE WHEN priority = 'urgent' AND status != 'acknowledged' THEN 1 ELSE 0 END) as urgent_count
      FROM official_dispatches
      WHERE LOWER(recipient_email) = ?
         OR recipient_id = ?
         OR (recipient_role = ? AND recipient_email LIKE '%raildrishti.gov.in')
    `;

    db.get(sql, [cleanEmail, cleanUserId, cleanRole], (err, row) => {
      if (err) return reject(err);
      resolve({
        totalInbox: row?.total_inbox || 0,
        unacknowledged: row?.unacknowledged || 0,
        urgentCount: row?.urgent_count || 0,
      });
    });
  });
}

// Fetch all dispatches for Admin with optional sender_role & approval_status filtering
export function getAllDispatchesForAdmin(db, { senderRole, approvalStatus, category, limit = 150 } = {}) {
  return new Promise((resolve, reject) => {
    let sql = `SELECT * FROM official_dispatches WHERE 1=1`;
    const params = [];

    if (senderRole && senderRole !== 'all') {
      sql += ` AND LOWER(sender_role) = ?`;
      params.push(senderRole.trim().toLowerCase());
    }

    if (approvalStatus && approvalStatus !== 'all') {
      sql += ` AND approval_status = ?`;
      params.push(approvalStatus.trim().toLowerCase());
    }

    if (category && category !== 'all') {
      sql += ` AND category = ?`;
      params.push(category.trim().toLowerCase());
    }

    sql += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(limit);

    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

// Review a dispatch (Approve / Reject) and automatically send an official Return Mail
export async function reviewDispatch(db, {
  dispatchId,
  decision, // 'approved' | 'rejected'
  reviewerNotes,
  reviewerName = 'Railway Operations Administrator',
  reviewerEmail = 'admin@raildrishti.gov.in',
  reviewerId = 'usr_adm_1001',
}) {
  if (!dispatchId || !decision) {
    throw new Error('Dispatch ID and decision (approved/rejected) are mandatory.');
  }

  const cleanDecision = decision.toLowerCase() === 'approved' ? 'approved' : 'rejected';
  const now = new Date().toISOString();

  // 1. Fetch original dispatch
  const orig = await new Promise((resolve, reject) => {
    db.get(`SELECT * FROM official_dispatches WHERE id = ?`, [dispatchId], (err, row) => {
      if (err) return reject(err);
      if (!row) return reject(new Error(`Dispatch ${dispatchId} not found.`));
      resolve(row);
    });
  });

  // 2. Formulate return memo
  const returnSubject = `[${cleanDecision.toUpperCase()}] Official Decision: ${orig.subject}`;
  const defaultNotes = cleanDecision === 'approved'
    ? 'The work memo / operational update has been verified and approved by Railway Administration. Execution authorized.'
    : 'The requested action has been reviewed and rejected by Railway Administration. Please review requirements and resubmit.';

  const finalNotes = (reviewerNotes && reviewerNotes.trim()) ? reviewerNotes.trim() : defaultNotes;

  const returnBody = `OFFICIAL ADMINISTRATIVE REVIEW NOTICE\n\n` +
    `Reference Original Dispatch: ${orig.id}\n` +
    `Submitted By: ${orig.sender_name} (${(orig.sender_role || 'STAFF').toUpperCase()}) <${orig.sender_email}>\n` +
    `Subject: ${orig.subject}\n` +
    `Decision: ${cleanDecision.toUpperCase()}\n` +
    `Reviewed At: ${now}\n` +
    `Reviewed By: ${reviewerName} (${reviewerEmail})\n\n` +
    `Directorate Remarks / Operational Directives:\n` +
    `${finalNotes}\n\n` +
    `This is an automated administrative record generated by RailDrishti Control Command.`;

  // 3. Send official return mail
  const returnDispatch = await sendDispatch(db, {
    senderId: reviewerId,
    senderName: reviewerName,
    senderRole: 'admin',
    senderEmail: reviewerEmail,
    recipientId: orig.sender_id,
    recipientName: orig.sender_name,
    recipientRole: orig.sender_role,
    recipientEmail: orig.sender_email,
    category: 'operational_directive',
    priority: cleanDecision === 'rejected' ? 'urgent' : 'high',
    subject: returnSubject,
    body: returnBody,
    trainNumber: orig.train_number,
    section: orig.section,
    stationCode: orig.station_code,
  });

  // 4. Update original dispatch with approval status, reviewer details, and return_dispatch_id
  await new Promise((resolve, reject) => {
    db.run(
      `UPDATE official_dispatches 
       SET approval_status = ?, reviewed_by = ?, reviewed_at = ?, reviewer_notes = ?, return_dispatch_id = ?
       WHERE id = ?`,
      [cleanDecision, `${reviewerName} (${reviewerEmail})`, now, finalNotes, returnDispatch.id, dispatchId],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });

  // 5. Fetch and return updated original
  const updatedOrig = await new Promise((resolve, reject) => {
    db.get(`SELECT * FROM official_dispatches WHERE id = ?`, [dispatchId], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });

  return { original: updatedOrig, returnDispatch };
}


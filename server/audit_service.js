// server/audit_service.js
import sqlite3 from 'sqlite3';

/**
 * PDF generator for Node.js backend
 */
export function buildServerPdf(title, subtitle, headers, rows, meta) {
  const itemsPerPage = 22;
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const pagesContent = [];

  const escapePdf = (text) => {
    if (text === null || text === undefined) return "";
    return String(text)
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)")
      .replace(/[^\x20-\x7E]/g, " ");
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  for (let p = 0; p < totalPages; p++) {
    const pageRows = rows.slice(p * itemsPerPage, (p + 1) * itemsPerPage);
    let s = "";

    // Header Box
    s += "q\n";
    s += "0.03 0.16 0.22 rg\n";
    s += "35 765 525 48 re f\n";
    s += "Q\n";

    // Gold strip
    s += "q\n";
    s += "0.96 0.62 0.04 rg\n";
    s += "35 762 525 3 re f\n";
    s += "Q\n";

    // Header Text
    s += "BT\n";
    s += "/F2 13 Tf\n";
    s += "1 1 1 rg\n";
    s += "48 792 Td\n";
    s += `(${escapePdf(title)}) Tj\n`;
    s += "ET\n";

    s += "BT\n";
    s += "/F1 9 Tf\n";
    s += "0.85 0.92 0.95 rg\n";
    s += "48 775 Td\n";
    s += `(${escapePdf(subtitle)}) Tj\n`;
    s += "ET\n";

    // Metadata line
    s += "BT\n";
    s += "/F2 8 Tf\n";
    s += "0.15 0.2 0.25 rg\n";
    s += "35 745 Td\n";
    s += `(Generated: ${escapePdf(dateStr)} ${escapePdf(timeStr)} IST  |  Page ${p + 1} of ${totalPages}  |  ${escapePdf(meta || "Official Ledger")}) Tj\n`;
    s += "ET\n";

    const tableTop = 730;

    // Table Header
    s += "q\n";
    s += "0.05 0.35 0.38 rg\n";
    s += `35 ${tableTop - 20} 525 20 re f\n`;
    s += "Q\n";

    s += "BT\n";
    s += "/F2 8 Tf\n";
    s += "1 1 1 rg\n";
    s += `42 ${tableTop - 13} Td\n`;

    // Render columns
    for (let c = 0; c < headers.length; c++) {
      const h = headers[c];
      if (c > 0) {
        s += `${h.xOffset} 0 Td\n`;
      }
      s += `(${escapePdf(h.label)}) Tj\n`;
    }
    s += "ET\n";

    // Rows
    let y = tableTop - 35;
    for (let i = 0; i < pageRows.length; i++) {
      const r = pageRows[i];

      if (i % 2 === 1) {
        s += "q\n";
        s += "0.96 0.98 0.99 rg\n";
        s += `35 ${y - 4} 525 17 re f\n`;
        s += "Q\n";
      }

      s += "q\n";
      s += "0.88 0.92 0.94 RG\n";
      s += "0.4 w\n";
      s += `35 ${y - 4} m 560 ${y - 4} l S\n`;
      s += "Q\n";

      s += "BT\n";
      s += "/F1 7.5 Tf\n";
      s += "0.1 0.15 0.2 rg\n";
      s += `42 ${y} Td\n`;

      for (let c = 0; c < headers.length; c++) {
        const h = headers[c];
        if (c > 0) {
          s += `${h.xOffset} 0 Td\n`;
        }
        const val = (r[h.key] || "").slice(0, h.maxLen || 25);
        s += `(${escapePdf(val)}) Tj\n`;
      }
      s += "ET\n";

      y -= 18;
    }

    // Footer
    s += "q\n";
    s += "0.8 0.85 0.88 RG\n";
    s += "0.5 w\n";
    s += "35 45 m 560 45 l S\n";
    s += "Q\n";

    s += "BT\n";
    s += "/F1 7 Tf\n";
    s += "0.45 0.5 0.55 rg\n";
    s += "35 34 Td\n";
    s += "(RailDrishti Operational Governance & Telemetry Control Platform) Tj\n";
    s += "ET\n";

    s += "BT\n";
    s += "/F2 7 Tf\n";
    s += "0.05 0.35 0.38 rg\n";
    s += "450 34 Td\n";
    s += `(Page ${p + 1} of ${totalPages}  |  CONFIDENTIAL) Tj\n`;
    s += "ET\n";

    pagesContent.push(s);
  }

  // Assemble PDF document
  const pageCount = pagesContent.length;
  const fontNormalNum = 3 + 2 * pageCount;
  const fontBoldNum = fontNormalNum + 1;

  const pdfParts = [];
  pdfParts.push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  pdfParts.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);

  const kids = Array.from({ length: pageCount }, (_, i) => `${3 + i} 0 R`).join(" ");
  pdfParts.push(`2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>\nendobj\n`);

  for (let i = 0; i < pageCount; i++) {
    const pageNum = 3 + i;
    const streamNum = 3 + pageCount + i;
    pdfParts.push(
      `${pageNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents ${streamNum} 0 R /Resources << /Font << /F1 ${fontNormalNum} 0 R /F2 ${fontBoldNum} 0 R >> >> >>\nendobj\n`
    );
  }

  for (let i = 0; i < pageCount; i++) {
    const streamNum = 3 + pageCount + i;
    const stream = pagesContent[i];
    const streamBytes = Buffer.byteLength(stream, "latin1");
    pdfParts.push(`${streamNum} 0 obj\n<< /Length ${streamBytes} >>\nstream\n${stream}\nendstream\nendobj\n`);
  }

  pdfParts.push(`${fontNormalNum} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);
  pdfParts.push(`${fontBoldNum} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`);

  const offsets = [0];
  let currentOffset = 0;

  currentOffset += Buffer.byteLength(pdfParts[0], "latin1");

  for (let i = 1; i < pdfParts.length; i++) {
    offsets.push(currentOffset);
    currentOffset += Buffer.byteLength(pdfParts[i], "latin1");
  }

  const xrefOffset = currentOffset;
  let xref = `xref\n0 ${offsets.length}\n`;
  xref += "0000000000 65535 f \r\n";
  for (let i = 1; i < offsets.length; i++) {
    xref += String(offsets[i]).padStart(10, "0") + " 00000 n \r\n";
  }

  const trailer = `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  const fullContent = pdfParts.join("") + xref + trailer;

  return Buffer.from(fullContent, "latin1");
}

export const INITIAL_SYSTEM_AUDIT_LOGS = [
  {
    id: "AUD-2026-0091",
    timestamp: "2026-09-16 09:12:45",
    user: "souvik.saha@raildrishti.gov.in",
    user_role: "System Administrator",
    event: "Production Model Weights Updated (v4.2.1-prod)",
    event_type: "Configuration",
    resource: "ML-ETA-Engine",
    action: "UPDATE",
    source: "Admin Portal",
    status: "SUCCESS",
    severity: "INFO",
    previous_value: "weights_v4.2.0.pt",
    new_value: "weights_v4.2.1.pt",
    ip_address: "10.24.110.14"
  },
  {
    id: "AUD-2026-0090",
    timestamp: "2026-09-16 08:45:10",
    user: "shriya.m@raildrishti.gov.in",
    user_role: "Controller",
    event: "Section Priority Override Issued (Train 12627)",
    event_type: "Administrative",
    resource: "Dispatch-Corridor-SBC",
    action: "OVERRIDE",
    source: "Controller Desk",
    status: "SUCCESS",
    severity: "WARNING",
    previous_value: "Standard Signal Interlock",
    new_value: "Direct Line Green Wave Override",
    ip_address: "10.24.112.55"
  },
  {
    id: "AUD-2026-0089",
    timestamp: "2026-09-16 07:30:22",
    user: "system.audit",
    user_role: "System",
    event: "Automated Railway Database Integrity Verification",
    event_type: "Security",
    resource: "SQLite-Central-DB",
    action: "INTEGRITY_CHECK",
    source: "Audit Daemon",
    status: "SUCCESS",
    severity: "INFO",
    previous_value: null,
    new_value: "Verified 28,491 train tracks & schedule nodes (0 anomalies)",
    ip_address: "127.0.0.1"
  },
  {
    id: "AUD-2026-0088",
    timestamp: "2026-09-16 06:15:00",
    user: "neeraj.gaira@raildrishti.gov.in",
    user_role: "System Administrator",
    event: "Weather Caution Delay Threshold Re-calibrated",
    event_type: "Configuration",
    resource: "WeatherImpactService",
    action: "UPDATE",
    source: "Admin Portal",
    status: "SUCCESS",
    severity: "INFO",
    previous_value: "rain_threshold=30mm/h",
    new_value: "rain_threshold=25mm/h",
    ip_address: "10.24.110.19"
  },
  {
    id: "AUD-2026-0087",
    timestamp: "2026-09-15 23:59:12",
    user: "system.telemetry",
    user_role: "System",
    event: "Night Shift Roster Synchronization Completed",
    event_type: "System",
    resource: "StaffRosterEngine",
    action: "SYNC",
    source: "Scheduler Service",
    status: "SUCCESS",
    severity: "INFO",
    previous_value: null,
    new_value: "Synced 48 active section crews",
    ip_address: "127.0.0.1"
  },
  {
    id: "AUD-2026-0086",
    timestamp: "2026-09-15 21:10:44",
    user: "sec.gateway@raildrishti.gov.in",
    user_role: "Security",
    event: "Unauthorized External API Token Probed",
    event_type: "Security",
    resource: "API-Gateway-Proxy",
    action: "AUTH_REJECT",
    source: "Edge Firewall",
    status: "DENIED",
    severity: "CRITICAL",
    previous_value: null,
    new_value: "Blocked remote IP 194.26.29.112 (Rate-limit exceeded)",
    ip_address: "194.26.29.112"
  },
  {
    id: "AUD-2026-0085",
    timestamp: "2026-09-15 19:40:02",
    user: "rohit.roy@raildrishti.gov.in",
    user_role: "Controller",
    event: "Emergency Track Block Activated (Km 48/20)",
    event_type: "Administrative",
    resource: "Section-Control-Approach",
    action: "DISPATCH_LINE_BLOCK",
    source: "Controller Desk",
    status: "SUCCESS",
    severity: "CRITICAL",
    previous_value: "Line Open 65km/h",
    new_value: "Emergency Line Block Enforced (Track Fracture)",
    ip_address: "10.24.112.58"
  },
  {
    id: "AUD-2026-0084",
    timestamp: "2026-09-15 18:22:15",
    user: "souvik.saha@raildrishti.gov.in",
    user_role: "System Administrator",
    event: "User Role Escalation Approved: ADM-1002 (Neeraj Singh Gaira)",
    event_type: "Administrative",
    resource: "UserDirectory",
    action: "ROLE_CHANGE",
    source: "Admin Portal",
    status: "SUCCESS",
    severity: "INFO",
    previous_value: "Role: Controller",
    new_value: "Role: System Administrator",
    ip_address: "10.24.110.14"
  },
  {
    id: "AUD-2026-0083",
    timestamp: "2026-09-15 17:05:40",
    user: "manas.kumar@raildrishti.gov.in",
    user_role: "Employee",
    event: "Signal Aspect Restored (Starter 4B KSR Bengaluru)",
    event_type: "Administrative",
    resource: "PointInterlock-SBC-4B",
    action: "FIELD_VERIFY",
    source: "Employee Mobile Terminal",
    status: "SUCCESS",
    severity: "INFO",
    previous_value: "Restricted caution",
    new_value: "Normal operational interlocking",
    ip_address: "10.24.115.30"
  },
  {
    id: "AUD-2026-0082",
    timestamp: "2026-09-15 14:15:30",
    user: "system.audit",
    user_role: "System",
    event: "Quarterly Access Control Token Rotation",
    event_type: "Security",
    resource: "AuthTokenStore",
    action: "TOKEN_ROTATE",
    source: "Security Daemon",
    status: "SUCCESS",
    severity: "INFO",
    previous_value: "RSA-2048 Keypair",
    new_value: "ECDSA-P256 Keypair",
    ip_address: "127.0.0.1"
  }
];

export function initializeAuditService(db) {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS system_audit_logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        user TEXT NOT NULL,
        user_role TEXT NOT NULL,
        event TEXT NOT NULL,
        event_type TEXT NOT NULL,
        resource TEXT NOT NULL,
        action TEXT NOT NULL,
        source TEXT NOT NULL,
        status TEXT NOT NULL,
        severity TEXT NOT NULL,
        previous_value TEXT,
        new_value TEXT,
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check count and seed initial records if empty
    db.get(`SELECT COUNT(*) as count FROM system_audit_logs`, (err, row) => {
      if (!err && row && row.count === 0) {
        console.log('[AuditService] Seeding initial system audit logs...');
        const stmt = db.prepare(`
          INSERT INTO system_audit_logs (
            id, timestamp, user, user_role, event, event_type, resource, action, source, status, severity, previous_value, new_value, ip_address
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        INITIAL_SYSTEM_AUDIT_LOGS.forEach(log => {
          stmt.run(
            log.id,
            log.timestamp,
            log.user,
            log.user_role,
            log.event,
            log.event_type,
            log.resource,
            log.action,
            log.source,
            log.status,
            log.severity,
            log.previous_value,
            log.new_value,
            log.ip_address
          );
        });

        stmt.finalize();
        console.log(`[AuditService] Successfully seeded ${INITIAL_SYSTEM_AUDIT_LOGS.length} system audit logs.`);
      }
    });
  });
}

export function getAuditLogs(db, filters = {}) {
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM system_audit_logs WHERE 1=1`;
    const params = [];

    if (filters.search) {
      query += ` AND (event LIKE ? OR user LIKE ? OR resource LIKE ? OR id LIKE ?)`;
      const s = `%${filters.search}%`;
      params.push(s, s, s, s);
    }
    if (filters.type && filters.type !== 'All') {
      query += ` AND event_type = ?`;
      params.push(filters.type);
    }
    if (filters.severity && filters.severity !== 'All') {
      query += ` AND severity = ?`;
      params.push(filters.severity);
    }
    if (filters.status && filters.status !== 'All') {
      query += ` AND status = ?`;
      params.push(filters.status);
    }

    query += ` ORDER BY timestamp DESC`;

    if (filters.limit) {
      query += ` LIMIT ?`;
      params.push(parseInt(filters.limit, 10));
    }

    db.all(query, params, (err, rows) => {
      if (err) return reject(err);

      // Normalize snake_case to frontend camelCase
      const normalized = (rows || []).map(r => ({
        id: r.id,
        timestamp: r.timestamp,
        user: r.user,
        userRole: r.user_role,
        event: r.event,
        eventType: r.event_type,
        resource: r.resource,
        action: r.action,
        source: r.source,
        status: r.status,
        severity: r.severity,
        previousValue: r.previous_value,
        newValue: r.new_value,
        ipAddress: r.ip_address
      }));

      resolve(normalized);
    });
  });
}

export function createAuditLog(db, data) {
  return new Promise((resolve, reject) => {
    const id = data.id || `AUD-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const timestamp = data.timestamp || new Date().toISOString().replace('T', ' ').slice(0, 19);

    const stmt = db.prepare(`
      INSERT INTO system_audit_logs (
        id, timestamp, user, user_role, event, event_type, resource, action, source, status, severity, previous_value, new_value, ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      timestamp,
      data.user || 'system',
      data.userRole || 'System',
      data.event || 'System Event',
      data.eventType || 'System',
      data.resource || 'Platform',
      data.action || 'EXECUTE',
      data.source || 'Server',
      data.status || 'SUCCESS',
      data.severity || 'INFO',
      data.previousValue || null,
      data.newValue || null,
      data.ipAddress || '127.0.0.1',
      function (err) {
        if (err) return reject(err);
        resolve({
          id,
          timestamp,
          ...data
        });
      }
    );
    stmt.finalize();
  });
}

export function getAuditStats(db) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN event_type = 'Administrative' THEN 1 ELSE 0 END) as admin_count,
        SUM(CASE WHEN event_type = 'Configuration' THEN 1 ELSE 0 END) as config_count,
        SUM(CASE WHEN event_type = 'Security' THEN 1 ELSE 0 END) as security_count,
        SUM(CASE WHEN severity = 'CRITICAL' THEN 1 ELSE 0 END) as critical_count
      FROM system_audit_logs
    `, (err, rows) => {
      if (err) return reject(err);
      const row = rows[0] || {};
      resolve({
        total: row.total || 0,
        admin: row.admin_count || 0,
        config: row.config_count || 0,
        security: row.security_count || 0,
        critical: row.critical_count || 0
      });
    });
  });
}

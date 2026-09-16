/**
 * RailDrishti Operational Report Generator
 * Generates standard, valid PDF-1.4 binary files directly in the browser,
 * as well as CSV and JSON formats, triggering direct downloads to the user's computer.
 */

import type { OperationalCase } from "../services/caseService";
import type { AuditRecord } from "../services/auditService";

// Helper to escape PDF strings: (, ), \
function escapePdf(text: unknown): string {
  if (text === null || text === undefined) return "";
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, " ");
}

/**
 * Pure TypeScript PDF-1.4 Binary Generator
 */
function buildPdfDocument(pagesContent: string[]): Uint8Array {
  const pageCount = pagesContent.length;
  // Object numbers:
  // 1: Catalog
  // 2: Pages
  // 3 .. 3 + pageCount - 1: Page objects
  // 3 + pageCount .. 3 + 2*pageCount - 1: Content streams
  // Next: Font 1 (Helvetica)
  // Next: Font 2 (Helvetica-Bold)

  const fontNormalNum = 3 + 2 * pageCount;
  const fontBoldNum = fontNormalNum + 1;

  const pdfParts: string[] = [];
  pdfParts.push("%PDF-1.4\n%RailDrishti-2026\n");

  // Catalog
  pdfParts.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);

  // Pages tree
  const kids = Array.from({ length: pageCount }, (_, i) => `${3 + i} 0 R`).join(" ");
  pdfParts.push(`2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>\nendobj\n`);

  // Page objects
  for (let i = 0; i < pageCount; i++) {
    const pageNum = 3 + i;
    const streamNum = 3 + pageCount + i;
    pdfParts.push(
      `${pageNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents ${streamNum} 0 R /Resources << /Font << /F1 ${fontNormalNum} 0 R /F2 ${fontBoldNum} 0 R >> >> >>\nendobj\n`
    );
  }

  // Content streams
  for (let i = 0; i < pageCount; i++) {
    const streamNum = 3 + pageCount + i;
    const stream = pagesContent[i];
    const streamBytes = new TextEncoder().encode(stream).length;
    pdfParts.push(`${streamNum} 0 obj\n<< /Length ${streamBytes} >>\nstream\n${stream}\nendstream\nendobj\n`);
  }

  // Fonts
  pdfParts.push(`${fontNormalNum} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);
  pdfParts.push(`${fontBoldNum} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`);

  // Calculate byte offsets
  const offsets: number[] = [0]; // obj 0 is dummy
  let currentOffset = 0;
  const encoder = new TextEncoder();

  // Part 0 is header
  currentOffset += encoder.encode(pdfParts[0]).length;

  for (let i = 1; i < pdfParts.length; i++) {
    offsets.push(currentOffset);
    currentOffset += encoder.encode(pdfParts[i]).length;
  }

  // Xref table
  const xrefOffset = currentOffset;
  let xref = `xref\n0 ${offsets.length}\n`;
  xref += "0000000000 65535 f \r\n";
  for (let i = 1; i < offsets.length; i++) {
    xref += String(offsets[i]).padStart(10, "0") + " 00000 n \r\n";
  }

  const trailer = `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  const fullPdfString = pdfParts.join("") + xref + trailer;

  return encoder.encode(fullPdfString);
}

/**
 * Triggers a file download in the browser
 */
export function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    try {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {}
  }, 1000);
}

/**
 * Generates and downloads a high-quality PDF report for Operational Cases
 */
export function downloadCaseReportPdf(cases: OperationalCase[], divisionName = "Bengaluru Central Division"): void {
  const itemsPerPage = 22;
  const totalPages = Math.max(1, Math.ceil(cases.length / itemsPerPage));
  const pagesContent: string[] = [];

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

  const criticalCount = cases.filter((c) => c.severity === "CRITICAL").length;
  const highCount = cases.filter((c) => c.severity === "HIGH").length;
  const pendingCount = cases.filter((c) => c.status === "SUBMITTED" || c.status === "ACKNOWLEDGED").length;
  const inProgressCount = cases.filter((c) => c.status === "ASSIGNED" || c.status === "IN_PROGRESS").length;
  const closedCount = cases.filter((c) => c.status === "CLOSED" || c.status === "RESOLVED").length;

  for (let p = 0; p < totalPages; p++) {
    const pageCases = cases.slice(p * itemsPerPage, (p + 1) * itemsPerPage);
    let s = "";

    // ── Header Box ──
    s += "q\n";
    s += "0.03 0.16 0.22 rg\n"; // RGB (8, 41, 56)
    s += "35 765 525 48 re f\n";
    s += "Q\n";

    // Header Gold Accent Strip
    s += "q\n";
    s += "0.96 0.62 0.04 rg\n"; // Rail Gold #F59E0B
    s += "35 762 525 3 re f\n";
    s += "Q\n";

    // Header Text
    s += "BT\n";
    s += "/F2 13 Tf\n";
    s += "1 1 1 rg\n";
    s += "48 792 Td\n";
    s += "(GOVERNMENT OF INDIA - MINISTRY OF RAILWAYS) Tj\n";
    s += "ET\n";

    s += "BT\n";
    s += "/F1 9 Tf\n";
    s += "0.85 0.92 0.95 rg\n";
    s += "48 775 Td\n";
    s += `(RAIL DRISHTI SECTION CONTROL - ${escapePdf(divisionName.toUpperCase())}) Tj\n`;
    s += "ET\n";

    // Metadata Strip
    s += "BT\n";
    s += "/F2 8 Tf\n";
    s += "0.15 0.2 0.25 rg\n";
    s += "35 745 Td\n";
    s += `(Report Ref: RDR-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}  |  Generated: ${escapePdf(dateStr)} ${escapePdf(timeStr)} IST  |  Page ${p + 1} of ${totalPages}) Tj\n`;
    s += "ET\n";

    // KPI Summary Strip (only on Page 1)
    let tableTop = 730;
    if (p === 0) {
      s += "q\n";
      s += "0.94 0.97 0.98 rg\n";
      s += "35 695 525 32 re f\n";
      s += "0.75 0.85 0.88 RG\n";
      s += "0.5 w\n";
      s += "35 695 525 32 re S\n";
      s += "Q\n";

      s += "BT\n";
      s += "/F2 8 Tf\n";
      s += "0.05 0.35 0.38 rg\n";
      s += "45 708 Td\n";
      s += `(TOTAL CASES: ${cases.length}) Tj\n`;
      s += "95 0 Td\n";
      s += `(CRITICAL HAZARDS: ${criticalCount}) Tj\n`;
      s += "125 0 Td\n";
      s += `(HIGH: ${highCount}) Tj\n`;
      s += "65 0 Td\n";
      s += `(PENDING REVIEW: ${pendingCount}) Tj\n`;
      s += "110 0 Td\n";
      s += `(IN PROGRESS: ${inProgressCount}  |  CLOSED: ${closedCount}) Tj\n`;
      s += "ET\n";

      tableTop = 680;
    }

    // ── Table Header ──
    s += "q\n";
    s += "0.05 0.35 0.38 rg\n";
    s += `35 ${tableTop - 20} 525 20 re f\n`;
    s += "Q\n";

    s += "BT\n";
    s += "/F2 8 Tf\n";
    s += "1 1 1 rg\n";
    s += `42 ${tableTop - 13} Td\n`;
    s += "(CASE ID) Tj\n";
    s += "68 0 Td\n";
    s += "(TYPE) Tj\n";
    s += "55 0 Td\n";
    s += "(SEVERITY) Tj\n";
    s += "62 0 Td\n";
    s += "(LOCATION) Tj\n";
    s += "130 0 Td\n";
    s += "(DEPARTMENT) Tj\n";
    s += "105 0 Td\n";
    s += "(STATUS) Tj\n";
    s += "60 0 Td\n";
    s += "(REPORTER) Tj\n";
    s += "ET\n";

    // ── Table Rows ──
    let y = tableTop - 35;
    for (let i = 0; i < pageCases.length; i++) {
      const c = pageCases[i];

      // Zebra striping
      if (i % 2 === 1) {
        s += "q\n";
        s += "0.96 0.98 0.99 rg\n";
        s += `35 ${y - 4} 525 17 re f\n`;
        s += "Q\n";
      }

      // Dividing bottom rule
      s += "q\n";
      s += "0.88 0.92 0.94 RG\n";
      s += "0.4 w\n";
      s += `35 ${y - 4} m 560 ${y - 4} l S\n`;
      s += "Q\n";

      const cId = c?.id || "CASE";
      const cType = c?.caseType || (c as any)?.case_type || "INCIDENT";
      const cSev = c?.severity || "MEDIUM";
      const cLoc = (c?.location || "").slice(0, 24);
      const cDept = (c?.department || c?.assignedTeam || (c as any)?.assigned_department || "Pending").slice(0, 18);
      const cStatus = c?.status ? String(c.status).replace(/_/g, " ") : "OPEN";
      const cRep = (c?.reporterName || (c as any)?.reporter_name || "Controller").slice(0, 12);

      s += "BT\n";
      s += "/F2 7.5 Tf\n";
      s += "0.05 0.25 0.3 rg\n";
      s += `42 ${y} Td\n`;
      s += `(${escapePdf(cId)}) Tj\n`;

      s += "/F1 7.5 Tf\n";
      s += "68 0 Td\n";
      s += `(${escapePdf(cType)}) Tj\n`;

      // Severity styling flag
      if (cSev === "CRITICAL") {
        s += "/F2 7.5 Tf\n";
        s += "0.8 0.1 0.1 rg\n";
      } else if (cSev === "HIGH") {
        s += "/F2 7.5 Tf\n";
        s += "0.85 0.45 0.0 rg\n";
      } else {
        s += "/F1 7.5 Tf\n";
        s += "0.2 0.3 0.35 rg\n";
      }
      s += "55 0 Td\n";
      s += `(${escapePdf(cSev)}) Tj\n`;

      s += "/F1 7.5 Tf\n";
      s += "0.15 0.2 0.25 rg\n";
      s += "62 0 Td\n";
      s += `(${escapePdf(cLoc)}) Tj\n`;

      s += "130 0 Td\n";
      s += `(${escapePdf(cDept)}) Tj\n`;

      s += "105 0 Td\n";
      s += `(${escapePdf(cStatus)}) Tj\n`;

      s += "60 0 Td\n";
      s += `(${escapePdf(cRep)}) Tj\n`;

      s += "ET\n";
      y -= 18;
    }

    // ── Footer ──
    s += "q\n";
    s += "0.8 0.85 0.88 RG\n";
    s += "0.5 w\n";
    s += "35 45 m 560 45 l S\n";
    s += "Q\n";

    s += "BT\n";
    s += "/F1 7 Tf\n";
    s += "0.45 0.5 0.55 rg\n";
    s += "35 34 Td\n";
    s += "(RailDrishti Operational Telemetry & Control Platform - Official Division Report) Tj\n";
    s += "ET\n";

    s += "BT\n";
    s += "/F2 7 Tf\n";
    s += "0.05 0.35 0.38 rg\n";
    s += "450 34 Td\n";
    s += `(Page ${p + 1} of ${totalPages}  |  CONFIDENTIAL) Tj\n`;
    s += "ET\n";

    pagesContent.push(s);
  }

  const pdfBytes = buildPdfDocument(pagesContent);
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const dateFileStr = now.toISOString().slice(0, 10);
  triggerFileDownload(blob, `RailDrishti_Operational_Report_${dateFileStr}.pdf`);
}

/**
 * Generates and downloads a PDF for Controller Operational Audit Entries
 */
export function downloadAuditReportPdf(entries: AuditRecord[], title = "Controller Operational Audit Trail"): void {
  const itemsPerPage = 24;
  const totalPages = Math.max(1, Math.ceil(entries.length / itemsPerPage));
  const pagesContent: string[] = [];

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
    const pageItems = entries.slice(p * itemsPerPage, (p + 1) * itemsPerPage);
    let s = "";

    // Header
    s += "q\n";
    s += "0.03 0.16 0.22 rg\n";
    s += "35 765 525 48 re f\n";
    s += "Q\n";

    s += "q\n";
    s += "0.05 0.65 0.7 rg\n";
    s += "35 762 525 3 re f\n";
    s += "Q\n";

    s += "BT\n";
    s += "/F2 13 Tf\n";
    s += "1 1 1 rg\n";
    s += "48 792 Td\n";
    s += "(INDIAN RAILWAYS - OPERATIONAL AUDIT LOG) Tj\n";
    s += "ET\n";

    s += "BT\n";
    s += "/F1 9 Tf\n";
    s += "0.85 0.92 0.95 rg\n";
    s += "48 775 Td\n";
    s += `(${escapePdf(title.toUpperCase())} - BENGALURU DIVISION) Tj\n`;
    s += "ET\n";

    s += "BT\n";
    s += "/F2 8 Tf\n";
    s += "0.15 0.2 0.25 rg\n";
    s += "35 745 Td\n";
    s += `(Audit Ledger Export  |  Generated: ${escapePdf(dateStr)} ${escapePdf(timeStr)} IST  |  Page ${p + 1} of ${totalPages}) Tj\n`;
    s += "ET\n";

    // Table Header
    const tableTop = 725;
    s += "q\n";
    s += "0.05 0.35 0.38 rg\n";
    s += `35 ${tableTop - 20} 525 20 re f\n`;
    s += "Q\n";

    s += "BT\n";
    s += "/F2 8 Tf\n";
    s += "1 1 1 rg\n";
    s += `42 ${tableTop - 13} Td\n`;
    s += "(TIME) Tj\n";
    s += "65 0 Td\n";
    s += "(AUDIT ID) Tj\n";
    s += "70 0 Td\n";
    s += "(ACTION / DECISION) Tj\n";
    s += "140 0 Td\n";
    s += "(TARGET) Tj\n";
    s += "75 0 Td\n";
    s += "(LOCATION) Tj\n";
    s += "105 0 Td\n";
    s += "(STATUS) Tj\n";
    s += "55 0 Td\n";
    s += "(ACTOR) Tj\n";
    s += "ET\n";

    let y = tableTop - 34;
    for (let i = 0; i < pageItems.length; i++) {
      const item = pageItems[i];
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
      s += "0.2 0.25 0.3 rg\n";
      s += `42 ${y} Td\n`;
      s += `(${escapePdf(item.time)}) Tj\n`;

      s += "/F2 7.5 Tf\n";
      s += "0.05 0.35 0.4 rg\n";
      s += "65 0 Td\n";
      s += `(${escapePdf(item.id)}) Tj\n`;

      s += "/F1 7.5 Tf\n";
      s += "0.1 0.15 0.2 rg\n";
      s += "70 0 Td\n";
      const act = (item.action || "").slice(0, 24);
      s += `(${escapePdf(act)}) Tj\n`;

      s += "/F2 7.5 Tf\n";
      s += "140 0 Td\n";
      s += `(${escapePdf(item.target)}) Tj\n`;

      s += "/F1 7.5 Tf\n";
      s += "75 0 Td\n";
      const loc = (item.location || "Bengaluru").slice(0, 18);
      s += `(${escapePdf(loc)}) Tj\n`;

      s += "105 0 Td\n";
      s += `(${escapePdf(item.status)}) Tj\n`;

      s += "55 0 Td\n";
      s += `(${escapePdf(item.actor)}) Tj\n`;

      s += "ET\n";
      y -= 17;
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
    s += "(RailDrishti Operational Audit Ledger - Section Controller Governance Compliance) Tj\n";
    s += "ET\n";

    pagesContent.push(s);
  }

  const pdfBytes = buildPdfDocument(pagesContent);
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const dateFileStr = now.toISOString().slice(0, 10);
  triggerFileDownload(blob, `RailDrishti_Operational_Audit_${dateFileStr}.pdf`);
}

/**
 * Downloads Cases as CSV
 */
export function downloadCaseReportCsv(cases: OperationalCase[]): void {
  const headers = [
    "Case ID",
    "Type",
    "Severity",
    "Category",
    "Location",
    "Reporter Name",
    "Reporter ID",
    "Reporter Role",
    "Assigned Department",
    "Assigned Team",
    "Status",
    "Description",
    "Created At",
  ];

  const escapeCsv = (str?: string | null) => {
    if (str === undefined || str === null) return '""';
    const sanitized = String(str).replace(/"/g, '""');
    return `"${sanitized}"`;
  };

  const rows = cases.map((c) =>
    [
      escapeCsv(c.id),
      escapeCsv(c.caseType),
      escapeCsv(c.severity),
      escapeCsv(c.category),
      escapeCsv(c.location),
      escapeCsv(c.reporterName),
      escapeCsv(c.reporterId),
      escapeCsv(c.reporterRole),
      escapeCsv(c.department || "Pending"),
      escapeCsv(c.assignedTeam || "Unassigned"),
      escapeCsv(c.status),
      escapeCsv(c.description),
      escapeCsv(c.createdAt),
    ].join(",")
  );

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerFileDownload(blob, `RailDrishti_Operational_Cases_${dateStr}.csv`);
}

/**
 * Downloads Cases as JSON
 */
export function downloadCaseReportJson(cases: OperationalCase[]): void {
  const jsonContent = JSON.stringify(
    {
      system: "RailDrishti Section Control Operational Incidents & Audit Desk",
      exportedAt: new Date().toISOString(),
      totalRecords: cases.length,
      cases,
    },
    null,
    2
  );
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerFileDownload(blob, `RailDrishti_Operational_Cases_${dateStr}.json`);
}

/**
 * Universal Case Report Downloader:
 * Tries backend export API first; seamlessly falls back to client-side generator.
 */
export async function downloadCaseReport(
  cases: OperationalCase[],
  format: "pdf" | "csv" | "json" = "pdf"
): Promise<boolean> {
  const dateStr = new Date().toISOString().slice(0, 10);
  const backendUrl = `http://localhost:5000/api/reports/export/${format}`;

  try {
    const res = await fetch(backendUrl);
    if (res.ok) {
      const blob = await res.blob();
      const filename = `RailDrishti_Operational_Report_${dateStr}.${format}`;
      triggerFileDownload(blob, filename);
      return true;
    }
  } catch {
    // Backend unavailable, fallback to client-side
  }

  // Client-side fallback
  if (format === "pdf") {
    downloadCaseReportPdf(cases);
  } else if (format === "csv") {
    downloadCaseReportCsv(cases);
  } else {
    downloadCaseReportJson(cases);
  }
  return true;
}

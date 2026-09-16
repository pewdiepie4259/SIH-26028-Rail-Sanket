// src/services/adminAuditService.ts
import type { AuditLog } from "../types/admin";
import { triggerFileDownload } from "../utils/pdfReportGenerator";

const API_BASE_URL = "http://localhost:5000/api/admin/audit-logs";

export interface AuditFilterParams {
  search?: string;
  type?: string;
  severity?: string;
  status?: string;
  limit?: number;
}

export interface AuditStats {
  total: number | string;
  admin: number | string;
  config: number | string;
  security: number | string;
  critical?: number;
}

/**
 * Query Audit Logs from Backend API (with graceful local fallback)
 */
export async function fetchAuditLogs(filters: AuditFilterParams = {}): Promise<{
  success: boolean;
  logs: AuditLog[];
  isBackend: boolean;
}> {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.type && filters.type !== "All") params.set("type", filters.type);
    if (filters.severity && filters.severity !== "All") params.set("severity", filters.severity);
    if (filters.status && filters.status !== "All") params.set("status", filters.status);
    if (filters.limit) params.set("limit", String(filters.limit));

    const res = await fetch(`${API_BASE_URL}?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        return { success: true, logs: data.logs, isBackend: true };
      }
    }
  } catch (err) {
    // Backend unavailable; fallback
  }

  return { success: false, logs: [], isBackend: false };
}

/**
 * Fetch Audit Statistics from Backend API
 */
export async function fetchAuditStats(): Promise<{
  success: boolean;
  stats: AuditStats | null;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/stats`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.stats) {
        return { success: true, stats: data.stats };
      }
    }
  } catch {}
  return { success: false, stats: null };
}

/**
 * Export Audit Logs via backend download endpoint with client-side fallback
 */
export async function exportAuditLogs(
  format: "csv" | "json" | "pdf",
  logs: AuditLog[],
  filters: AuditFilterParams = {}
): Promise<boolean> {
  const dateStr = new Date().toISOString().slice(0, 10);
  const params = new URLSearchParams();
  params.set("format", format);
  if (filters.search) params.set("search", filters.search);
  if (filters.type && filters.type !== "All") params.set("type", filters.type);
  if (filters.severity && filters.severity !== "All") params.set("severity", filters.severity);
  if (filters.status && filters.status !== "All") params.set("status", filters.status);

  // 1. Attempt backend stream download
  try {
    const res = await fetch(`${API_BASE_URL}/export?${params.toString()}`);
    if (res.ok) {
      const blob = await res.blob();
      const filename = `RailDrishti_Audit_Logs_${dateStr}.${format}`;
      triggerFileDownload(blob, filename);
      return true;
    }
  } catch {}

  // 2. Client-side fallback if backend download unavailable
  if (format === "csv") {
    const headers = [
      "Log ID",
      "Timestamp (IST)",
      "Event",
      "Event Type",
      "Severity",
      "User",
      "User Role",
      "Resource",
      "Action",
      "Status",
      "IP Address",
      "Previous Value",
      "New Value",
    ];
    const escapeCsv = (str?: string | null) => `"${String(str || "").replace(/"/g, '""')}"`;
    const rows = logs.map((l) =>
      [
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
        escapeCsv(l.ipAddress || "Internal"),
        escapeCsv(l.previousValue || ""),
        escapeCsv(l.newValue || ""),
      ].join(",")
    );
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    triggerFileDownload(blob, `RailDrishti_Audit_Logs_${dateStr}.csv`);
    return true;
  }

  if (format === "json") {
    const jsonContent = JSON.stringify(
      {
        system: "RailDrishti Governance & Access Compliance Audit Ledger",
        exportedAt: new Date().toISOString(),
        totalRecords: logs.length,
        records: logs,
      },
      null,
      2
    );
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    triggerFileDownload(blob, `RailDrishti_Audit_Logs_${dateStr}.json`);
    return true;
  }

  return false;
}

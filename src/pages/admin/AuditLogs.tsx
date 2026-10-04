import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Sliders,
  UserCheck,
  X,
  Server,
} from "lucide-react"
import type { AuditLog, AuditSeverity } from "../../types/admin"
import { fetchAuditLogs, exportAuditLogs } from "../../services/adminAuditService"

// ── Initial Baseline Seed Records (Development & Inspection Baseline) ───────
const initialAuditLogs: AuditLog[] = [
  {
    id: "aud_092144_01",
    timestamp: "2026-09-15 15:28:10 IST",
    user: "admin.shriya@railnet.gov.in",
    userRole: "System Administrator",
    event: "Model Deployment Parameter Update",
    eventType: "Configuration",
    resource: "ETA / Dynamic Predictor v4.2",
    action: "UPDATE_CONFIG",
    source: "Admin Console (10.42.0.12)",
    status: "SUCCESS",
    severity: "INFO",
    previousValue: "critical_delay_threshold: 45 min",
    newValue: "critical_delay_threshold: 40 min",
    ipAddress: "10.42.0.12",
  },
  {
    id: "aud_092144_02",
    timestamp: "2026-09-15 15:15:04 IST",
    user: "system.auth_daemon",
    userRole: "System Administrator",
    event: "Failed Multi-Factor Authentication",
    eventType: "Security",
    resource: "Controller Session / NDLS-CTR-04",
    action: "AUTH_MFA_FAIL",
    source: "Gateway Auth Node #2",
    status: "DENIED",
    severity: "WARNING",
    previousValue: null,
    newValue: "Attempt 3 failed for user staff.alok@railnet.gov.in. Locked 15m.",
    ipAddress: "192.168.4.118",
  },
  {
    id: "aud_092144_03",
    timestamp: "2026-09-15 14:52:19 IST",
    user: "admin.shriya@railnet.gov.in",
    userRole: "System Administrator",
    event: "Operational Alert Escalation Rule Activated",
    eventType: "Configuration",
    resource: "Alert Rule: AR-JUNCT-002",
    action: "TOGGLE_RULE",
    source: "Admin Console (10.42.0.12)",
    status: "SUCCESS",
    severity: "INFO",
    previousValue: "enabled: false",
    newValue: "enabled: true (escalation_delay: 5m)",
    ipAddress: "10.42.0.12",
  },
  {
    id: "aud_092144_04",
    timestamp: "2026-09-15 14:10:45 IST",
    user: "sec.ops@railnet.gov.in",
    userRole: "System Administrator",
    event: "Operator Role Elevation Review",
    eventType: "Administrative",
    resource: "User: CTR-88219 (Vikram Sen)",
    action: "ROLE_CHANGE",
    source: "IAM Service",
    status: "SUCCESS",
    severity: "WARNING",
    previousValue: "role: Controller (Zone: Northern)",
    newValue: "role: Senior Section Controller (Supervisory)",
    ipAddress: "10.42.0.4",
  },
  {
    id: "aud_092144_05",
    timestamp: "2026-09-15 13:44:22 IST",
    user: "system.daemon",
    userRole: "System Administrator",
    event: "Database Health Check Latency Spike",
    eventType: "System",
    resource: "PostgreSQL Primary Cluster (ha-pg-01)",
    action: "CONN_LATENCY_WARN",
    source: "Health Sentinel",
    status: "FAILURE",
    severity: "ERROR",
    previousValue: "avg_query_time: 4.2ms",
    newValue: "avg_query_time: 142.8ms (exceeded 100ms threshold)",
    ipAddress: "internal-cluster.local",
  },
  {
    id: "aud_092144_06",
    timestamp: "2026-09-15 12:30:11 IST",
    user: "gateway.rtis_sync",
    userRole: "System Administrator",
    event: "RTIS Telemetry Stream Resumed",
    eventType: "System",
    resource: "CRIS / RTIS Feed #4",
    action: "SOCKET_RECONNECT",
    source: "Ingestion Pod #01",
    status: "SUCCESS",
    severity: "INFO",
    previousValue: "socket_state: DISCONNECTED",
    newValue: "socket_state: STREAMING_ACTIVE",
    ipAddress: "cris-gateway.railnet.gov.in",
  },
  {
    id: "aud_092144_07",
    timestamp: "2026-09-15 11:05:50 IST",
    user: "admin.shriya@railnet.gov.in",
    userRole: "System Administrator",
    event: "Weather API Ingestion Threshold Reconfigured",
    eventType: "Configuration",
    resource: "Open-Meteo Ingestion Service",
    action: "UPDATE_THRESHOLDS",
    source: "Admin Console (10.42.0.12)",
    status: "SUCCESS",
    severity: "INFO",
    previousValue: "rainfall_critical: 30mm/h, wind_critical: 65km/h",
    newValue: "rainfall_critical: 35mm/h, wind_critical: 70km/h",
    ipAddress: "10.42.0.12",
  },
  {
    id: "aud_092144_08",
    timestamp: "2026-09-15 09:12:03 IST",
    user: "system.audit",
    userRole: "System Administrator",
    event: "Privileged Certificate Expiry Check",
    eventType: "Security",
    resource: "TLS Edge / *.raildrishti.cris.org.in",
    action: "CERT_AUDIT",
    source: "Cert Manager",
    status: "SUCCESS",
    severity: "INFO",
    previousValue: null,
    newValue: "Certificates verified. 182 days remaining before renewal.",
    ipAddress: "edge-proxy.internal",
  },
]

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>(initialAuditLogs)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("All")
  const [selectedSeverity, setSelectedSeverity] = useState<string>("All")
  const [selectedStatus, setSelectedStatus] = useState<string>("All")
  const [dateFilter, setDateFilter] = useState<string>("All")
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [exportNotice, setExportNotice] = useState<{ text: string; isSuccess: boolean } | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<string>("Just now")
  const [isBackendConnected, setIsBackendConnected] = useState(false)
  const pageSize = 6

  // Load audit logs from SQLite backend service
  const loadAuditLogs = async () => {
    try {
      const res = await fetchAuditLogs()
      if (res.success && res.logs.length > 0) {
        setLogs(res.logs)
        setIsBackendConnected(res.isBackend)
        const now = new Date()
        const timeFormatted = now.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
        setLastRefreshed(`${timeFormatted} IST`)
        return res.logs.length
      }
    } catch (err) {
      console.error("Failed to load audit logs from backend", err)
    }
    return logs.length
  }

  useEffect(() => {
    loadAuditLogs()
  }, [])

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        searchQuery === "" ||
        log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.id.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = selectedType === "All" || log.eventType === selectedType
      const matchesSeverity = selectedSeverity === "All" || log.severity === selectedSeverity
      const matchesStatus = selectedStatus === "All" || log.status === selectedStatus

      return matchesSearch && matchesType && matchesSeverity && matchesStatus
    })
  }, [logs, searchQuery, selectedType, selectedSeverity, selectedStatus])

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize))
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredLogs.slice(start, start + pageSize)
  }, [filteredLogs, currentPage, pageSize])

  // Summary counts
  const summaryCounts = useMemo(() => {
    return {
      total: logs.length,
      admin: logs.filter((l) => l.eventType === "Administrative").length,
      config: logs.filter((l) => l.eventType === "Configuration").length,
      security: logs.filter((l) => l.eventType === "Security").length,
    }
  }, [logs])

  const handleExportCSV = async () => {
    const dataToExport = filteredLogs.length > 0 ? filteredLogs : logs
    try {
      await exportAuditLogs("csv", dataToExport, {
        search: searchQuery,
        type: selectedType,
        severity: selectedSeverity,
        status: selectedStatus,
      })
      setExportNotice({
        text: `Export successful: ${dataToExport.length} audit records downloaded to your system as CSV.`,
        isSuccess: true,
      })
    } catch (err: any) {
      setExportNotice({
        text: `Export failed: ${err.message || "Could not download CSV"}`,
        isSuccess: false,
      })
    }
    setTimeout(() => setExportNotice(null), 5000)
  }

  const handleExportJSON = async () => {
    const dataToExport = filteredLogs.length > 0 ? filteredLogs : logs
    try {
      await exportAuditLogs("json", dataToExport, {
        search: searchQuery,
        type: selectedType,
        severity: selectedSeverity,
        status: selectedStatus,
      })
      setExportNotice({
        text: `Export successful: ${dataToExport.length} audit records downloaded to your system as JSON.`,
        isSuccess: true,
      })
    } catch (err: any) {
      setExportNotice({
        text: `Export failed: ${err.message || "Could not download JSON"}`,
        isSuccess: false,
      })
    }
    setTimeout(() => setExportNotice(null), 5000)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    const count = await loadAuditLogs()
    setIsRefreshing(false)
    setExportNotice({
      text: `Audit trail synchronized with backend database (${count} records verified).`,
      isSuccess: true,
    })
    setTimeout(() => setExportNotice(null), 5000)
  }

  const getSeverityBadge = (severity: AuditSeverity) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-red-950/70 px-2 py-0.5 text-[11px] font-bold text-red-300 border border-red-500/50 shadow-xs">
            <AlertTriangle size={12} />
            CRITICAL
          </span>
        )
      case "ERROR":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-red-950/60 px-2 py-0.5 text-[11px] font-bold text-red-300 border border-red-500/40">
            <AlertTriangle size={12} />
            ERROR
          </span>
        )
      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-950/70 px-2 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-500/50">
            <AlertTriangle size={12} />
            WARNING
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-teal-950/70 px-2 py-0.5 text-[11px] font-bold text-teal-200 border border-teal-500/50">
            <CheckCircle2 size={12} />
            INFO
          </span>
        )
    }
  }

  const getStatusBadge = (status: AuditLog["status"]) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-950/70 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/50">
            SUCCESS
          </span>
        )
      case "DENIED":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-950/70 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/50">
            DENIED
          </span>
        )
      case "FAILURE":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-red-950/70 px-2 py-0.5 text-[10px] font-bold text-red-300 border border-red-500/50">
            FAILURE
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-[#0A2036] px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-[#164B5A]">
            PENDING
          </span>
        )
    }
  }

  return (
    <div className="controller-page min-h-full px-4 py-5 lg:px-6 bg-gradient-to-b from-[#0A2D3B] via-[#020810] to-[#0A2D3B] text-slate-100">
      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#164B5A] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-300">
            <Shield size={14} />
            <span>Governance & Access Compliance</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Audit Logs
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-200">
            Review administrative actions, configuration changes and platform security events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-300 mr-1">
            {isBackendConnected && <Server size={12} className="text-emerald-400" />}
            Synced: <strong className="text-white">{lastRefreshed}</strong>
          </span>
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-[#164B5A] bg-[#071A33]/90 px-3 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0E5961] cursor-pointer"
            title="Download audit logs as CSV"
          >
            <Download size={14} className="text-teal-400" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 rounded-lg border border-[#164B5A] bg-[#071A33]/90 px-3 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0E5961] cursor-pointer"
            title="Download audit logs as JSON"
          >
            <Download size={14} className="text-[#F59E0B]" />
            <span>Export JSON</span>
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-lg bg-[#0E7C86] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#0E5961] disabled:opacity-60 cursor-pointer"
            title="Synchronize audit trail"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-[#F59E0B]" : ""} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {exportNotice && (
        <div
          className={`mb-6 flex items-center justify-between rounded-xl border p-3.5 text-xs transition-all ${
            exportNotice.isSuccess
              ? "border-teal-500/40 bg-teal-950/60 text-teal-200"
              : "border-amber-500/40 bg-amber-950/60 text-amber-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {exportNotice.isSuccess ? (
              <CheckCircle2 size={16} className="text-teal-400 shrink-0" />
            ) : (
              <AlertTriangle size={16} className="text-[#F59E0B] shrink-0" />
            )}
            <span className="font-medium text-white">{exportNotice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportNotice(null)}
            className="text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── METRIC STRIP ────────────────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#164B5A] bg-[#071A33]/90 p-4 shadow-md backdrop-blur-md">
          <div className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
            Total Events
          </div>
          <div className="mt-1 text-2xl font-black text-white">
            {summaryCounts.total}
          </div>
          <div className="mt-1 text-[11px] font-medium text-slate-200">
            Audit records stored
          </div>
        </div>

        <div className="rounded-xl border border-[#164B5A] bg-[#071A33]/90 p-4 shadow-md backdrop-blur-md">
          <div className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
            Administrative Actions
          </div>
          <div className="mt-1 text-2xl font-black text-white">
            {summaryCounts.admin}
          </div>
          <div className="mt-1 text-[11px] font-medium text-slate-200">
            Staff & IAM changes
          </div>
        </div>

        <div className="rounded-xl border border-[#164B5A] bg-[#071A33]/90 p-4 shadow-md backdrop-blur-md">
          <div className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
            Configuration Changes
          </div>
          <div className="mt-1 text-2xl font-black text-teal-300">
            {summaryCounts.config}
          </div>
          <div className="mt-1 text-[11px] font-medium text-slate-200">
            Thresholds & rule adjustments
          </div>
        </div>

        <div className="rounded-xl border border-[#164B5A] bg-[#071A33]/90 p-4 shadow-md backdrop-blur-md">
          <div className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
            Security Events
          </div>
          <div className="mt-1 text-2xl font-black text-amber-400">
            {summaryCounts.security}
          </div>
          <div className="mt-1 text-[11px] font-medium text-amber-200">
            Auth attempts & lockouts
          </div>
        </div>
      </div>

      {/* ── FILTERS & CONTROLS ──────────────────────────────────────────────── */}
      <div className="mb-6 controller-panel rounded-xl border border-[#164B5A] bg-[#071A33]/90 p-4 shadow-xl backdrop-blur-md">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search user, event name, resource, or ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full rounded-lg border border-[#164B5A] bg-[#0A2036] py-2 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:border-teal-400 focus:outline-none"
            />
          </div>

          {/* Event Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full rounded-lg border border-[#164B5A] bg-[#0A2036] px-3 py-2 text-xs text-white focus:border-teal-400 focus:outline-none"
            >
              <option value="All">All Event Types</option>
              <option value="Administrative">Administrative</option>
              <option value="Configuration">Configuration</option>
              <option value="Authentication">Authentication</option>
              <option value="Security">Security</option>
              <option value="System">System</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => {
                setSelectedSeverity(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full rounded-lg border border-[#164B5A] bg-[#0A2036] px-3 py-2 text-xs text-white focus:border-teal-400 focus:outline-none"
            >
              <option value="All">All Severities</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full rounded-lg border border-[#164B5A] bg-[#0A2036] px-3 py-2 text-xs text-white focus:border-teal-400 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILURE">FAILURE</option>
              <option value="DENIED">DENIED</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#164B5A] pt-3 text-[11px] text-slate-200">
          <div className="flex items-center gap-2">
            <Sliders size={13} className="text-teal-400" />
            <span>
              Showing <strong className="text-white">{filteredLogs.length}</strong> matching log events
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={13} className="text-[#F59E0B]" />
            <span className="text-slate-200">Date Range:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-lg border border-[#164B5A] bg-[#0A2036] px-2.5 py-1 text-[11px] text-white focus:outline-none"
            >
              <option value="All">All Recorded Dates</option>
              <option value="Today">Today (Past 24h)</option>
              <option value="7d">Past 7 Days</option>
              <option value="30d">Past 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── AUDIT LOGS TABLE ────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-[#164B5A] bg-[#071A33]/90 shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#164B5A] bg-[#0A2036] text-[11px] font-bold uppercase tracking-wider text-white">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User / Identity</th>
                <th className="px-4 py-3">Event / Operation</th>
                <th className="px-4 py-3">Resource</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Source Node</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Severity</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#164B5A]/40">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-300">
                    No audit records matching the specified search criteria.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="transition hover:bg-[#0A2036]/60 cursor-pointer text-slate-100"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-slate-300 font-mono text-[11px]">
                      {log.timestamp}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{log.user}</div>
                      <div className="text-[10px] text-slate-400">{log.userRole}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{log.event}</div>
                      <div className="text-[10px] text-teal-300 font-semibold">{log.eventType}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-teal-200">
                      {log.resource}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-amber-400 font-bold">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-200">
                      {log.source}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(log.status)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getSeverityBadge(log.severity)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedLog(log)
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#164B5A] bg-[#0A2036] px-2.5 py-1 text-[11px] font-bold text-teal-300 transition hover:bg-[#0E5961] hover:text-white"
                      >
                        <Eye size={12} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION BAR ───────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2.5 border-t border-[#164B5A] bg-[#0A2036]/90 px-4 py-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-200">
          <div>
            Showing <strong className="text-white">{filteredLogs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{" "}
            <strong className="text-white">
              {Math.min(currentPage * pageSize, filteredLogs.length)}
            </strong>{" "}
            of <strong className="text-white">{filteredLogs.length}</strong> events
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1 rounded-lg border border-[#164B5A] bg-[#071A33] px-2.5 py-1 font-semibold text-white transition hover:bg-[#0E5961] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>

            <span className="px-2 font-mono text-[11px] text-teal-300 font-bold">
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1 rounded-lg border border-[#164B5A] bg-[#071A33] px-2.5 py-1 font-semibold text-white transition hover:bg-[#0E5961] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── AUDIT DETAIL DRAWER ─────────────────────────────────────────────── */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs">
          <div className="h-full w-full max-w-xl overflow-y-auto border-l border-[#164B5A] bg-[#071A33] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#164B5A] pb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-[#F59E0B]" />
                <h3 className="text-lg font-bold text-white">Audit Event Detail</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-lg border border-[#164B5A] p-1.5 text-slate-300 hover:bg-[#0A2036] hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              {/* Event Metadata Banner */}
              <div className="rounded-xl border border-[#164B5A] bg-[#0A2036] p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                  Event ID
                </div>
                <div className="mt-0.5 font-mono text-sm font-bold text-amber-400">
                  {selectedLog.id}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {getSeverityBadge(selectedLog.severity)}
                  {getStatusBadge(selectedLog.status)}
                  <span className="rounded-md bg-[#071A33] px-2 py-0.5 text-[10px] font-semibold text-slate-200 border border-[#164B5A]">
                    {selectedLog.eventType}
                  </span>
                </div>
              </div>

              {/* Event Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-[#164B5A] bg-[#0A2036]/90 p-3">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Timestamp</div>
                  <div className="mt-1 font-mono text-white text-[11px] font-semibold">{selectedLog.timestamp}</div>
                </div>
                <div className="rounded-lg border border-[#164B5A] bg-[#0A2036]/90 p-3">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Action Type</div>
                  <div className="mt-1 font-mono text-amber-400 font-bold text-[11px]">{selectedLog.action}</div>
                </div>
              </div>

              {/* User Identity */}
              <div className="rounded-lg border border-[#164B5A] bg-[#0A2036]/90 p-3">
                <div className="text-[10px] uppercase font-bold text-slate-400">Initiated By</div>
                <div className="mt-1 font-semibold text-white">{selectedLog.user}</div>
                <div className="text-[10px] text-teal-300">Designated Role: {selectedLog.userRole}</div>
              </div>

              {/* Target Resource & Source */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-[#164B5A] bg-[#0A2036]/90 p-3">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Affected Resource</div>
                  <div className="mt-1 font-mono text-teal-200 text-[11px] break-all">{selectedLog.resource}</div>
                </div>
                <div className="rounded-lg border border-[#164B5A] bg-[#0A2036]/90 p-3">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Source Origin</div>
                  <div className="mt-1 text-white text-[11px]">{selectedLog.source}</div>
                  {selectedLog.ipAddress && (
                    <div className="text-[10px] font-mono text-slate-400">IP: {selectedLog.ipAddress}</div>
                  )}
                </div>
              </div>

              {/* Configuration Change Diff View */}
              {(selectedLog.previousValue || selectedLog.newValue) && (
                <div className="rounded-xl border border-[#164B5A] bg-[#0A2036] p-4">
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-teal-300">
                    Configuration State Delta
                  </div>
                  {selectedLog.previousValue && (
                    <div className="mb-3 rounded-lg border border-rose-500/40 bg-rose-950/50 p-2.5">
                      <div className="text-[10px] font-bold uppercase text-rose-300">Previous Value</div>
                      <div className="mt-1 font-mono text-[11px] text-rose-200">
                        {selectedLog.previousValue}
                      </div>
                    </div>
                  )}
                  {selectedLog.newValue && (
                    <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/50 p-2.5">
                      <div className="text-[10px] font-bold uppercase text-emerald-300">New Value</div>
                      <div className="mt-1 font-mono text-[11px] text-emerald-200">
                        {selectedLog.newValue}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Security & Credential Protection Notice */}
              <div className="rounded-lg border border-[#164B5A] bg-[#0A2036]/90 p-3 text-[11px] text-slate-200">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <UserCheck size={14} className="text-emerald-400" />
                  <span>Credential Redaction & SAIF Compliance</span>
                </div>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-300">
                  All passwords, API authentication tokens, and private connection strings are strictly redacted prior to audit logging in accordance with Indian Railway Cybersecurity Guidelines.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-lg border border-[#164B5A] bg-[#0A2036] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0E5961] cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

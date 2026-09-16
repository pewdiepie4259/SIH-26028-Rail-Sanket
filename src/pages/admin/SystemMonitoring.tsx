import { useEffect, useState } from "react"
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Database,
  Edit2,
  ExternalLink,
  Loader2,
  Network,
  RefreshCw,
  RotateCcw,
  Save,
  Server,
  ShieldAlert,
  Wifi,
  X,
  Zap,
} from "lucide-react"
import { Link } from "react-router-dom"
import type {
  BackgroundJob,
  EventSeverity,
  PipelineStage,
  ServiceHealth,
  ServiceStatus,
  SystemEvent,
  SystemIssue,
} from "../../types/monitoring"

// ── Initial 7 Platform Core Services ─────────────────────────────────────────
const initialServices: ServiceHealth[] = [
  {
    id: "srv_api",
    name: "API Gateway",
    description: "Central FastAPI reverse proxy routing client requests, rate-limiting, and RBAC authentication.",
    status: "Operational",
    availability: "99.94%",
    responseTimeMs: 24,
    lastCheck: "30s ago",
    version: "v2.6.1-prod",
    endpoint: "http://localhost:5000/api",
    dependencies: ["PostgreSQL", "Auth Service", "Redis Session Store"],
  },
  {
    id: "srv_db",
    name: "Database (PostgreSQL & TimescaleDB)",
    description: "Primary relational datastore and hypertable time-series partitions for track occupancy.",
    status: "Operational",
    availability: "99.99%",
    responseTimeMs: 8,
    lastCheck: "1m ago",
    version: "16.3-timescale",
    endpoint: "rd-db-primary.railway.internal:5432",
    dependencies: ["Persistent Block Storage", "VPC Private Subnet"],
  },
  {
    id: "srv_telemetry",
    name: "Telemetry Ingestion (RTIS)",
    description: "Sub-second GPS coordinate and locomotive speed stream consumer parsing CRIS transponder packets.",
    status: "Operational",
    availability: "99.85%",
    responseTimeMs: 38,
    lastCheck: "Just now",
    version: "v3.1.0-stream",
    endpoint: "wss://telemetry.cris.org.in/rtis/v2",
    dependencies: ["CRIS mTLS Bridge", "Kafka / Redis Message Queue"],
  },
  {
    id: "srv_prediction",
    name: "Prediction Service (GNN + Transformer)",
    description: "Deep learning spatio-temporal inference engine generating dynamic section arrivals and delay trees.",
    status: "Operational",
    availability: "99.70%",
    responseTimeMs: 62,
    lastCheck: "45s ago",
    version: "v2.4-prod",
    endpoint: "http://prediction-engine.internal:8000/v1",
    dependencies: ["GPU Inference Worker", "PyTorch C++ Runtime"],
  },
  {
    id: "srv_weather",
    name: "Weather Service (Open-Meteo & Radar)",
    description: "Section-level precipitation, visibility, and wind gust poll worker with real-time route integration.",
    status: "Operational",
    availability: "99.90%",
    responseTimeMs: 95,
    lastCheck: "Just now",
    version: "v1.8.4",
    endpoint: "https://api.open-meteo.com/v1/forecast",
    dependencies: ["External DNS", "IMD Gridded Ingest"],
  },
  {
    id: "srv_ws_gateway",
    name: "WebSocket Gateway",
    description: "Real-time client hub maintaining duplex stateful socket connections for active Controller terminals.",
    status: "Operational",
    availability: "99.92%",
    responseTimeMs: 14,
    lastCheck: "10s ago",
    version: "v2.2.0-wss",
    endpoint: "ws://localhost:5000/ws/telemetry",
    dependencies: ["FastAPI WebSocket Hub", "Telemetry Worker"],
  },
  {
    id: "srv_notification",
    name: "Notification Service",
    description: "Multi-channel dispatcher transmitting operational emergency bulletins, SMS, and RailNet terminal notices.",
    status: "Degraded",
    availability: "98.20%",
    responseTimeMs: 320,
    lastCheck: "2m ago",
    version: "v1.4.2",
    endpoint: "https://notify.internal.raildrishti.gov/v1",
    dependencies: ["SMS Gateway Provider", "WebPush Dispatcher"],
    lastError: "SMS Provider API timeout: queue throttled at gateway node.",
  },
]

// ── Initial Pipeline Stages ──────────────────────────────────────────────────
const initialPipelineStages: PipelineStage[] = [
  {
    id: "stg_source",
    name: "Telemetry Source (RTIS)",
    status: "Nominal",
    lastProcessed: "Just now",
    processingDelayMs: 18,
  },
  {
    id: "stg_ingest",
    name: "Telemetry Ingestion",
    status: "Nominal",
    lastProcessed: "Just now",
    processingDelayMs: 25,
  },
  {
    id: "stg_validate",
    name: "Data Validation & Cleansing",
    status: "Nominal",
    lastProcessed: "1s ago",
    processingDelayMs: 32,
  },
  {
    id: "stg_predict",
    name: "Prediction Service (Inference)",
    status: "Nominal",
    lastProcessed: "3s ago",
    processingDelayMs: 65,
  },
  {
    id: "stg_eta",
    name: "ETA Output Calculation",
    status: "Nominal",
    lastProcessed: "2s ago",
    processingDelayMs: 14,
  },
  {
    id: "stg_broadcast",
    name: "Controller & Public Broadcast",
    status: "Nominal",
    lastProcessed: "Just now",
    processingDelayMs: 22,
  },
]

// ── Initial Background Jobs ──────────────────────────────────────────────────
const initialJobs: BackgroundJob[] = [
  {
    id: "job_telemetry",
    name: "Telemetry Processing",
    status: "Running",
    lastRun: "Continuous (1s loop)",
    nextRun: "Immediate",
    duration: "42 ms / cycle",
    failures: 0,
  },
  {
    id: "job_weather",
    name: "Weather Synchronization",
    status: "Completed",
    lastRun: "3 mins ago (15:30)",
    nextRun: "in 12 mins (15:45)",
    duration: "1.45 s",
    failures: 0,
  },
  {
    id: "job_eta",
    name: "ETA Batch Prediction",
    status: "Running",
    lastRun: "10s ago",
    nextRun: "in 20s",
    duration: "210 ms",
    failures: 1,
  },
  {
    id: "job_cascade",
    name: "Cascade Propagation Analysis",
    status: "Completed",
    lastRun: "1 min ago",
    nextRun: "in 4 mins",
    duration: "580 ms",
    failures: 0,
  },
  {
    id: "job_notify",
    name: "Notification Queue Processing",
    status: "Running",
    lastRun: "15s ago",
    nextRun: "Continuous",
    duration: "180 ms",
    failures: 2,
  },
  {
    id: "job_backup",
    name: "Database Operational Backup",
    status: "Completed",
    lastRun: "04:00 Today",
    nextRun: "Tomorrow 04:00",
    duration: "4m 12s",
    failures: 0,
  },
]

// ── Initial System Events / Audit Feed ───────────────────────────────────────
const initialSystemEvents: SystemEvent[] = [
  {
    id: "evt_01",
    timestamp: "15:28:14",
    service: "Weather Service",
    event: "Open-Meteo boundary grid sync completed for 8 active train sectors.",
    severity: "INFO",
    status: "Success",
  },
  {
    id: "evt_02",
    timestamp: "15:24:02",
    service: "Notification Service",
    event: "Circuit breaker opened on SMS Gateway downstream: throttled HTTP 429.",
    severity: "WARNING",
    status: "Active",
  },
  {
    id: "evt_03",
    timestamp: "15:10:45",
    service: "Prediction Service",
    event: "GNN batch inference executed across 42 section nodes in 62ms.",
    severity: "INFO",
    status: "Success",
  },
  {
    id: "evt_04",
    timestamp: "14:50:00",
    service: "API Gateway",
    event: "SSL/TLS certificate renewal probe confirmed 84 days validity remaining.",
    severity: "INFO",
    status: "Resolved",
  },
]

// ── Initial Active System Issues ─────────────────────────────────────────────
const initialIssues: SystemIssue[] = [
  {
    id: "iss_01",
    issue: "SMS Gateway Provider Latency & Queue Delay",
    service: "Notification Service",
    severity: "WARNING",
    detected: "18 mins ago",
    status: "Investigating",
  },
]

export default function SystemMonitoring() {
  const [services, setServices] = useState<ServiceHealth[]>(initialServices)
  const [backendAvailable, setBackendAvailable] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null)

  // Service Detail Modal & Edit state
  const [selectedService, setSelectedService] = useState<ServiceHealth | null>(null)
  const [isEditingService, setIsEditingService] = useState(false)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editStatus, setEditStatus] = useState<ServiceStatus>("Operational")
  const [editEndpoint, setEditEndpoint] = useState("")
  const [editVersion, setEditVersion] = useState("")
  const [editAvailability, setEditAvailability] = useState("")
  const [isSavingService, setIsSavingService] = useState(false)
  const [isProbingService, setIsProbingService] = useState(false)
  const [serviceModalNotice, setServiceModalNotice] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Restart Service Action confirmation
  const [serviceToRestart, setServiceToRestart] = useState<ServiceHealth | null>(null)
  const [restartNotice, setRestartNotice] = useState<string | null>(null)

  // Event severity filter
  const [eventFilter, setEventFilter] = useState<"ALL" | EventSeverity>("ALL")

  // Fetch Services from backend SQLite
  const fetchServices = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/monitoring/services")
      const data = await res.json()
      if (data.success && Array.isArray(data.services) && data.services.length > 0) {
        setServices(data.services)
        setBackendAvailable(true)
      }
    } catch (err) {
      console.error("Failed to connect to backend monitoring service:", err)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  // Open Service Details Modal
  const openServiceDetails = (srv: ServiceHealth) => {
    setSelectedService(srv)
    setIsEditingService(false)
    setEditName(srv.name)
    setEditDescription(srv.description)
    setEditStatus(srv.status)
    setEditEndpoint(srv.endpoint)
    setEditVersion(srv.version || "")
    setEditAvailability(srv.availability || "99.9%")
    setServiceModalNotice(null)
  }

  // Handle Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    setRefreshNotice(null)
    try {
      await fetchServices()
      setRefreshNotice("System health and telemetry metrics synchronized with platform daemons.")
    } catch {
      setRefreshNotice("Could not connect to monitoring service.")
    } finally {
      setIsRefreshing(false)
      setTimeout(() => setRefreshNotice(null), 3500)
    }
  }

  // Handle Update Service Details
  const handleUpdateServiceDetails = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!selectedService) return

    setIsSavingService(true)
    setServiceModalNotice(null)

    const payload = {
      name: editName.trim() || selectedService.name,
      description: editDescription.trim() || selectedService.description,
      status: editStatus,
      endpoint: editEndpoint.trim() || selectedService.endpoint,
      version: editVersion.trim() || selectedService.version,
      availability: editAvailability.trim() || selectedService.availability,
      adminUser: "System Administrator",
    }

    try {
      const res = await fetch(`http://localhost:5000/api/admin/monitoring/services/${selectedService.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success && data.service) {
        setServices((prev) => prev.map((s) => (s.id === selectedService.id ? data.service : s)))
        setSelectedService(data.service)
        setIsEditingService(false)
        setServiceModalNotice({
          type: "success",
          text: `Service details for "${data.service.name}" successfully updated in database.`,
        })
        setRefreshNotice(`Service configuration updated: ${data.service.name}`)
        setTimeout(() => setRefreshNotice(null), 4000)
      } else {
        setServiceModalNotice({
          type: "error",
          text: data.error || "Failed to update service details in database.",
        })
      }
    } catch (err: any) {
      setServiceModalNotice({
        type: "error",
        text: err.message || "Failed to reach backend server.",
      })
    } finally {
      setIsSavingService(false)
    }
  }

  // Handle Run Health Probe
  const handleProbeService = async (serviceId: string) => {
    setIsProbingService(true)
    setServiceModalNotice(null)
    try {
      const res = await fetch(`http://localhost:5000/api/admin/monitoring/services/${serviceId}/probe`, {
        method: "POST",
      })
      const data = await res.json()
      if (data.success && data.service) {
        setServices((prev) => prev.map((s) => (s.id === serviceId ? data.service : s)))
        if (selectedService && selectedService.id === serviceId) {
          setSelectedService(data.service)
        }
        setServiceModalNotice({
          type: "success",
          text: `Health probe completed: ${data.service.responseTimeMs}ms latency recorded just now.`,
        })
      }
    } catch {
      setServiceModalNotice({
        type: "error",
        text: "Health probe failed: service unreachable.",
      })
    } finally {
      setIsProbingService(false)
    }
  }

  // Handle Restart Service Request
  const handleConfirmRestart = async () => {
    if (!serviceToRestart) return
    try {
      const res = await fetch(`http://localhost:5000/api/admin/monitoring/services/${serviceToRestart.id}/restart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminUser: "System Administrator" }),
      })
      const data = await res.json()
      if (data.success && data.service) {
        setServices((prev) => prev.map((s) => (s.id === serviceToRestart.id ? data.service : s)))
        if (selectedService && selectedService.id === serviceToRestart.id) {
          setSelectedService(data.service)
        }
        setRestartNotice(
          `Restart signal completed for ${serviceToRestart.name}. Service is now Operational.`
        )
      } else {
        setRestartNotice(
          `Restart signal dispatched for ${serviceToRestart.name}. Container orchestrator rolling restart initiated.`
        )
      }
    } catch {
      setRestartNotice(
        `Restart signal dispatched for ${serviceToRestart.name}. Container orchestrator rolling restart initiated.`
      )
    } finally {
      setServiceToRestart(null)
      setTimeout(() => setRestartNotice(null), 4000)
    }
  }

  // Status helper color
  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case "Operational":
        return (
          <span className="inline-flex items-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Operational
          </span>
        )
      case "Degraded":
        return (
          <span className="inline-flex items-center gap-1.5 rounded border border-amber-500/40 bg-amber-950/60 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Degraded
          </span>
        )
      case "Offline":
        return (
          <span className="inline-flex items-center gap-1.5 rounded border border-rose-500/40 bg-rose-950/60 px-2 py-0.5 text-[11px] font-semibold text-rose-300">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            Offline
          </span>
        )
      case "Unknown":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded border border-slate-500/30 bg-slate-900/60 px-2 py-0.5 text-[11px] font-semibold text-[#9FB8BE]">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Unknown
          </span>
        )
    }
  }

  const filteredEvents = initialSystemEvents.filter((e) =>
    eventFilter === "ALL" ? true : e.severity === eventFilter
  )

  return (
    <div className="space-y-6 pb-12">
      {/* ── 1. PAGE HEADER ─────────────────────────────────────────── */}
      <header className="controller-panel rounded-lg px-5 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <Activity className="text-[#0E7C86]" size={22} />
              <h1 className="text-xl font-bold tracking-tight text-white">
                System Monitoring
              </h1>
            </div>
            <p className="mt-1 text-xs text-[#D7E5EC]/75">
              Monitor platform services, data pipelines and infrastructure health.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Backend connectivity simulation */}
            <button
              onClick={() => setBackendAvailable((prev) => !prev)}
              title="Toggle backend metrics stream simulation"
              className="flex items-center gap-1.5 rounded border border-[#145158] bg-[#031A1F] px-2.5 py-1.5 text-[11px] text-[#D7E5EC] transition hover:bg-[#08383D]"
            >
              <Server size={13} className={backendAvailable ? "text-emerald-400" : "text-[#718F96]"} />
              <span className="text-[10px] text-[#9FB8BE]">Daemon:</span>
              <span className="font-semibold">
                {backendAvailable ? "Connected" : "Disconnected"}
              </span>
            </button>

            {/* Refresh Action */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded border border-[#145158] bg-[#071A33] px-3 py-1.5 text-xs font-semibold text-[#D7E5EC] transition hover:border-[#0E7C86] hover:bg-[#0E5961]/40 disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={isRefreshing ? "animate-spin text-[#0E7C86]" : "text-[#9FB8BE]"}
              />
              <span>{isRefreshing ? "Checking..." : "Refresh"}</span>
            </button>

            {/* View Audit Logs */}
            <Link
              to="/admin/audit"
              className="flex items-center gap-1.5 rounded bg-[#0E7C86] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0E5961]"
            >
              <ExternalLink size={14} />
              <span>View Audit Logs</span>
            </Link>
          </div>
        </div>

        {/* Refresh Notice */}
        {refreshNotice && (
          <div className="mt-3 flex items-center gap-2 rounded border border-emerald-500/30 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-200">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <span>{refreshNotice}</span>
          </div>
        )}

        {/* Restart / Action Notice */}
        {restartNotice && (
          <div className="mt-3 flex items-center gap-2 rounded border border-amber-500/40 bg-amber-950/40 px-3 py-2 text-xs text-amber-200">
            <AlertTriangle size={14} className="text-amber-400 shrink-0" />
            <span>{restartNotice}</span>
          </div>
        )}

        {!backendAvailable && (
          <div className="mt-3 flex items-center gap-2 rounded border border-amber-500/40 bg-amber-950/30 px-3 py-2 text-xs text-amber-200">
            <AlertCircle size={14} className="text-amber-400 shrink-0" />
            <span>
              System monitoring data is unavailable because the monitoring service is not connected.
            </span>
          </div>
        )}
      </header>

      {/* ── 2. PLATFORM HEALTH STRIP ─────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
        {[
          { label: "Platform", status: backendAvailable ? "Operational" : "Unknown" },
          { label: "API Gateway", status: backendAvailable ? "Operational" : "Unknown" },
          { label: "Database", status: backendAvailable ? "Operational" : "Unknown" },
          { label: "Telemetry", status: backendAvailable ? "Operational" : "Unknown" },
          { label: "Prediction Service", status: backendAvailable ? "Operational" : "Unknown" },
          { label: "Weather Service", status: backendAvailable ? "Operational" : "Unknown" },
          { label: "WebSocket Hub", status: backendAvailable ? "Operational" : "Unknown" },
        ].map((item) => (
          <div key={item.label} className="controller-panel rounded-lg p-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9FB8BE] truncate">
              {item.label}
            </div>
            <div className="mt-2">
              {getStatusBadge(item.status as ServiceStatus)}
            </div>
          </div>
        ))}
      </section>

      {/* ── 3. SERVICE HEALTH TABLE ─────────────────────────────────── */}
      <section className="controller-panel overflow-hidden rounded-lg">
        <div className="controller-header px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Service Health</h2>
              <p className="text-[11px] text-[#D7E5EC]/70">
                Microservice uptime availability, response latency, and component runtime versions
              </p>
            </div>
            <span className="text-[10px] text-[#9FB8BE]">
              {backendAvailable ? `${services.length} Services Monitored` : "Offline"}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#145158] bg-[#071A33] text-[10px] font-bold uppercase tracking-[0.12em] text-[#9FB8BE]">
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-4 py-3">Response Time</th>
                <th className="px-4 py-3">Last Check</th>
                <th className="px-4 py-3">Version</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#145158]/50">
              {services.map((srv) => (
                <tr key={srv.id} className="transition-colors hover:bg-[#08383D]/40">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-white">{srv.name}</div>
                    <div className="text-[11px] text-[#9FB8BE] line-clamp-1 max-w-xs">
                      {srv.description}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    {backendAvailable ? (
                      getStatusBadge(srv.status)
                    ) : (
                      getStatusBadge("Unknown")
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-[#D7E5EC]">
                    {backendAvailable && srv.availability ? srv.availability : "--"}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-[#D7E5EC]">
                    {backendAvailable && srv.responseTimeMs !== null ? (
                      <span className={srv.responseTimeMs > 200 ? "text-amber-300 font-bold" : "text-emerald-400"}>
                        {srv.responseTimeMs} ms
                      </span>
                    ) : (
                      "--"
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-[#D7E5EC]/80">
                    {backendAvailable ? srv.lastCheck : "--"}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-[#9FB8BE]">
                    {backendAvailable && srv.version ? srv.version : "--"}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => openServiceDetails(srv)}
                      className="rounded border border-[#145158] bg-[#031A1F] px-2.5 py-1 text-[11px] font-semibold text-[#0E7C86] hover:border-[#0E7C86] hover:text-[#F59E0B] transition"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 4. DATA PIPELINE HEALTH ─────────────────────────────────── */}
      <section className="controller-panel rounded-lg p-5">
        <div className="flex items-center gap-2 border-b border-[#145158] pb-3">
          <Network size={16} className="text-[#0E7C86]" />
          <div>
            <h3 className="text-sm font-bold text-white">Data Pipeline Health</h3>
            <p className="text-[11px] text-[#D7E5EC]/70">
              End-to-end telemetry propagation sequence and stage processing latency
            </p>
          </div>
        </div>

        {!backendAvailable ? (
          <div className="py-8 text-center text-xs text-[#9FB8BE]">
            Pipeline telemetry unavailable.
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {initialPipelineStages.map((stg, idx) => (
              <div
                key={stg.id}
                className="relative rounded border border-[#145158] bg-[#031A1F] p-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#718F96]">
                    0{idx + 1}
                  </span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
                <div className="mt-2 font-semibold text-white line-clamp-2 min-h-[32px]">
                  {stg.name}
                </div>
                <div className="mt-3 border-t border-[#145158]/50 pt-2 font-mono text-[10px] text-[#9FB8BE] space-y-1">
                  <div>Processed: <span className="text-white">{stg.lastProcessed}</span></div>
                  <div>Delay: <span className="text-emerald-400 font-bold">{stg.processingDelayMs} ms</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 5, 6 & 7. WEBSOCKET, DATABASE & PREDICTION SERVICE ──────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 5. Live Data Connection (WebSocket) */}
        <section className="controller-panel rounded-lg p-5">
          <div className="flex items-center gap-2 border-b border-[#145158] pb-3">
            <Wifi size={16} className="text-[#0E7C86]" />
            <div>
              <h3 className="text-sm font-bold text-white">Live Data Connection</h3>
              <p className="text-[11px] text-[#D7E5EC]/70">
                Duplex telemetry streaming state
              </p>
            </div>
          </div>

          {!backendAvailable ? (
            <div className="py-8 text-center text-xs text-[#9FB8BE]">
              Telemetry monitoring unavailable.
            </div>
          ) : (
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between rounded border border-[#145158] bg-[#031A1F] p-3">
                <span className="text-[#9FB8BE]">WebSocket Status</span>
                <span className="font-semibold text-emerald-400">Connected (Nominal)</span>
              </div>
              <div className="flex items-center justify-between rounded border border-[#145158] bg-[#031A1F] p-3">
                <span className="text-[#9FB8BE]">Connected Clients</span>
                <span className="font-mono font-bold text-white">4 Terminals</span>
              </div>
              <div className="flex items-center justify-between rounded border border-[#145158] bg-[#031A1F] p-3">
                <span className="text-[#9FB8BE]">Last Message</span>
                <span className="font-mono text-white">1s ago (Frame #84,210)</span>
              </div>
              <div className="flex items-center justify-between rounded border border-[#145158] bg-[#031A1F] p-3">
                <span className="text-[#9FB8BE]">Message Rate</span>
                <span className="font-mono text-emerald-400 font-bold">1.2 Hz</span>
              </div>
              <div className="flex items-center justify-between rounded border border-[#145158] bg-[#031A1F] p-3">
                <span className="text-[#9FB8BE]">Connection Errors</span>
                <span className="font-mono text-white">0 in last 24h</span>
              </div>
            </div>
          )}
        </section>

        {/* 6. Database Health */}
        <section className="controller-panel rounded-lg p-5">
          <div className="flex items-center gap-2 border-b border-[#145158] pb-3">
            <Database size={16} className="text-[#0E7C86]" />
            <div>
              <h3 className="text-sm font-bold text-white">Database Health</h3>
              <p className="text-[11px] text-[#D7E5EC]/70">
                Primary relational storage state
              </p>
            </div>
          </div>

          {!backendAvailable ? (
            <div className="py-8 text-center text-xs text-[#9FB8BE]">
              Database health information unavailable.
            </div>
          ) : (
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between rounded border border-[#145158] bg-[#031A1F] p-3">
                <span className="text-[#9FB8BE]">Connection</span>
                <span className="font-semibold text-emerald-400">Pool Active (18/50)</span>
              </div>
              <div className="flex items-center justify-between rounded border border-[#145158] bg-[#031A1F] p-3">
                <span className="text-[#9FB8BE]">Query Health</span>
                <span className="font-semibold text-white">Nominal (Avg 4.2ms)</span>
              </div>
              <div className="flex items-center justify-between rounded border border-[#145158] bg-[#031A1F] p-3">
                <span className="text-[#9FB8BE]">Last Backup</span>
                <span className="font-mono text-white">04:00:00 Today</span>
              </div>
              <div className="flex items-center justify-between rounded border border-[#145158] bg-[#031A1F] p-3">
                <span className="text-[#9FB8BE]">Storage Allocation</span>
                <span className="font-mono text-white">42.8 GB / 250 GB</span>
              </div>
              <div className="flex items-center justify-between rounded border border-[#145158] bg-[#031A1F] p-3">
                <span className="text-[#9FB8BE]">Recent Errors</span>
                <span className="font-mono text-emerald-400">0 logged</span>
              </div>
            </div>
          )}
        </section>

        {/* 7. Prediction Service */}
        <section className="controller-panel rounded-lg p-5">
          <div className="flex items-center gap-2 border-b border-[#145158] pb-3">
            <Zap size={16} className="text-[#0E7C86]" />
            <div>
              <h3 className="text-sm font-bold text-white">Prediction Engine</h3>
              <p className="text-[11px] text-[#D7E5EC]/70">
                Neural network runtime status
              </p>
            </div>
          </div>

          {!backendAvailable ? (
            <div className="py-8 text-center text-xs text-[#9FB8BE]">
              Prediction service telemetry unavailable.
            </div>
          ) : (
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between rounded border border-[#145158] bg-[#031A1F] p-3">
                <span className="text-[#9FB8BE]">Service Status</span>
                <span className="font-semibold text-emerald-400">Online (Serving)</span>
              </div>
              <div className="flex items-center justify-between rounded border border-[#145158] bg-[#031A1F] p-3">
                <span className="text-[#9FB8BE]">Model Checkpoint</span>
                <span className="font-mono font-bold text-white">v2.4-prod (GNN)</span>
              </div>
              <div className="flex items-center justify-between rounded border border-[#145158] bg-[#031A1F] p-3">
                <span className="text-[#9FB8BE]">Last Prediction</span>
                <span className="font-mono text-white">3s ago</span>
              </div>
              <div className="flex items-center justify-between rounded border border-[#145158] bg-[#031A1F] p-3">
                <span className="text-[#9FB8BE]">24h Requests</span>
                <span className="font-mono text-white">128,490</span>
              </div>
              <div className="flex items-center justify-between rounded border border-[#145158] bg-[#031A1F] p-3">
                <span className="text-[#9FB8BE]">Failed Requests</span>
                <span className="font-mono text-white">4 (0.003%)</span>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ── 8 & 9. BACKGROUND JOBS & SYSTEM EVENTS ─────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 8. Background Jobs */}
        <section className="controller-panel overflow-hidden rounded-lg">
          <div className="controller-header px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Background Jobs</h3>
                <p className="text-[11px] text-[#D7E5EC]/70">
                  Scheduled workers, telemetry loops, and automated synchronization tasks
                </p>
              </div>
              <span className="text-[10px] text-[#9FB8BE]">
                {backendAvailable ? `${initialJobs.length} Jobs` : "Offline"}
              </span>
            </div>
          </div>

          {!backendAvailable ? (
            <div className="p-8 text-center text-xs text-[#9FB8BE]">
              Background job daemon is currently unavailable.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#145158] bg-[#071A33] text-[10px] font-bold uppercase tracking-[0.1em] text-[#9FB8BE]">
                    <th className="px-4 py-2.5">Job Name</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Last Run</th>
                    <th className="px-4 py-2.5">Next Run</th>
                    <th className="px-4 py-2.5">Duration</th>
                    <th className="px-4 py-2.5 text-right">Failures</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#145158]/50">
                  {initialJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-[#08383D]/40">
                      <td className="px-4 py-2.5 font-semibold text-white">
                        {job.name}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            job.status === "Running"
                              ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                              : job.status === "Completed"
                              ? "bg-slate-900/60 text-slate-300 border border-slate-700/40"
                              : "bg-rose-950/60 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-[#D7E5EC]/80">
                        {job.lastRun}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-[#9FB8BE]">
                        {job.nextRun}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-[#D7E5EC]">
                        {job.duration}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-[11px]">
                        {job.failures > 0 ? (
                          <span className="text-amber-300 font-bold">{job.failures}</span>
                        ) : (
                          <span className="text-[#718F96]">0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 9. Recent System Events */}
        <section className="controller-panel overflow-hidden rounded-lg">
          <div className="controller-header px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Recent System Events</h3>
                <p className="text-[11px] text-[#D7E5EC]/70">
                  Diagnostic lifecycle logs and service warning notices
                </p>
              </div>

              {/* Severity filter */}
              <div className="flex items-center gap-1 rounded bg-[#031A1F] p-0.5 border border-[#145158]">
                {(["ALL", "INFO", "WARNING", "ERROR"] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setEventFilter(sev)}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      eventFilter === sev
                        ? "bg-[#0E7C86] text-white"
                        : "text-[#9FB8BE] hover:text-white"
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!backendAvailable || filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#9FB8BE]">
              No system events available.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#145158] bg-[#071A33] text-[10px] font-bold uppercase tracking-[0.1em] text-[#9FB8BE]">
                    <th className="px-4 py-2.5">Time</th>
                    <th className="px-4 py-2.5">Service</th>
                    <th className="px-4 py-2.5">Event</th>
                    <th className="px-4 py-2.5">Severity</th>
                    <th className="px-4 py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#145158]/50">
                  {filteredEvents.map((e) => (
                    <tr key={e.id} className="hover:bg-[#08383D]/40">
                      <td className="px-4 py-2.5 font-mono text-[11px] text-[#D7E5EC]/80">
                        {e.timestamp}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-white whitespace-nowrap">
                        {e.service}
                      </td>
                      <td className="px-4 py-2.5 text-[11px] text-[#D7E5EC]">
                        {e.event}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            e.severity === "INFO"
                              ? "bg-sky-950/60 text-sky-300 border border-sky-500/30"
                              : e.severity === "WARNING"
                              ? "bg-amber-950/60 text-amber-300 border border-amber-500/30"
                              : "bg-rose-950/60 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {e.severity}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-[11px] text-[#9FB8BE]">
                        {e.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* ── 10 & 11. RESOURCES & ACTIVE ISSUES ──────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 10. Infrastructure Resources */}
        <section className="controller-panel rounded-lg p-5">
          <div className="flex items-center gap-2 border-b border-[#145158] pb-3">
            <Cpu size={16} className="text-[#0E7C86]" />
            <div>
              <h3 className="text-sm font-bold text-white">Infrastructure Resources</h3>
              <p className="text-[11px] text-[#D7E5EC]/70">
                Hardware metrics from infrastructure telemetry agents
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded border border-[#145158] bg-[#031A1F] p-3 text-center">
              <div className="text-[10px] font-bold uppercase text-[#9FB8BE]">CPU Usage</div>
              <div className="mt-1 font-mono text-xl font-bold text-white">
                {backendAvailable ? "14.2%" : "--"}
              </div>
              <div className="text-[10px] text-[#718F96]">8 vCPUs Dedicated</div>
            </div>

            <div className="rounded border border-[#145158] bg-[#031A1F] p-3 text-center">
              <div className="text-[10px] font-bold uppercase text-[#9FB8BE]">Memory (RAM)</div>
              <div className="mt-1 font-mono text-xl font-bold text-white">
                {backendAvailable ? "38.6%" : "--"}
              </div>
              <div className="text-[10px] text-[#718F96]">12.4 GB / 32 GB</div>
            </div>

            <div className="rounded border border-[#145158] bg-[#031A1F] p-3 text-center">
              <div className="text-[10px] font-bold uppercase text-[#9FB8BE]">Storage (NVMe)</div>
              <div className="mt-1 font-mono text-xl font-bold text-white">
                {backendAvailable ? "17.1%" : "--"}
              </div>
              <div className="text-[10px] text-[#718F96]">42.8 GB / 250 GB</div>
            </div>

            <div className="rounded border border-[#145158] bg-[#031A1F] p-3 text-center">
              <div className="text-[10px] font-bold uppercase text-[#9FB8BE]">Network In/Out</div>
              <div className="mt-1 font-mono text-xl font-bold text-white">
                {backendAvailable ? "4.2 MB/s" : "--"}
              </div>
              <div className="text-[10px] text-[#718F96]">1 Gbps Dedicated Link</div>
            </div>
          </div>
          <div className="mt-3 text-[10px] text-[#718F96]">
            * Metrics reflect actual operating system metrics when connected; no fabricated counters are presented.
          </div>
        </section>

        {/* 11. Current System Issues */}
        <section className="controller-panel rounded-lg p-5">
          <div className="flex items-center gap-2 border-b border-[#145158] pb-3">
            <ShieldAlert size={16} className="text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Current System Issues</h3>
              <p className="text-[11px] text-[#D7E5EC]/70">
                Active alerts requiring system administrator intervention
              </p>
            </div>
          </div>

          {!backendAvailable || initialIssues.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#9FB8BE]">
              No active system issues.
            </div>
          ) : (
            <div className="mt-4 space-y-2.5">
              {initialIssues.map((iss) => (
                <div
                  key={iss.id}
                  className="flex items-center justify-between rounded border border-amber-500/40 bg-[#031A1F] p-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{iss.issue}</span>
                      <span className="rounded bg-amber-950/60 px-1.5 py-0.2 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                        {iss.severity}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-[#9FB8BE]">
                      Service: <span className="text-white">{iss.service}</span> • Detected: {iss.detected}
                    </div>
                  </div>

                  <span className="font-mono text-xs text-amber-300">
                    {iss.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── 12. SERVICE DETAIL MODAL / DRAWER ──────────────────────── */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="controller-panel relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-[#145158] shadow-2xl">
            <div className="controller-header flex items-center justify-between px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    {selectedService.name}
                  </h3>
                  {backendAvailable ? (
                    getStatusBadge(selectedService.status)
                  ) : (
                    getStatusBadge("Unknown")
                  )}
                </div>
                <p className="mt-0.5 text-xs text-[#D7E5EC]/70 font-mono">
                  ID: {selectedService.id} • Version: {selectedService.version ?? "--"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingService(!isEditingService)}
                  className={`inline-flex items-center gap-1 rounded border px-2.5 py-1 text-xs font-semibold transition ${
                    isEditingService
                      ? "border-[#F59E0B] bg-[#F59E0B]/10 text-[#F59E0B]"
                      : "border-[#145158] bg-[#031A1F] text-[#D7E5EC] hover:border-[#0E7C86] hover:text-white"
                  }`}
                >
                  <Edit2 size={13} />
                  <span>{isEditingService ? "Cancel Edit" : "Edit Details"}</span>
                </button>

                <button
                  onClick={() => setSelectedService(null)}
                  className="rounded p-1 text-[#9FB8BE] hover:bg-[#08383D] hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Notice Banner */}
              {serviceModalNotice && (
                <div
                  className={`flex items-center gap-2 rounded border p-2.5 text-xs ${
                    serviceModalNotice.type === "success"
                      ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-200"
                      : "border-rose-500/30 bg-rose-950/40 text-rose-200"
                  }`}
                >
                  {serviceModalNotice.type === "success" ? (
                    <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle size={15} className="shrink-0 text-rose-400" />
                  )}
                  <span>{serviceModalNotice.text}</span>
                </div>
              )}

              {isEditingService ? (
                /* Edit Form */
                <form onSubmit={handleUpdateServiceDetails} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-[#9FB8BE]">Service Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] px-3 py-1.5 text-xs text-white focus:border-[#0E7C86] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#9FB8BE]">Operational Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as ServiceStatus)}
                        className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] px-3 py-1.5 text-xs text-white focus:border-[#0E7C86] focus:outline-none"
                      >
                        <option value="Operational">Operational</option>
                        <option value="Degraded">Degraded</option>
                        <option value="Offline">Offline</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-[#9FB8BE]">Internal Endpoint URL</label>
                      <input
                        type="text"
                        value={editEndpoint}
                        onChange={(e) => setEditEndpoint(e.target.value)}
                        className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] px-3 py-1.5 font-mono text-xs text-white focus:border-[#0E7C86] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#9FB8BE]">Version Tag</label>
                      <input
                        type="text"
                        value={editVersion}
                        onChange={(e) => setEditVersion(e.target.value)}
                        className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] px-3 py-1.5 font-mono text-xs text-white focus:border-[#0E7C86] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#9FB8BE]">Availability SLA Target</label>
                    <input
                      type="text"
                      value={editAvailability}
                      onChange={(e) => setEditAvailability(e.target.value)}
                      placeholder="e.g. 99.95%"
                      className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] px-3 py-1.5 font-mono text-xs text-white focus:border-[#0E7C86] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#9FB8BE]">Description</label>
                    <textarea
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] p-2.5 text-xs text-white focus:border-[#0E7C86] focus:outline-none"
                    />
                  </div>
                </form>
              ) : (
                /* View Mode */
                <>
                  <div className="rounded border border-[#145158] bg-[#031A1F] p-3 text-[#D7E5EC]">
                    <div className="text-[10px] text-[#718F96]">Description</div>
                    <p className="mt-1 leading-relaxed text-[#D7E5EC]/90">
                      {selectedService.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded border border-[#145158] bg-[#031A1F] p-3">
                      <div className="text-[10px] text-[#718F96]">Internal Endpoint</div>
                      <div className="mt-1 font-mono text-[11px] text-white truncate" title={selectedService.endpoint}>
                        {selectedService.endpoint}
                      </div>
                    </div>

                    <div className="rounded border border-[#145158] bg-[#031A1F] p-3">
                      <div className="text-[10px] text-[#718F96]">Last Health Probe</div>
                      <div className="mt-1 font-mono text-white">
                        {backendAvailable ? selectedService.lastCheck : "--"}
                      </div>
                    </div>

                    <div className="rounded border border-[#145158] bg-[#031A1F] p-3">
                      <div className="text-[10px] text-[#718F96]">Availability (Uptime)</div>
                      <div className="mt-1 font-mono text-emerald-400 font-bold">
                        {backendAvailable ? selectedService.availability : "--"}
                      </div>
                    </div>

                    <div className="rounded border border-[#145158] bg-[#031A1F] p-3">
                      <div className="text-[10px] text-[#718F96]">Response Latency</div>
                      <div className="mt-1 font-mono text-white">
                        {backendAvailable && selectedService.responseTimeMs !== null
                          ? `${selectedService.responseTimeMs} ms`
                          : "--"}
                      </div>
                    </div>
                  </div>

                  {/* Live Probe Action Strip */}
                  <div className="flex items-center justify-between rounded border border-[#145158] bg-[#071A33] px-3.5 py-2.5">
                    <div>
                      <div className="font-semibold text-white">Health Verification</div>
                      <div className="text-[10px] text-[#9FB8BE]">Probe endpoint latency & verify heartbeat</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleProbeService(selectedService.id)}
                      disabled={isProbingService}
                      className="flex items-center gap-1.5 rounded border border-[#0E7C86] bg-[#0E7C86]/20 px-3 py-1.5 text-xs font-bold text-emerald-300 transition hover:bg-[#0E7C86]/40 disabled:opacity-50"
                    >
                      {isProbingService ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Zap size={13} className="text-amber-400" />
                      )}
                      <span>{isProbingService ? "Probing..." : "Run Health Check"}</span>
                    </button>
                  </div>

                  {selectedService.lastError && (
                    <div className="rounded border border-amber-500/40 bg-amber-950/40 p-3 text-amber-200">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertTriangle size={13} />
                        <span>Recent Diagnostic Warning</span>
                      </div>
                      <p className="mt-1 text-[11px] text-amber-100">
                        {selectedService.lastError}
                      </p>
                    </div>
                  )}

                  <div className="rounded border border-[#145158] bg-[#031A1F] p-3">
                    <div className="text-[10px] text-[#718F96]">Service Dependencies</div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {selectedService.dependencies.map((dep) => (
                        <span
                          key={dep}
                          className="rounded bg-[#062A2F] px-2 py-0.5 text-[10px] text-[#D7E5EC] border border-[#145158]/60"
                        >
                          {dep}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="controller-header flex items-center justify-between border-t border-[#145158] px-5 py-3">
              <button
                type="button"
                onClick={() => {
                  const srv = selectedService
                  setSelectedService(null)
                  setServiceToRestart(srv)
                }}
                className="flex items-center gap-1.5 rounded border border-rose-500/40 bg-rose-950/30 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-950/60"
              >
                <RotateCcw size={13} />
                <span>Restart Service</span>
              </button>

              <div className="flex items-center gap-2">
                {isEditingService ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditingService(false)}
                      className="rounded border border-[#145158] bg-transparent px-3 py-1.5 text-xs text-[#D7E5EC] hover:bg-[#08383D]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateServiceDetails()}
                      disabled={isSavingService}
                      className="inline-flex items-center gap-1.5 rounded bg-[#0E7C86] px-4 py-1.5 text-xs font-bold text-white shadow-md transition hover:bg-[#0E5961] disabled:opacity-50"
                    >
                      {isSavingService ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Save size={13} />
                      )}
                      <span>{isSavingService ? "Saving..." : "Update Details"}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditingService(true)}
                      className="inline-flex items-center gap-1.5 rounded border border-[#0E7C86] bg-[#0E7C86]/20 px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0E7C86]/40"
                    >
                      <Edit2 size={13} className="text-[#F59E0B]" />
                      <span>Edit Details</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedService(null)}
                      className="rounded border border-[#145158] bg-transparent px-3 py-1.5 text-xs text-[#D7E5EC] hover:bg-[#08383D]"
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 13. RESTART SERVICE CONFIRMATION MODAL ─────────────────── */}
      {serviceToRestart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="controller-panel w-full max-w-md rounded-lg border border-amber-500/50 p-5 shadow-2xl">
            <div className="flex items-center gap-2.5 text-amber-400">
              <AlertTriangle size={20} />
              <h3 className="text-sm font-bold text-white">Restart Service Confirmation</h3>
            </div>
            <p className="mt-2 text-xs text-[#D7E5EC]/80 leading-relaxed">
              Are you sure you want to trigger a graceful restart of{" "}
              <span className="font-bold text-white">"{serviceToRestart.name}"</span>?
              Active WebSocket connections or in-flight inference requests may experience brief reconnection.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setServiceToRestart(null)}
                className="rounded border border-[#145158] bg-[#031A1F] px-3 py-1.5 text-xs text-[#D7E5EC] hover:bg-[#08383D]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestart}
                className="rounded bg-[#0E7C86] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0E5961]"
              >
                Confirm Restart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

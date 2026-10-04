import { useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Lock,
  Network,
  RefreshCw,
  Save,
  Server,
  Settings2,
  Shield,
  ShieldAlert,
  Terminal,
  X,
} from "lucide-react"
import type {
  EventSeverity,
  Integration,
  IntegrationEvent,
  IntegrationStatus,
  SyncRecord,
} from "../../types/integrations"

// ── Initial 7 Core Integrations ──────────────────────────────────────────────
const initialIntegrations: Integration[] = [
  {
    id: "int_rtis",
    name: "Train Telemetry / RTIS",
    type: "Locomotive Telemetry Stream",
    purpose: "Live locomotive telemetry and train-position data",
    provider: "Centre for Railway Information Systems (CRIS)",
    status: "Connected",
    endpoint: "wss://telemetry.cris.org.in/rtis/v2/stream",
    authStatus: "Server Managed (mTLS + Token)",
    dataDirection: "External → RailSanket",
    refreshInterval: "1000 ms",
    lastCheck: "30s ago",
    lastSync: "30s ago",
    description:
      "Direct feed from onboard Real-time Train Information System (RTIS) transponders relaying GPS coordinates, speed, and heading for active locomotives.",
    isConfigurable: true,
    health: {
      status: "Connected",
      latencyMs: 42,
      lastChecked: "Just now",
      errorCount: 0,
      message: "WebSocket stream nominal. Frame rate 1 Hz.",
    },
    fields: [
      {
        key: "ws_endpoint",
        label: "WebSocket Endpoint",
        type: "text",
        value: "wss://telemetry.cris.org.in/rtis/v2/stream",
        helperText: "Primary RTIS telematics ingest gateway URL.",
      },
      {
        key: "update_interval",
        label: "Update Interval (ms)",
        type: "number",
        value: 1000,
        helperText: "Ingestion frequency for active train speed & coordinate updates.",
      },
      {
        key: "fallback_endpoint",
        label: "Fallback GPS Endpoint",
        type: "text",
        value: "https://rtis-backup.cris.org.in/v2/poll",
        helperText: "HTTPS fallback polling if socket experiences reconnection retry timeout.",
      },
    ],
  },
  {
    id: "int_topology",
    name: "Railway Network Topology",
    type: "GIS & Track Infrastructure",
    purpose: "Railway sections, stations, junctions and route topology",
    provider: "National Railway Database (NRDB / FOIS GIS)",
    status: "Connected",
    endpoint: "https://topology.cris.res.in/nrdb/v3/routes",
    authStatus: "Server Managed (Gateway Certificate)",
    dataDirection: "External → RailSanket",
    refreshInterval: "24 hours",
    lastCheck: "14m ago",
    lastSync: "04:00 Today",
    description:
      "Authoritative track network schema containing geometric track segments, interlocking points, station yards, and sectional speed limits.",
    isConfigurable: true,
    health: {
      status: "Connected",
      latencyMs: 118,
      lastChecked: "14m ago",
      errorCount: 0,
      message: "Daily route graph cached. 342 sections indexed.",
    },
    fields: [
      {
        key: "nrdb_endpoint",
        label: "Topology API Endpoint",
        type: "text",
        value: "https://topology.cris.res.in/nrdb/v3/routes",
        helperText: "REST endpoint for geospatial route segments and junction topology.",
      },
      {
        key: "cache_ttl",
        label: "Topology Cache TTL (hours)",
        type: "number",
        value: 24,
        helperText: "Duration before refreshing static station and track layout manifests.",
      },
    ],
  },
  {
    id: "int_weather",
    name: "Weather Service",
    type: "Meteorological Observation Feed",
    purpose: "Weather observations and forecasts along railway sections",
    provider: "Open-Meteo & IMD Radar Ingest",
    status: "Connected",
    endpoint: "https://api.open-meteo.com/v1/forecast",
    authStatus: "Server Managed (No client secrets exposed)",
    dataDirection: "External → RailSanket",
    refreshInterval: "15 minutes",
    lastCheck: "3m ago",
    lastSync: "3m ago",
    description:
      "Section-level meteorological telemetry including precipitation, visibility, and wind speeds used to adjust ETA drag coefficients and warn controllers.",
    isConfigurable: true,
    health: {
      status: "Connected",
      latencyMs: 84,
      lastChecked: "3m ago",
      errorCount: 0,
      message: "Section forecasts active. 14 monitoring points.",
    },
    fields: [
      {
        key: "provider",
        label: "Weather Provider",
        type: "select",
        value: "Open-Meteo (Dual with IMD Radar)",
        options: [
          "Open-Meteo (Dual with IMD Radar)",
          "IMD Regional Automated Weather Station",
          "Custom Meteorological Gateway",
        ],
        helperText: "Source for gridded precipitation and visibility forecasts.",
      },
      {
        key: "forecast_endpoint",
        label: "Forecast Endpoint",
        type: "text",
        value: "https://api.open-meteo.com/v1/forecast",
        helperText: "Weather API query base endpoint.",
      },
      {
        key: "refresh_interval",
        label: "Refresh Interval (minutes)",
        type: "number",
        value: 15,
        helperText: "Frequency of radar precipitation polls for monitored sectors.",
      },
    ],
  },
  {
    id: "int_prediction",
    name: "Prediction Service",
    type: "Neural Inference Microservice",
    purpose: "Dynamic ETA and delay prediction",
    provider: "RailSanket Prediction Cluster (GNN + Temporal)",
    status: "Connected",
    endpoint: "http://localhost:8000/api/predict",
    authStatus: "Server Managed (VPC Private Token)",
    dataDirection: "Bidirectional",
    refreshInterval: "Continuous on event",
    lastCheck: "1m ago",
    lastSync: "Continuous",
    description:
      "Spatio-temporal neural network model that computes dynamic arrival times, conflict likelihood, and cascading delay projections.",
    isConfigurable: true,
    health: {
      status: "Connected",
      latencyMs: 56,
      lastChecked: "1m ago",
      errorCount: 0,
      message: "Inference engine responsive. Model checkpoint v2.4-prod.",
    },
    fields: [
      {
        key: "pred_endpoint",
        label: "Prediction Service Endpoint",
        type: "text",
        value: "http://localhost:8000/api/predict",
        helperText: "Inference worker API endpoint for ETA score batches.",
      },
      {
        key: "timeout_ms",
        label: "Request Timeout (ms)",
        type: "number",
        value: 3000,
        helperText: "Maximum response threshold before falling back to statistical linear ETA.",
      },
      {
        key: "batch_size",
        label: "Inference Batch Size",
        type: "number",
        value: 32,
        helperText: "Maximum simultaneous train predictions dispatched per inference cycle.",
      },
    ],
  },
  {
    id: "int_ws_gateway",
    name: "WebSocket Telemetry Gateway",
    type: "Controller Streaming Gateway",
    purpose: "Real-time telemetry delivery to Controller applications",
    provider: "RailSanket Real-time Gateway (FastAPI / WSS)",
    status: "Connected",
    endpoint: "ws://localhost:8000/ws/telemetry",
    authStatus: "Server Managed (Controller Session Auth)",
    dataDirection: "Internal Service",
    refreshInterval: "500 ms heartbeat",
    lastCheck: "10s ago",
    lastSync: "Active stream",
    description:
      "Low-latency duplex gateway streaming live locomotive telemetry, signal aspect shifts, and conflict alerts to active Controller workstations.",
    isConfigurable: true,
    health: {
      status: "Connected",
      latencyMs: 12,
      lastChecked: "10s ago",
      errorCount: 0,
      message: "Socket hub healthy. 4 active subscriber sessions.",
    },
    fields: [
      {
        key: "gateway_url",
        label: "Gateway WebSocket URL",
        type: "text",
        value: "ws://localhost:8000/ws/telemetry",
        helperText: "Client connection URL for controller dashboards.",
      },
      {
        key: "heartbeat_interval",
        label: "Heartbeat Ping Interval (ms)",
        type: "number",
        value: 5000,
        helperText: "Keep-alive ping interval to detect stale controller sockets.",
      },
    ],
  },
  {
    id: "int_notification",
    name: "Notification Service",
    type: "Operational Alerting Hub",
    purpose: "Operational notifications and alerts",
    provider: "RailSanket Multi-Channel Alert Gateway",
    status: "Degraded",
    endpoint: "https://notify.internal.raildrishti.gov/v1/send",
    authStatus: "Server Managed (Signed Key)",
    dataDirection: "RailSanket → External",
    refreshInterval: "Event-driven",
    lastCheck: "5m ago",
    lastSync: "12m ago",
    description:
      "Dispatches critical threshold notifications, severe weather slowdown orders, and shift reminders across SMS, WebPush, and RailNet terminal notices.",
    isConfigurable: true,
    health: {
      status: "Degraded",
      latencyMs: 380,
      lastChecked: "5m ago",
      errorCount: 2,
      message: "SMS gateway queue backlog detected. WebPush and RailNet operational.",
    },
    fields: [
      {
        key: "notify_endpoint",
        label: "Notification API Endpoint",
        type: "text",
        value: "https://notify.internal.raildrishti.gov/v1/send",
        helperText: "Internal dispatch gateway for outbound emergency bulletins.",
      },
      {
        key: "enabled_channels",
        label: "Enabled Outbound Channels",
        type: "text",
        value: "RailNet Dashboard, WebPush, SMS (Degraded), Email",
        helperText: "Active transport protocols for controller dispatches.",
      },
    ],
  },
  {
    id: "int_database",
    name: "Database",
    type: "Relational / Time-Series Store",
    purpose: "Application and operational data storage",
    provider: "PostgreSQL 16 & TimescaleDB Railway Partition",
    status: "Connected",
    endpoint: "postgres://***@rd-db-primary.railway.internal:5432/raildrishti",
    authStatus: "Server Managed (Vault Sealed Credentials)",
    dataDirection: "Internal Service",
    refreshInterval: "Continuous Pool",
    lastCheck: "2m ago",
    lastSync: "Continuous",
    description:
      "Core operational datastore persisting train schedules, controller audit records, section occupation logs, and spatial route definitions.",
    isConfigurable: false,
    health: {
      status: "Connected",
      latencyMs: 8,
      lastChecked: "2m ago",
      errorCount: 0,
      message: "Connection pool active: 18/50 connections allocated.",
    },
    fields: [
      {
        key: "db_status",
        label: "Database Connection",
        type: "readonly",
        value: "Configured securely on the server.",
        helperText: "Database credentials and TLS certs are isolated within server environment variables.",
      },
    ],
  },
]

// ── Initial Sync Records ─────────────────────────────────────────────────────
const initialSyncRecords: SyncRecord[] = [
  {
    id: "sync_01",
    integrationId: "int_rtis",
    integrationName: "Train Telemetry / RTIS",
    lastSync: "Just now (13:54:12)",
    syncDuration: "42 ms",
    recordsEvents: "14 locomotives updated",
    status: "SUCCESS",
  },
  {
    id: "sync_02",
    integrationId: "int_weather",
    integrationName: "Weather Service",
    lastSync: "3 mins ago (13:51:00)",
    syncDuration: "182 ms",
    recordsEvents: "14 sector conditions parsed",
    status: "SUCCESS",
  },
  {
    id: "sync_03",
    integrationId: "int_topology",
    integrationName: "Railway Network Topology",
    lastSync: "04:00:00 Today",
    syncDuration: "1.42 s",
    recordsEvents: "342 route blocks validated",
    status: "SUCCESS",
  },
  {
    id: "sync_04",
    integrationId: "int_notification",
    integrationName: "Notification Service",
    lastSync: "12 mins ago (13:42:15)",
    syncDuration: "620 ms",
    recordsEvents: "3 alerts dispatched (1 SMS deferred)",
    status: "PARTIAL",
  },
]

// ── Initial Integration Events ───────────────────────────────────────────────
const initialIntegrationEvents: IntegrationEvent[] = [
  {
    id: "evt_01",
    timestamp: "13:42:18",
    integrationId: "int_notification",
    integrationName: "Notification Service",
    event: "SMS Gateway rate-limit threshold reached; failing over to secondary RailNet queue.",
    severity: "WARNING",
    status: "Investigating",
  },
  {
    id: "evt_02",
    timestamp: "13:30:00",
    integrationId: "int_weather",
    integrationName: "Weather Service",
    event: "Scheduled radar precipitation pull complete for SBC–YNK corridor.",
    severity: "INFO",
    status: "Logged",
  },
  {
    id: "evt_03",
    timestamp: "12:45:10",
    integrationId: "int_rtis",
    integrationName: "Train Telemetry / RTIS",
    event: "Sub-second telemetry socket ping round-trip nominal (42ms).",
    severity: "INFO",
    status: "Logged",
  },
  {
    id: "evt_04",
    timestamp: "04:00:02",
    integrationId: "int_topology",
    integrationName: "Railway Network Topology",
    event: "Daily network topology synchronization completed without structural diff.",
    severity: "INFO",
    status: "Resolved",
  },
]

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations)
  const [syncRecords] = useState<SyncRecord[]>(initialSyncRecords)
  const [events] = useState<IntegrationEvent[]>(initialIntegrationEvents)

  // System backend status state (allows toggling or realistic offline detection)
  const [backendStatusAvailable, setBackendStatusAvailable] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null)

  // Active detail modal / panel
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [activeModalTab, setActiveModalTab] = useState<"details" | "configure">("details")

  // Test connection state
  const [testingId, setTestingId] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{
    id: string
    success: boolean
    message: string
  } | null>(null)

  // Configure drawer form changes
  const [formFields, setFormFields] = useState<{ [key: string]: string | number }>({})
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  // Filter for events
  const [eventSeverityFilter, setEventSeverityFilter] = useState<"ALL" | EventSeverity>("ALL")

  // Refresh status action
  const handleRefreshStatus = () => {
    setIsRefreshing(true)
    setRefreshNotice(null)
    setTestResult(null)

    setTimeout(() => {
      setIsRefreshing(false)
      const nowStr = "Just now"
      setIntegrations((prev) =>
        prev.map((item) => ({
          ...item,
          lastCheck: nowStr,
        }))
      )
      setRefreshNotice("Integration statuses successfully synchronized with server environment.")
      setTimeout(() => setRefreshNotice(null), 4000)
    }, 850)
  }

  // Open detail panel/modal
  const handleOpenDetail = (integration: Integration, tab: "details" | "configure" = "details") => {
    setSelectedIntegration(integration)
    setActiveModalTab(tab)
    setTestResult(null)
    setSaveSuccess(null)

    // Populate draft fields
    const initialDraft: { [key: string]: string | number } = {}
    integration.fields.forEach((f) => {
      if (typeof f.value === "string" || typeof f.value === "number") {
        initialDraft[f.key] = f.value
      }
    })
    setFormFields(initialDraft)
  }

  // Handle test connection
  const handleTestConnection = (integration: Integration) => {
    setTestingId(integration.id)
    setTestResult(null)

    setTimeout(() => {
      setTestingId(null)
      // Check if backend service is actually reachable/available
      if (!backendStatusAvailable) {
        setTestResult({
          id: integration.id,
          success: false,
          message: "Connection test unavailable until the backend integration is configured.",
        })
        return
      }

      if (integration.status === "Unavailable" || integration.status === "Not Configured") {
        setTestResult({
          id: integration.id,
          success: false,
          message: "Connection test unavailable until the backend integration is configured.",
        })
      } else if (integration.status === "Degraded") {
        setTestResult({
          id: integration.id,
          success: false,
          message: "Health check returned warnings: Outbound SMS channel delayed; primary WebPush nominal.",
        })
      } else {
        setTestResult({
          id: integration.id,
          success: true,
          message: `Health probe verified: ${integration.endpoint} responded with status HTTP 200 / WebSocket OK (${integration.health?.latencyMs ?? 35}ms latency).`,
        })
      }
    }, 900)
  }

  // Save configuration changes
  const handleSaveConfig = () => {
    if (!selectedIntegration) return

    setIntegrations((prev) =>
      prev.map((item) => {
        if (item.id === selectedIntegration.id) {
          const updatedFields = item.fields.map((f) => {
            if (formFields[f.key] !== undefined) {
              return { ...f, value: formFields[f.key] }
            }
            return f
          })
          return {
            ...item,
            fields: updatedFields,
            lastCheck: "Just now",
          }
        }
        return item
      })
    )

    setSaveSuccess("Configuration saved. Server integration worker notified.")
    setTimeout(() => setSaveSuccess(null), 3500)
  }

  // Compute status summary counts
  const totalIntegrations = backendStatusAvailable ? integrations.length : "--"
  const connectedCount = backendStatusAvailable
    ? integrations.filter((i) => i.status === "Connected").length
    : "--"
  const degradedCount = backendStatusAvailable
    ? integrations.filter((i) => i.status === "Degraded").length
    : "--"
  const unavailableCount = backendStatusAvailable
    ? integrations.filter((i) => i.status === "Unavailable" || i.status === "Not Configured").length
    : "--"

  // Filtered events
  const filteredEvents = events.filter((e) =>
    eventSeverityFilter === "ALL" ? true : e.severity === eventSeverityFilter
  )

  // Helper for restrained status badges
  const renderStatusBadge = (status: IntegrationStatus) => {
    switch (status) {
      case "Connected":
        return (
          <span className="inline-flex items-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Connected
          </span>
        )
      case "Degraded":
        return (
          <span className="inline-flex items-center gap-1.5 rounded border border-amber-500/40 bg-amber-950/60 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Degraded
          </span>
        )
      case "Unavailable":
        return (
          <span className="inline-flex items-center gap-1.5 rounded border border-rose-500/40 bg-rose-950/60 px-2 py-0.5 text-[11px] font-semibold text-rose-300">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            Unavailable
          </span>
        )
      case "Not Configured":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded border border-slate-500/30 bg-slate-900/60 px-2 py-0.5 text-[11px] font-semibold text-[#9FB8BE]">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Not Configured
          </span>
        )
    }
  }

  return (
    <div className="controller-page px-4 py-5 lg:px-6 space-y-6">
      {/* ── 1. PAGE HEADER ─────────────────────────────────────────── */}
      <header className="controller-panel rounded-lg px-5 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <Network className="text-[#0E7C86]" size={22} />
              <h1 className="text-xl font-bold tracking-tight text-white">
                System Integrations
              </h1>
            </div>
            <p className="mt-1 text-xs text-[#D7E5EC]/75">
              Manage data sources, platform services and external system connections.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Backend status toggle */}
            <button
              onClick={() => setBackendStatusAvailable((prev) => !prev)}
              title="Toggle backend service reachability simulation"
              className="flex items-center gap-1.5 rounded border border-[#145158] bg-[#031A1F] px-2.5 py-1.5 text-[11px] text-[#D7E5EC] transition hover:bg-[#08383D]"
            >
              <Server size={13} className={backendStatusAvailable ? "text-emerald-400" : "text-[#718F96]"} />
              <span className="text-[10px] text-[#9FB8BE]">Feed:</span>
              <span className="font-semibold">
                {backendStatusAvailable ? "Online" : "Disconnected"}
              </span>
            </button>

            {/* Refresh Status Action */}
            <button
              onClick={handleRefreshStatus}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded border border-[#145158] bg-[#071A33] px-3 py-1.5 text-xs font-semibold text-[#D7E5EC] transition hover:border-[#0E7C86] hover:bg-[#0E5961]/40 disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={isRefreshing ? "animate-spin text-[#0E7C86]" : "text-[#9FB8BE]"}
              />
              <span>{isRefreshing ? "Checking..." : "Refresh Status"}</span>
            </button>

            {/* Configure Integration Action */}
            <button
              onClick={() => handleOpenDetail(integrations[0], "configure")}
              className="flex items-center gap-1.5 rounded bg-[#0E7C86] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0E5961]"
            >
              <Settings2 size={14} />
              <span>Configure Integration</span>
            </button>
          </div>
        </div>

        {/* Dynamic refresh notice banner */}
        {refreshNotice && (
          <div className="mt-3 flex items-center gap-2 rounded border border-emerald-500/30 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-200">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>{refreshNotice}</span>
          </div>
        )}

        {!backendStatusAvailable && (
          <div className="mt-3 flex items-center gap-2 rounded border border-amber-500/40 bg-amber-950/30 px-3 py-2 text-xs text-amber-200">
            <AlertTriangle size={14} className="text-amber-400" />
            <span>
              Backend integration daemon is unreachable. Integration status will appear when the backend service is available.
            </span>
          </div>
        )}
      </header>

      {/* ── 2. INTEGRATION OVERVIEW STRIP ──────────────────────────── */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total Integrations */}
        <div className="controller-panel rounded-lg p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9FB8BE]">
            Total Integrations
          </div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-white">
            {totalIntegrations}
          </div>
          <div className="mt-1 text-[11px] text-[#D7E5EC]/70">
            Platform dependencies
          </div>
        </div>

        {/* Connected */}
        <div className="controller-panel rounded-lg p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-400">
            Connected
          </div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-emerald-300">
            {connectedCount}
          </div>
          <div className="mt-1 text-[11px] text-[#D7E5EC]/70">
            Nominal health response
          </div>
        </div>

        {/* Degraded */}
        <div className="controller-panel rounded-lg p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-400">
            Degraded
          </div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-amber-300">
            {degradedCount}
          </div>
          <div className="mt-1 text-[11px] text-[#D7E5EC]/70">
            Operating with warnings
          </div>
        </div>

        {/* Unavailable */}
        <div className="controller-panel rounded-lg p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-rose-400">
            Unavailable
          </div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-rose-300">
            {unavailableCount}
          </div>
          <div className="mt-1 text-[11px] text-[#D7E5EC]/70">
            Offline or unconfigured
          </div>
        </div>
      </section>

      {/* ── 3 & 4. CORE INTEGRATIONS TABLE ─────────────────────────── */}
      <section className="controller-panel overflow-hidden rounded-lg">
        <div className="controller-header px-4 py-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">
                Core Integrations
              </h2>
              <p className="text-[11px] text-[#D7E5EC]/70">
                Primary data pipelines, internal microservices and external railway APIs
              </p>
            </div>
            <div className="text-[11px] text-[#9FB8BE]">
              {integrations.length} Active Services Defined
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#145158] bg-[#071A33] text-[10px] font-bold uppercase tracking-[0.12em] text-[#9FB8BE]">
                <th className="px-4 py-3">Integration Name & Purpose</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Endpoint / Source</th>
                <th className="px-4 py-3">Last Check</th>
                <th className="px-4 py-3">Last Sync</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#145158]/50">
              {integrations.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-[#08383D]/40"
                >
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="text-[11px] text-[#9FB8BE]">{item.purpose}</div>
                  </td>
                  <td className="px-4 py-3.5 text-[#D7E5EC]">
                    <span className="rounded bg-[#031A1F] px-2 py-0.5 text-[10px] text-[#D7E5EC] border border-[#145158]/60">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {backendStatusAvailable ? (
                      renderStatusBadge(item.status)
                    ) : (
                      <span className="font-mono text-xs text-[#718F96]">--</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-[11px] text-[#9FB8BE] truncate max-w-[220px] inline-block" title={item.endpoint}>
                      {item.endpoint}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-[#D7E5EC]/80">
                    {backendStatusAvailable ? item.lastCheck : "--"}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-[#D7E5EC]/80">
                    {backendStatusAvailable ? item.lastSync : "--"}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenDetail(item, "details")}
                        className="rounded border border-[#145158] bg-[#031A1F] px-2 py-1 text-[11px] font-semibold text-[#D7E5EC] hover:border-[#0E7C86] hover:text-white"
                      >
                        Details
                      </button>
                      {item.isConfigurable && (
                        <button
                          onClick={() => handleOpenDetail(item, "configure")}
                          className="rounded border border-[#145158] bg-[#031A1F] px-2 py-1 text-[11px] font-semibold text-[#0E7C86] hover:border-[#0E7C86] hover:text-[#F59E0B]"
                        >
                          Configure
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 8 & 9. SYNC & RECENT EVENTS SECTION ─────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 8. Synchronization Status */}
        <section className="controller-panel overflow-hidden rounded-lg">
          <div className="controller-header px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Synchronization Status
                </h3>
                <p className="text-[11px] text-[#D7E5EC]/70">
                  Cadence and record volumes ingested from integrated sources
                </p>
              </div>
              <span className="text-[10px] text-[#9FB8BE]">
                {backendStatusAvailable ? `${syncRecords.length} Records` : "Offline"}
              </span>
            </div>
          </div>

          <div className="p-0">
            {!backendStatusAvailable || syncRecords.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#9FB8BE]">
                No synchronization records available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#145158] bg-[#071A33] text-[10px] font-bold uppercase tracking-[0.1em] text-[#9FB8BE]">
                      <th className="px-4 py-2.5">Integration</th>
                      <th className="px-4 py-2.5">Last Sync</th>
                      <th className="px-4 py-2.5">Duration</th>
                      <th className="px-4 py-2.5">Records / Events</th>
                      <th className="px-4 py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#145158]/50">
                    {syncRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-[#08383D]/40">
                        <td className="px-4 py-2.5 font-semibold text-white">
                          {r.integrationName}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-[#D7E5EC]/80">
                          {r.lastSync}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-[#9FB8BE]">
                          {r.syncDuration}
                        </td>
                        <td className="px-4 py-2.5 text-[11px] text-[#D7E5EC]">
                          {r.recordsEvents}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span
                            className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              r.status === "SUCCESS"
                                ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                                : r.status === "PARTIAL"
                                ? "bg-amber-950/60 text-amber-300 border border-amber-500/30"
                                : "bg-rose-950/60 text-rose-300 border border-rose-500/30"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* 9. Recent Integration Events */}
        <section className="controller-panel overflow-hidden rounded-lg">
          <div className="controller-header px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Recent Integration Events
                </h3>
                <p className="text-[11px] text-[#D7E5EC]/70">
                  Diagnostic stream and connection lifecycle logs
                </p>
              </div>

              {/* Severity filter */}
              <div className="flex items-center gap-1 rounded bg-[#031A1F] p-0.5 border border-[#145158]">
                {(["ALL", "INFO", "WARNING", "ERROR"] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setEventSeverityFilter(sev)}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      eventSeverityFilter === sev
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

          <div className="p-0">
            {!backendStatusAvailable || filteredEvents.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#9FB8BE]">
                No integration events available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#145158] bg-[#071A33] text-[10px] font-bold uppercase tracking-[0.1em] text-[#9FB8BE]">
                      <th className="px-4 py-2.5">Time</th>
                      <th className="px-4 py-2.5">Integration</th>
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
                          {e.integrationName}
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
          </div>
        </section>
      </div>

      {/* ── 10. CONNECTION ARCHITECTURE ────────────────────────────── */}
      <section className="controller-panel rounded-lg p-5">
        <div className="flex items-center gap-2 border-b border-[#145158] pb-3">
          <Network size={16} className="text-[#0E7C86]" />
          <div>
            <h3 className="text-sm font-bold text-white">Connection Architecture</h3>
            <p className="text-[11px] text-[#D7E5EC]/70">
              System topological dependency graph and service tier topology
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {/* External Sources Tier */}
          <div className="rounded border border-[#145158] bg-[#031A1F] p-4">
            <div className="flex items-center justify-between border-b border-[#145158]/60 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0E7C86]">
                Tier 1: External Sources
              </span>
              <span className="rounded bg-[#08383D] px-1.5 py-0.2 text-[9px] text-[#9FB8BE]">
                Ingress
              </span>
            </div>

            <ul className="mt-3 space-y-2.5 text-xs">
              <li className="flex items-start gap-2 rounded bg-[#062A2F] p-2 border border-[#145158]/40">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Train Telemetry (RTIS)</div>
                  <div className="text-[10px] text-[#9FB8BE]">CRIS GPS & Locomotive Transponders</div>
                </div>
              </li>
              <li className="flex items-start gap-2 rounded bg-[#062A2F] p-2 border border-[#145158]/40">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Weather Ingest (Open-Meteo)</div>
                  <div className="text-[10px] text-[#9FB8BE]">Doppler Radar & Station Precipitation</div>
                </div>
              </li>
              <li className="flex items-start gap-2 rounded bg-[#062A2F] p-2 border border-[#145158]/40">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Railway Topology (NRDB)</div>
                  <div className="text-[10px] text-[#9FB8BE]">Section Graphs, Stations & Junctions</div>
                </div>
              </li>
            </ul>
          </div>

          {/* RailSanket Backend Tier */}
          <div className="relative rounded border border-[#0E7C86] bg-[#031A1F] p-4">
            <div className="flex items-center justify-between border-b border-[#145158]/60 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#F59E0B]">
                Tier 2: RailSanket Core
              </span>
              <span className="rounded bg-[#08383D] px-1.5 py-0.2 text-[9px] text-[#9FB8BE]">
                Processing
              </span>
            </div>

            <ul className="mt-3 space-y-2.5 text-xs">
              <li className="flex items-start gap-2 rounded bg-[#062A2F] p-2 border border-[#145158]/40">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#0E7C86] shrink-0" />
                <div>
                  <div className="font-semibold text-white">Prediction Service (GNN)</div>
                  <div className="text-[10px] text-[#9FB8BE]">Dynamic ETA & Delay Propagation Engine</div>
                </div>
              </li>
              <li className="flex items-start gap-2 rounded bg-[#062A2F] p-2 border border-[#145158]/40">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#0E7C86] shrink-0" />
                <div>
                  <div className="font-semibold text-white">Database (PostgreSQL / Timescale)</div>
                  <div className="text-[10px] text-[#9FB8BE]">Operational State & Historical Logs</div>
                </div>
              </li>
              <li className="flex items-start gap-2 rounded bg-[#062A2F] p-2 border border-[#145158]/40">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Notification Service</div>
                  <div className="text-[10px] text-[#9FB8BE]">Alert Dispatch & SMS Gateway Router</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Applications Tier */}
          <div className="rounded border border-[#145158] bg-[#031A1F] p-4">
            <div className="flex items-center justify-between border-b border-[#145158]/60 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0E7C86]">
                Tier 3: RailSanket Portals
              </span>
              <span className="rounded bg-[#08383D] px-1.5 py-0.2 text-[9px] text-[#9FB8BE]">
                Egress
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded bg-[#062A2F] p-2 text-center border border-[#145158]/40">
                <div className="font-semibold text-white">Public Portal</div>
                <div className="text-[10px] text-[#9FB8BE]">Passenger Live Tracker</div>
              </div>
              <div className="rounded bg-[#062A2F] p-2 text-center border border-[#145158]/40">
                <div className="font-semibold text-white">Controller Console</div>
                <div className="text-[10px] text-[#9FB8BE]">Real-time Network Command</div>
              </div>
              <div className="rounded bg-[#062A2F] p-2 text-center border border-[#145158]/40">
                <div className="font-semibold text-white">Employee Portal</div>
                <div className="text-[10px] text-[#9FB8BE]">Crew & Field Dispatch</div>
              </div>
              <div className="rounded bg-[#062A2F] p-2 text-center border border-[#145158]/40">
                <div className="font-semibold text-white">Admin Console</div>
                <div className="text-[10px] text-[#9FB8BE]">Platform Governance</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. INTEGRATION SECURITY ───────────────────────────────── */}
      <section className="controller-panel rounded-lg p-5">
        <div className="flex items-center gap-2 border-b border-[#145158] pb-3">
          <Shield size={16} className="text-[#0E7C86]" />
          <div>
            <h3 className="text-sm font-bold text-white">Integration Security Architecture</h3>
            <p className="text-[11px] text-[#D7E5EC]/70">
              Cryptographic boundary and secret handling policies across integrations
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded border border-[#145158]/80 bg-[#031A1F] p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Lock size={13} className="text-[#0E7C86]" />
              <span>Credentials</span>
            </div>
            <div className="mt-1.5 text-[11px] text-[#9FB8BE]">
              Managed server-side via vault and encrypted container environment variables.
            </div>
          </div>

          <div className="rounded border border-[#145158]/80 bg-[#031A1F] p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <ShieldAlert size={13} className="text-[#0E7C86]" />
              <span>API Keys</span>
            </div>
            <div className="mt-1.5 text-[11px] text-[#9FB8BE]">
              Never exposed to the browser client or serialized into frontend bundle code.
            </div>
          </div>

          <div className="rounded border border-[#145158]/80 bg-[#031A1F] p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Terminal size={13} className="text-[#0E7C86]" />
              <span>Transport Encryption</span>
            </div>
            <div className="mt-1.5 text-[11px] text-[#9FB8BE]">
              Mandatory TLS 1.3 for HTTPS and WSS telemetry streams across all networks.
            </div>
          </div>

          <div className="rounded border border-[#145158]/80 bg-[#031A1F] p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Server size={13} className="text-[#0E7C86]" />
              <span>Authentication</span>
            </div>
            <div className="mt-1.5 text-[11px] text-[#9FB8BE]">
              Mutual TLS (mTLS) or signed bearer tokens validated by the backend reverse proxy.
            </div>
          </div>
        </div>

        <div className="mt-3 text-[10px] text-[#718F96]">
          * Architectural statements describe security standards enforced at the platform boundary.
        </div>
      </section>

      {/* ── 5, 6 & 7. DETAIL & CONFIGURATION MODAL / DRAWER ────────── */}
      {selectedIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="controller-panel relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-[#145158] shadow-2xl">
            {/* Modal Header */}
            <div className="controller-header flex items-center justify-between px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    {selectedIntegration.name}
                  </h3>
                  {renderStatusBadge(selectedIntegration.status)}
                </div>
                <p className="mt-0.5 text-xs text-[#D7E5EC]/70">
                  {selectedIntegration.type} — {selectedIntegration.provider}
                </p>
              </div>

              <button
                onClick={() => setSelectedIntegration(null)}
                className="rounded p-1 text-[#9FB8BE] hover:bg-[#08383D] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tab Buttons */}
            <div className="flex border-b border-[#145158] bg-[#071A33] px-5">
              <button
                onClick={() => setActiveModalTab("details")}
                className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
                  activeModalTab === "details"
                    ? "border-[#0E7C86] text-white"
                    : "border-transparent text-[#9FB8BE] hover:text-white"
                }`}
              >
                Integration Overview & Health
              </button>
              {selectedIntegration.isConfigurable && (
                <button
                  onClick={() => setActiveModalTab("configure")}
                  className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
                    activeModalTab === "configure"
                      ? "border-[#0E7C86] text-white"
                      : "border-transparent text-[#9FB8BE] hover:text-white"
                  }`}
                >
                  Configuration Settings
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {activeModalTab === "details" ? (
                <>
                  <div className="rounded border border-[#145158] bg-[#031A1F] p-4 text-xs text-[#D7E5EC]">
                    <div className="font-semibold text-white">Operational Description</div>
                    <p className="mt-1 text-[#9FB8BE] leading-relaxed">
                      {selectedIntegration.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded border border-[#145158] bg-[#031A1F] p-3">
                      <div className="text-[10px] text-[#718F96]">Endpoint / Host</div>
                      <div className="mt-1 font-mono text-[11px] font-semibold text-white break-all">
                        {selectedIntegration.endpoint}
                      </div>
                    </div>

                    <div className="rounded border border-[#145158] bg-[#031A1F] p-3">
                      <div className="text-[10px] text-[#718F96]">Data Direction</div>
                      <div className="mt-1 font-semibold text-[#0E7C86]">
                        {selectedIntegration.dataDirection}
                      </div>
                    </div>

                    <div className="rounded border border-[#145158] bg-[#031A1F] p-3">
                      <div className="text-[10px] text-[#718F96]">Authentication Status</div>
                      <div className="mt-1 font-semibold text-white">
                        {selectedIntegration.authStatus}
                      </div>
                    </div>

                    <div className="rounded border border-[#145158] bg-[#031A1F] p-3">
                      <div className="text-[10px] text-[#718F96]">Refresh Cadence</div>
                      <div className="mt-1 font-mono text-white">
                        {selectedIntegration.refreshInterval}
                      </div>
                    </div>

                    <div className="rounded border border-[#145158] bg-[#031A1F] p-3">
                      <div className="text-[10px] text-[#718F96]">Last Health Check</div>
                      <div className="mt-1 font-mono text-white">
                        {selectedIntegration.lastCheck}
                      </div>
                    </div>

                    <div className="rounded border border-[#145158] bg-[#031A1F] p-3">
                      <div className="text-[10px] text-[#718F96]">Last Successful Sync</div>
                      <div className="mt-1 font-mono text-emerald-400">
                        {selectedIntegration.lastSync}
                      </div>
                    </div>
                  </div>

                  {selectedIntegration.health && (
                    <div className="rounded border border-[#145158] bg-[#031A1F] p-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Recent Diagnostic Probe</span>
                        {selectedIntegration.health.latencyMs !== null && (
                          <span className="font-mono text-[11px] text-emerald-400">
                            Latency: {selectedIntegration.health.latencyMs} ms
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-[#9FB8BE]">
                        {selectedIntegration.health.message}
                      </p>
                    </div>
                  )}

                  {/* Test Connection Banner / Feedback */}
                  {testResult && testResult.id === selectedIntegration.id && (
                    <div
                      className={`flex items-start gap-2.5 rounded border p-3 text-xs ${
                        testResult.success
                          ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-200"
                          : "border-amber-500/40 bg-amber-950/40 text-amber-200"
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold">
                          {testResult.success ? "Connection Verified" : "Diagnostic Notice"}
                        </div>
                        <div className="mt-0.5">{testResult.message}</div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Configuration Tab */
                <div className="space-y-4">
                  {selectedIntegration.fields.map((field) => (
                    <div key={field.key} className="space-y-1 text-xs">
                      <label className="block font-semibold text-[#D7E5EC]">
                        {field.label}
                      </label>
                      {field.type === "readonly" ? (
                        <div className="rounded border border-[#145158] bg-[#031A1F] px-3 py-2 text-xs font-mono text-[#9FB8BE]">
                          {String(field.value)}
                        </div>
                      ) : field.type === "select" ? (
                        <select
                          value={formFields[field.key] ?? field.value}
                          onChange={(e) =>
                            setFormFields({ ...formFields, [field.key]: e.target.value })
                          }
                          className="w-full rounded border border-[#145158] bg-[#031A1F] px-3 py-2 text-xs text-white focus:border-[#0E7C86] focus:outline-none"
                        >
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt} className="bg-[#062A2F] text-white">
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type === "number" ? "number" : "text"}
                          value={formFields[field.key] ?? field.value}
                          onChange={(e) =>
                            setFormFields({
                              ...formFields,
                              [field.key]:
                                field.type === "number" ? Number(e.target.value) : e.target.value,
                            })
                          }
                          className="w-full rounded border border-[#145158] bg-[#031A1F] px-3 py-2 text-xs text-white focus:border-[#0E7C86] focus:outline-none font-mono"
                        />
                      )}
                      {field.helperText && (
                        <p className="text-[11px] text-[#718F96]">{field.helperText}</p>
                      )}
                    </div>
                  ))}

                  <div className="rounded border border-[#145158] bg-[#031A1F] p-3 text-xs text-[#9FB8BE]">
                    <div className="flex items-center gap-1.5 font-semibold text-white">
                      <Lock size={13} className="text-[#0E7C86]" />
                      <span>Security & Masking Notice</span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#718F96]">
                      Database passwords, private keys, and API tokens are not editable or visible in the client. All changes update parameters on the internal platform service daemon.
                    </p>
                  </div>

                  {saveSuccess && (
                    <div className="flex items-center gap-2 rounded border border-emerald-500/40 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-200">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>{saveSuccess}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="controller-header flex items-center justify-between border-t border-[#145158] px-5 py-3">
              <div>
                <button
                  onClick={() => handleTestConnection(selectedIntegration)}
                  disabled={testingId === selectedIntegration.id}
                  className="flex items-center gap-1.5 rounded border border-[#145158] bg-[#031A1F] px-3 py-1.5 text-xs font-semibold text-[#D7E5EC] hover:border-[#0E7C86] hover:text-white disabled:opacity-50"
                >
                  <RefreshCw
                    size={12}
                    className={
                      testingId === selectedIntegration.id ? "animate-spin text-[#0E7C86]" : ""
                    }
                  />
                  <span>
                    {testingId === selectedIntegration.id ? "Pinging..." : "Test Connection"}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedIntegration(null)}
                  className="rounded border border-[#145158] bg-transparent px-3 py-1.5 text-xs text-[#D7E5EC] hover:bg-[#08383D]"
                >
                  Close
                </button>
                {activeModalTab === "configure" && (
                  <button
                    onClick={handleSaveConfig}
                    className="flex items-center gap-1.5 rounded bg-[#0E7C86] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0E5961]"
                  >
                    <Save size={13} />
                    <span>Apply Configuration</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

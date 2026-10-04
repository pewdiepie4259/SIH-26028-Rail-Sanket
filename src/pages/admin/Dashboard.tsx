import { useState, useEffect } from "react"
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Clock,
  CloudRain,
  Cpu,
  FileText,
  Info,
  Network,
  Radio,
  RefreshCw,
  Server,
  Shield,
  ShieldCheck,
  Users,
  Wifi,
} from "lucide-react"
import { Link } from "react-router-dom"

/* ── Inline dark alert marquee for System Dashboard ────────────────── */
const ADMIN_ALERTS = [
  { id: "1", type: "warning" as const, message: "Train 12628 Karnataka Express running 18 min late via Guntakal section." },
  { id: "2", type: "info" as const,    message: "Telemetry stream nominal — all 6 GNN prediction nodes operational." },
  { id: "3", type: "warning" as const, message: "Heavy monsoon rainfall may affect YPR–SBC corridor, +8–15 min buffer advised." },
  { id: "4", type: "info" as const,    message: "Brindavan Express 12639 on-time — ETD 07:00 IST confirmed." },
  { id: "5", type: "critical" as const,message: "Section advisory active: Jolarpettai–Chennai block — speed restriction 75 km/h." },
]
function AdminAlertMarquee() {
  return (
    <div className="mb-5 w-full overflow-hidden rounded-xl border border-[#164B5A] bg-[#040E1B]/90 shadow-lg">
      <div className="flex h-10 items-center w-full min-w-0">
        {/* Label */}
        <div className="flex h-full shrink-0 items-center gap-2 border-r border-[#164B5A] px-4 bg-[#071A33]">
          <Radio size={15} strokeWidth={2.5} className="text-[#F59E0B]" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-white whitespace-nowrap">Live Alerts</span>
        </div>
        {/* Scrolling content */}
        <div className="relative flex-1 min-w-0 overflow-hidden">
          <div className="alert-marquee flex w-max items-center">
            {[...ADMIN_ALERTS, ...ADMIN_ALERTS].map((alert, index) => (
              <div key={`${alert.id}-${index}`} className="flex items-center gap-2 whitespace-nowrap px-5 text-xs">
                {alert.type === "critical" ? (
                  <AlertTriangle size={13} strokeWidth={2.5} className="text-red-400" />
                ) : alert.type === "warning" ? (
                  <AlertTriangle size={13} strokeWidth={2.5} className="text-[#F59E0B]" />
                ) : (
                  <Info size={13} strokeWidth={2.5} className="text-[#0E7C86]" />
                )}
                <span className={`font-semibold ${alert.type === "critical" ? "text-red-300" : alert.type === "warning" ? "text-amber-200" : "text-slate-300"}`}>
                  {alert.message}
                </span>
                <span className="ml-3 text-[#F59E0B]/40">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


type ServiceStatus = "Operational" | "Degraded" | "Offline"

interface ServiceItem {
  id: string
  name: string
  category: string
  status: ServiceStatus
  lastCheck: string
  responseTime: string
  version: string
  targetRoute?: string
}

interface IntegrationItem {
  id: string
  name: string
  provider: string
  status: "Connected" | "Degraded" | "Disconnected"
  lastSync: string
  route: string
}

interface ActivityItem {
  id: string
  time: string
  admin: string
  action: string
  resource: string
  status: "Success" | "Applied" | "Reviewed" | "Pending"
}

interface SystemEventItem {
  id: string
  time: string
  severity: "INFO" | "WARNING" | "ERROR"
  source: string
  message: string
}

const initialServices: ServiceItem[] = [
  {
    id: "api_gw",
    name: "API Gateway",
    category: "Core Gateway",
    status: "Operational",
    lastCheck: "Just now",
    responseTime: "84 ms",
    version: "v1.4.2",
    targetRoute: "/admin/integrations",
  },
  {
    id: "telem_svc",
    name: "Telemetry Service",
    category: "Locomotive Feeds",
    status: "Operational",
    lastCheck: "Just now",
    responseTime: "12 ms",
    version: "v2.1.0",
    targetRoute: "/admin/integrations",
  },
  {
    id: "pred_svc",
    name: "Prediction Service (GNN)",
    category: "Analytics & ETA",
    status: "Operational",
    lastCheck: "1 min ago",
    responseTime: "142 ms",
    version: "v2.4.0",
    targetRoute: "/admin/models",
  },
  {
    id: "weather_svc",
    name: "Weather Service",
    category: "Environmental",
    status: "Operational",
    lastCheck: "2 mins ago",
    responseTime: "210 ms",
    version: "v1.2.0",
    targetRoute: "/admin/weather",
  },
  {
    id: "notif_svc",
    name: "Notification Service",
    category: "Messaging & Dispatch",
    status: "Operational",
    lastCheck: "Just now",
    responseTime: "65 ms",
    version: "v1.1.0",
    targetRoute: "/admin/alerts",
  },
  {
    id: "db_svc",
    name: "Railway Database",
    category: "Primary Store",
    status: "Operational",
    lastCheck: "Just now",
    responseTime: "18 ms",
    version: "PostgreSQL 16",
  },
  {
    id: "ws_svc",
    name: "WebSocket Service",
    category: "Live Streaming",
    status: "Operational",
    lastCheck: "Just now",
    responseTime: "8 ms",
    version: "v1.0.4",
  },
]

const initialIntegrations: IntegrationItem[] = [
  {
    id: "rtis",
    name: "RTIS / Telemetry Stream",
    provider: "CRIS Locomotive Feed",
    status: "Connected",
    lastSync: "20 seconds ago",
    route: "/admin/integrations",
  },
  {
    id: "network_data",
    name: "Railway Network Data",
    provider: "National Railway Database (NRDB)",
    status: "Connected",
    lastSync: "4 mins ago",
    route: "/admin/integrations",
  },
  {
    id: "weather_provider",
    name: "Weather Provider",
    provider: "Open-Meteo & IMD Radar Feeds",
    status: "Connected",
    lastSync: "5 mins ago",
    route: "/admin/weather",
  },
  {
    id: "notification_gw",
    name: "Notification Gateway",
    provider: "Internal SMS & Dispatch Relay",
    status: "Connected",
    lastSync: "1 min ago",
    route: "/admin/alerts",
  },
]

const recentActivity: ActivityItem[] = [
  {
    id: "act_1",
    time: "12:42",
    admin: "Chief Administrator",
    action: "User role verified",
    resource: "user_ctrl_2001 (Shriya M)",
    status: "Success",
  },
  {
    id: "act_2",
    time: "12:35",
    admin: "System Automated",
    action: "Weather threshold verified",
    resource: "Sector SBC-BYPL Rainfall > 40mm",
    status: "Applied",
  },
  {
    id: "act_3",
    time: "12:15",
    admin: "Chief Administrator",
    action: "Model configuration inspected",
    resource: "Dynamic GNN ETA v2.4-prod",
    status: "Reviewed",
  },
  {
    id: "act_4",
    time: "11:50",
    admin: "Senior Dispatcher",
    action: "Alert rule reviewed",
    resource: "Rule #4: Junction Convergence",
    status: "Applied",
  },
  {
    id: "act_5",
    time: "11:20",
    admin: "System Automated",
    action: "Integration config synchronized",
    resource: "RTIS Telemetry Gateway",
    status: "Success",
  },
]

const systemEvents: SystemEventItem[] = [
  {
    id: "evt_1",
    time: "12:44:10",
    severity: "INFO",
    source: "Telemetry Stream",
    message: "Locomotive RTIS telemetry connection active on Bengaluru Division (5 active feeds).",
  },
  {
    id: "evt_2",
    time: "12:41:05",
    severity: "INFO",
    source: "Database",
    message: "Primary database connection verified healthy with 18 ms latency.",
  },
  {
    id: "evt_3",
    time: "12:38:22",
    severity: "WARNING",
    source: "Weather Service",
    message: "Upstream radar feed latency temporarily elevated to 210 ms (within 500 ms SLA).",
  },
  {
    id: "evt_4",
    time: "12:30:00",
    severity: "INFO",
    source: "Prediction Service",
    message: "Graph Neural Network inference cycles normal across 14 monitored blocks.",
  },
]

export default function AdminDashboard() {
  const [lastChecked, setLastChecked] = useState("Just now")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [systemStatuses, setSystemStatuses] = useState<Record<string, boolean>>({
    platform: true,
    apiGateway: true,
    database: true,
    telemetry: true,
    weather: true,
    prediction: true,
  })

  const toggleStatus = (key: string) => {
    setSystemStatuses((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  useEffect(() => {
    let mounted = true
    fetch("http://localhost:5000/health", { method: "GET", signal: AbortSignal.timeout(2000) })
      .then((res) => {
        if (mounted && res.ok) {
          setSystemStatuses({
            platform: true,
            apiGateway: true,
            database: true,
            telemetry: true,
            weather: true,
            prediction: true,
          })
        }
      })
      .catch(() => {
        // Keep default operational status if server is not yet running
      })
    return () => {
      mounted = false
    }
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetch("http://localhost:5000/health", { method: "GET", signal: AbortSignal.timeout(2000) })
      .then((res) => {
        if (res.ok) {
          setSystemStatuses({
            platform: true,
            apiGateway: true,
            database: true,
            telemetry: true,
            weather: true,
            prediction: true,
          })
        }
      })
      .catch(() => {
        // Keep current states if server is not reached
      })
      .finally(() => {
        setLastChecked("Just now")
        setIsRefreshing(false)
      })
  }

  const statusItems = [
    {
      key: "platform",
      label: "Platform",
      activeText: "Operational",
      inactiveText: "Non-Operational",
    },
    {
      key: "apiGateway",
      label: "API Gateway",
      activeText: "Online",
      inactiveText: "Offline",
    },
    {
      key: "database",
      label: "Database",
      activeText: "Online",
      inactiveText: "Offline",
    },
    {
      key: "telemetry",
      label: "Telemetry Stream",
      activeText: "Connected",
      inactiveText: "Disconnected",
    },
    {
      key: "weather",
      label: "Weather Service",
      activeText: "Online",
      inactiveText: "Offline",
    },
    {
      key: "prediction",
      label: "Prediction Service",
      activeText: "Operational",
      inactiveText: "Non-Operational",
    },
  ]

  return (
    <div className="controller-page min-h-full px-4 py-5 lg:px-6 bg-gradient-to-b from-[#0A2D3B] via-[#020810] to-[#0A2D3B] text-slate-100">
      {/* ── 1. PAGE HEADER ────────────────────────────────────────── */}
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            System Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="controller-panel hidden rounded-lg border border-[#164B5A] bg-[#071A33]/90 px-3 py-2 text-xs text-slate-300 sm:flex sm:items-center sm:gap-2">
            <Clock size={13} className="text-[#F59E0B]" />
            <span>Checked: <strong className="text-white">{lastChecked}</strong></span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="controller-panel inline-flex items-center gap-1.5 rounded-lg border border-[#164B5A] bg-[#071A33]/90 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-[#0E5961] hover:text-white cursor-pointer"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? "animate-spin text-[#F59E0B]" : "text-[#0E7C86]"}
            />
            <span>{isRefreshing ? "Checking..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* ── 2. IR HERO BANNER ──────────────────────────────────────── */}
      <div className="mb-5 relative w-full overflow-hidden rounded-2xl border border-[#164B5A] shadow-2xl" style={{ minHeight: '180px' }}>
        <img
          src="/images/ir_headquarters.jpg"
          alt="Indian Railways Headquarters, Rail Bhawan, New Delhi"
          className="absolute inset-0 h-full w-full object-cover object-center"
          style={{ filter: 'brightness(0.45)' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020810]/90 via-[#020810]/60 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center px-6 py-8 sm:px-10" style={{ minHeight: '180px' }}>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#F59E0B]">
            Ministry of Railways · Government of India
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white whitespace-nowrap">
            Welcome to{" "}
            <span className="text-[#F59E0B]">Indian Railways</span>
          </h2>
          <p className="mt-1.5 text-sm font-semibold tracking-widest text-slate-300 uppercase">
            Lifeline of the Nation
          </p>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Rail Bhawan, New Delhi &nbsp;·&nbsp; Estd. 1853 &nbsp;·&nbsp; Serving 1.3B+ Indians</span>
          </div>
        </div>
      </div>

      {/* ── 3. LIVE ALERTS MARQUEE ─────────────────────────────────── */}
      <AdminAlertMarquee />

      {/* ── 4. SYSTEM STATUS STRIP ─────────────────────────────────── */}
      <section className="controller-panel rounded-xl border border-[#164B5A] bg-[#071A33]/90 p-4 overflow-visible shadow-xl backdrop-blur-md">
        <div className="mb-2.5 text-xs font-black uppercase tracking-[0.16em] text-teal-300">
          System Status
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 overflow-visible py-1">
          {statusItems.map((item) => {
            const isActive = systemStatuses[item.key] ?? true
            return (
              <div
                key={item.key}
                onClick={() => toggleStatus(item.key)}
                title={`Click to toggle ${item.label} status`}
                className="group relative cursor-pointer select-none rounded-xl bg-[#0A2036]/90 p-3.5 border border-[#16364A] shadow-md transition-all duration-300 ease-out hover:z-20 hover:-translate-y-1.5 hover:scale-[1.04] hover:bg-[#0E2A47] hover:border-[#F59E0B] hover:shadow-[0_12px_28px_-4px_rgba(245,158,11,0.4),0_0_20px_rgba(245,158,11,0.3)] active:scale-[0.98]"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200 tracking-tight transition-colors group-hover:text-white">
                    {item.label}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm font-black tracking-tight ${isActive ? "text-emerald-400" : "text-rose-400"}`}>
                      {isActive ? item.activeText : item.inactiveText}
                    </span>
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span
                        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 ${
                          isActive ? "bg-emerald-400" : "bg-rose-400"
                        }`}
                      />
                      <span
                        className={`relative inline-flex h-2 w-2 rounded-full ${
                          isActive
                            ? "bg-emerald-400 shadow-[0_0_5px_rgba(16,185,129,0.7)]"
                            : "bg-rose-400 shadow-[0_0_5px_rgba(244,63,94,0.7)]"
                        }`}
                      />
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── 3. PLATFORM OVERVIEW ──────────────────────────────────── */}
      <section className="mt-5">
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-teal-300">
          Platform Overview
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="controller-panel rounded-xl p-3 border border-[#164B5A] bg-[#071A33]/90 shadow-md">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <span>Active Users</span>
              <Users size={14} className="text-teal-400" />
            </div>
            <div className="mt-1 text-xl font-bold text-white">4</div>
            <div className="mt-0.5 text-[11px] font-medium text-slate-200">System demo sessions</div>
          </div>

          <div className="controller-panel rounded-xl p-3 border border-[#164B5A] bg-[#071A33]/90 shadow-md">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <span>Controllers Online</span>
              <Shield size={14} className="text-teal-400" />
            </div>
            <div className="mt-1 text-xl font-bold text-emerald-400">1</div>
            <div className="mt-0.5 text-[11px] font-medium text-emerald-300">SBC Operations Desk</div>
          </div>

          <div className="controller-panel rounded-xl p-3 border border-[#164B5A] bg-[#071A33]/90 shadow-md">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <span>Staff Registered</span>
              <FileText size={14} className="text-teal-400" />
            </div>
            <div className="mt-1 text-xl font-bold text-white">12</div>
            <div className="mt-0.5 text-[11px] font-medium text-slate-200">Division directory</div>
          </div>

          <div className="controller-panel rounded-xl p-3 border border-[#164B5A] bg-[#071A33]/90 shadow-md">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <span>Live Telemetry Feeds</span>
              <Radio size={14} className="text-[#F59E0B]" />
            </div>
            <div className="mt-1 text-xl font-bold text-white">5 Active</div>
            <div className="mt-0.5 text-[11px] text-emerald-300 font-semibold">WebSocket synchronous</div>
          </div>

          <div className="controller-panel rounded-xl p-3 border border-[#164B5A] bg-[#071A33]/90 shadow-md">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <span>Open Alerts</span>
              <AlertTriangle size={14} className="text-[#F59E0B]" />
            </div>
            <div className="mt-1 text-xl font-bold text-amber-400">3</div>
            <div className="mt-0.5 text-[11px] font-medium text-amber-200">Sector interventions</div>
          </div>

          <div className="controller-panel rounded-xl p-3 border border-[#164B5A] bg-[#071A33]/90 shadow-md">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <span>Data Sync</span>
              <Wifi size={14} className="text-teal-400" />
            </div>
            <div className="mt-1 text-sm font-bold text-teal-300">Synchronous</div>
            <div className="mt-0.5 text-[11px] font-medium text-slate-200">Last sync: <span className="text-white font-semibold">Just now</span></div>
          </div>
        </div>
      </section>

      {/* ── 4. SERVICE HEALTH & INTEGRATION STATUS ─────────────────── */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        {/* Service Health Table */}
        <section className="controller-panel overflow-hidden rounded-xl border border-[#164B5A] bg-[#071A33]/90 shadow-xl">
          <div className="controller-header px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server size={16} className="text-[#F59E0B]" />
                <div>
                  <h2 className="text-sm font-bold text-white">
                    Service Health
                  </h2>
                  <p className="text-[12px] font-medium text-slate-200">
                    Microservice runtime latency, response SLAs, and versions
                  </p>
                </div>
              </div>
              <span className="rounded border border-teal-500/40 bg-teal-950/40 px-2 py-0.5 text-[10px] font-semibold text-teal-200">
                {initialServices.length} Monitored
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#164B5A] bg-[#0A2036] text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                  <th className="px-4 py-2.5">Service</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Last Check</th>
                  <th className="px-4 py-2.5">Response</th>
                  <th className="px-4 py-2.5">Version</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#164B5A]/40">
                {initialServices.map((svc) => (
                  <tr key={svc.id} className="transition-colors hover:bg-[#0A2036]/60">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{svc.name}</div>
                      <div className="text-[11px] font-medium text-slate-200">{svc.category}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded border border-emerald-500/40 bg-emerald-950/50 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        {svc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] font-medium text-white">
                      {svc.lastCheck}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-[11px] text-teal-200">
                      {svc.responseTime}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-[11px] text-slate-200">
                      {svc.version}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {svc.targetRoute ? (
                        <Link
                          to={svc.targetRoute}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-300 hover:text-[#F59E0B]"
                        >
                          Configure
                          <ArrowUpRight size={12} />
                        </Link>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-300">System</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[#164B5A] bg-[#0A2036]/90 px-4 py-2.5 text-[11px] font-medium text-slate-200">
            Representative system configuration metrics. Latency and health polled continuously.
          </div>
        </section>

        {/* Integration Status */}
        <section className="controller-panel flex flex-col justify-between overflow-hidden rounded-xl border border-[#164B5A] bg-[#071A33]/90 shadow-xl">
          <div>
            <div className="controller-header px-4 py-3">
              <div className="flex items-center gap-2">
                <Network size={16} className="text-[#F59E0B]" />
                <div>
                  <h2 className="text-sm font-bold text-white">
                    External Integrations
                  </h2>
                  <p className="text-[12px] font-medium text-slate-200">
                    Connected railway telemetry and sensor streams
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-[#164B5A]/40 p-3">
              {initialIntegrations.map((item) => (
                <div key={item.id} className="py-2.5 first:pt-1 last:pb-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {item.name}
                      </div>
                      <div className="text-[11px] font-medium text-slate-200">
                        {item.provider}
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded border border-emerald-500/40 bg-emerald-950/50 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-200 font-medium">Last sync: <span className="text-white">{item.lastSync}</span></span>
                    <Link
                      to={item.route}
                      className="font-bold text-teal-300 hover:text-[#F59E0B]"
                    >
                      Configure Source →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#164B5A] bg-[#0A2036]/90 p-3 text-[11px] font-medium text-slate-200">
            All integrations require active API tokens configured under{" "}
            <Link to="/admin/integrations" className="text-[#F59E0B] font-bold underline hover:text-amber-300">
              Integrations settings
            </Link>.
          </div>
        </section>
      </div>

      {/* ── 5. RECENT ACTIVITY & SYSTEM EVENTS ────────────────────── */}
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {/* Recent Admin Activity */}
        <section className="controller-panel overflow-hidden rounded-xl border border-[#164B5A] bg-[#071A33]/90 shadow-xl">
          <div className="controller-header px-4 py-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#F59E0B]" />
              <div>
                <h2 className="text-sm font-bold text-white">
                  Recent Administrative Activity
                </h2>
                <p className="text-[12px] font-medium text-slate-200">
                  Chronological log of administrative actions and rule changes
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#164B5A] bg-[#0A2036] text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                  <th className="px-4 py-2.5">Time</th>
                  <th className="px-4 py-2.5">Administrator</th>
                  <th className="px-4 py-2.5">Action</th>
                  <th className="px-4 py-2.5">Resource</th>
                  <th className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#164B5A]/40">
                {recentActivity.map((act) => (
                  <tr key={act.id} className="transition-colors hover:bg-[#0A2036]/60">
                    <td className="px-4 py-2.5 font-mono text-[11px] font-semibold text-slate-200">
                      {act.time}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-white">
                      {act.admin}
                    </td>
                    <td className="px-4 py-2.5 text-slate-100 font-medium">{act.action}</td>
                    <td className="px-4 py-2.5 font-mono text-[11px] font-semibold text-teal-300">
                      {act.resource}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="rounded border border-emerald-500/40 bg-emerald-950/50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                        {act.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* System Events */}
        <section className="controller-panel overflow-hidden rounded-xl border border-[#164B5A] bg-[#071A33]/90 shadow-xl">
          <div className="controller-header px-4 py-3">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[#F59E0B]" />
              <div>
                <h2 className="text-sm font-bold text-white">System Events</h2>
                <p className="text-[12px] font-medium text-slate-200">
                  Infrastructure runtime warnings, restarts, and sync diagnostics
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-[#164B5A]/40 p-4">
            {systemEvents.map((evt) => (
              <div key={evt.id} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${evt.severity === "ERROR"
                          ? "border border-red-500/40 bg-red-950/50 text-red-300"
                          : evt.severity === "WARNING"
                            ? "border border-amber-500/40 bg-amber-950/50 text-amber-300"
                            : "border border-emerald-500/40 bg-emerald-950/50 text-emerald-300"
                        }`}
                    >
                      {evt.severity}
                    </span>
                    <span className="font-semibold text-white">{evt.source}</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-slate-200">
                    {evt.time}
                  </span>
                </div>
                <p className="mt-1 text-xs text-white font-medium">{evt.message}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-[#164B5A] bg-[#0A2036]/90 px-4 py-2.5 text-[11px] font-medium text-slate-200">
            System logs retained for 90 days. Export available in{" "}
            <Link to="/admin/audit" className="text-[#F59E0B] font-bold underline hover:text-amber-300">
              Audit Logs
            </Link>.
          </div>
        </section>
      </div>

      {/* ── 6. QUICK ADMIN ACTIONS ─────────────────────────────────── */}
      <section className="mt-5 controller-panel rounded-xl p-4 border border-[#164B5A] bg-[#071A33]/90 shadow-xl">
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-teal-300">
          Administrative Quick Navigation
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Link
            to="/admin/users"
            className="flex flex-col items-center justify-center rounded-xl border border-[#164B5A] bg-[#0A2036]/90 p-3 text-center transition hover:border-[#F59E0B] hover:bg-[#0E2A47] hover:shadow-lg cursor-pointer group"
          >
            <Users size={20} className="text-teal-400 group-hover:text-[#F59E0B] transition-colors" />
            <div className="mt-2 text-xs font-bold text-white group-hover:text-[#F59E0B] transition-colors">Manage Users</div>
            <div className="text-[11px] font-medium text-slate-200 group-hover:text-white">Roles & Permissions</div>
          </Link>

          <Link
            to="/admin/models"
            className="flex flex-col items-center justify-center rounded-xl border border-[#164B5A] bg-[#0A2036]/90 p-3 text-center transition hover:border-[#F59E0B] hover:bg-[#0E2A47] hover:shadow-lg cursor-pointer group"
          >
            <Cpu size={20} className="text-[#F59E0B] transition-colors" />
            <div className="mt-2 text-xs font-bold text-white group-hover:text-[#F59E0B] transition-colors">Configure ETA Model</div>
            <div className="text-[11px] font-medium text-slate-200 group-hover:text-white">GNN Parameters</div>
          </Link>

          <Link
            to="/admin/weather"
            className="flex flex-col items-center justify-center rounded-xl border border-[#164B5A] bg-[#0A2036]/90 p-3 text-center transition hover:border-[#F59E0B] hover:bg-[#0E2A47] hover:shadow-lg cursor-pointer group"
          >
            <CloudRain size={20} className="text-teal-400 group-hover:text-[#F59E0B] transition-colors" />
            <div className="mt-2 text-xs font-bold text-white group-hover:text-[#F59E0B] transition-colors">Configure Weather</div>
            <div className="text-[11px] font-medium text-slate-200 group-hover:text-white">Radar & Thresholds</div>
          </Link>

          <Link
            to="/admin/integrations"
            className="flex flex-col items-center justify-center rounded-xl border border-[#164B5A] bg-[#0A2036]/90 p-3 text-center transition hover:border-[#F59E0B] hover:bg-[#0E2A47] hover:shadow-lg cursor-pointer group"
          >
            <Network size={20} className="text-teal-400 group-hover:text-[#F59E0B] transition-colors" />
            <div className="mt-2 text-xs font-bold text-white group-hover:text-[#F59E0B] transition-colors">View Integrations</div>
            <div className="text-[11px] font-medium text-slate-200 group-hover:text-white">RTIS, NRDB, Feeds</div>
          </Link>

          <Link
            to="/admin/alerts"
            className="flex flex-col items-center justify-center rounded-xl border border-[#164B5A] bg-[#0A2036]/90 p-3 text-center transition hover:border-[#F59E0B] hover:bg-[#0E2A47] hover:shadow-lg cursor-pointer group"
          >
            <Bell size={20} className="text-[#F59E0B] transition-colors" />
            <div className="mt-2 text-xs font-bold text-white group-hover:text-[#F59E0B] transition-colors">Review Alerts</div>
            <div className="text-[11px] font-medium text-slate-200 group-hover:text-white">Dispatch Rules</div>
          </Link>

          <Link
            to="/admin/audit"
            className="flex flex-col items-center justify-center rounded-xl border border-[#164B5A] bg-[#0A2036]/90 p-3 text-center transition hover:border-[#F59E0B] hover:bg-[#0E2A47] hover:shadow-lg cursor-pointer group"
          >
            <FileText size={20} className="text-teal-400 group-hover:text-[#F59E0B] transition-colors" />
            <div className="mt-2 text-xs font-bold text-white group-hover:text-[#F59E0B] transition-colors">View Audit Logs</div>
            <div className="text-[11px] font-medium text-slate-200 group-hover:text-white">Security Trail</div>
          </Link>
        </div>
      </section>
    </div>
  )
}


import { useState } from "react"
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Clock,
  CloudRain,
  Cpu,
  FileText,
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

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setLastChecked("Just now")
      setIsRefreshing(false)
    }, 600)
  }

  return (
    <div className="controller-page px-4 py-5 lg:px-6">
      {/* ── 1. PAGE HEADER ────────────────────────────────────────── */}
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#F59E0B]">
            System Administration
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            System Dashboard
          </h1>

          <p className="mt-1 text-sm text-[#9FB8BE]">
            Platform health, services, integrations and operational administration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="controller-panel hidden rounded-lg px-3 py-2 text-xs text-[#9FB8BE] sm:flex sm:items-center sm:gap-2">
            <Clock size={13} className="text-[#718F96]" />
            <span>Checked: <strong className="text-white">{lastChecked}</strong></span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="controller-panel inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#D7E5EC] transition hover:bg-[#08383D] hover:text-white"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? "animate-spin text-[#F59E0B]" : "text-[#718F96]"}
            />
            <span>{isRefreshing ? "Checking..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* ── 2. SYSTEM STATUS STRIP ─────────────────────────────────── */}
      <section className="controller-panel rounded-lg p-3.5">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9FB8BE]">
          System Status
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <div className="flex items-center justify-between rounded-md bg-[#031A1F] px-3 py-2 border border-[#145158]/50">
            <div>
              <div className="text-[10px] text-[#718F96]">Platform</div>
              <div className="text-xs font-bold text-white">Operational</div>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>

          <div className="flex items-center justify-between rounded-md bg-[#031A1F] px-3 py-2 border border-[#145158]/50">
            <div>
              <div className="text-[10px] text-[#718F96]">API Gateway</div>
              <div className="text-xs font-bold text-emerald-300">Online</div>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>

          <div className="flex items-center justify-between rounded-md bg-[#031A1F] px-3 py-2 border border-[#145158]/50">
            <div>
              <div className="text-[10px] text-[#718F96]">Database</div>
              <div className="text-xs font-bold text-emerald-300">Online</div>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>

          <div className="flex items-center justify-between rounded-md bg-[#031A1F] px-3 py-2 border border-[#145158]/50">
            <div>
              <div className="text-[10px] text-[#718F96]">Telemetry Stream</div>
              <div className="text-xs font-bold text-emerald-300">Connected</div>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>

          <div className="flex items-center justify-between rounded-md bg-[#031A1F] px-3 py-2 border border-[#145158]/50">
            <div>
              <div className="text-[10px] text-[#718F96]">Weather Service</div>
              <div className="text-xs font-bold text-emerald-300">Online</div>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>

          <div className="flex items-center justify-between rounded-md bg-[#031A1F] px-3 py-2 border border-[#145158]/50">
            <div>
              <div className="text-[10px] text-[#718F96]">Prediction Service</div>
              <div className="text-xs font-bold text-emerald-300">Operational</div>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
        </div>
      </section>

      {/* ── 3. PLATFORM OVERVIEW ──────────────────────────────────── */}
      <section className="mt-5">
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#9FB8BE]">
          Platform Overview
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="controller-panel rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-[#9FB8BE]">
              <span>Active Users</span>
              <Users size={14} className="text-[#0E7C86]" />
            </div>
            <div className="mt-1 text-xl font-bold text-white">4</div>
            <div className="mt-0.5 text-[10px] text-[#718F96]">System demo sessions</div>
          </div>

          <div className="controller-panel rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-[#9FB8BE]">
              <span>Controllers Online</span>
              <Shield size={14} className="text-[#0E7C86]" />
            </div>
            <div className="mt-1 text-xl font-bold text-emerald-300">1</div>
            <div className="mt-0.5 text-[10px] text-[#718F96]">SBC Operations Desk</div>
          </div>

          <div className="controller-panel rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-[#9FB8BE]">
              <span>Staff Registered</span>
              <FileText size={14} className="text-[#0E7C86]" />
            </div>
            <div className="mt-1 text-xl font-bold text-[#D7E5EC]">12</div>
            <div className="mt-0.5 text-[10px] text-[#718F96]">Division directory</div>
          </div>

          <div className="controller-panel rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-[#9FB8BE]">
              <span>Live Telemetry Feeds</span>
              <Radio size={14} className="text-[#F59E0B]" />
            </div>
            <div className="mt-1 text-xl font-bold text-white">5 Active</div>
            <div className="mt-0.5 text-[10px] text-emerald-400">WebSocket synchronous</div>
          </div>

          <div className="controller-panel rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-[#9FB8BE]">
              <span>Open Alerts</span>
              <AlertTriangle size={14} className="text-amber-400" />
            </div>
            <div className="mt-1 text-xl font-bold text-amber-300">3</div>
            <div className="mt-0.5 text-[10px] text-[#718F96]">Sector interventions</div>
          </div>

          <div className="controller-panel rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-[#9FB8BE]">
              <span>Data Sync</span>
              <Wifi size={14} className="text-[#0E7C86]" />
            </div>
            <div className="mt-1 text-sm font-bold text-white">Synchronous</div>
            <div className="mt-0.5 text-[10px] text-[#718F96]">Last sync: Just now</div>
          </div>
        </div>
      </section>

      {/* ── 4. SERVICE HEALTH & INTEGRATION STATUS ─────────────────── */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        {/* Service Health Table */}
        <section className="controller-panel overflow-hidden rounded-lg">
          <div className="controller-header px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server size={16} className="text-[#F59E0B]" />
                <div>
                  <h2 className="text-sm font-bold text-white">
                    Service Health
                  </h2>
                  <p className="text-[11px] text-[#D7E5EC]/70">
                    Microservice runtime latency, response SLAs, and versions
                  </p>
                </div>
              </div>
              <span className="rounded border border-[#145158] bg-[#071A33] px-2 py-0.5 text-[10px] font-semibold text-[#9FB8BE]">
                {initialServices.length} Monitored
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#145158] bg-[#071A33] text-[10px] font-bold uppercase tracking-[0.12em] text-[#9FB8BE]">
                  <th className="px-4 py-2.5">Service</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Last Check</th>
                  <th className="px-4 py-2.5">Response</th>
                  <th className="px-4 py-2.5">Version</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#145158]/50">
                {initialServices.map((svc) => (
                  <tr key={svc.id} className="transition-colors hover:bg-[#08383D]/50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{svc.name}</div>
                      <div className="text-[10px] text-[#718F96]">{svc.category}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        {svc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-[#D7E5EC]">
                      {svc.lastCheck}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-[#D7E5EC]">
                      {svc.responseTime}
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-[#718F96]">
                      {svc.version}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {svc.targetRoute ? (
                        <Link
                          to={svc.targetRoute}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0E7C86] hover:text-[#F59E0B]"
                        >
                          Configure
                          <ArrowUpRight size={12} />
                        </Link>
                      ) : (
                        <span className="text-[11px] text-[#718F96]">System</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[#145158] bg-[#062A2F] px-4 py-2.5 text-[11px] text-[#718F96]">
            Representative system configuration metrics. Latency and health polled continuously.
          </div>
        </section>

        {/* Integration Status */}
        <section className="controller-panel flex flex-col justify-between overflow-hidden rounded-lg">
          <div>
            <div className="controller-header px-4 py-3">
              <div className="flex items-center gap-2">
                <Network size={16} className="text-[#F59E0B]" />
                <div>
                  <h2 className="text-sm font-bold text-white">
                    External Integrations
                  </h2>
                  <p className="text-[11px] text-[#D7E5EC]/70">
                    Connected railway telemetry and sensor streams
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-[#145158]/50 p-3">
              {initialIntegrations.map((item) => (
                <div key={item.id} className="py-2.5 first:pt-1 last:pb-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-[#718F96]">
                        {item.provider}
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[10px]">
                    <span className="text-[#9FB8BE]">Last sync: {item.lastSync}</span>
                    <Link
                      to={item.route}
                      className="font-semibold text-[#0E7C86] hover:text-[#F59E0B]"
                    >
                      Configure Source →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#145158] bg-[#031A1F] p-3 text-[11px] text-[#9FB8BE]">
            All integrations require active API tokens configured under{" "}
            <Link to="/admin/integrations" className="text-[#F59E0B] underline">
              Integrations settings
            </Link>.
          </div>
        </section>
      </div>

      {/* ── 5. RECENT ACTIVITY & SYSTEM EVENTS ────────────────────── */}
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {/* Recent Admin Activity */}
        <section className="controller-panel overflow-hidden rounded-lg">
          <div className="controller-header px-4 py-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#F59E0B]" />
              <div>
                <h2 className="text-sm font-bold text-white">
                  Recent Administrative Activity
                </h2>
                <p className="text-[11px] text-[#D7E5EC]/70">
                  Chronological log of administrative actions and rule changes
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#145158] bg-[#071A33] text-[10px] font-bold uppercase tracking-[0.12em] text-[#9FB8BE]">
                  <th className="px-4 py-2.5">Time</th>
                  <th className="px-4 py-2.5">Administrator</th>
                  <th className="px-4 py-2.5">Action</th>
                  <th className="px-4 py-2.5">Resource</th>
                  <th className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#145158]/50">
                {recentActivity.map((act) => (
                  <tr key={act.id} className="transition-colors hover:bg-[#08383D]/50">
                    <td className="px-4 py-2.5 font-mono text-[11px] text-[#718F96]">
                      {act.time}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-white">
                      {act.admin}
                    </td>
                    <td className="px-4 py-2.5 text-[#D7E5EC]">{act.action}</td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-[#9FB8BE]">
                      {act.resource}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="rounded border border-[#145158] bg-[#071A33] px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
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
        <section className="controller-panel overflow-hidden rounded-lg">
          <div className="controller-header px-4 py-3">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[#F59E0B]" />
              <div>
                <h2 className="text-sm font-bold text-white">System Events</h2>
                <p className="text-[11px] text-[#D7E5EC]/70">
                  Infrastructure runtime warnings, restarts, and sync diagnostics
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-[#145158]/50 p-4">
            {systemEvents.map((evt) => (
              <div key={evt.id} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                        evt.severity === "ERROR"
                          ? "border border-red-500/40 bg-red-950/60 text-red-300"
                          : evt.severity === "WARNING"
                          ? "border border-amber-500/40 bg-amber-950/60 text-amber-300"
                          : "border border-emerald-500/40 bg-emerald-950/60 text-emerald-300"
                      }`}
                    >
                      {evt.severity}
                    </span>
                    <span className="font-semibold text-white">{evt.source}</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#718F96]">
                    {evt.time}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#D7E5EC]">{evt.message}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-[#145158] bg-[#062A2F] px-4 py-2.5 text-[11px] text-[#718F96]">
            System logs retained for 90 days. Export available in{" "}
            <Link to="/admin/audit" className="text-[#0E7C86] underline hover:text-[#F59E0B]">
              Audit Logs
            </Link>.
          </div>
        </section>
      </div>

      {/* ── 6. QUICK ADMIN ACTIONS ─────────────────────────────────── */}
      <section className="mt-5 controller-panel rounded-lg p-4">
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#9FB8BE]">
          Administrative Quick Navigation
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Link
            to="/admin/users"
            className="flex flex-col items-center justify-center rounded-lg border border-[#145158] bg-[#071A33] p-3 text-center transition hover:border-[#0E7C86] hover:bg-[#08383D]"
          >
            <Users size={20} className="text-[#0E7C86]" />
            <div className="mt-2 text-xs font-bold text-white">Manage Users</div>
            <div className="text-[10px] text-[#718F96]">Roles & Permissions</div>
          </Link>

          <Link
            to="/admin/models"
            className="flex flex-col items-center justify-center rounded-lg border border-[#145158] bg-[#071A33] p-3 text-center transition hover:border-[#0E7C86] hover:bg-[#08383D]"
          >
            <Cpu size={20} className="text-[#F59E0B]" />
            <div className="mt-2 text-xs font-bold text-white">Configure ETA Model</div>
            <div className="text-[10px] text-[#718F96]">GNN Parameters</div>
          </Link>

          <Link
            to="/admin/weather"
            className="flex flex-col items-center justify-center rounded-lg border border-[#145158] bg-[#071A33] p-3 text-center transition hover:border-[#0E7C86] hover:bg-[#08383D]"
          >
            <CloudRain size={20} className="text-[#0E7C86]" />
            <div className="mt-2 text-xs font-bold text-white">Configure Weather</div>
            <div className="text-[10px] text-[#718F96]">Radar & Thresholds</div>
          </Link>

          <Link
            to="/admin/integrations"
            className="flex flex-col items-center justify-center rounded-lg border border-[#145158] bg-[#071A33] p-3 text-center transition hover:border-[#0E7C86] hover:bg-[#08383D]"
          >
            <Network size={20} className="text-[#0E7C86]" />
            <div className="mt-2 text-xs font-bold text-white">View Integrations</div>
            <div className="text-[10px] text-[#718F96]">RTIS, NRDB, Feeds</div>
          </Link>

          <Link
            to="/admin/alerts"
            className="flex flex-col items-center justify-center rounded-lg border border-[#145158] bg-[#071A33] p-3 text-center transition hover:border-[#0E7C86] hover:bg-[#08383D]"
          >
            <Bell size={20} className="text-[#F59E0B]" />
            <div className="mt-2 text-xs font-bold text-white">Review Alerts</div>
            <div className="text-[10px] text-[#718F96]">Dispatch Rules</div>
          </Link>

          <Link
            to="/admin/audit"
            className="flex flex-col items-center justify-center rounded-lg border border-[#145158] bg-[#071A33] p-3 text-center transition hover:border-[#0E7C86] hover:bg-[#08383D]"
          >
            <FileText size={20} className="text-[#0E7C86]" />
            <div className="mt-2 text-xs font-bold text-white">View Audit Logs</div>
            <div className="text-[10px] text-[#718F96]">Security Trail</div>
          </Link>
        </div>
      </section>
    </div>
  )
}

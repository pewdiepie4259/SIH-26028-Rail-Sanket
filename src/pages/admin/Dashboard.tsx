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
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#0E7C86]">
            System Administration
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#071A33]">
            System Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Platform health, services, integrations and operational administration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="controller-panel hidden rounded-lg px-3 py-2 text-xs text-slate-600 sm:flex sm:items-center sm:gap-2">
            <Clock size={13} className="text-[#0E7C86]" />
            <span>Checked: <strong className="text-[#071A33]">{lastChecked}</strong></span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="controller-panel inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#071A33]"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? "animate-spin text-[#F59E0B]" : "text-[#0E7C86]"}
            />
            <span>{isRefreshing ? "Checking..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* ── 2. SYSTEM STATUS STRIP ─────────────────────────────────── */}
      <section className="controller-panel rounded-xl p-3.5">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
          System Status
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 border border-slate-200">
            <div>
              <div className="text-[10px] text-slate-500">Platform</div>
              <div className="text-xs font-bold text-[#071A33]">Operational</div>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 border border-slate-200">
            <div>
              <div className="text-[10px] text-slate-500">API Gateway</div>
              <div className="text-xs font-bold text-emerald-700">Online</div>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 border border-slate-200">
            <div>
              <div className="text-[10px] text-slate-500">Database</div>
              <div className="text-xs font-bold text-emerald-700">Online</div>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 border border-slate-200">
            <div>
              <div className="text-[10px] text-slate-500">Telemetry Stream</div>
              <div className="text-xs font-bold text-emerald-700">Connected</div>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 border border-slate-200">
            <div>
              <div className="text-[10px] text-slate-500">Weather Service</div>
              <div className="text-xs font-bold text-emerald-700">Online</div>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 border border-slate-200">
            <div>
              <div className="text-[10px] text-slate-500">Prediction Service</div>
              <div className="text-xs font-bold text-emerald-700">Operational</div>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
        </div>
      </section>

      {/* ── 3. PLATFORM OVERVIEW ──────────────────────────────────── */}
      <section className="mt-5">
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          Platform Overview
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="controller-panel rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Active Users</span>
              <Users size={14} className="text-[#0E7C86]" />
            </div>
            <div className="mt-1 text-xl font-bold text-[#071A33]">4</div>
            <div className="mt-0.5 text-[10px] text-slate-500">System demo sessions</div>
          </div>

          <div className="controller-panel rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Controllers Online</span>
              <Shield size={14} className="text-[#0E7C86]" />
            </div>
            <div className="mt-1 text-xl font-bold text-emerald-700">1</div>
            <div className="mt-0.5 text-[10px] text-slate-500">SBC Operations Desk</div>
          </div>

          <div className="controller-panel rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Staff Registered</span>
              <FileText size={14} className="text-[#0E7C86]" />
            </div>
            <div className="mt-1 text-xl font-bold text-[#071A33]">12</div>
            <div className="mt-0.5 text-[10px] text-slate-500">Division directory</div>
          </div>

          <div className="controller-panel rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Live Telemetry Feeds</span>
              <Radio size={14} className="text-[#F59E0B]" />
            </div>
            <div className="mt-1 text-xl font-bold text-[#071A33]">5 Active</div>
            <div className="mt-0.5 text-[10px] text-emerald-600 font-medium">WebSocket synchronous</div>
          </div>

          <div className="controller-panel rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Open Alerts</span>
              <AlertTriangle size={14} className="text-amber-500" />
            </div>
            <div className="mt-1 text-xl font-bold text-amber-600">3</div>
            <div className="mt-0.5 text-[10px] text-slate-500">Sector interventions</div>
          </div>

          <div className="controller-panel rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Data Sync</span>
              <Wifi size={14} className="text-[#0E7C86]" />
            </div>
            <div className="mt-1 text-sm font-bold text-[#071A33]">Synchronous</div>
            <div className="mt-0.5 text-[10px] text-slate-500">Last sync: Just now</div>
          </div>
        </div>
      </section>

      {/* ── 4. SERVICE HEALTH & INTEGRATION STATUS ─────────────────── */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        {/* Service Health Table */}
        <section className="controller-panel overflow-hidden rounded-xl">
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
              <span className="rounded border border-teal-500/40 bg-teal-950/40 px-2 py-0.5 text-[10px] font-semibold text-teal-200">
                {initialServices.length} Monitored
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                  <th className="px-4 py-2.5">Service</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Last Check</th>
                  <th className="px-4 py-2.5">Response</th>
                  <th className="px-4 py-2.5">Version</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {initialServices.map((svc) => (
                  <tr key={svc.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#071A33]">{svc.name}</div>
                      <div className="text-[10px] text-slate-500">{svc.category}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {svc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-700">
                      {svc.lastCheck}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-700">
                      {svc.responseTime}
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-500">
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
                        <span className="text-[11px] text-slate-400">System</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-[11px] text-slate-500">
            Representative system configuration metrics. Latency and health polled continuously.
          </div>
        </section>

        {/* Integration Status */}
        <section className="controller-panel flex flex-col justify-between overflow-hidden rounded-xl">
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

            <div className="divide-y divide-slate-100 p-3">
              {initialIntegrations.map((item) => (
                <div key={item.id} className="py-2.5 first:pt-1 last:pb-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#071A33]">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {item.provider}
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Last sync: {item.lastSync}</span>
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

          <div className="border-t border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600">
            All integrations require active API tokens configured under{" "}
            <Link to="/admin/integrations" className="text-[#0E7C86] font-semibold underline hover:text-[#F59E0B]">
              Integrations settings
            </Link>.
          </div>
        </section>
      </div>

      {/* ── 5. RECENT ACTIVITY & SYSTEM EVENTS ────────────────────── */}
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {/* Recent Admin Activity */}
        <section className="controller-panel overflow-hidden rounded-xl">
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
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                  <th className="px-4 py-2.5">Time</th>
                  <th className="px-4 py-2.5">Administrator</th>
                  <th className="px-4 py-2.5">Action</th>
                  <th className="px-4 py-2.5">Resource</th>
                  <th className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentActivity.map((act) => (
                  <tr key={act.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500">
                      {act.time}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-[#071A33]">
                      {act.admin}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">{act.action}</td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500">
                      {act.resource}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
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
        <section className="controller-panel overflow-hidden rounded-xl">
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

          <div className="divide-y divide-slate-100 p-4">
            {systemEvents.map((evt) => (
              <div key={evt.id} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                        evt.severity === "ERROR"
                          ? "border border-red-200 bg-red-50 text-red-700"
                          : evt.severity === "WARNING"
                          ? "border border-amber-200 bg-amber-50 text-amber-700"
                          : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {evt.severity}
                    </span>
                    <span className="font-semibold text-[#071A33]">{evt.source}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">
                    {evt.time}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600">{evt.message}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-[11px] text-slate-500">
            System logs retained for 90 days. Export available in{" "}
            <Link to="/admin/audit" className="text-[#0E7C86] font-semibold underline hover:text-[#F59E0B]">
              Audit Logs
            </Link>.
          </div>
        </section>
      </div>

      {/* ── 6. QUICK ADMIN ACTIONS ─────────────────────────────────── */}
      <section className="mt-5 controller-panel rounded-xl p-4">
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          Administrative Quick Navigation
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Link
            to="/admin/users"
            className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-3 text-center transition hover:border-[#0E7C86] hover:shadow-sm"
          >
            <Users size={20} className="text-[#0E7C86]" />
            <div className="mt-2 text-xs font-bold text-[#071A33]">Manage Users</div>
            <div className="text-[10px] text-slate-500">Roles & Permissions</div>
          </Link>

          <Link
            to="/admin/models"
            className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-3 text-center transition hover:border-[#0E7C86] hover:shadow-sm"
          >
            <Cpu size={20} className="text-[#F59E0B]" />
            <div className="mt-2 text-xs font-bold text-[#071A33]">Configure ETA Model</div>
            <div className="text-[10px] text-slate-500">GNN Parameters</div>
          </Link>

          <Link
            to="/admin/weather"
            className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-3 text-center transition hover:border-[#0E7C86] hover:shadow-sm"
          >
            <CloudRain size={20} className="text-[#0E7C86]" />
            <div className="mt-2 text-xs font-bold text-[#071A33]">Configure Weather</div>
            <div className="text-[10px] text-slate-500">Radar & Thresholds</div>
          </Link>

          <Link
            to="/admin/integrations"
            className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-3 text-center transition hover:border-[#0E7C86] hover:shadow-sm"
          >
            <Network size={20} className="text-[#0E7C86]" />
            <div className="mt-2 text-xs font-bold text-[#071A33]">View Integrations</div>
            <div className="text-[10px] text-slate-500">RTIS, NRDB, Feeds</div>
          </Link>

          <Link
            to="/admin/alerts"
            className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-3 text-center transition hover:border-[#0E7C86] hover:shadow-sm"
          >
            <Bell size={20} className="text-[#F59E0B]" />
            <div className="mt-2 text-xs font-bold text-[#071A33]">Review Alerts</div>
            <div className="text-[10px] text-slate-500">Dispatch Rules</div>
          </Link>

          <Link
            to="/admin/audit"
            className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-3 text-center transition hover:border-[#0E7C86] hover:shadow-sm"
          >
            <FileText size={20} className="text-[#0E7C86]" />
            <div className="mt-2 text-xs font-bold text-[#071A33]">View Audit Logs</div>
            <div className="text-[10px] text-slate-500">Security Trail</div>
          </Link>
        </div>
      </section>
    </div>
  )
}

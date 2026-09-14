import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CloudRain,
  Database,
  Gauge,
  Radio,
  Server,
  ShieldCheck,
  Users,
} from "lucide-react"

const services = [
  {
    name: "RTIS Telemetry",
    description: "Live locomotive telemetry feed",
    status: "Operational",
    icon: Radio,
  },
  {
    name: "Weather Service",
    description: "Open-Meteo weather integration",
    status: "Operational",
    icon: CloudRain,
  },
  {
    name: "Railway Database",
    description: "Network and train data services",
    status: "Operational",
    icon: Database,
  },
  {
    name: "Prediction Service",
    description: "ETA and cascade prediction",
    status: "Operational",
    icon: BrainCircuit,
  },
]

const activity = [
  {
    time: "18:42",
    event: "Controller configuration updated",
    user: "Traffic Control",
    type: "Configuration",
  },
  {
    time: "18:31",
    event: "Weather integration health check completed",
    user: "System",
    type: "System",
  },
  {
    time: "18:15",
    event: "New controller account created",
    user: "Administrator",
    type: "User",
  },
  {
    time: "17:58",
    event: "Prediction service restarted",
    user: "System",
    type: "System",
  },
]

function AdminDashboard() {
  return (
    <div className="min-h-full bg-[#031A1F] px-4 py-5 text-white lg:px-6">
      {/* Header */}
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#F59E0B]">
            Administration
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            System Overview
          </h1>

          <p className="mt-1 text-sm text-[#9FB8BE]">
            RailDrishti platform health, services and operational
            administration.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-[#145158] bg-[#062A2F] px-3 py-2 text-xs font-semibold">
          <ShieldCheck size={15} className="text-emerald-400" />
          <span className="text-[#D7E5EC]">
            System Operational
          </span>
        </div>
      </div>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="System Health"
          value="98.7%"
          detail="All critical services operational"
          icon={Activity}
          positive
        />

        <MetricCard
          title="Active Users"
          value="24"
          detail="Controllers and administrators"
          icon={Users}
        />

        <MetricCard
          title="Live Trains"
          value="159"
          detail="Currently reporting telemetry"
          icon={Radio}
        />

        <MetricCard
          title="Active Alerts"
          value="12"
          detail="3 require immediate attention"
          icon={AlertTriangle}
          warning
        />
      </div>

      {/* Services */}
      <section className="mt-5 overflow-hidden rounded-lg border border-[#145158] bg-[#062A2F]">
        <div className="border-b border-[#145158] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-4 py-3">
          <div className="flex items-center gap-2">
            <Server size={16} className="text-[#F59E0B]" />

            <div>
              <h2 className="text-sm font-bold">
                Platform Services
              </h2>

              <p className="mt-0.5 text-[11px] text-[#D7E5EC]/70">
                Current health of connected RailDrishti services
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-[#145158] md:grid-cols-2">
          {services.map((service) => {
            const Icon = service.icon

            return (
              <div
                key={service.name}
                className="bg-[#062A2F] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md border border-[#145158] bg-[#031A1F] p-2">
                      <Icon
                        size={17}
                        className="text-[#F59E0B]"
                      />
                    </div>

                    <div>
                      <div className="text-xs font-bold">
                        {service.name}
                      </div>

                      <div className="mt-1 text-[10px] text-[#718F96]">
                        {service.description}
                      </div>
                    </div>
                  </div>

                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {service.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Model + infrastructure */}
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <section className="rounded-lg border border-[#145158] bg-[#062A2F] p-4">
          <div className="flex items-center gap-2">
            <BrainCircuit size={17} className="text-[#F59E0B]" />

            <div>
              <h2 className="text-sm font-bold">
                Prediction Engine
              </h2>

              <p className="mt-0.5 text-[11px] text-[#9FB8BE]">
                Current ETA prediction configuration
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <InfoBox label="Model" value="GNN" />
            <InfoBox label="Version" value="v1.0.0" />
            <InfoBox label="ETA Accuracy" value="86%" />
            <InfoBox label="Last Updated" value="17:58" />
          </div>

          <div className="mt-4 rounded-md border border-[#145158] bg-[#031A1F] p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#718F96]">
                Model Status
              </span>

              <span className="text-[10px] font-bold text-emerald-400">
                ACTIVE
              </span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#062A2F]">
              <div className="h-full w-[86%] rounded-full bg-[#0E7C86]" />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[#145158] bg-[#062A2F] p-4">
          <div className="flex items-center gap-2">
            <Gauge size={17} className="text-[#F59E0B]" />

            <div>
              <h2 className="text-sm font-bold">
                Infrastructure
              </h2>

              <p className="mt-0.5 text-[11px] text-[#9FB8BE]">
                Platform resource utilisation
              </p>
            </div>
          </div>

          <ResourceBar
            label="API Server"
            value="42%"
          />

          <ResourceBar
            label="Database"
            value="36%"
          />

          <ResourceBar
            label="Prediction Worker"
            value="58%"
          />

          <ResourceBar
            label="WebSocket Connections"
            value="31%"
          />
        </section>
      </div>

      {/* Alerts */}
      <section className="mt-5 overflow-hidden rounded-lg border border-[#145158] bg-[#062A2F]">
        <div className="border-b border-[#145158] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-[#F59E0B]" />

            <h2 className="text-sm font-bold">
              System Alerts
            </h2>
          </div>
        </div>

        <div className="grid gap-4 p-4 md:grid-cols-3">
          <AlertBox
            title="3 Critical"
            detail="Immediate administrative attention"
            severity="critical"
          />

          <AlertBox
            title="5 Warnings"
            detail="Services operating with warnings"
            severity="warning"
          />

          <AlertBox
            title="4 Informational"
            detail="Routine system notifications"
            severity="info"
          />
        </div>
      </section>

      {/* Audit */}
      <section className="mt-5 overflow-hidden rounded-lg border border-[#145158] bg-[#062A2F]">
        <div className="border-b border-[#145158] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-4 py-3">
          <h2 className="text-sm font-bold">
            Recent Administrative Activity
          </h2>

          <p className="mt-0.5 text-[11px] text-[#D7E5EC]/70">
            Latest events recorded in the system audit log
          </p>
        </div>

        <div className="divide-y divide-[#145158]">
          {activity.map((item) => (
            <div
              key={`${item.time}-${item.event}`}
              className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-[#718F96]">
                  {item.time}
                </span>

                <div>
                  <div className="text-xs font-semibold text-white">
                    {item.event}
                  </div>

                  <div className="mt-0.5 text-[10px] text-[#718F96]">
                    {item.user}
                  </div>
                </div>
              </div>

              <span className="w-fit rounded-full border border-[#145158] bg-[#031A1F] px-2 py-1 text-[9px] font-bold text-[#9FB8BE]">
                {item.type}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  positive,
  warning,
}: {
  title: string
  value: string
  detail: string
  icon: typeof Activity
  positive?: boolean
  warning?: boolean
}) {
  return (
    <section className="rounded-lg border border-[#145158] bg-[#062A2F] p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#9FB8BE]">
          {title}
        </span>

        <Icon
          size={17}
          className={
            warning
              ? "text-[#F59E0B]"
              : "text-[#F59E0B]"
          }
        />
      </div>

      <div className="mt-3 text-2xl font-bold">
        {value}
      </div>

      <div
        className={
          positive
            ? "mt-1 text-[10px] text-emerald-400"
            : warning
              ? "mt-1 text-[10px] text-[#F59E0B]"
              : "mt-1 text-[10px] text-[#718F96]"
        }
      >
        {detail}
      </div>
    </section>
  )
}

function InfoBox({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-md border border-[#145158] bg-[#031A1F] p-3">
      <div className="text-[9px] font-bold uppercase tracking-wide text-[#718F96]">
        {label}
      </div>

      <div className="mt-1.5 text-sm font-bold text-white">
        {value}
      </div>
    </div>
  )
}

function ResourceBar({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#D7E5EC]">
          {label}
        </span>

        <span className="text-[10px] font-bold text-[#9FB8BE]">
          {value}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-[#031A1F]">
        <div
          className="h-full rounded-full bg-[#0E7C86]"
          style={{ width: value }}
        />
      </div>
    </div>
  )
}

function AlertBox({
  title,
  detail,
  severity,
}: {
  title: string
  detail: string
  severity: "critical" | "warning" | "info"
}) {
  const textClass =
    severity === "critical"
      ? "text-red-400"
      : severity === "warning"
        ? "text-[#F59E0B]"
        : "text-[#0E7C86]"

  return (
    <div className="rounded-md border border-[#145158] bg-[#031A1F] p-4">
      <div className={`text-lg font-bold ${textClass}`}>
        {title}
      </div>

      <div className="mt-1 text-[10px] leading-5 text-[#718F96]">
        {detail}
      </div>
    </div>
  )
}

export default AdminDashboard

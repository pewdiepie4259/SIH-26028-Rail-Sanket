import {
  Activity,
  AlertTriangle,
  GitBranch,
  TrainFront,
} from "lucide-react"
import type { NetworkHealthMetrics } from "../../services/telemetryEngine"

interface NetworkHealthStripProps {
  metricsData?: NetworkHealthMetrics
}

function NetworkHealthStrip({ metricsData }: NetworkHealthStripProps) {
  const dynamicMetrics = [
    {
      label: "Active Trains",
      value: metricsData ? String(metricsData.activeTrains) : "126",
      detail: "Across monitored sections",
      icon: TrainFront,
      status: null,
      pulse: true,
    },
    {
      label: "Network Status",
      value: metricsData ? metricsData.networkStatus : "Normal",
      detail: metricsData ? metricsData.networkStatusDetail : "All sections operational",
      icon: Activity,
      status:
        metricsData?.networkStatus === "Normal"
          ? "normal"
          : metricsData?.networkStatus === "Caution"
          ? "caution"
          : "alert",
      pulse: false,
    },
    {
      label: "Junction Load",
      value: metricsData ? metricsData.junctionLoad : "Moderate",
      detail: metricsData ? metricsData.junctionLoadDetail : "Current network pressure",
      icon: GitBranch,
      status:
        metricsData?.junctionLoad === "Normal"
          ? "normal"
          : metricsData?.junctionLoad === "Moderate"
          ? "caution"
          : "alert",
      pulse: false,
    },
    {
      label: "Critical Alerts",
      value: metricsData ? String(metricsData.criticalAlerts).padStart(2, "0") : "03",
      detail: metricsData ? metricsData.criticalAlertsDetail : "Require attention",
      icon: AlertTriangle,
      status: metricsData && metricsData.criticalAlerts > 0 ? "alert" : null,
      pulse: metricsData ? metricsData.criticalAlerts > 0 : false,
    },
  ]

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {dynamicMetrics.map((metric) => {
        const Icon = metric.icon
        const valueColor =
          metric.status === "normal"
            ? "text-emerald-400"
            : metric.status === "caution"
            ? "text-[#F59E0B]"
            : metric.status === "alert"
            ? "text-rose-400"
            : "text-white"

        return (
          <div
            key={metric.label}
            className="relative overflow-hidden rounded-lg border border-[#16364A] bg-[#0A2036] p-4 transition-all duration-300 hover:border-[#0E5961]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#71899C]">
                    {metric.label}
                  </p>
                  {metric.pulse && (
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    </span>
                  )}
                </div>

                <p className={`mt-2 text-xl font-bold tracking-tight transition-colors duration-300 ${valueColor}`}>
                  {metric.value}
                </p>

                <p className="mt-1 text-[11px] text-[#71899C]">
                  {metric.detail}
                </p>
              </div>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#16364A] bg-[#071A33]">
                <Icon
                  size={17}
                  strokeWidth={2}
                  className="text-[#0E7C86]"
                />
              </div>
            </div>
          </div>
        )
      })}
    </section>
  )
}

export default NetworkHealthStrip
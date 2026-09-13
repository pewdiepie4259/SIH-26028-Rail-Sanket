import {
  Activity,
  AlertTriangle,
  GitBranch,
  TrainFront,
} from "lucide-react"

const metrics = [
  {
    label: "Active Trains",
    value: "126",
    detail: "Across monitored sections",
    icon: TrainFront,
  },
  {
    label: "Network Health",
    value: "98.4%",
    detail: "Operational availability",
    icon: Activity,
  },
  {
    label: "Junction Load",
    value: "74%",
    detail: "Current network pressure",
    icon: GitBranch,
  },
  {
    label: "Critical Alerts",
    value: "03",
    detail: "Require attention",
    icon: AlertTriangle,
  },
]

function NetworkHealthStrip() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon

        return (
          <div
            key={metric.label}
            className="rounded-xl border border-[#16364A] bg-[#0A2036] p-4 transition-colors duration-200 hover:border-[#0E5961]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#71899C]">
                  {metric.label}
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-white">
                  {metric.value}
                </p>

                <p className="mt-1 text-[11px] text-[#71899C]">
                  {metric.detail}
                </p>
              </div>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#16364A] bg-[#071A33]">
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
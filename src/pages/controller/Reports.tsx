import { useState } from "react"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock3,
  CloudRain,
  Download,
  GitBranch,
  TrendingDown,
  TrainFront,
} from "lucide-react"

const performance = [
  { label: "On Time", value: "78%", count: 124 },
  { label: "Minor Delay", value: "14%", count: 22 },
  { label: "Major Delay", value: "8%", count: 13 },
]

const incidents = [
  {
    type: "Weather",
    location: "Bengaluru – Yelahanka",
    impact: "Speed restriction",
    trains: 7,
    severity: "Medium",
    icon: CloudRain,
  },
  {
    type: "Junction Conflict",
    location: "KSR Bengaluru",
    impact: "Platform / route conflict",
    trains: 4,
    severity: "High",
    icon: GitBranch,
  },
  {
    type: "Cascading Delay",
    location: "Whitefield – Malur",
    impact: "Downstream propagation",
    trains: 6,
    severity: "High",
    icon: TrendingDown,
  },
]

const interventions = [
  {
    time: "17:42",
    action: "Platform reassigned",
    train: "12628",
    controller: "Control Desk",
    result: "Delay contained",
  },
  {
    time: "17:18",
    action: "Speed restriction applied",
    train: "16526",
    controller: "Control Desk",
    result: "Risk reduced",
  },
  {
    time: "16:54",
    action: "Route priority changed",
    train: "16591",
    controller: "Traffic Control",
    result: "Conflict cleared",
  },
  {
    time: "16:31",
    action: "Downstream alert issued",
    train: "12677",
    controller: "Control Desk",
    result: "Stations notified",
  },
]

function Reports() {
  const [activePeriod, setActivePeriod] = useState("Today")
  const [exported, setExported] = useState(false)

  function handleExport() {
    setExported(true)
    setTimeout(() => setExported(false), 3000)
  }

  return (
    <div className="controller-page min-h-full px-4 py-5 lg:px-6">
      {/* Header */}
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#F59E0B]">
            Control Centre
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Network Reports
          </h1>

          <p className="mt-1 text-sm text-[#9FB8BE]">
            Operational performance, delay patterns and controller activity.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="controller-button flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold"
        >
          <Download size={15} />
          {exported ? "Exported ✓" : "Export Report"}
        </button>
      </div>

      {/* Report period */}
      <div className="controller-panel mb-5 flex flex-col justify-between gap-3 rounded-lg p-4 md:flex-row md:items-center">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-[#D7E5EC]">
            Reporting Period
          </div>

          <div className="mt-1 text-sm font-semibold text-white">
            {activePeriod === "Today" ? "Today · 00:00 – 18:00" : activePeriod === "7 Days" ? "Past 7 Days (Consolidated)" : "Past 30 Days (Full Cycle)"}
          </div>
        </div>

        <div className="flex gap-2">
          {["Today", "7 Days", "30 Days"].map((period) => (
            <button
              key={period}
              onClick={() => setActivePeriod(period)}
              className={
                activePeriod === period
                  ? "rounded-md border border-[#F59E0B] bg-[#071A33] px-3 py-2 text-[11px] font-bold text-white"
                  : "rounded-md border border-[#145158] bg-[#031A1F] px-3 py-2 text-[11px] font-semibold text-[#9FB8BE] hover:text-white"
              }
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <section className="controller-panel rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9FB8BE]">
              Trains Monitored
            </span>
            <TrainFront size={17} className="text-[#F59E0B]" />
          </div>

          <div className="mt-3 text-2xl font-bold text-white">159</div>
          <div className="mt-1 text-[11px] text-emerald-400">
            +8 from previous period
          </div>
        </section>

        <section className="controller-panel rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9FB8BE]">
              Average Delay
            </span>
            <Clock3 size={17} className="text-[#F59E0B]" />
          </div>

          <div className="mt-3 text-2xl font-bold text-white">7.4 min</div>
          <div className="mt-1 text-[11px] text-emerald-400">
            ↓ 1.8 min vs previous period
          </div>
        </section>

        <section className="controller-panel rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9FB8BE]">
              On-Time Performance
            </span>
            <Activity size={17} className="text-[#F59E0B]" />
          </div>

          <div className="mt-3 text-2xl font-bold text-white">78%</div>
          <div className="mt-1 text-[11px] text-emerald-400">
            ↑ 4.2% vs previous period
          </div>
        </section>

        <section className="controller-panel rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9FB8BE]">
              Operational Incidents
            </span>
            <AlertTriangle size={17} className="text-[#F59E0B]" />
          </div>

          <div className="mt-3 text-2xl font-bold text-white">18</div>
          <div className="mt-1 text-[11px] text-[#9FB8BE]">
            5 currently under review
          </div>
        </section>
      </div>

      {/* Performance + delay distribution */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <section className="controller-panel overflow-hidden rounded-lg">
          <div className="controller-header px-4 py-3">
            <h2 className="text-sm font-bold text-white">
              Network Performance
            </h2>
            <p className="mt-0.5 text-[11px] text-[#D7E5EC]/70">
              Train movement status during the selected period
            </p>
          </div>

          <div className="p-4">
            <div className="mb-5 flex items-end gap-2">
              {[62, 71, 68, 76, 73, 81, 78, 84, 79, 86, 82, 78].map(
                (value, index) => (
                  <div
                    key={index}
                    className="flex flex-1 flex-col justify-end"
                  >
                    <div
                      className="rounded-t-sm bg-[#0E5961] transition-all hover:bg-[#0E7C86]"
                      style={{ height: `${value * 1.5}px` }}
                    />
                    <div className="mt-2 text-center text-[9px] text-[#718F96]">
                      {index + 7}
                    </div>
                  </div>
                ),
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[#145158] pt-3 text-[10px] text-[#718F96]">
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
            </div>
          </div>
        </section>

        <section className="controller-panel overflow-hidden rounded-lg">
          <div className="controller-header px-4 py-3">
            <h2 className="text-sm font-bold text-white">
              Delay Distribution
            </h2>
            <p className="mt-0.5 text-[11px] text-[#D7E5EC]/70">
              Current train operating status
            </p>
          </div>

          <div className="space-y-5 p-4">
            {performance.map((item, index) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#D7E5EC]">
                    {item.label}
                  </span>

                  <span className="text-xs font-bold text-white">
                    {item.value}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[#031A1F]">
                  <div
                    className={
                      index === 0
                        ? "h-full rounded-full bg-[#0E7C86]"
                        : index === 1
                          ? "h-full rounded-full bg-[#F59E0B]"
                          : "h-full rounded-full bg-red-500"
                    }
                    style={{ width: item.value }}
                  />
                </div>

                <div className="mt-1 text-[10px] text-[#718F96]">
                  {item.count} trains
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Incidents */}
      <section className="controller-panel mt-5 overflow-hidden rounded-lg">
        <div className="controller-header px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-[#F59E0B]" />
            <h2 className="text-sm font-bold text-white">
              Incident Summary
            </h2>
          </div>
        </div>

        <div className="divide-y divide-[#145158]">
          {incidents.map((incident) => {
            const Icon = incident.icon

            return (
              <div
                key={incident.type}
                className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md border border-[#145158] bg-[#031A1F] p-2">
                    <Icon size={17} className="text-[#F59E0B]" />
                  </div>

                  <div>
                    <div className="text-xs font-bold text-white">
                      {incident.type}
                    </div>
                    <div className="mt-0.5 text-[11px] text-[#9FB8BE]">
                      {incident.location} · {incident.impact}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs">
                  <div>
                    <div className="text-[10px] text-[#718F96]">
                      Affected
                    </div>
                    <div className="font-bold text-white">
                      {incident.trains} trains
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-[#718F96]">
                      Severity
                    </div>
                    <div
                      className={
                        incident.severity === "High"
                          ? "font-bold text-red-400"
                          : "font-bold text-[#F59E0B]"
                      }
                    >
                      {incident.severity}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Controller interventions */}
      <section className="controller-panel mt-5 overflow-hidden rounded-lg">
        <div className="controller-header flex items-center gap-2 px-4 py-3">
          <BarChart3 size={16} className="text-[#F59E0B]" />
          <div>
            <h2 className="text-sm font-bold text-white">
              Controller Interventions
            </h2>
            <p className="mt-0.5 text-[11px] text-[#D7E5EC]/70">
              Actions recorded during the reporting period
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-[#145158] bg-[#08383D]">
                {["Time", "Action", "Train", "Controller", "Result"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[#9FB8BE]"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {interventions.map((item) => (
                <tr
                  key={`${item.time}-${item.train}`}
                  className="border-b border-[#145158]/70 last:border-0"
                >
                  <td className="px-4 py-3 text-xs text-[#9FB8BE]">
                    {item.time}
                  </td>

                  <td className="px-4 py-3 text-xs font-semibold text-white">
                    {item.action}
                  </td>

                  <td className="px-4 py-3 text-xs font-bold text-[#D7E5EC]">
                    {item.train}
                  </td>

                  <td className="px-4 py-3 text-xs text-[#9FB8BE]">
                    {item.controller}
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded-full border border-[#145158] bg-[#031A1F] px-2 py-1 text-[10px] font-bold text-emerald-400">
                      {item.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ETA accuracy */}
      <section className="controller-panel mt-5 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Clock3 size={16} className="text-[#F59E0B]" />
          <div>
            <h2 className="text-sm font-bold text-white">
              ETA Prediction Performance
            </h2>
            <p className="mt-0.5 text-[11px] text-[#9FB8BE]">
              Comparison of predicted and observed arrival performance
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-[#145158] bg-[#031A1F] p-4">
            <div className="text-[10px] uppercase tracking-wide text-[#718F96]">
              Within ±5 min
            </div>
            <div className="mt-2 text-xl font-bold text-white">86%</div>
          </div>

          <div className="rounded-md border border-[#145158] bg-[#031A1F] p-4">
            <div className="text-[10px] uppercase tracking-wide text-[#718F96]">
              Mean Absolute Error
            </div>
            <div className="mt-2 text-xl font-bold text-white">3.8 min</div>
          </div>

          <div className="rounded-md border border-[#145158] bg-[#031A1F] p-4">
            <div className="text-[10px] uppercase tracking-wide text-[#718F96]">
              Forecasts Generated
            </div>
            <div className="mt-2 text-xl font-bold text-white">1,284</div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Reports

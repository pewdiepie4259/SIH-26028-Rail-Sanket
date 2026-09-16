import {
  ArrowUpRight,
  GitBranch,
  Gauge,
  TrainFront,
} from "lucide-react"
import { Link } from "react-router-dom"
import type { JunctionTelemetry } from "../../services/telemetryEngine"

interface JunctionStatusProps {
  junctionsData?: JunctionTelemetry[]
}

const baselineJunctions: JunctionTelemetry[] = [
  {
    name: "Krishnarajapuram",
    code: "KJM",
    load: 87,
    approaching: 5,
    activeRoutes: 4,
    status: "Congested",
  },
  {
    name: "Baiyappanahalli",
    code: "BYPL",
    load: 72,
    approaching: 3,
    activeRoutes: 3,
    status: "Busy",
  },
  {
    name: "Bengaluru Cantonment",
    code: "BNC",
    load: 48,
    approaching: 2,
    activeRoutes: 2,
    status: "Normal",
  },
]

function JunctionStatus({ junctionsData }: JunctionStatusProps) {
  const junctions = junctionsData && junctionsData.length > 0 ? junctionsData : baselineJunctions

  return (
    <section className="controller-panel overflow-hidden rounded-xl">
      <div className="controller-header px-5 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch
              size={17}
              className="text-[#F59E0B]"
            />

            <div>
              <h3 className="text-sm font-bold text-white">
                Junction Status
              </h3>

              <p className="mt-0.5 text-xs text-[#D7E5EC]/80">
                Current traffic pressure across monitored junctions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-1 text-[10px] font-bold text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE SENSORS</span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {junctions.map((junction) => (
          <div
            key={junction.code}
            className="p-4 transition-colors hover:bg-slate-50/80"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="truncate text-xs font-bold text-[#071A33]">
                    {junction.name}
                  </h4>

                  <span className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-700">
                    {junction.code}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                    <TrainFront
                      size={12}
                      className="text-[#0E5961]"
                    />
                    <span className="font-semibold text-[#071A33]">{junction.approaching}</span> approaching
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                    <GitBranch
                      size={12}
                      className="text-[#0E5961]"
                    />
                    <span className="font-semibold text-[#071A33]">{junction.activeRoutes}</span> active routes
                  </div>
                </div>
              </div>

              <span
                className={`shrink-0 rounded-md border px-2 py-1 text-[9px] font-bold uppercase tracking-wide transition-colors duration-300 ${
                  junction.status === "Congested"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : junction.status === "Busy"
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {junction.status}
              </span>
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Gauge
                    size={12}
                    className="text-slate-500"
                  />

                  <span className="text-[10px] font-semibold text-slate-600">
                    Junction load
                  </span>
                </div>

                <span className="text-[10px] font-bold text-[#071A33] transition-all">
                  {junction.load}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    junction.load >= 80
                      ? "bg-red-500"
                      : junction.load >= 65
                        ? "bg-[#F59E0B]"
                        : "bg-[#0E7C86]"
                  }`}
                  style={{ width: `${junction.load}%` }}
                />
              </div>
            </div>

            <Link
              to="/controller/junctions"
              className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#0E5961] transition hover:text-[#F59E0B]"
            >
              View junction
              <ArrowUpRight size={12} />
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}

export default JunctionStatus
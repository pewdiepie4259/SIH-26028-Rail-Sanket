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
    <section className="overflow-hidden rounded-xl border border-[#16364A] bg-[#0A2036]">
      <div className="border-b border-[#16364A] px-5 py-4">
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

              <p className="mt-1 text-xs text-[#71899C]">
                Current traffic pressure across monitored junctions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE SENSORS</span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-[#16364A]">
        {junctions.map((junction) => (
          <div
            key={junction.code}
            className="p-4 transition-colors hover:bg-[#071A33]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="truncate text-xs font-bold text-white">
                    {junction.name}
                  </h4>

                  <span className="rounded border border-[#16364A] bg-[#071A33] px-1.5 py-0.5 text-[9px] font-bold text-[#71899C]">
                    {junction.code}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#AFC0D4]">
                    <TrainFront
                      size={12}
                      className="text-[#0E7C86]"
                    />
                    <span className="font-semibold text-white">{junction.approaching}</span> approaching
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-[#AFC0D4]">
                    <GitBranch
                      size={12}
                      className="text-[#0E7C86]"
                    />
                    <span className="font-semibold text-white">{junction.activeRoutes}</span> active routes
                  </div>
                </div>
              </div>

              <span
                className={`shrink-0 rounded-md border px-2 py-1 text-[9px] font-bold uppercase tracking-wide transition-colors duration-300 ${
                  junction.status === "Congested"
                    ? "border-red-500/40 bg-red-500/10 text-red-300"
                    : junction.status === "Busy"
                      ? "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
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
                    className="text-[#71899C]"
                  />

                  <span className="text-[10px] font-semibold text-[#71899C]">
                    Junction load
                  </span>
                </div>

                <span className="text-[10px] font-bold text-[#D7E5EC] transition-all">
                  {junction.load}%
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-[#071A33]">
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
              className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#0E7C86] transition hover:text-[#F59E0B]"
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
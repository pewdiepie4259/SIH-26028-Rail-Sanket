import {
  AlertTriangle,
  ArrowRight,
  Clock3,
  GitBranch,
  TrainFront,
} from "lucide-react"
import { Link } from "react-router-dom"
import type { ConflictTelemetry } from "../../services/telemetryEngine"

interface ConflictPanelProps {
  conflictsData?: ConflictTelemetry[]
}

const baselineConflicts: ConflictTelemetry[] = [
  {
    id: "CF-021",
    location: "Krishnarajapuram Junction",
    secondsRemaining: 480,
    timeToConflict: "08m 00s",
    severity: "Critical",
    trainA: "12627",
    trainB: "16591",
    impact: "Potential 11 min delay",
    recommendation: "Hold 16591 on loop line; clear mainline for 12627",
  },
  {
    id: "CF-018",
    location: "Baiyappanahalli",
    secondsRemaining: 1020,
    timeToConflict: "17m 00s",
    severity: "High",
    trainA: "12639",
    trainB: "16526",
    impact: "Potential 6 min delay",
    recommendation: "Enforce double yellow aspect at BYPL home signal",
  },
  {
    id: "CF-014",
    location: "Bengaluru Cantonment",
    secondsRemaining: 1860,
    timeToConflict: "31m 00s",
    severity: "Moderate",
    trainA: "12613",
    trainB: "12608",
    impact: "Potential 3 min delay",
    recommendation: "Monitor block clearance speed",
  },
]

function ConflictPanel({ conflictsData }: ConflictPanelProps) {
  const conflicts = conflictsData && conflictsData.length > 0 ? conflictsData : baselineConflicts

  return (
    <section className="overflow-hidden rounded-2xl border border-[#164B5A] bg-[#071A33]/90 shadow-xl backdrop-blur-md flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#164B5A] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B]">
            <AlertTriangle size={16} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Active Conflicts
            </h3>

            <p className="mt-0.5 text-[11px] text-teal-200/90 font-medium">
              Predicted train movement conflicts requiring routing resolution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#040E1B] px-3 py-1 rounded-full border border-[#164B5A]">
          <span className="flex h-2 w-2 rounded-full bg-rose-400 animate-ping" />
          <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-red-300">
            {conflicts.length} active
          </span>
        </div>
      </div>

      <div className="divide-y divide-[#164B5A]/60">
        {conflicts.map((conflict) => (
          <div
            key={conflict.id}
            className="p-5 transition-colors hover:bg-[#0A2036] space-y-3.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3.5 flex-1">
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-sm ${
                    conflict.severity === "Critical"
                      ? "border-rose-500/50 bg-rose-950/60 text-rose-400"
                      : conflict.severity === "High"
                        ? "border-amber-500/50 bg-amber-950/60 text-amber-400"
                        : "border-[#164B5A] bg-[#0A2036] text-teal-300"
                  }`}
                >
                  <GitBranch
                    size={16}
                    className={
                      conflict.severity === "Critical"
                        ? "text-rose-400"
                        : conflict.severity === "High"
                          ? "text-amber-400"
                          : "text-teal-300"
                    }
                  />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="truncate text-xs sm:text-sm font-bold text-white">
                      {conflict.location}
                    </h4>

                    <span className="rounded-md border border-[#164B5A] bg-[#040E1B] px-2 py-0.5 font-mono text-[10px] font-bold text-teal-300">
                      {conflict.id}
                    </span>

                    <span className="flex items-center gap-1 font-mono text-[11px] font-extrabold text-[#FF8A3D] bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                      <Clock3 size={12} className="animate-spin-slow" />
                      {conflict.timeToConflict}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200 pt-0.5">
                    <TrainFront
                      size={14}
                      className="text-teal-400"
                    />
                    <span className="text-white bg-[#0A2036] px-2 py-0.5 rounded border border-[#164B5A]">{conflict.trainA}</span>
                    <ArrowRight
                      size={13}
                      className="text-[#F59E0B]"
                    />
                    <span className="text-white bg-[#0A2036] px-2 py-0.5 rounded border border-[#164B5A]">{conflict.trainB}</span>
                  </div>
                </div>
              </div>

              <span
                className={`shrink-0 rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  conflict.severity === "Critical"
                    ? "border-rose-500/50 bg-rose-950/80 text-rose-300"
                    : conflict.severity === "High"
                      ? "border-amber-500/50 bg-amber-950/80 text-amber-300"
                      : "border-[#164B5A] bg-[#0A2036] text-slate-200"
                }`}
              >
                {conflict.severity}
              </span>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2 pt-1">
              <div className="rounded-xl border border-[#164B5A] bg-[#040E1B]/80 p-3 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                  Estimated Impact
                </div>

                <div className="text-xs font-semibold text-slate-200 leading-snug">
                  {conflict.impact}
                </div>
              </div>

              <div className="rounded-xl border border-[#164B5A] bg-[#040E1B]/80 p-3 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#F59E0B]">
                  Recommendation
                </div>

                <div className="text-xs font-semibold text-slate-200 leading-snug">
                  {conflict.recommendation}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <Link
                to="/controller/junctions"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-300 transition hover:text-[#F59E0B]"
              >
                <span>Inspect Conflict</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-[#164B5A] bg-[#040E1B] px-5 py-3">
        <span className="text-xs text-slate-400">
          Showing {conflicts.length} conflict prediction targets
        </span>

        <Link
          to="/controller/junctions"
          className="text-xs font-semibold text-teal-300 hover:text-teal-200"
        >
          Manage All Junctions →
        </Link>
      </div>
    </section>
  )
}

export default ConflictPanel
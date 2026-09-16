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
    <section className="controller-panel overflow-hidden rounded-xl">
      <div className="controller-header px-5 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle
              size={17}
              className="text-[#F59E0B]"
            />

            <div>
              <h3 className="text-sm font-bold text-white">
                Active Conflicts
              </h3>

              <p className="mt-0.5 text-xs text-[#D7E5EC]/80">
                Predicted train movement conflicts requiring attention.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-rose-400 animate-ping" />
            <span className="rounded-md border border-red-400/40 bg-red-500/20 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-red-200">
              {conflicts.length} active
            </span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {conflicts.map((conflict) => (
          <div
            key={conflict.id}
            className="p-4 transition-colors hover:bg-slate-50/80"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                    conflict.severity === "Critical"
                      ? "border-red-200 bg-red-50"
                      : conflict.severity === "High"
                        ? "border-amber-200 bg-amber-50"
                        : "border-slate-200 bg-slate-100"
                  }`}
                >
                  <GitBranch
                    size={15}
                    className={
                      conflict.severity === "Critical"
                        ? "text-red-600"
                        : conflict.severity === "High"
                          ? "text-amber-600"
                          : "text-[#0E5961]"
                    }
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="truncate text-xs font-bold text-[#071A33]">
                      {conflict.location}
                    </h4>

                    <span className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-slate-700">
                      {conflict.id}
                    </span>

                    <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-amber-700">
                      <Clock3 size={11} className="animate-spin-slow" />
                      {conflict.timeToConflict}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-700">
                    <TrainFront
                      size={13}
                      className="text-[#0E5961]"
                    />
                    <span>{conflict.trainA}</span>
                    <ArrowRight
                      size={12}
                      className="text-slate-400"
                    />
                    <span>{conflict.trainB}</span>
                  </div>
                </div>
              </div>

              <span
                className={`shrink-0 rounded-md border px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${
                  conflict.severity === "Critical"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : conflict.severity === "High"
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-slate-200 bg-slate-100 text-slate-700"
                }`}
              >
                {conflict.severity}
              </span>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-2.5">
                <div className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
                  Estimated Impact
                </div>

                <div className="mt-0.5 text-xs font-semibold text-[#071A33]">
                  {conflict.impact}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-2.5">
                <div className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
                  Recommendation
                </div>

                <div className="mt-0.5 truncate text-xs font-semibold text-[#071A33]">
                  {conflict.recommendation}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <Link
                to="/controller/junctions"
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#0E5961] transition hover:text-[#F59E0B]"
              >
                Inspect Conflict
                <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ConflictPanel
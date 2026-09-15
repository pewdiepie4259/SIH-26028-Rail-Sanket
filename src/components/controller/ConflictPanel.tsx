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
    <section className="overflow-hidden rounded-xl border border-[#16364A] bg-[#0A2036]">
      <div className="border-b border-[#16364A] px-5 py-4">
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

              <p className="mt-1 text-xs text-[#71899C]">
                Predicted train movement conflicts requiring attention.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-red-300">
              {conflicts.length} active
            </span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-[#16364A]">
        {conflicts.map((conflict) => (
          <div
            key={conflict.id}
            className="p-4 transition-colors hover:bg-[#071A33]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                    conflict.severity === "Critical"
                      ? "border-red-500/30 bg-red-500/10"
                      : conflict.severity === "High"
                        ? "border-[#F59E0B]/30 bg-[#F59E0B]/10"
                        : "border-[#16364A] bg-[#071A33]"
                  }`}
                >
                  <GitBranch
                    size={15}
                    className={
                      conflict.severity === "Critical"
                        ? "text-red-400"
                        : conflict.severity === "High"
                          ? "text-[#F59E0B]"
                          : "text-[#0E7C86]"
                    }
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="truncate text-xs font-bold text-white">
                      {conflict.location}
                    </h4>

                    <span className="rounded border border-[#16364A] bg-[#071A33] px-1.5 py-0.5 font-mono text-[9px] font-semibold text-[#71899C]">
                      {conflict.id}
                    </span>

                    <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-amber-400">
                      <Clock3 size={11} className="animate-spin-slow" />
                      {conflict.timeToConflict}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-xs font-bold text-[#D7E5EC]">
                    <TrainFront
                      size={13}
                      className="text-[#0E7C86]"
                    />
                    <span>{conflict.trainA}</span>
                    <ArrowRight
                      size={12}
                      className="text-[#71899C]"
                    />
                    <span>{conflict.trainB}</span>
                  </div>
                </div>
              </div>

              <span
                className={`shrink-0 rounded-md border px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${
                  conflict.severity === "Critical"
                    ? "border-red-500/40 bg-red-500/10 text-red-300"
                    : conflict.severity === "High"
                      ? "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]"
                      : "border-[#16364A] bg-[#071A33] text-[#71899C]"
                }`}
              >
                {conflict.severity}
              </span>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-[#16364A] bg-[#071A33] p-2.5">
                <div className="text-[9px] font-bold uppercase tracking-wide text-[#71899C]">
                  Estimated Impact
                </div>

                <div className="mt-0.5 text-xs font-semibold text-[#D7E5EC]">
                  {conflict.impact}
                </div>
              </div>

              <div className="rounded-lg border border-[#16364A] bg-[#071A33] p-2.5">
                <div className="text-[9px] font-bold uppercase tracking-wide text-[#71899C]">
                  Recommendation
                </div>

                <div className="mt-0.5 truncate text-xs font-semibold text-[#D7E5EC]">
                  {conflict.recommendation}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <Link
                to="/controller/junctions"
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#0E7C86] transition hover:text-[#F59E0B]"
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
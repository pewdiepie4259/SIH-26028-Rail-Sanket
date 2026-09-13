import {
  AlertTriangle,
  ArrowRight,
  Clock3,
  GitBranch,
  TrainFront,
} from "lucide-react"

interface Conflict {
  id: string
  location: string
  timeToConflict: string
  severity: "Critical" | "High" | "Moderate"
  trainA: string
  trainB: string
  impact: string
  recommendation: string
}

const conflicts: Conflict[] = [
  {
    id: "CF-021",
    location: "Krishnarajapuram Junction",
    timeToConflict: "08 min",
    severity: "Critical",
    trainA: "12627",
    trainB: "16591",
    impact: "Potential 11 min delay",
    recommendation: "Review precedence",
  },
  {
    id: "CF-018",
    location: "Baiyappanahalli",
    timeToConflict: "17 min",
    severity: "High",
    trainA: "12639",
    trainB: "16526",
    impact: "Potential 6 min delay",
    recommendation: "Monitor movement",
  },
  {
    id: "CF-014",
    location: "Bengaluru Cantonment",
    timeToConflict: "31 min",
    severity: "Moderate",
    trainA: "12613",
    trainB: "12608",
    impact: "Potential 3 min delay",
    recommendation: "No action required",
  },
]

function ConflictPanel() {
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

          <span className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-red-300">
            {conflicts.length} active
          </span>
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
                  <div className="truncate text-xs font-bold text-white">
                    {conflict.location}
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-[10px] text-[#71899C]">
                    <span>{conflict.id}</span>
                    <span>•</span>
                    <Clock3 size={11} />
                    <span>{conflict.timeToConflict}</span>
                  </div>
                </div>
              </div>

              <span
                className={`shrink-0 rounded-md border px-2 py-1 text-[9px] font-bold uppercase ${
                  conflict.severity === "Critical"
                    ? "border-red-500/40 bg-red-500/10 text-red-300"
                    : conflict.severity === "High"
                      ? "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]"
                      : "border-[#16364A] bg-[#071A33] text-[#AFC0D4]"
                }`}
              >
                {conflict.severity}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#16364A] bg-[#071A33] px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <TrainFront
                  size={13}
                  className="text-[#0E7C86]"
                />

                <span className="text-xs font-bold text-white">
                  {conflict.trainA}
                </span>
              </div>

              <ArrowRight
                size={13}
                className="text-[#71899C]"
              />

              <div className="flex items-center gap-1.5">
                <TrainFront
                  size={13}
                  className="text-[#F59E0B]"
                />

                <span className="text-xs font-bold text-white">
                  {conflict.trainB}
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wide text-[#71899C]">
                  Estimated impact
                </div>

                <div className="mt-1 text-[11px] font-semibold text-[#D7E5EC]">
                  {conflict.impact}
                </div>
              </div>

              <div>
                <div className="text-[9px] font-bold uppercase tracking-wide text-[#71899C]">
                  Recommendation
                </div>

                <div className="mt-1 text-[11px] font-semibold text-[#D7E5EC]">
                  {conflict.recommendation}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="mt-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#0E7C86] transition hover:text-[#F59E0B]"
            >
              Inspect conflict
              <ArrowRight size={12} />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ConflictPanel
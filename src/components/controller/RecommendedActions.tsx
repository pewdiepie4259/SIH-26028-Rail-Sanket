import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  GitBranch,
  Route,
  ShieldAlert,
  TrainFront,
} from "lucide-react"

interface Recommendation {
  id: string
  action: string
  reason: string
  train: string
  location: string
  expectedImpact: string
  urgency: "Immediate" | "Review" | "Monitor"
  icon: typeof TrainFront
}

const recommendations: Recommendation[] = [
  {
    id: "ACT-021",
    action: "Review precedence",
    reason: "Predicted junction conflict between two movements.",
    train: "12627",
    location: "Krishnarajapuram Junction",
    expectedImpact: "May reduce downstream delay by 7 min",
    urgency: "Immediate",
    icon: GitBranch,
  },
  {
    id: "ACT-018",
    action: "Regulate movement",
    reason: "Weather-related speed restriction on the upcoming section.",
    train: "16591",
    location: "Baiyappanahalli",
    expectedImpact: "Reduce risk of further delay propagation",
    urgency: "Review",
    icon: ShieldAlert,
  },
  {
    id: "ACT-014",
    action: "Review alternate route",
    reason: "High junction occupancy expected within forecast horizon.",
    train: "12639",
    location: "Bengaluru Cantonment",
    expectedImpact: "Potentially avoid platform conflict",
    urgency: "Monitor",
    icon: Route,
  },
]

function RecommendedActions() {
  return (
    <section className="overflow-hidden rounded-xl border border-[#16364A] bg-[#0A2036]">
      <div className="border-b border-[#16364A] px-5 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2
              size={17}
              className="text-[#F59E0B]"
            />

            <div>
              <h3 className="text-sm font-bold text-white">
                Recommended Actions
              </h3>

              <p className="mt-1 text-xs text-[#71899C]">
                Operational actions generated from current network conditions.
              </p>
            </div>
          </div>

          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#71899C]">
            Controller review required
          </span>
        </div>
      </div>

      <div className="divide-y divide-[#16364A]">
        {recommendations.map((recommendation) => {
          const Icon = recommendation.icon

          return (
            <div
              key={recommendation.id}
              className="p-5 transition-colors hover:bg-[#071A33]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#16364A] bg-[#071A33]">
                    <Icon
                      size={17}
                      className="text-[#0E7C86]"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs font-bold text-white">
                        {recommendation.action}
                      </h4>

                      <span className="rounded border border-[#16364A] bg-[#071A33] px-1.5 py-0.5 text-[9px] font-bold text-[#71899C]">
                        {recommendation.id}
                      </span>

                      <span
                        className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                          recommendation.urgency === "Immediate"
                            ? "border-red-500/40 bg-red-500/10 text-red-300"
                            : recommendation.urgency === "Review"
                              ? "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]"
                              : "border-[#16364A] bg-[#071A33] text-[#AFC0D4]"
                        }`}
                      >
                        {recommendation.urgency}
                      </span>
                    </div>

                    <p className="mt-1 text-[11px] leading-5 text-[#AFC0D4]">
                      {recommendation.reason}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#D7E5EC]">
                        <TrainFront
                          size={12}
                          className="text-[#0E7C86]"
                        />
                        Train {recommendation.train}
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-[#D7E5EC]">
                        <GitBranch
                          size={12}
                          className="text-[#0E7C86]"
                        />
                        {recommendation.location}
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-[#D7E5EC]">
                        <Clock3
                          size={12}
                          className="text-[#F59E0B]"
                        />
                        {recommendation.expectedImpact}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#F59E0B] bg-[#071A33] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide text-white transition hover:bg-[#0E5961] lg:min-w-[125px]"
                >
                  Review action
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-[#16364A] bg-[#071A33] px-5 py-3">
        <div className="flex items-center gap-2 text-[10px] text-[#71899C]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
          Recommendations are advisory. Controller authorization is required
          before operational execution.
        </div>
      </div>
    </section>
  )
}

export default RecommendedActions
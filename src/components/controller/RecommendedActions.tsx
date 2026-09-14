import {
  Check,
  ChevronRight,
  Clock3,
  TrainFront,
  X,
} from "lucide-react"

type ActionPriority = "Critical" | "High" | "Medium"

interface RecommendedAction {
  id: string
  priority: ActionPriority
  train: string
  trainName: string
  currentDelay: number
  reason: string
  action: string
  expectedReduction: string
  riskIfIgnored: string
  confidence: number
  time: string
}

const recommendations: RecommendedAction[] = [
  {
    id: "ACT-1042",
    priority: "Critical",
    train: "12628",
    trainName: "Karnataka Express",
    currentDelay: 18,
    reason: "Platform conflict predicted at KSR Bengaluru.",
    action: "Assign Platform 6 and hold conflicting movement.",
    expectedReduction: "8–12 min",
    riskIfIgnored: "Further downstream delay",
    confidence: 94,
    time: "17:48",
  },
  {
    id: "ACT-1039",
    priority: "High",
    train: "16526",
    trainName: "KSR Bengaluru – Kannur",
    currentDelay: 11,
    reason: "Heavy rainfall expected along the next section.",
    action: "Apply temporary speed restriction through affected block.",
    expectedReduction: "5–8 min",
    riskIfIgnored: "Safety / delay escalation",
    confidence: 89,
    time: "17:43",
  },
  {
    id: "ACT-1037",
    priority: "High",
    train: "16591",
    trainName: "Hampi Express",
    currentDelay: 9,
    reason: "Delayed preceding movement creating route contention.",
    action: "Prioritise train through junction before secondary movement.",
    expectedReduction: "4–6 min",
    riskIfIgnored: "Junction congestion",
    confidence: 86,
    time: "17:39",
  },
]

const actionHistory = [
  {
    time: "17:42",
    action: "Platform reassigned",
    train: "12628",
    result: "Delay contained",
  },
  {
    time: "17:18",
    action: "Speed restriction applied",
    train: "16526",
    result: "Risk reduced",
  },
  {
    time: "16:54",
    action: "Route priority changed",
    train: "16591",
    result: "Conflict cleared",
  },
]

function RecommendedActions() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <section className="controller-panel overflow-hidden rounded-lg">
        <div className="controller-header px-4 py-3">
          <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
            <div>
              <h2 className="text-sm font-bold text-white">
                Recommended Actions
              </h2>

              <p className="mt-0.5 text-[11px] text-[#D7E5EC]/70">
                Operational actions requiring controller review
              </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-bold text-[#D7E5EC]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
              {recommendations.length} pending review
            </div>
          </div>
        </div>

        {/* Action cards */}
        <div className="divide-y divide-[#145158]">
          {recommendations.map((recommendation) => (
            <ActionCard
              key={recommendation.id}
              recommendation={recommendation}
            />
          ))}
        </div>
      </section>

      {/* History */}
      <section className="controller-panel overflow-hidden rounded-lg">
        <div className="controller-header px-4 py-3">
          <div className="flex items-center gap-2">
            <Clock3 size={16} className="text-[#F59E0B]" />

            <div>
              <h2 className="text-sm font-bold text-white">
                Recent Action History
              </h2>

              <p className="mt-0.5 text-[11px] text-[#D7E5EC]/70">
                Previously executed operational interventions
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead>
              <tr className="border-b border-[#145158] bg-[#08383D]">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[#9FB8BE]">
                  Time
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[#9FB8BE]">
                  Action
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[#9FB8BE]">
                  Train
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[#9FB8BE]">
                  Result
                </th>
              </tr>
            </thead>

            <tbody>
              {actionHistory.map((item) => (
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
    </div>
  )
}

function ActionCard({
  recommendation,
}: {
  recommendation: RecommendedAction
}) {
  const priorityClass =
    recommendation.priority === "Critical"
      ? "border-red-900/70 bg-red-950/20 text-red-400"
      : recommendation.priority === "High"
        ? "border-[#F59E0B]/50 bg-[#F59E0B]/5 text-[#F59E0B]"
        : "border-[#145158] bg-[#031A1F] text-[#9FB8BE]"

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        {/* Main */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${priorityClass}`}
            >
              {recommendation.priority}
            </span>

            <span className="text-[10px] font-semibold text-[#718F96]">
              {recommendation.id}
            </span>

            <span className="text-[10px] text-[#718F96]">
              {recommendation.time}
            </span>
          </div>

          <div className="mt-3 flex items-start gap-3">
            <div className="rounded-md border border-[#145158] bg-[#031A1F] p-2">
              <TrainFront size={18} className="text-[#F59E0B]" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  {recommendation.train}
                </h3>

                <span className="text-[11px] text-[#9FB8BE]">
                  {recommendation.trainName}
                </span>
              </div>

              <div className="mt-1 text-xs text-red-400">
                Current delay:{" "}
                <span className="font-bold">
                  +{recommendation.currentDelay} min
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-md border border-[#145158] bg-[#031A1F] p-3">
              <div className="text-[9px] font-bold uppercase tracking-wide text-[#718F96]">
                Reason
              </div>

              <div className="mt-1.5 text-[11px] leading-5 text-[#D7E5EC]">
                {recommendation.reason}
              </div>
            </div>

            <div className="rounded-md border border-[#145158] bg-[#031A1F] p-3">
              <div className="text-[9px] font-bold uppercase tracking-wide text-[#718F96]">
                Recommended Action
              </div>

              <div className="mt-1.5 text-[11px] leading-5 font-semibold text-white">
                {recommendation.action}
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <ImpactItem
              label="Expected reduction"
              value={recommendation.expectedReduction}
            />

            <ImpactItem
              label="Risk if ignored"
              value={recommendation.riskIfIgnored}
              warning
            />

            <ImpactItem
              label="Confidence"
              value={`${recommendation.confidence}%`}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-row gap-2 xl:flex-col xl:w-28">
          <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-emerald-700 bg-emerald-950/20 px-3 py-2.5 text-[10px] font-bold text-emerald-400 transition hover:bg-emerald-950/40">
            <Check size={14} />
            Accept
          </button>

          <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-red-900/70 bg-red-950/20 px-3 py-2.5 text-[10px] font-bold text-red-400 transition hover:bg-red-950/40">
            <X size={14} />
            Reject
          </button>

          <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-[#145158] bg-[#031A1F] px-3 py-2.5 text-[10px] font-bold text-[#D7E5EC] transition hover:bg-[#08383D]">
            Review
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

function ImpactItem({
  label,
  value,
  warning,
}: {
  label: string
  value: string
  warning?: boolean
}) {
  return (
    <div className="rounded-md border border-[#145158] bg-[#031A1F] px-3 py-2.5">
      <div className="text-[9px] font-bold uppercase tracking-wide text-[#718F96]">
        {label}
      </div>

      <div
        className={
          warning
            ? "mt-1 text-[11px] font-bold text-[#F59E0B]"
            : "mt-1 text-[11px] font-bold text-white"
        }
      >
        {value}
      </div>
    </div>
  )
}

export default RecommendedActions

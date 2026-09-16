import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Check,
  ChevronRight,
  Clock3,
  TrainFront,
  X,
} from "lucide-react"
import { recordAuditAction } from "../../services/auditService"

type ActionPriority = "Critical" | "High" | "Medium"
type ActionStatus = "pending" | "accepted" | "rejected" | "reviewing"

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

const initialRecommendations: RecommendedAction[] = [
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

interface HistoryEntry {
  time: string
  action: string
  train: string
  result: string
}

const initialHistory: HistoryEntry[] = [
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

function nowIST(): string {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  })
}

function RecommendedActions() {
  const [statuses, setStatuses] = useState<Record<string, ActionStatus>>(
    Object.fromEntries(initialRecommendations.map((r) => [r.id, "pending"])),
  )
  const [history, setHistory] = useState<HistoryEntry[]>(initialHistory)

  function handleAccept(rec: RecommendedAction) {
    setStatuses((prev) => ({ ...prev, [rec.id]: "accepted" }))
    recordAuditAction({
      actor: "Controller",
      action: "Accepted recommended action",
      target: rec.train,
      location: "Bengaluru Section",
      status: "Recorded",
      details: rec.action,
    })
    setHistory((prev) => [
      {
        time: nowIST(),
        action: rec.action,
        train: rec.train,
        result: "Action recorded",
      },
      ...prev,
    ])
  }

  function handleReject(rec: RecommendedAction) {
    setStatuses((prev) => ({ ...prev, [rec.id]: "rejected" }))
    recordAuditAction({
      actor: "Controller",
      action: "Rejected recommended action",
      target: rec.train,
      location: "Bengaluru Section",
      status: "Recorded",
      details: rec.action,
    })
    setHistory((prev) => [
      {
        time: nowIST(),
        action: `Recommendation rejected — ${rec.id}`,
        train: rec.train,
        result: "Action recorded",
      },
      ...prev,
    ])
  }

  function handleReview(rec: RecommendedAction) {
    setStatuses((prev) => ({ ...prev, [rec.id]: "reviewing" }))
  }

  // Show pending first, then reviewing, then resolved
  const sorted = [...initialRecommendations].sort((a, b) => {
    const order: Record<ActionStatus, number> = {
      pending: 0,
      reviewing: 1,
      accepted: 2,
      rejected: 3,
    }
    return order[statuses[a.id]] - order[statuses[b.id]]
  })

  const pendingCount = initialRecommendations.filter(
    (r) => statuses[r.id] === "pending",
  ).length

  return (
    <div className="space-y-5">
      {/* Header + cards */}
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
              {pendingCount} pending review
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {sorted.map((rec) => (
            <ActionCard
              key={rec.id}
              recommendation={rec}
              status={statuses[rec.id]}
              onAccept={() => handleAccept(rec)}
              onReject={() => handleReject(rec)}
              onReview={() => handleReview(rec)}
            />
          ))}
        </div>
      </section>

      {/* History */}
      <section className="controller-panel overflow-hidden rounded-xl">
        <div className="controller-header px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Clock3 size={16} className="text-[#F59E0B]" />
            <div>
              <h2 className="text-sm font-bold text-white">
                Action History
              </h2>
              <p className="mt-0.5 text-xs text-[#D7E5EC]/80">
                Previously executed operational interventions
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {["Time", "Action", "Train", "Result"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((item, i) => (
                <tr
                  key={`${item.time}-${i}`}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                    {item.time}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-[#071A33]">
                    {item.action}
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-[#0E5961]">
                    {item.train}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded border px-2 py-1 text-[10px] font-bold ${
                        item.result === "No action taken"
                          ? "border-slate-200 bg-slate-100 text-slate-600"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700"
                      }`}
                    >
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
  status,
  onAccept,
  onReject,
  onReview,
}: {
  recommendation: RecommendedAction
  status: ActionStatus
  onAccept: () => void
  onReject: () => void
  onReview: () => void
}) {
  const priorityClass =
    recommendation.priority === "Critical"
      ? "border-red-200 bg-red-50 text-red-700"
      : recommendation.priority === "High"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-slate-200 bg-slate-100 text-slate-700"

  const isResolved = status === "accepted" || status === "rejected"

  return (
    <div className={`p-4 transition-colors hover:bg-slate-50/60 ${isResolved ? "opacity-60" : ""}`}>
      {/* Status banner */}
      {status !== "pending" && (
        <div
          className={`mb-3 flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-bold ${
            status === "accepted"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : status === "rejected"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          {status === "accepted" && <Check size={14} className="shrink-0 text-emerald-600" />}
          {status === "rejected" && <X size={14} className="shrink-0 text-red-600" />}
          {status === "accepted" && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-bold uppercase tracking-wider text-emerald-800">ACTION ACCEPTED</span>
              <span className="text-[11px] font-medium text-emerald-700">Recorded in operational audit</span>
            </div>
          )}
          {status === "rejected" && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-bold uppercase tracking-wider text-red-800">ACTION REJECTED</span>
              <span className="text-[11px] font-medium text-red-700">Recorded in operational audit</span>
            </div>
          )}
          {status === "reviewing" && "Under review by controller"}
        </div>
      )}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        {/* Main */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded border px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${priorityClass}`}
            >
              {recommendation.priority}
            </span>
            <span className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700">
              {recommendation.id}
            </span>
            <span className="text-[10px] text-slate-500">
              {recommendation.time}
            </span>
          </div>

          <div className="mt-3 flex items-start gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-100 p-2">
              <TrainFront size={18} className="text-[#0E5961]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={`/controller/trains/${recommendation.train}`}
                  className="text-sm font-bold text-[#071A33] hover:text-[#F59E0B] transition-colors"
                >
                  {recommendation.train}
                </Link>
                <span className="text-[11px] font-medium text-slate-600">
                  {recommendation.trainName}
                </span>
              </div>
              <div className="mt-1 text-xs text-red-600 font-medium">
                Current delay:{" "}
                <span className="font-bold">
                  +{recommendation.currentDelay} min
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <div className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
                Reason
              </div>
              <div className="mt-1.5 text-[11px] leading-5 text-slate-700">
                {recommendation.reason}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <div className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
                Recommended Action
              </div>
              <div className="mt-1.5 text-[11px] leading-5 font-semibold text-[#071A33]">
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
              label="Prediction confidence"
              value={`${recommendation.confidence}%`}
            />
          </div>
        </div>

        {/* Action buttons */}
        {!isResolved && (
          <div className="flex shrink-0 flex-row gap-2 xl:w-28 xl:flex-col">
            <button
              onClick={onAccept}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-[10px] font-bold text-emerald-800 transition hover:bg-emerald-100"
            >
              <Check size={14} />
              Accept
            </button>
            <button
              onClick={onReject}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-bold text-red-800 transition hover:bg-red-100"
            >
              <X size={14} />
              Reject
            </button>
            {status === "pending" && (
              <button
                onClick={onReview}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Review
                <ChevronRight size={13} />
              </button>
            )}
          </div>
        )}
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
    <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5">
      <div className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div
        className={
          warning
            ? "mt-1 text-[11px] font-bold text-amber-800"
            : "mt-1 text-[11px] font-bold text-[#071A33]"
        }
      >
        {value}
      </div>
    </div>
  )
}

export default RecommendedActions

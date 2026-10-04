import { useState } from "react"
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Clock3,
  ShieldAlert,
} from "lucide-react"
import { Link } from "react-router-dom"
import { recordAuditAction } from "../../services/auditService"

interface CriticalAlert {
  id?: string
  train_number?: string
  trainNumber?: string
  message?: string
  description?: string
  reason?: string
  type?: string
  severity?: string
  time?: string
  timestamp?: string
  location?: string
  [key: string]: unknown
}

interface CriticalAlertsProps {
  alerts: CriticalAlert[]
}

const baselineAlerts: CriticalAlert[] = [
  {
    id: "SBC-04",
    message: "Signal restriction on Block SBC-BYPL approach section",
    type: "Signal restriction",
    severity: "CRITICAL",
    trainNumber: "12628",
    location: "SBC-04",
    time: "17:44",
  },
  {
    id: "JN-04",
    message: "Junction conflict predicted at Baiyappanahalli between 16589 and 16526",
    type: "Junction conflict",
    severity: "HIGH",
    location: "JN-04",
    time: "17:41",
  },
  {
    id: "WTH-02",
    message: "Weather restriction: Heavy rainfall reducing line speed to 45 km/h",
    type: "Weather restriction",
    severity: "CAUTION",
    trainNumber: "16526",
    location: "WFD-02",
    time: "17:36",
  },
  {
    id: "CAS-01",
    message: "Cascading delay: Primary delay on 12627 propagating to downstream rakes",
    type: "Cascading delay",
    severity: "HIGH",
    trainNumber: "12627",
    location: "CAS-01",
    time: "17:30",
  },
]

function getAlertDestination(alertType: string, message: string, trainNumber?: string | null): {
  url: string
  label: string
} {
  const text = `${alertType} ${message}`.toLowerCase()
  if (
    text.includes("weather") ||
    text.includes("rain") ||
    text.includes("rainfall") ||
    text.includes("fog") ||
    text.includes("wind") ||
    text.includes("visibility")
  ) {
    return { url: "/controller/weather", label: "Weather Impact" }
  }
  if (
    text.includes("cascade") ||
    text.includes("cascading") ||
    text.includes("propagation") ||
    text.includes("knock-on") ||
    text.includes("downstream")
  ) {
    return { url: "/controller/cascade", label: "Cascade Analysis" }
  }
  if (
    text.includes("junction") ||
    text.includes("conflict") ||
    text.includes("crossing") ||
    text.includes("platform") ||
    text.includes("route")
  ) {
    return { url: "/controller/junctions", label: "Junction Management" }
  }
  if (trainNumber) {
    return { url: `/controller/trains/${trainNumber}`, label: "Train Details" }
  }
  return { url: "/controller/trains/12628", label: "Train Details" }
}

function CriticalAlerts({ alerts }: CriticalAlertsProps) {
  const displayAlerts = alerts.length > 0 ? alerts.slice(0, 5) : baselineAlerts
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set())

  const getAlertId = (alert: CriticalAlert, index: number) => {
    return (alert.id as string) || (alert.location as string) || (alert.trainNumber ? `TRN-${alert.trainNumber}` : `ALT-${index + 1}`)
  }

  const unacknowledgedCount = displayAlerts.filter((a, idx) => !acknowledgedIds.has(getAlertId(a, idx))).length

  const handleAcknowledge = (alertId: string, alertMessage: string) => {
    setAcknowledgedIds((prev) => new Set([...prev, alertId]))
    recordAuditAction({
      actor: "Controller",
      action: "Acknowledged critical alert",
      target: alertId,
      location: "Bengaluru Section",
      status: "Recorded",
      details: alertMessage,
    })
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#164B5A] bg-[#071A33]/90 shadow-xl backdrop-blur-md flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#164B5A] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B]">
            <ShieldAlert size={16} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Critical Operations
            </h3>

            <p className="mt-0.5 text-[11px] text-teal-200/90 font-medium">
              Live operational alerts requiring immediate attention
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#040E1B] px-3 py-1 rounded-full border border-[#164B5A]">
          <span
            className={`h-2 w-2 rounded-full ${
              unacknowledgedCount > 0
                ? "bg-[#F59E0B] animate-pulse"
                : "bg-emerald-400"
            }`}
          />

          <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-teal-200">
            {unacknowledgedCount} active
          </span>
        </div>
      </div>

      <div className="divide-y divide-[#164B5A]/60 overflow-y-auto">
        {displayAlerts.map((alert, index) => {
          let message = "Operational headway caution in effect across section"
          if (
            typeof alert.message === "string" &&
            alert.message.trim() &&
            alert.message !== "Operational event detected"
          ) {
            message = alert.message
          } else if (typeof alert.description === "string" && alert.description.trim()) {
            message = alert.description
          } else if (typeof alert.reason === "string" && alert.reason.trim()) {
            message = alert.reason
          } else if ((alert as any).dispatcher_precedence_action?.advisory_directive) {
            message = (alert as any).dispatcher_precedence_action.advisory_directive
          } else if ((alert as any).delayed_train) {
            const stn = (alert as any).bottleneck_station || "Section Junction"
            const tName = (alert as any).delayed_train_name || `Train ${(alert as any).delayed_train}`
            const dMin = (alert as any).predicted_delay_min || 5
            message = `Convergence alert at ${stn}: ${tName} delayed by +${dMin} min creating downstream cascade risk.`
          }

          const type =
            typeof alert.type === "string"
              ? alert.type
              : typeof alert.severity === "string"
                ? alert.severity
                : (alert as any).delayed_train
                  ? "Junction Precedence"
                  : "Operational Warning"

          const trainNumber =
            typeof alert.train_number === "string"
              ? alert.train_number
              : typeof alert.trainNumber === "string"
                ? alert.trainNumber
                : (alert as any).delayed_train
                  ? String((alert as any).delayed_train)
                  : null

          const timestamp =
            typeof alert.timestamp === "string"
              ? alert.timestamp
              : typeof alert.time === "string"
                ? alert.time
                : "Just now"

          const alertId =
            (alert.id as string) ||
            ((alert as any).bottleneck_station ? `ALT-${(alert as any).bottleneck_station}-${index + 1}` : null) ||
            (trainNumber ? `TRN-${trainNumber}` : `ALT-${index + 1}`)

          const isCritical =
            type.toLowerCase() === "critical" ||
            type.toLowerCase() === "error" ||
            (alert.severity as string)?.toLowerCase() === "critical"

          const destination = getAlertDestination(type, message, trainNumber)
          const isAcknowledged = acknowledgedIds.has(alertId)

          return (
            <div
              key={`${alertId}-${index}`}
              className={`p-5 transition-colors hover:bg-[#0A2036] ${
                isAcknowledged ? "opacity-60" : ""
              }`}
            >
              <div className="flex flex-col gap-3.5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-sm ${
                      isCritical
                        ? "border-rose-500/50 bg-rose-950/60 text-rose-400"
                        : "border-amber-500/50 bg-amber-950/60 text-[#F59E0B]"
                    }`}
                  >
                    <AlertTriangle size={18} />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-slate-300 bg-[#040E1B] px-2 py-0.5 rounded border border-[#164B5A]">
                        {alertId}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isCritical
                            ? "bg-rose-950/80 text-rose-300 border border-rose-500/50"
                            : "bg-amber-950/80 text-amber-300 border border-amber-500/50"
                        }`}
                      >
                        {type}
                      </span>
                      {isAcknowledged && (
                        <span className="rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/50">
                          Acknowledged
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm font-bold leading-relaxed text-white">
                      {message}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-300">
                      {trainNumber && (
                        <Link
                          to={`/controller/trains/${trainNumber}`}
                          className="font-semibold text-teal-300 hover:text-[#F59E0B] transition-colors"
                        >
                          Train {trainNumber}
                        </Link>
                      )}

                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Clock3 size={12} className="text-slate-400" />
                        {timestamp}
                      </span>

                      <span className="text-slate-400">
                        Destination: <span className="font-semibold text-teal-200">{destination.label}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2.5 self-end lg:self-center pt-2 lg:pt-0">
                  <button
                    onClick={() => handleAcknowledge(alertId, message)}
                    disabled={isAcknowledged}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
                      isAcknowledged
                        ? "border-emerald-500/40 bg-emerald-950/60 text-emerald-300 cursor-default"
                        : "border-[#164B5A] bg-[#0A2036] text-slate-200 hover:text-white hover:border-[#F59E0B] hover:bg-[#16364A] cursor-pointer"
                    }`}
                  >
                    <Check size={13} />
                    {isAcknowledged ? "Acknowledged" : "Acknowledge"}
                  </button>

                  <Link
                    to={destination.url}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-teal-500/40 bg-[#0E7C86] hover:bg-[#0E5961] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white transition-all shadow-sm"
                  >
                    Review
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between border-t border-[#164B5A] bg-[#040E1B] px-5 py-3">
        <span className="text-xs text-slate-400">
          Showing {displayAlerts.length} operational alerts
        </span>

        <span className="text-xs font-semibold text-teal-300">
          Real-time telemetry active
        </span>
      </div>
    </section>
  )
}

export default CriticalAlerts
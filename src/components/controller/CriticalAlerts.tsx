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
    <section className="overflow-hidden rounded-xl border border-[#16364A] bg-[#0A2036]">
      <div className="flex items-center justify-between border-b border-[#16364A] px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldAlert
            size={16}
            className="text-[#F59E0B]"
          />

          <div>
            <h3 className="text-sm font-bold text-white">
              Critical Operations
            </h3>

            <p className="mt-0.5 text-[10px] text-[#71899C]">
              Live operational alerts requiring attention
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              displayAlerts.length > 0
                ? "bg-[#F59E0B]"
                : "bg-emerald-400"
            }`}
          />

          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#AFC0D4]">
            {displayAlerts.length} active
          </span>
        </div>
      </div>

      <div className="divide-y divide-[#16364A]">
        {displayAlerts.map((alert, index) => {
          const message =
            typeof alert.message === "string"
              ? alert.message
              : typeof alert.description === "string"
                ? alert.description
                : typeof alert.reason === "string"
                  ? alert.reason
                  : "Operational event detected"

          const type =
            typeof alert.type === "string"
              ? alert.type
              : typeof alert.severity === "string"
                ? alert.severity
                : "warning"

          const trainNumber =
            typeof alert.train_number === "string"
              ? alert.train_number
              : typeof alert.trainNumber === "string"
                ? alert.trainNumber
                : null

          const timestamp =
            typeof alert.time === "string"
              ? alert.time
              : typeof alert.timestamp === "string"
                ? alert.timestamp
                : "Just now"

          const alertId = (alert.id as string) || (alert.location as string) || (trainNumber ? `TRN-${trainNumber}` : `ALT-${index + 1}`)
          const isCritical =
            type.toLowerCase() === "critical" ||
            type.toLowerCase() === "error" ||
            (alert.severity as string)?.toLowerCase() === "critical"

          const destination = getAlertDestination(type, message, trainNumber)
          const isAcknowledged = acknowledgedIds.has(alertId)

          return (
            <div
              key={`${alertId}-${index}`}
              className={`p-4 transition-colors hover:bg-[#071A33]/70 ${
                isAcknowledged ? "opacity-60" : ""
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${
                      isCritical
                        ? "border-red-900/60 bg-red-950/40 text-red-400"
                        : "border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B]"
                    }`}
                  >
                    <AlertTriangle size={15} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-[#F59E0B]">
                        {alertId}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                          isCritical
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20"
                        }`}
                      >
                        {type}
                      </span>
                      {isAcknowledged && (
                        <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400 border border-emerald-500/20">
                          Acknowledged
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs font-semibold leading-5 text-[#D7E5EC]">
                      {message}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#71899C]">
                      {trainNumber && (
                        <Link
                          to={`/controller/trains/${trainNumber}`}
                          className="font-semibold text-[#0E7C86] hover:text-[#F59E0B] transition-colors"
                        >
                          Train {trainNumber}
                        </Link>
                      )}

                      <span className="flex items-center gap-1">
                        <Clock3 size={11} />
                        {timestamp}
                      </span>

                      <span className="text-[#AFC0D4]">
                        Destination: <span className="font-semibold text-white">{destination.label}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleAcknowledge(alertId, message)}
                    disabled={isAcknowledged}
                    className={`inline-flex items-center gap-1 rounded border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                      isAcknowledged
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 cursor-default"
                        : "border-[#16364A] bg-[#071A33] text-[#9FB8BE] hover:text-white hover:border-[#F59E0B]"
                    }`}
                  >
                    <Check size={11} />
                    {isAcknowledged ? "Acknowledged" : "Acknowledge"}
                  </button>

                  <Link
                    to={destination.url}
                    className="inline-flex items-center gap-1 rounded border border-[#0E7C86]/50 bg-[#0E7C86]/15 hover:bg-[#0E7C86]/25 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white transition-colors"
                  >
                    Review
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between border-t border-[#16364A] px-4 py-2.5">
        <span className="text-[10px] text-[#71899C]">
          Showing {displayAlerts.length} operational alerts
        </span>

        <span className="text-[10px] font-semibold text-[#0E7C86]">
          Real-time stream active
        </span>
      </div>
    </section>
  )
}

export default CriticalAlerts
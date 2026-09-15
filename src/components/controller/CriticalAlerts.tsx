import {
  AlertTriangle,
  ChevronRight,
  Clock3,
  Radio,
  ShieldAlert,
} from "lucide-react"
import { Link } from "react-router-dom"

interface CriticalAlert {
  [key: string]: unknown
}

interface CriticalAlertsProps {
  alerts: CriticalAlert[]
}

function CriticalAlerts({
  alerts,
}: CriticalAlertsProps) {
  const visibleAlerts = alerts.slice(0, 5)

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
              alerts.length > 0
                ? "bg-[#F59E0B]"
                : "bg-emerald-400"
            }`}
          />

          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#AFC0D4]">
            {alerts.length} active
          </span>
        </div>
      </div>

      {visibleAlerts.length === 0 ? (
        <div className="flex min-h-[170px] items-center justify-center px-4">
          <div className="text-center">
            <Radio
              size={26}
              strokeWidth={1.6}
              className="mx-auto text-[#0E5961]"
            />

            <div className="mt-3 text-xs font-semibold text-[#D7E5EC]">
              No critical alerts
            </div>

            <p className="mt-1 text-[10px] leading-5 text-[#71899C]">
              The monitored section is currently operating without
              active critical alerts.
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-[#16364A]">
          {visibleAlerts.map((alert, index) => {
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

            const isCritical =
              type.toLowerCase() === "critical" ||
              type.toLowerCase() === "error"

            return (
              <Link
                key={`${trainNumber ?? "alert"}-${index}`}
                to={trainNumber ? `/controller/trains/${trainNumber}` : "/controller/junctions"}
                className="group block px-4 py-3 transition-colors hover:bg-[#071A33]"
              >
                <div className="flex gap-3">
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${
                      isCritical
                        ? "border-red-900/60 bg-red-950/40 text-red-400"
                        : "border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B]"
                    }`}
                  >
                    <AlertTriangle size={14} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold leading-5 text-[#D7E5EC]">
                        {message}
                      </p>

                      <ChevronRight
                        size={14}
                        className="mt-1 shrink-0 text-[#71899C] transition-transform group-hover:translate-x-0.5 group-hover:text-[#0E7C86]"
                      />
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#71899C]">
                      {trainNumber && (
                        <span className="font-semibold text-[#0E7C86]">
                          Train {trainNumber}
                        </span>
                      )}

                      <span className="flex items-center gap-1">
                        <Clock3 size={11} />
                        {timestamp}
                      </span>

                      <span
                        className={`font-bold uppercase tracking-wide ${
                          isCritical
                            ? "text-red-400"
                            : "text-[#F59E0B]"
                        }`}
                      >
                        {type}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-[#16364A] px-4 py-2.5">
        <span className="text-[10px] text-[#71899C]">
          {alerts.length > 5
            ? `Showing 5 of ${alerts.length} alerts`
            : "Real-time alert stream"}
        </span>

        <span className="text-[10px] font-semibold text-[#0E7C86]">
          Auto-updating
        </span>
      </div>
    </section>
  )
}

export default CriticalAlerts
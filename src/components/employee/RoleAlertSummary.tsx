import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
import type { RoleAlertItem } from "../../services/employeeDashboardService";

interface RoleAlertSummaryProps {
  alerts: RoleAlertItem[];
  onAcknowledgeAlert: (alertId: string) => void;
}

export default function RoleAlertSummary({
  alerts,
  onAcknowledgeAlert,
}: RoleAlertSummaryProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Operational Alerts
            </h3>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#16364A] text-slate-300">
            {alerts.length} Active
          </span>
        </div>

        <div className="space-y-2.5">
          {alerts.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              <CheckCircle2 size={22} className="mx-auto text-teal-400 mb-1" />
              No active operational alerts.
            </div>
          ) : (
            alerts.slice(0, 3).map((alert) => {
              const isCritical = alert.severity === "CRITICAL";
              const isHigh = alert.severity === "HIGH";

              const badgeStyle = isCritical
                ? "bg-red-950/60 text-red-300 border-red-700/50"
                : isHigh
                ? "bg-amber-950/60 text-amber-300 border-amber-700/50"
                : "bg-blue-950/60 text-blue-300 border-blue-700/50";

              return (
                <div
                  key={alert.id}
                  className="rounded-lg border border-[#16364A] bg-[#0A2036] p-3 transition hover:border-[#0E7C86]/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider shrink-0 ${badgeStyle}`}
                      >
                        {alert.severity}
                      </span>
                      <h4 className="text-xs font-semibold text-white truncate">
                        {alert.title}
                      </h4>
                    </div>

                    <span className="text-[10px] text-[#71899C] shrink-0 font-mono">
                      {alert.timestamp}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                    {alert.description}
                  </p>

                  <div className="mt-2 pt-2 border-t border-[#16364A]/50 text-xs text-slate-300 flex items-center justify-between">
                    <span className="font-mono text-teal-300 text-[11px] truncate pr-2">
                      {alert.trainOrSection}
                    </span>
                    <button
                      type="button"
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#16364A] text-slate-300 hover:text-white hover:bg-[#0E7C86] transition shrink-0"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#16364A] flex items-center justify-end">
        <button
          type="button"
          onClick={() => navigate("/employee/alerts")}
          className="text-teal-400 hover:text-teal-300 text-xs font-medium flex items-center gap-1 transition"
        >
          <span>View All Alerts</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

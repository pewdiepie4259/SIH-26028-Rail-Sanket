import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Volume2,
  VolumeX,
  ShieldCheck,
} from "lucide-react";
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
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const activeAlertsCount = alerts.filter((a) => a.status !== "ACKNOWLEDGED").length;

  const handleSpeakAlert = (alert: RoleAlertItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!("speechSynthesis" in window)) return;

    if (speakingId === alert.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const statusText =
      alert.status === "ACKNOWLEDGED"
        ? "Alert acknowledged and read."
        : "Alert active, acknowledgement required.";
    const textToSpeak = `Operational Alert: ${alert.title}. Priority ${alert.severity}. Section: ${alert.trainOrSection}. Notice: ${alert.description}. ${statusText}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(alert.id);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-[#F59E0B]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Operational Alerts
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${
                activeAlertsCount > 0
                  ? "bg-amber-950/60 text-amber-300 border-amber-700/50"
                  : "bg-emerald-950/60 text-emerald-300 border-emerald-700/50"
              }`}
            >
              {activeAlertsCount > 0
                ? `${activeAlertsCount} Active`
                : "All Acknowledged ✓"}
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          {alerts.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              <CheckCircle2 size={22} className="mx-auto text-[#0E7C86] mb-1" />
              No active operational alerts.
            </div>
          ) : (
            alerts.slice(0, 3).map((alert) => {
              const isAcknowledged = alert.status === "ACKNOWLEDGED";
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
                  className={`rounded-lg border p-3 transition ${
                    isAcknowledged
                      ? "border-[#16364A]/60 bg-[#061829]/70 opacity-90"
                      : "border-[#16364A] bg-[#0A2036] hover:border-[#0E7C86]/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {!isAcknowledged && (
                        <span
                          className="h-2 w-2 rounded-full bg-[#F59E0B] animate-pulse shrink-0"
                          title="Unacknowledged Alert"
                        />
                      )}
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider shrink-0 ${badgeStyle}`}
                      >
                        {alert.severity}
                      </span>
                      {isAcknowledged && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider shrink-0 bg-emerald-950/60 text-emerald-300 border-emerald-700/50 flex items-center gap-0.5">
                          <CheckCircle2 size={10} />
                          ACKNOWLEDGED
                        </span>
                      )}
                      <h4
                        className={`text-xs font-semibold truncate ${
                          isAcknowledged ? "text-slate-300 font-normal" : "text-white"
                        }`}
                      >
                        {alert.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {"speechSynthesis" in window && (
                        <button
                          type="button"
                          onClick={(e) => handleSpeakAlert(alert, e)}
                          className="text-slate-400 hover:text-cyan-300 transition p-0.5 rounded hover:bg-[#16364A]"
                          title={
                            speakingId === alert.id
                              ? "Stop reading alert"
                              : "Read alert details aloud"
                          }
                        >
                          {speakingId === alert.id ? (
                            <VolumeX size={13} className="text-amber-400 animate-pulse" />
                          ) : (
                            <Volume2 size={13} />
                          )}
                        </button>
                      )}
                      <span className="text-[10px] text-[#71899C] font-mono">
                        {alert.timestamp}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                    {alert.description}
                  </p>

                  <div className="mt-2 pt-2 border-t border-[#16364A]/50 text-xs text-slate-300 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-teal-300 text-[11px] truncate">
                        {alert.trainOrSection}
                      </span>
                      {alert.acknowledgedAt && (
                        <span className="text-[10px] text-emerald-400/80 font-mono hidden sm:inline-block">
                          ({alert.acknowledgedAt})
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className={`text-[10px] px-2.5 py-1 rounded transition shrink-0 flex items-center gap-1 font-semibold ${
                        isAcknowledged
                          ? "bg-emerald-950/60 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900/60"
                          : "bg-[#0E5961] text-white hover:bg-[#0E7C86] shadow-sm"
                      }`}
                      title={
                        isAcknowledged
                          ? "Acknowledged & Read. Click to toggle state."
                          : "Click to acknowledge receipt & mark as read"
                      }
                    >
                      {isAcknowledged ? (
                        <>
                          <CheckCircle2 size={11} className="text-emerald-400" />
                          <span>Acknowledged ✓</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={11} />
                          <span>Acknowledge</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#16364A] flex items-center justify-between">
        <span className="text-[11px] text-[#71899C]">
          Click Acknowledge to confirm operational compliance.
        </span>
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

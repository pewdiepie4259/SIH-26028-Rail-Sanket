import { useNavigate } from "react-router-dom";
import {
  TrainFront,
  Building2,
  GitCommit,
  Radio,
  ShieldCheck,
  HeartPulse,
  Zap,
  Ticket,
  Wrench,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import type { RoleSummaryWidget } from "../../services/employeeDashboardService";

interface RoleDashboardSummaryProps {
  widgets: RoleSummaryWidget[];
}

export default function RoleDashboardSummary({ widgets }: RoleDashboardSummaryProps) {
  const navigate = useNavigate();

  const getIcon = (type: RoleSummaryWidget["iconType"]) => {
    switch (type) {
      case "train":
        return <TrainFront size={16} className="text-teal-400" />;
      case "station":
        return <Building2 size={16} className="text-teal-400" />;
      case "track":
        return <GitCommit size={16} className="text-teal-400" />;
      case "signal":
        return <Radio size={16} className="text-teal-400" />;
      case "shield":
        return <ShieldCheck size={16} className="text-teal-400" />;
      case "heart":
        return <HeartPulse size={16} className="text-rose-400" />;
      case "zap":
        return <Zap size={16} className="text-amber-400" />;
      case "ticket":
        return <Ticket size={16} className="text-teal-400" />;
      case "wrench":
        return <Wrench size={16} className="text-teal-400" />;
      case "check":
      default:
        return <CheckCircle2 size={16} className="text-emerald-400" />;
    }
  };

  const getBadgeStyle = (color?: string) => {
    switch (color) {
      case "amber":
        return "bg-amber-950/60 text-amber-300 border-amber-700/50";
      case "rose":
        return "bg-rose-950/60 text-rose-300 border-rose-700/50";
      case "blue":
        return "bg-blue-950/60 text-blue-300 border-blue-700/50";
      case "emerald":
        return "bg-emerald-950/60 text-emerald-300 border-emerald-700/50";
      case "teal":
      default:
        return "bg-teal-950/60 text-teal-300 border-teal-700/50";
    }
  };

  const getWidgetRoute = (widget: RoleSummaryWidget): string => {
    const titleLower = widget.title.toLowerCase();
    if (titleLower.includes("alert") || titleLower.includes("fault") || titleLower.includes("caution") || widget.iconType === "zap" || widget.iconType === "shield") {
      return "/employee/alerts";
    }
    return "/employee/assignment";
  };

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {widgets.map((widget, idx) => {
        const route = getWidgetRoute(widget);
        return (
          <button
            key={idx}
            type="button"
            onClick={() => navigate(route)}
            className="rounded-xl border border-[#16364A] bg-[#071A33] p-4.5 shadow-sm transition text-left hover:border-[#0E7C86] hover:bg-[#0A2036] hover:shadow-md cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium text-slate-400 truncate pr-1 group-hover:text-slate-200 transition">
                  {widget.title}
                </span>
                <div className="group-hover:scale-110 transition-transform">
                  {getIcon(widget.iconType)}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="text-lg sm:text-xl font-bold font-mono text-white truncate group-hover:text-cyan-200 transition">
                  {widget.value}
                </div>
                {widget.statusBadge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${getBadgeStyle(
                      widget.statusBadge.color
                    )}`}
                  >
                    {widget.statusBadge.text}
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-400 mt-1 truncate group-hover:text-slate-300 transition">
                {widget.subtitle}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-[#16364A]/50 flex items-center justify-between text-[10px] text-teal-400 group-hover:text-cyan-300 transition">
              <span>View details</span>
              <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        );
      })}
    </section>
  );
}


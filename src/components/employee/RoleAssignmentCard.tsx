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
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import type { RoleAssignmentInfo } from "../../services/employeeDashboardService";
import type { EmployeeRoleConfig } from "../../config/employeeRoles";

interface RoleAssignmentCardProps {
  assignment: RoleAssignmentInfo;
  roleConfig: EmployeeRoleConfig;
}

export default function RoleAssignmentCard({
  assignment,
  roleConfig,
}: RoleAssignmentCardProps) {
  const navigate = useNavigate();

  const getHeaderIcon = () => {
    switch (roleConfig.assignmentType) {
      case "Train":
        return <TrainFront size={18} className="text-teal-400" />;
      case "Station":
      case "Facility":
        return <Building2 size={18} className="text-teal-400" />;
      case "Section":
        return <GitCommit size={18} className="text-teal-400" />;
      case "Security":
        return <ShieldCheck size={18} className="text-teal-400" />;
      case "Medical":
        return <HeartPulse size={18} className="text-rose-400" />;
      case "OHE":
        return <Zap size={18} className="text-amber-400" />;
      case "Counter":
        return <Ticket size={18} className="text-teal-400" />;
      default:
        return <Radio size={18} className="text-teal-400" />;
    }
  };

  return (
    <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 flex flex-col justify-between shadow-sm">
      <div>
        <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-4">
          <div className="flex items-center gap-2">
            {getHeaderIcon()}
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              {assignment.title}
            </h3>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              assignment.isAvailable
                ? "bg-blue-950/60 text-blue-300 border-blue-700/50"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            <Radio size={12} className={assignment.isAvailable ? "text-blue-400" : "text-slate-400"} />
            {assignment.badge}
          </span>
        </div>

        <div className="mb-4">
          <div className="text-base font-bold text-white flex items-center gap-2">
            <span>{assignment.statusText}</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Assignment Scope: <span className="text-teal-300 font-medium">{roleConfig.assignmentType}</span>
          </div>
        </div>

        {!assignment.isAvailable ? (
          <div className="bg-[#0A2036] p-4 rounded-lg border border-[#16364A] text-center space-y-2">
            <AlertCircle size={24} className="mx-auto text-amber-400" />
            <div className="text-xs font-semibold text-white">Assignment not available</div>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              No active operational target is currently linked to your profile. Please check with your supervisor.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
            {assignment.details.map((item, idx) => (
              <div
                key={idx}
                className={`bg-[#0A2036] p-2.5 rounded-lg border border-[#16364A] ${
                  item.highlight ? "sm:col-span-2 lg:col-span-3 border-teal-500/30" : ""
                }`}
              >
                <div className="text-slate-400 text-[10px] uppercase tracking-wider">
                  {item.label}
                </div>
                <div
                  className={`mt-0.5 truncate ${
                    item.mono ? "font-mono" : ""
                  } ${
                    item.highlight
                      ? "text-sm font-bold text-teal-300"
                      : "font-semibold text-white"
                  }`}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#16364A] flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          Target Scope: <span className="text-slate-300 font-medium">{roleConfig.department}</span>
        </span>
        <button
          type="button"
          onClick={() => navigate(assignment.actionRoute || "/employee/assignment")}
          className="text-teal-400 hover:text-teal-300 text-xs font-medium flex items-center gap-1 transition"
        >
          <span>{assignment.actionLabel || "View Assignment"}</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

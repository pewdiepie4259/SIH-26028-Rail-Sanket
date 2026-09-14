import { useNavigate } from "react-router-dom";
import { CalendarCheck, MapPin, ChevronRight, Clock, Shield } from "lucide-react";
import type { RoleDutyInfo } from "../../services/employeeDashboardService";
import type { EmployeeRoleConfig } from "../../config/employeeRoles";

interface RoleDutyCardProps {
  duty: RoleDutyInfo;
  roleConfig: EmployeeRoleConfig;
}

export default function RoleDutyCard({ duty, roleConfig }: RoleDutyCardProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 flex flex-col justify-between shadow-sm">
      <div>
        <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <CalendarCheck size={18} className="text-teal-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Today's Duty
            </h3>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              duty.dutyStatus === "ON DUTY"
                ? "bg-teal-950/60 text-teal-300 border-teal-700/50"
                : "bg-amber-950/60 text-amber-300 border-amber-700/50"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                duty.dutyStatus === "ON DUTY" ? "bg-teal-400" : "bg-amber-400"
              }`}
            />
            {duty.dutyStatus}
          </span>
        </div>

        <div className="mb-4">
          <div className="text-base font-bold text-white flex items-center justify-between">
            <span>{duty.dutyType}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#0A2036] text-teal-300 border border-[#16364A]">
              {roleConfig.displayName}
            </span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
            <MapPin size={13} className="text-teal-400 shrink-0" />
            <span className="truncate">{duty.location}</span>
            {duty.stationCode && (
              <span className="font-mono text-teal-300">({duty.stationCode})</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-[#0A2036] p-3 rounded-lg border border-[#16364A]">
            <div className="text-slate-400 text-[11px] flex items-center gap-1">
              <Clock size={12} className="text-slate-400" />
              <span>Shift Window</span>
            </div>
            <div className="font-semibold text-white mt-1">{duty.shift}</div>
          </div>

          <div className="bg-[#0A2036] p-3 rounded-lg border border-[#16364A]">
            <div className="text-slate-400 text-[11px] flex items-center gap-1">
              <Clock size={12} className="text-teal-400" />
              <span>Reporting Time</span>
            </div>
            <div className="font-semibold text-teal-300 mt-1">{duty.reportingTime}</div>
          </div>

          <div className="bg-[#0A2036] p-3 rounded-lg border border-[#16364A] sm:col-span-2">
            <div className="text-slate-400 text-[11px] flex items-center gap-1">
              <Shield size={12} className="text-[#0E7C86]" />
              <span>Primary Responsibility</span>
            </div>
            <div className="font-medium text-slate-200 mt-1 leading-relaxed">
              {duty.responsibility}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#16364A] flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          Supervised by: <span className="text-slate-300 font-medium">{duty.supervisorName}</span>
        </span>
        <button
          type="button"
          onClick={() => navigate("/employee/duty")}
          className="text-teal-400 hover:text-teal-300 text-xs font-medium flex items-center gap-1 transition"
        >
          <span>View Full Roster</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import {
  Zap,
  ChevronRight,
  Building2,
  CircleDot,
  Clock,
  AlertTriangle,
  CheckSquare,
  CalendarCheck,
  Activity,
  ShieldAlert,
  Flame,
  TrainFront,
  Compass,
  Gauge,
  Radio,
  FileWarning,
  Users,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import type { EmployeeRoleConfig } from "../../config/employeeRoles";
import {
  getRoleQuickActionsViewData,
  type QuickActionItem,
} from "../../services/employeeQuickActionsService";
import { getCurrentUser } from "../../services/auth";

interface RoleQuickActionsProps {
  roleConfig?: EmployeeRoleConfig;
  onShowToast?: (message: string) => void;
}

export default function RoleQuickActions({
  roleConfig: propConfig,
  onShowToast,
}: RoleQuickActionsProps) {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const viewData = getRoleQuickActionsViewData(currentUser);
  const activeConfig = propConfig || viewData.roleConfig;
  const actions: QuickActionItem[] = viewData.roleActions || [];

  if (actions.length === 0) return null;

  // Helper to map icon string name to Lucide component
  const renderIcon = (iconName: string, isPrimary?: boolean) => {
    const props = {
      size: 16,
      className: isPrimary
        ? "text-[#F59E0B] shrink-0"
        : "text-[#0E7C86] group-hover:text-cyan-300 transition shrink-0",
    };

    switch (iconName) {
      case "Building2":
        return <Building2 {...props} />;
      case "CircleDot":
        return <CircleDot {...props} />;
      case "Clock":
        return <Clock {...props} />;
      case "AlertTriangle":
        return <AlertTriangle {...props} />;
      case "CheckSquare":
        return <CheckSquare {...props} />;
      case "CalendarCheck":
        return <CalendarCheck {...props} />;
      case "Activity":
        return <Activity {...props} />;
      case "ShieldAlert":
        return <ShieldAlert {...props} />;
      case "Flame":
        return <Flame {...props} />;
      case "TrainFront":
        return <TrainFront {...props} />;
      case "Compass":
        return <Compass {...props} />;
      case "Gauge":
        return <Gauge {...props} />;
      case "Radio":
        return <Radio {...props} />;
      case "FileWarning":
        return <FileWarning {...props} />;
      case "Users":
        return <Users {...props} />;
      case "UserCheck":
        return <UserCheck {...props} />;
      case "ShieldCheck":
        return <ShieldCheck {...props} />;
      default:
        return <Zap {...props} />;
    }
  };

  return (
    <section className="rounded-xl border border-[#16364A] bg-[#071A33] p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-[#F59E0B]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Role Quick Actions ({activeConfig.displayName})
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#71899C] uppercase">
          {actions.length} Shortcuts
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => {
              if (onShowToast) onShowToast(`Navigating to ${action.label}...`);
              navigate(action.route);
            }}
            className={`flex flex-col justify-between p-3 rounded-lg border text-left transition cursor-pointer group ${

              action.isPrimary
                ? "border-[#0E7C86]/50 bg-gradient-to-b from-[#0A2036] to-[#071A33] hover:border-[#0E7C86] hover:bg-[#0E5961]/20 shadow-sm"
                : "border-[#16364A] bg-[#0A2036] hover:border-[#0E7C86] hover:bg-[#0E5961]/15"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <div className="h-7 w-7 rounded-md bg-[#071A33] border border-[#16364A] flex items-center justify-center">
                {renderIcon(action.iconName, action.isPrimary)}
              </div>
              <ChevronRight
                size={14}
                className="text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition shrink-0"
              />
            </div>

            <div>
              <div className="text-xs font-bold text-slate-100 group-hover:text-white truncate">
                {action.label}
              </div>
              <p className="text-[10px] text-slate-400 group-hover:text-slate-300 mt-0.5 line-clamp-1">
                {action.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

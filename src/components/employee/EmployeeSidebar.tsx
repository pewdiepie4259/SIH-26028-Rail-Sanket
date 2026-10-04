import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  TrainFront,
  AlertTriangle,
  CheckSquare,
  FileWarning,
  Flame,
  Bell,
  History,
  User,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  CircleDot,
  Mail,
  Lock,
  PhoneCall,
  Radio,
} from "lucide-react";
import type { EmployeeNavItem } from "../../services/employee";

export interface EmployeeSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  activeTab?: string;
  departmentName?: string;
  roleDisplayTitle?: string;
  badges?: {
    alerts?: number;
    tasks?: number;
    notifications?: number;
  };
  onShowToast?: (message: string) => void;
}

export default function EmployeeSidebar({
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  activeTab,
  departmentName = "Indian Railways Operations",
  roleDisplayTitle = "Operational Employee",
  badges,
  onShowToast,
}: EmployeeSidebarProps) {
  const location = useLocation();

  const navItems: EmployeeNavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/employee/dashboard", active: true },
    { id: "duty", label: "My Duty", icon: CalendarCheck, path: "/employee/duty", active: true },
    { id: "assignment", label: "My Train / My Section", icon: TrainFront, path: "/employee/assignment", active: true },
    { id: "alerts", label: "Operational Alerts", icon: AlertTriangle, path: "/employee/alerts", active: true, badge: badges?.alerts },
    { id: "tasks", label: "Tasks", icon: CheckSquare, path: "/employee/tasks", active: true, badge: badges?.tasks },
    { id: "report_issue", label: "Report Issue", icon: FileWarning, path: "/employee/report", active: true },
    { id: "mail", label: "Official Mail & Directives", icon: Mail, path: "/employee/mail", active: true },
    { id: "incident", label: "Incident Reporting", icon: Flame, path: "/employee/incidents", active: true },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/employee/notifications", active: true, badge: badges?.notifications },
    { id: "history", label: "Activity / History", icon: History, path: "/employee/history", active: true },
    { id: "profile", label: "Profile", icon: User, path: "/employee/profile", active: true },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Sidebar Aside */}
      <aside
        className={`fixed lg:sticky top-[72px] z-50 h-[calc(100vh-72px)] bg-[#071A33] border-r border-[#16364A] flex flex-col transition-all duration-300 shrink-0 ${
          sidebarOpen ? "left-0 w-64 shadow-2xl" : "-left-64 lg:left-0"
        } ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#16364A]/60">
          <div className={`flex items-center gap-2 ${sidebarCollapsed ? "lg:hidden" : ""}`}>
            <ShieldCheck size={18} className="text-[#0E7C86]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Operational Modules
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
            aria-label="Close navigation sidebar"
          >
            <X size={20} />
          </button>

          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded border border-[#16364A] text-slate-400 hover:text-white hover:bg-[#0A2036]"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isCurrent = Boolean(
              (item.path && location.pathname === item.path) ||
              (activeTab && item.id === activeTab)
            );

            if (!item.active || !item.path) {
              return (
                <div key={item.id} className="relative group">
                  <button
                    type="button"
                    disabled
                    onClick={() => {
                      if (onShowToast) onShowToast(`"${item.label}" will be unlocked in ${item.phase || "upcoming phase"}`);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition text-left text-slate-500 hover:bg-[#0A2036]/50 cursor-not-allowed opacity-80 ${
                      sidebarCollapsed ? "justify-center px-2" : ""
                    }`}
                  >
                    <Icon size={18} className="text-slate-500" />
                    {!sidebarCollapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="truncate">{item.label}</span>
                        {item.phase && (
                          <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1 font-mono">
                            <Lock size={9} />
                            {item.phase}
                          </span>
                        )}
                      </div>
                    )}
                  </button>

                  {sidebarCollapsed && (
                    <div className="hidden lg:group-hover:block absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#031426] border border-[#16364A] text-white text-xs rounded shadow-lg whitespace-nowrap z-50">
                      {item.label} ({item.phase || "Locked"})
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={item.id} className="relative group">
                <Link
                  to={item.path}
                  onClick={() => {
                    setSidebarOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition text-left ${
                    isCurrent
                      ? "bg-gradient-to-r from-[#0E7C86] to-[#0A2036] text-white border-l-4 border-[#F59E0B] shadow-sm"
                      : "text-slate-300 hover:bg-[#0A2036] hover:text-white"
                  } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                >
                  <Icon
                    size={18}
                    className={
                      isCurrent
                        ? "text-[#F59E0B]"
                        : "text-slate-300 group-hover:text-cyan-300"
                    }
                  />

                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="truncate">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 rounded-full bg-[#EF4444] text-[10px] font-bold text-white shadow-xs">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>

                {sidebarCollapsed && (
                  <div className="hidden lg:group-hover:block absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#031426] border border-[#16364A] text-white text-xs rounded shadow-lg whitespace-nowrap z-50">
                    {item.label}
                    {item.badge !== undefined && item.badge > 0 && ` (${item.badge})`}
                  </div>
                )}
              </div>
            );
          })}

          {/* QUICK OPERATIONAL HOTLINES (Eliminates dead empty space) */}
          {!sidebarCollapsed && (
            <div className="mt-4 pt-3 border-t border-[#16364A]/60 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Emergency & Comms
              </div>
              <div className="bg-[#051528] rounded-lg p-2.5 border border-[#16364A]/60 space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <PhoneCall size={12} className="text-red-400" />
                    <span>RPF / Security</span>
                  </span>
                  <span className="font-mono font-bold text-red-300 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-800/40">
                    139 / 182
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Radio size={12} className="text-amber-400" />
                    <span>VHF Channel</span>
                  </span>
                  <span className="font-mono font-bold text-amber-300">
                    CH-14 (150.15)
                  </span>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#16364A]/80 bg-[#040E1B] shrink-0">
          {!sidebarCollapsed ? (
            <div className="rounded-xl border border-[#164B5A] bg-[#071A33]/90 p-3 shadow-md space-y-2.5">
              {/* Department & Connection Status Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-6 w-6 rounded-lg bg-[#0E7C86]/20 border border-[#0E7C86]/40 flex items-center justify-center shrink-0 text-teal-300">
                    <Building2 size={13} />
                  </div>
                  <span className="text-xs font-semibold text-white truncate" title={departmentName}>
                    {departmentName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 shadow-xs">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                  </span>
                  <span className="text-[9px] font-bold text-emerald-400 tracking-wider uppercase">
                    Live
                  </span>
                </div>
              </div>

              {/* Role & System Telemetry */}
              <div className="bg-[#051528] rounded-lg p-2 border border-[#16364A]/60 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-[10px] text-slate-400 font-medium">Role</span>
                  <span className="font-semibold text-teal-300 truncate max-w-[130px]" title={roleDisplayTitle}>
                    {roleDisplayTitle}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400 text-[10px] pt-1 border-t border-white/5">
                  <span>Network</span>
                  <span className="text-slate-200 font-mono font-medium">IR-Central Grid</span>
                </div>
              </div>

              {/* Bottom Organization & System Badge */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                <span className="flex items-center gap-1 text-slate-300 font-medium">
                  <ShieldCheck size={11} className="text-teal-400" />
                  Indian Railways
                </span>
                <span className="text-[9px] font-mono text-teal-400/80 font-medium">IRMS Telemetry</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <div
                className="relative h-8 w-8 rounded-lg bg-[#071A33] border border-[#164B5A] flex items-center justify-center text-teal-400 shadow-sm"
                title={`${departmentName} • ${roleDisplayTitle} (Live Connected)`}
              >
                <Building2 size={15} />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

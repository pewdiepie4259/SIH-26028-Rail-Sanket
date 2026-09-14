import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  LogOut,
  Clock,
  MapPin,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Radio,
  CheckCircle2,
  Building2,
  CircleDot,
  CheckCheck,
  Lock,
  Search,
  AlertOctagon,
  Info,
  ShieldAlert,
  Compass,
  UserCircle,
} from "lucide-react";
import { logout } from "../../services/auth";
import {
  employeeOperationalAlerts,
  roleAlertScopes,
  type EmployeeAlertRole,
  type EmployeeOperationalAlert,
  type EmployeeNavItem,
} from "../../services/employee";

export default function EmployeeAlerts() {
  const navigate = useNavigate();

  // State Setup
  const [is24Hour, setIs24Hour] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Role-Based Filtering State (Default: station_master)
  const [selectedRole, setSelectedRole] = useState<EmployeeAlertRole>("station_master");

  // Local Alerts State (enables acknowledge action)
  const [alertsState, setAlertsState] = useState<Record<EmployeeAlertRole, EmployeeOperationalAlert[]>>(
    employeeOperationalAlerts
  );

  // Filter & Search States
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");


  // Live IST Clock (Frontend display only)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatIST = (date: Date, use24: boolean) => {
    return date.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: !use24,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/employee/login", { replace: true });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentScope = roleAlertScopes[selectedRole];

  // Acknowledge alert toggle
  const handleToggleAcknowledge = (alertId: string) => {
    setAlertsState((prev) => {
      const updatedList = prev[selectedRole].map((item) => {
        if (item.id === alertId) {
          const nextStatus = item.status === "ACTIVE" ? "ACKNOWLEDGED" : "ACTIVE";
          showToast(`Alert "${item.title}" marked as ${nextStatus.toLowerCase()}`);
          return { ...item, status: nextStatus as "ACTIVE" | "ACKNOWLEDGED" };
        }
        return item;
      });
      return { ...prev, [selectedRole]: updatedList };
    });
  };

  // Filtered alerts for current role
  const roleAlerts = alertsState[selectedRole] || [];

  const filteredAlerts = useMemo(() => {
    return roleAlerts.filter((alert) => {
      // Priority filter
      if (priorityFilter !== "ALL" && alert.priority !== priorityFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== "ALL" && alert.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = alert.title.toLowerCase().includes(query);
        const matchesCategory = alert.category.toLowerCase().includes(query);
        const matchesLocation = alert.location.toLowerCase().includes(query);
        const matchesDesc = alert.description.toLowerCase().includes(query);
        const matchesSection = alert.section?.toLowerCase().includes(query);
        const matchesTrain = alert.train?.toLowerCase().includes(query);
        return matchesTitle || matchesCategory || matchesLocation || matchesDesc || matchesSection || matchesTrain;
      }
      return true;
    });
  }, [roleAlerts, priorityFilter, statusFilter, searchQuery]);

  // Dynamic Summary Metrics (calculated from role alerts)
  const activeAlertsCount = roleAlerts.filter((a) => a.status === "ACTIVE").length;
  const criticalCount = roleAlerts.filter((a) => a.priority === "CRITICAL" && a.status === "ACTIVE").length;
  const highPriorityCount = roleAlerts.filter((a) => a.priority === "HIGH" && a.status === "ACTIVE").length;
  const mediumCount = roleAlerts.filter((a) => a.priority === "MEDIUM" && a.status === "ACTIVE").length;

  // Sidebar navigation menu items
  const navItems: EmployeeNavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/employee/dashboard", active: true },
    { id: "duty", label: "My Duty", icon: CalendarCheck, path: "/employee/duty", active: true },
    { id: "assignment", label: "My Train / My Section", icon: TrainFront, path: "/employee/assignment", active: true },
    { id: "alerts", label: "Operational Alerts", icon: AlertTriangle, path: "/employee/alerts", active: true, badge: activeAlertsCount },
    { id: "tasks", label: "Tasks", icon: CheckSquare, path: "/employee/tasks", active: true },
    { id: "report_issue", label: "Report Issue", icon: FileWarning, path: "/employee/report", active: true },
    { id: "incident", label: "Incident Reporting", icon: Flame, path: "/employee/incidents", active: true },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/employee/notifications", active: true },
    { id: "history", label: "Activity / History", icon: History, path: "/employee/history", active: true },
    { id: "profile", label: "Profile", icon: User, path: "/employee/profile", active: true },
  ];

  return (
    <div className="min-h-screen bg-[#031426] text-slate-100 flex flex-col font-sans selection:bg-[#F59E0B]/30 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0E7C86] text-white px-4 py-3 rounded-lg shadow-xl border border-cyan-400/30 animate-bounce">
          <CheckCheck size={18} className="text-cyan-200" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 flex h-[72px] shrink-0 items-center justify-between border-b border-[#16364A] bg-[#071A33]/95 backdrop-blur-md px-4 sm:px-6">
        {/* Left Branding & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#F59E0B] bg-[#0A2036] text-white transition hover:bg-[#0E5961] lg:hidden"
            aria-label="Open Navigation Menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[#294665] bg-[#071A33] shadow-md">
              <img
                src="/logos/raildrishti-dark.png"
                alt="RailDrishti"
                className="h-full w-full object-contain p-0.5"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-white">
                  Rail<span className="text-[#F59E0B]">Drishti</span>
                </span>
                <span className="rounded bg-[#0E7C86]/30 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-300 border border-[#0E7C86]/50">
                  Employee Portal
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Operational Alerts Panel
              </h1>
            </div>
          </div>
        </div>

        {/* Right Header Status, IST Clock, Profile & Logout */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Live IST Clock */}
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-[#16364A] bg-[#0A2036] px-3 py-1.5 text-xs text-slate-200">
            <Clock size={15} className="text-[#F59E0B]" />
            <div className="font-mono font-semibold tracking-wider text-white">
              {formatIST(currentTime, is24Hour)} <span className="text-[#71899C] text-[10px]">IST</span>
            </div>
            <button
              type="button"
              onClick={() => setIs24Hour(!is24Hour)}
              className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-[#16364A] text-slate-300 hover:text-white transition"
              title="Toggle 12H / 24H clock"
            >
              {is24Hour ? "24H" : "12H"}
            </button>
          </div>

          {/* Security */}
          <div className="hidden items-center gap-2 border-l border-[#16364A] pl-3 sm:flex">
            <ShieldCheck size={18} className="text-[#0E7C86]" />

            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-white">
                Authorized Employee
              </div>
              <div className="text-[10px] text-[#71899C]">
                Secure Session
              </div>
            </div>

            <UserCircle size={24} className="text-[#AFC0D4]" />
          </div>

          {/* Secure Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-950/30 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-900/50 hover:text-red-100 hover:border-red-500/50"
            title="Logout from Employee Portal"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER WITH SIDEBAR & CONTENT */}
      <div className="flex flex-1 min-w-0">
        {/* SIDEBAR NAVIGATION */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed lg:sticky top-[72px] z-50 h-[calc(100vh-72px)] bg-[#071A33] border-r border-[#16364A] flex flex-col transition-all duration-300 ${
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
              const isCurrent = item.id === "alerts";
              return (
                <div key={item.id} className="relative group">
                  <button
                    type="button"
                    disabled={!item.active}
                    onClick={() => {
                      if (item.path) {
                        navigate(item.path);
                      } else {
                        showToast(`"${item.label}" will be unlocked in ${item.phase}`);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition text-left ${
                      isCurrent
                        ? "bg-gradient-to-r from-[#0E7C86] to-[#0A2036] text-white border-l-4 border-[#F59E0B] shadow-sm"
                        : item.active
                        ? "text-slate-300 hover:bg-[#0A2036] hover:text-white"
                        : "text-slate-500 hover:bg-[#0A2036]/50 cursor-not-allowed opacity-80"
                    } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                  >
                    <Icon
                      size={18}
                      className={
                        isCurrent
                          ? "text-[#F59E0B]"
                          : item.active
                          ? "text-slate-300"
                          : "text-slate-500"
                      }
                    />

                    {!sidebarCollapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="truncate">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="ml-2 px-1.5 py-0.5 rounded-full bg-[#EF4444] text-[10px] font-bold text-white">
                            {item.badge}
                          </span>
                        )}
                        {!item.active && item.phase && (
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
                      {item.label} {!item.active && `(${item.phase})`}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-[#16364A]/60 bg-[#051326]">
            {!sidebarCollapsed ? (
              <div className="text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Building2 size={13} className="text-[#0E7C86]" />
                  <span>{currentScope.scopeLocation}</span>
                </div>
                <div className="text-[10px] text-[#71899C]">Responsibility-Filtered Alerts</div>
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-[#16364A]/40">
                  <span>Scope Mode</span>
                  <span className="text-amber-400 font-semibold uppercase">{currentScope.label}</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center text-amber-400" title="Active Alerts View">
                <CircleDot size={14} />
              </div>
            )}
          </div>
        </aside>

        {/* MAIN ALERTS CONTENT */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ============================================================ */}
          {/* 3. PAGE HEADER & ROLE FILTER CONTROLS                        */}
          {/* ============================================================ */}
          <section className="rounded-xl border border-[#16364A] bg-gradient-to-r from-[#071A33] via-[#0A223D] to-[#071A33] p-5 sm:p-6 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider">
                    <Radio size={12} className="text-amber-400 animate-pulse" />
                    Responsibility-Filtered
                  </span>
                  <span className="rounded bg-[#16364A] px-2 py-0.5 text-[10px] font-semibold text-[#AFC0D4] border border-slate-700">
                    Demo Operational Data
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <AlertTriangle size={26} className="text-[#F59E0B]" />
                  OPERATIONAL ALERTS
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Alerts relevant to your current operational responsibility.
                </p>
              </div>

              {/* ROLE TOGGLE SELECTOR (DEVELOPMENT & DEMO) */}
              <div className="bg-[#031426]/90 p-1.5 rounded-xl border border-[#16364A] flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole("station_master");
                    showToast("Switched to Station Master alerts");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedRole === "station_master"
                      ? "bg-gradient-to-r from-[#0E7C86] to-[#0A2036] text-white border border-cyan-400/50 shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-[#0A2036]"
                  }`}
                >
                  <Building2 size={13} className={selectedRole === "station_master" ? "text-[#F59E0B]" : ""} />
                  <span>Station Master</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole("loco_pilot");
                    showToast("Switched to Loco Pilot alerts");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedRole === "loco_pilot"
                      ? "bg-gradient-to-r from-[#0E7C86] to-[#0A2036] text-white border border-cyan-400/50 shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-[#0A2036]"
                  }`}
                >
                  <TrainFront size={13} className={selectedRole === "loco_pilot" ? "text-[#F59E0B]" : ""} />
                  <span>Loco Pilot</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole("track_maintainer");
                    showToast("Switched to Track Maintainer alerts");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedRole === "track_maintainer"
                      ? "bg-gradient-to-r from-[#0E7C86] to-[#0A2036] text-white border border-cyan-400/50 shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-[#0A2036]"
                  }`}
                >
                  <Compass size={13} className={selectedRole === "track_maintainer" ? "text-[#F59E0B]" : ""} />
                  <span>Track Maintainer</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole("rpf");
                    showToast("Switched to RPF Security alerts");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedRole === "rpf"
                      ? "bg-gradient-to-r from-[#0E7C86] to-[#0A2036] text-white border border-cyan-400/50 shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-[#0A2036]"
                  }`}
                >
                  <ShieldAlert size={13} className={selectedRole === "rpf" ? "text-[#F59E0B]" : ""} />
                  <span>RPF</span>
                </button>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* 13. DYNAMIC ALERT SUMMARY CARDS                             */}
          {/* ============================================================ */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-4.5 hover:border-[#0E7C86] transition shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#AFC0D4]">
                  Active Alerts
                </span>
                <AlertTriangle size={18} className="text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">
                {activeAlertsCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Requiring operational attention
              </div>
            </div>

            <div className="rounded-xl border border-red-500/40 bg-red-950/20 p-4.5 hover:border-red-500/70 transition shadow-sm">
              <div className="flex items-center justify-between text-red-300 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Critical
                </span>
                <AlertOctagon size={18} className="text-red-400" />
              </div>
              <div className="text-2xl font-extrabold text-red-400 font-mono">
                {criticalCount}
              </div>
              <div className="text-[11px] text-red-300/80 mt-1">
                Immediate action required
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4.5 hover:border-amber-500/70 transition shadow-sm">
              <div className="flex items-center justify-between text-amber-300 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  High Priority
                </span>
                <AlertTriangle size={18} className="text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold text-amber-400 font-mono">
                {highPriorityCount}
              </div>
              <div className="text-[11px] text-amber-300/80 mt-1">
                Elevated caution advisory
              </div>
            </div>

            <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-4.5 hover:border-[#0E7C86] transition shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#AFC0D4]">
                  Information / Medium
                </span>
                <Info size={18} className="text-cyan-400" />
              </div>
              <div className="text-2xl font-extrabold text-cyan-300 font-mono">
                {mediumCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Routine operational notices
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* 15. RESPONSIBILITY SCOPE BANNER                             */}
          {/* ============================================================ */}
          <section className="rounded-xl border border-[#0E7C86]/60 bg-gradient-to-r from-[#071A33] via-[#0A223D] to-[#041527] p-4.5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#0E7C86]/20 border border-[#0E7C86]/50 flex items-center justify-center text-cyan-300 shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest">
                  YOUR OPERATIONAL SCOPE
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{currentScope.scopeTitle}</span>
                  <span className="text-slate-400 font-normal">• {currentScope.scopeLocation}</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">{currentScope.scopeDescription}</p>
              </div>
            </div>

            <div className="text-xs text-right hidden lg:block shrink-0">
              <span className="text-[10px] text-slate-400">Total Filtered:</span>
              <span className="ml-1 text-sm font-bold text-[#F59E0B] font-mono">{filteredAlerts.length} Alerts</span>
            </div>
          </section>

          {/* ============================================================ */}
          {/* 11. FILTERS & 12. SEARCH BAR                                 */}
          {/* ============================================================ */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#071A33] p-3.5 rounded-xl border border-[#16364A]">
            {/* Priority Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
              {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriorityFilter(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                    priorityFilter === p
                      ? "bg-[#0E7C86] text-white shadow-sm font-bold"
                      : "bg-[#0A2036] text-slate-300 hover:text-white hover:bg-[#16364A]"
                  }`}
                >
                  {p === "ALL" ? "All Priorities" : p}
                </button>
              ))}
            </div>

            {/* Status Filter & Search Input */}
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0A2036] border border-[#16364A] text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-400"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="ACKNOWLEDGED">Acknowledged</option>
              </select>

              <div className="relative flex-1 sm:w-60">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0A2036] border border-[#16364A] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 9. ALERT CARDS (2-COLUMN RESPONSIVE GRID) & 14. EMPTY STATE  */}
          {/* ============================================================ */}
          {filteredAlerts.length === 0 ? (
            /* 14. ROLE-SPECIFIC EMPTY STATE */
            <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-12 text-center shadow-sm">
              <div className="h-14 w-14 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-3">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-white">NO ACTIVE OPERATIONAL ALERTS</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                No alerts currently require your attention for this filter criteria in your assigned scope.
              </p>
              {(priorityFilter !== "ALL" || statusFilter !== "ALL" || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setPriorityFilter("ALL");
                    setStatusFilter("ALL");
                    setSearchQuery("");
                  }}
                  className="mt-4 px-3.5 py-1.5 rounded-lg bg-[#0E7C86] text-white text-xs font-semibold hover:bg-cyan-600 transition"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAlerts.map((alert) => (
                <EmployeeAlertCard
                  key={alert.id}
                  alert={alert}
                  onToggleAcknowledge={handleToggleAcknowledge}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/**
 * 9. Reusable EmployeeAlertCard Component
 */
interface EmployeeAlertCardProps {
  alert: EmployeeOperationalAlert;
  onToggleAcknowledge: (id: string) => void;
}

function EmployeeAlertCard({ alert, onToggleAcknowledge }: EmployeeAlertCardProps) {
  const isCritical = alert.priority === "CRITICAL";
  const isHigh = alert.priority === "HIGH";
  const isMedium = alert.priority === "MEDIUM";
  const isAcknowledged = alert.status === "ACKNOWLEDGED";

  const priorityConfig = isCritical
    ? {
        badge: "bg-red-950/90 text-red-300 border-red-500/60",
        border: "border-red-500/50 hover:border-red-500",
        icon: AlertOctagon,
        iconColor: "text-red-400",
        label: "CRITICAL",
      }
    : isHigh
    ? {
        badge: "bg-amber-950/90 text-amber-300 border-amber-500/60",
        border: "border-amber-500/40 hover:border-amber-500",
        icon: AlertTriangle,
        iconColor: "text-amber-400",
        label: "HIGH PRIORITY",
      }
    : isMedium
    ? {
        badge: "bg-yellow-950/80 text-yellow-300 border-yellow-500/50",
        border: "border-[#16364A] hover:border-yellow-500/50",
        icon: Clock,
        iconColor: "text-yellow-400",
        label: "MEDIUM PRIORITY",
      }
    : {
        badge: "bg-blue-950/80 text-blue-300 border-blue-500/50",
        border: "border-[#16364A] hover:border-blue-500/50",
        icon: Info,
        iconColor: "text-blue-400",
        label: "INFORMATION",
      };

  const IconComponent = priorityConfig.icon;

  return (
    <div
      className={`rounded-xl border bg-[#071A33] p-5 transition shadow-sm flex flex-col justify-between ${
        priorityConfig.border
      } ${isAcknowledged ? "opacity-75 bg-[#051424]" : ""}`}
    >
      <div>
        {/* Top Priority Badge & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider ${priorityConfig.badge}`}
          >
            <IconComponent size={12} className={priorityConfig.iconColor} />
            <span>{priorityConfig.label}</span>
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#71899C] font-mono">{alert.timestamp}</span>
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                alert.status === "ACTIVE"
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              {alert.status}
            </span>
          </div>
        </div>

        {/* Alert Title */}
        <h3 className="text-base font-bold text-white leading-snug tracking-tight">
          {alert.title}
        </h3>

        {/* Category & Location Badges */}
        <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
          <span className="px-2 py-0.5 rounded bg-[#0A2036] text-cyan-300 border border-[#16364A] text-[11px] font-medium">
            {alert.category}
          </span>

          <span className="text-slate-300 text-[11px] flex items-center gap-1">
            <MapPin size={12} className="text-[#0E7C86]" />
            <span>{alert.location}</span>
          </span>

          {alert.section && (
            <span className="text-slate-400 text-[10px] font-mono">
              [Sec: {alert.section}]
            </span>
          )}

          {alert.train && (
            <span className="text-[#F59E0B] text-[11px] font-mono font-semibold">
              {alert.train}
            </span>
          )}

          {alert.delay && (
            <span className="text-amber-400 text-[11px] font-mono font-bold">
              ({alert.delay})
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
          {alert.description}
        </p>
      </div>

      {/* Card Action Footer */}
      <div className="mt-4 pt-3 border-t border-[#16364A]/50 flex items-center justify-between">
        <span className="text-[10px] text-[#71899C] font-mono">ID: {alert.id}</span>
        <button
          type="button"
          onClick={() => onToggleAcknowledge(alert.id)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
            isAcknowledged
              ? "bg-[#0A2036] text-slate-300 border-slate-700 hover:text-white"
              : "bg-[#0E7C86] text-white border-cyan-400/50 hover:bg-cyan-600 shadow-sm"
          }`}
        >
          {isAcknowledged ? "Reactivate Alert" : "Acknowledge"}
        </button>
      </div>
    </div>
  );
}

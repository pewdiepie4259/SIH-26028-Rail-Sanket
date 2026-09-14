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
  UserCircle,
} from "lucide-react";
import { logout, getCurrentUser } from "../../services/auth";
import {
  getRoleAlertsViewData,
  type RoleAlertItem,
} from "../../services/employeeAlertService";
import type { EmployeeNavItem } from "../../services/employee";

export default function EmployeeAlerts() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  // State Setup
  const [is24Hour, setIs24Hour] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load dynamic role-specific alerts data
  const roleViewData = useMemo(() => getRoleAlertsViewData(currentUser), [currentUser]);

  // Local Alerts State (enables acknowledge & read actions)
  const [alertsList, setAlertsList] = useState<RoleAlertItem[]>(roleViewData.alerts);

  // Detail Modal State
  const [selectedAlert, setSelectedAlert] = useState<RoleAlertItem | null>(null);

  // Filter & Search States
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sync if user changes
  useEffect(() => {
    setAlertsList(roleViewData.alerts);
  }, [roleViewData]);

  // Live IST Clock
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

  // Toggle acknowledge alert
  const handleToggleAcknowledge = (alertId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAlertsList((prev) =>
      prev.map((item) => {
        if (item.id === alertId) {
          const nextStatus = item.status === "ACTIVE" ? "ACKNOWLEDGED" : "ACTIVE";
          showToast(`Alert "${item.title}" marked as ${nextStatus.toLowerCase()}`);
          return { ...item, status: nextStatus, read: true };
        }
        return item;
      })
    );
    if (selectedAlert?.id === alertId) {
      setSelectedAlert((prev) =>
        prev
          ? {
              ...prev,
              status: prev.status === "ACTIVE" ? "ACKNOWLEDGED" : "ACTIVE",
              read: true,
            }
          : null
      );
    }
  };

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alertsList.filter((alert) => {
      // Priority filter (case insensitive)
      if (priorityFilter !== "ALL" && alert.priority.toUpperCase() !== priorityFilter.toUpperCase()) {
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
        const matchesLocation = alert.location?.toLowerCase().includes(query) || false;
        const matchesMessage = alert.message.toLowerCase().includes(query);
        const matchesAssignment = alert.assignment.toLowerCase().includes(query);
        const matchesSection = alert.section?.toLowerCase().includes(query) || false;
        const matchesTrain = alert.train?.toLowerCase().includes(query) || false;
        return (
          matchesTitle ||
          matchesCategory ||
          matchesLocation ||
          matchesMessage ||
          matchesAssignment ||
          matchesSection ||
          matchesTrain
        );
      }
      return true;
    });
  }, [alertsList, priorityFilter, statusFilter, searchQuery]);

  // Dynamic Summary Metrics
  const activeAlertsCount = alertsList.filter((a) => a.status === "ACTIVE").length;
  const criticalCount = alertsList.filter(
    (a) => a.priority.toUpperCase() === "CRITICAL" && a.status === "ACTIVE"
  ).length;
  const highPriorityCount = alertsList.filter(
    (a) => a.priority.toUpperCase() === "HIGH" && a.status === "ACTIVE"
  ).length;
  const mediumCount = alertsList.filter(
    (a) =>
      (a.priority.toUpperCase() === "MEDIUM" || a.priority.toUpperCase() === "INFORMATIONAL" || a.priority.toUpperCase() === "LOW") &&
      a.status === "ACTIVE"
  ).length;

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
                {roleViewData.employeeName}
              </div>
              <div className="text-[10px] text-[#71899C]">
                {roleViewData.roleTitle}
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
                  <span>{roleViewData.scopeLocation}</span>
                </div>
                <div className="text-[10px] text-[#71899C]">Role-Filtered Alerts</div>
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-[#16364A]/40">
                  <span>Logged-in Role</span>
                  <span className="text-amber-400 font-semibold uppercase">{roleViewData.roleTitle}</span>
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
          {/* WARNING BANNER IF APPLICABLE */}
          {roleViewData.warningMessage && (
            <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-950/30 text-amber-300 text-xs flex items-center gap-2.5 shadow-md">
              <AlertTriangle size={18} className="shrink-0 text-amber-400" />
              <span>{roleViewData.warningMessage}</span>
            </div>
          )}

          {/* PAGE HEADER & ROLE INFO BANNER */}
          <section className="rounded-xl border border-[#16364A] bg-gradient-to-r from-[#071A33] via-[#0A223D] to-[#071A33] p-5 sm:p-6 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider">
                    <Radio size={12} className="text-amber-400 animate-pulse" />
                    Role-Specific Operational Alerts
                  </span>
                  <span className="rounded bg-[#16364A] px-2 py-0.5 text-[10px] font-semibold text-[#AFC0D4] border border-slate-700">
                    {roleViewData.isLiveApiData ? "Live Operational Feed" : "Static Operational Roster"}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <AlertTriangle size={26} className="text-[#F59E0B]" />
                  OPERATIONAL ALERTS
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Active alerts filtered strictly for <span className="font-semibold text-cyan-300">{roleViewData.roleTitle}</span> in <span className="font-semibold text-slate-200">{roleViewData.department}</span>.
                </p>
              </div>

              {/* CURRENT EMPLOYEE BADGE */}
              <div className="bg-[#031426]/90 p-3 rounded-xl border border-[#16364A] flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-[#0E7C86]/20 border border-[#0E7C86]/40 flex items-center justify-center text-cyan-300">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Assigned Post</div>
                  <div className="text-xs font-bold text-white">{roleViewData.scopeLocation}</div>
                </div>
              </div>
            </div>
          </section>

          {/* DYNAMIC ALERT SUMMARY METRIC CARDS */}
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
                  Medium / Info
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

          {/* RESPONSIBILITY SCOPE BANNER */}
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
                  <span>{roleViewData.roleTitle}</span>
                  <span className="text-slate-400 font-normal">• {roleViewData.scopeLocation}</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">{roleViewData.scopeDescription}</p>
              </div>
            </div>

            <div className="text-xs text-right hidden lg:block shrink-0">
              <span className="text-[10px] text-slate-400">Total Filtered:</span>
              <span className="ml-1 text-sm font-bold text-[#F59E0B] font-mono">{filteredAlerts.length} Alerts</span>
            </div>
          </section>

          {/* FILTERS & SEARCH BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#071A33] p-3.5 rounded-xl border border-[#16364A]">
            {/* Priority Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
              {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW", "INFORMATIONAL"].map((p) => (
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

          {/* ALERT CARDS & EMPTY STATE */}
          {filteredAlerts.length === 0 ? (
            /* ROLE-SPECIFIC EMPTY STATE (STEP 12) */
            <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-12 text-center shadow-sm">
              <div className="h-14 w-14 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-3">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-white">No alerts for your current role or assignment.</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                No active operational alerts require your attention at this moment for your role ({roleViewData.roleTitle}).
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
                  onToggleAcknowledge={(id) => handleToggleAcknowledge(id)}
                  onClick={() => setSelectedAlert(alert)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ALERT DETAIL MODAL */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#16364A] bg-[#071A33] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#16364A] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A2036] border border-[#294665]">
                  <AlertTriangle size={20} className="text-[#F59E0B]" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase text-[#0E7C86] tracking-wider block mb-0.5">
                    OPERATIONAL ALERT DETAILS
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {selectedAlert.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#0A2036] hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Meta Details */}
            <div className="rounded-xl bg-[#0A2036] p-3.5 border border-[#16364A] grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Priority:</span>
                <span className="font-bold text-amber-400 uppercase">{selectedAlert.priority}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Category:</span>
                <span className="text-cyan-300 font-semibold">{selectedAlert.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Assignment:</span>
                <span className="text-slate-200 font-medium">{selectedAlert.assignment}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Source:</span>
                <span className="text-slate-200 font-medium">{selectedAlert.source}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Status:</span>
                <span
                  className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded mt-0.5 ${
                    selectedAlert.status === "ACTIVE"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {selectedAlert.status}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Timestamp:</span>
                <span className="font-mono text-slate-300">{selectedAlert.timestamp}</span>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 block mb-1.5">
                Detailed Advisory / Instruction:
              </span>
              <p className="text-sm text-slate-200 bg-[#0A2036] p-4 rounded-xl border border-[#16364A] leading-relaxed">
                {selectedAlert.message}
              </p>
            </div>

            {/* Action Footer */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleToggleAcknowledge(selectedAlert.id)}
                className={`w-full sm:w-auto rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                  selectedAlert.status === "ACTIVE"
                    ? "bg-[#0E7C86] text-white hover:bg-cyan-600 shadow-md"
                    : "bg-[#0A2036] border border-slate-700 text-slate-300 hover:text-white"
                }`}
              >
                {selectedAlert.status === "ACTIVE" ? "Acknowledge Alert" : "Mark as Active"}
              </button>

              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="w-full sm:w-auto rounded-xl bg-[#0A2036] border border-[#294665] px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-[#16364A] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Reusable EmployeeAlertCard Component
 */
interface EmployeeAlertCardProps {
  alert: RoleAlertItem;
  onToggleAcknowledge: (id: string) => void;
  onClick: () => void;
}

function EmployeeAlertCard({ alert, onToggleAcknowledge, onClick }: EmployeeAlertCardProps) {
  const isCritical = alert.priority.toUpperCase() === "CRITICAL";
  const isHigh = alert.priority.toUpperCase() === "HIGH";
  const isMedium = alert.priority.toUpperCase() === "MEDIUM";
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
      onClick={onClick}
      className={`rounded-xl border bg-[#071A33] p-5 transition shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md ${
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

        {/* Category & Assignment Badges */}
        <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
          <span className="px-2 py-0.5 rounded bg-[#0A2036] text-cyan-300 border border-[#16364A] text-[11px] font-medium">
            {alert.category}
          </span>

          <span className="text-slate-300 text-[11px] flex items-center gap-1">
            <MapPin size={12} className="text-[#0E7C86]" />
            <span>{alert.assignment || alert.location}</span>
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

        {/* Description / Message */}
        <p className="text-xs text-slate-300 mt-2.5 leading-relaxed line-clamp-2">
          {alert.message}
        </p>
      </div>

      {/* Card Action Footer */}
      <div className="mt-4 pt-3 border-t border-[#16364A]/50 flex items-center justify-between">
        <span className="text-[10px] text-[#71899C] font-mono">ID: {alert.id}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleAcknowledge(alert.id);
            }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
              isAcknowledged
                ? "bg-[#0A2036] text-slate-300 border-slate-700 hover:text-white"
                : "bg-[#0E7C86] text-white border-cyan-400/50 hover:bg-cyan-600 shadow-sm"
            }`}
          >
            {isAcknowledged ? "Acknowledged" : "Acknowledge"}
          </button>
        </div>
      </div>
    </div>
  );
}

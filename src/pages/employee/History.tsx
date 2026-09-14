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
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Info,
  Calendar,
  UserCircle,
} from "lucide-react";
import { getCurrentUser, logout } from "../../services/auth";
import {
  demoEmployee,
  demoEmployeeActivities,
  type EmployeeActivityItem,
  type EmployeeActivityCategory,
  type EmployeeNavItem,
} from "../../services/employee";

export default function EmployeeHistory() {
  const navigate = useNavigate();

  // Authentication & System State
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [is24Hour, setIs24Hour] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Activities React Local State (Read-only)
  const [activities] = useState<EmployeeActivityItem[]>(demoEmployeeActivities);

  // Filters & Search State
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Detail Modal State
  const [selectedActivity, setSelectedActivity] = useState<EmployeeActivityItem | null>(null);

  // Auth state setup
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

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

  const employeeName = currentUser?.name || demoEmployee.name;
  const employeeId = currentUser?.employeeId || demoEmployee.employeeId;

  // Summary Metrics (Calculated dynamically from demo data)
  const totalCount = activities.length;
  const todayCount = activities.filter((a) => a.date === "13 Sep").length;
  const issuesReportedCount = activities.filter(
    (a) => a.category === "ISSUE" && a.title.toLowerCase().includes("reported")
  ).length;
  const issuesResolvedCount = activities.filter(
    (a) => a.category === "ISSUE" && a.title.toLowerCase().includes("resolved")
  ).length;

  // Filtered Activities List
  const filteredActivities = useMemo(() => {
    return activities.filter((item) => {
      // Category filter
      if (categoryFilter !== "ALL" && item.category !== categoryFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesCat = item.categoryLabel.toLowerCase().includes(q);
        const matchesEntity = item.relatedEntity ? item.relatedEntity.toLowerCase().includes(q) : false;
        return matchesTitle || matchesDesc || matchesCat || matchesEntity;
      }

      return true;
    });
  }, [activities, categoryFilter, searchQuery]);

  // Date Grouping (newest activities first)
  const groupedActivities = useMemo(() => {
    const groups: Record<string, EmployeeActivityItem[]> = {};
    filteredActivities.forEach((act) => {
      if (!groups[act.date]) {
        groups[act.date] = [];
      }
      groups[act.date].push(act);
    });
    return groups;
  }, [filteredActivities]);

  // Sidebar navigation menu items
  const navItems: EmployeeNavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/employee/dashboard", active: true },
    { id: "duty", label: "My Duty", icon: CalendarCheck, path: "/employee/duty", active: true },
    { id: "assignment", label: "My Train / My Section", icon: TrainFront, path: "/employee/assignment", active: true },
    { id: "alerts", label: "Operational Alerts", icon: AlertTriangle, path: "/employee/alerts", active: true },
    { id: "tasks", label: "Tasks", icon: CheckSquare, path: "/employee/tasks", active: true },
    { id: "report_issue", label: "Report Issue", icon: FileWarning, path: "/employee/report", active: true },
    { id: "incident", label: "Incident Reporting", icon: Flame, path: "/employee/incidents", active: true },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/employee/notifications", active: true },
    { id: "history", label: "Activity / History", icon: History, path: "/employee/history", active: true },
    { id: "profile", label: "Profile", icon: User, path: "/employee/profile", active: true },
  ];

  // Render category icons
  const renderCategoryIcon = (category: EmployeeActivityCategory) => {
    switch (category) {
      case "DUTY":
        return <CalendarCheck size={16} className="text-emerald-400" />;
      case "TRAIN":
        return <TrainFront size={16} className="text-cyan-400" />;
      case "TASK":
        return <CheckSquare size={16} className="text-blue-400" />;
      case "ISSUE":
        return <FileWarning size={16} className="text-amber-400" />;
      case "INCIDENT":
        return <AlertOctagon size={16} className="text-red-400" />;
      case "ALERT":
        return <AlertTriangle size={16} className="text-orange-400" />;
      case "NOTIFICATION":
        return <Bell size={16} className="text-purple-400" />;
      case "SYSTEM":
      default:
        return <Info size={16} className="text-slate-400" />;
    }
  };

  // Category badge styles
  const getCategoryBadgeClass = (category: EmployeeActivityCategory) => {
    switch (category) {
      case "DUTY":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case "TRAIN":
        return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
      case "TASK":
        return "bg-blue-500/15 text-blue-300 border-blue-500/30";
      case "ISSUE":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "INCIDENT":
        return "bg-red-500/15 text-red-300 border-red-500/30";
      case "ALERT":
        return "bg-orange-500/15 text-orange-300 border-orange-500/30";
      case "NOTIFICATION":
        return "bg-purple-500/15 text-purple-300 border-purple-500/30";
      case "SYSTEM":
      default:
        return "bg-slate-500/15 text-slate-300 border-slate-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-[#031426] text-slate-100 flex flex-col font-sans selection:bg-[#0E7C86]/30 selection:text-white">
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
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#0E7C86]">
                  RailDrishti
                </span>
                <span className="rounded bg-[#0E7C86]/20 border border-[#0E7C86]/40 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">
                  EMPLOYEE PORTAL
                </span>
              </div>
              <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
                Activity & Audit History
              </h1>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* IST Clock */}
          <div className="hidden items-center gap-2 rounded-lg border border-[#16364A] bg-[#0A2036] px-3 py-1.5 md:flex">
            <Clock size={16} className="text-[#0E7C86]" />
            <span className="font-mono text-sm font-medium text-slate-200">
              {formatIST(currentTime, is24Hour)} <span className="text-[10px] text-slate-400">IST</span>
            </span>
            <button
              type="button"
              onClick={() => setIs24Hour(!is24Hour)}
              className="ml-1 rounded border border-[#294665] bg-[#071A33] px-1.5 py-0.5 text-[10px] font-medium text-slate-300 transition hover:bg-[#16364A]"
              title="Toggle 12h/24h format"
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

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 transition hover:bg-red-500/20"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* BODY WITH SIDEBAR & CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        {/* MOBILE SIDEBAR BACKDROP */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#16364A] bg-[#071A33] transition-all duration-300 ease-in-out lg:static ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"} w-64`}
        >
          {/* Mobile Close Button */}
          <div className="flex h-[72px] items-center justify-between border-b border-[#16364A] px-4 lg:hidden">
            <span className="font-semibold text-white text-sm">Navigation Menu</span>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-[#0A2036] hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav Links */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isCurrent = item.id === "history";

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={!item.active}
                  onClick={() => {
                    if (item.path) {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }
                  }}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                    isCurrent
                      ? "border border-[#0E7C86] bg-[#0E7C86] text-white shadow-lg shadow-[#0E7C86]/20 font-semibold"
                      : item.active
                      ? "text-slate-300 hover:bg-[#0A2036] hover:text-white border border-transparent"
                      : "text-slate-500 cursor-not-allowed border border-transparent opacity-60"
                  }`}
                  title={item.phase ? `${item.label} (${item.phase})` : item.label}
                >
                  <Icon
                    size={18}
                    className={`shrink-0 ${
                      isCurrent ? "text-cyan-200" : item.active ? "text-[#0E7C86]" : "text-slate-500"
                    }`}
                  />
                  {!sidebarCollapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                  {!sidebarCollapsed && item.phase && (
                    <span className="rounded bg-[#16364A] px-1.5 py-0.5 text-[9px] font-mono text-slate-400">
                      {item.phase}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Collapse Toggle (Desktop only) */}
          <div className="hidden border-t border-[#16364A] p-3 lg:block">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#16364A] bg-[#0A2036] py-2 text-xs text-slate-300 transition hover:bg-[#16364A] hover:text-white"
            >
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              {!sidebarCollapsed && <span>Collapse Sidebar</span>}
            </button>
          </div>
        </aside>

        {/* MAIN PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto bg-[#031426] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-[#16364A] pb-5">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#0E7C86] font-mono uppercase tracking-wider mb-1">
                  <History size={15} />
                  <span>Employee Auditability Trail</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  ACTIVITY HISTORY
                </h1>
                <p className="text-sm text-slate-300 mt-1">
                  Review your recent operational activity and actions.
                </p>
              </div>

              {/* Demo Badge */}
              <div className="flex items-center gap-2 rounded-xl border border-[#16364A] bg-[#071A33] px-3.5 py-2 text-xs text-slate-400">
                <ShieldCheck size={16} className="text-[#0E7C86]" />
                <span>Status: <span className="text-cyan-300 font-semibold">Demo Activity History (Read-Only)</span></span>
              </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Activities */}
              <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-4 sm:p-5 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Total Activities
                  </span>
                  <div className="text-2xl font-bold text-white mt-1 font-mono">{totalCount}</div>
                  <span className="text-[11px] text-slate-400">Logged actions</span>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A2036] border border-[#294665] text-[#0E7C86]">
                  <History size={20} />
                </div>
              </div>

              {/* Today */}
              <div className="rounded-2xl border border-cyan-500/30 bg-[#071A33] p-4 sm:p-5 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-cyan-300">
                    Today
                  </span>
                  <div className="text-2xl font-bold text-cyan-300 mt-1 font-mono">{todayCount}</div>
                  <span className="text-[11px] text-slate-400">Current shift records</span>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  <Calendar size={20} />
                </div>
              </div>

              {/* Issues Reported */}
              <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-4 sm:p-5 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                    Issues Reported
                  </span>
                  <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">{issuesReportedCount}</div>
                  <span className="text-[11px] text-slate-400">Submitted by you</span>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <FileWarning size={20} />
                </div>
              </div>

              {/* Issues Resolved */}
              <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-4 sm:p-5 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                    Issues Resolved
                  </span>
                  <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{issuesResolvedCount}</div>
                  <span className="text-[11px] text-slate-400">Completed lifecycle</span>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <CheckCircle2 size={20} />
                </div>
              </div>
            </div>

            {/* FILTER & SEARCH BAR */}
            <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-4 shadow-xl space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Category Filter Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                  {[
                    { id: "ALL", label: "All" },
                    { id: "DUTY", label: "Duty" },
                    { id: "TRAIN", label: "Train" },
                    { id: "TASK", label: "Task" },
                    { id: "ISSUE", label: "Issue" },
                    { id: "INCIDENT", label: "Incident" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold shrink-0 transition ${
                        categoryFilter === cat.id
                          ? "bg-[#0E7C86] text-white shadow"
                          : "bg-[#0A2036] text-slate-400 hover:text-white border border-[#16364A]"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search activity, train number, issue..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-[#16364A] bg-[#0A2036] py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-[#0E7C86] focus:outline-none focus:ring-1 focus:ring-[#0E7C86]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* TIMELINE ACTIVITIES */}
            <div className="space-y-6">
              {Object.keys(groupedActivities).length === 0 ? (
                /* Empty State */
                <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-12 text-center shadow-xl">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A2036] border border-[#294665] text-slate-400 mb-3">
                    <History size={28} />
                  </div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wide">
                    NO ACTIVITIES FOUND
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    No activity entries match your current search or filter criteria.
                  </p>
                  {(categoryFilter !== "ALL" || searchQuery) && (
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryFilter("ALL");
                        setSearchQuery("");
                      }}
                      className="mt-4 rounded-xl border border-[#294665] bg-[#0A2036] px-4 py-2 text-xs font-medium text-cyan-300 hover:bg-[#16364A] transition"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                Object.entries(groupedActivities).map(([date, dateActivities]) => (
                  <div key={date} className="space-y-4">
                    {/* Date Header Header */}
                    <div className="flex items-center gap-3">
                      <span className="rounded-xl border border-[#294665] bg-[#0A2036] px-3 py-1 text-xs font-mono font-bold text-cyan-300 shadow-sm">
                        {date} (Today)
                      </span>
                      <div className="h-px flex-1 bg-[#16364A]" />
                    </div>

                    {/* Timeline List */}
                    <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#16364A]">
                      {dateActivities.map((act) => (
                        <div
                          key={act.id}
                          onClick={() => setSelectedActivity(act)}
                          className="group relative rounded-2xl border border-[#16364A] bg-[#071A33] p-4 sm:p-5 transition-all hover:bg-[#0A2036] hover:border-[#294665] shadow-lg cursor-pointer"
                        >
                          {/* Timeline Dot on the connector line */}
                          <span className="absolute -left-6 sm:-left-8 top-6 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-[#031426] bg-[#0E7C86] group-hover:scale-125 group-hover:bg-cyan-400 transition-transform" />

                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            {/* Left Content */}
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A2036] border border-[#16364A]">
                                {renderCategoryIcon(act.category)}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span className="font-mono text-xs font-bold text-cyan-300">
                                    {act.time}
                                  </span>
                                  <span className="text-slate-600">•</span>
                                  <span
                                    className={`rounded px-2 py-0.5 text-[10px] font-bold border ${getCategoryBadgeClass(
                                      act.category
                                    )}`}
                                  >
                                    {act.categoryLabel}
                                  </span>
                                  {act.statusBadge && (
                                    <span className="rounded bg-[#16364A] text-[9px] font-mono px-1.5 py-0.5 text-slate-300 font-semibold">
                                      {act.statusBadge}
                                    </span>
                                  )}
                                </div>

                                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                                  {act.title}
                                </h3>

                                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                  {act.description}
                                </p>

                                {act.relatedEntity && (
                                  <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                                    <span className="text-slate-500">Related:</span>
                                    <span className="rounded bg-[#0A2036] px-2 py-0.5 font-mono text-slate-300 border border-[#16364A]">
                                      {act.relatedEntity}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right Action */}
                            {act.actionRoute && (
                              <div className="shrink-0 flex items-center sm:self-center">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (act.actionRoute) navigate(act.actionRoute);
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#294665] bg-[#0A2036] px-3 py-1.5 text-xs font-semibold text-[#0E7C86] hover:bg-[#16364A] hover:text-cyan-300 transition"
                                >
                                  <span>{act.actionLabel || "View Details"}</span>
                                  <ExternalLink size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ACTIVITY DETAIL MODAL */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#16364A] bg-[#071A33] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#16364A] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A2036] border border-[#294665]">
                  {renderCategoryIcon(selectedActivity.category)}
                </div>
                <div>
                  <span className="text-xs font-mono uppercase text-[#0E7C86] tracking-wider block mb-0.5">
                    ACTIVITY DETAILS
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {selectedActivity.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#0A2036] hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Metadata */}
            <div className="rounded-xl bg-[#0A2036] p-3.5 border border-[#16364A] grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Date & Time:</span>
                <span className="font-mono font-bold text-white">{selectedActivity.date} — {selectedActivity.time} IST</span>
              </div>
              <div>
                <span className="text-slate-400 block">Category:</span>
                <span
                  className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded border mt-0.5 ${getCategoryBadgeClass(
                    selectedActivity.category
                  )}`}
                >
                  {selectedActivity.categoryLabel}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Related Entity:</span>
                <span className="font-mono font-semibold text-slate-200">{selectedActivity.relatedEntity || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Logged By:</span>
                <span className="font-semibold text-slate-200">{employeeName} ({employeeId})</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 block mb-1.5">
                Activity Summary:
              </span>
              <p className="text-sm text-slate-200 bg-[#0A2036] p-4 rounded-xl border border-[#16364A] leading-relaxed">
                {selectedActivity.description}
              </p>
            </div>

            {/* Audit notice */}
            <div className="rounded-lg bg-[#0A2036]/60 p-3 border border-[#16364A] text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#0E7C86] shrink-0" />
              <span>Immutable audit record generated during employee operational session.</span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="rounded-xl bg-[#0A2036] border border-[#294665] px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-[#16364A] transition"
              >
                Close
              </button>
              {selectedActivity.actionRoute && (
                <button
                  type="button"
                  onClick={() => {
                    const route = selectedActivity.actionRoute;
                    setSelectedActivity(null);
                    if (route) navigate(route);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0E7C86] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0E5961] shadow-lg transition"
                >
                  <span>{selectedActivity.actionLabel || "View Related Module"}</span>
                  <ExternalLink size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

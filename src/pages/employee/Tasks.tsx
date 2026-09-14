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
  CheckCircle2,
  Building2,
  CircleDot,
  CheckCheck,
  Lock,
  Search,
  PlayCircle,
  Eye,
  Layers,
  UserCircle,
} from "lucide-react";
import { logout } from "../../services/auth";
import {
  demoEmployeeTasks,
  type EmployeeTaskItem,
  type EmployeeTaskStatus,
  type EmployeeNavItem,
} from "../../services/employee";

export default function EmployeeTasks() {
  const navigate = useNavigate();

  // State Setup
  const [is24Hour, setIs24Hour] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Local Tasks React State
  const [tasks, setTasks] = useState<EmployeeTaskItem[]>(demoEmployeeTasks);

  // Filter & Search States
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State for viewing task details
  const [selectedTask, setSelectedTask] = useState<EmployeeTaskItem | null>(null);


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

  // Unidirectional Status Progression Handler: PENDING -> IN_PROGRESS -> COMPLETED
  const handleAdvanceStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          if (t.status === "PENDING") {
            showToast(`Task "${t.title}" moved to In Progress`);
            const updated = { ...t, status: "IN_PROGRESS" as EmployeeTaskStatus };
            if (selectedTask?.id === taskId) setSelectedTask(updated);
            return updated;
          } else if (t.status === "IN_PROGRESS") {
            showToast(`Task "${t.title}" marked as Completed`);
            const updated = { ...t, status: "COMPLETED" as EmployeeTaskStatus };
            if (selectedTask?.id === taskId) setSelectedTask(updated);
            return updated;
          }
        }
        return t;
      })
    );
  };

  // Dynamic Summary Counters (calculated from state)
  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === "PENDING").length;
  const inProgressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;

  // Filtered Task List
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Status filter
      if (statusFilter !== "ALL" && t.status !== statusFilter) {
        return false;
      }
      // Priority filter
      if (priorityFilter !== "ALL" && t.priority !== priorityFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesLocation = t.location.toLowerCase().includes(query);
        const matchesCategory = t.category.toLowerCase().includes(query);
        const matchesDesc = t.description.toLowerCase().includes(query);
        return matchesTitle || matchesLocation || matchesCategory || matchesDesc;
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, searchQuery]);

  // Sidebar navigation menu items
  const navItems: EmployeeNavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/employee/dashboard", active: true },
    { id: "duty", label: "My Duty", icon: CalendarCheck, path: "/employee/duty", active: true },
    { id: "assignment", label: "My Train / My Section", icon: TrainFront, path: "/employee/assignment", active: true },
    { id: "alerts", label: "Operational Alerts", icon: AlertTriangle, path: "/employee/alerts", active: true },
    { id: "tasks", label: "Tasks", icon: CheckSquare, path: "/employee/tasks", active: true, badge: pendingCount + inProgressCount },
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
                Operational Task Manager
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
              const isCurrent = item.id === "tasks";
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
                          <span className="ml-2 px-1.5 py-0.5 rounded-full bg-[#0E7C86] text-[10px] font-bold text-white">
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
                  <span>KSR Bengaluru Junction</span>
                </div>
                <div className="text-[10px] text-[#71899C]">Assigned Shift Tasks</div>
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-[#16364A]/40">
                  <span>Shift Progress</span>
                  <span className="text-emerald-400 font-semibold font-mono">
                    {completedCount}/{totalCount} Completed
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center text-emerald-400" title="Shift Tasks">
                <CircleDot size={14} />
              </div>
            )}
          </div>
        </aside>

        {/* MAIN TASKS CONTENT */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ============================================================ */}
          {/* 2. PAGE HEADER                                              */}
          {/* ============================================================ */}
          <section className="rounded-xl border border-[#16364A] bg-gradient-to-r from-[#071A33] via-[#0A223D] to-[#071A33] p-5 sm:p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-xs font-bold uppercase tracking-wider">
                    <CheckSquare size={12} className="text-cyan-400" />
                    Shift Task Queue
                  </span>
                  <span className="rounded bg-[#16364A] px-2 py-0.5 text-[10px] font-semibold text-[#AFC0D4] border border-slate-700">
                    Sample Operational Data
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <CheckSquare size={26} className="text-[#F59E0B]" />
                  MY TASKS
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  View and manage your assigned operational tasks.
                </p>
              </div>

              {/* Progress Summary Pill */}
              <div className="bg-[#031426]/90 p-3.5 rounded-xl border border-[#16364A] flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#0E7C86]/20 border border-[#0E7C86]/50 flex items-center justify-center text-cyan-300 shrink-0">
                  <Layers size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-[#AFC0D4] uppercase tracking-wider">
                    Completion Status
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {completedCount} of {totalCount} Done
                  </div>
                  <div className="w-28 bg-[#16364A] h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* 9. DYNAMIC TASK SUMMARY COUNTERS (TOP ROW)                  */}
          {/* ============================================================ */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-4.5 hover:border-[#0E7C86] transition shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#AFC0D4]">
                  Total Tasks
                </span>
                <Layers size={18} className="text-slate-300" />
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">
                {totalCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Assigned for current duty
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4.5 hover:border-amber-500/70 transition shadow-sm">
              <div className="flex items-center justify-between text-amber-300 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Pending
                </span>
                <Clock size={18} className="text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold text-amber-400 font-mono">
                {pendingCount}
              </div>
              <div className="text-[11px] text-amber-300/80 mt-1">
                Awaiting operational action
              </div>
            </div>

            <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/20 p-4.5 hover:border-cyan-500/70 transition shadow-sm">
              <div className="flex items-center justify-between text-cyan-300 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  In Progress
                </span>
                <PlayCircle size={18} className="text-cyan-400 animate-pulse" />
              </div>
              <div className="text-2xl font-extrabold text-cyan-300 font-mono">
                {inProgressCount}
              </div>
              <div className="text-[11px] text-cyan-200/80 mt-1">
                Currently being worked on
              </div>
            </div>

            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4.5 hover:border-emerald-500/70 transition shadow-sm">
              <div className="flex items-center justify-between text-emerald-300 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Completed
                </span>
                <CheckCircle2 size={18} className="text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                {completedCount}
              </div>
              <div className="text-[11px] text-emerald-300/80 mt-1">
                Verified & logged
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* 10. STATUS & 11. PRIORITY FILTERS & 12. SEARCH BAR          */}
          {/* ============================================================ */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#071A33] p-3.5 rounded-xl border border-[#16364A]">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
              {[
                { id: "ALL", label: "All Tasks" },
                { id: "PENDING", label: `Pending (${pendingCount})` },
                { id: "IN_PROGRESS", label: `In Progress (${inProgressCount})` },
                { id: "COMPLETED", label: `Completed (${completedCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                    statusFilter === tab.id
                      ? "bg-[#0E7C86] text-white shadow-sm font-bold"
                      : "bg-[#0A2036] text-slate-300 hover:text-white hover:bg-[#16364A]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Priority Filter & Search Bar */}
            <div className="flex items-center gap-2">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-[#0A2036] border border-[#16364A] text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-400"
              >
                <option value="ALL">All Priorities</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>

              <div className="relative flex-1 sm:w-60">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
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
          {/* 4. TASK CARDS (2-COLUMN RESPONSIVE GRID)                     */}
          {/* ============================================================ */}
          {filteredTasks.length === 0 ? (
            <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-12 text-center shadow-sm">
              <div className="h-14 w-14 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-3">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-white">NO TASKS FOUND</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                No assigned operational tasks match your active filter or search criteria.
              </p>
              {(statusFilter !== "ALL" || priorityFilter !== "ALL" || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("ALL");
                    setPriorityFilter("ALL");
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
              {filteredTasks.map((task) => (
                <EmployeeTaskCard
                  key={task.id}
                  task={task}
                  onAdvanceStatus={handleAdvanceStatus}
                  onViewDetails={(t) => setSelectedTask(t)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ============================================================ */}
      {/* 8. TASK DETAILS MODAL (VIEW ACTION)                          */}
      {/* ============================================================ */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-xl border border-[#0E7C86]/60 bg-[#071A33] p-6 shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#16364A] pb-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0A2036] text-cyan-300 border border-[#16364A] uppercase">
                  {selectedTask.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-1.5">
                  {selectedTask.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#0A2036]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0A2036] p-3 rounded-lg border border-[#16364A]">
                  <div className="text-[#AFC0D4] text-[10px] font-semibold uppercase">Priority Level</div>
                  <div className="font-bold text-white mt-0.5 flex items-center gap-1.5">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        selectedTask.priority === "HIGH"
                          ? "bg-red-400"
                          : selectedTask.priority === "MEDIUM"
                          ? "bg-amber-400"
                          : "bg-blue-400"
                      }`}
                    />
                    <span>{selectedTask.priority} PRIORITY</span>
                  </div>
                </div>

                <div className="bg-[#0A2036] p-3 rounded-lg border border-[#16364A]">
                  <div className="text-[#AFC0D4] text-[10px] font-semibold uppercase">Due Time</div>
                  <div className="font-mono font-bold text-[#F59E0B] text-sm mt-0.5">
                    {selectedTask.dueTime} IST
                  </div>
                </div>

                <div className="bg-[#0A2036] p-3 rounded-lg border border-[#16364A] col-span-2">
                  <div className="text-[#AFC0D4] text-[10px] font-semibold uppercase">Location</div>
                  <div className="font-semibold text-white mt-0.5 flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#0E7C86]" />
                    <span>{selectedTask.location}</span>
                  </div>
                </div>

                <div className="bg-[#0A2036] p-3 rounded-lg border border-[#16364A] col-span-2">
                  <div className="text-[#AFC0D4] text-[10px] font-semibold uppercase">Assigned Authority</div>
                  <div className="font-semibold text-slate-200 mt-0.5">
                    {selectedTask.assignedBy || "Operating Department"}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-[#0A2036] p-3.5 rounded-lg border border-[#16364A]">
                <div className="text-[#AFC0D4] text-[10px] font-semibold uppercase mb-1">
                  Operational Description
                </div>
                <p className="text-slate-200 leading-relaxed">{selectedTask.description}</p>
                {selectedTask.instructions && (
                  <p className="text-cyan-300/90 text-[11px] mt-2 pt-2 border-t border-[#16364A]/50">
                    <strong className="text-white">Instructions:</strong> {selectedTask.instructions}
                  </p>
                )}
              </div>

              {/* Status Progression Bar */}
              <div className="bg-[#0A2036] p-3 rounded-lg border border-[#16364A]">
                <div className="text-[#AFC0D4] text-[10px] font-semibold uppercase mb-2">
                  Task Progression Stage
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span
                    className={`font-bold ${
                      selectedTask.status === "PENDING" ? "text-amber-400" : "text-emerald-400"
                    }`}
                  >
                    ● 1. Pending
                  </span>
                  <span className="text-slate-500">→</span>
                  <span
                    className={`font-bold ${
                      selectedTask.status === "IN_PROGRESS"
                        ? "text-cyan-400 animate-pulse"
                        : selectedTask.status === "COMPLETED"
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }`}
                  >
                    ● 2. In Progress
                  </span>
                  <span className="text-slate-500">→</span>
                  <span
                    className={`font-bold ${
                      selectedTask.status === "COMPLETED" ? "text-emerald-400" : "text-slate-500"
                    }`}
                  >
                    ● 3. Completed
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="border-t border-[#16364A] pt-3 flex items-center justify-between">
              <span className="text-[10px] text-[#71899C] font-mono">Task ID: {selectedTask.id}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-3 py-1.5 rounded-lg border border-[#16364A] bg-[#0A2036] text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Close
                </button>

                {selectedTask.status === "PENDING" && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStatus(selectedTask.id)}
                    className="px-4 py-1.5 rounded-lg bg-[#0E7C86] text-white text-xs font-bold hover:bg-cyan-600 transition shadow-sm flex items-center gap-1.5"
                  >
                    <PlayCircle size={14} />
                    <span>Mark In Progress</span>
                  </button>
                )}

                {selectedTask.status === "IN_PROGRESS" && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStatus(selectedTask.id)}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    <span>Mark Completed</span>
                  </button>
                )}

                {selectedTask.status === "COMPLETED" && (
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-600 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    <span>Completed</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 4. Reusable EmployeeTaskCard Component
 */
interface EmployeeTaskCardProps {
  task: EmployeeTaskItem;
  onAdvanceStatus: (id: string) => void;
  onViewDetails: (task: EmployeeTaskItem) => void;
}

function EmployeeTaskCard({ task, onAdvanceStatus, onViewDetails }: EmployeeTaskCardProps) {
  const isPending = task.status === "PENDING";
  const isInProgress = task.status === "IN_PROGRESS";
  const isCompleted = task.status === "COMPLETED";

  const isHigh = task.priority === "HIGH";
  const isMedium = task.priority === "MEDIUM";

  const priorityStyle = isHigh
    ? "bg-red-950/80 text-red-300 border-red-500/50"
    : isMedium
    ? "bg-amber-950/80 text-amber-300 border-amber-500/50"
    : "bg-blue-950/80 text-blue-300 border-blue-500/50";

  const cardBorder = isCompleted
    ? "border-emerald-900/40 bg-[#051424] opacity-80"
    : isInProgress
    ? "border-cyan-500/50 bg-[#071A33] shadow-md ring-1 ring-cyan-500/20"
    : "border-[#16364A] bg-[#071A33] hover:border-slate-600";

  return (
    <div
      className={`rounded-xl border p-5 transition shadow-sm flex flex-col justify-between ${cardBorder}`}
    >
      <div>
        {/* Top Header: Category, Priority, and Status */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0A2036] text-cyan-300 border border-[#16364A] uppercase tracking-wider">
            {task.category}
          </span>

          <div className="flex items-center gap-2">
            <span
              className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${priorityStyle}`}
            >
              {task.priority} PRIORITY
            </span>

            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                isCompleted
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-600"
                  : isInProgress
                  ? "bg-cyan-950 text-cyan-300 border border-cyan-600 animate-pulse"
                  : "bg-[#0A2036] text-amber-400 border border-amber-500/40"
              }`}
            >
              {task.status.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Task Title */}
        <h3
          className={`text-base font-bold leading-snug tracking-tight ${
            isCompleted ? "line-through text-slate-400" : "text-white"
          }`}
        >
          {task.title}
        </h3>

        {/* Location & Due Time */}
        <div className="grid grid-cols-2 gap-2 mt-2.5 text-xs">
          <div className="bg-[#0A2036] p-2 rounded-lg border border-[#16364A]/60 flex items-center gap-1.5 truncate">
            <MapPin size={13} className="text-[#0E7C86] shrink-0" />
            <span className="text-slate-200 truncate">{task.location}</span>
          </div>

          <div className="bg-[#0A2036] p-2 rounded-lg border border-[#16364A]/60 flex items-center gap-1.5">
            <Clock size={13} className="text-[#F59E0B] shrink-0" />
            <span className="text-slate-200 font-mono font-semibold">Due: {task.dueTime}</span>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-300 mt-2.5 leading-relaxed line-clamp-2">
          {task.description}
        </p>

        {/* 15. Status Progress Workflow Indicator */}
        <div className="mt-3 pt-2.5 border-t border-[#16364A]/40 flex items-center justify-between text-[10px] text-slate-400 font-medium">
          <span className={isPending ? "text-amber-400 font-bold" : "text-emerald-400"}>
            {isPending ? "●" : "✓"} Pending
          </span>
          <span className="text-slate-600">→</span>
          <span className={isInProgress ? "text-cyan-300 font-bold" : isCompleted ? "text-emerald-400" : ""}>
            {isInProgress ? "●" : isCompleted ? "✓" : "○"} In Progress
          </span>
          <span className="text-slate-600">→</span>
          <span className={isCompleted ? "text-emerald-400 font-bold" : ""}>
            {isCompleted ? "✓" : "○"} Completed
          </span>
        </div>
      </div>

      {/* 6. Card Action Footer */}
      <div className="mt-4 pt-3 border-t border-[#16364A]/50 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onViewDetails(task)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#16364A] bg-[#0A2036] text-slate-200 hover:text-white hover:border-[#0E7C86] transition flex items-center gap-1"
        >
          <Eye size={13} />
          <span>View</span>
        </button>

        {/* Action Button depending on workflow stage */}
        {isPending && (
          <button
            type="button"
            onClick={() => onAdvanceStatus(task.id)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#0E7C86] text-white hover:bg-cyan-600 transition shadow-sm flex items-center gap-1"
          >
            <PlayCircle size={13} />
            <span>Mark In Progress</span>
          </button>
        )}

        {isInProgress && (
          <button
            type="button"
            onClick={() => onAdvanceStatus(task.id)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-sm flex items-center gap-1"
          >
            <CheckCircle2 size={13} />
            <span>Mark Completed</span>
          </button>
        )}

        {isCompleted && (
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 py-1">
            <CheckCircle2 size={14} />
            <span>Finished</span>
          </span>
        )}
      </div>
    </div>
  );
}

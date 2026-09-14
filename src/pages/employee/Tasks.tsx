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
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  CheckCircle2,
  Building2,
  CircleDot,
  CheckCheck,
  Search,
  PlayCircle,
  Eye,
  UserCircle,
  Layers,
  Filter,
} from "lucide-react";
import { getCurrentUser, logout } from "../../services/auth";
import {
  getRoleTasksViewData,
  type RoleTaskItem,
  type TaskPriority,
  type TaskStatus,
} from "../../services/employeeTaskService";
import RoleDepartmentWarning from "../../components/employee/RoleDepartmentWarning";
import type { EmployeeNavItem } from "../../services/employee";

export default function EmployeeTasks() {
  const navigate = useNavigate();

  // Authentication & System State
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [is24Hour, setIs24Hour] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync auth state & safeguard controller redirection
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      if (user.role === "controller") {
        navigate("/controller/dashboard", { replace: true });
        return;
      }
      setCurrentUser(user);
    }
  }, [navigate]);

  // Live IST Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute dynamic role task data
  const roleTaskData = getRoleTasksViewData(currentUser);

  // Interactive Tasks React State
  const [tasks, setTasks] = useState<RoleTaskItem[]>(roleTaskData.tasks);

  // Update tasks when current user/role changes
  useEffect(() => {
    const nextData = getRoleTasksViewData(currentUser);
    setTasks(nextData.tasks);
  }, [currentUser]);

  // Filter & Search States
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State for viewing task details
  const [selectedTask, setSelectedTask] = useState<RoleTaskItem | null>(null);

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
    navigate("/login", { replace: true });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Status Progression Handler: Pending -> In Progress -> Completed
  const handleAdvanceStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          if (t.status === "Pending") {
            showToast(`Task "${t.title.slice(0, 30)}..." moved to In Progress`);
            const updated = { ...t, status: "In Progress" as TaskStatus };
            if (selectedTask?.id === taskId) setSelectedTask(updated);
            return updated;
          } else if (t.status === "In Progress") {
            showToast(`Task "${t.title.slice(0, 30)}..." marked as Completed`);
            const updated = { ...t, status: "Completed" as TaskStatus };
            if (selectedTask?.id === taskId) setSelectedTask(updated);
            return updated;
          }
        }
        return t;
      })
    );
  };

  // Dynamic Summary Counters
  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === "Pending").length;
  const inProgressCount = tasks.filter((t) => t.status === "In Progress").length;
  const completedCount = tasks.filter((t) => t.status === "Completed").length;

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
      // Category filter
      if (categoryFilter !== "ALL" && t.category !== categoryFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesCategory = t.category.toLowerCase().includes(query);
        const matchesDesc = t.description.toLowerCase().includes(query);
        const matchesAssign = t.assignment.toLowerCase().includes(query);
        const matchesSource = t.source.toLowerCase().includes(query);
        return matchesTitle || matchesCategory || matchesDesc || matchesAssign || matchesSource;
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, categoryFilter, searchQuery]);

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-950/80 text-red-300 border-red-700/60";
      case "High":
        return "bg-amber-950/80 text-amber-300 border-amber-700/60";
      case "Medium":
        return "bg-blue-950/80 text-blue-300 border-blue-700/60";
      case "Low":
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-950/80 text-emerald-300 border-emerald-700/60";
      case "In Progress":
        return "bg-[#0E3558] text-teal-300 border-teal-500/60";
      case "Pending":
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

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
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0E7C86] text-white px-4 py-2.5 rounded-lg shadow-xl border border-teal-400/40 text-xs font-medium">
          <CheckCheck size={16} className="text-teal-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 flex h-[72px] shrink-0 items-center justify-between border-b border-[#16364A] bg-[#071A33] px-4 sm:px-6">
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
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#294665] bg-[#071A33]">
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
                <span className="rounded bg-[#0E7C86]/25 px-1.5 py-0.5 text-[10px] font-semibold text-teal-300 border border-[#0E7C86]/40">
                  Employee Portal
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Operational Task Manager
              </h1>
            </div>
          </div>
        </div>

        {/* Right Header: IST Clock, Security & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
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

          {/* Security & User Badge */}
          <div className="hidden items-center gap-2 border-l border-[#16364A] pl-3 sm:flex">
            <ShieldCheck size={18} className="text-[#0E7C86]" />

            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-white truncate max-w-[130px]">
                {roleTaskData.employeeName}
              </div>
              <div className="text-[10px] text-teal-400 truncate max-w-[130px]">
                {roleTaskData.roleTitle}
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
                          <span className="ml-2 px-1.5 py-0.5 rounded-full bg-[#EF4444] text-[10px] font-bold text-white">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>

                  {sidebarCollapsed && (
                    <div className="hidden lg:group-hover:block absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#031426] border border-[#16364A] text-white text-xs rounded shadow-lg whitespace-nowrap z-50">
                      {item.label}
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
                  <span className="truncate">{roleTaskData.department}</span>
                </div>
                <div className="text-[10px] text-[#71899C] truncate">
                  Role: {roleTaskData.roleTitle}
                </div>
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-[#16364A]/40">
                  <span>Indian Railways</span>
                  <span className="text-teal-400 font-medium">● Connected</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center text-teal-400" title="Connected">
                <CircleDot size={14} />
              </div>
            )}
          </div>
        </aside>

        {/* TASKS MAIN CONTENT */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ============================================================ */}
          {/* 1. CONFIGURATION WARNING (IF MISMATCH OR UNASSIGNED)         */}
          {/* ============================================================ */}
          <RoleDepartmentWarning
            warningMessage={roleTaskData.warningMessage}
            isUnassigned={!roleTaskData.isRoleValid}
          />

          {/* ============================================================ */}
          {/* 2. DYNAMIC HERO / ROLE TASK HEADER                           */}
          {/* ============================================================ */}
          <section className="relative overflow-hidden rounded-2xl border border-[#16364A] bg-gradient-to-br from-[#0A223D] via-[#071A33] to-[#041224] p-5 sm:p-7 shadow-xl">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#0E7C86]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Left Details */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-bold tracking-wide uppercase shadow-sm">
                    <CheckSquare size={13} className="text-teal-400" />
                    {roleTaskData.roleTitle} Tasks
                  </span>
                  <span className="text-xs font-mono font-medium text-slate-400 bg-[#061629] px-2.5 py-1 rounded-md border border-[#16364A]">
                    ID #{roleTaskData.employeeId}
                  </span>
                  <span className="text-xs font-medium text-slate-300 bg-[#0A2036] px-2.5 py-1 rounded-md border border-[#16364A]">
                    Dept: {roleTaskData.department}
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    SHIFT OPERATIONAL TASKS
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Mandatory operational, safety, and inspection task checklist assigned specifically to{" "}
                    <span className="text-teal-300 font-semibold">{roleTaskData.roleTitle}</span>.
                  </p>
                </div>
              </div>

              {/* Right Summary Badge */}
              <div className="w-full lg:w-auto shrink-0 bg-[#061629]/90 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-[#1E4260] shadow-md flex items-center justify-between sm:justify-start gap-6">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    Shift Workload
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-0.5">
                    {completedCount} / {totalCount}
                  </div>
                  <div className="text-[11px] text-teal-400 font-medium">
                    {pendingCount + inProgressCount} Pending Attention
                  </div>
                </div>

                <div className="h-10 w-px bg-[#16364A]" />

                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    Completion
                  </div>
                  <div className="text-2xl font-bold font-mono text-teal-300 mt-0.5">
                    {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Logged to Station File
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* 3. TASK KPI COUNTERS (4 TILES)                               */}
          {/* ============================================================ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`rounded-xl border p-4 text-left transition ${
                statusFilter === "ALL"
                  ? "bg-[#0A2036] border-teal-500/80 shadow-md ring-1 ring-teal-500/40"
                  : "bg-[#071A33] border-[#16364A] hover:border-teal-500/40"
              }`}
            >
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="font-semibold text-slate-300">All Tasks</span>
                <Layers size={16} className="text-teal-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white">{totalCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Total assigned shift tasks</div>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("Pending")}
              className={`rounded-xl border p-4 text-left transition ${
                statusFilter === "Pending"
                  ? "bg-[#0A2036] border-amber-500/80 shadow-md ring-1 ring-amber-500/40"
                  : "bg-[#071A33] border-[#16364A] hover:border-amber-500/40"
              }`}
            >
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="font-semibold text-slate-300">Pending</span>
                <Clock size={16} className="text-amber-400" />
              </div>
              <div className="text-xl font-bold font-mono text-amber-300">{pendingCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Awaiting action</div>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("In Progress")}
              className={`rounded-xl border p-4 text-left transition ${
                statusFilter === "In Progress"
                  ? "bg-[#0A2036] border-cyan-500/80 shadow-md ring-1 ring-cyan-500/40"
                  : "bg-[#071A33] border-[#16364A] hover:border-cyan-500/40"
              }`}
            >
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="font-semibold text-slate-300">In Progress</span>
                <PlayCircle size={16} className="text-cyan-400" />
              </div>
              <div className="text-xl font-bold font-mono text-cyan-300">{inProgressCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Currently active</div>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("Completed")}
              className={`rounded-xl border p-4 text-left transition ${
                statusFilter === "Completed"
                  ? "bg-[#0A2036] border-emerald-500/80 shadow-md ring-1 ring-emerald-500/40"
                  : "bg-[#071A33] border-[#16364A] hover:border-emerald-500/40"
              }`}
            >
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="font-semibold text-slate-300">Completed</span>
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono text-emerald-300">{completedCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Verified & signed-off</div>
            </button>
          </div>

          {/* ============================================================ */}
          {/* 4. SEARCH & FILTER CONTROLS                                  */}
          {/* ============================================================ */}
          <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-4 flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${roleTaskData.roleTitle} tasks by title, category, location, or protocol...`}
                className="w-full pl-9 pr-4 py-2 bg-[#0A2036] border border-[#16364A] rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 transition"
              />
            </div>

            {/* Category Filter Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter size={15} className="text-slate-400 shrink-0 hidden sm:block" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-[#0A2036] border border-[#16364A] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-teal-400 transition cursor-pointer"
              >
                <option value="ALL">All Categories ({roleTaskData.categories.length})</option>
                {roleTaskData.categories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Priority Filter Dropdown */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-[#0A2036] border border-[#16364A] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-teal-400 transition cursor-pointer"
              >
                <option value="ALL">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 5. ROLE-SPECIFIC TASK LIST                                   */}
          {/* ============================================================ */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-10 text-center space-y-2">
                <CheckSquare size={32} className="mx-auto text-slate-500 mb-2" />
                <div className="text-sm font-bold text-white">No tasks assigned for your current role.</div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {searchQuery || statusFilter !== "ALL" || priorityFilter !== "ALL" || categoryFilter !== "ALL"
                    ? "No tasks matched your active filter criteria. Try resetting search or status filters."
                    : `No operational tasks are currently pending for ${roleTaskData.roleTitle}.`}
                </p>
                {(searchQuery || statusFilter !== "ALL" || priorityFilter !== "ALL" || categoryFilter !== "ALL") && (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("ALL");
                      setPriorityFilter("ALL");
                      setCategoryFilter("ALL");
                      setSearchQuery("");
                    }}
                    className="mt-3 text-xs font-semibold text-teal-400 hover:text-teal-300 hover:underline"
                  >
                    Reset all filters
                  </button>
                )}
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isCompleted = task.status === "Completed";
                const isInProgress = task.status === "In Progress";

                return (
                  <div
                    key={task.id}
                    className={`rounded-xl border p-4 sm:p-5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isCompleted
                        ? "bg-[#0A2036]/50 border-teal-900/30 opacity-75"
                        : isInProgress
                        ? "bg-[#071F38] border-teal-500/50 shadow-md ring-1 ring-teal-500/20"
                        : "bg-[#071A33] border-[#16364A] hover:border-teal-500/40"
                    }`}
                  >
                    {/* Left: Task Content */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider font-mono ${getPriorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getStatusBadge(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                        <span className="text-[11px] font-medium text-teal-300/90 bg-[#0A2036] px-2 py-0.5 rounded border border-[#16364A]">
                          {task.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock size={11} className="text-slate-400" />
                          Due: {task.dueTime}
                        </span>
                      </div>

                      <h3
                        className={`text-sm font-bold tracking-tight ${
                          isCompleted ? "line-through text-slate-400" : "text-white"
                        }`}
                      >
                        {task.title}
                      </h3>

                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                        {task.description}
                      </p>

                      <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                        <span>
                          Target: <span className="text-slate-200 font-medium">{task.assignment}</span>
                        </span>
                        <span>•</span>
                        <span>
                          Source: <span className="text-teal-300 font-mono text-[10px]">{task.source}</span>
                        </span>
                      </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedTask(task)}
                        className="px-3 py-1.5 rounded-lg border border-[#16364A] bg-[#0A2036] text-xs font-medium text-slate-300 hover:text-white hover:border-teal-400 transition flex items-center gap-1"
                        title="View Task Details"
                      >
                        <Eye size={13} />
                        <span>Details</span>
                      </button>

                      {task.status === "Pending" && (
                        <button
                          type="button"
                          onClick={() => handleAdvanceStatus(task.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white shadow-sm border border-teal-400/40 transition flex items-center gap-1"
                        >
                          <PlayCircle size={13} />
                          <span>Start Task</span>
                        </button>
                      )}

                      {task.status === "In Progress" && (
                        <button
                          type="button"
                          onClick={() => handleAdvanceStatus(task.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-sm border border-emerald-400/40 transition flex items-center gap-1"
                        >
                          <CheckCircle2 size={13} />
                          <span>Mark Done</span>
                        </button>
                      )}

                      {task.status === "Completed" && (
                        <span className="px-3 py-1.5 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-700/50 text-xs font-semibold flex items-center gap-1">
                          <CheckCircle2 size={13} />
                          <span>Signed Off</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ============================================================ */}
          {/* 6. TASK DETAILS MODAL                                        */}
          {/* ============================================================ */}
          {selectedTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
              <div className="relative w-full max-w-lg rounded-2xl border border-[#16364A] bg-[#071A33] p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#16364A] pb-3">
                  <div className="flex items-center gap-2">
                    <CheckSquare size={18} className="text-teal-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Task Specifications
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTask(null)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#0A2036]"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider font-mono ${getPriorityBadge(
                        selectedTask.priority
                      )}`}
                    >
                      {selectedTask.priority} Priority
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getStatusBadge(
                        selectedTask.status
                      )}`}
                    >
                      Status: {selectedTask.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-[#0A2036] px-2 py-0.5 rounded border border-[#16364A]">
                      Due: {selectedTask.dueTime}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    {selectedTask.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed bg-[#0A2036] p-3.5 rounded-lg border border-[#16364A]">
                    {selectedTask.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div className="p-2.5 bg-[#0A2036] rounded-lg border border-[#16364A]">
                      <div className="text-slate-400 text-[10px] uppercase">Category</div>
                      <div className="font-semibold text-white mt-0.5">{selectedTask.category}</div>
                    </div>
                    <div className="p-2.5 bg-[#0A2036] rounded-lg border border-[#16364A]">
                      <div className="text-slate-400 text-[10px] uppercase">Assignment Target</div>
                      <div className="font-semibold text-teal-300 mt-0.5">{selectedTask.assignment}</div>
                    </div>
                    <div className="p-2.5 bg-[#0A2036] rounded-lg border border-[#16364A]">
                      <div className="text-slate-400 text-[10px] uppercase">Assigned Staff</div>
                      <div className="font-semibold text-white mt-0.5">{selectedTask.assignedTo}</div>
                    </div>
                    <div className="p-2.5 bg-[#0A2036] rounded-lg border border-[#16364A]">
                      <div className="text-slate-400 text-[10px] uppercase">Authority / SOP</div>
                      <div className="font-semibold text-slate-200 text-[11px] mt-0.5 truncate">
                        {selectedTask.source}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#16364A]">
                  <button
                    type="button"
                    onClick={() => setSelectedTask(null)}
                    className="px-4 py-2 rounded-lg border border-[#16364A] text-xs font-semibold text-slate-300 hover:text-white"
                  >
                    Close
                  </button>

                  {selectedTask.status === "Pending" && (
                    <button
                      type="button"
                      onClick={() => handleAdvanceStatus(selectedTask.id)}
                      className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white shadow-md border border-teal-400/40 transition flex items-center gap-1.5"
                    >
                      <PlayCircle size={14} />
                      <span>Start Task</span>
                    </button>
                  )}

                  {selectedTask.status === "In Progress" && (
                    <button
                      type="button"
                      onClick={() => handleAdvanceStatus(selectedTask.id)}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md border border-emerald-400/40 transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={14} />
                      <span>Mark as Completed</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

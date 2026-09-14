import { useState, useEffect } from "react";
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
  UserCircle,
  CheckCheck,
  Lock,
} from "lucide-react";
import { getCurrentUser, logout } from "../../services/auth";
import {
  getDemoEmployeeData,
  getRoleConfig,
  demoOperationalRole,
  type AlertDemo,
  type TaskDemo,
  type NotificationDemo,
  type OperationalRoleId,
  type EmployeeNavItem,
} from "../../services/employee";

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  // Authentication & System State
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [is24Hour, setIs24Hour] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab] = useState<string>("dashboard");

  // Operational Role Architecture
  const activeRoleConfig = getRoleConfig(
    (currentUser?.operationalRole as OperationalRoleId) || demoOperationalRole
  );

  // Load centralized employee data
  const initialData = getDemoEmployeeData(currentUser);
  const [employeeInfo] = useState(initialData.employee);
  const [dutyInfo] = useState(initialData.duty);
  const [trainInfo] = useState(initialData.train);
  const [alerts, setAlerts] = useState<AlertDemo[]>(initialData.alerts);
  const [tasks, setTasks] = useState<TaskDemo[]>(initialData.tasks);
  const [notifications, setNotifications] = useState<NotificationDemo[]>(initialData.notifications);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle Task Status
  const toggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus =
            t.status === "Pending"
              ? "In Progress"
              : t.status === "In Progress"
              ? "Completed"
              : "Pending";
          showToast(`Task "${t.title}" updated to ${nextStatus}`);
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  // Mark alert as acknowledged
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    showToast("Alert acknowledged.");
  };

  // Mark all notifications read
  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast("All notifications marked as read.");
  };

  // Counts
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const criticalAlertsCount = alerts.filter((a) => a.severity === "CRITICAL").length;
  const pendingTasksCount = tasks.filter((t) => t.status !== "Completed").length;

  // Sidebar navigation menu items
  const navItems: EmployeeNavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/employee/dashboard", active: true },
    { id: "duty", label: "My Duty", icon: CalendarCheck, path: "/employee/duty", active: true },
    { id: "assignment", label: "My Train / My Section", icon: TrainFront, path: "/employee/assignment", active: true },
    { id: "alerts", label: "Operational Alerts", icon: AlertTriangle, path: "/employee/alerts", active: true, badge: alerts.length },
    { id: "tasks", label: "Tasks", icon: CheckSquare, path: "/employee/tasks", active: true, badge: pendingTasksCount },
    { id: "report_issue", label: "Report Issue", icon: FileWarning, path: "/employee/report", active: true },
    { id: "incident", label: "Incident Reporting", icon: Flame, path: "/employee/incidents", active: true },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/employee/notifications", active: true, badge: unreadCount },
    { id: "history", label: "Activity / History", icon: History, path: "/employee/history", active: true },
    { id: "profile", label: "Profile", icon: User, path: "/employee/profile", active: true },
  ];

  return (
    <div className="min-h-screen bg-[#031426] text-slate-100 flex flex-col font-sans">
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
                Employee Operations Dashboard
              </h1>
            </div>
          </div>
        </div>

        {/* Right Header Status, IST Clock, Notifications, Security & Logout */}
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

          {/* Notifications Trigger */}
          <button
            type="button"
            onClick={handleMarkNotificationsRead}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-[#16364A] bg-[#0A2036] text-[#D7E5EC] transition hover:border-[#0E7C86] hover:text-white"
            title="Mark notifications as read"
            aria-label="View notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[9px] font-bold text-white shadow-sm ring-2 ring-[#071A33]">
                {unreadCount}
              </span>
            )}
          </button>

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

      {/* MAIN CONTAINER WITH SIDEBAR & DASHBOARD */}
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
          {/* Sidebar Top: Header & Collapse Button */}
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
              const isCurrent = item.id === activeTab;
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
                  <span>{employeeInfo.division}</span>
                </div>
                <div className="text-[10px] text-[#71899C]">{employeeInfo.zone}</div>
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

        {/* DASHBOARD MAIN CONTENT */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ============================================================ */}
          {/* 1. HEADER / WELCOME SECTION                                 */}
          {/* ============================================================ */}
          <section className="rounded-xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="h-2 w-2 rounded-full bg-teal-400"></span>
                  <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                    {dutyInfo.dutyStatus || "On Duty"}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {getGreeting()}, <span className="text-white">{employeeInfo.name}</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {activeRoleConfig.name} • {dutyInfo.location}
                </p>
              </div>

              {/* Key Meta Information Strip */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-[#0A2036] px-4 py-3 rounded-lg border border-[#16364A]">
                <div>
                  <div className="text-[10px] font-medium text-slate-400">Employee ID</div>
                  <div className="text-xs font-mono font-semibold text-white mt-0.5">
                    {employeeInfo.employeeId}
                  </div>
                </div>
                <div className="h-7 w-px bg-[#16364A] hidden sm:block"></div>
                <div>
                  <div className="text-[10px] font-medium text-slate-400">Department</div>
                  <div className="text-xs font-semibold text-slate-200 mt-0.5">
                    {activeRoleConfig.department}
                  </div>
                </div>
                <div className="h-7 w-px bg-[#16364A] hidden sm:block"></div>
                <div>
                  <div className="text-[10px] font-medium text-slate-400">Duty Status</div>
                  <div className="text-xs font-semibold text-teal-400 mt-0.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400"></span>
                    {dutyInfo.dutyStatus || "On Duty"}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* 2. SUMMARY CARDS                                             */}
          {/* ============================================================ */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Today's Duty */}
            <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-4.5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium text-slate-400">Today's Duty</span>
                <CalendarCheck size={16} className="text-teal-400" />
              </div>
              <div className="text-xl font-bold text-white flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-teal-400"></span>
                {dutyInfo.dutyStatus}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {dutyInfo.shift}
              </div>
            </div>

            {/* Card 2: Assigned Train */}
            <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-4.5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium text-slate-400">Assigned Train</span>
                <TrainFront size={16} className="text-teal-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {trainInfo.trainNumber}
              </div>
              <div className="text-xs text-slate-400 mt-1 truncate">
                {trainInfo.assignedTrain}
              </div>
            </div>

            {/* Card 3: Active Alerts */}
            <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-4.5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium text-slate-400">Active Alerts</span>
                <AlertTriangle size={16} className="text-amber-400" />
              </div>
              <div className="text-xl font-bold text-white">
                {alerts.length}
              </div>
              <div className="text-xs mt-1 text-slate-400">
                {criticalAlertsCount > 0 ? (
                  <span className="text-amber-400 font-medium">{criticalAlertsCount} Critical</span>
                ) : (
                  "All normal"
                )}
              </div>
            </div>

            {/* Card 4: Pending Tasks */}
            <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-4.5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium text-slate-400">Pending Tasks</span>
                <CheckSquare size={16} className="text-teal-400" />
              </div>
              <div className="text-xl font-bold text-white">
                {pendingTasksCount}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Due during current shift
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* 3 & 4. MY CURRENT DUTY & MY STATION / TRAIN                  */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 3. MY CURRENT DUTY */}
            <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <CalendarCheck size={18} className="text-teal-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                      My Current Duty
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-950/60 text-teal-300 border border-teal-700/50 text-xs font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400"></span>
                    {dutyInfo.dutyStatus}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-base font-bold text-white">
                    {activeRoleConfig.name}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={13} className="text-teal-400" />
                    <span>{dutyInfo.location}</span>
                    {dutyInfo.stationCode && (
                      <span className="font-mono text-slate-400">({dutyInfo.stationCode})</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#0A2036] p-3 rounded-lg border border-[#16364A]">
                    <div className="text-slate-400 text-[11px]">Shift</div>
                    <div className="font-semibold text-white mt-0.5">
                      {dutyInfo.shift}
                    </div>
                  </div>

                  <div className="bg-[#0A2036] p-3 rounded-lg border border-[#16364A]">
                    <div className="text-slate-400 text-[11px]">Reporting Time</div>
                    <div className="font-semibold text-white mt-0.5">
                      {dutyInfo.reportingTime}
                    </div>
                  </div>

                  <div className="bg-[#0A2036] p-3 rounded-lg border border-[#16364A] sm:col-span-2">
                    <div className="text-slate-400 text-[11px]">Responsibility</div>
                    <div className="font-medium text-slate-200 mt-0.5">
                      {dutyInfo.responsibility}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#16364A] flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/employee/duty")}
                  className="text-teal-400 hover:text-teal-300 text-xs font-medium flex items-center gap-1"
                >
                  <span>View Full Roster</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* 4. MY STATION / TRAIN */}
            <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <TrainFront size={18} className="text-teal-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                      My Station / Train
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/60 text-blue-300 border border-blue-700/50 text-xs font-medium">
                    <Radio size={12} className="text-blue-400" />
                    {trainInfo.trainStatus}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-base font-bold text-white">
                    <span className="font-mono text-white mr-1.5">{trainInfo.trainNumber}</span>
                    <span>{trainInfo.assignedTrain}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Section: {trainInfo.section}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-[#0A2036] p-3 rounded-lg border border-[#16364A]">
                    <div className="text-slate-400 text-[11px]">Current Location</div>
                    <div className="font-semibold text-white mt-0.5 truncate">
                      {trainInfo.currentLocation}
                    </div>
                  </div>

                  <div className="bg-[#0A2036] p-3 rounded-lg border border-[#16364A]">
                    <div className="text-slate-400 text-[11px]">Next Station</div>
                    <div className="font-semibold text-slate-200 mt-0.5 truncate">
                      {trainInfo.nextStation}
                    </div>
                  </div>

                  <div className="bg-[#0A2036] p-3 rounded-lg border border-[#16364A]">
                    <div className="text-slate-400 text-[11px]">Delay</div>
                    <div className="font-semibold text-[#F59E0B] mt-0.5 flex items-center gap-1">
                      <span>{trainInfo.delay}</span>
                      <span className="text-[11px] text-slate-400 font-normal">({trainInfo.eta})</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#16364A] flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/employee/assignment")}
                  className="text-teal-400 hover:text-teal-300 text-xs font-medium flex items-center gap-1"
                >
                  <span>View Assignment</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 5. OPERATIONAL ALERTS & PENDING TASKS                        */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* OPERATIONAL ALERTS */}
            <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                      Operational Alerts
                    </h3>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#16364A] text-slate-300">
                    {alerts.length} Active
                  </span>
                </div>

                <div className="space-y-2.5">
                  {alerts.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      <CheckCircle2 size={22} className="mx-auto text-teal-400 mb-1" />
                      No active operational alerts.
                    </div>
                  ) : (
                    alerts.slice(0, 3).map((alert) => {
                      const isCritical = alert.severity === "CRITICAL";
                      const isHigh = alert.severity === "HIGH";

                      const badgeStyle = isCritical
                        ? "bg-red-950/60 text-red-300 border-red-700/50"
                        : isHigh
                        ? "bg-amber-950/60 text-amber-300 border-amber-700/50"
                        : "bg-blue-950/60 text-blue-300 border-blue-700/50";

                      return (
                        <div
                          key={alert.id}
                          className="rounded-lg border border-[#16364A] bg-[#0A2036] p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider shrink-0 ${badgeStyle}`}
                              >
                                {alert.severity}
                              </span>
                              <h4 className="text-xs font-semibold text-white truncate">{alert.title}</h4>
                            </div>

                            <span className="text-[10px] text-[#71899C] shrink-0 font-mono">
                              {alert.timestamp}
                            </span>
                          </div>

                          <div className="mt-2 text-xs text-slate-300 flex items-center justify-between">
                            <span className="font-mono text-slate-400 text-[11px]">
                              {alert.trainOrSection}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAcknowledgeAlert(alert.id)}
                              className="text-[10px] px-2 py-0.5 rounded bg-[#16364A] text-slate-300 hover:text-white hover:bg-[#0E7C86] transition"
                            >
                              Acknowledge
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#16364A] flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/employee/alerts")}
                  className="text-teal-400 hover:text-teal-300 text-xs font-medium flex items-center gap-1"
                >
                  <span>View All Alerts</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* PENDING TASKS */}
            <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckSquare size={18} className="text-teal-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                      Pending Tasks
                    </h3>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#16364A] text-slate-300">
                    {pendingTasksCount} Pending
                  </span>
                </div>

                <div className="space-y-2.5">
                  {tasks.slice(0, 3).map((task) => {
                    const isHigh = task.priority.includes("High");
                    const isCompleted = task.status === "Completed";

                    return (
                      <div
                        key={task.id}
                        className={`rounded-lg border p-3 transition flex items-center justify-between gap-3 ${
                          isCompleted
                            ? "bg-[#0A2036]/50 border-teal-900/30 opacity-70"
                            : "bg-[#0A2036] border-[#16364A]"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4
                              className={`text-xs font-medium ${
                                isCompleted ? "line-through text-slate-400" : "text-white"
                              }`}
                            >
                              {task.title}
                            </h4>
                            {isHigh && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded border bg-red-950/60 text-red-300 border-red-800/40 uppercase">
                                High
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <Clock size={11} className="text-slate-400" />
                            <span>{task.dueTime}</span>
                            {task.category && (
                              <span className="text-[#71899C]">• {task.category}</span>
                            )}
                          </div>
                        </div>

                        {/* Status Toggle Button */}
                        <button
                          type="button"
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded border transition shrink-0 ${
                            task.status === "Completed"
                              ? "bg-teal-950 text-teal-300 border-teal-600"
                              : task.status === "In Progress"
                              ? "bg-[#0A223D] text-teal-300 border-teal-500"
                              : "bg-[#16364A] text-slate-200 border-slate-600 hover:border-teal-400"
                          }`}
                          title="Click to change status"
                        >
                          {task.status || "Pending"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#16364A] flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/employee/tasks")}
                  className="text-teal-400 hover:text-teal-300 text-xs font-medium flex items-center gap-1"
                >
                  <span>View All Tasks</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 6. RECENT NOTIFICATIONS                                      */}
          {/* ============================================================ */}
          <section className="rounded-xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-teal-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Recent Notifications
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkNotificationsRead}
                    className="text-[11px] text-teal-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#16364A] text-slate-300">
                  {notifications.length} Total
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              {notifications.slice(0, 4).map((notif) => (
                <div
                  key={notif.id}
                  className={`rounded-lg p-3 border transition flex items-center justify-between gap-3 ${
                    !notif.isRead
                      ? "bg-[#0A2036] border-teal-500/40"
                      : "bg-[#0A2036]/60 border-[#16364A]/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        !notif.isRead ? "bg-[#F59E0B]" : "bg-slate-600"
                      }`}
                    />
                    <div className="min-w-0">
                      <div
                        className={`text-xs font-medium truncate ${
                          !notif.isRead ? "text-white font-semibold" : "text-slate-300"
                        }`}
                      >
                        {notif.title}
                      </div>
                      {notif.category && (
                        <span className="text-[10px] text-[#71899C]">{notif.category}</span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] text-[#71899C] shrink-0 font-mono">
                    {notif.timestamp}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#16364A] flex items-center justify-end">
              <button
                type="button"
                onClick={() => navigate("/employee/notifications")}
                className="text-teal-400 hover:text-teal-300 text-xs font-medium flex items-center gap-1"
              >
                <span>View All Notifications</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

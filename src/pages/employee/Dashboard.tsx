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
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  CircleDot,
  UserCircle,
  CheckCheck,
  Building2,
  Lock,
} from "lucide-react";
import { getCurrentUser, logout } from "../../services/auth";
import {
  getRoleSpecificDashboardData,
  type RoleTaskItem,
  type RoleAlertItem,
} from "../../services/employeeDashboardService";
import RoleDutyCard from "../../components/employee/RoleDutyCard";
import RoleAssignmentCard from "../../components/employee/RoleAssignmentCard";
import RoleDashboardSummary from "../../components/employee/RoleDashboardSummary";
import RoleTaskSummary from "../../components/employee/RoleTaskSummary";
import RoleAlertSummary from "../../components/employee/RoleAlertSummary";
import RoleQuickActions from "../../components/employee/RoleQuickActions";
import RoleDepartmentWarning from "../../components/employee/RoleDepartmentWarning";
import type { EmployeeNavItem, NotificationDemo } from "../../services/employee";

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  // Authentication & System State
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [is24Hour, setIs24Hour] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab] = useState<string>("dashboard");
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

  // Compute dynamic role dashboard data
  const roleData = getRoleSpecificDashboardData(currentUser);
  const { roleConfig, duty, assignment, summaryWidgets, isRoleValid, warningMessage } = roleData;

  // Local interactive states for Tasks & Alerts
  const [tasks, setTasks] = useState<RoleTaskItem[]>(roleData.tasks);
  const [alerts, setAlerts] = useState<RoleAlertItem[]>(roleData.alerts);
  const [notifications, setNotifications] = useState<NotificationDemo[]>([
    {
      id: "notif-01",
      title: `Duty shift roster for ${roleConfig.displayName} updated by Division`,
      timestamp: "Today, 06:00 AM",
      isRead: false,
      category: "Roster",
    },
    {
      id: "notif-02",
      title: "Quarterly Safety Protocol & Equipment Circular issued by Sr. Safety Officer",
      timestamp: "Yesterday, 04:30 PM",
      isRead: true,
      category: "Circular",
    },
    {
      id: "notif-03",
      title: "Monthly Medical & Competency Certificate Verification status: ACTIVE",
      timestamp: "12 Sep, 11:15 AM",
      isRead: true,
      category: "Personnel",
    },
  ]);

  // Update tasks/alerts if currentUser/role changes
  useEffect(() => {
    const nextData = getRoleSpecificDashboardData(currentUser);
    setTasks(nextData.tasks);
    setAlerts(nextData.alerts);
  }, [currentUser]);

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
          showToast(`Task status updated to ${nextStatus}`);
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

  // Computed Counts
  const unreadCount = notifications.filter((n) => !n.isRead).length;
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

  const employeeName = currentUser?.name || "Ramesh Sharma";
  const employeeId = currentUser?.employeeId || "IR-2024-8841";
  const departmentName = currentUser?.department || roleConfig.department;
  const roleDisplayTitle = isRoleValid ? roleConfig.displayName : "Operational Role Not Assigned";

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

        {/* Right Header: IST Clock, Notifications, Authorized User & Logout */}
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

          {/* Security & User Badge */}
          <div className="hidden items-center gap-2 border-l border-[#16364A] pl-3 sm:flex">
            <ShieldCheck size={18} className="text-[#0E7C86]" />

            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-white truncate max-w-[130px]">
                {employeeName}
              </div>
              <div className="text-[10px] text-teal-400 truncate max-w-[130px]">
                {roleDisplayTitle}
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
          {/* Sidebar Header & Collapse Button */}
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
                  <span className="truncate">{departmentName}</span>
                </div>
                <div className="text-[10px] text-[#71899C] truncate">
                  Role: {roleDisplayTitle}
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

        {/* DASHBOARD MAIN CONTENT */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ============================================================ */}
          {/* 1. ROLE / DEPARTMENT CONFIGURATION WARNING (IF MISMATCH)     */}
          {/* ============================================================ */}
          <RoleDepartmentWarning
            warningMessage={warningMessage}
            isUnassigned={!isRoleValid}
          />

          {/* ============================================================ */}
          {/* 2. DYNAMIC HEADER / WELCOME SECTION                          */}
          {/* ============================================================ */}
          <section className="rounded-xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="h-2 w-2 rounded-full bg-teal-400"></span>
                  <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                    {duty.dutyStatus}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {getGreeting()}, <span className="text-white">{employeeName}</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  <span className="text-teal-300 font-semibold">{roleDisplayTitle}</span>
                  {" • "}
                  <span className="text-slate-300">{departmentName}</span>
                  {" • "}
                  <span className="text-slate-400">{duty.location}</span>
                </p>
              </div>

              {/* Key Meta Information Strip */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-[#0A2036] px-4 py-3 rounded-lg border border-[#16364A]">
                <div>
                  <div className="text-[10px] font-medium text-slate-400">Employee ID</div>
                  <div className="text-xs font-mono font-semibold text-white mt-0.5">
                    {employeeId}
                  </div>
                </div>
                <div className="h-7 w-px bg-[#16364A] hidden sm:block"></div>
                <div>
                  <div className="text-[10px] font-medium text-slate-400">Department</div>
                  <div className="text-xs font-semibold text-slate-200 mt-0.5 truncate max-w-[160px]">
                    {departmentName}
                  </div>
                </div>
                <div className="h-7 w-px bg-[#16364A] hidden sm:block"></div>
                <div>
                  <div className="text-[10px] font-medium text-slate-400">Operational Role</div>
                  <div className="text-xs font-semibold text-teal-400 mt-0.5 truncate max-w-[150px]">
                    {roleDisplayTitle}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* 3. ROLE-SPECIFIC SUMMARY WIDGETS                             */}
          {/* ============================================================ */}
          <RoleDashboardSummary widgets={summaryWidgets} />

          {/* ============================================================ */}
          {/* 4. TODAY'S DUTY & CURRENT ASSIGNMENT (ROLE-AWARE)            */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* TODAY'S DUTY */}
            <RoleDutyCard duty={duty} roleConfig={roleConfig} />

            {/* CURRENT ASSIGNMENT */}
            <RoleAssignmentCard assignment={assignment} roleConfig={roleConfig} />
          </div>

          {/* ============================================================ */}
          {/* 5. ROLE-SPECIFIC ALERTS & TASKS                              */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* OPERATIONAL ALERTS */}
            <RoleAlertSummary
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
            />

            {/* PENDING TASKS */}
            <RoleTaskSummary
              tasks={tasks}
              onToggleStatus={toggleTaskStatus}
            />
          </div>

          {/* ============================================================ */}
          {/* 6. ROLE QUICK ACTIONS                                        */}
          {/* ============================================================ */}
          <RoleQuickActions roleConfig={roleConfig} />

          {/* ============================================================ */}
          {/* 7. RECENT NOTIFICATIONS                                      */}
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
                className="text-teal-400 hover:text-teal-300 text-xs font-medium flex items-center gap-1 transition"
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

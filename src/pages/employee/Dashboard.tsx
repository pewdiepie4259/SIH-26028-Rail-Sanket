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
  Mail,
  Radio,
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
import EmployeeSidebar from "../../components/employee/EmployeeSidebar";
import { saveTaskStatus } from "../../services/employeeTaskService";
import { RAILWAY_EMPLOYEE_SLIDES } from "../../data/railwayEmployees";
import LanguageAndA11yControls from "../../components/LanguageAndA11yControls";


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
  const [selectedNotification, setSelectedNotification] = useState<NotificationDemo | null>(null);

  // Indian Railways Dedicated Employee Hero Gallery slides - rotates every 5 minutes (300,000 ms)
  const [currentEmployeeSlide, setCurrentEmployeeSlide] = useState(() => {
    return Math.floor(Date.now() / (5 * 60 * 1000)) % RAILWAY_EMPLOYEE_SLIDES.length;
  });

  useEffect(() => {
    setCurrentEmployeeSlide(
      Math.floor(Date.now() / (5 * 60 * 1000)) % RAILWAY_EMPLOYEE_SLIDES.length
    );

    const slideTimer = setInterval(() => {
      setCurrentEmployeeSlide((prev) => (prev + 1) % RAILWAY_EMPLOYEE_SLIDES.length);
    }, 5 * 60 * 1000); // 5 minutes = 300,000 ms

    return () => clearInterval(slideTimer);
  }, []);


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


  // Real-time synchronization with Section Controller role allotment
  useEffect(() => {
    const handleAuthChange = () => {
      const u = getCurrentUser();
      if (u) setCurrentUser(u);
    };

    const handleRoleAssigned = (e: any) => {
      const detail = e.detail;
      const current = getCurrentUser();
      if (
        current &&
        detail &&
        (detail.employeeId === current.id ||
          detail.employeeId === current.employeeId ||
          detail.employeeId?.toLowerCase() === current.email?.toLowerCase())
      ) {
        const updated = {
          ...current,
          operationalRole: detail.operationalRole,
          department: detail.department || current.department,
        };
        setCurrentUser(updated);
        setToastMessage(`Operational Role updated to ${detail.operationalRole.replace(/_/g, " ").toUpperCase()} by Section Controller`);
      }
    };

    window.addEventListener("raildrishti_auth_changed", handleAuthChange);
    window.addEventListener("raildrishti_role_assigned", handleRoleAssigned);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("raildrishti_role_channel");
      bc.onmessage = (ev) => {
        if (ev.data?.type === "ROLE_ASSIGNED") {
          const detail = ev.data;
          const current = getCurrentUser();
          if (
            current &&
            (detail.employeeId === current.id ||
              detail.employeeId === current.employeeId ||
              detail.employeeId?.toLowerCase() === current.email?.toLowerCase())
          ) {
            const updated = {
              ...current,
              operationalRole: detail.operationalRole,
              department: detail.department || current.department,
            };
            setCurrentUser(updated);
            setToastMessage(`Real-time Alert: Operational Role assigned as ${detail.operationalRole.replace(/_/g, " ").toUpperCase()}`);
          }
        }
      };
    } catch {}

    // Polling fallback every 8 seconds for backend database updates
    const pollInterval = setInterval(async () => {
      const current = getCurrentUser();
      const identifier = current?.id || current?.employeeId || current?.email;
      if (!identifier) return;

      try {
        const res = await fetch(`http://localhost:5000/api/employee/status/${encodeURIComponent(identifier)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.operational_role) {
            if (current.operationalRole !== data.operational_role) {
              const updated = {
                ...current,
                operationalRole: data.operational_role,
                department: data.department || current.department,
              };
              localStorage.setItem("raildrishti_auth_user", JSON.stringify(updated));
              sessionStorage.setItem("raildrishti_auth_user", JSON.stringify(updated));
              setCurrentUser(updated);
              setToastMessage(`Operational Role synchronized: ${data.operational_role.replace(/_/g, " ").toUpperCase()}`);
            }
          }
        }
      } catch {}
    }, 8000);

    return () => {
      window.removeEventListener("raildrishti_auth_changed", handleAuthChange);
      window.removeEventListener("raildrishti_role_assigned", handleRoleAssigned);
      if (bc) bc.close();
      clearInterval(pollInterval);
    };
  }, []);

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

  // Helpers for persistent alert acknowledgement & read state
  const getStoredAckedAlerts = (): Record<string, { acknowledgedAt: string; read: boolean }> => {
    try {
      const raw = localStorage.getItem("raildrishti_acked_alerts");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const applyAckedState = (items: RoleAlertItem[]): RoleAlertItem[] => {
    const acked = getStoredAckedAlerts();
    return items.map((a) => {
      if (acked[a.id]) {
        return {
          ...a,
          status: "ACKNOWLEDGED",
          read: true,
          acknowledgedAt: acked[a.id].acknowledgedAt,
        };
      }
      return {
        ...a,
        status: a.status || "ACTIVE",
        read: a.read || false,
      };
    });
  };

  // Local interactive states for Tasks & Alerts
  const [tasks, setTasks] = useState<RoleTaskItem[]>(roleData.tasks);
  const [alerts, setAlerts] = useState<RoleAlertItem[]>(() => applyAckedState(roleData.alerts));
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
    setAlerts(applyAckedState(nextData.alerts));
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

  // Toggle or Set Task Status with persistent saving
  const toggleTaskStatus = (
    taskId: string,
    targetStatus?: "Pending" | "In Progress" | "Completed"
  ) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus =
            targetStatus ||
            (t.status === "Pending"
              ? "In Progress"
              : t.status === "In Progress"
              ? "Completed"
              : "Pending");
          saveTaskStatus(taskId, nextStatus);
          showToast(`Task status updated to ${nextStatus}`);
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  // Inspect and open notification
  const handleSelectNotification = (notif: NotificationDemo) => {
    setSelectedNotification(notif);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
  };


  // Mark alert as acknowledged and read
  const handleAcknowledgeAlert = (alertId: string) => {
    const timeFormatted = new Date().toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
    });

    setAlerts((prev) => {
      const target = prev.find((a) => a.id === alertId);
      const isCurrentlyAcked = target?.status === "ACKNOWLEDGED";
      const nextStatus = isCurrentlyAcked ? "ACTIVE" : "ACKNOWLEDGED";

      const ackedMap = getStoredAckedAlerts();
      if (nextStatus === "ACKNOWLEDGED") {
        ackedMap[alertId] = { acknowledgedAt: `${timeFormatted} IST`, read: true };
      } else {
        delete ackedMap[alertId];
      }
      try {
        localStorage.setItem("raildrishti_acked_alerts", JSON.stringify(ackedMap));
      } catch {}

      if (nextStatus === "ACKNOWLEDGED") {
        showToast(`Operational Alert "${target?.title || alertId}" acknowledged & marked as read.`);
        if ("speechSynthesis" in window) {
          try {
            const utter = new SpeechSynthesisUtterance("Alert acknowledged and recorded.");
            utter.rate = 1.05;
            window.speechSynthesis.speak(utter);
          } catch {}
        }
      } else {
        showToast(`Alert "${target?.title || alertId}" status reverted to active.`);
      }

      return prev.map((a) => {
        if (a.id === alertId) {
          return {
            ...a,
            status: nextStatus,
            read: true,
            acknowledgedAt: nextStatus === "ACKNOWLEDGED" ? `${timeFormatted} IST` : undefined,
          };
        }
        return a;
      });
    });
  };

  // Mark all notifications read
  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast("All notifications marked as read.");
  };

  // Computed Counts
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const pendingTasksCount = tasks.filter((t) => t.status !== "Completed").length;
  const activeAlertsCount = alerts.filter((a) => a.status !== "ACKNOWLEDGED").length;


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
      <header className="sticky top-0 z-40 flex h-[72px] shrink-0 items-center justify-between border-b border-[#164B5A] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-4 sm:px-6 shadow-lg">
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
                alt="RailSanket"
                className="h-full w-full object-contain p-0.5"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span translate="no" className="notranslate text-sm sm:text-base font-bold text-white tracking-wide">
                  Rail<span className="text-[#F59E0B]">Sanket</span>
                </span>
                <span className="rounded bg-[#0E7C86]/25 px-1.5 py-0.5 text-[10px] font-semibold text-teal-300 border border-[#0E7C86]/40">
                  Employee Portal
                </span>
              </div>
              <h1 className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] text-slate-300">
                Employee Operations Dashboard
              </h1>
            </div>
          </div>
        </div>

        {/* Right Header: IST Clock, Language Selector, Accessibility Tools, Notifications, User & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live IST Clock Capsule (Matching Language/A11y gradient & orange border) */}
          <div className="hidden sm:flex h-9 items-center gap-2 rounded-full border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-3 text-xs text-white shadow-sm transition-all duration-300">
            <Clock size={15} className="text-[#F59E0B]" />
            <div className="font-mono font-bold tracking-wider text-white">
              {formatIST(currentTime, is24Hour)} <span className="text-[#F59E0B] text-[10px] font-bold">IST</span>
            </div>
            <button
              type="button"
              onClick={() => setIs24Hour(!is24Hour)}
              className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white hover:bg-[#F59E0B] hover:text-[#071A33] transition cursor-pointer border border-white/20"
              title="Toggle 12H / 24H clock"
            >
              {is24Hour ? "24H" : "12H"}
            </button>
          </div>

          {/* Language Selector & Accessibility Tools */}
          <LanguageAndA11yControls buttonHeightClass="h-9" />

          {/* Notifications Trigger (Matching A11y square button gradient & orange border) */}
          <button
            type="button"
            onClick={() => navigate("/employee/notifications")}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] text-white transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-sm"
            title="View all notifications"
            aria-label="View all notifications"
          >
            <Bell size={18} className="text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[9px] font-black text-white shadow-sm ring-2 ring-[#071A33]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Security & User Badge */}
          <button
            type="button"
            onClick={() => navigate("/employee/profile")}
            className="hidden items-center gap-2 border-l border-[#16364A] pl-3 sm:flex hover:opacity-85 transition cursor-pointer text-left group"
            title="View Employee Profile"
          >
            <ShieldCheck size={18} className="text-[#0E7C86] group-hover:text-cyan-300 transition" />

            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-white group-hover:text-cyan-200 transition truncate max-w-[130px]">
                {employeeName}
              </div>
              <div className="text-[10px] text-teal-400 group-hover:text-teal-300 transition truncate max-w-[130px]">
                {roleDisplayTitle}
              </div>
            </div>

            <UserCircle size={24} className="text-[#AFC0D4] group-hover:text-white transition" />
          </button>


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
        <EmployeeSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          activeTab={activeTab}
          departmentName={departmentName}
          roleDisplayTitle={roleDisplayTitle}
          badges={{
            alerts: activeAlertsCount,
            tasks: pendingTasksCount,
            notifications: unreadCount,
          }}
          onShowToast={showToast}
        />

        {/* DASHBOARD MAIN CONTENT */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-[#031426] flex flex-col">
          {/* ============================================================ */}
          {/* 1. DYNAMIC HERO BANNER: FLUSH UNDER MAIN HEADER (0 GAP)      */}
          {/*    (End-to-End Banner • Changes smoothly every 5 minutes)    */}
          {/* ============================================================ */}
          <section className="relative w-full border-b border-[#164B5A] overflow-hidden min-h-[250px] shadow-xl shrink-0">
            {/* Background Employee Slide with Smooth Crossfade */}
            {RAILWAY_EMPLOYEE_SLIDES.map((slide, idx) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  idx === currentEmployeeSlide ? "opacity-100 z-0" : "opacity-0 pointer-events-none"
                }`}
              >
                <img
                  src={slide.image}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/home-theme-bg.jpg";
                  }}
                  alt={slide.title}
                  className="h-full w-full object-cover object-center"
                />
              </div>
            ))}

            {/* Dark teal vignette gradient overlay */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#031426]/95 via-[#071A33]/85 to-[#031426]/75 backdrop-brightness-90" />

            {/* Hero Content Overlay */}
            <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 flex flex-col justify-between min-h-[250px]">
              <div className="flex flex-col gap-4 items-start">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[11px] font-extrabold text-emerald-300 shadow-xs">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{duty.dutyStatus || "ON DUTY"}</span>
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-300">
                      Shift: <strong className="text-[#F59E0B]">{duty.shift}</strong>
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {getGreeting()}, <span className="text-[#F59E0B] font-black">{employeeName}</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-200 font-semibold mt-1">
                    <span className="text-[#F59E0B] font-bold">{roleDisplayTitle}</span>
                    {" • "}
                    <span className="text-teal-300 font-semibold">{departmentName}</span>
                    {" • "}
                    <span className="text-slate-200">{duty.location}</span>
                  </p>
                </div>

                {/* Key Meta Information Strip */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-[#071A33]/90 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 shadow-md">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee ID</div>
                    <div className="text-xs font-mono font-extrabold text-white mt-0.5">
                      {employeeId}
                    </div>
                  </div>
                  <div className="h-7 w-px bg-[#16364A] hidden sm:block"></div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department</div>
                    <div className="text-xs font-bold text-slate-100 mt-0.5 truncate max-w-[160px]">
                      {departmentName}
                    </div>
                  </div>
                  <div className="h-7 w-px bg-[#16364A] hidden sm:block"></div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Operational Role</div>
                    <div className="text-xs font-black text-[#F59E0B] mt-0.5 truncate max-w-[170px]">
                      {roleDisplayTitle}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Operational Status Bar & 5-Min Slide Indicators */}
              <div className="flex flex-wrap items-center justify-between pt-4 mt-3 border-t border-white/10 text-xs gap-3">
                <span className="text-[11px] text-slate-300 font-medium">
                  Saluting Indian Railways Workforce • 24x7 Operations Nationwide
                </span>

                <div className="flex items-center gap-3">
                  {/* 5-Minute Auto-Rotating Slide Indicators */}
                  <div className="flex items-center gap-1.5 bg-[#031426]/70 px-2.5 py-1 rounded-full border border-white/15 backdrop-blur-xs">
                    {RAILWAY_EMPLOYEE_SLIDES.map((slide, idx) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => setCurrentEmployeeSlide(idx)}
                        title={`Slide ${idx + 1}: ${slide.title} (Changes every 5 mins)`}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === currentEmployeeSlide
                            ? "w-5 bg-[#F59E0B]"
                            : "w-2 bg-white/30 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-[11px] text-emerald-400 font-bold font-mono hidden sm:inline">
                    Active Shift Telemetry • RailSanket
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* 2. LIVE ALERTS MARQUEE TICKER STRIP (Slower, Live Alerts)     */}
          {/* ============================================================ */}
          <section className="relative z-20 w-full shrink-0 border-b border-[#164B5A] bg-gradient-to-r from-[#071A33] via-[#0A2D3B] to-[#071A33] shadow-inner">
            <div className="flex h-11 w-full items-center min-w-0">
              {/* Sticky Left Category Title */}
              <div className="z-10 flex h-full shrink-0 items-center gap-2 border-r border-[#164B5A] bg-[#071A33] px-3 sm:px-5 shadow-sm">
                <Radio size={15} className="text-[#F59E0B] animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-white whitespace-nowrap flex items-center gap-1.5">
                  <span>Live Alerts</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-extrabold font-mono">LIVE</span>
                </span>
              </div>

              {/* Scrolling Marquee Container (Relaxed 65s speed) */}
              <div className="relative flex-1 min-w-0 overflow-hidden">
                <div
                  className="alert-marquee flex w-max items-center py-2"
                  style={{ animationDuration: "65s" }}
                >
                  {[
                    ...alerts.map((a) => ({
                      id: `alert-${a.id}`,
                      badge: (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            a.severity === "HIGH"
                              ? "bg-red-500/20 text-red-400 border border-red-500/40"
                              : a.severity === "MEDIUM"
                              ? "bg-amber-500/20 text-[#F59E0B] border border-[#F59E0B]/40"
                              : "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                          }`}
                        >
                          {a.severity === "HIGH" ? "CRITICAL ALERT" : a.severity === "MEDIUM" ? "CAUTION" : "ADVISORY"}
                        </span>
                      ),
                      text: `${a.title} • ${duty.location || "Section Corridor"}`,
                      time: a.timestamp || "Just now",
                      onClick: () => handleAcknowledgeAlert(a.id),
                    })),
                    {
                      id: "live-rtis",
                      badge: (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          RTIS LIVE
                        </span>
                      ),
                      text: "Real-time Telemetry feed online for all active coaching rakes and locomotives in section.",
                      time: "Live Feed",
                      onClick: () => navigate("/live"),
                    },
                    {
                      id: "speed-restriction",
                      badge: (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-[#F59E0B] border border-[#F59E0B]/40">
                          SPEED CAUTION
                        </span>
                      ),
                      text: "Speed restriction (30 km/h) active between station blocks for track inspection squad.",
                      time: "Active Order",
                      onClick: undefined,
                    },
                    {
                      id: "safety-vigil",
                      badge: (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40">
                          SAFETY VIGIL
                        </span>
                      ),
                      text: "Maintain continuous vigil for OHE status and interlocking signal feedback during shifts.",
                      time: "Urgent",
                      onClick: undefined,
                    },
                    {
                      id: "platform-clearance",
                      badge: (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40">
                          LINE CLEAR
                        </span>
                      ),
                      text: `Platform 1 & 2 operational clearances recorded for incoming corridor traffic at ${duty.location || "Terminal"}.`,
                      time: "Recent",
                      onClick: undefined,
                    },
                  ]
                    .concat([
                      ...alerts.map((a) => ({
                        id: `alert-dup-${a.id}`,
                        badge: (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              a.severity === "HIGH"
                                ? "bg-red-500/20 text-red-400 border border-red-500/40"
                                : a.severity === "MEDIUM"
                                ? "bg-amber-500/20 text-[#F59E0B] border border-[#F59E0B]/40"
                                : "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                            }`}
                          >
                            {a.severity === "HIGH" ? "CRITICAL ALERT" : a.severity === "MEDIUM" ? "CAUTION" : "ADVISORY"}
                          </span>
                        ),
                        text: `${a.title} • ${duty.location || "Section Corridor"}`,
                        time: a.timestamp || "Just now",
                        onClick: () => handleAcknowledgeAlert(a.id),
                      })),
                      {
                        id: "live-rtis-dup",
                        badge: (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            RTIS LIVE
                          </span>
                        ),
                        text: "Real-time Telemetry feed online for all active coaching rakes and locomotives in section.",
                        time: "Live Feed",
                        onClick: () => navigate("/live"),
                      },
                      {
                        id: "speed-restriction-dup",
                        badge: (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-[#F59E0B] border border-[#F59E0B]/40">
                            SPEED CAUTION
                          </span>
                        ),
                        text: "Speed restriction (30 km/h) active between station blocks for track inspection squad.",
                        time: "Active Order",
                        onClick: undefined,
                      },
                    ])
                    .map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        onClick={() => item.onClick && item.onClick()}
                        className="flex items-center gap-2 whitespace-nowrap px-5 text-xs font-medium text-slate-200 hover:text-white cursor-pointer transition group"
                      >
                        {item.badge}
                        <span className="group-hover:underline decoration-[#F59E0B] font-semibold">{item.text}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({item.time})</span>
                        <span className="mx-2 text-[#164B5A] font-bold">•</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* 3. PADDED MAIN CONTENT CONTAINER                             */}
          {/* ============================================================ */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
            {/* ROLE / DEPARTMENT CONFIGURATION WARNING (IF MISMATCH) */}
            <RoleDepartmentWarning
              warningMessage={warningMessage}
              isUnassigned={!isRoleValid}
            />

            {/* ROLE-SPECIFIC SUMMARY WIDGETS */}
            <RoleDashboardSummary widgets={summaryWidgets} />

            {/* TODAY'S DUTY & CURRENT ASSIGNMENT (ROLE-AWARE) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* TODAY'S DUTY */}
              <RoleDutyCard duty={duty} roleConfig={roleConfig} />

              {/* CURRENT ASSIGNMENT */}
              <RoleAssignmentCard assignment={assignment} roleConfig={roleConfig} />
            </div>

            {/* ROLE-SPECIFIC ALERTS & TASKS */}
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

            {/* QUICK ACTIONS */}
            <RoleQuickActions
              roleConfig={roleConfig}
              onShowToast={showToast}
            />

            {/* RECENT NOTIFICATIONS */}
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
                    onClick={() => handleSelectNotification(notif)}
                    className={`rounded-lg p-3 border transition flex items-center justify-between gap-3 cursor-pointer group ${
                      !notif.isRead
                        ? "bg-[#0A2036] border-teal-500/40 hover:border-teal-400 hover:bg-[#0A223D]"
                        : "bg-[#0A2036]/60 border-[#16364A]/60 hover:border-teal-500/50 hover:bg-[#0A2036]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${
                          !notif.isRead ? "bg-[#F59E0B] animate-pulse" : "bg-slate-600"
                        }`}
                      />
                      <div className="min-w-0">
                        <div
                          className={`text-xs font-medium truncate group-hover:text-cyan-200 transition ${
                            !notif.isRead ? "text-white font-semibold" : "text-slate-300"
                          }`}
                        >
                          {notif.title}
                        </div>
                        {notif.category && (
                          <span className="text-[10px] text-[#71899C] group-hover:text-teal-400 transition">
                            {notif.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-[#71899C] font-mono">
                        {notif.timestamp}
                      </span>
                      <span className="text-[10px] text-teal-400 opacity-0 group-hover:opacity-100 transition hidden sm:inline-block">
                        View →
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-[#16364A] flex items-center justify-between">
                <span className="text-[11px] text-[#71899C]">
                  Select any notification to inspect or mark read.
                </span>
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
          </div>
        </main>

          {/* NOTIFICATION INSPECTION MODAL */}
          {selectedNotification && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
              onClick={() => setSelectedNotification(null)}
            >
              <div
                className="w-full max-w-lg rounded-xl border border-[#16364A] bg-[#071A33] p-6 shadow-2xl space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-3 border-b border-[#16364A] pb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-teal-950/60 border border-teal-600/50 flex items-center justify-center text-teal-300 shrink-0">
                      <Bell size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider bg-teal-950/80 text-teal-300 border-teal-700/60">
                          {selectedNotification.category || "NOTIFICATION"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {selectedNotification.timestamp}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                        {selectedNotification.title}
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedNotification(null)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#16364A]"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="bg-[#0A2036] p-4 rounded-lg border border-[#16364A] space-y-2 text-xs">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Official Notice Detail
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    {selectedNotification.title}. Please acknowledge this notification and take any required operational action in accordance with Indian Railways standard procedures.
                  </p>
                </div>

                <div className="border-t border-[#16364A] pt-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const cat = selectedNotification.category?.toLowerCase() || "";
                      if (cat.includes("roster") || cat.includes("duty")) {
                        navigate("/employee/duty");
                      } else if (cat.includes("circular") || cat.includes("directive")) {
                        navigate("/employee/mail");
                      } else if (cat.includes("personnel")) {
                        navigate("/employee/profile");
                      } else {
                        navigate("/employee/notifications");
                      }
                      setSelectedNotification(null);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-[#16364A] text-teal-400 hover:text-teal-300 hover:bg-[#0A2036] text-xs flex items-center gap-1.5 transition"
                  >
                    <span>View Related Module</span>
                    <ChevronRight size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedNotification(null)}
                    className="px-3 py-1.5 rounded-lg bg-[#16364A] text-slate-300 hover:text-white text-xs transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

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
  Radio,
  Building2,
  CircleDot,
  CheckCheck,
  Zap,
  UserCircle,
  GitCommit,
  HeartPulse,
  Ticket,
  Wrench,
  CheckCircle2,
  Lock,
  ArrowRight,
  Activity,
  Layers,
} from "lucide-react";
import { getCurrentUser, logout } from "../../services/auth";
import {
  getRoleAssignmentViewData,
  type MetricCard,
} from "../../services/employeeAssignmentService";
import RoleDepartmentWarning from "../../components/employee/RoleDepartmentWarning";
import type { EmployeeNavItem } from "../../services/employee";

export default function EmployeeAssignment() {
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

  // Compute dynamic role assignment data
  const assignmentData = getRoleAssignmentViewData(currentUser);

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

  const getMetricIcon = (type: MetricCard["iconType"]) => {
    switch (type) {
      case "train":
        return <TrainFront size={16} className="text-teal-400" />;
      case "station":
        return <Building2 size={16} className="text-teal-400" />;
      case "track":
        return <GitCommit size={16} className="text-teal-400" />;
      case "signal":
        return <Radio size={16} className="text-teal-400" />;
      case "shield":
        return <ShieldCheck size={16} className="text-teal-400" />;
      case "heart":
        return <HeartPulse size={16} className="text-rose-400" />;
      case "zap":
        return <Zap size={16} className="text-amber-400" />;
      case "ticket":
        return <Ticket size={16} className="text-teal-400" />;
      case "wrench":
        return <Wrench size={16} className="text-teal-400" />;
      case "check":
      default:
        return <CheckCircle2 size={16} className="text-emerald-400" />;
    }
  };

  const getBadgeStyle = (color?: string) => {
    switch (color) {
      case "amber":
        return "bg-amber-950/60 text-amber-300 border-amber-700/50";
      case "rose":
        return "bg-rose-950/60 text-rose-300 border-rose-700/50";
      case "blue":
        return "bg-blue-950/60 text-blue-300 border-blue-700/50";
      case "emerald":
        return "bg-emerald-950/60 text-emerald-300 border-emerald-700/50";
      case "teal":
      default:
        return "bg-teal-950/60 text-teal-300 border-teal-700/50";
    }
  };

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
                Operational Assignment
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
                {assignmentData.employeeName}
              </div>
              <div className="text-[10px] text-teal-400 truncate max-w-[130px]">
                {assignmentData.roleTitle}
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
              const isCurrent = item.id === "assignment";
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
                  <span className="truncate">{assignmentData.department}</span>
                </div>
                <div className="text-[10px] text-[#71899C] truncate">
                  Role: {assignmentData.roleTitle}
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

        {/* ASSIGNMENT MAIN CONTENT */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ============================================================ */}
          {/* 1. CONFIGURATION WARNING (IF MISMATCH OR UNASSIGNED)         */}
          {/* ============================================================ */}
          <RoleDepartmentWarning
            warningMessage={assignmentData.warningMessage}
            isUnassigned={!assignmentData.isRoleValid}
          />

          {/* ============================================================ */}
          {/* 2. DYNAMIC HERO / ASSIGNMENT SCOPE PASS                      */}
          {/* ============================================================ */}
          <section className="relative overflow-hidden rounded-2xl border border-[#16364A] bg-gradient-to-br from-[#0A223D] via-[#071A33] to-[#041224] p-5 sm:p-7 shadow-xl">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#0E7C86]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-[#F59E0B]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Left Details */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm border ${getBadgeStyle(
                      assignmentData.statusBadgeColor
                    )}`}
                  >
                    <Radio size={12} className="animate-pulse" />
                    {assignmentData.assignmentBadge}
                  </span>
                  <span className="text-xs font-mono font-medium text-slate-400 bg-[#061629] px-2.5 py-1 rounded-md border border-[#16364A]">
                    ID #{assignmentData.employeeId}
                  </span>
                  <span className="text-xs font-medium text-teal-300 bg-[#0E7C86]/20 px-2.5 py-1 rounded-md border border-teal-500/30">
                    {assignmentData.liveStatusLabel}
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {assignmentData.pageTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    {assignmentData.pageSubtitle}
                  </p>
                </div>
              </div>

              {/* Right Employee Identity Card */}
              <div className="w-full lg:w-auto shrink-0 bg-[#061629]/90 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-[#1E4260] shadow-md flex flex-col sm:flex-row items-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#0E7C86] to-[#0A2036] flex items-center justify-center text-white text-xl font-bold border-2 border-teal-400/50 shadow-inner">
                    {assignmentData.employeeName.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-teal-500 rounded-full border-2 border-[#061629] flex items-center justify-center" title="Verified Staff">
                    <ShieldCheck size={11} className="text-white" />
                  </div>
                </div>

                <div className="text-center sm:text-left space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-sm font-bold text-white tracking-wide">
                      {assignmentData.employeeName}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-700/50 font-semibold">
                      {assignmentData.employeeId}
                    </span>
                  </div>

                  <div className="text-xs text-teal-400 font-semibold">
                    {assignmentData.roleTitle}
                  </div>

                  <div className="text-[11px] text-slate-300">
                    Scope: <span className="text-teal-300 font-medium">{assignmentData.roleConfig.assignmentType}</span>
                  </div>

                  <div className="text-[10px] text-slate-400 truncate max-w-[220px]">
                    Dept: {assignmentData.department}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* 3. ROLE KPI METRICS (4 DYNAMIC TILES)                        */}
          {/* ============================================================ */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {assignmentData.metrics.map((metric, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[#16364A] bg-[#071A33] p-4.5 shadow-sm transition hover:border-[#0E7C86]/50"
              >
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium text-slate-400 truncate pr-1">
                    {metric.title}
                  </span>
                  {getMetricIcon(metric.iconType)}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="text-lg sm:text-xl font-bold font-mono text-white truncate">
                    {metric.value}
                  </div>
                  {metric.statusBadge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${getBadgeStyle(
                        metric.statusBadge.color
                      )}`}
                    >
                      {metric.statusBadge.text}
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-400 mt-1 truncate">
                  {metric.subtitle}
                </div>
              </div>
            ))}
          </section>

          {/* ============================================================ */}
          {/* 4. CURRENT ASSIGNMENT DETAILS & OPERATIONAL DATA             */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* PRIMARY ASSIGNMENT (7 COLS) */}
            <div className="lg:col-span-7 space-y-6">
              <section className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-5">
                  <div className="flex items-center gap-2.5">
                    <Layers size={18} className="text-teal-400" />
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                        {assignmentData.assignmentTitle}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Primary target specifications & operational route
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-[#0A2036] text-teal-300 border border-teal-500/30">
                    {assignmentData.statusText}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {assignmentData.primaryDetails.map((detail, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border ${
                        detail.highlight
                          ? "bg-gradient-to-br from-[#0A2036] to-[#06172A] border-teal-500/40 sm:col-span-2"
                          : "bg-[#0A2036] border-[#16364A]"
                      }`}
                    >
                      <div className="text-slate-400 text-[10px] uppercase tracking-wider">
                        {detail.label}
                      </div>
                      <div
                        className={`mt-1 ${
                          detail.mono ? "font-mono" : ""
                        } ${
                          detail.highlight
                            ? "text-base font-bold text-teal-300"
                            : "font-semibold text-white"
                        }`}
                      >
                        {detail.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Secondary details if present */}
                {assignmentData.secondaryDetails.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#16364A]/60 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {assignmentData.secondaryDetails.map((detail, idx) => (
                      <div
                        key={idx}
                        className="bg-[#0A2036]/60 p-2.5 rounded-lg border border-[#16364A]/60 flex items-center justify-between"
                      >
                        <span className="text-slate-400 text-[11px]">{detail.label}</span>
                        <span className="font-semibold text-white truncate max-w-[200px]">
                          {detail.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* OPERATIONAL PROTOCOLS & SAFETY DIRECTIVES (5 COLS) */}
            <div className="lg:col-span-5 space-y-6">
              <section className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Activity size={18} className="text-[#F59E0B]" />
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                        Operational Protocols
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Directives for {assignmentData.roleTitle}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-teal-400 font-semibold bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-700/50">
                    Active SOP
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {assignmentData.operationalProtocols.map((protocol, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#0A2036] border border-[#16364A] flex items-start gap-2.5 text-slate-300 leading-relaxed"
                    >
                      <span className="h-5 w-5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{protocol}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-[#16364A] flex items-center justify-between text-[11px] text-slate-400">
                  <span>Authorized by Railway Board</span>
                  <span className="text-teal-400 font-medium">Compliance Enforced</span>
                </div>
              </section>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 5. ROLE-SPECIFIC QUICK ACTIONS                               */}
          {/* ============================================================ */}
          <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Need to update or report issues regarding this assignment?
                </div>
                <div className="text-[11px] text-slate-400">
                  Operational submissions are relayed directly to the Divisional Control Room.
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              {assignmentData.quickActions.map((action, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => navigate(action.route)}
                  className="px-3.5 py-2 rounded-lg bg-[#0A2036] hover:bg-[#0E5961] text-xs font-semibold text-teal-300 border border-[#16364A] hover:border-teal-400/50 transition flex items-center justify-center gap-1.5"
                >
                  <Zap size={13} className="text-[#F59E0B]" />
                  <span>{action.label}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => navigate("/employee/duty")}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#0E7C86] to-[#0A545C] hover:from-[#11919C] hover:to-[#0D6B75] text-xs font-bold text-white shadow-md border border-teal-400/40 transition flex items-center justify-center gap-1.5"
              >
                <span>My Duty Roster</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  TrainFront,
  AlertTriangle,
  CheckSquare,
  Square,
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
  Building2,
  CircleDot,
  UserCircle,
  CheckCheck,
  CheckCircle2,
  Briefcase,
  ArrowRight,
  Lock,
  Radio,
  PhoneCall,
  Activity,
  Layers,
  UserCheck,
  Timer,
  AlertCircle,
  Award,
  Zap,
} from "lucide-react";
import { getCurrentUser, logout } from "../../services/auth";
import {
  getRoleDutyData,
  type DutyCheckpoint,
} from "../../services/employeeDutyService";
import RoleDepartmentWarning from "../../components/employee/RoleDepartmentWarning";
import type { EmployeeNavItem } from "../../services/employee";

export default function EmployeeDuty() {
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

  // Compute dynamic role duty data
  const dutyData = getRoleDutyData(currentUser);

  // Checkpoints interactive state
  const [checkpoints, setCheckpoints] = useState<DutyCheckpoint[]>(dutyData.checkpoints);

  useEffect(() => {
    const nextData = getRoleDutyData(currentUser);
    setCheckpoints(nextData.checkpoints);
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

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleCheckpoint = (id: number) => {
    setCheckpoints((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.completed;
          showToast(
            nextState
              ? `Marked "${item.text.slice(0, 30)}..." as Completed`
              : `Marked "${item.text.slice(0, 30)}..." as Pending`
          );
          return { ...item, completed: nextState };
        }
        return item;
      })
    );
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

  const completedCount = checkpoints.filter((c) => c.completed).length;
  const checkpointProgress = checkpoints.length > 0 ? Math.round((completedCount / checkpoints.length) * 100) : 0;

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
                Duty Roster & Operations
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
                {dutyData.employeeName}
              </div>
              <div className="text-[10px] text-teal-400 truncate max-w-[130px]">
                {dutyData.roleTitle}
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
              const isCurrent = item.id === "duty";
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
                  <span className="truncate">{dutyData.department}</span>
                </div>
                <div className="text-[10px] text-[#71899C] truncate">
                  Role: {dutyData.roleTitle}
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

        {/* MY DUTY MAIN CONTENT */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ============================================================ */}
          {/* 1. CONFIGURATION WARNING (IF MISMATCH OR UNASSIGNED)         */}
          {/* ============================================================ */}
          <RoleDepartmentWarning
            warningMessage={dutyData.warningMessage}
            isUnassigned={!dutyData.isRoleValid}
          />

          {/* ============================================================ */}
          {/* 2. HERO OPERATIONAL DUTY PASS & LIVE SHIFT STATUS            */}
          {/* ============================================================ */}
          <section className="relative overflow-hidden rounded-2xl border border-[#16364A] bg-gradient-to-br from-[#0A223D] via-[#071A33] to-[#041224] p-5 sm:p-7 shadow-xl">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#0E7C86]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-[#F59E0B]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Left Details */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-bold tracking-wide uppercase shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse"></span>
                    {dutyData.dutyStatus}
                  </span>
                  <span className="text-xs font-mono font-medium text-slate-400 bg-[#061629] px-2.5 py-1 rounded-md border border-[#16364A]">
                    ID #{dutyData.employeeId}
                  </span>
                  <span className="text-xs font-medium text-amber-300/90 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 flex items-center gap-1">
                    <Award size={13} className="text-[#F59E0B]" />
                    {dutyData.shiftWindow}
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    MY OPERATIONAL DUTY
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Official duty assignment, operational responsibilities, and live shift protocol under{" "}
                    <span className="text-teal-300 font-medium">{dutyData.department}</span>.
                  </p>
                </div>

                {/* Shift Progress */}
                <div className="pt-2 max-w-xl">
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <Timer size={14} className="text-teal-400" />
                      Shift Progress ({dutyData.shiftStart} – {dutyData.shiftEnd})
                    </span>
                    <span className="font-mono text-teal-300 font-semibold">
                      Active Shift Window
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#061629] rounded-full overflow-hidden border border-[#16364A]/80">
                    <div
                      className="h-full bg-gradient-to-r from-[#0E7C86] to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: "65%" }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>Sign-on: {dutyData.signOnTime}</span>
                    <span>Status: {dutyData.dutyStatus}</span>
                    <span>Handover Due: End of Shift</span>
                  </div>
                </div>
              </div>

              {/* Right Employee Identity Card */}
              <div className="w-full lg:w-auto shrink-0 bg-[#061629]/90 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-[#1E4260] shadow-md flex flex-col sm:flex-row items-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#0E7C86] to-[#0A2036] flex items-center justify-center text-white text-xl font-bold border-2 border-teal-400/50 shadow-inner">
                    {dutyData.employeeName.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-teal-500 rounded-full border-2 border-[#061629] flex items-center justify-center" title="Verified Staff">
                    <ShieldCheck size={11} className="text-white" />
                  </div>
                </div>

                <div className="text-center sm:text-left space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-sm font-bold text-white tracking-wide">
                      {dutyData.employeeName}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-700/50 font-semibold">
                      {dutyData.employeeId}
                    </span>
                  </div>

                  <div className="text-xs text-teal-400 font-semibold">
                    {dutyData.roleTitle}
                  </div>

                  <div className="text-[11px] text-slate-300 flex items-center justify-center sm:justify-start gap-1.5 pt-0.5">
                    <MapPin size={12} className="text-[#F59E0B] shrink-0" />
                    <span className="truncate max-w-[200px]">{dutyData.location}</span>
                  </div>

                  <div className="text-[10px] text-slate-400 truncate max-w-[220px]">
                    Dept: {dutyData.department}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* 3. CORE DUTY ATTRIBUTES GRID (4 TILES)                       */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tile 1: Duty Type */}
            <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-4 sm:p-5 hover:border-teal-500/40 transition">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="uppercase tracking-wider font-semibold text-[11px] text-slate-400">Duty Type</span>
                <Briefcase size={16} className="text-teal-400" />
              </div>
              <div className="text-base font-bold text-white tracking-wide truncate">
                {dutyData.dutyType}
              </div>
              <div className="text-xs text-teal-300 mt-1 truncate">
                {dutyData.roleTitle}
              </div>
            </div>

            {/* Tile 2: Duty Location */}
            <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-4 sm:p-5 hover:border-teal-500/40 transition">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="uppercase tracking-wider font-semibold text-[11px] text-slate-400">Duty Location</span>
                <MapPin size={16} className="text-[#F59E0B]" />
              </div>
              <div className="text-base font-bold text-white tracking-wide flex items-center gap-2 truncate">
                <span className="truncate">{dutyData.location}</span>
                {dutyData.stationCode && (
                  <span className="text-xs font-mono font-bold bg-[#0A2036] text-teal-300 px-2 py-0.5 rounded border border-[#16364A]">
                    {dutyData.stationCode}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-300 mt-1 truncate">
                Supervised by: {dutyData.supervisorName}
              </div>
            </div>

            {/* Tile 3: Shift Window */}
            <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-4 sm:p-5 hover:border-teal-500/40 transition">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="uppercase tracking-wider font-semibold text-[11px] text-slate-400">Shift Window</span>
                <Clock size={16} className="text-teal-400" />
              </div>
              <div className="text-base font-bold font-mono text-white tracking-wide">
                {dutyData.shiftStart} – {dutyData.shiftEnd}
              </div>
              <div className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                <span className="text-emerald-400 font-semibold">● Active Shift</span>
                <span>• 8 Hours Duration</span>
              </div>
            </div>

            {/* Tile 4: Duty Status */}
            <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-4 sm:p-5 hover:border-teal-500/40 transition">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="uppercase tracking-wider font-semibold text-[11px] text-slate-400">Duty Status</span>
                <UserCheck size={16} className="text-emerald-400" />
              </div>
              <div className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span className="text-emerald-400 font-semibold">✓ {dutyData.dutyStatus}</span>
              </div>
              <div className="text-xs text-slate-300 mt-1">
                Sign-on: {dutyData.signOnTime} (Cleared)
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 4. PRIMARY RESPONSIBILITY BANNER                             */}
          {/* ============================================================ */}
          <section className="rounded-xl border border-[#16364A] bg-[#071A33] p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Primary Operational Responsibility
                </div>
                <div className="text-sm font-semibold text-white leading-relaxed">
                  {dutyData.primaryResponsibility}
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* 5. TWO-COLUMN SPLIT: SHIFT TIMELINE & ACTIVE ASSIGNMENT      */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT: TODAY'S SHIFT TIMELINE (7 COLS) */}
            <div className="lg:col-span-7 space-y-6">
              <section className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-5">
                  <div className="flex items-center gap-2.5">
                    <Clock size={18} className="text-teal-400" />
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                        Shift Operational Timeline
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Milestones for {dutyData.roleTitle} shift
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-[#0A2036] text-teal-300 border border-teal-500/30">
                    {dutyData.timeline.length} Milestones
                  </span>
                </div>

                {/* Timeline Items */}
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#16364A]">
                  {dutyData.timeline.map((item, idx) => {
                    const isCompleted = item.status === "completed";
                    const isActive = item.status === "active";
                    return (
                      <div key={idx} className="relative group">
                        {/* Timeline node icon */}
                        <div
                          className={`absolute -left-6 top-0.5 h-4 w-4 rounded-full border-2 transition-all flex items-center justify-center ${
                            isCompleted
                              ? "bg-teal-500 border-teal-400 text-slate-950"
                              : isActive
                              ? "bg-[#0E7C86] border-[#F59E0B] ring-4 ring-[#F59E0B]/20 animate-pulse"
                              : "bg-[#0A2036] border-[#16364A]"
                          }`}
                        >
                          {isCompleted && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                          {isActive && <div className="h-1.5 w-1.5 bg-[#F59E0B] rounded-full" />}
                        </div>

                        {/* Card Content */}
                        <div
                          className={`p-3.5 rounded-xl border transition ${
                            isActive
                              ? "bg-gradient-to-r from-[#0E7C86]/20 to-[#0A2036] border-teal-500/50 shadow-md"
                              : isCompleted
                              ? "bg-[#0A2036]/70 border-[#16364A]/80"
                              : "bg-[#061629]/50 border-[#16364A]/40 opacity-70"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-teal-300">
                                {item.time}
                              </span>
                              <span className="text-xs font-bold text-white">
                                {item.title}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                isCompleted
                                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/50"
                                  : isActive
                                  ? "bg-amber-950/80 text-amber-300 border border-amber-500/50"
                                  : "bg-slate-800 text-slate-400 border border-slate-700"
                              }`}
                            >
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {item.subtext}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* OPERATIONAL PROTOCOL & SUPERVISORY CONTACTS */}
              <section className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Radio size={18} className="text-teal-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      Section Control & Supervisory Contacts
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">VHF Channel 04 Active</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-[#0A2036] p-3 rounded-lg border border-[#16364A] space-y-1">
                    <div className="text-slate-400 text-[11px] flex items-center justify-between">
                      <span>Reporting Officer</span>
                      <PhoneCall size={12} className="text-teal-400" />
                    </div>
                    <div className="font-semibold text-white truncate">{dutyData.supervisorName}</div>
                    <div className="text-[11px] font-mono text-teal-300">Direct Official Line</div>
                  </div>

                  <div className="bg-[#0A2036] p-3 rounded-lg border border-[#16364A] space-y-1">
                    <div className="text-slate-400 text-[11px] flex items-center justify-between">
                      <span>Section Controller</span>
                      <PhoneCall size={12} className="text-teal-400" />
                    </div>
                    <div className="font-semibold text-white">Division Traffic Desk</div>
                    <div className="text-[11px] font-mono text-teal-300">Intercom: 2410 (Ch 4)</div>
                  </div>

                  <div className="bg-[#0A2036] p-3 rounded-lg border border-[#16364A] space-y-1">
                    <div className="text-slate-400 text-[11px] flex items-center justify-between">
                      <span>Emergency Control</span>
                      <PhoneCall size={12} className="text-teal-400" />
                    </div>
                    <div className="font-semibold text-white">Divisional Safety Cell</div>
                    <div className="text-[11px] font-mono text-teal-300">Intercom: 2001 (Direct)</div>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT: DETAILED ASSIGNMENT & CHECKLIST (5 COLS) */}
            <div className="lg:col-span-5 space-y-6">
              {/* CURRENT ASSIGNMENT SCOPE */}
              <section className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Layers size={18} className="text-teal-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      Current Assignment
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/employee/assignment")}
                    className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 group"
                  >
                    <span>Full Details</span>
                    <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#0A2036] to-[#06172A] border border-teal-500/30">
                    <div className="text-slate-400 text-[11px] font-medium flex items-center justify-between">
                      <span>{dutyData.assignmentTitle}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 font-mono font-semibold border border-teal-700/50">
                        {dutyData.assignmentScope}
                      </span>
                    </div>
                    <div className="mt-2 space-y-2">
                      {dutyData.assignmentDetails.map((detail, idx) => (
                        <div key={idx} className="flex items-center justify-between pt-1 border-t border-[#16364A]/40">
                          <span className="text-slate-400 text-[11px]">{detail.label}</span>
                          <span className={`${detail.highlight ? "font-bold text-teal-300" : "font-semibold text-white"} ${detail.mono ? "font-mono" : ""}`}>
                            {detail.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* INTERACTIVE SHIFT CHECKPOINTS */}
              <section className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckSquare size={18} className="text-teal-400" />
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                        Shift Checkpoints
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Mandatory protocol checklist for active shift
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-teal-300 bg-[#0A2036] px-2 py-1 rounded border border-[#16364A]">
                    {checkpointProgress}% Done
                  </span>
                </div>

                <div className="space-y-2">
                  {checkpoints.map((cp) => (
                    <button
                      key={cp.id}
                      type="button"
                      onClick={() => toggleCheckpoint(cp.id)}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-lg border text-left transition ${
                        cp.completed
                          ? "bg-[#0A2036]/60 border-teal-500/20 text-slate-300"
                          : "bg-[#0A2036] border-[#16364A] text-white hover:border-teal-500/50"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {cp.completed ? (
                          <CheckCircle2 size={16} className="text-teal-400" />
                        ) : (
                          <Square size={16} className="text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs ${cp.completed ? "line-through text-slate-400" : "font-medium text-white"}`}>
                          {cp.text}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {cp.time}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-[#16364A] flex items-center justify-between text-[11px] text-slate-400">
                  <span>{completedCount} of {checkpoints.length} verified</span>
                  <span className="text-teal-400 font-medium">Auto-synced with station log</span>
                </div>
              </section>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 6. TODAY'S RESPONSIBILITIES (TYPICAL DUTIES 4-GRID)         */}
          {/* ============================================================ */}
          <section className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#16364A] pb-3 mb-5 gap-2">
              <div className="flex items-center gap-2.5">
                <Briefcase size={18} className="text-[#F59E0B]" />
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Today's Responsibilities ({dutyData.roleTitle})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Standard Operating Protocols mandated under {dutyData.department}
                  </p>
                </div>
              </div>
              <span className="text-xs text-teal-400 bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-700/50 font-medium flex items-center gap-1.5 self-start sm:self-auto">
                <Activity size={13} className="text-teal-400" />
                Active SOP Enforced
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {dutyData.typicalDuties.map((dutyItem, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-[#0A2036] to-[#07192C] p-4 rounded-xl border border-[#16364A] hover:border-teal-500/40 transition group"
                >
                  <div className="flex items-center gap-2 text-white font-bold mb-2">
                    <div className="h-7 w-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-105 transition">
                      <CheckCircle2 size={16} />
                    </div>
                    <span>Responsibility #{idx + 1}</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {dutyItem}
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-[#16364A]/60 text-[10px] font-mono text-teal-400 font-semibold">
                    ROLE SOP • {dutyData.roleConfig.id.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ============================================================ */}
          {/* 7. ROLE-SPECIFIC QUICK SHORTCUTS & ACTION BAR                */}
          {/* ============================================================ */}
          <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#F59E0B]">
                <AlertCircle size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Need to report an operational delay or safety issue?</div>
                <div className="text-[11px] text-slate-400">Shift logs are reviewed live by Divisional Control Office.</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              {dutyData.quickActions.map((action, idx) => (
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
                onClick={() => navigate("/employee/report")}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#0E7C86] to-[#0A545C] hover:from-[#11919C] hover:to-[#0D6B75] text-xs font-bold text-white shadow-md border border-teal-400/40 transition flex items-center justify-center gap-1.5"
              >
                <FileWarning size={14} />
                <span>Report Issue</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

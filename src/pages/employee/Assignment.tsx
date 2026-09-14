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
  CheckCheck,
  Lock,
  Gauge,
  CloudRain,
  Activity,
  AlertOctagon,
  Wrench,
  Compass,
  Zap,
  UserCircle,
} from "lucide-react";
import { logout } from "../../services/auth";
import {
  demoAssignments,
  type OperationalRoleType,
  type EmployeeNavItem,
} from "../../services/employee";

export default function EmployeeAssignment() {
  const navigate = useNavigate();

  // State Setup
  const [is24Hour, setIs24Hour] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Role-Dependent State (Default: train_manager)
  const [selectedRole, setSelectedRole] = useState<OperationalRoleType>("train_manager");


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

  const currentAssignment = demoAssignments[selectedRole];

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
                Operational Assignment
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
                  <span>KSR Bengaluru Corridor</span>
                </div>
                <div className="text-[10px] text-[#71899C]">South Western Railway (SWR)</div>
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-[#16364A]/40">
                  <span>Assignment View</span>
                  <span className="text-cyan-300 font-semibold uppercase">{selectedRole.replace("_", " ")}</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center text-cyan-300" title="Active Assignment">
                <CircleDot size={14} />
              </div>
            )}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ============================================================ */}
          {/* TOP BANNER & OPERATIONAL ROLE SWITCHER (DEVELOPMENT / DEMO) */}
          {/* ============================================================ */}
          <section className="rounded-xl border border-[#16364A] bg-gradient-to-r from-[#071A33] via-[#0A223D] to-[#071A33] p-5 sm:p-6 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-xs font-bold uppercase tracking-wider">
                    <Radio size={12} className="text-cyan-400 animate-pulse" />
                    Role-Based Operational View
                  </span>
                  <span className="rounded bg-[#16364A] px-2 py-0.5 text-[10px] font-semibold text-[#AFC0D4] border border-slate-700">
                    Sample Operational Data
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <TrainFront size={26} className="text-[#F59E0B]" />
                  {currentAssignment.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Viewing tailored telemetry and infrastructure intelligence for designated operational role.
                </p>
              </div>

              {/* ROLE TOGGLE SELECTOR */}
              <div className="bg-[#031426]/90 p-1.5 rounded-xl border border-[#16364A] flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole("train_manager");
                    showToast("Switched to Train Manager operational view");
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedRole === "train_manager"
                      ? "bg-gradient-to-r from-[#0E7C86] to-[#0A2036] text-white border border-cyan-400/50 shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-[#0A2036]"
                  }`}
                >
                  <TrainFront size={14} className={selectedRole === "train_manager" ? "text-[#F59E0B]" : ""} />
                  <span>Train Manager</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole("track_maintainer");
                    showToast("Switched to Track Maintainer operational view");
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedRole === "track_maintainer"
                      ? "bg-gradient-to-r from-[#0E7C86] to-[#0A2036] text-white border border-cyan-400/50 shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-[#0A2036]"
                  }`}
                >
                  <Compass size={14} className={selectedRole === "track_maintainer" ? "text-[#F59E0B]" : ""} />
                  <span>Track Maintainer</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole("signal_maintainer");
                    showToast("Switched to Signal Maintainer operational view");
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedRole === "signal_maintainer"
                      ? "bg-gradient-to-r from-[#0E7C86] to-[#0A2036] text-white border border-cyan-400/50 shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-[#0A2036]"
                  }`}
                >
                  <Zap size={14} className={selectedRole === "signal_maintainer" ? "text-[#F59E0B]" : ""} />
                  <span>Signal Maintainer</span>
                </button>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* ROLE-DEPENDENT VIEW: 1. TRAIN MANAGER                       */}
          {/* ============================================================ */}
          {selectedRole === "train_manager" && (
            <div className="space-y-6">
              {/* PRIMARY TRAIN ASSIGNMENT CARD */}
              <section className="rounded-xl border-2 border-[#0E7C86]/80 bg-gradient-to-br from-[#071A33] via-[#0A2640] to-[#041527] p-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-[#F59E0B]">
                        Assigned Rake Telemetry
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]"></span>
                      <span className="text-xs text-slate-300 font-mono">MY ASSIGNED TRAIN</span>
                    </div>

                    <div>
                      <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight flex items-center gap-3">
                        <span>{demoAssignments.train_manager.trainNumber}</span>
                        <span className="text-xl sm:text-2xl font-bold text-cyan-300 font-sans">
                          {demoAssignments.train_manager.trainName}
                        </span>
                      </div>
                      <div className="text-sm text-slate-300 mt-1 flex items-center gap-2">
                        <MapPin size={15} className="text-[#0E7C86]" />
                        <span>Current Location: <strong className="text-white">{demoAssignments.train_manager.currentLocation}</strong></span>
                        <span className="text-slate-500">•</span>
                        <span>Next Station: <strong className="text-cyan-300">{demoAssignments.train_manager.nextStation}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Prominent Delay & Speed Box */}
                  <div className="flex items-center gap-3">
                    <div className="bg-[#031426]/90 border border-[#16364A] p-4 rounded-xl text-center min-w-[120px]">
                      <div className="text-[10px] font-semibold text-[#AFC0D4] uppercase tracking-wider">
                        Delay Status
                      </div>
                      <div className="text-xl font-extrabold text-amber-400 mt-1 font-mono">
                        {demoAssignments.train_manager.delay}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Behind Schedule</div>
                    </div>

                    <div className="bg-[#031426]/90 border border-[#16364A] p-4 rounded-xl text-center min-w-[120px]">
                      <div className="text-[10px] font-semibold text-[#AFC0D4] uppercase tracking-wider">
                        Current Speed
                      </div>
                      <div className="text-xl font-extrabold text-emerald-400 mt-1 font-mono">
                        {demoAssignments.train_manager.speed}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Section Speed</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* TRAIN MANAGER — OPERATIONAL SUMMARY GRID */}
              <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="bg-[#071A33] border border-[#16364A] p-4 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="text-[10px] font-semibold uppercase text-[#AFC0D4]">Current Location</span>
                    <MapPin size={16} className="text-[#0E7C86]" />
                  </div>
                  <div className="text-base font-bold text-white">{demoAssignments.train_manager.currentLocation}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">KSR - MYS Section</div>
                </div>

                <div className="bg-[#071A33] border border-[#16364A] p-4 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="text-[10px] font-semibold uppercase text-[#AFC0D4]">Next Station</span>
                    <Compass size={16} className="text-cyan-400" />
                  </div>
                  <div className="text-base font-bold text-white">{demoAssignments.train_manager.nextStation}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Approaching Loop Line</div>
                </div>

                <div className="bg-[#071A33] border border-[#16364A] p-4 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="text-[10px] font-semibold uppercase text-[#AFC0D4]">Current Speed</span>
                    <Gauge size={16} className="text-emerald-400" />
                  </div>
                  <div className="text-base font-bold text-white font-mono">{demoAssignments.train_manager.speed}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Within Section Limit</div>
                </div>

                <div className="bg-[#071A33] border border-[#16364A] p-4 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="text-[10px] font-semibold uppercase text-[#AFC0D4]">Delay</span>
                    <Clock size={16} className="text-amber-400" />
                  </div>
                  <div className="text-base font-bold text-amber-400 font-mono">{demoAssignments.train_manager.delay}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Catch-up Margin Available</div>
                </div>

                <div className="bg-[#071A33] border border-[#16364A] p-4 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="text-[10px] font-semibold uppercase text-[#AFC0D4]">Predicted Arrival</span>
                    <Clock size={16} className="text-cyan-400" />
                  </div>
                  <div className="text-base font-bold text-white font-mono">{demoAssignments.train_manager.predictedArrival}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">At Ramanagara Junction</div>
                </div>

                <div className="bg-[#071A33] border border-[#16364A] p-4 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="text-[10px] font-semibold uppercase text-[#AFC0D4]">Weather Impact</span>
                    <CloudRain size={16} className="text-blue-400" />
                  </div>
                  <div className="text-base font-bold text-slate-200">{demoAssignments.train_manager.weatherImpact}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Light drizzle along route</div>
                </div>

                <div className="bg-[#071A33] border border-[#16364A] p-4 rounded-xl col-span-2">
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="text-[10px] font-semibold uppercase text-[#AFC0D4]">Operational Alerts</span>
                    <AlertTriangle size={16} className="text-amber-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white font-mono">
                      {demoAssignments.train_manager.operationalAlerts} Active Alert
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/50">
                      Speed Caution at KM 48/12
                    </span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ============================================================ */}
          {/* ROLE-DEPENDENT VIEW: 2. TRACK MAINTAINER                     */}
          {/* ============================================================ */}
          {selectedRole === "track_maintainer" && (
            <div className="space-y-6">
              {/* PRIMARY TRACK SECTION CARD */}
              <section className="rounded-xl border-2 border-emerald-500/70 bg-gradient-to-br from-[#071A33] via-[#0A2640] to-[#041527] p-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                        Permanent Way (P-Way) Territory
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                      <span className="text-xs text-slate-300 font-mono">MY ASSIGNED SECTION</span>
                    </div>

                    <div>
                      <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <span>{demoAssignments.track_maintainer.section}</span>
                      </div>
                      <div className="text-sm text-slate-300 mt-1 flex items-center gap-2">
                        <MapPin size={15} className="text-[#0E7C86]" />
                        <span>KSR Bengaluru to Kengeri Quadruple Corridor</span>
                        <span className="text-slate-500">•</span>
                        <span>Track Route KM: 0/0 to 12/4</span>
                      </div>
                    </div>
                  </div>

                  {/* Prominent Track Status Badge */}
                  <div className="bg-[#031426]/90 border border-[#16364A] p-4 rounded-xl text-center min-w-[140px]">
                    <div className="text-[10px] font-semibold text-[#AFC0D4] uppercase tracking-wider">
                      Track Status
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-400 text-sm font-extrabold mt-1.5 shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>OPERATIONAL</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Safe for Traffic</div>
                  </div>
                </div>
              </section>

              {/* TRACK MAINTAINER — OPERATIONAL SUMMARY GRID */}
              <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-[#071A33] border border-[#16364A] p-4 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="text-[10px] font-semibold uppercase text-[#AFC0D4]">Assigned Section</span>
                    <Compass size={16} className="text-[#0E7C86]" />
                  </div>
                  <div className="text-base font-bold text-white">{demoAssignments.track_maintainer.section}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">South Western Railway</div>
                </div>

                <div className="bg-[#071A33] border border-[#16364A] p-4 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="text-[10px] font-semibold uppercase text-[#AFC0D4]">Track Status</span>
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  </div>
                  <div className="text-base font-bold text-emerald-400">{demoAssignments.track_maintainer.trackStatus}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Ballast & Rail Integrity OK</div>
                </div>

                <div className="bg-[#071A33] border border-[#16364A] p-4 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="text-[10px] font-semibold uppercase text-[#AFC0D4]">Maintenance Tasks</span>
                    <Wrench size={16} className="text-cyan-400" />
                  </div>
                  <div className="text-base font-bold text-white font-mono">{demoAssignments.track_maintainer.maintenanceTasks} Scheduled</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Tamping & Bolt Tightening</div>
                </div>

                <div className="bg-[#071A33] border border-[#16364A] p-4 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="text-[10px] font-semibold uppercase text-[#AFC0D4]">Active Restrictions</span>
                    <AlertTriangle size={16} className="text-amber-400" />
                  </div>
                  <div className="text-base font-bold text-amber-400 font-mono">{demoAssignments.track_maintainer.activeRestrictions} Caution Order</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">30 km/h at Bridge 14</div>
                </div>

                <div className="bg-[#071A33] border border-[#16364A] p-4 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="text-[10px] font-semibold uppercase text-[#AFC0D4]">Weather Risk</span>
                    <CloudRain size={16} className="text-blue-400" />
                  </div>
                  <div className="text-base font-bold text-blue-300">{demoAssignments.track_maintainer.weatherRisk}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Drainage Patrol Deployed</div>
                </div>
              </section>

              {/* REPORTED ISSUES SUMMARY CARD */}
              <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#16364A]/80 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Activity size={18} className="text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">Reported Track Issues ({demoAssignments.track_maintainer.reportedIssues})</h3>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-[#0A2036] text-slate-300 border border-[#16364A]">
                    Patrol Verified
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#0A2036] p-3 rounded-lg border border-[#16364A]">
                    <div className="font-bold text-white">Joint expansion gap measurement needed</div>
                    <div className="text-[10px] text-slate-400 mt-1">KM 8/4 Down Line • Due today</div>
                  </div>
                  <div className="bg-[#0A2036] p-3 rounded-lg border border-[#16364A]">
                    <div className="font-bold text-white">Ballast shoulder cleaning post-rain</div>
                    <div className="text-[10px] text-slate-400 mt-1">KM 11/2 Nayandahalli Approach • Scheduled</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ROLE-DEPENDENT VIEW: 3. SIGNAL MAINTAINER                   */}
          {/* ============================================================ */}
          {selectedRole === "signal_maintainer" && (
            <div className="space-y-6">
              {/* PRIMARY SIGNAL SECTION CARD */}
              <section className="rounded-xl border-2 border-amber-500/70 bg-gradient-to-br from-[#071A33] via-[#0A2640] to-[#041527] p-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-[#F59E0B]">
                        Signalling & Telecommunication (S&T)
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]"></span>
                      <span className="text-xs text-slate-300 font-mono">MY SIGNAL SECTION</span>
                    </div>

                    <div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {demoAssignments.signal_maintainer.sectionName}
                      </div>
                      <div className="text-sm text-slate-300 mt-1 flex items-center gap-2">
                        <Zap size={15} className="text-cyan-400" />
                        <span>Automatic Signalling & Electronic Interlocking (EI) Zone</span>
                      </div>
                    </div>
                  </div>

                  {/* Prominent Critical Alert Box */}
                  <div className="bg-red-950/80 border border-red-500/60 p-4 rounded-xl text-center min-w-[150px] shadow-lg">
                    <div className="text-[10px] font-bold text-red-200 uppercase tracking-wider">
                      Critical Alert
                    </div>
                    <div className="text-2xl font-extrabold text-white mt-1 font-mono flex items-center justify-center gap-1.5">
                      <AlertOctagon size={20} className="text-red-400 animate-bounce" />
                      <span>{demoAssignments.signal_maintainer.criticalAlerts} CRITICAL</span>
                    </div>
                    <div className="text-[10px] text-red-300 mt-1">Track Circuit TC-42 Drop</div>
                  </div>
                </div>
              </section>

              {/* SIGNAL MAINTAINER — OPERATIONAL SUMMARY GRID */}
              <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#071A33] border border-[#16364A] p-4 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="text-[10px] font-semibold uppercase text-[#AFC0D4]">Active Signal Issues</span>
                    <AlertTriangle size={16} className="text-amber-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-amber-400 font-mono">
                    {demoAssignments.signal_maintainer.activeSignalIssues}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Requiring Relay Inspection</div>
                </div>

                <div className="bg-[#071A33] border border-[#16364A] p-4 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="text-[10px] font-semibold uppercase text-[#AFC0D4]">Affected Blocks</span>
                    <LayersIcon size={16} className="text-cyan-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-white font-mono">
                    {demoAssignments.signal_maintainer.affectedBlocks}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Auto-Signalling Blocks</div>
                </div>

                <div className="bg-[#071A33] border border-[#16364A] p-4 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="text-[10px] font-semibold uppercase text-[#AFC0D4]">Maintenance Tasks</span>
                    <Wrench size={16} className="text-emerald-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-white font-mono">
                    {demoAssignments.signal_maintainer.maintenanceTasks}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Relay & Point Machine Calibration</div>
                </div>

                <div className="bg-[#071A33] border border-red-500/40 bg-red-950/20 p-4 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="text-[10px] font-semibold uppercase text-red-300">Critical Alerts</span>
                    <AlertOctagon size={16} className="text-red-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-red-400 font-mono">
                    {demoAssignments.signal_maintainer.criticalAlerts}
                  </div>
                  <div className="text-[10px] text-red-300/80 mt-0.5">High Priority Response</div>
                </div>
              </section>
            </div>
          )}

          {/* ============================================================ */}
          {/* 10. SHARED RAILDRISHTI INTELLIGENCE CONCEPT SECTION          */}
          {/* ============================================================ */}
          <section className="rounded-xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#16364A]/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#0E7C86]" />
                <h3 className="text-base font-bold text-white">RAILDRISHTI OPERATIONAL VIEW</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0A2036] text-cyan-300 border border-[#16364A]">
                Unified Data Layer
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Operational information is presented according to the employee's assigned role and responsibility:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
              <div
                className={`p-3.5 rounded-lg border transition ${
                  selectedRole === "train_manager"
                    ? "bg-[#0A223D] border-[#0E7C86] shadow-sm"
                    : "bg-[#0A2036] border-[#16364A]/60 opacity-80"
                }`}
              >
                <div className="flex items-center justify-between font-bold text-white">
                  <span>Train Manager</span>
                  <TrainFront size={14} className="text-[#F59E0B]" />
                </div>
                <div className="text-cyan-300 mt-1 font-medium">→ Train movement and journey status</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Speed, current block location, predicted arrival, and active route alerts.
                </p>
              </div>

              <div
                className={`p-3.5 rounded-lg border transition ${
                  selectedRole === "track_maintainer"
                    ? "bg-[#0A223D] border-[#0E7C86] shadow-sm"
                    : "bg-[#0A2036] border-[#16364A]/60 opacity-80"
                }`}
              >
                <div className="flex items-center justify-between font-bold text-white">
                  <span>Track Maintainer</span>
                  <Compass size={14} className="text-emerald-400" />
                </div>
                <div className="text-emerald-300 mt-1 font-medium">→ Track section and maintenance status</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Track operational integrity, caution orders, weather risk, and patrol reports.
                </p>
              </div>

              <div
                className={`p-3.5 rounded-lg border transition ${
                  selectedRole === "signal_maintainer"
                    ? "bg-[#0A223D] border-[#0E7C86] shadow-sm"
                    : "bg-[#0A2036] border-[#16364A]/60 opacity-80"
                }`}
              >
                <div className="flex items-center justify-between font-bold text-white">
                  <span>Signal Maintainer</span>
                  <Zap size={14} className="text-amber-400" />
                </div>
                <div className="text-amber-300 mt-1 font-medium">→ Signal and block status</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Point machine health, track circuits, interlocking status, and critical alerts.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#16364A]/50 text-[10px] text-[#71899C] flex items-center justify-between">
              <span>Data presentation layer — Real-time sensor, telemetry, and ST-GNN AI backend data will populate these metrics in future phases.</span>
              <span className="text-cyan-400">Phase 4 (Frontend UI)</span>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function LayersIcon({ size, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

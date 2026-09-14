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
  CheckCircle2,
  Building2,
  CircleDot,
  CheckCheck,
  Edit3,
  KeyRound,
  Mail,
  Phone,
  Shield,
  BadgeCheck,
  AlertOctagon,
  Eye,
  EyeOff,
  UserCircle,
  Award,
  Heart,
  Home,
  FileCheck,
  Radio,
  Calendar,
} from "lucide-react";
import { getCurrentUser, logout } from "../../services/auth";
import {
  demoEmployeeProfile,
  getRoleConfig,
  demoOperationalRole,
  type EmployeeProfileDemo,
  type OperationalRoleId,
} from "../../services/employee";

export default function EmployeeProfile() {
  const navigate = useNavigate();

  // Authentication & System State
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [is24Hour, setIs24Hour] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Profile Local State (Initialized with demo data or authenticated user)
  const [profile, setProfile] = useState<EmployeeProfileDemo>(() => {
    const user = getCurrentUser();
    return {
      ...demoEmployeeProfile,
      name: user?.name || demoEmployeeProfile.name,
      employeeId: user?.employeeId || demoEmployeeProfile.employeeId,
      email: user?.email || demoEmployeeProfile.email,
      department: user?.department || demoEmployeeProfile.department,
    };
  });

  // Active Role Architecture Configuration
  const activeRoleConfig = getRoleConfig(
    (currentUser?.operationalRole as OperationalRoleId) ||
      demoOperationalRole
  );

  // Modals & Interactivity State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    name: profile.name,
    phone: profile.phone,
    emergencyContact: profile.emergencyContact,
    email: profile.email,
    bloodGroup: profile.bloodGroup || "O+ Positive",
    residentialQuarters: profile.residentialQuarters || "Type-IV Qtr #42B, SWR Colony, Majestic, Bengaluru",
  });

  // Change Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // Handle Edit Profile Submission (Frontend demo state only)
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile((prev) => ({
      ...prev,
      name: editForm.name,
      phone: editForm.phone,
      emergencyContact: editForm.emergencyContact,
      bloodGroup: editForm.bloodGroup,
      residentialQuarters: editForm.residentialQuarters,
    }));
    setIsEditModalOpen(false);
    showToast("Employee contact and personal records updated successfully.");
  };

  // Handle Change Password Submission (Frontend demo state only)
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!passwordForm.currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsPasswordModalOpen(false);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    showToast("Password changed successfully for employee session.");
  };

  // Sidebar navigation menu items
  const navItems = [
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
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0E7C86] text-white px-4 py-3 rounded-lg shadow-2xl border border-teal-400/40 animate-fadeIn">
          <CheckCheck size={18} className="text-teal-200" />
          <span className="text-xs font-semibold">{toastMessage}</span>
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
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#294665] bg-[#071A33] shadow-md">
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
                <span className="rounded bg-[#0E7C86]/30 px-1.5 py-0.5 text-[10px] font-semibold text-teal-300 border border-[#0E7C86]/50">
                  Employee Portal
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Employee Profile & Identity Records
              </h1>
            </div>
          </div>
        </div>

        {/* Right Header: IST Clock, Security & Logout */}
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

      {/* MAIN CONTAINER WITH SIDEBAR & PROFILE CONTENT */}
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
          {/* Sidebar Top */}
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
              const isCurrent = item.id === "profile";
              return (
                <div key={item.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => {
                      if (item.path) {
                        navigate(item.path);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition text-left ${
                      isCurrent
                        ? "bg-gradient-to-r from-[#0E7C86] to-[#0A2036] text-white border-l-4 border-[#F59E0B] shadow-sm"
                        : "text-slate-300 hover:bg-[#0A2036] hover:text-white"
                    } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                  >
                    <Icon
                      size={18}
                      className={isCurrent ? "text-[#F59E0B]" : "text-slate-300"}
                    />
                    {!sidebarCollapsed && (
                      <span className="truncate flex-1">{item.label}</span>
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
                  <span>{profile.division}</span>
                </div>
                <div className="text-[10px] text-[#71899C]">{profile.zone}</div>
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-[#16364A]/40">
                  <span>Operational Staff</span>
                  <span className="text-emerald-400 font-semibold">● Verified Active</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center text-emerald-400" title="Active Session">
                <CircleDot size={14} />
              </div>
            )}
          </div>
        </aside>

        {/* PROFILE MAIN CONTENT */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ============================================================ */}
          {/* 1. HERO PROFILE CARD                                         */}
          {/* ============================================================ */}
          <section className="relative overflow-hidden rounded-2xl border border-[#16364A] bg-gradient-to-br from-[#0A223D] via-[#071A33] to-[#041224] p-5 sm:p-7 shadow-xl">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#0E7C86]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Left Identity & Avatar */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-2xl bg-gradient-to-br from-[#0E7C86] to-[#063443] border-2 border-teal-400/50 p-1 flex items-center justify-center shadow-lg">
                  <span className="text-2xl sm:text-3xl font-bold font-mono tracking-wider text-white">
                    {profile.avatarInitials}
                  </span>
                  <span className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow ring-2 ring-[#071A33]" title="Verified Employee">
                    <BadgeCheck size={14} />
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 text-[11px] font-bold">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      {profile.accountStatus}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-[#0A2036] text-teal-300 border border-[#16364A] text-[11px] font-mono font-bold">
                      {profile.employeeId}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-[#0A2036] text-amber-300 border border-amber-500/30 text-[11px] font-mono font-semibold">
                      {profile.hrmsId || "HRMS-SWR-8841"}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#0E7C86]/20 text-teal-300 border border-[#0E7C86]/40 text-[10px] uppercase font-bold tracking-wider">
                      {profile.verificationStatus}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {profile.name}
                  </h2>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-300">
                    <span className="font-semibold text-[#F59E0B] flex items-center gap-1">
                      <Shield size={14} className="text-[#F59E0B]" />
                      {activeRoleConfig.name}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-teal-300 flex items-center gap-1">
                      <Building2 size={14} className="text-[#0E7C86]" />
                      {activeRoleConfig.department}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 font-mono">{profile.division}</span>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 lg:self-center">
                <button
                  type="button"
                  onClick={() => {
                    setEditForm({
                      name: profile.name,
                      phone: profile.phone,
                      emergencyContact: profile.emergencyContact,
                      email: profile.email,
                      bloodGroup: profile.bloodGroup || "O+ Positive",
                      residentialQuarters: profile.residentialQuarters || "Type-IV Qtr #42B, SWR Colony, Majestic, Bengaluru",
                    });
                    setIsEditModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0E7C86] hover:bg-[#0E5961] text-white text-xs font-bold transition shadow-md border border-teal-400/40"
                >
                  <Edit3 size={15} />
                  <span>Edit Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPasswordError(null);
                    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                    setIsPasswordModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0A2036] hover:bg-[#16364A] text-slate-200 hover:text-white text-xs font-bold transition border border-[#16364A]"
                >
                  <KeyRound size={15} className="text-[#F59E0B]" />
                  <span>Change Password</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-red-500/30 bg-red-950/40 text-red-300 hover:bg-red-900/60 hover:text-red-100 text-xs font-bold transition"
                  title="Sign out of Employee Portal"
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* TWO-COLUMN CONTENT GRID                                       */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: 7 SPANS (Personal Info, Service Record, Equipment) */}
            <div className="lg:col-span-7 space-y-6">
              {/* 2. EXPANDED PERSONAL & CONTACT INFORMATION */}
              <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-teal-400" />
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                        Personal & Contact Information
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Official personal details verified by HRMS / Personnel Department
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-teal-400 bg-teal-950/60 px-2.5 py-0.5 rounded border border-teal-700/50 font-medium">
                    HRMS Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  {/* Full Name */}
                  <div className="bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A]">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                      Full Legal Name
                    </div>
                    <div className="font-bold text-white text-sm mt-0.5">
                      {profile.name}
                    </div>
                  </div>

                  {/* Official Employee ID & HRMS */}
                  <div className="bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A]">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                      Official Employee ID & HRMS
                    </div>
                    <div className="font-mono font-bold text-[#F59E0B] text-sm mt-0.5 flex items-center justify-between">
                      <span>{profile.employeeId}</span>
                      <span className="text-xs text-teal-300">{profile.hrmsId}</span>
                    </div>
                  </div>

                  {/* Official Email */}
                  <div className="bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A]">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Mail size={12} className="text-teal-400" />
                      Official Email
                    </div>
                    <div className="font-medium text-slate-200 text-xs mt-0.5 truncate font-mono">
                      {profile.email}
                    </div>
                  </div>

                  {/* Primary Phone */}
                  <div className="bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A]">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Phone size={12} className="text-emerald-400" />
                      Primary Contact Number
                    </div>
                    <div className="font-bold text-white text-xs mt-0.5 font-mono">
                      {profile.phone}
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A]">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Heart size={12} className="text-rose-400" />
                      Emergency Contact
                    </div>
                    <div className="font-medium text-slate-200 text-xs mt-0.5">
                      {profile.emergencyContact}
                    </div>
                  </div>

                  {/* Blood Group & DOB */}
                  <div className="bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A]">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                      Blood Group & DOB
                    </div>
                    <div className="font-semibold text-white text-xs mt-0.5 flex items-center justify-between">
                      <span className="text-rose-400 font-bold">{profile.bloodGroup || "O+ Positive"}</span>
                      <span className="text-slate-300 font-mono text-[11px]">{profile.dateOfBirth || "14 Aug 1988 (38 Yrs)"}</span>
                    </div>
                  </div>

                  {/* PF / PRAN Number */}
                  <div className="bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A]">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                      Provident Fund / PRAN Number
                    </div>
                    <div className="font-mono font-semibold text-teal-300 text-xs mt-0.5">
                      {profile.pfNumber || "SWR/PF/098412"}
                    </div>
                  </div>

                  {/* Residential Station Quarters */}
                  <div className="bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A]">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Home size={12} className="text-[#F59E0B]" />
                      Railway Residential Quarters
                    </div>
                    <div className="font-medium text-slate-300 text-[11px] mt-0.5 truncate">
                      {profile.residentialQuarters || "Type-IV Qtr #42B, SWR Colony, Majestic"}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. OFFICIAL RAILWAY SERVICE & APPOINTMENT RECORD */}
              <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <FileCheck size={18} className="text-teal-400" />
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                        Railway Service & Competency Record
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Pay matrix level, service tenure, and medical fitness certifications
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 text-xs font-bold">
                    <BadgeCheck size={13} />
                    A-1 Medically Fit
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div className="bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A]">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                      Cadre & Pay Matrix Level
                    </div>
                    <div className="font-bold text-white text-xs mt-0.5">
                      {profile.payLevel || "Level-6 (7th CPC - Grade Pay ₹4200)"}
                    </div>
                  </div>

                  <div className="bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A]">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                      Initial Appointment & Length of Service
                    </div>
                    <div className="font-semibold text-white text-xs mt-0.5 flex items-center justify-between">
                      <span className="font-mono">{profile.appointmentDate || "12 Nov 2014"}</span>
                      <span className="text-teal-300 text-[11px]">({profile.serviceLength || "12 Yrs 4 Mos"})</span>
                    </div>
                  </div>

                  <div className="bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A]">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                      Controlling Officer / Supervisor
                    </div>
                    <div className="font-semibold text-white text-xs mt-0.5">
                      {profile.controllingOfficer || "K. Ramanathan (Sr. DOM / SBC)"}
                    </div>
                  </div>

                  <div className="bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A]">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                      Safety Competency Certificate
                    </div>
                    <div className="font-mono font-semibold text-teal-300 text-xs mt-0.5">
                      {profile.competencyCert || "CERT-SWR-SM-2025-9921 (Active)"}
                    </div>
                  </div>

                  <div className="sm:col-span-2 bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A]">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                      Interlocking Panel Qualification
                    </div>
                    <div className="font-medium text-slate-200 text-xs mt-0.5 flex items-center justify-between">
                      <span>{profile.interlockingGrade || "Electronic Interlocking (EI Grade-4 Siemens)"}</span>
                      <span className="text-emerald-400 font-bold text-[11px]">✓ Certified Operator</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. GOVERNMENT EQUIPMENT ISSUED REGISTER */}
              <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Radio size={18} className="text-teal-400" />
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                        Issued Operational Equipment
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Station inventory and communication equipment logged under employee custody
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-teal-300">
                    4 Items
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {profile.equipmentIssued?.map((eq, idx) => (
                    <div key={idx} className="bg-[#0A2036] p-3 rounded-xl border border-[#16364A] flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">{eq.item}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">S/N: {eq.serial}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-700/50">
                        {eq.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: 5 SPANS (Duty Assignment, Training Certifications, Leave Ledger, Account) */}
            <div className="lg:col-span-5 space-y-6">
              {/* 5. CURRENT OPERATIONAL POSTING & DUTY SCOPE */}
              <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <CalendarCheck size={18} className="text-teal-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      Current Operational Posting
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 text-xs font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    {profile.dutyStatus}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-[#0A2036] p-3 rounded-xl border border-[#16364A] space-y-1">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Assigned Station Location</div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <MapPin size={14} className="text-teal-400" />
                      <span>{profile.assignedLocation}</span>
                    </div>
                  </div>

                  <div className="bg-[#0A2036] p-3 rounded-xl border border-[#16364A] space-y-1">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Shift Schedule & Timings</div>
                    <div className="font-bold font-mono text-white">
                      {profile.shift}
                    </div>
                  </div>

                  <div className="bg-[#0A2036] p-3 rounded-xl border border-[#16364A] space-y-1">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Assigned Section Corridor</div>
                    <div className="font-medium text-teal-300">
                      {profile.assignedSection}
                    </div>
                  </div>

                  <div className="bg-[#0A2036] p-3 rounded-xl border border-[#16364A] space-y-1">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Primary Priority Train</div>
                    <div className="font-bold text-[#F59E0B]">
                      {profile.assignedTrain}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#16364A] flex items-center justify-between text-[11px] text-slate-400">
                  <span>Duty Roster Assignment</span>
                  <button
                    type="button"
                    onClick={() => navigate("/employee/duty")}
                    className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
                  >
                    <span>View Full Roster</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>

              {/* 6. TRAINING & CERTIFICATIONS */}
              <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Award size={18} className="text-[#F59E0B]" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      Training & Certifications
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">ZRTI Verified</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {profile.certifications?.map((cert, idx) => (
                    <div key={idx} className="bg-[#0A2036] p-3 rounded-xl border border-[#16364A]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-xs">{cert.title}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-700/50">
                          {cert.grade}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{cert.institute}</span>
                        <span className="text-emerald-400 font-medium">{cert.validity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7. LEAVE LEDGER & ROSTER DETAILS */}
              <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-teal-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      Leave Ledger Balance
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">Current Year 2026</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-[#0A2036] p-3 rounded-xl border border-[#16364A]">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">Casual (CL)</div>
                    <div className="text-lg font-bold font-mono text-white mt-1">
                      {profile.leaveBalance?.cl || 6}
                    </div>
                    <div className="text-[9px] text-emerald-400">Available</div>
                  </div>

                  <div className="bg-[#0A2036] p-3 rounded-xl border border-[#16364A]">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">LAP</div>
                    <div className="text-lg font-bold font-mono text-teal-300 mt-1">
                      {profile.leaveBalance?.lap || 48}
                    </div>
                    <div className="text-[9px] text-teal-400">Accumulated</div>
                  </div>

                  <div className="bg-[#0A2036] p-3 rounded-xl border border-[#16364A]">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">Restricted (RH)</div>
                    <div className="text-lg font-bold font-mono text-amber-300 mt-1">
                      {profile.leaveBalance?.rh || 2}
                    </div>
                    <div className="text-[9px] text-amber-400">Eligible</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#16364A] flex items-center justify-between text-[11px] text-slate-400">
                  <span>Weekly Rest: Every Sunday</span>
                  <span className="text-teal-300 font-medium">Night Allowance Active</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ============================================================ */}
      {/* EDIT PROFILE MODAL (FRONTEND DEMO ONLY)                       */}
      {/* ============================================================ */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#16364A] bg-[#071A33] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-teal-400" />
                <h3 className="text-base font-bold text-white">Edit Profile Records</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#0A2036]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  className="w-full rounded-lg border border-[#16364A] bg-[#0A2036] px-3.5 py-2 text-white focus:border-teal-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Primary Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    required
                    className="w-full rounded-lg border border-[#16364A] bg-[#0A2036] px-3.5 py-2 text-white focus:border-teal-400 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Blood Group
                  </label>
                  <input
                    type="text"
                    value={editForm.bloodGroup}
                    onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                    required
                    className="w-full rounded-lg border border-[#16364A] bg-[#0A2036] px-3.5 py-2 text-white focus:border-teal-400 focus:outline-none font-bold text-rose-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Emergency Contact Details
                </label>
                <input
                  type="text"
                  value={editForm.emergencyContact}
                  onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                  required
                  className="w-full rounded-lg border border-[#16364A] bg-[#0A2036] px-3.5 py-2 text-white focus:border-teal-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Railway Quarters / Residential Address
                </label>
                <input
                  type="text"
                  value={editForm.residentialQuarters}
                  onChange={(e) => setEditForm({ ...editForm, residentialQuarters: e.target.value })}
                  required
                  className="w-full rounded-lg border border-[#16364A] bg-[#0A2036] px-3.5 py-2 text-white focus:border-teal-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Official Gov Email (HRMS Linked)
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  disabled
                  className="w-full rounded-lg border border-[#16364A] bg-[#031426] px-3.5 py-2 text-slate-400 cursor-not-allowed font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Official email updates require Divisional Personnel Officer (DPO) authentication.
                </span>
              </div>

              <div className="pt-3 border-t border-[#16364A] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#0A2036] hover:bg-[#16364A] text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0E7C86] hover:bg-[#0E5961] text-white text-xs font-bold shadow border border-teal-400/40"
                >
                  Save Profile Records
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CHANGE PASSWORD MODAL (FRONTEND DEMO ONLY)                    */}
      {/* ============================================================ */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#16364A] bg-[#071A33] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <KeyRound size={18} className="text-[#F59E0B]" />
                <h3 className="text-base font-bold text-white">Change Account Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#0A2036]"
              >
                <X size={18} />
              </button>
            </div>

            {passwordError && (
              <div className="mb-3.5 p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertOctagon size={15} className="shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    placeholder="Enter current password"
                    required
                    className="w-full rounded-lg border border-[#16364A] bg-[#0A2036] px-3.5 py-2 text-white focus:border-teal-400 focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  placeholder="At least 8 characters"
                  required
                  className="w-full rounded-lg border border-[#16364A] bg-[#0A2036] px-3.5 py-2 text-white focus:border-teal-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  placeholder="Re-enter new password"
                  required
                  className="w-full rounded-lg border border-[#16364A] bg-[#0A2036] px-3.5 py-2 text-white focus:border-teal-400 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#031426] border border-[#16364A] text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300 mb-1">Password Requirements:</div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  <span>Minimum 8 characters with letters & numbers</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  <span>RailDrishti session security compliant</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#16364A] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#0A2036] hover:bg-[#16364A] text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#F59E0B] hover:bg-amber-600 text-slate-950 text-xs font-bold shadow"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

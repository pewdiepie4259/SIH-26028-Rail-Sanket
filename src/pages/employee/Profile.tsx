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
  Radio,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { getCurrentUser, logout, updateCurrentUser, type AuthUser } from "../../services/auth";
import {
  getRoleProfileViewData,
  type RoleProfileViewData,
} from "../../services/employeeProfileService";
import type { EmployeeNavItem } from "../../services/employee";

export default function EmployeeProfile() {
  const navigate = useNavigate();

  // Authentication & System State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getCurrentUser());
  const [is24Hour, setIs24Hour] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile View Data (strictly dynamic according to logged-in operationalRole)
  const profileData: RoleProfileViewData = useMemo(
    () => getRoleProfileViewData(currentUser),
    [currentUser]
  );

  // Modals & Interactivity State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Edit Profile Form State (Only personal contact fields editable; system/role fields locked)
  const [editForm, setEditForm] = useState({
    name: profileData.name,
    phone: profileData.phone,
    emergencyContact: profileData.emergencyContact,
    residentialAddress: profileData.residentialAddress,
    bloodGroup: profileData.bloodGroup,
  });

  // Change Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Sync edit form with profile data when updated
  useEffect(() => {
    setEditForm({
      name: profileData.name,
      phone: profileData.phone,
      emergencyContact: profileData.emergencyContact,
      residentialAddress: profileData.residentialAddress,
      bloodGroup: profileData.bloodGroup,
    });
  }, [profileData]);

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
    navigate("/employee/login", { replace: true });
  };

  // Handle Edit Profile Submission (Persists to auth storage)
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updatedUser: AuthUser = {
      ...currentUser,
      name: editForm.name.trim() || currentUser.name,
      phone: editForm.phone.trim() || currentUser.phone,
      address: editForm.residentialAddress.trim() || currentUser.address,
      emergencyContactPhone: editForm.emergencyContact.trim(),
      dob: editForm.bloodGroup.trim(),
    };

    updateCurrentUser(updatedUser);
    setCurrentUser(updatedUser);
    setIsEditModalOpen(false);
    showToast("Profile records updated and saved successfully.");
  };

  // Handle Change Password Submission
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
    showToast("Password updated successfully for this session.");
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
                {profileData.name}
              </div>
              <div className="text-[10px] text-[#71899C]">
                {profileData.roleDisplayName}
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
                  <span>{profileData.department}</span>
                </div>
                <div className="text-[10px] text-[#71899C] font-mono">{profileData.employeeId}</div>
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-[#16364A]/40">
                  <span>Operational Role</span>
                  <span className="text-amber-400 font-semibold">{profileData.roleDisplayName}</span>
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
          {/* WARNING BANNER IF APPLICABLE */}
          {profileData.warningMessage && (
            <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-950/30 text-amber-300 text-xs flex items-center gap-2.5 shadow-md">
              <AlertTriangle size={18} className="shrink-0 text-amber-400" />
              <span>{profileData.warningMessage}</span>
            </div>
          )}

          {/* CONTROLLER SEPARATION BANNER */}
          {profileData.isController && (
            <div className="p-4 rounded-xl border border-cyan-500/50 bg-gradient-to-r from-cyan-950/40 via-[#0A2036] to-cyan-950/20 text-cyan-200 text-xs flex items-start gap-3 shadow-lg">
              <ShieldAlert size={20} className="shrink-0 text-cyan-400 mt-0.5" />
              <div>
                <div className="font-bold text-sm text-white uppercase tracking-wider">
                  Controller Account — {profileData.approvalStatus}
                </div>
                <p className="mt-1 text-slate-300 leading-relaxed">
                  This account is registered under the Controller Authority division. Trajectory dispatch, precedence overrides, and DSS interlocking remain restricted to approved controller credentials.
                </p>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 1. HERO PROFILE HEADER CARD                                  */}
          {/* ============================================================ */}
          <section className="relative overflow-hidden rounded-2xl border border-[#16364A] bg-gradient-to-br from-[#0A223D] via-[#071A33] to-[#041224] p-5 sm:p-7 shadow-xl">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#0E7C86]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Left Identity & Avatar */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-2xl bg-gradient-to-br from-[#0E7C86] to-[#063443] border-2 border-teal-400/50 p-1 flex items-center justify-center shadow-lg">
                  <span className="text-2xl sm:text-3xl font-bold font-mono tracking-wider text-white">
                    {profileData.avatarInitials}
                  </span>
                  <span
                    className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow ring-2 ring-[#071A33]"
                    title="Verified Employee"
                  >
                    <BadgeCheck size={14} />
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 text-[11px] font-bold">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      {profileData.approvalStatus}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-[#0A2036] text-teal-300 border border-[#16364A] text-[11px] font-mono font-bold">
                      ID: {profileData.employeeId}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-[#0A2036] text-amber-300 border border-amber-500/30 text-[11px] font-mono font-semibold">
                      {profileData.hrmsId}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#0E7C86]/20 text-teal-300 border border-[#0E7C86]/40 text-[10px] uppercase font-bold tracking-wider">
                      {profileData.accountRole}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {profileData.name}
                  </h2>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-300">
                    <span className="font-semibold text-[#F59E0B] flex items-center gap-1">
                      <Shield size={14} className="text-[#F59E0B]" />
                      {profileData.roleDisplayName}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-teal-300 flex items-center gap-1">
                      <Building2 size={14} className="text-[#0E7C86]" />
                      {profileData.department}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 font-mono">{profileData.assignedLocation}</span>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 lg:self-center">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
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
            {/* LEFT COLUMN: 7 SPANS (Personal Info, Employee Info, Equipment) */}
            <div className="lg:col-span-7 space-y-6">
              {/* 2. PERSONAL & CONTACT INFORMATION */}
              <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-teal-400" />
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                        Personal Information
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Editable personal contact records verified by HRMS
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  {/* Full Name */}
                  <div className="bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A]">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                      Full Legal Name
                    </div>
                    <div className="font-bold text-white text-sm mt-0.5">
                      {profileData.name}
                    </div>
                  </div>

                  {/* Official Email */}
                  <div className="bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A]">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Mail size={12} className="text-teal-400" />
                      Official Email
                    </div>
                    <div className="font-medium text-slate-200 text-xs mt-0.5 truncate font-mono">
                      {profileData.email}
                    </div>
                  </div>

                  {/* Primary Phone */}
                  <div className="bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A]">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Phone size={12} className="text-emerald-400" />
                      Primary Mobile Number
                    </div>
                    <div className="font-bold text-white text-xs mt-0.5 font-mono">
                      {profileData.phone}
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A]">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Heart size={12} className="text-rose-400" />
                      Emergency Contact
                    </div>
                    <div className="font-medium text-slate-200 text-xs mt-0.5">
                      {profileData.emergencyContact}
                    </div>
                  </div>

                  {/* Blood Group */}
                  <div className="bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A]">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                      Blood Group
                    </div>
                    <div className="font-bold text-rose-400 text-sm mt-0.5">
                      {profileData.bloodGroup}
                    </div>
                  </div>

                  {/* Residential Address / Quarters */}
                  <div className="bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A]">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Home size={12} className="text-[#F59E0B]" />
                      Residential Quarters / Address
                    </div>
                    <div className="font-medium text-slate-300 text-[11px] mt-0.5 truncate">
                      {profileData.residentialAddress}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. EMPLOYEE & ROLE INFORMATION (READ-ONLY) */}
              <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Shield size={18} className="text-[#F59E0B]" />
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                        Employee & Role Information
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        System-controlled credentials & departmental allocation (Read-Only)
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#0A2036] text-slate-400 border border-[#16364A] text-[10px] font-mono">
                    <Lock size={11} className="text-slate-500" />
                    Read-Only
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  {/* Account Role */}
                  <div className="bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A]">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                      Account Role
                    </div>
                    <div className="font-bold text-white text-sm mt-0.5 flex items-center justify-between">
                      <span>{profileData.accountRole}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-700/50">
                        {profileData.approvalStatus}
                      </span>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A]">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                      Allocated Department
                    </div>
                    <div className="font-bold text-teal-300 text-sm mt-0.5">
                      {profileData.department}
                    </div>
                  </div>

                  {/* Operational Role */}
                  <div className="bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A]">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                      Operational Role & Title
                    </div>
                    <div className="font-bold text-[#F59E0B] text-sm mt-0.5 flex items-center gap-1.5">
                      <span>{profileData.roleDisplayName}</span>
                      <span className="text-[10px] font-mono text-slate-400">({profileData.operationalRoleId})</span>
                    </div>
                  </div>

                  {/* Employee ID & HRMS */}
                  <div className="bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A]">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                      Employee ID / HRMS Reference
                    </div>
                    <div className="font-mono font-bold text-white text-xs mt-0.5 flex items-center justify-between">
                      <span>{profileData.employeeId}</span>
                      <span className="text-amber-300">{profileData.hrmsId}</span>
                    </div>
                  </div>

                  {/* Pay Level & Cadre */}
                  <div className="bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A]">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                      Pay Matrix Level
                    </div>
                    <div className="font-semibold text-slate-200 text-xs mt-0.5">
                      {profileData.payLevel}
                    </div>
                  </div>

                  {/* Appointment Date & Tenure */}
                  <div className="bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A]">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                      Appointment Date & Service Tenure
                    </div>
                    <div className="font-semibold text-slate-200 text-xs mt-0.5 flex items-center justify-between">
                      <span className="font-mono">{profileData.dateOfAppointment}</span>
                      <span className="text-teal-300 text-[11px]">({profileData.serviceTenure})</span>
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
                        Role-Specific Equipment in Custody
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Operational equipment and inventory logged under {profileData.roleDisplayName} custody
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-teal-300">
                    {profileData.equipmentIssued.length} Items Logged
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {profileData.equipmentIssued.map((eq, idx) => (
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

            {/* RIGHT COLUMN: 5 SPANS (Operational Info & Current Assignment, Certifications) */}
            <div className="lg:col-span-5 space-y-6">
              {/* 5. OPERATIONAL INFORMATION & CURRENT ASSIGNMENT */}
              <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <CalendarCheck size={18} className="text-[#F59E0B]" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      Operational Information
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 text-xs font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Operational Active
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* Primary Responsibility */}
                  <div className="bg-[#0A2036] p-3.5 rounded-xl border border-[#16364A] space-y-1">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">
                      Primary Responsibility
                    </div>
                    <div className="font-medium text-slate-200 leading-relaxed">
                      {profileData.primaryResponsibility}
                    </div>
                  </div>

                  {/* Duty Type & Assignment Type */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#0A2036] p-3 rounded-xl border border-[#16364A] space-y-1">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">
                        Duty Type
                      </div>
                      <div className="font-bold text-white">
                        {profileData.dutyType}
                      </div>
                    </div>

                    <div className="bg-[#0A2036] p-3 rounded-xl border border-[#16364A] space-y-1">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">
                        Assignment Type
                      </div>
                      <div className="font-bold text-teal-300">
                        {profileData.assignmentType} Scope
                      </div>
                    </div>
                  </div>

                  {/* Current Assignment */}
                  <div className="bg-gradient-to-b from-[#0A223D] to-[#0A2036] p-4 rounded-xl border border-teal-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">
                        Current Operational Assignment
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          profileData.isAssignmentAvailable
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-600"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {profileData.isAssignmentAvailable ? "Assigned" : "Pending Roster"}
                      </span>
                    </div>

                    <div className="font-bold text-white text-sm flex items-center gap-1.5">
                      <MapPin size={15} className="text-[#0E7C86] shrink-0" />
                      <span>{profileData.currentAssignment}</span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Location: <span className="text-slate-200 font-medium">{profileData.assignedLocation}</span>
                    </div>
                  </div>

                  {/* Shift Schedule */}
                  <div className="bg-[#0A2036] p-3 rounded-xl border border-[#16364A] space-y-1">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">
                      Shift Timings
                    </div>
                    <div className="font-bold font-mono text-white">
                      {profileData.shiftSchedule}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#16364A] flex items-center justify-between text-[11px] text-slate-400">
                  <span>Assignment Scope Details</span>
                  <button
                    type="button"
                    onClick={() => navigate("/employee/assignment")}
                    className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
                  >
                    <span>View Assignment Page</span>
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
                      Role Certifications & Training
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">ZRTI Verified</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {profileData.certifications.map((cert, idx) => (
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

                <div className="mt-4 pt-3 border-t border-[#16364A] text-[10px] text-slate-400 font-mono">
                  Competency Cert: <span className="text-teal-300">{profileData.competencyCert}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#16364A] bg-[#071A33] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#16364A] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A2036] border border-[#294665] text-teal-400">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Personal Information</h3>
                  <p className="text-xs text-slate-400">
                    System-controlled operational roles and assignments are locked
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#0A2036] hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {/* Locked Role Fields Notice */}
              <div className="bg-[#0A2036] p-3 rounded-xl border border-[#16364A] text-slate-400 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">
                    {profileData.roleDisplayName} • {profileData.department}
                  </span>
                  <span className="text-[10px]">ID: {profileData.employeeId} ({profileData.accountRole})</span>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                  <Lock size={10} />
                  Role Locked
                </span>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  className="w-full bg-[#0A2036] border border-[#16364A] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
              </div>

              {/* Primary Mobile Number */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Primary Mobile Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  required
                  className="w-full bg-[#0A2036] border border-[#16364A] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={editForm.emergencyContact}
                  onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                  className="w-full bg-[#0A2036] border border-[#16364A] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Blood Group</label>
                <input
                  type="text"
                  value={editForm.bloodGroup}
                  onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                  className="w-full bg-[#0A2036] border border-[#16364A] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
              </div>

              {/* Residential Quarters / Address */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Residential Address / Railway Quarters</label>
                <textarea
                  rows={2}
                  value={editForm.residentialAddress}
                  onChange={(e) => setEditForm({ ...editForm, residentialAddress: e.target.value })}
                  className="w-full bg-[#0A2036] border border-[#16364A] rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#294665] bg-[#0A2036] text-slate-300 hover:bg-[#16364A] transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0E7C86] hover:bg-[#0E5961] text-white font-bold transition shadow-md"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#16364A] bg-[#071A33] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-[#16364A] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A2036] border border-[#294665] text-[#F59E0B]">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Change Account Password</h3>
                  <p className="text-xs text-slate-400">Update your employee security credentials</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#0A2036] hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl border border-red-500/50 bg-red-950/40 text-red-300 text-xs flex items-center gap-2">
                <AlertOctagon size={16} className="text-red-400 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                    className="w-full bg-[#0A2036] border border-[#16364A] rounded-xl px-3.5 py-2.5 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">New Password (Min 8 Characters)</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  className="w-full bg-[#0A2036] border border-[#16364A] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Confirm New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                  className="w-full bg-[#0A2036] border border-[#16364A] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#294665] bg-[#0A2036] text-slate-300 hover:bg-[#16364A] transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0E7C86] hover:bg-[#0E5961] text-white font-bold transition shadow-md"
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

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
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  CheckCheck,
  Search,
  Info,
  CheckCircle2,
  ExternalLink,
  SlidersHorizontal,
  BellOff,
  Eye,
  ShieldCheck,
  UserCircle,
  HeartPulse,
} from "lucide-react";
import { logout, getCurrentUser } from "../../services/auth";
import {
  getRoleNotificationsViewData,
  type RoleNotificationItem,
} from "../../services/employeeAlertService";
import type { EmployeeNavItem } from "../../services/employee";
import { caseService } from "../../services/caseService";

export default function EmployeeNotifications() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  // State Setup
  const [is24Hour, setIs24Hour] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load dynamic role-specific notifications data
  const roleViewData = useMemo(() => getRoleNotificationsViewData(currentUser), [currentUser]);

  // Notifications React Local State
  const [notifications, setNotifications] = useState<RoleNotificationItem[]>(
    roleViewData.notifications
  );

  // Filters & Search State
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Detail Modal State
  const [selectedNotification, setSelectedNotification] = useState<RoleNotificationItem | null>(null);

  // Load live notifications from central backend
  useEffect(() => {
    const loadLiveNotifications = async () => {
      try {
        const res = await caseService.getNotifications({
          role: "employee",
          employeeId: currentUser?.employeeId,
        });
        if (res.success && res.data) {
          const liveItems: RoleNotificationItem[] = res.data.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.message,
            category: (item.type === "CASE_CREATED" ? "Issues" : "Operations") as any,
            categoryLabel: item.type === "CASE_CREATED" ? "Case Registered" : "Operational Update",
            time: new Date(item.createdAt).toLocaleTimeString("en-IN", {
              timeZone: "Asia/Kolkata",
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: item.read ? "READ" : "UNREAD",
            actionRoute: `/employee/cases/${item.caseId}`,
            actionLabel: `View Case ${item.caseId}`,
            source: "Central Operations Control",
          }));

          // Merge live items on top of static role items, avoiding duplicate IDs
          const staticFiltered = roleViewData.notifications.filter(
            (s) => !liveItems.some((l) => l.id === s.id)
          );
          setNotifications([...liveItems, ...staticFiltered]);
        }
      } catch (err) {
        console.error("Failed to load live case notifications", err);
      }
    };
    loadLiveNotifications();
  }, [currentUser?.employeeId, roleViewData]);

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

  const handleLogout = () => {
    logout();
    navigate("/employee/login", { replace: true });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Mark single notification as READ
  const handleMarkAsRead = (notifId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    caseService.markNotificationRead(notifId).catch(console.error);
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === notifId) {
          return { ...n, status: "READ" };
        }
        return n;
      })
    );
    if (selectedNotification?.id === notifId) {
      setSelectedNotification((prev) => (prev ? { ...prev, status: "READ" } : null));
    }
    showToast("Notification marked as read");
  };

  // Mark all notifications as READ
  const handleMarkAllAsRead = () => {
    const unreadCount = notifications.filter((n) => n.status === "UNREAD").length;
    if (unreadCount === 0) {
      showToast("All notifications are already read");
      return;
    }
    caseService
      .markAllNotificationsRead({
        role: "employee",
        employeeId: currentUser?.employeeId,
      })
      .catch(console.error);
    setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })));
    if (selectedNotification) {
      setSelectedNotification((prev) => (prev ? { ...prev, status: "READ" } : null));
    }
    showToast(`Marked ${unreadCount} notification${unreadCount > 1 ? "s" : ""} as read`);
  };

  // Summary Metrics
  const totalCount = notifications.length;
  const unreadCount = notifications.filter((n) => n.status === "UNREAD").length;
  const readCount = notifications.filter((n) => n.status === "READ").length;

  // Filtered Notifications List
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Status filter
      if (statusFilter === "UNREAD" && item.status !== "UNREAD") return false;
      if (statusFilter === "READ" && item.status !== "READ") return false;

      // Category filter with alias fallback
      if (categoryFilter !== "ALL") {
        const cat = item.category;
        const matchesExact = cat === categoryFilter;
        const matchesAlias =
          (categoryFilter === "Operations" && cat === "TRAIN_UPDATE") ||
          (categoryFilter === "Tasks" && cat === "TASK") ||
          (categoryFilter === "Safety" && (cat === "WEATHER" || cat === "OPERATIONAL_ALERT"));
        if (!matchesExact && !matchesAlias) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesCat = item.categoryLabel.toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesCat;
      }

      return true;
    });
  }, [notifications, statusFilter, categoryFilter, searchQuery]);

  // Sidebar navigation menu items
  const navItems: EmployeeNavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/employee/dashboard", active: true },
    { id: "duty", label: "My Duty", icon: CalendarCheck, path: "/employee/duty", active: true },
    { id: "assignment", label: "My Train / My Section", icon: TrainFront, path: "/employee/assignment", active: true },
    { id: "alerts", label: "Operational Alerts", icon: AlertTriangle, path: "/employee/alerts", active: true },
    { id: "tasks", label: "Tasks", icon: CheckSquare, path: "/employee/tasks", active: true },
    { id: "report_issue", label: "Report Issue", icon: FileWarning, path: "/employee/report", active: true },
    { id: "incident", label: "Incident Reporting", icon: Flame, path: "/employee/incidents", active: true },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/employee/notifications", active: true, badge: unreadCount },
    { id: "history", label: "Activity / History", icon: History, path: "/employee/history", active: true },
    { id: "profile", label: "Profile", icon: User, path: "/employee/profile", active: true },
  ];

  // Helper to render icon for all 9 unified categories
  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case "Operations":
      case "TRAIN_UPDATE":
        return <TrainFront size={16} className="text-cyan-400" />;
      case "Duty":
        return <CalendarCheck size={16} className="text-emerald-400" />;
      case "Tasks":
      case "TASK":
        return <CheckSquare size={16} className="text-blue-400" />;
      case "Issues":
        return <FileWarning size={16} className="text-amber-400" />;
      case "Incidents":
        return <Flame size={16} className="text-red-400" />;
      case "Safety":
      case "WEATHER":
      case "OPERATIONAL_ALERT":
        return <AlertTriangle size={16} className="text-orange-400" />;
      case "Security":
        return <ShieldCheck size={16} className="text-rose-400" />;
      case "Medical":
        return <HeartPulse size={16} className="text-pink-400" />;
      case "System":
      default:
        return <Info size={16} className="text-purple-400" />;
    }
  };

  // Helper for category badge styling across all 9 categories
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "Operations":
      case "TRAIN_UPDATE":
        return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
      case "Duty":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case "Tasks":
      case "TASK":
        return "bg-blue-500/15 text-blue-300 border-blue-500/30";
      case "Issues":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "Incidents":
        return "bg-red-500/15 text-red-300 border-red-500/30";
      case "Safety":
      case "WEATHER":
      case "OPERATIONAL_ALERT":
        return "bg-orange-500/15 text-orange-300 border-orange-500/30";
      case "Security":
        return "bg-rose-500/15 text-rose-300 border-rose-500/30";
      case "Medical":
        return "bg-pink-500/15 text-pink-300 border-pink-500/30";
      case "System":
      default:
        return "bg-purple-500/15 text-purple-300 border-purple-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-[#031426] text-slate-100 flex flex-col font-sans selection:bg-[#0E7C86]/30 selection:text-white">
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
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#0E7C86]">
                  RailDrishti
                </span>
                <span className="rounded bg-[#0E7C86]/20 border border-[#0E7C86]/40 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">
                  EMPLOYEE PORTAL
                </span>
              </div>
              <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
                Notification Center
              </h1>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* IST Clock */}
          <div className="hidden items-center gap-2 rounded-lg border border-[#16364A] bg-[#0A2036] px-3 py-1.5 md:flex">
            <Clock size={16} className="text-[#0E7C86]" />
            <span className="font-mono text-sm font-medium text-slate-200">
              {formatIST(currentTime, is24Hour)} <span className="text-[10px] text-slate-400">IST</span>
            </span>
            <button
              type="button"
              onClick={() => setIs24Hour(!is24Hour)}
              className="ml-1 rounded border border-[#294665] bg-[#071A33] px-1.5 py-0.5 text-[10px] font-medium text-slate-300 transition hover:bg-[#16364A]"
              title="Toggle 12h/24h format"
            >
              {is24Hour ? "24H" : "12H"}
            </button>
          </div>

          {/* Security */}
          <div className="hidden items-center gap-2 border-l border-[#16364A] pl-3 sm:flex">
            <ShieldCheck size={18} className="text-[#0E7C86]" />

            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-white">
                {roleViewData.employeeName}
              </div>
              <div className="text-[10px] text-[#71899C]">
                {roleViewData.roleTitle}
              </div>
            </div>

            <UserCircle size={24} className="text-[#AFC0D4]" />
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 transition hover:bg-red-500/20"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* BODY WITH SIDEBAR & CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        {/* MOBILE SIDEBAR BACKDROP */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#16364A] bg-[#071A33] transition-all duration-300 ease-in-out lg:static ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"} w-64`}
        >
          {/* Mobile Close Button */}
          <div className="flex h-[72px] items-center justify-between border-b border-[#16364A] px-4 lg:hidden">
            <span className="font-semibold text-white text-sm">Navigation Menu</span>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-[#0A2036] hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav Links */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isCurrent = item.id === "notifications";

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={!item.active}
                  onClick={() => {
                    if (item.path) {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }
                  }}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                    isCurrent
                      ? "border border-[#0E7C86] bg-[#0E7C86] text-white shadow-lg shadow-[#0E7C86]/20 font-semibold"
                      : item.active
                      ? "text-slate-300 hover:bg-[#0A2036] hover:text-white border border-transparent"
                      : "text-slate-500 cursor-not-allowed border border-transparent opacity-60"
                  }`}
                  title={item.phase ? `${item.label} (${item.phase})` : item.label}
                >
                  <Icon
                    size={18}
                    className={`shrink-0 ${
                      isCurrent ? "text-cyan-200" : item.active ? "text-[#0E7C86]" : "text-slate-500"
                    }`}
                  />
                  {!sidebarCollapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                  {!sidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className="rounded-full bg-[#0E7C86] text-white px-2 py-0.5 text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                  {!sidebarCollapsed && item.phase && (
                    <span className="rounded bg-[#16364A] px-1.5 py-0.5 text-[9px] font-mono text-slate-400">
                      {item.phase}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Collapse Toggle (Desktop only) */}
          <div className="hidden border-t border-[#16364A] p-3 lg:block">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#16364A] bg-[#0A2036] py-2 text-xs text-slate-300 transition hover:bg-[#16364A] hover:text-white"
            >
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              {!sidebarCollapsed && <span>Collapse Sidebar</span>}
            </button>
          </div>
        </aside>

        {/* MAIN PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto bg-[#031426] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-[#16364A] pb-5">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#0E7C86] font-mono uppercase tracking-wider mb-1">
                  <Bell size={15} />
                  <span>Role-Specific Notification Center</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  NOTIFICATIONS
                </h1>
                <p className="text-sm text-slate-300 mt-1">
                  Updates related to duties and operations for <span className="font-semibold text-cyan-300">{roleViewData.roleTitle}</span> ({roleViewData.department}).
                </p>
              </div>

              {/* Mark All as Read Button */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#294665] bg-[#0A2036] px-4 py-2.5 text-xs font-semibold text-slate-200 shadow-md transition hover:bg-[#16364A] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCheck size={16} className="text-[#0E7C86]" />
                  <span>Mark All as Read</span>
                </button>
              </div>
            </div>

            {/* SUMMARY STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Notifications */}
              <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Total
                  </span>
                  <div className="text-2xl font-bold text-white mt-1 font-mono">{totalCount}</div>
                  <span className="text-[11px] text-slate-400">Role-filtered updates</span>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A2036] border border-[#294665] text-[#0E7C86]">
                  <Bell size={22} />
                </div>
              </div>

              {/* Unread Notifications */}
              <div className="rounded-2xl border border-cyan-500/30 bg-[#071A33] p-5 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-cyan-300">
                    Unread
                  </span>
                  <div className="text-2xl font-bold text-cyan-300 mt-1 font-mono flex items-center gap-2">
                    <span>{unreadCount}</span>
                    {unreadCount > 0 && (
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">Awaiting your review</span>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  <Eye size={22} />
                </div>
              </div>

              {/* Read Notifications */}
              <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Read
                  </span>
                  <div className="text-2xl font-bold text-slate-200 mt-1 font-mono">{readCount}</div>
                  <span className="text-[11px] text-slate-400">Acknowledged updates</span>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A2036] border border-[#294665] text-emerald-400">
                  <CheckCircle2 size={22} />
                </div>
              </div>
            </div>

            {/* FILTER & SEARCH BAR */}
            <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-4 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Read / Unread Status Filter Buttons */}
                <div className="flex items-center gap-1.5 rounded-xl bg-[#0A2036] p-1 border border-[#16364A]">
                  <button
                    type="button"
                    onClick={() => setStatusFilter("ALL")}
                    className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                      statusFilter === "ALL"
                        ? "bg-[#0E7C86] text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    All ({totalCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("UNREAD")}
                    className={`rounded-lg px-4 py-2 text-xs font-semibold transition flex items-center gap-1.5 ${
                      statusFilter === "UNREAD"
                        ? "bg-[#0E7C86] text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>Unread ({unreadCount})</span>
                    {unreadCount > 0 && <span className="h-2 w-2 rounded-full bg-cyan-400" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("READ")}
                    className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                      statusFilter === "READ"
                        ? "bg-[#0E7C86] text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Read ({readCount})
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-[#16364A] bg-[#0A2036] py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-[#0E7C86] focus:outline-none focus:ring-1 focus:ring-[#0E7C86]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#16364A] pb-1">
                <span className="text-[11px] font-mono text-slate-400 shrink-0 flex items-center gap-1 mr-1">
                  <SlidersHorizontal size={12} />
                  <span>Category:</span>
                </span>
                {[
                  { id: "ALL", label: "All Categories" },
                  { id: "Operations", label: "Operations" },
                  { id: "Duty", label: "Duty" },
                  { id: "Tasks", label: "Tasks" },
                  { id: "Issues", label: "Issues" },
                  { id: "Incidents", label: "Incidents" },
                  { id: "Safety", label: "Safety" },
                  { id: "Security", label: "Security" },
                  { id: "Medical", label: "Medical" },
                  { id: "System", label: "System" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`rounded-lg px-3 py-1 text-xs font-medium shrink-0 transition ${
                      categoryFilter === cat.id
                        ? "border border-[#0E7C86] bg-[#0E7C86]/20 text-cyan-300 font-semibold"
                        : "border border-[#16364A] bg-[#0A2036] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* NOTIFICATIONS LIST */}
            <div className="space-y-3">
              {filteredNotifications.length === 0 ? (
                /* Empty State */
                <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-12 text-center shadow-xl">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A2036] border border-[#294665] text-slate-400 mb-3">
                    <BellOff size={28} />
                  </div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wide">
                    {statusFilter === "UNREAD" ? "NO UNREAD NOTIFICATIONS" : "NO NOTIFICATIONS FOUND"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {statusFilter === "UNREAD"
                      ? "You're all caught up. No unread operational updates at this moment."
                      : "No notifications match your current filter criteria."}
                  </p>
                  {(statusFilter !== "ALL" || categoryFilter !== "ALL" || searchQuery) && (
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter("ALL");
                        setCategoryFilter("ALL");
                        setSearchQuery("");
                      }}
                      className="mt-4 rounded-xl border border-[#294665] bg-[#0A2036] px-4 py-2 text-xs font-medium text-cyan-300 hover:bg-[#16364A] transition"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              ) : (
                filteredNotifications.map((notif) => {
                  const isUnread = notif.status === "UNREAD";

                  return (
                    <div
                      key={notif.id}
                      onClick={() => setSelectedNotification(notif)}
                      className={`group rounded-2xl border p-4 sm:p-5 transition-all shadow-md cursor-pointer ${
                        isUnread
                          ? "border-cyan-500/40 bg-gradient-to-r from-[#0A2036] to-[#071A33] shadow-cyan-950/20"
                          : "border-[#16364A] bg-[#071A33]/80 hover:bg-[#071A33] hover:border-[#294665]"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        {/* Left Content Area */}
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          {/* Category Icon Container */}
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                              isUnread
                                ? "border-cyan-500/40 bg-cyan-500/10 shadow-inner"
                                : "border-[#16364A] bg-[#0A2036]"
                            }`}
                          >
                            {renderCategoryIcon(notif.category)}
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Header: Timestamp, Category, and Unread Dot */}
                            <div className="flex items-center gap-2 mb-1">
                              {isUnread && (
                                <span
                                  className="h-2 w-2 rounded-full bg-cyan-400 shrink-0 animate-ping"
                                  title="Unread notification"
                                />
                              )}
                              <span className="font-mono text-xs text-slate-400 font-semibold">
                                {notif.time}
                              </span>
                              <span className="text-slate-600">•</span>
                              <span
                                className={`rounded px-2 py-0.5 text-[10px] font-bold border ${getCategoryBadgeClass(
                                  notif.category
                                )}`}
                              >
                                {notif.categoryLabel}
                              </span>
                              {isUnread ? (
                                <span className="rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold font-mono px-1.5 py-0.5 border border-cyan-500/30">
                                  UNREAD
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono text-slate-400">
                                  READ
                                </span>
                              )}
                            </div>

                            {/* Notification Title */}
                            <h3
                              className={`text-sm tracking-tight ${
                                isUnread ? "font-bold text-white" : "font-medium text-slate-200"
                              }`}
                            >
                              {notif.title}
                            </h3>

                            {/* Description */}
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                              {notif.description}
                            </p>
                          </div>
                        </div>

                        {/* Right Action Controls */}
                        <div className="shrink-0 flex items-center sm:flex-col sm:items-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#16364A]">
                          {isUnread && (
                            <button
                              type="button"
                              onClick={(e) => handleMarkAsRead(notif.id, e)}
                              className="rounded-lg border border-[#294665] bg-[#0A2036] px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-[#16364A] hover:text-white transition shadow-sm"
                            >
                              Mark as Read
                            </button>
                          )}

                          {notif.actionRoute && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (notif.actionRoute) navigate(notif.actionRoute);
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E7C86] hover:text-cyan-300 transition"
                            >
                              <span>{notif.actionLabel || "View Details"}</span>
                              <ExternalLink size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>

      {/* NOTIFICATION DETAIL MODAL */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#16364A] bg-[#071A33] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#16364A] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A2036] border border-[#294665]">
                  {renderCategoryIcon(selectedNotification.category)}
                </div>
                <div>
                  <span className="text-xs font-mono uppercase text-[#0E7C86] tracking-wider block mb-0.5">
                    NOTIFICATION DETAILS
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {selectedNotification.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#0A2036] hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Meta Details */}
            <div className="rounded-xl bg-[#0A2036] p-3.5 border border-[#16364A] grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Timestamp:</span>
                <span className="font-mono font-bold text-white">{selectedNotification.time} IST</span>
              </div>
              <div>
                <span className="text-slate-400 block">Category:</span>
                <span
                  className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded border mt-0.5 ${getCategoryBadgeClass(
                    selectedNotification.category
                  )}`}
                >
                  {selectedNotification.categoryLabel}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Status:</span>
                <span
                  className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded border mt-0.5 ${
                    selectedNotification.status === "UNREAD"
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                      : "bg-slate-500/20 text-slate-300 border-slate-500/40"
                  }`}
                >
                  {selectedNotification.status}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Source:</span>
                <span className="font-semibold text-slate-200">
                  {selectedNotification.source || "RailDrishti Operational Core"}
                </span>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 block mb-1.5">
                Message:
              </span>
              <p className="text-sm text-slate-200 bg-[#0A2036] p-4 rounded-xl border border-[#16364A] leading-relaxed">
                {selectedNotification.description}
              </p>
            </div>

            {/* Action Footer */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                {selectedNotification.status === "UNREAD" && (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(selectedNotification.id)}
                    className="rounded-xl border border-[#294665] bg-[#0A2036] px-4 py-2.5 text-xs font-semibold text-cyan-300 hover:bg-[#16364A] hover:text-white transition"
                  >
                    Mark as Read
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedNotification(null)}
                  className="w-full sm:w-auto rounded-xl bg-[#0A2036] border border-[#294665] px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-[#16364A] transition"
                >
                  Close
                </button>
                {selectedNotification.actionRoute && (
                  <button
                    type="button"
                    onClick={() => {
                      const route = selectedNotification.actionRoute;
                      setSelectedNotification(null);
                      if (route) navigate(route);
                    }}
                    className="w-full sm:w-auto rounded-xl bg-[#0E7C86] px-4 py-2.5 text-xs font-semibold text-white hover:bg-cyan-600 transition flex items-center justify-center gap-1.5"
                  >
                    <span>{selectedNotification.actionLabel || "Go to Module"}</span>
                    <ExternalLink size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

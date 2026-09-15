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
  Search,
  ShieldCheck,
  Info,
  Calendar,
  UserCircle,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { getCurrentUser, logout } from "../../services/auth";
import {
  getRoleActivitiesViewData,
  type RoleActivityItem,
  type ActivityCategory,
} from "../../services/employeeHistoryService";
import type { EmployeeNavItem } from "../../services/employee";
import { caseService } from "../../services/caseService";

export default function EmployeeHistory() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  // Authentication & System State
  const [is24Hour, setIs24Hour] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Dynamic role-specific activities data
  const historyViewData = useMemo(() => getRoleActivitiesViewData(currentUser), [currentUser]);
  const [caseActivities, setCaseActivities] = useState<RoleActivityItem[]>([]);

  // Fetch live cases and map to activity entries
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await caseService.getCases({
          role: "employee",
          employeeId: currentUser?.employeeId,
        });
        if (res.success && res.data) {
          const items: RoleActivityItem[] = res.data.map((c) => ({
            id: `case-act-${c.id}`,
            date: new Date(c.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
            }),
            time: new Date(c.createdAt).toLocaleTimeString("en-IN", {
              timeZone: "Asia/Kolkata",
              hour: "2-digit",
              minute: "2-digit",
            }),
            action:
              c.caseType === "INCIDENT"
                ? `Reported Incident: ${c.category} (${c.severity})`
                : `Reported Issue: ${c.category} (${c.severity})`,
            category: (c.caseType === "INCIDENT" ? "INCIDENT" : "ISSUE") as ActivityCategory,
            status:
              c.status === "RESOLVED" || c.status === "CLOSED"
                ? "Completed"
                : c.status === "IN_PROGRESS"
                ? "In Progress"
                : "Reported",
            details: c.description,
            location: c.location,
            referenceId: c.id,
          }));
          setCaseActivities(items);
        }
      } catch (err) {
        console.error("Failed to fetch cases for history", err);
      }
    };
    fetchCases();
  }, [currentUser?.employeeId]);

  // Filters & Search State
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Detail Modal State
  const [selectedActivity, setSelectedActivity] = useState<RoleActivityItem | null>(null);

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

  // Combine live case activities with role activities (preventing duplicates by referenceId)
  const activities = useMemo(() => {
    const defaultFiltered = historyViewData.activities.filter(
      (d) => !caseActivities.some((c) => c.referenceId && c.referenceId === d.referenceId)
    );
    return [...caseActivities, ...defaultFiltered];
  }, [caseActivities, historyViewData.activities]);

  // Summary Metrics
  const totalCount = activities.length;
  const issuesReportedCount = activities.filter((a) => a.category === "ISSUE").length;
  const tasksCompletedCount = activities.filter((a) => a.category === "TASK").length;
  const dutyActionsCount = activities.filter((a) => a.category === "DUTY" || a.category === "ASSIGNMENT").length;

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (categoryFilter !== "ALL" && act.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAction = act.action.toLowerCase().includes(q);
        const matchesDetails = act.details.toLowerCase().includes(q);
        const matchesLoc = act.location?.toLowerCase().includes(q) || false;
        const matchesRef = act.referenceId?.toLowerCase().includes(q) || false;
        return matchesAction || matchesDetails || matchesLoc || matchesRef;
      }
      return true;
    });
  }, [activities, categoryFilter, searchQuery]);

  // Group filtered activities by Date
  const groupedActivities = useMemo(() => {
    const groups: Record<string, RoleActivityItem[]> = {};
    filteredActivities.forEach((item) => {
      if (!groups[item.date]) {
        groups[item.date] = [];
      }
      groups[item.date].push(item);
    });
    return groups;
  }, [filteredActivities]);

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

  const renderCategoryIcon = (category: ActivityCategory) => {
    switch (category) {
      case "ASSIGNMENT":
        return <TrainFront size={16} className="text-cyan-400" />;
      case "DUTY":
        return <CalendarCheck size={16} className="text-emerald-400" />;
      case "TASK":
        return <CheckSquare size={16} className="text-blue-400" />;
      case "ALERT":
        return <AlertTriangle size={16} className="text-amber-400" />;
      case "ISSUE":
        return <FileWarning size={16} className="text-orange-400" />;
      case "INCIDENT":
        return <Flame size={16} className="text-rose-400" />;
      case "LOGIN":
        return <ShieldCheck size={16} className="text-teal-400" />;
      case "NOTIFICATION":
      default:
        return <Info size={16} className="text-purple-400" />;
    }
  };

  const getCategoryBadgeClass = (category: ActivityCategory) => {
    switch (category) {
      case "ASSIGNMENT":
        return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
      case "DUTY":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case "TASK":
        return "bg-blue-500/15 text-blue-300 border-blue-500/30";
      case "ALERT":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "ISSUE":
        return "bg-orange-500/15 text-orange-300 border-orange-500/30";
      case "INCIDENT":
        return "bg-rose-500/15 text-rose-300 border-rose-500/30";
      case "LOGIN":
        return "bg-teal-500/15 text-teal-300 border-teal-500/30";
      case "NOTIFICATION":
      default:
        return "bg-purple-500/15 text-purple-300 border-purple-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-[#031426] text-slate-100 flex flex-col font-sans selection:bg-[#0E7C86]/30 selection:text-white">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 flex h-[72px] shrink-0 items-center justify-between border-b border-[#16364A] bg-[#071A33]/95 backdrop-blur-md px-4 sm:px-6">
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
                Activity & Audit History
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden items-center gap-2 rounded-lg border border-[#16364A] bg-[#0A2036] px-3 py-1.5 md:flex">
            <Clock size={16} className="text-[#0E7C86]" />
            <span className="font-mono text-sm font-medium text-slate-200">
              {formatIST(currentTime, is24Hour)} <span className="text-[10px] text-slate-400">IST</span>
            </span>
            <button
              type="button"
              onClick={() => setIs24Hour(!is24Hour)}
              className="ml-1 rounded border border-[#294665] bg-[#071A33] px-1.5 py-0.5 text-[10px] font-medium text-slate-300 transition hover:bg-[#16364A]"
            >
              {is24Hour ? "24H" : "12H"}
            </button>
          </div>

          <div className="hidden items-center gap-2 border-l border-[#16364A] pl-3 sm:flex">
            <ShieldCheck size={18} className="text-[#0E7C86]" />
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-white">{historyViewData.employeeName}</div>
              <div className="text-[10px] text-[#71899C]">{historyViewData.roleTitle}</div>
            </div>
            <UserCircle size={24} className="text-[#AFC0D4]" />
          </div>

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

      {/* BODY CONTAINER */}
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#16364A] bg-[#071A33] transition-all duration-300 ease-in-out lg:static ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"} w-64`}
        >
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

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isCurrent = item.id === "history";

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.path) {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }
                  }}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                    isCurrent
                      ? "border border-[#0E7C86] bg-[#0E7C86] text-white shadow-lg shadow-[#0E7C86]/20 font-semibold"
                      : "text-slate-300 hover:bg-[#0A2036] hover:text-white border border-transparent"
                  }`}
                >
                  <Icon
                    size={18}
                    className={`shrink-0 ${isCurrent ? "text-cyan-200" : "text-[#0E7C86]"}`}
                  />
                  {!sidebarCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>

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

        <main className="flex-1 overflow-y-auto bg-[#031426] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-[#16364A] pb-5">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#0E7C86] font-mono uppercase tracking-wider mb-1">
                  <History size={15} />
                  <span>Role-Specific Audit Trail</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  OPERATIONAL ACTIVITY HISTORY
                </h1>
                <p className="text-sm text-slate-300 mt-1">
                  Chronological duty actions, assignments, tasks, and reports for{" "}
                  <span className="font-semibold text-cyan-300">{historyViewData.roleTitle}</span> ({historyViewData.department}).
                </p>
              </div>

              <div className="rounded-xl border border-[#16364A] bg-[#071A33] px-3.5 py-2 text-xs font-mono text-slate-300 flex items-center gap-2">
                <Calendar size={14} className="text-teal-400" />
                <span>Today's Shift: 14 Sep 2026</span>
              </div>
            </div>

            {/* SUMMARY STATS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-4 shadow-lg">
                <span className="text-xs font-mono uppercase text-slate-400">Total Logged</span>
                <div className="text-2xl font-bold text-white mt-1 font-mono">{totalCount}</div>
                <span className="text-[11px] text-slate-400">Operational events</span>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-[#071A33] p-4 shadow-lg">
                <span className="text-xs font-mono uppercase text-emerald-300">Tasks Completed</span>
                <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{tasksCompletedCount}</div>
                <span className="text-[11px] text-slate-400">Verified shift actions</span>
              </div>

              <div className="rounded-2xl border border-cyan-500/30 bg-[#071A33] p-4 shadow-lg">
                <span className="text-xs font-mono uppercase text-cyan-300">Duty / Moves</span>
                <div className="text-2xl font-bold text-cyan-300 mt-1 font-mono">{dutyActionsCount}</div>
                <span className="text-[11px] text-slate-400">Assignments & rosters</span>
              </div>

              <div className="rounded-2xl border border-orange-500/30 bg-[#071A33] p-4 shadow-lg">
                <span className="text-xs font-mono uppercase text-orange-300">Issues Reported</span>
                <div className="text-2xl font-bold text-orange-400 mt-1 font-mono">{issuesReportedCount}</div>
                <span className="text-[11px] text-slate-400">Operational defects logged</span>
              </div>
            </div>

            {/* FILTER & SEARCH BAR */}
            <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-4 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                  {[
                    { id: "ALL", label: "All Activities" },
                    { id: "TASK", label: "Tasks" },
                    { id: "DUTY", label: "Duty & Movement" },
                    { id: "ALERT", label: "Alerts" },
                    { id: "ISSUE", label: "Issues Logged" },
                    { id: "LOGIN", label: "Sign-On" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium shrink-0 transition ${
                        categoryFilter === cat.id
                          ? "bg-[#0E7C86] text-white font-semibold shadow-sm"
                          : "bg-[#0A2036] text-slate-400 hover:text-white"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="relative flex-1 max-w-xs">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search history..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-[#16364A] bg-[#0A2036] py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>
            </div>

            {/* TIMELINE ACTIVITIES */}
            <div className="space-y-6">
              {Object.keys(groupedActivities).length === 0 ? (
                <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-12 text-center shadow-xl">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A2036] border border-[#294665] text-slate-400 mb-3">
                    <History size={28} />
                  </div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wide">
                    NO ACTIVITIES FOUND
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    No activity entries match your current search or filter criteria.
                  </p>
                </div>
              ) : (
                Object.entries(groupedActivities).map(([date, dateActivities]) => (
                  <div key={date} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="rounded-xl border border-[#294665] bg-[#0A2036] px-3 py-1 text-xs font-mono font-bold text-cyan-300 shadow-sm">
                        {date}
                      </span>
                      <div className="h-px flex-1 bg-[#16364A]" />
                    </div>

                    <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#16364A]">
                      {dateActivities.map((act) => (
                        <div
                          key={act.id}
                          onClick={() => setSelectedActivity(act)}
                          className="group relative rounded-2xl border border-[#16364A] bg-[#071A33] p-4 sm:p-5 transition-all hover:bg-[#0A2036] hover:border-[#294665] shadow-lg cursor-pointer"
                        >
                          <span className="absolute -left-6 sm:-left-8 top-6 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-[#031426] bg-[#0E7C86] group-hover:scale-125 group-hover:bg-cyan-400 transition-transform" />

                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A2036] border border-[#16364A]">
                                {renderCategoryIcon(act.category)}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span className="font-mono text-xs font-bold text-cyan-300">
                                    {act.time}
                                  </span>
                                  <span className="text-slate-600">•</span>
                                  <span
                                    className={`rounded px-2 py-0.5 text-[10px] font-bold border ${getCategoryBadgeClass(
                                      act.category
                                    )}`}
                                  >
                                    {act.category}
                                  </span>
                                  <span className="rounded bg-[#16364A] text-[9px] font-mono px-1.5 py-0.5 text-emerald-300 font-semibold">
                                    {act.status}
                                  </span>
                                  {act.referenceId && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/employee/cases/${act.referenceId}`);
                                      }}
                                      className="inline-flex items-center gap-1 font-mono text-[10px] text-amber-400 hover:text-amber-300 font-bold bg-[#0A2036] px-1.5 py-0.5 rounded border border-[#294665]"
                                      title="Open Operational Case File"
                                    >
                                      <span>Ref: {act.referenceId}</span>
                                      <ExternalLink size={10} />
                                    </button>
                                  )}
                                </div>

                                <h3 className="text-sm font-bold text-white tracking-tight">
                                  {act.action}
                                </h3>

                                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                  {act.details}
                                </p>
                              </div>
                            </div>

                            {act.location && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0 pt-2 sm:pt-0">
                                <MapPin size={13} className="text-[#0E7C86]" />
                                <span>{act.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* DETAIL MODAL */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#16364A] bg-[#071A33] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-[#16364A] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A2036] border border-[#294665]">
                  {renderCategoryIcon(selectedActivity.category)}
                </div>
                <div>
                  <span className="text-xs font-mono uppercase text-[#0E7C86] tracking-wider block mb-0.5">
                    AUDIT LOG DETAILS
                  </span>
                  <h3 className="text-base font-bold text-white">{selectedActivity.action}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#0A2036] hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="rounded-xl bg-[#0A2036] p-3.5 border border-[#16364A] grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Date & Time:</span>
                <span className="font-mono font-bold text-white">
                  {selectedActivity.date} • {selectedActivity.time} IST
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Category:</span>
                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded border mt-0.5 ${getCategoryBadgeClass(selectedActivity.category)}`}>
                  {selectedActivity.category}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Status:</span>
                <span className="text-emerald-400 font-semibold">{selectedActivity.status}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Location:</span>
                <span className="text-slate-200 font-medium">{selectedActivity.location || "Section Area"}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-mono uppercase text-slate-400 block mb-1.5">Action Details:</span>
              <p className="text-sm text-slate-200 bg-[#0A2036] p-4 rounded-xl border border-[#16364A] leading-relaxed">
                {selectedActivity.details}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="font-mono text-slate-500">ID: {selectedActivity.id}</span>
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="rounded-xl bg-[#0A2036] border border-[#294665] px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-[#16364A] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

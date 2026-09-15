// src/pages/employee/Mail.tsx
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
  Menu,
  X,
  Mail,
  Send,
  Inbox,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Filter,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { getCurrentUser, logout } from "../../services/auth";
import {
  fetchInbox,
  fetchSent,
  fetchStaffDirectory,
  sendOfficialDispatch,
  acknowledgeDispatchApi,
  OPERATIONAL_TEMPLATES,
  type DispatchItem,
  type StaffDirectoryItem,
  type DispatchPriority,
  type DispatchCategory,
} from "../../services/mailService";
import type { EmployeeNavItem } from "../../services/employee";

export default function EmployeeMail() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  // Authentication & System State
  const [is24Hour, setIs24Hour] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tab State: 'inbox' | 'sent' | 'compose'
  const [activeTab, setActiveTab] = useState<"inbox" | "sent" | "compose">("inbox");
  const [inboxItems, setInboxItems] = useState<DispatchItem[]>([]);
  const [sentItems, setSentItems] = useState<DispatchItem[]>([]);
  const [directory, setDirectory] = useState<StaffDirectoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<DispatchItem | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>("all");

  // Compose Form State
  const [recipientEmail, setRecipientEmail] = useState<string>("shriya.m@raildrishti.gov.in");
  const [category, setCategory] = useState<DispatchCategory>("work_completion");
  const [priority, setPriority] = useState<DispatchPriority>("routine");
  const [subject, setSubject] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [trainNumber, setTrainNumber] = useState<string>("");
  const [section, setSection] = useState<string>("Bengaluru (SBC) Division");
  const [stationCode, setStationCode] = useState<string>("SBC");

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Safeguard role
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate("/login", { replace: true });
    } else if (user.role === "controller") {
      navigate("/controller/mail", { replace: true });
    }
  }, [navigate]);

  // Load Dispatches & Directory
  const loadData = async () => {
    setLoading(true);
    try {
      const [dir, inbox, sent] = await Promise.all([
        fetchStaffDirectory(),
        fetchInbox(currentUser?.email, currentUser?.role, currentUser?.id),
        fetchSent(currentUser?.email, currentUser?.id),
      ]);
      setDirectory(dir);
      setInboxItems(inbox);
      setSentItems(sent);

      // Pre-select first inbox item if available
      if (inbox.length > 0 && !selectedItem) {
        setSelectedItem(inbox[0]);
      }
    } catch (err) {
      console.error("Error loading dispatches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.email]);

  // Apply Quick Template
  const handleApplyTemplate = (tmpl: (typeof OPERATIONAL_TEMPLATES.employee)[0]) => {
    setCategory(tmpl.category);
    setPriority(tmpl.priority);
    setSubject(tmpl.subject);
    setBody(tmpl.body);
    showToast(`Loaded template: ${tmpl.label}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Submit Official Dispatch
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !subject.trim() || !body.trim()) {
      showToast("Please fill in recipient, subject, and message content.");
      return;
    }

    setSending(true);
    const targetStaff = directory.find((d) => d.email.toLowerCase() === recipientEmail.toLowerCase());

    try {
      const res = await sendOfficialDispatch({
        senderId: currentUser?.id,
        senderName: currentUser?.name || "Staff Member",
        senderRole: currentUser?.role || "employee",
        senderEmail: currentUser?.email || "staff@raildrishti.gov.in",
        recipientId: targetStaff?.id,
        recipientName: targetStaff?.name || recipientEmail,
        recipientRole: targetStaff?.role || "controller",
        recipientEmail,
        category,
        priority,
        subject,
        body,
        trainNumber: trainNumber || undefined,
        section: section || undefined,
        stationCode: stationCode || undefined,
      });

      if (res.success) {
        showToast("Official memo successfully dispatched & emailed to Controller!");
        // Reset form
        setSubject("");
        setBody("");
        setTrainNumber("");
        setActiveTab("sent");
        loadData();
      }
    } catch (err: any) {
      showToast(`Failed to send dispatch: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  // Acknowledge Directive
  const handleAcknowledge = async (item: DispatchItem) => {
    try {
      const res = await acknowledgeDispatchApi(item.id, currentUser?.name);
      if (res.success && res.dispatch) {
        setInboxItems((prev) => prev.map((i) => (i.id === item.id ? res.dispatch! : i)));
        setSelectedItem(res.dispatch);
        showToast("Operational Directive marked as Acknowledged & Logged.");
      }
    } catch (err: any) {
      showToast(`Acknowledgment error: ${err.message}`);
    }
  };

  // Navigation Items
  const navItems: EmployeeNavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/employee/dashboard", active: true },
    { id: "duty", label: "My Duty", icon: CalendarCheck, path: "/employee/duty", active: true },
    { id: "assignment", label: "My Train / Section", icon: TrainFront, path: "/employee/assignment", active: true },
    { id: "alerts", label: "Alerts", icon: AlertTriangle, path: "/employee/alerts", active: true },
    { id: "tasks", label: "Tasks", icon: CheckSquare, path: "/employee/tasks", active: true },
    { id: "report_issue", label: "Report Issue", icon: FileWarning, path: "/employee/report", active: true },
    { id: "mail", label: "Official Mail & Directives", icon: Mail, path: "/employee/mail", active: true, badge: inboxItems.filter((i) => i.status !== "acknowledged").length },
    { id: "incident", label: "Incident Reporting", icon: Flame, path: "/employee/incidents", active: true },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/employee/notifications", active: true },
    { id: "history", label: "Activity / History", icon: History, path: "/employee/history", active: true },
    { id: "profile", label: "Profile", icon: User, path: "/employee/profile", active: true },
  ];

  // Filtered inbox
  const filteredInbox = useMemo(() => {
    if (filterPriority === "all") return inboxItems;
    return inboxItems.filter((i) => i.priority === filterPriority);
  }, [inboxItems, filterPriority]);

  const controllersList = useMemo(() => {
    return directory.filter((d) => d.role === "controller");
  }, [directory]);

  return (
    <div className="min-h-screen bg-[#031426] text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0E7C86] text-white px-4 py-2.5 rounded-lg shadow-xl border border-teal-400/40 text-xs font-medium">
          <CheckCircle2 size={16} className="text-teal-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-40 flex h-[72px] shrink-0 items-center justify-between border-b border-[#16364A] bg-[#071A33] px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#F59E0B] bg-[#0A2036] text-white transition hover:bg-[#0E5961] lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border border-[#294665] bg-[#0A2036] flex items-center justify-center font-black text-amber-400 text-lg">
              RD
            </div>
            <div>
              <div className="text-base font-black tracking-tight text-white sm:text-lg">
                Rail<span className="text-[#F59E0B]">Drishti</span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#0E7C86]">
                Official Dispatch & Communications Architecture
              </div>
            </div>
          </div>
        </div>

        {/* Live Clock & Staff Badge */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIs24Hour(!is24Hour)}
            className="hidden items-center gap-2 rounded-lg border border-[#16364A] bg-[#0A2036] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-[#0E7C86] sm:flex"
          >
            <Clock size={14} className="text-[#0E7C86]" />
            <span>
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: !is24Hour,
              })}{" "}
              IST
            </span>
          </button>
          <div className="flex items-center gap-2 border-l border-[#16364A] pl-3">
            <div className="h-8 w-8 rounded-full bg-[#0E7C86]/30 border border-[#0E7C86] flex items-center justify-center text-teal-300 font-bold text-xs">
              {currentUser?.name?.slice(0, 2).toUpperCase() || "IR"}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-white">{currentUser?.name || "Railway Staff"}</div>
              <div className="text-[10px] text-teal-400 font-mono">{currentUser?.employeeId || "IR-STAFF"}</div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR NAVIGATION */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#16364A] bg-[#071A33] transition-transform duration-300 lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-[72px] items-center justify-between border-b border-[#16364A] px-4 lg:hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</span>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isCurrent = item.id === "mail";
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.path) navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition ${
                    isCurrent
                      ? "bg-[#0E5961] text-white shadow-md border-l-4 border-amber-400"
                      : "text-slate-300 hover:bg-[#0A2036] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isCurrent ? "text-amber-400" : "text-slate-400"} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-extrabold text-slate-950">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-[#16364A] p-3">
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-950/40"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#031426]">
          {/* Top Banner / Tab Switcher */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                <Mail className="text-amber-400" size={22} />
                Official Dispatches & Control Mail
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Official operational communication channel between Field Employees and Section Controllers.
              </p>
            </div>

            {/* Tab Buttons */}
            <div className="flex items-center gap-2 bg-[#0A2036] p-1 rounded-lg border border-[#16364A]">
              <button
                type="button"
                onClick={() => setActiveTab("inbox")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                  activeTab === "inbox"
                    ? "bg-[#0E5961] text-white shadow"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Inbox size={14} />
                <span>Inbox ({inboxItems.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("sent")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                  activeTab === "sent"
                    ? "bg-[#0E5961] text-white shadow"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Send size={14} />
                <span>Sent Memos ({sentItems.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("compose")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-extrabold transition ${
                  activeTab === "compose"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                }`}
              >
                <FileText size={14} />
                <span>+ New Memo</span>
              </button>

              <button
                type="button"
                onClick={loadData}
                title="Refresh mail sync"
                className="p-1.5 text-slate-400 hover:text-white transition"
              >
                <RefreshCw size={14} className={loading ? "animate-spin text-amber-400" : ""} />
              </button>
            </div>
          </div>

          {/* VIEW 1: COMPOSE MEMO */}
          {activeTab === "compose" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Col */}
              <div className="lg:col-span-2 rounded-xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-[#16364A] mb-5">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Send size={16} />
                    Compose Official Memo to Section Controller
                  </h2>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Sender: {currentUser?.email || "staff@raildrishti.gov.in"}
                  </span>
                </div>

                <form onSubmit={handleSend} className="space-y-4">
                  {/* Recipient Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      To: Section Controller
                    </label>
                    <select
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full rounded-lg border border-[#16364A] bg-[#0A2036] px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                    >
                      {controllersList.map((c) => (
                        <option key={c.id} value={c.email}>
                          {c.name} — {c.designation} ({c.email})
                        </option>
                      ))}
                      <option value="controller@raildrishti.gov.in">
                        Central Traffic Control Desk (controller@raildrishti.gov.in)
                      </option>
                    </select>
                  </div>

                  {/* Category & Priority Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Category / Operational Purpose
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as DispatchCategory)}
                        className="w-full rounded-lg border border-[#16364A] bg-[#0A2036] px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                      >
                        <option value="work_completion">Work Completion Memo</option>
                        <option value="problem_report">Defect / Problem Report</option>
                        <option value="operational_directive">Operational Update</option>
                        <option value="safety_circular">Safety Notice</option>
                        <option value="general">General Operational Note</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Priority Classification
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as DispatchPriority)}
                        className="w-full rounded-lg border border-[#16364A] bg-[#0A2036] px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                      >
                        <option value="routine">Routine (Normal Handling)</option>
                        <option value="high">High (Immediate Traffic Attention)</option>
                        <option value="urgent">Urgent (Safety / Line Disruption)</option>
                      </select>
                    </div>
                  </div>

                  {/* Operational Context: Train & Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Train Number (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 12628"
                        value={trainNumber}
                        onChange={(e) => setTrainNumber(e.target.value)}
                        className="w-full rounded-lg border border-[#16364A] bg-[#0A2036] px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Station Code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. SBC, WFD"
                        value={stationCode}
                        onChange={(e) => setStationCode(e.target.value.toUpperCase())}
                        className="w-full rounded-lg border border-[#16364A] bg-[#0A2036] px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Section / Beat
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. SBC - JTJ"
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        className="w-full rounded-lg border border-[#16364A] bg-[#0A2036] px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Subject Line */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Subject Line *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Work Completion Memo: Point No. 14 Interlocking Restored"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-lg border border-[#16364A] bg-[#0A2036] px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  {/* Body Content */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Operational Memo Details & Findings *
                    </label>
                    <textarea
                      rows={6}
                      required
                      placeholder="Detail the technical observation, repair completion status, train clearances, or safety notes..."
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="w-full rounded-lg border border-[#16364A] bg-[#0A2036] p-3 text-xs text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none font-mono"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-teal-400" />
                      Logged permanently in SQLite & dispatched via Nodemailer
                    </span>

                    <button
                      type="submit"
                      disabled={sending}
                      className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-xs font-black text-slate-950 transition hover:bg-amber-400 disabled:opacity-50 shadow-md"
                    >
                      <Send size={14} />
                      {sending ? "Sending Dispatch..." : "Dispatch & Send Email"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Templates Sidebar */}
              <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-5 shadow-xl flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-[#16364A] pb-3">
                  <Sparkles size={16} className="text-amber-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    1-Click Operational Templates
                  </h3>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Click any standard railway operational memo to auto-fill technical details:
                </p>

                <div className="space-y-2.5">
                  {OPERATIONAL_TEMPLATES.employee.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl)}
                      className="w-full text-left rounded-lg border border-[#16364A] bg-[#0A2036] p-3 transition hover:border-teal-400/50 hover:bg-[#0E5961]/20 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-amber-300">
                          {tmpl.label}
                        </span>
                        <ChevronRight size={14} className="text-slate-500 group-hover:text-amber-400" />
                      </div>
                      <span className="mt-1 inline-block text-[10px] font-semibold text-teal-400 uppercase">
                        {tmpl.priority} priority · {tmpl.category.replace(/_/g, " ")}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-auto rounded-lg border border-teal-500/20 bg-[#0E7C86]/10 p-3 text-[11px] text-teal-200">
                  <div className="font-bold mb-1 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-teal-400" />
                    Controller Response Tracking
                  </div>
                  Once dispatched, the section controller will receive this directive in their console and an official acknowledgment will reflect in your Sent history.
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: INBOX & SENT DUAL PANE */}
          {(activeTab === "inbox" || activeTab === "sent") && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left List Pane */}
              <div className="lg:col-span-5 flex flex-col rounded-xl border border-[#16364A] bg-[#071A33] overflow-hidden shadow-xl">
                {/* Filter Toolbar */}
                <div className="flex items-center justify-between border-b border-[#16364A] bg-[#0A2036] p-3">
                  <div className="flex items-center gap-2">
                    <Filter size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-300">
                      {activeTab === "inbox" ? "Directives from Controllers" : "Your Sent Memos"}
                    </span>
                  </div>

                  {activeTab === "inbox" && (
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="rounded border border-[#16364A] bg-[#071A33] px-2 py-1 text-[11px] text-white focus:outline-none"
                    >
                      <option value="all">All Priorities</option>
                      <option value="urgent">Urgent Only</option>
                      <option value="high">High Only</option>
                      <option value="routine">Routine</option>
                    </select>
                  )}
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto divide-y divide-[#16364A] max-h-[600px]">
                  {loading ? (
                    <div className="p-8 text-center text-xs text-slate-400">Loading dispatches...</div>
                  ) : (activeTab === "inbox" ? filteredInbox : sentItems).length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No dispatches found in this folder.
                    </div>
                  ) : (
                    (activeTab === "inbox" ? filteredInbox : sentItems).map((item) => {
                      const isSelected = selectedItem?.id === item.id;
                      const isUrgent = item.priority === "urgent";
                      const isHigh = item.priority === "high";

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className={`w-full text-left p-3.5 transition flex flex-col gap-1.5 ${
                            isSelected
                              ? "bg-[#0E5961]/30 border-l-4 border-amber-400"
                              : "hover:bg-[#0A2036]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white truncate max-w-[200px]">
                              {activeTab === "inbox" ? item.sender_name : `To: ${item.recipient_name}`}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                isUrgent
                                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                  : isHigh
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              {item.priority}
                            </span>
                          </div>

                          <div className="text-xs font-semibold text-slate-200 truncate">
                            {item.subject}
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                            <span>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="font-mono text-teal-400">
                              {item.status === "acknowledged" ? "✓ Acknowledged" : "Pending Action"}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Detail Pane */}
              <div className="lg:col-span-7 rounded-xl border border-[#16364A] bg-[#071A33] overflow-hidden shadow-xl flex flex-col">
                {selectedItem ? (
                  <div className="flex flex-col h-full">
                    {/* Header Banner */}
                    <div className="border-b border-[#16364A] bg-[#0A2036] p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                          Dispatch ID: {selectedItem.id}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                              selectedItem.priority === "urgent"
                                ? "bg-rose-600 text-white"
                                : selectedItem.priority === "high"
                                ? "bg-amber-500 text-slate-950 font-black"
                                : "bg-blue-600 text-white"
                            }`}
                          >
                            {selectedItem.priority} PRIORITY
                          </span>
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                            {selectedItem.category.replace(/_/g, " ").toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <h2 className="text-base font-bold text-white mb-2">{selectedItem.subject}</h2>

                      {/* Metadata Table */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-[#071A33] p-2.5 rounded-lg border border-[#16364A]">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">From:</span>
                          <span className="text-slate-200 font-semibold">{selectedItem.sender_name}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">To:</span>
                          <span className="text-slate-200 font-semibold">{selectedItem.recipient_name}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Train / Section:</span>
                          <span className="text-amber-300 font-mono">
                            {selectedItem.train_number ? `Train #${selectedItem.train_number}` : selectedItem.section || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Timestamp:</span>
                          <span className="text-slate-300">
                            {new Date(selectedItem.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Message Body */}
                    <div className="flex-1 p-5 overflow-y-auto bg-[#071A33]">
                      <div className="rounded-lg border border-[#16364A] bg-[#0A2036]/60 p-4 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {selectedItem.body}
                      </div>

                      {/* Preview / SMTP status */}
                      {selectedItem.smtp_preview_url && (
                        <div className="mt-4 p-3 rounded-lg bg-teal-950/40 border border-teal-500/30 flex items-center justify-between">
                          <span className="text-xs text-teal-300">
                            ✉️ Live rendered email copy available (Ethereal test inbox)
                          </span>
                          <a
                            href={selectedItem.smtp_preview_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-xs font-bold text-teal-200 hover:text-white bg-[#0E5961] px-3 py-1 rounded"
                          >
                            View HTML Email <ExternalLink size={12} />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="border-t border-[#16364A] bg-[#0A2036] p-4 flex items-center justify-between">
                      <div className="text-xs">
                        Status:{" "}
                        <span
                          className={`font-bold ${
                            selectedItem.status === "acknowledged" ? "text-teal-400" : "text-amber-400"
                          }`}
                        >
                          {selectedItem.status === "acknowledged"
                            ? `✓ Acknowledged at ${new Date(selectedItem.acknowledged_at || "").toLocaleTimeString()}`
                            : "Awaiting Staff Compliance / Acknowledgment"}
                        </span>
                      </div>

                      {activeTab === "inbox" && selectedItem.status !== "acknowledged" && (
                        <button
                          type="button"
                          onClick={() => handleAcknowledge(selectedItem)}
                          className="flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-black text-slate-950 transition shadow-lg"
                        >
                          <CheckCircle2 size={15} />
                          Acknowledge Receipt & Compliance
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-8 text-xs text-slate-400">
                    Select a dispatch from the list to view full details.
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

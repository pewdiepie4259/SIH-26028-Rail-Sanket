import React, { useState, useEffect } from "react";
import {
  Mail,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  RefreshCw,
  AlertTriangle,
  FileText,
  User,
  Reply,
  CheckCheck,
  Radio,
  X,
} from "lucide-react";
import { getCurrentUser, type AuthUser } from "../../services/auth";
import {
  fetchAllDispatchesForAdmin,
  reviewDispatchAndSendReturn,
  sendOfficialDispatch,
  fetchStaffDirectory,
  type DispatchItem,
  type StaffDirectoryItem,
  type DispatchCategory,
  type DispatchPriority,
} from "../../services/mailService";

export default function AdminMail() {
  const [currentUser] = useState<AuthUser | null>(getCurrentUser());
  const [dispatches, setDispatches] = useState<DispatchItem[]>([]);
  const [directory, setDirectory] = useState<StaffDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Selected dispatch for inspect / review modal
  const [inspectItem, setInspectItem] = useState<DispatchItem | null>(null);
  const [reviewDecision, setReviewDecision] = useState<"approved" | "rejected">("approved");
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Compose Modal state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeRecipientEmail, setComposeRecipientEmail] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeCategory, setComposeCategory] = useState<DispatchCategory>("operational_directive");
  const [composePriority, setComposePriority] = useState<DispatchPriority>("high");
  const [sendingCompose, setSendingCompose] = useState(false);

  // Toast / Alert banner
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [items, staff] = await Promise.all([
        fetchAllDispatchesForAdmin(selectedRole, selectedStatus, selectedCategory),
        fetchStaffDirectory(),
      ]);
      setDispatches(items);
      setDirectory(staff);
    } catch (err) {
      console.error("Failed to load admin mail:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedRole, selectedStatus, selectedCategory]);

  const showBanner = (type: "success" | "error", message: string) => {
    setBanner({ type, message });
    setTimeout(() => setBanner(null), 6000);
  };

  const handleOpenReview = (item: DispatchItem, initialDecision: "approved" | "rejected" = "approved") => {
    setInspectItem(item);
    setReviewDecision(initialDecision);
    setReviewerNotes(
      initialDecision === "approved"
        ? "Verified and approved by Central Operations Administration. Authorized to proceed."
        : "Rejected following review. Rectification required as per safety protocol."
    );
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectItem) return;

    setSubmittingReview(true);
    try {
      const res = await reviewDispatchAndSendReturn(
        inspectItem.id,
        reviewDecision,
        reviewerNotes,
        currentUser?.name || "Chief Operations Administrator",
        currentUser?.email || "admin@raildrishti.gov.in"
      );

      if (res.success) {
        showBanner(
          "success",
          `Memo '${inspectItem.subject}' ${reviewDecision.toUpperCase()}. Official return dispatch sent to ${inspectItem.sender_name}.`
        );
        setInspectItem(null);
        loadData();
      } else {
        showBanner("error", res.message || "Failed to submit review.");
      }
    } catch {
      showBanner("error", "An error occurred during review submission.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSendCompose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeRecipientEmail || !composeSubject || !composeBody) {
      showBanner("error", "Please fill in all mandatory fields.");
      return;
    }

    setSendingCompose(true);
    try {
      const targetStaff = directory.find((s) => s.email === composeRecipientEmail);

      const res = await sendOfficialDispatch({
        senderName: currentUser?.name || "Operations Directorate (Admin)",
        senderRole: "admin",
        senderEmail: currentUser?.email || "admin@raildrishti.gov.in",
        recipientEmail: composeRecipientEmail,
        recipientName: targetStaff?.name || "Railway Official",
        recipientRole: targetStaff?.role || "employee",
        recipientId: targetStaff?.id,
        subject: composeSubject,
        body: composeBody,
        category: composeCategory,
        priority: composePriority,
      });

      if (res.success) {
        showBanner("success", `Official Directive successfully dispatched to ${composeRecipientEmail}.`);
        setIsComposeOpen(false);
        setComposeSubject("");
        setComposeBody("");
        loadData();
      } else {
        showBanner("error", res.message || "Failed to send dispatch.");
      }
    } catch {
      showBanner("error", "An error occurred while dispatching memo.");
    } finally {
      setSendingCompose(false);
    }
  };

  // Filtered dispatches
  const filteredDispatches = dispatches.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      item.subject.toLowerCase().includes(query) ||
      item.body.toLowerCase().includes(query) ||
      item.sender_name.toLowerCase().includes(query) ||
      item.sender_email.toLowerCase().includes(query) ||
      (item.train_number && item.train_number.toLowerCase().includes(query)) ||
      (item.section && item.section.toLowerCase().includes(query));

    return matchesSearch;
  });

  // Summary counts
  const totalCount = dispatches.length;
  const employeeMailsCount = dispatches.filter((d) => d.sender_role?.toLowerCase() === "employee").length;
  const controllerMailsCount = dispatches.filter((d) => d.sender_role?.toLowerCase() === "controller").length;
  const pendingReviewCount = dispatches.filter((d) => d.approval_status === "pending_review").length;

  return (
    <div className="min-h-screen bg-[#031426] text-slate-100 p-4 lg:p-8 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#16364A] pb-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#0E7C86]/20 border border-[#0E7C86]/40 flex items-center justify-center text-teal-400 shadow-inner">
            <Mail size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#F59E0B]">
                RailDrishti Directorate Desk
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Official Oversight
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Official Memos & Communications
            </h1>
            <p className="text-xs text-slate-400">
              Review and approve work completion memos, defect reports, and operational dispatches from Employees and Controllers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0A2036] hover:bg-[#16364A] text-slate-200 text-xs font-semibold transition border border-[#294665]"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-teal-400" : ""} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsComposeOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0E7C86] hover:bg-[#0E5961] text-white text-xs font-bold transition shadow-lg border border-teal-400/40"
          >
            <Send size={14} />
            <span>Dispatch Directive</span>
          </button>
        </div>
      </div>

      {/* Banner */}
      {banner && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-3 border shadow-md animate-in fade-in ${
            banner.type === "success"
              ? "bg-emerald-950/70 border-emerald-500/40 text-emerald-200"
              : "bg-red-950/70 border-red-500/40 text-red-200"
          }`}
        >
          {banner.type === "success" ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle size={18} className="text-red-400 shrink-0" />
          )}
          <span className="font-medium">{banner.message}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="p-4 rounded-xl bg-[#071A33] border border-[#16364A] space-y-1">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Total Memos</span>
            <FileText size={15} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalCount}</div>
          <div className="text-[10px] text-slate-400">All dispatches logged in network</div>
        </div>

        {/* Pending Review */}
        <div className="p-4 rounded-xl bg-[#071A33] border border-amber-500/30 space-y-1">
          <div className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Pending Review</span>
            <Clock size={15} className="text-amber-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{pendingReviewCount}</div>
          <div className="text-[10px] text-slate-400">Awaiting Admin decision & return mail</div>
        </div>

        {/* Employee Mails */}
        <div className="p-4 rounded-xl bg-[#071A33] border border-teal-500/30 space-y-1">
          <div className="text-[11px] text-teal-400 font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>From Employees</span>
            <User size={15} className="text-teal-400" />
          </div>
          <div className="text-2xl font-black text-teal-300 font-mono">{employeeMailsCount}</div>
          <div className="text-[10px] text-slate-400">Signal, P-Way, Station Masters, Loco Pilots</div>
        </div>

        {/* Controller Mails */}
        <div className="p-4 rounded-xl bg-[#071A33] border border-blue-500/30 space-y-1">
          <div className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>From Controllers</span>
            <Radio size={15} className="text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-300 font-mono">{controllerMailsCount}</div>
          <div className="text-[10px] text-slate-400">Section Control, headways, block permits</div>
        </div>
      </div>

      {/* Controls & Filters */}
      <div className="p-4 rounded-xl bg-[#071A33] border border-[#16364A] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search memo subject, sender, train, section..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0A2036] border border-[#16364A] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 bg-[#0A2036] px-3 py-1.5 rounded-xl border border-[#16364A]">
            <Filter size={13} className="text-slate-400" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none"
            >
              <option value="all" className="bg-[#0A2036]">All Senders</option>
              <option value="employee" className="bg-[#0A2036]">Employees Only</option>
              <option value="controller" className="bg-[#0A2036]">Controllers Only</option>
              <option value="admin" className="bg-[#0A2036]">Admin Directives</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-[#0A2036] px-3 py-1.5 rounded-xl border border-[#16364A]">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none"
            >
              <option value="all" className="bg-[#0A2036]">All Review Statuses</option>
              <option value="pending_review" className="bg-[#0A2036]">Pending Review</option>
              <option value="approved" className="bg-[#0A2036]">Approved</option>
              <option value="rejected" className="bg-[#0A2036]">Rejected</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-[#0A2036] px-3 py-1.5 rounded-xl border border-[#16364A]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none"
            >
              <option value="all" className="bg-[#0A2036]">All Categories</option>
              <option value="work_completion" className="bg-[#0A2036]">Work Completion</option>
              <option value="problem_report" className="bg-[#0A2036]">Problem / Defect</option>
              <option value="operational_directive" className="bg-[#0A2036]">Operational Directive</option>
              <option value="speed_restriction" className="bg-[#0A2036]">Speed Restriction</option>
              <option value="safety_circular" className="bg-[#0A2036]">Safety Circular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dispatch List */}
      <div className="rounded-2xl border border-[#16364A] bg-[#071A33] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#16364A] bg-[#051322] text-[#718F96] uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4 font-bold">Sender & Role</th>
                <th className="py-3.5 px-4 font-bold">Category / Priority</th>
                <th className="py-3.5 px-4 font-bold">Subject & Context</th>
                <th className="py-3.5 px-4 font-bold">Review Status</th>
                <th className="py-3.5 px-4 font-bold">Date & Time</th>
                <th className="py-3.5 px-4 font-bold text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#16364A]/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2 text-xs">
                      <RefreshCw size={16} className="animate-spin text-teal-400" />
                      <span>Loading communication records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDispatches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    No dispatches matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredDispatches.map((item) => {
                  const isEmployee = item.sender_role?.toLowerCase() === "employee";
                  const isController = item.sender_role?.toLowerCase() === "controller";
                  const isPending = item.approval_status === "pending_review";
                  const isApproved = item.approval_status === "approved";
                  const isRejected = item.approval_status === "rejected";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#0A2036]/70 transition-colors"
                    >
                      {/* Sender */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isEmployee
                                ? "bg-teal-400"
                                : isController
                                ? "bg-blue-400"
                                : "bg-amber-400"
                            }`}
                          />
                          <span className="font-bold text-white text-xs">
                            {item.sender_name}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {item.sender_email}
                        </div>
                        <div className="mt-1">
                          <span
                            className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                              isEmployee
                                ? "bg-teal-950 text-teal-300 border border-teal-700/50"
                                : isController
                                ? "bg-blue-950 text-blue-300 border border-blue-700/50"
                                : "bg-purple-950 text-purple-300 border border-purple-700/50"
                            }`}
                          >
                            {item.sender_role}
                          </span>
                        </div>
                      </td>

                      {/* Category & Priority */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200 capitalize text-xs">
                          {item.category.replace(/_/g, " ")}
                        </div>
                        <div className="mt-1">
                          <span
                            className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              item.priority === "urgent"
                                ? "bg-rose-950 text-rose-300 border border-rose-700/50 animate-pulse"
                                : item.priority === "high"
                                ? "bg-amber-950 text-amber-300 border border-amber-700/50"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {item.priority}
                          </span>
                        </div>
                      </td>

                      {/* Subject & Context */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-sm">
                        <div className="font-bold text-white text-xs truncate">
                          {item.subject}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.body.substring(0, 80)}...
                        </div>
                        {(item.train_number || item.section) && (
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                            {item.train_number && (
                              <span className="font-mono text-teal-300">
                                Train #{item.train_number}
                              </span>
                            )}
                            {item.section && (
                              <span>• {item.section}</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <Clock size={11} className="animate-spin" />
                            Pending Review
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 size={11} />
                            Approved
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            <XCircle size={11} />
                            Rejected
                          </span>
                        )}
                        {!isPending && !isApproved && !isRejected && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-slate-400 bg-slate-800">
                            Logged
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono">
                        {new Date(item.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}{" "}
                        {new Date(item.created_at).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenReview(item, "approved")}
                            className="px-2.5 py-1.5 rounded-lg bg-[#0A2036] hover:bg-[#16364A] text-slate-200 text-xs font-semibold transition border border-[#294665]"
                            title="Inspect Memo"
                          >
                            Inspect
                          </button>

                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenReview(item, "approved")}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1"
                                title="Approve & Send Return Mail"
                              >
                                <CheckCircle2 size={12} />
                                <span>Approve</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenReview(item, "rejected")}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-700/80 hover:bg-rose-600 text-white text-xs font-bold transition flex items-center gap-1"
                                title="Reject & Send Return Mail"
                              >
                                <XCircle size={12} />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT & REVIEW MODAL */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-[#16364A] bg-[#071A33] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#16364A] pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center border ${
                    inspectItem.sender_role?.toLowerCase() === "employee"
                      ? "bg-teal-950 border-teal-700/50 text-teal-400"
                      : "bg-blue-950 border-blue-700/50 text-blue-400"
                  }`}
                >
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Official Memo Review & Oversight
                  </h3>
                  <p className="text-xs text-slate-400">
                    Dispatched by {inspectItem.sender_name} ({inspectItem.sender_role?.toUpperCase()})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectItem(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#0A2036] hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Memo Details Body */}
            <div className="space-y-3.5 bg-[#0A2036] p-4 rounded-xl border border-[#16364A] text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#16364A] pb-2.5">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Subject</span>
                  <span className="text-white font-bold text-sm">{inspectItem.subject}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Priority / Category</span>
                  <span className="font-semibold text-teal-300 uppercase text-[11px]">
                    {inspectItem.category.replace(/_/g, " ")} • {inspectItem.priority}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Sender Official</span>
                  <span className="text-white font-semibold">{inspectItem.sender_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Sender Role</span>
                  <span className="text-teal-300 font-semibold capitalize">{inspectItem.sender_role}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Email Address</span>
                  <span className="text-slate-200 font-mono text-[10px]">{inspectItem.sender_email}</span>
                </div>
                {inspectItem.train_number && (
                  <div>
                    <span className="text-slate-400 block">Train Number</span>
                    <span className="text-amber-300 font-mono font-bold">#{inspectItem.train_number}</span>
                  </div>
                )}
                {inspectItem.section && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Operational Section</span>
                    <span className="text-slate-200">{inspectItem.section}</span>
                  </div>
                )}
              </div>

              {/* Memo Body Content */}
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                  Memo Message Content
                </span>
                <div className="p-3 rounded-lg bg-[#031426] border border-[#16364A] text-slate-200 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {inspectItem.body}
                </div>
              </div>

              {/* Existing Review Info if already reviewed */}
              {inspectItem.reviewed_by && (
                <div className="p-2.5 rounded-lg bg-teal-950/40 border border-teal-700/50 text-[11px] space-y-1">
                  <div className="text-teal-300 font-bold flex items-center gap-1">
                    <CheckCheck size={13} />
                    <span>Previously Reviewed by: {inspectItem.reviewed_by}</span>
                  </div>
                  <div className="text-slate-300">
                    Decision: <strong className="uppercase">{inspectItem.approval_status}</strong>
                  </div>
                  {inspectItem.reviewer_notes && (
                    <div className="text-slate-400 italic">"{inspectItem.reviewer_notes}"</div>
                  )}
                </div>
              )}
            </div>

            {/* Review & Return Mail Form */}
            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-2">
                  Administrative Decision
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setReviewDecision("approved");
                      if (!reviewerNotes || reviewerNotes.includes("Rejected")) {
                        setReviewerNotes("Verified and approved by Central Operations Administration. Authorized to proceed.");
                      }
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                      reviewDecision === "approved"
                        ? "bg-emerald-950 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/40"
                        : "bg-[#0A2036] border-[#16364A] text-slate-400 hover:text-white"
                    }`}
                  >
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>Approve Work Memo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReviewDecision("rejected");
                      if (!reviewerNotes || reviewerNotes.includes("approved")) {
                        setReviewerNotes("Rejected following review. Rectification required as per safety protocol.");
                      }
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                      reviewDecision === "rejected"
                        ? "bg-rose-950 border-rose-500 text-rose-300 ring-2 ring-rose-500/40"
                        : "bg-[#0A2036] border-[#16364A] text-slate-400 hover:text-white"
                    }`}
                  >
                    <XCircle size={16} className="text-rose-400" />
                    <span>Reject Work Memo</span>
                  </button>
                </div>
              </div>

              {/* Reviewer Directives / Notes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Administrative Directives / Remarks (Dispatched in Return Mail)
                </label>
                <textarea
                  rows={3}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  required
                  placeholder="Enter official directives, safety precautions, or instructions for the sender..."
                  className="w-full bg-[#0A2036] border border-[#16364A] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 resize-none font-sans"
                />
              </div>

              {/* Return Mail Notice */}
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-teal-950/50 border border-teal-500/30 text-teal-200 text-[11px]">
                <Reply size={14} className="text-teal-400 shrink-0" />
                <span>
                  Confirming will update the status in the database and automatically dispatch an official <strong>Return Memo</strong> directly to <strong>{inspectItem.sender_name}</strong>.
                </span>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setInspectItem(null)}
                  disabled={submittingReview}
                  className="px-4 py-2.5 rounded-xl border border-[#294665] bg-[#0A2036] text-slate-300 hover:bg-[#16364A] transition font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white transition shadow-md disabled:opacity-50 ${
                    reviewDecision === "approved"
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : "bg-rose-600 hover:bg-rose-500"
                  }`}
                >
                  {submittingReview ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Dispatching Decision & Return Mail...</span>
                    </>
                  ) : (
                    <>
                      <Reply size={14} />
                      <span>
                        Confirm {reviewDecision === "approved" ? "Approval" : "Rejection"} & Send Return Mail
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPOSE DIRECTIVE MODAL */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-[#16364A] bg-[#071A33] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#16364A] pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#0E7C86]/20 border border-[#0E7C86]/40 flex items-center justify-center text-teal-400">
                  <Send size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Dispatch Official Administrative Directive
                  </h3>
                  <p className="text-xs text-slate-400">
                    Send authoritative communications, circulars, and directives to Employees or Controllers
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#0A2036] hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendCompose} className="space-y-4 text-xs">
              {/* Recipient */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Recipient Official (Employee or Controller)
                </label>
                <select
                  value={composeRecipientEmail}
                  onChange={(e) => setComposeRecipientEmail(e.target.value)}
                  required
                  className="w-full bg-[#0A2036] border border-[#16364A] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-400"
                >
                  <option value="">-- Select Recipient from Staff Directory --</option>
                  <optgroup label="Section Controllers">
                    {directory
                      .filter((s) => s.role === "controller")
                      .map((s) => (
                        <option key={s.id} value={s.email}>
                          {s.name} ({s.designation || s.email})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Division Employees">
                    {directory
                      .filter((s) => s.role === "employee")
                      .map((s) => (
                        <option key={s.id} value={s.email}>
                          {s.name} ({s.department || s.email})
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Directive Category
                  </label>
                  <select
                    value={composeCategory}
                    onChange={(e) => setComposeCategory(e.target.value as DispatchCategory)}
                    className="w-full bg-[#0A2036] border border-[#16364A] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="operational_directive">Operational Directive</option>
                    <option value="safety_circular">Safety Circular</option>
                    <option value="speed_restriction">Speed Restriction Order</option>
                    <option value="general">General Administrative Memo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Priority Level
                  </label>
                  <select
                    value={composePriority}
                    onChange={(e) => setComposePriority(e.target.value as DispatchPriority)}
                    className="w-full bg-[#0A2036] border border-[#16364A] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="routine">Routine</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent / Emergency</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Directive Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Safety Mandate: Track Renewal Inspection Protocol"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full bg-[#0A2036] border border-[#16364A] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Official Directive Body
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter full administrative directive or operational instruction..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="w-full bg-[#0A2036] border border-[#16364A] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 font-sans resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  disabled={sendingCompose}
                  className="px-4 py-2.5 rounded-xl border border-[#294665] bg-[#0A2036] text-slate-300 hover:bg-[#16364A] transition font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={sendingCompose}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0E7C86] hover:bg-[#0E5961] text-white font-bold transition shadow-md disabled:opacity-50"
                >
                  {sendingCompose ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Dispatching Directive...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Dispatch Official Directive</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

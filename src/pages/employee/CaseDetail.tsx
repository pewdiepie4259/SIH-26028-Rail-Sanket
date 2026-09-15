import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  AlertOctagon,
  Clock,
  MapPin,
  User,
  Shield,
  Send,
  Building2,
  RefreshCw,
  Info,
  Radio,
  History,
  MessageSquare,
  FileCheck2,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { getCurrentUser } from "../../services/auth";
import {
  caseService,
  DEPARTMENT_DIRECTORY,
  type OperationalCase,
  type CaseStatus,
  type DepartmentTeamDirectory,
} from "../../services/caseService";

const STATUS_STEPS: { key: CaseStatus; label: string; desc: string }[] = [
  { key: "SUBMITTED", label: "Submitted", desc: "Report logged by employee" },
  { key: "ACKNOWLEDGED", label: "Acknowledged", desc: "Desk receipt confirmed" },
  { key: "UNDER_REVIEW", label: "Under Review", desc: "Impact & safety triaged" },
  { key: "ASSIGNED", label: "Assigned", desc: "Dispatched to field team" },
  { key: "IN_PROGRESS", label: "In Progress", desc: "Field crew on site" },
  { key: "RESOLVED", label: "Resolved", desc: "Fault cleared by team" },
  { key: "VERIFIED", label: "Verified", desc: "Controller verified normal" },
  { key: "CLOSED", label: "Closed", desc: "Case archived in logbook" },
];

export default function CaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();

  const isController = currentUser?.role === "controller";
  const isAdmin = currentUser?.role === "admin";
  const isPrivileged = isController || isAdmin;

  const [operationalCase, setOperationalCase] = useState<OperationalCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Controller / Admin Action Dialogs
  const [assignDepartment, setAssignDepartment] = useState("");
  const [assignTeam, setAssignTeam] = useState("");
  const [assignNotes, setAssignNotes] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const [reviewImpact, setReviewImpact] = useState<"NONE" | "MINOR" | "MODERATE" | "SEVERE">("MINOR");
  const [reviewNotes, setReviewNotes] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  const [newStatus, setNewStatus] = useState<CaseStatus>("IN_PROGRESS");
  const [statusNotes, setStatusNotes] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [verifyNotes, setVerifyNotes] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // New Comment state
  const [commentText, setCommentText] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadCase = async () => {
    if (!caseId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await caseService.getCaseById(caseId);
      if (res.success && res.data) {
        setOperationalCase(res.data);
        if (res.data.department) {
          setAssignDepartment(res.data.department);
          setAssignTeam(res.data.assignedTeam || "");
        }
      } else {
        setError(res.error || `Case ${caseId} not found.`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load case details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCase();
  }, [caseId]);

  // Back Navigation Helper
  const handleBack = () => {
    if (location.pathname.startsWith("/controller")) {
      navigate("/controller/reports");
    } else if (location.pathname.startsWith("/admin")) {
      navigate("/admin");
    } else {
      navigate("/employee/report");
    }
  };

  // Controller Actions
  const handleAcknowledge = async () => {
    if (!caseId) return;
    try {
      const res = await caseService.acknowledgeCase(caseId, {
        actorId: currentUser?.employeeId || "CTRL-DESK",
        actorName: currentUser?.name || "Section Controller",
        actorRole: currentUser?.role || "controller",
        notes: "Acknowledged at Section Control Desk. Commencing immediate operational review.",
      });
      if (res.success && res.data) {
        setOperationalCase(res.data);
        showToast("Case successfully acknowledged.");
      } else {
        showToast(res.error || "Failed to acknowledge case.");
      }
    } catch (err: any) {
      showToast(err.message || "Network error.");
    }
  };

  const handleReview = async () => {
    if (!caseId) return;
    try {
      const res = await caseService.reviewCase(caseId, {
        actorId: currentUser?.employeeId || "CTRL-DESK",
        actorName: currentUser?.name || "Section Controller",
        actorRole: currentUser?.role || "controller",
        operationalImpact: reviewImpact,
        notes: reviewNotes || `Operational impact rated as ${reviewImpact}.`,
      });
      if (res.success && res.data) {
        setOperationalCase(res.data);
        setIsReviewing(false);
        setReviewNotes("");
        showToast("Operational review logged.");
      } else {
        showToast(res.error || "Failed to review case.");
      }
    } catch (err: any) {
      showToast(err.message || "Network error.");
    }
  };

  const handleAssign = async () => {
    if (!caseId || !assignDepartment) return;
    try {
      const res = await caseService.assignCase(caseId, {
        actorId: currentUser?.employeeId || "CTRL-DESK",
        actorName: currentUser?.name || "Section Controller",
        actorRole: currentUser?.role || "controller",
        department: assignDepartment,
        assignedTeam: assignTeam || assignDepartment,
        notes: assignNotes || `Assigned to ${assignTeam || assignDepartment} for immediate site remediation.`,
      });
      if (res.success && res.data) {
        setOperationalCase(res.data);
        setIsAssigning(false);
        setAssignNotes("");
        showToast(`Case dispatched to ${assignTeam || assignDepartment}.`);
      } else {
        showToast(res.error || "Failed to assign case.");
      }
    } catch (err: any) {
      showToast(err.message || "Network error.");
    }
  };

  const handleUpdateStatus = async () => {
    if (!caseId) return;
    try {
      const res = await caseService.updateCaseStatus(caseId, {
        actorId: currentUser?.employeeId || "FIELD-CREW",
        actorName: currentUser?.name || "Responsible Field Team",
        actorRole: currentUser?.role || "employee",
        status: newStatus,
        notes: statusNotes || `Status advanced to ${newStatus}.`,
      });
      if (res.success && res.data) {
        setOperationalCase(res.data);
        setIsUpdatingStatus(false);
        setStatusNotes("");
        showToast(`Status updated to ${newStatus}.`);
      } else {
        showToast(res.error || "Failed to update status.");
      }
    } catch (err: any) {
      showToast(err.message || "Network error.");
    }
  };

  const handleVerify = async () => {
    if (!caseId) return;
    try {
      const res = await caseService.verifyCase(caseId, {
        actorId: currentUser?.employeeId || "CTRL-DESK",
        actorName: currentUser?.name || "Section Controller",
        actorRole: currentUser?.role || "controller",
        resolutionVerified: true,
        notes: verifyNotes || "Site normal operations confirmed. Safe for full sectional speed.",
      });
      if (res.success && res.data) {
        setOperationalCase(res.data);
        setIsVerifying(false);
        setVerifyNotes("");
        showToast("Case verified and closed successfully.");
      } else {
        showToast(res.error || "Failed to verify case.");
      }
    } catch (err: any) {
      showToast(err.message || "Network error.");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseId || !commentText.trim()) return;
    setIsPostingComment(true);
    try {
      const res = await caseService.addComment(caseId, {
        authorId: currentUser?.employeeId || "USER",
        authorName: currentUser?.name || "Railway Staff",
        authorRole: currentUser?.role || "employee",
        comment: commentText.trim(),
      });
      if (res.success) {
        setCommentText("");
        loadCase();
        showToast("Operational note posted.");
      } else {
        showToast(res.error || "Failed to post note.");
      }
    } catch (err: any) {
      showToast(err.message || "Network error.");
    } finally {
      setIsPostingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030E1A] text-white flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-cyan-400" size={32} />
          <p className="text-sm font-mono text-slate-400">Loading live case data from Railway Central DB...</p>
        </div>
      </div>
    );
  }

  if (error || !operationalCase) {
    return (
      <div className="min-h-screen bg-[#030E1A] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#071A33] border border-red-500/40 rounded-2xl p-6 text-center space-y-4">
          <AlertOctagon className="mx-auto text-red-400" size={48} />
          <h2 className="text-xl font-bold text-white">Case Not Found</h2>
          <p className="text-sm text-slate-300">{error || "Unable to locate specified operational case."}</p>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0E7C86] hover:bg-[#0E7C86]/80 text-white rounded-xl text-sm font-semibold transition"
          >
            <ArrowLeft size={16} /> Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Calculate current step index
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === operationalCase.status);

  return (
    <div className="min-h-screen bg-[#030E1A] text-slate-100 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 rounded-xl border border-emerald-500/40 bg-[#071A33]/95 px-4 py-3 shadow-2xl backdrop-blur-md flex items-center gap-3 text-emerald-300 text-sm animate-in slide-in-from-top duration-300">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 border-b border-[#16364A] bg-[#030E1A]/90 backdrop-blur-md px-4 py-3.5 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 rounded-lg border border-[#16364A] bg-[#071A33] px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-[#294665] hover:text-white"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-[#16364A]" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0E7C86]">
                RailDrishti Operational Case
              </span>
              <span className="text-slate-500">•</span>
              <span className="font-mono text-sm font-black text-amber-400">{operationalCase.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadCase}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-300 transition"
              title="Refresh Live Data"
            >
              <RefreshCw size={13} />
              <span className="hidden sm:inline">Sync Live</span>
            </button>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                operationalCase.caseType === "INCIDENT"
                  ? "bg-red-500/20 text-red-300 border-red-500/40 animate-pulse"
                  : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
              }`}
            >
              {operationalCase.caseType}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-8 space-y-6">
        {/* Case Banner */}
        <div className="rounded-2xl border border-[#16364A] bg-gradient-to-r from-[#071A33] via-[#0A2036] to-[#071A33] p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none text-cyan-400 font-mono text-9xl font-black">
            {operationalCase.caseType}
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xl sm:text-2xl font-black text-white">
                  {operationalCase.id}
                </span>
                <span
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold border ${
                    operationalCase.severity === "CRITICAL"
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : operationalCase.severity === "HIGH"
                      ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  }`}
                >
                  {operationalCase.severity} PRIORITY
                </span>
                <span className="rounded-lg bg-[#0E7C86]/20 border border-[#0E7C86]/30 px-2.5 py-1 text-xs font-semibold text-cyan-300">
                  {operationalCase.category}
                </span>
              </div>

              <p className="text-base sm:text-lg font-medium text-slate-200 max-w-3xl">
                {operationalCase.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#0E7C86]" />
                  <strong className="text-slate-300">{operationalCase.location}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  <span>Reported {new Date(operationalCase.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <User size={14} className="text-slate-400" />
                  <span>By <strong className="text-slate-300">{operationalCase.reporterName}</strong> ({operationalCase.reporterRole})</span>
                </span>
              </div>
            </div>

            {/* Current Stage Pill */}
            <div className="flex flex-col items-start md:items-end justify-between self-start">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Current Lifecycle Stage</span>
              <span className="mt-1 rounded-xl bg-[#0A2540] border border-[#294665] px-3.5 py-1.5 text-sm font-bold text-amber-300 font-mono shadow-inner">
                {operationalCase.status.replace("_", " ")}
              </span>
              {operationalCase.assignedTeam && (
                <span className="mt-2 text-xs text-cyan-300 flex items-center gap-1">
                  <Shield size={12} /> {operationalCase.assignedTeam}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Visual Lifecycle Stepper */}
        <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Radio size={14} className="text-[#0E7C86]" />
              <span>Operational Resolution Workflow</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Stage {currentStepIndex + 1} of {STATUS_STEPS.length}
            </span>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="flex items-center min-w-[700px] justify-between relative">
              {/* Connecting line */}
              <div className="absolute left-6 right-6 top-4 h-0.5 bg-[#16364A] -z-0" />
              <div
                className="absolute left-6 top-4 h-0.5 bg-[#0E7C86] -z-0 transition-all duration-500"
                style={{
                  width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
                }}
              />

              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div key={step.key} className="flex flex-col items-center relative z-10 text-center px-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
                        isCurrent
                          ? "bg-amber-400 text-black ring-4 ring-amber-400/30 font-black scale-110"
                          : isPassed
                          ? "bg-[#0E7C86] text-white"
                          : "bg-[#0A2036] border border-[#16364A] text-slate-500"
                      }`}
                    >
                      {isPassed ? <CheckCircle2 size={16} /> : idx + 1}
                    </div>
                    <span
                      className={`mt-2 text-xs font-semibold whitespace-nowrap ${
                        isCurrent
                          ? "text-amber-300 font-bold"
                          : isPassed
                          ? "text-slate-200"
                          : "text-slate-500"
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="text-[10px] text-slate-500 max-w-[80px] leading-tight hidden sm:block mt-0.5">
                      {step.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Two Column Layout: Actions & Details on Left, Audit Trail on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Role-Specific Action Deck & Operational Specifications */}
          <div className="lg:col-span-2 space-y-6">
            {/* Operational Action Controls */}
            <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#16364A] pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#0E7C86]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Operational Control Actions
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-cyan-300 bg-[#0A2036] px-2 py-0.5 rounded border border-[#16364A]">
                  Role: {currentUser?.role || "Employee"} ({currentUser?.operationalRole || "Standard"})
                </span>
              </div>

              {/* Status-specific action prompts */}
              {operationalCase.status === "CLOSED" ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300 text-sm flex items-center gap-3">
                  <CheckCircle2 size={20} />
                  <div>
                    <div className="font-bold">Case Verified & Closed</div>
                    <div className="text-xs text-emerald-200/80">
                      This operational case has been officially closed by Section Control. Verified normal train operations restored.
                    </div>
                  </div>
                </div>
              ) : isPrivileged ? (
                /* CONTROLLER & ADMIN CONTROLS */
                <div className="space-y-4">
                  <div className="text-xs text-slate-300 leading-relaxed">
                    As Section Controller / System Administrator, you have jurisdictional authority to triage, assign field maintenance units, and authorize operational closure.
                  </div>

                  {/* Primary Stage Action Buttons */}
                  <div className="flex flex-wrap gap-2.5">
                    {/* 1. Acknowledge */}
                    {operationalCase.status === "SUBMITTED" && (
                      <button
                        type="button"
                        onClick={handleAcknowledge}
                        className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-600/20"
                      >
                        <CheckCircle2 size={14} />
                        <span>Acknowledge Receipt</span>
                      </button>
                    )}

                    {/* 2. Review Operational Impact */}
                    {(operationalCase.status === "SUBMITTED" || operationalCase.status === "ACKNOWLEDGED") && (
                      <button
                        type="button"
                        onClick={() => setIsReviewing(!isReviewing)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#0E7C86] hover:bg-[#0E7C86]/80 text-white rounded-xl text-xs font-bold transition"
                      >
                        <Radio size={14} />
                        <span>Review Operational Impact</span>
                      </button>
                    )}

                    {/* 3. Assign Team */}
                    {operationalCase.status !== "RESOLVED" && (
                      <button
                        type="button"
                        onClick={() => setIsAssigning(!isAssigning)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-amber-600/20"
                      >
                        <Building2 size={14} />
                        <span>{operationalCase.department ? "Reassign / Dispatch Team" : "Assign Responsible Department"}</span>
                      </button>
                    )}

                    {/* 4. Update Field Status */}
                    <button
                      type="button"
                      onClick={() => setIsUpdatingStatus(!isUpdatingStatus)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
                    >
                      <RefreshCw size={14} />
                      <span>Advance Work Status</span>
                    </button>

                    {/* 5. Controller Verify & Close */}
                    {(operationalCase.status === "RESOLVED" || operationalCase.status === "IN_PROGRESS") && (
                      <button
                        type="button"
                        onClick={() => setIsVerifying(!isVerifying)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20"
                      >
                        <FileCheck2 size={14} />
                        <span>Verify Resolution & Close</span>
                      </button>
                    )}
                  </div>

                  {/* Impact Review Expandable Form */}
                  {isReviewing && (
                    <div className="rounded-xl border border-cyan-500/30 bg-[#0A2036] p-4 space-y-3 animate-in fade-in duration-200">
                      <h4 className="text-xs font-bold uppercase text-cyan-300">Operational Triage Assessment</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(["NONE", "MINOR", "MODERATE", "SEVERE"] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setReviewImpact(lvl)}
                            className={`p-2 rounded-lg text-xs font-bold border transition ${
                              reviewImpact === lvl
                                ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                                : "bg-[#071A33] border-[#16364A] text-slate-400 hover:text-white"
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Controller assessment notes (speed restriction, platform lock, etc.)..."
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        className="w-full rounded-lg border border-[#16364A] bg-[#031426] px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsReviewing(false)}
                          className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleReview}
                          className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition"
                        >
                          Confirm Triage
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Department Assignment Expandable Form */}
                  {isAssigning && (
                    <div className="rounded-xl border border-amber-500/30 bg-[#0A2036] p-4 space-y-3 animate-in fade-in duration-200">
                      <h4 className="text-xs font-bold uppercase text-amber-400">Dispatch Responsible Maintenance Unit</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Select Department</label>
                          <select
                            value={assignDepartment}
                            onChange={(e) => {
                              const dept = e.target.value;
                              setAssignDepartment(dept);
                              const match = DEPARTMENT_DIRECTORY.find((d: DepartmentTeamDirectory) => d.name === dept);
                              if (match && match.teams.length > 0) {
                                setAssignTeam(match.teams[0]);
                              }
                            }}
                            className="w-full rounded-lg border border-[#16364A] bg-[#031426] px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          >
                            <option value="">-- Choose Department --</option>
                            {DEPARTMENT_DIRECTORY.map((d: DepartmentTeamDirectory) => (
                              <option key={d.name} value={d.name}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Specific Field Gang / Desk</label>
                          <select
                            value={assignTeam}
                            onChange={(e) => setAssignTeam(e.target.value)}
                            className="w-full rounded-lg border border-[#16364A] bg-[#031426] px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          >
                            <option value="">-- Select Team --</option>
                            {DEPARTMENT_DIRECTORY.find((d: DepartmentTeamDirectory) => d.name === assignDepartment)?.teams.map((t: string) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Dispatch order notes / priority instruction..."
                        value={assignNotes}
                        onChange={(e) => setAssignNotes(e.target.value)}
                        className="w-full rounded-lg border border-[#16364A] bg-[#031426] px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAssigning(false)}
                          className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAssign}
                          disabled={!assignDepartment}
                          className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition"
                        >
                          Dispatch Case
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Work Status Update Form */}
                  {isUpdatingStatus && (
                    <div className="rounded-xl border border-blue-500/30 bg-[#0A2036] p-4 space-y-3 animate-in fade-in duration-200">
                      <h4 className="text-xs font-bold uppercase text-blue-400">Field Progress Update</h4>
                      <div className="flex flex-wrap gap-2">
                        {(["IN_PROGRESS", "RESOLVED"] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setNewStatus(st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                              newStatus === st
                                ? "bg-blue-500/20 border-blue-400 text-blue-300"
                                : "bg-[#071A33] border-[#16364A] text-slate-400 hover:text-white"
                            }`}
                          >
                            {st.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Technical rectification details / current field status..."
                        value={statusNotes}
                        onChange={(e) => setStatusNotes(e.target.value)}
                        className="w-full rounded-lg border border-[#16364A] bg-[#031426] px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsUpdatingStatus(false)}
                          className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleUpdateStatus}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition"
                        >
                          Save Progress
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Verification Form */}
                  {isVerifying && (
                    <div className="rounded-xl border border-emerald-500/30 bg-[#0A2036] p-4 space-y-3 animate-in fade-in duration-200">
                      <h4 className="text-xs font-bold uppercase text-emerald-400">Controller Operational Verification</h4>
                      <p className="text-xs text-slate-300">
                        Confirm that line block/speed restriction is canceled, track circuit or point indication is normal, and train movements may resume safely.
                      </p>
                      <input
                        type="text"
                        placeholder="Verification notes (e.g. Signal aspect verified, Point #104 tested 3 times)..."
                        value={verifyNotes}
                        onChange={(e) => setVerifyNotes(e.target.value)}
                        className="w-full rounded-lg border border-[#16364A] bg-[#031426] px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsVerifying(false)}
                          className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleVerify}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition"
                        >
                          Authorize Case Closure
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* EMPLOYEE REPORTERS VIEW */
                <div className="space-y-3">
                  <div className="rounded-xl bg-[#0A2036] border border-[#16364A] p-4 text-xs text-slate-300 space-y-2">
                    <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                      <Info size={14} />
                      <span>Live Controller Coordination Status</span>
                    </div>
                    <p>
                      Your report has been securely registered in the Railway Central Operations Database. The Section Controller has been notified and will review operational impact.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2 border-t border-[#16364A] text-slate-400">
                      <div>
                        Assigned Unit:{" "}
                        <strong className="text-white">
                          {operationalCase.assignedTeam || "Under Section Controller Review"}
                        </strong>
                      </div>
                      <div>
                        Estimated Triage:{" "}
                        <strong className="text-white">
                          {operationalCase.severity === "CRITICAL" ? "< 15 minutes" : "< 1 hour"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Case Details Card */}
            <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <FileText size={16} className="text-[#0E7C86]" />
                <span>Technical Specifications & Metadata</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="rounded-xl bg-[#0A2036] p-3 border border-[#16364A]">
                  <span className="text-slate-400 block mb-0.5">Location</span>
                  <span className="font-semibold text-white">{operationalCase.location}</span>
                </div>
                <div className="rounded-xl bg-[#0A2036] p-3 border border-[#16364A]">
                  <span className="text-slate-400 block mb-0.5">Operational Impact</span>
                  <span className="font-semibold text-amber-300">{operationalCase.operationalImpact}</span>
                </div>
                <div className="rounded-xl bg-[#0A2036] p-3 border border-[#16364A]">
                  <span className="text-slate-400 block mb-0.5">Responsible Department</span>
                  <span className="font-semibold text-cyan-300">{operationalCase.department || "Pending Triage"}</span>
                </div>
                <div className="rounded-xl bg-[#0A2036] p-3 border border-[#16364A]">
                  <span className="text-slate-400 block mb-0.5">Assigned Field Unit</span>
                  <span className="font-semibold text-white">{operationalCase.assignedTeam || "Not Dispatched"}</span>
                </div>
                <div className="rounded-xl bg-[#0A2036] p-3 border border-[#16364A]">
                  <span className="text-slate-400 block mb-0.5">Logged By</span>
                  <span className="font-semibold text-white">{operationalCase.reporterName} ({operationalCase.reporterId})</span>
                </div>
                <div className="rounded-xl bg-[#0A2036] p-3 border border-[#16364A]">
                  <span className="text-slate-400 block mb-0.5">System Verification</span>
                  <span className={`font-semibold ${operationalCase.resolutionVerified ? "text-emerald-400" : "text-slate-400"}`}>
                    {operationalCase.resolutionVerified ? "Verified Safe by Controller" : "Pending Verification"}
                  </span>
                </div>
              </div>
            </div>

            {/* Operational Notes & Handover Log */}
            <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <MessageSquare size={16} className="text-[#0E7C86]" />
                  <span>Directives & Shift Handover Notes</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {operationalCase.comments?.length || 0} notes
                </span>
              </div>

              {/* Comments Thread */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {operationalCase.comments && operationalCase.comments.length > 0 ? (
                  operationalCase.comments.map((cmt) => (
                    <div
                      key={cmt.id}
                      className="rounded-xl bg-[#0A2036] border border-[#16364A] p-3 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">
                          {cmt.authorName}{" "}
                          <span className="font-normal text-slate-400 font-mono">({cmt.authorRole})</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(cmt.createdAt).toLocaleTimeString("en-IN", {
                            timeZone: "Asia/Kolkata",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-slate-300">{cmt.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No notes posted yet. Post a directive or status memo below.</p>
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-[#16364A]">
                <input
                  type="text"
                  placeholder="Type operational directive or status memo..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 rounded-xl border border-[#16364A] bg-[#031426] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || isPostingComment}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0E7C86] hover:bg-[#0E7C86]/80 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition"
                >
                  <Send size={13} />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Immutable Audit Trail / Activity History */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#16364A] pb-3">
                <div className="flex items-center gap-2">
                  <History size={16} className="text-[#0E7C86]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Audit Log
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  TAMPER-EVIDENT
                </span>
              </div>

              <div className="space-y-3.5 max-h-[520px] overflow-y-auto pr-1">
                {operationalCase.auditLogs && operationalCase.auditLogs.length > 0 ? (
                  operationalCase.auditLogs.map((log, idx) => (
                    <div
                      key={log.id || idx}
                      className="relative pl-4 border-l-2 border-[#16364A] pb-2 last:pb-0 space-y-1"
                    >
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#0E7C86]" />
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-amber-300">{log.action.replace("_", " ")}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString("en-IN", {
                            timeZone: "Asia/Kolkata",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        By: <span className="font-semibold text-slate-200">{log.actorName}</span>{" "}
                        <span className="text-slate-500 font-mono">({log.actorRole})</span>
                      </div>
                      {log.notes && (
                        <p className="text-[11px] text-slate-400 bg-[#0A2036] p-2 rounded-lg border border-[#16364A]/60">
                          {log.notes}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No audit entries recorded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

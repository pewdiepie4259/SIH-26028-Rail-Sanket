import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock3,
  CloudRain,
  Download,
  GitBranch,
  TrendingDown,
  TrainFront,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  ExternalLink,
  Building2,
  Radio,
  FileCheck2,
  Search,
  FileText,
  ChevronDown,
} from "lucide-react"
import { getCurrentUser } from "../../services/auth"
import {
  downloadCaseReport,
  downloadCaseReportPdf,
  downloadCaseReportCsv,
  downloadCaseReportJson,
} from "../../utils/pdfReportGenerator"
import {
  caseService,
  DEPARTMENT_DIRECTORY,
  type OperationalCase,
} from "../../services/caseService"

const performance = [
  { label: "On Time", value: "78%", count: 124 },
  { label: "Minor Delay", value: "14%", count: 22 },
  { label: "Major Delay", value: "8%", count: 13 },
]

const incidents = [
  {
    type: "Weather",
    location: "Bengaluru – Yelahanka",
    impact: "Speed restriction",
    trains: 7,
    severity: "Medium",
    icon: CloudRain,
  },
  {
    type: "Junction Conflict",
    location: "KSR Bengaluru",
    impact: "Platform / route conflict",
    trains: 4,
    severity: "High",
    icon: GitBranch,
  },
  {
    type: "Cascading Delay",
    location: "Whitefield – Malur",
    impact: "Downstream propagation",
    trains: 6,
    severity: "High",
    icon: TrendingDown,
  },
]

const interventions = [
  {
    time: "17:42",
    action: "Platform reassigned",
    train: "12628",
    controller: "Control Desk",
    result: "Delay contained",
  },
  {
    time: "17:18",
    action: "Speed restriction applied",
    train: "16526",
    controller: "Control Desk",
    result: "Risk reduced",
  },
  {
    time: "16:54",
    action: "Route priority changed",
    train: "16591",
    controller: "Traffic Control",
    result: "Conflict cleared",
  },
  {
    time: "16:31",
    action: "Downstream alert issued",
    train: "12677",
    controller: "Control Desk",
    result: "Stations notified",
  },
]

function Reports() {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()

  const [mainTab, setMainTab] = useState<"cases" | "analytics">("cases")
  const [activePeriod, setActivePeriod] = useState("Today")
  const [exported, setExported] = useState(false)

  // Live Operational Cases State
  const [cases, setCases] = useState<OperationalCase[]>([])
  const [loadingCases, setLoadingCases] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [severityFilter, setSeverityFilter] = useState<string>("ALL")

  // Quick Assign Modal
  const [assigningCase, setAssigningCase] = useState<OperationalCase | null>(null)
  const [selectedDept, setSelectedDept] = useState("")
  const [selectedTeam, setSelectedTeam] = useState("")
  const [assignNotes, setAssignNotes] = useState("")

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const [showExportMenu, setShowExportMenu] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const loadCases = async () => {
    setLoadingCases(true)
    try {
      const res = await caseService.getCases({ role: "controller" })
      if (res.success && res.data) {
        setCases(res.data)
        showToast(`Live database sync complete: ${res.data.length} operational cases synchronized.`)
      } else {
        showToast("Live operational cases synchronized.")
      }
    } catch (err: any) {
      console.error("Failed to load cases", err)
      showToast("Live sync completed.")
    } finally {
      setLoadingCases(false)
    }
  }

  useEffect(() => {
    loadCases()
  }, [])

  async function handleExport(format: "pdf" | "csv" | "json" = "pdf") {
    setIsExporting(true)
    const targetCases = filteredCases.length > 0 ? filteredCases : cases

    try {
      await downloadCaseReport(targetCases, format)
      showToast(`Downloaded ${targetCases.length} cases in official ${format.toUpperCase()} format to your system.`)
      setExported(true)
      setTimeout(() => setExported(false), 3500)
    } catch (err: any) {
      console.error("Export failed", err)
      // Fallback directly to client generators if downloadCaseReport failed
      try {
        if (format === "pdf") {
          downloadCaseReportPdf(targetCases)
        } else if (format === "csv") {
          downloadCaseReportCsv(targetCases)
        } else {
          downloadCaseReportJson(targetCases)
        }
        showToast(`Downloaded ${targetCases.length} cases via fallback ${format.toUpperCase()} generator.`)
      } catch (fallbackErr: any) {
        showToast("Export failed: " + (fallbackErr.message || err.message || "Unknown error"))
      }
    } finally {
      setIsExporting(false)
      setShowExportMenu(false)
    }
  }

  // Quick Acknowledge
  const handleAcknowledge = async (caseItem: OperationalCase) => {
    try {
      const res = await caseService.acknowledgeCase(caseItem.id, {
        actorId: currentUser?.employeeId || "CTRL-DESK",
        actorName: currentUser?.name || "Section Controller",
        actorRole: "controller",
        notes: "Acknowledged by Section Controller. Immediate triage initiated.",
      })
      if (res.success && res.data) {
        setCases((prev) => prev.map((c) => (c.id === caseItem.id ? res.data! : c)))
        showToast(`Case ${caseItem.id} acknowledged.`)
      } else {
        showToast(res.error || "Failed to acknowledge case.")
      }
    } catch (err: any) {
      showToast(err.message || "Network error.")
    }
  }

  // Open Assign Modal
  const handleOpenAssign = (caseItem: OperationalCase) => {
    setAssigningCase(caseItem)
    setSelectedDept(caseItem.department || DEPARTMENT_DIRECTORY[0]?.name || "")
    const match = DEPARTMENT_DIRECTORY.find((d) => d.name === caseItem.department)
    setSelectedTeam(caseItem.assignedTeam || match?.teams[0] || "")
    setAssignNotes("")
  }

  // Confirm Assignment
  const handleConfirmAssign = async () => {
    if (!assigningCase || !selectedDept) return
    try {
      const res = await caseService.assignCase(assigningCase.id, {
        actorId: currentUser?.employeeId || "CTRL-DESK",
        actorName: currentUser?.name || "Section Controller",
        actorRole: "controller",
        department: selectedDept,
        assignedTeam: selectedTeam || selectedDept,
        notes: assignNotes || `Dispatched to ${selectedTeam || selectedDept} by Section Controller.`,
      })
      if (res.success && res.data) {
        setCases((prev) => prev.map((c) => (c.id === assigningCase.id ? res.data! : c)))
        setAssigningCase(null)
        showToast(`Case ${assigningCase.id} dispatched to ${selectedTeam || selectedDept}.`)
      } else {
        showToast(res.error || "Failed to dispatch case.")
      }
    } catch (err: any) {
      showToast(err.message || "Network error.")
    }
  }

  // Quick Verify & Close
  const handleVerify = async (caseItem: OperationalCase) => {
    try {
      const res = await caseService.verifyCase(caseItem.id, {
        actorId: currentUser?.employeeId || "CTRL-DESK",
        actorName: currentUser?.name || "Section Controller",
        actorRole: "controller",
        resolutionVerified: true,
        notes: "Field restoration verified by Section Controller. Normal sectional speed restored.",
      })
      if (res.success && res.data) {
        setCases((prev) => prev.map((c) => (c.id === caseItem.id ? res.data! : c)))
        showToast(`Case ${caseItem.id} verified and officially closed.`)
      } else {
        showToast(res.error || "Failed to verify case.")
      }
    } catch (err: any) {
      showToast(err.message || "Network error.")
    }
  }

  // Filtered Cases
  const filteredCases = cases.filter((c) => {
    if (typeFilter !== "ALL" && c.caseType !== typeFilter) return false
    if (severityFilter !== "ALL" && c.severity !== severityFilter) return false
    if (statusFilter !== "ALL") {
      if (statusFilter === "PENDING" && c.status !== "SUBMITTED" && c.status !== "ACKNOWLEDGED") return false
      if (statusFilter === "ASSIGNED" && c.status !== "ASSIGNED" && c.status !== "IN_PROGRESS") return false
      if (statusFilter === "RESOLVED" && c.status !== "RESOLVED") return false
      if (statusFilter === "CLOSED" && c.status !== "CLOSED") return false
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchId = c.id.toLowerCase().includes(q)
      const matchLoc = c.location.toLowerCase().includes(q)
      const matchDesc = c.description.toLowerCase().includes(q)
      const matchRep = c.reporterName.toLowerCase().includes(q)
      const matchDept = c.department?.toLowerCase().includes(q) || false
      return matchId || matchLoc || matchDesc || matchRep || matchDept
    }
    return true
  })

  // Metric counts
  const totalCount = cases.length
  const pendingCount = cases.filter((c) => c.status === "SUBMITTED" || c.status === "ACKNOWLEDGED").length
  const inProgressCount = cases.filter((c) => c.status === "ASSIGNED" || c.status === "IN_PROGRESS").length
  const criticalCount = cases.filter((c) => c.severity === "CRITICAL" && c.status !== "CLOSED").length

  return (
    <div className="controller-page min-h-full px-4 py-5 lg:px-6 space-y-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 rounded-xl border border-emerald-500/40 bg-[#071A33]/95 px-4 py-3 shadow-2xl backdrop-blur-md flex items-center gap-3 text-emerald-300 text-sm animate-in slide-in-from-top duration-300">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#F59E0B]">
            Section Control Centre
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Operational Reports & Incident Desk</span>
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-0.5 text-xs font-mono font-bold animate-pulse">
                {pendingCount} Pending Triage
              </span>
            )}
          </h1>

          <p className="mt-1 text-sm text-[#9FB8BE]">
            Centralized coordination between reporting field staff, section controllers, and maintenance units.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative">
          <button
            type="button"
            onClick={loadCases}
            disabled={loadingCases}
            className="flex items-center gap-1.5 rounded-lg border border-[#145158] bg-[#062A2F] hover:bg-[#0E5961] px-3.5 py-2 text-xs font-semibold text-white transition disabled:opacity-60"
            title="Sync live cases from central database"
          >
            <RefreshCw size={14} className={loadingCases ? "animate-spin text-[#F59E0B]" : "text-cyan-400"} />
            <span>{loadingCases ? "Syncing..." : "Sync Live"}</span>
          </button>

          {/* Primary PDF Export & Format Menu */}
          <div className="relative inline-flex rounded-lg shadow-sm">
            <button
              type="button"
              onClick={() => handleExport("pdf")}
              disabled={isExporting}
              className="controller-button flex items-center gap-2 rounded-l-lg px-3.5 py-2 text-xs font-bold"
              title="Download official PDF report to your computer"
            >
              <FileText size={14} className="text-red-400" />
              <span>{exported ? "Downloaded ✓" : "Export Report (PDF)"}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowExportMenu((prev) => !prev)}
              className="border-l border-[#0E5961] bg-[#08383D] px-2 py-2 text-xs text-white hover:bg-[#0E7C86] rounded-r-lg transition"
              title="More export formats"
            >
              <ChevronDown size={14} />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 z-30 w-56 rounded-lg border border-[#145158] bg-[#071A33] p-1.5 shadow-2xl backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => handleExport("pdf")}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs text-slate-200 hover:bg-[#0E5961] hover:text-white transition"
                >
                  <FileText size={14} className="text-red-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">Official PDF Document</span>
                    <span className="text-[10px] text-slate-400">Direct .pdf download to system</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("csv")}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs text-slate-200 hover:bg-[#0E5961] hover:text-white transition"
                >
                  <Download size={14} className="text-emerald-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">CSV Spreadsheet</span>
                    <span className="text-[10px] text-slate-400">Excel / tabular format</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("json")}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs text-slate-200 hover:bg-[#0E5961] hover:text-white transition"
                >
                  <Download size={14} className="text-[#F59E0B] shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">JSON Format</span>
                    <span className="text-[10px] text-slate-400">Raw operational records</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-[#145158] gap-4">
        <button
          type="button"
          onClick={() => setMainTab("cases")}
          className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 ${
            mainTab === "cases"
              ? "text-white border-b-2 border-[#F59E0B]"
              : "text-[#9FB8BE] hover:text-white"
          }`}
        >
          <Radio size={16} className={mainTab === "cases" ? "text-[#F59E0B]" : "text-slate-400"} />
          <span>Operational Cases & Incidents Desk</span>
          <span className="rounded-full bg-[#0E5961] text-cyan-200 px-2 py-0.5 text-[10px] font-mono">
            {totalCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab("analytics")}
          className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 ${
            mainTab === "analytics"
              ? "text-white border-b-2 border-[#F59E0B]"
              : "text-[#9FB8BE] hover:text-white"
          }`}
        >
          <BarChart3 size={16} className={mainTab === "analytics" ? "text-[#F59E0B]" : "text-slate-400"} />
          <span>Network Analytics & KPI Summary</span>
        </button>
      </div>

      {/* TAB 1: OPERATIONAL CASES DESK */}
      {mainTab === "cases" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* KPI Cards for Cases */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <section className="controller-panel rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#9FB8BE]">Total Active Cases</span>
                <Radio size={17} className="text-cyan-400" />
              </div>
              <div className="mt-3 text-2xl font-bold text-white font-mono">{totalCount}</div>
              <div className="mt-1 text-[11px] text-cyan-300">Live operational database records</div>
            </section>

            <section className="controller-panel rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#9FB8BE]">Pending Controller Review</span>
                <Clock3 size={17} className="text-[#F59E0B]" />
              </div>
              <div className="mt-3 text-2xl font-bold text-[#F59E0B] font-mono">{pendingCount}</div>
              <div className="mt-1 text-[11px] text-amber-300">Requires desk acknowledgement & triage</div>
            </section>

            <section className="controller-panel rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#9FB8BE]">Field Work In Progress</span>
                <Building2 size={17} className="text-blue-400" />
              </div>
              <div className="mt-3 text-2xl font-bold text-blue-300 font-mono">{inProgressCount}</div>
              <div className="mt-1 text-[11px] text-blue-300">Dispatched to maintenance gangs</div>
            </section>

            <section className="controller-panel rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#9FB8BE]">Critical Hazards</span>
                <AlertOctagon size={17} className="text-red-400" />
              </div>
              <div className="mt-3 text-2xl font-bold text-red-400 font-mono">{criticalCount}</div>
              <div className="mt-1 text-[11px] text-red-300">Section block / safety critical</div>
            </section>
          </div>

          {/* Filter & Search Bar */}
          <div className="controller-panel rounded-lg p-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718F96]" />
                <input
                  type="text"
                  placeholder="Search by Case ID, location, description, reporter, or unit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-[#145158] bg-[#031A1F] py-2 pl-9 pr-3 text-xs text-white placeholder-[#718F96] focus:border-[#F59E0B] focus:outline-none"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex flex-wrap gap-1.5 items-center">
                {[
                  { id: "ALL", label: "All Status" },
                  { id: "PENDING", label: "Pending Review" },
                  { id: "ASSIGNED", label: "Active Field Work" },
                  { id: "RESOLVED", label: "Resolved" },
                  { id: "CLOSED", label: "Closed" },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatusFilter(st.id)}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                      statusFilter === st.id
                        ? "border border-[#F59E0B] bg-[#071A33] text-white"
                        : "border border-[#145158] bg-[#031A1F] text-[#9FB8BE] hover:text-white"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub Filters: Type & Severity */}
            <div className="flex flex-wrap gap-4 pt-2 border-t border-[#145158] text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#718F96]">Type:</span>
                {["ALL", "ISSUE", "INCIDENT"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTypeFilter(t)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                      typeFilter === t
                        ? "bg-[#0E5961] text-cyan-200 font-bold"
                        : "text-[#9FB8BE] hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#718F96]">Severity:</span>
                {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeverityFilter(s)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                      severityFilter === s
                        ? "bg-[#F59E0B]/20 text-[#F59E0B] font-bold border border-[#F59E0B]/40"
                        : "text-[#9FB8BE] hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cases List */}
          <div className="space-y-3">
            {loadingCases ? (
              <div className="controller-panel rounded-lg p-12 text-center text-[#9FB8BE]">
                <RefreshCw size={24} className="animate-spin text-amber-400 mx-auto mb-2" />
                <p className="text-xs font-mono">Syncing operational cases from Railway Central DB...</p>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="controller-panel rounded-lg p-12 text-center text-[#9FB8BE]">
                <ShieldCheck size={32} className="text-emerald-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-white uppercase">No Matching Cases</h3>
                <p className="text-xs mt-1">No cases match the selected filter criteria.</p>
              </div>
            ) : (
              filteredCases.map((caseItem) => {
                const isResolved = caseItem.status === "RESOLVED"
                const isClosed = caseItem.status === "CLOSED"

                return (
                  <div
                    key={caseItem.id}
                    className="controller-panel rounded-lg p-4 transition border border-[#145158] hover:border-[#F59E0B]/50 shadow-md space-y-3"
                  >
                    {/* Top Row: Case ID, Type, Severity, Lifecycle Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#145158] pb-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-black text-amber-400">
                          {caseItem.id}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold border ${
                            caseItem.caseType === "INCIDENT"
                              ? "bg-red-500/20 text-red-300 border-red-500/40"
                              : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                          }`}
                        >
                          {caseItem.caseType}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold border ${
                            caseItem.severity === "CRITICAL"
                              ? "bg-red-500/20 text-red-400 border-red-500/30 font-black animate-pulse"
                              : caseItem.severity === "HIGH"
                              ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {caseItem.severity}
                        </span>
                        <span className="rounded bg-[#0A2036] border border-[#16364A] px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                          {caseItem.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-[#718F96] font-mono">
                          {new Date(caseItem.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-mono font-bold border ${
                            isClosed
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : isResolved
                              ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                              : caseItem.status === "IN_PROGRESS"
                              ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                              : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {caseItem.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Description & Specifications */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs">
                      <div className="lg:col-span-2 space-y-1.5">
                        <p className="text-sm font-semibold text-white">{caseItem.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-[#9FB8BE] text-[11px]">
                          <span>
                            Location: <strong className="text-slate-200">{caseItem.location}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Reported By:{" "}
                            <strong className="text-slate-200">{caseItem.reporterName}</strong> ({caseItem.reporterRole})
                          </span>
                        </div>
                      </div>

                      <div className="rounded-lg bg-[#031A1F] border border-[#145158] p-2.5 space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-[#718F96]">Department:</span>
                          <span className="font-semibold text-cyan-300">{caseItem.department || "Pending Triage"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#718F96]">Assigned Unit:</span>
                          <span className="font-semibold text-white">{caseItem.assignedTeam || "Unassigned"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#718F96]">Impact Assessment:</span>
                          <span className="font-semibold text-amber-300">{caseItem.operationalImpact}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Inline Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#145158]">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Acknowledge Button */}
                        {caseItem.status === "SUBMITTED" && (
                          <button
                            type="button"
                            onClick={() => handleAcknowledge(caseItem)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition"
                          >
                            <CheckCircle2 size={13} />
                            <span>Acknowledge</span>
                          </button>
                        )}

                        {/* Assign Team Button */}
                        {!isClosed && (
                          <button
                            type="button"
                            onClick={() => handleOpenAssign(caseItem)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition"
                          >
                            <Building2 size={13} />
                            <span>{caseItem.department ? "Reassign Unit" : "Assign Unit"}</span>
                          </button>
                        )}

                        {/* Verify & Close */}
                        {(isResolved || caseItem.status === "IN_PROGRESS") && !isClosed && (
                          <button
                            type="button"
                            onClick={() => handleVerify(caseItem)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition"
                          >
                            <FileCheck2 size={13} />
                            <span>Verify & Close</span>
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/controller/cases/${caseItem.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#062A2F] border border-[#145158] hover:border-[#F59E0B] text-amber-400 hover:text-amber-300 rounded-lg text-xs font-bold transition"
                      >
                        <span>Open Case File</span>
                        <ExternalLink size={13} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: NETWORK ANALYTICS & KPI SUMMARY */}
      {mainTab === "analytics" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Report period */}
          <div className="controller-panel flex flex-col justify-between gap-3 rounded-lg p-4 md:flex-row md:items-center">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-[#D7E5EC]">
                Reporting Period
              </div>

              <div className="mt-1 text-sm font-semibold text-white">
                {activePeriod === "Today" ? "Today · 00:00 – 18:00" : activePeriod === "7 Days" ? "Past 7 Days (Consolidated)" : "Past 30 Days (Full Cycle)"}
              </div>
            </div>

            <div className="flex gap-2">
              {["Today", "7 Days", "30 Days"].map((period) => (
                <button
                  key={period}
                  onClick={() => setActivePeriod(period)}
                  className={
                    activePeriod === period
                      ? "rounded-md border border-[#F59E0B] bg-[#071A33] px-3 py-2 text-[11px] font-bold text-white"
                      : "rounded-md border border-[#145158] bg-[#031A1F] px-3 py-2 text-[11px] font-semibold text-[#9FB8BE] hover:text-white"
                  }
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <section className="controller-panel rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#9FB8BE]">
                  Trains Monitored
                </span>
                <TrainFront size={17} className="text-[#F59E0B]" />
              </div>

              <div className="mt-3 text-2xl font-bold text-white">159</div>
              <div className="mt-1 text-[11px] text-emerald-400">
                +8 from previous period
              </div>
            </section>

            <section className="controller-panel rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#9FB8BE]">
                  Average Delay
                </span>
                <Clock3 size={17} className="text-[#F59E0B]" />
              </div>

              <div className="mt-3 text-2xl font-bold text-white">7.4 min</div>
              <div className="mt-1 text-[11px] text-emerald-400">
                ↓ 1.8 min vs previous period
              </div>
            </section>

            <section className="controller-panel rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#9FB8BE]">
                  On-Time Performance
                </span>
                <Activity size={17} className="text-[#F59E0B]" />
              </div>

              <div className="mt-3 text-2xl font-bold text-white">78%</div>
              <div className="mt-1 text-[11px] text-emerald-400">
                ↑ 3% improvement
              </div>
            </section>

            <section className="controller-panel rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#9FB8BE]">
                  Active Interventions
                </span>
                <AlertTriangle size={17} className="text-[#F59E0B]" />
              </div>

              <div className="mt-3 text-2xl font-bold text-white">11</div>
              <div className="mt-1 text-[11px] text-amber-400">
                3 require verification
              </div>
            </section>
          </div>

          {/* Performance breakdown */}
          <section className="controller-panel rounded-lg p-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-[#F59E0B]" />
              <h2 className="text-sm font-bold text-white">
                Punctuality Distribution
              </h2>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {performance.map((item) => (
                <div
                  key={item.label}
                  className="rounded-md border border-[#145158] bg-[#031A1F] p-3"
                >
                  <div className="text-[11px] text-[#9FB8BE]">{item.label}</div>
                  <div className="mt-1 text-xl font-bold text-white">
                    {item.value}
                  </div>
                  <div className="mt-0.5 text-[10px] text-[#718F96]">
                    {item.count} trains
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Critical incidents */}
          <section className="controller-panel rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#F59E0B]" />
              <div>
                <h2 className="text-sm font-bold text-white">
                  High-Impact Section Incidents
                </h2>
                <p className="mt-0.5 text-[11px] text-[#9FB8BE]">
                  Active operational disturbances requiring regulation
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {incidents.map((incident) => {
                const Icon = incident.icon
                return (
                  <div
                    key={incident.location}
                    className="flex flex-col justify-between gap-3 rounded-md border border-[#145158] bg-[#031A1F] p-3 md:flex-row md:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg border border-[#145158] bg-[#062A2F] p-2 text-[#F59E0B]">
                        <Icon size={16} />
                      </div>

                      <div>
                        <div className="text-xs font-bold text-white">
                          {incident.type} — {incident.location}
                        </div>
                        <div className="mt-0.5 text-[11px] text-[#9FB8BE]">
                          {incident.impact}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-[#9FB8BE]">
                        <strong className="text-white">{incident.trains}</strong>{" "}
                        trains impacted
                      </span>

                      <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-400">
                        {incident.severity}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Intervention log */}
          <section className="controller-panel rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock3 size={16} className="text-[#F59E0B]" />
                <h2 className="text-sm font-bold text-white">
                  Recent Controller Interventions
                </h2>
              </div>

              <span className="text-[11px] text-[#718F96]">
                Live Shift Log
              </span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#145158] text-[10px] uppercase text-[#718F96]">
                    <th className="px-4 py-2 font-semibold">Time</th>
                    <th className="px-4 py-2 font-semibold">Action</th>
                    <th className="px-4 py-2 font-semibold">Train</th>
                    <th className="px-4 py-2 font-semibold">Controller</th>
                    <th className="px-4 py-2 font-semibold">Result</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#145158]">
                  {interventions.map((item) => (
                    <tr key={item.time + item.train} className="hover:bg-[#062A2F]/50">
                      <td className="px-4 py-3 font-mono text-[11px] text-[#9FB8BE]">
                        {item.time}
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">
                        {item.action}
                      </td>
                      <td className="px-4 py-3 font-mono text-amber-400">
                        {item.train}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#9FB8BE]">
                        {item.controller}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border border-[#145158] bg-[#031A1F] px-2 py-1 text-[10px] font-bold text-emerald-400">
                          {item.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ETA accuracy */}
          <section className="controller-panel rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Clock3 size={16} className="text-[#F59E0B]" />
              <div>
                <h2 className="text-sm font-bold text-white">
                  ETA Prediction Performance
                </h2>
                <p className="mt-0.5 text-[11px] text-[#9FB8BE]">
                  Comparison of predicted and observed arrival performance
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-md border border-[#145158] bg-[#031A1F] p-4">
                <div className="text-[10px] uppercase tracking-wide text-[#718F96]">
                  Within ±5 min
                </div>
                <div className="mt-2 text-xl font-bold text-white">86%</div>
              </div>

              <div className="rounded-md border border-[#145158] bg-[#031A1F] p-4">
                <div className="text-[10px] uppercase tracking-wide text-[#718F96]">
                  Mean Absolute Error
                </div>
                <div className="mt-2 text-xl font-bold text-white">3.8 min</div>
              </div>

              <div className="rounded-md border border-[#145158] bg-[#031A1F] p-4">
                <div className="text-[10px] uppercase tracking-wide text-[#718F96]">
                  Forecasts Generated
                </div>
                <div className="mt-2 text-xl font-bold text-white">1,284</div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* QUICK ASSIGN MODAL */}
      {assigningCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#145158] bg-[#071A33] p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-start justify-between border-b border-[#145158] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#F59E0B] tracking-wider block">
                  DISPATCH MAINTENANCE GANG / UNIT
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Case ID:</span>
                  <span className="font-mono text-amber-400">{assigningCase.id}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAssigningCase(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300 bg-[#0A2036] p-3 rounded-lg border border-[#145158]">
              <div className="font-semibold text-white">{assigningCase.category} Issue</div>
              <div className="text-slate-400 mt-0.5">{assigningCase.description}</div>
              <div className="text-amber-300 mt-1 font-mono">{assigningCase.location}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Target Department</label>
                <select
                  value={selectedDept}
                  onChange={(e) => {
                    const dept = e.target.value
                    setSelectedDept(dept)
                    const match = DEPARTMENT_DIRECTORY.find((d) => d.name === dept)
                    if (match && match.teams.length > 0) {
                      setSelectedTeam(match.teams[0])
                    }
                  }}
                  className="w-full rounded-lg border border-[#145158] bg-[#031A1F] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                >
                  {DEPARTMENT_DIRECTORY.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Specific Field Gang / Desk</label>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full rounded-lg border border-[#145158] bg-[#031A1F] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                >
                  {DEPARTMENT_DIRECTORY.find((d) => d.name === selectedDept)?.teams.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Controller Dispatch Instruction</label>
              <input
                type="text"
                placeholder="Order directive, safety gear requirement, line block status..."
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
                className="w-full rounded-lg border border-[#145158] bg-[#031A1F] px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#145158]">
              <button
                type="button"
                onClick={() => setAssigningCase(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssign}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition shadow-lg shadow-amber-600/30"
              >
                Dispatch Unit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports

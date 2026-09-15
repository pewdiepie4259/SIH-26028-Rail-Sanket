import { useMemo, useState } from "react"
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  Copy,
  Edit2,
  ExternalLink,
  Eye,
  Plus,
  RefreshCw,
  Save,
  Search,
  Server,
  Shield,
  ShieldAlert,
  Sliders,
  Trash2,
  Undo2,
  X,
} from "lucide-react"
import { Link } from "react-router-dom"
import type {
  AlertCategory,
  AlertChannel,
  AlertRecipient,
  AlertRule,
  AlertRuleStatus,
  AlertScope,
  AlertSeverity,
  ConditionOperator,
} from "../../types/alerts"

// ── Initial Representative Alert Rules ───────────────────────────────────────
const initialRules: AlertRule[] = [
  {
    id: "rule_delay_sig",
    name: "Significant Train Delay",
    description:
      "Triggers when an active passenger or freight service accumulates unexpected delay exceeding the operational threshold.",
    category: "Delay",
    triggerType: "Delay exceeds threshold",
    threshold: "15 minutes",
    condition: {
      field: "Delay",
      operator: "Greater than",
      value: 15,
      unit: "minutes",
    },
    severity: "WARNING",
    scope: "Train",
    status: "Enabled",
    notificationPolicy: {
      primaryRecipient: "Controller",
      escalationRecipient: "Operations Team",
      channels: ["In-app", "Push"],
      escalationDelayMinutes: 10,
      repeatIntervalMinutes: 15,
    },
    suppressionPolicy: {
      enabled: true,
      suppressionWindowMinutes: 20,
      maxRepeatedNotifications: 3,
      autoAcknowledgeMinutes: 60,
    },
    createdBy: "System Administrator (EMP-0104)",
    createdAt: "2024-08-01 09:00",
    lastModified: "Today, 11:20",
    lastTriggered: "18 mins ago",
  },
  {
    id: "rule_eta_confidence",
    name: "ETA Confidence Below Threshold",
    description:
      "Alerts controllers when spatio-temporal GNN model confidence drops below reliability cutoff due to sparse sensor telemetry.",
    category: "ETA",
    triggerType: "ETA confidence falls below threshold",
    threshold: "65%",
    condition: {
      field: "ETA Confidence",
      operator: "Below threshold",
      value: 65,
      unit: "%",
    },
    severity: "WARNING",
    scope: "Train",
    status: "Enabled",
    notificationPolicy: {
      primaryRecipient: "Controller",
      escalationRecipient: "System Administrator",
      channels: ["In-app"],
      escalationDelayMinutes: 15,
      repeatIntervalMinutes: 0,
    },
    suppressionPolicy: {
      enabled: true,
      suppressionWindowMinutes: 30,
      maxRepeatedNotifications: 2,
      autoAcknowledgeMinutes: 0,
    },
    createdBy: "Lead AI Engineer (EMP-0042)",
    createdAt: "2024-08-10 14:30",
    lastModified: "Yesterday, 16:45",
    lastTriggered: "2 hours ago",
  },
  {
    id: "rule_junction_conflict",
    name: "Junction Conflict Detected",
    description:
      "Identifies simultaneous block occupation requests or hazardous headway overlaps at key railway junctions.",
    category: "Junction",
    triggerType: "Junction conflict detected",
    threshold: "10 mins window",
    condition: {
      field: "Conflict Window",
      operator: "Less than",
      value: 10,
      unit: "minutes",
    },
    severity: "CRITICAL",
    scope: "Junction",
    status: "Enabled",
    notificationPolicy: {
      primaryRecipient: "Controller",
      escalationRecipient: "Operations Team",
      channels: ["In-app", "Push", "SMS"],
      escalationDelayMinutes: 5,
      repeatIntervalMinutes: 5,
    },
    suppressionPolicy: {
      enabled: false,
      suppressionWindowMinutes: 0,
      maxRepeatedNotifications: 5,
      autoAcknowledgeMinutes: 0,
    },
    createdBy: "Chief Traffic Controller (EMP-0018)",
    createdAt: "2024-07-15 10:15",
    lastModified: "2 days ago",
    lastTriggered: "1 day ago",
  },
  {
    id: "rule_weather_restriction",
    name: "Weather Restriction Imposed",
    description:
      "Raises automated sectional caution when radar precipitation or wind velocity exceeds track safety standards.",
    category: "Weather",
    triggerType: "Weather threshold exceeded",
    threshold: "35 mm/h rain",
    condition: {
      field: "Rainfall Rate",
      operator: "Above threshold",
      value: 35,
      unit: "mm/h",
    },
    severity: "WARNING",
    scope: "Section",
    status: "Enabled",
    notificationPolicy: {
      primaryRecipient: "Controller",
      escalationRecipient: "Operations Team",
      channels: ["In-app", "Email"],
      escalationDelayMinutes: 15,
      repeatIntervalMinutes: 30,
    },
    suppressionPolicy: {
      enabled: true,
      suppressionWindowMinutes: 45,
      maxRepeatedNotifications: 2,
      autoAcknowledgeMinutes: 120,
    },
    createdBy: "Safety Director (EMP-0089)",
    createdAt: "2024-08-05 11:00",
    lastModified: "3 days ago",
    lastTriggered: "4 hours ago",
  },
  {
    id: "rule_cascade_risk",
    name: "Delay Cascade Risk",
    description:
      "Flags secondary trains that have high statistical likelihood of propagating delays across shared single or quadruple lines.",
    category: "Cascade",
    triggerType: "Cascade risk exceeds threshold",
    threshold: "0.70 index",
    condition: {
      field: "Cascade Index",
      operator: "Greater than",
      value: 0.7,
      unit: "score",
    },
    severity: "CRITICAL",
    scope: "Network",
    status: "Enabled",
    notificationPolicy: {
      primaryRecipient: "Controller",
      escalationRecipient: "Operations Team",
      channels: ["In-app", "Push"],
      escalationDelayMinutes: 5,
      repeatIntervalMinutes: 10,
    },
    suppressionPolicy: {
      enabled: true,
      suppressionWindowMinutes: 15,
      maxRepeatedNotifications: 4,
      autoAcknowledgeMinutes: 0,
    },
    createdBy: "Operations Research Specialist (EMP-0210)",
    createdAt: "2024-08-18 13:20",
    lastModified: "4 days ago",
    lastTriggered: "38 mins ago",
  },
  {
    id: "rule_telemetry_lost",
    name: "Telemetry Feed Lost",
    description:
      "Alerts dispatchers when locomotive RTIS transponder drops heartbeat signal for over two continuous polling cycles.",
    category: "Telemetry",
    triggerType: "Telemetry unavailable",
    threshold: "120 seconds",
    condition: {
      field: "RTIS Heartbeat",
      operator: "Unavailable",
      value: 120,
      unit: "seconds",
    },
    severity: "CRITICAL",
    scope: "Train",
    status: "Enabled",
    notificationPolicy: {
      primaryRecipient: "System Administrator",
      escalationRecipient: "Operations Team",
      channels: ["In-app", "Push", "Email"],
      escalationDelayMinutes: 5,
      repeatIntervalMinutes: 10,
    },
    suppressionPolicy: {
      enabled: true,
      suppressionWindowMinutes: 10,
      maxRepeatedNotifications: 3,
      autoAcknowledgeMinutes: 0,
    },
    createdBy: "Network Infrastructure Lead (EMP-0155)",
    createdAt: "2024-07-20 08:30",
    lastModified: "1 week ago",
    lastTriggered: "5 hours ago",
  },
  {
    id: "rule_signal_deviation",
    name: "Interlocking Signal Deviation",
    description:
      "Detects divergence between route relay interlocking (RRI) commanded aspect and train sensor track-circuit acknowledgment.",
    category: "Signal",
    triggerType: "Signal aspect discrepancy",
    threshold: "Aspect Mismatch",
    condition: {
      field: "Signal Aspect",
      operator: "Equal to",
      value: "Discrepancy",
      unit: "state",
    },
    severity: "CRITICAL",
    scope: "Section",
    status: "Draft",
    notificationPolicy: {
      primaryRecipient: "Controller",
      escalationRecipient: "Operations Team",
      channels: ["In-app", "SMS"],
      escalationDelayMinutes: 2,
      repeatIntervalMinutes: 5,
    },
    suppressionPolicy: {
      enabled: false,
      suppressionWindowMinutes: 0,
      maxRepeatedNotifications: 10,
      autoAcknowledgeMinutes: 0,
    },
    createdBy: "Signal & Telecom Inspector (EMP-0077)",
    createdAt: "2024-09-12 11:15",
    lastModified: "Today, 09:30",
    lastTriggered: "Never",
  },
  {
    id: "rule_system_memory",
    name: "Microservice Memory Pressure",
    description:
      "Warns platform engineers when inference engine memory utilization exceeds nominal threshold.",
    category: "System",
    triggerType: "Resource utilization threshold",
    threshold: "85% RAM",
    condition: {
      field: "Memory Usage",
      operator: "Greater than",
      value: 85,
      unit: "%",
    },
    severity: "INFO",
    scope: "System",
    status: "Disabled",
    notificationPolicy: {
      primaryRecipient: "System Administrator",
      escalationRecipient: "System Administrator",
      channels: ["In-app", "Email"],
      escalationDelayMinutes: 30,
      repeatIntervalMinutes: 60,
    },
    suppressionPolicy: {
      enabled: true,
      suppressionWindowMinutes: 60,
      maxRepeatedNotifications: 2,
      autoAcknowledgeMinutes: 180,
    },
    createdBy: "DevOps Engineer (EMP-0312)",
    createdAt: "2024-08-30 16:00",
    lastModified: "5 days ago",
    lastTriggered: "3 days ago",
  },
]

const categoryList: AlertCategory[] = [
  "Delay",
  "ETA",
  "Signal",
  "Junction",
  "Weather",
  "Cascade",
  "Telemetry",
  "System",
]

const operatorList: ConditionOperator[] = [
  "Greater than",
  "Less than",
  "Equal to",
  "Above threshold",
  "Below threshold",
  "Unavailable",
]

const scopeList: AlertScope[] = [
  "Train",
  "Station",
  "Section",
  "Junction",
  "Network",
  "System",
]

const recipientList: AlertRecipient[] = [
  "Controller",
  "System Administrator",
  "Operations Team",
]

const channelList: AlertChannel[] = ["In-app", "Email", "SMS", "Push"]

export default function AlertsRules() {
  const [rules, setRules] = useState<AlertRule[]>(initialRules)

  // Simulation of backend rules service availability
  const [backendAvailable, setBackendAvailable] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null)

  // Change tracking
  const [pendingChanges, setPendingChanges] = useState<number>(0)
  const [saveNotice, setSaveNotice] = useState<{ type: "success" | "warning"; message: string } | null>(
    null
  )

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL")
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL")

  // Modal / Drawer states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null)
  const [detailRule, setDetailRule] = useState<AlertRule | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<AlertRule | null>(null)

  // Form State for Create / Edit
  const [formName, setFormName] = useState("")
  const [formCategory, setFormCategory] = useState<AlertCategory>("Delay")
  const [formDescription, setFormDescription] = useState("")
  const [formTriggerType, setFormTriggerType] = useState("Delay exceeds threshold")
  const [formSeverity, setFormSeverity] = useState<AlertSeverity>("WARNING")
  const [formScope, setFormScope] = useState<AlertScope>("Train")
  const [formStatus, setFormStatus] = useState<AlertRuleStatus>("Enabled")

  // Condition Builder State
  const [condField, setCondField] = useState("Delay")
  const [condOperator, setCondOperator] = useState<ConditionOperator>("Greater than")
  const [condValue, setCondValue] = useState<string | number>(15)
  const [condUnit, setCondUnit] = useState("minutes")
  const [condAction, setCondAction] = useState("Notify Controller")

  // Notification Policy State
  const [formPrimaryRecipient, setFormPrimaryRecipient] = useState<AlertRecipient>("Controller")
  const [formEscalationRecipient, setFormEscalationRecipient] = useState<AlertRecipient>("Operations Team")
  const [formChannels, setFormChannels] = useState<AlertChannel[]>(["In-app", "Push"])
  const [formEscalationDelay, setFormEscalationDelay] = useState(10)
  const [formRepeatInterval, setFormRepeatInterval] = useState(15)

  // Suppression Policy State
  const [formSuppressionEnabled, setFormSuppressionEnabled] = useState(true)
  const [formSuppressionWindow, setFormSuppressionWindow] = useState(20)
  const [formMaxRepeated, setFormMaxRepeated] = useState(3)
  const [formAutoAck, setFormAutoAck] = useState(60)

  // Form Validation errors
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})

  // Refresh rules action
  const handleRefreshRules = () => {
    setIsRefreshing(true)
    setRefreshNotice(null)
    setTimeout(() => {
      setIsRefreshing(false)
      if (backendAvailable) {
        setRefreshNotice("Alert rules synchronized with central configuration registry.")
      } else {
        setRefreshNotice("Backend rule engine is unavailable. Displaying local cached rules.")
      }
      setTimeout(() => setRefreshNotice(null), 3500)
    }, 750)
  }

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingRule(null)
    setFormName("")
    setFormCategory("Delay")
    setFormDescription("")
    setFormTriggerType("Delay exceeds threshold")
    setFormSeverity("WARNING")
    setFormScope("Train")
    setFormStatus("Enabled")

    setCondField("Delay")
    setCondOperator("Greater than")
    setCondValue(15)
    setCondUnit("minutes")
    setCondAction("Notify Controller")

    setFormPrimaryRecipient("Controller")
    setFormEscalationRecipient("Operations Team")
    setFormChannels(["In-app", "Push"])
    setFormEscalationDelay(10)
    setFormRepeatInterval(15)

    setFormSuppressionEnabled(true)
    setFormSuppressionWindow(20)
    setFormMaxRepeated(3)
    setFormAutoAck(60)

    setFormErrors({})
    setIsCreateModalOpen(true)
  }

  // Open Edit Modal with prefilled data
  const handleOpenEditModal = (rule: AlertRule) => {
    setEditingRule(rule)
    setFormName(rule.name)
    setFormCategory(rule.category)
    setFormDescription(rule.description)
    setFormTriggerType(rule.triggerType)
    setFormSeverity(rule.severity)
    setFormScope(rule.scope)
    setFormStatus(rule.status)

    setCondField(rule.condition.field)
    setCondOperator(rule.condition.operator)
    setCondValue(rule.condition.value)
    setCondUnit(rule.condition.unit || "")
    setCondAction("Notify Controller")

    setFormPrimaryRecipient(rule.notificationPolicy.primaryRecipient)
    setFormEscalationRecipient(rule.notificationPolicy.escalationRecipient)
    setFormChannels([...rule.notificationPolicy.channels])
    setFormEscalationDelay(rule.notificationPolicy.escalationDelayMinutes)
    setFormRepeatInterval(rule.notificationPolicy.repeatIntervalMinutes)

    setFormSuppressionEnabled(rule.suppressionPolicy.enabled)
    setFormSuppressionWindow(rule.suppressionPolicy.suppressionWindowMinutes)
    setFormMaxRepeated(rule.suppressionPolicy.maxRepeatedNotifications)
    setFormAutoAck(rule.suppressionPolicy.autoAcknowledgeMinutes)

    setFormErrors({})
    setIsCreateModalOpen(true)
  }

  // Channel toggle handler
  const handleToggleChannel = (channel: AlertChannel) => {
    if (formChannels.includes(channel)) {
      if (formChannels.length > 1) {
        setFormChannels(formChannels.filter((c) => c !== channel))
      }
    } else {
      setFormChannels([...formChannels, channel])
    }
  }

  // Save Modal Form
  const handleSaveModalForm = () => {
    const errors: { [key: string]: string } = {}
    if (!formName.trim()) {
      errors.name = "Rule Name is required."
    }
    if (!formDescription.trim()) {
      errors.description = "Operational Description is required."
    }
    if (!condField.trim()) {
      errors.condField = "Condition field is required."
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const newRule: AlertRule = {
      id: editingRule ? editingRule.id : `rule_${Date.now()}`,
      name: formName.trim(),
      description: formDescription.trim(),
      category: formCategory,
      triggerType: formTriggerType,
      threshold: `${condValue} ${condUnit}`.trim(),
      condition: {
        field: condField.trim(),
        operator: condOperator,
        value: condValue,
        unit: condUnit,
      },
      severity: formSeverity,
      scope: formScope,
      status: formStatus,
      notificationPolicy: {
        primaryRecipient: formPrimaryRecipient,
        escalationRecipient: formEscalationRecipient,
        channels: formChannels,
        escalationDelayMinutes: formEscalationDelay,
        repeatIntervalMinutes: formRepeatInterval,
      },
      suppressionPolicy: {
        enabled: formSuppressionEnabled,
        suppressionWindowMinutes: formSuppressionWindow,
        maxRepeatedNotifications: formMaxRepeated,
        autoAcknowledgeMinutes: formAutoAck,
      },
      createdBy: editingRule ? editingRule.createdBy : "System Administrator (Current)",
      createdAt: editingRule ? editingRule.createdAt : "Just now",
      lastModified: "Just now",
      lastTriggered: editingRule ? editingRule.lastTriggered : "Never",
    }

    if (editingRule) {
      setRules((prev) => prev.map((r) => (r.id === editingRule.id ? newRule : r)))
    } else {
      setRules((prev) => [newRule, ...prev])
    }

    setPendingChanges((p) => p + 1)
    setIsCreateModalOpen(false)
  }

  // Toggle Rule Status directly
  const handleToggleStatus = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === ruleId) {
          const nextStatus: AlertRuleStatus =
            r.status === "Enabled" ? "Disabled" : "Enabled"
          return { ...r, status: nextStatus, lastModified: "Just now" }
        }
        return r
      })
    )
    setPendingChanges((p) => p + 1)
  }

  // Duplicate Rule
  const handleDuplicateRule = (rule: AlertRule) => {
    const copy: AlertRule = {
      ...rule,
      id: `rule_${Date.now()}`,
      name: `${rule.name} (Copy)`,
      status: "Draft",
      lastModified: "Just now",
      createdAt: "Just now",
      lastTriggered: "Never",
    }
    setRules((prev) => [copy, ...prev])
    setPendingChanges((p) => p + 1)
  }

  // Delete Rule
  const handleConfirmDelete = () => {
    if (!deleteCandidate) return
    setRules((prev) => prev.filter((r) => r.id !== deleteCandidate.id))
    setPendingChanges((p) => p + 1)
    setDeleteCandidate(null)
    if (detailRule?.id === deleteCandidate.id) {
      setDetailRule(null)
    }
  }

  // Save Changes to Backend
  const handleSaveChanges = () => {
    if (!backendAvailable) {
      setSaveNotice({
        type: "warning",
        message:
          "Alert configuration service is unavailable. Changes have not been applied.",
      })
      setTimeout(() => setSaveNotice(null), 4500)
      return
    }

    setSaveNotice({
      type: "success",
      message: `${pendingChanges} rule configuration changes successfully synchronized to alert dispatcher.`,
    })
    setPendingChanges(0)
    setTimeout(() => setSaveNotice(null), 4000)
  }

  // Discard Changes
  const handleDiscardChanges = () => {
    setRules(initialRules)
    setPendingChanges(0)
    setSaveNotice({
      type: "warning",
      message: "Unsaved local rule modifications have been discarded.",
    })
    setTimeout(() => setSaveNotice(null), 3000)
  }

  // Filtered Rules
  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      const matchesSearch =
        rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.triggerType.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategory === "ALL" || rule.category === selectedCategory

      const matchesStatus =
        selectedStatus === "ALL" || rule.status === selectedStatus

      const matchesSeverity =
        selectedSeverity === "ALL" || rule.severity === selectedSeverity

      return matchesSearch && matchesCategory && matchesStatus && matchesSeverity
    })
  }, [rules, searchQuery, selectedCategory, selectedStatus, selectedSeverity])

  // System status indicators
  const alertEngineStatus: "Operational" | "Degraded" | "Unavailable" | "Not Configured" =
    backendAvailable ? "Operational" : "Unavailable"
  const notificationServiceStatus: "Operational" | "Degraded" | "Unavailable" | "Not Configured" =
    backendAvailable ? "Degraded" : "Unavailable"
  const escalationEngineStatus: "Operational" | "Degraded" | "Unavailable" | "Not Configured" =
    backendAvailable ? "Operational" : "Unavailable"
  const activeRulesCount = backendAvailable
    ? rules.filter((r) => r.status === "Enabled").length
    : "--"

  const getEngineDotColor = (
    status: "Operational" | "Degraded" | "Unavailable" | "Not Configured"
  ) => {
    switch (status) {
      case "Operational":
        return "bg-emerald-400"
      case "Degraded":
        return "bg-amber-400"
      case "Unavailable":
      case "Not Configured":
      default:
        return "bg-rose-500"
    }
  }

  // Restrained Status Badge
  const renderStatusBadge = (status: AlertRuleStatus) => {
    switch (status) {
      case "Enabled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Enabled
          </span>
        )
      case "Draft":
        return (
          <span className="inline-flex items-center gap-1.5 rounded border border-amber-500/40 bg-amber-950/60 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Draft
          </span>
        )
      case "Disabled":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded border border-slate-500/30 bg-slate-900/60 px-2 py-0.5 text-[11px] font-semibold text-[#9FB8BE]">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Disabled
          </span>
        )
    }
  }

  // Restrained Severity Badge
  const renderSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1 rounded border border-rose-500/40 bg-rose-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-300">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            CRITICAL
          </span>
        )
      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1 rounded border border-amber-500/40 bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            WARNING
          </span>
        )
      case "INFO":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded border border-sky-500/30 bg-sky-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-300">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            INFO
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ── 1. PAGE HEADER ─────────────────────────────────────────── */}
      <header className="controller-panel rounded-lg px-5 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <Bell className="text-[#0E7C86]" size={22} />
              <h1 className="text-xl font-bold tracking-tight text-white">
                Alerts & Rules
              </h1>
            </div>
            <p className="mt-1 text-xs text-[#D7E5EC]/75">
              Configure operational alert conditions, severity and escalation policies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Backend connectivity simulation */}
            <button
              onClick={() => setBackendAvailable((prev) => !prev)}
              title="Toggle backend alert engine connection status"
              className="flex items-center gap-1.5 rounded border border-[#145158] bg-[#031A1F] px-2.5 py-1.5 text-[11px] text-[#D7E5EC] transition hover:bg-[#08383D]"
            >
              <Server size={13} className={backendAvailable ? "text-emerald-400" : "text-[#718F96]"} />
              <span className="text-[10px] text-[#9FB8BE]">Engine:</span>
              <span className="font-semibold">
                {backendAvailable ? "Connected" : "Disconnected"}
              </span>
            </button>

            {/* Refresh Rules Action */}
            <button
              onClick={handleRefreshRules}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded border border-[#145158] bg-[#071A33] px-3 py-1.5 text-xs font-semibold text-[#D7E5EC] transition hover:border-[#0E7C86] hover:bg-[#0E5961]/40 disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={isRefreshing ? "animate-spin text-[#0E7C86]" : "text-[#9FB8BE]"}
              />
              <span>{isRefreshing ? "Refreshing..." : "Refresh Rules"}</span>
            </button>

            {/* Create Rule Action */}
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1.5 rounded bg-[#0E7C86] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0E5961]"
            >
              <Plus size={15} />
              <span>Create Rule</span>
            </button>
          </div>
        </div>

        {/* Change Control Warning / Notice Banner */}
        {saveNotice && (
          <div
            className={`mt-3 flex items-center gap-2 rounded border px-3 py-2 text-xs ${
              saveNotice.type === "success"
                ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-200"
                : "border-amber-500/40 bg-amber-950/40 text-amber-200"
            }`}
          >
            {saveNotice.type === "success" ? (
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle size={14} className="text-amber-400 shrink-0" />
            )}
            <span>{saveNotice.message}</span>
          </div>
        )}

        {refreshNotice && (
          <div className="mt-3 flex items-center gap-2 rounded border border-emerald-500/30 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-200">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <span>{refreshNotice}</span>
          </div>
        )}

        {!backendAvailable && (
          <div className="mt-3 flex items-center gap-2 rounded border border-rose-500/40 bg-rose-950/30 px-3 py-2 text-xs text-rose-200">
            <AlertCircle size={14} className="text-rose-400 shrink-0" />
            <span>
              Alert configuration service is unavailable. Changes have not been applied.
            </span>
          </div>
        )}
      </header>

      {/* ── 2. ALERT SYSTEM STATUS STRIP ────────────────────────────── */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Alert Engine */}
        <div className="controller-panel rounded-lg p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9FB8BE]">
            Alert Engine
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${getEngineDotColor(alertEngineStatus)}`}
            />
            <span className="font-semibold text-white">{alertEngineStatus}</span>
          </div>
          <div className="mt-1 text-[11px] text-[#D7E5EC]/70">
            Rule evaluation loop
          </div>
        </div>

        {/* Notification Service */}
        <div className="controller-panel rounded-lg p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9FB8BE]">
            Notification Service
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${getEngineDotColor(notificationServiceStatus)}`}
            />
            <span className="font-semibold text-white">{notificationServiceStatus}</span>
          </div>
          <div className="mt-1 text-[11px] text-[#D7E5EC]/70">
            SMS delayed, WebPush nominal
          </div>
        </div>

        {/* Escalation Engine */}
        <div className="controller-panel rounded-lg p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9FB8BE]">
            Escalation Engine
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${getEngineDotColor(escalationEngineStatus)}`}
            />
            <span className="font-semibold text-white">{escalationEngineStatus}</span>
          </div>
          <div className="mt-1 text-[11px] text-[#D7E5EC]/70">
            Cascade routing active
          </div>
        </div>

        {/* Active Rules */}
        <div className="controller-panel rounded-lg p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0E7C86]">
            Active Rules
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-white">
            {activeRulesCount}
          </div>
          <div className="mt-1 text-[11px] text-[#D7E5EC]/70">
            Of {rules.length} configured rules
          </div>
        </div>
      </section>

      {/* ── 11 & 12. CHANGE CONTROL BAR & AUDIT LINK ───────────────── */}
      <section className="controller-panel flex flex-col gap-3 rounded-lg px-5 py-3 sm:flex-row sm:items-center sm:justify-between border border-[#145158]">
        <div className="flex items-center gap-3">
          <div className="rounded bg-[#031A1F] px-2.5 py-1 text-xs border border-[#145158]">
            <span className="text-[#9FB8BE]">Pending Changes: </span>
            <span className="font-bold text-amber-300">{pendingChanges}</span>
          </div>
          <div className="text-xs text-[#9FB8BE]">
            Changed by: <span className="text-white font-medium">System Administrator</span> (Unsaved in RAM)
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/audit"
            className="flex items-center gap-1.5 rounded border border-[#145158] bg-[#031A1F] px-3 py-1 text-xs text-[#0E7C86] hover:text-[#F59E0B] transition"
          >
            <ExternalLink size={13} />
            <span>View Alert Configuration Audit</span>
          </Link>

          <button
            onClick={handleDiscardChanges}
            disabled={pendingChanges === 0}
            className="flex items-center gap-1.5 rounded border border-[#145158] bg-[#031A1F] px-3 py-1 text-xs font-semibold text-[#D7E5EC] hover:bg-[#08383D] disabled:opacity-40"
          >
            <Undo2 size={13} />
            <span>Discard Changes</span>
          </button>

          <button
            onClick={handleSaveChanges}
            disabled={pendingChanges === 0}
            className="flex items-center gap-1.5 rounded bg-[#0E7C86] px-3 py-1 text-xs font-semibold text-white hover:bg-[#0E5961] disabled:opacity-40"
          >
            <Save size={13} />
            <span>Save Changes</span>
          </button>
        </div>
      </section>

      {/* ── 3. ALERT RULES TABLE WITH FILTERS ──────────────────────── */}
      <section className="controller-panel overflow-hidden rounded-lg">
        <div className="controller-header px-4 py-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Alert Rules</h2>
              <p className="text-[11px] text-[#D7E5EC]/70">
                Operational conditions that trigger alarms and dispatch notifications
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#718F96]"
                />
                <input
                  type="text"
                  placeholder="Search rules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-44 sm:w-56 rounded border border-[#145158] bg-[#031A1F] py-1 pl-8 pr-2.5 text-xs text-white placeholder-[#718F96] focus:border-[#0E7C86] focus:outline-none"
                />
              </div>

              {/* Category Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded border border-[#145158] bg-[#031A1F] px-2.5 py-1 text-xs text-white focus:border-[#0E7C86] focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                {categoryList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Status Dropdown */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded border border-[#145158] bg-[#031A1F] px-2.5 py-1 text-xs text-white focus:border-[#0E7C86] focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Enabled">Enabled</option>
                <option value="Disabled">Disabled</option>
                <option value="Draft">Draft</option>
              </select>

              {/* Severity Dropdown */}
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="rounded border border-[#145158] bg-[#031A1F] px-2.5 py-1 text-xs text-white focus:border-[#0E7C86] focus:outline-none"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="WARNING">Warning</option>
                <option value="INFO">Info</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rules Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#145158] bg-[#071A33] text-[10px] font-bold uppercase tracking-[0.12em] text-[#9FB8BE]">
                <th className="px-4 py-3">Rule Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Trigger Condition</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Modified</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#145158]/50">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs text-[#9FB8BE]">
                    No alert rules are currently available matching the filters.
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <tr
                    key={rule.id}
                    className="transition-colors hover:bg-[#08383D]/40"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-white">{rule.name}</div>
                      <div className="mt-0.5 text-[11px] text-[#9FB8BE] line-clamp-1 max-w-xs">
                        {rule.description}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded border border-[#145158] bg-[#031A1F] px-2 py-0.5 text-[10px] font-semibold text-[#D7E5EC]">
                        {rule.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-mono text-[11px] text-[#D7E5EC]">
                        {rule.condition.field} {rule.condition.operator.toLowerCase()}{" "}
                        <span className="font-bold text-amber-300">
                          {rule.condition.value} {rule.condition.unit}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#718F96]">
                        Scope: {rule.scope}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {renderSeverityBadge(rule.severity)}
                    </td>
                    <td className="px-4 py-3.5">
                      {renderStatusBadge(rule.status)}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-[#D7E5EC]/80 whitespace-nowrap">
                      {rule.lastModified}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDetailRule(rule)}
                          title="View Details"
                          className="rounded border border-[#145158] bg-[#031A1F] p-1.5 text-[#D7E5EC] hover:border-[#0E7C86] hover:text-white transition"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(rule)}
                          title="Edit Rule"
                          className="rounded border border-[#145158] bg-[#031A1F] p-1.5 text-[#0E7C86] hover:border-[#0E7C86] hover:text-[#F59E0B] transition"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(rule.id)}
                          title={rule.status === "Enabled" ? "Disable Rule" : "Enable Rule"}
                          className="rounded border border-[#145158] bg-[#031A1F] px-2 py-1 text-[10px] font-semibold text-[#D7E5EC] hover:bg-[#08383D] transition"
                        >
                          {rule.status === "Enabled" ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => handleDuplicateRule(rule)}
                          title="Duplicate Rule"
                          className="rounded border border-[#145158] bg-[#031A1F] p-1.5 text-[#9FB8BE] hover:text-white transition"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(rule)}
                          title="Delete Rule"
                          className="rounded border border-[#145158] bg-[#031A1F] p-1.5 text-rose-400 hover:border-rose-500 hover:bg-rose-950/40 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 7, 8 & 9. ESCALATION, SEVERITY POLICY & SUPPRESSION ────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 8. Severity Policy */}
        <section className="controller-panel rounded-lg p-5">
          <div className="flex items-center gap-2 border-b border-[#145158] pb-3">
            <Shield size={16} className="text-[#0E7C86]" />
            <div>
              <h3 className="text-sm font-bold text-white">Severity Policy</h3>
              <p className="text-[11px] text-[#D7E5EC]/70">
                System operational classification levels
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="rounded border border-sky-500/30 bg-[#031A1F] p-3">
              <div className="flex items-center gap-2 font-bold text-sky-300">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                INFO
              </div>
              <p className="mt-1 text-[11px] text-[#D7E5EC]/80 leading-relaxed">
                Informational event. Logged to diagnostics and audit trail. No immediate escalation or controller dispatch required.
              </p>
            </div>

            <div className="rounded border border-amber-500/30 bg-[#031A1F] p-3">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                WARNING
              </div>
              <p className="mt-1 text-[11px] text-[#D7E5EC]/80 leading-relaxed">
                Operational attention required. Notifies relevant section controller. May require speed restriction or headway adjustment.
              </p>
            </div>

            <div className="rounded border border-rose-500/30 bg-[#031A1F] p-3">
              <div className="flex items-center gap-2 font-bold text-rose-300">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                CRITICAL
              </div>
              <p className="mt-1 text-[11px] text-[#D7E5EC]/80 leading-relaxed">
                Immediate operational intervention required. Dispatches multi-channel alarms and initiates automated escalation policy.
              </p>
            </div>
          </div>

          <div className="mt-3 text-[10px] text-[#718F96]">
            * Definitions represent system rule defaults, not claims about official Indian Railways manuals.
          </div>
        </section>

        {/* 7. Notification & Escalation Reference */}
        <section className="controller-panel rounded-lg p-5">
          <div className="flex items-center gap-2 border-b border-[#145158] pb-3">
            <Bell size={16} className="text-[#0E7C86]" />
            <div>
              <h3 className="text-sm font-bold text-white">Notification & Escalation</h3>
              <p className="text-[11px] text-[#D7E5EC]/70">
                Multi-tier dispatch targets and timeout chains
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="rounded border border-[#145158] bg-[#031A1F] p-3">
              <div className="text-[10px] text-[#718F96]">Primary Dispatch Target</div>
              <div className="mt-1 font-semibold text-white">Section Train Controller</div>
              <div className="text-[11px] text-[#9FB8BE]">Delivered via in-app banner and auditory beacon.</div>
            </div>

            <div className="rounded border border-[#145158] bg-[#031A1F] p-3">
              <div className="text-[10px] text-[#718F96]">Escalation Target (Tier 2)</div>
              <div className="mt-1 font-semibold text-[#0E7C86]">Operations Team & Chief Controller</div>
              <div className="text-[11px] text-[#9FB8BE]">Triggered after 5–15 minutes of unacknowledged critical state.</div>
            </div>

            <div className="rounded border border-amber-500/30 bg-[#031A1F] p-3">
              <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                <AlertTriangle size={13} />
                <span>Provider Channel Requirement</span>
              </div>
              <p className="mt-1 text-[11px] text-[#9FB8BE]">
                SMS and WebPush dispatches require an active backend notification provider configured under System Integrations.
              </p>
            </div>
          </div>
        </section>

        {/* 9. Alert Suppression */}
        <section className="controller-panel rounded-lg p-5">
          <div className="flex items-center gap-2 border-b border-[#145158] pb-3">
            <Sliders size={16} className="text-[#0E7C86]" />
            <div>
              <h3 className="text-sm font-bold text-white">Alert Suppression</h3>
              <p className="text-[11px] text-[#D7E5EC]/70">
                Dampening duplicate alarm storms
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="rounded border border-[#145158] bg-[#031A1F] p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Duplicate Suppression</span>
                <span className="font-mono text-emerald-400 font-bold">Enabled</span>
              </div>
              <p className="mt-1 text-[11px] text-[#9FB8BE]">
                Suppresses repeated notifications for the same underlying event while state remains continuous.
              </p>
            </div>

            <div className="rounded border border-[#145158] bg-[#031A1F] p-3">
              <div className="text-[10px] text-[#718F96]">Default Suppression Window</div>
              <div className="mt-1 font-mono text-sm font-bold text-white">20 Minutes</div>
              <div className="text-[11px] text-[#9FB8BE]">Minimum interval before generating a duplicate warning token.</div>
            </div>

            <div className="rounded border border-[#145158] bg-[#031A1F] p-3">
              <div className="text-[10px] text-[#718F96]">Max Notification Repeats</div>
              <div className="mt-1 font-mono text-sm font-bold text-white">3 Notifications</div>
              <div className="text-[11px] text-[#9FB8BE]">Hard ceiling on push attempts per incident lifecycle.</div>
            </div>
          </div>
        </section>
      </div>

      {/* ── 5 & 6. CREATE / EDIT RULE MODAL (WITH CONDITION BUILDER) ─ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="controller-panel relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-[#145158] shadow-2xl">
            {/* Modal Header */}
            <div className="controller-header flex items-center justify-between px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingRule ? "Edit Alert Rule" : "Create Alert Rule"}
                </h3>
                <p className="mt-0.5 text-xs text-[#D7E5EC]/70">
                  Define condition triggers, scope thresholds, and notification policies
                </p>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded p-1 text-[#9FB8BE] hover:bg-[#08383D] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* General Rule Metadata */}
              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <label className="block font-semibold text-[#D7E5EC]">
                    Rule Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Significant Train Delay"
                    className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] px-3 py-2 text-xs text-white focus:border-[#0E7C86] focus:outline-none"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-[11px] text-rose-400">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-[#D7E5EC]">
                    Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as AlertCategory)}
                    className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] px-3 py-2 text-xs text-white focus:border-[#0E7C86] focus:outline-none"
                  >
                    {categoryList.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#062A2F] text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-xs">
                <label className="block font-semibold text-[#D7E5EC]">
                  Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  placeholder="Explain why this rule exists and what operational condition it identifies..."
                  className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] px-3 py-2 text-xs text-white focus:border-[#0E7C86] focus:outline-none"
                />
                {formErrors.description && (
                  <p className="mt-1 text-[11px] text-rose-400">{formErrors.description}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#D7E5EC]">Severity</label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value as AlertSeverity)}
                    className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] px-3 py-2 text-xs text-white focus:border-[#0E7C86] focus:outline-none"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="WARNING">WARNING</option>
                    <option value="INFO">INFO</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#D7E5EC]">Affected Scope</label>
                  <select
                    value={formScope}
                    onChange={(e) => setFormScope(e.target.value as AlertScope)}
                    className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] px-3 py-2 text-xs text-white focus:border-[#0E7C86] focus:outline-none"
                  >
                    {scopeList.map((sc) => (
                      <option key={sc} value={sc} className="bg-[#062A2F] text-white">
                        {sc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#D7E5EC]">Initial Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as AlertRuleStatus)}
                    className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] px-3 py-2 text-xs text-white focus:border-[#0E7C86] focus:outline-none"
                  >
                    <option value="Enabled">Enabled</option>
                    <option value="Draft">Draft</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>
              </div>

              {/* ── 6. RULE CONDITION BUILDER ──────────────────────────── */}
              <div className="rounded border border-[#0E7C86]/60 bg-[#031A1F] p-4 text-xs">
                <div className="flex items-center gap-2 font-bold text-white border-b border-[#145158] pb-2">
                  <Sliders size={14} className="text-[#0E7C86]" />
                  <span>Rule Condition Builder</span>
                </div>

                <div className="mt-3 grid gap-2.5 sm:grid-cols-4">
                  {/* Field */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#9FB8BE]">
                      WHEN [Field]
                    </label>
                    <input
                      type="text"
                      value={condField}
                      onChange={(e) => setCondField(e.target.value)}
                      placeholder="e.g. Delay"
                      className="mt-1 w-full rounded border border-[#145158] bg-[#062A2F] px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  {/* Operator */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#9FB8BE]">
                      [Operator]
                    </label>
                    <select
                      value={condOperator}
                      onChange={(e) => setCondOperator(e.target.value as ConditionOperator)}
                      className="mt-1 w-full rounded border border-[#145158] bg-[#062A2F] px-2.5 py-1.5 text-xs text-white"
                    >
                      {operatorList.map((op) => (
                        <option key={op} value={op} className="bg-[#062A2F] text-white">
                          {op}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Value */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#9FB8BE]">
                      [Threshold Value]
                    </label>
                    <input
                      type="text"
                      value={condValue}
                      onChange={(e) => setCondValue(e.target.value)}
                      placeholder="e.g. 15"
                      className="mt-1 w-full rounded border border-[#145158] bg-[#062A2F] px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#9FB8BE]">
                      [Unit]
                    </label>
                    <input
                      type="text"
                      value={condUnit}
                      onChange={(e) => setCondUnit(e.target.value)}
                      placeholder="e.g. minutes"
                      className="mt-1 w-full rounded border border-[#145158] bg-[#062A2F] px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Then Outcome */}
                <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-[#145158]/50 pt-3 text-[11px]">
                  <span className="font-bold text-[#0E7C86]">THEN:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[#9FB8BE]">Severity:</span>
                    {renderSeverityBadge(formSeverity)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#9FB8BE]">Action:</span>
                    <input
                      type="text"
                      value={condAction}
                      onChange={(e) => setCondAction(e.target.value)}
                      placeholder="Notify Controller"
                      className="rounded border border-[#145158] bg-[#062A2F] px-2 py-0.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* ── Notification & Escalation Settings ─────────────────── */}
              <div className="rounded border border-[#145158] bg-[#031A1F] p-4 text-xs space-y-3">
                <div className="font-bold text-white border-b border-[#145158] pb-2">
                  Notification & Escalation Policy
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] text-[#9FB8BE]">Primary Recipient</label>
                    <select
                      value={formPrimaryRecipient}
                      onChange={(e) => setFormPrimaryRecipient(e.target.value as AlertRecipient)}
                      className="mt-1 w-full rounded border border-[#145158] bg-[#062A2F] px-2.5 py-1.5 text-xs text-white"
                    >
                      {recipientList.map((r) => (
                        <option key={r} value={r} className="bg-[#062A2F] text-white">
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#9FB8BE]">Escalation Recipient</label>
                    <select
                      value={formEscalationRecipient}
                      onChange={(e) => setFormEscalationRecipient(e.target.value as AlertRecipient)}
                      className="mt-1 w-full rounded border border-[#145158] bg-[#062A2F] px-2.5 py-1.5 text-xs text-white"
                    >
                      {recipientList.map((r) => (
                        <option key={r} value={r} className="bg-[#062A2F] text-white">
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#9FB8BE]">Dispatch Channels</label>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {channelList.map((ch) => {
                      const isSelected = formChannels.includes(ch)
                      return (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => handleToggleChannel(ch)}
                          className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold border transition ${
                            isSelected
                              ? "border-[#0E7C86] bg-[#0E7C86]/30 text-white"
                              : "border-[#145158] bg-[#062A2F] text-[#9FB8BE]"
                          }`}
                        >
                          {isSelected && <Check size={12} className="text-emerald-400" />}
                          <span>{ch}</span>
                        </button>
                      )
                    })}
                  </div>
                  {formChannels.includes("SMS") && (
                    <p className="mt-1.5 text-[10px] text-amber-300">
                      * SMS notifications require a configured notification provider on the server.
                    </p>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] text-[#9FB8BE]">
                      Escalation Delay (Minutes)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={formEscalationDelay}
                      onChange={(e) => setFormEscalationDelay(Number(e.target.value))}
                      className="mt-1 w-full rounded border border-[#145158] bg-[#062A2F] px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#9FB8BE]">
                      Repeat Interval (Minutes)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={120}
                      value={formRepeatInterval}
                      onChange={(e) => setFormRepeatInterval(Number(e.target.value))}
                      className="mt-1 w-full rounded border border-[#145158] bg-[#062A2F] px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* ── Suppression Policy Settings ────────────────────────── */}
              <div className="rounded border border-[#145158] bg-[#031A1F] p-4 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#145158] pb-2">
                  <span className="font-bold text-white">Alert Suppression</span>
                  <button
                    type="button"
                    onClick={() => setFormSuppressionEnabled(!formSuppressionEnabled)}
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      formSuppressionEnabled
                        ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40"
                        : "bg-slate-900 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {formSuppressionEnabled ? "Enabled" : "Disabled"}
                  </button>
                </div>

                {formSuppressionEnabled && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-[10px] text-[#718F96]">
                        Suppression Window (m)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={formSuppressionWindow}
                        onChange={(e) => setFormSuppressionWindow(Number(e.target.value))}
                        className="mt-1 w-full rounded border border-[#145158] bg-[#062A2F] px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#718F96]">
                        Max Notifications
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={formMaxRepeated}
                        onChange={(e) => setFormMaxRepeated(Number(e.target.value))}
                        className="mt-1 w-full rounded border border-[#145158] bg-[#062A2F] px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#718F96]">
                        Auto Acknowledge (m)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formAutoAck}
                        onChange={(e) => setFormAutoAck(Number(e.target.value))}
                        className="mt-1 w-full rounded border border-[#145158] bg-[#062A2F] px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="controller-header flex items-center justify-end gap-2.5 border-t border-[#145158] px-5 py-3">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded border border-[#145158] bg-transparent px-3 py-1.5 text-xs text-[#D7E5EC] hover:bg-[#08383D]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModalForm}
                className="flex items-center gap-1.5 rounded bg-[#0E7C86] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0E5961]"
              >
                <Save size={13} />
                <span>{editingRule ? "Update Rule" : "Create Rule"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 10. RULE DETAIL DRAWER / MODAL ─────────────────────────── */}
      {detailRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="controller-panel relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-lg border border-[#145158] shadow-2xl">
            {/* Drawer Header */}
            <div className="controller-header flex items-center justify-between px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{detailRule.name}</h3>
                  {renderStatusBadge(detailRule.status)}
                </div>
                <p className="text-xs text-[#D7E5EC]/70">
                  Category: {detailRule.category} • Scope: {detailRule.scope}
                </p>
              </div>

              <button
                onClick={() => setDetailRule(null)}
                className="rounded p-1 text-[#9FB8BE] hover:bg-[#08383D] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="rounded border border-[#145158] bg-[#031A1F] p-3 text-[#D7E5EC]">
                <div className="text-[10px] text-[#718F96]">Description</div>
                <p className="mt-1 leading-relaxed text-[#D7E5EC]/90">
                  {detailRule.description}
                </p>
              </div>

              <div className="rounded border border-[#0E7C86]/50 bg-[#031A1F] p-3">
                <div className="text-[10px] text-[#0E7C86] font-bold uppercase">Condition Trigger</div>
                <div className="mt-1 font-mono text-sm font-bold text-white">
                  WHEN {detailRule.condition.field} {detailRule.condition.operator.toLowerCase()}{" "}
                  <span className="text-amber-300">
                    {detailRule.condition.value} {detailRule.condition.unit}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-[#9FB8BE]">
                  Severity Assigned: {detailRule.severity}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded border border-[#145158] bg-[#031A1F] p-3">
                  <div className="text-[10px] text-[#718F96]">Primary Recipient</div>
                  <div className="mt-1 font-semibold text-white">
                    {detailRule.notificationPolicy.primaryRecipient}
                  </div>
                </div>

                <div className="rounded border border-[#145158] bg-[#031A1F] p-3">
                  <div className="text-[10px] text-[#718F96]">Escalation Recipient</div>
                  <div className="mt-1 font-semibold text-white">
                    {detailRule.notificationPolicy.escalationRecipient}
                  </div>
                </div>

                <div className="rounded border border-[#145158] bg-[#031A1F] p-3">
                  <div className="text-[10px] text-[#718F96]">Enabled Channels</div>
                  <div className="mt-1 text-[#D7E5EC]">
                    {detailRule.notificationPolicy.channels.join(", ")}
                  </div>
                </div>

                <div className="rounded border border-[#145158] bg-[#031A1F] p-3">
                  <div className="text-[10px] text-[#718F96]">Escalation Timeout</div>
                  <div className="mt-1 font-mono text-white">
                    {detailRule.notificationPolicy.escalationDelayMinutes} mins delay
                  </div>
                </div>

                <div className="rounded border border-[#145158] bg-[#031A1F] p-3">
                  <div className="text-[10px] text-[#718F96]">Created By</div>
                  <div className="mt-1 text-[#D7E5EC]">{detailRule.createdBy}</div>
                </div>

                <div className="rounded border border-[#145158] bg-[#031A1F] p-3">
                  <div className="text-[10px] text-[#718F96]">Last Triggered</div>
                  <div className="mt-1 font-mono text-amber-300">
                    {detailRule.lastTriggered}
                  </div>
                </div>
              </div>

              <div className="rounded border border-[#145158] bg-[#031A1F] p-3">
                <div className="text-[10px] text-[#718F96]">Suppression Policy</div>
                <div className="mt-1 text-[11px] text-[#9FB8BE]">
                  {detailRule.suppressionPolicy.enabled
                    ? `Active suppression window of ${detailRule.suppressionPolicy.suppressionWindowMinutes}m (Max: ${detailRule.suppressionPolicy.maxRepeatedNotifications} repeated alerts)`
                    : "Suppression disabled. All discrete event breaches trigger alerts."}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="controller-header flex items-center justify-between border-t border-[#145158] px-5 py-3">
              <button
                onClick={() => {
                  const toEdit = detailRule
                  setDetailRule(null)
                  handleOpenEditModal(toEdit)
                }}
                className="flex items-center gap-1.5 rounded border border-[#145158] bg-[#031A1F] px-3 py-1.5 text-xs text-[#0E7C86] hover:text-[#F59E0B]"
              >
                <Edit2 size={13} />
                <span>Edit Configuration</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDetailRule(null)}
                  className="rounded border border-[#145158] bg-transparent px-3 py-1.5 text-xs text-[#D7E5EC] hover:bg-[#08383D]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ─────────────────────────────── */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="controller-panel w-full max-w-md rounded-lg border border-rose-500/50 p-5 shadow-2xl">
            <div className="flex items-center gap-2.5 text-rose-400">
              <ShieldAlert size={20} />
              <h3 className="text-sm font-bold text-white">Confirm Rule Deletion</h3>
            </div>
            <p className="mt-2 text-xs text-[#D7E5EC]/80 leading-relaxed">
              Are you sure you want to permanently delete the rule{" "}
              <span className="font-bold text-white">"{deleteCandidate.name}"</span>?
              Controllers will no longer be notified for events matching this condition.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="rounded border border-[#145158] bg-[#031A1F] px-3 py-1.5 text-xs text-[#D7E5EC] hover:bg-[#08383D]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Delete Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

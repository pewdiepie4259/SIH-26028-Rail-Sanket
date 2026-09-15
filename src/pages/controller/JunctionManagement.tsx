import { useMemo, useState, useEffect } from "react"
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Gauge,
  GitBranch,
  MapPin,
  Radio,
  RefreshCw,
  Search,
  ShieldAlert,
  TrainFront,
  X,
  Zap,
} from "lucide-react"
import { Link } from "react-router-dom"
import { useLiveTelemetry } from "../../hooks/useLiveTelemetry"

interface ActionLogItem {
  id: string
  time: string
  action: string
  trainNumber?: string
  junction?: string
  status: "EXECUTED" | "ACKNOWLEDGED"
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    NORMAL:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    ATTENTION:
      "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]",
    CONGESTED:
      "border-red-500/40 bg-red-500/10 text-red-400",
    BUSY:
      "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]",
    HIGH:
      "border-red-500/40 bg-red-500/10 text-red-400",
    CRITICAL:
      "border-red-500/40 bg-red-500/10 text-red-400",
    MEDIUM:
      "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]",
    MODERATE:
      "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]",
    UNRESOLVED:
      "border-red-500/40 bg-red-500/10 text-red-400",
    MONITORING:
      "border-blue-400/40 bg-blue-400/10 text-blue-300",
    RESOLVED:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  }

  return (
    <span
      className={`rounded-md border px-2 py-1 text-[9px] font-bold uppercase tracking-wide transition-colors ${
        styles[status] ??
        "border-[#145158] bg-[#08383D] text-[#D7E5EC]"
      }`}
    >
      {status}
    </span>
  )
}

function SignalBadge({ signal }: { signal: string }) {
  const styles: Record<string, { text: string; dot: string; pulse: string }> = {
    GREEN: {
      text: "text-emerald-400",
      dot: "bg-emerald-400",
      pulse: "bg-emerald-400/30",
    },
    YELLOW: {
      text: "text-[#F59E0B]",
      dot: "bg-[#F59E0B]",
      pulse: "bg-[#F59E0B]/30",
    },
    DOUBLE_YELLOW: {
      text: "text-amber-400",
      dot: "bg-amber-400",
      pulse: "bg-amber-400/30",
    },
    RED: {
      text: "text-red-400",
      dot: "bg-red-400",
      pulse: "bg-red-400/30",
    },
  }

  const s = styles[signal] || styles.YELLOW

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative flex h-2.5 w-2.5 items-center justify-center">
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${s.pulse} opacity-75`} />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${s.dot}`} />
      </div>
      <span className={`text-[10px] font-bold tracking-tight ${s.text}`}>
        {signal.replace("_", " ")}
      </span>
    </div>
  )
}

function JunctionManagement() {
  const { trains, junctions: telemetryJunctions, conflicts: telemetryConflicts, isConnected } = useLiveTelemetry()

  // Real-time states & overrides
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)
  const [heldTrains, setHeldTrains] = useState<Set<string>>(new Set())
  const [priorityOverrides, setPriorityOverrides] = useState<Record<string, "HIGH" | "NORMAL">>({})
  const [signalOverrides, setSignalOverrides] = useState<Record<string, "GREEN" | "YELLOW" | "RED">>({})
  const [resolvedConflicts, setResolvedConflicts] = useState<Set<string>>(new Set())
  const [selectedJunctionFilter, setSelectedJunctionFilter] = useState<string>("ALL")
  const [searchFilter, setSearchFilter] = useState<string>("")
  const [isResyncing, setIsResyncing] = useState<boolean>(false)
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("")
  const [actionModal, setActionModal] = useState<{
    type: "HOLD" | "RELEASE" | "PRIORITY" | "SIGNAL" | "REVIEW"
    trainNumber?: string
    conflictId?: string
  } | null>(null)

  // Action Audit Trail
  const [actionLogs, setActionLogs] = useState<ActionLogItem[]>([
    {
      id: "LOG-901",
      time: "15:02:14 IST",
      action: "Auto-precedence evaluated for Block SBC-BYPL",
      status: "EXECUTED",
    },
    {
      id: "LOG-902",
      time: "15:06:40 IST",
      action: "Junction interlocking cleared for WFD platform loop",
      status: "EXECUTED",
    },
  ])

  // Live clock tick for controller desk
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTimeStr(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "Asia/Kolkata",
        }) + " IST"
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // Manual resync pulse
  function handleResync() {
    setIsResyncing(true)
    setTimeout(() => {
      setIsResyncing(false)
      triggerFeedback("Telemetry feeds resynchronized successfully.")
    }, 600)
  }

  function triggerFeedback(msg: string) {
    setActionFeedback(msg)
    setTimeout(() => setActionFeedback(null), 4500)
  }

  function logAction(action: string, trainNumber?: string, junction?: string) {
    const time = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    }) + " IST"

    const newLog: ActionLogItem = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      time,
      action,
      trainNumber,
      junction,
      status: "EXECUTED",
    }

    setActionLogs((prev) => [newLog, ...prev.slice(0, 5)])
  }

  // Action Handlers
  function handleHoldTrain(trainNumber: string) {
    setHeldTrains((prev) => {
      const next = new Set(prev)
      next.add(trainNumber)
      return next
    })
    setSignalOverrides((prev) => ({ ...prev, [trainNumber]: "RED" }))
    const msg = `Train ${trainNumber} placed on precedence HOLD. Home signal set to RED.`
    triggerFeedback(msg)
    logAction(`Hold command issued for Train ${trainNumber}`, trainNumber)
    setActionModal(null)
  }

  function handleReleaseTrain(trainNumber: string) {
    setHeldTrains((prev) => {
      const next = new Set(prev)
      next.delete(trainNumber)
      return next
    })
    setSignalOverrides((prev) => ({ ...prev, [trainNumber]: "GREEN" }))
    const msg = `Train ${trainNumber} released. Signal aspect restored to GREEN.`
    triggerFeedback(msg)
    logAction(`Release directive executed for Train ${trainNumber}`, trainNumber)
    setActionModal(null)
  }

  function handleTogglePriority(trainNumber: string, currentPriority: "HIGH" | "NORMAL") {
    const newPriority = currentPriority === "HIGH" ? "NORMAL" : "HIGH"
    setPriorityOverrides((prev) => ({ ...prev, [trainNumber]: newPriority }))
    const msg = `Train ${trainNumber} priority changed to ${newPriority}.`
    triggerFeedback(msg)
    logAction(`Priority adjusted to ${newPriority} for Train ${trainNumber}`, trainNumber)
    setActionModal(null)
  }

  function handleResolveConflict(conflictId: string, recommendation: string) {
    setResolvedConflicts((prev) => {
      const next = new Set(prev)
      next.add(conflictId)
      return next
    })
    const msg = `Conflict ${conflictId} resolved: ${recommendation}`
    triggerFeedback(msg)
    logAction(`Conflict ${conflictId} resolved via recommended directive`, undefined, conflictId)
  }

  // Active live train list converted from telemetry record
  const liveTrainList = useMemo(() => {
    return Object.values(trains)
  }, [trains])

  // Derive dynamic junction data
  const monitoredJunctionCodes = ["BYPL", "SBC", "WFD", "KJM"]

  const dynamicJunctions = useMemo(() => {
    const junctionMeta: Record<
      string,
      { name: string; code: string; defaultRoutes: number }
    > = {
      BYPL: { name: "Baiyappanahalli Junction", code: "BYPL", defaultRoutes: 4 },
      SBC: { name: "KSR Bengaluru Junction", code: "SBC", defaultRoutes: 6 },
      WFD: { name: "Whitefield Junction", code: "WFD", defaultRoutes: 3 },
      KJM: { name: "Krishnarajapuram Junction", code: "KJM", defaultRoutes: 4 },
    }

    return monitoredJunctionCodes.map((code) => {
      const telemetry = telemetryJunctions.find((j) => j.code === code)
      const meta = junctionMeta[code] || { name: `${code} Junction`, code, defaultRoutes: 3 }
      const totalRoutes = telemetry?.activeRoutes || meta.defaultRoutes
      const load = telemetry?.load ?? 65

      // Calculate occupancy dynamically from load and total routes
      const occupied = Math.max(1, Math.min(totalRoutes, Math.round((load / 100) * totalRoutes)))

      // Count active conflicts affecting this junction
      const junctionConflicts = telemetryConflicts.filter(
        (c) =>
          !resolvedConflicts.has(c.id) &&
          (c.location.toLowerCase().includes(meta.name.toLowerCase()) ||
            c.location.toLowerCase().includes(code.toLowerCase()))
      ).length

      // Dynamic status: Attention if conflicts or high load
      let status: "NORMAL" | "ATTENTION" | "CONGESTED" = "NORMAL"
      if (junctionConflicts > 0 || load >= 85) {
        status = "ATTENTION"
      } else if (load >= 70) {
        status = "ATTENTION"
      }

      return {
        name: meta.name,
        code,
        routes: totalRoutes,
        occupied,
        load,
        conflicts: junctionConflicts,
        status,
        approaching: telemetry?.approaching ?? 2,
      }
    })
  }, [telemetryJunctions, telemetryConflicts, resolvedConflicts])

  // Dynamic incoming movements mapped from live trains
  const incomingMovements = useMemo(() => {
    return liveTrainList.map((train) => {
      const isHeld = heldTrains.has(train.trainNumber)
      const overriddenPriority = priorityOverrides[train.trainNumber]
      const overriddenSignal = signalOverrides[train.trainNumber]

      const priorityStr: "HIGH" | "NORMAL" =
        overriddenPriority ?? (train.priority === 1 ? "HIGH" : "NORMAL")

      const signalStr = isHeld
        ? "RED"
        : overriddenSignal ?? (train.telemetry?.signal || "GREEN")

      const speed = isHeld ? 0 : train.telemetry?.speed_kmh ?? 62.5
      const forecast = train.forecasts?.[0]
      const nextStation = forecast?.station || "BYPL"
      const delayMin = forecast?.predicted_delay_min ?? 0

      // Infer route corridor string
      const block = train.currentBlock || "BYPL-WFD Block"
      let routeCorridor = "BYPL → WFD"
      if (block.includes("SBC")) {
        routeCorridor = "SBC → BYPL"
      } else if (block.includes("WFD")) {
        routeCorridor = "WFD → SBC"
      } else if (block.includes("KJM")) {
        routeCorridor = "BYPL → KJM"
      }

      // Infer direction
      const direction =
        routeCorridor.startsWith("SBC") || routeCorridor.includes("BYPL → WFD")
          ? "Eastbound"
          : "Westbound"

      const etaTime =
        forecast?.dynamic_gnn_eta ||
        new Date(Date.now() + 18 * 60000).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })

      return {
        train: train.trainNumber,
        name: train.name,
        direction,
        route: routeCorridor,
        nextStation,
        eta: etaTime,
        delayMin,
        speed,
        priority: priorityStr,
        signal: signalStr,
        isHeld,
      }
    })
  }, [liveTrainList, heldTrains, priorityOverrides, signalOverrides])

  // Filtered movements
  const filteredMovements = useMemo(() => {
    return incomingMovements.filter((m) => {
      const matchesJunction =
        selectedJunctionFilter === "ALL" ||
        m.route.includes(selectedJunctionFilter) ||
        m.nextStation === selectedJunctionFilter

      const matchesSearch =
        searchFilter.trim() === "" ||
        m.train.toLowerCase().includes(searchFilter.toLowerCase()) ||
        m.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        m.route.toLowerCase().includes(searchFilter.toLowerCase())

      return matchesJunction && matchesSearch
    })
  }, [incomingMovements, selectedJunctionFilter, searchFilter])

  // Active conflicts filtered for unresolved
  const activeConflicts = useMemo(() => {
    return telemetryConflicts.map((c) => {
      const isResolved = resolvedConflicts.has(c.id)
      return {
        ...c,
        status: isResolved ? "RESOLVED" : "UNRESOLVED",
      }
    })
  }, [telemetryConflicts, resolvedConflicts])

  // Computed summary metrics
  const totalMonitoredJunctions = dynamicJunctions.length
  const unresolvedConflictsCount = activeConflicts.filter(
    (c) => c.status === "UNRESOLVED"
  ).length
  const trainsInConflictZone = incomingMovements.length
  const totalNetworkRoutes = dynamicJunctions.reduce((acc, j) => acc + j.routes, 0)
  const totalOccupiedRoutes = dynamicJunctions.reduce((acc, j) => acc + j.occupied, 0)
  const routeAvailabilityPct = Math.max(
    35,
    Math.min(95, Math.round(((totalNetworkRoutes - totalOccupiedRoutes) / totalNetworkRoutes) * 100))
  )

  return (
    <div className="controller-page min-h-full px-4 py-5 lg:px-6">
      {/* Header with Live Telemetry Pulse */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#F59E0B]">
              Route & Movement Control
            </span>
            <span className="text-[#145158]">/</span>
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE TELEMETRY
            </span>
          </div>

          <h1 className="mt-1 text-2xl font-bold text-white">
            Junction & Conflict Management
          </h1>

          <p className="mt-1 text-sm text-[#9FB8BE]">
            Real-time junction route occupancy, movement headway telemetry and AI predicted conflicts.
          </p>
        </div>

        {/* Live Controller Clock & Status Strip */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="controller-panel flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold">
            <Radio
              size={15}
              strokeWidth={2.2}
              className={isConnected ? "text-emerald-400 animate-pulse" : "text-[#0E7C86]"}
            />
            <span className="text-[#D7E5EC]">
              {isConnected ? "WS Telemetry Connected" : "Autonomous Simulator (1.8s)"}
            </span>
          </div>

          <div className="controller-panel flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-mono font-semibold text-white">
            <Clock3 size={14} className="text-[#F59E0B]" />
            <span>{currentTimeStr || "Live IST"}</span>
          </div>

          <button
            onClick={handleResync}
            disabled={isResyncing}
            title="Resynchronize Telemetry Stream"
            className="controller-panel flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-[#D7E5EC] hover:text-[#F59E0B] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={isResyncing ? "animate-spin text-[#F59E0B]" : ""} />
            <span>Resync</span>
          </button>
        </div>
      </div>

      {/* Action feedback toast */}
      {actionFeedback && (
        <div className="mb-5 flex items-center justify-between gap-2 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-4 py-3 text-xs font-semibold text-emerald-300 shadow-lg backdrop-blur animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-emerald-400/70 hover:text-emerald-300"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Active Junctions */}
        <div className="controller-panel rounded-lg p-4 transition hover:border-[#0E7C86]/60">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9FB8BE]">Active Junctions</span>
            <GitBranch size={17} className="text-[#F59E0B]" />
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{totalMonitoredJunctions}</span>
            <span className="text-[10px] font-semibold text-emerald-400">● 100% Online</span>
          </div>

          <div className="mt-1 text-[11px] text-[#9FB8BE]">
            Monitored Bengaluru corridor
          </div>
        </div>

        {/* Active Conflicts */}
        <div className="controller-panel rounded-lg p-4 transition hover:border-red-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9FB8BE]">Active Conflicts</span>
            <ShieldAlert
              size={17}
              className={unresolvedConflictsCount > 0 ? "text-red-400 animate-bounce" : "text-emerald-400"}
            />
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${unresolvedConflictsCount > 0 ? "text-red-400" : "text-emerald-400"}`}>
              {unresolvedConflictsCount}
            </span>
            {unresolvedConflictsCount > 0 && (
              <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-red-400 border border-red-500/20">
                Action Req
              </span>
            )}
          </div>

          <div className="mt-1 text-[11px] text-[#9FB8BE]">
            Requiring controller attention
          </div>
        </div>

        {/* Trains in Monitored Zone */}
        <div className="controller-panel rounded-lg p-4 transition hover:border-[#F59E0B]/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9FB8BE]">Trains in Monitored Sector</span>
            <TrainFront size={17} className="text-[#F59E0B]" />
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{trainsInConflictZone}</span>
            <span className="text-[10px] font-semibold text-[#F59E0B]">
              {heldTrains.size > 0 ? `${heldTrains.size} Held` : "Active in blocks"}
            </span>
          </div>

          <div className="mt-1 text-[11px] text-[#9FB8BE]">
            Approaching or occupying junctions
          </div>
        </div>

        {/* Route Availability */}
        <div className="controller-panel rounded-lg p-4 transition hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9FB8BE]">Route Availability</span>
            <CheckCircle2 size={17} className="text-emerald-400" />
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{routeAvailabilityPct}%</span>
            <span className="text-[10px] text-[#718F96]">
              {totalNetworkRoutes - totalOccupiedRoutes}/{totalNetworkRoutes} free
            </span>
          </div>

          <div className="mt-1 text-[11px] text-[#9FB8BE]">
            Network route capacity
          </div>
        </div>
      </div>

      {/* Junction Overview */}
      <section className="controller-panel overflow-hidden rounded-lg">
        <div className="controller-header px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GitBranch size={16} className="text-[#F59E0B]" />
            <div>
              <h2 className="text-sm font-bold text-white">Junction Overview</h2>
              <p className="mt-0.5 text-[11px] text-[#D7E5EC]/70">
                Current route occupancy, load pressure and conflict status (click a junction to filter trains)
              </p>
            </div>
          </div>

          {selectedJunctionFilter !== "ALL" && (
            <button
              onClick={() => setSelectedJunctionFilter("ALL")}
              className="flex items-center gap-1 rounded border border-[#145158] bg-[#08383D] px-2.5 py-1 text-[10px] font-bold text-[#F59E0B] hover:bg-[#145158]"
            >
              Filtered by: {selectedJunctionFilter}
              <X size={12} />
            </button>
          )}
        </div>

        <div className="grid gap-px bg-[#145158] sm:grid-cols-2 xl:grid-cols-4">
          {dynamicJunctions.map((junction) => {
            const isSelected = selectedJunctionFilter === junction.code
            return (
              <div
                key={junction.code}
                onClick={() =>
                  setSelectedJunctionFilter(isSelected ? "ALL" : junction.code)
                }
                className={`cursor-pointer p-4 transition-all ${
                  isSelected
                    ? "bg-[#0A3D44] ring-1 ring-inset ring-[#F59E0B]"
                    : "bg-[#062A2F] hover:bg-[#08343A]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      {junction.name}
                      {isSelected && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[#9FB8BE]">
                      <MapPin size={11} className="text-[#0E7C86]" />
                      <span className="font-mono font-bold text-white">{junction.code}</span>
                      <span>·</span>
                      <span>{junction.approaching} approaching</span>
                    </div>
                  </div>

                  <StatusBadge status={junction.status} />
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  <div>
                    <div className="text-[9px] uppercase text-[#718F96]">Routes</div>
                    <div className="mt-1 text-sm font-bold text-white">{junction.routes}</div>
                  </div>

                  <div>
                    <div className="text-[9px] uppercase text-[#718F96]">Occupied</div>
                    <div className="mt-1 text-sm font-bold text-white">{junction.occupied}</div>
                  </div>

                  <div>
                    <div className="text-[9px] uppercase text-[#718F96]">Conflicts</div>
                    <div
                      className={`mt-1 text-sm font-bold ${
                        junction.conflicts > 0 ? "text-red-400" : "text-emerald-400"
                      }`}
                    >
                      {junction.conflicts}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-[10px]">
                    <span className="text-[#718F96]">Occupancy Load</span>
                    <span className="font-bold text-[#D7E5EC]">{junction.load}%</span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-[#031A1F]">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        junction.load >= 80
                          ? "bg-red-500"
                          : junction.load >= 65
                          ? "bg-[#F59E0B]"
                          : "bg-[#0E7C86]"
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(10, junction.load))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Incoming movements */}
      <section className="controller-panel mt-5 overflow-hidden rounded-lg">
        <div className="controller-header px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-[#F59E0B]" />
            <div>
              <h2 className="text-sm font-bold text-white">Incoming Movements</h2>
              <p className="mt-0.5 text-[11px] text-[#D7E5EC]/70">
                Trains approaching monitored junctions · Auto-updating telemetry
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#718F96]" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search train or route..."
                className="rounded border border-[#145158] bg-[#062A2F] py-1 pl-8 pr-3 text-xs text-white placeholder-[#718F96] focus:border-[#F59E0B] focus:outline-none"
              />
            </div>

            <select
              value={selectedJunctionFilter}
              onChange={(e) => setSelectedJunctionFilter(e.target.value)}
              className="rounded border border-[#145158] bg-[#062A2F] px-2.5 py-1 text-xs font-semibold text-[#D7E5EC] focus:border-[#F59E0B] focus:outline-none"
            >
              <option value="ALL">All Junctions</option>
              <option value="BYPL">BYPL (Baiyappanahalli)</option>
              <option value="SBC">SBC (KSR Bengaluru)</option>
              <option value="WFD">WFD (Whitefield)</option>
              <option value="KJM">KJM (Krishnarajapuram)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="border-b border-[#145158] bg-[#08383D]">
              <tr className="text-left text-[9px] uppercase tracking-wide text-[#9FB8BE]">
                <th className="px-4 py-3">Train</th>
                <th className="px-4 py-3">Speed</th>
                <th className="px-4 py-3">Direction</th>
                <th className="px-4 py-3">Route Corridor</th>
                <th className="px-4 py-3">ETA (GNN)</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Signal</th>
                <th className="px-4 py-3 text-right">Controller Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-xs text-[#9FB8BE]">
                    No train movements match the selected junction or query.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((movement) => (
                  <tr
                    key={movement.train}
                    className={`border-b border-[#145158] last:border-0 transition-colors ${
                      movement.isHeld
                        ? "bg-red-950/20 hover:bg-red-950/30"
                        : "hover:bg-[#08383D]/50"
                    }`}
                  >
                    {/* Train */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/controller/trains/${movement.train}`}
                          className="font-mono text-xs font-bold text-white hover:text-[#F59E0B] transition-colors"
                        >
                          {movement.train}
                        </Link>
                        {movement.isHeld && (
                          <span className="rounded bg-red-500/20 px-1 py-0.2 text-[8px] font-bold text-red-400 border border-red-500/30">
                            HELD
                          </span>
                        )}
                      </div>

                      <div className="mt-0.5 text-[10px] text-[#9FB8BE]">
                        {movement.name}
                      </div>
                    </td>

                    {/* Speed */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#D7E5EC]">
                        <Gauge size={12} className={movement.speed > 0 ? "text-[#0E7C86]" : "text-red-400"} />
                        <span>{movement.speed.toFixed(1)} km/h</span>
                      </div>
                    </td>

                    {/* Direction */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#D7E5EC]">
                        {movement.direction === "Eastbound" ? (
                          <ArrowRight size={13} className="text-emerald-400" />
                        ) : (
                          <ArrowDown size={13} className="text-[#0E7C86]" />
                        )}
                        <span>{movement.direction}</span>
                      </div>
                    </td>

                    {/* Route */}
                    <td className="px-4 py-3 text-[10px] font-semibold text-[#D7E5EC]">
                      {movement.route}
                    </td>

                    {/* ETA */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1 text-[11px] font-bold font-mono text-white">
                          <Clock3 size={12} className="text-[#F59E0B]" />
                          <span>{movement.eta}</span>
                        </div>
                        {movement.delayMin > 0 && (
                          <span className="text-[9px] font-bold text-[#F59E0B]">
                            (+{Math.round(movement.delayMin)}m)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          handleTogglePriority(movement.train, movement.priority)
                        }
                        title="Click to toggle priority"
                        className={`rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider transition ${
                          movement.priority === "HIGH"
                            ? "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/20"
                            : "border-[#145158] bg-[#08383D] text-[#9FB8BE] hover:text-white"
                        }`}
                      >
                        {movement.priority}
                      </button>
                    </td>

                    {/* Signal */}
                    <td className="px-4 py-3">
                      <SignalBadge signal={movement.signal} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      {movement.isHeld ? (
                        <button
                          onClick={() => handleReleaseTrain(movement.train)}
                          className="rounded border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-400 hover:bg-emerald-500/20 transition"
                        >
                          Release Hold
                        </button>
                      ) : (
                        <button
                          onClick={() => handleHoldTrain(movement.train)}
                          className="rounded border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-red-400 hover:bg-red-500/20 transition"
                        >
                          Hold Train
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Predicted Route Conflicts */}
      <section className="controller-panel mt-5 overflow-hidden rounded-lg">
        <div className="controller-header px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-[#F59E0B]" />
            <div>
              <h2 className="text-sm font-bold text-white">Predicted Route Conflicts</h2>
              <p className="mt-0.5 text-[11px] text-[#D7E5EC]/70">
                Live countdown timers & AI resolution directives for detected track convergences
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[10px] font-bold text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
            <span>{unresolvedConflictsCount} ACTIVE</span>
          </div>
        </div>

        <div className="divide-y divide-[#145158]">
          {activeConflicts.map((conflict) => {
            const isResolved = conflict.status === "RESOLVED"
            return (
              <div
                key={conflict.id}
                className={`p-4 transition-colors ${
                  isResolved ? "bg-emerald-950/10 opacity-75" : "hover:bg-[#08383D]/30"
                }`}
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${
                        isResolved
                          ? "border-emerald-500/30 bg-emerald-500/10"
                          : conflict.severity === "Critical"
                          ? "border-red-500/30 bg-red-500/10"
                          : "border-[#F59E0B]/30 bg-[#F59E0B]/10"
                      }`}
                    >
                      {isResolved ? (
                        <CheckCircle2 size={17} className="text-emerald-400" />
                      ) : (
                        <ShieldAlert
                          size={17}
                          className={conflict.severity === "Critical" ? "text-red-400" : "text-[#F59E0B]"}
                        />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">
                          {conflict.id}
                        </span>

                        <StatusBadge status={conflict.severity.toUpperCase()} />
                        <StatusBadge status={conflict.status} />

                        {!isResolved && (
                          <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-[#F59E0B]">
                            <Clock3 size={12} className="animate-spin-slow" />
                            <span>T-minus {conflict.timeToConflict}</span>
                          </span>
                        )}
                      </div>

                      <div className="mt-1 text-[11px] text-[#9FB8BE]">
                        {conflict.location}
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#D7E5EC]">
                        <TrainFront size={14} className="text-[#F59E0B]" />
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/controller/trains/${conflict.trainA}`}
                            className="font-bold text-white hover:text-[#F59E0B] transition-colors"
                          >
                            {conflict.trainA}
                          </Link>
                          <span className="mx-1 text-[#718F96]">↔</span>
                          <Link
                            to={`/controller/trains/${conflict.trainB}`}
                            className="font-bold text-white hover:text-[#F59E0B] transition-colors"
                          >
                            {conflict.trainB}
                          </Link>
                        </div>
                      </div>

                      {/* AI Recommendation banner */}
                      <div className="mt-2 text-[11px] text-[#D7E5EC] flex items-center gap-1.5 bg-[#08383D] border border-[#145158] rounded px-2.5 py-1">
                        <Zap size={12} className="text-[#F59E0B] shrink-0" />
                        <span>
                          <strong className="text-white">AI Advisory:</strong> {conflict.recommendation}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:w-[420px]">
                    <div>
                      <div className="text-[9px] uppercase text-[#718F96]">Time to Event</div>
                      <div className="mt-1 font-mono text-xs font-bold text-white">
                        {conflict.timeToConflict}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] uppercase text-[#718F96]">Delay Impact</div>
                      <div className="mt-1 font-mono text-xs font-bold text-[#F59E0B]">
                        {conflict.impact}
                      </div>
                    </div>

                    <div className="col-span-2 sm:col-span-1 flex items-center">
                      {isResolved ? (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                          <CheckCircle2 size={13} />
                          RESOLVED
                        </div>
                      ) : (
                        <button
                          onClick={() => handleResolveConflict(conflict.id, conflict.recommendation)}
                          className="w-full flex items-center justify-center gap-1.5 rounded-md border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-3 py-2 text-[10px] font-bold uppercase text-white transition-transform hover:scale-[1.02]"
                        >
                          Resolve Now
                          <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Controller Actions & Dispatch History */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {/* Quick Action Commands */}
        <section className="controller-panel rounded-lg p-5 lg:col-span-2">
          <div className="flex items-center gap-2">
            <ShieldAlert size={17} className="text-[#F59E0B]" />
            <div>
              <h2 className="text-sm font-bold text-white">Controller Operational Actions</h2>
              <p className="text-[11px] text-[#9FB8BE]">
                Direct junction interlocking and headway controls
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => setActionModal({ type: "HOLD" })}
              className="controller-button rounded-md px-4 py-3 text-xs font-bold"
            >
              Hold Train
            </button>

            <button
              onClick={() => setActionModal({ type: "RELEASE" })}
              className="controller-button rounded-md px-4 py-3 text-xs font-bold"
            >
              Release Train
            </button>

            <button
              onClick={() => setActionModal({ type: "PRIORITY" })}
              className="controller-button rounded-md px-4 py-3 text-xs font-bold"
            >
              Change Priority
            </button>

            <button
              onClick={() => setActionModal({ type: "SIGNAL" })}
              className="controller-button rounded-md px-4 py-3 text-xs font-bold"
            >
              Signal Override
            </button>
          </div>
        </section>

        {/* Live Controller Audit Trail */}
        <section className="controller-panel rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wide text-white">
              Live Dispatch Log
            </div>
            <span className="text-[9px] font-mono text-[#718F96]">IST RECORD</span>
          </div>

          <div className="mt-3 divide-y divide-[#145158] text-[11px]">
            {actionLogs.map((log) => (
              <div key={log.id} className="py-2 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between text-[10px] text-[#718F96]">
                  <span>{log.time}</span>
                  <span className="font-mono text-emerald-400">● {log.status}</span>
                </div>
                <div className="mt-0.5 text-xs text-[#D7E5EC]">
                  {log.action}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="controller-panel w-full max-w-md rounded-xl border border-[#145158] p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Zap size={16} className="text-[#F59E0B]" />
                <span>
                  {actionModal.type === "HOLD" && "Select Train to Hold"}
                  {actionModal.type === "RELEASE" && "Select Train to Release"}
                  {actionModal.type === "PRIORITY" && "Adjust Train Priority Tier"}
                  {actionModal.type === "SIGNAL" && "Manual Signal Override"}
                </span>
              </div>
              <button
                onClick={() => setActionModal(null)}
                className="text-[#9FB8BE] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <p className="mt-1 text-xs text-[#9FB8BE]">
              Select from currently active monitored trains in the corridor:
            </p>

            <div className="mt-4 max-h-60 overflow-y-auto space-y-2 pr-1">
              {incomingMovements.map((train) => (
                <div
                  key={train.train}
                  className="flex items-center justify-between rounded border border-[#145158] bg-[#062A2F] p-2.5 text-xs text-white"
                >
                  <div>
                    <span className="font-mono font-bold text-[#F59E0B]">
                      {train.train}
                    </span>
                    <span className="ml-2 text-[11px] text-[#9FB8BE]">{train.name}</span>
                    <div className="text-[10px] text-[#718F96]">
                      {train.route} · Signal: {train.signal}
                    </div>
                  </div>

                  <div>
                    {actionModal.type === "HOLD" && (
                      <button
                        onClick={() => handleHoldTrain(train.train)}
                        disabled={train.isHeld}
                        className="rounded border border-red-500/40 bg-red-500/20 px-2.5 py-1 text-[10px] font-bold text-red-300 hover:bg-red-500/30 disabled:opacity-40"
                      >
                        {train.isHeld ? "Already Held" : "Hold"}
                      </button>
                    )}

                    {actionModal.type === "RELEASE" && (
                      <button
                        onClick={() => handleReleaseTrain(train.train)}
                        disabled={!train.isHeld}
                        className="rounded border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-40"
                      >
                        {train.isHeld ? "Release" : "Not Held"}
                      </button>
                    )}

                    {actionModal.type === "PRIORITY" && (
                      <button
                        onClick={() => handleTogglePriority(train.train, train.priority)}
                        className="rounded border border-[#F59E0B]/40 bg-[#F59E0B]/20 px-2.5 py-1 text-[10px] font-bold text-[#F59E0B] hover:bg-[#F59E0B]/30"
                      >
                        Make {train.priority === "HIGH" ? "NORMAL" : "HIGH"}
                      </button>
                    )}

                    {actionModal.type === "SIGNAL" && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSignalOverrides((p) => ({ ...p, [train.train]: "GREEN" }))
                            triggerFeedback(`Train ${train.train} signal forced to GREEN`)
                            setActionModal(null)
                          }}
                          className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/30"
                        >
                          GRN
                        </button>
                        <button
                          onClick={() => {
                            setSignalOverrides((p) => ({ ...p, [train.train]: "YELLOW" }))
                            triggerFeedback(`Train ${train.train} signal forced to YELLOW`)
                            setActionModal(null)
                          }}
                          className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-500/30"
                        >
                          YEL
                        </button>
                        <button
                          onClick={() => {
                            setSignalOverrides((p) => ({ ...p, [train.train]: "RED" }))
                            triggerFeedback(`Train ${train.train} signal forced to RED`)
                            setActionModal(null)
                          }}
                          className="rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-400 border border-red-500/30"
                        >
                          RED
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JunctionManagement

import { useMemo, useState } from "react"
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Clock3,
  Filter,
  Gauge,
  MapPin,
  Radio,
  RotateCcw,
  Search,
  ShieldAlert,
  TrainFront,
} from "lucide-react"
import { Link } from "react-router-dom"
import { useLiveTelemetry } from "../../hooks/useLiveTelemetry"
import type { LiveTrain } from "../../types/controller"

type TrainStatusCategory = "ALL" | "ON_TIME" | "DELAYED" | "CRITICAL" | "STOPPED"
type SortField = "DELAY_DESC" | "DELAY_ASC" | "SPEED_DESC" | "CASCADE_DESC" | "PRIORITY_ASC" | "NUMBER_ASC"

const baselineMonitoredTrains: LiveTrain[] = [
  {
    trainNumber: "12628",
    name: "Karnataka Express",
    priority: 1,
    currentBlock: "SBC-BYPL Block 4",
    telemetry: {
      lat: 12.9784,
      lon: 77.5726,
      speed_kmh: 62.4,
      signal: "GREEN",
    },
    forecasts: [
      {
        station: "BYPL",
        station_name: "Baiyappanahalli Junction",
        distance_remaining_km: 8.4,
        baseline_static_eta: "17:48",
        dynamic_gnn_eta: "17:54",
        predicted_delay_min: 6,
        cascade_risk: 0.42,
      },
    ],
    updatedAt: "Just now",
  },
  {
    trainNumber: "16589",
    name: "Rani Chennamma Express",
    priority: 2,
    currentBlock: "WFD-BYPL Block 2",
    telemetry: {
      lat: 12.9934,
      lon: 77.7219,
      speed_kmh: 74.8,
      signal: "YELLOW",
    },
    forecasts: [
      {
        station: "SBC",
        station_name: "KSR Bengaluru City",
        distance_remaining_km: 14.2,
        baseline_static_eta: "18:02",
        dynamic_gnn_eta: "18:10",
        predicted_delay_min: 8,
        cascade_risk: 0.35,
      },
    ],
    updatedAt: "Just now",
  },
  {
    trainNumber: "16526",
    name: "Kanyakumari Express",
    priority: 2,
    currentBlock: "SBC-YPR Block 1",
    telemetry: {
      lat: 13.0012,
      lon: 77.5684,
      speed_kmh: 48.0,
      signal: "YELLOW",
    },
    forecasts: [
      {
        station: "BYPL",
        station_name: "Baiyappanahalli Junction",
        distance_remaining_km: 11.0,
        baseline_static_eta: "18:15",
        dynamic_gnn_eta: "18:21",
        predicted_delay_min: 6,
        cascade_risk: 0.28,
      },
    ],
    updatedAt: "Just now",
  },
  {
    trainNumber: "12627",
    name: "Karnataka Express (UP)",
    priority: 1,
    currentBlock: "BYPL Corridor Section 3",
    telemetry: {
      lat: 12.9912,
      lon: 77.6521,
      speed_kmh: 0.0,
      signal: "RED",
    },
    forecasts: [
      {
        station: "WFD",
        station_name: "Whitefield Junction",
        distance_remaining_km: 9.8,
        baseline_static_eta: "17:35",
        dynamic_gnn_eta: "17:47",
        predicted_delay_min: 12,
        cascade_risk: 0.72,
      },
    ],
    updatedAt: "Just now",
  },
  {
    trainNumber: "12079",
    name: "Jan Shatabdi Express",
    priority: 1,
    currentBlock: "SBC Approach Section 1",
    telemetry: {
      lat: 12.9812,
      lon: 77.5845,
      speed_kmh: 68.0,
      signal: "GREEN",
    },
    forecasts: [
      {
        station: "WFD",
        station_name: "Whitefield Junction",
        distance_remaining_km: 18.0,
        baseline_static_eta: "17:55",
        dynamic_gnn_eta: "17:59",
        predicted_delay_min: 4,
        cascade_risk: 0.18,
      },
    ],
    updatedAt: "Just now",
  },
  {
    trainNumber: "16534",
    name: "Jodhpur Express",
    priority: 2,
    currentBlock: "YPR Outer Junction 2",
    telemetry: {
      lat: 13.0185,
      lon: 77.5532,
      speed_kmh: 52.6,
      signal: "GREEN",
    },
    forecasts: [
      {
        station: "YPR",
        station_name: "Yesvantpur Junction",
        distance_remaining_km: 5.2,
        baseline_static_eta: "18:20",
        dynamic_gnn_eta: "18:20",
        predicted_delay_min: 0,
        cascade_risk: 0.08,
      },
    ],
    updatedAt: "Just now",
  },
]

function getTrainOperationalCategory(train: LiveTrain): {
  category: TrainStatusCategory
  label: string
  pillClass: string
} {
  const speed = train.telemetry?.speed_kmh ?? 0
  const signal = train.telemetry?.signal ?? ""
  const delay = train.forecasts?.[0]?.predicted_delay_min ?? 0
  const cascadeRisk = train.forecasts?.[0]?.cascade_risk ?? 0

  if (speed === 0 || (speed < 5 && signal === "RED")) {
    return {
      category: "STOPPED",
      label: "HELD / STOPPED",
      pillClass: "border-red-500/50 bg-red-950/60 text-red-300",
    }
  }

  if (delay >= 10 || cascadeRisk >= 0.5 || (signal === "RED" && speed < 15)) {
    return {
      category: "CRITICAL",
      label: "CRITICAL",
      pillClass: "border-rose-500/50 bg-rose-950/60 text-rose-300",
    }
  }

  if (delay > 2) {
    return {
      category: "DELAYED",
      label: "DELAYED",
      pillClass: "border-amber-500/50 bg-amber-950/60 text-amber-300",
    }
  }

  return {
    category: "ON_TIME",
    label: "ON TIME",
    pillClass: "border-emerald-500/50 bg-emerald-950/60 text-emerald-300",
  }
}

function getSignalBadge(signal?: string) {
  const sig = (signal || "UNKNOWN").toUpperCase()
  if (sig === "GREEN") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        GREEN
      </span>
    )
  }
  if (sig === "YELLOW" || sig === "DOUBLE YELLOW") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded border border-amber-500/40 bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold text-amber-300">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        {sig}
      </span>
    )
  }
  if (sig === "RED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded border border-rose-500/40 bg-rose-950/60 px-2 py-0.5 text-[10px] font-bold text-rose-300">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
        RED
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-[#145158] bg-[#071A33] px-2 py-0.5 text-[10px] font-semibold text-[#9FB8BE]">
      {sig}
    </span>
  )
}

export default function TrainOperations() {
  const { trains: liveTrainsMap, isConnected } = useLiveTelemetry()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<TrainStatusCategory>("ALL")
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL")
  const [sortBy, setSortBy] = useState<SortField>("DELAY_DESC")

  // Merge live trains with baseline monitored trains
  const allTrains: LiveTrain[] = useMemo(() => {
    const liveKeys = Object.keys(liveTrainsMap)
    if (liveKeys.length === 0) {
      return baselineMonitoredTrains
    }

    // Overlay live telemetry onto baseline
    const mergedMap: Record<string, LiveTrain> = {}
    for (const b of baselineMonitoredTrains) {
      mergedMap[b.trainNumber] = b
    }
    for (const [key, val] of Object.entries(liveTrainsMap)) {
      mergedMap[key] = {
        ...(mergedMap[key] || {}),
        ...val,
      }
    }
    return Object.values(mergedMap)
  }, [liveTrainsMap])

  // Compute fleet KPI counts
  const kpis = useMemo(() => {
    let onTimeCount = 0
    let delayedCount = 0
    let criticalCount = 0
    let stoppedCount = 0
    let totalSpeed = 0
    let speedSamples = 0

    allTrains.forEach((train) => {
      const { category } = getTrainOperationalCategory(train)
      if (category === "ON_TIME") onTimeCount++
      if (category === "DELAYED") delayedCount++
      if (category === "CRITICAL") criticalCount++
      if (category === "STOPPED") stoppedCount++

      const spd = train.telemetry?.speed_kmh
      if (typeof spd === "number" && !isNaN(spd)) {
        totalSpeed += spd
        speedSamples++
      }
    })

    const avgSpeed = speedSamples > 0 ? (totalSpeed / speedSamples).toFixed(1) : "0"

    return {
      total: allTrains.length,
      onTime: onTimeCount,
      delayed: delayedCount,
      critical: criticalCount,
      stopped: stoppedCount,
      avgSpeed,
    }
  }, [allTrains])

  // Filter and sort trains
  const filteredTrains = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return allTrains
      .filter((train) => {
        // Search filter
        if (q) {
          const matchNumber = train.trainNumber.toLowerCase().includes(q)
          const matchName = train.name?.toLowerCase().includes(q)
          const matchBlock = train.currentBlock?.toLowerCase().includes(q)
          const matchNext = train.forecasts?.[0]?.station_name?.toLowerCase().includes(q) ||
            train.forecasts?.[0]?.station?.toLowerCase().includes(q)
          if (!matchNumber && !matchName && !matchBlock && !matchNext) {
            return false
          }
        }

        // Status category filter
        if (selectedCategory !== "ALL") {
          const { category } = getTrainOperationalCategory(train)
          if (category !== selectedCategory) {
            return false
          }
        }

        // Priority filter
        if (priorityFilter !== "ALL") {
          const targetPriority = parseInt(priorityFilter, 10)
          if (train.priority !== targetPriority) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => {
        const delayA = a.forecasts?.[0]?.predicted_delay_min ?? 0
        const delayB = b.forecasts?.[0]?.predicted_delay_min ?? 0
        const speedA = a.telemetry?.speed_kmh ?? 0
        const speedB = b.telemetry?.speed_kmh ?? 0
        const riskA = a.forecasts?.[0]?.cascade_risk ?? 0
        const riskB = b.forecasts?.[0]?.cascade_risk ?? 0

        switch (sortBy) {
          case "DELAY_DESC":
            return delayB - delayA
          case "DELAY_ASC":
            return delayA - delayB
          case "SPEED_DESC":
            return speedB - speedA
          case "CASCADE_DESC":
            return riskB - riskA
          case "PRIORITY_ASC":
            return (a.priority ?? 99) - (b.priority ?? 99)
          case "NUMBER_ASC":
            return a.trainNumber.localeCompare(b.trainNumber)
          default:
            return 0
        }
      })
  }, [allTrains, searchQuery, selectedCategory, priorityFilter, sortBy])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("ALL")
    setPriorityFilter("ALL")
    setSortBy("DELAY_DESC")
  }

  return (
    <div className="controller-page px-4 py-5 lg:px-6">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#F59E0B]">
            Fleet Monitoring
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Train Operations
          </h1>

          <p className="mt-1 text-sm text-[#9FB8BE]">
            Individual train tracking, block occupancy, signal compliance, and delay intervention.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="controller-panel flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold">
            <Radio
              size={15}
              strokeWidth={2.2}
              className={isConnected ? "text-emerald-400" : "text-amber-400"}
            />
            <span className="text-[#D7E5EC]">
              {isConnected ? "Live Telemetry Feed" : "Baseline Telemetry Active"}
            </span>
          </div>

          <div className="controller-panel hidden rounded-lg px-3 py-2 text-xs text-[#9FB8BE] sm:block">
            Monitored: <span className="font-bold text-white">{allTrains.length} Services</span>
          </div>
        </div>
      </div>

      {/* ── FLEET KPI STRIP ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* Total Trains */}
        <div className="controller-panel rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-[#9FB8BE]">
            <span>Active Trains</span>
            <TrainFront size={14} className="text-[#0E7C86]" />
          </div>
          <div className="mt-1 text-xl font-bold text-white">{kpis.total}</div>
          <div className="mt-0.5 text-[10px] text-[#718F96]">Tracked across sector</div>
        </div>

        {/* On Time */}
        <div
          onClick={() => setSelectedCategory("ON_TIME")}
          className={`controller-panel cursor-pointer rounded-lg p-3 transition hover:border-emerald-500/60 ${
            selectedCategory === "ON_TIME" ? "border-emerald-500 bg-[#072422]" : ""
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#9FB8BE]">
            <span>On Time</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <div className="mt-1 text-xl font-bold text-emerald-300">{kpis.onTime}</div>
          <div className="mt-0.5 text-[10px] text-emerald-400/80">
            {kpis.total > 0 ? `${Math.round((kpis.onTime / kpis.total) * 100)}% punctuality` : "—"}
          </div>
        </div>

        {/* Delayed */}
        <div
          onClick={() => setSelectedCategory("DELAYED")}
          className={`controller-panel cursor-pointer rounded-lg p-3 transition hover:border-amber-500/60 ${
            selectedCategory === "DELAYED" ? "border-amber-500 bg-[#261E0A]" : ""
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#9FB8BE]">
            <span>Delayed</span>
            <Clock3 size={14} className="text-[#F59E0B]" />
          </div>
          <div className="mt-1 text-xl font-bold text-amber-300">{kpis.delayed}</div>
          <div className="mt-0.5 text-[10px] text-amber-400/80">&gt; 2 min delay</div>
        </div>

        {/* Critical Attention */}
        <div
          onClick={() => setSelectedCategory("CRITICAL")}
          className={`controller-panel cursor-pointer rounded-lg p-3 transition hover:border-rose-500/60 ${
            selectedCategory === "CRITICAL" ? "border-rose-500 bg-[#271017]" : ""
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#9FB8BE]">
            <span>Critical</span>
            <AlertTriangle size={14} className="text-rose-400" />
          </div>
          <div className="mt-1 text-xl font-bold text-rose-300">{kpis.critical}</div>
          <div className="mt-0.5 text-[10px] text-rose-400/80">High cascade risk / delay</div>
        </div>

        {/* Stopped / Held */}
        <div
          onClick={() => setSelectedCategory("STOPPED")}
          className={`controller-panel cursor-pointer rounded-lg p-3 transition hover:border-red-500/60 ${
            selectedCategory === "STOPPED" ? "border-red-500 bg-[#260C12]" : ""
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#9FB8BE]">
            <span>Held / Stopped</span>
            <ShieldAlert size={14} className="text-red-400" />
          </div>
          <div className="mt-1 text-xl font-bold text-red-300">{kpis.stopped}</div>
          <div className="mt-0.5 text-[10px] text-red-400/80">Speed 0 or Red signal</div>
        </div>

        {/* Avg Speed */}
        <div className="controller-panel rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-[#9FB8BE]">
            <span>Fleet Avg Speed</span>
            <Gauge size={14} className="text-[#0E7C86]" />
          </div>
          <div className="mt-1 text-xl font-bold text-[#D7E5EC]">
            {kpis.avgSpeed} <span className="text-xs font-normal text-[#9FB8BE]">km/h</span>
          </div>
          <div className="mt-0.5 text-[10px] text-[#718F96]">Sector velocity</div>
        </div>
      </div>

      {/* ── SEARCH, FILTERS & SORT ──────────────────────────── */}
      <div className="mt-5 controller-panel rounded-lg p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718F96]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by train number, train name, block, or station..."
              className="w-full rounded-md border border-[#145158] bg-[#031A1F] py-2 pl-9 pr-8 text-xs text-white placeholder-[#718F96] transition focus:border-[#0E7C86] focus:outline-none focus:ring-1 focus:ring-[#0E7C86]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#9FB8BE] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Controls Right */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Priority Filter */}
            <div className="flex items-center gap-1.5 text-xs text-[#9FB8BE]">
              <Filter size={13} className="text-[#718F96]" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="rounded-md border border-[#145158] bg-[#031A1F] px-2.5 py-1.5 text-xs text-[#D7E5EC] focus:border-[#0E7C86] focus:outline-none"
              >
                <option value="ALL">All Priorities</option>
                <option value="1">Tier 1 (High Priority)</option>
                <option value="2">Tier 2 (Regular)</option>
                <option value="3">Tier 3 (Freight / Local)</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-[#9FB8BE]">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortField)}
                className="rounded-md border border-[#145158] bg-[#031A1F] px-2.5 py-1.5 text-xs text-[#D7E5EC] focus:border-[#0E7C86] focus:outline-none"
              >
                <option value="DELAY_DESC">Delay: Highest First</option>
                <option value="DELAY_ASC">Delay: Lowest First</option>
                <option value="CASCADE_DESC">Cascade Risk: Highest</option>
                <option value="SPEED_DESC">Speed: Highest First</option>
                <option value="PRIORITY_ASC">Priority: Tier 1 First</option>
                <option value="NUMBER_ASC">Train Number</option>
              </select>
            </div>

            {/* Reset Filters */}
            {(searchQuery || selectedCategory !== "ALL" || priorityFilter !== "ALL") && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-md border border-[#145158] px-2.5 py-1.5 text-xs text-[#D7E5EC] hover:bg-[#08383D]"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="mt-3.5 flex flex-wrap gap-1.5 border-t border-[#145158]/60 pt-3">
          {(
            [
              { key: "ALL", label: "All Trains", count: kpis.total },
              { key: "ON_TIME", label: "On Time", count: kpis.onTime },
              { key: "DELAYED", label: "Delayed", count: kpis.delayed },
              { key: "CRITICAL", label: "Critical", count: kpis.critical },
              { key: "STOPPED", label: "Stopped / Held", count: kpis.stopped },
            ] as const
          ).map((tab) => {
            const isActive = selectedCategory === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedCategory(tab.key)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition ${
                  isActive
                    ? "bg-[#0E5961] text-white shadow-sm"
                    : "text-[#9FB8BE] hover:bg-[#08383D] hover:text-[#D7E5EC]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isActive ? "bg-[#071A33] text-white" : "bg-[#031A1F] text-[#718F96]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── TRAIN OPERATIONS TABLE ──────────────────────────── */}
      <section className="mt-5 controller-panel overflow-hidden rounded-lg">
        <div className="controller-header px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrainFront size={16} className="text-[#F59E0B]" />
              <div>
                <h2 className="text-sm font-bold text-white">
                  Monitored Train Fleet ({filteredTrains.length} Services)
                </h2>
                <p className="text-[11px] text-[#D7E5EC]/70">
                  Real-time telemetry, block clearances, cascade metrics, and controller intervention
                </p>
              </div>
            </div>

            <div className="text-[11px] text-[#9FB8BE]">
              Showing {filteredTrains.length} of {allTrains.length}
            </div>
          </div>
        </div>

        {filteredTrains.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
            <Radio size={36} className="text-[#0E5961]" />
            <h3 className="mt-3 text-sm font-bold text-white">No Matching Trains Found</h3>
            <p className="mt-1 max-w-sm text-xs text-[#9FB8BE]">
              {searchQuery || selectedCategory !== "ALL" || priorityFilter !== "ALL"
                ? "No train services match your active search and filter parameters."
                : "No active trains currently reporting telemetry."}
            </p>
            {(searchQuery || selectedCategory !== "ALL" || priorityFilter !== "ALL") && (
              <button
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-[#F59E0B] bg-[#071A33] px-3 py-1.5 text-xs font-bold text-[#F59E0B] hover:bg-[#0E5961] hover:text-white"
              >
                <RotateCcw size={13} />
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#145158] bg-[#071A33] text-[10px] font-bold uppercase tracking-[0.12em] text-[#9FB8BE]">
                  <th className="px-4 py-3">Train Number</th>
                  <th className="px-4 py-3">Train Name</th>
                  <th className="px-4 py-3">Current Location / Block</th>
                  <th className="px-4 py-3">Next Station</th>
                  <th className="px-4 py-3">Speed</th>
                  <th className="px-4 py-3">Signal</th>
                  <th className="px-4 py-3">Delay</th>
                  <th className="px-4 py-3">Predicted Arrival</th>
                  <th className="px-4 py-3">Cascade Risk</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#145158]/50 text-xs">
                {filteredTrains.map((train) => {
                  const forecast = train.forecasts?.[0]
                  const delay = forecast?.predicted_delay_min ?? 0
                  const predictedArrival = forecast?.dynamic_gnn_eta ?? "—"
                  const nextStation = forecast?.station_name || forecast?.station || "—"
                  const cascadeRiskRaw = forecast?.cascade_risk ?? 0
                  const cascadeRiskPct = Math.round(
                    cascadeRiskRaw <= 1 ? cascadeRiskRaw * 100 : cascadeRiskRaw
                  )
                  const speed = train.telemetry?.speed_kmh
                  const signal = train.telemetry?.signal
                  const statusInfo = getTrainOperationalCategory(train)

                  return (
                    <tr
                      key={train.trainNumber}
                      className="transition-colors hover:bg-[#08383D]/60"
                    >
                      {/* 1. Train Number */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-[#145158] bg-[#071A33]">
                            <TrainFront size={14} className="text-[#0E7C86]" />
                          </div>
                          <span className="font-mono text-xs font-bold text-white">
                            {train.trainNumber}
                          </span>
                        </div>
                      </td>

                      {/* 2. Train Name */}
                      <td className="px-4 py-3.5">
                        <div className="max-w-[170px] truncate font-semibold text-[#D7E5EC]">
                          {train.name || "Unnamed Service"}
                        </div>
                      </td>

                      {/* 3. Current Location / Block */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="shrink-0 text-[#0E7C86]" />
                          <span className="truncate font-mono text-[11px] text-[#D7E5EC]">
                            {train.currentBlock || "Block Clearance Pending"}
                          </span>
                        </div>
                      </td>

                      {/* 4. Next Station */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 text-[#D7E5EC]">
                          <ArrowRight size={13} className="shrink-0 text-[#718F96]" />
                          <span className="truncate text-xs font-medium">{nextStation}</span>
                        </div>
                      </td>

                      {/* 5. Speed */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`font-mono text-xs font-bold ${
                            speed === 0 ? "text-red-400" : "text-[#D7E5EC]"
                          }`}
                        >
                          {typeof speed === "number" ? `${speed.toFixed(1)} km/h` : "—"}
                        </span>
                      </td>

                      {/* 6. Signal */}
                      <td className="px-4 py-3.5">{getSignalBadge(signal)}</td>

                      {/* 7. Delay */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Clock3
                            size={13}
                            className={
                              delay > 5
                                ? "text-rose-400"
                                : delay > 0
                                ? "text-[#F59E0B]"
                                : "text-emerald-400"
                            }
                          />
                          <span
                            className={`font-semibold ${
                              delay > 5
                                ? "text-rose-400"
                                : delay > 0
                                ? "text-[#F59E0B]"
                                : "text-emerald-400"
                            }`}
                          >
                            {delay > 0 ? `+${delay} min` : "On time"}
                          </span>
                        </div>
                      </td>

                      {/* 8. Predicted Arrival */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-bold text-white">
                          {predictedArrival}
                        </span>
                      </td>

                      {/* 9. Cascade Risk */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#031A1F]">
                            <div
                              className={`h-full rounded-full transition-all ${
                                cascadeRiskPct > 50
                                  ? "bg-rose-500"
                                  : cascadeRiskPct > 25
                                  ? "bg-amber-500"
                                  : "bg-[#0E7C86]"
                              }`}
                              style={{ width: `${Math.min(cascadeRiskPct, 100)}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-[#D7E5EC]">
                            {cascadeRiskPct}%
                          </span>
                        </div>
                      </td>

                      {/* 10. Priority */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex rounded border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#F59E0B]">
                          Tier {train.priority ?? "—"}
                        </span>
                      </td>

                      {/* 11. Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-bold ${statusInfo.pillClass}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* 12. Action */}
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          to={`/controller/trains/${train.trainNumber}`}
                          className="inline-flex items-center gap-1 rounded border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white transition hover:scale-[1.02] hover:border-amber-400"
                        >
                          <span>View Details</span>
                          <ChevronRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        <div className="flex items-center justify-between border-t border-[#145158] bg-[#062A2F] px-4 py-3 text-xs text-[#9FB8BE]">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-amber-400"}`}
            />
            <span>
              {isConnected
                ? "Live telemetry synchronized"
                : "Fallback baseline telemetry active"}
            </span>
          </div>

          <div className="text-[11px] text-[#718F96]">
            Select "View Details" on any train to inspect full telemetry, route weather, and dispatch controls.
          </div>
        </div>
      </section>
    </div>
  )
}

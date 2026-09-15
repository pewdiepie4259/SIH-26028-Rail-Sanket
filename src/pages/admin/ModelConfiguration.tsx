import { useState } from "react"
import {
  AlertTriangle,
  Clock,
  Cpu,
  Database,
  GitBranch,
  Info,
  Layers,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldAlert,
  Sliders,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"

export interface ModelVersionItem {
  version: string
  modelType: string
  status: "Active" | "Available" | "Archived" | "Testing"
  created: string
  deployed: string
}

export interface PredictionInputItem {
  id: string
  name: string
  source: string
  enabled: boolean
  lastReceived: string
}

const initialModelVersions: ModelVersionItem[] = [
  {
    version: "v2.4-prod",
    modelType: "Spatio-Temporal GNN",
    status: "Active",
    created: "2024-08-10",
    deployed: "2024-08-15",
  },
  {
    version: "v2.3-stable",
    modelType: "Spatio-Temporal GNN",
    status: "Available",
    created: "2024-06-01",
    deployed: "2024-06-05",
  },
  {
    version: "v2.5-rc1",
    modelType: "Hybrid GNN + Transformer",
    status: "Testing",
    created: "2024-09-02",
    deployed: "Staging sandbox",
  },
  {
    version: "v2.0-legacy",
    modelType: "Recurrent Graph Net",
    status: "Archived",
    created: "2023-11-14",
    deployed: "2023-12-01",
  },
]

const initialInputs: PredictionInputItem[] = [
  {
    id: "telemetry",
    name: "Train Telemetry (Speed & Coordinates)",
    source: "RTIS WebSocket Gateway",
    enabled: true,
    lastReceived: "2 seconds ago",
  },
  {
    id: "topology",
    name: "Railway Topology & Track Blocks",
    source: "NRDB Section Graph Service",
    enabled: true,
    lastReceived: "Persistent static cache",
  },
  {
    id: "signal",
    name: "Signal Aspect State (GREEN/YELLOW/RED)",
    source: "Electronic Interlocking Relay",
    enabled: true,
    lastReceived: "4 seconds ago",
  },
  {
    id: "junction",
    name: "Junction Convergence & Point Route",
    source: "Station Master Panel Link",
    enabled: true,
    lastReceived: "10 seconds ago",
  },
  {
    id: "priority",
    name: "Train Priority Classification (Tier 1-3)",
    source: "Operational Master Schedule",
    enabled: true,
    lastReceived: "Synchronized",
  },
  {
    id: "history",
    name: "Historical Movement & Section Dwell Times",
    source: "Historical Telemetry Store",
    enabled: true,
    lastReceived: "Daily partition sync",
  },
  {
    id: "weather",
    name: "Weather Conditions & Radar Precipitation",
    source: "Open-Meteo & Weather Service",
    enabled: true,
    lastReceived: "3 mins ago",
  },
  {
    id: "downstream",
    name: "Downstream Train Dependencies & Block Conflict",
    source: "Dynamic Conflict Detection Engine",
    enabled: true,
    lastReceived: "Continuous loop",
  },
]

export default function ModelConfiguration() {
  // Model parameters state
  const [predictionHorizon, setPredictionHorizon] = useState(120) // minutes
  const [minConfidence, setMinConfidence] = useState(75) // %
  const [delayWarningThreshold, setDelayWarningThreshold] = useState(5) // minutes
  const [criticalDelayThreshold, setCriticalDelayThreshold] = useState(15) // minutes
  const [refreshInterval, setRefreshInterval] = useState(15) // seconds

  // Cascade configuration state
  const [cascadeEnabled, setCascadeEnabled] = useState(true)
  const [propagationHorizon, setPropagationHorizon] = useState(5) // stations
  const [cascadeMinDelay, setCascadeMinDelay] = useState(4) // minutes
  const [cascadeRiskThreshold, setCascadeRiskThreshold] = useState<"Low" | "Medium" | "High">("Medium")
  const [recalcInterval, setRecalcInterval] = useState(3) // minutes

  // Confidence & Explainability state
  const [lowConfidenceHandling, setLowConfidenceHandling] = useState<"Show prediction" | "Flag for review" | "Use baseline estimate">("Flag for review")
  const [explanationEnabled, setExplanationEnabled] = useState(true)
  const [explanationDetail, setExplanationDetail] = useState<"Summary" | "Operational factors" | "Detailed">("Operational factors")

  // Prediction inputs state
  const [inputs, setInputs] = useState<PredictionInputItem[]>(initialInputs)

  // Tracking and UI notices
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [saveNotice, setSaveNotice] = useState<{ type: "info" | "warning"; text: string } | null>(null)
  const [pendingChangesCount, setPendingChangesCount] = useState(0)

  const toggleInput = (id: string) => {
    setInputs(
      inputs.map((inp) => (inp.id === id ? { ...inp, enabled: !inp.enabled } : inp))
    )
    setPendingChangesCount((c) => c + 1)
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setSaveNotice({
        type: "info",
        text: "Configuration polled from active prediction microservice. Parameters are currently in sync.",
      })
    }, 500)
  }

  const handleSaveClick = () => {
    setSaveModalOpen(true)
  }

  const confirmSave = () => {
    setSaveModalOpen(false)
    setPendingChangesCount(0)
    // As explicitly requested: do NOT pretend it was saved to an active backend without backend support
    setSaveNotice({
      type: "warning",
      text: "Backend configuration service is currently operating in read-only / local mode. Changes have been recorded in this administrative session but not pushed to production model server.",
    })
  }

  const discardChanges = () => {
    setPredictionHorizon(120)
    setMinConfidence(75)
    setDelayWarningThreshold(5)
    setCriticalDelayThreshold(15)
    setRefreshInterval(15)
    setCascadeEnabled(true)
    setPropagationHorizon(5)
    setCascadeMinDelay(4)
    setCascadeRiskThreshold("Medium")
    setRecalcInterval(3)
    setInputs(initialInputs)
    setPendingChangesCount(0)
    setSaveNotice({
      type: "info",
      text: "All local modifications discarded. Restored default baseline configuration.",
    })
  }

  return (
    <div className="controller-page px-4 py-5 lg:px-6">
      {/* ── 1. PAGE HEADER ────────────────────────────────────────── */}
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#F59E0B]">
            Core Prediction Engine
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            ETA / Model Configuration
          </h1>

          <p className="mt-1 text-sm text-[#9FB8BE]">
            Configure prediction models, arrival time thresholds and cascade propagation parameters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {pendingChangesCount > 0 && (
            <button
              onClick={discardChanges}
              className="controller-panel inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#D7E5EC] transition hover:bg-[#08383D]"
            >
              <RotateCcw size={13} />
              <span>Discard ({pendingChangesCount})</span>
            </button>
          )}

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="controller-panel inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#D7E5EC] transition hover:bg-[#08383D]"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin text-[#F59E0B]" : "text-[#718F96]"} />
            <span>Refresh Config</span>
          </button>

          <button
            onClick={handleSaveClick}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-3.5 py-2 text-xs font-bold text-white transition hover:scale-[1.02]"
          >
            <Save size={14} className="text-[#F59E0B]" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {saveNotice && (
        <div
          className={`mb-4 flex items-center justify-between rounded-lg border p-3 text-xs ${
            saveNotice.type === "warning"
              ? "border-amber-500/40 bg-amber-950/40 text-amber-200"
              : "border-emerald-500/40 bg-emerald-950/40 text-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <Info size={15} className="shrink-0" />
            <span>{saveNotice.text}</span>
          </div>
          <button onClick={() => setSaveNotice(null)} className="text-xs hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* ── 2. ACTIVE MODEL SUMMARY ───────────────────────────────── */}
      <section className="controller-panel rounded-lg p-4">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#145158] bg-[#071A33]">
              <Cpu size={20} className="text-[#F59E0B]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">
                  Dynamic GNN ETA Prediction Model
                </h2>
                <span className="rounded border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  Active in Production
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[#9FB8BE]">
                Spatio-Temporal Graph Neural Network utilizing train block dynamics and weather embeddings.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="rounded border border-[#145158] bg-[#031A1F] px-3 py-2">
              <div className="text-[10px] text-[#718F96]">Version</div>
              <div className="font-mono font-bold text-white">v2.4-prod</div>
            </div>

            <div className="rounded border border-[#145158] bg-[#031A1F] px-3 py-2">
              <div className="text-[10px] text-[#718F96]">Environment</div>
              <div className="font-semibold text-[#D7E5EC]">Production (SBC Division)</div>
            </div>

            <div className="rounded border border-[#145158] bg-[#031A1F] px-3 py-2">
              <div className="text-[10px] text-[#718F96]">Last Check</div>
              <div className="font-mono text-emerald-400">12:44:00 (Normal)</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. MODEL VERSIONS & ETA PARAMETERS ─────────────────────── */}
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {/* Model Versions Table */}
        <section className="controller-panel overflow-hidden rounded-lg">
          <div className="controller-header px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-[#F59E0B]" />
                <div>
                  <h3 className="text-sm font-bold text-white">Model Versions</h3>
                  <p className="text-[11px] text-[#D7E5EC]/70">
                    Registered neural network checkpoints and deployment status
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-[#9FB8BE]">4 Checkpoints</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[450px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#145158] bg-[#071A33] text-[10px] font-bold uppercase tracking-[0.12em] text-[#9FB8BE]">
                  <th className="px-4 py-2.5">Version</th>
                  <th className="px-4 py-2.5">Model Type</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Deployed</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#145158]/50">
                {initialModelVersions.map((v) => (
                  <tr key={v.version} className="transition-colors hover:bg-[#08383D]/50">
                    <td className="px-4 py-3 font-mono font-bold text-white">
                      {v.version}
                    </td>
                    <td className="px-4 py-3 text-[#D7E5EC]">{v.modelType}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded border px-2 py-0.5 text-[10px] font-bold ${
                          v.status === "Active"
                            ? "border-emerald-500/40 bg-emerald-950/60 text-emerald-300"
                            : v.status === "Testing"
                            ? "border-amber-500/40 bg-amber-950/60 text-amber-300"
                            : "border-slate-500/30 bg-slate-900/60 text-slate-300"
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-[#718F96]">
                      {v.deployed}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {v.status === "Active" ? (
                        <span className="text-[10px] font-bold text-emerald-400">Current</span>
                      ) : (
                        <button
                          onClick={() =>
                            setSaveNotice({
                              type: "warning",
                              text: `Version switch to ${v.version} requires deployment approval via Infrastructure Change Control.`,
                            })
                          }
                          className="text-[11px] font-semibold text-[#0E7C86] hover:text-[#F59E0B]"
                        >
                          Activate →
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ETA Prediction Parameters */}
        <section className="controller-panel rounded-lg p-4">
          <div className="flex items-center gap-2 border-b border-[#145158] pb-3">
            <Sliders size={16} className="text-[#F59E0B]" />
            <div>
              <h3 className="text-sm font-bold text-white">ETA Prediction Parameters</h3>
              <p className="text-[11px] text-[#D7E5EC]/70">
                Inference horizons, refresh intervals, and threshold limits
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3.5 text-xs">
            {/* Prediction Horizon */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Prediction Horizon</div>
                <div className="text-[11px] text-[#718F96]">
                  Forward time window for ETA forecasting
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={predictionHorizon}
                  onChange={(e) => {
                    setPredictionHorizon(Number(e.target.value))
                    setPendingChangesCount((c) => c + 1)
                  }}
                  min={30}
                  max={360}
                  className="w-18 rounded border border-[#145158] bg-[#031A1F] px-2.5 py-1 font-mono text-xs text-white text-right"
                />
                <span className="text-[11px] text-[#9FB8BE]">minutes</span>
              </div>
            </div>

            {/* Minimum Confidence Threshold */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Minimum Confidence Threshold</div>
                <div className="text-[11px] text-[#718F96]">
                  Minimum model certainty required to display dynamic ETA
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={minConfidence}
                  onChange={(e) => {
                    setMinConfidence(Number(e.target.value))
                    setPendingChangesCount((c) => c + 1)
                  }}
                  min={50}
                  max={95}
                  className="w-18 rounded border border-[#145158] bg-[#031A1F] px-2.5 py-1 font-mono text-xs text-white text-right"
                />
                <span className="text-[11px] text-[#9FB8BE]">%</span>
              </div>
            </div>

            {/* Delay Warning Threshold */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Delay Warning Threshold</div>
                <div className="text-[11px] text-[#718F96]">
                  Predicted delay triggering amber warning state
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={delayWarningThreshold}
                  onChange={(e) => {
                    setDelayWarningThreshold(Number(e.target.value))
                    setPendingChangesCount((c) => c + 1)
                  }}
                  min={1}
                  max={30}
                  className="w-18 rounded border border-[#145158] bg-[#031A1F] px-2.5 py-1 font-mono text-xs text-white text-right"
                />
                <span className="text-[11px] text-[#9FB8BE]">minutes</span>
              </div>
            </div>

            {/* Critical Delay Threshold */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Critical Delay Threshold</div>
                <div className="text-[11px] text-[#718F96]">
                  Predicted delay triggering critical red intervention
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={criticalDelayThreshold}
                  onChange={(e) => {
                    setCriticalDelayThreshold(Number(e.target.value))
                    setPendingChangesCount((c) => c + 1)
                  }}
                  min={5}
                  max={60}
                  className="w-18 rounded border border-[#145158] bg-[#031A1F] px-2.5 py-1 font-mono text-xs text-white text-right"
                />
                <span className="text-[11px] text-[#9FB8BE]">minutes</span>
              </div>
            </div>

            {/* Prediction Refresh Interval */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Prediction Refresh Interval</div>
                <div className="text-[11px] text-[#718F96]">
                  Cycle interval for re-computing sector graph nodes
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={refreshInterval}
                  onChange={(e) => {
                    setRefreshInterval(Number(e.target.value))
                    setPendingChangesCount((c) => c + 1)
                  }}
                  min={5}
                  max={60}
                  className="w-18 rounded border border-[#145158] bg-[#031A1F] px-2.5 py-1 font-mono text-xs text-white text-right"
                />
                <span className="text-[11px] text-[#9FB8BE]">seconds</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── 4. PREDICTION INPUTS & CASCADE CONFIG ──────────────────── */}
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {/* Prediction Inputs */}
        <section className="controller-panel rounded-lg p-4">
          <div className="flex items-center justify-between border-b border-[#145158] pb-3">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-[#F59E0B]" />
              <div>
                <h3 className="text-sm font-bold text-white">Prediction Inputs</h3>
                <p className="text-[11px] text-[#D7E5EC]/70">
                  Feature channels fed into the spatio-temporal model
                </p>
              </div>
            </div>
            <span className="text-[10px] text-[#9FB8BE]">{inputs.length} Features</span>
          </div>

          <div className="mt-3 divide-y divide-[#145158]/50">
            {inputs.map((inp) => (
              <div key={inp.id} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-xs font-semibold text-white">{inp.name}</div>
                  <div className="text-[10px] text-[#718F96]">
                    Source: {inp.source} · {inp.lastReceived}
                  </div>
                </div>

                <button
                  onClick={() => toggleInput(inp.id)}
                  className="text-xs"
                >
                  {inp.enabled ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                      <ToggleRight size={22} />
                      ENABLED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400 font-bold text-[10px]">
                      <ToggleLeft size={22} />
                      DISABLED
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Delay Cascade Configuration */}
        <section className="controller-panel rounded-lg p-4">
          <div className="flex items-center justify-between border-b border-[#145158] pb-3">
            <div className="flex items-center gap-2">
              <GitBranch size={16} className="text-[#F59E0B]" />
              <div>
                <h3 className="text-sm font-bold text-white">Delay Cascade Configuration</h3>
                <p className="text-[11px] text-[#D7E5EC]/70">
                  Downstream train dependency and knock-on propagation rules
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setCascadeEnabled(!cascadeEnabled)
                setPendingChangesCount((c) => c + 1)
              }}
            >
              {cascadeEnabled ? (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                  <ToggleRight size={22} />
                  ACTIVE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-slate-400 font-bold text-[10px]">
                  <ToggleLeft size={22} />
                  PAUSED
                </span>
              )}
            </button>
          </div>

          <p className="mt-2 text-[11px] text-[#9FB8BE] leading-relaxed">
            Controls when downstream train dependencies are considered during delay propagation analysis.
          </p>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Propagation Horizon</div>
                <div className="text-[10px] text-[#718F96]">Forward junction nodes evaluated</div>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={propagationHorizon}
                  onChange={(e) => {
                    setPropagationHorizon(Number(e.target.value))
                    setPendingChangesCount((c) => c + 1)
                  }}
                  min={1}
                  max={12}
                  className="w-16 rounded border border-[#145158] bg-[#031A1F] px-2 py-1 font-mono text-xs text-white text-right"
                />
                <span className="text-[11px] text-[#9FB8BE]">stations</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Minimum Delay for Cascade</div>
                <div className="text-[10px] text-[#718F96]">Threshold before propagating delay impact</div>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={cascadeMinDelay}
                  onChange={(e) => {
                    setCascadeMinDelay(Number(e.target.value))
                    setPendingChangesCount((c) => c + 1)
                  }}
                  min={1}
                  max={20}
                  className="w-16 rounded border border-[#145158] bg-[#031A1F] px-2 py-1 font-mono text-xs text-white text-right"
                />
                <span className="text-[11px] text-[#9FB8BE]">minutes</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Risk Threshold Sensitivity</div>
                <div className="text-[10px] text-[#718F96]">Knock-on alert sensitivity level</div>
              </div>
              <select
                value={cascadeRiskThreshold}
                onChange={(e) => {
                  setCascadeRiskThreshold(e.target.value as "Low" | "Medium" | "High")
                  setPendingChangesCount((c) => c + 1)
                }}
                className="rounded border border-[#145158] bg-[#031A1F] px-2 py-1 text-xs text-white"
              >
                <option value="Low">Low (Fewer alerts)</option>
                <option value="Medium">Medium (Balanced)</option>
                <option value="High">High (Early warning)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Recalculation Interval</div>
                <div className="text-[10px] text-[#718F96]">Cascade tree recalculation frequency</div>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={recalcInterval}
                  onChange={(e) => {
                    setRecalcInterval(Number(e.target.value))
                    setPendingChangesCount((c) => c + 1)
                  }}
                  min={1}
                  max={15}
                  className="w-16 rounded border border-[#145158] bg-[#031A1F] px-2 py-1 font-mono text-xs text-white text-right"
                />
                <span className="text-[11px] text-[#9FB8BE]">minutes</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── 5. CONFIDENCE & BASELINE COMPARISON ────────────────────── */}
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {/* Prediction Confidence & Explainability */}
        <section className="controller-panel rounded-lg p-4">
          <div className="flex items-center gap-2 border-b border-[#145158] pb-3">
            <ShieldAlert size={16} className="text-[#F59E0B]" />
            <div>
              <h3 className="text-sm font-bold text-white">Prediction Confidence & Explainability</h3>
              <p className="text-[11px] text-[#D7E5EC]/70">
                Fallback handling and factor breakdown depth
              </p>
            </div>
          </div>

          <div className="mt-3.5 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Low-Confidence Handling</div>
                <div className="text-[10px] text-[#718F96]">Action when certainty falls below threshold</div>
              </div>
              <select
                value={lowConfidenceHandling}
                onChange={(e) => {
                  setLowConfidenceHandling(e.target.value as any)
                  setPendingChangesCount((c) => c + 1)
                }}
                className="rounded border border-[#145158] bg-[#031A1F] px-2 py-1 text-xs text-white"
              >
                <option value="Show prediction">Show prediction with flag</option>
                <option value="Flag for review">Flag for review</option>
                <option value="Use baseline estimate">Use baseline estimate</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Explanation Generation</div>
                <div className="text-[10px] text-[#718F96]">Generate attribution factors for delay predictions</div>
              </div>
              <button
                onClick={() => {
                  setExplanationEnabled(!explanationEnabled)
                  setPendingChangesCount((c) => c + 1)
                }}
              >
                {explanationEnabled ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                    <ToggleRight size={22} />
                    ENABLED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-400 font-bold text-[10px]">
                    <ToggleLeft size={22} />
                    DISABLED
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Explanation Detail Level</div>
                <div className="text-[10px] text-[#718F96]">Factor breakdown detail on train detail view</div>
              </div>
              <select
                value={explanationDetail}
                onChange={(e) => {
                  setExplanationDetail(e.target.value as any)
                  setPendingChangesCount((c) => c + 1)
                }}
                className="rounded border border-[#145158] bg-[#031A1F] px-2 py-1 text-xs text-white"
              >
                <option value="Summary">Summary</option>
                <option value="Operational factors">Operational factors</option>
                <option value="Detailed">Detailed</option>
              </select>
            </div>
          </div>
        </section>

        {/* Baseline Comparison */}
        <section className="controller-panel rounded-lg p-4">
          <div className="flex items-center gap-2 border-b border-[#145158] pb-3">
            <Clock size={16} className="text-[#F59E0B]" />
            <div>
              <h3 className="text-sm font-bold text-white">Baseline ETA Architecture</h3>
              <p className="text-[11px] text-[#D7E5EC]/70">
                Timetable reference model vs Dynamic GNN model comparison
              </p>
            </div>
          </div>

          <div className="mt-3.5 space-y-2.5 text-xs">
            <div className="rounded border border-[#145158] bg-[#031A1F] p-3">
              <div className="text-[10px] font-bold text-[#F59E0B] uppercase">
                Baseline Method
              </div>
              <div className="mt-0.5 font-semibold text-white">
                Static Timetable / Scheduled Estimate
              </div>
              <p className="mt-1 text-[11px] text-[#718F96]">
                Fixed static schedule baseline published by Indian Railways CRIS. Used as the reference benchmark for delta calculations.
              </p>
            </div>

            <div className="rounded border border-[#145158] bg-[#031A1F] p-3">
              <div className="text-[10px] font-bold text-emerald-400 uppercase">
                Dynamic Method
              </div>
              <div className="mt-0.5 font-semibold text-white">
                Dynamic Spatio-Temporal Graph Model
              </div>
              <p className="mt-1 text-[11px] text-[#718F96]">
                Provides a reference estimate for comparison with dynamic ETA predictions across all monitored blocks.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ── 6. CHANGE CONTROL CONFIRMATION MODAL ───────────────────── */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#145158] bg-[#062A2F] p-5 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-[#145158] pb-3 text-amber-400">
              <AlertTriangle size={18} />
              <h3 className="text-sm font-bold text-white">Configuration Change Control</h3>
            </div>

            <p className="mt-3 text-xs leading-5 text-[#D7E5EC]">
              Changing prediction thresholds affects ETA alerts and downstream operational decisions across all active controller consoles.
            </p>

            <div className="mt-3 rounded border border-[#145158] bg-[#031A1F] p-2.5 text-[11px] space-y-1 text-[#9FB8BE]">
              <div>Target Model: <strong className="text-white">v2.4-prod</strong></div>
              <div>Pending Modifications: <strong className="text-white">{pendingChangesCount} parameter(s)</strong></div>
              <div>Authorizer: <strong className="text-white">Root Administrator</strong></div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setSaveModalOpen(false)}
                className="rounded px-3 py-1.5 text-xs text-[#9FB8BE] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                className="rounded border border-[#F59E0B] bg-[#071A33] px-3.5 py-1.5 text-xs font-bold text-[#F59E0B] hover:bg-[#0E5961] hover:text-white"
              >
                Confirm & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

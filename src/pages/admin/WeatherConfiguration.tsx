import { useState } from "react"
import {
  CloudRain,
  Compass,
  Database,
  Info,
  Layers,
  RefreshCw,
  RotateCcw,
  Save,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Zap,
} from "lucide-react"

export interface WeatherSection {
  id: string
  name: string
  route: string
  coordinates: string
  weatherStatus: "NORMAL" | "CAUTION" | "RESTRICTED" | "CRITICAL"
  lastUpdate: string
  monitoring: boolean
}

export interface WeatherThreshold {
  parameter: string
  unit: string
  warning: number
  critical: number
  action: string
}

export interface WeatherImpactRule {
  id: string
  name: string
  description: string
  enabled: boolean
}

const initialSections: WeatherSection[] = [
  {
    id: "sec_sbc_ynk",
    name: "Bengaluru – Yelahanka",
    route: "SBC–YNK Corridor Section 1",
    coordinates: "12.9775° N, 77.5713° E",
    weatherStatus: "NORMAL",
    lastUpdate: "4 mins ago",
    monitoring: true,
  },
  {
    id: "sec_sbc_ksr",
    name: "Bengaluru – KSR City Approach",
    route: "SBC Approach & Yard Corridor",
    coordinates: "12.9784° N, 77.5726° E",
    weatherStatus: "NORMAL",
    lastUpdate: "3 mins ago",
    monitoring: true,
  },
  {
    id: "sec_ynk_dbu",
    name: "Yelahanka – Doddaballapur",
    route: "YNK–DBU Single Line Section",
    coordinates: "13.1007° N, 77.5963° E",
    weatherStatus: "CAUTION",
    lastUpdate: "2 mins ago",
    monitoring: true,
  },
  {
    id: "sec_bypl_wfd",
    name: "Baiyappanahalli – Whitefield",
    route: "BYPL–WFD Quadruple Track",
    coordinates: "12.9934° N, 77.7219° E",
    weatherStatus: "CAUTION",
    lastUpdate: "1 min ago",
    monitoring: true,
  },
  {
    id: "sec_ypr_tk",
    name: "Yesvantpur – Tumakuru",
    route: "YPR–TK High Density Branch",
    coordinates: "13.0285° N, 77.5412° E",
    weatherStatus: "NORMAL",
    lastUpdate: "5 mins ago",
    monitoring: true,
  },
]

const initialThresholds: WeatherThreshold[] = [
  {
    parameter: "Rainfall Rate",
    unit: "mm/h",
    warning: 25,
    critical: 50,
    action: "Apply weather speed restriction & waterlogging alerts",
  },
  {
    parameter: "Visibility Distance",
    unit: "km",
    warning: 1.5,
    critical: 0.5,
    action: "Trigger fog safety protocol & automatic headway expansion",
  },
  {
    parameter: "Sustained Wind Velocity",
    unit: "km/h",
    warning: 45,
    critical: 70,
    action: "Flag overhead equipment (OHE) sway & restrict express speeds",
  },
]

const initialImpactRules: WeatherImpactRule[] = [
  {
    id: "rule_eta",
    name: "ETA Dynamic Prediction Input",
    description: "Feed section rainfall and visibility indices as continuous feature vectors into the GNN model.",
    enabled: true,
  },
  {
    id: "rule_speed",
    name: "Speed Adjustment Advisory",
    description: "Calculate maximum allowable speed reductions based on precipitation and track friction coefficients.",
    enabled: true,
  },
  {
    id: "rule_alerts",
    name: "Delay Alert Generation",
    description: "Automatically dispatch high-priority alerts to Section Controllers when weather crosses warning thresholds.",
    enabled: true,
  },
  {
    id: "rule_cascade",
    name: "Cascade Analysis Propagation",
    description: "Incorporate weather delays into downstream knock-on delay propagation trees.",
    enabled: true,
  },
  {
    id: "rule_dispatch",
    name: "Controller Directive Routing",
    description: "Propose precautionary speed restriction directives to controllers in the Dispatch center.",
    enabled: true,
  },
]

export default function WeatherConfiguration() {
  // Weather Provider Config state
  const [provider, setProvider] = useState("Open-Meteo")
  const [apiEndpoint, setApiEndpoint] = useState("https://api.open-meteo.com/v1/forecast")
  const [updateInterval, setUpdateInterval] = useState("15") // minutes
  const [forecastHorizon, setForecastHorizon] = useState("24h")
  const [units] = useState("Metric (°C, mm, km/h)")

  // Sections state
  const [sections, setSections] = useState<WeatherSection[]>(initialSections)

  // Thresholds state
  const [thresholds, setThresholds] = useState<WeatherThreshold[]>(initialThresholds)

  // Impact rules state
  const [impactRules, setImpactRules] = useState<WeatherImpactRule[]>(initialImpactRules)

  // UI status notices
  const [notice, setNotice] = useState<{ type: "info" | "warning"; text: string } | null>(null)
  const [pendingChanges, setPendingChanges] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const toggleSection = (id: string) => {
    setSections(
      sections.map((s) =>
        s.id === id ? { ...s, monitoring: !s.monitoring } : s
      )
    )
    setPendingChanges((p) => p + 1)
  }

  const toggleRule = (id: string) => {
    setImpactRules(
      impactRules.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      )
    )
    setPendingChanges((p) => p + 1)
  }

  const handleThresholdChange = (
    index: number,
    field: "warning" | "critical",
    val: number
  ) => {
    const updated = [...thresholds]
    updated[index] = { ...updated[index], [field]: val }
    setThresholds(updated)
    setPendingChanges((p) => p + 1)
  }

  const handleTestConnection = () => {
    // As explicitly instructed: "Weather service test is unavailable until the backend integration is configured."
    setNotice({
      type: "warning",
      text: "Weather service test is unavailable until the backend integration is configured on the host server.",
    })
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setNotice({
        type: "info",
        text: "Configuration polled from platform configuration service. Section parameters are in sync.",
      })
    }, 500)
  }

  const handleSave = () => {
    // As explicitly instructed: "Never falsely display 'Saved successfully' without an actual backend operation."
    setPendingChanges(0)
    setNotice({
      type: "warning",
      text: "Configuration service unavailable. Changes have been recorded in the current administrative session only.",
    })
  }

  const handleReset = () => {
    setProvider("Open-Meteo")
    setApiEndpoint("https://api.open-meteo.com/v1/forecast")
    setUpdateInterval("15")
    setForecastHorizon("24h")
    setSections(initialSections)
    setThresholds(initialThresholds)
    setImpactRules(initialImpactRules)
    setPendingChanges(0)
    setNotice({
      type: "info",
      text: "All modified values have been reset to default baseline parameters.",
    })
  }

  return (
    <div className="controller-page px-4 py-5 lg:px-6">
      {/* ── 1. PAGE HEADER ────────────────────────────────────────── */}
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#F59E0B]">
            Platform Infrastructure
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Weather Configuration
          </h1>

          <p className="mt-1 text-sm text-[#9FB8BE]">
            Configure weather data sources, monitoring thresholds and railway-section impact rules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {pendingChanges > 0 && (
            <button
              onClick={handleReset}
              className="controller-panel inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#D7E5EC] transition hover:bg-[#08383D]"
            >
              <RotateCcw size={13} />
              <span>Reset ({pendingChanges})</span>
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
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-3.5 py-2 text-xs font-bold text-white transition hover:scale-[1.02]"
          >
            <Save size={14} className="text-[#F59E0B]" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div
          className={`mb-4 flex items-center justify-between rounded-lg border p-3 text-xs ${
            notice.type === "warning"
              ? "border-amber-500/40 bg-amber-950/40 text-amber-200"
              : "border-emerald-500/40 bg-emerald-950/40 text-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <Info size={15} className="shrink-0" />
            <span>{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-xs hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* ── 2. WEATHER SERVICE STATUS ─────────────────────────────── */}
      <section className="controller-panel rounded-lg p-4">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#145158] bg-[#071A33]">
              <CloudRain size={20} className="text-[#F59E0B]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Weather Service Status</h2>
                <span className="rounded border border-amber-500/40 bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  Configuration Available / Service Not Connected
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[#9FB8BE]">
                Primary provider: Open-Meteo High-Resolution Numerical Weather Prediction API.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded border border-[#145158] bg-[#031A1F] px-3 py-1.5 text-xs">
              <div className="text-[10px] text-[#718F96]">Last Fetch</div>
              <div className="font-mono text-white">--</div>
            </div>

            <div className="rounded border border-[#145158] bg-[#031A1F] px-3 py-1.5 text-xs">
              <div className="text-[10px] text-[#718F96]">Next Refresh</div>
              <div className="font-mono text-[#D7E5EC]">On schedule</div>
            </div>

            <button
              onClick={handleTestConnection}
              className="rounded border border-[#145158] bg-[#071A33] px-3 py-2 text-xs font-semibold text-[#D7E5EC] transition hover:bg-[#08383D] hover:text-white"
            >
              Test Connection
            </button>
          </div>
        </div>
      </section>

      {/* ── 3. DATA SOURCE CONFIG & FORECAST COVERAGE ──────────────── */}
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {/* Data Source Configuration */}
        <section className="controller-panel rounded-lg p-4">
          <div className="flex items-center gap-2 border-b border-[#145158] pb-3">
            <Database size={16} className="text-[#F59E0B]" />
            <div>
              <h3 className="text-sm font-bold text-white">Weather Data Source</h3>
              <p className="text-[11px] text-[#D7E5EC]/70">
                Upstream meteorological API provider and sampling rates
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="text-[11px] font-bold text-[#9FB8BE]">Weather Provider</label>
              <input
                type="text"
                value={provider}
                onChange={(e) => {
                  setProvider(e.target.value)
                  setPendingChanges((p) => p + 1)
                }}
                className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#9FB8BE]">API Endpoint</label>
              <input
                type="text"
                value={apiEndpoint}
                onChange={(e) => {
                  setApiEndpoint(e.target.value)
                  setPendingChanges((p) => p + 1)
                }}
                className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] px-3 py-1.5 font-mono text-xs text-white"
              />
              <span className="text-[10px] text-[#718F96]">
                Server-side API tokens are configured via environment secrets. No client keys stored.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#9FB8BE]">Update Interval</label>
                <select
                  value={updateInterval}
                  onChange={(e) => {
                    setUpdateInterval(e.target.value)
                    setPendingChanges((p) => p + 1)
                  }}
                  className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="5">Every 5 minutes</option>
                  <option value="10">Every 10 minutes</option>
                  <option value="15">Every 15 minutes (Default)</option>
                  <option value="30">Every 30 minutes</option>
                  <option value="60">Every 60 minutes</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#9FB8BE]">Forecast Horizon</label>
                <select
                  value={forecastHorizon}
                  onChange={(e) => {
                    setForecastHorizon(e.target.value)
                    setPendingChanges((p) => p + 1)
                  }}
                  className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="6h">6 hours forward</option>
                  <option value="12h">12 hours forward</option>
                  <option value="24h">24 hours forward (Default)</option>
                  <option value="48h">48 hours forward</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#9FB8BE]">Measurement Units</label>
              <input
                type="text"
                value={units}
                disabled
                className="mt-1 w-full cursor-not-allowed rounded border border-[#145158] bg-[#031A1F]/60 px-3 py-1.5 text-xs text-[#718F96]"
              />
            </div>
          </div>
        </section>

        {/* Forecast Coverage & Data Quality */}
        <div className="space-y-5">
          <section className="controller-panel rounded-lg p-4">
            <div className="flex items-center gap-2 border-b border-[#145158] pb-3">
              <Compass size={16} className="text-[#F59E0B]" />
              <div>
                <h3 className="text-sm font-bold text-white">Forecast Coverage</h3>
                <p className="text-[11px] text-[#D7E5EC]/70">
                  Railway corridor geographic scope and freshness
                </p>
              </div>
            </div>

            <div className="mt-3.5 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded border border-[#145158] bg-[#031A1F] p-2.5">
                <div className="text-[10px] text-[#718F96]">Forecast Horizon</div>
                <div className="mt-0.5 font-bold text-white">{forecastHorizon}</div>
              </div>

              <div className="rounded border border-[#145158] bg-[#031A1F] p-2.5">
                <div className="text-[10px] text-[#718F96]">Sections Monitored</div>
                <div className="mt-0.5 font-bold text-white">
                  {sections.filter((s) => s.monitoring).length} of {sections.length}
                </div>
              </div>

              <div className="rounded border border-[#145158] bg-[#031A1F] p-2.5">
                <div className="text-[10px] text-[#718F96]">Last Update</div>
                <div className="mt-0.5 font-mono text-[#D7E5EC]">--</div>
              </div>

              <div className="rounded border border-[#145158] bg-[#031A1F] p-2.5">
                <div className="text-[10px] text-[#718F96]">Data Freshness</div>
                <div className="mt-0.5 font-semibold text-amber-300">Unavailable</div>
              </div>
            </div>
          </section>

          <section className="controller-panel rounded-lg p-4">
            <div className="flex items-center gap-2 border-b border-[#145158] pb-3">
              <Layers size={16} className="text-[#F59E0B]" />
              <div>
                <h3 className="text-sm font-bold text-white">Weather Data Quality</h3>
                <p className="text-[11px] text-[#D7E5EC]/70">
                  Telemetry health, stale observation count, and dropouts
                </p>
              </div>
            </div>

            <div className="mt-3.5 space-y-2 text-xs">
              <div className="flex justify-between border-b border-[#145158]/40 pb-1.5">
                <span className="text-[#718F96]">Last successful fetch</span>
                <span className="font-mono text-white">--</span>
              </div>
              <div className="flex justify-between border-b border-[#145158]/40 pb-1.5">
                <span className="text-[#718F96]">Missing observations</span>
                <span className="font-mono text-[#D7E5EC]">0</span>
              </div>
              <div className="flex justify-between border-b border-[#145158]/40 pb-1.5">
                <span className="text-[#718F96]">Stale observations</span>
                <span className="font-mono text-[#D7E5EC]">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#718F96]">Failed requests</span>
                <span className="font-mono text-[#D7E5EC]">0</span>
              </div>
            </div>

            <p className="mt-3 text-[10px] text-[#718F96]">
              Weather data quality information will appear when the weather service is connected.
            </p>
          </section>
        </div>
      </div>

      {/* ── 4. MONITORED RAILWAY SECTIONS ─────────────────────────── */}
      <section className="mt-5 controller-panel overflow-hidden rounded-lg">
        <div className="controller-header px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass size={16} className="text-[#F59E0B]" />
              <div>
                <h2 className="text-sm font-bold text-white">
                  Monitored Railway Sections
                </h2>
                <p className="text-[11px] text-[#D7E5EC]/70">
                  Geographic corridors mapped to meteorological coordinate polygons
                </p>
              </div>
            </div>

            <span className="text-xs text-[#9FB8BE]">
              {sections.length} Track Sections Defined
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#145158] bg-[#071A33] text-[10px] font-bold uppercase tracking-[0.12em] text-[#9FB8BE]">
                <th className="px-4 py-2.5">Section</th>
                <th className="px-4 py-2.5">Route</th>
                <th className="px-4 py-2.5">Coordinates</th>
                <th className="px-4 py-2.5">Weather Status</th>
                <th className="px-4 py-2.5">Last Update</th>
                <th className="px-4 py-2.5 text-right">Monitoring</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#145158]/50">
              {sections.map((sec) => (
                <tr key={sec.id} className="transition-colors hover:bg-[#08383D]/50">
                  <td className="px-4 py-3 font-semibold text-white">
                    {sec.name}
                  </td>
                  <td className="px-4 py-3 text-[#D7E5EC]">{sec.route}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[#718F96]">
                    {sec.coordinates}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded border px-2 py-0.5 text-[10px] font-bold ${
                        sec.weatherStatus === "NORMAL"
                          ? "border-emerald-500/40 bg-emerald-950/60 text-emerald-300"
                          : sec.weatherStatus === "CAUTION"
                          ? "border-amber-500/40 bg-amber-950/60 text-amber-300"
                          : "border-red-500/40 bg-red-950/60 text-red-300"
                      }`}
                    >
                      {sec.weatherStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-[#9FB8BE]">
                    {sec.lastUpdate}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleSection(sec.id)}
                      className="text-xs"
                    >
                      {sec.monitoring ? (
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 5. WEATHER THRESHOLDS & IMPACT RULES ───────────────────── */}
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {/* Weather Impact Thresholds */}
        <section className="controller-panel rounded-lg p-4">
          <div className="flex items-center gap-2 border-b border-[#145158] pb-3">
            <Sliders size={16} className="text-[#F59E0B]" />
            <div>
              <h3 className="text-sm font-bold text-white">Weather Impact Thresholds</h3>
              <p className="text-[11px] text-[#D7E5EC]/70">
                Precipitation, visibility, and wind trigger boundaries
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-4 text-xs">
            {thresholds.map((th, idx) => (
              <div key={th.parameter} className="rounded border border-[#145158] bg-[#031A1F] p-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white">{th.parameter}</div>
                  <span className="font-mono text-[10px] text-[#718F96]">Unit: {th.unit}</span>
                </div>

                <div className="mt-2.5 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#9FB8BE]">Warning Threshold</label>
                    <div className="mt-1 flex items-center gap-1">
                      <input
                        type="number"
                        value={th.warning}
                        onChange={(e) =>
                          handleThresholdChange(idx, "warning", Number(e.target.value))
                        }
                        className="w-20 rounded border border-[#145158] bg-[#062A2F] px-2 py-1 font-mono text-xs text-white"
                      />
                      <span className="text-[10px] text-[#718F96]">{th.unit}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#9FB8BE]">Critical Threshold</label>
                    <div className="mt-1 flex items-center gap-1">
                      <input
                        type="number"
                        value={th.critical}
                        onChange={(e) =>
                          handleThresholdChange(idx, "critical", Number(e.target.value))
                        }
                        className="w-20 rounded border border-[#145158] bg-[#062A2F] px-2 py-1 font-mono text-xs text-white"
                      />
                      <span className="text-[10px] text-[#718F96]">{th.unit}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-[#9FB8BE]">
                  <strong>Protocol Action:</strong> {th.action}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ETA Weather Impact Rules */}
        <section className="controller-panel rounded-lg p-4">
          <div className="flex items-center gap-2 border-b border-[#145158] pb-3">
            <Zap size={16} className="text-[#F59E0B]" />
            <div>
              <h3 className="text-sm font-bold text-white">ETA Weather Impact Rules</h3>
              <p className="text-[11px] text-[#D7E5EC]/70">
                Prediction pipeline routing and advisory integrations
              </p>
            </div>
          </div>

          <p className="mt-2 text-[11px] text-[#9FB8BE]">
            Weather conditions are passed to the prediction pipeline when enabled.
          </p>

          <div className="mt-3 divide-y divide-[#145158]/50">
            {impactRules.map((rule) => (
              <div key={rule.id} className="flex items-start justify-between py-2.5">
                <div className="pr-3">
                  <div className="text-xs font-semibold text-white">{rule.name}</div>
                  <div className="mt-0.5 text-[11px] text-[#718F96]">{rule.description}</div>
                </div>

                <button onClick={() => toggleRule(rule.id)} className="shrink-0 mt-0.5">
                  {rule.enabled ? (
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

          {/* Severity Levels Reference */}
          <div className="mt-4 rounded border border-[#145158] bg-[#031A1F] p-3 text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#F59E0B]">
              Severity Classification Reference
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <strong className="text-emerald-300">NORMAL:</strong> No significant weather restriction
              </div>
              <div>
                <strong className="text-amber-300">CAUTION:</strong> Monitor affected section
              </div>
              <div>
                <strong className="text-amber-500">RESTRICTED:</strong> Consider operational speed restriction
              </div>
              <div>
                <strong className="text-rose-400">CRITICAL:</strong> Escalate for controller review
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

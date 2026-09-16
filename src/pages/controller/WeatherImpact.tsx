import { useState, useEffect } from "react"
import {
  CloudRain,
  Eye,
  Gauge,
  MapPin,
  Thermometer,
  Wind,
  AlertTriangle,
  Clock3,
  ArrowRight,
  RefreshCw,
  Radio,
  Zap,
} from "lucide-react"
import { Link } from "react-router-dom"
import {
  weatherService,
  type ControllerWeatherSection,
  type ControllerWeatherResponse,
} from "../../services/weatherService"

const initialSections: ControllerWeatherSection[] = [
  {
    section: "Bengaluru – KSR",
    condition: "Clear Sky",
    rainfall: "0.0 mm/hr",
    visibility: "10+ km",
    wind: "11 km/h",
    temperature: "24.8°C",
    impact: "None",
    speedImpact: "0 km/h",
    affectedTrains: ["12628", "20608"],
  },
  {
    section: "KSR – Baiyappanahalli",
    condition: "Moderate Rain",
    rainfall: "14.2 mm/hr",
    visibility: "4.8 km",
    wind: "18 km/h",
    temperature: "23.5°C",
    impact: "Medium",
    speedImpact: "-10 km/h",
    affectedTrains: ["12627", "16589"],
  },
  {
    section: "Baiyappanahalli – Whitefield",
    condition: "Heavy Rain",
    rainfall: "28.5 mm/hr",
    visibility: "2.4 km",
    wind: "24 km/h",
    temperature: "22.8°C",
    impact: "High",
    speedImpact: "-20 km/h",
    affectedTrains: ["16526", "12245"],
  },
  {
    section: "Whitefield – Malur",
    condition: "Partly Cloudy",
    rainfall: "0.0 mm/hr",
    visibility: "9.5 km",
    wind: "9 km/h",
    temperature: "25.2°C",
    impact: "None",
    speedImpact: "0 km/h",
    affectedTrains: ["12860"],
  },
]

function ImpactBadge({ impact }: { impact: string }) {
  const styles = {
    High: "border-red-500/40 bg-red-500/10 text-red-400",
    Medium: "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]",
    Low: "border-blue-400/40 bg-blue-400/10 text-blue-300",
    None: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  }

  return (
    <span
      className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase ${
        styles[impact as keyof typeof styles] || styles.None
      }`}
    >
      {impact}
    </span>
  )
}

function WeatherImpact() {
  const [sections, setSections] = useState<ControllerWeatherSection[]>(initialSections)
  const [summary, setSummary] = useState({
    affectedSections: 2,
    highImpact: 1,
    trainsAffected: 5,
    forecastWindow: "6 hrs",
  })
  const [forecast, setForecast] = useState<Array<{ time: string; condition: string; fullCondition: string; temp: string; precip?: string }>>([
    { time: "Now", condition: "Rain", fullCondition: "Moderate Rain", temp: "23°C" },
    { time: "+1h", condition: "Rain", fullCondition: "Moderate Rain", temp: "23°C" },
    { time: "+2h", condition: "Heavy", fullCondition: "Heavy Rain", temp: "22°C" },
    { time: "+3h", condition: "Heavy", fullCondition: "Heavy Rain", temp: "22°C" },
    { time: "+4h", condition: "Light", fullCondition: "Light Rain", temp: "23°C" },
    { time: "+5h", condition: "Clear", fullCondition: "Clear Sky", temp: "24°C" },
  ])
  const [advisories, setAdvisories] = useState<Array<{ id: string; title: string; type: "CRITICAL" | "CAUTION" | "INFO"; message: string }>>([
    {
      id: "adv_speed",
      title: "Speed restriction advised",
      type: "CRITICAL",
      message: "Heavy rainfall around Baiyappanahalli may require reduced operating speed. GNN headway adjusted.",
    },
    {
      id: "adv_downstream",
      title: "Downstream monitoring",
      type: "INFO",
      message: "Continue monitoring Whitefield and Malur sections for changing meteorological conditions.",
    },
  ])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSync, setLastSync] = useState<string>("Just now")

  const loadData = async () => {
    try {
      const data: ControllerWeatherResponse = await weatherService.getControllerWeather()
      if (data && data.success) {
        if (Array.isArray(data.sections) && data.sections.length > 0) {
          setSections(data.sections)
        }
        if (data.summary) {
          setSummary(data.summary)
        }
        if (Array.isArray(data.forecast) && data.forecast.length > 0) {
          setForecast(data.forecast)
        }
        if (Array.isArray(data.advisories) && data.advisories.length > 0) {
          setAdvisories(data.advisories)
        }
        const now = new Date()
        setLastSync(
          now.toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }) + " IST"
        )
      }
    } catch (err) {
      console.warn("Controller weather sync failed", err)
    }
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 20000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await loadData()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="controller-page min-h-full px-4 py-5 lg:px-6">
      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#F59E0B]">
            <Radio size={14} className="text-[#F59E0B] animate-pulse" />
            <span>Environmental Conditions & Corridor Telemetry</span>
          </div>

          <h1 className="mt-1 text-2xl font-bold text-white">
            Weather Impact Desk
          </h1>

          <p className="mt-1 text-sm text-[#9FB8BE]">
            Real-time meteorological monitoring and operational impact assessments across active railway sections.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-block text-[11px] font-mono text-[#718F96]">
            Telemetry Linked: {lastSync}
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-lg border border-[#145158] bg-[#062A2F] hover:bg-[#0E5961] px-3.5 py-2 text-xs font-semibold text-white transition disabled:opacity-60"
            title="Poll real-time weather & corridor telemetry"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin text-[#F59E0B]" : "text-cyan-400"} />
            <span>{isRefreshing ? "Syncing..." : "Sync Weather Telemetry"}</span>
          </button>
        </div>
      </div>

      {/* ── KPI METRICS ──────────────────────────────────────────────────────── */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="controller-panel rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9FB8BE]">
              Affected Sections
            </span>
            <MapPin size={17} className="text-[#F59E0B]" />
          </div>

          <div className="mt-2 text-2xl font-bold text-white font-mono">{summary.affectedSections}</div>

          <div className="mt-1 text-[11px] text-[#9FB8BE]">
            Sections with weather warnings
          </div>
        </div>

        <div className="controller-panel rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9FB8BE]">
              High Impact Sections
            </span>
            <AlertTriangle size={17} className="text-red-400" />
          </div>

          <div className="mt-2 text-2xl font-bold text-red-400 font-mono">
            {summary.highImpact}
          </div>

          <div className="mt-1 text-[11px] text-red-300/80">
            Requires precautionary speed orders
          </div>
        </div>

        <div className="controller-panel rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9FB8BE]">
              Corridor Trains Traversing
            </span>
            <Gauge size={17} className="text-cyan-400" />
          </div>

          <div className="mt-2 text-2xl font-bold text-white font-mono">{summary.trainsAffected}</div>

          <div className="mt-1 text-[11px] text-cyan-300/80">
            Active monitored rakes in weather zones
          </div>
        </div>

        <div className="controller-panel rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9FB8BE]">
              Forecast Window
            </span>
            <Clock3 size={17} className="text-[#F59E0B]" />
          </div>

          <div className="mt-2 text-2xl font-bold text-white font-mono">
            {summary.forecastWindow}
          </div>

          <div className="mt-1 text-[11px] text-[#9FB8BE]">
            Open-Meteo forward forecast
          </div>
        </div>
      </div>

      {/* ── TABLE: NETWORK WEATHER CONDITIONS ─────────────────────────────────── */}
      <section className="controller-panel overflow-hidden rounded-lg">
        <div className="controller-header px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">
              Network Weather Conditions (Live Section Telemetry)
            </h2>
            <p className="mt-0.5 text-xs text-[#D7E5EC]/70">
              Live meteorological observations correlated with real-time train positions
            </p>
          </div>
          <span className="rounded bg-[#062A2F] border border-[#145158] px-2.5 py-1 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            Live Synced
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="border-b border-[#145158] bg-[#08383D]">
              <tr className="text-[10px] uppercase tracking-wide text-[#9FB8BE]">
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3">Condition</th>
                <th className="px-4 py-3">Rainfall</th>
                <th className="px-4 py-3">Visibility</th>
                <th className="px-4 py-3">Wind</th>
                <th className="px-4 py-3">Temperature</th>
                <th className="px-4 py-3">Impact</th>
                <th className="px-4 py-3">Speed Adjustment</th>
                <th className="px-4 py-3">Affected Rakes</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#145158]/50">
              {sections.map((section) => (
                <tr
                  key={section.section}
                  className="border-b border-[#145158] last:border-0 hover:bg-[#08383D]/60 transition-colors"
                >
                  <td className="px-4 py-3.5 font-semibold text-white">
                    {section.section}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2 text-white">
                      <CloudRain
                        size={15}
                        className="text-cyan-400 shrink-0"
                      />
                      <span className="font-medium">{section.condition}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 font-mono text-cyan-300">
                    {section.rainfall}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-[#D7E5EC]">
                      <Eye size={13} className="text-[#718F96]" />
                      <span>{section.visibility}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-[#D7E5EC]">
                      <Wind size={13} className="text-[#718F96]" />
                      <span>{section.wind}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-amber-300 font-mono">
                      <Thermometer size={13} className="text-[#718F96]" />
                      <span>{section.temperature}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <ImpactBadge impact={section.impact} />
                  </td>

                  <td className="px-4 py-3.5 font-mono font-bold text-[#F59E0B]">
                    {section.speedImpact}
                  </td>

                  <td className="px-4 py-3.5">
                    {section.affectedTrains && section.affectedTrains.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {section.affectedTrains.map((tr) => (
                          <Link
                            key={tr}
                            to={`/controller/trains/${tr}`}
                            className="inline-flex items-center gap-1 rounded bg-[#031A1F] border border-[#145158] px-2 py-0.5 text-[10px] font-mono font-bold text-[#0E7C86] hover:text-[#F59E0B] hover:border-[#F59E0B] transition"
                            title={`Inspect train #${tr} telemetry and delay breakdown`}
                          >
                            #{tr}
                            <ArrowRight size={10} />
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#71899C]">Clear corridor</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 6-HOUR FORECAST & OPERATIONAL ASSESSMENTS ───────────────────────── */}
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <section className="controller-panel rounded-lg p-5">
          <div className="flex items-center gap-3 border-b border-[#145158] pb-3">
            <CloudRain size={19} className="text-[#F59E0B]" />
            <div>
              <h2 className="text-sm font-bold text-white">
                Open-Meteo High-Resolution 6-Hour Forecast
              </h2>
              <p className="text-[11px] text-[#9FB8BE]">
                Forward weather timeline for Bangalore railway division
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
            {forecast.map((fc) => (
              <div
                key={fc.time}
                className="rounded-md border border-[#145158] bg-[#08383D] p-2.5 text-center transition hover:border-[#0E7C86]"
              >
                <div className="text-[10px] font-bold text-[#9FB8BE] font-mono">
                  {fc.time}
                </div>

                <CloudRain
                  size={17}
                  className="mx-auto my-2 text-cyan-400"
                />

                <div className="text-[11px] font-semibold text-white">
                  {fc.condition}
                </div>

                <div className="mt-1 text-[10px] font-mono text-amber-300">
                  {fc.temp}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="controller-panel rounded-lg p-5">
          <div className="flex items-center gap-3 border-b border-[#145158] pb-3">
            <AlertTriangle
              size={19}
              className="text-[#F59E0B]"
            />
            <div>
              <h2 className="text-sm font-bold text-white">
                Operational Assessment & Controller Advisories
              </h2>
              <p className="text-[11px] text-[#9FB8BE]">
                Automated weather-driven speed restrictions and dispatch directives
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {advisories.map((adv) => (
              <div
                key={adv.id}
                className={`rounded-md border p-3 ${
                  adv.type === "CRITICAL"
                    ? "border-red-500/40 bg-red-950/20"
                    : adv.type === "CAUTION"
                    ? "border-[#F59E0B]/30 bg-[#F59E0B]/10"
                    : "border-[#145158] bg-[#08383D]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap size={14} className={adv.type === "CRITICAL" ? "text-red-400" : "text-[#F59E0B]"} />
                  <div
                    className={`text-xs font-bold ${
                      adv.type === "CRITICAL"
                        ? "text-red-300"
                        : adv.type === "CAUTION"
                        ? "text-[#F59E0B]"
                        : "text-white"
                    }`}
                  >
                    {adv.title}
                  </div>
                </div>

                <div className="mt-1.5 text-[11px] leading-5 text-[#D7E5EC]">
                  {adv.message}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default WeatherImpact

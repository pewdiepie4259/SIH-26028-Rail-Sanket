import { useState, useEffect } from "react"
import {
  CloudRain,
  Droplets,
  Gauge,
  MapPin,
  Wind,
} from "lucide-react"
import {
  weatherService,
  type ControllerWeatherSection,
} from "../../services/weatherService"

interface WeatherZone {
  location: string
  condition: string
  rainfall: string
  visibility: string
  wind: string
  speedRestriction: string
  impact: "Low" | "Moderate" | "High"
}

const defaultWeatherZones: WeatherZone[] = [
  {
    location: "Bengaluru – KSR",
    condition: "Clear Sky",
    rainfall: "0 mm/hr",
    visibility: "10+ km",
    wind: "11 km/h",
    speedRestriction: "No restriction",
    impact: "Low",
  },
  {
    location: "KSR – Baiyappanahalli",
    condition: "Moderate Rain",
    rainfall: "14 mm/hr",
    visibility: "4.8 km",
    wind: "18 km/h",
    speedRestriction: "10 km/h reduction",
    impact: "Moderate",
  },
  {
    location: "Baiyappanahalli – Whitefield",
    condition: "Heavy Rain",
    rainfall: "28 mm/hr",
    visibility: "2.4 km",
    wind: "24 km/h",
    speedRestriction: "20 km/h reduction",
    impact: "High",
  },
]

function WeatherImpact() {
  const [zones, setZones] = useState<WeatherZone[]>(defaultWeatherZones)

  useEffect(() => {
    weatherService.getControllerWeather().then((res) => {
      if (res && res.sections && res.sections.length > 0) {
        const mapped: WeatherZone[] = res.sections.slice(0, 3).map((s: ControllerWeatherSection) => ({
          location: s.section,
          condition: s.condition,
          rainfall: s.rainfall,
          visibility: s.visibility,
          wind: s.wind,
          speedRestriction: s.speedImpact !== "0 km/h" ? `${s.speedImpact.replace("-", "")} reduction` : "No restriction",
          impact: s.impact === "High" ? "High" : s.impact === "Medium" ? "Moderate" : "Low",
        }))
        setZones(mapped)
      }
    }).catch(() => {
      // Keep defaults
    })
  }, [])

  return (
    <section className="overflow-hidden rounded-xl border border-[#16364A] bg-[#0A2036]">
      <div className="border-b border-[#16364A] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CloudRain
            size={17}
            className="text-cyan-400"
          />

          <div>
            <h3 className="text-sm font-bold text-white">
              Weather Impact & Telemetry
            </h3>

            <p className="mt-0.5 text-xs text-[#71899C]">
              Real-time environmental conditions affecting section throughput.
            </p>
          </div>
        </div>
        <span className="rounded bg-[#062A2F] border border-[#145158] px-2 py-0.5 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          Live
        </span>
      </div>

      <div className="divide-y divide-[#16364A]">
        {zones.map((zone) => (
          <div
            key={zone.location}
            className="p-4 transition-colors hover:bg-[#071A33]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <MapPin
                  size={14}
                  className="shrink-0 text-[#0E7C86]"
                />

                <div className="min-w-0">
                  <div className="truncate text-xs font-bold text-white">
                    {zone.location}
                  </div>

                  <div className="mt-0.5 text-[10px] text-cyan-300">
                    {zone.condition}
                  </div>
                </div>
              </div>

              <span
                className={`shrink-0 rounded-md border px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${
                  zone.impact === "High"
                    ? "border-red-500/40 bg-red-500/10 text-red-300"
                    : zone.impact === "Moderate"
                      ? "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                }`}
              >
                {zone.impact} impact
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-md border border-[#16364A] bg-[#071A33] p-2.5">
                <div className="flex items-center gap-1.5 text-[9px] text-[#71899C]">
                  <Droplets size={11} className="text-cyan-400" />
                  Rainfall
                </div>

                <div className="mt-1 text-[11px] font-bold text-[#D7E5EC]">
                  {zone.rainfall}
                </div>
              </div>

              <div className="rounded-md border border-[#16364A] bg-[#071A33] p-2.5">
                <div className="flex items-center gap-1.5 text-[9px] text-[#71899C]">
                  <Gauge size={11} className="text-amber-400" />
                  Visibility
                </div>

                <div className="mt-1 text-[11px] font-bold text-[#D7E5EC]">
                  {zone.visibility}
                </div>
              </div>

              <div className="rounded-md border border-[#16364A] bg-[#071A33] p-2.5">
                <div className="flex items-center gap-1.5 text-[9px] text-[#71899C]">
                  <Wind size={11} className="text-blue-400" />
                  Wind
                </div>

                <div className="mt-1 text-[11px] font-bold text-[#D7E5EC]">
                  {zone.wind}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-md border border-[#16364A] bg-[#071A33] px-3 py-2">
              <span className="text-[10px] text-[#71899C]">
                Operational effect
              </span>

              <span className="text-[10px] font-bold text-amber-300 font-mono">
                {zone.speedRestriction}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default WeatherImpact

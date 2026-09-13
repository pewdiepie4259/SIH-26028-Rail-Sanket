import {
  CloudRain,
  Droplets,
  Gauge,
  MapPin,
  Wind,
} from "lucide-react"

interface WeatherZone {
  location: string
  condition: string
  rainfall: string
  visibility: string
  wind: string
  speedRestriction: string
  impact: "Low" | "Moderate" | "High"
}

const weatherZones: WeatherZone[] = [
  {
    location: "Bengaluru East",
    condition: "Heavy Rain",
    rainfall: "38 mm/hr",
    visibility: "2.8 km",
    wind: "24 km/h",
    speedRestriction: "15 km/h reduction",
    impact: "High",
  },
  {
    location: "Krishnarajapuram",
    condition: "Moderate Rain",
    rainfall: "19 mm/hr",
    visibility: "5.4 km",
    wind: "17 km/h",
    speedRestriction: "8 km/h reduction",
    impact: "Moderate",
  },
  {
    location: "Bengaluru Cantonment",
    condition: "Light Rain",
    rainfall: "6 mm/hr",
    visibility: "8.1 km",
    wind: "11 km/h",
    speedRestriction: "No restriction",
    impact: "Low",
  },
]

function WeatherImpact() {
  return (
    <section className="overflow-hidden rounded-xl border border-[#16364A] bg-[#0A2036]">
      <div className="border-b border-[#16364A] px-5 py-4">
        <div className="flex items-center gap-2">
          <CloudRain
            size={17}
            className="text-[#0E7C86]"
          />

          <div>
            <h3 className="text-sm font-bold text-white">
              Weather Impact
            </h3>

            <p className="mt-1 text-xs text-[#71899C]">
              Weather conditions affecting train movement across the section.
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-[#16364A]">
        {weatherZones.map((zone) => (
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

                  <div className="mt-0.5 text-[10px] text-[#71899C]">
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
                  <Droplets size={11} />
                  Rainfall
                </div>

                <div className="mt-1 text-[11px] font-bold text-[#D7E5EC]">
                  {zone.rainfall}
                </div>
              </div>

              <div className="rounded-md border border-[#16364A] bg-[#071A33] p-2.5">
                <div className="flex items-center gap-1.5 text-[9px] text-[#71899C]">
                  <Gauge size={11} />
                  Visibility
                </div>

                <div className="mt-1 text-[11px] font-bold text-[#D7E5EC]">
                  {zone.visibility}
                </div>
              </div>

              <div className="rounded-md border border-[#16364A] bg-[#071A33] p-2.5">
                <div className="flex items-center gap-1.5 text-[9px] text-[#71899C]">
                  <Wind size={11} />
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

              <span className="text-[10px] font-bold text-[#D7E5EC]">
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
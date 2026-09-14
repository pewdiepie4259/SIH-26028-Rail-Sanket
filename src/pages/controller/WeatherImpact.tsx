import {
  CloudRain,
  Eye,
  Gauge,
  MapPin,
  Thermometer,
  Wind,
  AlertTriangle,
  Clock3,
} from "lucide-react"

const weatherSections = [
  {
    section: "Bengaluru – KSR",
    condition: "Moderate Rain",
    rainfall: "18 mm/hr",
    visibility: "4.2 km",
    wind: "18 km/h",
    temperature: "23°C",
    impact: "Medium",
    speedImpact: "-10 km/h",
  },
  {
    section: "KSR – Baiyappanahalli",
    condition: "Heavy Rain",
    rainfall: "32 mm/hr",
    visibility: "2.1 km",
    wind: "26 km/h",
    temperature: "22°C",
    impact: "High",
    speedImpact: "-20 km/h",
  },
  {
    section: "Baiyappanahalli – Whitefield",
    condition: "Light Rain",
    rainfall: "7 mm/hr",
    visibility: "7.5 km",
    wind: "12 km/h",
    temperature: "24°C",
    impact: "Low",
    speedImpact: "-5 km/h",
  },
  {
    section: "Whitefield – Malur",
    condition: "Clear",
    rainfall: "0 mm/hr",
    visibility: "10+ km",
    wind: "8 km/h",
    temperature: "25°C",
    impact: "None",
    speedImpact: "0 km/h",
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
        styles[impact as keyof typeof styles]
      }`}
    >
      {impact}
    </span>
  )
}

function WeatherImpact() {
  return (
    <div className="controller-page min-h-full px-4 py-5 lg:px-6">
      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#F59E0B]">
          Environmental Conditions
        </div>

        <h1 className="mt-1 text-2xl font-bold text-white">
          Weather Impact
        </h1>

        <p className="mt-1 text-sm text-[#9FB8BE]">
          Monitor weather conditions and their operational impact across the
          railway network.
        </p>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="controller-panel rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9FB8BE]">
              Affected Sections
            </span>

            <MapPin size={17} className="text-[#F59E0B]" />
          </div>

          <div className="mt-2 text-2xl font-bold">3</div>

          <div className="mt-1 text-[11px] text-[#9FB8BE]">
            Weather-related impact
          </div>
        </div>

        <div className="controller-panel rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9FB8BE]">
              High Impact
            </span>

            <AlertTriangle size={17} className="text-red-400" />
          </div>

          <div className="mt-2 text-2xl font-bold text-red-400">
            1
          </div>

          <div className="mt-1 text-[11px] text-[#9FB8BE]">
            Sections requiring attention
          </div>
        </div>

        <div className="controller-panel rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9FB8BE]">
              Trains Affected
            </span>

            <Gauge size={17} className="text-[#F59E0B]" />
          </div>

          <div className="mt-2 text-2xl font-bold">7</div>

          <div className="mt-1 text-[11px] text-[#9FB8BE]">
            Current operational impact
          </div>
        </div>

        <div className="controller-panel rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9FB8BE]">
              Forecast Window
            </span>

            <Clock3 size={17} className="text-[#F59E0B]" />
          </div>

          <div className="mt-2 text-2xl font-bold">
            6 hrs
          </div>

          <div className="mt-1 text-[11px] text-[#9FB8BE]">
            Forward weather forecast
          </div>
        </div>
      </div>

      <section className="controller-panel overflow-hidden rounded-lg">
        <div className="controller-header px-4 py-3">
          <h2 className="text-sm font-bold text-white">
            Network Weather Conditions
          </h2>

          <p className="mt-0.5 text-xs text-[#D7E5EC]/70">
            Current and forecast conditions along operational sections
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
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
              </tr>
            </thead>

            <tbody>
              {weatherSections.map((section) => (
                <tr
                  key={section.section}
                  className="border-b border-[#145158] last:border-0 hover:bg-[#08383D]/60"
                >
                  <td className="px-4 py-4 text-xs font-semibold text-white">
                    {section.section}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-xs text-[#D7E5EC]">
                      <CloudRain
                        size={15}
                        className="text-[#0E7C86]"
                      />
                      {section.condition}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-xs text-[#D7E5EC]">
                    {section.rainfall}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-xs text-[#D7E5EC]">
                      <Eye size={14} />
                      {section.visibility}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-xs text-[#D7E5EC]">
                      <Wind size={14} />
                      {section.wind}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-xs text-[#D7E5EC]">
                      <Thermometer size={14} />
                      {section.temperature}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <ImpactBadge impact={section.impact} />
                  </td>

                  <td className="px-4 py-4 text-xs font-bold text-[#F59E0B]">
                    {section.speedImpact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <section className="controller-panel rounded-lg p-5">
          <div className="flex items-center gap-3">
            <CloudRain size={19} className="text-[#F59E0B]" />

            <div>
              <h2 className="text-sm font-bold">
                Weather Forecast
              </h2>

              <p className="text-[11px] text-[#9FB8BE]">
                Expected conditions for the next six hours
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {[
              ["Now", "Rain"],
              ["+1h", "Rain"],
              ["+2h", "Heavy"],
              ["+3h", "Heavy"],
              ["+4h", "Light"],
              ["+5h", "Clear"],
            ].map(([time, condition]) => (
              <div
                key={time}
                className="rounded-md border border-[#145158] bg-[#08383D] p-3 text-center"
              >
                <div className="text-[10px] font-bold text-[#9FB8BE]">
                  {time}
                </div>

                <CloudRain
                  size={17}
                  className="mx-auto my-2 text-[#0E7C86]"
                />

                <div className="text-[10px] font-semibold">
                  {condition}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="controller-panel rounded-lg p-5">
          <div className="flex items-center gap-3">
            <AlertTriangle
              size={19}
              className="text-[#F59E0B]"
            />

            <div>
              <h2 className="text-sm font-bold">
                Operational Assessment
              </h2>

              <p className="text-[11px] text-[#9FB8BE]">
                Weather-driven operational recommendations
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-md border border-[#F59E0B]/30 bg-[#F59E0B]/5 p-3">
              <div className="text-xs font-bold text-[#F59E0B]">
                Speed restriction advised
              </div>

              <div className="mt-1 text-[11px] leading-5 text-[#D7E5EC]">
                Heavy rainfall around Baiyappanahalli may require
                reduced operating speed.
              </div>
            </div>

            <div className="rounded-md border border-[#145158] bg-[#08383D] p-3">
              <div className="text-xs font-bold text-white">
                Downstream monitoring
              </div>

              <div className="mt-1 text-[11px] leading-5 text-[#9FB8BE]">
                Continue monitoring Whitefield and Malur sections
                for changing conditions.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default WeatherImpact
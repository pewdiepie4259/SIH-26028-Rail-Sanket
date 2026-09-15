import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  GitBranch,
  MapPin,
  TrainFront,
  TrendingUp,
} from "lucide-react"
import { Link } from "react-router-dom"

const cascadeEvents = [
  {
    time: "17:20",
    type: "ORIGIN",
    title: "Primary delay detected",
    description:
      "Train 12627 departed Bengaluru with a 12-minute delay.",
    delay: "+12 min",
    severity: "HIGH",
  },
  {
    time: "17:31",
    type: "STATION",
    title: "Station arrival impact",
    description:
      "Expected arrival at Baiyappanahalli shifted due to the primary delay.",
    delay: "+10 min",
    severity: "HIGH",
  },
  {
    time: "17:42",
    type: "JUNCTION",
    title: "Junction occupancy impact",
    description:
      "Delayed movement may reduce available routing capacity at Baiyappanahalli.",
    delay: "+7 min",
    severity: "MEDIUM",
  },
  {
    time: "17:49",
    type: "TRAIN",
    title: "Downstream train affected",
    description:
      "Train 16589 is predicted to experience a knock-on delay.",
    delay: "+8 min",
    severity: "MEDIUM",
  },
  {
    time: "18:05",
    type: "STATION",
    title: "Downstream arrival impact",
    description:
      "Predicted delay propagates to the next monitored station.",
    delay: "+11 min",
    severity: "MEDIUM",
  },
]

const affectedTrains = [
  {
    train: "12627",
    name: "Karnataka Express",
    primaryDelay: "+12 min",
    predictedDelay: "+12 min",
    cascadeRisk: "HIGH",
    impact: "Originating delay",
  },
  {
    train: "16589",
    name: "Rani Chennamma",
    primaryDelay: "0 min",
    predictedDelay: "+8 min",
    cascadeRisk: "MEDIUM",
    impact: "Junction conflict",
  },
  {
    train: "16526",
    name: "Kanyakumari Express",
    primaryDelay: "0 min",
    predictedDelay: "+6 min",
    cascadeRisk: "MEDIUM",
    impact: "Route occupancy",
  },
  {
    train: "12079",
    name: "Jan Shatabdi",
    primaryDelay: "0 min",
    predictedDelay: "+4 min",
    cascadeRisk: "LOW",
    impact: "Downstream dependency",
  },
]

function RiskBadge({ risk }: { risk: string }) {
  const styles: Record<string, string> = {
    HIGH: "border-red-500/40 bg-red-500/10 text-red-400",
    MEDIUM:
      "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]",
    LOW: "border-blue-400/40 bg-blue-400/10 text-blue-300",
  }

  return (
    <span
      className={`rounded-md border px-2 py-1 text-[9px] font-bold uppercase ${
        styles[risk] ?? styles.LOW
      }`}
    >
      {risk}
    </span>
  )
}

function CascadeAnalysis() {
  return (
    <div className="controller-page min-h-full px-4 py-5 lg:px-6">
      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#F59E0B]">
          Network Dependency Analysis
        </div>

        <h1 className="mt-1 text-2xl font-bold text-white">
          Cascading Delay Analysis
        </h1>

        <p className="mt-1 text-sm text-[#9FB8BE]">
          Trace how an originating delay propagates across trains, stations
          and network infrastructure.
        </p>
      </div>

      {/* Summary */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="controller-panel rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9FB8BE]">
              Originating Train
            </span>
            <TrainFront size={17} className="text-[#F59E0B]" />
          </div>

          <Link
            to="/controller/trains/12627"
            className="mt-2 block text-2xl font-bold text-white hover:text-[#F59E0B] transition-colors"
          >
            12627
          </Link>

          <div className="mt-1 text-[11px] text-[#9FB8BE]">
            Karnataka Express
          </div>
        </div>

        <div className="controller-panel rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9FB8BE]">
              Primary Delay
            </span>
            <Clock3 size={17} className="text-[#F59E0B]" />
          </div>

          <div className="mt-2 text-2xl font-bold text-[#F59E0B]">
            +12 min
          </div>

          <div className="mt-1 text-[11px] text-[#9FB8BE]">
            Delay at origin
          </div>
        </div>

        <div className="controller-panel rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9FB8BE]">
              Affected Trains
            </span>
            <GitBranch size={17} className="text-[#F59E0B]" />
          </div>

          <div className="mt-2 text-2xl font-bold">4</div>

          <div className="mt-1 text-[11px] text-[#9FB8BE]">
            Including originating train
          </div>
        </div>

        <div className="controller-panel rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9FB8BE]">
              Cascade Risk
            </span>
            <AlertTriangle size={17} className="text-red-400" />
          </div>

          <div className="mt-2 text-2xl font-bold text-red-400">
            HIGH
          </div>

          <div className="mt-1 text-[11px] text-[#9FB8BE]">
            Network propagation risk
          </div>
        </div>
      </div>

      {/* Origin */}
      <section className="controller-panel overflow-hidden rounded-lg">
        <div className="controller-header px-4 py-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#F59E0B]" />

            <div>
              <h2 className="text-sm font-bold text-white">
                Active Cascade
              </h2>

              <p className="mt-0.5 text-[11px] text-[#D7E5EC]/70">
                Current delay propagation chain
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 lg:w-56">
              <div className="text-[9px] font-bold uppercase tracking-wide text-red-400">
                Origin
              </div>

              <div className="mt-2 flex items-center gap-2">
                <TrainFront size={17} className="text-red-400" />

                <span className="text-sm font-bold text-white">
                  12627
                </span>
              </div>

              <div className="mt-1 text-[10px] text-[#9FB8BE]">
                Karnataka Express
              </div>

              <div className="mt-3 text-lg font-bold text-red-400">
                +12 min
              </div>
            </div>

            <ArrowRight
              className="hidden shrink-0 text-[#F59E0B] lg:block"
              size={22}
            />

            <div className="flex-1">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-[#145158] bg-[#08383D] p-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[#F59E0B]" />
                    <span className="text-[10px] font-bold">
                      Baiyappanahalli
                    </span>
                  </div>

                  <div className="mt-3 text-lg font-bold text-[#F59E0B]">
                    +10 min
                  </div>

                  <div className="mt-1 text-[10px] text-[#9FB8BE]">
                    Station impact
                  </div>
                </div>

                <div className="rounded-lg border border-[#145158] bg-[#08383D] p-4">
                  <div className="flex items-center gap-2">
                    <GitBranch size={14} className="text-[#F59E0B]" />
                    <span className="text-[10px] font-bold">
                      BYPL Junction
                    </span>
                  </div>

                  <div className="mt-3 text-lg font-bold text-[#F59E0B]">
                    +7 min
                  </div>

                  <div className="mt-1 text-[10px] text-[#9FB8BE]">
                    Infrastructure impact
                  </div>
                </div>

                <div className="rounded-lg border border-[#145158] bg-[#08383D] p-4">
                  <div className="flex items-center gap-2">
                    <TrainFront size={14} className="text-[#F59E0B]" />
                    <span className="text-[10px] font-bold">
                      Train 16589
                    </span>
                  </div>

                  <div className="mt-3 text-lg font-bold text-[#F59E0B]">
                    +8 min
                  </div>

                  <div className="mt-1 text-[10px] text-[#9FB8BE]">
                    Downstream impact
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Propagation timeline */}
      <section className="controller-panel mt-5 overflow-hidden rounded-lg">
        <div className="controller-header px-4 py-3">
          <div className="flex items-center gap-2">
            <Clock3 size={16} className="text-[#F59E0B]" />

            <div>
              <h2 className="text-sm font-bold text-white">
                Propagation Timeline
              </h2>

              <p className="mt-0.5 text-[11px] text-[#D7E5EC]/70">
                Chronological progression of the predicted cascade
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="relative space-y-5">
            <div className="absolute bottom-4 left-[7px] top-4 w-px bg-[#145158]" />

            {cascadeEvents.map((event) => (
              <div
                key={`${event.time}-${event.type}`}
                className="relative flex gap-4"
              >
                <div
                  className={`z-10 mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${
                    event.severity === "HIGH"
                      ? "border-red-400 bg-red-400/20"
                      : "border-[#F59E0B] bg-[#F59E0B]/20"
                  }`}
                />

                <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-lg border border-[#145158] bg-[#08383D] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold text-[#F59E0B]">
                        {event.time}
                      </span>

                      <span className="text-[9px] font-bold uppercase text-[#718F96]">
                        {event.type}
                      </span>
                    </div>

                    <div className="mt-1 text-xs font-bold text-white">
                      {event.title}
                    </div>

                    <div className="mt-1 text-[10px] leading-5 text-[#9FB8BE]">
                      {event.description}
                    </div>
                  </div>

                  <div className="shrink-0 text-left sm:text-right">
                    <div className="text-sm font-bold text-[#F59E0B]">
                      {event.delay}
                    </div>

                    <div className="mt-1 text-[9px] uppercase text-[#718F96]">
                      predicted impact
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Affected trains */}
      <section className="controller-panel mt-5 overflow-hidden rounded-lg">
        <div className="controller-header px-4 py-3">
          <div className="flex items-center gap-2">
            <TrainFront size={16} className="text-[#F59E0B]" />

            <div>
              <h2 className="text-sm font-bold text-white">
                Affected Trains
              </h2>

              <p className="mt-0.5 text-[11px] text-[#D7E5EC]/70">
                Predicted delay impact across connected train movements
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="border-b border-[#145158] bg-[#08383D]">
              <tr className="text-left text-[9px] uppercase tracking-wide text-[#9FB8BE]">
                <th className="px-4 py-3">Train</th>
                <th className="px-4 py-3">Primary Delay</th>
                <th className="px-4 py-3">Predicted Delay</th>
                <th className="px-4 py-3">Cascade Risk</th>
                <th className="px-4 py-3">Impact Source</th>
              </tr>
            </thead>

            <tbody>
              {affectedTrains.map((train) => (
                <tr
                  key={train.train}
                  className="border-b border-[#145158] last:border-0 hover:bg-[#08383D]/50"
                >
                  <td className="px-4 py-4">
                    <Link
                      to={`/controller/trains/${train.train}`}
                      className="text-xs font-bold text-white hover:text-[#F59E0B] transition-colors"
                    >
                      {train.train}
                    </Link>

                    <div className="mt-0.5 text-[10px] text-[#9FB8BE]">
                      {train.name}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-xs text-[#D7E5EC]">
                    {train.primaryDelay}
                  </td>

                  <td className="px-4 py-4 text-xs font-bold text-[#F59E0B]">
                    {train.predictedDelay}
                  </td>

                  <td className="px-4 py-4">
                    <RiskBadge risk={train.cascadeRisk} />
                  </td>

                  <td className="px-4 py-4 text-[10px] text-[#9FB8BE]">
                    {train.impact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Assessment */}
      <section className="controller-panel mt-5 rounded-lg p-5">
        <div className="flex items-center gap-2">
          <AlertTriangle
            size={17}
            className="text-[#F59E0B]"
          />

          <div>
            <h2 className="text-sm font-bold">
              Cascade Assessment
            </h2>

            <p className="text-[11px] text-[#9FB8BE]">
              Current operational interpretation
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-400" />
              <span className="text-xs font-bold text-red-400">
                High propagation risk
              </span>
            </div>

            <p className="mt-2 text-[11px] leading-5 text-[#D7E5EC]">
              The originating delay is likely to affect multiple downstream
              movements if no intervention is applied.
            </p>
          </div>

          <div className="rounded-lg border border-[#145158] bg-[#08383D] p-4">
            <div className="flex items-center gap-2">
              <GitBranch size={15} className="text-[#F59E0B]" />
              <span className="text-xs font-bold">
                Primary dependency
              </span>
            </div>

            <p className="mt-2 text-[11px] leading-5 text-[#9FB8BE]">
              Baiyappanahalli junction occupancy is the primary network
              dependency in this cascade.
            </p>
          </div>

          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2
                size={15}
                className="text-emerald-400"
              />
              <span className="text-xs font-bold text-emerald-400">
                Intervention possible
              </span>
            </div>

            <p className="mt-2 text-[11px] leading-5 text-[#9FB8BE]">
              Holding or resequencing selected movements may reduce downstream
              propagation.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/controller/dashboard"
            className="controller-button rounded-md px-4 py-2.5 text-[10px] font-bold uppercase"
          >
            Review on Network Map
          </Link>

          <Link
            to="/controller/trains/12627"
            className="rounded-md border border-[#145158] bg-[#08383D] px-4 py-2.5 text-[10px] font-bold uppercase text-[#D7E5EC] hover:bg-[#0E5961]"
          >
            View Source Train
          </Link>

          <Link
            to="/controller/junctions"
            className="rounded-md border border-[#145158] bg-[#08383D] px-4 py-2.5 text-[10px] font-bold uppercase text-[#D7E5EC] hover:bg-[#0E5961]"
          >
            View Junction
          </Link>
        </div>
      </section>
    </div>
  )
}

export default CascadeAnalysis

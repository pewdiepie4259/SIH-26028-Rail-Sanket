import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Clock3,
  GitBranch,
  MapPin,
  Radio,
  ShieldAlert,
  TrainFront,
} from "lucide-react"

const junctions = [
  {
    name: "Baiyappanahalli Junction",
    code: "BYPL",
    status: "ATTENTION",
    routes: 4,
    occupied: 3,
    conflicts: 2,
  },
  {
    name: "KSR Bengaluru Junction",
    code: "SBC",
    status: "NORMAL",
    routes: 6,
    occupied: 3,
    conflicts: 0,
  },
  {
    name: "Whitefield Junction",
    code: "WFD",
    status: "NORMAL",
    routes: 3,
    occupied: 2,
    conflicts: 0,
  },
]

const movements = [
  {
    train: "12627",
    name: "Karnataka Express",
    direction: "Eastbound",
    eta: "17:42",
    priority: "HIGH",
    signal: "GREEN",
    route: "BYPL → WFD",
  },
  {
    train: "16589",
    name: "Rani Chennamma",
    direction: "Westbound",
    eta: "17:46",
    priority: "NORMAL",
    signal: "YELLOW",
    route: "WFD → SBC",
  },
  {
    train: "16526",
    name: "Kanyakumari Exp",
    direction: "Eastbound",
    eta: "17:51",
    priority: "NORMAL",
    signal: "RED",
    route: "SBC → BYPL",
  },
  {
    train: "12079",
    name: "Janshatabdi",
    direction: "Eastbound",
    eta: "17:55",
    priority: "HIGH",
    signal: "GREEN",
    route: "SBC → WFD",
  },
]

const conflicts = [
  {
    id: "CF-2041",
    junction: "Baiyappanahalli",
    trains: "16589 ↔ 16526",
    time: "17:48",
    impact: "+7 min",
    severity: "HIGH",
    status: "UNRESOLVED",
  },
  {
    id: "CF-2042",
    junction: "Baiyappanahalli",
    trains: "12627 ↔ 16589",
    time: "17:52",
    impact: "+4 min",
    severity: "MEDIUM",
    status: "MONITORING",
  },
]

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    NORMAL:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    ATTENTION:
      "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]",
    HIGH:
      "border-red-500/40 bg-red-500/10 text-red-400",
    MEDIUM:
      "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]",
    UNRESOLVED:
      "border-red-500/40 bg-red-500/10 text-red-400",
    MONITORING:
      "border-blue-400/40 bg-blue-400/10 text-blue-300",
  }

  return (
    <span
      className={`rounded-md border px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${
        styles[status] ??
        "border-[#145158] bg-[#08383D] text-[#D7E5EC]"
      }`}
    >
      {status}
    </span>
  )
}

function SignalBadge({ signal }: { signal: string }) {
  const styles: Record<string, string> = {
    GREEN: "text-emerald-400",
    YELLOW: "text-[#F59E0B]",
    RED: "text-red-400",
  }

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          signal === "GREEN"
            ? "bg-emerald-400"
            : signal === "YELLOW"
              ? "bg-[#F59E0B]"
              : "bg-red-400"
        }`}
      />
      <span
        className={`text-[10px] font-bold ${styles[signal]}`}
      >
        {signal}
      </span>
    </div>
  )
}

function JunctionManagement() {
  return (
    <div className="controller-page min-h-full px-4 py-5 lg:px-6">
      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#F59E0B]">
          Route & Movement Control
        </div>

        <h1 className="mt-1 text-2xl font-bold text-white">
          Junction & Conflict Management
        </h1>

        <p className="mt-1 text-sm text-[#9FB8BE]">
          Monitor junction occupancy, train movements and predicted route
          conflicts.
        </p>
      </div>

      {/* Summary */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="controller-panel rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9FB8BE]">
              Active Junctions
            </span>
            <GitBranch size={17} className="text-[#F59E0B]" />
          </div>

          <div className="mt-2 text-2xl font-bold">3</div>

          <div className="mt-1 text-[11px] text-[#9FB8BE]">
            Under active monitoring
          </div>
        </div>

        <div className="controller-panel rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9FB8BE]">
              Active Conflicts
            </span>
            <ShieldAlert size={17} className="text-red-400" />
          </div>

          <div className="mt-2 text-2xl font-bold text-red-400">
            2
          </div>

          <div className="mt-1 text-[11px] text-[#9FB8BE]">
            Requiring controller attention
          </div>
        </div>

        <div className="controller-panel rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9FB8BE]">
              Trains in Conflict Zone
            </span>
            <TrainFront size={17} className="text-[#F59E0B]" />
          </div>

          <div className="mt-2 text-2xl font-bold">4</div>

          <div className="mt-1 text-[11px] text-[#9FB8BE]">
            Current movements
          </div>
        </div>

        <div className="controller-panel rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9FB8BE]">
              Route Availability
            </span>
            <CheckCircle2 size={17} className="text-emerald-400" />
          </div>

          <div className="mt-2 text-2xl font-bold">
            72%
          </div>

          <div className="mt-1 text-[11px] text-[#9FB8BE]">
            Network route capacity
          </div>
        </div>
      </div>

      {/* Junction overview */}
      <section className="controller-panel overflow-hidden rounded-lg">
        <div className="controller-header px-4 py-3">
          <div className="flex items-center gap-2">
            <GitBranch size={16} className="text-[#F59E0B]" />

            <div>
              <h2 className="text-sm font-bold text-white">
                Junction Overview
              </h2>

              <p className="mt-0.5 text-[11px] text-[#D7E5EC]/70">
                Current route occupancy and conflict status
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-[#145158] md:grid-cols-3">
          {junctions.map((junction) => (
            <div
              key={junction.code}
              className="bg-[#062A2F] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-white">
                    {junction.name}
                  </div>

                  <div className="mt-1 flex items-center gap-1 text-[10px] text-[#9FB8BE]">
                    <MapPin size={11} />
                    {junction.code}
                  </div>
                </div>

                <StatusBadge status={junction.status} />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <div>
                  <div className="text-[9px] uppercase text-[#718F96]">
                    Routes
                  </div>
                  <div className="mt-1 text-sm font-bold">
                    {junction.routes}
                  </div>
                </div>

                <div>
                  <div className="text-[9px] uppercase text-[#718F96]">
                    Occupied
                  </div>
                  <div className="mt-1 text-sm font-bold">
                    {junction.occupied}
                  </div>
                </div>

                <div>
                  <div className="text-[9px] uppercase text-[#718F96]">
                    Conflicts
                  </div>
                  <div
                    className={`mt-1 text-sm font-bold ${
                      junction.conflicts
                        ? "text-red-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {junction.conflicts}
                  </div>
                </div>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#031A1F]">
                <div
                  className="h-full rounded-full bg-[#0E7C86]"
                  style={{
                    width: `${(junction.occupied / junction.routes) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Incoming movements */}
      <section className="controller-panel mt-5 overflow-hidden rounded-lg">
        <div className="controller-header px-4 py-3">
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-[#F59E0B]" />

            <div>
              <h2 className="text-sm font-bold text-white">
                Incoming Movements
              </h2>

              <p className="mt-0.5 text-[11px] text-[#D7E5EC]/70">
                Trains approaching monitored junctions
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="border-b border-[#145158] bg-[#08383D]">
              <tr className="text-left text-[9px] uppercase tracking-wide text-[#9FB8BE]">
                <th className="px-4 py-3">Train</th>
                <th className="px-4 py-3">Direction</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">ETA</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Signal</th>
              </tr>
            </thead>

            <tbody>
              {movements.map((movement) => (
                <tr
                  key={movement.train}
                  className="border-b border-[#145158] last:border-0 hover:bg-[#08383D]/50"
                >
                  <td className="px-4 py-3">
                    <div className="text-xs font-bold text-white">
                      {movement.train}
                    </div>

                    <div className="mt-0.5 text-[10px] text-[#9FB8BE]">
                      {movement.name}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-[10px] text-[#D7E5EC]">
                      {movement.direction === "Eastbound" ? (
                        <ArrowRight size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      )}
                      {movement.direction}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-[10px] text-[#D7E5EC]">
                    {movement.route}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-white">
                      <Clock3 size={12} />
                      {movement.eta}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={
                        movement.priority === "HIGH"
                          ? "text-[10px] font-bold text-[#F59E0B]"
                          : "text-[10px] font-semibold text-[#9FB8BE]"
                      }
                    >
                      {movement.priority}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <SignalBadge signal={movement.signal} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Conflicts */}
      <section className="controller-panel mt-5 overflow-hidden rounded-lg">
        <div className="controller-header px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle
              size={16}
              className="text-[#F59E0B]"
            />

            <div>
              <h2 className="text-sm font-bold text-white">
                Predicted Route Conflicts
              </h2>

              <p className="mt-0.5 text-[11px] text-[#D7E5EC]/70">
                Conflicts detected from current train movements
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-[#145158]">
          {conflicts.map((conflict) => (
            <div
              key={conflict.id}
              className="p-4"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-red-500/30 bg-red-500/10">
                    <ShieldAlert
                      size={17}
                      className="text-red-400"
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {conflict.id}
                      </span>

                      <StatusBadge status={conflict.severity} />

                      <StatusBadge status={conflict.status} />
                    </div>

                    <div className="mt-1 text-[11px] text-[#9FB8BE]">
                      {conflict.junction} Junction
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#D7E5EC]">
                      <TrainFront size={14} />
                      {conflict.trains}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
                  <div>
                    <div className="text-[9px] uppercase text-[#718F96]">
                      Conflict Time
                    </div>
                    <div className="mt-1 text-xs font-bold">
                      {conflict.time}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] uppercase text-[#718F96]">
                      Delay Impact
                    </div>
                    <div className="mt-1 text-xs font-bold text-[#F59E0B]">
                      {conflict.impact}
                    </div>
                  </div>

                  <button className="col-span-2 flex items-center justify-center gap-1.5 rounded-md border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-3 py-2 text-[10px] font-bold uppercase text-white transition-transform hover:scale-[1.01] sm:col-span-1">
                    Review
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Controller actions */}
      <section className="controller-panel mt-5 rounded-lg p-5">
        <div className="flex items-center gap-2">
          <ShieldAlert
            size={17}
            className="text-[#F59E0B]"
          />

          <div>
            <h2 className="text-sm font-bold">
              Controller Actions
            </h2>

            <p className="text-[11px] text-[#9FB8BE]">
              Operational controls for resolving route conflicts
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Hold Train",
            "Release Train",
            "Change Priority",
            "Review Route",
          ].map((action) => (
            <button
              key={action}
              className="controller-button rounded-md px-4 py-3 text-xs font-bold"
            >
              {action}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

export default JunctionManagement

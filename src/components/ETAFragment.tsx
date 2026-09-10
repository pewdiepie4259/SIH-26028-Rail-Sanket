import {
  AlertTriangle,
  Clock3,
  MapPin,
  Navigation,
  TrainFront,
} from "lucide-react"

export interface ETATrain {
  name: string
  number: string
  scheduledDeparture: string
  scheduledArrival: string
  predictedArrival: string
  from: string
  to: string
  lastStation: string
  currentLocation: string
  delayMinutes: number
  progress: number
  stations: string[]
}

interface ETAFragmentProps {
  train: ETATrain
}

function ETAFragment({ train }: ETAFragmentProps) {
  const isDelayed = train.delayMinutes > 0

  const statusText = isDelayed
    ? `Delayed by ${train.delayMinutes} mins`
    : "On Time"

  return (
    <section className="bg-[#F4F7FA]">
      <div className="mx-auto max-w-[1600px] px-6 py-8 lg:px-12">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-5 py-5 sm:px-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-md bg-[#F59E0B] px-2.5 py-1 text-xs font-extrabold text-[#071A33]">
                    {train.number}
                  </span>

                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {train.name}
                  </h1>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[#D7E5EC]">
                  <span>{train.from}</span>

                  <span className="text-[#F59E0B]">→</span>

                  <span>{train.to}</span>
                </div>
              </div>

              <div
                className={`flex w-fit items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold ${
                  isDelayed
                    ? "border-[#F59E0B]/70 bg-[#F59E0B]/10 text-[#F59E0B]"
                    : "border-green-400/50 bg-green-400/10 text-green-300"
                }`}
              >
                {isDelayed ? (
                  <AlertTriangle size={17} />
                ) : (
                  <Clock3 size={17} />
                )}

                {statusText}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#0E7C86]">
                  Live Tracking
                </div>

                <h2 className="mt-1 text-xl font-bold text-[#071A33]">
                  Train Trajectory
                </h2>
              </div>

              <div className="hidden items-center gap-2 text-xs font-semibold text-slate-500 sm:flex">
                <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                Live Train
              </div>
            </div>

            <div className="relative h-[340px] overflow-hidden rounded-xl border border-slate-200 bg-[#EAF0F2]">
              <div className="absolute inset-0 opacity-60">
                <div className="h-full w-full bg-[linear-gradient(rgba(7,26,51,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(7,26,51,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
              </div>

              <div className="absolute left-[8%] top-[24%] h-24 w-36 rounded-[50%] border border-[#0E5961]/20 bg-[#DDE9EF]/70" />

              <div className="absolute right-[8%] bottom-[15%] h-28 w-48 rounded-[50%] border border-[#0E5961]/20 bg-[#DDE9EF]/70" />

              <svg
                viewBox="0 0 1000 340"
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="none"
              >
                <path
                  d="M70 250 C190 215 205 105 340 120 C475 135 480 245 615 220 C735 198 790 95 930 80"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="10"
                  strokeLinecap="round"
                />

                <path
                  d="M70 250 C190 215 205 105 340 120 C475 135 480 245 615 220 C735 198 790 95 930 80"
                  fill="none"
                  stroke="#0E7C86"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="12 7"
                />

                <circle
                  cx="70"
                  cy="250"
                  r="11"
                  fill="#071A33"
                  stroke="#FFFFFF"
                  strokeWidth="4"
                />

                <circle
                  cx="930"
                  cy="80"
                  r="11"
                  fill="#071A33"
                  stroke="#FFFFFF"
                  strokeWidth="4"
                />

                <circle
                  cx={70 + train.progress * 8.6}
                  cy={250 - train.progress * 1.7}
                  r="15"
                  fill="#F59E0B"
                  stroke="#FFFFFF"
                  strokeWidth="5"
                />
              </svg>

              <div className="absolute bottom-4 left-4 rounded-lg border border-white/60 bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Origin
                </div>

                <div className="mt-0.5 text-sm font-bold text-[#071A33]">
                  {train.from}
                </div>
              </div>

              <div className="absolute right-4 top-4 rounded-lg border border-white/60 bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Destination
                </div>

                <div className="mt-0.5 text-sm font-bold text-[#071A33]">
                  {train.to}
                </div>
              </div>

              <div
                className="absolute rounded-xl border border-[#F59E0B]/50 bg-white px-3 py-2 shadow-lg"
                style={{
                  left: `${Math.min(Math.max(train.progress - 2, 4), 82)}%`,
                  top: `${Math.max(25 - train.progress * 0.08, 12)}%`,
                }}
              >
                <div className="flex items-center gap-2">
                  <TrainFront
                    size={18}
                    className="text-[#F59E0B]"
                  />

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Current Location
                    </div>

                    <div className="text-xs font-bold text-[#071A33]">
                      {train.currentLocation}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-[#FAFCFD] px-5 py-6 sm:px-7">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#0E7C86]">
                  Journey
                </div>

                <h2 className="mt-1 text-xl font-bold text-[#071A33]">
                  Journey Progress
                </h2>
              </div>

              <span className="text-sm font-bold text-[#0E5961]">
                {train.progress}% Complete
              </span>
            </div>

            <div className="mt-7 px-2 sm:px-6">
              <div className="relative h-2 rounded-full bg-slate-200">
                <div
                  className="absolute left-0 top-0 h-2 rounded-full bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#0E7C86]"
                  style={{
                    width: `${train.progress}%`,
                  }}
                />

                <div
                  className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-[#F59E0B] shadow-md"
                  style={{
                    left: `${train.progress}%`,
                  }}
                />

                <div className="absolute left-0 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#071A33]" />

                <div className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-white bg-[#071A33]" />
              </div>

              <div className="mt-4 flex justify-between gap-4">
                <div className="max-w-[35%]">
                  <p className="text-xs font-bold text-[#071A33]">
                    {train.from}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Origin
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xs font-bold text-[#0E5961]">
                    {train.currentLocation}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Current
                  </p>
                </div>

                <div className="max-w-[35%] text-right">
                  <p className="text-xs font-bold text-[#071A33]">
                    {train.to}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Destination
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid border-t border-slate-200 sm:grid-cols-3">
            <div className="border-b border-slate-200 p-5 sm:border-b-0 sm:border-r">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <MapPin size={15} className="text-[#F59E0B]" />
                Last Station
              </div>

              <p className="mt-3 text-lg font-bold text-[#071A33]">
                {train.lastStation}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Current reported location
              </p>
            </div>

            <div className="border-b border-slate-200 p-5 sm:border-b-0 sm:border-r">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Clock3 size={15} className="text-[#F59E0B]" />
                Scheduled Time
              </div>

              <p className="mt-3 text-lg font-bold text-[#071A33]">
                {train.scheduledArrival}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Scheduled arrival at destination
              </p>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Navigation size={15} className="text-[#F59E0B]" />
                Predicted Time
              </div>

              <p className="mt-3 text-lg font-bold text-[#0E5961]">
                {train.predictedArrival}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                AI-predicted arrival time
              </p>
            </div>
          </div>
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <AlertTriangle
                size={19}
                className="text-[#F59E0B]"
              />

              <div>
                <h2 className="text-lg font-bold text-white">
                  Alerts & Journey Updates
                </h2>

                <p className="mt-0.5 text-xs text-[#D7E5EC]">
                  Dynamic updates based on train movement and network
                  conditions.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {isDelayed && (
              <div className="flex gap-4 p-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFF4E1]">
                  <AlertTriangle
                    size={18}
                    className="text-[#F59E0B]"
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-[#071A33]">
                      Delay Advisory
                    </h3>

                    <span className="rounded-full bg-[#FFF4E1] px-2 py-0.5 text-[10px] font-bold text-[#A16207]">
                      {train.delayMinutes} min delay
                    </span>
                  </div>

                  <p className="mt-1.5 text-sm leading-6 text-slate-600">
                    Train {train.number} is currently running approximately{" "}
                    {train.delayMinutes} minutes behind schedule. Predicted
                    arrival time has been adjusted accordingly.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-4 p-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E7F4F5]">
                <MapPin
                  size={18}
                  className="text-[#0E7C86]"
                />
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#071A33]">
                  Current Station Update
                </h3>

                <p className="mt-1.5 text-sm leading-6 text-slate-600">
                  Train {train.number} has last reported movement near{" "}
                  <span className="font-semibold text-[#071A33]">
                    {train.currentLocation}
                  </span>
                  . Live position and predicted timings will update as
                  new telemetry is received.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E7F4F5]">
                <TrainFront
                  size={18}
                  className="text-[#0E7C86]"
                />
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#071A33]">
                  Journey Update
                </h3>

                <p className="mt-1.5 text-sm leading-6 text-slate-600">
                  The train is progressing towards{" "}
                  <span className="font-semibold text-[#071A33]">
                    {train.to}
                  </span>
                  . Arrival estimates are continuously evaluated against
                  the current network state.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}

export default ETAFragment
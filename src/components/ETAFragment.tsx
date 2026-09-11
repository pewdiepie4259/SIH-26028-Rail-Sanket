import { useState } from "react"
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock3,
  MapPin,
  Navigation,
  Radio,
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

interface StationUpdate {
  station: string
  scheduled: string
  predicted: string
  status: "completed" | "current" | "upcoming"
  message: string
}

const stationTimes: Record<
  string,
  {
    scheduled: string
    predicted: string
  }
> = {
  "KSR Bengaluru": {
    scheduled: "19:20",
    predicted: "19:20",
  },
  Kengeri: {
    scheduled: "19:50",
    predicted: "20:08",
  },
  Tumakuru: {
    scheduled: "20:55",
    predicted: "21:13",
  },
  Guntakal: {
    scheduled: "01:40",
    predicted: "01:58",
  },
  "New Delhi": {
    scheduled: "06:15",
    predicted: "06:33",
  },
  "Bengaluru Cantonment": {
    scheduled: "07:12",
    predicted: "07:24",
  },
  Krishnarajapuram: {
    scheduled: "07:32",
    predicted: "07:44",
  },
  Jolarpettai: {
    scheduled: "09:40",
    predicted: "09:52",
  },
  "Chennai Central": {
    scheduled: "13:40",
    predicted: "13:52",
  },
  Mandya: {
    scheduled: "07:15",
    predicted: "07:15",
  },
  Mysuru: {
    scheduled: "08:45",
    predicted: "08:45",
  },
  Bengaluru: {
    scheduled: "23:10",
    predicted: "23:10",
  },
  Yelahanka: {
    scheduled: "21:28",
    predicted: "21:28",
  },
  Chikballapur: {
    scheduled: "22:20",
    predicted: "22:20",
  },
  Hospet: {
    scheduled: "05:40",
    predicted: "05:40",
  },
  Hubballi: {
    scheduled: "08:10",
    predicted: "08:10",
  },
}

function getStationTime(station: string, train: ETATrain) {
  const knownTime = stationTimes[station]

  if (knownTime) {
    return knownTime
  }

  return {
    scheduled: train.scheduledArrival,
    predicted: train.predictedArrival,
  }
}

function ETAFragment({ train }: ETAFragmentProps) {
  const [selectedStation, setSelectedStation] = useState(
    train.currentLocation
  )
  const [mapMode, setMapMode] = useState<"route" | "live">("live")
  const [showAllUpdates, setShowAllUpdates] = useState(false)

  const isDelayed = train.delayMinutes > 0

  const selectedStationIndex = Math.max(
    train.stations.indexOf(selectedStation),
    0
  )

  const selectedStationTime = getStationTime(selectedStation, train)

  const stationUpdates: StationUpdate[] = train.stations.map(
    (station, index) => {
      const time = getStationTime(station, train)

      let status: StationUpdate["status"] = "upcoming"

      if (index < selectedStationIndex) {
        status = "completed"
      } else if (index === selectedStationIndex) {
        status = "current"
      }

      return {
        station,
        scheduled: time.scheduled,
        predicted: time.predicted,
        status,
        message:
          status === "completed"
            ? `Train departed ${station}.`
            : status === "current"
              ? `Train is currently at ${station}.`
              : `Expected arrival at ${station}.`,
      }
    }
  )

  const visibleUpdates = showAllUpdates
    ? stationUpdates
    : stationUpdates.slice(
        Math.max(selectedStationIndex - 1, 0),
        Math.min(selectedStationIndex + 3, stationUpdates.length)
      )

  const progressForStation =
    train.stations.length > 1
      ? (selectedStationIndex / (train.stations.length - 1)) * 100
      : train.progress

  return (
    <section className="bg-[#F4F7FA]">
      <div className="mx-auto max-w-[1600px] px-5 py-6 sm:px-6 lg:px-12 lg:py-8">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-white px-5 py-5 sm:px-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-md bg-[#F59E0B] px-2.5 py-1 text-xs font-extrabold text-[#071A33]">
                    {train.number}
                  </span>

                  <h1 className="text-2xl font-bold tracking-tight text-[#071A33] sm:text-3xl">
                    {train.name}
                  </h1>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  <span>{train.from}</span>

                  <span className="font-bold text-[#F59E0B]">→</span>

                  <span>{train.to}</span>
                </div>
              </div>

              <div
                className={`flex w-fit items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold ${
                  isDelayed
                    ? "border-[#F59E0B] bg-[#FFF8EC] text-[#A16207]"
                    : "border-green-200 bg-green-50 text-green-700"
                }`}
              >
                {isDelayed ? (
                  <AlertTriangle size={17} />
                ) : (
                  <Clock3 size={17} />
                )}

                {isDelayed
                  ? `Delayed by ${train.delayMinutes} mins`
                  : "On Time"}
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200 bg-[#FAFCFD] px-5 py-4 sm:px-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Radio size={16} className="text-[#F59E0B]" />

                <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#071A33]">
                  Live Train Position
                </span>

                <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                  Live
                </span>
              </div>

              <div className="flex w-fit overflow-hidden rounded-lg border border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => setMapMode("live")}
                  className={`px-3 py-1.5 text-xs font-semibold transition ${
                    mapMode === "live"
                      ? "bg-[#071A33] text-white"
                      : "text-slate-500 hover:text-[#071A33]"
                  }`}
                >
                  Live
                </button>

                <button
                  type="button"
                  onClick={() => setMapMode("route")}
                  className={`border-l border-slate-200 px-3 py-1.5 text-xs font-semibold transition ${
                    mapMode === "route"
                      ? "bg-[#071A33] text-white"
                      : "text-slate-500 hover:text-[#071A33]"
                  }`}
                >
                  Route
                </button>
              </div>
            </div>

            <div className="mt-4 relative h-[320px] overflow-hidden rounded-lg border border-slate-200 bg-[#EEF2F3]">
              <div
                className="absolute inset-0 opacity-60"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(7,26,51,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(7,26,51,0.05) 1px, transparent 1px)",
                  backgroundSize: "36px 36px",
                }}
              />

              <div className="absolute left-[8%] top-[12%] h-20 w-36 rounded-full border border-slate-300/70 bg-white/40" />
              <div className="absolute right-[7%] top-[52%] h-24 w-44 rounded-full border border-slate-300/70 bg-white/40" />
              <div className="absolute left-[38%] bottom-[8%] h-16 w-28 rounded-full border border-slate-300/70 bg-white/40" />

              <svg
                viewBox="0 0 1000 320"
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="none"
              >
                <path
                  d="M70 245 C180 220 210 105 335 115 C465 125 490 235 615 215 C735 195 790 90 930 70"
                  fill="none"
                  stroke="#CBD5E1"
                  strokeWidth="12"
                  strokeLinecap="round"
                />

                <path
                  d="M70 245 C180 220 210 105 335 115 C465 125 490 235 615 215 C735 195 790 90 930 70"
                  fill="none"
                  stroke="#0E5961"
                  strokeWidth="5"
                  strokeLinecap="round"
                />

                {train.stations.map((station, index) => {
                  const x =
                    70 +
                    (index / Math.max(train.stations.length - 1, 1)) *
                      860

                  const y =
                    245 -
                    Math.sin(
                      (index / Math.max(train.stations.length - 1, 1)) *
                        Math.PI
                    ) *
                      130

                  const isCurrent = station === selectedStation
                  const isPassed = index < selectedStationIndex

                  return (
                    <g
                      key={station}
                      onClick={() => setSelectedStation(station)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={isCurrent ? 13 : 8}
                        fill={
                          isCurrent
                            ? "#F59E0B"
                            : isPassed
                              ? "#0E5961"
                              : "#FFFFFF"
                        }
                        stroke={
                          isCurrent || isPassed
                            ? "#FFFFFF"
                            : "#64748B"
                        }
                        strokeWidth={3}
                      />
                    </g>
                  )
                })}
              </svg>

              <div className="absolute left-4 top-4 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Current Location
                </div>

                <div className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-[#071A33]">
                  <MapPin size={14} className="text-[#F59E0B]" />
                  {train.currentLocation}
                </div>
              </div>

              {mapMode === "live" && (
                <div
                  className="absolute bottom-4 right-4 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <TrainFront size={18} className="text-[#0E5961]" />

                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Train {train.number}
                      </div>

                      <div className="text-xs font-bold text-[#071A33]">
                        {train.currentLocation}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {mapMode === "route" && (
                <div className="absolute bottom-4 left-4 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Navigation
                      size={16}
                      className="text-[#0E7C86]"
                    />

                    <span className="text-xs font-semibold text-[#071A33]">
                      Showing complete route
                    </span>
                  </div>
                </div>
              )}
            </div>

            <p className="mt-2 text-[11px] text-slate-400">
              Select a station on the route to view its expected arrival
              information.
            </p>
          </div>

          <div className="border-b border-slate-200 px-5 py-6 sm:px-7">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#0E7C86]">
                  Journey Progress
                </div>

                <h2 className="mt-1 text-lg font-bold text-[#071A33]">
                  {selectedStation}
                </h2>
              </div>

              <span className="text-sm font-bold text-[#0E5961]">
                {Math.round(
                  selectedStation === train.currentLocation
                    ? train.progress
                    : progressForStation
                )}
                %
              </span>
            </div>

            <div className="mt-7 px-2 sm:px-5">
              <div className="relative h-1.5 rounded-full bg-slate-200">
                <div
                  className="absolute left-0 top-0 h-1.5 rounded-full bg-[#0E5961] transition-all duration-500"
                  style={{
                    width: `${
                      selectedStation === train.currentLocation
                        ? train.progress
                        : progressForStation
                    }%`,
                  }}
                />

                {train.stations.map((station, index) => {
                  const position =
                    (index / Math.max(train.stations.length - 1, 1)) *
                    100

                  const active = station === selectedStation
                  const passed = index < selectedStationIndex

                  return (
                    <button
                      key={station}
                      type="button"
                      onClick={() => setSelectedStation(station)}
                      aria-label={`View ${station}`}
                      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${position}%` }}
                    >
                      <span
                        className={`block rounded-full border-2 border-white transition-all ${
                          active
                            ? "h-5 w-5 bg-[#F59E0B] shadow-md"
                            : passed
                              ? "h-3.5 w-3.5 bg-[#0E5961]"
                              : "h-3.5 w-3.5 bg-slate-300"
                        }`}
                      />
                    </button>
                  )
                })}
              </div>

              <div className="mt-5 flex justify-between gap-4">
                <div className="max-w-[30%]">
                  <p className="text-xs font-bold text-[#071A33]">
                    {train.from}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Origin
                  </p>
                </div>

                <div className="max-w-[35%] text-center">
                  <p className="text-xs font-bold text-[#0E5961]">
                    {selectedStation}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Selected station
                  </p>
                </div>

                <div className="max-w-[30%] text-right">
                  <p className="text-xs font-bold text-[#071A33]">
                    {train.to}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Destination
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid border-b border-slate-200 sm:grid-cols-3">
            <div className="border-b border-slate-200 p-5 sm:border-b-0 sm:border-r">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <MapPin size={15} className="text-[#F59E0B]" />
                Last Station
              </div>

              <p className="mt-3 text-lg font-bold text-[#071A33]">
                {train.lastStation}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Last reported station
              </p>
            </div>

            <div className="border-b border-slate-200 p-5 sm:border-b-0 sm:border-r">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Clock3 size={15} className="text-[#F59E0B]" />
                Scheduled Time
              </div>

              <p className="mt-3 text-lg font-bold text-[#071A33]">
                {selectedStationTime.scheduled}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Scheduled arrival
              </p>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Navigation size={15} className="text-[#F59E0B]" />
                Predicted Time
              </div>

              <p className="mt-3 text-lg font-bold text-[#0E5961]">
                {selectedStationTime.predicted}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Expected arrival
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
              <div>
                <h2 className="text-lg font-bold text-[#071A33]">
                  Alerts & Journey Updates
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Latest movement and arrival information
                </p>
              </div>

              <AlertTriangle
                size={19}
                className={
                  isDelayed
                    ? "text-[#F59E0B]"
                    : "text-[#0E7C86]"
                }
              />
            </div>

            <div className="divide-y divide-slate-100">
              {isDelayed && (
                <div className="flex gap-4 px-5 py-4 sm:px-7">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF4E1]">
                    <AlertTriangle
                      size={16}
                      className="text-[#F59E0B]"
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#071A33]">
                        Delay reported
                      </span>

                      <span className="rounded-full bg-[#FFF4E1] px-2 py-0.5 text-[10px] font-bold text-[#A16207]">
                        {train.delayMinutes} min
                      </span>
                    </div>

                    <p className="mt-1 text-sm leading-5 text-slate-600">
                      Train {train.number} is running approximately{" "}
                      {train.delayMinutes} minutes behind schedule.
                      Predicted arrival has been adjusted.
                    </p>
                  </div>
                </div>
              )}

              {visibleUpdates.map((update, index) => (
                <button
                  key={`${update.station}-${index}`}
                  type="button"
                  onClick={() => setSelectedStation(update.station)}
                  className="flex w-full gap-4 px-5 py-4 text-left transition hover:bg-slate-50 sm:px-7"
                >
                  <div className="flex w-14 shrink-0 flex-col items-center">
                    <span
                      className={`mt-1 h-3 w-3 rounded-full border-2 border-white shadow-sm ${
                        update.status === "current"
                          ? "bg-[#F59E0B] ring-2 ring-[#F59E0B]/20"
                          : update.status === "completed"
                            ? "bg-[#0E5961]"
                            : "bg-slate-300"
                      }`}
                    />

                    {index < visibleUpdates.length - 1 && (
                      <span className="mt-1 h-full min-h-8 w-px bg-slate-200" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-sm font-bold text-[#071A33]">
                        {update.station}
                      </span>

                      {update.status === "current" && (
                        <span className="rounded-full bg-[#E7F4F5] px-2 py-0.5 text-[10px] font-bold text-[#0E5961]">
                          Current
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {update.message}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-4 text-[11px]">
                      <span className="text-slate-400">
                        Scheduled{" "}
                        <strong className="text-slate-600">
                          {update.scheduled}
                        </strong>
                      </span>

                      <span className="text-slate-400">
                        Expected{" "}
                        <strong className="text-[#0E5961]">
                          {update.predicted}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <ChevronDown
                    size={16}
                    className="mt-1 shrink-0 text-slate-300"
                  />
                </button>
              ))}
            </div>

            {stationUpdates.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllUpdates(!showAllUpdates)}
                className="flex w-full items-center justify-center gap-2 border-t border-slate-200 px-5 py-3 text-xs font-bold text-[#0E5961] transition hover:bg-slate-50"
              >
                {showAllUpdates ? (
                  <>
                    Show fewer updates
                    <ChevronUp size={15} />
                  </>
                ) : (
                  <>
                    View all journey updates
                    <ChevronDown size={15} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ETAFragment
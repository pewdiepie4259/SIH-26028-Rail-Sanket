import { useState } from "react"
import {
  AlertTriangle,
  Building,
  ChevronDown,
  ChevronUp,
  Clock3,
  MapPin,
  Navigation,
  Radio,
} from "lucide-react"
import { LiveTrainMap } from "./LiveTrainMap"

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

interface StationMeta {
  scheduled: string
  predicted: string
  platform: number
}

const stationTimes: Record<string, StationMeta> = {
  "KSR Bengaluru": {
    scheduled: "19:20",
    predicted: "19:20",
    platform: 1,
  },
  Kengeri: {
    scheduled: "19:50",
    predicted: "20:08",
    platform: 7,
  },
  Tumakuru: {
    scheduled: "20:55",
    predicted: "21:13",
    platform: 2,
  },
  Guntakal: {
    scheduled: "01:40",
    predicted: "01:58",
    platform: 4,
  },
  "New Delhi": {
    scheduled: "06:15",
    predicted: "06:33",
    platform: 16,
  },
  "Bengaluru Cantonment": {
    scheduled: "07:12",
    predicted: "07:24",
    platform: 2,
  },
  Krishnarajapuram: {
    scheduled: "07:32",
    predicted: "07:44",
    platform: 3,
  },
  Jolarpettai: {
    scheduled: "09:40",
    predicted: "09:52",
    platform: 5,
  },
  "Chennai Central": {
    scheduled: "13:40",
    predicted: "13:52",
    platform: 7,
  },
  Mandya: {
    scheduled: "07:15",
    predicted: "07:15",
    platform: 1,
  },
  Mysuru: {
    scheduled: "08:45",
    predicted: "08:45",
    platform: 6,
  },
  Bengaluru: {
    scheduled: "23:10",
    predicted: "23:10",
    platform: 1,
  },
  Yelahanka: {
    scheduled: "21:28",
    predicted: "21:28",
    platform: 3,
  },
  Chikballapur: {
    scheduled: "22:20",
    predicted: "22:20",
    platform: 1,
  },
  Hospet: {
    scheduled: "05:40",
    predicted: "05:40",
    platform: 2,
  },
  Hubballi: {
    scheduled: "08:10",
    predicted: "08:10",
    platform: 1,
  },
  Dodballapur: {
    scheduled: "21:48",
    predicted: "21:48",
    platform: 2,
  },
  Hindupur: {
    scheduled: "20:30",
    predicted: "20:30",
    platform: 2,
  },
  Gauribidanur: {
    scheduled: "20:58",
    predicted: "20:58",
    platform: 1,
  },
  Dharmavaram: {
    scheduled: "22:15",
    predicted: "22:15",
    platform: 3,
  },
  Anantapur: {
    scheduled: "22:55",
    predicted: "22:55",
    platform: 1,
  },
}

function getStationPlatform(station: string, train: ETATrain, index: number = 0): number {
  const meta = stationTimes[station]
  if (meta?.platform) {
    return meta.platform
  }
  const hash =
    station.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) +
    parseInt(train.number || "1", 10)
  return ((hash + index) % 7) + 1
}

function getStationTime(station: string, train: ETATrain) {
  const knownTime = stationTimes[station]

  if (knownTime) {
    return knownTime
  }

  return {
    scheduled: train.scheduledArrival,
    predicted: train.predictedArrival,
    platform: getStationPlatform(station, train),
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
                className={`flex w-fit items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold ${isDelayed
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
                  className={`px-3 py-1.5 text-xs font-semibold transition ${mapMode === "live"
                    ? "bg-[#071A33] text-white"
                    : "text-slate-500 hover:text-[#071A33]"
                    }`}
                >
                  Live
                </button>

                <button
                  type="button"
                  onClick={() => setMapMode("route")}
                  className={`border-l border-slate-200 px-3 py-1.5 text-xs font-semibold transition ${mapMode === "route"
                    ? "bg-[#071A33] text-white"
                    : "text-slate-500 hover:text-[#071A33]"
                    }`}
                >
                  Route
                </button>
              </div>
            </div>

            {/* Dynamic Map Switcher: Live GPS Leaflet Map or Schematic Route View */}
            {mapMode === "live" ? (
              <div className="mt-4">
                <LiveTrainMap trainNumber={train.number} />
              </div>
            ) : (
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
              </div>
            )}

            <p className="mt-2 text-[11px] text-slate-400">
              Select a station on the route to view its expected arrival
              information.
            </p>
          </div>
          {/* Clean Journey Progress Section - Only Train and Track Line (No Dark Card Background) */}
          <div className="border-b border-slate-200 bg-white px-5 py-8 sm:px-8">
            <div className="relative select-none">
              
              {/* Header: Live Badge & Progress Percentage */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-[#FAFCFD] px-3.5 py-1 shadow-xs">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                  </span>
                  <span className="text-xs font-extrabold tracking-wider text-[#071A33]">
                    LIVE {train.number}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-500">
                  <span>Journey Progress: </span>
                  <span className="text-[#0E7C86] font-bold text-sm">
                    {Math.round(
                      selectedStation === train.currentLocation
                        ? train.progress
                        : progressForStation
                    )}%
                  </span>
                </div>
              </div>

              {/* Sleek Route Line & Train Stage */}
              <div className="relative my-10 select-none">
                {/* Sleek Glowing Route Conduit / Track Line */}
                <div className="relative h-10 w-full flex items-center justify-center">
                  
                  {/* Background Track Guide (Remaining Track) */}
                  <div className="absolute inset-x-0 h-2.5 rounded-full bg-slate-200/90 shadow-inner overflow-hidden">
                    {/* Subtle grid ticks on remaining track */}
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{
                        backgroundImage: "linear-gradient(90deg, #CBD5E1 1px, transparent 1px)",
                        backgroundSize: "20px 100%",
                      }}
                    />
                  </div>

                  {/* Active Traversed Glowing Beam (Traversed Segment) */}
                  <div
                    className="absolute left-0 h-2.5 rounded-full bg-gradient-to-r from-[#0E5961] via-[#0E7C86] to-[#00C6FF] shadow-[0_0_12px_rgba(0,198,255,0.6)] transition-all duration-700 ease-out"
                    style={{
                      width: `${
                        selectedStation === train.currentLocation
                          ? train.progress
                          : progressForStation
                      }%`,
                    }}
                  >
                    {/* Inner Highlight Line */}
                    <div className="absolute inset-x-0 top-[1px] h-[1px] bg-white/80 rounded-full" />
                  </div>

                  {/* Traversed Soft Ambient Light Spill */}
                  <div
                    className="pointer-events-none absolute left-0 h-6 -top-1 bg-gradient-to-r from-transparent via-[#00C6FF]/15 to-[#00C6FF]/30 filter blur-[8px] transition-all duration-700 ease-out"
                    style={{
                      width: `${
                        selectedStation === train.currentLocation
                          ? train.progress
                          : progressForStation
                      }%`,
                    }}
                  />
                </div>

                {/* Active Target Station Concentric Amber Radar Beacon (Under Front Locomotive Wheel) */}
                <div
                  className="pointer-events-none absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out z-20"
                  style={{
                    left: `${Math.min(
                      Math.max(
                        selectedStation === train.currentLocation
                          ? train.progress
                          : progressForStation,
                        4
                      ),
                      96
                    )}%`,
                  }}
                >
                  <div className="relative flex items-center justify-center">
                    {/* Outer Expanding Pulse Ring */}
                    <span className="absolute h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#FF9100]/40 bg-[#FF9100]/10 animate-ping duration-1000" />
                    {/* Middle Concentric Ring */}
                    <span className="absolute h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#FF9100]/80 bg-[#FF9100]/20 shadow-[0_0_14px_rgba(255,145,0,0.6)]" />
                    {/* Bright Center Node */}
                    <span className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF9100] border-2 border-white shadow-[0_0_10px_rgba(255,145,0,0.9)]" />
                  </div>
                </div>

                {/* 3D Realistic Vande Bharat Express Train in Continuous Smooth Motion */}
                <div
                  className="pointer-events-none absolute -top-14 sm:-top-16 z-30 transition-all duration-700 ease-out"
                  style={{
                    left: `${Math.min(
                      Math.max(
                        selectedStation === train.currentLocation
                          ? train.progress
                          : progressForStation,
                        4
                      ),
                      96
                    )}%`,
                    transform: "translateX(-88%)",
                  }}
                >
                  <style>{`
                    @keyframes trainSmoothGlide {
                      0%, 100% { transform: translateY(0px); }
                      25% { transform: translateY(-2.2px); }
                      50% { transform: translateY(0.4px); }
                      75% { transform: translateY(-1.5px); }
                    }
                  `}</style>
                  {/* Subtle Balanced Track Bump Riding Motion */}
                  <div
                    className="relative h-16 sm:h-20 w-64 sm:w-84 drop-shadow-[0_8px_14px_rgba(7,26,51,0.22)]"
                    style={{ animation: "trainSmoothGlide 1.2s ease-in-out infinite" }}
                  >
                    <svg viewBox="0 0 340 85" className="h-full w-full overflow-visible">
                      <defs>
                        {/* Body Clean White Gradient */}
                        <linearGradient id="vbBodyPure" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#FFFFFF" />
                          <stop offset="60%" stopColor="#FFFFFF" />
                          <stop offset="100%" stopColor="#ECEFF1" />
                        </linearGradient>

                        {/* Tinted Window Band Glass */}
                        <linearGradient id="vbWindowGlassExact" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#1B2A4A" />
                          <stop offset="100%" stopColor="#0B132B" />
                        </linearGradient>

                        {/* Aerodynamic Windshield Glass */}
                        <linearGradient id="vbWindshieldExact" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#005B94" />
                          <stop offset="60%" stopColor="#0088CC" />
                          <stop offset="100%" stopColor="#00A6FF" />
                        </linearGradient>

                        {/* Headlight Forward Beam Cone */}
                        <linearGradient id="headlightBeamGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.95" />
                          <stop offset="35%" stopColor="#86EFAC" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
                        </linearGradient>

                        {/* Wheel Pattern Spoke */}
                        <pattern id="wheelSpoke" width="12" height="12" patternUnits="userSpaceOnUse">
                          <circle cx="6" cy="6" r="5" fill="#455A64" stroke="#263238" strokeWidth="1" />
                          <circle cx="6" cy="6" r="2.2" fill="#90A4AE" />
                          <line x1="6" y1="1" x2="6" y2="11" stroke="#263238" strokeWidth="0.8" />
                          <line x1="1" y1="6" x2="11" y2="6" stroke="#263238" strokeWidth="0.8" />
                        </pattern>
                      </defs>

                      {/* Headlight Beam Projecting Forward to the Right */}
                      <polygon points="326,38 375,22 375,54 326,40" fill="url(#headlightBeamGlow)" className="animate-pulse" />

                      {/* Cast Shadow on Track */}
                      <ellipse cx="165" cy="74" rx="155" ry="4" fill="#071A33" fillOpacity="0.32" />

                      {/* ================= COACH 1: PASSENGER COACH (LEFT / REAR) ================= */}
                      <g transform="translate(10, 8)">
                        {/* Coach Body */}
                        <rect x="0" y="0" width="118" height="46" rx="5" fill="url(#vbBodyPure)" stroke="#1A202C" strokeWidth="1.2" />
                        
                        {/* Roof AC Units */}
                        <rect x="25" y="-5" width="30" height="5" rx="1.5" fill="#90A4AE" stroke="#455A64" strokeWidth="0.5" />
                        <rect x="70" y="-5" width="30" height="5" rx="1.5" fill="#90A4AE" stroke="#455A64" strokeWidth="0.5" />

                        {/* Navy Blue Window Stripe */}
                        <rect x="0" y="15" width="118" height="15" fill="#0E1E38" />

                        {/* Saffron Passenger Entrance Door (Left) */}
                        <rect x="4" y="11" width="9" height="34" rx="1.2" fill="#FF8F00" stroke="#1A202C" strokeWidth="0.8" />
                        <rect x="6.5" y="16" width="4" height="12" rx="0.8" fill="#0E1E38" />

                        {/* 4 Passenger Windows */}
                        <rect x="22" y="17" width="18" height="11" rx="1.5" fill="url(#vbWindowGlassExact)" stroke="#37474F" strokeWidth="0.5" />
                        <rect x="45" y="17" width="18" height="11" rx="1.5" fill="url(#vbWindowGlassExact)" stroke="#37474F" strokeWidth="0.5" />
                        <rect x="68" y="17" width="18" height="11" rx="1.5" fill="url(#vbWindowGlassExact)" stroke="#37474F" strokeWidth="0.5" />
                        <rect x="91" y="17" width="18" height="11" rx="1.5" fill="url(#vbWindowGlassExact)" stroke="#37474F" strokeWidth="0.5" />

                        {/* Window Glass Highlights */}
                        <line x1="24" y1="19" x2="38" y2="19" stroke="#90CAF9" strokeWidth="0.7" opacity="0.7" />
                        <line x1="47" y1="19" x2="61" y2="19" stroke="#90CAF9" strokeWidth="0.7" opacity="0.7" />
                        <line x1="70" y1="19" x2="84" y2="19" stroke="#90CAF9" strokeWidth="0.7" opacity="0.7" />
                        <line x1="93" y1="19" x2="107" y2="19" stroke="#90CAF9" strokeWidth="0.7" opacity="0.7" />

                        {/* Bogie 1 (Left) - Animated Spinning Wheels */}
                        <rect x="14" y="46" width="34" height="7" rx="2" fill="#263238" />
                        <g transform="translate(22, 57)">
                          <circle cx="0" cy="0" r="7" fill="#37474F" stroke="#1A202C" strokeWidth="1.5" />
                          <circle cx="0" cy="0" r="3.2" fill="#B0BEC5" />
                          <line x1="-5" y1="0" x2="5" y2="0" stroke="#1A202C" strokeWidth="1" className="animate-[spin_0.8s_linear_infinite]" style={{ transformOrigin: "0 0" }} />
                          <line x1="0" y1="-5" x2="0" y2="5" stroke="#1A202C" strokeWidth="1" className="animate-[spin_0.8s_linear_infinite]" style={{ transformOrigin: "0 0" }} />
                        </g>
                        <g transform="translate(40, 57)">
                          <circle cx="0" cy="0" r="7" fill="#37474F" stroke="#1A202C" strokeWidth="1.5" />
                          <circle cx="0" cy="0" r="3.2" fill="#B0BEC5" />
                          <line x1="-5" y1="0" x2="5" y2="0" stroke="#1A202C" strokeWidth="1" className="animate-[spin_0.8s_linear_infinite]" style={{ transformOrigin: "0 0" }} />
                          <line x1="0" y1="-5" x2="0" y2="5" stroke="#1A202C" strokeWidth="1" className="animate-[spin_0.8s_linear_infinite]" style={{ transformOrigin: "0 0" }} />
                        </g>

                        {/* Bogie 2 (Right) - Animated Spinning Wheels */}
                        <rect x="74" y="46" width="34" height="7" rx="2" fill="#263238" />
                        <g transform="translate(82, 57)">
                          <circle cx="0" cy="0" r="7" fill="#37474F" stroke="#1A202C" strokeWidth="1.5" />
                          <circle cx="0" cy="0" r="3.2" fill="#B0BEC5" />
                          <line x1="-5" y1="0" x2="5" y2="0" stroke="#1A202C" strokeWidth="1" className="animate-[spin_0.8s_linear_infinite]" style={{ transformOrigin: "0 0" }} />
                          <line x1="0" y1="-5" x2="0" y2="5" stroke="#1A202C" strokeWidth="1" className="animate-[spin_0.8s_linear_infinite]" style={{ transformOrigin: "0 0" }} />
                        </g>
                        <g transform="translate(100, 57)">
                          <circle cx="0" cy="0" r="7" fill="#37474F" stroke="#1A202C" strokeWidth="1.5" />
                          <circle cx="0" cy="0" r="3.2" fill="#B0BEC5" />
                          <line x1="-5" y1="0" x2="5" y2="0" stroke="#1A202C" strokeWidth="1" className="animate-[spin_0.8s_linear_infinite]" style={{ transformOrigin: "0 0" }} />
                          <line x1="0" y1="-5" x2="0" y2="5" stroke="#1A202C" strokeWidth="1" className="animate-[spin_0.8s_linear_infinite]" style={{ transformOrigin: "0 0" }} />
                        </g>
                      </g>

                      {/* ================= GANGWAY BELLOWS COUPLING ================= */}
                      <g transform="translate(129, 10)">
                        <rect x="0" y="2" width="7" height="40" fill="#1A202C" rx="1" />
                        <line x1="2" y1="3" x2="2" y2="41" stroke="#455A64" strokeWidth="1" />
                        <line x1="5" y1="3" x2="5" y2="41" stroke="#455A64" strokeWidth="1" />
                      </g>

                      {/* ================= LOCOMOTIVE: FRONT ENGINE (RIGHT / LEADING) ================= */}
                      <g transform="translate(136, 8)">
                        {/* Aerodynamic Locomotive Body (Matching User Reference Image) */}
                        <path
                          d="M 0 0 L 126 0 C 145 0 178 12 188 32 C 188 40 178 46 160 46 L 0 46 Z"
                          fill="url(#vbBodyPure)"
                          stroke="#1A202C"
                          strokeWidth="1.2"
                        />

                        {/* Roof AC Pods */}
                        <rect x="15" y="-5" width="30" height="5" rx="1.5" fill="#90A4AE" stroke="#455A64" strokeWidth="0.5" />
                        <rect x="60" y="-5" width="30" height="5" rx="1.5" fill="#90A4AE" stroke="#455A64" strokeWidth="0.5" />

                        {/* Upper Branding Text: "VANDE BHARAT" */}
                        <text x="50" y="11" fill="#78909C" fontFamily="sans-serif" fontSize="4.8" fontWeight="bold" letterSpacing="1">
                          VANDE BHARAT
                        </text>

                        {/* Navy Blue Aerodynamic Swept Window Stripe */}
                        <path
                          d="M 0 15 L 120 15 C 138 15 174 24 184 34 C 186 36 182 39 164 39 L 0 39 Z"
                          fill="#0E1E38"
                        />

                        {/* Saffron Door on Locomotive */}
                        <rect x="34" y="11" width="9" height="34" rx="1.2" fill="#FF8F00" stroke="#1A202C" strokeWidth="0.8" />
                        <rect x="36.5" y="16" width="4" height="12" rx="0.8" fill="#0E1E38" />

                        {/* Saffron Distinctive Trapezoid Section (Exact Match to User Image) */}
                        <polygon
                          points="48,16 95,16 85,32 48,32"
                          fill="#FF8F00"
                          stroke="#E65100"
                          strokeWidth="0.5"
                        />

                        {/* Passenger Window */}
                        <rect x="10" y="17" width="18" height="11" rx="1.5" fill="url(#vbWindowGlassExact)" stroke="#37474F" strokeWidth="0.5" />
                        <line x1="12" y1="19" x2="26" y2="19" stroke="#90CAF9" strokeWidth="0.7" opacity="0.7" />

                        {/* Aerodynamic Driver Glass Windshield */}
                        <path
                          d="M 132 5 C 146 8 162 18 174 31 L 154 31 C 144 18 136 12 124 9 Z"
                          fill="url(#vbWindshieldExact)"
                          stroke="#FFFFFF"
                          strokeWidth="1.2"
                        />

                        {/* Aerodynamic Curved White Nose Accent Line */}
                        <path
                          d="M 148 2 C 168 12 184 26 187 36"
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth="1.2"
                        />

                        {/* Lower Branding Text: "VANDE BHARAT" in Bold Sans */}
                        <text x="96" y="44" fill="#0E1E38" fontFamily="sans-serif" fontSize="6.5" fontWeight="900" letterSpacing="0.8">
                          VANDE BHARAT
                        </text>

                        {/* Front High-Intensity LED Headlight (Right tip) */}
                        <circle cx="187" cy="35" r="2.8" fill="#FFF59D" stroke="#FFFFFF" strokeWidth="1" />
                        <circle cx="187" cy="35" r="1.4" fill="#FFFFFF" />

                        {/* Locomotive Bogie 1 - Animated Spinning Wheels */}
                        <rect x="36" y="46" width="34" height="7" rx="2" fill="#263238" />
                        <g transform="translate(44, 57)">
                          <circle cx="0" cy="0" r="7" fill="#37474F" stroke="#1A202C" strokeWidth="1.5" />
                          <circle cx="0" cy="0" r="3.2" fill="#B0BEC5" />
                          <line x1="-5" y1="0" x2="5" y2="0" stroke="#1A202C" strokeWidth="1" className="animate-[spin_0.8s_linear_infinite]" style={{ transformOrigin: "0 0" }} />
                          <line x1="0" y1="-5" x2="0" y2="5" stroke="#1A202C" strokeWidth="1" className="animate-[spin_0.8s_linear_infinite]" style={{ transformOrigin: "0 0" }} />
                        </g>
                        <g transform="translate(62, 57)">
                          <circle cx="0" cy="0" r="7" fill="#37474F" stroke="#1A202C" strokeWidth="1.5" />
                          <circle cx="0" cy="0" r="3.2" fill="#B0BEC5" />
                          <line x1="-5" y1="0" x2="5" y2="0" stroke="#1A202C" strokeWidth="1" className="animate-[spin_0.8s_linear_infinite]" style={{ transformOrigin: "0 0" }} />
                          <line x1="0" y1="-5" x2="0" y2="5" stroke="#1A202C" strokeWidth="1" className="animate-[spin_0.8s_linear_infinite]" style={{ transformOrigin: "0 0" }} />
                        </g>

                        {/* Locomotive Bogie 2 (Leading under Radar) - Animated Spinning Wheels */}
                        <rect x="104" y="46" width="34" height="7" rx="2" fill="#263238" />
                        <g transform="translate(112, 57)">
                          <circle cx="0" cy="0" r="7" fill="#37474F" stroke="#1A202C" strokeWidth="1.5" />
                          <circle cx="0" cy="0" r="3.2" fill="#B0BEC5" />
                          <line x1="-5" y1="0" x2="5" y2="0" stroke="#1A202C" strokeWidth="1" className="animate-[spin_0.8s_linear_infinite]" style={{ transformOrigin: "0 0" }} />
                          <line x1="0" y1="-5" x2="0" y2="5" stroke="#1A202C" strokeWidth="1" className="animate-[spin_0.8s_linear_infinite]" style={{ transformOrigin: "0 0" }} />
                        </g>
                        <g transform="translate(130, 57)">
                          <circle cx="0" cy="0" r="7" fill="#37474F" stroke="#1A202C" strokeWidth="1.5" />
                          <circle cx="0" cy="0" r="3.2" fill="#B0BEC5" />
                          <line x1="-5" y1="0" x2="5" y2="0" stroke="#1A202C" strokeWidth="1" className="animate-[spin_0.8s_linear_infinite]" style={{ transformOrigin: "0 0" }} />
                          <line x1="0" y1="-5" x2="0" y2="5" stroke="#1A202C" strokeWidth="1" className="animate-[spin_0.8s_linear_infinite]" style={{ transformOrigin: "0 0" }} />
                        </g>
                      </g>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Station Waypoints & Labels Below the Track */}
              <div className="relative mt-4 flex items-start justify-between">
                {train.stations.map((station, index) => {
                  const position = (index / Math.max(train.stations.length - 1, 1)) * 100
                  const isCurrent = station === selectedStation
                  const isPassed = index < selectedStationIndex
                  const isStart = index === 0
                  const isEnd = index === train.stations.length - 1

                  return (
                    <button
                      key={station}
                      type="button"
                      onClick={() => setSelectedStation(station)}
                      aria-label={`Select station ${station}`}
                      className="group relative flex flex-col items-center cursor-pointer focus:outline-none transition-all duration-200"
                      style={{
                        position: 'absolute',
                        left: `${position}%`,
                        transform: 'translateX(-50%)',
                      }}
                    >
                      {/* Station Node Marker */}
                      <div className="mb-2 flex items-center justify-center">
                        {isCurrent ? (
                          /* Active Station: Glowing Solid Amber / White Node */
                          <div className="relative flex items-center justify-center">
                            <span className="h-4 w-4 rounded-full bg-[#FF9100]/30 animate-ping" />
                            <span className="h-3 w-3 rounded-full border-2 border-white bg-[#FF9100] shadow-[0_0_10px_rgba(255,145,0,0.9)]" />
                          </div>
                        ) : isPassed ? (
                          /* Passed Station: Glowing Teal Solid Node */
                          <span className="h-2.5 w-2.5 rounded-full bg-[#0E7C86] shadow-[0_0_6px_rgba(14,124,134,0.6)]" />
                        ) : (
                          /* Upcoming Station: Concentric Hollow Slate Ring */
                          <span className="h-3 w-3 rounded-full border-2 border-slate-300 bg-white group-hover:border-[#071A33] transition-all" />
                        )}
                      </div>

                      {/* Station Title & Subtitle Info */}
                      <div className="text-center whitespace-nowrap">
                        {isCurrent ? (
                          <div>
                            <p className="text-sm sm:text-base font-extrabold text-[#071A33] tracking-tight">
                              Next Stop: {station}
                            </p>
                            <p className="text-[11px] font-bold text-[#0E7C86] mt-0.5">
                              Plat {getStationPlatform(station, train, index)} | Live | {train.delayMinutes > 0 ? `+${train.delayMinutes} mins` : "On Time"}
                            </p>
                          </div>
                        ) : isPassed ? (
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-[#0E7C86]">
                              {isStart ? "Start" : station}
                            </p>
                            <p className="text-[10px] font-semibold text-slate-400">
                              Plat {getStationPlatform(station, train, index)}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-500 group-hover:text-[#071A33] transition-colors">
                              {isEnd ? "Destination" : station}
                            </p>
                            <p className="text-[10px] font-semibold text-slate-400">
                              Plat {getStationPlatform(station, train, index)}
                            </p>
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Bottom Padding spacer for absolute station labels */}
              <div className="h-14" />
            </div>
          </div>

          <div className="grid border-b border-slate-200 grid-cols-2 sm:grid-cols-4">
            <div className="border-b border-r border-slate-200 p-4 sm:p-5 sm:border-b-0">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <MapPin size={15} className="text-[#F59E0B]" />
                Selected Station
              </div>

              <p className="mt-2.5 text-base sm:text-lg font-bold text-[#071A33] truncate">
                {selectedStation}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {selectedStation === train.currentLocation ? "Current Location" : "En-route Stop"}
              </p>
            </div>

            <div className="border-b border-slate-200 p-4 sm:p-5 sm:border-b-0 sm:border-r">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Building size={15} className="text-[#0E7C86]" />
                Platform Number
              </div>

              <p className="mt-2.5 text-base sm:text-lg font-extrabold text-[#0E7C86]">
                Platform {getStationPlatform(selectedStation, train, selectedStationIndex)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Assigned Platform
              </p>
            </div>

            <div className="border-r border-slate-200 p-4 sm:p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Clock3 size={15} className="text-[#F59E0B]" />
                Scheduled Time
              </div>

              <p className="mt-2.5 text-base sm:text-lg font-bold text-[#071A33]">
                {selectedStationTime.scheduled}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Scheduled arrival
              </p>
            </div>

            <div className="p-4 sm:p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Navigation size={15} className="text-[#0E7C86]" />
                Predicted Time
              </div>

              <p className="mt-2.5 text-base sm:text-lg font-bold text-[#0E5961]">
                {selectedStationTime.predicted}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {train.delayMinutes > 0 ? `+${train.delayMinutes} mins delay` : "Expected on time"}
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
                      className={`mt-1 h-3 w-3 rounded-full border-2 border-white shadow-sm ${update.status === "current"
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
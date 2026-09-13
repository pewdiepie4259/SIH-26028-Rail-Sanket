import { useState, useEffect } from "react"
import { Clock as ClockIcon, Radio, Calendar, Sparkles } from "lucide-react"

interface StationClockProps {
  className?: string
  stationName?: string
}

export default function StationClock({ className = "", stationName }: StationClockProps) {
  const [time, setTime] = useState<Date>(new Date())
  const [is24Hour, setIs24Hour] = useState<boolean>(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const hours = time.getHours()
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()

  // 12-Hour formatted components
  const hours12 = hours % 12 || 12
  const displayHours12 = String(hours12).padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"

  // 24-Hour formatted components
  const displayHours24 = String(hours).padStart(2, "0")
  const displayMinutes = String(minutes).padStart(2, "0")
  const displaySeconds = String(seconds).padStart(2, "0")

  // Date formatting
  const dayName = time.toLocaleDateString("en-IN", { weekday: "long" })
  const dateNum = time.getDate()
  const monthName = time.toLocaleDateString("en-IN", { month: "short" }).toUpperCase()
  const yearNum = time.getFullYear()

  // Progress for current minute (0% - 100%)
  const secondsProgress = ((seconds + 1) / 60) * 100

  return (
    <div
      className={`group relative flex flex-col rounded-2xl border border-[#F59E0B]/35 bg-[#031426]/85 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#F59E0B]/60 hover:shadow-[0_12px_32px_rgba(7,26,51,0.65)] ${className}`}
    >
      {/* Decorative Corner Glow */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[#0E7C86]/20 blur-2xl transition-all group-hover:bg-[#F59E0B]/20" />

      {/* Header Row: Live indicator + IST Badge */}
      <div className="relative z-10 mb-4 flex items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Live Station Clock
          </span>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
          <Radio size={11} className="text-emerald-400 animate-pulse" />
          <span>IST (UTC+5:30)</span>
        </div>
      </div>

      {/* Main Digital Time Display */}
      <div className="relative z-10 flex flex-col items-center justify-center rounded-xl border border-white/10 bg-black/40 px-4 py-4 shadow-inner">
        {/* Active Digital Clock */}
        <div className="flex items-baseline justify-center gap-1 font-mono">
          <span className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]">
            {is24Hour ? displayHours24 : displayHours12}
          </span>
          <span className="text-3xl font-extrabold text-[#F59E0B] animate-pulse sm:text-4xl">
            :
          </span>
          <span className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]">
            {displayMinutes}
          </span>
          <span className="text-3xl font-extrabold text-[#F59E0B] animate-pulse sm:text-4xl">
            :
          </span>
          <span className="text-3xl font-black text-[#2DD4BF] sm:text-4xl drop-shadow-[0_0_10px_rgba(45,212,191,0.5)]">
            {displaySeconds}
          </span>

          {!is24Hour && (
            <span className="ml-2 rounded-md bg-[#F59E0B] px-2 py-0.5 text-xs font-black uppercase text-[#071A33] shadow-sm">
              {ampm}
            </span>
          )}
        </div>

        {/* Both 12H and 24H Secondary Reference */}
        <div className="mt-2.5 flex items-center justify-between w-full border-t border-white/10 pt-2 text-[11px] text-slate-300">
          <span className="flex items-center gap-1 text-slate-400">
            <ClockIcon size={12} className="text-[#F59E0B]" />
            {is24Hour ? "24-Hour Format" : "12-Hour Format"}
          </span>

          {/* Alternate Format Quick Preview */}
          <span className="font-mono text-slate-300">
            {is24Hour ? (
              <span className="text-emerald-400">
                12H: {displayHours12}:{displayMinutes}:{displaySeconds} {ampm}
              </span>
            ) : (
              <span className="text-emerald-400">
                24H: {displayHours24}:{displayMinutes}:{displaySeconds}
              </span>
            )}
          </span>
        </div>

        {/* Seconds Linear Progress Bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#0E7C86] via-[#2DD4BF] to-[#F59E0B] transition-all duration-300"
            style={{ width: `${secondsProgress}%` }}
          />
        </div>
      </div>

      {/* Date & Day Banner */}
      <div className="relative z-10 mt-3.5 flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-xs text-white/90">
        <div className="flex items-center gap-2">
          <Calendar size={13} className="text-[#F59E0B]" />
          <span className="font-semibold text-slate-200">
            {dayName}, <span className="text-white font-bold">{dateNum} {monthName} {yearNum}</span>
          </span>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-teal-300 font-mono">
          <Sparkles size={11} className="text-[#F59E0B]" />
          <span>GPS SYNC</span>
        </div>
      </div>

      {/* Station Name & Interactive 12H / 24H Toggle */}
      <div className="relative z-10 mt-3.5 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
        <div className="flex items-center gap-1.5 truncate max-w-[190px] text-slate-200 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
          <span className="truncate" title={stationName || "Indian Railways"}>
            {stationName ? `${stationName}` : "Indian Railways Live"}
          </span>
        </div>

        <div className="flex items-center rounded-lg border border-white/20 bg-black/40 p-0.5">
          <button
            type="button"
            onClick={() => setIs24Hour(false)}
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-all ${
              !is24Hour
                ? "bg-[#F59E0B] text-[#071A33] shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            12H
          </button>
          <button
            type="button"
            onClick={() => setIs24Hour(true)}
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-all ${
              is24Hour
                ? "bg-[#F59E0B] text-[#071A33] shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            24H
          </button>
        </div>
      </div>
    </div>
  )
}


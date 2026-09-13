import { useState, useEffect } from "react"
import { Clock as ClockIcon, Radio } from "lucide-react"

interface StationClockProps {
  className?: string
  stationName?: string
}

export default function StationClock({ className = "", stationName }: StationClockProps) {
  const [time, setTime] = useState<Date>(new Date())
  const [is24Hour, setIs24Hour] = useState<boolean>(false)

  useEffect(() => {
    // Update every second with high precision
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const hours = time.getHours()
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()

  // Analog Hand Angles
  const secondDeg = seconds * 6
  const minuteDeg = (minutes + seconds / 60) * 6
  const hourDeg = ((hours % 12) + minutes / 60 + seconds / 3600) * 30

  // Digital Time formatting
  const displayHours = is24Hour
    ? String(hours).padStart(2, "0")
    : String(hours % 12 || 12).padStart(2, "0")
  const displayMinutes = String(minutes).padStart(2, "0")
  const displaySeconds = String(seconds).padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"

  // Date formatting
  const dayName = time.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase()
  const dateNum = time.getDate()
  const monthName = time.toLocaleDateString("en-IN", { month: "short" }).toUpperCase()
  const yearNum = time.getFullYear()

  // Generate 60 tick marks
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const isHour = i % 5 === 0
    const angle = i * 6
    const rad = (angle - 90) * (Math.PI / 180)
    const r1 = isHour ? 97 : 104
    const r2 = 113
    const x1 = 130 + r1 * Math.cos(rad)
    const y1 = 130 + r1 * Math.sin(rad)
    const x2 = 130 + r2 * Math.cos(rad)
    const y2 = 130 + r2 * Math.sin(rad)
    return { isHour, angle, x1, y1, x2, y2, i }
  })

  // Numbers 1-12
  const numerals = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => {
    const angle = num * 30
    const rad = (angle - 90) * (Math.PI / 180)
    const r = 83
    const x = 130 + r * Math.cos(rad)
    const y = 130 + r * Math.sin(rad)
    return { num, x, y }
  })

  return (
    <div
      className={`group relative flex flex-col items-center justify-center rounded-2xl border border-white/20 bg-transparent p-4.5 backdrop-blur-[6px] transition-all duration-300 hover:border-white/35 ${className}`}
      style={{
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      {/* Header Badge */}
      <div className="mb-2.5 flex w-full items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[11px] font-semibold tracking-wider text-white uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            Live Station Clock
          </span>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-transparent px-2.5 py-1 text-[10px] font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          <Radio size={11} className="text-emerald-400" />
          <span>IST (UTC+5:30)</span>
        </div>
      </div>

      {/* Analog Clock Dial SVG */}
      <div className="relative flex items-center justify-center">
        <svg
          viewBox="0 0 260 260"
          className="h-[225px] w-[225px] sm:h-[250px] sm:w-[250px] select-none"
        >
          <defs>
            {/* Subtle Hand Shadow */}
            <filter id="subtleHandShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0.5" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.6" />
            </filter>
            <filter id="cleanNumShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="#000000" floodOpacity="0.75" />
            </filter>
          </defs>

          {/* Fully Transparent Dial Circle */}
          <circle
            cx="130"
            cy="130"
            r="124"
            fill="none"
            stroke="rgba(255, 255, 255, 0.22)"
            strokeWidth="1.2"
          />

          {/* Inner Decorative Accent Ring */}
          <circle
            cx="130"
            cy="130"
            r="115"
            fill="none"
            stroke="rgba(245, 158, 11, 0.35)"
            strokeWidth="0.8"
            strokeDasharray="3 3"
          />
          <circle
            cx="130"
            cy="130"
            r="94"
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="0.8"
          />

          {/* Dial Ticks */}
          {ticks.map((tick) => (
            <line
              key={tick.i}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke={tick.isHour ? "#F59E0B" : "rgba(255, 255, 255, 0.55)"}
              strokeWidth={tick.isHour ? 2.2 : 0.9}
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))" }}
            />
          ))}

          {/* Elegant Numerals with Proper Proportions and Clean Styling */}
          {numerals.map(({ num, x, y }) => (
            <text
              key={num}
              x={x}
              y={y}
              dominantBaseline="central"
              textAnchor="middle"
              filter="url(#cleanNumShadow)"
              className={`font-sans text-[12px] font-semibold tracking-normal ${
                num === 12 || num === 3 || num === 6 || num === 9
                  ? "fill-[#F59E0B]"
                  : "fill-white/95"
              }`}
            >
              {num}
            </text>
          ))}

          {/* Railway Station Emblem & Branding on Dial - Positioned safely below number 12 */}
          <g transform="translate(130, 80)">
            <circle
              cx="0"
              cy="0"
              r="9.5"
              fill="rgba(7, 26, 51, 0.7)"
              stroke="#F59E0B"
              strokeWidth="1"
              style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }}
            />
            <clipPath id="stationLogoClip">
              <circle cx="0" cy="0" r="8.5" />
            </clipPath>
            <image
              href="/logos/raildrishti-dark.png"
              x="-8.5"
              y="-8.5"
              width="17"
              height="17"
              preserveAspectRatio="xMidYMid meet"
              clipPath="url(#stationLogoClip)"
            />
            <text
              x="0"
              y="15"
              textAnchor="middle"
              className="fill-white/90 font-sans text-[7px] font-semibold uppercase tracking-[0.16em]"
              style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }}
            >
              RAIL DRISHTI
            </text>
          </g>

          {/* INSIDE EMBEDDED DIGITAL CLOCK DISPLAY (Transparent HUD Plate) */}
          <g transform="translate(130, 168)">
            {/* Fully Transparent Glass Background Pill */}
            <rect
              x="-62"
              y="-16"
              width="124"
              height="32"
              rx="7"
              fill="none"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1.2"
            />

            {/* Subtle inner separator line */}
            <line x1="-58" y1="1" x2="58" y2="1" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="0.5" />

            {/* Digital Time Inside Dial - Centered on same horizontal line as AM/PM */}
            <text
              x={is24Hour ? "0" : "-10"}
              y="-7.5"
              dominantBaseline="central"
              textAnchor="middle"
              className="fill-white font-mono text-[14px] font-black tracking-wider"
              style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.9))" }}
            >
              {displayHours}:{displayMinutes}:{displaySeconds}
            </text>

            {/* AM/PM Tag - In-line on the exact same vertical center */}
            {!is24Hour && (
              <g>
                <rect
                  x="28"
                  y="-13"
                  width="26"
                  height="11"
                  rx="3"
                  fill="#F59E0B"
                />
                <text
                  x="41"
                  y="-7.5"
                  dominantBaseline="central"
                  textAnchor="middle"
                  className="fill-[#071A33] font-sans text-[7.5px] font-black"
                >
                  {ampm}
                </text>
              </g>
            )}

            {/* Mini Station / Date Label */}
            <text
              x="0"
              y="9"
              dominantBaseline="central"
              textAnchor="middle"
              className="fill-white font-sans text-[7.5px] font-extrabold tracking-wider uppercase"
              style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }}
            >
              {dayName}, {dateNum} {monthName} {yearNum}
            </text>
          </g>

          {/* HANDS LAYER */}
          {/* Hour Hand */}
          <g
            transform={`rotate(${hourDeg} 130 130)`}
            filter="url(#subtleHandShadow)"
            style={{ transition: "transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44)" }}
          >
            <path
              d="M127 136 L126.5 78 L130 66 L133.5 78 L133 136 Z"
              fill="#FFFFFF"
              stroke="#04121F"
              strokeWidth="1"
            />
            <line x1="130" y1="120" x2="130" y2="78" stroke="#0E7C86" strokeWidth="2" />
          </g>

          {/* Minute Hand */}
          <g
            transform={`rotate(${minuteDeg} 130 130)`}
            filter="url(#subtleHandShadow)"
            style={{ transition: "transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44)" }}
          >
            <path
              d="M127.5 138 L127.5 50 L130 36 L132.5 50 L132.5 138 Z"
              fill="#FFFFFF"
              stroke="#04121F"
              strokeWidth="1"
            />
            <line x1="130" y1="125" x2="130" y2="48" stroke="#F59E0B" strokeWidth="2" />
          </g>

          {/* Second Hand */}
          <g
            transform={`rotate(${secondDeg} 130 130)`}
            filter="url(#subtleHandShadow)"
            style={{ transition: "transform 0.15s cubic-bezier(0.4, 2.3, 0.3, 1)" }}
          >
            <line x1="130" y1="152" x2="130" y2="26" stroke="#F59E0B" strokeWidth="1.8" />
            <circle cx="130" cy="142" r="4" fill="#F59E0B" stroke="#04121F" strokeWidth="0.8" />
            <polygon points="130,20 128,29 132,29" fill="#EF4444" />
          </g>

          {/* Center Hub Nut */}
          <circle cx="130" cy="130" r="5" fill="#F59E0B" stroke="#04121F" strokeWidth="1.2" />
          <circle cx="130" cy="130" r="2" fill="#04121F" />
        </svg>
      </div>

      {/* Footer Info / Digital Switch */}
      <div className="mt-2.5 flex w-full items-center justify-between border-t border-white/20 pt-2.5 px-1 text-[12px] text-white/90">
        <div className="flex items-center gap-1.5 truncate">
          <ClockIcon size={14} className="text-[#F59E0B] shrink-0" />
          <span className="truncate font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            {stationName ? `${stationName} Time` : "Indian Railway Clock"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIs24Hour(!is24Hour)}
          className="cursor-pointer rounded-md border border-white/20 bg-transparent px-2.5 py-1 text-[10px] font-bold text-white transition hover:bg-white/10 hover:text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
          title="Toggle 12h/24h digital format"
        >
          {is24Hour ? "24H" : "12H"}
        </button>
      </div>
    </div>
  )
}

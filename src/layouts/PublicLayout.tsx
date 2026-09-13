import { useState, useEffect } from "react"
import {
  ChevronDown,
  Eye,
  Link2,
  Moon,
  Palette,
  PersonStanding,
  RotateCcw,
  Sun,
  Type,
  ZoomIn,
  ZoomOut,
  Menu,
  X,
  ShieldAlert,
} from "lucide-react"
import { NavLink, Link, Outlet } from "react-router-dom"

function PublicLayout() {
  const languages = [
    { code: "en", label: "English", native: "English" },
    { code: "hi", label: "Hindi", native: "हिंदी" },
    { code: "bn", label: "Bengali", native: "বাংলা" },
    { code: "mr", label: "Marathi", native: "मराठी" },
    { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
    { code: "ks", label: "Kashmiri", native: "کٲشُر / कश्मीरी" },
    { code: "ta", label: "Tamil", native: "தமிழ்" },
    { code: "te", label: "Telugu", native: "తెలుగు" },
    { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  ]

  const [clockTime, setClockTime] = useState<Date>(new Date())
  const [is24HourHeader, setIs24HourHeader] = useState<boolean>(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setClockTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const headerHours = clockTime.getHours()
  const headerMinutes = clockTime.getMinutes()
  const headerSeconds = clockTime.getSeconds()

  const formattedHeaderTime = is24HourHeader
    ? `${String(headerHours).padStart(2, "0")}:${String(headerMinutes).padStart(2, "0")}:${String(headerSeconds).padStart(2, "0")}`
    : `${String(headerHours % 12 || 12).padStart(2, "0")}:${String(headerMinutes).padStart(2, "0")}:${String(headerSeconds).padStart(2, "0")} ${headerHours >= 12 ? "PM" : "AM"}`

  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("raildrishti_lang_native")
    return saved || "English"
  })
  const [languageOpen, setLanguageOpen] = useState(false)
  const [accessibilityOpen, setAccessibilityOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [contrastMode, setContrastMode] = useState<"normal" | "high" | "dark">(
    "normal"
  )
  const [colorVisionMode, setColorVisionMode] = useState(false)
  const [highlightLinks, setHighlightLinks] = useState(false)
  const [invertColors, setInvertColors] = useState(false)
  const [saturationMode, setSaturationMode] = useState<
    "normal" | "low" | "high" | "desaturated"
  >("normal")
  const [textScale, setTextScale] = useState(1)

  const handleSelectLanguage = (option: { code: string; label: string; native: string }) => {
    setLanguage(option.native)
    setLanguageOpen(false)
    localStorage.setItem("raildrishti_lang_code", option.code)
    localStorage.setItem("raildrishti_lang_native", option.native)

    const targetCode = option.code
    const cookieVal = targetCode === "en" ? "" : `/en/${targetCode}`

    document.cookie = `googtrans=${cookieVal}; path=/;`
    document.cookie = `googtrans=${cookieVal}; path=/; domain=${window.location.hostname};`

    const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo")
    if (combo) {
      combo.value = targetCode
      combo.dispatchEvent(new Event("change"))
    } else {
      window.location.reload()
    }
  }

  const increaseTextSize = () => {
    setTextScale((current) => Math.min(current + 0.1, 1.4))
  }

  const decreaseTextSize = () => {
    setTextScale((current) => Math.max(current - 0.1, 0.8))
  }

  const resetTextSize = () => {
    setTextScale(1)
  }

  const resetAccessibility = () => {
    setContrastMode("normal")
    setColorVisionMode(false)
    setHighlightLinks(false)
    setInvertColors(false)
    setSaturationMode("normal")
    setTextScale(1)
  }

  const accessibilityFilters = [
    invertColors ? "invert(1)" : "",
    saturationMode === "low" ? "saturate(0.65)" : "",
    saturationMode === "high" ? "saturate(1.5)" : "",
    saturationMode === "desaturated" ? "saturate(0)" : "",
  ]
    .filter(Boolean)
    .join(" ")

  const cardBase =
    "flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center shadow-sm transition-all duration-300"

  const cardInactive =
    "border-slate-200 bg-white text-[#071A33] hover:-translate-y-0.5 hover:scale-[1.005] hover:border-[#F59E0B]/40 hover:shadow-[0_8px_20px_rgba(245,158,11,0.08)]"

  const cardActive =
    "border-[#0E7C86] bg-[#E7F4F5] text-[#0E5961] shadow-sm"

  const textCard =
    "flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-center text-[#071A33] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.005] hover:border-[#F59E0B]/40 hover:shadow-[0_8px_20px_rgba(245,158,11,0.08)]"

  const headerButton =
    "flex h-9 items-center justify-center rounded-lg border border-[#F59E0B]/80 bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-3.5 text-xs font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(14,89,97,0.28)]"

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
      isActive
        ? "bg-white/20 text-[#F59E0B] shadow-sm font-bold border border-white/10"
        : "text-slate-200 hover:text-white hover:bg-white/10"
    }`

  return (
    <div
      className={`min-h-screen text-slate-900 ${
        contrastMode === "dark"
          ? "bg-[#071A33] text-white"
          : "bg-[#F4F7FA]"
      } ${contrastMode === "high" ? "contrast-[1.25]" : ""}`}
      style={{
        fontSize: `${textScale * 100}%`,
        filter: accessibilityFilters || undefined,
      }}
    >
      <header className="border-b border-[#164B5A] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] sticky top-0 z-40 shadow-lg">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
          {/* Brand Logo & Title */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[#294665] bg-[#071A33] shadow-sm">
              <img
                src="/logos/raildrishti-dark.png"
                alt="RailDrishti"
                className="h-full w-full object-contain p-0.5"
              />
            </div>

            <div>
              <div className="text-lg font-extrabold leading-none tracking-tight text-white flex items-center">
                Rail<span className="text-[#F59E0B]">Drishti</span>
              </div>

              <div className="mt-1 hidden text-[9px] font-bold uppercase tracking-wider text-[#F59E0B] sm:block">
                Dynamic Train ETA & Copilot
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              Dashboard
            </NavLink>

            <NavLink to="/live" className={navLinkClass}>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Monitor
            </NavLink>

            <NavLink to="/eta" className={navLinkClass}>
              Dynamic ETA
            </NavLink>

            <NavLink to="/map" className={navLinkClass}>
              Live Map
            </NavLink>

            <NavLink to="/trains" className={navLinkClass}>
              Train Search
            </NavLink>

            <NavLink to="/stations" className={navLinkClass}>
              Stations
            </NavLink>

            <NavLink to="/controller" className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-amber-500 text-[#071A33] font-bold shadow-sm"
                  : "bg-indigo-950/60 border border-indigo-700/60 text-indigo-300 hover:bg-indigo-900/60 hover:text-white"
              }`
            }>
              <ShieldAlert size={13} />
              Controller DSS
            </NavLink>

            <NavLink to="/settings" className={navLinkClass}>
              Settings
            </NavLink>
          </nav>

          {/* Right Actions: Live Clock Pill, Login, Register, Language, Accessibility, Mobile Toggle */}
          <div className="flex items-center gap-2">
            {/* Live IST Digital Clock Capsule (Click to toggle 12H/24H) */}
            <button
              type="button"
              onClick={() => setIs24HourHeader(!is24HourHeader)}
              title="Live Indian Standard Time (IST) • Click to toggle 12H / 24H mode"
              className="flex h-9 items-center gap-2 rounded-full border border-[#F59E0B]/70 bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-3 text-xs font-bold text-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-[#F59E0B] hover:shadow-[0_4px_12px_rgba(245,158,11,0.25)] select-none cursor-pointer"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10B981]" />
              </span>
              <span className="text-[10px] font-black tracking-wider text-[#F59E0B] uppercase">IST</span>
              <span className="font-mono tracking-wide text-white">{formattedHeaderTime}</span>
              <span className="hidden md:inline-block rounded bg-black/40 px-1.5 py-0.5 text-[9px] font-sans font-bold text-teal-300">
                {is24HourHeader ? "24H" : "12H"}
              </span>
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `${headerButton} ${
                    isActive
                      ? "shadow-[0_5px_14px_rgba(245,158,11,0.18)]"
                      : ""
                  }`
                }
              >
                Login
              </NavLink>

              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `${headerButton} ${
                    isActive
                      ? "shadow-[0_5px_14px_rgba(245,158,11,0.18)]"
                      : ""
                  }`
                }
              >
                Register
              </NavLink>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                aria-label="Change language"
                aria-expanded={languageOpen}
                onClick={() => {
                  setLanguageOpen(!languageOpen)
                  setAccessibilityOpen(false)
                }}
                className={`flex h-9 items-center gap-1.5 rounded-full border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-3 text-xs font-medium text-white transition-all duration-300 hover:scale-[1.02] ${
                  languageOpen
                    ? "shadow-[0_5px_14px_rgba(245,158,11,0.18)]"
                    : ""
                }`}
              >
                <span className="flex items-center gap-1">
                  <span className="text-xs leading-none">A</span>
                  <span className="text-xs leading-none text-[#F59E0B]">अ</span>
                </span>
                <span className="hidden md:inline text-xs">{language}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${languageOpen ? "rotate-180" : ""}`} />
              </button>

              {languageOpen && (
                <div className="absolute right-0 top-11 z-[60] w-52 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  {languages.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => handleSelectLanguage(option)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                        language === option.native || language === option.label
                          ? "bg-[#FFF4E1] text-[#0E7C86] font-semibold"
                          : "text-slate-700 hover:bg-slate-50 hover:text-[#0E7C86]"
                      }`}
                    >
                      <span>{option.native}</span>
                      <span className="text-[11px] font-normal text-slate-400">{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Accessibility Button */}
            <div className="relative ml-1">
              <button
                type="button"
                aria-label="Accessibility Tools"
                aria-expanded={accessibilityOpen}
                onClick={() => {
                  setAccessibilityOpen(!accessibilityOpen)
                  setLanguageOpen(false)
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] transition-all duration-300 hover:scale-[1.02] ${
                  accessibilityOpen
                    ? "shadow-[0_5px_14px_rgba(245,158,11,0.18)]"
                    : ""
                }`}
              >
                <PersonStanding
                  size={20}
                  strokeWidth={2}
                  className="text-white"
                />
              </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              aria-label="Open Navigation Menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-[#F59E0B]/80 bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

              {accessibilityOpen && (
                <div className="absolute right-0 top-12 z-50 w-[390px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-[#F59E0B]/25 bg-gradient-to-br from-[#FFF8EC] via-[#FFF4E1] to-[#FFECCF] shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <h2 className="text-lg font-bold text-[#071A33]">
                      Accessibility Tools
                    </h2>

                    <button
                      type="button"
                      aria-label="Close accessibility tools"
                      onClick={() => setAccessibilityOpen(false)}
                      className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <ChevronDown size={19} className="rotate-180" />
                    </button>
                  </div>

                  <div className="max-h-[calc(100vh-90px)] overflow-y-auto p-4">
                    <section>
                      <div className="mb-3 flex items-center justify-between rounded-lg bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-4 py-3">
                        <h3 className="text-base font-semibold text-white">
                          Color Adjustment
                        </h3>

                        <Palette
                          size={17}
                          className="text-[#F59E0B]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setContrastMode(
                              contrastMode === "high" ? "normal" : "high"
                            )
                          }
                          className={`${cardBase} ${
                            contrastMode === "high"
                              ? cardActive
                              : cardInactive
                          }`}
                        >
                          <Sun size={22} />

                          <span className="text-xs font-semibold">
                            High Contrast
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setContrastMode(
                              contrastMode === "dark" ? "normal" : "dark"
                            )
                          }
                          className={`${cardBase} ${
                            contrastMode === "dark"
                              ? cardActive
                              : cardInactive
                          }`}
                        >
                          <Moon size={22} />

                          <span className="text-xs font-semibold">
                            Dark Contrast
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setColorVisionMode(!colorVisionMode)
                          }
                          className={`${cardBase} ${
                            colorVisionMode ? cardActive : cardInactive
                          }`}
                        >
                          <Eye size={22} />

                          <span className="text-xs font-semibold">
                            Color Vision Deficiency
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setHighlightLinks(!highlightLinks)
                          }
                          className={`${cardBase} ${
                            highlightLinks ? cardActive : cardInactive
                          }`}
                        >
                          <Link2 size={22} />

                          <span className="text-xs font-semibold">
                            Highlight Links
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setInvertColors(!invertColors)}
                          className={`${cardBase} ${
                            invertColors ? cardActive : cardInactive
                          }`}
                        >
                          <Palette size={22} />

                          <span className="text-xs font-semibold">
                            Invert
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setSaturationMode(
                              saturationMode === "normal"
                                ? "low"
                                : saturationMode === "low"
                                ? "high"
                                : saturationMode === "high"
                                ? "desaturated"
                                : "normal"
                            )
                          }
                          className={`${cardBase} ${
                            saturationMode !== "normal"
                              ? cardActive
                              : cardInactive
                          }`}
                        >
                          <Palette size={22} />

                          <span className="text-xs font-semibold">
                            {saturationMode === "normal"
                              ? "Saturation"
                              : saturationMode === "low"
                              ? "Low Saturation"
                              : saturationMode === "high"
                              ? "High Saturation"
                              : "Desaturation"}
                          </span>
                        </button>
                      </div>
                    </section>

                    <section className="mt-5">
                      <div className="mb-3 flex items-center justify-between rounded-lg bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-4 py-3">
                        <h3 className="text-base font-semibold text-white">
                          Text Size
                        </h3>

                        <Type
                          size={18}
                          className="text-[#F59E0B]"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={increaseTextSize}
                          className={textCard}
                        >
                          <ZoomIn size={22} />

                          <span className="text-xs font-semibold">
                            Increase Text
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={decreaseTextSize}
                          className={textCard}
                        >
                          <ZoomOut size={22} />

                          <span className="text-xs font-semibold">
                            Decrease Text
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={resetTextSize}
                          className={textCard}
                        >
                          <RotateCcw size={22} />

                          <span className="text-xs font-semibold">
                            Reset Text
                          </span>
                        </button>
                      </div>
                    </section>

                    <section className="mt-5">
                      <div className="mb-3 rounded-lg bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-4 py-3">
                        <h3 className="text-base font-semibold text-white">
                          Saturation
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {[
                          {
                            value: "low",
                            label: "Low Saturation",
                          },
                          {
                            value: "high",
                            label: "High Saturation",
                          },
                          {
                            value: "desaturated",
                            label: "Desaturation",
                          },
                          {
                            value: "normal",
                            label: "Normal",
                          },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setSaturationMode(
                                option.value as
                                  | "normal"
                                  | "low"
                                  | "high"
                                  | "desaturated"
                              )
                            }
                            className={`rounded-xl border px-3 py-2.5 text-xs font-semibold shadow-sm transition-all duration-300 ${
                              saturationMode === option.value
                                ? "border-[#0E7C86] bg-[#E7F4F5] text-[#0E5961]"
                                : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:scale-[1.005] hover:border-[#F59E0B]/40 hover:shadow-[0_8px_20px_rgba(245,158,11,0.08)]"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </section>

                    <button
                      type="button"
                      onClick={resetAccessibility}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#0E7C86] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.005] hover:border-[#0E7C86]/40 hover:bg-[#E7F4F5] hover:shadow-[0_8px_20px_rgba(14,124,134,0.08)]"
                    >
                      <RotateCcw size={17} />
                      Reset Accessibility Settings
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-[#164B5A] bg-[#071A33]/98 px-5 py-4 space-y-2 backdrop-blur-md">
            <NavLink
              to="/"
              end
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold ${
                  isActive ? "bg-white/20 text-[#F59E0B]" : "text-slate-200 hover:bg-white/10"
                }`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/live"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold ${
                  isActive ? "bg-white/20 text-[#F59E0B]" : "text-slate-200 hover:bg-white/10"
                }`
              }
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Telemetry Monitor
            </NavLink>

            <NavLink
              to="/eta"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold ${
                  isActive ? "bg-white/20 text-[#F59E0B]" : "text-slate-200 hover:bg-white/10"
                }`
              }
            >
              Dynamic ETA Tracker
            </NavLink>

            <NavLink
              to="/map"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold ${
                  isActive ? "bg-white/20 text-[#F59E0B]" : "text-slate-200 hover:bg-white/10"
                }`
              }
            >
              Live Corridor Map
            </NavLink>

            <NavLink
              to="/trains"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold ${
                  isActive ? "bg-white/20 text-[#F59E0B]" : "text-slate-200 hover:bg-white/10"
                }`
              }
            >
              Train Search
            </NavLink>

            <NavLink
              to="/stations"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold ${
                  isActive ? "bg-white/20 text-[#F59E0B]" : "text-slate-200 hover:bg-white/10"
                }`
              }
            >
              Stations & Amenities
            </NavLink>

            <NavLink
              to="/controller"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-bold bg-amber-500 text-[#071A33]"
            >
              <ShieldAlert size={16} />
              Section Controller DSS
            </NavLink>

            <NavLink
              to="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold ${
                  isActive ? "bg-white/20 text-[#F59E0B]" : "text-slate-200 hover:bg-white/10"
                }`
              }
            >
              Settings & Diagnostics
            </NavLink>

            <div className="pt-3 border-t border-slate-700/60 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setIs24HourHeader(!is24HourHeader)}
                className="flex w-full items-center justify-between rounded-lg border border-[#F59E0B]/50 bg-black/30 px-3 py-2 text-xs font-bold text-white"
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-[#F59E0B] font-extrabold">LIVE IST</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span>{formattedHeaderTime}</span>
                  <span className="rounded bg-[#F59E0B] px-1 py-0.5 text-[9px] font-sans font-bold text-[#071A33]">
                    {is24HourHeader ? "24H" : "12H"}
                  </span>
                </div>
              </button>

              <div className="flex items-center gap-2">
                <NavLink
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-lg border border-[#F59E0B] text-white text-xs font-bold"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-lg bg-[#F59E0B] text-[#071A33] text-xs font-bold"
                >
                  Register
                </NavLink>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default PublicLayout
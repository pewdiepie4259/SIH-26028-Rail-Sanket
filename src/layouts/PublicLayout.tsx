import { useState } from "react"
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
} from "lucide-react"
import { NavLink, Outlet } from "react-router-dom"

function PublicLayout() {
  const [language, setLanguage] = useState("English")
  const [languageOpen, setLanguageOpen] = useState(false)
  const [accessibilityOpen, setAccessibilityOpen] = useState(false)
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

  const languages = ["English", "हिंदी", "ಕನ್ನಡ"]

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
      <header className="border-b border-[#164B5A] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33]">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#294665] bg-[#071A33]">
              <img
                src="/logos/raildrishti-dark.png"
                alt="RailDrishti"
                className="h-full w-full object-contain p-0.5"
              />
            </div>

            <div>
              <div className="text-lg font-bold leading-none tracking-tight text-white">
                RailDrishti
              </div>

              <div className="mt-1 hidden text-[10px] font-medium uppercase tracking-wider text-[#F59E0B] sm:block">
                India Railways ETA System
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-semibold transition ${
                  isActive
                    ? "border-[#F59E0B] bg-[#F59E0B]/15 text-white"
                    : "border-[#F59E0B]/70 text-white hover:border-[#F59E0B] hover:bg-[#F59E0B]/10"
                }`
              }
            >
              Login
            </NavLink>

            <NavLink
              to="/register"
              className={({ isActive }) =>
                `flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-semibold transition ${
                  isActive
                    ? "border-[#F59E0B] bg-[#F59E0B]/20 text-white"
                    : "border-[#F59E0B] text-white hover:bg-[#F59E0B]/10"
                }`
              }
            >
              Register
            </NavLink>

            <div className="relative ml-1">
              <button
                type="button"
                aria-label="Change language"
                aria-expanded={languageOpen}
                onClick={() => {
                  setLanguageOpen(!languageOpen)
                  setAccessibilityOpen(false)
                }}
                className="flex h-10 items-center gap-2 rounded-full border border-[#F59E0B] px-3.5 text-sm font-medium text-white transition hover:bg-[#F59E0B]/10"
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-base leading-none">A</span>
                  <span className="text-base leading-none">अ</span>
                </span>

                <span className="hidden sm:inline">{language}</span>

                <ChevronDown
                  size={17}
                  strokeWidth={2.2}
                  className={`transition-transform duration-200 ${
                    languageOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {languageOpen && (
                <div className="absolute right-0 top-12 z-[60] w-40 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  {languages.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setLanguage(option)
                        setLanguageOpen(false)
                      }}
                      className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                        language === option
                          ? "bg-[#FFF4E1] text-[#0E7C86]"
                          : "text-slate-700 hover:bg-slate-50 hover:text-[#0E7C86]"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative ml-1">
              <button
                type="button"
                aria-label="Accessibility Tools"
                aria-expanded={accessibilityOpen}
                onClick={() => {
                  setAccessibilityOpen(!accessibilityOpen)
                  setLanguageOpen(false)
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${
                  accessibilityOpen
                    ? "border-[#F59E0B] bg-[#F59E0B]/15"
                    : "border-[#F59E0B]/70 hover:border-[#F59E0B] hover:bg-[#F59E0B]/10"
                }`}
              >
                <PersonStanding
                  size={22}
                  strokeWidth={2}
                  className="text-white"
                />
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
                      <ChevronDown
                        size={19}
                        className="rotate-180"
                      />
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
                              contrastMode === "high"
                                ? "normal"
                                : "high"
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
                              contrastMode === "dark"
                                ? "normal"
                                : "dark"
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
                            colorVisionMode
                              ? cardActive
                              : cardInactive
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
                            highlightLinks
                              ? cardActive
                              : cardInactive
                          }`}
                        >
                          <Link2 size={22} />

                          <span className="text-xs font-semibold">
                            Highlight Links
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setInvertColors(!invertColors)
                          }
                          className={`${cardBase} ${
                            invertColors
                              ? cardActive
                              : cardInactive
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
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default PublicLayout
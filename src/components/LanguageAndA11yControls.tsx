import { useState, useEffect } from "react";
import {
  ChevronDown,
  PersonStanding,
  X,
  Sparkles,
  Palette,
  Sun,
  Moon,
  Eye,
  Link2,
  Sliders,
  Type,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  BookOpen,
  Focus,
  ZapOff,
  Volume2,
  Play,
  Pause,
  Square,
  AlertCircle,
  Check,
} from "lucide-react";

export interface A11ySettings {
  contrastMode: "normal" | "high" | "dark";
  colorVisionMode: boolean;
  highlightLinks: boolean;
  invertColors: boolean;
  saturationMode: "normal" | "low" | "high" | "desaturated";
  textScale: number;
  reduceMotion: boolean;
  enhancedFocus: boolean;
  readableFont: boolean;
}

export const A11Y_STORAGE_KEY = "raildrishti_a11y_settings";

export const getInitialA11y = (): A11ySettings => {
  try {
    const raw = localStorage.getItem(A11Y_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        contrastMode: parsed.contrastMode || "normal",
        colorVisionMode: !!parsed.colorVisionMode,
        highlightLinks: !!parsed.highlightLinks,
        invertColors: !!parsed.invertColors,
        saturationMode: parsed.saturationMode || "normal",
        textScale: typeof parsed.textScale === "number" ? parsed.textScale : 1,
        reduceMotion: !!parsed.reduceMotion,
        enhancedFocus: !!parsed.enhancedFocus,
        readableFont: !!parsed.readableFont,
      };
    }
  } catch (e) {
    console.error("Error reading a11y settings:", e);
  }
  return {
    contrastMode: "normal",
    colorVisionMode: false,
    highlightLinks: false,
    invertColors: false,
    saturationMode: "normal",
    textScale: 1,
    reduceMotion: false,
    enhancedFocus: false,
    readableFont: false,
  };
};

export const INDIAN_LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "ks", label: "Kashmiri", native: "کٲشُر / कश्मीरी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "as", label: "Assamese", native: "অসমীয়া" },
  { code: "ur", label: "Urdu", native: "اردو" },
  { code: "ne", label: "Nepali", native: "नेपाली" },
  { code: "kfy", label: "Kumaoni", native: "कुमाऊँनी" },
];

interface LanguageAndA11yControlsProps {
  className?: string;
  buttonHeightClass?: string;
}

export default function LanguageAndA11yControls({
  className = "",
  buttonHeightClass = "h-9",
}: LanguageAndA11yControlsProps) {
  const [languageOpen, setLanguageOpen] = useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("raildrishti_lang_native") || "English";
  });

  const [langNotice, setLangNotice] = useState<string | null>(null);

  // Accessibility State (Loaded from localStorage)
  const initialA11y = getInitialA11y();
  const [contrastMode, setContrastMode] = useState<"normal" | "high" | "dark">(initialA11y.contrastMode);
  const [colorVisionMode, setColorVisionMode] = useState<boolean>(initialA11y.colorVisionMode);
  const [highlightLinks, setHighlightLinks] = useState<boolean>(initialA11y.highlightLinks);
  const [invertColors, setInvertColors] = useState<boolean>(initialA11y.invertColors);
  const [saturationMode, setSaturationMode] = useState<"normal" | "low" | "high" | "desaturated">(initialA11y.saturationMode);
  const [textScale, setTextScale] = useState<number>(initialA11y.textScale);
  const [reduceMotion, setReduceMotion] = useState<boolean>(initialA11y.reduceMotion);
  const [enhancedFocus, setEnhancedFocus] = useState<boolean>(initialA11y.enhancedFocus);
  const [readableFont, setReadableFont] = useState<boolean>(initialA11y.readableFont);

  // Reset confirmation modal
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Speech Synthesis (Read Aloud) State
  const [ttsStatus, setTtsStatus] = useState<"idle" | "playing" | "paused" | "unsupported">("idle");
  const [ttsMessage, setTtsMessage] = useState<string | null>(null);

  // Synchronize CSS classes to <html> & persist to localStorage
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("accessibility-high-contrast", contrastMode === "high");
    root.classList.toggle("accessibility-dark-contrast", contrastMode === "dark");
    root.classList.toggle("accessibility-invert", invertColors || contrastMode === "dark");
    root.classList.toggle("dark", contrastMode === "dark" || invertColors);
    root.classList.toggle("accessibility-color-vision", colorVisionMode);
    root.classList.toggle("accessibility-highlight-links", highlightLinks);
    root.classList.toggle("accessibility-sat-low", saturationMode === "low");
    root.classList.toggle("accessibility-sat-high", saturationMode === "high");
    root.classList.toggle("accessibility-sat-desaturated", saturationMode === "desaturated");
    root.classList.toggle("accessibility-reduce-motion", reduceMotion);
    root.classList.toggle("accessibility-enhanced-focus", enhancedFocus);
    root.classList.toggle("accessibility-readable-font", readableFont);

    const saved: A11ySettings = {
      contrastMode,
      colorVisionMode,
      highlightLinks,
      invertColors,
      saturationMode,
      textScale,
      reduceMotion,
      enhancedFocus,
      readableFont,
    };
    localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(saved));
  }, [
    contrastMode,
    colorVisionMode,
    highlightLinks,
    invertColors,
    saturationMode,
    textScale,
    reduceMotion,
    enhancedFocus,
    readableFont,
  ]);

  // Keyboard accessibility: Escape key closes modal & dropdowns
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAccessibilityOpen(false);
        setLanguageOpen(false);
        setShowResetConfirm(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSelectLanguage = (option: { code: string; label: string; native: string }) => {
    setLanguage(option.native);
    setLanguageOpen(false);
    localStorage.setItem("raildrishti_lang_code", option.code);
    localStorage.setItem("raildrishti_lang_native", option.native);

    const targetCode = option.code;
    const cookieVal = targetCode === "en" ? "" : `/en/${targetCode}`;

    document.cookie = `googtrans=${cookieVal}; path=/;`;
    document.cookie = `googtrans=${cookieVal}; path=/; domain=${window.location.hostname};`;

    const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (combo) {
      const exists = Array.from(combo.options).some((opt) => opt.value === targetCode);
      if (exists) {
        combo.value = targetCode;
        combo.dispatchEvent(new Event("change"));
        setLangNotice(null);
      } else {
        combo.value = targetCode;
        combo.dispatchEvent(new Event("change"));
        setLangNotice(
          `${option.label} (${option.native}) translation is selected. Live machine translation for this language is currently unavailable in the translation provider.`
        );
        setTimeout(() => setLangNotice(null), 5000);
      }
    } else {
      window.location.reload();
    }
  };

  const increaseTextSize = () => {
    setTextScale((current) => Math.min(Number((current + 0.1).toFixed(1)), 1.4));
  };

  const decreaseTextSize = () => {
    setTextScale((current) => Math.max(Number((current - 0.1).toFixed(1)), 0.8));
  };

  const resetTextSize = () => {
    setTextScale(1.0);
  };

  const confirmResetAccessibility = () => {
    setContrastMode("normal");
    setColorVisionMode(false);
    setHighlightLinks(false);
    setInvertColors(false);
    setSaturationMode("normal");
    setTextScale(1.0);
    setReduceMotion(false);
    setEnhancedFocus(false);
    setReadableFont(false);
    setShowResetConfirm(false);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setTtsStatus("idle");
    setTtsMessage(null);
  };

  const applyPreset = (preset: "standard" | "low-vision" | "high-contrast" | "reading" | "motor") => {
    if (preset === "standard") {
      setContrastMode("normal");
      setColorVisionMode(false);
      setHighlightLinks(false);
      setInvertColors(false);
      setSaturationMode("normal");
      setTextScale(1.0);
      setReduceMotion(false);
      setEnhancedFocus(false);
      setReadableFont(false);
    } else if (preset === "low-vision") {
      setContrastMode("high");
      setTextScale(1.3);
      setEnhancedFocus(true);
      setReadableFont(true);
      setReduceMotion(false);
    } else if (preset === "high-contrast") {
      setContrastMode("dark");
      setHighlightLinks(true);
      setEnhancedFocus(true);
    } else if (preset === "reading") {
      setReadableFont(true);
      setTextScale(1.1);
      setReduceMotion(true);
      setSaturationMode("low");
    } else if (preset === "motor") {
      setEnhancedFocus(true);
      setReduceMotion(true);
      setTextScale(1.2);
    }
  };

  const handlePlayTTS = () => {
    if (!("speechSynthesis" in window)) {
      setTtsStatus("unsupported");
      setTtsMessage("Screen reader speech synthesis is not supported on this browser.");
      return;
    }

    if (ttsStatus === "paused") {
      window.speechSynthesis.resume();
      setTtsStatus("playing");
      setTtsMessage("Resumed reading.");
      return;
    }

    window.speechSynthesis.cancel();
    const mainEl = document.querySelector("main") || document.body;
    const rawText = mainEl.innerText || "";
    const cleanText = rawText.replace(/\s+/g, " ").trim().slice(0, 1500);

    if (!cleanText) {
      setTtsMessage("No readable content detected on this screen.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;

    utterance.onstart = () => {
      setTtsStatus("playing");
      setTtsMessage("Reading screen content aloud...");
    };
    utterance.onend = () => {
      setTtsStatus("idle");
      setTtsMessage("Finished reading screen content.");
      setTimeout(() => setTtsMessage(null), 3000);
    };
    utterance.onerror = () => {
      setTtsStatus("idle");
      setTtsMessage("Error during speech synthesis.");
      setTimeout(() => setTtsMessage(null), 3000);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePauseTTS = () => {
    if ("speechSynthesis" in window && ttsStatus === "playing") {
      window.speechSynthesis.pause();
      setTtsStatus("paused");
      setTtsMessage("Speech paused. Click Read to resume.");
    }
  };

  const handleStopTTS = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setTtsStatus("idle");
      setTtsMessage("Speech stopped.");
      setTimeout(() => setTtsMessage(null), 3000);
    }
  };

  const cardBase =
    "flex min-h-[76px] flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-center shadow-sm transition-all duration-200 cursor-pointer select-none";
  const cardInactive =
    "border-slate-200 bg-white text-[#071A33] hover:-translate-y-0.5 hover:border-[#0E7C86]/50 hover:shadow-md";
  const cardActive =
    "border-[#0E7C86] bg-[#E7F4F5] text-[#0E5961] shadow-sm ring-1 ring-[#0E7C86]/50 font-semibold";
  const textCard =
    "flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2 text-center text-[#071A33] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0E7C86]/50 hover:shadow-md cursor-pointer";

  return (
    <div className={`flex items-center gap-1.5 shrink-0 ${className}`}>
      {langNotice && (
        <div className="fixed top-16 right-4 z-50 rounded-lg border border-amber-400/60 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-900 shadow-xl max-w-sm">
          {langNotice}
        </div>
      )}

      {/* 1. Language Selector Capsule */}
      <div className="relative shrink-0">
        <button
          type="button"
          aria-label="Change language"
          aria-expanded={languageOpen}
          onClick={() => {
            setLanguageOpen(!languageOpen);
            setAccessibilityOpen(false);
          }}
          className={`flex ${buttonHeightClass} items-center gap-1 2xl:gap-1.5 rounded-full border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-2.5 2xl:px-3 text-xs font-medium text-white transition-all duration-300 hover:scale-[1.02] shrink-0 cursor-pointer ${
            languageOpen ? "shadow-[0_5px_14px_rgba(245,158,11,0.18)]" : ""
          }`}
        >
          <span className="flex items-center gap-1">
            <span className="text-xs leading-none font-bold">A</span>
            <span className="text-xs leading-none text-[#F59E0B] font-bold">अ</span>
          </span>
          <span className="hidden sm:inline text-xs">{language}</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${languageOpen ? "rotate-180" : ""}`}
          />
        </button>

        {languageOpen && (
          <div className="absolute right-0 top-11 z-[60] w-52 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
            {INDIAN_LANGUAGES.map((option) => (
              <button
                key={option.code}
                type="button"
                onClick={() => handleSelectLanguage(option)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition cursor-pointer ${
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

      {/* 2. Accessibility Tools Button */}
      <div className="relative">
        <button
          type="button"
          aria-label="Accessibility Tools"
          aria-expanded={accessibilityOpen}
          onClick={() => {
            setAccessibilityOpen(!accessibilityOpen);
            setLanguageOpen(false);
          }}
          className={`flex ${buttonHeightClass} w-9 items-center justify-center rounded-lg border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
            accessibilityOpen ? "shadow-[0_5px_14px_rgba(245,158,11,0.18)]" : ""
          }`}
          title="Accessibility Tools"
        >
          <PersonStanding size={19} strokeWidth={2} className="text-white" />
        </button>

        {accessibilityOpen && (
          <div
            role="dialog"
            aria-label="Accessibility Settings"
            className="absolute right-0 top-12 z-50 w-[420px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-[#F59E0B]/30 bg-gradient-to-br from-[#FFFDF9] via-[#FFF9F0] to-[#FFF3E1] shadow-2xl backdrop-blur-md text-slate-800"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-amber-200/60 bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-5 py-3.5 text-white">
              <div className="flex items-center gap-2.5">
                <PersonStanding size={20} className="text-[#F59E0B]" />
                <div>
                  <h2 className="text-base font-bold leading-tight">Accessibility Tools</h2>
                  <p className="text-[10px] text-amber-200/80">Indian Railways Operational Assist</p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Close accessibility tools"
                onClick={() => setAccessibilityOpen(false)}
                className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Panel Body */}
            <div className="max-h-[calc(100vh-120px)] overflow-y-auto p-4 space-y-4">
              {/* 1. ACCESSIBILITY PRESETS */}
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0E5961] flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#F59E0B]" />
                    Accessibility Presets
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Quick Profiles</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    { id: "standard", label: "Standard", desc: "Default layout" },
                    { id: "low-vision", label: "Low Vision", desc: "Large & High Contrast" },
                    { id: "high-contrast", label: "High Contrast", desc: "Dark high contrast" },
                    { id: "reading", label: "Reading", desc: "Clear font & calm" },
                    { id: "motor", label: "Motor Assist", desc: "Focus & large targets" },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset.id as any)}
                      className="group flex flex-col items-start rounded-lg border border-amber-200/80 bg-white/90 p-2 text-left transition hover:border-[#0E7C86] hover:bg-[#E7F4F5] hover:shadow-sm cursor-pointer"
                    >
                      <span className="text-xs font-bold text-[#071A33] group-hover:text-[#0E5961]">
                        {preset.label}
                      </span>
                      <span className="text-[10px] text-slate-500 leading-tight line-clamp-1">
                        {preset.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* 2. COLOR ADJUSTMENT */}
              <section>
                <div className="mb-2 flex items-center justify-between rounded-lg bg-[#071A33] px-3.5 py-2 text-white shadow-sm">
                  <h3 className="text-xs font-bold flex items-center gap-2">
                    <Palette size={14} className="text-[#F59E0B]" />
                    Color Adjustment
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* High Contrast */}
                  <button
                    type="button"
                    onClick={() => setContrastMode(contrastMode === "high" ? "normal" : "high")}
                    className={`${cardBase} ${contrastMode === "high" ? cardActive : cardInactive}`}
                    aria-pressed={contrastMode === "high"}
                  >
                    <div className="flex items-center justify-between w-full px-1">
                      <Sun
                        size={18}
                        className={contrastMode === "high" ? "text-[#0E7C86]" : "text-slate-600"}
                      />
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          contrastMode === "high"
                            ? "bg-[#0E7C86] text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {contrastMode === "high" ? "ON" : "OFF"}
                      </span>
                    </div>
                    <span className="text-xs font-semibold">High Contrast</span>
                  </button>

                  {/* Dark Contrast */}
                  <button
                    type="button"
                    onClick={() => setContrastMode(contrastMode === "dark" ? "normal" : "dark")}
                    className={`${cardBase} ${contrastMode === "dark" ? cardActive : cardInactive}`}
                    aria-pressed={contrastMode === "dark"}
                  >
                    <div className="flex items-center justify-between w-full px-1">
                      <Moon
                        size={18}
                        className={contrastMode === "dark" ? "text-[#0E7C86]" : "text-slate-600"}
                      />
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          contrastMode === "dark"
                            ? "bg-[#0E7C86] text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {contrastMode === "dark" ? "ON" : "OFF"}
                      </span>
                    </div>
                    <span className="text-xs font-semibold">Dark Contrast</span>
                  </button>

                  {/* Color Vision Deficiency */}
                  <button
                    type="button"
                    onClick={() => setColorVisionMode(!colorVisionMode)}
                    className={`${cardBase} ${colorVisionMode ? cardActive : cardInactive}`}
                    aria-pressed={colorVisionMode}
                  >
                    <div className="flex items-center justify-between w-full px-1">
                      <Eye
                        size={18}
                        className={colorVisionMode ? "text-[#0E7C86]" : "text-slate-600"}
                      />
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          colorVisionMode
                            ? "bg-[#0E7C86] text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {colorVisionMode ? "ON" : "OFF"}
                      </span>
                    </div>
                    <span className="text-xs font-semibold">Color Vision Deficiency</span>
                  </button>

                  {/* Highlight Links */}
                  <button
                    type="button"
                    onClick={() => setHighlightLinks(!highlightLinks)}
                    className={`${cardBase} ${highlightLinks ? cardActive : cardInactive}`}
                    aria-pressed={highlightLinks}
                  >
                    <div className="flex items-center justify-between w-full px-1">
                      <Link2
                        size={18}
                        className={highlightLinks ? "text-[#0E7C86]" : "text-slate-600"}
                      />
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          highlightLinks
                            ? "bg-[#0E7C86] text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {highlightLinks ? "ON" : "OFF"}
                      </span>
                    </div>
                    <span className="text-xs font-semibold">Highlight Links</span>
                  </button>

                  {/* Invert */}
                  <button
                    type="button"
                    onClick={() => setInvertColors(!invertColors)}
                    className={`${cardBase} ${invertColors ? cardActive : cardInactive}`}
                    aria-pressed={invertColors}
                  >
                    <div className="flex items-center justify-between w-full px-1">
                      <Palette
                        size={18}
                        className={invertColors ? "text-[#0E7C86]" : "text-slate-600"}
                      />
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          invertColors
                            ? "bg-[#0E7C86] text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {invertColors ? "ON" : "OFF"}
                      </span>
                    </div>
                    <span className="text-xs font-semibold">Invert</span>
                  </button>

                  {/* Saturation Toggle Shortcut */}
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
                    className={`${cardBase} ${saturationMode !== "normal" ? cardActive : cardInactive}`}
                  >
                    <div className="flex items-center justify-between w-full px-1">
                      <Sliders
                        size={18}
                        className={saturationMode !== "normal" ? "text-[#0E7C86]" : "text-slate-600"}
                      />
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          saturationMode !== "normal"
                            ? "bg-[#0E7C86] text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {saturationMode === "normal" ? "100%" : saturationMode}
                      </span>
                    </div>
                    <span className="text-xs font-semibold">Saturation</span>
                  </button>
                </div>
              </section>

              {/* 3. TEXT SIZE */}
              <section>
                <div className="mb-2 flex items-center justify-between rounded-lg bg-[#071A33] px-3.5 py-2 text-white shadow-sm">
                  <h3 className="text-xs font-bold flex items-center gap-2">
                    <Type size={14} className="text-[#F59E0B]" />
                    Text Size
                  </h3>
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-[#F59E0B]">
                    {Math.round(textScale * 100)}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={decreaseTextSize}
                    className={textCard}
                    title="Decrease Text Size (-10%)"
                  >
                    <ZoomOut size={19} className="text-slate-700" />
                    <span className="text-xs font-bold text-[#071A33]">A− Decrease</span>
                  </button>

                  <button
                    type="button"
                    onClick={resetTextSize}
                    className={textCard}
                    title="Reset Text Size to 100%"
                  >
                    <RotateCcw size={18} className="text-slate-700" />
                    <span className="text-xs font-bold text-[#071A33]">Reset (100%)</span>
                  </button>

                  <button
                    type="button"
                    onClick={increaseTextSize}
                    className={textCard}
                    title="Increase Text Size (+10%)"
                  >
                    <ZoomIn size={19} className="text-slate-700" />
                    <span className="text-xs font-bold text-[#071A33]">A+ Increase</span>
                  </button>
                </div>
              </section>

              {/* 4. SATURATION LEVELS */}
              <section>
                <div className="mb-2 flex items-center justify-between rounded-lg bg-[#071A33] px-3.5 py-2 text-white shadow-sm">
                  <h3 className="text-xs font-bold flex items-center gap-2">
                    <Sliders size={14} className="text-[#F59E0B]" />
                    Saturation Levels
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "low", label: "Low Saturation" },
                    { value: "high", label: "High Saturation" },
                    { value: "desaturated", label: "Desaturation" },
                    { value: "normal", label: "Normal" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setSaturationMode(
                          option.value as "normal" | "low" | "high" | "desaturated"
                        )
                      }
                      className={`rounded-xl border px-3 py-2.5 text-xs font-semibold shadow-sm transition-all duration-200 flex items-center justify-between cursor-pointer ${
                        saturationMode === option.value
                          ? "border-[#0E7C86] bg-[#E7F4F5] text-[#0E5961] ring-1 ring-[#0E7C86]/50 font-bold"
                          : "border-slate-200 bg-white text-slate-700 hover:border-[#0E7C86]/40"
                      }`}
                    >
                      <span>{option.label}</span>
                      {saturationMode === option.value && <Check size={14} className="text-[#0E7C86]" />}
                    </button>
                  ))}
                </div>
              </section>

              {/* 5. READABILITY & MOTION */}
              <section>
                <div className="mb-2 flex items-center justify-between rounded-lg bg-[#071A33] px-3.5 py-2 text-white shadow-sm">
                  <h3 className="text-xs font-bold flex items-center gap-2">
                    <BookOpen size={14} className="text-[#F59E0B]" />
                    Readability & Motion
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {/* Readable Font */}
                  <button
                    type="button"
                    onClick={() => setReadableFont(!readableFont)}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2 text-center transition cursor-pointer ${
                      readableFont
                        ? "border-[#0E7C86] bg-[#E7F4F5] text-[#0E5961] font-bold"
                        : "border-slate-200 bg-white text-slate-700 hover:border-[#0E7C86]/40"
                    }`}
                  >
                    <Type size={16} />
                    <span className="text-[11px] leading-tight">Readable Font</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        readableFont ? "bg-[#0E7C86] text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {readableFont ? "ON" : "OFF"}
                    </span>
                  </button>

                  {/* Enhanced Focus */}
                  <button
                    type="button"
                    onClick={() => setEnhancedFocus(!enhancedFocus)}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2 text-center transition cursor-pointer ${
                      enhancedFocus
                        ? "border-[#0E7C86] bg-[#E7F4F5] text-[#0E5961] font-bold"
                        : "border-slate-200 bg-white text-slate-700 hover:border-[#0E7C86]/40"
                    }`}
                  >
                    <Focus size={16} />
                    <span className="text-[11px] leading-tight">Enhanced Focus</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        enhancedFocus ? "bg-[#0E7C86] text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {enhancedFocus ? "ON" : "OFF"}
                    </span>
                  </button>

                  {/* Reduce Motion */}
                  <button
                    type="button"
                    onClick={() => setReduceMotion(!reduceMotion)}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2 text-center transition cursor-pointer ${
                      reduceMotion
                        ? "border-[#0E7C86] bg-[#E7F4F5] text-[#0E5961] font-bold"
                        : "border-slate-200 bg-white text-slate-700 hover:border-[#0E7C86]/40"
                    }`}
                  >
                    <ZapOff size={16} />
                    <span className="text-[11px] leading-tight">Reduce Motion</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        reduceMotion ? "bg-[#0E7C86] text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {reduceMotion ? "ON" : "OFF"}
                    </span>
                  </button>
                </div>
              </section>

              {/* 6. READ ALOUD (WEB SPEECH API) */}
              <section>
                <div className="mb-2 flex items-center justify-between rounded-lg bg-[#071A33] px-3.5 py-2 text-white shadow-sm">
                  <h3 className="text-xs font-bold flex items-center gap-2">
                    <Volume2 size={14} className="text-[#F59E0B]" />
                    Read Aloud (Screen Reader)
                  </h3>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      ttsStatus === "playing"
                        ? "bg-emerald-500 text-white animate-pulse"
                        : ttsStatus === "paused"
                        ? "bg-amber-500 text-slate-900"
                        : ttsStatus === "unsupported"
                        ? "bg-rose-500 text-white"
                        : "bg-white/20 text-slate-200"
                    }`}
                  >
                    {ttsStatus}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handlePlayTTS}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-[#071A33] transition hover:bg-[#E7F4F5] hover:border-[#0E7C86] cursor-pointer"
                  >
                    <Play size={13} className="text-emerald-600 fill-emerald-600" />
                    <span>Read</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePauseTTS}
                    disabled={ttsStatus !== "playing"}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-[#071A33] transition hover:bg-[#E7F4F5] hover:border-[#0E7C86] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Pause size={13} className="text-amber-600 fill-amber-600" />
                    <span>Pause</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStopTTS}
                    disabled={ttsStatus === "idle"}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-[#071A33] transition hover:bg-[#E7F4F5] hover:border-[#0E7C86] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Square size={13} className="text-rose-600 fill-rose-600" />
                    <span>Stop</span>
                  </button>
                </div>

                {ttsMessage && (
                  <p className="mt-1.5 text-[11px] text-[#0E7C86] font-medium bg-amber-50 border border-amber-200/60 rounded px-2 py-1">
                    {ttsMessage}
                  </p>
                )}
              </section>

              {/* 7. RESET ACCESSIBILITY SETTINGS */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-2.5 text-xs font-bold text-rose-700 shadow-sm transition hover:bg-rose-100 hover:border-rose-300 cursor-pointer"
                >
                  <RotateCcw size={15} />
                  Reset Accessibility Settings
                </button>
              </div>
            </div>

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#071A33]/80 p-4 backdrop-blur-sm">
                <div className="rounded-xl border border-rose-200 bg-white p-5 shadow-2xl text-center max-w-xs space-y-3">
                  <AlertCircle size={28} className="mx-auto text-rose-600" />
                  <h4 className="text-sm font-bold text-slate-900">Reset Accessibility?</h4>
                  <p className="text-xs text-slate-600">
                    This will restore all visual, font, and motion settings to standard defaults. Account data and language remain intact.
                  </p>
                  <div className="flex gap-2 justify-center pt-1">
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmResetAccessibility}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer"
                    >
                      Confirm Reset
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

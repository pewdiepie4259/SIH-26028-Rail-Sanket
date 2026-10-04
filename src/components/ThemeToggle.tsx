import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer border shadow-sm ${
        isDark
          ? "border-teal-500/50 bg-[#0A2036] text-cyan-200 hover:border-cyan-400 hover:bg-[#0E2A47]"
          : "border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100 hover:border-amber-500"
      }`}
      title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
      aria-label="Toggle light and dark theme"
    >
      {isDark ? (
        <>
          <Moon size={14} className="text-cyan-300 transition-transform duration-200 hover:rotate-12" />
          <span className="hidden sm:inline text-[11px] font-bold text-cyan-200">Dark</span>
        </>
      ) : (
        <>
          <Sun size={14} className="text-amber-600 transition-transform duration-200 hover:rotate-45" />
          <span className="hidden sm:inline text-[11px] font-bold text-amber-900">Light</span>
        </>
      )}
    </button>
  );
}

import { useState, useEffect, useRef } from "react"
import {
  BarChart3,
  Bell,
  ChevronDown,
  CloudRain,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
  TrainFront,
  UserRound,
  X,
} from "lucide-react"
import { NavLink, Outlet, useLocation, useNavigate, Link } from "react-router-dom"
import { getCurrentUser, logout } from "../services/auth"
import { WeatherWarningIndicator } from "../components/WeatherWarningIndicator"

const navOperations = [
  {
    label: "Network Operations",
    path: "/controller/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Train Operations",
    path: "/controller/trains",
    icon: TrainFront,
  },
  {
    label: "Weather Impact",
    path: "/controller/weather",
    icon: CloudRain,
  },
  {
    label: "Junctions & Conflicts",
    path: "/controller/junctions",
    icon: GitBranch,
  },
  {
    label: "Cascade Analysis",
    path: "/controller/cascade",
    icon: GitBranch,
  },
  {
    label: "Dispatches & Directives",
    path: "/controller/dispatches",
    icon: Mail,
  },
]

const navAnalysis = [
  {
    label: "Reports & Audit",
    path: "/controller/reports",
    icon: BarChart3,
  },
]

const navSystem = [
  {
    label: "Settings & Profile",
    path: "/controller/settings",
    icon: Settings,
  },
]

const allControllerNav = [
  ...navOperations,
  ...navAnalysis,
  ...navSystem,
]

function NavSection({
  label,
  items,
  onItemClick,
}: {
  label: string
  items: typeof navOperations
  onItemClick?: () => void
}) {
  const location = useLocation()

  return (
    <div className="mb-4">
      <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-300/80">
        {label}
      </div>
      <nav className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon
          const isActive =
            item.path === "/controller/dashboard"
              ? location.pathname === "/controller/dashboard" ||
                location.pathname === "/controller"
              : location.pathname.startsWith(item.path)

          return (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={onItemClick}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-white/15 text-[#F59E0B] font-bold border-l-4 border-[#F59E0B] shadow-sm"
                  : "text-slate-200 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              <Icon size={16} strokeWidth={2} className={isActive ? "text-[#F59E0B]" : "text-teal-300"} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}

function ControllerLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(getCurrentUser())

  // Hover Sub-Header navigation state
  const [subHeaderOpen, setSubHeaderOpen] = useState(false)
  const subHeaderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleOpenSubHeader = () => {
    if (subHeaderTimerRef.current) {
      clearTimeout(subHeaderTimerRef.current)
      subHeaderTimerRef.current = null
    }
    setSubHeaderOpen(true)
  }

  const handleCloseSubHeader = () => {
    if (subHeaderTimerRef.current) {
      clearTimeout(subHeaderTimerRef.current)
    }
    subHeaderTimerRef.current = setTimeout(() => {
      setSubHeaderOpen(false)
    }, 250)
  }

  const handleNavClick = () => {
    setSubHeaderOpen(false)
    setMobileOpen(false)
  }

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getCurrentUser())
    }
    window.addEventListener("raildrishti_auth_changed", handleAuthChange)
    return () => window.removeEventListener("raildrishti_auth_changed", handleAuthChange)
  }, [])

  const handleSignOut = () => {
    logout()
    navigate("/login", { replace: true })
  }

  const subHeaderNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
      isActive
        ? "bg-white/20 text-[#F59E0B] shadow-sm font-bold border border-white/10"
        : "text-slate-200 hover:text-white hover:bg-white/10"
    }`

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-slate-900 font-sans">
      {/* ── UNIFIED RAILDRISHTI HEADER ───────────────────────── */}
      <header className="border-b border-[#164B5A] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] fixed inset-x-0 top-0 z-50 shadow-lg">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6 gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile hamburger */}
            <button
              className="mr-1 flex h-9 w-9 items-center justify-center rounded-md border border-[#164B5A] text-[#D7E5EC] transition hover:bg-white/10 lg:hidden cursor-pointer"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle navigation drawer"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <Link to="/controller/dashboard" className="flex items-center gap-3 shrink-0">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[#294665] bg-[#071A33] shadow-sm">
                <img
                  src="/logos/raildrishti-dark.png"
                  alt="RailDrishti"
                  className="h-full w-full object-contain p-0.5"
                />
              </div>

              <div>
                <div className="text-xl font-extrabold leading-none tracking-tight text-white flex items-center">
                  Rail<span className="text-[#F59E0B]">Drishti</span>
                </div>
                <div className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-[#F59E0B]">
                  Section Control Centre
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Area / Menu Trigger - Triggers Hover Sub-Header */}
          <div
            onMouseEnter={handleOpenSubHeader}
            onMouseLeave={handleCloseSubHeader}
            className="flex items-center"
          >
            <button
              type="button"
              onClick={() => setSubHeaderOpen((prev) => !prev)}
              aria-expanded={subHeaderOpen}
              aria-label="Controller Operations Menu"
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 cursor-pointer ${
                subHeaderOpen
                  ? "border-[#F59E0B] bg-white/15 text-[#F59E0B] shadow-[0_2px_10px_rgba(245,158,11,0.2)]"
                  : "border-teal-500/40 bg-teal-950/40 text-teal-100 hover:border-[#F59E0B]/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Menu size={15} className="text-[#F59E0B]" />
              <span className="font-semibold tracking-wide">Operations Menu</span>
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${
                  subHeaderOpen ? "rotate-180 text-[#F59E0B]" : "text-teal-300"
                }`}
              />
            </button>
          </div>

          {/* Right actions: Weather Warning Indicator, Notifications, Profile, Sign Out */}
          <div className="flex items-center gap-2.5">
            {/* 7. WEATHER WARNING INDICATOR (Replaces Network Status) */}
            <WeatherWarningIndicator />

            <button
              onClick={() => navigate("/controller/reports")}
              title="Notifications & Operational Alerts"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#F59E0B]/70 bg-[#071A33]/70 text-[#D7E5EC] transition hover:bg-white/10 cursor-pointer"
            >
              <Bell size={16} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#F59E0B] shadow-[0_0_6px_#F59E0B]" />
            </button>

            <div className="hidden h-7 w-px bg-[#164B5A] sm:block" />

            {/* Controller Profile Trigger & Popover */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-teal-500/60 bg-teal-950/40 px-3 py-1.5 text-xs font-semibold text-teal-200 transition hover:border-[#F59E0B] hover:text-white cursor-pointer"
                title="Controller Profile & Options"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0E5961] text-[#F59E0B] font-bold text-xs">
                  <UserRound size={13} />
                </div>
                <div className="hidden text-left sm:block">
                  <div className="text-xs font-bold text-white max-w-[130px] truncate leading-tight">
                    {currentUser?.name || "Shriya M"}
                  </div>
                  <div className="text-[9px] text-teal-300/80 max-w-[130px] truncate leading-tight">
                    {currentUser?.controllerId || "Section Controller"}
                  </div>
                </div>
                <ChevronDown
                  size={12}
                  className={`hidden text-teal-300 sm:block transition-transform duration-200 ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl border border-[#164B5A] bg-[#071A33] p-4 text-left shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 border-b border-[#164B5A] pb-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0E5961] text-[#F59E0B] font-bold text-base shadow-sm">
                        {(currentUser?.name || "S")[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-white truncate">
                          {currentUser?.name || "Shriya M"}
                        </div>
                        <div className="text-[11px] font-semibold text-[#F59E0B]">
                          {currentUser?.controllerId || "CTRL-SBC-01"}
                        </div>
                        <div className="text-[10px] text-[#9FB8BE] truncate">
                          {currentUser?.email || "shriya.m@raildrishti.gov.in"}
                        </div>
                      </div>
                    </div>

                    <div className="py-2.5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[#9FB8BE]">
                        <span>Division:</span>
                        <span className="font-semibold text-white truncate max-w-[160px]">
                          {currentUser?.department || "Operations & Traffic Control"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[#9FB8BE]">
                        <span>Operational Role:</span>
                        <span className="font-semibold text-emerald-400">Section Controller</span>
                      </div>
                      <div className="flex items-center justify-between text-[#9FB8BE]">
                        <span>Duty Status:</span>
                        <span className="font-semibold text-[#F59E0B] flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Active Shift
                        </span>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-[#164B5A] space-y-2">
                      <button
                        onClick={() => {
                          setProfileOpen(false)
                          navigate("/controller/settings")
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#0E5961] bg-[#0E5961]/30 py-2 text-xs font-semibold text-white hover:bg-[#0E5961]/60 hover:border-[#F59E0B] transition-colors cursor-pointer"
                      >
                        <Settings size={14} className="text-[#F59E0B]" />
                        <span>Controller Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileOpen(false)
                          handleSignOut()
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-950/30 py-2 text-xs font-semibold text-red-300 hover:bg-red-900/40 hover:border-red-500 transition-colors cursor-pointer"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Public Portal Link */}
            <button
              onClick={() => navigate("/")}
              title="Return to Public Portal"
              className="hidden md:flex h-9 items-center gap-1.5 rounded-lg border border-[#F59E0B]/80 bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-3 text-xs font-semibold text-white shadow-sm transition hover:scale-[1.02] cursor-pointer"
            >
              <span>Public Portal</span>
            </button>
          </div>
        </div>

        {/* 6. HOVER SUB-HEADER FOR CONTROLLER DASHBOARD */}
        <div
          onMouseEnter={handleOpenSubHeader}
          onMouseLeave={handleCloseSubHeader}
          className={`border-t border-[#164B5A]/80 bg-[#071A33]/98 backdrop-blur-md transition-all duration-300 ease-out overflow-hidden shadow-xl ${
            subHeaderOpen
              ? "max-h-24 opacity-100 py-2.5 pointer-events-auto"
              : "max-h-0 opacity-0 py-0 pointer-events-none"
          }`}
        >
          <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8 gap-3">
            {/* Left side label */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-teal-200">
              <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
              <span className="text-white font-bold tracking-wide">Controller DSS Operations</span>
              <span className="text-slate-400 font-normal">• Live Interlocking Directives</span>
            </div>

            {/* Sub-Header Navigation Items */}
            <nav className="flex w-full sm:w-auto items-center justify-end gap-1 flex-wrap">
              {allControllerNav.map((item) => {
                const isActive =
                  item.path === "/controller/dashboard"
                    ? location.pathname === "/controller/dashboard" ||
                      location.pathname === "/controller"
                    : location.pathname.startsWith(item.path)

                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    onClick={handleNavClick}
                    className={subHeaderNavLinkClass({ isActive })}
                  >
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* ── BODY ────────────────────────────────────────────── */}
      <div className="flex pt-16">
        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ── 3. SIDEBAR THEME (Dark Navy → Dark Teal → Dark Navy) ── */}
        <aside
          className={[
            "fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-64 flex-col border-r border-[#164B5A] bg-gradient-to-b from-[#071A33] via-[#0A2D3B] to-[#071A33] shadow-md transition-transform duration-200 lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          ].join(" ")}
        >
          <div className="flex-1 overflow-y-auto px-3 py-5">
            <NavSection
              label="Operations"
              items={navOperations}
              onItemClick={() => setMobileOpen(false)}
            />
            <NavSection
              label="Analysis"
              items={navAnalysis}
              onItemClick={() => setMobileOpen(false)}
            />
            <NavSection
              label="System"
              items={navSystem}
              onItemClick={() => setMobileOpen(false)}
            />
          </div>

          {/* Sign out button in sidebar */}
          <div className="shrink-0 border-t border-[#164B5A] p-3">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-red-950/40 hover:text-red-300 cursor-pointer"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* ── 4. LIGHT-MODE MAIN CONTENT AREA ───────────────── */}
        <main className="min-w-0 flex-1 bg-gradient-to-br from-[#FFF4E1] via-white to-[#FFF4E1] text-slate-900 lg:ml-64 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default ControllerLayout
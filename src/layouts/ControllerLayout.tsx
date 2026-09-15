import { useState, useEffect } from "react"
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
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { getCurrentUser, logout } from "../services/auth"

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
    label: "Dispatches & Directives",
    path: "/controller/dispatches",
    icon: Mail,
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
    label: "Settings",
    path: "/controller/settings",
    icon: Settings,
  },
]

function NavSection({
  label,
  items,
}: {
  label: string
  items: typeof navOperations
}) {
  const location = useLocation()

  return (
    <div className="mb-4">
      <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9FB8BE]">
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
              className={[
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors",
                isActive
                  ? "controller-sidebar-active"
                  : "text-[#D7E5EC] hover:bg-[#08383D]",
              ].join(" ")}
            >
              <Icon size={16} strokeWidth={2} />
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(getCurrentUser())

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

  return (
    <div className="min-h-screen bg-[#031A1F] text-white">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="controller-header fixed inset-x-0 top-0 z-50 h-16 shadow-lg">
        <div className="flex h-full items-center justify-between px-4 lg:px-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="mr-1 flex h-9 w-9 items-center justify-center rounded-md border border-[#145158] text-[#D7E5EC] transition hover:bg-[#08383D] lg:hidden cursor-pointer"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[#294665] bg-[#071A33] shadow-sm">
              <img
                src="/logos/raildrishti-dark.png"
                alt="RailDrishti"
                className="h-full w-full object-contain p-0.5"
              />
            </div>

            <div>
              <div className="text-lg font-extrabold leading-none tracking-tight text-white">
                Rail<span className="text-[#F59E0B]">Drishti</span>
              </div>
              <div className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-[#F59E0B]">
                Control Centre
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/controller/reports")}
              title="Notifications & Alerts"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#F59E0B]/60 bg-[#071A33]/70 text-[#D7E5EC] transition hover:bg-[#08383D] cursor-pointer"
            >
              <Bell size={17} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
            </button>

            <div className="hidden h-7 w-px bg-[#145158] sm:block" />

            {/* Controller Profile Trigger & Popover */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-lg border border-[#145158] bg-[#071A33]/70 px-2.5 py-1.5 transition hover:bg-[#08383D] hover:border-[#F59E0B]/60 cursor-pointer"
                title="Controller Profile & Options"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0E5961] text-[#F59E0B] font-bold text-xs">
                  <UserRound size={15} />
                </div>
                <div className="hidden text-left sm:block">
                  <div className="text-[11px] font-bold text-white max-w-[140px] truncate">
                    {currentUser?.name || "Shriya M"}
                  </div>
                  <div className="text-[9px] text-[#9FB8BE] max-w-[140px] truncate">
                    {currentUser?.controllerId || "Section Controller"}
                  </div>
                </div>
                <ChevronDown
                  size={14}
                  className={`hidden text-[#9FB8BE] sm:block transition-transform duration-200 ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl border border-[#145158] bg-[#071A33] p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 border-b border-[#145158] pb-3">
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

                    <div className="pt-2.5 border-t border-[#145158] space-y-2">
                      <button
                        onClick={() => {
                          setProfileOpen(false)
                          navigate("/controller/settings")
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#0E5961] bg-[#0E5961]/25 py-2 text-xs font-semibold text-white hover:bg-[#0E5961]/50 hover:border-[#F59E0B] transition-colors cursor-pointer"
                      >
                        <Settings size={14} className="text-[#F59E0B]" />
                        <span>Controller Profile & Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileOpen(false)
                          handleSignOut()
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-950/25 py-2 text-xs font-semibold text-red-300 hover:bg-red-900/40 hover:border-red-500 transition-colors cursor-pointer"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
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

        {/* ── SIDEBAR ─────────────────────────────────────── */}
        <aside
          className={[
            "controller-sidebar fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-64 flex-col border-r border-[#145158] transition-transform duration-200 lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          ].join(" ")}
        >
          <div className="flex-1 overflow-y-auto px-3 py-5">
            <NavSection label="Operations" items={navOperations} />
            <NavSection label="Analysis" items={navAnalysis} />
            <NavSection label="System" items={navSystem} />
          </div>

          {/* Sign out */}
          <div className="shrink-0 border-t border-[#145158] p-3">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-[#D7E5EC] transition-colors hover:bg-red-950/30 hover:text-red-300 hover:border-red-900/40 cursor-pointer"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────────── */}
        <main className="min-w-0 flex-1 bg-[#031A1F] lg:ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default ControllerLayout
import { useState } from "react"
import {
  BarChart3,
  Bell,
  ChevronDown,
  CloudRain,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  TrainFront,
  UserRound,
  X,
} from "lucide-react"
import { NavLink, Outlet } from "react-router-dom"

const navOperations = [
  {
    label: "Network Operations",
    path: "/controller/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Train Operations",
    path: "/controller/dashboard",
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

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors",
    isActive
      ? "controller-sidebar-active"
      : "text-[#D7E5EC] hover:bg-[#08383D]",
  ].join(" ")

function NavSection({
  label,
  items,
}: {
  label: string
  items: typeof navOperations
}) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9FB8BE]">
        {label}
      </div>
      <nav className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink key={item.label} to={item.path} className={navLinkClass}>
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
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#031A1F] text-white">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="controller-header fixed inset-x-0 top-0 z-50 h-16 shadow-lg">
        <div className="flex h-full items-center justify-between px-4 lg:px-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="mr-1 flex h-9 w-9 items-center justify-center rounded-md border border-[#145158] text-[#D7E5EC] transition hover:bg-[#08383D] lg:hidden"
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
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#F59E0B]/60 bg-[#071A33]/70 text-[#D7E5EC] transition hover:bg-[#08383D]">
              <Bell size={17} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
            </button>

            <div className="hidden h-7 w-px bg-[#145158] sm:block" />

            <button className="flex items-center gap-2 rounded-lg border border-[#145158] bg-[#071A33]/70 px-2.5 py-1.5 transition hover:bg-[#08383D]">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0E5961]">
                <UserRound size={15} />
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-[11px] font-bold text-white">
                  Controller
                </div>
                <div className="text-[9px] text-[#9FB8BE]">
                  Operations Desk
                </div>
              </div>
              <ChevronDown size={14} className="hidden text-[#9FB8BE] sm:block" />
            </button>
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
            <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-[#D7E5EC] transition-colors hover:bg-[#08383D]">
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
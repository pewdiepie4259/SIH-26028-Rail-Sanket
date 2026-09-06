import {
  Activity,
  Bell,
  Map,
} from "lucide-react"
import { NavLink, Outlet } from "react-router-dom"

function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#F4F7FA] text-slate-900">

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

              <div className="mt-1 hidden text-[10px] font-medium uppercase tracking-wider text-[#AFC0D4] sm:block">
                Railway Network Intelligence
              </div>
            </div>

          </div>

          <nav className="hidden items-center gap-1 md:flex">

            <NavLink
              to="/live"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#0E7C86]/30 text-white"
                    : "text-[#AFC0D4] hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Activity size={16} />
              Live Status
            </NavLink>

            <NavLink
              to="/map"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#0E7C86]/30 text-white"
                    : "text-[#AFC0D4] hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Map size={16} />
              Network Map
            </NavLink>

            <NavLink
              to="/trains"
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#0E7C86]/30 text-white"
                    : "text-[#AFC0D4] hover:bg-white/5 hover:text-white"
                }`
              }
            >
              Trains
            </NavLink>

            <NavLink
              to="/stations"
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#0E7C86]/30 text-white"
                    : "text-[#AFC0D4] hover:bg-white/5 hover:text-white"
                }`
              }
            >
              Stations
            </NavLink>

          </nav>

          <div className="flex items-center gap-3">

            <div className="hidden items-center gap-2 border-r border-[#294665] pr-4 sm:flex">
              <span className="h-2 w-2 rounded-full bg-green-500" />

              <span className="text-xs font-medium text-[#D5E1EA]">
                Network Operational
              </span>
            </div>

            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-lg p-2 text-[#D5E1EA] transition hover:bg-white/10 hover:text-white"
            >
              <Bell size={19} />

              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#FF8A3D]" />
            </button>

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
import {
  Activity,
  Bell,
  Map,
  TrainFront,
} from "lucide-react"
import { NavLink, Outlet } from "react-router-dom"

function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#F4F7FA] text-slate-900">

      {/* Top Navigation */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 lg:px-8">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B3D91]">
              <TrainFront
                size={21}
                strokeWidth={2}
                className="text-white"
              />
            </div>

            <div>
              <div className="text-lg font-bold leading-none tracking-tight text-[#0B3D91]">
                RailDrishti
              </div>

              <div className="mt-1 hidden text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:block">
                Railway Network Intelligence
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden items-center gap-1 md:flex">

            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#0B3D91]/5 text-[#0B3D91]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#0B3D91]"
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
                    ? "bg-[#0B3D91]/5 text-[#0B3D91]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#0B3D91]"
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
                    ? "bg-[#0B3D91]/5 text-[#0B3D91]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#0B3D91]"
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
                    ? "bg-[#0B3D91]/5 text-[#0B3D91]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#0B3D91]"
                }`
              }
            >
              Stations
            </NavLink>

          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">

            {/* Network Status */}
            <div className="hidden items-center gap-2 border-r border-slate-200 pr-4 sm:flex">
              <span className="h-2 w-2 rounded-full bg-green-500" />

              <span className="text-xs font-medium text-slate-500">
                Network Operational
              </span>
            </div>

            {/* Notifications */}
            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <Bell size={19} />

              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#FF8A3D]" />
            </button>

          </div>

        </div>
      </header>

      {/* Page Content */}
      <main>
        <Outlet />
      </main>

    </div>
  )
}

export default PublicLayout
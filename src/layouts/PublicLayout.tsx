import { Settings } from "lucide-react"
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

            <NavLink
              to="/settings"
              aria-label="Settings"
              className={({ isActive }) =>
                `ml-1 flex h-10 w-10 items-center justify-center rounded-lg border transition ${
                  isActive
                    ? "border-[#F59E0B] bg-[#F59E0B]/15 text-white"
                    : "border-[#F59E0B]/70 text-[#D5E1EA] hover:border-[#F59E0B] hover:bg-[#F59E0B]/10 hover:text-white"
                }`
              }
            >
              <Settings size={20} strokeWidth={2} />
            </NavLink>
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
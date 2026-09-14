import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Settings,
  TrainFront,
  UserRound,
} from "lucide-react"
import { NavLink, Outlet } from "react-router-dom"

const navigation = [
  {
    label: "Network Operations",
    path: "/controller/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Live Network",
    path: "/controller/dashboard",
    icon: Map,
  },
  {
    label: "Train Operations",
    path: "/controller/dashboard",
    icon: TrainFront,
  },
]

function ControllerLayout() {
  return (
    <div className="min-h-screen bg-[#031A1F] text-white">
      <header className="controller-header sticky top-0 z-50 h-16">
        <div className="flex h-full items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <img
              src="/raildrishti-logo.png"
              alt="RailDrishti"
              className="h-10 w-10 object-contain"
            />

            <div>
              <div className="text-sm font-bold text-white">
                RailDrishti
              </div>

              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#D7E5EC]/65">
                Railway Network Control
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-md border border-[#145158] bg-[#071A33]/70 text-[#D7E5EC] hover:bg-[#08383D]">
              <Bell size={17} />

              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
            </button>

            <div className="hidden h-7 w-px bg-[#145158] sm:block" />

            <button className="flex items-center gap-2 rounded-md border border-[#145158] bg-[#071A33]/70 px-2.5 py-1.5 hover:bg-[#08383D]">
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

              <ChevronDown
                size={14}
                className="hidden text-[#9FB8BE] sm:block"
              />
            </button>
          </div>
        </div>
      </header>

      <div className="group fixed left-0 top-16 z-50 hidden h-[calc(100vh-4rem)] lg:block">
        <div className="absolute left-0 top-0 h-full w-3" />

        <aside className="controller-sidebar h-full w-64 -translate-x-[calc(100%-12px)] border-r border-[#145158] shadow-2xl transition-transform duration-300 ease-out group-hover:translate-x-0">
          <div className="border-b border-[#145158] px-5 py-5">
            <div className="flex items-center gap-3">
              <img
                src="/raildrishti-logo.png"
                alt="RailDrishti"
                className="h-10 w-10 object-contain"
              />

              <div>
                <div className="text-base font-bold">
                  RailDrishti
                </div>

                <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#D7E5EC]/70">
                  Control Centre
                </div>
              </div>
            </div>
          </div>

          <div className="px-3 py-5">
            <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9FB8BE]">
              Operations
            </div>

            <nav className="space-y-1.5">
              {navigation.map((item) => {
                const Icon = item.icon

                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    className={({ isActive }) =>
                      [
                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors",
                        isActive
                          ? "controller-sidebar-active"
                          : "text-[#D7E5EC] hover:bg-[#08383D]",
                      ].join(" ")
                    }
                  >
                    <Icon size={17} strokeWidth={2} />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </div>

          <div className="absolute bottom-0 left-0 right-0 border-t border-[#145158] p-3">
            <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-[#D7E5EC] hover:bg-[#08383D]">
              <Settings size={17} />
              System Settings
            </button>

            <button className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-[#D7E5EC] hover:bg-[#08383D]">
              <LogOut size={17} />
              Sign Out
            </button>
          </div>
        </aside>
      </div>

      <main className="min-h-[calc(100vh-4rem)] bg-[#031A1F]">
        <Outlet />
      </main>

      <button className="fixed bottom-5 left-5 z-40 flex h-11 w-11 items-center justify-center rounded-lg border border-[#145158] bg-[#071A33] text-[#D7E5EC] shadow-lg lg:hidden">
        <Menu size={19} />
      </button>
    </div>
  )
}

export default ControllerLayout
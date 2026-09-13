import {
  Activity,
  Bell,
  CloudRain,
  GitBranch,
  LayoutDashboard,
  Map,
  MonitorCog,
  Radio,
  Route,
  Settings2,
  TrainFront,
  TriangleAlert,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { NavLink } from "react-router-dom"

interface ControllerSidebarProps {
  open: boolean
  collapsed: boolean
  onClose: () => void
  onToggleCollapse: () => void
}

const navigation = [
  {
    label: "Operations",
    items: [
      {
        label: "Dashboard",
        path: "/controller/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Live Network",
        path: "/controller/network",
        icon: Map,
      },
      {
        label: "Trains",
        path: "/controller/trains",
        icon: TrainFront,
      },
    ],
  },
  {
    label: "Traffic Intelligence",
    items: [
      {
        label: "Junctions",
        path: "/controller/junctions",
        icon: GitBranch,
      },
      {
        label: "Conflicts",
        path: "/controller/conflicts",
        icon: TriangleAlert,
      },
      {
        label: "Rerouting",
        path: "/controller/rerouting",
        icon: Route,
      },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      {
        label: "Platforms",
        path: "/controller/platforms",
        icon: MonitorCog,
      },
      {
        label: "Weather",
        path: "/controller/weather",
        icon: CloudRain,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Alerts",
        path: "/controller/alerts",
        icon: Bell,
      },
      {
        label: "Reports",
        path: "/controller/reports",
        icon: Activity,
      },
      {
        label: "Overrides",
        path: "/controller/overrides",
        icon: Settings2,
      },
    ],
  },
]

function ControllerSidebar({
  open,
  collapsed,
  onClose,
  onToggleCollapse,
}: ControllerSidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          border-r border-[#16364A]
          bg-[#031426]
          transition-all duration-300
          lg:static lg:z-auto lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
          ${collapsed ? "lg:w-[78px]" : "lg:w-[260px]"}
          w-[280px]
        `}
      >
        {/* Brand */}
        <div className="flex h-[72px] shrink-0 items-center border-b border-[#16364A] px-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#0E7C86] bg-[#0A2036]">
              <Radio
                size={21}
                strokeWidth={2}
                className="text-[#F59E0B]"
              />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate text-[15px] font-extrabold tracking-wide text-white">
                  RailDrishti
                </div>
                <div className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AFC0D4]">
                  Section Control
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#AFC0D4] hover:bg-[#0A2036] hover:text-white lg:hidden"
            aria-label="Close controller navigation"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {navigation.map((section) => (
            <div key={section.label} className="mb-6 last:mb-0">
              {!collapsed && (
                <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#71899C]">
                  {section.label}
                </div>
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `
                        group flex h-10 items-center gap-3 rounded-lg px-3
                        text-sm font-semibold transition-all duration-200
                        ${
                          isActive
                            ? "border border-[#0E5961] bg-[#0E5961]/25 text-white shadow-[inset_3px_0_0_#F59E0B]"
                            : "border border-transparent text-[#AFC0D4] hover:border-[#16364A] hover:bg-[#0A2036] hover:text-white"
                        }
                        ${collapsed ? "justify-center px-0" : ""}
                        `
                      }
                    >
                      <Icon
                        size={18}
                        strokeWidth={2}
                        className="shrink-0"
                      />

                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-[#16364A] p-3">
          {!collapsed && (
            <div className="mb-3 rounded-lg border border-[#16364A] bg-[#0A2036] p-3">
              <div className="flex items-center gap-2">
                <Users size={15} className="text-[#0E7C86]" />
                <span className="text-xs font-semibold text-[#D7E5EC]">
                  Controller Access
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-[11px] text-[#AFC0D4]">
                  Authenticated
                </span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden h-9 w-full items-center justify-center rounded-lg border border-[#16364A] bg-[#0A2036] text-[#AFC0D4] transition hover:border-[#0E7C86] hover:text-white lg:flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight size={17} />
            ) : (
              <ChevronLeft size={17} />
            )}
          </button>
        </div>
      </aside>
    </>
  )
}

export default ControllerSidebar
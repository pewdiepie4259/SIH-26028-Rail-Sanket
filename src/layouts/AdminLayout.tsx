import { useState } from "react"
import {
  Activity,
  Bell,
  ChevronDown,
  CloudRain,
  Cpu,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Network,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { getCurrentUser, logout } from "../services/auth"

interface NavItem {
  label: string
  path: string
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
}

const navOverview: NavItem[] = [
  {
    label: "System Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
]

const navSecurity: NavItem[] = [
  {
    label: "User Management",
    path: "/admin/users",
    icon: Users,
  },
  {
    label: "Audit Logs",
    path: "/admin/audit",
    icon: FileText,
  },
]

const navSystem: NavItem[] = [
  {
    label: "ETA / Model Config",
    path: "/admin/models",
    icon: Cpu,
  },
  {
    label: "Weather Config",
    path: "/admin/weather",
    icon: CloudRain,
  },
  {
    label: "Integrations",
    path: "/admin/integrations",
    icon: Network,
  },
  {
    label: "Alerts & Rules",
    path: "/admin/alerts",
    icon: Bell,
  },
  {
    label: "System Monitoring",
    path: "/admin/monitoring",
    icon: Activity,
  },
]

const navConfig: NavItem[] = [
  {
    label: "System Settings",
    path: "/admin/settings",
    icon: Settings,
  },
]

function NavSection({
  label,
  items,
  onItemClick,
}: {
  label: string
  items: NavItem[]
  onItemClick?: () => void
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
            item.path === "/admin/dashboard"
              ? location.pathname === "/admin/dashboard" || location.pathname === "/admin"
              : location.pathname.startsWith(item.path)

          return (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={onItemClick}
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

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const currentUser = getCurrentUser()

  const handleLogout = () => {
    logout()
    navigate("/login")
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
                System Administration
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Platform Operational status badge */}
            <div className="hidden sm:flex items-center gap-2 rounded-lg border border-[#145158] bg-[#071A33]/70 px-3 py-1.5 text-xs font-semibold text-[#D7E5EC]">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Platform Operational</span>
            </div>

            <div className="hidden h-7 w-px bg-[#145158] sm:block" />

            <div className="flex items-center gap-2 rounded-lg border border-[#145158] bg-[#071A33]/70 px-2.5 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0E5961]">
                <ShieldCheck size={16} className="text-[#F59E0B]" />
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-[11px] font-bold text-white">
                  {currentUser?.name || "Chief Administrator"}
                </div>
                <div className="text-[9px] text-[#9FB8BE]">
                  Root Administrator
                </div>
              </div>
              <ChevronDown size={14} className="hidden text-[#9FB8BE] sm:block" />
            </div>

            <button
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#145158] text-[#9FB8BE] transition hover:bg-[#08383D] hover:text-white"
              title="Sign Out"
            >
              <LogOut size={16} />
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
            <NavSection
              label="Overview"
              items={navOverview}
              onItemClick={() => setMobileOpen(false)}
            />
            <NavSection
              label="Access & Governance"
              items={navSecurity}
              onItemClick={() => setMobileOpen(false)}
            />
            <NavSection
              label="Core Services"
              items={navSystem}
              onItemClick={() => setMobileOpen(false)}
            />
            <NavSection
              label="System"
              items={navConfig}
              onItemClick={() => setMobileOpen(false)}
            />
          </div>

          {/* Sign out */}
          <div className="shrink-0 border-t border-[#145158] p-3">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-[#D7E5EC] transition-colors hover:bg-[#08383D]"
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

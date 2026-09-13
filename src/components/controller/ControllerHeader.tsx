import {
  Bell,
  Menu,
  Radio,
  ShieldCheck,
  UserCircle,
} from "lucide-react"

interface ControllerHeaderProps {
  onMenuClick: () => void
}

function ControllerHeader({ onMenuClick }: ControllerHeaderProps) {
  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#16364A] bg-[#071A33] px-4 sm:px-6">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#F59E0B] bg-[#0A2036] text-white transition hover:bg-[#0E5961] lg:hidden"
          aria-label="Open controller navigation"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-[#F59E0B]" />
            <span className="truncate text-xs font-bold uppercase tracking-[0.14em] text-[#AFC0D4]">
              Operations Control
            </span>
          </div>

          <h1 className="truncate text-base font-bold text-white sm:text-lg">
            Section Controller Dashboard
          </h1>
        </div>
      </div>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Network status */}
        <div className="hidden items-center gap-2 rounded-lg border border-[#16364A] bg-[#0A2036] px-3 py-2 md:flex">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>

          <span className="text-xs font-semibold text-[#D7E5EC]">
            Network Operational
          </span>
        </div>

        {/* Alerts */}
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-[#16364A] bg-[#0A2036] text-[#D7E5EC] transition hover:border-[#0E7C86] hover:text-white"
          aria-label="Operational alerts"
        >
          <Bell size={18} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#F59E0B]" />
        </button>

        {/* Security */}
        <div className="hidden items-center gap-2 border-l border-[#16364A] pl-3 sm:flex">
          <ShieldCheck size={18} className="text-[#0E7C86]" />

          <div className="hidden lg:block">
            <div className="text-xs font-semibold text-white">
              Authorized Controller
            </div>
            <div className="text-[10px] text-[#71899C]">
              Secure Session
            </div>
          </div>

          <UserCircle size={24} className="text-[#AFC0D4]" />
        </div>
      </div>
    </header>
  )
}

export default ControllerHeader
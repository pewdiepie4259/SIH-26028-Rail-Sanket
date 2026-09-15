import { Link } from "react-router-dom"
import { ArrowLeft, Construction } from "lucide-react"

interface AdminPlaceholderProps {
  title: string
  subtitle: string
  badge?: string
}

export default function AdminPlaceholder({
  title,
  subtitle,
  badge = "Under Configuration",
}: AdminPlaceholderProps) {
  return (
    <div className="controller-page px-4 py-5 lg:px-6">
      <div className="mb-5">
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#F59E0B]">
          Admin Gateway
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">{title}</h1>
        <p className="mt-1 text-sm text-[#9FB8BE]">{subtitle}</p>
      </div>

      <div className="controller-panel mt-6 flex min-h-[360px] flex-col items-center justify-center rounded-xl p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#145158] bg-[#071A33] text-[#F59E0B]">
          <Construction size={28} />
        </div>

        <span className="mt-4 rounded-full border border-amber-500/40 bg-amber-950/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-300">
          {badge}
        </span>

        <h2 className="mt-3 text-lg font-bold text-white">{title} Module</h2>
        <p className="mt-1 max-w-md text-xs text-[#D7E5EC]">
          This module is part of the RailDrishti System Administration roadmap. Core operational parameters are accessible via the System Dashboard.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#F59E0B] bg-[#071A33] px-4 py-2 text-xs font-bold text-[#F59E0B] transition hover:bg-[#0E5961] hover:text-white"
          >
            <ArrowLeft size={14} />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

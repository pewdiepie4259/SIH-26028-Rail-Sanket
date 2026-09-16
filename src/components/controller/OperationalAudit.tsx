import { useState, useEffect } from "react"
import {
  CheckCircle2,
  Clock3,
  FileText,
  ShieldCheck,
  UserCircle,
  Download,
} from "lucide-react"
import { Link } from "react-router-dom"
import {
  getAuditEntries,
  subscribeAudit,
  type AuditRecord,
} from "../../services/auditService"
import { downloadAuditReportPdf } from "../../utils/pdfReportGenerator"

function OperationalAudit() {
  const [auditEntries, setAuditEntries] = useState<AuditRecord[]>(getAuditEntries)
  const [downloading, setDownloading] = useState(false)

  const handleExportPdf = () => {
    setDownloading(true)
    try {
      downloadAuditReportPdf(auditEntries)
    } finally {
      setTimeout(() => setDownloading(false), 2000)
    }
  }

  useEffect(() => {
    return subscribeAudit((updated) => {
      setAuditEntries([...updated])
    })
  }, [])

  return (
    <section className="controller-panel overflow-hidden rounded-xl">
      <div className="controller-header flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <FileText
            size={17}
            className="text-[#F59E0B]"
          />

          <div>
            <h3 className="text-sm font-bold text-white">
              Operational Audit
            </h3>

            <p className="mt-0.5 text-xs text-[#D7E5EC]/80">
              Recent recommendations and controller decisions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={downloading}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition border border-white/20 disabled:opacity-60"
            title="Download audit records as official PDF"
          >
            <Download size={13} className="text-teal-200" />
            <span>{downloading ? "Downloading..." : "Export Audit (PDF)"}</span>
          </button>

          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-teal-200">
            <ShieldCheck
              size={14}
              className="text-teal-300"
            />
            Audit trail active
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                Time
              </th>

              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                Action
              </th>

              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                Train
              </th>

              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                Location
              </th>

              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                Status
              </th>

              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                Actor
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {auditEntries.map((entry) => (
              <tr
                key={entry.id}
                className="transition-colors hover:bg-slate-50/80"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Clock3
                      size={13}
                      className="text-slate-400"
                    />

                    <span className="text-[11px] font-semibold font-mono text-slate-600">
                      {entry.time}
                    </span>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="text-xs font-bold text-[#071A33]">
                    {entry.action}
                  </div>

                  <div className="mt-0.5 text-[9px] text-slate-400 font-mono">
                    {entry.id}
                  </div>
                </td>

                <td className="px-5 py-4">
                  {/^\d{4,5}$/.test(entry.target) ? (
                    <Link
                      to={`/controller/trains/${entry.target}`}
                      className="inline-block rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-[10px] font-bold text-[#0E5961] hover:text-[#F59E0B] transition-colors"
                    >
                      {entry.target}
                    </Link>
                  ) : (
                    <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700">
                      {entry.target}
                    </span>
                  )}
                </td>

                <td className="px-5 py-4 text-[11px] text-slate-600 font-medium">
                  {entry.location || "Bengaluru Division"}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${
                      entry.status === "Approved" || entry.status === "Completed"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : entry.status === "Recorded"
                          ? "border-teal-200 bg-teal-50 text-[#0E5961]"
                          : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    <CheckCircle2 size={11} />
                    {entry.status}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <UserCircle
                      size={14}
                      className="text-slate-400"
                    />

                    <span className="text-[10px] text-slate-600 font-medium">
                      {entry.actor}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[10px] text-slate-500">
          Actions are recorded for operational traceability.
        </span>

        <Link
          to="/controller/reports"
          className="text-left text-[10px] font-bold uppercase tracking-wide text-[#0E5961] transition hover:text-[#F59E0B] sm:text-right"
        >
          View full audit history →
        </Link>
      </div>
    </section>
  )
}

export default OperationalAudit
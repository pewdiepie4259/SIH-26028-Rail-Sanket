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
    <section className="overflow-hidden rounded-xl border border-[#16364A] bg-[#0A2036]">
      <div className="flex flex-col gap-3 border-b border-[#16364A] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <FileText
            size={17}
            className="text-[#F59E0B]"
          />

          <div>
            <h3 className="text-sm font-bold text-white">
              Operational Audit
            </h3>

            <p className="mt-1 text-xs text-[#71899C]">
              Recent recommendations and controller decisions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={downloading}
            className="flex items-center gap-1.5 rounded-md border border-[#16364A] bg-[#071A33] px-2.5 py-1 text-[11px] font-semibold text-[#D7E5EC] hover:border-[#0E7C86] hover:text-white transition disabled:opacity-60"
            title="Download audit records as official PDF"
          >
            <Download size={13} className="text-[#0E7C86]" />
            <span>{downloading ? "Downloading..." : "Export Audit (PDF)"}</span>
          </button>

          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#71899C]">
            <ShieldCheck
              size={14}
              className="text-[#0E7C86]"
            />
            Audit trail active
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] border-collapse">
          <thead>
            <tr className="border-b border-[#16364A] bg-[#071A33] text-left">
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#71899C]">
                Time
              </th>

              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#71899C]">
                Action
              </th>

              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#71899C]">
                Train
              </th>

              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#71899C]">
                Location
              </th>

              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#71899C]">
                Status
              </th>

              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#71899C]">
                Actor
              </th>
            </tr>
          </thead>

          <tbody>
            {auditEntries.map((entry) => (
              <tr
                key={entry.id}
                className="border-b border-[#16364A]/70 transition-colors hover:bg-[#071A33]"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Clock3
                      size={13}
                      className="text-[#71899C]"
                    />

                    <span className="text-[11px] font-semibold text-[#D7E5EC]">
                      {entry.time}
                    </span>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="text-xs font-bold text-white">
                    {entry.action}
                  </div>

                  <div className="mt-0.5 text-[9px] text-[#71899C]">
                    {entry.id}
                  </div>
                </td>

                <td className="px-5 py-4">
                  {/^\d{4,5}$/.test(entry.target) ? (
                    <Link
                      to={`/controller/trains/${entry.target}`}
                      className="inline-block rounded-md border border-[#16364A] bg-[#071A33] px-2 py-1 text-[10px] font-bold text-[#D7E5EC] hover:text-[#F59E0B] transition-colors"
                    >
                      {entry.target}
                    </Link>
                  ) : (
                    <span className="rounded-md border border-[#16364A] bg-[#071A33] px-2 py-1 text-[10px] font-bold text-[#D7E5EC]">
                      {entry.target}
                    </span>
                  )}
                </td>

                <td className="px-5 py-4 text-[11px] text-[#AFC0D4]">
                  {entry.location || "Bengaluru Division"}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${
                      entry.status === "Approved" || entry.status === "Completed"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : entry.status === "Recorded"
                          ? "border-[#0E7C86]/40 bg-[#0E7C86]/10 text-[#6DD3D5]"
                          : "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]"
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
                      className="text-[#71899C]"
                    />

                    <span className="text-[10px] text-[#AFC0D4]">
                      {entry.actor}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 border-t border-[#16364A] bg-[#071A33] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[10px] text-[#71899C]">
          Actions are recorded for operational traceability.
        </span>

        <Link
          to="/controller/reports"
          className="text-left text-[10px] font-bold uppercase tracking-wide text-[#0E7C86] transition hover:text-[#F59E0B] sm:text-right"
        >
          View full audit history
        </Link>
      </div>
    </section>
  )
}

export default OperationalAudit
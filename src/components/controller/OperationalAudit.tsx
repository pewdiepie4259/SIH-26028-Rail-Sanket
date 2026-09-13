import {
  CheckCircle2,
  Clock3,
  FileText,
  ShieldCheck,
  UserCircle,
} from "lucide-react"

interface AuditEntry {
  id: string
  time: string
  action: string
  train: string
  location: string
  status: "Approved" | "Recommended" | "Completed"
  controller: string
}

const auditEntries: AuditEntry[] = [
  {
    id: "AUD-1048",
    time: "14:18:32",
    action: "Precedence review",
    train: "12627",
    location: "Krishnarajapuram Junction",
    status: "Approved",
    controller: "Section Controller",
  },
  {
    id: "AUD-1047",
    time: "14:14:06",
    action: "Movement regulation",
    train: "16591",
    location: "Baiyappanahalli",
    status: "Completed",
    controller: "Section Controller",
  },
  {
    id: "AUD-1046",
    time: "14:09:41",
    action: "Alternate route review",
    train: "12639",
    location: "Bengaluru Cantonment",
    status: "Recommended",
    controller: "System",
  },
]

function OperationalAudit() {
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

        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#71899C]">
          <ShieldCheck
            size={14}
            className="text-[#0E7C86]"
          />
          Audit trail active
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
                  <span className="rounded-md border border-[#16364A] bg-[#071A33] px-2 py-1 text-[10px] font-bold text-[#D7E5EC]">
                    {entry.train}
                  </span>
                </td>

                <td className="px-5 py-4 text-[11px] text-[#AFC0D4]">
                  {entry.location}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${
                      entry.status === "Approved"
                        ? "border-[#0E7C86]/40 bg-[#0E7C86]/10 text-[#6DD3D5]"
                        : entry.status === "Completed"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
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
                      {entry.controller}
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

        <button
          type="button"
          className="text-left text-[10px] font-bold uppercase tracking-wide text-[#0E7C86] transition hover:text-[#F59E0B] sm:text-right"
        >
          View full audit history
        </button>
      </div>
    </section>
  )
}

export default OperationalAudit
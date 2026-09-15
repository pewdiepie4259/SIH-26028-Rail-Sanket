export interface AuditRecord {
  id: string
  time: string
  actor: string
  action: string
  target: string
  location?: string
  status: "Recorded" | "Approved" | "Recommended" | "Completed"
  details?: string
}

const STORAGE_KEY = "raildrishti_operational_audit_log"

function getInitialEntries(): AuditRecord[] {
  return [
    {
      id: "AUD-1048",
      time: "14:18:32",
      actor: "Controller",
      action: "Precedence review",
      target: "12627",
      location: "Krishnarajapuram Junction",
      status: "Approved",
    },
    {
      id: "AUD-1047",
      time: "14:14:06",
      actor: "Controller",
      action: "Movement regulation",
      target: "16591",
      location: "Baiyappanahalli",
      status: "Completed",
    },
    {
      id: "AUD-1046",
      time: "14:09:41",
      actor: "Controller",
      action: "Alternate route review",
      target: "12639",
      location: "Bengaluru Cantonment",
      status: "Recommended",
    },
  ]
}

export function getAuditEntries(): AuditRecord[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    // fallback
  }
  return getInitialEntries()
}

type AuditListener = (entries: AuditRecord[]) => void
const listeners = new Set<AuditListener>()

export function recordAuditAction(params: {
  action: string
  target: string
  actor?: string
  location?: string
  status?: "Recorded" | "Approved" | "Recommended" | "Completed"
  details?: string
}): AuditRecord {
  const current = getAuditEntries()
  const time = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  })

  const newEntry: AuditRecord = {
    id: `AUD-${Date.now().toString().slice(-4)}`,
    time,
    actor: params.actor || "Controller",
    action: params.action,
    target: params.target,
    location: params.location || "Bengaluru Division (SBC)",
    status: params.status || "Recorded",
    details: params.details,
  }

  const updated = [newEntry, ...current].slice(0, 50)
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // ignore
  }

  listeners.forEach((listener) => {
    try {
      listener(updated)
    } catch {
      // ignore
    }
  })

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("raildrishti_audit_change", { detail: updated }))
  }

  return newEntry
}

export function subscribeAudit(listener: AuditListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// src/services/mailService.ts
import { getCurrentUser } from "./auth";

const API_BASE = "http://localhost:5000/api/mail";
const STORAGE_KEY_FALLBACK_DISPATCHES = "raildrishti_fallback_dispatches_v1";

export type DispatchPriority = "routine" | "high" | "urgent";

export type DispatchCategory =
  | "problem_report"
  | "work_completion"
  | "operational_directive"
  | "speed_restriction"
  | "safety_circular"
  | "general";

export interface DispatchItem {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  sender_email: string;
  recipient_id: string;
  recipient_name: string;
  recipient_role: string;
  recipient_email: string;
  category: DispatchCategory;
  priority: DispatchPriority;
  subject: string;
  body: string;
  train_number?: string | null;
  section?: string | null;
  station_code?: string | null;
  status: "sent" | "delivered" | "acknowledged";
  acknowledged_at?: string | null;
  smtp_status?: "delivered" | "ethereal_preview" | "simulated" | "failed";
  smtp_preview_url?: string | null;
  approval_status?: "approved" | "rejected" | "pending_review" | "not_applicable";
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  reviewer_notes?: string | null;
  return_dispatch_id?: string | null;
  created_at: string;
}

export interface StaffDirectoryItem {
  id: string;
  name: string;
  role: "controller" | "employee" | "admin" | "user";
  email: string;
  designation: string;
  department: string;
  operationalRole?: string;
  section?: string;
}

export interface SendDispatchPayload {
  senderId?: string;
  senderName?: string;
  senderRole?: string;
  senderEmail?: string;
  recipientId?: string;
  recipientName?: string;
  recipientRole?: string;
  recipientEmail: string;
  category: DispatchCategory;
  priority: DispatchPriority;
  subject: string;
  body: string;
  trainNumber?: string;
  section?: string;
  stationCode?: string;
}

export interface MailStats {
  totalInbox: number;
  unacknowledged: number;
  urgentCount: number;
}

// Fallback seed directory when backend is booting or disconnected
export const DEFAULT_DIRECTORY: StaffDirectoryItem[] = [
  {
    id: "usr_ctrl_2001",
    name: "Shriya M",
    role: "controller",
    email: "shriya.m@raildrishti.gov.in",
    designation: "Senior Section Controller (Bengaluru Section - SBC)",
    department: "Operations & Traffic Control",
    section: "Bengaluru (SBC) - Jolarpettai (JTJ)",
  },
  {
    id: "usr_ctrl_2002",
    name: "Rohit Roy",
    role: "controller",
    email: "rohit.roy@raildrishti.gov.in",
    designation: "Traffic Dispatch & Section Controller",
    department: "Operations & Traffic Control",
    section: "Northern Corridor & High-Density Route (NDLS)",
  },
  {
    id: "usr_emp_5001",
    name: "Manas Kumar",
    role: "employee",
    email: "manas.kumar@raildrishti.gov.in",
    designation: "Senior Signal & Telecom Maintainer",
    department: "Signal & Telecommunication (S&T)",
    operationalRole: "signal_maintainer",
    section: "Bengaluru Division (SBC-WFD)",
  },
  {
    id: "usr_emp_5002",
    name: "Krutika Girennavar",
    role: "employee",
    email: "krutika.g@raildrishti.gov.in",
    designation: "Assistant Station Master (ASM)",
    department: "Operations & Traffic Control",
    operationalRole: "station_master",
    section: "KSR Bengaluru City (SBC)",
  },
  {
    id: "usr_adm_1001",
    name: "Souvik Saha",
    role: "admin",
    email: "souvik.saha@raildrishti.gov.in",
    designation: "Principal System Administrator & Operations Director",
    department: "Railway Operations & Safety Directorate",
    section: "Central Command & Safety Oversight",
  },
];

// Operational templates for instant composing
export const OPERATIONAL_TEMPLATES = {
  employee: [
    {
      label: "Work Completion Memo (Signal / Track)",
      category: "work_completion" as DispatchCategory,
      priority: "routine" as DispatchPriority,
      subject: "Work Completion: Track & Signal Interlocking Normalcy Restored",
      body: `TO: Section Controller\n\nOfficial confirmation that scheduled rectification and testing at Point / Track Circuit has been successfully completed.\n\n- Time of Completion: ${new Date().toLocaleTimeString()}\n- Aspect Verification: All signals displaying correct green/yellow indications\n- Track Fit for Traffic: Yes, certified fit for maximum permissible line speed\n\nRequesting cancellation of caution notice.`,
    },
    {
      label: "Defect / Problem Notice (Urgent)",
      category: "problem_report" as DispatchCategory,
      priority: "urgent" as DispatchPriority,
      subject: "URGENT DEFECT: Signal / Track Disruption Detected",
      body: `TO: Section Controller\n\nATTENTION: Immediate operational caution required.\n\n- Anomaly: Signal failing to clear / Track circuit drop detected\n- Location / Yard: Km / Line No.\n- Traffic Impact: Approach trains require pilot memo or caution order\n- Field Action Taken: S&T emergency team alerted; manual route inspection initiated.\n\nKindly issue caution order to approaching trains.`,
    },
    {
      label: "Loco / Rolling Stock Defect",
      category: "problem_report" as DispatchCategory,
      priority: "high" as DispatchPriority,
      subject: "Rolling Stock Anomaly: Traction / Brake Pressure Drop",
      body: `TO: Section Controller\n\n- Train: \n- Loco Number: \n- Observation: Brake pipe pressure dropping intermittently; speed restricted to 50 km/h\n- Assistance Requested: Mechanical inspection at next junction station platform.`,
    },
  ],
  controller: [
    {
      label: "Speed Restriction & Caution Order",
      category: "speed_restriction" as DispatchCategory,
      priority: "high" as DispatchPriority,
      subject: "CAUTION ORDER: Temporary Speed Restriction (TSR 30 KM/H)",
      body: `OFFICIAL OPERATIONAL DIRECTIVE\n\nTo: Station Masters & Loco Pilots in Section\n\nEffective immediately, enforce Temporary Speed Restriction (TSR) between KM 341/00 and KM 343/10 due to ongoing track maintenance.\n\n- Max Speed: 30 km/h\n- Applicable Trains: All Up & Down Mail/Express and Freight services\n- Duration: Until further notice or written clearance memo received\n\nAcknowledge receipt immediately.`,
    },
    {
      label: "Platform Reception Precedence Order",
      category: "operational_directive" as DispatchCategory,
      priority: "high" as DispatchPriority,
      subject: "OPERATIONAL ORDER: Reception Precedence & Route Setting",
      body: `OFFICIAL SECTION DIRECTIVE\n\nTo: Assistant Station Master on Duty\n\nAuthorize priority reception of Express Train onto Platform 1 ahead of trailing freight train. Set route and ensure overlap is locked prior to signal clearance.\n\n- Priority: High\n- Train No: \n- Instructions: Clear starter upon complete train arrival inside fouling mark.`,
    },
    {
      label: "Safety & Weather Alert Circular",
      category: "safety_circular" as DispatchCategory,
      priority: "urgent" as DispatchPriority,
      subject: "SAFETY CIRCULAR: Precautionary Protocols for Severe Weather / Reduced Visibility",
      body: `RAILWAY SAFETY ADVISORY\n\nTo: All Station Masters, Loco Pilots, and Maintenance Field Staff\n\nDue to heavy rainfall / low visibility in the Bengaluru-Jolarpettai corridor:\n1. Ensure fog signal detonator availability at stations\n2. Loco pilots to adhere strictly to automatic block territory speed caps\n3. Patrolling gangs to inspect vulnerable bridge cuttings every 45 minutes\n\nAcknowledge receipt of this circular.`,
    },
  ],
};

function getLocalDispatches(): DispatchItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FALLBACK_DISPATCHES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalDispatches(items: DispatchItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY_FALLBACK_DISPATCHES, JSON.stringify(items));
  } catch (err) {
    console.error("Failed to save local dispatches:", err);
  }
}

// Fetch staff directory
export async function fetchStaffDirectory(): Promise<StaffDirectoryItem[]> {
  try {
    const res = await fetch(`${API_BASE}/directory`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.directory) && data.directory.length > 0) {
        return data.directory;
      }
    }
  } catch {
    // offline fallback
  }
  return DEFAULT_DIRECTORY;
}

// Fetch user inbox
export async function fetchInbox(email?: string, role?: string, userId?: string): Promise<DispatchItem[]> {
  const user = getCurrentUser();
  const targetEmail = email || user?.email || "";
  const targetRole = role || user?.role || "";
  const targetId = userId || user?.id || "";

  try {
    const params = new URLSearchParams({
      email: targetEmail,
      role: targetRole,
      userId: targetId,
    });
    const res = await fetch(`${API_BASE}/inbox?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        return data.items;
      }
    }
  } catch {
    // fallback to local storage
  }

  const local = getLocalDispatches();
  return local.filter(
    (d) =>
      d.recipient_email.toLowerCase() === targetEmail.toLowerCase() ||
      d.recipient_id === targetId ||
      (targetRole && d.recipient_role === targetRole)
  );
}

// Fetch sent items
export async function fetchSent(email?: string, userId?: string): Promise<DispatchItem[]> {
  const user = getCurrentUser();
  const targetEmail = email || user?.email || "";
  const targetId = userId || user?.id || "";

  try {
    const params = new URLSearchParams({
      email: targetEmail,
      userId: targetId,
    });
    const res = await fetch(`${API_BASE}/sent?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        return data.items;
      }
    }
  } catch {
    // fallback to local storage
  }

  const local = getLocalDispatches();
  return local.filter(
    (d) =>
      d.sender_email.toLowerCase() === targetEmail.toLowerCase() ||
      d.sender_id === targetId
  );
}

// Send an official dispatch & email
export async function sendOfficialDispatch(
  payload: SendDispatchPayload
): Promise<{ success: boolean; message: string; dispatch?: DispatchItem }> {
  const user = getCurrentUser();
  const enrichedPayload = {
    senderId: payload.senderId || user?.id || "usr_anonymous",
    senderName: payload.senderName || user?.name || "Operations Staff",
    senderRole: payload.senderRole || user?.role || "employee",
    senderEmail: payload.senderEmail || user?.email || "staff@raildrishti.gov.in",
    ...payload,
  };

  try {
    const res = await fetch(`${API_BASE}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enrichedPayload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.dispatch) {
        // Also mirror into local cache
        const local = getLocalDispatches();
        saveLocalDispatches([data.dispatch, ...local]);
        return data;
      }
    } else {
      const errData = await res.json().catch(() => null);
      if (errData?.message) {
        throw new Error(errData.message);
      }
    }
  } catch (err: any) {
    console.warn("Backend API unreachable, using local dispatch storage fallback:", err.message);
  }

  // Local Offline Simulation Fallback
  const fallbackItem: DispatchItem = {
    id: `disp_${Date.now()}_local`,
    sender_id: enrichedPayload.senderId,
    sender_name: enrichedPayload.senderName,
    sender_role: enrichedPayload.senderRole,
    sender_email: enrichedPayload.senderEmail,
    recipient_id: enrichedPayload.recipientId || "",
    recipient_name: enrichedPayload.recipientName || enrichedPayload.recipientEmail,
    recipient_role: enrichedPayload.recipientRole || "controller",
    recipient_email: enrichedPayload.recipientEmail,
    category: enrichedPayload.category,
    priority: enrichedPayload.priority,
    subject: enrichedPayload.subject,
    body: enrichedPayload.body,
    train_number: enrichedPayload.trainNumber || null,
    section: enrichedPayload.section || null,
    station_code: enrichedPayload.stationCode || null,
    status: "delivered",
    acknowledged_at: null,
    smtp_status: "simulated",
    smtp_preview_url: null,
    created_at: new Date().toISOString(),
  };

  const currentLocal = getLocalDispatches();
  saveLocalDispatches([fallbackItem, ...currentLocal]);

  return {
    success: true,
    message: "Dispatch sent and recorded successfully (Simulation Mode).",
    dispatch: fallbackItem,
  };
}

// Acknowledge dispatch
export async function acknowledgeDispatchApi(
  id: string,
  acknowledgedBy?: string
): Promise<{ success: boolean; dispatch?: DispatchItem }> {
  const user = getCurrentUser();
  const userName = acknowledgedBy || user?.name || "Staff Member";

  try {
    const res = await fetch(`${API_BASE}/${id}/acknowledge`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acknowledgedBy: userName }),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    // fallback to local storage
  }

  // Update local storage
  const local = getLocalDispatches();
  const updated = local.map((item) =>
    item.id === id
      ? {
          ...item,
          status: "acknowledged" as const,
          acknowledged_at: new Date().toISOString(),
        }
      : item
  );
  saveLocalDispatches(updated);
  const found = updated.find((i) => i.id === id);

  return { success: true, dispatch: found };
}

// Fetch mail stats
export async function fetchMailStats(
  email?: string,
  role?: string,
  userId?: string
): Promise<MailStats> {
  const user = getCurrentUser();
  const targetEmail = email || user?.email || "";
  const targetRole = role || user?.role || "";
  const targetId = userId || user?.id || "";

  try {
    const params = new URLSearchParams({
      email: targetEmail,
      role: targetRole,
      userId: targetId,
    });
    const res = await fetch(`${API_BASE}/stats?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.stats) {
        return data.stats;
      }
    }
  } catch {
    // local fallback
  }

  const inbox = await fetchInbox(targetEmail, targetRole, targetId);
  return {
    totalInbox: inbox.length,
    unacknowledged: inbox.filter((i) => i.status !== "acknowledged").length,
    urgentCount: inbox.filter((i) => i.priority === "urgent" && i.status !== "acknowledged").length,
  };
}

// Admin: Fetch all dispatches across the entire railway organization
export async function fetchAllDispatchesForAdmin(
  senderRole?: string,
  approvalStatus?: string,
  category?: string
): Promise<DispatchItem[]> {
  try {
    const params = new URLSearchParams();
    if (senderRole && senderRole !== "all") params.append("senderRole", senderRole);
    if (approvalStatus && approvalStatus !== "all") params.append("approvalStatus", approvalStatus);
    if (category && category !== "all") params.append("category", category);

    const res = await fetch(`${API_BASE}/all?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        return data.items;
      }
    }
  } catch {
    // local fallback
  }

  const local = getLocalDispatches();
  return local.filter((d) => {
    const matchesRole = !senderRole || senderRole === "all" || d.sender_role?.toLowerCase() === senderRole.toLowerCase();
    const matchesStatus = !approvalStatus || approvalStatus === "all" || d.approval_status === approvalStatus;
    const matchesCategory = !category || category === "all" || d.category === category;
    return matchesRole && matchesStatus && matchesCategory;
  });
}

// Admin: Review a work dispatch / memo (Approve / Reject) and automatically dispatch an official Return Mail
export async function reviewDispatchAndSendReturn(
  dispatchId: string,
  decision: "approved" | "rejected",
  reviewerNotes?: string,
  reviewerName = "Chief Operations Administrator",
  reviewerEmail = "admin@raildrishti.gov.in"
): Promise<{ success: boolean; message: string; original?: DispatchItem; returnDispatch?: DispatchItem }> {
  try {
    const res = await fetch(`${API_BASE}/${dispatchId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        decision,
        reviewerNotes,
        reviewerName,
        reviewerEmail,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err: any) {
    console.error("Failed to review dispatch via API:", err.message);
  }

  // Local fallback
  const local = getLocalDispatches();
  const found = local.find((i) => i.id === dispatchId);
  if (found) {
    found.approval_status = decision;
    found.reviewed_by = `${reviewerName} (${reviewerEmail})`;
    found.reviewed_at = new Date().toISOString();
    found.reviewer_notes = reviewerNotes || (decision === "approved" ? "Approved by Administration." : "Rejected by Administration.");

    // Create return mail
    const returnItem: DispatchItem = {
      id: `disp_ret_${Date.now()}`,
      sender_id: "usr_adm_1001",
      sender_name: reviewerName,
      sender_role: "admin",
      sender_email: reviewerEmail,
      recipient_id: found.sender_id,
      recipient_name: found.sender_name,
      recipient_role: found.sender_role,
      recipient_email: found.sender_email,
      category: "operational_directive",
      priority: decision === "rejected" ? "urgent" : "high",
      subject: `[${decision.toUpperCase()}] Official Decision: ${found.subject}`,
      body: `Official Administrative Review Notice\n\nDecision: ${decision.toUpperCase()}\nReviewed By: ${reviewerName}\n\nRemarks:\n${found.reviewer_notes}`,
      status: "delivered",
      approval_status: "not_applicable",
      created_at: new Date().toISOString(),
    };

    saveLocalDispatches([returnItem, ...local]);
    return {
      success: true,
      message: `Dispatch ${decision} and return mail sent.`,
      original: found,
      returnDispatch: returnItem,
    };
  }

  return { success: false, message: "Dispatch record not found." };
}


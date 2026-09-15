// src/services/caseService.ts
/**
 * RailDrishti Centralized Case & Incident Service
 * 
 * Manages the complete lifecycle:
 * EMPLOYEE -> CONTROLLER -> ADMIN -> RESPONSIBLE TEAM -> RESOLUTION -> NOTIFICATIONS & AUDIT
 */

export type CaseType = "ISSUE" | "INCIDENT";

export type CaseStatus =
  | "SUBMITTED"
  | "ACKNOWLEDGED"
  | "UNDER_REVIEW"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "VERIFIED"
  | "CLOSED"
  | "REJECTED"
  | "ESCALATED";

export type CaseSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type OperationalImpactStatus = "OPERATIONAL" | "RESTRICTED" | "BLOCKED";

export interface CaseAuditLog {
  id: string;
  case_id: string;
  caseId: string;
  actor_id?: string;
  actorId?: string;
  actor_name: string;
  actorName: string;
  actor_role: string;
  actorRole: string;
  action: string;
  from_status?: string;
  to_status?: string;
  notes?: string;
  created_at: string;
  createdAt: string;
  timestamp: string;
}

export interface CaseComment {
  id: string;
  case_id: string;
  caseId: string;
  author_id?: string;
  authorId?: string;
  author_name: string;
  authorName: string;
  author_role: string;
  authorRole: string;
  comment_type: "NOTE" | "OPERATIONAL" | "ADMIN" | "RESOLUTION";
  commentType?: string;
  comment: string;
  created_at: string;
  createdAt: string;
}

export interface OperationalCase {
  id: string;
  case_type: CaseType;
  caseType: CaseType;
  title: string;
  issue_type: string;
  issueType: string;
  category: string;
  severity: CaseSeverity;
  location: string;
  description: string;
  current_operational_status: OperationalImpactStatus;
  currentOperationalStatus: OperationalImpactStatus;
  operationalImpact: string;
  status: CaseStatus;
  reporter_id?: string;
  reporterId?: string;
  reporter_name: string;
  reporterName: string;
  reporter_role: string;
  reporterRole: string;
  department: string;
  assigned_department?: string;
  assignedDepartment?: string;
  assigned_person?: string;
  assignedPerson?: string;
  assignedTeam?: string;
  controller_id?: string;
  controllerId?: string;
  controller_name?: string;
  controllerName?: string;
  controller_operational_notes?: string;
  admin_notes?: string;
  resolution_details?: string;
  verified_by?: string;
  resolutionVerified?: boolean;
  image_url?: string;
  imageUrl?: string;
  image_file_name?: string;
  created_at: string;
  createdAt: string;
  updated_at: string;
  updatedAt: string;
  auditLogs?: CaseAuditLog[];
  comments?: CaseComment[];
}

export interface CaseNotification {
  id: string;
  case_id: string;
  caseId: string;
  recipient_role: "employee" | "controller" | "admin" | "all";
  recipientRole: string;
  recipient_id?: string;
  recipientId?: string;
  title: string;
  message: string;
  category: "Issues" | "Incidents" | "Operations";
  priority: "Critical" | "High" | "Medium" | "Low";
  is_read: number;
  read: boolean;
  type?: string;
  created_at: string;
  createdAt: string;
}

export interface CreateCasePayload {
  caseType: CaseType;
  issueType?: string;
  category?: string;
  severity: CaseSeverity;
  location: string;
  description: string;
  currentOperationalStatus?: OperationalImpactStatus;
  operationalImpact?: string;
  reporterId?: string;
  reporterName?: string;
  reporterRole?: string;
  department?: string;
  imageUrl?: string;
  imageFileName?: string;
}

export interface ActorInfo {
  id?: string;
  name: string;
  role: string;
}

export interface AssignmentPayload {
  assignedDepartment: string;
  assignedPerson?: string;
  notes?: string;
  severity?: CaseSeverity;
}

export interface CaseServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  case?: T;
}

export interface DepartmentTeamDirectory {
  name: string;
  teams: string[];
}

export const DEPARTMENT_DIRECTORY: DepartmentTeamDirectory[] = [
  {
    name: "Signal & Telecommunication (S&T)",
    teams: [
      "S&T Signal Maintenance Desk",
      "Point Machine & Track Circuit Unit",
      "Electronic Interlocking (EI) Cell",
      "Telecom & Radio Communication",
    ],
  },
  {
    name: "Civil & Track Engineering",
    teams: [
      "P-Way Engineering Gang #1",
      "P-Way Engineering Gang #2",
      "USFD Rail Testing Team",
      "Bridge & Structure Inspection Unit",
    ],
  },
  {
    name: "Electrical & Traction (OHE)",
    teams: [
      "Traction (OHE) Control Desk",
      "OHE Tower Wagon Quick Response Unit",
      "Substation & Power Supply Crew",
      "General Electrical & Lighting Unit",
    ],
  },
  {
    name: "Mechanical & Rolling Stock",
    teams: [
      "Rolling Stock & TXR Depot",
      "Locomotive Machine Maintenance Crew",
      "Coach Watering & Brake Inspection Unit",
    ],
  },
  {
    name: "Station Operations & Commercial",
    teams: [
      "Station Operations & Commercial Cell",
      "Platform Management & Cleaning",
      "Passenger Information Display & PA Tech",
    ],
  },
  {
    name: "Security & RPF",
    teams: [
      "RPF Security Post",
      "Train Escort Constabulary Unit",
      "CCTV Surveillance & Control Room",
    ],
  },
  {
    name: "Medical & Emergency Unit",
    teams: [
      "Railway Medical Unit & First Aid Post",
      "Accident Relief Medical Van (ARMV)",
      "Emergency Disaster Management Team",
    ],
  },
];

const API_BASE_URL = "http://localhost:5000/api/cases";
const LOCAL_STORAGE_CASES_KEY = "raildrishti_operational_cases";

export function normalizeAuditLog(raw: any): CaseAuditLog {
  const ts = raw.created_at || raw.createdAt || raw.timestamp || new Date().toISOString();
  return {
    id: raw.id || `log_${Date.now()}`,
    case_id: raw.case_id || raw.caseId || "",
    caseId: raw.caseId || raw.case_id || "",
    actor_id: raw.actor_id || raw.actorId,
    actorId: raw.actorId || raw.actor_id,
    actor_name: raw.actor_name || raw.actorName || "Staff",
    actorName: raw.actorName || raw.actor_name || "Staff",
    actor_role: raw.actor_role || raw.actorRole || "employee",
    actorRole: raw.actorRole || raw.actor_role || "employee",
    action: raw.action || "Action Logged",
    from_status: raw.from_status || raw.fromStatus,
    to_status: raw.to_status || raw.toStatus,
    notes: raw.notes,
    created_at: ts,
    createdAt: ts,
    timestamp: ts,
  };
}

export function normalizeComment(raw: any): CaseComment {
  const ts = raw.created_at || raw.createdAt || new Date().toISOString();
  return {
    id: raw.id || `comm_${Date.now()}`,
    case_id: raw.case_id || raw.caseId || "",
    caseId: raw.caseId || raw.case_id || "",
    author_id: raw.author_id || raw.authorId,
    authorId: raw.authorId || raw.author_id,
    author_name: raw.author_name || raw.authorName || "Staff",
    authorName: raw.authorName || raw.author_name || "Staff",
    author_role: raw.author_role || raw.authorRole || "employee",
    authorRole: raw.authorRole || raw.author_role || "employee",
    comment_type: raw.comment_type || raw.commentType || "NOTE",
    commentType: raw.commentType || raw.comment_type || "NOTE",
    comment: raw.comment || "",
    created_at: ts,
    createdAt: ts,
  };
}

export function normalizeNotification(raw: any): CaseNotification {
  const ts = raw.created_at || raw.createdAt || new Date().toISOString();
  const isRead = raw.is_read === 1 || raw.is_read === true || raw.read === true;
  return {
    id: raw.id || `notif_${Date.now()}`,
    case_id: raw.case_id || raw.caseId || "",
    caseId: raw.caseId || raw.case_id || "",
    recipient_role: raw.recipient_role || raw.recipientRole || "all",
    recipientRole: raw.recipientRole || raw.recipient_role || "all",
    recipient_id: raw.recipient_id || raw.recipientId,
    recipientId: raw.recipientId || raw.recipient_id,
    title: raw.title || "Case Notification",
    message: raw.message || "",
    category: raw.category || "Issues",
    priority: raw.priority || "Medium",
    is_read: isRead ? 1 : 0,
    read: isRead,
    type: raw.type || (raw.title?.includes("Created") ? "CASE_CREATED" : "STATUS_CHANGE"),
    created_at: ts,
    createdAt: ts,
  };
}

export function normalizeCase(raw: any): OperationalCase {
  const created = raw.created_at || raw.createdAt || new Date().toISOString();
  const updated = raw.updated_at || raw.updatedAt || created;
  const rawType = raw.case_type || raw.caseType || "ISSUE";
  const rawIssueType = raw.issue_type || raw.issueType || raw.category || "General";
  const rawImpact = raw.current_operational_status || raw.currentOperationalStatus || raw.operationalImpact || "RESTRICTED";
  const rawDept = raw.assigned_department || raw.assignedDepartment || raw.department || "Operations & Traffic Control";
  const rawTeam = raw.assigned_person || raw.assignedPerson || raw.assignedTeam || rawDept;
  const isVerified = Boolean(raw.verified_by || raw.resolutionVerified);

  return {
    id: raw.id,
    case_type: rawType,
    caseType: rawType,
    title: raw.title || `${rawIssueType} Report: ${raw.location}`,
    issue_type: rawIssueType,
    issueType: rawIssueType,
    category: rawIssueType,
    severity: raw.severity || "MEDIUM",
    location: raw.location || "Section Track",
    description: raw.description || "",
    current_operational_status: rawImpact as OperationalImpactStatus,
    currentOperationalStatus: rawImpact as OperationalImpactStatus,
    operationalImpact: rawImpact,
    status: raw.status || "SUBMITTED",
    reporter_id: raw.reporter_id || raw.reporterId,
    reporterId: raw.reporterId || raw.reporter_id,
    reporter_name: raw.reporter_name || raw.reporterName || "Staff Member",
    reporterName: raw.reporterName || raw.reporter_name || "Staff Member",
    reporter_role: raw.reporter_role || raw.reporterRole || "Employee",
    reporterRole: raw.reporterRole || raw.reporter_role || "Employee",
    department: raw.department || "Operations & Traffic Control",
    assigned_department: rawDept,
    assignedDepartment: rawDept,
    assigned_person: rawTeam,
    assignedPerson: rawTeam,
    assignedTeam: rawTeam,
    controller_id: raw.controller_id || raw.controllerId,
    controllerId: raw.controllerId || raw.controller_id,
    controller_name: raw.controller_name || raw.controllerName,
    controllerName: raw.controllerName || raw.controller_name,
    controller_operational_notes: raw.controller_operational_notes || raw.controllerNotes,
    admin_notes: raw.admin_notes || raw.adminNotes,
    resolution_details: raw.resolution_details || raw.resolutionDetails,
    verified_by: raw.verified_by,
    resolutionVerified: isVerified,
    image_url: raw.image_url || raw.imageUrl,
    imageUrl: raw.imageUrl || raw.image_url,
    image_file_name: raw.image_file_name || raw.imageFileName,
    created_at: created,
    createdAt: created,
    updated_at: updated,
    updatedAt: updated,
    auditLogs: Array.isArray(raw.auditLogs) ? raw.auditLogs.map(normalizeAuditLog) : [],
    comments: Array.isArray(raw.comments) ? raw.comments.map(normalizeComment) : [],
  };
}

// Fallback seed cases for offline tolerance
const DEFAULT_CASES: OperationalCase[] = [
  normalizeCase({
    id: "RD-2026-00138",
    case_type: "ISSUE",
    title: "Signal aspect flickering on starter 4B",
    issue_type: "Signal",
    severity: "HIGH",
    location: "KSR Bengaluru Junction",
    description: "Signal aspect flickering on down-line starter signal 4B.",
    current_operational_status: "RESTRICTED",
    status: "RESOLVED",
    reporter_id: "IR-2024-5001",
    reporter_name: "Manas Kumar",
    reporter_role: "Signal Maintainer",
    department: "Signal & Telecommunication",
    assigned_department: "Signal & Telecommunication (S&T)",
    assigned_person: "S&T Gang 3 Lead A. Prasad",
    controller_id: "CTRL-SBC-01",
    controller_name: "Shriya M",
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    auditLogs: [
      {
        id: "log_1",
        case_id: "RD-2026-00138",
        actor_name: "Manas Kumar",
        actor_role: "Signal Maintainer",
        action: "Issue Reported",
        from_status: "NONE",
        to_status: "SUBMITTED",
        notes: "Signal aspect flickering on starter signal 4B.",
        created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
      },
      {
        id: "log_2",
        case_id: "RD-2026-00138",
        actor_name: "Shriya M",
        actor_role: "Section Controller",
        action: "Acknowledged & Reviewed",
        from_status: "SUBMITTED",
        to_status: "UNDER_REVIEW",
        notes: "Assessed line safety. Speed caution issued.",
        created_at: new Date(Date.now() - 3.5 * 3600000).toISOString(),
      },
      {
        id: "log_3",
        case_id: "RD-2026-00138",
        actor_name: "Shriya M",
        actor_role: "Section Controller",
        action: "Assigned to Signal & Telecommunication (S&T)",
        from_status: "UNDER_REVIEW",
        to_status: "ASSIGNED",
        notes: "Dispatched S&T Gang 3.",
        created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
      },
      {
        id: "log_4",
        case_id: "RD-2026-00138",
        actor_name: "A. Prasad",
        actor_role: "S&T Gang 3 Lead",
        action: "Remediation Completed",
        from_status: "IN_PROGRESS",
        to_status: "RESOLVED",
        notes: "Lamp unit replaced. Tested 4B.",
        created_at: new Date(Date.now() - 1 * 3600000).toISOString(),
      },
    ],
    comments: [
      {
        id: "comm_1",
        case_id: "RD-2026-00138",
        author_name: "Shriya M",
        author_role: "Section Controller",
        comment_type: "OPERATIONAL",
        comment: "Point interlocking clearance granted for 45 minutes slot.",
        created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
      }
    ],
  }),
  normalizeCase({
    id: "RD-2026-00139",
    case_type: "ISSUE",
    title: "Platform 4 passenger display LED panel frozen",
    issue_type: "Platform",
    severity: "MEDIUM",
    location: "Platform 4",
    description: "Platform 4 passenger information display LED panel frozen on train 12627 departure information.",
    current_operational_status: "OPERATIONAL",
    status: "UNDER_REVIEW",
    reporter_id: "IR-2024-5003",
    reporter_name: "Nitin Rao",
    reporter_role: "Station Master",
    department: "Operations & Traffic Control",
    assigned_department: "Station Operations & Commercial",
    assigned_person: "Station Tech Support",
    controller_id: "CTRL-SBC-01",
    controller_name: "Shriya M",
    controller_operational_notes: "Temporary manual PA announcements enabled on Platform 4.",
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    auditLogs: [
      {
        id: "log_139_1",
        case_id: "RD-2026-00139",
        actor_name: "Nitin Rao",
        actor_role: "Station Master",
        action: "Issue Reported",
        from_status: "NONE",
        to_status: "SUBMITTED",
        notes: "LED display frozen.",
        created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
      {
        id: "log_139_2",
        case_id: "RD-2026-00139",
        actor_name: "Shriya M",
        actor_role: "Section Controller",
        action: "Reviewed by Controller",
        from_status: "SUBMITTED",
        to_status: "UNDER_REVIEW",
        notes: "Assessed non-safety operational impact.",
        created_at: new Date(Date.now() - 1.5 * 3600000).toISOString(),
      },
    ],
    comments: [],
  }),
  normalizeCase({
    id: "INC-2026-00021",
    case_type: "INCIDENT",
    title: "Track Obstruction / Rail Fracture near Dadri Cut",
    issue_type: "Track Obstruction",
    severity: "CRITICAL",
    location: "Section Approach Cutting Km 48/20",
    description: "Heavy transverse crack and obstruction detected on Up Main track. Immediate line block required.",
    current_operational_status: "BLOCKED",
    status: "IN_PROGRESS",
    reporter_id: "IR-2024-5005",
    reporter_name: "Devendra Yadav",
    reporter_role: "Track Maintainer",
    department: "Civil & Track Engineering",
    assigned_department: "Civil & Track Engineering",
    assigned_person: "P-Way Emergency Gang #1",
    controller_id: "CTRL-NDLS-02",
    controller_name: "Rohit Roy",
    controller_operational_notes: "Track blocked. Trains 12628 and 16526 regulated at upstream loops.",
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60000).toISOString(),
    auditLogs: [
      {
        id: "log_inc_1",
        case_id: "INC-2026-00021",
        actor_name: "Devendra Yadav",
        actor_role: "Track Maintainer",
        action: "Critical Incident Logged",
        from_status: "NONE",
        to_status: "SUBMITTED",
        notes: "Emergency track fracture report.",
        created_at: new Date(Date.now() - 45 * 60000).toISOString(),
      },
      {
        id: "log_inc_2",
        case_id: "INC-2026-00021",
        actor_name: "Rohit Roy",
        actor_role: "Section Controller",
        action: "Emergency Line Block Enacted",
        from_status: "SUBMITTED",
        to_status: "UNDER_REVIEW",
        notes: "Signal approach set to Danger.",
        created_at: new Date(Date.now() - 40 * 60000).toISOString(),
      },
      {
        id: "log_inc_3",
        case_id: "INC-2026-00021",
        actor_name: "Rohit Roy",
        actor_role: "Section Controller",
        action: "Dispatched P-Way Emergency Gang",
        from_status: "UNDER_REVIEW",
        to_status: "IN_PROGRESS",
        notes: "Gang on site with emergency clamps.",
        created_at: new Date(Date.now() - 30 * 60000).toISOString(),
      }
    ],
    comments: [],
  })
];

function getLocalCases(): OperationalCase[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CASES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeCase);
      }
    }
  } catch {}
  return DEFAULT_CASES;
}

function saveLocalCases(cases: OperationalCase[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_CASES_KEY, JSON.stringify(cases));
  } catch {}
}

export const caseService = {
  /**
   * Create a new Issue or Incident
   */
  async createCase(payload: CreateCasePayload): Promise<CaseServiceResponse<OperationalCase>> {
    const effectiveIssueType = payload.issueType || payload.category || "General";
    const effectiveImpact = payload.currentOperationalStatus || (payload.operationalImpact as OperationalImpactStatus) || "RESTRICTED";

    try {
      const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          issueType: effectiveIssueType,
          currentOperationalStatus: effectiveImpact,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.case) {
          const normalized = normalizeCase(data.case);
          const existing = getLocalCases();
          saveLocalCases([normalized, ...existing.filter((c) => c.id !== normalized.id)]);
          window.dispatchEvent(new Event("raildrishti_case_updated"));
          return { success: true, data: normalized, case: normalized };
        }
      }
    } catch {
      // Backend unavailable; use local fallback
    }

    // Local generation fallback
    const existing = getLocalCases();
    const prefix = payload.caseType === "INCIDENT" ? "INC-2026-" : "RD-2026-";
    const nextSeq = existing.length + 142;
    const caseId = `${prefix}${String(nextSeq).padStart(5, "0")}`;
    const now = new Date().toISOString();

    const newCase = normalizeCase({
      id: caseId,
      case_type: payload.caseType,
      title: `${effectiveIssueType} Issue: ${payload.description.slice(0, 48).trim()}...`,
      issue_type: effectiveIssueType,
      severity: payload.severity,
      location: payload.location,
      description: payload.description,
      current_operational_status: effectiveImpact,
      status: "SUBMITTED",
      reporter_id: payload.reporterId,
      reporter_name: payload.reporterName || "Railway Employee",
      reporter_role: payload.reporterRole || "Employee",
      department: payload.department || "Operations & Traffic Control",
      assigned_department: "Operations & Traffic Control",
      image_url: payload.imageUrl,
      image_file_name: payload.imageFileName,
      created_at: now,
      updated_at: now,
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          case_id: caseId,
          actor_id: payload.reporterId,
          actor_name: payload.reporterName || "Railway Employee",
          actor_role: payload.reporterRole || "Employee",
          action: "Case Created & Logged",
          from_status: "NONE",
          to_status: "SUBMITTED",
          notes: payload.description,
          created_at: now,
        },
      ],
      comments: [],
    });

    saveLocalCases([newCase, ...existing]);
    window.dispatchEvent(new Event("raildrishti_case_updated"));
    return { success: true, data: newCase, case: newCase };
  },

  /**
   * Fetch cases with optional filtering
   */
  async getCases(filters: {
    role?: string;
    employeeId?: string;
    status?: string;
    caseType?: string;
    severity?: string;
    issueType?: string;
    department?: string;
  } = {}): Promise<CaseServiceResponse<OperationalCase[]>> {
    try {
      const params = new URLSearchParams();
      if (filters.role) params.set("role", filters.role);
      if (filters.employeeId) params.set("employeeId", filters.employeeId);
      if (filters.status) params.set("status", filters.status);
      if (filters.caseType) params.set("caseType", filters.caseType);
      if (filters.severity) params.set("severity", filters.severity);
      if (filters.issueType) params.set("issueType", filters.issueType);
      if (filters.department) params.set("department", filters.department);

      const res = await fetch(`${API_BASE_URL}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.cases)) {
          const normalized = data.cases.map(normalizeCase);
          saveLocalCases(normalized);
          return { success: true, data: normalized };
        }
      }
    } catch {
      // Backend unavailable; filter local storage
    }

    let list = getLocalCases();
    if (filters.role === "employee" && filters.employeeId) {
      list = list.filter((c) => !c.reporter_id || c.reporter_id === filters.employeeId);
    }
    if (filters.status && filters.status !== "ALL") {
      list = list.filter((c) => c.status === filters.status);
    }
    if (filters.caseType && filters.caseType !== "ALL") {
      list = list.filter((c) => c.case_type === filters.caseType);
    }
    if (filters.severity && filters.severity !== "ALL") {
      list = list.filter((c) => c.severity === filters.severity);
    }
    return { success: true, data: list };
  },

  /**
   * Fetch single case with audit trail and comments
   */
  async getCaseById(id: string): Promise<CaseServiceResponse<OperationalCase>> {
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.case) {
          const normalized = normalizeCase(data.case);
          return { success: true, data: normalized, case: normalized };
        }
      }
    } catch {
      // Local fallback
    }

    const localList = getLocalCases();
    const found = localList.find((c) => c.id === id);
    if (found) {
      return { success: true, data: found, case: found };
    }
    return { success: false, error: `Case ${id} not found.` };
  },

  /**
   * Controller Acknowledges case
   */
  async acknowledgeCase(
    id: string,
    actorData: ActorInfo | { actorId?: string; actorName?: string; actorRole?: string; notes?: string }
  ): Promise<CaseServiceResponse<OperationalCase>> {
    const actor: ActorInfo = {
      id: "actorId" in actorData ? actorData.actorId : (actorData as ActorInfo).id,
      name: "actorName" in actorData ? actorData.actorName || "Controller" : (actorData as ActorInfo).name,
      role: "actorRole" in actorData ? actorData.actorRole || "controller" : (actorData as ActorInfo).role,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/${id}/acknowledge`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actor }),
      });
      if (res.ok) {
        const data = await res.json();
        window.dispatchEvent(new Event("raildrishti_case_updated"));
        if (data.case) {
          return { success: true, data: normalizeCase(data.case) };
        }
      }
    } catch {}

    const cases = getLocalCases();
    const target = cases.find((c) => c.id === id);
    if (target) {
      target.status = "ACKNOWLEDGED";
      target.controller_id = actor.id || "CTRL-SBC-01";
      target.controller_name = actor.name;
      target.updated_at = new Date().toISOString();
      target.auditLogs = target.auditLogs || [];
      target.auditLogs.unshift(
        normalizeAuditLog({
          id: `log_${Date.now()}`,
          case_id: id,
          actor_name: actor.name,
          actor_role: actor.role,
          action: "Case Acknowledged",
          from_status: "SUBMITTED",
          to_status: "ACKNOWLEDGED",
          notes: "Acknowledged by Section Controller.",
          created_at: new Date().toISOString(),
        })
      );
      saveLocalCases(cases);
      window.dispatchEvent(new Event("raildrishti_case_updated"));
      return { success: true, data: target };
    }
    return { success: false, error: "Case not found." };
  },

  /**
   * Controller reviews operational impact
   */
  async reviewCase(
    id: string,
    payload: {
      actorId?: string;
      actorName?: string;
      actorRole?: string;
      operationalImpact?: string;
      notes?: string;
    }
  ): Promise<CaseServiceResponse<OperationalCase>> {
    const actor: ActorInfo = {
      id: payload.actorId,
      name: payload.actorName || "Controller",
      role: payload.actorRole || "controller",
    };

    try {
      const res = await fetch(`${API_BASE_URL}/${id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actor, notes: payload.notes }),
      });
      if (res.ok) {
        const data = await res.json();
        window.dispatchEvent(new Event("raildrishti_case_updated"));
        if (data.case) {
          return { success: true, data: normalizeCase(data.case) };
        }
      }
    } catch {}

    const cases = getLocalCases();
    const target = cases.find((c) => c.id === id);
    if (target) {
      target.status = "UNDER_REVIEW";
      target.controller_operational_notes = payload.notes;
      if (payload.operationalImpact) {
        target.current_operational_status = payload.operationalImpact as OperationalImpactStatus;
        target.operationalImpact = payload.operationalImpact;
      }
      target.updated_at = new Date().toISOString();
      target.auditLogs = target.auditLogs || [];
      target.auditLogs.unshift(
        normalizeAuditLog({
          id: `log_${Date.now()}`,
          case_id: id,
          actor_name: actor.name,
          actor_role: actor.role,
          action: "Operational Impact Assessed",
          from_status: target.status,
          to_status: "UNDER_REVIEW",
          notes: payload.notes || "Impact triaged by controller",
          created_at: new Date().toISOString(),
        })
      );
      saveLocalCases(cases);
      window.dispatchEvent(new Event("raildrishti_case_updated"));
      return { success: true, data: target };
    }
    return { success: false, error: "Case not found." };
  },

  /**
   * Assign Case to Department / Staff
   */
  async assignCase(
    id: string,
    payload: {
      actorId?: string;
      actorName?: string;
      actorRole?: string;
      department: string;
      assignedTeam?: string;
      notes?: string;
      severity?: CaseSeverity;
    }
  ): Promise<CaseServiceResponse<OperationalCase>> {
    const actor: ActorInfo = {
      id: payload.actorId,
      name: payload.actorName || "Controller",
      role: payload.actorRole || "controller",
    };

    try {
      const res = await fetch(`${API_BASE_URL}/${id}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actor,
          assignedDepartment: payload.department,
          assignedPerson: payload.assignedTeam,
          notes: payload.notes,
          severity: payload.severity,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        window.dispatchEvent(new Event("raildrishti_case_updated"));
        if (data.case) {
          return { success: true, data: normalizeCase(data.case) };
        }
      }
    } catch {}

    const cases = getLocalCases();
    const target = cases.find((c) => c.id === id);
    if (target) {
      target.status = "ASSIGNED";
      target.assigned_department = payload.department;
      target.assignedDepartment = payload.department;
      target.department = payload.department;
      target.assigned_person = payload.assignedTeam || payload.department;
      target.assignedTeam = payload.assignedTeam || payload.department;
      if (payload.severity) target.severity = payload.severity;
      target.updated_at = new Date().toISOString();
      target.auditLogs = target.auditLogs || [];
      target.auditLogs.unshift(
        normalizeAuditLog({
          id: `log_${Date.now()}`,
          case_id: id,
          actor_name: actor.name,
          actor_role: actor.role,
          action: `Assigned to ${payload.department}`,
          from_status: target.status,
          to_status: "ASSIGNED",
          notes: payload.notes || `Dispatched to ${payload.assignedTeam || payload.department}`,
          created_at: new Date().toISOString(),
        })
      );
      saveLocalCases(cases);
      window.dispatchEvent(new Event("raildrishti_case_updated"));
      return { success: true, data: target };
    }
    return { success: false, error: "Case not found." };
  },

  /**
   * Update Case Status (IN_PROGRESS, RESOLVED, ESCALATED, REJECTED)
   */
  async updateCaseStatus(
    id: string,
    payload: {
      actorId?: string;
      actorName?: string;
      actorRole?: string;
      status: CaseStatus;
      notes?: string;
      remarks?: string;
    }
  ): Promise<CaseServiceResponse<OperationalCase>> {
    const actor: ActorInfo = {
      id: payload.actorId,
      name: payload.actorName || "Field Crew",
      role: payload.actorRole || "employee",
    };
    const remarks = payload.notes || payload.remarks || `Advanced to ${payload.status}`;

    try {
      const res = await fetch(`${API_BASE_URL}/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actor, status: payload.status, remarks }),
      });
      if (res.ok) {
        const data = await res.json();
        window.dispatchEvent(new Event("raildrishti_case_updated"));
        if (data.case) {
          return { success: true, data: normalizeCase(data.case) };
        }
      }
    } catch {}

    const cases = getLocalCases();
    const target = cases.find((c) => c.id === id);
    if (target) {
      const oldStatus = target.status;
      target.status = payload.status;
      if (payload.status === "RESOLVED") {
        target.resolution_details = remarks;
      }
      target.updated_at = new Date().toISOString();
      target.auditLogs = target.auditLogs || [];
      target.auditLogs.unshift(
        normalizeAuditLog({
          id: `log_${Date.now()}`,
          case_id: id,
          actor_name: actor.name,
          actor_role: actor.role,
          action: `Status updated to ${payload.status}`,
          from_status: oldStatus,
          to_status: payload.status,
          notes: remarks,
          created_at: new Date().toISOString(),
        })
      );
      saveLocalCases(cases);
      window.dispatchEvent(new Event("raildrishti_case_updated"));
      return { success: true, data: target };
    }
    return { success: false, error: "Case not found." };
  },

  /**
   * Controller verifies resolution and closes case
   */
  async verifyCase(
    id: string,
    payload: {
      actorId?: string;
      actorName?: string;
      actorRole?: string;
      resolutionVerified?: boolean;
      notes?: string;
    }
  ): Promise<CaseServiceResponse<OperationalCase>> {
    const actor: ActorInfo = {
      id: payload.actorId,
      name: payload.actorName || "Section Controller",
      role: payload.actorRole || "controller",
    };

    try {
      const res = await fetch(`${API_BASE_URL}/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actor, notes: payload.notes }),
      });
      if (res.ok) {
        const data = await res.json();
        window.dispatchEvent(new Event("raildrishti_case_updated"));
        if (data.case) {
          return { success: true, data: normalizeCase(data.case) };
        }
      }
    } catch {}

    const cases = getLocalCases();
    const target = cases.find((c) => c.id === id);
    if (target) {
      target.status = "CLOSED";
      target.verified_by = actor.name;
      target.resolutionVerified = true;
      target.current_operational_status = "OPERATIONAL";
      target.operationalImpact = "OPERATIONAL";
      target.updated_at = new Date().toISOString();
      target.auditLogs = target.auditLogs || [];
      target.auditLogs.unshift(
        normalizeAuditLog({
          id: `log_${Date.now()}`,
          case_id: id,
          actor_name: actor.name,
          actor_role: actor.role,
          action: "Resolution Verified & Case Closed",
          from_status: "RESOLVED",
          to_status: "CLOSED",
          notes: payload.notes || "Operational verification complete.",
          created_at: new Date().toISOString(),
        })
      );
      saveLocalCases(cases);
      window.dispatchEvent(new Event("raildrishti_case_updated"));
      return { success: true, data: target };
    }
    return { success: false, error: "Case not found." };
  },

  /**
   * Add Note / Directive Comment to Case
   */
  async addComment(
    id: string,
    payload: {
      authorId?: string;
      authorName: string;
      authorRole: string;
      comment: string;
      commentType?: "NOTE" | "OPERATIONAL" | "ADMIN" | "RESOLUTION";
    }
  ): Promise<CaseServiceResponse<CaseComment>> {
    const commentType = payload.commentType || "NOTE";

    try {
      const res = await fetch(`${API_BASE_URL}/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, commentType }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.comment) {
          window.dispatchEvent(new Event("raildrishti_case_updated"));
          return { success: true, data: normalizeComment(data.comment) };
        }
      }
    } catch {}

    const cases = getLocalCases();
    const target = cases.find((c) => c.id === id);
    if (target) {
      const newComm = normalizeComment({
        id: `comm_${Date.now()}`,
        case_id: id,
        author_id: payload.authorId,
        author_name: payload.authorName,
        author_role: payload.authorRole,
        comment_type: commentType,
        comment: payload.comment,
        created_at: new Date().toISOString(),
      });
      target.comments = target.comments || [];
      target.comments.push(newComm);
      target.updated_at = new Date().toISOString();
      saveLocalCases(cases);
      window.dispatchEvent(new Event("raildrishti_case_updated"));
      return { success: true, data: newComm };
    }
    return { success: false, error: "Case not found." };
  },

  /**
   * Get Notifications for Employee, Controller, or Admin
   */
  async getNotifications(query: {
    role?: string;
    employeeId?: string;
  } = {}): Promise<CaseServiceResponse<CaseNotification[]>> {
    try {
      const params = new URLSearchParams();
      if (query.role) params.set("role", query.role);
      if (query.employeeId) params.set("employeeId", query.employeeId);

      const res = await fetch(`${API_BASE_URL}/notifications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          return { success: true, data: data.notifications.map(normalizeNotification) };
        }
      }
    } catch {}

    // Local fallback generator from cases
    const cases = getLocalCases();
    const notifs: CaseNotification[] = [];

    cases.forEach((c) => {
      if (query.role === "employee" && (!query.employeeId || c.reporter_id === query.employeeId)) {
        notifs.push(
          normalizeNotification({
            id: `notif_${c.id}_submit`,
            case_id: c.id,
            recipient_role: "employee",
            recipient_id: c.reporter_id,
            title: `Report Logged: ${c.id}`,
            message: `Your ${c.issue_type} issue is ${c.status}. Location: ${c.location}.`,
            category: c.case_type === "INCIDENT" ? "Incidents" : "Issues",
            priority: c.severity === "CRITICAL" ? "Critical" : "High",
            is_read: 0,
            created_at: c.created_at,
          })
        );

        if (c.status === "ASSIGNED" || c.status === "IN_PROGRESS") {
          notifs.push(
            normalizeNotification({
              id: `notif_${c.id}_assign`,
              case_id: c.id,
              recipient_role: "employee",
              recipient_id: c.reporter_id,
              title: `Issue Assigned: ${c.id}`,
              message: `Dispatched to ${c.assigned_department || 'Responsible Gang'} for repair.`,
              category: "Issues",
              priority: "Medium",
              is_read: 0,
              created_at: c.updated_at,
            })
          );
        }

        if (c.status === "RESOLVED" || c.status === "CLOSED") {
          notifs.push(
            normalizeNotification({
              id: `notif_${c.id}_resolved`,
              case_id: c.id,
              recipient_role: "employee",
              recipient_id: c.reporter_id,
              title: `Issue ${c.status}: ${c.id}`,
              message: c.resolution_details || `Remediation completed and verified by Controller.`,
              category: "Issues",
              priority: "High",
              is_read: 0,
              created_at: c.updated_at,
            })
          );
        }
      } else if (query.role === "controller" || query.role === "admin") {
        notifs.push(
          normalizeNotification({
            id: `notif_${c.id}_triage`,
            case_id: c.id,
            recipient_role: query.role as any,
            title: `${c.case_type}: ${c.id} (${c.severity})`,
            message: `${c.reporter_name} reported ${c.issue_type} at ${c.location}. Status: ${c.status}.`,
            category: c.case_type === "INCIDENT" ? "Incidents" : "Issues",
            priority: c.severity === "CRITICAL" ? "Critical" : "High",
            is_read: 0,
            created_at: c.created_at,
          })
        );
      }
    });

    const sorted = notifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return { success: true, data: sorted };
  },

  /**
   * Mark single notification as read
   */
  async markNotificationRead(id: string): Promise<CaseServiceResponse<boolean>> {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: "PATCH",
      });
      if (res.ok) {
        return { success: true, data: true };
      }
    } catch {}
    return { success: true, data: true };
  },

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead(payload: {
    role?: string;
    employeeId?: string;
  } = {}): Promise<CaseServiceResponse<boolean>> {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return { success: true, data: true };
      }
    } catch {}
    return { success: true, data: true };
  },
};

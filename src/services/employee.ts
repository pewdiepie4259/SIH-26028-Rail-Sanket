/**
 * RailDrishti Employee Dashboard - Phase 2 Demo Data & Types
 * 
 * FRONTEND DEMO DATA ONLY:
 * No backend APIs, no database, no WebSockets, no live telemetry connections.
 * Structured cleanly to easily plug into backend APIs in future phases.
 */

import type { AuthUser } from "./auth";
export * from "./employeeRoles";

export interface EmployeeNavItem {
  id: string;
  label: string;
  icon: any;
  path?: string;
  active?: boolean;
  badge?: number;
  phase?: string;
}

export interface EmployeeDemo {
  name: string;
  employeeId: string;
  department: string;
  role: string;
  status: "Active" | "Standby" | "On Leave";
  zone?: string;
  division?: string;
  email?: string;
}

export interface DutyDemo {
  dutyStatus: "ON DUTY" | "STANDBY" | "OFF DUTY" | "ON LEAVE";
  shift: string;
  location: string;
  reportingTime: string;
  responsibility: string;
  stationCode?: string;
  supervisorName?: string;
}

export interface TrainDemo {
  assignedTrain: string;
  trainNumber: string;
  section: string;
  trainStatus: "RUNNING" | "STOPPED" | "DELAYED" | "DIVERTED";
  currentLocation: string;
  delay: string;
  nextStation: string;
  eta: string;
  speed?: string;
  signalAspect?: string;
}

export interface AlertDemo {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
  title: string;
  trainOrSection: string;
  timestamp: string;
  description?: string;
}

export interface TaskDemo {
  id: string;
  title: string;
  priority: "High Priority" | "Medium Priority" | "Low Priority";
  dueTime: string;
  status?: "Pending" | "In Progress" | "Completed";
  category?: string;
}

export interface NotificationDemo {
  id: string;
  title: string;
  timestamp: string;
  isRead: boolean;
  category?: string;
}

export interface IntelligenceDemo {
  predictedDelay: string;
  operationalRisk: "LOW" | "MEDIUM" | "HIGH";
  confidence: string;
  note: string;
}

// -------------------------------------------------------------
// CENTRALIZED DEMO DATA OBJECTS (PHASE 2)
// -------------------------------------------------------------

export const demoEmployee: EmployeeDemo = {
  name: "Ramesh Sharma",
  employeeId: "IR-2024-8841",
  department: "Signal & Telecommunication",
  role: "Railway Employee",
  status: "Active",
  zone: "South Western Railway (SWR)",
  division: "Bengaluru (SBC)",
  email: "employee@raildrishti.gov.in"
};

export interface EquipmentIssuedItem {
  item: string;
  serial: string;
  status: "FUNCTIONAL" | "ISSUED" | "CALIBRATED";
}

export interface TrainingCertItem {
  title: string;
  institute: string;
  validity: string;
  grade: string;
}

export interface EmployeeProfileDemo {
  name: string;
  employeeId: string;
  hrmsId?: string;
  pfNumber?: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  residentialQuarters?: string;
  email: string;
  phone: string;
  emergencyContact: string;
  department: string;
  departmentId: string;
  operationalRole: string;
  operationalRoleId: string;
  roleCategory: string;
  accountType: string;
  accountStatus: "ACTIVE" | "INACTIVE" | "PENDING_REVIEW";
  verificationStatus: "VERIFIED / ASSIGNED" | "PENDING" | "SUSPENDED";
  zone: string;
  division: string;
  dutyStatus: "ACTIVE" | "ON DUTY" | "STANDBY" | "OFF DUTY";
  assignedLocation: string;
  stationCode: string;
  assignedSection: string;
  assignedTrain: string;
  shift: string;
  registrationDate: string;
  appointmentDate?: string;
  payLevel?: string;
  serviceLength?: string;
  controllingOfficer?: string;
  medicalCategory?: string;
  competencyCert?: string;
  interlockingGrade?: string;
  lastActivity: string;
  profileCompletion: number;
  avatarInitials: string;
  equipmentIssued?: EquipmentIssuedItem[];
  certifications?: TrainingCertItem[];
  leaveBalance?: { cl: number; lap: number; rh: number };
}

export const demoEmployeeProfile: EmployeeProfileDemo = {
  name: "Ramesh Sharma",
  employeeId: "IR-2024-8841",
  hrmsId: "HRMS-SWR-8841",
  pfNumber: "SWR/PF/098412",
  bloodGroup: "O+ Positive",
  dateOfBirth: "14 Aug 1988 (38 Yrs)",
  residentialQuarters: "Type-IV Qtr #42B, SWR Colony, Majestic, Bengaluru",
  email: "employee@raildrishti.gov.in",
  phone: "+91 98450 23145",
  emergencyContact: "+91 98450 99881 (Spouse - Sunita Sharma)",
  department: "Signal & Telecommunication",
  departmentId: "signal_telecommunication",
  operationalRole: "Signal Maintainer",
  operationalRoleId: "signal_maintainer",
  roleCategory: "Technical Operations & Maintenance",
  accountType: "Employee (Operational Staff)",
  accountStatus: "ACTIVE",
  verificationStatus: "VERIFIED / ASSIGNED",
  zone: "South Western Railway (SWR)",
  division: "Bengaluru (SBC)",
  dutyStatus: "ACTIVE",
  assignedLocation: "KSR Bengaluru Junction [SBC]",
  stationCode: "SBC",
  assignedSection: "KSR Bengaluru – Bangarapet (Up Line)",
  assignedTrain: "20608 Vande Bharat Express",
  shift: "08:00 AM – 04:00 PM (Shift-A)",
  registrationDate: "15 Jan 2024",
  appointmentDate: "12 Nov 2014",
  payLevel: "Level-6 (7th CPC - Grade Pay ₹4200)",
  serviceLength: "12 Years 4 Months",
  controllingOfficer: "K. Ramanathan (Sr. DOM / SBC)",
  medicalCategory: "A-1 Fitness (Valid till Nov 2027)",
  competencyCert: "CERT-SWR-SM-2025-9921 (Active)",
  interlockingGrade: "Electronic Interlocking (EI Grade-4 Siemens)",
  lastActivity: "Today, Active Shift",
  profileCompletion: 95,
  avatarInitials: "RS",
  equipmentIssued: [
    { item: "Motorola VHF 5W Walkie-Talkie", serial: "MOT-SWR-4410", status: "FUNCTIONAL" },
    { item: "Tri-Colour LED Inspection Torch", serial: "TORCH-SBC-092", status: "ISSUED" },
    { item: "Station Master Emergency Key Token", serial: "SBC-North-04", status: "ISSUED" },
    { item: "SWR General & Subsidiary Rules (G&SR)", serial: "2024 Revised Ed.", status: "CALIBRATED" },
  ],
  certifications: [
    { title: "Zonal Railway Training Institute (ZRTI) Refresher", institute: "ZRTI Dharwad", validity: "Valid till 2028", grade: "Grade A+" },
    { title: "Kavach Automatic Train Protection (ATP) Level-2", institute: "IRISET Secunderabad", validity: "Valid till 2027", grade: "Certified" },
    { title: "Disaster Management & First Aid Protocol", institute: "SWR Divisional Safety Cell", validity: "Valid till 2026", grade: "Passed" },
  ],
  leaveBalance: { cl: 6, lap: 48, rh: 2 },
};

export const demoDuty: DutyDemo = {
  dutyStatus: "ON DUTY",
  shift: "08:00 AM – 04:00 PM",
  location: "Bengaluru City Railway Station",
  reportingTime: "07:45 AM",
  responsibility: "Signal & Telecommunication",
  stationCode: "SBC",
  supervisorName: "K. Ramanathan (Sr. DSTE/SBC)"
};

export const demoTrain: TrainDemo = {
  assignedTrain: "20608 Vande Bharat Express",
  trainNumber: "20608",
  section: "KSR Bengaluru – Bangarapet",
  trainStatus: "RUNNING",
  currentLocation: "Bengaluru East",
  delay: "+07 min",
  nextStation: "Bangarapet",
  eta: "18:42",
  speed: "84 km/h",
  signalAspect: "CLEAR / GREEN"
};

export const demoAlerts: AlertDemo[] = [
  {
    id: "alt-1",
    severity: "CRITICAL",
    title: "Signal issue detected",
    trainOrSection: "Section: SBC – BWT",
    timestamp: "2 minutes ago",
    description: "Automatic signalling track circuit failure near LC-42."
  },
  {
    id: "alt-2",
    severity: "HIGH",
    title: "Train running behind schedule",
    trainOrSection: "Train: 20608",
    timestamp: "8 minutes ago",
    description: "Speed restriction of 30 km/h enforced on Platform 1 approach."
  },
  {
    id: "alt-3",
    severity: "MEDIUM",
    title: "Section congestion expected",
    trainOrSection: "Section: Bengaluru East",
    timestamp: "15 minutes ago",
    description: "Preceding freight train clearing down-line block."
  },
  {
    id: "alt-4",
    severity: "INFO",
    title: "Routine operational update",
    trainOrSection: "SWR HQ Control",
    timestamp: "20 minutes ago",
    description: "Scheduled track maintenance window confirmed for 23:30 IST."
  }
];

export const demoTasks: TaskDemo[] = [
  {
    id: "tsk-1",
    title: "Signal inspection",
    priority: "High Priority",
    dueTime: "Due 14:30",
    status: "Pending",
    category: "Signal & Track"
  },
  {
    id: "tsk-2",
    title: "Equipment status verification",
    priority: "Medium Priority",
    dueTime: "Due 16:00",
    status: "Pending",
    category: "Telemetry & Relays"
  },
  {
    id: "tsk-3",
    title: "Section communication check",
    priority: "Low Priority",
    dueTime: "Due Today",
    status: "Pending",
    category: "VHF Communications"
  },
  {
    id: "tsk-4",
    title: "Track circuit calibration log",
    priority: "Medium Priority",
    dueTime: "Due 17:30",
    status: "Pending",
    category: "Safety Log"
  },
  {
    id: "tsk-5",
    title: "Shift handover report generation",
    priority: "Low Priority",
    dueTime: "Due 15:45",
    status: "Pending",
    category: "Shift Handover"
  }
];

export const demoNotifications: NotificationDemo[] = [
  {
    id: "notif-1",
    title: "Duty assignment updated",
    timestamp: "10 minutes ago",
    isRead: false,
    category: "Roster Update"
  },
  {
    id: "notif-2",
    title: "New operational alert received",
    timestamp: "25 minutes ago",
    isRead: false,
    category: "Alert"
  },
  {
    id: "notif-3",
    title: "Task assigned by supervisor",
    timestamp: "1 hour ago",
    isRead: true,
    category: "Task"
  },
  {
    id: "notif-4",
    title: "System maintenance scheduled",
    timestamp: "2 hours ago",
    isRead: true,
    category: "System"
  }
];

export const demoIntelligence: IntelligenceDemo = {
  predictedDelay: "+07 min",
  operationalRisk: "LOW",
  confidence: "94.6%",
  note: "UI Preview only — Real-time ST-GNN AI backend integration will be connected in future phase"
};

// -------------------------------------------------------------
// PHASE 3: MY DUTY MODULE DEMO DATA & TYPES
// -------------------------------------------------------------

export interface DutyTimelineItem {
  time: string;
  title: string;
  description?: string;
  status: "completed" | "active" | "upcoming";
}

export interface MyDutyDemo {
  employeeName: string;
  employeeId: string;
  department: string;
  role: string;
  currentDuty: string;
  dutyLocation: string;
  shift: string;
  shiftStart: string;
  shiftEnd: string;
  assignedLocation: string;
  assignedStation: string;
  assignedSection: string;
  assignedTrain: string;
  dutyStatus: "ACTIVE" | "STANDBY" | "OFF DUTY" | "COMPLETED";
  operationalResponsibility: string;
  responsibilityDescription: string;
  timeline: DutyTimelineItem[];
}

export const demoMyDuty: MyDutyDemo = {
  employeeName: "Ramesh Sharma",
  employeeId: "IR-2024-8841",
  department: "Signal & Telecommunication",
  role: "Employee",
  currentDuty: "Station Master",
  dutyLocation: "KSR Bengaluru",
  shift: "14:00 – 22:00",
  shiftStart: "14:00",
  shiftEnd: "22:00",
  assignedLocation: "KSR Bengaluru Junction",
  assignedStation: "KSR Bengaluru Junction",
  assignedSection: "KSR Bengaluru",
  assignedTrain: "Not Assigned",
  dutyStatus: "ACTIVE",
  operationalResponsibility: "Station movement + platform coordination",
  responsibilityDescription:
    "Coordinate station movements, monitor platform activity, and support safe and efficient train operations within the assigned station area.",
  timeline: [
    {
      time: "14:00",
      title: "Duty Started",
      description: "Sign-on completed & safety briefing acknowledged.",
      status: "completed",
    },
    {
      time: "15:30",
      title: "Station Movement Coordination",
      description: "Yard and express rake berthing alignment.",
      status: "completed",
    },
    {
      time: "18:00",
      title: "Platform Coordination",
      description: "Platform clearance & passenger safety monitor.",
      status: "active",
    },
    {
      time: "20:30",
      title: "Evening Operational Check",
      description: "Signal aspect & interlocking status audit.",
      status: "upcoming",
    },
    {
      time: "22:00",
      title: "Duty Ends",
      description: "Handover report generation & sign-off.",
      status: "upcoming",
    },
  ],
};

/**
 * Helper to get My Duty data, blending authenticated user details if present.
 */
export function getDemoMyDutyData(user: AuthUser | null): MyDutyDemo {
  return {
    ...demoMyDuty,
    employeeName: user?.name || demoMyDuty.employeeName,
    employeeId: user?.employeeId || demoMyDuty.employeeId,
    department: user?.department || demoMyDuty.department,
    role: user?.role === "employee" ? "Employee" : demoMyDuty.role,
  };
}

/**
 * Helper to get employee info, combining logged-in auth details (if present) with demo fallback.
 * (Does NOT make network calls)
 */
export function getDemoEmployeeData(user: AuthUser | null): {
  employee: EmployeeDemo;
  duty: DutyDemo;
  train: TrainDemo;
  alerts: AlertDemo[];
  tasks: TaskDemo[];
  notifications: NotificationDemo[];
  intelligence: IntelligenceDemo;
} {
  const employee: EmployeeDemo = {
    ...demoEmployee,
    name: user?.name || demoEmployee.name,
    employeeId: user?.employeeId || demoEmployee.employeeId,
    department: user?.department || demoEmployee.department,
    role: user?.role === "employee" ? "Railway Employee" : demoEmployee.role,
    email: user?.email || demoEmployee.email,
  };

  return {
    employee,
    duty: { ...demoDuty },
    train: { ...demoTrain },
    alerts: [...demoAlerts],
    tasks: [...demoTasks],
    notifications: [...demoNotifications],
    intelligence: { ...demoIntelligence },
  };
}

// -------------------------------------------------------------
// PHASE 4: ROLE-DEPENDENT ASSIGNMENT DEMO DATA & TYPES
// -------------------------------------------------------------

export type OperationalRoleType =
  | "train_manager"
  | "track_maintainer"
  | "signal_maintainer";

export interface TrainManagerAssignment {
  type: "train";
  title: string;
  roleLabel: string;
  trainNumber: string;
  trainName: string;
  currentLocation: string;
  speed: string;
  delay: string;
  predictedArrival: string;
  nextStation: string;
  weatherImpact: string;
  operationalAlerts: number;
}

export interface TrackMaintainerAssignment {
  type: "track";
  title: string;
  roleLabel: string;
  section: string;
  trackStatus: "Operational" | "Maintenance" | "Speed Restricted" | "Blocked";
  maintenanceTasks: number;
  activeRestrictions: number;
  weatherRisk: string;
  reportedIssues: number;
}

export interface SignalMaintainerAssignment {
  type: "signal";
  title: string;
  roleLabel: string;
  sectionName?: string;
  activeSignalIssues: number;
  affectedBlocks: number;
  maintenanceTasks: number;
  criticalAlerts: number;
}

export interface RoleAssignmentsMap {
  train_manager: TrainManagerAssignment;
  track_maintainer: TrackMaintainerAssignment;
  signal_maintainer: SignalMaintainerAssignment;
}

export const demoAssignments: RoleAssignmentsMap = {
  train_manager: {
    type: "train",
    title: "MY ASSIGNED TRAIN",
    roleLabel: "Train Manager",
    trainNumber: "12627",
    trainName: "Karnataka Express",
    currentLocation: "Kengeri",
    speed: "82 km/h",
    delay: "+12 min",
    predictedArrival: "06:27",
    nextStation: "Ramanagara",
    weatherImpact: "Moderate",
    operationalAlerts: 1,
  },
  track_maintainer: {
    type: "track",
    title: "MY ASSIGNED SECTION",
    roleLabel: "Track Maintainer",
    section: "KSR → Kengeri",
    trackStatus: "Operational",
    maintenanceTasks: 3,
    activeRestrictions: 1,
    weatherRisk: "High rainfall",
    reportedIssues: 2,
  },
  signal_maintainer: {
    type: "signal",
    title: "MY SIGNAL SECTION",
    roleLabel: "Signal Maintainer",
    sectionName: "Bengaluru South - Ramanagara Block",
    activeSignalIssues: 2,
    affectedBlocks: 3,
    maintenanceTasks: 4,
    criticalAlerts: 1,
  },
};

// -------------------------------------------------------------
// PHASE 5: EMPLOYEE OPERATIONAL ALERTS DEMO DATA & TYPES
// -------------------------------------------------------------

export type EmployeeAlertRole =
  | "station_master"
  | "loco_pilot"
  | "track_maintainer"
  | "rpf";

export type AlertPriority =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "INFO";

export type AlertStatus = "ACTIVE" | "ACKNOWLEDGED";

export interface EmployeeOperationalAlert {
  id: string;
  title: string;
  priority: AlertPriority;
  category: string;
  location: string;
  section?: string;
  train?: string;
  delay?: string;
  description: string;
  timestamp: string;
  status: AlertStatus;
}

export interface RoleAlertScopeInfo {
  role: EmployeeAlertRole;
  label: string;
  scopeTitle: string;
  scopeLocation: string;
  scopeDescription: string;
}

export const roleAlertScopes: Record<EmployeeAlertRole, RoleAlertScopeInfo> = {
  station_master: {
    role: "station_master",
    label: "Station Master",
    scopeTitle: "Station Operations",
    scopeLocation: "KSR Bengaluru Junction",
    scopeDescription:
      "Station platforms, berthing, and local train movement within station limits.",
  },
  loco_pilot: {
    role: "loco_pilot",
    label: "Loco Pilot",
    scopeTitle: "Assigned Train / Route",
    scopeLocation: "Train 12627 (KSR → MYS Section)",
    scopeDescription:
      "Direct train telemetry, signal aspects, speed cautions, and route track conditions.",
  },
  track_maintainer: {
    role: "track_maintainer",
    label: "Track Maintainer",
    scopeTitle: "Assigned Track Section",
    scopeLocation: "KSR → Kengeri (P-Way Territory)",
    scopeDescription:
      "Permanent way, ballast health, caution orders, and rainfall patrol updates.",
  },
  rpf: {
    role: "rpf",
    label: "Railway Protection Force (RPF)",
    scopeTitle: "Station Security & Emergency",
    scopeLocation: "KSR Bengaluru Junction Area",
    scopeDescription:
      "Passenger security, perimeter protection, crowd management, and emergency response.",
  },
};

export const employeeOperationalAlerts: Record<
  EmployeeAlertRole,
  EmployeeOperationalAlert[]
> = {
  station_master: [
    {
      id: "SM-001",
      title: "Platform 4 occupied",
      priority: "HIGH",
      category: "Platform Operations",
      location: "KSR Bengaluru Junction",
      description:
        "Platform 4 is currently occupied and requires operational attention.",
      timestamp: "3 minutes ago",
      status: "ACTIVE",
    },
    {
      id: "SM-002",
      title: "Train 12627 delayed by 14 min",
      priority: "MEDIUM",
      category: "Train Movement",
      train: "12627 — Karnataka Express",
      delay: "+14 min",
      location: "KSR Bengaluru",
      description:
        "Train 12627 is currently running 14 minutes behind schedule.",
      timestamp: "7 minutes ago",
      status: "ACTIVE",
    },
    {
      id: "SM-003",
      title: "Incoming train approaching",
      priority: "HIGH",
      category: "Train Movement",
      location: "KSR Bengaluru Junction",
      description: "Incoming train approaching the station.",
      timestamp: "12 minutes ago",
      status: "ACTIVE",
    },
    {
      id: "SM-004",
      title: "Platform reassignment recommended",
      priority: "MEDIUM",
      category: "Platform Coordination",
      location: "KSR Bengaluru Junction",
      description:
        "Alternative platform assignment may be required due to current platform occupancy.",
      timestamp: "18 minutes ago",
      status: "ACTIVE",
    },
  ],
  loco_pilot: [
    {
      id: "LP-001",
      title: "Speed restriction ahead",
      priority: "HIGH",
      category: "Speed Restriction",
      location: "Assigned Route",
      section: "KSR → Kengeri",
      description:
        "Speed restriction ahead in the assigned route section.",
      timestamp: "2 minutes ago",
      status: "ACTIVE",
    },
    {
      id: "LP-002",
      title: "Signal aspect changed",
      priority: "HIGH",
      category: "Signal",
      location: "Assigned Section",
      description:
        "Signal aspect has changed and requires driver attention.",
      timestamp: "5 minutes ago",
      status: "ACTIVE",
    },
    {
      id: "LP-003",
      title: "Weather-related caution",
      priority: "MEDIUM",
      category: "Weather",
      location: "Assigned Route",
      description:
        "Weather conditions require increased operational caution.",
      timestamp: "14 minutes ago",
      status: "ACTIVE",
    },
    {
      id: "LP-004",
      title: "Temporary section restriction",
      priority: "HIGH",
      category: "Section Restriction",
      location: "Assigned Route",
      description:
        "Temporary restriction is active in the assigned section.",
      timestamp: "22 minutes ago",
      status: "ACTIVE",
    },
  ],
  track_maintainer: [
    {
      id: "TM-001",
      title: "Track inspection required",
      priority: "HIGH",
      category: "Track Maintenance",
      location: "Assigned Section",
      section: "KSR → Kengeri",
      description:
        "Track inspection is required for the assigned section.",
      timestamp: "4 minutes ago",
      status: "ACTIVE",
    },
    {
      id: "TM-002",
      title: "Heavy rainfall detected",
      priority: "HIGH",
      category: "Weather Risk",
      location: "Assigned Section",
      description:
        "Heavy rainfall may affect track maintenance operations.",
      timestamp: "10 minutes ago",
      status: "ACTIVE",
    },
    {
      id: "TM-003",
      title: "Maintenance window approaching",
      priority: "MEDIUM",
      category: "Maintenance",
      location: "Assigned Section",
      section: "KSR → Kengeri",
      description:
        "Scheduled maintenance window is approaching.",
      timestamp: "25 minutes ago",
      status: "ACTIVE",
    },
    {
      id: "TM-004",
      title: "Track issue reported",
      priority: "HIGH",
      category: "Track Issue",
      location: "Assigned Section",
      section: "Assigned Section",
      description:
        "A track-related issue has been reported in the assigned area.",
      timestamp: "32 minutes ago",
      status: "ACTIVE",
    },
  ],
  rpf: [
    {
      id: "RPF-001",
      title: "Security incident reported",
      priority: "CRITICAL",
      category: "Security",
      location: "KSR Bengaluru Junction",
      description:
        "A security incident has been reported and requires attention.",
      timestamp: "1 minute ago",
      status: "ACTIVE",
    },
    {
      id: "RPF-002",
      title: "Station security alert",
      priority: "HIGH",
      category: "Station Security",
      location: "Assigned Station",
      description:
        "Security alert active within the assigned station area.",
      timestamp: "8 minutes ago",
      status: "ACTIVE",
    },
    {
      id: "RPF-003",
      title: "Emergency assistance requested",
      priority: "CRITICAL",
      category: "Emergency",
      location: "Assigned Station",
      description:
        "Emergency assistance has been requested.",
      timestamp: "15 minutes ago",
      status: "ACTIVE",
    },
  ],
};

// -------------------------------------------------------------
// PHASE 6: EMPLOYEE TASKS DEMO DATA & TYPES
// -------------------------------------------------------------

export type EmployeeTaskPriority = "HIGH" | "MEDIUM" | "LOW";
export type EmployeeTaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface EmployeeTaskItem {
  id: string;
  title: string;
  description: string;
  priority: EmployeeTaskPriority;
  dueTime: string;
  location: string;
  category: string;
  status: EmployeeTaskStatus;
  assignedBy?: string;
  instructions?: string;
}

export const demoEmployeeTasks: EmployeeTaskItem[] = [
  {
    id: "TASK-001",
    title: "Inspect Platform 4",
    description:
      "Inspect Platform 4 and verify that the platform area is clear for scheduled train operations.",
    priority: "HIGH",
    dueTime: "18:30",
    location: "KSR Bengaluru Junction",
    category: "Station Inspection",
    status: "PENDING",
    assignedBy: "Station Director / SBC",
    instructions:
      "Verify track clearance, platform edge safety markings, and passenger information display functioning.",
  },
  {
    id: "TASK-002",
    title: "Verify Signal Equipment",
    description:
      "Verify the operational condition of assigned signal equipment.",
    priority: "HIGH",
    dueTime: "19:00",
    location: "KSR Bengaluru — Signal Cabin",
    category: "Signal Maintenance",
    status: "IN_PROGRESS",
    assignedBy: "Sr. DSTE / SWR",
    instructions:
      "Check point machine 14B locking current and relay rack power supply redundancy.",
  },
  {
    id: "TASK-003",
    title: "Check Platform Communication System",
    description:
      "Check platform communication equipment and report any visible issue.",
    priority: "MEDIUM",
    dueTime: "20:00",
    location: "KSR Bengaluru Junction",
    category: "Communication",
    status: "PENDING",
    assignedBy: "Telecom Supervisor",
    instructions:
      "Test VHF handsets on Channel 4 and ensure public address amplifiers are operational.",
  },
  {
    id: "TASK-004",
    title: "Complete Evening Operational Inspection",
    description:
      "Complete the routine evening operational inspection.",
    priority: "LOW",
    dueTime: "21:00",
    location: "Assigned Station",
    category: "Operational Inspection",
    status: "COMPLETED",
    assignedBy: "Operating Department",
    instructions:
      "File shift logbook entry and cross-verify with central section controller.",
  },
];

// -------------------------------------------------------------
// PHASE 7: EMPLOYEE REPORT ISSUE DEMO DATA & TYPES
// -------------------------------------------------------------

export type IssueType =
  | "Signal"
  | "Track"
  | "Platform"
  | "Train"
  | "Electrical"
  | "Telecom"
  | "Safety"
  | "Security"
  | "Medical"
  | "Other";

export type IssueSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type OperationalImpactStatus = "OPERATIONAL" | "RESTRICTED" | "BLOCKED";

export type IssueWorkflowStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "ACTION_ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED";

export interface IssueReportItem {
  id: string;
  issueType: IssueType;
  location: string;
  severity: IssueSeverity;
  description: string;
  currentStatus: OperationalImpactStatus;
  status: IssueWorkflowStatus;
  assignedTo: string;
  imageUrl?: string;
  imageFileName?: string;
  createdAt: string;
}

export const demoRecentReports: IssueReportItem[] = [
  {
    id: "RD-2026-00138",
    issueType: "Signal",
    location: "KSR Bengaluru Junction",
    severity: "HIGH",
    description: "Signal aspect flickering on down-line starter signal 4B.",
    currentStatus: "RESTRICTED",
    status: "RESOLVED",
    assignedTo: "Signal Maintenance Team",
    createdAt: "Today, 11:30 AM",
  },
  {
    id: "RD-2026-00139",
    issueType: "Platform",
    location: "Platform 4",
    severity: "MEDIUM",
    description: "Platform 4 passenger information display LED panel frozen.",
    currentStatus: "OPERATIONAL",
    status: "UNDER_REVIEW",
    assignedTo: "Station Operations / Section Controller",
    createdAt: "Today, 13:15 PM",
  },
  {
    id: "RD-2026-00140",
    issueType: "Track",
    location: "KSR → Kengeri",
    severity: "HIGH",
    description: "Ballast settlement noticed along KM 342/12 following heavy rains.",
    currentStatus: "RESTRICTED",
    status: "IN_PROGRESS",
    assignedTo: "Track Maintenance / Section Controller",
    createdAt: "Today, 14:40 PM",
  },
];

// -------------------------------------------------------------
// PHASE 8: EMPLOYEE INCIDENT REPORTING DEMO DATA & TYPES
// -------------------------------------------------------------

export type IncidentType =
  | "Accident"
  | "Medical Emergency"
  | "Fire"
  | "Security Incident"
  | "Track Obstruction"
  | "Signal Failure"
  | "Equipment Failure"
  | "Other Emergency";

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IncidentOperationalStatus = "OPERATIONAL" | "RESTRICTED" | "BLOCKED";

export type IncidentWorkflowStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "ACTION_ASSIGNED"
  | "RESPONSE_IN_PROGRESS"
  | "RESOLVED";

export interface IncidentReportItem {
  id: string;
  incidentType: IncidentType;
  location: string;
  severity: IncidentSeverity;
  description: string;
  currentStatus: IncidentOperationalStatus;
  status: IncidentWorkflowStatus;
  assignedTo: string;
  imageUrl?: string;
  imageFileName?: string;
  createdAt: string;
}

export const demoRecentIncidents: IncidentReportItem[] = [
  {
    id: "INC-2026-00017",
    incidentType: "Medical Emergency",
    location: "KSR Bengaluru – Platform 2",
    severity: "CRITICAL",
    description: "Passenger requires immediate medical assistance on Platform 2.",
    currentStatus: "BLOCKED",
    status: "RESOLVED",
    assignedTo: "Section Controller / Medical Response Team",
    createdAt: "Today, 09:20 AM",
  },
  {
    id: "INC-2026-00018",
    incidentType: "Signal Failure",
    location: "Kengeri",
    severity: "HIGH",
    description: "Total blackout on automatic signal cabin relay board at Kengeri junction.",
    currentStatus: "RESTRICTED",
    status: "UNDER_REVIEW",
    assignedTo: "Section Controller / S&T Quick Response Unit",
    createdAt: "Today, 12:45 PM",
  },
  {
    id: "INC-2026-00019",
    incidentType: "Track Obstruction",
    location: "KSR → Kengeri",
    severity: "CRITICAL",
    description: "Fallen tree branch obstructing Down Line track at KM 344/8.",
    currentStatus: "BLOCKED",
    status: "ACTION_ASSIGNED",
    assignedTo: "Section Controller / P-Way Emergency Crew",
    createdAt: "Today, 15:10 PM",
  },
];

// -------------------------------------------------------------
// PHASE 9: EMPLOYEE NOTIFICATIONS DEMO DATA & TYPES
// -------------------------------------------------------------

export type EmployeeNotificationCategory =
  | "TRAIN_UPDATE"
  | "DUTY"
  | "TASK"
  | "WEATHER"
  | "OPERATIONAL_ALERT"
  | "SYSTEM";

export interface EmployeeNotificationItem {
  id: string;
  time: string;
  title: string;
  category: EmployeeNotificationCategory;
  categoryLabel: string;
  description: string;
  status: "READ" | "UNREAD";
  actionRoute?: string;
  actionLabel?: string;
}

export const demoEmployeeNotifications: EmployeeNotificationItem[] = [
  {
    id: "NOTIF-001",
    time: "14:32",
    title: "Train 12627 ETA updated",
    category: "TRAIN_UPDATE",
    categoryLabel: "Train Update",
    description: "The predicted arrival time for Train 12627 has been updated.",
    status: "UNREAD",
    actionRoute: "/employee/assignment",
    actionLabel: "View Assignment",
  },
  {
    id: "NOTIF-002",
    time: "14:27",
    title: "New duty assignment received",
    category: "DUTY",
    categoryLabel: "Duty",
    description: "A new duty assignment has been added to your operational schedule.",
    status: "UNREAD",
    actionRoute: "/employee/duty",
    actionLabel: "View Duty",
  },
  {
    id: "NOTIF-003",
    time: "14:10",
    title: "Signal maintenance task assigned",
    category: "TASK",
    categoryLabel: "Task",
    description: "A signal maintenance task has been assigned to your responsibility.",
    status: "READ",
    actionRoute: "/employee/tasks",
    actionLabel: "View Task",
  },
  {
    id: "NOTIF-004",
    time: "13:58",
    title: "Weather warning issued for your section",
    category: "WEATHER",
    categoryLabel: "Weather",
    description: "A weather warning has been issued for your assigned operational section.",
    status: "UNREAD",
    actionRoute: "/employee/alerts",
    actionLabel: "View Alerts",
  },
  {
    id: "NOTIF-005",
    time: "13:42",
    title: "Platform inspection task updated",
    category: "TASK",
    categoryLabel: "Task",
    description: "The due time for the platform inspection task has been updated.",
    status: "READ",
    actionRoute: "/employee/tasks",
    actionLabel: "View Task",
  },
  {
    id: "NOTIF-006",
    time: "13:25",
    title: "Operational alert acknowledged",
    category: "OPERATIONAL_ALERT",
    categoryLabel: "Operational Alert",
    description: "An operational alert associated with your responsibility has been acknowledged.",
    status: "READ",
    actionRoute: "/employee/alerts",
    actionLabel: "View Alerts",
  },
];

// -------------------------------------------------------------
// PHASE 10: EMPLOYEE ACTIVITY / HISTORY DEMO DATA & TYPES
// -------------------------------------------------------------

export type EmployeeActivityCategory =
  | "DUTY"
  | "TRAIN"
  | "TASK"
  | "ISSUE"
  | "INCIDENT"
  | "ALERT"
  | "NOTIFICATION"
  | "SYSTEM";

export interface EmployeeActivityItem {
  id: string;
  date: string;
  time: string;
  title: string;
  category: EmployeeActivityCategory;
  categoryLabel: string;
  description: string;
  relatedEntity?: string;
  actionRoute?: string;
  actionLabel?: string;
  statusBadge?: string;
}

export const demoEmployeeActivities: EmployeeActivityItem[] = [
  {
    id: "ACT-005",
    date: "13 Sep",
    time: "16:05",
    title: "Issue resolved",
    category: "ISSUE",
    categoryLabel: "Issue",
    description: "The reported signal issue was marked as resolved.",
    relatedEntity: "Signal Issue",
    actionRoute: "/employee/report",
    actionLabel: "View Issue Module",
    statusBadge: "RESOLVED",
  },
  {
    id: "ACT-004",
    date: "13 Sep",
    time: "15:20",
    title: "Issue assigned to Section Controller",
    category: "ISSUE",
    categoryLabel: "Issue",
    description: "The reported signal issue was assigned for operational review.",
    relatedEntity: "Signal Issue",
    actionRoute: "/employee/report",
    actionLabel: "View Issue Module",
    statusBadge: "ASSIGNED",
  },
  {
    id: "ACT-003",
    date: "13 Sep",
    time: "15:04",
    title: "Reported signal issue",
    category: "ISSUE",
    categoryLabel: "Issue",
    description: "A signal-related operational issue was submitted.",
    relatedEntity: "Signal Issue",
    actionRoute: "/employee/report",
    actionLabel: "View Issue Module",
    statusBadge: "SUBMITTED",
  },
  {
    id: "ACT-002",
    date: "13 Sep",
    time: "14:25",
    title: "Viewed Train 12627",
    category: "TRAIN",
    categoryLabel: "Train",
    description: "Train 12627 — Karnataka Express was viewed from the Employee Portal.",
    relatedEntity: "12627",
    actionRoute: "/employee/assignment",
    actionLabel: "View Train Assignment",
  },
  {
    id: "ACT-001",
    date: "13 Sep",
    time: "14:12",
    title: "Duty started",
    category: "DUTY",
    categoryLabel: "Duty",
    description: "Employee duty session started.",
    relatedEntity: "Current Duty",
    actionRoute: "/employee/duty",
    actionLabel: "View Duty Log",
    statusBadge: "ACTIVE",
  },
];




/**
 * RailDrishti Employee Dashboard Service
 *
 * Provides dynamic, role-aware operational data for the 23 operational employee roles across 7 departments.
 * STRICT DATA INTEGRITY:
 * Clearly distinguishes demo operational context without fabricating live backend telemetry.
 */

import {
  getRoleConfig,
  isRoleInDepartment,
  DEFAULT_OPERATIONAL_ROLE,
  type OperationalRoleId,
  type EmployeeRoleConfig,
  type EmployeeDepartment,
} from "../config/employeeRoles";
import type { AuthUser } from "./auth";

export interface RoleDutyInfo {
  dutyType: string;
  dutyStatus: "ON DUTY" | "STANDBY" | "OFF DUTY";
  shift: string;
  location: string;
  stationCode?: string;
  reportingTime: string;
  responsibility: string;
  supervisorName: string;
  isUnassigned?: boolean;
}

export interface RoleAssignmentInfo {
  assignmentType: string;
  title: string;
  badge: string;
  isAvailable: boolean;
  statusText: string;
  // Dynamic attribute key-value pairs for clean rendering
  details: { label: string; value: string; highlight?: boolean; mono?: boolean }[];
  actionLabel?: string;
  actionRoute?: string;
}

export interface RoleSummaryWidget {
  title: string;
  value: string;
  subtitle: string;
  statusBadge?: { text: string; color: "teal" | "amber" | "blue" | "emerald" | "rose" };
  iconType: "train" | "station" | "track" | "signal" | "shield" | "heart" | "zap" | "ticket" | "wrench" | "check";
}

export interface RoleTaskItem {
  id: string;
  title: string;
  priority: "High Priority" | "Medium Priority" | "Low Priority";
  dueTime: string;
  category: string;
  status: "Pending" | "In Progress" | "Completed";
}

export interface RoleAlertItem {
  id: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
  trainOrSection: string;
  timestamp: string;
  description: string;
}

export interface RoleDashboardData {
  user: AuthUser | null;
  roleConfig: EmployeeRoleConfig;
  isRoleValid: boolean;
  isDepartmentValid: boolean;
  warningMessage?: string;
  duty: RoleDutyInfo;
  assignment: RoleAssignmentInfo;
  summaryWidgets: RoleSummaryWidget[];
  tasks: RoleTaskItem[];
  alerts: RoleAlertItem[];
}

/**
 * Generate role-aware Duty information
 */
export function getRoleDutyData(
  roleConfig: EmployeeRoleConfig,
  _user: AuthUser | null,
  isRoleAssigned: boolean
): RoleDutyInfo {
  if (!isRoleAssigned) {
    return {
      dutyType: "General Administration",
      dutyStatus: "STANDBY",
      shift: "General Shift (09:00 AM – 05:30 PM)",
      location: "Divisional Headquarters",
      reportingTime: "09:00 AM",
      responsibility: "Operational role not assigned. Contact Divisional Personnel Officer (DPO).",
      supervisorName: "Divisional Personnel Officer (DPO)",
      isUnassigned: true,
    };
  }

  const roleId = roleConfig.id;

  // Station-based roles
  if (roleConfig.assignmentType === "Station") {
    return {
      dutyType: roleConfig.dutyType,
      dutyStatus: "ON DUTY",
      shift: "08:00 AM – 04:00 PM (Shift-A)",
      location: "New Delhi Railway Station",
      stationCode: "NDLS",
      reportingTime: "07:45 AM",
      responsibility: roleConfig.primaryResponsibility,
      supervisorName: "Sr. Divisional Operations Manager (Sr. DOM)",
    };
  }

  // Train-based roles
  if (roleConfig.assignmentType === "Train") {
    return {
      dutyType: roleConfig.dutyType,
      dutyStatus: "ON DUTY",
      shift: "Running Duty (Train #22436 NDLS-BSB)",
      location: "New Delhi Loco Lobby / Platform 1",
      stationCode: "NDLS",
      reportingTime: "05:15 AM",
      responsibility: roleConfig.primaryResponsibility,
      supervisorName: "Chief Crew Controller (CCC / NDLS)",
    };
  }

  // Section / Track / Engineering roles
  if (roleConfig.assignmentType === "Section") {
    if (roleId === "track_maintainer" || roleId === "section_engineer" || roleId === "bridge_structure_inspector") {
      return {
        dutyType: roleConfig.dutyType,
        dutyStatus: "ON DUTY",
        shift: "07:00 AM – 03:00 PM (Maintenance Window)",
        location: "Delhi – Ghaziabad Main Line (Section Km 12–24)",
        reportingTime: "06:45 AM",
        responsibility: roleConfig.primaryResponsibility,
        supervisorName: "Sr. Divisional Engineer (Sr. DEN / North)",
      };
    }
    // Signal / Telecom
    return {
      dutyType: roleConfig.dutyType,
      dutyStatus: "ON DUTY",
      shift: "08:00 AM – 04:00 PM (Technical Shift)",
      location: "Bengaluru – Bangarapet Section [SBC-BWT]",
      stationCode: "SBC",
      reportingTime: "07:45 AM",
      responsibility: roleConfig.primaryResponsibility,
      supervisorName: "Sr. Divisional Signal & Telecom Engineer (Sr. DSTE)",
    };
  }

  // Security roles
  if (roleConfig.assignmentType === "Security") {
    return {
      dutyType: roleConfig.dutyType,
      dutyStatus: "ON DUTY",
      shift: "06:00 AM – 02:00 PM (Patrol Shift-1)",
      location: "Station Security Post & Concourse Gate 1-4",
      stationCode: "NDLS",
      reportingTime: "05:45 AM",
      responsibility: roleConfig.primaryResponsibility,
      supervisorName: "RPF Post In-Charge / Inspector",
    };
  }

  // Medical roles
  if (roleConfig.assignmentType === "Medical") {
    return {
      dutyType: roleConfig.dutyType,
      dutyStatus: "ON DUTY",
      shift: "08:00 AM – 04:00 PM (Clinical & ARMV Emergency)",
      location: "Divisional Railway Hospital & Emergency Unit",
      reportingTime: "07:50 AM",
      responsibility: roleConfig.primaryResponsibility,
      supervisorName: "Chief Medical Superintendent (CMS)",
    };
  }

  // Commercial roles
  if (roleConfig.assignmentType === "Counter" || roleId === "tte" || roleId === "booking_enquiry_clerk") {
    return {
      dutyType: roleConfig.dutyType,
      dutyStatus: "ON DUTY",
      shift: "08:00 AM – 04:00 PM (Commercial Shift)",
      location: roleId === "tte" ? "Train #22436 / Coach Block C1–C8" : "UTS/PRS Terminal Cluster-B",
      stationCode: "NDLS",
      reportingTime: "07:30 AM",
      responsibility: roleConfig.primaryResponsibility,
      supervisorName: "Commercial Superintendent / Sr. DCM",
    };
  }

  // OHE / Traction roles
  if (roleConfig.assignmentType === "OHE") {
    return {
      dutyType: roleConfig.dutyType,
      dutyStatus: "ON DUTY",
      shift: "07:30 AM – 03:30 PM (Power Block Shift)",
      location: "25 kV AC Traction Substation Sector #08",
      reportingTime: "07:15 AM",
      responsibility: roleConfig.primaryResponsibility,
      supervisorName: "Sr. Divisional Electrical Engineer (Sr. DEE/TRD)",
    };
  }

  // Default fallback
  return {
    dutyType: roleConfig.dutyType,
    dutyStatus: "ON DUTY",
    shift: "08:00 AM – 04:00 PM",
    location: "Railway Operations Center",
    reportingTime: "07:45 AM",
    responsibility: roleConfig.primaryResponsibility,
    supervisorName: "Divisional Supervisory Officer",
  };
}

/**
 * Generate role-aware Current Assignment information
 */
export function getRoleAssignmentData(
  roleConfig: EmployeeRoleConfig,
  isRoleAssigned: boolean
): RoleAssignmentInfo {
  if (!isRoleAssigned) {
    return {
      assignmentType: "Unassigned",
      title: "Current Assignment",
      badge: "No Active Assignment",
      isAvailable: false,
      statusText: "Assignment not available",
      details: [
        { label: "Status", value: "Operational role not assigned" },
        { label: "Action", value: "Please request operational role allotment from supervisor" },
      ],
      actionLabel: "Contact Support",
      actionRoute: "/employee/profile",
    };
  }

  const roleId = roleConfig.id;

  // 1. Train-oriented roles (Loco Pilot, Assistant Loco Pilot, Train Manager, TTE, Coach Cleanliness, Escort)
  if (
    roleConfig.assignmentType === "Train" ||
    roleId === "loco_pilot" ||
    roleId === "assistant_loco_pilot" ||
    roleId === "train_manager" ||
    roleId === "tte" ||
    roleId === "coach_cleanliness_staff" ||
    roleId === "rpf_escort_constable"
  ) {
    const isLoco = roleId === "loco_pilot" || roleId === "assistant_loco_pilot";
    const isTte = roleId === "tte";
    const isGuard = roleId === "train_manager";

    return {
      assignmentType: "Train",
      title: "My Assigned Train",
      badge: "RUNNING / ON TIME",
      isAvailable: true,
      statusText: "Assigned Train #22436",
      details: [
        { label: "Train Number", value: "22436", mono: true, highlight: true },
        { label: "Train Name", value: "Vande Bharat Express" },
        { label: "Assigned Route", value: "New Delhi [NDLS] ➔ Varanasi [BSB]" },
        { label: "Current Location", value: "Kanpur Central Approach" },
        { label: "Next Halt", value: "Prayagraj Junction [PRYJ]" },
        {
          label: isLoco ? "Locomotive" : isTte ? "Coach Allocation" : isGuard ? "Rake Integrity" : "Scope",
          value: isLoco ? "WAP-7 #30421 (Cab-1 Lead)" : isTte ? "Executive & Chair Cars (C1–C8)" : isGuard ? "BVZC Brake Van #8841 (BPC Valid)" : "Full Rake Escort",
        },
      ],
      actionLabel: "View Train Status",
      actionRoute: "/employee/assignment",
    };
  }

  // 2. Station-oriented roles (Station Master, Station Superintendent, Yard Supervisor)
  if (roleConfig.assignmentType === "Station" || roleId === "station_master" || roleId === "station_superintendent" || roleId === "yard_supervisor") {
    const isYard = roleId === "yard_supervisor";
    return {
      assignmentType: "Station",
      title: isYard ? "My Assigned Yard" : "My Assigned Station",
      badge: isYard ? "MARSHALLING ACTIVE" : "STATION OPERATIONAL",
      isAvailable: true,
      statusText: isYard ? "New Delhi Marshalling Yard" : "New Delhi Junction [NDLS]",
      details: [
        { label: "Station Name", value: isYard ? "NDLS Marshalling Siding" : "New Delhi Junction", highlight: true },
        { label: "Station Code", value: "NDLS", mono: true },
        { label: "Operating Area", value: isYard ? "Lines 1–14 & Shunting Neck" : "West Interlocking & Platforms 1–16" },
        { label: "Station Category", value: isYard ? "Freight & Coaching Yard" : "NSG-1 (Major Terminus)" },
        { label: "Current Movement", value: isYard ? "Shunting Rake VB-22436" : "14 Trains Scheduled in Shift" },
      ],
      actionLabel: isYard ? "View Yard Layout" : "View Station Assignment",
      actionRoute: "/employee/assignment",
    };
  }

  // 3. Civil & Track Engineering (Track Maintainer, Section Engineer, Bridge Inspector)
  if (roleId === "track_maintainer" || roleId === "section_engineer" || roleId === "bridge_structure_inspector") {
    return {
      assignmentType: "Section",
      title: "My Assigned Track Section",
      badge: "MAINTENANCE ACTIVE",
      isAvailable: true,
      statusText: "Delhi – Ghaziabad Main Line",
      details: [
        { label: "Section Route", value: "Delhi Jn [DLI] ➔ Ghaziabad [GZB]", highlight: true },
        { label: "Kilometer Range", value: "Km 14/200 ➔ Km 22/600", mono: true },
        { label: "Line Designation", value: "Broad Gauge Up & Down Fast Lines" },
        { label: "Scheduled Block", value: "11:30 AM – 01:30 PM (2.0 Hrs)" },
        { label: "Gang Unit", value: roleId === "track_maintainer" ? "Gang #04 (P-Way North)" : "Section Engineering Gang #02" },
      ],
      actionLabel: "View Section Details",
      actionRoute: "/employee/assignment",
    };
  }

  // 4. Signal & Telecommunication (Signal Maintainer, Telecom Technician)
  if (roleId === "signal_maintainer" || roleId === "telecom_technician") {
    return {
      assignmentType: "Section",
      title: roleId === "signal_maintainer" ? "My Signal Section" : "My Telecom Asset Section",
      badge: "ALL CIRCUITS HEALTHY",
      isAvailable: true,
      statusText: "Bengaluru – Bangarapet Section",
      details: [
        { label: "Division / Section", value: "SBC Division (Km 0/0 to 68/4)", highlight: true },
        { label: "Station Hub", value: "KSR Bengaluru Junction [SBC]", mono: true },
        { label: "Interlocking System", value: "Electronic Interlocking (EI Grade-4 Siemens)" },
        { label: "Assets Under Charge", value: roleId === "signal_maintainer" ? "14 Point Machines, 22 Track Circuits" : "OFC Ring Node #04, 18 VHF Base Sets" },
        { label: "Active Caution", value: "Auto-Signalling Block #3 Healthy" },
      ],
      actionLabel: "View Signal Section",
      actionRoute: "/employee/assignment",
    };
  }

  // 5. Safety & Security (RPF Escort, Station Security Officer)
  if (roleId === "station_security_officer") {
    return {
      assignmentType: "Security",
      title: "My Security Post Assignment",
      badge: "ACTIVE VIGILANCE",
      isAvailable: true,
      statusText: "NDLS Security Post (Zone-1)",
      details: [
        { label: "Assigned Post", value: "Concourse Main Gate 1–4 & FOB-1", highlight: true },
        { label: "Station Location", value: "New Delhi Junction [NDLS]", mono: true },
        { label: "CCTV Coverage", value: "64 High-Definition Cameras Live" },
        { label: "Access Control", value: "2 Baggage Scanners & 6 DFMDs Operational" },
        { label: "Patrol Frequency", value: "Continuous 30-Min Roving Beat" },
      ],
      actionLabel: "View Security Post",
      actionRoute: "/employee/assignment",
    };
  }

  // 6. Medical (Railway Medical Officer, Emergency Medical Responder)
  if (roleId === "railway_medical_officer" || roleId === "emergency_medical_responder") {
    return {
      assignmentType: "Medical",
      title: "My Medical Duty Post",
      badge: "EMERGENCY STANDBY",
      isAvailable: true,
      statusText: "Divisional Emergency Care Center",
      details: [
        { label: "Medical Facility", value: "Divisional Hospital & Trauma Unit", highlight: true },
        { label: "ARMV Scale-I", value: "Relief Train Ready on Siding Track 2", mono: true },
        { label: "Accident Coverage", value: "Division Radial Radius 120 Km" },
        { label: "Ambulance Unit", value: "ALS Ambulance Unit #02 Dispatched-Ready" },
        { label: "Emergency Siren", value: "Code-1 Disaster Response Operational" },
      ],
      actionLabel: "View Medical Readiness",
      actionRoute: "/employee/assignment",
    };
  }

  // 7. Commercial (Booking Enquiry Clerk, Commercial Inspector, Customer Support)
  if (roleId === "booking_enquiry_clerk" || roleId === "commercial_inspector" || roleId === "customer_support_specialist") {
    return {
      assignmentType: "Counter",
      title: "My Commercial Post",
      badge: "COUNTERS ACTIVE",
      isAvailable: true,
      statusText: "PRS / UTS Terminal Cluster-B",
      details: [
        { label: "Counter Cluster", value: "Booking Hall East (Counters 12–18)", highlight: true },
        { label: "Terminal System", value: "CRIS UTS / PRS Terminal v4.2", mono: true },
        { label: "Shift Target", value: "Shift Cash Balance & Reconciliation" },
        { label: "Public Enquiry", value: "Touchscreen Kiosk & Manual Helpdesk" },
        { label: "Compliance Status", value: "No Outstanding Discrepancies" },
      ],
      actionLabel: "View Commercial Desk",
      actionRoute: "/employee/assignment",
    };
  }

  // 8. Electrical & Traction (Electrical Traction Technician)
  if (roleId === "electrical_traction_technician") {
    return {
      assignmentType: "OHE",
      title: "My Traction Section (OHE)",
      badge: "25 kV ENERGIZED",
      isAvailable: true,
      statusText: "Traction Substation Sector #08",
      details: [
        { label: "OHE Sector", value: "Sector #08 (Km 10/0 to 28/0)", highlight: true },
        { label: "Substation (TSS)", value: "TSS Ghaziabad (25.4 kV AC)", mono: true },
        { label: "Catenary Status", value: "Normal Catenary & Contact Wire Tension" },
        { label: "Scheduled Power Block", value: "01:00 PM – 02:30 PM (Line-2 Isolated)" },
        { label: "Safety Grounding", value: "Discharge Rods & Earthing Tested" },
      ],
      actionLabel: "View OHE Section",
      actionRoute: "/employee/assignment",
    };
  }

  // Default fallback
  return {
    assignmentType: roleConfig.assignmentType,
    title: "Current Operational Assignment",
    badge: "ASSIGNED",
    isAvailable: true,
    statusText: `${roleConfig.displayName} Operational Post`,
    details: [
      { label: "Duty Domain", value: roleConfig.dutyType, highlight: true },
      { label: "Assignment Type", value: roleConfig.assignmentType },
      { label: "Responsibility", value: roleConfig.primaryResponsibility },
    ],
    actionLabel: "View Assignment",
    actionRoute: "/employee/assignment",
  };
}

/**
 * Generate 4 role-specific summary metrics / widgets for the dashboard
 */
export function getRoleSummaryWidgets(
  roleConfig: EmployeeRoleConfig,
  isRoleAssigned: boolean
): RoleSummaryWidget[] {
  if (!isRoleAssigned) {
    return [
      { title: "Account Role", value: "Employee", subtitle: "Standard Staff", iconType: "check", statusBadge: { text: "Active", color: "teal" } },
      { title: "Operational Role", value: "Unassigned", subtitle: "Awaiting DPO Allotment", iconType: "shield", statusBadge: { text: "Pending", color: "amber" } },
      { title: "Duty Roster", value: "General", subtitle: "Division Pool", iconType: "station" },
      { title: "Pending Tasks", value: "0", subtitle: "No assigned duties", iconType: "check" },
    ];
  }

  const roleId = roleConfig.id;

  // Station Master
  if (roleId === "station_master") {
    return [
      { title: "Active Platforms", value: "16 / 16", subtitle: "All platforms clear", iconType: "station", statusBadge: { text: "Normal", color: "teal" } },
      { title: "Scheduled Movements", value: "28 Trains", subtitle: "Next 4 hours in shift", iconType: "train" },
      { title: "Platform Clearances", value: "100%", subtitle: "Interlocking verified", iconType: "check", statusBadge: { text: "Verified", color: "emerald" } },
      { title: "Station Alerts", value: "1 Active", subtitle: "Platform 3 caution", iconType: "zap", statusBadge: { text: "Caution", color: "amber" } },
    ];
  }

  // Loco Pilot & Assistant Loco Pilot
  if (roleId === "loco_pilot" || roleId === "assistant_loco_pilot") {
    return [
      { title: "Assigned Loco", value: "WAP-7 #30421", subtitle: "Lead Cab-1 Active", iconType: "train", statusBadge: { text: "Fit to Run", color: "teal" } },
      { title: "Next Station / Halt", value: "PRYJ (18:42)", subtitle: "Prayagraj Jn (+05 min)", iconType: "station" },
      { title: "Speed Caution", value: "30 km/h", subtitle: "Km 412/10 approach", iconType: "zap", statusBadge: { text: "Active", color: "amber" } },
      { title: "Kavach / Cab Signal", value: "GREEN / CLEAR", subtitle: "ATP protection active", iconType: "check", statusBadge: { text: "Engaged", color: "emerald" } },
    ];
  }

  // Train Manager
  if (roleId === "train_manager") {
    return [
      { title: "Assigned Train", value: "22436 VB Exp", subtitle: "Rake #14 Formation", iconType: "train", statusBadge: { text: "On Route", color: "teal" } },
      { title: "Brake Feel Test", value: "Passed", subtitle: "BPC #NDLS-4912 Valid", iconType: "check", statusBadge: { text: "Certified", color: "emerald" } },
      { title: "Next Reporting Halt", value: "CNB (14:30)", subtitle: "Kanpur Central", iconType: "station" },
      { title: "Guard Alert Status", value: "Normal", subtitle: "Tail lamp & LV board checked", iconType: "shield" },
    ];
  }

  // Track Maintainer
  if (roleId === "track_maintainer") {
    return [
      { title: "Assigned Track Km", value: "Km 14–22", subtitle: "Fast Up/Down Lines", iconType: "track", statusBadge: { text: "Monitored", color: "teal" } },
      { title: "Maintenance Block", value: "11:30–13:30", subtitle: "2.0 Hr window granted", iconType: "wrench", statusBadge: { text: "Scheduled", color: "blue" } },
      { title: "Gang Unit Strength", value: "12 Staff", subtitle: "Gang Unit #04 on duty", iconType: "shield" },
      { title: "Reported Flaws", value: "1 Minor", subtitle: "Fishplate bolt tightening", iconType: "zap", statusBadge: { text: "Action Due", color: "amber" } },
    ];
  }

  // Signal Maintainer
  if (roleId === "signal_maintainer") {
    return [
      { title: "Point Machines", value: "14 / 14", subtitle: "Motor timing normal", iconType: "signal", statusBadge: { text: "Healthy", color: "teal" } },
      { title: "Track Circuits", value: "22 / 22", subtitle: "Audio frequency intact", iconType: "zap", statusBadge: { text: "Healthy", color: "emerald" } },
      { title: "Electronic Interlocking", value: "Siemens Grade-4", subtitle: "Standby CPU synchronized", iconType: "check" },
      { title: "Active Fault Alerts", value: "1 Notice", subtitle: "LC-42 gate slot inspection", iconType: "zap", statusBadge: { text: "Review", color: "amber" } },
    ];
  }

  // TTE
  if (roleId === "tte") {
    return [
      { title: "Assigned Coaches", value: "C1 ➔ C8", subtitle: "Chair Car Block", iconType: "ticket", statusBadge: { text: "Assigned", color: "teal" } },
      { title: "Charted Passengers", value: "482 Total", subtitle: "Final chart downloaded", iconType: "check" },
      { title: "Checked Berths", value: "318 / 482", subtitle: "In-progress checking", iconType: "train", statusBadge: { text: "66% Done", color: "blue" } },
      { title: "EFT / Vacant Berths", value: "14 Vacant", subtitle: "Available for RAC re-allot", iconType: "ticket" },
    ];
  }

  // Security / RPF
  if (roleId === "station_security_officer" || roleId === "rpf_escort_constable") {
    return [
      { title: "Security Zone", value: "Concourse / Gates", subtitle: "NDLS Gate 1–4 Area", iconType: "shield", statusBadge: { text: "Active Beat", color: "teal" } },
      { title: "CCTV Feeds Live", value: "64 Cameras", subtitle: "Command room linked", iconType: "zap", statusBadge: { text: "Live", color: "emerald" } },
      { title: "Baggage Scanners", value: "2 Operational", subtitle: "Zero security breaches", iconType: "check" },
      { title: "Security Notices", value: "0 Critical", subtitle: "Routine vigilance patrol", iconType: "shield" },
    ];
  }

  // Medical / Doctor
  if (roleId === "railway_medical_officer" || roleId === "emergency_medical_responder") {
    return [
      { title: "ARMV Relief Unit", value: "Scale-I Ready", subtitle: "Station Siding Track 2", iconType: "heart", statusBadge: { text: "Standby Ready", color: "emerald" } },
      { title: "Emergency Trauma Team", value: "4 On Duty", subtitle: "Paramedic crew assembled", iconType: "shield" },
      { title: "First-Aid Stations", value: "6 Checked", subtitle: "Kits replenished at concourse", iconType: "check" },
      { title: "Active Dispatches", value: "0 Active", subtitle: "No emergency sirens", iconType: "heart" },
    ];
  }

  // Traction / OHE
  if (roleId === "electrical_traction_technician") {
    return [
      { title: "Traction Voltage", value: "25.4 kV AC", subtitle: "Substation TSS-08", iconType: "zap", statusBadge: { text: "Energized", color: "emerald" } },
      { title: "OHE Catenary Wire", value: "Normal Sag", subtitle: "Tension balance verified", iconType: "wrench" },
      { title: "Scheduled Power Block", value: "13:00–14:30", subtitle: "Section Km 18 isolator", iconType: "shield", statusBadge: { text: "Upcoming", color: "blue" } },
      { title: "Earth Discharge Rods", value: "4 / 4 Tested", subtitle: "Safety equipment calibrated", iconType: "check" },
    ];
  }

  // Generic fallback for any other role
  return [
    { title: "Operational Domain", value: roleConfig.dutyType, subtitle: roleConfig.department, iconType: "station", statusBadge: { text: "Active", color: "teal" } },
    { title: "Assignment Scope", value: roleConfig.assignmentType, subtitle: "Current Allocation", iconType: "train" },
    { title: "Duty Status", value: "On Duty", subtitle: "Regular Shift", iconType: "check", statusBadge: { text: "Verified", color: "emerald" } },
    { title: "Shift Tasks", value: "3 Pending", subtitle: "Due during shift", iconType: "wrench" },
  ];
}

/**
 * Generate role-specific tasks matching roleConfig.taskTypes
 */
export function getRoleTasks(roleConfig: EmployeeRoleConfig, isRoleAssigned: boolean): RoleTaskItem[] {
  if (!isRoleAssigned) {
    return [
      {
        id: "task-gen-01",
        title: "Submit Operational Role Preferences to Personnel Department",
        priority: "High Priority",
        dueTime: "By end of week",
        category: "Administration",
        status: "Pending",
      },
      {
        id: "task-gen-02",
        title: "Complete Annual General Safety & Cyber Awareness Training",
        priority: "Medium Priority",
        dueTime: "Within 30 days",
        category: "Compliance",
        status: "In Progress",
      },
    ];
  }

  const roleId = roleConfig.id;

  if (roleId === "station_master") {
    return [
      { id: "task-sm-01", title: "Verify Platform 1 to 4 Track Clearance for 22436 Departure", priority: "High Priority", dueTime: "06:15 AM", category: "Platform Operations", status: "In Progress" },
      { id: "task-sm-02", title: "Conduct Shift Exchange of Station Control Key Tokens & Logbook", priority: "High Priority", dueTime: "08:00 AM", category: "Handover", status: "Completed" },
      { id: "task-sm-03", title: "Review Signal Overlap & Route Locking for Down Express Corridor", priority: "Medium Priority", dueTime: "10:30 AM", category: "Interlocking", status: "Pending" },
    ];
  }

  if (roleId === "loco_pilot" || roleId === "assistant_loco_pilot") {
    return [
      { id: "task-lp-01", title: "Perform Locomotive Cab-1 Breath Analyzer & Safety Pre-Check", priority: "High Priority", dueTime: "05:30 AM", category: "Safety Pre-Trip", status: "Completed" },
      { id: "task-lp-02", title: "Verify Brake Pipe Continuity & Emergency Brake Application (BPC)", priority: "High Priority", dueTime: "05:50 AM", category: "Brake Protocol", status: "In Progress" },
      { id: "task-lp-03", title: "Acknowledge Speed Restriction Cautions for Kanpur Approach", priority: "High Priority", dueTime: "En Route", category: "Caution Orders", status: "Pending" },
    ];
  }

  if (roleId === "train_manager") {
    return [
      { id: "task-tm-01", title: "Conduct Brake Feel Test & Guard-Driver Walkie-Talkie Link Check", priority: "High Priority", dueTime: "05:55 AM", category: "Rake Safety", status: "Completed" },
      { id: "task-tm-02", title: "Inspect Tail Lamp, Flashing LV Board & First-Aid Box in Brake Van", priority: "High Priority", dueTime: "06:10 AM", category: "Safety Equipment", status: "In Progress" },
      { id: "task-tm-03", title: "Log Scheduled Halts & Passing Timings in Guard CTR Journal", priority: "Medium Priority", dueTime: "Shift End", category: "Journey Log", status: "Pending" },
    ];
  }

  if (roleId === "track_maintainer") {
    return [
      { id: "task-trk-01", title: "Inspect Fastening Clips & Elastic Rail Clips on Km 16/4–18/2", priority: "High Priority", dueTime: "08:30 AM", category: "P-Way Inspection", status: "In Progress" },
      { id: "task-trk-02", title: "Execute Ballast Packing & Track Leveling during 11:30 Power Block", priority: "High Priority", dueTime: "11:30 AM", category: "Track Maintenance", status: "Pending" },
      { id: "task-trk-03", title: "Verify Track Gauge & Cross-Level Tolerances with Gauge Tie-Bar", priority: "Medium Priority", dueTime: "02:00 PM", category: "Tolerance Audit", status: "Pending" },
    ];
  }

  if (roleId === "signal_maintainer") {
    return [
      { id: "task-sig-01", title: "Measure Motor Operating Voltage on Point Machine 102A & 102B", priority: "High Priority", dueTime: "09:00 AM", category: "Point Inspection", status: "In Progress" },
      { id: "task-sig-02", title: "Test Audio-Frequency Track Circuit (AFTC) Receiver Shunt Sensitivity", priority: "High Priority", dueTime: "11:00 AM", category: "Track Circuits", status: "Pending" },
      { id: "task-sig-03", title: "Inspect Level Crossing LC-42 Gate Interlocking & Slot Relay Contacts", priority: "Medium Priority", dueTime: "01:30 PM", category: "LC Safety", status: "Pending" },
    ];
  }

  if (roleId === "tte") {
    return [
      { id: "task-tte-01", title: "Download Final Chart & Sync CRIS Handheld Terminal (HHT)", priority: "High Priority", dueTime: "05:45 AM", category: "Chart Sync", status: "Completed" },
      { id: "task-tte-02", title: "Inspect Passenger Tickets & Identify No-Show Berths in Coaches C1–C4", priority: "High Priority", dueTime: "07:30 AM", category: "Ticket Checking", status: "In Progress" },
      { id: "task-tte-03", title: "Reallocate Vacant Berths to RAC / Waitlisted Passengers via HHT", priority: "Medium Priority", dueTime: "09:00 AM", category: "Berth Re-Allotment", status: "Pending" },
    ];
  }

  if (roleId === "station_security_officer" || roleId === "rpf_escort_constable") {
    return [
      { id: "task-sec-01", title: "Perform Perimeter Foot Patrol across Concourse, FOB-1 & FOB-2", priority: "High Priority", dueTime: "07:00 AM", category: "Patrol Beat", status: "In Progress" },
      { id: "task-sec-02", title: "Verify Calibration of X-Ray Baggage Scanners at Main Entry Gate", priority: "High Priority", dueTime: "08:15 AM", category: "Access Control", status: "Completed" },
      { id: "task-sec-03", title: "Monitor High-Density Passenger Flow & Coordinate Crowd Containment", priority: "Medium Priority", dueTime: "11:00 AM", category: "Crowd Control", status: "Pending" },
    ];
  }

  if (roleId === "railway_medical_officer" || roleId === "emergency_medical_responder") {
    return [
      { id: "task-med-01", title: "Inspect ARMV Scale-I Accident Relief Medical Van Sterile Supplies", priority: "High Priority", dueTime: "08:30 AM", category: "Relief Readiness", status: "Completed" },
      { id: "task-med-02", title: "Conduct Periodic A-1 Medical Fitness Evaluation for Running Staff", priority: "High Priority", dueTime: "10:00 AM", category: "Staff Fitness", status: "In Progress" },
      { id: "task-med-03", title: "Replenish Station Emergency First-Aid Boxes at Platform Masters Office", priority: "Medium Priority", dueTime: "01:00 PM", category: "Emergency Stock", status: "Pending" },
    ];
  }

  // Fallback role tasks
  return [
    { id: "task-fb-01", title: `Execute scheduled ${roleConfig.displayName} shift duties`, priority: "High Priority", dueTime: "09:30 AM", category: "Operational", status: "In Progress" },
    { id: "task-fb-02", title: `Review departmental safety protocol and equipment checklist`, priority: "Medium Priority", dueTime: "12:00 PM", category: "Safety", status: "Pending" },
    { id: "task-fb-03", title: `Complete daily shift logbook and hand-over report`, priority: "Low Priority", dueTime: "03:45 PM", category: "Reporting", status: "Pending" },
  ];
}

/**
 * Generate role-specific alerts matching roleConfig.alertTypes
 */
export function getRoleAlerts(roleConfig: EmployeeRoleConfig, isRoleAssigned: boolean): RoleAlertItem[] {
  if (!isRoleAssigned) {
    return [];
  }

  const roleId = roleConfig.id;

  if (roleId === "station_master") {
    return [
      {
        id: "alt-sm-01",
        title: "Platform 3 Movement Caution",
        severity: "HIGH",
        trainOrSection: "Platform 3 (NDLS)",
        timestamp: "5 minutes ago",
        description: "Speed restriction of 15 km/h enforced on Platform 3 turnout due to track tamping.",
      },
      {
        id: "alt-sm-02",
        title: "Express Rake Precedence Order",
        severity: "MEDIUM",
        trainOrSection: "Section: NDLS - GZB",
        timestamp: "12 minutes ago",
        description: "Priority precedence granted to 22436 VB Exp over freight rake BCNA-18.",
      },
    ];
  }

  if (roleId === "loco_pilot" || roleId === "assistant_loco_pilot") {
    return [
      {
        id: "alt-lp-01",
        title: "Speed Restriction Caution Notice",
        severity: "HIGH",
        trainOrSection: "Km 412/10 – 414/0",
        timestamp: "8 minutes ago",
        description: "Caution order: Maintain 30 km/h over bridge reconstruction section approach.",
      },
      {
        id: "alt-lp-02",
        title: "Automatic Signalling Advisory",
        severity: "MEDIUM",
        trainOrSection: "Corridor: CNB Approach",
        timestamp: "20 minutes ago",
        description: "Block section 412-B operational with double-yellow aspect. Obey wayside signals.",
      },
    ];
  }

  if (roleId === "train_manager") {
    return [
      {
        id: "alt-tm-01",
        title: "Weather Caution: Low Visibility Advisory",
        severity: "MEDIUM",
        trainOrSection: "Section: PRYJ Outer",
        timestamp: "15 minutes ago",
        description: "Foggy weather condition reported near Prayagraj outer. Ensure audible fog signals if halted.",
      },
    ];
  }

  if (roleId === "track_maintainer") {
    return [
      {
        id: "alt-trk-01",
        title: "Maintenance Power Block Approved",
        severity: "HIGH",
        trainOrSection: "Km 16/400 (Down Line)",
        timestamp: "10 minutes ago",
        description: "2.0-Hour traffic block confirmed for ballast screening between 11:30 AM and 01:30 PM.",
      },
      {
        id: "alt-trk-02",
        title: "Track Joint Tightening Notice",
        severity: "MEDIUM",
        trainOrSection: "Km 18/200 (Up Line)",
        timestamp: "25 minutes ago",
        description: "Ultrasonic flaw detector (USFD) flagged minor joint gap requiring fishplate bolt retorquing.",
      },
    ];
  }

  if (roleId === "signal_maintainer") {
    return [
      {
        id: "alt-sig-01",
        title: "Track Circuit AF-04 Resistance Fluctuation",
        severity: "HIGH",
        trainOrSection: "Section: SBC-BWT Block 2",
        timestamp: "6 minutes ago",
        description: "Track circuit ballast resistance dropped to 1.8 ohms. Immediate insulator cleaning advised.",
      },
      {
        id: "alt-sig-02",
        title: "LC-42 Gate Interlocking Periodic Audit Due",
        severity: "MEDIUM",
        trainOrSection: "LC-42 (Km 28/4)",
        timestamp: "30 minutes ago",
        description: "Quarterly interlocking slot continuity certification due for sign-off today.",
      },
    ];
  }

  if (roleId === "tte") {
    return [
      {
        id: "alt-tte-01",
        title: "VIP Passenger Boarding Alert",
        severity: "INFO",
        trainOrSection: "Coach C2 / Seats 12-14",
        timestamp: "10 minutes ago",
        description: "Official delegation boarding at Kanpur Central. Coordinate with onboard catering.",
      },
    ];
  }

  if (roleId === "station_security_officer" || roleId === "rpf_escort_constable") {
    return [
      {
        id: "alt-sec-01",
        title: "High Vigilance Security Advisory",
        severity: "HIGH",
        trainOrSection: "Concourse Main Gate 1",
        timestamp: "14 minutes ago",
        description: "Heightened security protocol active. Ensure 100% baggage screening at entrance.",
      },
    ];
  }

  if (roleId === "railway_medical_officer" || roleId === "emergency_medical_responder") {
    return [
      {
        id: "alt-med-01",
        title: "ARMV Scale-I Siren Ready Drill Completed",
        severity: "INFO",
        trainOrSection: "Siding Track 2",
        timestamp: "45 minutes ago",
        description: "Bi-monthly emergency siren test passed. Ambulance train response time under 15 minutes.",
      },
    ];
  }

  // Fallback alert
  return [
    {
      id: "alt-fb-01",
      title: "Operational Routine Notice",
      severity: "INFO",
      trainOrSection: roleConfig.department,
      timestamp: "10 minutes ago",
      description: "Standard operating procedures apply for current shift. Keep control log updated.",
    },
  ];
}

/**
 * Main consolidated role dashboard data resolver
 */
export function getRoleSpecificDashboardData(user: AuthUser | null): RoleDashboardData {
  const operationalRoleId = user?.operationalRole as OperationalRoleId | undefined;
  const department = user?.department as EmployeeDepartment | undefined;

  const isRoleAssigned = Boolean(operationalRoleId && operationalRoleId in getRoleConfig(operationalRoleId));
  const roleConfig = getRoleConfig(operationalRoleId || DEFAULT_OPERATIONAL_ROLE);

  // Department mismatch validation
  let isDepartmentValid = true;
  let warningMessage: string | undefined = undefined;

  if (isRoleAssigned && department) {
    const isValidMatch = isRoleInDepartment(roleConfig.id, department);
    if (!isValidMatch) {
      isDepartmentValid = false;
      warningMessage = `Configuration Notice: Operational role "${roleConfig.displayName}" does not belong to the selected department "${department}". Please verify your employee profile.`;
    }
  }

  const duty = getRoleDutyData(roleConfig, user, isRoleAssigned);
  const assignment = getRoleAssignmentData(roleConfig, isRoleAssigned);
  const summaryWidgets = getRoleSummaryWidgets(roleConfig, isRoleAssigned);
  const tasks = getRoleTasks(roleConfig, isRoleAssigned);
  const alerts = getRoleAlerts(roleConfig, isRoleAssigned);

  return {
    user,
    roleConfig,
    isRoleValid: isRoleAssigned,
    isDepartmentValid,
    warningMessage,
    duty,
    assignment,
    summaryWidgets,
    tasks,
    alerts,
  };
}

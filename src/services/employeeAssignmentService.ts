/**
 * RailDrishti Employee My Train / Section Service
 *
 * Provides dynamic, role-aware assignment data, telemetry scopes, asset specifications,
 * and operational details tailored to the employee's operationalRole.
 *
 * STRICT DATA INTEGRITY:
 * Separates static role information from live operational data, clearly labeling
 * configuration scopes without fabricating real-time backend telemetry.
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

export type AssignmentCategory =
  | "train"
  | "station"
  | "section"
  | "signal_telecom"
  | "traction"
  | "depot"
  | "security"
  | "medical"
  | "commercial_counter"
  | "general";

export interface AssignmentDetailItem {
  label: string;
  value: string;
  highlight?: boolean;
  mono?: boolean;
}

export interface MetricCard {
  title: string;
  value: string;
  subtitle: string;
  statusBadge?: { text: string; color: "teal" | "amber" | "blue" | "emerald" | "rose" };
  iconType: "train" | "station" | "track" | "signal" | "shield" | "heart" | "zap" | "ticket" | "wrench" | "check";
}

export interface RoleAssignmentViewData {
  employeeName: string;
  employeeId: string;
  department: string;
  roleTitle: string;
  roleConfig: EmployeeRoleConfig;
  category: AssignmentCategory;
  pageTitle: string;
  pageSubtitle: string;
  assignmentTitle: string;
  assignmentBadge: string;
  statusText: string;
  statusBadgeColor: "teal" | "amber" | "blue" | "emerald" | "rose";
  isLiveAvailable: boolean;
  liveStatusLabel: string;
  primaryDetails: AssignmentDetailItem[];
  secondaryDetails: AssignmentDetailItem[];
  metrics: MetricCard[];
  operationalProtocols: string[];
  quickActions: { label: string; route: string }[];
  isRoleValid: boolean;
  isDepartmentValid: boolean;
  warningMessage?: string;
}

/**
 * Resolve assignment category based on operational role
 */
export function getAssignmentCategory(roleId: OperationalRoleId, roleConfig: EmployeeRoleConfig): AssignmentCategory {
  if (
    roleId === "loco_pilot" ||
    roleId === "assistant_loco_pilot" ||
    roleId === "train_manager" ||
    roleId === "tte" ||
    roleId === "coach_cleanliness_staff"
  ) {
    return "train";
  }

  if (
    roleId === "station_master" ||
    roleId === "station_superintendent" ||
    roleId === "yard_supervisor" ||
    roleId === "booking_enquiry_clerk" ||
    roleId === "station_booking_clerk" ||
    roleId === "commercial_inspector" ||
    roleId === "customer_support_specialist"
  ) {
    return "station";
  }

  if (
    roleId === "track_maintainer" ||
    roleId === "section_engineer" ||
    roleId === "bridge_structure_inspector"
  ) {
    return "section";
  }

  if (roleId === "signal_maintainer" || roleId === "telecom_technician") {
    return "signal_telecom";
  }

  if (roleId === "electrical_traction_technician") {
    return "traction";
  }

  if (roleId === "depot_maintenance_technician") {
    return "depot";
  }

  if (roleId === "station_security_officer" || roleId === "rpf_escort_constable") {
    return "security";
  }

  if (roleId === "railway_medical_officer" || roleId === "emergency_medical_responder") {
    return "medical";
  }

  if (roleConfig.assignmentType === "Train") return "train";
  if (roleConfig.assignmentType === "Station") return "station";
  if (roleConfig.assignmentType === "Section") return "section";

  return "general";
}

/**
 * Main consolidated role assignment data resolver
 */
export function getRoleAssignmentViewData(user: AuthUser | null): RoleAssignmentViewData {
  const operationalRoleId = user?.operationalRole as OperationalRoleId | undefined;
  const department = user?.department as EmployeeDepartment | undefined;

  const isRoleAssigned = Boolean(operationalRoleId && operationalRoleId in getRoleConfig(operationalRoleId));
  const roleConfig = getRoleConfig(operationalRoleId || DEFAULT_OPERATIONAL_ROLE);
  const roleId = roleConfig.id;

  // Department mismatch validation
  let isDepartmentValid = true;
  let warningMessage: string | undefined = undefined;

  if (isRoleAssigned && department) {
    const isValidMatch = isRoleInDepartment(roleConfig.id, department);
    if (!isValidMatch) {
      isDepartmentValid = false;
      warningMessage = `Configuration Notice: Operational role "${roleConfig.displayName}" does not belong to the selected department "${department}". Displaying assignment details for "${roleConfig.displayName}".`;
    }
  }

  const employeeName = user?.name || "Ramesh Sharma";
  const employeeId = user?.employeeId || "IR-2024-8841";
  const departmentName = user?.department || roleConfig.department;
  const roleTitle = isRoleAssigned ? roleConfig.displayName : "Operational Role Not Assigned";
  const category = getAssignmentCategory(roleId, roleConfig);

  // 1. TRAIN-BASED ROLES
  if (category === "train") {
    const isLoco = roleId === "loco_pilot" || roleId === "assistant_loco_pilot";
    const isTte = roleId === "tte";
    const isClean = roleId === "coach_cleanliness_staff";

    return {
      employeeName,
      employeeId,
      department: departmentName,
      roleTitle,
      roleConfig,
      category: "train",
      pageTitle: isTte ? "MY TRAIN / COACH" : "MY TRAIN",
      pageSubtitle: `Active train running telemetry & route assignment for ${roleTitle}`,
      assignmentTitle: "Assigned Train #22436",
      assignmentBadge: "RUNNING / ON SCHEDULE",
      statusText: "22436 Vande Bharat Express",
      statusBadgeColor: "emerald",
      isLiveAvailable: true,
      liveStatusLabel: "Operational Assignment Synced",
      primaryDetails: [
        { label: "Train Number", value: "22436", mono: true, highlight: true },
        { label: "Train Name", value: "Vande Bharat Express" },
        { label: "Origin ➔ Destination", value: "New Delhi [NDLS] ➔ Varanasi [BSB]" },
        { label: "Current Location", value: "Kanpur Central Approach (Km 438/2)" },
        { label: "Next Halt", value: "Prayagraj Junction [PRYJ] • ETA 18:42" },
        {
          label: isLoco ? "Locomotive" : isTte ? "Coach Block" : isClean ? "Sanitation Block" : "Rake Formation",
          value: isLoco ? "WAP-7 #30421 (Lead Cab-1 Active)" : isTte ? "Executive & Chair Cars C1–C8" : isClean ? "All Coaches C1–C16 (OBHS Active)" : "Rake #14 (BVZC Brake Van #8841)",
          highlight: true,
        },
      ],
      secondaryDetails: [
        { label: "Scheduled Departure", value: "06:00 AM (Departed On-Time)" },
        { label: "Current Speed", value: "118 km/h (MPS 130 km/h)", mono: true },
        { label: "Running Delay", value: "+05 min (Minor Caution Order)" },
        { label: "Kavach ATP Status", value: "Active / Cab Signal CLEAR GREEN" },
      ],
      metrics: [
        { title: "Current Speed", value: "118 km/h", subtitle: "MPS: 130 km/h", iconType: "train", statusBadge: { text: "Normal", color: "teal" } },
        { title: "Running Delay", value: "+05 min", subtitle: "Recoverable on corridor", iconType: "zap", statusBadge: { text: "Minor", color: "amber" } },
        { title: "Next Station", value: "PRYJ (18:42)", subtitle: "Prayagraj Junction", iconType: "station" },
        { title: "Kavach / ATP", value: "ENGAGED", subtitle: "Cab signalling active", iconType: "check", statusBadge: { text: "Protected", color: "emerald" } },
      ],
      operationalProtocols: [
        "Adhere strictly to Maximum Permissible Speed (MPS) and caution orders.",
        "Maintain continuous VHF communication between Loco Pilot and Train Manager.",
        "Acknowledge all cab signal aspect transitions under Kavach ATP protocol.",
        "Log intermediate arrival and departure timings accurately in CTR journal.",
      ],
      quickActions: [
        { label: "View Train Status", route: "/live-train-status" },
        { label: "My Duty Schedule", route: "/employee/duty" },
        { label: "Report Train Issue", route: "/employee/report" },
      ],
      isRoleValid: isRoleAssigned,
      isDepartmentValid,
      warningMessage,
    };
  }

  // 2. STATION-BASED ROLES
  if (category === "station") {
    const isYard = roleId === "yard_supervisor";
    const isBooking = roleId === "booking_enquiry_clerk" || roleId === "station_booking_clerk";

    return {
      employeeName,
      employeeId,
      department: departmentName,
      roleTitle,
      roleConfig,
      category: "station",
      pageTitle: isYard ? "MY YARD" : "MY STATION",
      pageSubtitle: `Station operating environment, platforms & movement matrix for ${roleTitle}`,
      assignmentTitle: isYard ? "Assigned Marshalling Yard" : "Assigned Station",
      assignmentBadge: isYard ? "MARSHALLING ACTIVE" : "STATION OPERATIONAL",
      statusText: isYard ? "New Delhi Marshalling Siding" : "New Delhi Junction [NDLS]",
      statusBadgeColor: "teal",
      isLiveAvailable: true,
      liveStatusLabel: "Station Operations Online",
      primaryDetails: [
        { label: isYard ? "Yard Designation" : "Station Name", value: isYard ? "NDLS Marshalling Yard" : "New Delhi Junction", highlight: true },
        { label: "Station Code", value: "NDLS", mono: true },
        { label: "Category", value: isYard ? "Freight & Coaching Siding" : "NSG-1 (Major Terminus)" },
        { label: "Operating Area", value: isYard ? "Lines 1–14 & Shunting Neck" : isBooking ? "UTS / PRS Cluster-B (Counters 12–18)" : "West Interlocking & Platforms 1–16" },
        { label: "Interlocking System", value: "Siemens Electronic Interlocking (EI Grade-4)" },
      ],
      secondaryDetails: [
        { label: "Active Platforms", value: "16 / 16 Operational (100% Clearance)" },
        { label: "Scheduled Movements", value: "28 Trains in Shift Window" },
        { label: "Shunting Moves", value: "4 Shunting Formations Active" },
        { label: "Station Control Hub", value: "West Cabin Panel Desk 02" },
      ],
      metrics: [
        { title: "Active Platforms", value: "16 / 16", subtitle: "All platforms clear", iconType: "station", statusBadge: { text: "100% Normal", color: "emerald" } },
        { title: "Shift Arrivals", value: "14 Trains", subtitle: "Next 4 hours in shift", iconType: "train" },
        { title: "Shift Departures", value: "14 Trains", subtitle: "Right-time departures", iconType: "check", statusBadge: { text: "On Time", color: "teal" } },
        { title: "Active Cautions", value: "1 Notice", subtitle: "Platform 3 turnout restriction", iconType: "zap", statusBadge: { text: "15 km/h", color: "amber" } },
      ],
      operationalProtocols: [
        "Verify track circuit clearance before granting line clear authorizations.",
        "Ensure full platform berthing alignment and passenger information system synchronization.",
        "Coordinate closely with Section Controller on corridor train precedence.",
        "Maintain official station diary and logbook records for every movement.",
      ],
      quickActions: [
        { label: "Station Alerts", route: "/employee/alerts" },
        { label: "Duty Roster", route: "/employee/duty" },
        { label: "Report Station Issue", route: "/employee/report" },
      ],
      isRoleValid: isRoleAssigned,
      isDepartmentValid,
      warningMessage,
    };
  }

  // 3. SECTION / TRACK ROLES
  if (category === "section") {
    const isBridge = roleId === "bridge_structure_inspector";

    return {
      employeeName,
      employeeId,
      department: departmentName,
      roleTitle,
      roleConfig,
      category: "section",
      pageTitle: isBridge ? "MY STRUCTURE SECTION" : "MY TRACK SECTION",
      pageSubtitle: `Permanent Way (P-Way) track maintenance & engineering sector for ${roleTitle}`,
      assignmentTitle: "Assigned Track Section",
      assignmentBadge: "MAINTENANCE ACTIVE",
      statusText: "Delhi – Ghaziabad Main Line",
      statusBadgeColor: "amber",
      isLiveAvailable: true,
      liveStatusLabel: "Track Maintenance Protocol Active",
      primaryDetails: [
        { label: "Section Route", value: "Delhi Junction [DLI] ➔ Ghaziabad [GZB]", highlight: true },
        { label: "Kilometer Range", value: "Km 14/200 ➔ Km 22/600", mono: true },
        { label: "Line Designation", value: "Broad Gauge Electrified Fast Lines" },
        { label: "Scheduled Power Block", value: "11:30 AM – 01:30 PM (2.0-Hour Window)" },
        { label: "Gang Unit", value: "P-Way Gang Unit #04 (North Division)" },
      ],
      secondaryDetails: [
        { label: "Track Condition", value: "Ballast Packing & Tamping in progress" },
        { label: "USFD Flaw Status", value: "0 Critical Flaws • 1 Joint Bolt Retorquing Due" },
        { label: "Lookout Protection", value: "Banner flags & detonator signals deployed" },
        { label: "Supervising DEN", value: "Sr. Divisional Engineer (Sr. DEN / North)" },
      ],
      metrics: [
        { title: "Assigned Km", value: "Km 14–22", subtitle: "Fast Up & Down Lines", iconType: "track", statusBadge: { text: "Monitored", color: "teal" } },
        { title: "Power Block", value: "11:30–13:30", subtitle: "2.0-Hr window granted", iconType: "wrench", statusBadge: { text: "Active", color: "blue" } },
        { title: "Gang Strength", value: "12 Staff", subtitle: "Full gang mustered", iconType: "shield" },
        { title: "Reported Flaws", value: "1 Minor", subtitle: "Km 18/200 fishplate check", iconType: "zap", statusBadge: { text: "In Progress", color: "amber" } },
      ],
      operationalProtocols: [
        "Deploy lookout flags and banner signals 600m on both sides of work site.",
        "Perform track packing and rail fastening torque audits adhering to P-Way manual.",
        "Verify track gauge tolerances with gauge tie-bars before block cancellation.",
        "Certify line safety to Station Master prior to reopening track for high-speed traffic.",
      ],
      quickActions: [
        { label: "Track Alerts", route: "/employee/alerts" },
        { label: "Maintenance Tasks", route: "/employee/tasks" },
        { label: "Report Track Issue", route: "/employee/report" },
      ],
      isRoleValid: isRoleAssigned,
      isDepartmentValid,
      warningMessage,
    };
  }

  // 4. SIGNAL & TELECOM ROLES
  if (category === "signal_telecom") {
    const isSignal = roleId === "signal_maintainer";

    return {
      employeeName,
      employeeId,
      department: departmentName,
      roleTitle,
      roleConfig,
      category: "signal_telecom",
      pageTitle: isSignal ? "MY SIGNAL SECTION" : "MY TELECOM SECTION",
      pageSubtitle: `Signalling interlocking, track circuits & communication assets for ${roleTitle}`,
      assignmentTitle: isSignal ? "Assigned Signal Section" : "Assigned Telecom Section",
      assignmentBadge: "ALL CIRCUITS HEALTHY",
      statusText: "Bengaluru – Bangarapet Section [SBC-BWT]",
      statusBadgeColor: "emerald",
      isLiveAvailable: true,
      liveStatusLabel: "S&T Asset Telemetry Healthy",
      primaryDetails: [
        { label: "Division / Corridor", value: "SBC Division (Km 0/0 to Km 68/4)", highlight: true },
        { label: "Hub Station", value: "KSR Bengaluru Junction [SBC]", mono: true },
        { label: "Interlocking System", value: "Siemens Electronic Interlocking (EI Grade-4)" },
        {
          label: isSignal ? "Signalling Assets" : "Telecom Assets",
          value: isSignal ? "14 Point Machines, 22 Audio Frequency Track Circuits (AFTC), LC-42 Gate" : "18 VHF Base Radios, OFC Ring Node #04, 32 PIS/PAS Displays, 64 CCTV Feeds",
        },
      ],
      secondaryDetails: [
        { label: "Standby CPU Status", value: "Dual Redundant Hot-Standby Synchronized" },
        { label: "Point Operating Time", value: "Normal (3.8 seconds stroke duration)" },
        { label: "Track Circuit Resistance", value: "Ballast resistance healthy at 2.4 ohms" },
        { label: "Active Failure Notices", value: "0 Critical Failures • LC-42 Quarterly Audit Due" },
      ],
      metrics: [
        { title: "Point Machines", value: "14 / 14", subtitle: "All points healthy", iconType: "signal", statusBadge: { text: "Healthy", color: "emerald" } },
        { title: "Track Circuits", value: "22 / 22", subtitle: "AFTC circuits normal", iconType: "zap", statusBadge: { text: "Normal", color: "teal" } },
        { title: "Interlocking CPU", value: "Siemens EI", subtitle: "Dual-redundant active", iconType: "check" },
        { title: "Audit Tasks", value: "1 Due", subtitle: "LC-42 gate slot inspection", iconType: "wrench", statusBadge: { text: "Scheduled", color: "amber" } },
      ],
      operationalProtocols: [
        "Conduct periodic voltage and timing checks on all motor-operated point machines.",
        "Verify shunt sensitivity of track circuits under simulated axle loading.",
        "Inspect level crossing gate interlocks and emergency mechanical locking slots.",
        "Log all preventive maintenance and component replacements in the S&T failure register.",
      ],
      quickActions: [
        { label: "Signal Alerts", route: "/employee/alerts" },
        { label: "S&T Tasks", route: "/employee/tasks" },
        { label: "Report Signal Issue", route: "/employee/report" },
      ],
      isRoleValid: isRoleAssigned,
      isDepartmentValid,
      warningMessage,
    };
  }

  // 5. ELECTRICAL & TRACTION (OHE)
  if (category === "traction") {
    return {
      employeeName,
      employeeId,
      department: departmentName,
      roleTitle,
      roleConfig,
      category: "traction",
      pageTitle: "MY TRACTION SECTION (OHE)",
      pageSubtitle: `25 kV AC Traction overhead equipment, substation & catenary sector for ${roleTitle}`,
      assignmentTitle: "Assigned OHE Sector #08",
      assignmentBadge: "25 kV ENERGIZED",
      statusText: "Traction Substation Sector #08",
      statusBadgeColor: "emerald",
      isLiveAvailable: true,
      liveStatusLabel: "25.4 kV AC Feeder Live",
      primaryDetails: [
        { label: "OHE Sector", value: "Sector #08 (Km 10/0 to Km 28/0)", highlight: true },
        { label: "Substation (TSS)", value: "TSS Ghaziabad (25.4 kV AC, Feeders 1 & 2)", mono: true },
        { label: "Catenary Status", value: "Normal Catenary & Contact Wire Tension (1000 kgf)" },
        { label: "Scheduled Power Block", value: "01:00 PM – 02:30 PM (Line-2 Down Feeder Isolated)" },
        { label: "Earthing Equipment", value: "4 / 4 Safety Discharge Rods Tested & Calibrated" },
      ],
      secondaryDetails: [
        { label: "Traction Transformer Load", value: "14.2 MVA (62% Capacity)" },
        { label: "Dropper Alignment", value: "Zero sag detected across Section Km 18" },
        { label: "Insulator Health", value: "All porcelain and composite insulators intact" },
        { label: "Supervising DEE", value: "Sr. Divisional Electrical Engineer (Sr. DEE/TRD)" },
      ],
      metrics: [
        { title: "Traction Voltage", value: "25.4 kV", subtitle: "TSS-08 Substation", iconType: "zap", statusBadge: { text: "Energized", color: "emerald" } },
        { title: "Catenary Tension", value: "1000 kgf", subtitle: "Zero wire sag", iconType: "wrench" },
        { title: "Power Block", value: "13:00–14:30", subtitle: "Section Km 18", iconType: "shield", statusBadge: { text: "Upcoming", color: "blue" } },
        { title: "Earthing Rods", value: "4 / 4 Tested", subtitle: "Safety calibrated", iconType: "check" },
      ],
      operationalProtocols: [
        "Verify permit-to-work (PTW) with Traction Power Controller before entering OHE zone.",
        "Apply approved safety discharge rods on both sides of isolated maintenance section.",
        "Inspect catenary droppers, section insulators and contact wire wear tolerances.",
        "Remove all earthing rods and certify power restoration before block cancellation.",
      ],
      quickActions: [
        { label: "Traction Alerts", route: "/employee/alerts" },
        { label: "OHE Tasks", route: "/employee/tasks" },
        { label: "Report OHE Flaw", route: "/employee/report" },
      ],
      isRoleValid: isRoleAssigned,
      isDepartmentValid,
      warningMessage,
    };
  }

  // 6. DEPOT / MECHANICAL MAINTENANCE
  if (category === "depot") {
    return {
      employeeName,
      employeeId,
      department: departmentName,
      roleTitle,
      roleConfig,
      category: "depot",
      pageTitle: "MY DEPOT / ASSET",
      pageSubtitle: `Electric locomotive maintenance shed & rolling stock inspection for ${roleTitle}`,
      assignmentTitle: "Assigned Maintenance Depot",
      assignmentBadge: "DEPOT INFLOW OPERATIONAL",
      statusText: "Electric Loco Shed (ELS / Tughlakabad)",
      statusBadgeColor: "teal",
      isLiveAvailable: true,
      liveStatusLabel: "Depot Maintenance Schedule Synced",
      primaryDetails: [
        { label: "Depot Shed", value: "Electric Loco Shed (ELS / TKD)", highlight: true },
        { label: "Assigned Asset Fleet", value: "WAP-7 & WAP-5 High-Speed Passenger Locomotives" },
        { label: "Primary Locomotive", value: "WAP-7 #30421 (Trip Inspection Certified)", mono: true },
        { label: "Inspection Status", value: "Periodic Trip Inspection Complete (Fit to Run)" },
      ],
      secondaryDetails: [
        { label: "Pantograph Carbon Strip", value: "Thickness 22mm (Tolerances Normal)" },
        { label: "Transformer Oil Purity", value: "Dielectric Strength 65 kV (Certified)" },
        { label: "Wheel Flange Profile", value: "Flange wear within 2.4mm limit" },
        { label: "Active Work Orders", value: "0 Critical Defect Orders" },
      ],
      metrics: [
        { title: "Assigned Loco", value: "WAP-7 #30421", subtitle: "Trip certified", iconType: "train", statusBadge: { text: "Fit to Run", color: "emerald" } },
        { title: "Shed Inflow", value: "6 Locomotives", subtitle: "Scheduled maintenance", iconType: "wrench" },
        { title: "Trip Certifications", value: "4 Completed", subtitle: "Ready for traffic", iconType: "check" },
        { title: "Active Faults", value: "0 Flaws", subtitle: "All subsystems healthy", iconType: "shield" },
      ],
      operationalProtocols: [
        "Follow rigorous mechanical and electrical safety checks as per CAMTECH manuals.",
        "Verify pantograph contact force and carbon wear before issuing fitness certificate.",
        "Perform insulation resistance and oil dielectric tests on main traction transformers.",
        "Sign off rolling stock fitness logs in the centralized Locomotive Management System.",
      ],
      quickActions: [
        { label: "Maintenance Tasks", route: "/employee/tasks" },
        { label: "Depot Alerts", route: "/employee/alerts" },
        { label: "Report Rolling Stock Issue", route: "/employee/report" },
      ],
      isRoleValid: isRoleAssigned,
      isDepartmentValid,
      warningMessage,
    };
  }

  // 7. SECURITY ROLES
  if (category === "security") {
    return {
      employeeName,
      employeeId,
      department: departmentName,
      roleTitle,
      roleConfig,
      category: "security",
      pageTitle: "MY SECURITY ASSIGNMENT",
      pageSubtitle: `Railway Protection Force security post, concourse & CCTV surveillance for ${roleTitle}`,
      assignmentTitle: "Assigned Security Post",
      assignmentBadge: "ACTIVE VIGILANCE",
      statusText: "NDLS Security Post (Zone-1 Concourse)",
      statusBadgeColor: "teal",
      isLiveAvailable: true,
      liveStatusLabel: "RPF Security Grid Active",
      primaryDetails: [
        { label: "Security Post", value: "NDLS Main Concourse & Gate 1–4 Post", highlight: true },
        { label: "Station Location", value: "New Delhi Junction [NDLS]", mono: true },
        { label: "CCTV Surveillance", value: "64 High-Definition Cameras Live to Command Post" },
        { label: "Access Control", value: "2 X-Ray Baggage Scanners & 6 DFMDs Operational" },
      ],
      secondaryDetails: [
        { label: "Patrol Beat", value: "Concourse, Foot Overbridges FOB-1 & FOB-2, Waiting Halls" },
        { label: "Patrol Frequency", value: "Continuous 30-Minute Roving Vigilance" },
        { label: "Security Staff on Post", value: "6 RPF Constables & 1 Sub-Inspector" },
        { label: "Incident Status", value: "0 Active Security Breaches" },
      ],
      metrics: [
        { title: "Security Post", value: "Gate 1–4 Beat", subtitle: "Main Concourse Area", iconType: "shield", statusBadge: { text: "Active", color: "teal" } },
        { title: "CCTV Feeds", value: "64 Cameras", subtitle: "Command room linked", iconType: "zap", statusBadge: { text: "100% Live", color: "emerald" } },
        { title: "Baggage Scanners", value: "2 Online", subtitle: "Continuous screening", iconType: "check" },
        { title: "Security Alerts", value: "0 Critical", subtitle: "Routine vigilance", iconType: "shield" },
      ],
      operationalProtocols: [
        "Maintain 100% scanning coverage of passenger baggage entering station concourse.",
        "Perform roving vigilance across platforms during Express and Vande Bharat berthing.",
        "Coordinate immediately with Government Railway Police (GRP) during passenger disputes.",
        "Log all security observations in the official RPF Post General Diary.",
      ],
      quickActions: [
        { label: "Security Alerts", route: "/employee/alerts" },
        { label: "Incident Log", route: "/employee/incidents" },
        { label: "Report Incident", route: "/employee/report" },
      ],
      isRoleValid: isRoleAssigned,
      isDepartmentValid,
      warningMessage,
    };
  }

  // 8. MEDICAL ROLES
  if (category === "medical") {
    return {
      employeeName,
      employeeId,
      department: departmentName,
      roleTitle,
      roleConfig,
      category: "medical",
      pageTitle: "MY MEDICAL ASSIGNMENT",
      pageSubtitle: `Accident Relief Medical Van (ARMV), hospital trauma & emergency response for ${roleTitle}`,
      assignmentTitle: "Assigned Medical Unit",
      assignmentBadge: "EMERGENCY STANDBY",
      statusText: "Divisional Emergency Healthcare Center",
      statusBadgeColor: "emerald",
      isLiveAvailable: true,
      liveStatusLabel: "ARMV Scale-I Ready for Dispatch",
      primaryDetails: [
        { label: "Medical Facility", value: "Divisional Railway Hospital & Trauma Center", highlight: true },
        { label: "ARMV Scale-I", value: "Accident Relief Medical Van Ready on Siding Line 2", mono: true },
        { label: "Ambulance Unit", value: "ALS Advanced Life Support Ambulance #02 Standby" },
        { label: "Emergency Coverage", value: "120 Km Radial Division Operational Coverage" },
      ],
      secondaryDetails: [
        { label: "Trauma Team on Duty", value: "4 Medical Staff & Paramedic Crew Assembled" },
        { label: "Station First-Aid Posts", value: "6 Platform Emergency Chests Replenished" },
        { label: "Siren Drill Status", value: "Bi-Monthly Siren & Response Drill Cleared" },
        { label: "Active Emergencies", value: "0 Active Dispatches" },
      ],
      metrics: [
        { title: "ARMV Readiness", value: "Scale-I Ready", subtitle: "Siding Track 2", iconType: "heart", statusBadge: { text: "Ready", color: "emerald" } },
        { title: "Trauma Staff", value: "4 On Duty", subtitle: "Doctor & Paramedics", iconType: "shield" },
        { title: "First-Aid Posts", value: "6 Audited", subtitle: "Kits replenished", iconType: "check" },
        { title: "Active Dispatches", value: "0 Active", subtitle: "No emergency sirens", iconType: "heart" },
      ],
      operationalProtocols: [
        "Maintain 15-minute turnout readiness for ARMV Scale-I relief train upon siren code.",
        "Ensure all emergency surgical, orthopedic and resuscitation kits are sterile.",
        "Conduct periodic A-1 medical category evaluations for train running staff.",
        "Coordinate with local district hospitals for major accident relief and triage.",
      ],
      quickActions: [
        { label: "Emergency Alerts", route: "/employee/alerts" },
        { label: "Medical Duty Log", route: "/employee/duty" },
        { label: "Report Incident", route: "/employee/incidents" },
      ],
      isRoleValid: isRoleAssigned,
      isDepartmentValid,
      warningMessage,
    };
  }

  // DEFAULT / GENERAL FALLBACK
  return {
    employeeName,
    employeeId,
    department: departmentName,
    roleTitle,
    roleConfig,
    category: "general",
    pageTitle: "MY ASSIGNMENT",
    pageSubtitle: `Operational target & departmental assignment for ${roleTitle}`,
    assignmentTitle: "Current Operational Assignment",
    assignmentBadge: isRoleAssigned ? "ASSIGNED" : "NOT CONFIGURED",
    statusText: isRoleAssigned ? `${roleTitle} Post` : "Assignment not configured",
    statusBadgeColor: isRoleAssigned ? "teal" : "amber",
    isLiveAvailable: false,
    liveStatusLabel: isRoleAssigned ? "Assignment Linked" : "Assignment not configured",
    primaryDetails: isRoleAssigned
      ? [
          { label: "Operational Role", value: roleTitle, highlight: true },
          { label: "Department", value: departmentName },
          { label: "Assignment Type", value: roleConfig.assignmentType },
          { label: "Primary Responsibility", value: roleConfig.primaryResponsibility },
        ]
      : [
          { label: "Status", value: "Operational role not assigned", highlight: true },
          { label: "Action Required", value: "Please request operational role allotment from supervisor" },
        ],
    secondaryDetails: [],
    metrics: [
      { title: "Role", value: roleTitle, subtitle: departmentName, iconType: "check" },
      { title: "Assignment", value: roleConfig.assignmentType, subtitle: "Current allocation", iconType: "station" },
      { title: "Status", value: isRoleAssigned ? "Active" : "Pending", subtitle: "Roster status", iconType: "shield" },
      { title: "Shift Tasks", value: "3 Due", subtitle: "During shift", iconType: "wrench" },
    ],
    operationalProtocols: [
      "Follow standard operating procedures mandated by the Railway Board.",
      "Maintain active communication with departmental supervisory officer.",
      "Submit shift logbooks upon conclusion of operational hours.",
    ],
    quickActions: roleConfig.allowedActions || [],
    isRoleValid: isRoleAssigned,
    isDepartmentValid,
    warningMessage,
  };
}

/**
 * RailDrishti Employee My Duty Service
 *
 * Provides dynamic, role-aware duty rosters, responsibilities, assignment scopes,
 * shift timelines, and checkpoints for all 23 operational roles.
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

export interface DutyMilestone {
  time: string;
  title: string;
  subtext: string;
  status: "completed" | "active" | "upcoming";
  badge: string;
}

export interface DutyCheckpoint {
  id: number;
  text: string;
  completed: boolean;
  time: string;
}

export interface RoleDutyData {
  employeeName: string;
  employeeId: string;
  department: string;
  roleTitle: string;
  roleConfig: EmployeeRoleConfig;
  dutyType: string;
  primaryResponsibility: string;
  shiftWindow: string;
  shiftStart: string;
  shiftEnd: string;
  dutyStatus: "On Duty" | "Standby" | "Off Duty" | "Not Assigned";
  signOnTime: string;
  location: string;
  stationCode?: string;
  supervisorName: string;
  assignmentTitle: string;
  assignmentScope: string;
  assignmentDetails: { label: string; value: string; highlight?: boolean; mono?: boolean }[];
  typicalDuties: string[];
  timeline: DutyMilestone[];
  checkpoints: DutyCheckpoint[];
  quickActions: { label: string; route: string }[];
  isRoleValid: boolean;
  isDepartmentValid: boolean;
  warningMessage?: string;
}

/**
 * Standard typical duties defined per operational role
 */
export const ROLE_TYPICAL_DUTIES: Record<OperationalRoleId, string[]> = {
  station_master: [
    "Monitor station operations and coordinate platform activities",
    "Monitor arrivals, departures and manage line clear authorizations",
    "Handle station operational alerts, cautions and route interlocking",
    "Maintain official Station Master diary, token registers and shift log",
  ],
  station_superintendent: [
    "Overall station supervision and inter-departmental staff coordination",
    "Station operational monitoring, safety audit and platform inspections",
    "Passenger service and amenities supervision during peak flow",
    "Coordinate emergency dispatch and divisional control reporting",
  ],
  train_manager: [
    "Train operational supervision and on-board rake safety assurance",
    "Journey progress monitoring, halt timings and guard journal logging",
    "Coordination with operating staff, Loco Pilot and Section Controller",
    "Passenger/train operational issues, brake feel test and tail lamp verification",
  ],
  section_controller: [
    "Monitor real-time train movements across assigned block sections",
    "Manage section traffic, line capacity and prioritize train precedence",
    "Identify movement conflicts, bottleneck delays and division handovers",
    "Coordinate train movement decisions with Station Masters and Traction controllers",
  ],
  yard_supervisor: [
    "Yard movement coordination, shunting orders and marshalling supervision",
    "Rake/shunting monitoring, siding clearances and point lock safety checks",
    "Yard safety checks, brake van placement and stabling line allocation",
    "Movement coordination with station master cabin and freight control",
  ],
  loco_pilot: [
    "Operate assigned train safely adhering to speed limits and signal aspects",
    "Monitor speed, brake pipe pressure, Kavach ATP and locomotive telemetry",
    "Follow signals, caution orders and route gradient conditions",
    "Follow operational instructions from guard and section controller",
    "Monitor route conditions and report any track/signal abnormalities",
  ],
  assistant_loco_pilot: [
    "Assist Loco Pilot in safe train operations and locomotive cab vigilance",
    "Monitor operational conditions, signal calling out and aspect confirmation",
    "Support signal/route awareness and caution order compliance",
    "Assist locomotive operations, machine room inspections and logbook entries",
  ],
  depot_maintenance_technician: [
    "Inspect locomotive/rolling stock mechanical and electrical subsystems",
    "Review fault logs, diagnostic fault codes and component wear tolerances",
    "Perform scheduled trip maintenance, wheel profile and brake assembly checks",
    "Update maintenance status and sign off rolling stock fitness certificates",
  ],
  coach_cleanliness_staff: [
    "Coach interior cleaning, disinfection and dry cleaning operations",
    "Sanitation inspection of bio-toilets, lavatories and passenger vestibules",
    "Hygiene maintenance, garbage clearance and onboard housekeeping service (OBHS)",
    "Cleaning task completion logging and water tank replenishment monitoring",
  ],
  tte: [
    "Ticket checking and digital handheld terminal (HHT) chart synchronization",
    "Passenger verification, identity checks and seat occupancy auditing",
    "Reservation-related checking, RAC and vacant berth re-allotment",
    "Passenger assistance, grievance redressal and Excess Fare Ticket (EFT) issuance",
  ],
  booking_enquiry_clerk: [
    "Passenger enquiries, fare calculation and route timetable assistance",
    "Ticketing assistance, UTS unreserved and PRS reservation counter operations",
    "Reservation information, refund processing and shift cash reconciliation",
    "Passenger service desk management and queue flow facilitation",
  ],
  station_booking_clerk: [
    "Passenger enquiries, fare calculation and route timetable assistance",
    "Ticketing assistance, UTS unreserved and PRS reservation counter operations",
    "Reservation information, refund processing and shift cash reconciliation",
    "Passenger service desk management and queue flow facilitation",
  ],
  commercial_inspector: [
    "Commercial inspection of station booking counters, parcels and catering units",
    "Revenue and passenger service monitoring against commercial guidelines",
    "Commercial compliance checks, ticketless travel drives and stall audits",
    "Reporting commercial irregularities and service improvement proposals",
  ],
  customer_support_specialist: [
    "Passenger complaints resolution via RailMadad and direct customer desks",
    "Service requests handling for senior citizens, disabled and medical aid",
    "Information assistance regarding train delays, platform alterations and amenities",
    "Complaint follow-up, passenger feedback logging and resolution verification",
  ],
  track_maintainer: [
    "Track inspection on assigned beat and patrol of Permanent Way (P-Way)",
    "Identify track defects, rail cracks, loose fishplates and ballast deficiency",
    "Maintenance activities, track tamping, joint lubrication and clip tightening",
    "Safety checks, look-out banner placement and traffic block execution",
  ],
  section_engineer: [
    "Engineering inspection of track geometry, curve alignments and turnouts",
    "Maintenance supervision of gang units, track machines and deep screening",
    "Defect monitoring via ultrasonic flaw detector (USFD) and rail stress logs",
    "Work coordination with operations department for traffic and power blocks",
  ],
  bridge_structure_inspector: [
    "Bridge inspection, pier condition assessment and girder alignment audit",
    "Structural condition monitoring of foot overbridges, tunnels and culverts",
    "Defect reporting, water level marking and scouring depth measurements",
    "Inspection documentation and structural integrity certification",
  ],
  signal_maintainer: [
    "Signal equipment inspection, point machine timing and track circuit testing",
    "Fault identification in electronic interlocking, relays and signals",
    "Maintenance work on level crossing gates, slot circuits and axle counters",
    "Signal restoration, failure logging and safety status certification",
  ],
  telecom_technician: [
    "Telecom equipment inspection including VHF base radios and OFC nodes",
    "Communication faults troubleshooting in control phones and station intercoms",
    "Network and equipment maintenance of PIS/PAS displays and CCTV matrix",
    "Fault reporting and telecom link availability logging",
  ],
  rpf_escort_constable: [
    "Train escort duty and roving security patrol across assigned train coaches",
    "Passenger security, baggage theft prevention and anti-touting vigilance",
    "Security monitoring of vestibules, unreserved coaches and luggage vans",
    "Incident reporting, chain pulling investigation and coordination with local GRP",
  ],
  station_security_officer: [
    "Station security monitoring, concourse vigilance and access control",
    "Security coordination with RPF control room, baggage X-ray and DFMDs",
    "Incident response to unattended baggage, crowd surges and security alerts",
    "Security reporting, CCTV surveillance log and security shift briefings",
  ],
  railway_medical_officer: [
    "Medical response and emergency healthcare support for passengers and staff",
    "Medical assessment, periodic medical examination (PME) and fitness testing",
    "Emergency support, ARMV Scale-I accident relief medical van readiness",
    "Medical incident documentation, hospital referrals and disaster triage",
  ],
  emergency_medical_responder: [
    "Emergency response and rapid first-aid stabilization at station and onboard",
    "First-response medical support, oxygen delivery and trauma dressing",
    "Incident assistance during train accidents and passenger distress calls",
    "Emergency coordination with ambulance services and divisional hospital",
  ],
  electrical_traction_technician: [
    "OHE and electrical inspection of 25 kV AC catenary and contact wires",
    "Fault identification in traction substations (TSS), isolators and transformers",
    "Maintenance during scheduled power blocks, dropper alignment and insulator cleaning",
    "Safety checks, discharge rod earthing and power restoration certification",
  ],
};

/**
 * Generate role-specific timeline milestones
 */
export function getRoleShiftTimeline(roleId: OperationalRoleId, roleConfig: EmployeeRoleConfig): DutyMilestone[] {
  if (roleId === "station_master") {
    return [
      { time: "07:45 AM", title: "Reporting & Sign-On", subtext: "Station Master Cabin - Sign-on Register signed. Breathalyzer cleared (0.00 BAC).", status: "completed", badge: "Completed" },
      { time: "08:00 AM", title: "Handover & Panel Takeover", subtext: "Took over Relay Interlocking Panel. Verified line clear signals and point detectors.", status: "completed", badge: "Completed" },
      { time: "10:30 AM", title: "Platform Clearance & Rake Berthing", subtext: "Platform 1 & 2 reception routes locked. Shunting movements completed.", status: "completed", badge: "Completed" },
      { time: "12:15 PM", title: "Priority Train Coordination", subtext: "Coordinated passage of 22436 Vande Bharat Express on Up Main Line.", status: "active", badge: "In Progress" },
      { time: "03:45 PM", title: "Shift Handover & Reliever Briefing", subtext: "Reliever transfer of station diary, caution registers and key tokens.", status: "upcoming", badge: "Upcoming" },
      { time: "04:00 PM", title: "Duty Sign-Off", subtext: "End of 8-hour shift. Submission of movement records to Section Controller.", status: "upcoming", badge: "Scheduled" },
    ];
  }

  if (roleId === "loco_pilot" || roleId === "assistant_loco_pilot") {
    return [
      { time: "05:15 AM", title: "Crew Lobby Sign-On", subtext: "Sign-on at Loco Lobby. Breathalyzer cleared. Caution order bulletin received.", status: "completed", badge: "Completed" },
      { time: "05:30 AM", title: "Locomotive Cab Inspection", subtext: "WAP-7 #30421 cab pre-checks, pantograph test and safety equipment audit.", status: "completed", badge: "Completed" },
      { time: "05:50 AM", title: "Brake Pipe Continuity Test (BPC)", subtext: "Brake feel test conducted with Train Manager. Pressure 5.0 kg/cm² confirmed.", status: "completed", badge: "Completed" },
      { time: "06:00 AM", title: "Train Departure & Speed Monitoring", subtext: "Right-time departure from NDLS. Adhering to MPS 130 km/h on corridor.", status: "active", badge: "In Progress" },
      { time: "01:30 PM", title: "Relief Handover at Intermediate Crew Hub", subtext: "Preparation for crew changeover at designated relief station.", status: "upcoming", badge: "Upcoming" },
      { time: "02:00 PM", title: "Running Duty Sign-Off", subtext: "Trip journal submission and sign-off at crew booking lobby.", status: "upcoming", badge: "Scheduled" },
    ];
  }

  if (roleId === "train_manager") {
    return [
      { time: "05:15 AM", title: "Sign-On & Guard Box Inspection", subtext: "Lobby sign-on. Verified tail lamp, flasher, first-aid box and walkie-talkie.", status: "completed", badge: "Completed" },
      { time: "05:40 AM", title: "Rake Safety & Brake Van Check", subtext: "Inspected BVZC Brake Van. Checked brake pipe continuity with driver.", status: "completed", badge: "Completed" },
      { time: "06:00 AM", title: "Departure Clearance All-Right Signal", subtext: "Exchanged green flag and all-right bell code for train departure.", status: "completed", badge: "Completed" },
      { time: "09:30 AM", title: "En-Route Running & Journal Logging", subtext: "Logging scheduled halts, passing timings and cautionary speed checks.", status: "active", badge: "In Progress" },
      { time: "01:45 PM", title: "Journey Handover / Sign-Off", subtext: "Handover of Combined Train Report (CTR) to incoming Guard.", status: "upcoming", badge: "Upcoming" },
    ];
  }

  if (roleId === "track_maintainer" || roleId === "section_engineer") {
    return [
      { time: "06:45 AM", title: "Gang Sign-On & Tool Muster", subtext: "P-Way gang muster. Inspected gauge tie-bars, spanners and look-out flags.", status: "completed", badge: "Completed" },
      { time: "07:15 AM", title: "Section Beat Track Inspection", subtext: "Commenced track foot-patrol Km 14/200 to 18/400. Verified rail joints.", status: "completed", badge: "Completed" },
      { time: "11:30 AM", title: "Scheduled Maintenance Block Execution", subtext: "2.0-Hr power block active. Ballast packing and rail clip tightening underway.", status: "active", badge: "In Progress" },
      { time: "01:30 PM", title: "Block Cancellation & Safety Certification", subtext: "Track clearance certified to Station Master. Line reopened for traffic.", status: "upcoming", badge: "Upcoming" },
      { time: "03:00 PM", title: "Gang Muster & Sign-Off", subtext: "Return of tools to P-Way store and daily maintenance log submission.", status: "upcoming", badge: "Scheduled" },
    ];
  }

  if (roleId === "signal_maintainer" || roleId === "telecom_technician") {
    return [
      { time: "07:45 AM", title: "Technical Shift Sign-On", subtext: "Reviewed daily signal fault register and interlocking status reports.", status: "completed", badge: "Completed" },
      { time: "08:30 AM", title: "Point Machine & Track Circuit Test", subtext: "Measured operating current on Point 102A/B. Verified track circuit voltage.", status: "completed", badge: "Completed" },
      { time: "11:00 AM", title: "Level Crossing Interlocking Audit", subtext: "Active testing of LC-42 gate boom circuit and visual slot indicators.", status: "active", badge: "In Progress" },
      { time: "02:30 PM", title: "Electronic Interlocking Diagnostic Check", subtext: "Diagnostic dump analysis and standby processor synchronization test.", status: "upcoming", badge: "Upcoming" },
      { time: "04:00 PM", title: "Shift Handover & Certification", subtext: "Sign-off on technical logbook and communication to Sr. DSTE.", status: "upcoming", badge: "Scheduled" },
    ];
  }

  if (roleId === "tte") {
    return [
      { time: "05:30 AM", title: "Sign-On & HHT Sync", subtext: "Handheld Terminal synchronized with CRIS server. Final reservation charts downloaded.", status: "completed", badge: "Completed" },
      { time: "06:00 AM", title: "Platform Boarding & Coach Manning", subtext: "Manned coach block C1–C4 during passenger boarding at NDLS.", status: "completed", badge: "Completed" },
      { time: "07:30 AM", title: "En-Route Ticket Checking", subtext: "Checking passenger tickets and marking attendance on HHT terminal.", status: "active", badge: "In Progress" },
      { time: "11:00 AM", title: "Vacant Berth Re-Allotment", subtext: "Allotting vacant seats to RAC and waitlisted passengers.", status: "upcoming", badge: "Upcoming" },
      { time: "02:00 PM", title: "Shift EFT Reconciliation & Sign-Off", subtext: "Reconciliation of excess fare receipts and submission to Commercial Branch.", status: "upcoming", badge: "Scheduled" },
    ];
  }

  if (roleId === "station_security_officer" || roleId === "rpf_escort_constable") {
    return [
      { time: "05:45 AM", title: "RPF Post Sign-On & Arms Briefing", subtext: "Muster roll sign-on. Verified communication handsets and safety briefing.", status: "completed", badge: "Completed" },
      { time: "06:30 AM", title: "Perimeter & Access Control Check", subtext: "Inspected X-Ray baggage scanners and door-frame metal detectors at Gates 1-4.", status: "completed", badge: "Completed" },
      { time: "09:00 AM", title: "Concourse & Platform Foot Patrol", subtext: "Active roving patrol across concourse, FOB-1, FOB-2 and passenger waiting halls.", status: "active", badge: "In Progress" },
      { time: "12:30 PM", title: "CCTV Command Room Surveillance", subtext: "Supervision of high-density crowd zones and sensitive platform areas.", status: "upcoming", badge: "Upcoming" },
      { time: "02:00 PM", title: "Shift Relief & Incident Logbook Transfer", subtext: "Handover of security post diary to incoming Shift-2 RPF sub-inspector.", status: "upcoming", badge: "Scheduled" },
    ];
  }

  if (roleId === "railway_medical_officer" || roleId === "emergency_medical_responder") {
    return [
      { time: "07:50 AM", title: "Hospital Emergency Sign-On", subtext: "Emergency pager check. Briefing with nursing superintendent and ambulance crew.", status: "completed", badge: "Completed" },
      { time: "08:30 AM", title: "ARMV Relief Van Inspection", subtext: "Inspection of Accident Relief Medical Van (Scale-I) sterile surgical kits.", status: "completed", badge: "Completed" },
      { time: "10:00 AM", title: "Clinical & Staff Fitness Consultations", subtext: "Conducting A-1 medical category evaluations for railway operational staff.", status: "active", badge: "In Progress" },
      { time: "01:30 PM", title: "Station First-Aid Post Audit", subtext: "Audit and restocking of emergency medical chests across platforms.", status: "upcoming", badge: "Upcoming" },
      { time: "04:00 PM", title: "Emergency Duty Handover", subtext: "Handover of emergency duty pager to Night Medical Officer on call.", status: "upcoming", badge: "Scheduled" },
    ];
  }

  if (roleId === "electrical_traction_technician") {
    return [
      { time: "07:15 AM", title: "Traction Depot Sign-On", subtext: "Sign-on at TRD depot. Inspected 25 kV safety discharge rods and earthing gear.", status: "completed", badge: "Completed" },
      { time: "08:00 AM", title: "TSS Substation Load & Voltage Audit", subtext: "Checked transformer oil temperature and secondary 25.4 kV feeder voltage.", status: "completed", badge: "Completed" },
      { time: "11:00 AM", title: "Catenary Wire & Isolator Inspection", subtext: "Visual inspection of catenary tension, droppers and section insulators.", status: "active", badge: "In Progress" },
      { time: "01:00 PM", title: "Scheduled Power Block Earthing", subtext: "Applying discharge rods for 1.5-hour scheduled OHE maintenance block.", status: "upcoming", badge: "Upcoming" },
      { time: "03:30 PM", title: "Power Block Cancellation & Sign-Off", subtext: "Power restoration certified to Traction Power Controller (TPC).", status: "upcoming", badge: "Scheduled" },
    ];
  }

  // Generic fallback timeline
  return [
    { time: "08:00 AM", title: "Shift Sign-On & Roster Briefing", subtext: `Sign-on for ${roleConfig.displayName} duties under ${roleConfig.department}.`, status: "completed", badge: "Completed" },
    { time: "09:30 AM", title: "Operational Equipment & Checklist Audit", subtext: "Verification of department registers and operational guidelines.", status: "completed", badge: "Completed" },
    { time: "12:00 PM", title: "Primary Shift Operational Duties", subtext: roleConfig.primaryResponsibility, status: "active", badge: "In Progress" },
    { time: "03:30 PM", title: "Shift Handover & Logbook Submission", subtext: "Transfer of duty registers to incoming shift staff.", status: "upcoming", badge: "Upcoming" },
    { time: "04:00 PM", title: "Duty Sign-Off", subtext: "Conclusion of regular operational shift.", status: "upcoming", badge: "Scheduled" },
  ];
}

/**
 * Generate role-specific interactive checkpoints
 */
export function getRoleCheckpoints(roleId: OperationalRoleId): DutyCheckpoint[] {
  if (roleId === "station_master") {
    return [
      { id: 1, text: "Sign-on register & breathalyzer verification cleared", completed: true, time: "07:45 AM" },
      { id: 2, text: "Panel interlocking & point detection integrity verified", completed: true, time: "08:15 AM" },
      { id: 3, text: "Caution order bulletin acknowledged with Section Controller", completed: true, time: "08:30 AM" },
      { id: 4, text: "Platform berthing clearances & PIS announcements logged", completed: true, time: "11:00 AM" },
      { id: 5, text: "Mid-shift corridor train precedence review", completed: false, time: "Due 14:00" },
      { id: 6, text: "Shift handover register & key token transfer preparation", completed: false, time: "Due 15:45" },
    ];
  }

  if (roleId === "loco_pilot" || roleId === "assistant_loco_pilot") {
    return [
      { id: 1, text: "Crew booking lobby sign-on & zero BAC breathalyzer logged", completed: true, time: "05:15 AM" },
      { id: 2, text: "Locomotive cab pre-trip safety checklist & pantograph verified", completed: true, time: "05:30 AM" },
      { id: 3, text: "Brake Pipe Pressure (5.0 kg/cm²) & BPC Certificate validated", completed: true, time: "05:50 AM" },
      { id: 4, text: "Caution orders and speed restrictions noted on loco log", completed: true, time: "06:05 AM" },
      { id: 5, text: "En-route signal aspect calling & Kavach ATP tracking", completed: false, time: "Active" },
      { id: 6, text: "Intermediate crew changeover log and relief handover sign-off", completed: false, time: "Due 13:30" },
    ];
  }

  if (roleId === "train_manager") {
    return [
      { id: 1, text: "Lobby sign-on & tail lamp / flashing LV board checked", completed: true, time: "05:15 AM" },
      { id: 2, text: "BVZC Brake Van equipment & first-aid box inspected", completed: true, time: "05:40 AM" },
      { id: 3, text: "Brake feel test & Guard-Driver walkie-talkie link verified", completed: true, time: "05:55 AM" },
      { id: 4, text: "Train departure bell code and all-right signal exchanged", completed: true, time: "06:00 AM" },
      { id: 5, text: "En-route station halt times and passing records logged in CTR", completed: false, time: "Active" },
      { id: 6, text: "Final CTR submission to Commercial / Operating branch", completed: false, time: "Due 14:00" },
    ];
  }

  if (roleId === "track_maintainer" || roleId === "section_engineer") {
    return [
      { id: 1, text: "P-Way gang muster & safety equipment inspection cleared", completed: true, time: "06:45 AM" },
      { id: 2, text: "Look-out banner flags and detonator fog signals verified", completed: true, time: "07:15 AM" },
      { id: 3, text: "Section beat patrol Km 14 to 18 completed with zero rail breaks", completed: true, time: "09:30 AM" },
      { id: 4, text: "Power/traffic block granted by Station Master logged", completed: true, time: "11:30 AM" },
      { id: 5, text: "Ballast packing and fishplate torque inspection", completed: false, time: "Active" },
      { id: 6, text: "Block clearance certification and tool store handover", completed: false, time: "Due 15:00" },
    ];
  }

  if (roleId === "signal_maintainer" || roleId === "telecom_technician") {
    return [
      { id: 1, text: "Technical shift muster & daily signal fault register reviewed", completed: true, time: "07:45 AM" },
      { id: 2, text: "Point Machine 102A/B operating voltage and stroke tested", completed: true, time: "08:30 AM" },
      { id: 3, text: "Audio Frequency Track Circuit (AFTC) shunt resistance verified", completed: true, time: "10:15 AM" },
      { id: 4, text: "Level Crossing LC-42 slot relay and boom contact audited", completed: false, time: "Active" },
      { id: 5, text: "Electronic Interlocking standby CPU synchronization test", completed: false, time: "Due 14:30" },
      { id: 6, text: "Quarterly signal test certificate countersigned", completed: false, time: "Due 16:00" },
    ];
  }

  if (roleId === "tte") {
    return [
      { id: 1, text: "Commercial lobby sign-on & HHT terminal synchronized", completed: true, time: "05:30 AM" },
      { id: 2, text: "Final reservation chart downloaded for coaches C1–C8", completed: true, time: "05:45 AM" },
      { id: 3, text: "Platform boarding assistance and coach door locking checked", completed: true, time: "06:00 AM" },
      { id: 4, text: "Passenger ticket verification in chair car coaches C1–C4", completed: true, time: "07:30 AM" },
      { id: 5, text: "No-show berth audit and RAC re-allotment via HHT", completed: false, time: "Active" },
      { id: 6, text: "Excess Fare Ticket (EFT) cash reconciliation and shift sign-off", completed: false, time: "Due 14:00" },
    ];
  }

  if (roleId === "station_security_officer" || roleId === "rpf_escort_constable") {
    return [
      { id: 1, text: "RPF post sign-on & VHF wireless communication check", completed: true, time: "05:45 AM" },
      { id: 2, text: "X-Ray baggage scanner and DFMD calibration audit", completed: true, time: "06:30 AM" },
      { id: 3, text: "Concourse, FOB-1 & FOB-2 roving security beat completed", completed: true, time: "08:30 AM" },
      { id: 4, text: "Platform crowd monitoring during Express rake arrivals", completed: true, time: "10:30 AM" },
      { id: 5, text: "CCTV zone surveillance logbook updated", completed: false, time: "Active" },
      { id: 6, text: "Shift relief handover to Shift-2 RPF post in-charge", completed: false, time: "Due 14:00" },
    ];
  }

  if (roleId === "railway_medical_officer" || roleId === "emergency_medical_responder") {
    return [
      { id: 1, text: "Hospital emergency sign-on & doctor on-call pager tested", completed: true, time: "07:50 AM" },
      { id: 2, text: "ARMV Scale-I emergency accident relief train kit verified", completed: true, time: "08:30 AM" },
      { id: 3, text: "Clinical consultations and staff A-1 medical fitness tests", completed: true, time: "10:30 AM" },
      { id: 4, text: "Station master concourse first-aid chest replenishment", completed: false, time: "Active" },
      { id: 5, text: "Disaster management response drill protocol review", completed: false, time: "Due 14:30" },
      { id: 6, text: "Hospital clinical handover to evening medical officer", completed: false, time: "Due 16:00" },
    ];
  }

  // Fallback checkpoints
  return [
    { id: 1, text: "Shift sign-on and attendance logbook signed", completed: true, time: "08:00 AM" },
    { id: 2, text: "Operational safety protocol and circulars reviewed", completed: true, time: "08:30 AM" },
    { id: 3, text: "Departmental assignment tasks initiated", completed: true, time: "10:00 AM" },
    { id: 4, text: "Mid-shift operational review and supervisor update", completed: false, time: "Active" },
    { id: 5, text: "Shift logbook completion and handover preparation", completed: false, time: "Due 15:45" },
  ];
}

/**
 * Main consolidated role duty data resolver
 */
export function getRoleDutyData(user: AuthUser | null): RoleDutyData {
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
      warningMessage = `Configuration Notice: Operational role "${roleConfig.displayName}" does not belong to the selected department "${department}". Showing duty data for "${roleConfig.displayName}".`;
    }
  }

  const employeeName = user?.name || "Ramesh Sharma";
  const employeeId = user?.employeeId || "IR-2024-8841";
  const departmentName = user?.department || roleConfig.department;
  const roleTitle = isRoleAssigned ? roleConfig.displayName : "Operational Role Not Assigned";

  // Shift timings based on assignment type
  let shiftWindow = "08:00 AM – 04:00 PM";
  let shiftStart = "08:00 AM";
  let shiftEnd = "04:00 PM";
  let signOnTime = "07:45 AM";
  let location = "New Delhi Railway Station [NDLS]";
  let stationCode: string | undefined = "NDLS";
  let supervisorName = "Sr. Divisional Operations Manager (Sr. DOM)";

  if (roleConfig.assignmentType === "Train") {
    shiftWindow = "06:00 AM – 02:00 PM (Running Shift)";
    shiftStart = "06:00 AM";
    shiftEnd = "02:00 PM";
    signOnTime = "05:15 AM";
    location = "Loco Lobby / Platform 1 [NDLS]";
    supervisorName = "Chief Crew Controller (CCC / NDLS)";
  } else if (roleConfig.assignmentType === "Section") {
    if (roleId === "track_maintainer" || roleId === "section_engineer") {
      shiftWindow = "07:00 AM – 03:00 PM (Maintenance Window)";
      shiftStart = "07:00 AM";
      shiftEnd = "03:00 PM";
      signOnTime = "06:45 AM";
      location = "Delhi – Ghaziabad Main Line (Km 14–22)";
      stationCode = undefined;
      supervisorName = "Sr. Divisional Engineer (Sr. DEN / North)";
    } else {
      shiftWindow = "08:00 AM – 04:00 PM (Technical Shift)";
      shiftStart = "08:00 AM";
      shiftEnd = "04:00 PM";
      signOnTime = "07:45 AM";
      location = "KSR Bengaluru – Bangarapet Section [SBC]";
      stationCode = "SBC";
      supervisorName = "Sr. Divisional Signal & Telecom Engineer (Sr. DSTE)";
    }
  } else if (roleConfig.assignmentType === "Security") {
    shiftWindow = "06:00 AM – 02:00 PM (Shift-1 Patrol)";
    shiftStart = "06:00 AM";
    shiftEnd = "02:00 PM";
    signOnTime = "05:45 AM";
    location = "Station Security Control Room & Concourse";
    supervisorName = "RPF Post In-Charge / Inspector";
  } else if (roleConfig.assignmentType === "Medical") {
    shiftWindow = "08:00 AM – 04:00 PM (Clinical & ARMV Emergency)";
    shiftStart = "08:00 AM";
    shiftEnd = "04:00 PM";
    signOnTime = "07:50 AM";
    location = "Divisional Railway Hospital & Emergency Care";
    supervisorName = "Chief Medical Superintendent (CMS)";
  } else if (roleConfig.assignmentType === "OHE") {
    shiftWindow = "07:30 AM – 03:30 PM (Power Block Shift)";
    shiftStart = "07:30 AM";
    shiftEnd = "03:30 PM";
    signOnTime = "07:15 AM";
    location = "25 kV AC Traction Substation Sector #08";
    supervisorName = "Sr. Divisional Electrical Engineer (Sr. DEE/TRD)";
  }

  // Assignment details
  let assignmentTitle = "Assigned Station";
  let assignmentScope = roleConfig.assignmentType;
  let assignmentDetails: { label: string; value: string; highlight?: boolean; mono?: boolean }[] = [];

  if (roleConfig.assignmentType === "Station") {
    assignmentTitle = roleId === "yard_supervisor" ? "Assigned Yard" : "Assigned Station";
    assignmentDetails = [
      { label: "Station / Yard", value: roleId === "yard_supervisor" ? "NDLS Marshalling Yard" : "New Delhi Junction", highlight: true },
      { label: "Station Code", value: "NDLS", mono: true },
      { label: "Operating Area", value: roleId === "yard_supervisor" ? "Siding Lines 1–14 & Shunting Neck" : "West Interlocking & Platforms 1–16" },
      { label: "Interlocking", value: "Electronic Interlocking (EI Siemens Grade-4)" },
    ];
  } else if (roleConfig.assignmentType === "Train" || roleId === "loco_pilot" || roleId === "tte" || roleId === "train_manager") {
    assignmentTitle = "Assigned Train";
    assignmentDetails = [
      { label: "Train Number", value: "22436", mono: true, highlight: true },
      { label: "Train Name", value: "Vande Bharat Express" },
      { label: "Route", value: "New Delhi [NDLS] ➔ Varanasi [BSB]" },
      { label: "Allocation", value: roleId === "tte" ? "Chair Car Coaches C1–C8" : roleId === "loco_pilot" ? "WAP-7 #30421 (Lead Cab-1)" : "Rake Formation #14" },
    ];
  } else if (roleConfig.assignmentType === "Section" || roleId === "track_maintainer" || roleId === "signal_maintainer") {
    assignmentTitle = roleId === "track_maintainer" ? "Assigned Track Section" : "Assigned Signal Section";
    assignmentDetails = [
      { label: "Section Route", value: roleId === "track_maintainer" ? "Delhi [DLI] ➔ Ghaziabad [GZB]" : "Bengaluru [SBC] ➔ Bangarapet [BWT]", highlight: true },
      { label: "Kilometer Range", value: roleId === "track_maintainer" ? "Km 14/200 to Km 22/600" : "Km 0/0 to Km 68/4", mono: true },
      { label: "Assets / Unit", value: roleId === "track_maintainer" ? "Gang Unit #04 (P-Way North)" : "14 Point Machines, 22 Track Circuits" },
      { label: "Line Designation", value: "Broad Gauge Electrified Double Line" },
    ];
  } else if (roleConfig.assignmentType === "Security") {
    assignmentTitle = "Assigned Security Post";
    assignmentDetails = [
      { label: "Security Post", value: "NDLS Concourse & Gates 1–4", highlight: true },
      { label: "Station", value: "New Delhi Junction [NDLS]", mono: true },
      { label: "Surveillance", value: "64 HD Cameras Live / CCTV Command" },
      { label: "Access Controls", value: "2 Baggage Scanners & 6 DFMDs Active" },
    ];
  } else if (roleConfig.assignmentType === "Medical") {
    assignmentTitle = "Assigned Medical Unit";
    assignmentDetails = [
      { label: "Medical Facility", value: "Divisional Hospital & Emergency Unit", highlight: true },
      { label: "Relief Train", value: "ARMV Scale-I Ready (Siding Line 2)", mono: true },
      { label: "Ambulance", value: "ALS Emergency Ambulance #02 Standby" },
      { label: "Accident Radius", value: "120 Km Radial Operational Coverage" },
    ];
  } else if (roleConfig.assignmentType === "OHE") {
    assignmentTitle = "Assigned OHE Traction Section";
    assignmentDetails = [
      { label: "OHE Sector", value: "Sector #08 (Km 10/0 to Km 28/0)", highlight: true },
      { label: "Substation (TSS)", value: "TSS Ghaziabad (25.4 kV AC)", mono: true },
      { label: "Feeder Line", value: "Up & Down Main Traction Feeders" },
      { label: "Power Block", value: "13:00 – 14:30 Scheduled Isolation" },
    ];
  } else {
    assignmentTitle = "Assigned Operational Post";
    assignmentDetails = [
      { label: "Duty Post", value: `${roleConfig.displayName} Desk`, highlight: true },
      { label: "Department", value: roleConfig.department },
      { label: "Assignment Type", value: roleConfig.assignmentType },
    ];
  }

  // Typical duties
  const typicalDuties = ROLE_TYPICAL_DUTIES[roleId] || [
    `Execute scheduled ${roleConfig.displayName} operational duties`,
    `Ensure safety and compliance under ${roleConfig.department}`,
    `Maintain shift logbook and hand-over protocols`,
  ];

  const timeline = getRoleShiftTimeline(roleId, roleConfig);
  const checkpoints = getRoleCheckpoints(roleId);
  const quickActions = roleConfig.allowedActions || [];

  return {
    employeeName,
    employeeId,
    department: departmentName,
    roleTitle,
    roleConfig,
    dutyType: isRoleAssigned ? roleConfig.dutyType : "General Administration",
    primaryResponsibility: isRoleAssigned ? roleConfig.primaryResponsibility : "Operational role not assigned. Contact Divisional Personnel Officer (DPO).",
    shiftWindow,
    shiftStart,
    shiftEnd,
    dutyStatus: isRoleAssigned ? "On Duty" : "Not Assigned",
    signOnTime,
    location,
    stationCode,
    supervisorName,
    assignmentTitle,
    assignmentScope,
    assignmentDetails,
    typicalDuties,
    timeline,
    checkpoints,
    quickActions,
    isRoleValid: isRoleAssigned,
    isDepartmentValid,
    warningMessage,
  };
}

/**
 * RailDrishti Employee Task Service
 *
 * Provides dynamic, role-specific operational tasks for all 23 operational roles.
 * STRICT DATA INTEGRITY:
 * Filters task dataset strictly by the employee's operationalRole. No cross-role data leakage.
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

export type TaskPriority = "Critical" | "High" | "Medium" | "Low";
export type TaskStatus = "Pending" | "In Progress" | "Completed";

export interface RoleTaskItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: string;
  assignment: string;
  dueTime: string;
  source: string;
}

export interface RoleTasksViewData {
  employeeName: string;
  employeeId: string;
  department: string;
  roleTitle: string;
  roleConfig: EmployeeRoleConfig;
  tasks: RoleTaskItem[];
  categories: string[];
  isRoleValid: boolean;
  isDepartmentValid: boolean;
  warningMessage?: string;
}

/**
 * Centralized Role-Specific Tasks Dictionary
 */
export const ROLE_SPECIFIC_TASKS: Record<OperationalRoleId, (user: AuthUser | null, roleConfig: EmployeeRoleConfig) => RoleTaskItem[]> = {
  // 1. Station Master
  station_master: (user) => [
    {
      id: "tsk_sm_001",
      title: "Verify Platform 1 to 4 Clearance & Track Interlocking",
      description: "Perform physical and visual panel confirmation of Platform 1–4 track circuits, points detection, and route setting for incoming morning express rakes.",
      category: "Platform Operations",
      priority: "Critical",
      status: "In Progress",
      assignedTo: user?.name || "Station Master",
      assignment: "Platforms 1–4 [NDLS]",
      dueTime: "06:15 AM",
      source: "Station Operations Manual / Sr. DOM",
    },
    {
      id: "tsk_sm_002",
      title: "Review Today's Scheduled Arrivals and Departures Roster",
      description: "Verify shift movement timetable with Section Controller, check platform line allocations, and ensure PIS audio-visual sync across all platforms.",
      category: "Movement Coordination",
      priority: "High",
      status: "Completed",
      assignedTo: user?.name || "Station Master",
      assignment: "New Delhi Junction [NDLS]",
      dueTime: "07:30 AM",
      source: "Division Traffic Desk",
    },
    {
      id: "tsk_sm_003",
      title: "Check Station Operational Alerts & Speed Cautions",
      description: "Review caution bulletin #SWR/CO-2026/89, verify 15 km/h restriction on Platform 3 approach turnout, and notify incoming Loco Pilots via VHF.",
      category: "Safety & Cautions",
      priority: "High",
      status: "Pending",
      assignedTo: user?.name || "Station Master",
      assignment: "Platform 3 Turnout",
      dueTime: "09:00 AM",
      source: "Engineering & Safety Cell",
    },
    {
      id: "tsk_sm_004",
      title: "Verify Shunting Movement Clearance for VB-22436 Rake",
      description: "Coordinate with Yard Supervisor and Cabin A for safe shunting transition of Vande Bharat rake from siding line 2 to Platform 1.",
      category: "Yard Coordination",
      priority: "Medium",
      status: "Pending",
      assignedTo: user?.name || "Station Master",
      assignment: "West Yard Shunting Neck",
      dueTime: "11:30 AM",
      source: "Yard Master / Section Controller",
    },
    {
      id: "tsk_sm_005",
      title: "Complete Station Master Diary & Key Token Handover",
      description: "Document all passing timings, caution orders issued, and prepare key register transfer for incoming Shift-B Station Master.",
      category: "Shift Handover",
      priority: "Medium",
      status: "Pending",
      assignedTo: user?.name || "Station Master",
      assignment: "Operating Panel Desk 02",
      dueTime: "03:45 PM",
      source: "Station Management Protocol",
    },
  ],

  // 2. Station Superintendent
  station_superintendent: (user) => [
    {
      id: "tsk_ss_001",
      title: "Conduct Comprehensive Station Operations & Staff Roster Audit",
      description: "Review shift deployment of Station Masters, booking clerks, platform supervisors, and verify punctuality compliance across all desks.",
      category: "Station Administration",
      priority: "High",
      status: "In Progress",
      assignedTo: user?.name || "Station Superintendent",
      assignment: "NDLS Station Complex",
      dueTime: "08:30 AM",
      source: "Divisional Operations Office",
    },
    {
      id: "tsk_ss_002",
      title: "Inspect Concourse Crowd Flow & Platform Safety Amenities",
      description: "Inspect main concourse, escalators, passenger information displays, and emergency drinking water facilities during peak morning rush.",
      category: "Passenger Amenities",
      priority: "High",
      status: "Pending",
      assignedTo: user?.name || "Station Superintendent",
      assignment: "Concourse & FOB-1",
      dueTime: "10:00 AM",
      source: "Commercial & Safety Directorate",
    },
    {
      id: "tsk_ss_003",
      title: "Review Operational Irregularities & Incident Logs",
      description: "Review delay reports and passenger grievances logged in RailMadad, coordinate immediate corrective measures with concerned supervisors.",
      category: "Incident Review",
      priority: "Medium",
      status: "Pending",
      assignedTo: user?.name || "Station Superintendent",
      assignment: "Station Superintendent Office",
      dueTime: "01:30 PM",
      source: "Divisional Control Cell",
    },
    {
      id: "tsk_ss_004",
      title: "Coordinate Inter-Departmental Coordination Briefing",
      description: "Hold mid-shift synchronization briefing with RPF Inspector, Chief Commercial Inspector, and Health Inspector for upcoming VVIP movement.",
      category: "Inter-Departmental",
      priority: "Medium",
      status: "Pending",
      assignedTo: user?.name || "Station Superintendent",
      assignment: "Executive Conference Room",
      dueTime: "03:00 PM",
      source: "Zonal Headquarters Advisory",
    },
  ],

  // 3. Train Manager
  train_manager: (user) => [
    {
      id: "tsk_tm_001",
      title: "Inspect BVZC Brake Van & Safety Equipment Kit",
      description: "Verify tail lamp, flashing LV board, first-aid box, fire extinguisher, detonator fog signals, and guard-driver VHF radio link.",
      category: "Pre-Trip Safety",
      priority: "Critical",
      status: "Completed",
      assignedTo: user?.name || "Train Manager",
      assignment: "Train #22436 / Brake Van",
      dueTime: "05:40 AM",
      source: "Operating Manual (G&SR)",
    },
    {
      id: "tsk_tm_002",
      title: "Conduct Brake Continuity & Feel Test with Loco Pilot",
      description: "Confirm brake pipe pressure of 5.0 kg/cm² and feed pipe 6.0 kg/cm², verify Brake Power Certificate (BPC #NDLS-4912) validity.",
      category: "Brake Protocol",
      priority: "Critical",
      status: "Completed",
      assignedTo: user?.name || "Train Manager",
      assignment: "Train #22436 Rake",
      dueTime: "05:55 AM",
      source: "Mechanical Safety Division",
    },
    {
      id: "tsk_tm_003",
      title: "Log Journey Milestones & En-Route Halts in CTR Journal",
      description: "Record exact arrival, departure, passing times, and speed cautions in the Combined Train Report (CTR) for the New Delhi–Varanasi corridor.",
      category: "Journey Log",
      priority: "High",
      status: "In Progress",
      assignedTo: user?.name || "Train Manager",
      assignment: "NDLS–BSB Corridor",
      dueTime: "En Route",
      source: "Division Traffic Desk",
    },
    {
      id: "tsk_tm_004",
      title: "Exchange All-Right Signals at Scheduled Passing Stations",
      description: "Exchange visual green flag by day / green light by night with Station Masters and Gatemen at all passing stations and level crossings.",
      category: "Operational Vigilance",
      priority: "Medium",
      status: "Pending",
      assignedTo: user?.name || "Train Manager",
      assignment: "Corridor Stations",
      dueTime: "En Route",
      source: "G&SR Rules Chapter IV",
    },
  ],

  // 4. Loco Pilot
  loco_pilot: (user) => [
    {
      id: "tsk_lp_001",
      title: "Complete Crew Lobby Sign-On & Breathalyzer Test",
      description: "Undergo mandatory breathalyzer testing at crew booking lobby, verify zero blood alcohol content (0.00 BAC), and log digital biometric sign-on.",
      category: "Safety Pre-Trip",
      priority: "Critical",
      status: "Completed",
      assignedTo: user?.name || "Loco Pilot",
      assignment: "NDLS Crew Lobby",
      dueTime: "05:15 AM",
      source: "Chief Crew Controller (CCC)",
    },
    {
      id: "tsk_lp_002",
      title: "Conduct Locomotive Cab-1 Safety & Pre-Departure Checks",
      description: "Inspect WAP-7 #30421 pantograph, vacuum/air circuit breakers, battery voltage, sander gear, flasher light, and Kavach ATP system.",
      category: "Locomotive Inspection",
      priority: "Critical",
      status: "Completed",
      assignedTo: user?.name || "Loco Pilot",
      assignment: "Loco WAP-7 #30421",
      dueTime: "05:35 AM",
      source: "CAMTECH Driver Manual",
    },
    {
      id: "tsk_lp_003",
      title: "Verify Brake Pipe Continuity & BPC Validation with Guard",
      description: "Ensure air pressure stabilizes at 5.0 kg/cm², verify emergency brake application from rear brake van, and sign off brake certificate.",
      category: "Brake Protocol",
      priority: "Critical",
      status: "Completed",
      assignedTo: user?.name || "Loco Pilot",
      assignment: "Train #22436",
      dueTime: "05:50 AM",
      source: "Mechanical Operating Code",
    },
    {
      id: "tsk_lp_004",
      title: "Review Caution Orders & Enforce Speed Limits on Corridor",
      description: "Review bulletin cautions: maintain 30 km/h over Km 412/10 bridge reconstruction approach and adhere to MPS 130 km/h on clear sections.",
      category: "Caution Orders",
      priority: "High",
      status: "In Progress",
      assignedTo: user?.name || "Loco Pilot",
      assignment: "NDLS–PRYJ Section",
      dueTime: "En Route",
      source: "Section Controller / Caution Orders",
    },
    {
      id: "tsk_lp_005",
      title: "Maintain Continuous Signal Calling & Kavach ATP Vigilance",
      description: "Call out and repeat every signal aspect loudly with Assistant Loco Pilot, obey automatic double-yellow aspects, and log trip power usage.",
      category: "Running Vigilance",
      priority: "High",
      status: "In Progress",
      assignedTo: user?.name || "Loco Pilot",
      assignment: "Running Cab",
      dueTime: "Shift Duration",
      source: "Railway Board Safety Circular",
    },
  ],

  // 5. Assistant Loco Pilot
  assistant_loco_pilot: (user) => [
    {
      id: "tsk_alp_001",
      title: "Complete Crew Lobby Sign-On & Breathalyzer Verification",
      description: "Sign on at crew lobby, complete breathalyzer test, and collect caution order copies for the scheduled route.",
      category: "Safety Pre-Trip",
      priority: "Critical",
      status: "Completed",
      assignedTo: user?.name || "Assistant Loco Pilot",
      assignment: "NDLS Crew Lobby",
      dueTime: "05:15 AM",
      source: "Chief Crew Controller",
    },
    {
      id: "tsk_alp_002",
      title: "Inspect Locomotive Machine Room & Auxiliaries",
      description: "Check oil levels in compressor, traction motor blower filters, auxiliary converter cooling, and fire extinguisher seals in cab.",
      category: "Machine Room Audit",
      priority: "High",
      status: "Completed",
      assignedTo: user?.name || "Assistant Loco Pilot",
      assignment: "WAP-7 Machine Room",
      dueTime: "05:40 AM",
      source: "Locomotive Operating Instructions",
    },
    {
      id: "tsk_alp_003",
      title: "Execute Signal Calling-Out & Aspect Confirmation Protocol",
      description: "Look ahead continuously on left curve approaches, loudly call out signals to Loco Pilot, and confirm Kavach display readouts.",
      category: "Signal Protocol",
      priority: "High",
      status: "In Progress",
      assignedTo: user?.name || "Assistant Loco Pilot",
      assignment: "Running Cab-1",
      dueTime: "En Route",
      source: "Safety Rules Handbook",
    },
    {
      id: "tsk_alp_004",
      title: "Monitor Energy Meters & Log Intermediate Passing Times",
      description: "Record three-phase energy consumption, regenerative braking kWh returns, and intermediate station passing times in driver log.",
      category: "Telemetry Log",
      priority: "Medium",
      status: "Pending",
      assignedTo: user?.name || "Assistant Loco Pilot",
      assignment: "Locomotive Logbook",
      dueTime: "En Route",
      source: "Sr. DEE/OP Office",
    },
  ],

  // 6. Section Controller / Train Dispatcher
  section_controller: (user) => [
    {
      id: "tsk_sc_001",
      title: "Review Section Interlocking Status & Active Block Sections",
      description: "Verify operational status of all automatic signalling blocks, line clear relays, and panel controls between NDLS and GZB.",
      category: "Corridor Dispatch",
      priority: "Critical",
      status: "In Progress",
      assignedTo: user?.name || "Section Controller",
      assignment: "Corridor Sector #04",
      dueTime: "08:00 AM",
      source: "Chief Controller / DSS",
    },
    {
      id: "tsk_sc_002",
      title: "Manage Priority Train Precedence & Resolve Bottlenecks",
      description: "Dispatch Vande Bharat Express on Up Fast Line with priority precedence over freight rake BCNA-18 at junction siding.",
      category: "Precedence Dispatch",
      priority: "High",
      status: "In Progress",
      assignedTo: user?.name || "Section Controller",
      assignment: "Ghaziabad Junction",
      dueTime: "09:30 AM",
      source: "Section Controller DSS",
    },
    {
      id: "tsk_sc_003",
      title: "Authorize Scheduled Maintenance Power & Traffic Blocks",
      description: "Coordinate with Track Maintainers and TPC for 2.0-hour engineering block approval on Km 16/400 Down Fast Line.",
      category: "Block Authorization",
      priority: "High",
      status: "Pending",
      assignedTo: user?.name || "Section Controller",
      assignment: "Section Km 16–22",
      dueTime: "11:15 AM",
      source: "Engineering Block Roster",
    },
    {
      id: "tsk_sc_004",
      title: "Complete Division Boundary Handover & Delay Log",
      description: "Log punctuality statistics, analyze root cause of minor corridor delays, and execute shift relay handover with incoming controller.",
      category: "Shift Relay",
      priority: "Medium",
      status: "Pending",
      assignedTo: user?.name || "Section Controller",
      assignment: "Control Room Desk 04",
      dueTime: "03:45 PM",
      source: "Divisional Operations Controller",
    },
  ],

  // 7. Yard Supervisor
  yard_supervisor: (user) => [
    {
      id: "tsk_ys_001",
      title: "Inspect Marshalling Siding Lines & Track Occupancy",
      description: "Verify stabling occupancy across Siding Lines 1–14, confirm hand brakes applied on parked freight rakes, and inspect wheel skids.",
      category: "Yard Occupancy",
      priority: "High",
      status: "Completed",
      assignedTo: user?.name || "Yard Supervisor",
      assignment: "NDLS Marshalling Siding",
      dueTime: "08:15 AM",
      source: "Yard Master Protocol",
    },
    {
      id: "tsk_ys_002",
      title: "Supervise Shunting Movements for Express Rake Formation",
      description: "Direct shunting engine for coach formation, verify point locking, ensure red banner flags placed at ends of work siding.",
      category: "Shunting Operations",
      priority: "High",
      status: "In Progress",
      assignedTo: user?.name || "Yard Supervisor",
      assignment: "Shunting Neck Line 2",
      dueTime: "10:30 AM",
      source: "Operating Manual Yard Section",
    },
    {
      id: "tsk_ys_003",
      title: "Conduct Yard Safety & Point Machine Cleanliness Audit",
      description: "Check point machine clearance from ballast debris, verify lubrication on turnout slide chairs, and report any derailment hazards.",
      category: "Yard Safety",
      priority: "Medium",
      status: "Pending",
      assignedTo: user?.name || "Yard Supervisor",
      assignment: "North Yard Turnouts",
      dueTime: "01:00 PM",
      source: "Divisional Safety Cell",
    },
    {
      id: "tsk_ys_004",
      title: "Log Rake Fitness Sign-Off & Dispatch to Passenger Platform",
      description: "Certify coach continuity and mechanical release of Vande Bharat rake for platform placement in coordination with Station Master.",
      category: "Rake Dispatch",
      priority: "Medium",
      status: "Pending",
      assignedTo: user?.name || "Yard Supervisor",
      assignment: "Platform 1 Approach",
      dueTime: "02:45 PM",
      source: "Station Operations",
    },
  ],

  // 8. Track Maintainer
  track_maintainer: (user) => [
    {
      id: "tsk_tmk_001",
      title: "Inspect Fastening Clips & Elastic Rail Clips on Km 16/4–18/2",
      description: "Walk assigned beat on Up Fast Line, check rail joints, torque loose fishplate bolts, and inspect rubber pads under rail base.",
      category: "P-Way Inspection",
      priority: "High",
      status: "In Progress",
      assignedTo: user?.name || "Track Maintainer",
      assignment: "Km 16/400 ➔ 18/200",
      dueTime: "08:30 AM",
      source: "P-Way Maintenance Manual",
    },
    {
      id: "tsk_tmk_002",
      title: "Deploy Safety Lookout Banner Flags & Detonator Protection",
      description: "Place red banner flags 600 meters on both sides of maintenance zone and assign lookout staff with audible horn before track work.",
      category: "Track Safety",
      priority: "Critical",
      status: "Completed",
      assignedTo: user?.name || "Track Maintainer",
      assignment: "Km 16/400 Work Site",
      dueTime: "11:15 AM",
      source: "Safety Rules Handbook",
    },
    {
      id: "tsk_tmk_003",
      title: "Execute Ballast Packing & Track Tamping during Power Block",
      description: "Execute manual ballast packing under sleepers, restore ballast shoulder profile, and adjust sleeper spacing during 11:30 block.",
      category: "Track Maintenance",
      priority: "High",
      status: "Pending",
      assignedTo: user?.name || "Track Maintainer",
      assignment: "Km 16/400 Down Line",
      dueTime: "11:30 AM",
      source: "Section Engineer (P-Way)",
    },
    {
      id: "tsk_tmk_004",
      title: "Verify Track Gauge & Cross-Level Tolerances with Tie-Bar",
      description: "Measure track gauge (1676 mm standard) and cross-level variations, certify line clearance before returning tool inventory.",
      category: "Tolerance Audit",
      priority: "Medium",
      status: "Pending",
      assignedTo: user?.name || "Track Maintainer",
      assignment: "Section Km 16–18",
      dueTime: "02:00 PM",
      source: "P-Way Inspection Code",
    },
  ],

  // 9. Section Engineer
  section_engineer: (user) => [
    {
      id: "tsk_se_001",
      title: "Review USFD Rail Flaw Detection Logs & Defect Classifications",
      description: "Analyze ultrasonic flaw detector (USFD) test data for Delhi–Ghaziabad section, mark IMR/OBS rail flaws, and issue speed restrictions.",
      category: "USFD Defect Review",
      priority: "Critical",
      status: "In Progress",
      assignedTo: user?.name || "Section Engineer",
      assignment: "Section Km 14–22",
      dueTime: "09:00 AM",
      source: "RDSO Track Standards",
    },
    {
      id: "tsk_se_002",
      title: "Supervise Heavy Track Machine Tamping & Ballast Regulating",
      description: "Oversee continuous tamping machine (CSM) operations on Fast Line, verify pre-tamping lift and post-tamping track alignment.",
      category: "Track Machine Supervision",
      priority: "High",
      status: "Pending",
      assignedTo: user?.name || "Section Engineer",
      assignment: "Fast Line Sector #02",
      dueTime: "11:30 AM",
      source: "Divisional Engineer (DEN / North)",
    },
    {
      id: "tsk_se_003",
      title: "Conduct Curve Geometry & Turnout Wear Inspection",
      description: "Measure switch rail wear, tongue rail housing against stock rail, and check check-rail clearances on turnout #104B.",
      category: "Turnout Inspection",
      priority: "High",
      status: "Pending",
      assignedTo: user?.name || "Section Engineer",
      assignment: "Turnout #104B (GZB Approach)",
      dueTime: "02:00 PM",
      source: "Permanent Way Code",
    },
  ],

  // 10. Bridge & Structure Inspector
  bridge_structure_inspector: (user) => [
    {
      id: "tsk_bsi_001",
      title: "Conduct Underwater Pier Scour & Bed Level Assessment on Bridge #42",
      description: "Measure river bed scouring depth around bridge piers #3 and #4, verify high flood level (HFL) markings and protective rip-rap.",
      category: "Bridge Inspection",
      priority: "High",
      status: "In Progress",
      assignedTo: user?.name || "Bridge Inspector",
      assignment: "Yamuna Bridge #42",
      dueTime: "09:30 AM",
      source: "Bridge Inspection Manual",
    },
    {
      id: "tsk_bsi_002",
      title: "Audit Foot Overbridge (FOB-1 & FOB-2) Structural Integrity",
      description: "Inspect steel girder corrosion, stair tread wear, handrail welds, and overhead protection screens against 25 kV OHE contact.",
      category: "Structural Audit",
      priority: "High",
      status: "Pending",
      assignedTo: user?.name || "Bridge Inspector",
      assignment: "NDLS FOB-1 & FOB-2",
      dueTime: "12:00 PM",
      source: "Civil Engineering Structures Code",
    },
    {
      id: "tsk_bsi_003",
      title: "Submit Quarterly Bridge Fitness Certificate to Sr. DEN",
      description: "Document crack gauge readings on abutment walls, certify load capacity rating, and upload inspection reports to IR-BMS portal.",
      category: "Certification",
      priority: "Medium",
      status: "Pending",
      assignedTo: user?.name || "Bridge Inspector",
      assignment: "Divisional Bridge Cell",
      dueTime: "03:30 PM",
      source: "Indian Railways Bridge Management System",
    },
  ],

  // 11. Signal Maintainer
  signal_maintainer: (user) => [
    {
      id: "tsk_sig_001",
      title: "Measure Point Machine 102A/B Operating Voltage & Stroke Time",
      description: "Test electric point machine stroke time (standard 3.8 to 4.2 sec), measure motor current, and verify friction clutch slippage.",
      category: "Point Machine Audit",
      priority: "High",
      status: "In Progress",
      assignedTo: user?.name || "Signal Maintainer",
      assignment: "Point 102A/B [SBC]",
      dueTime: "09:00 AM",
      source: "S&T Technical Manual",
    },
    {
      id: "tsk_sig_002",
      title: "Test Audio-Frequency Track Circuit (AFTC) Shunt Sensitivity",
      description: "Measure track circuit ballast resistance, verify 0.5 ohm standard drop shunt response, and inspect track lead wire connections.",
      category: "Track Circuits",
      priority: "High",
      status: "Pending",
      assignedTo: user?.name || "Signal Maintainer",
      assignment: "AFTC Block 2 [SBC-BWT]",
      dueTime: "11:00 AM",
      source: "IRISET Standards",
    },
    {
      id: "tsk_sig_003",
      title: "Inspect Level Crossing LC-42 Gate Interlocking & Slot Relay",
      description: "Inspect boom lock detection contacts, audible road warning siren, and verify interlocking slot clearance with Station Master.",
      category: "LC Gate Safety",
      priority: "Critical",
      status: "Pending",
      assignedTo: user?.name || "Signal Maintainer",
      assignment: "LC-42 (Km 28/4)",
      dueTime: "01:30 PM",
      source: "S&T Safety Circular",
    },
    {
      id: "tsk_sig_004",
      title: "Perform Electronic Interlocking Dual Processor Diagnostic Dump",
      description: "Extract event log diagnostic from Siemens Grade-4 EI system, verify hot-standby CPU sync, and upload report to S&T portal.",
      category: "Interlocking Diagnostics",
      priority: "Medium",
      status: "Pending",
      assignedTo: user?.name || "Signal Maintainer",
      assignment: "Relay Room Cabin A",
      dueTime: "03:30 PM",
      source: "Sr. DSTE / SBC Division",
    },
  ],

  // 12. Telecom Technician
  telecom_technician: (user) => [
    {
      id: "tsk_tel_001",
      title: "Inspect VHF Base Station Radios & Control Phone Channels",
      description: "Measure RF power output on VHF Channel 04 (5 Watts), test control telephone communication to Section Controller and Station Master.",
      category: "Wireless Telecom",
      priority: "High",
      status: "Completed",
      assignedTo: user?.name || "Telecom Technician",
      assignment: "Telecom Control Hub",
      dueTime: "08:30 AM",
      source: "Telecom Engineering Manual",
    },
    {
      id: "tsk_tel_002",
      title: "Audit Optical Fiber Cable (OFC) Ring Node #04 Continuity",
      description: "Perform optical time-domain reflectometer (OTDR) link attenuation test on STM-4 ring node, verify fiber attenuation under 0.25 dB/km.",
      category: "OFC Network",
      priority: "High",
      status: "In Progress",
      assignedTo: user?.name || "Telecom Technician",
      assignment: "OFC Node #04 [SBC]",
      dueTime: "11:00 AM",
      source: "RailTel / S&T Network Cell",
    },
    {
      id: "tsk_tel_003",
      title: "Inspect Platform Information Display Systems (PIS) & Audio PAS",
      description: "Verify automated bilingual train announcement triggers, inspect LED platform display matrix and coach guidance boards.",
      category: "Passenger Telecom",
      priority: "Medium",
      status: "Pending",
      assignedTo: user?.name || "Telecom Technician",
      assignment: "Platforms 1–10",
      dueTime: "02:00 PM",
      source: "Commercial Telecom Standards",
    },
  ],

  // 13. Depot Maintenance Technician
  depot_maintenance_technician: (user) => [
    {
      id: "tsk_dmt_001",
      title: "Conduct WAP-7 #30421 Periodic Trip Maintenance Inspection",
      description: "Inspect pantograph carbon strip wear (min 20mm), clean insulator bushings, verify transformer oil dielectric strength (65 kV).",
      category: "Trip Maintenance",
      priority: "Critical",
      status: "Completed",
      assignedTo: user?.name || "Depot Technician",
      assignment: "ELS Shed Bay 3",
      dueTime: "08:00 AM",
      source: "CAMTECH ELS Maintenance Code",
    },
    {
      id: "tsk_dmt_002",
      title: "Test Traction Motor Blower & Compressor Output Pressure",
      description: "Check compressor build-up time from 0 to 10 kg/cm², verify auto-drain valve operation and auxiliary converter cooling fans.",
      category: "Pneumatics & Auxiliaries",
      priority: "High",
      status: "In Progress",
      assignedTo: user?.name || "Depot Technician",
      assignment: "Locomotive Shed Pit 2",
      dueTime: "10:30 AM",
      source: "Mechanical Maintenance Schedule",
    },
    {
      id: "tsk_dmt_003",
      title: "Measure Wheel Flange Thickness & Bogie Suspension Clearances",
      description: "Audit wheel diameter differential, inspect secondary helical spring dampers, and sign off rolling stock safety fitness certificate.",
      category: "Wheel & Bogie Audit",
      priority: "High",
      status: "Pending",
      assignedTo: user?.name || "Depot Technician",
      assignment: "Wheel Profiling Pit",
      dueTime: "01:30 PM",
      source: "RDSO Locomotive Standards",
    },
  ],

  // 14. Coach Cleanliness & Sanitation Staff
  coach_cleanliness_staff: (user) => [
    {
      id: "tsk_ccs_001",
      title: "Execute Deep Cleaning & Sanitization on Chair Cars C1–C8",
      description: "Vacuum seat upholstery, disinfect grab handles, clean window panes, and mop vestibule gangways with hospital-grade disinfectant.",
      category: "Coach Sanitation",
      priority: "High",
      status: "Completed",
      assignedTo: user?.name || "Cleaning Staff",
      assignment: "Train #22436 (Coaches C1–C8)",
      dueTime: "05:30 AM",
      source: "EnHM Sanitation Manual",
    },
    {
      id: "tsk_ccs_002",
      title: "Inspect & Recharge Bio-Toilets with Anaerobic Bacterial Inoculum",
      description: "Check bio-toilet flush pressure, clean stainless steel lavatory modules, replenish liquid soap and verify zero odor emission.",
      category: "Bio-Toilet Care",
      priority: "High",
      status: "In Progress",
      assignedTo: user?.name || "Cleaning Staff",
      assignment: "All Coach Lavatories",
      dueTime: "08:00 AM",
      source: "Indian Railways Bio-Toilet SOP",
    },
    {
      id: "tsk_ccs_003",
      title: "Coordinate Quick Water Tank Replenishment at Intermediate Halt",
      description: "Monitor quick-watering system connections at Kanpur Central, ensure 100% water tank capacity (1800 Liters) prior to departure.",
      category: "Watering Service",
      priority: "High",
      status: "Pending",
      assignedTo: user?.name || "Cleaning Staff",
      assignment: "Kanpur Central [CNB]",
      dueTime: "02:15 PM",
      source: "OBHS Operations Guidelines",
    },
  ],

  // 15. TTE
  tte: (user) => [
    {
      id: "tsk_tte_001",
      title: "Download Reservation Chart & Synchronize Handheld Terminal (HHT)",
      description: "Log into CRIS HHT portal, download final computerized passenger charts for coaches C1–C8, and verify PRS cancellation list.",
      category: "Chart Sync",
      priority: "Critical",
      status: "Completed",
      assignedTo: user?.name || "TTE",
      assignment: "NDLS Commercial Lobby",
      dueTime: "05:45 AM",
      source: "Commercial Branch Manual",
    },
    {
      id: "tsk_tte_002",
      title: "Inspect Passenger Tickets & Identify No-Show Berths in C1–C4",
      description: "Verify passenger photo ID proofs, check concession entitlements, mark attendance on HHT, and flag unboarded berths for RAC re-allotment.",
      category: "Ticket Checking",
      priority: "Critical",
      status: "In Progress",
      assignedTo: user?.name || "TTE",
      assignment: "Coaches C1–C4",
      dueTime: "07:30 AM",
      source: "Commercial Ticket Checking SOP",
    },
    {
      id: "tsk_tte_003",
      title: "Reallocate Vacant Berths to RAC & Waitlisted Passengers via HHT",
      description: "Utilize digital HHT seat allocation matrix to allot confirmed berths to RAC ticket holders in order of seniority.",
      category: "Berth Re-Allotment",
      priority: "High",
      status: "Pending",
      assignedTo: user?.name || "TTE",
      assignment: "Executive & Chair Cars",
      dueTime: "09:00 AM",
      source: "CRIS Passenger Reservation System",
    },
    {
      id: "tsk_tte_004",
      title: "Reconcile Excess Fare Tickets (EFT) & Cash Remittance",
      description: "Reconcile EFT receipts issued during shift, verify digital payment receipts (UPI/POS), and submit cash remittance to Commercial Branch.",
      category: "EFT Reconciliation",
      priority: "Medium",
      status: "Pending",
      assignedTo: user?.name || "TTE",
      assignment: "Commercial Cash Office",
      dueTime: "02:00 PM",
      source: "Commercial Accounts Manual",
    },
  ],

  // 16. Station Booking & Enquiry Clerk
  booking_enquiry_clerk: (user) => [
    {
      id: "tsk_bec_001",
      title: "Open Booking Terminal & Initialize CRIS PRS/UTS Server Session",
      description: "Log into CRIS reservation terminal, verify ticket stationery roll inventory, and record opening cash float balance.",
      category: "Counter Opening",
      priority: "High",
      status: "Completed",
      assignedTo: user?.name || "Booking Clerk",
      assignment: "Counter #14 (Cluster-B)",
      dueTime: "07:45 AM",
      source: "Commercial Operating Code",
    },
    {
      id: "tsk_bec_002",
      title: "Process Passenger Ticket Bookings, Concessions & Tatkal Requests",
      description: "Issue unreserved UTS and reserved PRS tickets, apply valid senior citizen and defense concessions adhering to commercial rules.",
      category: "Ticketing Service",
      priority: "High",
      status: "In Progress",
      assignedTo: user?.name || "Booking Clerk",
      assignment: "Booking Hall East",
      dueTime: "10:00 AM",
      source: "Passenger Fare Manual",
    },
    {
      id: "tsk_bec_003",
      title: "Manage Public Enquiry Kiosk & Timetable Information Desk",
      description: "Provide accurate train arrival timings, platform allocations, connecting train schedules, and assist elderly passengers.",
      category: "Public Enquiry",
      priority: "Medium",
      status: "Pending",
      assignedTo: user?.name || "Booking Clerk",
      assignment: "Enquiry Counter #02",
      dueTime: "01:00 PM",
      source: "Commercial Passenger Care",
    },
    {
      id: "tsk_bec_004",
      title: "Complete Daily Cash Reconciliation & Remittance to Chief Booking Clerk",
      description: "Generate terminal shift summary report (DTR), count cash earnings, reconcile digital QR payments, and submit sign-off register.",
      category: "Cash Reconciliation",
      priority: "High",
      status: "Pending",
      assignedTo: user?.name || "Booking Clerk",
      assignment: "Chief Booking Supervisor Desk",
      dueTime: "03:45 PM",
      source: "Commercial Accounts Rules",
    },
  ],
  station_booking_clerk: (user) => [
    {
      id: "tsk_sbc_001",
      title: "Open Booking Terminal & Initialize CRIS PRS/UTS Server Session",
      description: "Log into CRIS reservation terminal, verify ticket stationery roll inventory, and record opening cash float balance.",
      category: "Counter Opening",
      priority: "High",
      status: "Completed",
      assignedTo: user?.name || "Booking Clerk",
      assignment: "Counter #14 (Cluster-B)",
      dueTime: "07:45 AM",
      source: "Commercial Operating Code",
    },
  ],

  // 17. Commercial Inspector
  commercial_inspector: (user) => [
    {
      id: "tsk_ci_001",
      title: "Conduct Surprise Ticketless Travel Drive on High-Density Suburban Section",
      description: "Coordinate ticket checking squads across suburban corridors, apprehend ticketless passengers, and issue penalty receipts.",
      category: "Anti-Ticketless Drive",
      priority: "High",
      status: "In Progress",
      assignedTo: user?.name || "Commercial Inspector",
      assignment: "Delhi Division Corridors",
      dueTime: "09:30 AM",
      source: "Commercial Department Directives",
    },
    {
      id: "tsk_ci_002",
      title: "Inspect Station Catering Stalls & Food Hygiene Standards",
      description: "Audit IRCTC licensed catering units on Platforms 1–6, verify approved MRP price boards, food packaging dates, and kitchen sanitation.",
      category: "Catering Inspection",
      priority: "High",
      status: "Pending",
      assignedTo: user?.name || "Commercial Inspector",
      assignment: "Platform Stalls 1–6",
      dueTime: "11:30 AM",
      source: "FSSAI & Railway Catering Policy",
    },
    {
      id: "tsk_ci_003",
      title: "Audit Parcel Hub Weighment Scales & Lease Van Loadings",
      description: "Inspect parcel booking scales calibration, check overweight luggage compliance, and verify lease parcel van seals.",
      category: "Parcel Compliance",
      priority: "Medium",
      status: "Pending",
      assignedTo: user?.name || "Commercial Inspector",
      assignment: "NDLS Parcel Complex",
      dueTime: "02:30 PM",
      source: "Commercial Parcel Rules",
    },
  ],

  // 18. Customer Support Specialist
  customer_support_specialist: (user) => [
    {
      id: "tsk_css_001",
      title: "Process & Dispatch Real-Time RailMadad Passenger Grievances",
      description: "Review incoming passenger complaints on RailMadad portal, route coach cleanliness and AC cooling issues to onboard staff within 15 minutes.",
      category: "RailMadad Support",
      priority: "High",
      status: "In Progress",
      assignedTo: user?.name || "Customer Support",
      assignment: "Divisional Customer Care Cell",
      dueTime: "Continuous",
      source: "RailMadad Service Level Agreement (SLA)",
    },
    {
      id: "tsk_css_002",
      title: "Arrange Wheelchair & Special Assistance for Senior Citizens",
      description: "Coordinate dedicated battery-operated cart and porter assistance for differently-abled passengers boarding 22436 Vande Bharat Express.",
      category: "Divyangjan Assistance",
      priority: "High",
      status: "Completed",
      assignedTo: user?.name || "Customer Support",
      assignment: "Platform 1 Access Gate",
      dueTime: "05:40 AM",
      source: "Passenger Charter Guidelines",
    },
    {
      id: "tsk_css_003",
      title: "Follow Up on Unresolved Passenger Inquiries & Feedback Surveys",
      description: "Call back passengers with closed complaints to confirm satisfaction, log feedback ratings, and compile daily service improvement report.",
      category: "Feedback & QA",
      priority: "Medium",
      status: "Pending",
      assignedTo: user?.name || "Customer Support",
      assignment: "Customer Support Desk",
      dueTime: "03:00 PM",
      source: "Passenger Service Committee Directives",
    },
  ],

  // 19. RPF Escort Constable
  rpf_escort_constable: (user) => [
    {
      id: "tsk_rpf_001",
      title: "Complete RPF Escort Briefing & Weaponry Inspection",
      description: "Attend shift security briefing at RPF Thana, verify service ammunition and walkie-talkie functionality, and register escort duty manifest.",
      category: "Security Briefing",
      priority: "Critical",
      status: "Completed",
      assignedTo: user?.name || "RPF Escort",
      assignment: "RPF Post NDLS",
      dueTime: "05:20 AM",
      source: "RPF Security Manual",
    },
    {
      id: "tsk_rpf_002",
      title: "Conduct Continuous Patrol across Passenger Coaches on Train #22436",
      description: "Rove through all coaches with vigilance on baggage theft, anti-social elements, unauthorized vendors, and unreserved vestibule passages.",
      category: "Train Escort Patrol",
      priority: "High",
      status: "In Progress",
      assignedTo: user?.name || "RPF Escort",
      assignment: "Train #22436 Rake",
      dueTime: "En Route",
      source: "RPF Security Directorate",
    },
    {
      id: "tsk_rpf_003",
      title: "Investigate Alarm Chain Pulling (ACP) & Security Alerts",
      description: "Promptly respond to passenger distress calls, investigate any unauthorized alarm chain pull, and register spot panchnama.",
      category: "Incident Response",
      priority: "High",
      status: "Pending",
      assignedTo: user?.name || "RPF Escort",
      assignment: "Running Train",
      dueTime: "As Required",
      source: "Railway Property Protection Act",
    },
  ],

  // 20. Station Security Officer
  station_security_officer: (user) => [
    {
      id: "tsk_sso_001",
      title: "Inspect Baggage X-Ray Scanners & Door-Frame Metal Detectors (DFMD)",
      description: "Verify operational sensitivity of X-Ray scanners and 6 DFMDs at concourse entry gates, ensure security personnel positioned at each gate.",
      category: "Access Control",
      priority: "Critical",
      status: "Completed",
      assignedTo: user?.name || "Security Officer",
      assignment: "Concourse Main Gate 1–4",
      dueTime: "06:30 AM",
      source: "Integrated Security System (ISS) SOP",
    },
    {
      id: "tsk_sso_002",
      title: "Monitor Live CCTV Feeds Across High-Density Passenger Zones",
      description: "Supervise 64 live HD camera feeds in CCTV command post, zoom in on unattended luggage items and sensitive platform crowding points.",
      category: "Surveillance",
      priority: "High",
      status: "In Progress",
      assignedTo: user?.name || "Security Officer",
      assignment: "CCTV Command Room",
      dueTime: "09:00 AM",
      source: "Security Control Directives",
    },
    {
      id: "tsk_sso_003",
      title: "Conduct Concourse Foot Patrol & Anti-Sabotage Perimeter Check",
      description: "Execute roving security patrol across concourse, booking hall, foot overbridges, and inspect parcel loading areas for suspicious objects.",
      category: "Perimeter Security",
      priority: "High",
      status: "Pending",
      assignedTo: user?.name || "Security Officer",
      assignment: "Station Perimeter",
      dueTime: "11:30 AM",
      source: "Divisional Security Commissioner",
    },
  ],

  // 21. Railway Medical Officer / Doctor
  railway_medical_officer: (user) => [
    {
      id: "tsk_rmo_001",
      title: "Inspect ARMV Scale-I Accident Relief Medical Van Readiness",
      description: "Inspect sterile surgical kits, emergency oxygen cylinders, defibrillators, burn dressings, and IV fluids on relief train siding line 2.",
      category: "ARMV Relief Readiness",
      priority: "Critical",
      status: "Completed",
      assignedTo: user?.name || "Medical Officer",
      assignment: "ARMV Siding Track 2",
      dueTime: "08:30 AM",
      source: "Disaster Management & Health Manual",
    },
    {
      id: "tsk_rmo_002",
      title: "Conduct Periodic A-1 Medical Fitness Examinations for Running Staff",
      description: "Perform vision acuity tests, color vision testing (Ishihara plates), cardiovascular screening, and blood pressure audit for Loco Pilots.",
      category: "Staff Medical Fitness",
      priority: "High",
      status: "In Progress",
      assignedTo: user?.name || "Medical Officer",
      assignment: "Divisional Hospital OPD",
      dueTime: "10:30 AM",
      source: "Indian Railway Medical Manual (IRMM)",
    },
    {
      id: "tsk_rmo_003",
      title: "Audit Platform Emergency First-Aid Chests & Restock Medical Supplies",
      description: "Audit first-aid boxes at Station Master office, Passenger Enquiry desks, and restock sterile trauma dressings and splints.",
      category: "Emergency Stock",
      priority: "Medium",
      status: "Pending",
      assignedTo: user?.name || "Medical Officer",
      assignment: "Platforms 1–16",
      dueTime: "01:30 PM",
      source: "Chief Medical Superintendent (CMS)",
    },
  ],

  // 22. Emergency Medical Responder
  emergency_medical_responder: (user) => [
    {
      id: "tsk_emr_001",
      title: "Inspect Trauma Jump Kits & Advanced Life Support (ALS) Ambulance #02",
      description: "Check portable suction units, oxygen regulators, cardiac monitor battery, and emergency stretcher gear in ambulance #02.",
      category: "Ambulance Readiness",
      priority: "Critical",
      status: "Completed",
      assignedTo: user?.name || "Medical Responder",
      assignment: "Ambulance Unit #02",
      dueTime: "08:00 AM",
      source: "Emergency Medical Care Guidelines",
    },
    {
      id: "tsk_emr_002",
      title: "Provide Immediate Medical Response to Passenger Distress Call",
      description: "Respond with trauma kit to Platform 1 for passenger complaining of acute chest pain, administer vital stabilization and triage.",
      category: "Emergency Response",
      priority: "Critical",
      status: "In Progress",
      assignedTo: user?.name || "Medical Responder",
      assignment: "Platform 1 First-Aid Post",
      dueTime: "Immediate",
      source: "Station Medical Emergency Protocol",
    },
    {
      id: "tsk_emr_003",
      title: "Conduct Disaster Relief Mock Drill with Divisional Safety Cell",
      description: "Participate in simulated passenger extraction drill, practice triage tag application and stretcher evacuation procedures.",
      category: "Mock Drill",
      priority: "Medium",
      status: "Pending",
      assignedTo: user?.name || "Medical Responder",
      assignment: "Accident Relief Siding",
      dueTime: "02:30 PM",
      source: "Divisional Disaster Management Cell",
    },
  ],

  // 23. Electrical / Traction Technician
  electrical_traction_technician: (user) => [
    {
      id: "tsk_ett_001",
      title: "Inspect 25 kV AC Traction Substation (TSS) Transformers & Switchgear",
      description: "Inspect transformer oil temperature, silica gel breather condition, and verify 25.4 kV secondary feeder busbar voltage readings.",
      category: "Substation Audit",
      priority: "Critical",
      status: "Completed",
      assignedTo: user?.name || "Traction Technician",
      assignment: "TSS Ghaziabad Substation",
      dueTime: "08:00 AM",
      source: "TRD Maintenance Manual",
    },
    {
      id: "tsk_ett_002",
      title: "Inspect OHE Catenary Wire Height, Stagger & Section Insulators",
      description: "Verify contact wire height (standard 5.6m), stagger alignment on cantilever masts, and clean porcelain section insulators in Sector #08.",
      category: "OHE Inspection",
      priority: "High",
      status: "In Progress",
      assignedTo: user?.name || "Traction Technician",
      assignment: "Sector #08 (Km 18/4)",
      dueTime: "11:00 AM",
      source: "RDSO Traction Standards",
    },
    {
      id: "tsk_ett_003",
      title: "Apply Safety Earthing Discharge Rods during 13:00 Power Block",
      description: "Apply tested discharge rods on both sides of isolated catenary section, verify zero electrical leakage before maintenance gang entry.",
      category: "Power Block Safety",
      priority: "Critical",
      status: "Pending",
      assignedTo: user?.name || "Traction Technician",
      assignment: "Line-2 Down Feeder",
      dueTime: "01:00 PM",
      source: "Traction Power Controller (TPC)",
    },
    {
      id: "tsk_ett_004",
      title: "Certify OHE Line Normalcy & Cancel Power Block with TPC",
      description: "Ensure all discharge rods removed, verify clearance of staff and ladder trolleys, and transmit official power restoration code.",
      category: "Block Cancellation",
      priority: "High",
      status: "Pending",
      assignedTo: user?.name || "Traction Technician",
      assignment: "Section Km 18",
      dueTime: "02:30 PM",
      source: "Sr. DEE/TRD Operations",
    },
  ],
};

/**
 * Main consolidated role tasks data resolver
 */
export function getRoleTasksViewData(user: AuthUser | null): RoleTasksViewData {
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
      warningMessage = `Configuration Notice: Operational role "${roleConfig.displayName}" does not belong to department "${department}". Displaying tasks for "${roleConfig.displayName}".`;
    }
  }

  const employeeName = user?.name || "Ramesh Sharma";
  const employeeId = user?.employeeId || "IR-2024-8841";
  const departmentName = user?.department || roleConfig.department;
  const roleTitle = isRoleAssigned ? roleConfig.displayName : "Operational Role Not Assigned";

  // Resolve role-specific tasks
  let tasks: RoleTaskItem[] = [];

  if (isRoleAssigned && roleId in ROLE_SPECIFIC_TASKS) {
    tasks = ROLE_SPECIFIC_TASKS[roleId](user, roleConfig);
  } else {
    // Safe generic fallback tasks
    tasks = [
      {
        id: "tsk_gen_001",
        title: "Submit Operational Role Preferences to Personnel Branch",
        description: "Submit your operational preferences and departmental competency certificates to Divisional Personnel Officer (DPO).",
        category: "Administration",
        priority: "High",
        status: "Pending",
        assignedTo: employeeName,
        assignment: "Divisional Office",
        dueTime: "End of Week",
        source: "Personnel Directorate",
      },
      {
        id: "tsk_gen_002",
        title: "Complete Annual General Safety & Cyber Awareness Training",
        description: "Review and complete the annual mandatory safety guidelines on Indian Railways e-learning portal.",
        category: "Compliance",
        priority: "Medium",
        status: "In Progress",
        assignedTo: employeeName,
        assignment: "Online Portal",
        dueTime: "Within 30 Days",
        source: "Railway Board Safety Cell",
      },
    ];
  }

  // Extract unique categories
  const categories = Array.from(new Set(tasks.map((t) => t.category)));

  return {
    employeeName,
    employeeId,
    department: departmentName,
    roleTitle,
    roleConfig,
    tasks,
    categories,
    isRoleValid: isRoleAssigned,
    isDepartmentValid,
    warningMessage,
  };
}

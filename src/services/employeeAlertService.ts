/**
 * RailDrishti Centralized Employee Alert & Notification Service
 *
 * Provides dynamic, role-specific operational alerts & notifications for all 23 operational roles.
 *
 * STRICT DATA INTEGRITY & ROLE FILTERING:
 * Filters alert and notification datasets strictly by the employee's operationalRole.
 * No cross-role data leakage (Loco Pilot !== Track Maintainer !== TTE !== Medical Officer).
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

export type AlertPriority = "Critical" | "High" | "Medium" | "Low" | "Informational";
export type AlertStatus = "ACTIVE" | "ACKNOWLEDGED";

export type AlertCategory =
  | "Operations"
  | "Safety"
  | "Maintenance"
  | "Train"
  | "Station"
  | "Platform"
  | "Security"
  | "Medical"
  | "Passenger Services"
  | "Engineering"
  | "Signal & Telecom"
  | "Electrical"
  | "Information";

export interface RoleAlertItem {
  id: string;
  title: string;
  message: string;
  category: AlertCategory;
  priority: AlertPriority;
  timestamp: string;
  assignment: string;
  source: string;
  read: boolean;
  status: AlertStatus;
  location?: string;
  section?: string;
  train?: string;
  delay?: string;
}

export interface RoleAlertsViewData {
  employeeName: string;
  employeeId: string;
  department: string;
  roleTitle: string;
  roleConfig: EmployeeRoleConfig;
  scopeLocation: string;
  scopeDescription: string;
  alerts: RoleAlertItem[];
  isRoleValid: boolean;
  isDepartmentValid: boolean;
  warningMessage?: string;
  isLiveApiData: boolean;
}

export type NotificationCategory =
  | "Operations"
  | "Duty"
  | "Tasks"
  | "Issues"
  | "Incidents"
  | "Safety"
  | "Security"
  | "Medical"
  | "System"
  | "TRAIN_UPDATE"
  | "TASK"
  | "WEATHER"
  | "OPERATIONAL_ALERT"
  | "DUTY"
  | "SYSTEM";

export interface RoleNotificationItem {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  categoryLabel: string;
  time: string;
  status: "UNREAD" | "READ";
  actionRoute?: string;
  actionLabel?: string;
  source?: string;
  assignment?: string;
}

export interface RoleNotificationsViewData {
  employeeName: string;
  employeeId: string;
  department: string;
  roleTitle: string;
  roleConfig: EmployeeRoleConfig;
  notifications: RoleNotificationItem[];
  isRoleValid: boolean;
  isDepartmentValid: boolean;
  warningMessage?: string;
}

// -------------------------------------------------------------
// CENTRALIZED ROLE-SPECIFIC OPERATIONAL ALERTS DICTIONARY
// -------------------------------------------------------------

export const ROLE_SPECIFIC_ALERTS: Record<
  OperationalRoleId,
  (_user: AuthUser | null, _roleConfig: EmployeeRoleConfig) => RoleAlertItem[]
> = {
  // 1. Station Master
  station_master: () => [
    {
      id: "alt_sm_001",
      title: "Platform 3 Turnout Micro-Fissure Caution",
      message: "Engineering gang reporting 15 km/h restriction on Platform 3 approach points 14A/B due to rail thermal expansion. Issue local caution order T/409.",
      category: "Platform",
      priority: "Critical",
      timestamp: "10 mins ago",
      assignment: "Platform 3 [NDLS]",
      location: "Platform 3 Turnout 14A",
      source: "Section Engineer (P-Way)",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_sm_002",
      title: "Platform Allocation Change: Train 12424 (DBRT RAJDHANI)",
      message: "Platform 2 reallocated to Platform 4 due to incoming express rake berthing delay. Sync auto-announcements and PIS display matrices immediately.",
      category: "Operations",
      priority: "High",
      timestamp: "24 mins ago",
      assignment: "New Delhi Junction [NDLS]",
      location: "Station Yard & PF-4",
      train: "12424 DBRT Rajdhani",
      source: "Section Controller / Traffic Desk",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_sm_003",
      title: "Arrival Disruption: Train 12004 Delay Advisory",
      message: "Train 12004 LKO Shatabdi running +28m late approaching Outer Home. Reschedule onward departure slot and hold Platform 1 clearance.",
      category: "Operations",
      priority: "Medium",
      timestamp: "45 mins ago",
      assignment: "Platform 1 [NDLS]",
      location: "Outer Signal Section",
      train: "12004 LKO Shatabdi",
      delay: "+28m",
      source: "COIS / Dispatch Desk",
      read: true,
      status: "ACKNOWLEDGED",
    },
    {
      id: "alt_sm_004",
      title: "Station Service Notice: Escalator #2 Maintenance",
      message: "Foot Overbridge (FOB) Escalator #2 at Platform 2-3 under scheduled electrical maintenance block until 14:00 hrs. Station guide signage posted.",
      category: "Information",
      priority: "Low",
      timestamp: "1 hr ago",
      assignment: "FOB Central Span",
      location: "Platform 2-3 FOB",
      source: "Station Electrical Cell",
      read: true,
      status: "ACKNOWLEDGED",
    },
  ],

  // 2. Station Superintendent
  station_superintendent: () => [
    {
      id: "alt_ss_001",
      title: "Station Safety Alert: Peak Crowd Influx at East Concourse",
      message: "Heavy passenger surge at Gate 3 & Booking Hall following simultaneous arrival of three express trains. Deploy additional RPF and commercial staff for barrier control.",
      category: "Safety",
      priority: "Critical",
      timestamp: "12 mins ago",
      assignment: "New Delhi Junction [NDLS]",
      location: "East Concourse & Gate 3",
      source: "Station CCTV Command Cell",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_ss_002",
      title: "Station Operational Disruption: Coach Watering Line Leakage",
      message: "Hydrant pipe pressure drop at washing line 4 impacting scheduled coach watering for outgoing Duronto Express. Mechanical depot supervisor on site.",
      category: "Operations",
      priority: "High",
      timestamp: "35 mins ago",
      assignment: "Washing Line 4",
      location: "Yard Siding 4",
      source: "Mechanical Depot Incharge",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_ss_003",
      title: "Staff Shift Roster Reassignment Notice",
      message: "Night shift commercial staff rotation updated for VIP inspection delegation scheduled at 18:00 hrs on Platform 1 executive lounge.",
      category: "Operations",
      priority: "Medium",
      timestamp: "1 hr ago",
      assignment: "Executive Lounge [NDLS]",
      location: "Platform 1 Concourse",
      source: "Sr. Divisional Commercial Manager",
      read: true,
      status: "ACKNOWLEDGED",
    },
  ],

  // 3. Train Manager
  train_manager: () => [
    {
      id: "alt_tm_001",
      title: "Brake Pipe Pressure Continuity Advisory",
      message: "Air brake continuity test verified at rear Guard Van (0.48 kg/cm² drop observed during initial test, normalized to 4.8 kg/cm²). Confirm loco pilot radio check.",
      category: "Train",
      priority: "Critical",
      timestamp: "14 mins ago",
      assignment: "Train 22436 (Vande Bharat)",
      location: "Rear Guard Van BVZC-901",
      train: "22436 Vande Bharat",
      source: "Depot TXR Staff / Loco Pilot",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_tm_002",
      title: "Route Operational Instruction: Automatic Signaling Section Block",
      message: "Caution order #38 active between Ghaziabad (GZB) and Aligarh (ALJN). Maximum permissible speed 110 km/h on loop line entry.",
      category: "Operations",
      priority: "High",
      timestamp: "32 mins ago",
      assignment: "Section GZB-ALJN",
      location: "Down Fast Line Km 42/10",
      train: "22436 Vande Bharat",
      source: "Section Controller / Chief Controller",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_tm_003",
      title: "Passenger Vestibule Safety Latch Verification",
      message: "Coach C5-C6 vestibule inter-car door latch inspected and secured after departure clearance from NDLS.",
      category: "Safety",
      priority: "Medium",
      timestamp: "1 hr ago",
      assignment: "Coach C5-C6",
      location: "Enroute",
      train: "22436 Vande Bharat",
      source: "Train Escort Staff",
      read: true,
      status: "ACKNOWLEDGED",
    },
  ],

  // 4. Loco Pilot
  loco_pilot: () => [
    {
      id: "alt_lp_001",
      title: "Safety-Critical Alert: Foggy Weather Caution Order #SWR-CO-89",
      message: "Dense morning fog reported between Km 45/10 and 68/00. Speed restricted to 60 km/h under yellow aspect, fog signal detonator protocol active.",
      category: "Safety",
      priority: "Critical",
      timestamp: "8 mins ago",
      assignment: "Train 22436 (WAP-7 #30455)",
      location: "Section NDLS - CNB Km 45/10",
      train: "22436 Vande Bharat",
      source: "Section Controller / Safety Directorate",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_lp_002",
      title: "Route Operational Alert: Signal Automatic Aspect Caution",
      message: "Signal S-42 at Km 54/12 operating in caution mode (Double Yellow). Keep braking curve ready for Home Signal approach at Dadri.",
      category: "Train",
      priority: "High",
      timestamp: "20 mins ago",
      assignment: "Loco Cab 1",
      location: "Signal Post S-42",
      train: "22436 Vande Bharat",
      source: "S&T Control Desk",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_lp_003",
      title: "Delay Advisory: Preceding Freight Train Clearance",
      message: "Down freight rake ahead clearing loop line at Dadri South. Expect 6-minute throttling delay before line clear signal green aspect.",
      category: "Operations",
      priority: "Medium",
      timestamp: "38 mins ago",
      assignment: "Loco Cab 1",
      location: "Dadri Junction Approach",
      train: "22436 Vande Bharat",
      delay: "+6m",
      source: "Train Dispatcher",
      read: true,
      status: "ACKNOWLEDGED",
    },
  ],

  // 5. Assistant Loco Pilot
  assistant_loco_pilot: () => [
    {
      id: "alt_alp_001",
      title: "Train Readiness: WAP-7 Bogie & Brake Cylinder Inspection",
      message: "Confirm air pressure 5.0 kg/cm² in Feed Pipe and 3.8 kg/cm² in Brake Cylinders. Check pantograph carbon strip visual integrity before departure.",
      category: "Train",
      priority: "Critical",
      timestamp: "15 mins ago",
      assignment: "Loco WAP-7 #30455",
      location: "Loco Shed Pitline",
      train: "22436 Vande Bharat",
      source: "Traction Loco Inspector",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_alp_002",
      title: "Operational Instruction: Vigilance Control Device (VCD) Test",
      message: "Conduct cyclic VCD reset test at stationary stop. Ensure foot pedal acknowledgment buzzer responds within 60 seconds interval.",
      category: "Safety",
      priority: "High",
      timestamp: "28 mins ago",
      assignment: "Loco Cab 1",
      location: "Departure Yard",
      train: "22436 Vande Bharat",
      source: "Loco Pilot / Sr. DEE (OP)",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_alp_003",
      title: "Route Alert: Neutral Section Phase Selector Caution",
      message: "Approach neutral section at Km 58/15 with main circuit breaker (DJ/BLDJ) opened as per standard traction instructions.",
      category: "Electrical",
      priority: "Medium",
      timestamp: "50 mins ago",
      assignment: "Loco Cab 1",
      location: "Km 58/15 Neutral Section",
      source: "OHE Traction Control",
      read: true,
      status: "ACKNOWLEDGED",
    },
  ],

  // 6. Section Controller / Train Dispatcher
  section_controller: () => [
    {
      id: "alt_sc_001",
      title: "Section Traffic Disruption: Up Line Points Failure at Chipyana",
      message: "Points 102B clamped and padlocked due to motor ground fault. Route locked for Straight line only. Divert slow freight to Down loop line.",
      category: "Operations",
      priority: "Critical",
      timestamp: "5 mins ago",
      assignment: "Delhi - Kanpur Main Line [Section A]",
      location: "Chipyana Buzurg Yard",
      source: "S&T Duty Officer / SMR",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_sc_002",
      title: "Train Movement Conflict: Precedence Resolution at Aligarh",
      message: "Train 12424 Rajdhani trailing 6 minutes behind Train 12004 Shatabdi. Grant precedence at ALJN Platform 2 loop line.",
      category: "Operations",
      priority: "High",
      timestamp: "18 mins ago",
      assignment: "Section A Control Board",
      location: "Aligarh Junction (ALJN)",
      source: "Automated DSS Algorithm",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_sc_003",
      title: "Operational Restriction: Engineering Speed Restriction 30 km/h",
      message: "Deep screening machine working between Km 112/00 and 113/20 under caution order. Enforce DSS headway separation buffers.",
      category: "Engineering",
      priority: "Medium",
      timestamp: "40 mins ago",
      assignment: "Section A Km 112",
      location: "Km 112/00 - 113/20",
      source: "Section Engineer (P-Way)",
      read: true,
      status: "ACKNOWLEDGED",
    },
  ],

  // 7. Yard Supervisor
  yard_supervisor: () => [
    {
      id: "alt_ys_001",
      title: "Yard Operational Alert: Shunting Collision Avoidance Clearance",
      message: "Ensure Shunting Engine #WDS-6 has come to complete halt at Stop Board 2 before allowing rake 12424 to reverse into Marshalling Line 3.",
      category: "Operations",
      priority: "Critical",
      timestamp: "10 mins ago",
      assignment: "Marshalling Yard Line 3",
      location: "West Marshalling Yard",
      source: "Yard Master / Cabin Incharge",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_ys_002",
      title: "Yard Readiness: Turnout Points #18 Greasing Required",
      message: "Stiffness observed in points 18 operating rod during morning shunting turn. Maintenance team alerted for swift lubrication.",
      category: "Maintenance",
      priority: "High",
      timestamp: "30 mins ago",
      assignment: "West Yard Points 18",
      location: "Shunting Neck",
      source: "Track Gang #4",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_ys_003",
      title: "Rake Placement Notification: Goods Siding Line 7",
      message: "Container rake placement completed on Siding Line 7. Handbrake pinned down and wooden wedges placed on terminal wheels.",
      category: "Information",
      priority: "Low",
      timestamp: "1 hr ago",
      assignment: "Siding Line 7",
      location: "Freight Terminal",
      source: "Yard Pointsman",
      read: true,
      status: "ACKNOWLEDGED",
    },
  ],

  // 8. Track Maintainer
  track_maintainer: () => [
    {
      id: "alt_tmk_001",
      title: "Track Defect: Rail Thermite Weld Defect at Km 48/12",
      message: "USFD testing identified flaw at weld joint Km 48/12 Down line. Clamp fishplate and monitor until emergency block window opens.",
      category: "Engineering",
      priority: "Critical",
      timestamp: "12 mins ago",
      assignment: "Section A (Km 40–55)",
      location: "Down Main Line Km 48/12",
      source: "USFD Inspection Team / Section Engineer",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_tmk_002",
      title: "Maintenance Block: 2-Hour Window Granted (11:00 - 13:00)",
      message: "Traffic & power block approved for tie-tamping machine and ballast shoulder dressing between Km 46/00 and 47/50.",
      category: "Maintenance",
      priority: "High",
      timestamp: "25 mins ago",
      assignment: "Km 46/00 - 47/50",
      location: "Up Main Line",
      source: "Section Controller / P-Way Control",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_tmk_003",
      title: "Section Safety: High Track Temperature Warning (58°C)",
      message: "Rail rail-thermometer reading 58°C (above TD+20). Initiate emergency hot weather patrolling on continuous welded rail (CWR) section.",
      category: "Safety",
      priority: "High",
      timestamp: "45 mins ago",
      assignment: "Beat #3 (Km 44–50)",
      location: "CWR Stretch",
      source: "P-Way Sub-Divisional Officer",
      read: true,
      status: "ACKNOWLEDGED",
    },
  ],

  // 9. Section Engineer
  section_engineer: () => [
    {
      id: "alt_se_001",
      title: "Engineering Issue: Ballast Deficiency on Turnout #21",
      message: "Ballast shoulder cushion measured below 250mm standard on high-speed crossover 21. Regulating machine dispatched for evening shift.",
      category: "Engineering",
      priority: "Critical",
      timestamp: "15 mins ago",
      assignment: "Civil Engineering Division A",
      location: "Crossover #21 Km 51/20",
      source: "Track Recording Car Report",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_se_002",
      title: "Inspection Requirement: Ultrasonic Flaw Detection (USFD) Review",
      message: "Review ultrasonic A-scan wave records for 18 thermite joints welded during last month's mega block.",
      category: "Maintenance",
      priority: "High",
      timestamp: "40 mins ago",
      assignment: "Divisional P-Way Lab",
      location: "Section Lab NDLS",
      source: "Sr. Divisional Engineer (Co-ord)",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_se_003",
      title: "Maintenance Activity: Track Machine Tamping Schedule",
      message: "CSM machine deployed for 4 km track packing tonight between 01:00 and 04:30 hrs. Ensure banner flags and detonators staged.",
      category: "Engineering",
      priority: "Medium",
      timestamp: "1 hr ago",
      assignment: "Km 55–59",
      location: "Down Fast Line",
      source: "Divisional Machine Control",
      read: true,
      status: "ACKNOWLEDGED",
    },
  ],

  // 10. Bridge & Structure Inspector
  bridge_structure_inspector: () => [
    {
      id: "alt_bsi_001",
      title: "Bridge Safety Alert: Scour Depth Sensor Alert on Pier #4",
      message: "River Yamuna Bridge #42 scour depth sensor recorded 3.2m sediment displacement after upstream reservoir discharge. Physical probe mandatory.",
      category: "Safety",
      priority: "Critical",
      timestamp: "18 mins ago",
      assignment: "Bridge #42 (Yamuna Span)",
      location: "Pier #4 Yamuna Bridge",
      source: "Hydrological Telemetry Sensor",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_bsi_002",
      title: "Structure Defect: Girder Bearing Expansion Roller Friction",
      message: "Elastomeric rocker bearing on Span 3 showing minor elastomer extrusion under dynamic braking loads. Schedule greasing & replacement.",
      category: "Engineering",
      priority: "High",
      timestamp: "50 mins ago",
      assignment: "Span 3 Bearings",
      location: "Bridge #42 Span 3",
      source: "Quarterly Bridge Audit Log",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_bsi_003",
      title: "Inspection Notification: Foot Overbridge Structural Audit",
      message: "Pre-monsoon metallurgical ultrasound scheduled for Station FOB welded lattice girders on Platform 1-2 span.",
      category: "Information",
      priority: "Low",
      timestamp: "2 hrs ago",
      assignment: "Station FOB #1",
      location: "NDLS Platform 1-2 Span",
      source: "Chief Bridge Engineer Office",
      read: true,
      status: "ACKNOWLEDGED",
    },
  ],

  // 11. Signal Maintainer
  signal_maintainer: () => [
    {
      id: "alt_smk_001",
      title: "Safety-Critical Signal Alert: Track Circuit TC-44 Audio Glitch",
      message: "High-voltage impulse track circuit TC-44 showing intermittent false drop indications under heavy rain. Inspect bonding wires and relay rack 3.",
      category: "Signal & Telecom",
      priority: "Critical",
      timestamp: "7 mins ago",
      assignment: "Relay Room & Signal Sector 2",
      location: "Signal Post S-14 / TC-44",
      source: "Data Logger Alarm / Section Controller",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_smk_002",
      title: "Signal Equipment Issue: Point Machine 104 Motor Current Surge",
      message: "Point machine operating current spiked to 4.8A (normal 2.5A) during reverse setting. Check friction clutch and point lock slide clearance.",
      category: "Maintenance",
      priority: "High",
      timestamp: "22 mins ago",
      assignment: "Point Machine 104A",
      location: "West Yard Crossover",
      source: "Electronic Interlocking Diagnostic",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_smk_003",
      title: "Maintenance Notification: Integrated Power Supply (IPS) Battery Test",
      message: "Quarterly battery capacity discharge test scheduled for 110V DC station IPS bank at 14:00 hrs.",
      category: "Signal & Telecom",
      priority: "Medium",
      timestamp: "1 hr ago",
      assignment: "IPS Power Room",
      location: "NDLS S&T Cabin",
      source: "Sr. DSTE (Signal)",
      read: true,
      status: "ACKNOWLEDGED",
    },
  ],

  // 12. Telecom Technician
  telecom_technician: () => [
    {
      id: "alt_tt_001",
      title: "Telecom Fault: VHF Driver-Guard Radio Repeater Link Down",
      message: "2W Simplex VHF repeater at Km 52 tower dropped RF carrier power. Switch over to standby transceiver channel 2.",
      category: "Signal & Telecom",
      priority: "Critical",
      timestamp: "11 mins ago",
      assignment: "Telecom Sector & OFC Hut",
      location: "Repeater Hut Km 52",
      source: "Network Management System (NMS)",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_tt_002",
      title: "Communication Service Disruption: Station Passenger PIS Server Sync",
      message: "Platform audio announcement audio codec packet loss detected on Platform 4 & 5. Restart edge encoder daemon.",
      category: "Passenger Services",
      priority: "High",
      timestamp: "33 mins ago",
      assignment: "PIS Server Room",
      location: "Central Concourse Server",
      source: "IT Telecom Cell",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_tt_003",
      title: "Maintenance Notification: Optical Fiber Cable OTDR Testing",
      message: "24-core OFC trunk line OTDR testing between Ghaziabad and Dadri scheduled for tonight's traffic shadow window.",
      category: "Maintenance",
      priority: "Medium",
      timestamp: "1 hr ago",
      assignment: "OFC Route GZB-DER",
      location: "Trackside Cable Trough",
      source: "Telecom Section Engineer",
      read: true,
      status: "ACKNOWLEDGED",
    },
  ],

  // 13. Loco / Depot Maintenance Technician
  depot_maintenance_technician: () => [
    {
      id: "alt_dmt_001",
      title: "Maintenance Priority Change: Loco WAP-7 #30211 Traction Motor Bearing",
      message: "Acoustic sensor flagged TM #3 bearing overheating (82°C vs 65°C baseline). Pull rake into bay 2 for emergency grease check and sensor calibration.",
      category: "Maintenance",
      priority: "Critical",
      timestamp: "14 mins ago",
      assignment: "Locomotive Shed Pitline Bay 2",
      location: "Depot Maintenance Bay 2",
      source: "Wayside Axle & Bearing Diagnostic Scanner",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_dmt_002",
      title: "Assigned Asset Issue: Air Compressor Oil Pressure Low on WAP-5",
      message: "Main compressor 1 oil level dropped to lower sight glass on WAP-5 #30018. Top up with 15W-40 lubricating oil before evening trip.",
      category: "Maintenance",
      priority: "High",
      timestamp: "45 mins ago",
      assignment: "Pitline Bay 4",
      location: "Loco Shed Bay 4",
      source: "Depot Daily Roster",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_dmt_003",
      title: "Depot Work Notification: Pantograph Strip Carbon Replacements",
      message: "Batch delivery of 40 metallized carbon collector strips received in depot store. Ready for scheduled weekly maintenance.",
      category: "Information",
      priority: "Low",
      timestamp: "2 hrs ago",
      assignment: "Depot Stores",
      location: "Mechanical Workshop",
      source: "Stores Superintendent",
      read: true,
      status: "ACKNOWLEDGED",
    },
  ],

  // 14. Coach Cleanliness & Sanitation Staff
  coach_cleanliness_staff: () => [
    {
      id: "alt_ccs_001",
      title: "Priority Cleaning Requirement: Bio-Toilet Bio-Digester Blockage in Coach B3",
      message: "Passenger report via RailMadad of bio-toilet flush vacuum malfunction in Coach B3 (Lavatory 2). Bio-clean team with vacuum suction pump dispatched.",
      category: "Maintenance",
      priority: "Critical",
      timestamp: "9 mins ago",
      assignment: "Coach Rake 12424 [Coach B3]",
      location: "Platform 4 Rake Berthing",
      train: "12424 DBRT Rajdhani",
      source: "RailMadad Escalation / Station Master",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_ccs_002",
      title: "Cleaning Assignment: Intensive Cleanliness Drive for VB-22436",
      message: "Executive chair cars EC1 & EC2 deep disinfection, aisle vacuuming, and glass panel sanitization due before 13:30 hrs turn-around departure.",
      category: "Passenger Services",
      priority: "High",
      timestamp: "30 mins ago",
      assignment: "Train 22436",
      location: "Platform 1",
      train: "22436 Vande Bharat",
      source: "OBHS Supervisor",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_ccs_003",
      title: "Disposal Notice: Waste Segregation Bins Cleared at Washing Siding",
      message: "Dry and wet garbage bags from coach pantry sections safely bagged and loaded to municipal compost transfer truck.",
      category: "Information",
      priority: "Low",
      timestamp: "1 hr ago",
      assignment: "Siding S-2",
      location: "Cleanliness Yard",
      source: "Sanitation Inspector",
      read: true,
      status: "ACKNOWLEDGED",
    },
  ],

  // 15. TTE (Traveling Ticket Examiner)
  tte: () => [
    {
      id: "alt_tte_001",
      title: "Assigned Train/Coach Update: VIP Delegation in Coach B1",
      message: "Ministry delegation boarding Coach B1 (Berths 1–8) at NDLS. Verify reservation chart synchronization on Handheld Terminal (HHT).",
      category: "Passenger Services",
      priority: "Critical",
      timestamp: "10 mins ago",
      assignment: "Train 12424 (DBRT RAJDHANI) - Coaches B1-B6",
      location: "Coach B1",
      train: "12424 DBRT Rajdhani",
      source: "Chief Ticket Inspector (CTI)",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_tte_002",
      title: "Duty Instruction: RAC / Waitlist Berth Allotment Sync",
      message: "HHT berth release protocol active. 14 vacant berths from Kanpur deboarding passengers released for automatic RAC upgrading.",
      category: "Operations",
      priority: "High",
      timestamp: "25 mins ago",
      assignment: "Coaches B1-B6",
      location: "Enroute",
      train: "12424 DBRT Rajdhani",
      source: "PRS Central Engine / HHT Sync",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_tte_003",
      title: "Passenger-Service Issue: Medical Assistance Request in B4 Seat 32",
      message: "Elderly passenger experiencing mild dizziness. Escort RPF and train medical kit requested. Station Doctor notified for CNB junction halt.",
      category: "Medical",
      priority: "High",
      timestamp: "40 mins ago",
      assignment: "Coach B4 Seat 32",
      location: "Coach B4",
      train: "12424 DBRT Rajdhani",
      source: "Passenger RailMadad #RM-99412",
      read: true,
      status: "ACKNOWLEDGED",
    },
  ],

  // 16. Station Booking & Enquiry Clerk
  booking_enquiry_clerk: () => [
    {
      id: "alt_bec_001",
      title: "Booking System Issue: UTS Counter Network Latency Spike",
      message: "Core database latency increased by 350ms on UTS Counter Cluster 4. Backup switchover in progress. Issue manual slip if printer queue stalls.",
      category: "Passenger Services",
      priority: "Critical",
      timestamp: "6 mins ago",
      assignment: "Booking Counter Hall #2 [NDLS]",
      location: "UTS Counter 4-8",
      source: "CRIS System Network Monitor",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_bec_002",
      title: "Passenger Service Disruption: Tatkal Quota Counter Surge",
      message: "Tatkal opening window at 10:00 hrs for sleeper classes. Ensure token queue display boards and CCTV security monitoring are active.",
      category: "Passenger Services",
      priority: "High",
      timestamp: "20 mins ago",
      assignment: "Counters 1-12",
      location: "Main Reservation Concourse",
      source: "Chief Booking Supervisor (CBS)",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_bec_003",
      title: "Important Passenger Notice: Special Holiday Train Schedule",
      message: "Special Express Train 04011 (NDLS - PNBE) declared for festive rush with 18 unreserved coaches. Announce counter tickets open at Window 9.",
      category: "Information",
      priority: "Medium",
      timestamp: "1 hr ago",
      assignment: "Information Kiosk",
      location: "Enquiry Counter",
      source: "Commercial Traffic Circular",
      read: true,
      status: "ACKNOWLEDGED",
    },
  ],
  station_booking_clerk: (u, cfg) => ROLE_SPECIFIC_ALERTS.booking_enquiry_clerk(u, cfg),

  // 17. Commercial Inspector
  commercial_inspector: () => [
    {
      id: "alt_ci_001",
      title: "Commercial Inspection Requirement: Catering Unit Hygiene Audit",
      message: "Surprise quality & hygiene inspection mandated for IRCTC Jan Aahar canteen and mobile vendors on Platforms 1, 2, and 3.",
      category: "Passenger Services",
      priority: "Critical",
      timestamp: "15 mins ago",
      assignment: "Station Commercial Premises",
      location: "Jan Aahar Unit Platform 2",
      source: "Sr. Divisional Commercial Manager",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_ci_002",
      title: "Passenger Service Issue: Overcharging Complaint at Stall #14",
      message: "RailMadad complaint against Stall #14 for selling packaged water above MRP. Inspect billing machine records and issue penalty notice.",
      category: "Passenger Services",
      priority: "High",
      timestamp: "45 mins ago",
      assignment: "Platform 3 Vendor Stalls",
      location: "Stall #14",
      source: "RailMadad Complaint #RM-88124",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_ci_003",
      title: "Service Notification: Parcel Booking Weighbridge Calibration",
      message: "Annual stamped calibration for 5-tonne electronic parcel weighbridge scheduled for 15:30 hrs.",
      category: "Information",
      priority: "Low",
      timestamp: "2 hrs ago",
      assignment: "Parcel Office Weighbridge",
      location: "Parcel Office NDLS",
      source: "Weights & Measures Department",
      read: true,
      status: "ACKNOWLEDGED",
    },
  ],

  // 18. Customer Support Specialist
  customer_support_specialist: () => [
    {
      id: "alt_css_001",
      title: "Service Complaint Requiring Attention: Wheelchair Assistance Escalation",
      message: "Senior citizen passenger aboard Train 12004 requiring battery-operated buggy transfer from Platform 1 to Exit Gate 2. Porter assistance assigned.",
      category: "Passenger Services",
      priority: "Critical",
      timestamp: "8 mins ago",
      assignment: "Helpdesk & Passenger Facilitation",
      location: "Platform 1 Help Desk",
      source: "RailMadad High-Priority Ticket #HP-004",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_css_002",
      title: "Passenger Support Issue: Lost Luggage Claim in Waiting Lounge",
      message: "Black trolley bag left unattended in AC First Class waiting lounge. Handed over to RPF Lost & Found office with luggage receipt #LF-802.",
      category: "Passenger Services",
      priority: "High",
      timestamp: "28 mins ago",
      assignment: "Executive Waiting Hall",
      location: "AC Waiting Lounge",
      source: "Station Security / Customer Help Desk",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_css_003",
      title: "Passenger Information Update: Train Rescheduling Announcement",
      message: "Train 12423 departure revised to 16:45 hrs. Ensure SMS broadcast dispatched to 1,240 ticketed passengers.",
      category: "Information",
      priority: "Medium",
      timestamp: "1 hr ago",
      assignment: "Public Information Desk",
      location: "Main Helpdesk",
      source: "Division Passenger Operations",
      read: true,
      status: "ACKNOWLEDGED",
    },
  ],

  // 19. RPF Escort Constable
  rpf_escort_constable: () => [
    {
      id: "alt_rpf_001",
      title: "Safety-Critical Notification: Security Patrol in AC & Sleeper Coaches",
      message: "Conduct joint foot patrol with Train Manager through Coaches S1-S6 and B1-B4 between Ghaziabad and Tundla junction. Keep VHF channel 1 active.",
      category: "Security",
      priority: "Critical",
      timestamp: "10 mins ago",
      assignment: "Train 12424 Security Escort",
      location: "Enroute Train 12424",
      train: "12424 DBRT Rajdhani",
      source: "RPF Security Control Room",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_rpf_002",
      title: "Security Incident: Unauthorized Hawkers Detained on Platform 4",
      message: "Three unauthorized vendors intercepted during boarding attempt at Coach S3. Handed over to RPF Post NDLS under Railway Act Sec 144.",
      category: "Security",
      priority: "High",
      timestamp: "32 mins ago",
      assignment: "Platform 4",
      location: "NDLS Platform 4",
      source: "RPF Station Duty Officer",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_rpf_003",
      title: "Journey Security Alert: High-Alert Sector Advisory",
      message: "Enhanced vigilance protocol active for overnight transit through sensitive bridge sections. Ensure emergency searchlights charged.",
      category: "Security",
      priority: "Medium",
      timestamp: "1 hr ago",
      assignment: "Guard & RPF Compartment",
      location: "Section GZB - CNB",
      source: "Security Commissioner / RPF HQ",
      read: true,
      status: "ACKNOWLEDGED",
    },
  ],

  // 20. Station Security Officer
  station_security_officer: () => [
    {
      id: "alt_sso_001",
      title: "Station Security Incident: Unattended Baggage at Concourse Pillar 7",
      message: "CCTV AI baggage detection triggered alarm on unattended package near Pillar 7 for 22 minutes. Bomb Detection & Disposal Squad (BDDS) and dog squad dispatched.",
      category: "Security",
      priority: "Critical",
      timestamp: "6 mins ago",
      assignment: "Station Security Post & CCTV Cell",
      location: "Main Concourse Pillar 7",
      source: "AI CCTV Analytics / RPF Inspector",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_sso_002",
      title: "Security Instruction: Door Frame Metal Detector (DFMD) Sensitivity Check",
      message: "Recalibrate DFMD gates 1, 2, and 4 before peak evening passenger rush. Ensure hand-held scanners operational for all baggage check lanes.",
      category: "Security",
      priority: "High",
      timestamp: "25 mins ago",
      assignment: "Entry Gates 1-4",
      location: "Main Entrance",
      source: "Assistant Security Commissioner",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_sso_003",
      title: "Emergency Notification: Evacuation Route Clearance Verification",
      message: "Inspect all 8 emergency exit fire gates on Platforms 1 to 16. Ensure panic bars unobstructed by parcel carts.",
      category: "Safety",
      priority: "Medium",
      timestamp: "1 hr ago",
      assignment: "Station Perimeter",
      location: "Platforms 1-16 Exit Gates",
      source: "Station Disaster Management Cell",
      read: true,
      status: "ACKNOWLEDGED",
    },
  ],

  // 21. Railway Medical Officer / Doctor
  railway_medical_officer: () => [
    {
      id: "alt_rmo_001",
      title: "Emergency Medical Assignment: Cardiac Response on Train 12424",
      message: "Emergency call received for passenger in Coach B2 Seat 14 experiencing severe chest pain. Immediate platform attendance required at Platform 3 berthing (ETA 10:18).",
      category: "Medical",
      priority: "Critical",
      timestamp: "4 mins ago",
      assignment: "Divisional Railway Hospital & First Aid Post",
      location: "Platform 3 Berthing",
      train: "12424 DBRT Rajdhani",
      source: "Station Superintendent / Train Manager",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_rmo_002",
      title: "Medical Incident: Stretcher Evacuation Coordinated at Gate 1",
      message: "Patient stabilized with oxygen support. Divisional ambulance staged at Gate 1 for transfer to Central Railway Hospital ICU.",
      category: "Medical",
      priority: "High",
      timestamp: "20 mins ago",
      assignment: "Emergency Medical Room",
      location: "Gate 1 Ambulance Bay",
      source: "Chief Medical Superintendent (CMS)",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_rmo_003",
      title: "Station Medical Notification: First Aid Box & Automated Defibrillator (AED) Audit",
      message: "Monthly inspection of 12 station AED units and emergency trauma medical kits completed across all platform booths.",
      category: "Safety",
      priority: "Medium",
      timestamp: "1 hr ago",
      assignment: "Station First Aid Units",
      location: "Platforms 1-16 First Aid Booths",
      source: "Health Inspector / Medical Directorate",
      read: true,
      status: "ACKNOWLEDGED",
    },
  ],

  // 22. Emergency Medical Responder
  emergency_medical_responder: () => [
    {
      id: "alt_emr_001",
      title: "Emergency Response Request: Rapid Response First Aid on Platform 2",
      message: "Passenger collapsed near tea kiosk on Platform 2. Carry AED unit, portable oxygen concentrator, and vitals monitor immediately.",
      category: "Medical",
      priority: "Critical",
      timestamp: "3 mins ago",
      assignment: "Emergency First Aid Post & Ambulance",
      location: "Platform 2 Mid-Section",
      source: "Station Master / Public Help Desk",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_emr_002",
      title: "Medical Response Requirement: Blood Sugar / Vitals Kit Restock",
      message: "Restock emergency glucometer strips, sterile dressings, and burn gel packets in trauma response backpack #2.",
      category: "Medical",
      priority: "High",
      timestamp: "35 mins ago",
      assignment: "First Aid Room #1",
      location: "Station Clinic",
      source: "Duty Medical Officer",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_emr_003",
      title: "Response Priority Notification: Ambulance Route Drill Conducted",
      message: "Emergency transit time test from Gate 2 to Platform 1 ramp clocked at 2 minutes 15 seconds. Route clear of obstructions.",
      category: "Information",
      priority: "Low",
      timestamp: "2 hrs ago",
      assignment: "Ambulance Access Route",
      location: "Station East Ramp",
      source: "Disaster Response Team",
      read: true,
      status: "ACKNOWLEDGED",
    },
  ],

  // 23. Electrical Traction Technician (OHE)
  electrical_traction_technician: () => [
    {
      id: "alt_ett_001",
      title: "OHE Power Issue: Contact Wire Tension Drop at Mast 42/18",
      message: "Auto-tensioning device (ATD) weight displacement detected on Down line Mast 42/18. Contact wire height reduced by 40mm. Tower wagon dispatched.",
      category: "Electrical",
      priority: "Critical",
      timestamp: "9 mins ago",
      assignment: "Traction Sub-Station & OHE Sector 1",
      location: "Mast 42/18 Down Line",
      source: "SCADA Traction Remote Control",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_ett_002",
      title: "Power Block Notice: 25kV Feeder Maintenance Approved",
      message: "2-hour power isolation block approved for TSS Substation #2 transformer busbar maintenance from 13:00 to 15:00 hrs.",
      category: "Electrical",
      priority: "High",
      timestamp: "28 mins ago",
      assignment: "Traction Sub-Station #2",
      location: "TSS Substation NDLS",
      source: "Traction Power Controller (TPC)",
      read: false,
      status: "ACTIVE",
    },
    {
      id: "alt_ett_003",
      title: "Traction Safety Alert: Insulator Thermal Imaging Scan",
      message: "Infrared thermographic audit detected 12°C hotspot on 25kV section insulator near Dadri crossover. Schedule replacement during shadow block.",
      category: "Safety",
      priority: "Medium",
      timestamp: "1 hr ago",
      assignment: "OHE Crossover Dadri",
      location: "Crossover Sector",
      source: "OHE Inspection Car (NETRA)",
      read: true,
      status: "ACKNOWLEDGED",
    },
  ],
};

// -------------------------------------------------------------
// CENTRALIZED ROLE-SPECIFIC NOTIFICATIONS DICTIONARY
// -------------------------------------------------------------

export const ROLE_SPECIFIC_NOTIFICATIONS: Record<
  OperationalRoleId,
  (_user: AuthUser | null, _roleConfig: EmployeeRoleConfig) => RoleNotificationItem[]
> = {
  // 1. Station Master
  station_master: () => [
    {
      id: "notif_sm_01",
      title: "Platform Clearance Roster Approved for Morning Peak",
      description: "Sr. DOM has approved the revised platform clearance schedule. All 16 platform tracks verified for clear headway.",
      category: "DUTY",
      categoryLabel: "Duty Roster",
      time: "08:15 AM",
      status: "UNREAD",
      actionRoute: "/employee/duty",
      actionLabel: "View Duty Log",
      source: "Operations Desk",
    },
    {
      id: "notif_sm_02",
      title: "Train 12424 (Rajdhani) Inbound on Down Fast Line",
      description: "Speed 128 km/h passing Ghaziabad outer. Interlocking route set to Platform 4 at NDLS.",
      category: "TRAIN_UPDATE",
      categoryLabel: "Train Update",
      time: "08:42 AM",
      status: "UNREAD",
      actionRoute: "/employee/assignment",
      actionLabel: "Track Interlocking",
      source: "COIS Live Feed",
    },
    {
      id: "notif_sm_03",
      title: "Weather Advisory: High Wind Warning in Delhi NCR",
      description: "Gusts up to 45 km/h predicted between 14:00 - 18:00 hrs. Monitor overhead signals and platform roof canopies.",
      category: "WEATHER",
      categoryLabel: "Weather Alert",
      time: "07:30 AM",
      status: "READ",
      source: "IMD Weather Desk",
    },
    {
      id: "notif_sm_04",
      title: "Task Completed: Station Master Shift Handover Form",
      description: "Outgoing night shift master signed off panel key log and token registers successfully.",
      category: "TASK",
      categoryLabel: "Task Completed",
      time: "06:00 AM",
      status: "READ",
      actionRoute: "/employee/tasks",
      actionLabel: "View Task",
      source: "Shift Supervisor",
    },
  ],

  // 2. Station Superintendent
  station_superintendent: () => [
    {
      id: "notif_ss_01",
      title: "Passenger Surge Protocol Active on Concourse",
      description: "Special express departures scheduled. RPF reinforcement deployed at concourse barriers.",
      category: "OPERATIONAL_ALERT",
      categoryLabel: "Station Alert",
      time: "08:20 AM",
      status: "UNREAD",
      actionRoute: "/employee/alerts",
      actionLabel: "View Alert",
      source: "Station Command Center",
    },
    {
      id: "notif_ss_02",
      title: "Executive Lounge Audit Report Published",
      description: "Commercial audit completed with 98% passenger satisfaction score for morning shift.",
      category: "DUTY",
      categoryLabel: "Audit Notice",
      time: "07:45 AM",
      status: "READ",
      actionRoute: "/employee/duty",
      actionLabel: "Review Report",
      source: "Commercial Directorate",
    },
  ],

  // 3. Train Manager
  train_manager: () => [
    {
      id: "notif_tm_01",
      title: "Brake Feel Test Certificate Signed for Rake 22436",
      description: "Brake power 100% verified on all 16 coaches. Handed over to Loco Pilot.",
      category: "TASK",
      categoryLabel: "Safety Cert",
      time: "08:10 AM",
      status: "UNREAD",
      actionRoute: "/employee/tasks",
      actionLabel: "View Task",
      source: "TXR Inspection Bay",
    },
    {
      id: "notif_tm_02",
      title: "Section Dispatch Clearance: Green Aspect Granted",
      description: "Train 22436 cleared for departure from Platform 1 at 08:30 hrs.",
      category: "TRAIN_UPDATE",
      categoryLabel: "Train Update",
      time: "08:25 AM",
      status: "UNREAD",
      actionRoute: "/employee/assignment",
      actionLabel: "View Train",
      source: "Section Controller",
    },
  ],

  // 4. Loco Pilot
  loco_pilot: () => [
    {
      id: "notif_lp_01",
      title: "Caution Order T/409 Uploaded to Cab Console",
      description: "Speed restriction 110 km/h active between Km 45/10 and 68/00 due to track work.",
      category: "OPERATIONAL_ALERT",
      categoryLabel: "Caution Order",
      time: "08:05 AM",
      status: "UNREAD",
      actionRoute: "/employee/alerts",
      actionLabel: "View Caution",
      source: "Safety Department",
    },
    {
      id: "notif_lp_02",
      title: "WAP-7 #30455 Traction Motor Health Green",
      description: "Automated diagnostic pass. All 6 traction converters operating within optimal thermal curves.",
      category: "TRAIN_UPDATE",
      categoryLabel: "Loco Telemetry",
      time: "07:50 AM",
      status: "READ",
      actionRoute: "/employee/assignment",
      actionLabel: "Inspect Loco",
      source: "Loco Telemetry Core",
    },
  ],

  // 5. Assistant Loco Pilot
  assistant_loco_pilot: () => [
    {
      id: "notif_alp_01",
      title: "VCD Self-Test Protocol Passed",
      description: "Vigilance Control Device test verified at 07:55 AM before loco uncoupling.",
      category: "TASK",
      categoryLabel: "Safety Test",
      time: "07:55 AM",
      status: "UNREAD",
      actionRoute: "/employee/tasks",
      actionLabel: "View Checklist",
      source: "Loco Pilot In-Charge",
    },
  ],

  // 6. Section Controller / Train Dispatcher
  section_controller: () => [
    {
      id: "notif_sc_01",
      title: "DSS Precedence Optimization Matrix Generated",
      description: "Train 12424 prioritized over freight 7701 at Aligarh Junction loop line.",
      category: "OPERATIONAL_ALERT",
      categoryLabel: "DSS Decision",
      time: "08:30 AM",
      status: "UNREAD",
      actionRoute: "/employee/alerts",
      actionLabel: "View Conflict",
      source: "RailDrishti AI DSS",
    },
  ],

  // 7. Yard Supervisor
  yard_supervisor: () => [
    {
      id: "notif_ys_01",
      title: "Shunting Rake #VB-22436 Cleared to Platform 1",
      description: "Points 12A/B locked. Rake cleared into passenger line at 07:15 AM.",
      category: "TRAIN_UPDATE",
      categoryLabel: "Shunting Update",
      time: "07:15 AM",
      status: "READ",
      actionRoute: "/employee/assignment",
      actionLabel: "View Yard",
      source: "Yard Master",
    },
  ],

  // 8. Track Maintainer
  track_maintainer: () => [
    {
      id: "notif_tmk_01",
      title: "Maintenance Block 11:00 - 13:00 Hrs Confirmed",
      description: "Traffic shadow block approved for tie-tamping on Up line Km 46-47.",
      category: "DUTY",
      categoryLabel: "Block Notice",
      time: "08:00 AM",
      status: "UNREAD",
      actionRoute: "/employee/duty",
      actionLabel: "Duty Schedule",
      source: "P-Way Sub-Division",
    },
  ],

  // 9. Section Engineer
  section_engineer: () => [
    {
      id: "notif_se_01",
      title: "USFD Flaw Detection Log Ready for Review",
      description: "18 thermite welds scanned on Section A with zero critical fatigue cracks.",
      category: "TASK",
      categoryLabel: "USFD Report",
      time: "07:40 AM",
      status: "UNREAD",
      actionRoute: "/employee/tasks",
      actionLabel: "Review USFD",
      source: "P-Way Testing Lab",
    },
  ],

  // 10. Bridge & Structure Inspector
  bridge_structure_inspector: () => [
    {
      id: "notif_bsi_01",
      title: "Yamuna Bridge #42 Pier 4 Probe Scheduled",
      description: "Hydrological scour probe team assembling at bridge abutment 1.",
      category: "OPERATIONAL_ALERT",
      categoryLabel: "Bridge Alert",
      time: "08:10 AM",
      status: "UNREAD",
      actionRoute: "/employee/alerts",
      actionLabel: "View Alert",
      source: "Bridge Control",
    },
  ],

  // 11. Signal Maintainer
  signal_maintainer: () => [
    {
      id: "notif_smk_01",
      title: "Point Machine 104 Reverse Setting Normalized",
      description: "Clutch resistance tested and adjusted to 2.4A standard operating current.",
      category: "TASK",
      categoryLabel: "Maintenance",
      time: "08:22 AM",
      status: "UNREAD",
      actionRoute: "/employee/tasks",
      actionLabel: "View Task",
      source: "S&T Signal Cabin",
    },
  ],

  // 12. Telecom Technician
  telecom_technician: () => [
    {
      id: "notif_tt_01",
      title: "VHF Repeater Standby Transceiver Active",
      description: "Carrier power normal on 161.150 MHz. Zero audio packet loss on driver channel.",
      category: "SYSTEM",
      categoryLabel: "Telecom Status",
      time: "08:00 AM",
      status: "READ",
      source: "NMS Server",
    },
  ],

  // 13. Loco / Depot Maintenance Technician
  depot_maintenance_technician: () => [
    {
      id: "notif_dmt_01",
      title: "Loco WAP-7 #30211 Bay 2 Diagnostic Logged",
      description: "Traction motor greasing completed. Thermal curve returned to normal 62°C.",
      category: "TASK",
      categoryLabel: "Depot Work",
      time: "08:18 AM",
      status: "UNREAD",
      actionRoute: "/employee/tasks",
      actionLabel: "View Work Order",
      source: "Depot Foreman",
    },
  ],

  // 14. Coach Cleanliness & Sanitation Staff
  coach_cleanliness_staff: () => [
    {
      id: "notif_ccs_01",
      title: "RailMadad Sanitation Call Resolved in Coach B3",
      description: "Bio-toilet flush vacuum cleared and sanitized. Passenger confirmation logged.",
      category: "DUTY",
      categoryLabel: "Sanitation",
      time: "08:28 AM",
      status: "UNREAD",
      actionRoute: "/employee/duty",
      actionLabel: "View Duty Log",
      source: "OBHS Control Desk",
    },
  ],

  // 15. TTE (Traveling Ticket Examiner)
  tte: () => [
    {
      id: "notif_tte_01",
      title: "Handheld Terminal (HHT) Chart Sync Complete",
      description: "Charts downloaded for Train 12424. 48 passengers confirmed in Coaches B1-B6.",
      category: "TASK",
      categoryLabel: "HHT Sync",
      time: "08:00 AM",
      status: "UNREAD",
      actionRoute: "/employee/tasks",
      actionLabel: "Open HHT Task",
      source: "PRS CRIS Server",
    },
    {
      id: "notif_tte_02",
      title: "Medical Assistance Case Attended in Coach B4",
      description: "First aid administered to Seat 32 passenger. Vitals reported normal.",
      category: "OPERATIONAL_ALERT",
      categoryLabel: "Medical Update",
      time: "08:35 AM",
      status: "UNREAD",
      actionRoute: "/employee/alerts",
      actionLabel: "View Alert",
      source: "Train Escort Team",
    },
  ],

  // 16. Station Booking & Enquiry Clerk
  booking_enquiry_clerk: () => [
    {
      id: "notif_bec_01",
      title: "UTS Server Latency Normalized (42ms)",
      description: "Backup database cluster synchronized. Ticket generation speed normal.",
      category: "SYSTEM",
      categoryLabel: "IT System",
      time: "08:15 AM",
      status: "READ",
      source: "CRIS Helpdesk",
    },
  ],
  station_booking_clerk: (u, cfg) => ROLE_SPECIFIC_NOTIFICATIONS.booking_enquiry_clerk(u, cfg),

  // 17. Commercial Inspector
  commercial_inspector: () => [
    {
      id: "notif_ci_01",
      title: "Vendor Overcharging Penalty Notice Issued",
      description: "Penalty receipt #PN-4401 issued to Stall #14 for MRP violation.",
      category: "DUTY",
      categoryLabel: "Enforcement",
      time: "08:30 AM",
      status: "UNREAD",
      actionRoute: "/employee/duty",
      actionLabel: "Review Notice",
      source: "Commercial Enforcement",
    },
  ],

  // 18. Customer Support Specialist
  customer_support_specialist: () => [
    {
      id: "notif_css_01",
      title: "Buggy Transit Completed for Senior Citizen Passenger",
      description: "Passenger safely escorted to Exit Gate 2. RailMadad ticket closed with 5-star rating.",
      category: "DUTY",
      categoryLabel: "Passenger Assist",
      time: "08:24 AM",
      status: "UNREAD",
      actionRoute: "/employee/duty",
      actionLabel: "View Duty",
      source: "Facilitation Desk",
    },
  ],

  // 19. RPF Escort Constable
  rpf_escort_constable: () => [
    {
      id: "notif_rpf_01",
      title: "Foot Patrol Logged for Coaches S1-S6",
      description: "No suspicious baggage or unauthorized vendors detected in sleeper section.",
      category: "Security",
      categoryLabel: "Security Patrol",
      time: "08:32 AM",
      status: "UNREAD",
      actionRoute: "/employee/tasks",
      actionLabel: "View Patrol Task",
      source: "RPF Station Post",
    },
  ],

  // 20. Station Security Officer
  station_security_officer: () => [
    {
      id: "notif_sso_01",
      title: "Unattended Bag at Pillar 7 Cleared by BDDS",
      description: "Package contained passenger books and garments. Stored safely at Lost & Found.",
      category: "Security",
      categoryLabel: "Security Clearance",
      time: "08:26 AM",
      status: "UNREAD",
      actionRoute: "/employee/alerts",
      actionLabel: "View Alert",
      source: "RPF Command Control",
    },
  ],

  // 21. Railway Medical Officer / Doctor
  railway_medical_officer: () => [
    {
      id: "notif_rmo_01",
      title: "Cardiac Patient Stabilized at Platform 3",
      description: "Patient received emergency sublingual medication and moved to ICU ambulance.",
      category: "Medical",
      categoryLabel: "Medical Case",
      time: "08:28 AM",
      status: "UNREAD",
      actionRoute: "/employee/duty",
      actionLabel: "Medical Case Log",
      source: "Divisional Hospital",
    },
  ],

  // 22. Emergency Medical Responder
  emergency_medical_responder: () => [
    {
      id: "notif_emr_01",
      title: "First Aid Kit Bag #2 Restock Completed",
      description: "AED pads, bandages, and oxygen cylinder verified ready for rapid dispatch.",
      category: "Medical",
      categoryLabel: "Medical Kit",
      time: "08:12 AM",
      status: "READ",
      actionRoute: "/employee/tasks",
      actionLabel: "View Kit Log",
      source: "First Aid Post",
    },
  ],

  // 23. Electrical Traction Technician (OHE)
  electrical_traction_technician: () => [
    {
      id: "notif_ett_01",
      title: "OHE Mast 42/18 Tensioner Adjusted by Tower Wagon",
      description: "Contact wire tension restored to 1,000 kg standard. Track speed normalized.",
      category: "DUTY",
      categoryLabel: "OHE Restoration",
      time: "08:35 AM",
      status: "UNREAD",
      actionRoute: "/employee/duty",
      actionLabel: "View Duty Log",
      source: "TSS Control Room",
    },
  ],
};

// -------------------------------------------------------------
// SCOPE DEFINITIONS FOR EACH OPERATIONAL ROLE
// -------------------------------------------------------------

export const ROLE_ALERT_SCOPES: Record<
  OperationalRoleId,
  { scopeTitle: string; scopeLocation: string; scopeDescription: string }
> = {
  station_master: {
    scopeTitle: "Station & Yard Movement Scope",
    scopeLocation: "New Delhi Junction (NDLS)",
    scopeDescription: "Platform clearances, interlocking route settings, and local operational cautions.",
  },
  station_superintendent: {
    scopeTitle: "Station Administration & Safety Scope",
    scopeLocation: "New Delhi Junction (NDLS)",
    scopeDescription: "Passenger crowd flows, inter-departmental operations, and emergency station notices.",
  },
  train_manager: {
    scopeTitle: "Assigned Train & Journey Scope",
    scopeLocation: "Train 22436 (Vande Bharat Express)",
    scopeDescription: "Brake continuity, train safety, route speed cautions, and journey alerts.",
  },
  loco_pilot: {
    scopeTitle: "Locomotive & Route Signaling Scope",
    scopeLocation: "Train 22436 (WAP-7 #30455)",
    scopeDescription: "Aspect signals, route caution orders, track speed restrictions, and cab telemetry.",
  },
  assistant_loco_pilot: {
    scopeTitle: "Loco Cab & Subsystem Inspection Scope",
    scopeLocation: "Train 22436 (Loco Cab 1)",
    scopeDescription: "VCD verification, pantograph monitoring, and loco readiness checks.",
  },
  section_controller: {
    scopeTitle: "Section Dispatch & Headway Control Scope",
    scopeLocation: "Delhi - Kanpur Main Corridor [Section A]",
    scopeDescription: "Section train precedence, line block cautions, and traffic disruption management.",
  },
  yard_supervisor: {
    scopeTitle: "Marshalling Yard & Siding Scope",
    scopeLocation: "West Marshalling Yard [NDLS]",
    scopeDescription: "Shunting safety notices, siding placement, and yard movement clearance.",
  },
  track_maintainer: {
    scopeTitle: "Permanent Way (P-Way) Beat Scope",
    scopeLocation: "Section A (Km 40.00 – 55.00)",
    scopeDescription: "Track defects, maintenance shadow blocks, rail temperature warnings, and weld cautions.",
  },
  section_engineer: {
    scopeTitle: "Civil Track Engineering Oversight Scope",
    scopeLocation: "Divisional P-Way Section A",
    scopeDescription: "USFD flaw reports, tamping machine schedules, and turnout engineering alerts.",
  },
  bridge_structure_inspector: {
    scopeTitle: "Bridges & Civil Structures Scope",
    scopeLocation: "Yamuna Bridge #42 & Station FOBs",
    scopeDescription: "Scour depth telemetry, girder bearing fatigue, and structural safety audits.",
  },
  signal_maintainer: {
    scopeTitle: "Interlocking & Point Machine Scope",
    scopeLocation: "Relay Room & Signal Sector 2",
    scopeDescription: "Track circuit drops, point machine current surge, and IPS battery backup alerts.",
  },
  telecom_technician: {
    scopeTitle: "OFC & VHF Communication Scope",
    scopeLocation: "Telecom Sector & OFC Trunk Hub",
    scopeDescription: "VHF repeater health, PIS server synchronization, and trunk line diagnostics.",
  },
  depot_maintenance_technician: {
    scopeTitle: "Rolling Stock Pitline Scope",
    scopeLocation: "Loco Shed Pitline Bay 2 & 4",
    scopeDescription: "Traction motor bearing thermals, air compressor levels, and collector strip alerts.",
  },
  coach_cleanliness_staff: {
    scopeTitle: "On-Board Housekeeping & Sanitization Scope",
    scopeLocation: "Coach Rake Berthing Platforms",
    scopeDescription: "Bio-toilet digester blockages, passenger cleanliness calls, and train disinfection.",
  },
  tte: {
    scopeTitle: "Passenger Checking & Coach Scope",
    scopeLocation: "Train 12424 (DBRT Rajdhani) Coaches B1-B6",
    scopeDescription: "HHT chart synchronization, berth upgrade notices, and onboard passenger assistance.",
  },
  booking_enquiry_clerk: {
    scopeTitle: "Passenger Ticketing & Counter Scope",
    scopeLocation: "Main Reservation Concourse [NDLS]",
    scopeDescription: "UTS counter network latency, Tatkal queue management, and holiday special notices.",
  },
  station_booking_clerk: {
    scopeTitle: "Passenger Ticketing & Counter Scope",
    scopeLocation: "Main Reservation Concourse [NDLS]",
    scopeDescription: "UTS counter network latency, Tatkal queue management, and holiday special notices.",
  },
  commercial_inspector: {
    scopeTitle: "Commercial Premises & Catering Scope",
    scopeLocation: "Station Catering Stalls & Parcel Office",
    scopeDescription: "Catering hygiene audits, overcharging complaint notices, and weighbridge calibrations.",
  },
  customer_support_specialist: {
    scopeTitle: "Passenger Facilitation & Helpdesk Scope",
    scopeLocation: "Executive Lounge & Passenger Helpdesk",
    scopeDescription: "Wheelchair assistance tickets, lost luggage claims, and rescheduling announcements.",
  },
  rpf_escort_constable: {
    scopeTitle: "Train Security Escort Scope",
    scopeLocation: "Train 12424 Security Escort",
    scopeDescription: "Coach security foot patrols, unauthorized hawker notices, and night transit alerts.",
  },
  station_security_officer: {
    scopeTitle: "Station Premises Security Scope",
    scopeLocation: "Station Concourse & CCTV Control Cell",
    scopeDescription: "AI baggage detection alerts, DFMD gate calibration, and emergency exit clearance.",
  },
  railway_medical_officer: {
    scopeTitle: "Railway Medical Directorate Scope",
    scopeLocation: "Divisional Railway Hospital & First Aid Post",
    scopeDescription: "Cardiac emergency response, ICU ambulance evacuations, and station AED audits.",
  },
  emergency_medical_responder: {
    scopeTitle: "First Aid & Rapid Response Scope",
    scopeLocation: "Station First Aid Room & Emergency Ambulance",
    scopeDescription: "Rapid response first aid dispatches, kit replenishment, and transit time drills.",
  },
  electrical_traction_technician: {
    scopeTitle: "25kV AC Overhead Traction (OHE) Scope",
    scopeLocation: "Traction Sub-Station & OHE Sector 1",
    scopeDescription: "Contact wire tension drops, 25kV feeder power blocks, and insulator hotspot scans.",
  },
};

// -------------------------------------------------------------
// SERVICE EXPORTS / RESOLVERS
// -------------------------------------------------------------

/**
 * Get role-filtered operational alerts view data for the current logged-in employee
 */
export function getRoleAlertsViewData(user: AuthUser | null): RoleAlertsViewData {
  const employeeName = user?.name || "Railway Employee";
  const employeeId = user?.employeeId || "EMP-7701";
  const department = (user?.department as EmployeeDepartment) || "Operations & Traffic Control";

  const rawRole = (user?.operationalRole as OperationalRoleId) || DEFAULT_OPERATIONAL_ROLE;
  const roleConfig = getRoleConfig(rawRole);
  const isRoleValid = Boolean(roleConfig);
  const effectiveRole: OperationalRoleId = isRoleValid ? rawRole : DEFAULT_OPERATIONAL_ROLE;
  const effectiveConfig = roleConfig || getRoleConfig(DEFAULT_OPERATIONAL_ROLE);

  const isDepartmentValid = isRoleInDepartment(effectiveRole, department);

  let warningMessage: string | undefined;
  if (!isRoleValid) {
    warningMessage = `Operational role "${rawRole}" not recognized. Displaying standard ${effectiveConfig.displayName} alerts.`;
  } else if (!isDepartmentValid) {
    warningMessage = `Role "${effectiveConfig.displayName}" does not belong to department "${department}". Displaying role-specific alerts.`;
  }

  const alertGenerator = ROLE_SPECIFIC_ALERTS[effectiveRole] || ROLE_SPECIFIC_ALERTS.station_master;
  const alerts = alertGenerator(user, effectiveConfig);

  const scope = ROLE_ALERT_SCOPES[effectiveRole] || {
    scopeTitle: `${effectiveConfig.displayName} Scope`,
    scopeLocation: "Assigned Operational Post",
    scopeDescription: "Alerts restricted strictly to your assigned operational role.",
  };

  return {
    employeeName,
    employeeId,
    department,
    roleTitle: effectiveConfig.displayName,
    roleConfig: effectiveConfig,
    scopeLocation: scope.scopeLocation,
    scopeDescription: scope.scopeDescription,
    alerts,
    isRoleValid,
    isDepartmentValid,
    warningMessage,
    isLiveApiData: false, // Clearly distinguish demo/static info from live backend
  };
}

/**
 * Get role-filtered notifications view data for the current logged-in employee
 */
export function getRoleNotificationsViewData(user: AuthUser | null): RoleNotificationsViewData {
  const employeeName = user?.name || "Railway Employee";
  const employeeId = user?.employeeId || "EMP-7701";
  const department = (user?.department as EmployeeDepartment) || "Operations & Traffic Control";

  const rawRole = (user?.operationalRole as OperationalRoleId) || DEFAULT_OPERATIONAL_ROLE;
  const roleConfig = getRoleConfig(rawRole);
  const isRoleValid = Boolean(roleConfig);
  const effectiveRole: OperationalRoleId = isRoleValid ? rawRole : DEFAULT_OPERATIONAL_ROLE;
  const effectiveConfig = roleConfig || getRoleConfig(DEFAULT_OPERATIONAL_ROLE);

  const isDepartmentValid = isRoleInDepartment(effectiveRole, department);

  let warningMessage: string | undefined;
  if (!isRoleValid) {
    warningMessage = `Operational role "${rawRole}" not recognized. Displaying standard notifications.`;
  } else if (!isDepartmentValid) {
    warningMessage = `Role "${effectiveConfig.displayName}" does not belong to department "${department}".`;
  }

  const notifGenerator = ROLE_SPECIFIC_NOTIFICATIONS[effectiveRole] || ROLE_SPECIFIC_NOTIFICATIONS.station_master;
  const notifications = notifGenerator(user, effectiveConfig);

  return {
    employeeName,
    employeeId,
    department,
    roleTitle: effectiveConfig.displayName,
    roleConfig: effectiveConfig,
    notifications,
    isRoleValid,
    isDepartmentValid,
    warningMessage,
  };
}

/**
 * RailDrishti Centralized Employee History & Activity Log Service
 *
 * Provides dynamic, role-specific operational activity and audit history
 * for all 23 operational roles.
 *
 * STRICT ROLE ISOLATION:
 * Ensures Loco Pilot sees only train actions, Track Maintainer sees track inspections,
 * TTE sees passenger checks, Signal Maintainer sees signal actions, etc.
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

export type ActivityCategory =
  | "DUTY"
  | "TASK"
  | "ASSIGNMENT"
  | "ALERT"
  | "ISSUE"
  | "INCIDENT"
  | "LOGIN"
  | "NOTIFICATION";

export interface RoleActivityItem {
  id: string;
  date: string;
  time: string;
  action: string;
  category: ActivityCategory;
  status: "Completed" | "In Progress" | "Acknowledged" | "Reported" | "Success";
  details: string;
  location?: string;
  referenceId?: string;
}

export interface RoleHistoryViewData {
  employeeName: string;
  employeeId: string;
  department: string;
  roleTitle: string;
  roleConfig: EmployeeRoleConfig;
  activities: RoleActivityItem[];
  isRoleValid: boolean;
  isDepartmentValid: boolean;
  warningMessage?: string;
}

// -------------------------------------------------------------
// CENTRALIZED ROLE-SPECIFIC ACTIVITIES DICTIONARY
// -------------------------------------------------------------

export const ROLE_SPECIFIC_ACTIVITIES: Record<
  OperationalRoleId,
  (_user: AuthUser | null, _roleConfig: EmployeeRoleConfig) => RoleActivityItem[]
> = {
  // 1. Station Master
  station_master: () => [
    {
      id: "act_sm_01",
      date: "14 Sep",
      time: "17:00",
      action: "Interlocking Route Set for Train 12424",
      category: "ASSIGNMENT",
      status: "Completed",
      details: "Electronic interlocking cleared from Outer Home to Platform 4 at NDLS.",
      location: "Platform 4",
      referenceId: "IXL-NDLS-12424",
    },
    {
      id: "act_sm_02",
      date: "14 Sep",
      time: "16:15",
      action: "Acknowledged Speed Caution Order #89",
      category: "ALERT",
      status: "Acknowledged",
      details: "Acknowledged 15 km/h restriction on Platform 3 turnout points 14A.",
      location: "Platform 3 Turnout",
      referenceId: "CO-SWR-89",
    },
    {
      id: "act_sm_03",
      date: "14 Sep",
      time: "15:30",
      action: "Reported Platform Indicator Display Glitch",
      category: "ISSUE",
      status: "Reported",
      details: "Matrix LED display at FOB-2 showing garbled coach positions for incoming express.",
      location: "FOB 2",
      referenceId: "RD-2026-00142",
    },
    {
      id: "act_sm_04",
      date: "14 Sep",
      time: "14:12",
      action: "Station Shift Handover Verified",
      category: "TASK",
      status: "Completed",
      details: "Signed off physical panel register and token keys with outgoing Station Master.",
      location: "Station Master Office",
      referenceId: "TSK-SM-001",
    },
    {
      id: "act_sm_05",
      date: "14 Sep",
      time: "13:50",
      action: "Biometric Shift Sign-In & Login",
      category: "LOGIN",
      status: "Success",
      details: "Authenticated via HRMS Biometric Terminal for Evening Operational Shift.",
      location: "NDLS Station",
      referenceId: "AUTH-SM-8841",
    },
  ],

  // 2. Station Superintendent
  station_superintendent: () => [
    {
      id: "act_ss_01",
      date: "14 Sep",
      time: "16:45",
      action: "Crowd Surge Barrier Protocol Initiated",
      category: "DUTY",
      status: "Completed",
      details: "Coordinated with RPF Inspector for barrier diversion at Concourse Gate 3.",
      location: "East Concourse",
      referenceId: "DUTY-SS-41",
    },
    {
      id: "act_ss_02",
      date: "14 Sep",
      time: "15:20",
      action: "Reported Coach Watering Hydrant Pressure Drop",
      category: "ISSUE",
      status: "Reported",
      details: "Hydrant pipe line 4 leaking near yard crossover, reducing flow rate.",
      location: "Washing Line 4",
      referenceId: "RD-2026-00143",
    },
    {
      id: "act_ss_03",
      date: "14 Sep",
      time: "14:00",
      action: "Shift Login & Supervisory Logbook Opened",
      category: "LOGIN",
      status: "Success",
      details: "Logged into RailDrishti Station Superintendent Operations Console.",
      location: "Station Admin Block",
      referenceId: "AUTH-SS-091",
    },
  ],

  // 3. Train Manager
  train_manager: () => [
    {
      id: "act_tm_01",
      date: "14 Sep",
      time: "17:10",
      action: "Brake Pipe Pressure Continuity Verified",
      category: "TASK",
      status: "Completed",
      details: "Air brake pressure measured 4.8 kg/cm² at rear Guard Van BVZC-901.",
      location: "Train 22436",
      referenceId: "BPC-VB-22436",
    },
    {
      id: "act_tm_02",
      date: "14 Sep",
      time: "16:20",
      action: "Acknowledged Speed Caution Order #38",
      category: "ALERT",
      status: "Acknowledged",
      details: "Max permissible speed 110 km/h between GZB and ALJN noted in guard book.",
      location: "Section GZB - ALJN",
      referenceId: "CO-38",
    },
    {
      id: "act_tm_03",
      date: "14 Sep",
      time: "15:00",
      action: "Reported Vestibule Inter-Door Latch Stiffness",
      category: "ISSUE",
      status: "Reported",
      details: "Coach C5-C6 vestibule door latch requiring lubrication before high-speed transit.",
      location: "Coach C5-C6",
      referenceId: "RD-2026-00144",
    },
    {
      id: "act_tm_04",
      date: "14 Sep",
      time: "14:15",
      action: "Crew Sign-On & Breathalyzer Test Passed",
      category: "DUTY",
      status: "Completed",
      details: "0.00 BAC verified at NDLS Running Room Crew Sign-On Kiosk.",
      location: "NDLS Running Room",
      referenceId: "BA-TM-2026-88",
    },
  ],

  // 4. Loco Pilot
  loco_pilot: () => [
    {
      id: "act_lp_01",
      date: "14 Sep",
      time: "17:15",
      action: "Vigilance Control Device (VCD) Cyclic Test Passed",
      category: "TASK",
      status: "Completed",
      details: "60-second audio-visual vigilance reset cycle confirmed functional in Cab 1.",
      location: "WAP-7 #30455",
      referenceId: "VCD-LP-30455",
    },
    {
      id: "act_lp_02",
      date: "14 Sep",
      time: "16:05",
      action: "Acknowledged Foggy Weather Caution T/409",
      category: "ALERT",
      status: "Acknowledged",
      details: "Speed restriction 60 km/h under double yellow aspect logged on dashboard.",
      location: "Km 45/10 - 68/00",
      referenceId: "CO-T409",
    },
    {
      id: "act_lp_03",
      date: "14 Sep",
      time: "15:10",
      action: "Reported Headlight Secondary Lamp Dimness",
      category: "ISSUE",
      status: "Reported",
      details: "Auxiliary beam lux level measured low on front nose of WAP-7 #30455.",
      location: "Loco Cab 1",
      referenceId: "RD-2026-00145",
    },
    {
      id: "act_lp_04",
      date: "14 Sep",
      time: "14:10",
      action: "Crew Sign-On & Medical Fitness Verified",
      category: "LOGIN",
      status: "Success",
      details: "Loco Pilot signed on for Train 22436 WAP-7 #30455 departure roster.",
      location: "Traction Lobby NDLS",
      referenceId: "AUTH-LP-30455",
    },
  ],

  // 5. Assistant Loco Pilot
  assistant_loco_pilot: () => [
    {
      id: "act_alp_01",
      date: "14 Sep",
      time: "16:50",
      action: "Bogie & Pantograph Physical Inspection",
      category: "TASK",
      status: "Completed",
      details: "Verified carbon strip thickness and air reservoir pressure (5.0 kg/cm² FP).",
      location: "Pitline Bay 2",
      referenceId: "PHT-WAP7-14",
    },
    {
      id: "act_alp_02",
      date: "14 Sep",
      time: "15:30",
      action: "Acknowledged Neutral Section Crossing Order",
      category: "ALERT",
      status: "Acknowledged",
      details: "Noted DJ opening location at Km 58/15 in assistant pilot log.",
      location: "Km 58/15",
      referenceId: "OHE-NS-58",
    },
    {
      id: "act_alp_03",
      date: "14 Sep",
      time: "14:15",
      action: "Shift Sign-On Completed",
      category: "LOGIN",
      status: "Success",
      details: "ALP signed on with Loco Pilot in traction running room.",
      location: "NDLS Lobby",
      referenceId: "AUTH-ALP-02",
    },
  ],

  // 6. Section Controller / Train Dispatcher
  section_controller: () => [
    {
      id: "act_sc_01",
      date: "14 Sep",
      time: "17:05",
      action: "Approved Precedence for Train 12424 over Freight 7701",
      category: "DUTY",
      status: "Completed",
      details: "Granted precedence at Aligarh loop line via DSS automated conflict resolution.",
      location: "Section A Control Board",
      referenceId: "DSS-ALJN-12424",
    },
    {
      id: "act_sc_02",
      date: "14 Sep",
      time: "16:10",
      action: "Acknowledged Points Ground Fault Alert",
      category: "ALERT",
      status: "Acknowledged",
      details: "Points 102B clamped and padlocked at Chipyana Buzurg Yard.",
      location: "Chipyana Yard",
      referenceId: "ALT-SC-001",
    },
    {
      id: "act_sc_03",
      date: "14 Sep",
      time: "14:30",
      action: "Logged Section Caution Order T/409",
      category: "TASK",
      status: "Completed",
      details: "Dispatched electronic caution order to all 8 stations on Corridor Section A.",
      location: "Delhi - Kanpur Corridor",
      referenceId: "CO-DISPATCH-99",
    },
  ],

  // 7. Yard Supervisor
  yard_supervisor: () => [
    {
      id: "act_ys_01",
      date: "14 Sep",
      time: "16:55",
      action: "Shunting Transition Completed for Rake 12424",
      category: "TASK",
      status: "Completed",
      details: "Marshalling line 3 cleared and secured with wooden wheel wedges.",
      location: "West Marshalling Yard",
      referenceId: "SHNT-WY-12424",
    },
    {
      id: "act_ys_02",
      date: "14 Sep",
      time: "15:40",
      action: "Reported Points #18 Operating Rod Stiffness",
      category: "ISSUE",
      status: "Reported",
      details: "Operating rod resistance elevated on Shunting Neck Turnout 18.",
      location: "West Yard Points 18",
      referenceId: "RD-2026-00146",
    },
  ],

  // 8. Track Maintainer
  track_maintainer: () => [
    {
      id: "act_tmk_01",
      date: "14 Sep",
      time: "16:40",
      action: "Completed Hot Weather Rail Temperature Patrolling",
      category: "DUTY",
      status: "Completed",
      details: "Rail thermometer peaked at 58°C on continuous welded rail (CWR) section. No buckle observed.",
      location: "Section A Km 44–50",
      referenceId: "HWP-PWAY-88",
    },
    {
      id: "act_tmk_02",
      date: "14 Sep",
      time: "15:15",
      action: "Reported Thermite Weld Micro-Defect",
      category: "ISSUE",
      status: "Reported",
      details: "USFD flaw confirmed at joint Km 48/12 Down line. Clamped with emergency fishplates.",
      location: "Down Line Km 48/12",
      referenceId: "RD-2026-00147",
    },
    {
      id: "act_tmk_03",
      date: "14 Sep",
      time: "14:20",
      action: "Fishplate Bolt Torque Inspection",
      category: "TASK",
      status: "Completed",
      details: "Tightened 24 bolts across bridge approach sleepers with standard torque wrench.",
      location: "Km 46/00",
      referenceId: "TSK-TMK-002",
    },
  ],

  // 9. Section Engineer
  section_engineer: () => [
    {
      id: "act_se_01",
      date: "14 Sep",
      time: "16:50",
      action: "Approved CSM Track Tamping Schedule",
      category: "DUTY",
      status: "Completed",
      details: "CSM tamping block approved for 4 km track packing tonight (01:00 - 04:30 hrs).",
      location: "Km 55–59",
      referenceId: "TAMP-CSM-04",
    },
    {
      id: "act_se_02",
      date: "14 Sep",
      time: "15:25",
      action: "Reported Ballast Deficiency on Turnout #21",
      category: "ISSUE",
      status: "Reported",
      details: "Cushion depth below 250mm standard on high-speed crossover 21.",
      location: "Crossover #21 Km 51/20",
      referenceId: "RD-2026-00148",
    },
  ],

  // 10. Bridge & Structure Inspector
  bridge_structure_inspector: () => [
    {
      id: "act_bsi_01",
      date: "14 Sep",
      time: "16:30",
      action: "Yamuna Bridge #42 Pier 4 Scour Depth Probed",
      category: "TASK",
      status: "Completed",
      details: "Physical depth probe verified 3.2m sediment displacement; foundation masonry intact.",
      location: "Yamuna Bridge Pier 4",
      referenceId: "SCR-PRB-42",
    },
    {
      id: "act_bsi_02",
      date: "14 Sep",
      time: "15:05",
      action: "Reported Rocker Bearing Elastomer Extrusion",
      category: "ISSUE",
      status: "Reported",
      details: "Span 3 elastomeric bearing showing minor elastomer deformation under dynamic brake test.",
      location: "Bridge #42 Span 3",
      referenceId: "RD-2026-00149",
    },
  ],

  // 11. Signal Maintainer
  signal_maintainer: () => [
    {
      id: "act_smk_01",
      date: "14 Sep",
      time: "16:55",
      action: "Point Machine 104 Motor Current Calibrated",
      category: "TASK",
      status: "Completed",
      details: "Operating current normalized from 4.8A down to 2.4A standard operating curve.",
      location: "Point Machine 104A",
      referenceId: "PM-CAL-104",
    },
    {
      id: "act_smk_02",
      date: "14 Sep",
      time: "15:20",
      action: "Reported Track Circuit TC-44 Audio Glitch",
      category: "ISSUE",
      status: "Reported",
      details: "High-voltage impulse relay showing intermittent drop indications under moisture.",
      location: "Signal Post S-14 / TC-44",
      referenceId: "RD-2026-00150",
    },
  ],

  // 12. Telecom Technician
  telecom_technician: () => [
    {
      id: "act_tt_01",
      date: "14 Sep",
      time: "16:35",
      action: "VHF Driver-Guard Repeater Switched to Standby",
      category: "TASK",
      status: "Completed",
      details: "2W Simplex repeater carrier restored with zero packet loss on channel 2.",
      location: "Repeater Hut Km 52",
      referenceId: "VHF-SW-52",
    },
    {
      id: "act_tt_02",
      date: "14 Sep",
      time: "15:10",
      action: "Reported Station PIS Audio Codec Loss",
      category: "ISSUE",
      status: "Reported",
      details: "Platform 4 & 5 passenger announcement edge encoder buffer drop reported.",
      location: "PIS Server Room",
      referenceId: "RD-2026-00151",
    },
  ],

  // 13. Loco / Depot Maintenance Technician
  depot_maintenance_technician: () => [
    {
      id: "act_dmt_01",
      date: "14 Sep",
      time: "16:45",
      action: "Traction Motor #3 Bearing Greased & Tested",
      category: "TASK",
      status: "Completed",
      details: "Operating temperature stabilized from 82°C down to 62°C baseline.",
      location: "Loco Shed Bay 2",
      referenceId: "TM-GRS-30211",
    },
    {
      id: "act_dmt_02",
      date: "14 Sep",
      time: "15:15",
      action: "Reported Compressor Oil Sight-Glass Level Low",
      category: "ISSUE",
      status: "Reported",
      details: "WAP-5 #30018 main compressor 1 requires 15W-40 top-up before departure.",
      location: "Pitline Bay 4",
      referenceId: "RD-2026-00152",
    },
  ],

  // 14. Coach Cleanliness & Sanitation Staff
  coach_cleanliness_staff: () => [
    {
      id: "act_ccs_01",
      date: "14 Sep",
      time: "16:40",
      action: "Bio-Toilet Vacuum Flush Suction Restored",
      category: "TASK",
      status: "Completed",
      details: "Bio-clean vacuum pump cleared blockage in Coach B3 Lavatory 2.",
      location: "Coach B3 Platform 4",
      referenceId: "BIO-CLN-12424",
    },
    {
      id: "act_ccs_02",
      date: "14 Sep",
      time: "15:30",
      action: "Reported Executive Chair Car EC1 Disinfection Due",
      category: "ISSUE",
      status: "Reported",
      details: "Intensive sanitization scheduled before 13:30 turn-around departure.",
      location: "Train 22436",
      referenceId: "RD-2026-00153",
    },
  ],

  // 15. TTE (Traveling Ticket Examiner)
  tte: () => [
    {
      id: "act_tte_01",
      date: "14 Sep",
      time: "17:00",
      action: "Synchronized Handheld Terminal (HHT) Charts",
      category: "TASK",
      status: "Completed",
      details: "Downloaded final passenger charts for Coaches B1-B6 on Train 12424.",
      location: "Train 12424 Coach B1",
      referenceId: "HHT-SYNC-12424",
    },
    {
      id: "act_tte_02",
      date: "14 Sep",
      time: "16:15",
      action: "Processed 14 RAC Automatic Berth Upgrades",
      category: "DUTY",
      status: "Completed",
      details: "Allocated Kanpur deboarding berths to waitlisted passengers via PRS HHT.",
      location: "Coaches B1-B6",
      referenceId: "RAC-UPG-9941",
    },
    {
      id: "act_tte_03",
      date: "14 Sep",
      time: "15:10",
      action: "Reported AC Duct Temperature Discomfort in B4",
      category: "ISSUE",
      status: "Reported",
      details: "Thermostat sensor fluctuating in Coach B4 seat 25-32 zone.",
      location: "Coach B4",
      referenceId: "RD-2026-00154",
    },
    {
      id: "act_tte_04",
      date: "14 Sep",
      time: "14:10",
      action: "Crew Sign-On & Roster Briefing",
      category: "LOGIN",
      status: "Success",
      details: "Signed on at TTE Lobby NDLS for Train 12424 departure duty.",
      location: "NDLS TTE Lobby",
      referenceId: "AUTH-TTE-8841",
    },
  ],

  // 16. Station Booking & Enquiry Clerk
  booking_enquiry_clerk: () => [
    {
      id: "act_bec_01",
      date: "14 Sep",
      time: "16:45",
      action: "Shift Cash Book Reconciliation Completed",
      category: "TASK",
      status: "Completed",
      details: "Balanced ₹1,48,200 ticket sales against system UTS terminal receipts.",
      location: "UTS Counter #4",
      referenceId: "UTS-REC-004",
    },
    {
      id: "act_bec_02",
      date: "14 Sep",
      time: "15:20",
      action: "Reported UTS Network Latency Spike",
      category: "ISSUE",
      status: "Reported",
      details: "Database query response time spiked to 350ms on Counter cluster 4.",
      location: "Booking Hall 2",
      referenceId: "RD-2026-00155",
    },
  ],
  station_booking_clerk: (u, cfg) => ROLE_SPECIFIC_ACTIVITIES.booking_enquiry_clerk(u, cfg),

  // 17. Commercial Inspector
  commercial_inspector: () => [
    {
      id: "act_ci_01",
      date: "14 Sep",
      time: "16:30",
      action: "Conducted Surprise Hygiene Inspection at Jan Aahar",
      category: "DUTY",
      status: "Completed",
      details: "Inspected storage temperatures and vendor medical cards on Platform 2.",
      location: "Platform 2 Jan Aahar",
      referenceId: "HYG-AUD-02",
    },
    {
      id: "act_ci_02",
      date: "14 Sep",
      time: "15:05",
      action: "Reported Vendor Overcharging Penalty #4401",
      category: "ISSUE",
      status: "Reported",
      details: "Penalty receipt issued to Stall 14 for selling packaged water above MRP.",
      location: "Platform 3 Stall 14",
      referenceId: "RD-2026-00156",
    },
  ],

  // 18. Customer Support Specialist
  customer_support_specialist: () => [
    {
      id: "act_css_01",
      date: "14 Sep",
      time: "16:40",
      action: "Battery Buggy Transit Completed for Senior Citizen",
      category: "TASK",
      status: "Completed",
      details: "Escorted passenger from Platform 1 arrival ramp to Exit Gate 2 buggy bay.",
      location: "Platform 1 Helpdesk",
      referenceId: "RM-HP-004",
    },
    {
      id: "act_css_02",
      date: "14 Sep",
      time: "15:15",
      action: "Reported Unattended Trolley Bag to Lost & Found",
      category: "ISSUE",
      status: "Reported",
      details: "Deposited black trolley bag with RPF Post with receipt #LF-802.",
      location: "AC Waiting Lounge",
      referenceId: "RD-2026-00157",
    },
  ],

  // 19. RPF Escort Constable
  rpf_escort_constable: () => [
    {
      id: "act_rpf_01",
      date: "14 Sep",
      time: "17:05",
      action: "Conducted Foot Patrol through Coaches S1-S6",
      category: "DUTY",
      status: "Completed",
      details: "Verified vestibules and emergency windows clear between GZB and ALJN.",
      location: "Train 12424 Coaches S1-S6",
      referenceId: "PATROL-RPF-12424",
    },
    {
      id: "act_rpf_02",
      date: "14 Sep",
      time: "15:45",
      action: "Reported Unauthorized Hawkers Detained",
      category: "INCIDENT",
      status: "Reported",
      details: "Three unauthorized vendors intercepted boarding Coach S3 under Railway Act Sec 144.",
      location: "Platform 4",
      referenceId: "INC-RPF-2026-09",
    },
    {
      id: "act_rpf_03",
      date: "14 Sep",
      time: "14:20",
      action: "VHF Tactical Radio Comms Check Passed",
      category: "TASK",
      status: "Completed",
      details: "Confirmed clarity with RPF Station Post on frequency 161.150 MHz.",
      location: "RPF Station Post",
      referenceId: "VHF-CHK-RPF",
    },
  ],

  // 20. Station Security Officer
  station_security_officer: () => [
    {
      id: "act_sso_01",
      date: "14 Sep",
      time: "16:50",
      action: "Cleared Unattended Baggage Alarm at Pillar 7",
      category: "INCIDENT",
      status: "Completed",
      details: "BDDS squad inspected package; contained passenger personal effects.",
      location: "Main Concourse Pillar 7",
      referenceId: "INC-SEC-2026-11",
    },
    {
      id: "act_sso_02",
      date: "14 Sep",
      time: "15:20",
      action: "Door Frame Metal Detector (DFMD) Recalibrated",
      category: "TASK",
      status: "Completed",
      details: "Sensitivity baseline tested with standard test piece at Gate 1-4.",
      location: "Entry Gate 1-4",
      referenceId: "DFMD-CAL-04",
    },
  ],

  // 21. Railway Medical Officer / Doctor
  railway_medical_officer: () => [
    {
      id: "act_rmo_01",
      date: "14 Sep",
      time: "16:45",
      action: "Attended Emergency Cardiac Call at Platform 3",
      category: "INCIDENT",
      status: "Completed",
      details: "Passenger stabilized with sublingual medication and moved to ICU ambulance.",
      location: "Platform 3 Berthing",
      referenceId: "MED-EMG-2026-08",
    },
    {
      id: "act_rmo_02",
      date: "14 Sep",
      time: "15:10",
      action: "Automated External Defibrillator (AED) Monthly Audit",
      category: "TASK",
      status: "Completed",
      details: "12 station AED units tested; all battery levels at 100% capacity.",
      location: "Station Emergency Room",
      referenceId: "AED-AUD-NDLS",
    },
  ],

  // 22. Emergency Medical Responder
  emergency_medical_responder: () => [
    {
      id: "act_emr_01",
      date: "14 Sep",
      time: "16:35",
      action: "Dispatched Rapid First Aid to Platform 2",
      category: "INCIDENT",
      status: "Completed",
      details: "Treated passenger for syncope with oxygen support and vitals monitoring.",
      location: "Platform 2 Mid-Section",
      referenceId: "EMR-DSP-2026-14",
    },
    {
      id: "act_emr_02",
      date: "14 Sep",
      time: "15:00",
      action: "Restocked Trauma Backpack #2",
      category: "TASK",
      status: "Completed",
      details: "Sterile dressings, burn gel, and glucometer strips replenished.",
      location: "First Aid Post #1",
      referenceId: "KIT-RSTK-02",
    },
  ],

  // 23. Electrical Traction Technician (OHE)
  electrical_traction_technician: () => [
    {
      id: "act_ett_01",
      date: "14 Sep",
      time: "16:40",
      action: "Contact Wire ATD Tension Reset by Tower Wagon",
      category: "TASK",
      status: "Completed",
      details: "Restored tensioner weight position on Mast 42/18 Down line.",
      location: "Mast 42/18 Down Line",
      referenceId: "OHE-ATD-42",
    },
    {
      id: "act_ett_02",
      date: "14 Sep",
      time: "15:10",
      action: "Reported 25kV Section Insulator Hotspot",
      category: "ISSUE",
      status: "Reported",
      details: "12°C thermal rise detected on crossover insulator during NETRA run.",
      location: "OHE Sector 1",
      referenceId: "RD-2026-00158",
    },
  ],
};

const LOCAL_STORAGE_HISTORY_KEY = "raildrishti_role_history_";

/**
 * Dynamically logs an activity event (issue report, incident report, duty action, etc.)
 * for the current employee, persisting it to client storage so it appears in /employee/history.
 */
export function logEmployeeActivity(activity: Omit<RoleActivityItem, "id">, employeeId?: string): RoleActivityItem {
  const newActivity: RoleActivityItem = {
    ...activity,
    id: `act_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  };

  try {
    const key = `${LOCAL_STORAGE_HISTORY_KEY}${employeeId || "default"}`;
    const raw = localStorage.getItem(key);
    const existing: RoleActivityItem[] = raw ? JSON.parse(raw) : [];
    existing.unshift(newActivity);
    localStorage.setItem(key, JSON.stringify(existing.slice(0, 50))); // Keep latest 50
  } catch (err) {
    console.error("Failed to persist employee activity to storage", err);
  }

  return newActivity;
}

// -------------------------------------------------------------
// SERVICE EXPORT: GET ROLE ACTIVITIES
// -------------------------------------------------------------

export function getRoleActivitiesViewData(user: AuthUser | null): RoleHistoryViewData {
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
    warningMessage = `Operational role "${rawRole}" not recognized. Displaying standard ${effectiveConfig.displayName} activity logs.`;
  } else if (!isDepartmentValid) {
    warningMessage = `Role "${effectiveConfig.displayName}" does not belong to department "${department}".`;
  }

  const activityGenerator =
    ROLE_SPECIFIC_ACTIVITIES[effectiveRole] || ROLE_SPECIFIC_ACTIVITIES.station_master;
  const defaultActivities = activityGenerator(user, effectiveConfig);

  // Retrieve any user-created activities from local storage
  let savedActivities: RoleActivityItem[] = [];
  try {
    const key = `${LOCAL_STORAGE_HISTORY_KEY}${employeeId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      savedActivities = JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading saved activities from storage", err);
  }

  // Prepend dynamically logged activities
  const activities = [...savedActivities, ...defaultActivities];

  return {
    employeeName,
    employeeId,
    department,
    roleTitle: effectiveConfig.displayName,
    roleConfig: effectiveConfig,
    activities,
    isRoleValid,
    isDepartmentValid,
    warningMessage,
  };
}


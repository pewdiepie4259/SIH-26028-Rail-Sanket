/**
 * RailDrishti Centralized Employee Quick Actions Service
 *
 * Provides dynamic, role-specific quick action shortcuts for all 23 operational roles.
 *
 * ARCHITECTURE:
 * Logged-in Employee → Department → Operational Role → Role-Specific Quick Actions + Common Actions
 * STRICT ROLE FILTERING: No cross-role action pollution (Loco Pilot !== Track Maintainer !== TTE !== Medical Officer).
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

export interface QuickActionItem {
  id: string;
  label: string;
  description: string;
  route: string;
  iconName: string;
  category: "role" | "common";
  badge?: string;
  isPrimary?: boolean;
}

export interface RoleQuickActionsViewData {
  employeeName: string;
  employeeId: string;
  department: string;
  roleTitle: string;
  roleConfig: EmployeeRoleConfig;
  roleActions: QuickActionItem[];
  commonActions: QuickActionItem[];
  allActions: QuickActionItem[];
  isRoleValid: boolean;
  isDepartmentValid: boolean;
  warningMessage?: string;
}

// -------------------------------------------------------------
// COMMON EMPLOYEE SHORTCUTS
// -------------------------------------------------------------

export const COMMON_EMPLOYEE_ACTIONS: QuickActionItem[] = [
  {
    id: "act_common_duty",
    label: "My Duty",
    description: "Shift roster, hours & logbook",
    route: "/employee/duty",
    iconName: "CalendarCheck",
    category: "common",
  },
  {
    id: "act_common_tasks",
    label: "My Tasks",
    description: "Assigned operational tasks",
    route: "/employee/tasks",
    iconName: "CheckSquare",
    category: "common",
  },
  {
    id: "act_common_alerts",
    label: "Operational Alerts",
    description: "Safety & operational notices",
    route: "/employee/alerts",
    iconName: "AlertTriangle",
    category: "common",
  },
  {
    id: "act_common_incidents",
    label: "Incident Desk",
    description: "Report & monitor incidents",
    route: "/employee/incidents",
    iconName: "Flame",
    category: "common",
  },
];

// -------------------------------------------------------------
// CENTRALIZED ROLE-SPECIFIC QUICK ACTIONS DICTIONARY
// -------------------------------------------------------------

export const ROLE_SPECIFIC_QUICK_ACTIONS: Record<
  OperationalRoleId,
  (_user: AuthUser | null, _roleConfig: EmployeeRoleConfig) => QuickActionItem[]
> = {
  // 1. Station Master
  station_master: () => [
    {
      id: "act_sm_station",
      label: "My Station",
      description: "Station layout & yard overview",
      route: "/employee/assignment",
      iconName: "Building2",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_sm_platforms",
      label: "Platform Status",
      description: "Platform clearance & berthing",
      route: "/employee/assignment",
      iconName: "CircleDot",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_sm_arrivals",
      label: "Arrivals & Departures",
      description: "Timetable & line clearance",
      route: "/employee/assignment",
      iconName: "Clock",
      category: "role",
    },
    {
      id: "act_sm_alerts",
      label: "Station Alerts",
      description: "Platform cautions & speed orders",
      route: "/employee/alerts",
      iconName: "AlertTriangle",
      category: "role",
    },
    {
      id: "act_sm_tasks",
      label: "My Tasks",
      description: "Shift handover & inspections",
      route: "/employee/tasks",
      iconName: "CheckSquare",
      category: "role",
    },
    {
      id: "act_sm_duty",
      label: "My Duty",
      description: "Station master roster & log",
      route: "/employee/duty",
      iconName: "CalendarCheck",
      category: "role",
    },
  ],

  // 2. Station Superintendent
  station_superintendent: () => [
    {
      id: "act_ss_station",
      label: "My Station",
      description: "Station concourse & passenger flow",
      route: "/employee/assignment",
      iconName: "Building2",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_ss_operations",
      label: "Station Operations",
      description: "Supervisory dispatch & roster",
      route: "/employee/duty",
      iconName: "Activity",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_ss_safety",
      label: "Station Safety Alerts",
      description: "Crowd control & station safety",
      route: "/employee/alerts",
      iconName: "ShieldAlert",
      category: "role",
    },
    {
      id: "act_ss_incidents",
      label: "Station Incidents",
      description: "Disruptions & passenger reports",
      route: "/employee/incidents",
      iconName: "Flame",
      category: "role",
    },
    {
      id: "act_ss_tasks",
      label: "My Tasks",
      description: "Station audit & log review",
      route: "/employee/tasks",
      iconName: "CheckSquare",
      category: "role",
    },
    {
      id: "act_ss_duty",
      label: "My Duty",
      description: "Superintendent duty shift",
      route: "/employee/duty",
      iconName: "CalendarCheck",
      category: "role",
    },
  ],

  // 3. Train Manager
  train_manager: () => [
    {
      id: "act_tm_train",
      label: "My Train",
      description: "Assigned rake & coach status",
      route: "/employee/assignment",
      iconName: "TrainFront",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_tm_status",
      label: "Train Status",
      description: "Brake continuity & guard van",
      route: "/employee/assignment",
      iconName: "Activity",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_tm_journey",
      label: "Journey Information",
      description: "Next halt ETA & route cautions",
      route: "/employee/assignment",
      iconName: "Compass",
      category: "role",
    },
    {
      id: "act_tm_alerts",
      label: "Operational Alerts",
      description: "Caution orders & speed limits",
      route: "/employee/alerts",
      iconName: "AlertTriangle",
      category: "role",
    },
    {
      id: "act_tm_tasks",
      label: "My Tasks",
      description: "Brake feel test & signal logs",
      route: "/employee/tasks",
      iconName: "CheckSquare",
      category: "role",
    },
    {
      id: "act_tm_duty",
      label: "My Duty",
      description: "Guard running room & duty log",
      route: "/employee/duty",
      iconName: "CalendarCheck",
      category: "role",
    },
  ],

  // 4. Loco Pilot
  loco_pilot: () => [
    {
      id: "act_lp_train",
      label: "My Train",
      description: "Assigned loco & train composition",
      route: "/employee/assignment",
      iconName: "TrainFront",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_lp_status",
      label: "Train Status",
      description: "Traction motor & brake telemetry",
      route: "/employee/assignment",
      iconName: "Gauge",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_lp_route",
      label: "Route Information",
      description: "Gradient, signals & headway distance",
      route: "/employee/assignment",
      iconName: "Compass",
      category: "role",
    },
    {
      id: "act_lp_alerts",
      label: "Operational Alerts",
      description: "Caution order T/409 & speed limits",
      route: "/employee/alerts",
      iconName: "AlertTriangle",
      category: "role",
    },
    {
      id: "act_lp_tasks",
      label: "My Tasks",
      description: "Pre-departure checklist & VCD",
      route: "/employee/tasks",
      iconName: "CheckSquare",
      category: "role",
    },
    {
      id: "act_lp_duty",
      label: "My Duty",
      description: "Loco pilot running hours & sign-on",
      route: "/employee/duty",
      iconName: "CalendarCheck",
      category: "role",
    },
  ],

  // 5. Assistant Loco Pilot
  assistant_loco_pilot: () => [
    {
      id: "act_alp_train",
      label: "My Train",
      description: "Locomotive WAP-7 #30455",
      route: "/employee/assignment",
      iconName: "TrainFront",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_alp_status",
      label: "Train Status",
      description: "Pneumatic pressure & bogie health",
      route: "/employee/assignment",
      iconName: "Gauge",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_alp_route",
      label: "Route Information",
      description: "Upcoming aspect signals & neutral sec",
      route: "/employee/assignment",
      iconName: "Compass",
      category: "role",
    },
    {
      id: "act_alp_alerts",
      label: "Operational Alerts",
      description: "Signal aspect alerts & cautions",
      route: "/employee/alerts",
      iconName: "AlertTriangle",
      category: "role",
    },
    {
      id: "act_alp_tasks",
      label: "My Tasks",
      description: "VCD verification & cab checks",
      route: "/employee/tasks",
      iconName: "CheckSquare",
      category: "role",
    },
    {
      id: "act_alp_duty",
      label: "My Duty",
      description: "ALP running hours & crew book",
      route: "/employee/duty",
      iconName: "CalendarCheck",
      category: "role",
    },
  ],

  // 6. Section Controller / Train Dispatcher
  section_controller: () => [
    {
      id: "act_sc_section",
      label: "My Section",
      description: "Corridor block lines & dispatch board",
      route: "/employee/assignment",
      iconName: "Radio",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_sc_movement",
      label: "Train Movement",
      description: "Section headway & DSS precedence",
      route: "/employee/assignment",
      iconName: "Activity",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_sc_status",
      label: "Section Status",
      description: "Block occupancy & points clearance",
      route: "/employee/assignment",
      iconName: "CircleDot",
      category: "role",
    },
    {
      id: "act_sc_alerts",
      label: "Operational Alerts",
      description: "Line blocks & traffic conflicts",
      route: "/employee/alerts",
      iconName: "AlertTriangle",
      category: "role",
    },
    {
      id: "act_sc_tasks",
      label: "My Tasks",
      description: "Precedence orders & caution entries",
      route: "/employee/tasks",
      iconName: "CheckSquare",
      category: "role",
    },
    {
      id: "act_sc_duty",
      label: "My Duty",
      description: "Section control shift log",
      route: "/employee/duty",
      iconName: "CalendarCheck",
      category: "role",
    },
  ],

  // 7. Yard Supervisor
  yard_supervisor: () => [
    {
      id: "act_ys_yard",
      label: "Yard Status",
      description: "Marshalling lines & rake occupancy",
      route: "/employee/assignment",
      iconName: "Building2",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_ys_movements",
      label: "Assigned Movements",
      description: "Shunting memo & engine transitions",
      route: "/employee/assignment",
      iconName: "Activity",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_ys_tasks",
      label: "Yard Tasks",
      description: "Rake placement & point inspections",
      route: "/employee/tasks",
      iconName: "CheckSquare",
      category: "role",
    },
    {
      id: "act_ys_alerts",
      label: "Operational Alerts",
      description: "Yard congestion & safety cautions",
      route: "/employee/alerts",
      iconName: "AlertTriangle",
      category: "role",
    },
    {
      id: "act_ys_duty",
      label: "My Duty",
      description: "Yard supervisor shift logbook",
      route: "/employee/duty",
      iconName: "CalendarCheck",
      category: "role",
    },
  ],

  // 8. Track Maintainer
  track_maintainer: () => [
    {
      id: "act_tmk_section",
      label: "My Section",
      description: "P-Way beat Km 40–55 Down Line",
      route: "/employee/assignment",
      iconName: "Compass",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_tmk_inspection",
      label: "Track Inspection",
      description: "Rail temperature & gauge check",
      route: "/employee/assignment",
      iconName: "Activity",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_tmk_tasks",
      label: "Maintenance Tasks",
      description: "Fishplate bolt tightening & packing",
      route: "/employee/tasks",
      iconName: "CheckSquare",
      category: "role",
    },
    {
      id: "act_tmk_defects",
      label: "Track Defects",
      description: "USFD weld flaws & fracture log",
      route: "/employee/report",
      iconName: "FileWarning",
      category: "role",
    },
    {
      id: "act_tmk_alerts",
      label: "Safety Alerts",
      description: "Track shadow block & speed limits",
      route: "/employee/alerts",
      iconName: "AlertTriangle",
      category: "role",
    },
    {
      id: "act_tmk_duty",
      label: "My Duty",
      description: "Keyman patrolling shift record",
      route: "/employee/duty",
      iconName: "CalendarCheck",
      category: "role",
    },
  ],

  // 9. Section Engineer
  section_engineer: () => [
    {
      id: "act_se_section",
      label: "My Section",
      description: "Divisional P-Way track corridor",
      route: "/employee/assignment",
      iconName: "Compass",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_se_tasks",
      label: "Engineering Tasks",
      description: "Tamping machine & ballast dressing",
      route: "/employee/tasks",
      iconName: "CheckSquare",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_se_issues",
      label: "Track Issues",
      description: "Weld flaw USFD reviews & renewals",
      route: "/employee/report",
      iconName: "FileWarning",
      category: "role",
    },
    {
      id: "act_se_inspection",
      label: "Inspection",
      description: "Turnout geometry & clearance audit",
      route: "/employee/assignment",
      iconName: "Activity",
      category: "role",
    },
    {
      id: "act_se_alerts",
      label: "Safety Alerts",
      description: "Caution orders & deep screening",
      route: "/employee/alerts",
      iconName: "AlertTriangle",
      category: "role",
    },
    {
      id: "act_se_duty",
      label: "My Duty",
      description: "Section engineer duty roster",
      route: "/employee/duty",
      iconName: "CalendarCheck",
      category: "role",
    },
  ],

  // 10. Bridge & Structure Inspector
  bridge_structure_inspector: () => [
    {
      id: "act_bsi_section",
      label: "My Section",
      description: "Yamuna Bridge #42 & Station FOBs",
      route: "/employee/assignment",
      iconName: "Building2",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_bsi_inspection",
      label: "Bridge Inspection",
      description: "Pier scour depth & sonar telemetry",
      route: "/employee/assignment",
      iconName: "Activity",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_bsi_issues",
      label: "Structure Issues",
      description: "Girder bearings & rivet fatigue",
      route: "/employee/report",
      iconName: "FileWarning",
      category: "role",
    },
    {
      id: "act_bsi_tasks",
      label: "Engineering Tasks",
      description: "Pre-monsoon metallurgical ultrasound",
      route: "/employee/tasks",
      iconName: "CheckSquare",
      category: "role",
    },
    {
      id: "act_bsi_alerts",
      label: "Safety Alerts",
      description: "Scour telemetry alerts & notices",
      route: "/employee/alerts",
      iconName: "AlertTriangle",
      category: "role",
    },
    {
      id: "act_bsi_duty",
      label: "My Duty",
      description: "Bridge inspection duty log",
      route: "/employee/duty",
      iconName: "CalendarCheck",
      category: "role",
    },
  ],

  // 11. Signal Maintainer
  signal_maintainer: () => [
    {
      id: "act_smk_section",
      label: "My Section",
      description: "Relay room & Signal Sector 2",
      route: "/employee/assignment",
      iconName: "Radio",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_smk_status",
      label: "Signal Status",
      description: "Point machines & track circuits",
      route: "/employee/assignment",
      iconName: "Activity",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_smk_faults",
      label: "Signal Faults",
      description: "Track circuit TC-44 drop analysis",
      route: "/employee/report",
      iconName: "FileWarning",
      category: "role",
    },
    {
      id: "act_smk_tasks",
      label: "Maintenance Tasks",
      description: "Point 104 current calibration",
      route: "/employee/tasks",
      iconName: "CheckSquare",
      category: "role",
    },
    {
      id: "act_smk_alerts",
      label: "Safety Alerts",
      description: "Electronic interlocking alerts",
      route: "/employee/alerts",
      iconName: "AlertTriangle",
      category: "role",
    },
    {
      id: "act_smk_duty",
      label: "My Duty",
      description: "Signal maintainer shift roster",
      route: "/employee/duty",
      iconName: "CalendarCheck",
      category: "role",
    },
  ],

  // 12. Telecom Technician
  telecom_technician: () => [
    {
      id: "act_tt_section",
      label: "My Section",
      description: "Telecom sector & OFC trunk line",
      route: "/employee/assignment",
      iconName: "Radio",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_tt_status",
      label: "Telecom Status",
      description: "VHF repeaters & PIS server health",
      route: "/employee/assignment",
      iconName: "Activity",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_tt_faults",
      label: "Communication Faults",
      description: "OFC OTDR fiber diagnostics",
      route: "/employee/report",
      iconName: "FileWarning",
      category: "role",
    },
    {
      id: "act_tt_tasks",
      label: "Maintenance Tasks",
      description: "Repeater battery & carrier test",
      route: "/employee/tasks",
      iconName: "CheckSquare",
      category: "role",
    },
    {
      id: "act_tt_alerts",
      label: "Alerts",
      description: "Radio link drop & PIS sync alerts",
      route: "/employee/alerts",
      iconName: "AlertTriangle",
      category: "role",
    },
    {
      id: "act_tt_duty",
      label: "My Duty",
      description: "Telecom technician duty shift",
      route: "/employee/duty",
      iconName: "CalendarCheck",
      category: "role",
    },
  ],

  // 13. Loco / Depot Maintenance Technician
  depot_maintenance_technician: () => [
    {
      id: "act_dmt_assignment",
      label: "My Assignment",
      description: "Loco shed pitline bay 2 & 4",
      route: "/employee/assignment",
      iconName: "TrainFront",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_dmt_status",
      label: "Asset Status",
      description: "Traction motor thermals & compressor",
      route: "/employee/assignment",
      iconName: "Gauge",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_dmt_tasks",
      label: "Maintenance Tasks",
      description: "Carbon strip replacement & greasing",
      route: "/employee/tasks",
      iconName: "CheckSquare",
      category: "role",
    },
    {
      id: "act_dmt_alerts",
      label: "Maintenance Alerts",
      description: "Bearing acoustic scanner warnings",
      route: "/employee/alerts",
      iconName: "AlertTriangle",
      category: "role",
    },
    {
      id: "act_dmt_duty",
      label: "My Duty",
      description: "Depot mechanical shift log",
      route: "/employee/duty",
      iconName: "CalendarCheck",
      category: "role",
    },
  ],

  // 14. Coach Cleanliness & Sanitation Staff
  coach_cleanliness_staff: () => [
    {
      id: "act_ccs_assignment",
      label: "My Assignment",
      description: "Washing line 4 & pitline siding",
      route: "/employee/assignment",
      iconName: "Building2",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_ccs_coach",
      label: "Coach Assignment",
      description: "Coach Rake 12424 [Coach B1-B6]",
      route: "/employee/assignment",
      iconName: "TrainFront",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_ccs_tasks",
      label: "Cleaning Tasks",
      description: "Bio-toilet vacuum pump & disinfection",
      route: "/employee/tasks",
      iconName: "CheckSquare",
      category: "role",
    },
    {
      id: "act_ccs_issues",
      label: "Cleanliness Issues",
      description: "RailMadad passenger sanitation calls",
      route: "/employee/report",
      iconName: "FileWarning",
      category: "role",
    },
    {
      id: "act_ccs_duty",
      label: "My Duty",
      description: "Sanitation team shift log",
      route: "/employee/duty",
      iconName: "CalendarCheck",
      category: "role",
    },
  ],

  // 15. TTE (Traveling Ticket Examiner)
  tte: () => [
    {
      id: "act_tte_train",
      label: "My Train",
      description: "Train 12424 (DBRT RAJDHANI)",
      route: "/employee/assignment",
      iconName: "TrainFront",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_tte_coach",
      label: "My Coach",
      description: "Coaches B1 to B6 passenger quota",
      route: "/employee/assignment",
      iconName: "CircleDot",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_tte_duty_p",
      label: "Passenger Duty",
      description: "Ticket checking & berth upgrades",
      route: "/employee/duty",
      iconName: "UserCheck",
      category: "role",
    },
    {
      id: "act_tte_status",
      label: "Train Status",
      description: "Real-time running status & stops",
      route: "/employee/assignment",
      iconName: "Activity",
      category: "role",
    },
    {
      id: "act_tte_tasks",
      label: "My Tasks",
      description: "HHT chart sync & vacancy report",
      route: "/employee/tasks",
      iconName: "CheckSquare",
      category: "role",
    },
    {
      id: "act_tte_duty",
      label: "My Duty",
      description: "TTE running room & shift log",
      route: "/employee/duty",
      iconName: "CalendarCheck",
      category: "role",
    },
  ],

  // 16. Station Booking & Enquiry Clerk
  booking_enquiry_clerk: () => [
    {
      id: "act_bec_station",
      label: "My Station",
      description: "UTS booking hall cluster 4",
      route: "/employee/assignment",
      iconName: "Building2",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_bec_services",
      label: "Passenger Services",
      description: "Tatkal quota & token displays",
      route: "/employee/assignment",
      iconName: "Users",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_bec_enquiry",
      label: "Enquiry Tasks",
      description: "Special train schedules & tariffs",
      route: "/employee/tasks",
      iconName: "CheckSquare",
      category: "role",
    },
    {
      id: "act_bec_alerts",
      label: "Service Alerts",
      description: "UTS network latency & server sync",
      route: "/employee/alerts",
      iconName: "AlertTriangle",
      category: "role",
    },
    {
      id: "act_bec_tasks",
      label: "My Tasks",
      description: "Shift cash book balance & tickets",
      route: "/employee/tasks",
      iconName: "CheckSquare",
      category: "role",
    },
    {
      id: "act_bec_duty",
      label: "My Duty",
      description: "Booking clerk counter shift roster",
      route: "/employee/duty",
      iconName: "CalendarCheck",
      category: "role",
    },
  ],
  station_booking_clerk: (u, cfg) => ROLE_SPECIFIC_QUICK_ACTIONS.booking_enquiry_clerk(u, cfg),

  // 17. Commercial Inspector
  commercial_inspector: () => [
    {
      id: "act_ci_assignment",
      label: "My Assignment",
      description: "Station commercial stalls & parcel",
      route: "/employee/assignment",
      iconName: "Building2",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_ci_tasks",
      label: "Commercial Tasks",
      description: "Catering hygiene & weighbridge audits",
      route: "/employee/tasks",
      iconName: "CheckSquare",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_ci_services",
      label: "Station/Train Services",
      description: "Vendor MRP verification & quality",
      route: "/employee/assignment",
      iconName: "Activity",
      category: "role",
    },
    {
      id: "act_ci_issues",
      label: "Passenger Service Issues",
      description: "RailMadad overcharging penalty logs",
      route: "/employee/report",
      iconName: "FileWarning",
      category: "role",
    },
    {
      id: "act_ci_duty",
      label: "My Duty",
      description: "Commercial inspector daily register",
      route: "/employee/duty",
      iconName: "CalendarCheck",
      category: "role",
    },
  ],

  // 18. Customer Support Specialist
  customer_support_specialist: () => [
    {
      id: "act_css_support",
      label: "Passenger Support",
      description: "Helpdesk & buggy facilitation",
      route: "/employee/assignment",
      iconName: "Users",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_css_issues",
      label: "Service Issues",
      description: "Lost & found claims and escalations",
      route: "/employee/report",
      iconName: "FileWarning",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_css_tasks",
      label: "Support Tasks",
      description: "Wheelchair bookings & SMS broadcast",
      route: "/employee/tasks",
      iconName: "CheckSquare",
      category: "role",
    },
    {
      id: "act_css_alerts",
      label: "Service Alerts",
      description: "Train delay broadcasts & announcements",
      route: "/employee/alerts",
      iconName: "AlertTriangle",
      category: "role",
    },
    {
      id: "act_css_duty",
      label: "My Duty",
      description: "Passenger support shift log",
      route: "/employee/duty",
      iconName: "CalendarCheck",
      category: "role",
    },
  ],

  // 19. RPF Escort Constable
  rpf_escort_constable: () => [
    {
      id: "act_rpf_train",
      label: "My Train",
      description: "Train 12424 Security Escort",
      route: "/employee/assignment",
      iconName: "TrainFront",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_rpf_duty_sec",
      label: "Security Duty",
      description: "Coach foot patrol S1-S6 / B1-B4",
      route: "/employee/duty",
      iconName: "ShieldCheck",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_rpf_alerts",
      label: "Security Alerts",
      description: "High-alert sectors & cautions",
      route: "/employee/alerts",
      iconName: "ShieldAlert",
      category: "role",
    },
    {
      id: "act_rpf_incidents",
      label: "Incident Information",
      description: "Detained hawkers & trespass memo",
      route: "/employee/incidents",
      iconName: "Flame",
      category: "role",
    },
    {
      id: "act_rpf_tasks",
      label: "My Tasks",
      description: "VHF radio check & patrol register",
      route: "/employee/tasks",
      iconName: "CheckSquare",
      category: "role",
    },
    {
      id: "act_rpf_duty",
      label: "My Duty",
      description: "RPF escort running logbook",
      route: "/employee/duty",
      iconName: "CalendarCheck",
      category: "role",
    },
  ],

  // 20. Station Security Officer
  station_security_officer: () => [
    {
      id: "act_sso_station",
      label: "My Station",
      description: "Concourse security & CCTV cell",
      route: "/employee/assignment",
      iconName: "Building2",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_sso_status",
      label: "Security Status",
      description: "DFMD gates & perimeter coverage",
      route: "/employee/assignment",
      iconName: "ShieldCheck",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_sso_incidents",
      label: "Security Incidents",
      description: "Unattended baggage BDDS alarms",
      route: "/employee/incidents",
      iconName: "Flame",
      category: "role",
    },
    {
      id: "act_sso_alerts",
      label: "Safety Alerts",
      description: "Station perimeter & exit gate checks",
      route: "/employee/alerts",
      iconName: "ShieldAlert",
      category: "role",
    },
    {
      id: "act_sso_tasks",
      label: "My Tasks",
      description: "DFMD calibration & dog squad log",
      route: "/employee/tasks",
      iconName: "CheckSquare",
      category: "role",
    },
    {
      id: "act_sso_duty",
      label: "My Duty",
      description: "Station security shift roster",
      route: "/employee/duty",
      iconName: "CalendarCheck",
      category: "role",
    },
  ],

  // 21. Railway Medical Officer / Doctor
  railway_medical_officer: () => [
    {
      id: "act_rmo_assignment",
      label: "Medical Assignment",
      description: "Divisional hospital & first aid post",
      route: "/employee/assignment",
      iconName: "Building2",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_rmo_incidents",
      label: "Medical Incidents",
      description: "Cardiac & trauma patient attendance",
      route: "/employee/incidents",
      iconName: "Flame",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_rmo_emergency",
      label: "Emergency Information",
      description: "ICU ambulance transfer bay & CMS",
      route: "/employee/alerts",
      iconName: "AlertTriangle",
      category: "role",
    },
    {
      id: "act_rmo_tasks",
      label: "Medical Tasks",
      description: "Station AED & trauma kit audit",
      route: "/employee/tasks",
      iconName: "CheckSquare",
      category: "role",
    },
    {
      id: "act_rmo_duty",
      label: "My Duty",
      description: "Medical officer emergency roster",
      route: "/employee/duty",
      iconName: "CalendarCheck",
      category: "role",
    },
  ],

  // 22. Emergency Medical Responder
  emergency_medical_responder: () => [
    {
      id: "act_emr_assignment",
      label: "Emergency Assignment",
      description: "First aid post #1 & rapid ambulance",
      route: "/employee/assignment",
      iconName: "Building2",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_emr_incidents",
      label: "Medical Incidents",
      description: "Platform passenger collapse dispatch",
      route: "/employee/incidents",
      iconName: "Flame",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_emr_tasks",
      label: "Emergency Tasks",
      description: "AED pads, oxygen & kit restock",
      route: "/employee/tasks",
      iconName: "CheckSquare",
      category: "role",
    },
    {
      id: "act_emr_alerts",
      label: "Safety Alerts",
      description: "Ambulance rapid access drill logs",
      route: "/employee/alerts",
      iconName: "AlertTriangle",
      category: "role",
    },
    {
      id: "act_emr_duty",
      label: "My Duty",
      description: "First responder shift roster",
      route: "/employee/duty",
      iconName: "CalendarCheck",
      category: "role",
    },
  ],

  // 23. Electrical Traction Technician (OHE)
  electrical_traction_technician: () => [
    {
      id: "act_ett_assignment",
      label: "My Assignment",
      description: "Traction Sub-Station & OHE Sector 1",
      route: "/employee/assignment",
      iconName: "Building2",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_ett_status",
      label: "OHE Status",
      description: "25kV contact wire tension & feed",
      route: "/employee/assignment",
      iconName: "Activity",
      category: "role",
      isPrimary: true,
    },
    {
      id: "act_ett_tasks",
      label: "Traction Tasks",
      description: "Tower wagon ATD tensioner reset",
      route: "/employee/tasks",
      iconName: "CheckSquare",
      category: "role",
    },
    {
      id: "act_ett_alerts",
      label: "Power Alerts",
      description: "25kV power isolation block notice",
      route: "/employee/alerts",
      iconName: "AlertTriangle",
      category: "role",
    },
    {
      id: "act_ett_duty",
      label: "My Duty",
      description: "Traction technician duty log",
      route: "/employee/duty",
      iconName: "CalendarCheck",
      category: "role",
    },
  ],
};

// -------------------------------------------------------------
// SERVICE EXPORTS / RESOLVERS
// -------------------------------------------------------------

/**
 * Get role-filtered Quick Actions for the current logged-in employee
 */
export function getRoleQuickActionsViewData(user: AuthUser | null): RoleQuickActionsViewData {
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
    warningMessage = `Operational role "${rawRole}" not recognized. Displaying standard Quick Actions.`;
  } else if (!isDepartmentValid) {
    warningMessage = `Role "${effectiveConfig.displayName}" does not belong to department "${department}".`;
  }

  const actionGenerator =
    ROLE_SPECIFIC_QUICK_ACTIONS[effectiveRole] || ROLE_SPECIFIC_QUICK_ACTIONS.station_master;
  const roleActions = actionGenerator(user, effectiveConfig);

  const allActions = [...roleActions];

  return {
    employeeName,
    employeeId,
    department,
    roleTitle: effectiveConfig.displayName,
    roleConfig: effectiveConfig,
    roleActions,
    commonActions: COMMON_EMPLOYEE_ACTIONS,
    allActions,
    isRoleValid,
    isDepartmentValid,
    warningMessage,
  };
}

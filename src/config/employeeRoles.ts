/**
 * RailDrishti Centralized Employee Role Architecture
 *
 * Matrix: 7 Departments, 23 Operational Roles
 * Maps Account Role (Employee / Controller) → Department → Operational Role
 */

export const EMPLOYEE_DEPARTMENTS = [
  "Operations & Traffic Control",
  "Safety & Disaster Management",
  "Signal & Telecommunication (S&T)",
  "Civil & Track Engineering",
  "Mechanical & Rolling Stock",
  "Electrical & Traction (OHE)",
  "Commercial & Passenger Amenities",
] as const;

export type EmployeeDepartment = (typeof EMPLOYEE_DEPARTMENTS)[number];

export type OperationalRoleId =
  // 1. Operations & Traffic Control
  | "station_master"
  | "station_superintendent"
  | "train_manager"
  | "section_controller"
  | "yard_supervisor"
  // 2. Safety & Disaster Management
  | "rpf_escort_constable"
  | "station_security_officer"
  | "railway_medical_officer"
  | "emergency_medical_responder"
  // 3. Signal & Telecommunication (S&T)
  | "signal_maintainer"
  | "telecom_technician"
  // 4. Civil & Track Engineering
  | "track_maintainer"
  | "section_engineer"
  | "bridge_structure_inspector"
  // 5. Mechanical & Rolling Stock
  | "loco_pilot"
  | "assistant_loco_pilot"
  | "depot_maintenance_technician"
  | "coach_cleanliness_staff"
  // 6. Commercial & Passenger Amenities
  | "tte"
  | "booking_enquiry_clerk"
  | "station_booking_clerk" // alias for backward compatibility
  | "commercial_inspector"
  | "customer_support_specialist"
  // 7. Electrical & Traction (OHE)
  | "electrical_traction_technician";

export type AssignmentScopeType =
  | "Station"
  | "Train"
  | "Section"
  | "Facility"
  | "Security"
  | "Medical"
  | "Counter"
  | "OHE";

export type DashboardType =
  | "station_operations"
  | "train_operations"
  | "track_operations"
  | "signal_operations"
  | "mechanical_operations"
  | "commercial_operations"
  | "security_operations"
  | "medical_operations"
  | "traction_operations";

export interface EmployeeRoleConfig {
  id: OperationalRoleId;
  displayName: string;
  name?: string; // backward compatibility alias
  department: EmployeeDepartment;
  dutyType: string;
  primaryResponsibility: string;
  assignmentType: AssignmentScopeType;
  dashboardType: DashboardType;
  relevantWidgets: string[];
  taskTypes: string[];
  alertTypes: string[];
  allowedActions: { label: string; route: string }[];
  description?: string;
  // Aliases for compatibility
  dashboardWidgets?: string[];
  alertCategories?: string[];
  taskCategories?: string[];
  quickActions?: { label: string; route: string }[];
}

// -------------------------------------------------------------
// CENTRALIZED ROLE DEFINITIONS
// -------------------------------------------------------------

export const EMPLOYEE_ROLES: Record<OperationalRoleId, EmployeeRoleConfig> = {
  // -----------------------------------------------------------
  // 1. Operations & Traffic Control
  // -----------------------------------------------------------
  station_master: {
    id: "station_master",
    displayName: "Station Master",
    name: "Station Master",
    department: "Operations & Traffic Control",
    dutyType: "Station Operations",
    primaryResponsibility: "Station movement coordination, platform clearance, and local train interlocking",
    assignmentType: "Station",
    dashboardType: "station_operations",
    relevantWidgets: ["duty", "stationOperations", "platformStatus", "trainMovement", "operationalAlerts", "tasks"],
    taskTypes: ["platform_inspection", "movement_coordination", "shift_handover", "communication_check"],
    alertTypes: ["platform", "train_movement", "station_safety", "delay"],
    allowedActions: [
      { label: "My Duty Log", route: "/employee/duty" },
      { label: "Station Assignment", route: "/employee/assignment" },
      { label: "Station Alerts", route: "/employee/alerts" },
    ],
  },
  station_superintendent: {
    id: "station_superintendent",
    displayName: "Station Superintendent",
    name: "Station Superintendent",
    department: "Operations & Traffic Control",
    dutyType: "Station Administration & Operations",
    primaryResponsibility: "Overall station management, passenger flow supervision, and inter-departmental dispatch",
    assignmentType: "Station",
    dashboardType: "station_operations",
    relevantWidgets: ["duty", "stationOperations", "platformOverview", "passengerFlow", "operationalAlerts", "tasks"],
    taskTypes: ["station_audit", "supervisor_logbook", "incident_review", "platform_roster"],
    alertTypes: ["station_overview", "crowd_management", "operational_alerts", "delay"],
    allowedActions: [
      { label: "Duty Overview", route: "/employee/duty" },
      { label: "Station Assignment", route: "/employee/assignment" },
      { label: "Incident Desk", route: "/employee/incidents" },
    ],
  },
  train_manager: {
    id: "train_manager",
    displayName: "Train Manager",
    name: "Train Manager",
    department: "Operations & Traffic Control",
    dutyType: "Train Operations & Safety",
    primaryResponsibility: "On-board rake safety, brake continuity verification, and journey progress monitoring",
    assignmentType: "Train",
    dashboardType: "train_operations",
    relevantWidgets: ["duty", "assignedTrain", "trainStatus", "nextStation", "operationalAlerts", "tasks"],
    taskTypes: ["brake_feel_test", "passenger_safety", "journey_log", "signal_exchange"],
    alertTypes: ["train_eta", "speed_restrictions", "weather_caution", "delay"],
    allowedActions: [
      { label: "Assigned Train", route: "/employee/assignment" },
      { label: "Duty Schedule", route: "/employee/duty" },
      { label: "Report Issue", route: "/employee/report" },
    ],
  },
  section_controller: {
    id: "section_controller",
    displayName: "Section Controller / Train Dispatcher",
    name: "Section Controller / Train Dispatcher",
    department: "Operations & Traffic Control",
    dutyType: "Corridor Dispatch & Section Control",
    primaryResponsibility: "Corridor-wide block section dispatching, precedence management, and division relay coordination",
    assignmentType: "Section",
    dashboardType: "station_operations",
    relevantWidgets: ["duty", "corridorStatus", "sectionInterlocking", "trainPrecedence", "operationalAlerts", "tasks"],
    taskTypes: ["precedence_dispatch", "speed_restriction_log", "interlocking_verification", "shift_relay"],
    alertTypes: ["cascade_conflict", "bottleneck", "speed_caution", "division_alert"],
    allowedActions: [
      { label: "Section Monitor", route: "/employee/assignment" },
      { label: "Section Alerts", route: "/employee/alerts" },
      { label: "Duty Roster", route: "/employee/duty" },
    ],
  },
  yard_supervisor: {
    id: "yard_supervisor",
    displayName: "Yard Supervisor",
    name: "Yard Supervisor",
    department: "Operations & Traffic Control",
    dutyType: "Yard Shunting & Stabling",
    primaryResponsibility: "Marshalling yard movements, rake stabling, shunting operations, and siding coordination",
    assignmentType: "Facility",
    dashboardType: "station_operations",
    relevantWidgets: ["duty", "yardOccupancy", "shuntingStatus", "rakeFormation", "operationalAlerts", "tasks"],
    taskTypes: ["shunting_order", "rake_formation_check", "siding_clearance", "point_lock_verification"],
    alertTypes: ["yard_congestion", "point_failure", "derailment_risk", "shunting_caution"],
    allowedActions: [
      { label: "Yard Duty", route: "/employee/duty" },
      { label: "Yard Layout", route: "/employee/assignment" },
      { label: "Report Yard Issue", route: "/employee/report" },
    ],
  },

  // -----------------------------------------------------------
  // 2. Safety & Disaster Management
  // -----------------------------------------------------------
  rpf_escort_constable: {
    id: "rpf_escort_constable",
    displayName: "RPF Escort Constable",
    name: "RPF Escort Constable",
    department: "Safety & Disaster Management",
    dutyType: "Train Escort & Security",
    primaryResponsibility: "On-board passenger safety, rake surveillance, vigilance patrol, and theft prevention",
    assignmentType: "Security",
    dashboardType: "security_operations",
    relevantWidgets: ["duty", "escortDuty", "trainSurveillance", "securityAlerts", "tasks"],
    taskTypes: ["coach_patrol", "vestibule_inspection", "passenger_grievance_check", "security_briefing"],
    alertTypes: ["security_breach", "alarm_chain_pulling", "crowd_disorder", "theft_report"],
    allowedActions: [
      { label: "Security Log", route: "/employee/duty" },
      { label: "Escort Assignment", route: "/employee/assignment" },
      { label: "Security Incident", route: "/employee/incidents" },
    ],
  },
  station_security_officer: {
    id: "station_security_officer",
    displayName: "Station Security Officer",
    name: "Station Security Officer",
    department: "Safety & Disaster Management",
    dutyType: "Station Perimeter & Crowd Security",
    primaryResponsibility: "Station access control, baggage scanner supervision, CCTV monitoring, and emergency containment",
    assignmentType: "Security",
    dashboardType: "security_operations",
    relevantWidgets: ["duty", "perimeterStatus", "cctvFeeds", "securityAlerts", "tasks"],
    taskTypes: ["concourse_inspection", "scanner_audit", "cctv_zone_patrol", "crowd_containment"],
    alertTypes: ["unattended_baggage", "perimeter_intrusion", "station_crowd_surge", "emergency_dispatch"],
    allowedActions: [
      { label: "Security Desk", route: "/employee/duty" },
      { label: "Station Post", route: "/employee/assignment" },
      { label: "Report Incident", route: "/employee/incidents" },
    ],
  },
  railway_medical_officer: {
    id: "railway_medical_officer",
    displayName: "Railway Medical Officer",
    name: "Railway Medical Officer",
    department: "Safety & Disaster Management",
    dutyType: "Railway Healthcare & Disaster Medicine",
    primaryResponsibility: "Clinical consultations, staff fitness evaluation, ARMV ambulance train readiness, and accident triage",
    assignmentType: "Medical",
    dashboardType: "medical_operations",
    relevantWidgets: ["duty", "medicalDispatches", "armvReadiness", "healthAlerts", "tasks"],
    taskTypes: ["staff_medical_fitness", "armv_inspection", "first_aid_audit", "accident_relief_drill"],
    alertTypes: ["passenger_medical_emergency", "armv_dispatch_siren", "infectious_notice", "paramedic_alert"],
    allowedActions: [
      { label: "Medical Duty", route: "/employee/duty" },
      { label: "ARMV Readiness", route: "/employee/assignment" },
      { label: "Emergency Case", route: "/employee/incidents" },
    ],
  },
  emergency_medical_responder: {
    id: "emergency_medical_responder",
    displayName: "Emergency Medical Responder",
    name: "Emergency Medical Responder",
    department: "Safety & Disaster Management",
    dutyType: "First Response & Critical Evacuation",
    primaryResponsibility: "Emergency first-aid response on platforms/trains, stretcher evacuation, and ARMV medical gear readiness",
    assignmentType: "Medical",
    dashboardType: "medical_operations",
    relevantWidgets: ["duty", "paramedicPost", "firstAidReadiness", "medicalAlerts", "tasks"],
    taskTypes: ["oxygen_cylinder_check", "first_aid_kit_readiness", "ambulance_coordination", "paramedic_patrol"],
    alertTypes: ["cardiac_emergency", "platform_casualty", "train_sos_call", "derailment_triage"],
    allowedActions: [
      { label: "Responder Duty", route: "/employee/duty" },
      { label: "First-Aid Post", route: "/employee/assignment" },
      { label: "Emergency Response", route: "/employee/incidents" },
    ],
  },

  // -----------------------------------------------------------
  // 3. Signal & Telecommunication (S&T)
  // -----------------------------------------------------------
  signal_maintainer: {
    id: "signal_maintainer",
    displayName: "Signal Maintainer",
    name: "Signal Maintainer",
    department: "Signal & Telecommunication (S&T)",
    dutyType: "Signal & Interlocking Maintenance",
    primaryResponsibility: "Point machine testing, electronic interlocking, track circuit maintenance, and signal lamp inspection",
    assignmentType: "Section",
    dashboardType: "signal_operations",
    relevantWidgets: ["duty", "signalSection", "activeSignalIssues", "interlockingRelays", "operationalAlerts", "tasks"],
    taskTypes: ["point_machine_greasing", "track_circuit_calibration", "signal_aspect_audit", "relay_voltage_check"],
    alertTypes: ["signal_failure", "track_circuit_drop", "point_detection_failure", "fuse_blown"],
    allowedActions: [
      { label: "Signal Schedule", route: "/employee/duty" },
      { label: "Assigned Section", route: "/employee/assignment" },
      { label: "Report Signal Defect", route: "/employee/report" },
    ],
  },
  telecom_technician: {
    id: "telecom_technician",
    displayName: "Telecom Technician",
    name: "Telecom Technician",
    department: "Signal & Telecommunication (S&T)",
    dutyType: "Railway Communications & OFC Network",
    primaryResponsibility: "Optical fiber cable (OFC) maintenance, VHF walkie-talkie sets, passenger announcement (PA) systems, and train radio",
    assignmentType: "Section",
    dashboardType: "signal_operations",
    relevantWidgets: ["duty", "telecomNetwork", "vhfHealth", "paSystemStatus", "operationalAlerts", "tasks"],
    taskTypes: ["ofc_attenuation_test", "vhf_repeater_check", "station_pa_calibration", "emergency_control_phone_test"],
    alertTypes: ["ofc_cut_alert", "vhf_channel_noise", "pa_failure", "control_phone_dead"],
    allowedActions: [
      { label: "Telecom Duty", route: "/employee/duty" },
      { label: "OFC Network Grid", route: "/employee/assignment" },
      { label: "Report Telecom Fault", route: "/employee/report" },
    ],
  },

  // -----------------------------------------------------------
  // 4. Civil & Track Engineering
  // -----------------------------------------------------------
  track_maintainer: {
    id: "track_maintainer",
    displayName: "Track Maintainer",
    name: "Track Maintainer",
    department: "Civil & Track Engineering",
    dutyType: "Permanent Way (P-Way) Maintenance",
    primaryResponsibility: "Track patrol, rail fracture detection, sleeper packing, gauge checking, and monsoon patrolling",
    assignmentType: "Section",
    dashboardType: "track_operations",
    relevantWidgets: ["duty", "trackSection", "pwayHealth", "cautionOrders", "operationalAlerts", "tasks"],
    taskTypes: ["keyman_patrol", "fishplate_tightening", "gauge_crosslevel_check", "monsoon_culvert_clearing"],
    alertTypes: ["rail_fracture", "track_buckling", "heavy_rainfall_alert", "boulder_fall_risk"],
    allowedActions: [
      { label: "P-Way Duty Log", route: "/employee/duty" },
      { label: "Assigned Section", route: "/employee/assignment" },
      { label: "Report Track Defect", route: "/employee/report" },
    ],
  },
  section_engineer: {
    id: "section_engineer",
    displayName: "Section Engineer (P-Way / Works)",
    name: "Section Engineer",
    department: "Civil & Track Engineering",
    dutyType: "Track Engineering Supervision",
    primaryResponsibility: "Track renewal supervision, ultrasonic rail testing (USFD) audit, speed restriction imposition, and safety clearance",
    assignmentType: "Section",
    dashboardType: "track_operations",
    relevantWidgets: ["duty", "divisionTrackGrid", "speedRestrictions", "usfdLogs", "operationalAlerts", "tasks"],
    taskTypes: ["track_machine_tamping", "usfd_defect_review", "joint_switch_inspection", "caution_order_issue"],
    alertTypes: ["speed_restriction_active", "weld_defect_critical", "tamping_block_required", "derailment_hazard"],
    allowedActions: [
      { label: "Engineering Duty", route: "/employee/duty" },
      { label: "Track Territory", route: "/employee/assignment" },
      { label: "Issue Restriction", route: "/employee/report" },
    ],
  },
  bridge_structure_inspector: {
    id: "bridge_structure_inspector",
    displayName: "Bridge & Structure Inspector",
    name: "Bridge & Structure Inspector",
    department: "Civil & Track Engineering",
    dutyType: "Bridge & Structural Integrity",
    primaryResponsibility: "Railway girder bridge inspections, water level/scour depth monitoring, tunnel safety, and culvert structural audits",
    assignmentType: "Section",
    dashboardType: "track_operations",
    relevantWidgets: ["duty", "bridgeTerritory", "waterLevelSensors", "structuralAudits", "operationalAlerts", "tasks"],
    taskTypes: ["pier_scour_sounding", "girder_camber_measurement", "bearing_greasing", "monsoon_high_flood_watch"],
    alertTypes: ["high_flood_warning", "bearing_displacement", "girder_corrosion", "tunnel_seepage"],
    allowedActions: [
      { label: "Inspection Duty", route: "/employee/duty" },
      { label: "Bridge Inventory", route: "/employee/assignment" },
      { label: "Report Structural Flaw", route: "/employee/report" },
    ],
  },

  // -----------------------------------------------------------
  // 5. Mechanical & Rolling Stock
  // -----------------------------------------------------------
  loco_pilot: {
    id: "loco_pilot",
    displayName: "Loco Pilot",
    name: "Loco Pilot",
    department: "Mechanical & Rolling Stock",
    dutyType: "Train Driving & Locomotive Operations",
    primaryResponsibility: "Safe operation of locomotive, signal aspect compliance, speed control, caution orders, and Kavach ATP adherence",
    assignmentType: "Train",
    dashboardType: "train_operations",
    relevantWidgets: ["duty", "assignedLocomotive", "routeAspects", "speedProfile", "operationalAlerts", "tasks"],
    taskTypes: ["cab_sign_on_breathalyzer", "brake_pipe_continuity_check", "kavach_atp_self_test", "loco_logbook_entry"],
    alertTypes: ["signal_aspect_change", "speed_restriction_ahead", "kavach_brake_intervention", "weather_fog_alert"],
    allowedActions: [
      { label: "Loco Sign-On Log", route: "/employee/duty" },
      { label: "Assigned Train", route: "/employee/assignment" },
      { label: "Report Loco Defect", route: "/employee/report" },
    ],
  },
  assistant_loco_pilot: {
    id: "assistant_loco_pilot",
    displayName: "Assistant Loco Pilot",
    name: "Assistant Loco Pilot",
    department: "Mechanical & Rolling Stock",
    dutyType: "Cab Assistance & Signal Calling",
    primaryResponsibility: "Signal aspect calling, machine room checks, air pressure gauge monitoring, and emergency flasher activation",
    assignmentType: "Train",
    dashboardType: "train_operations",
    relevantWidgets: ["duty", "assignedCab", "pressureGauges", "signalCallouts", "operationalAlerts", "tasks"],
    taskTypes: ["machine_room_patrol", "pantograph_visual_check", "emergency_headlight_test", "flasher_light_readiness"],
    alertTypes: ["air_pressure_drop", "transformer_oil_temp", "signal_aspect_warning", "traction_motor_alert"],
    allowedActions: [
      { label: "Cab Duty", route: "/employee/duty" },
      { label: "Train Rake", route: "/employee/assignment" },
      { label: "Report Cab Issue", route: "/employee/report" },
    ],
  },
  depot_maintenance_technician: {
    id: "depot_maintenance_technician",
    displayName: "Depot Maintenance Technician",
    name: "Depot Maintenance Technician",
    department: "Mechanical & Rolling Stock",
    dutyType: "Rolling Stock Coaching Depot Maintenance",
    primaryResponsibility: "Trip inspections, primary/secondary coach maintenance, wheel-set profiling, and brake disc pad replacements",
    assignmentType: "Facility",
    dashboardType: "mechanical_operations",
    relevantWidgets: ["duty", "depotBays", "rakeMaintenanceSchedule", "sparesInventory", "operationalAlerts", "tasks"],
    taskTypes: ["bogie_clearance_measurement", "air_brake_leakage_test", "axle_box_temp_audit", "coupler_slack_adjustment"],
    alertTypes: ["wheel_flat_detected", "brake_binding_reported", "bio_toilet_fault", "rake_turnaround_delay"],
    allowedActions: [
      { label: "Depot Duty", route: "/employee/duty" },
      { label: "Pitline Bay", route: "/employee/assignment" },
      { label: "Report Rolling Stock Flaw", route: "/employee/report" },
    ],
  },
  coach_cleanliness_staff: {
    id: "coach_cleanliness_staff",
    displayName: "Coach Cleanliness & Sanitation Staff",
    name: "Coach Cleanliness & Sanitation Staff",
    department: "Mechanical & Rolling Stock",
    dutyType: "On-Board Housekeeping & Hygiene",
    primaryResponsibility: "OBHS coach cleaning, bio-toilet servicing, water replenishment monitoring, and pest control hygiene",
    assignmentType: "Train",
    dashboardType: "mechanical_operations",
    relevantWidgets: ["duty", "assignedCoaches", "hygieneChecklist", "waterLevelStatus", "operationalAlerts", "tasks"],
    taskTypes: ["toilet_disinfection", "coach_aisle_sweeping", "linen_distribution_audit", "water_tank_level_check"],
    alertTypes: ["water_tank_empty", "passenger_hygiene_complaint", "bio_toilet_choke", "cleaning_cycle_due"],
    allowedActions: [
      { label: "Housekeeping Duty", route: "/employee/duty" },
      { label: "Assigned Coach", route: "/employee/assignment" },
      { label: "Log Cleaning Round", route: "/employee/report" },
    ],
  },

  // -----------------------------------------------------------
  // 6. Commercial & Passenger Amenities
  // -----------------------------------------------------------
  tte: {
    id: "tte",
    displayName: "Travelling Ticket Examiner (TTE)",
    name: "Travelling Ticket Examiner (TTE)",
    department: "Commercial & Passenger Amenities",
    dutyType: "On-Board Ticket Examination & Berth Allotment",
    primaryResponsibility: "Ticket verification, Hand-Held Terminal (HHT) charting, vacant berth reallocation, and passenger assistance",
    assignmentType: "Train",
    dashboardType: "commercial_operations",
    relevantWidgets: ["duty", "assignedCoaches", "hhtBerthStatus", "passengerManifest", "operationalAlerts", "tasks"],
    taskTypes: ["hht_chart_sync", "berth_turnaround_check", "unauthorized_passenger_fine", "senior_citizen_assist"],
    alertTypes: ["excess_passenger_surge", "reserved_berth_dispute", "hht_battery_low", "ticketless_travel_alert"],
    allowedActions: [
      { label: "Charting Duty", route: "/employee/duty" },
      { label: "Assigned Train / Coaches", route: "/employee/assignment" },
      { label: "Report Passenger Issue", route: "/employee/report" },
    ],
  },
  booking_enquiry_clerk: {
    id: "booking_enquiry_clerk",
    displayName: "Station Booking & Enquiry Clerk",
    name: "Station Booking & Enquiry Clerk",
    department: "Commercial & Passenger Amenities",
    dutyType: "PRS / UTS Ticketing & Passenger Enquiry",
    primaryResponsibility: "Reserved/unreserved ticket issuance, refund processing, enquiry terminal operation, and cash counter settlement",
    assignmentType: "Counter",
    dashboardType: "commercial_operations",
    relevantWidgets: ["duty", "counterStatus", "prsTerminalQueue", "cashSummary", "operationalAlerts", "tasks"],
    taskTypes: ["prs_login_cash_declaration", "tatkal_queue_management", "ticket_roll_replenishment", "shift_balance_remittance"],
    alertTypes: ["prs_network_downtime", "terminal_printer_jam", "counter_queue_overflow", "cash_limit_exceeded"],
    allowedActions: [
      { label: "Counter Duty", route: "/employee/duty" },
      { label: "Assigned Counter", route: "/employee/assignment" },
      { label: "Report System Fault", route: "/employee/report" },
    ],
  },
  station_booking_clerk: {
    // Alias for booking_enquiry_clerk for backward compatibility
    id: "station_booking_clerk",
    displayName: "Station Booking & Enquiry Clerk",
    name: "Station Booking & Enquiry Clerk",
    department: "Commercial & Passenger Amenities",
    dutyType: "PRS / UTS Ticketing & Passenger Enquiry",
    primaryResponsibility: "Reserved/unreserved ticket issuance, refund processing, enquiry terminal operation, and cash counter settlement",
    assignmentType: "Counter",
    dashboardType: "commercial_operations",
    relevantWidgets: ["duty", "counterStatus", "prsTerminalQueue", "cashSummary", "operationalAlerts", "tasks"],
    taskTypes: ["prs_login_cash_declaration", "tatkal_queue_management", "ticket_roll_replenishment", "shift_balance_remittance"],
    alertTypes: ["prs_network_downtime", "terminal_printer_jam", "counter_queue_overflow", "cash_limit_exceeded"],
    allowedActions: [
      { label: "Counter Duty", route: "/employee/duty" },
      { label: "Assigned Counter", route: "/employee/assignment" },
      { label: "Report System Fault", route: "/employee/report" },
    ],
  },
  commercial_inspector: {
    id: "commercial_inspector",
    displayName: "Commercial Inspector",
    name: "Commercial Inspector",
    department: "Commercial & Passenger Amenities",
    dutyType: "Commercial Audit & Station Amenities",
    primaryResponsibility: "Catering stall inspection, passenger amenity audit (drinking water, waiting halls), and freight siding revenue checks",
    assignmentType: "Station",
    dashboardType: "commercial_operations",
    relevantWidgets: ["duty", "amenityInspections", "cateringCompliance", "stationRevenue", "operationalAlerts", "tasks"],
    taskTypes: ["stall_hygiene_check", "overcharging_vigilance", "waiting_hall_cleanliness_audit", "water_vending_machine_test"],
    alertTypes: ["catering_overcharging_complaint", "water_cooler_breakdown", "unauthorized_vendor_notice", "revenue_audit_discrepancy"],
    allowedActions: [
      { label: "Inspection Roster", route: "/employee/duty" },
      { label: "Station Territory", route: "/employee/assignment" },
      { label: "File Audit Report", route: "/employee/report" },
    ],
  },
  customer_support_specialist: {
    id: "customer_support_specialist",
    displayName: "Customer Support Specialist",
    name: "Customer Support Specialist",
    department: "Commercial & Passenger Amenities",
    dutyType: "RailMadad Grievance & Passenger Helpdesk",
    primaryResponsibility: "RailMadad ticket resolution, divyangjan wheelchair assistance, lost-and-found desk, and helpline coordination",
    assignmentType: "Station",
    dashboardType: "commercial_operations",
    relevantWidgets: ["duty", "railMadadGrievances", "helpdeskQueue", "lostAndFound", "operationalAlerts", "tasks"],
    taskTypes: ["railmadad_ticket_resolution", "wheelchair_request_dispatch", "lost_property_catalog", "passenger_feedback_log"],
    alertTypes: ["high_priority_grievance", "medical_wheelchair_sos", "unclaimed_baggage_alert", "escalated_complaint"],
    allowedActions: [
      { label: "Helpdesk Duty", route: "/employee/duty" },
      { label: "Helpdesk Booth", route: "/employee/assignment" },
      { label: "Resolve Grievance", route: "/employee/report" },
    ],
  },

  // -----------------------------------------------------------
  // 7. Electrical & Traction (OHE)
  // -----------------------------------------------------------
  electrical_traction_technician: {
    id: "electrical_traction_technician",
    displayName: "Electrical / Traction Technician (OHE)",
    name: "Electrical / Traction Technician",
    department: "Electrical & Traction (OHE)",
    dutyType: "Overhead Equipment (OHE) & Traction Power",
    primaryResponsibility: "25kV AC overhead catenary maintenance, traction substation (TSS) monitoring, pantograph entangling prevention, and power block clearance",
    assignmentType: "OHE",
    dashboardType: "traction_operations",
    relevantWidgets: ["duty", "oheSection", "substationStatus", "powerBlocks", "operationalAlerts", "tasks"],
    taskTypes: ["catenary_wire_height_stagger_check", "dropper_insulator_cleaning", "power_block_earthing", "tss_transformer_load_audit"],
    alertTypes: ["ohe_breakdown_tripping", "catenary_snapping_hazard", "power_block_overdue", "substation_overload"],
    allowedActions: [
      { label: "Traction Duty", route: "/employee/duty" },
      { label: "Assigned OHE Section", route: "/employee/assignment" },
      { label: "Report OHE Flaw", route: "/employee/report" },
    ],
  },
};

// -------------------------------------------------------------
// DEPARTMENT-TO-ROLE MATRIX
// -------------------------------------------------------------

export const DEPARTMENT_ROLES_MAP: Record<EmployeeDepartment, OperationalRoleId[]> = {
  "Operations & Traffic Control": [
    "station_master",
    "station_superintendent",
    "train_manager",
    "section_controller",
    "yard_supervisor",
  ],
  "Safety & Disaster Management": [
    "rpf_escort_constable",
    "station_security_officer",
    "railway_medical_officer",
    "emergency_medical_responder",
  ],
  "Signal & Telecommunication (S&T)": [
    "signal_maintainer",
    "telecom_technician",
  ],
  "Civil & Track Engineering": [
    "track_maintainer",
    "section_engineer",
    "bridge_structure_inspector",
  ],
  "Mechanical & Rolling Stock": [
    "loco_pilot",
    "assistant_loco_pilot",
    "depot_maintenance_technician",
    "coach_cleanliness_staff",
  ],
  "Commercial & Passenger Amenities": [
    "tte",
    "booking_enquiry_clerk",
    "commercial_inspector",
    "customer_support_specialist",
  ],
  "Electrical & Traction (OHE)": [
    "electrical_traction_technician",
  ],
};

// -------------------------------------------------------------
// HELPER FUNCTIONS & SAFE FALLBACKS
// -------------------------------------------------------------

export const DEFAULT_OPERATIONAL_ROLE: OperationalRoleId = "station_master";

/**
 * Retrieve role configuration safely with fallback if role is undefined or unassigned.
 */
export function getRoleConfig(roleId?: string | null): EmployeeRoleConfig {
  if (roleId && roleId in EMPLOYEE_ROLES) {
    const config = EMPLOYEE_ROLES[roleId as OperationalRoleId];
    // Polyfill compatibility properties if read by legacy components
    return {
      ...config,
      dashboardWidgets: config.relevantWidgets,
      alertCategories: config.alertTypes,
      taskCategories: config.taskTypes,
      quickActions: config.allowedActions,
      description: config.primaryResponsibility,
    };
  }

  // Safe fallback
  const fallback = EMPLOYEE_ROLES[DEFAULT_OPERATIONAL_ROLE];
  return {
    ...fallback,
    displayName: roleId ? roleId.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Role Not Assigned",
    dashboardWidgets: fallback.relevantWidgets,
    alertCategories: fallback.alertTypes,
    taskCategories: fallback.taskTypes,
    quickActions: fallback.allowedActions,
    description: fallback.primaryResponsibility,
  };
}

/**
 * Retrieve all roles for a given department string
 */
export function getRolesForDepartment(departmentName: string): EmployeeRoleConfig[] {
  const roleIds = DEPARTMENT_ROLES_MAP[departmentName as EmployeeDepartment] || [];
  return roleIds.map((id) => EMPLOYEE_ROLES[id]);
}

/**
 * Check if a given operational role belongs to a department
 */
export function isRoleInDepartment(roleId: string, departmentName: string): boolean {
  const roleIds = DEPARTMENT_ROLES_MAP[departmentName as EmployeeDepartment] || [];
  return (roleIds as string[]).includes(roleId);
}

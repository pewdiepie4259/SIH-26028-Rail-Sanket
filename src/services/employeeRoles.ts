/**
 * RailDrishti Employee Role Architecture (Phase 11)
 *
 * COMMON EMPLOYEE SHELL + ROLE-SPECIFIC WIDGETS
 *
 * Matrix: 7 Departments, 22 Operational Roles
 * Centralized, typed, and decoupled configuration to support seamless role-dependent rendering.
 */

export type DepartmentId =
  | "traffic_operations"
  | "electrical_mechanical"
  | "commercial_passenger"
  | "civil_engineering_track"
  | "signal_telecommunication"
  | "security"
  | "medical_emergency";

export type OperationalRoleId =
  // 1. Traffic & Operations
  | "station_master"
  | "station_superintendent"
  | "train_manager"
  | "section_controller"
  | "yard_supervisor"
  // 2. Electrical & Mechanical
  | "loco_pilot"
  | "assistant_loco_pilot"
  | "depot_maintenance_technician"
  | "coach_cleanliness_staff"
  // 3. Commercial & Passenger Services
  | "tte"
  | "station_booking_clerk"
  | "commercial_inspector"
  | "customer_support_specialist"
  // 4. Civil Engineering & Track
  | "track_maintainer"
  | "section_engineer"
  | "bridge_structure_inspector"
  // 5. Signal & Telecommunication
  | "signal_maintainer"
  | "telecom_technician"
  // 6. Security
  | "rpf_escort_constable"
  | "station_security_officer"
  // 7. Medical & Emergency
  | "railway_medical_officer"
  | "emergency_medical_responder";

export type AssignmentScopeType =
  | "station"
  | "train"
  | "section"
  | "facility"
  | "security"
  | "medical"
  | "counter";

export interface EmployeeRoleMetadata {
  id: OperationalRoleId;
  name: string;
  department: string;
  departmentId: DepartmentId;
  description: string;
  assignmentType: AssignmentScopeType;
  dashboardWidgets: string[];
  alertCategories: string[];
  taskCategories: string[];
  quickActions: { label: string; route: string }[];
}

export interface EmployeeDepartmentConfig {
  id: DepartmentId;
  name: string;
  description: string;
  roles: OperationalRoleId[];
}

// -------------------------------------------------------------
// 1. CENTRALIZED ROLE MATRIX (7 DEPARTMENTS)
// -------------------------------------------------------------

export const roleMatrix: Record<DepartmentId, OperationalRoleId[]> = {
  traffic_operations: [
    "station_master",
    "station_superintendent",
    "train_manager",
    "section_controller",
    "yard_supervisor",
  ],
  electrical_mechanical: [
    "loco_pilot",
    "assistant_loco_pilot",
    "depot_maintenance_technician",
    "coach_cleanliness_staff",
  ],
  commercial_passenger: [
    "tte",
    "station_booking_clerk",
    "commercial_inspector",
    "customer_support_specialist",
  ],
  civil_engineering_track: [
    "track_maintainer",
    "section_engineer",
    "bridge_structure_inspector",
  ],
  signal_telecommunication: [
    "signal_maintainer",
    "telecom_technician",
  ],
  security: [
    "rpf_escort_constable",
    "station_security_officer",
  ],
  medical_emergency: [
    "railway_medical_officer",
    "emergency_medical_responder",
  ],
};

// -------------------------------------------------------------
// 2. DEPARTMENT DEFINITIONS
// -------------------------------------------------------------

export const departmentConfigs: Record<DepartmentId, EmployeeDepartmentConfig> = {
  traffic_operations: {
    id: "traffic_operations",
    name: "Traffic & Operations",
    description: "Station movement, rake coordination, train dispatching, and yard control.",
    roles: roleMatrix.traffic_operations,
  },
  electrical_mechanical: {
    id: "electrical_mechanical",
    name: "Electrical & Mechanical",
    description: "Locomotive traction, rolling stock maintenance, and coach sanitation.",
    roles: roleMatrix.electrical_mechanical,
  },
  commercial_passenger: {
    id: "commercial_passenger",
    name: "Commercial & Passenger Services",
    description: "Ticket examination, passenger booking enquiry, and service inspections.",
    roles: roleMatrix.commercial_passenger,
  },
  civil_engineering_track: {
    id: "civil_engineering_track",
    name: "Civil Engineering & Track",
    description: "Permanent way maintenance, track integrity, and bridge inspections.",
    roles: roleMatrix.civil_engineering_track,
  },
  signal_telecommunication: {
    id: "signal_telecommunication",
    name: "Signal & Telecommunication",
    description: "Signal aspect interlocking, track circuits, and station telecommunications.",
    roles: roleMatrix.signal_telecommunication,
  },
  security: {
    id: "security",
    name: "Security (RPF)",
    description: "Train escort protection, passenger security, and perimeter station surveillance.",
    roles: roleMatrix.security,
  },
  medical_emergency: {
    id: "medical_emergency",
    name: "Medical & Emergency",
    description: "First responder triage, ambulance dispatch, and railway medical attention.",
    roles: roleMatrix.medical_emergency,
  },
};

// -------------------------------------------------------------
// 3. COMPLETE 22-ROLE METADATA CONFIGURATION
// -------------------------------------------------------------

export const employeeRoleConfigs: Record<OperationalRoleId, EmployeeRoleMetadata> = {
  // --- Traffic & Operations ---
  station_master: {
    id: "station_master",
    name: "Station Master",
    department: "Traffic & Operations",
    departmentId: "traffic_operations",
    description: "Coordinates station train movements, platform clearance, and local interlocking.",
    assignmentType: "station",
    dashboardWidgets: [
      "duty",
      "stationOperations",
      "platformStatus",
      "trainMovement",
      "operationalAlerts",
      "tasks",
    ],
    alertCategories: ["platform", "train_movement", "station_safety"],
    taskCategories: ["platform_inspection", "handover", "communication"],
    quickActions: [
      { label: "My Duty Log", route: "/employee/duty" },
      { label: "Station Assignment", route: "/employee/assignment" },
      { label: "Station Alerts", route: "/employee/alerts" },
    ],
  },
  station_superintendent: {
    id: "station_superintendent",
    name: "Station Superintendent",
    department: "Traffic & Operations",
    departmentId: "traffic_operations",
    description: "Oversees overall station management, crowd coordination, and inter-departmental dispatch.",
    assignmentType: "station",
    dashboardWidgets: [
      "duty",
      "stationOperations",
      "platformOverview",
      "passengerFlow",
      "operationalAlerts",
      "tasks",
    ],
    alertCategories: ["station_overview", "crowd_management", "operational_alerts"],
    taskCategories: ["station_audit", "supervisor_logbook", "incident_review"],
    quickActions: [
      { label: "Duty Overview", route: "/employee/duty" },
      { label: "Station Assignment", route: "/employee/assignment" },
      { label: "Incident Desk", route: "/employee/incidents" },
    ],
  },
  train_manager: {
    id: "train_manager",
    name: "Train Manager",
    department: "Traffic & Operations",
    departmentId: "traffic_operations",
    description: "Manages on-board train operations, brake continuity verification, and route progress.",
    assignmentType: "train",
    dashboardWidgets: [
      "duty",
      "assignedTrain",
      "trainStatus",
      "nextStation",
      "operationalAlerts",
      "tasks",
    ],
    alertCategories: ["train_eta", "speed_restrictions", "weather_caution"],
    taskCategories: ["brake_feel_test", "passenger_safety", "journey_log"],
    quickActions: [
      { label: "Assigned Train", route: "/employee/assignment" },
      { label: "Duty Schedule", route: "/employee/duty" },
      { label: "Report Issue", route: "/employee/report" },
    ],
  },
  section_controller: {
    id: "section_controller",
    name: "Section Controller / Train Dispatcher",
    department: "Traffic & Operations",
    departmentId: "traffic_operations",
    description: "Supervises line capacity, headway regulation, overtakes, and block section authority.",
    assignmentType: "section",
    dashboardWidgets: [
      "duty",
      "sectionStatus",
      "trainMovement",
      "bottleneckInfo",
      "operationalAlerts",
      "tasks",
    ],
    alertCategories: ["headway_regulation", "cascade_risk", "block_closures"],
    taskCategories: ["precedence_directive", "caution_order_issue", "cross_traffic"],
    quickActions: [
      { label: "Section Status", route: "/employee/assignment" },
      { label: "Active Alerts", route: "/employee/alerts" },
      { label: "Controller Actions", route: "/employee/tasks" },
    ],
  },
  yard_supervisor: {
    id: "yard_supervisor",
    name: "Yard Supervisor",
    department: "Traffic & Operations",
    departmentId: "traffic_operations",
    description: "Directs shunting, rake marshalling, pit line berthing, and siding placements.",
    assignmentType: "facility",
    dashboardWidgets: [
      "duty",
      "yardStatus",
      "rakeMovement",
      "shuntingActivity",
      "operationalAlerts",
      "tasks",
    ],
    alertCategories: ["shunting_caution", "berthing_delay", "yard_blockage"],
    taskCategories: ["marshall_rake", "coupling_inspection", "siding_clearance"],
    quickActions: [
      { label: "Yard Duty", route: "/employee/duty" },
      { label: "Yard Tasks", route: "/employee/tasks" },
      { label: "Report Hazard", route: "/employee/report" },
    ],
  },

  // --- Electrical & Mechanical ---
  loco_pilot: {
    id: "loco_pilot",
    name: "Loco Pilot",
    department: "Electrical & Mechanical",
    departmentId: "electrical_mechanical",
    description: "Pilots locomotives, adheres to signal aspects, speed cautions, and kinematic safety.",
    assignmentType: "train",
    dashboardWidgets: [
      "duty",
      "assignedTrain",
      "currentSpeed",
      "signalStatus",
      "routeRestrictions",
      "weatherCaution",
      "operationalAlerts",
      "tasks",
    ],
    alertCategories: ["signals", "speed_caution", "route_restriction", "weather"],
    taskCategories: ["pre_departure_check", "speed_compliance", "loco_health_log"],
    quickActions: [
      { label: "Assigned Train", route: "/employee/assignment" },
      { label: "Driver Alerts", route: "/employee/alerts" },
      { label: "Duty Log", route: "/employee/duty" },
    ],
  },
  assistant_loco_pilot: {
    id: "assistant_loco_pilot",
    name: "Assistant Loco Pilot",
    department: "Electrical & Mechanical",
    departmentId: "electrical_mechanical",
    description: "Assists Loco Pilot with signal calling, route observation, and cab diagnostics.",
    assignmentType: "train",
    dashboardWidgets: [
      "duty",
      "assignedTrain",
      "operationalChecklist",
      "signalRouteInfo",
      "operationalAlerts",
      "tasks",
    ],
    alertCategories: ["signal_aspects", "cautions", "cab_alarms"],
    taskCategories: ["signal_calling", "vigilance_cycle", "handover_log"],
    quickActions: [
      { label: "Cab Assignment", route: "/employee/assignment" },
      { label: "Duty Checks", route: "/employee/duty" },
      { label: "Checklist Tasks", route: "/employee/tasks" },
    ],
  },
  depot_maintenance_technician: {
    id: "depot_maintenance_technician",
    name: "Depot Maintenance Technician",
    department: "Electrical & Mechanical",
    departmentId: "electrical_mechanical",
    description: "Performs scheduled and emergency rolling stock overhauls and bogie inspections.",
    assignmentType: "facility",
    dashboardWidgets: [
      "duty",
      "maintenanceTasks",
      "equipmentStatus",
      "depotAssignments",
      "pendingWork",
      "operationalAlerts",
    ],
    alertCategories: ["maintenance_window", "equipment_breakdown", "spares_alert"],
    taskCategories: ["bogie_inspection", "electrical_audit", "hvac_service"],
    quickActions: [
      { label: "Depot Tasks", route: "/employee/tasks" },
      { label: "Report Defect", route: "/employee/report" },
      { label: "Duty Roster", route: "/employee/duty" },
    ],
  },
  coach_cleanliness_staff: {
    id: "coach_cleanliness_staff",
    name: "Coach Cleanliness & Sanitation Staff",
    department: "Electrical & Mechanical",
    departmentId: "electrical_mechanical",
    description: "Maintains hygiene, OBHS on-board sanitation, watering, and passenger amenity cleanliness.",
    assignmentType: "train",
    dashboardWidgets: [
      "duty",
      "assignedCoaches",
      "cleaningTasks",
      "serviceStatus",
      "pendingTasks",
      "operationalAlerts",
    ],
    alertCategories: ["sanitation_ticket", "watering_caution", "cleaning_sla"],
    taskCategories: ["obhs_cleaning", "bio_toilet_check", "coach_watering"],
    quickActions: [
      { label: "Cleaning Tasks", route: "/employee/tasks" },
      { label: "Coach Assignment", route: "/employee/assignment" },
      { label: "Report Issue", route: "/employee/report" },
    ],
  },

  // --- Commercial & Passenger Services ---
  tte: {
    id: "tte",
    name: "Travelling Ticket Examiner (TTE)",
    department: "Commercial & Passenger Services",
    departmentId: "commercial_passenger",
    description: "Verifies passenger reservations, handles berth allocation, and assists passengers.",
    assignmentType: "train",
    dashboardWidgets: [
      "duty",
      "assignedTrain",
      "passengerServiceTasks",
      "coachAssignment",
      "operationalAlerts",
      "tasks",
    ],
    alertCategories: ["berth_reallocation", "passenger_alert", "chart_update"],
    taskCategories: ["chart_verification", "excess_fare_collection", "passenger_assistance"],
    quickActions: [
      { label: "My Train", route: "/employee/assignment" },
      { label: "Duty Schedule", route: "/employee/duty" },
      { label: "Passenger Incident", route: "/employee/incidents" },
    ],
  },
  station_booking_clerk: {
    id: "station_booking_clerk",
    name: "Station Booking & Enquiry Clerk",
    department: "Commercial & Passenger Services",
    departmentId: "commercial_passenger",
    description: "Issues ticketing, manages reservation counters, and provides passenger enquiry support.",
    assignmentType: "counter",
    dashboardWidgets: [
      "duty",
      "bookingCounterStatus",
      "passengerEnquiries",
      "shiftStatus",
      "serviceTasks",
      "operationalAlerts",
    ],
    alertCategories: ["counter_congestion", "prs_telecom_link", "shift_balance"],
    taskCategories: ["cash_reconciliation", "enquiry_service", "concession_verification"],
    quickActions: [
      { label: "Counter Duty", route: "/employee/duty" },
      { label: "Service Tasks", route: "/employee/tasks" },
      { label: "Report Counter Fault", route: "/employee/report" },
    ],
  },
  commercial_inspector: {
    id: "commercial_inspector",
    name: "Commercial Inspector",
    department: "Commercial & Passenger Services",
    departmentId: "commercial_passenger",
    description: "Audits commercial catering, station stalls, parcel logistics, and passenger amenities.",
    assignmentType: "station",
    dashboardWidgets: [
      "duty",
      "commercialTasks",
      "inspectionAssignments",
      "passengerServiceIssues",
      "operationalAlerts",
      "tasks",
    ],
    alertCategories: ["catering_complaint", "parcel_delay", "amenity_violation"],
    taskCategories: ["stall_audit", "freight_weighment_check", "ticket_checking_drive"],
    quickActions: [
      { label: "Inspection Tasks", route: "/employee/tasks" },
      { label: "Report Violation", route: "/employee/report" },
      { label: "Duty Register", route: "/employee/duty" },
    ],
  },
  customer_support_specialist: {
    id: "customer_support_specialist",
    name: "Customer Support Specialist",
    department: "Commercial & Passenger Services",
    departmentId: "commercial_passenger",
    description: "Handles passenger helpline grievances, special assistance, and lost & found coordination.",
    assignmentType: "counter",
    dashboardWidgets: [
      "duty",
      "customerRequests",
      "serviceTickets",
      "pendingResponses",
      "operationalAlerts",
      "tasks",
    ],
    alertCategories: ["railmadad_grievance", "medical_request", "priority_passenger"],
    taskCategories: ["grievance_closure", "wheelchair_coordination", "information_desk"],
    quickActions: [
      { label: "Support Tasks", route: "/employee/tasks" },
      { label: "Passenger Alerts", route: "/employee/alerts" },
      { label: "Incident Escalation", route: "/employee/incidents" },
    ],
  },

  // --- Civil Engineering & Track ---
  track_maintainer: {
    id: "track_maintainer",
    name: "Track Maintainer",
    department: "Civil Engineering & Track",
    departmentId: "civil_engineering_track",
    description: "Inspects rails, track alignment, ballast compaction, fishplates, and rainfall patrolling.",
    assignmentType: "section",
    dashboardWidgets: [
      "duty",
      "assignedSection",
      "trackStatus",
      "maintenanceTasks",
      "weatherRisk",
      "reportedIssues",
      "operationalAlerts",
      "tasks",
    ],
    alertCategories: ["track_caution", "heavy_rainfall", "block_maintenance"],
    taskCategories: ["patrol_km_inspection", "joint_greasing", "ballast_tamping"],
    quickActions: [
      { label: "My Track Section", route: "/employee/assignment" },
      { label: "Track Tasks", route: "/employee/tasks" },
      { label: "Report Track Issue", route: "/employee/report" },
    ],
  },
  section_engineer: {
    id: "section_engineer",
    name: "Section Engineer (P-Way)",
    department: "Civil Engineering & Track",
    departmentId: "civil_engineering_track",
    description: "Directs track renewal projects, ultrasonic flaw detection, and ballast packing operations.",
    assignmentType: "section",
    dashboardWidgets: [
      "duty",
      "sectionOverview",
      "maintenanceWork",
      "trackIssues",
      "inspectionStatus",
      "operationalAlerts",
      "tasks",
    ],
    alertCategories: ["speed_restriction_approval", "tamping_machine_block", "usfd_defect"],
    taskCategories: ["pway_safety_audit", "track_geometry_review", "contractor_supervision"],
    quickActions: [
      { label: "Section Overview", route: "/employee/assignment" },
      { label: "Engineering Alerts", route: "/employee/alerts" },
      { label: "Incident Desk", route: "/employee/incidents" },
    ],
  },
  bridge_structure_inspector: {
    id: "bridge_structure_inspector",
    name: "Bridge & Structure Inspector",
    department: "Civil Engineering & Track",
    departmentId: "civil_engineering_track",
    description: "Examines girders, piers, culverts, abutments, and overhead bridge stability.",
    assignmentType: "section",
    dashboardWidgets: [
      "duty",
      "structureAssignments",
      "inspectionTasks",
      "inspectionStatus",
      "reportedDefects",
      "operationalAlerts",
      "tasks",
    ],
    alertCategories: ["water_level_gauge", "structural_vibration", "monsoon_alert"],
    taskCategories: ["girder_inspection", "scour_depth_measurement", "bearing_lubrication"],
    quickActions: [
      { label: "Structure Section", route: "/employee/assignment" },
      { label: "Inspection Tasks", route: "/employee/tasks" },
      { label: "Report Structural Flaw", route: "/employee/report" },
    ],
  },

  // --- Signal & Telecommunication ---
  signal_maintainer: {
    id: "signal_maintainer",
    name: "Signal Maintainer",
    department: "Signal & Telecommunication",
    departmentId: "signal_telecommunication",
    description: "Maintains point machines, electronic interlocking (EI), signals, and track circuits.",
    assignmentType: "section",
    dashboardWidgets: [
      "duty",
      "signalIssues",
      "affectedBlocks",
      "maintenanceTasks",
      "criticalAlerts",
      "operationalAlerts",
      "tasks",
    ],
    alertCategories: ["point_failure", "track_circuit_drop", "signal_aspect_blank"],
    taskCategories: ["point_machine_maintenance", "axle_counter_calibration", "interlocking_test"],
    quickActions: [
      { label: "Signal Section", route: "/employee/assignment" },
      { label: "Signal Tasks", route: "/employee/tasks" },
      { label: "Report Signal Issue", route: "/employee/report" },
    ],
  },
  telecom_technician: {
    id: "telecom_technician",
    name: "Telecom Technician",
    department: "Signal & Telecommunication",
    departmentId: "signal_telecommunication",
    description: "Supports OFC cables, VHF base stations, train radio (MTRC), and CCTV telemetry.",
    assignmentType: "facility",
    dashboardWidgets: [
      "duty",
      "communicationEquipment",
      "maintenanceTasks",
      "serviceIssues",
      "equipmentStatus",
      "operationalAlerts",
      "tasks",
    ],
    alertCategories: ["ofc_cut_alert", "vhf_repeater_failure", "pax_info_display_link"],
    taskCategories: ["vhf_channel_audit", "ofc_splice_test", "pa_system_maintenance"],
    quickActions: [
      { label: "Telecom Tasks", route: "/employee/tasks" },
      { label: "Telecom Alerts", route: "/employee/alerts" },
      { label: "Report Cable Issue", route: "/employee/report" },
    ],
  },

  // --- Security (RPF) ---
  rpf_escort_constable: {
    id: "rpf_escort_constable",
    name: "RPF Escort Constable",
    department: "Security (RPF)",
    departmentId: "security",
    description: "Performs armed train escort duty, coach rounds, passenger safety, and theft deterrence.",
    assignmentType: "train",
    dashboardWidgets: [
      "duty",
      "assignedTrain",
      "securityAlerts",
      "escortDuty",
      "incidentNotifications",
      "operationalAlerts",
      "tasks",
    ],
    alertCategories: ["emergency_chain_pulling", "escort_alert", "theft_report"],
    taskCategories: ["night_patrol", "passenger_safety_round", "station_handover"],
    quickActions: [
      { label: "Escort Train", route: "/employee/assignment" },
      { label: "Security Incidents", route: "/employee/incidents" },
      { label: "Security Alerts", route: "/employee/alerts" },
    ],
  },
  station_security_officer: {
    id: "station_security_officer",
    name: "Station Security Officer",
    department: "Security (RPF)",
    departmentId: "security",
    description: "Maintains station perimeter protection, baggage scanner security, and crowd containment.",
    assignmentType: "station",
    dashboardWidgets: [
      "duty",
      "stationSecurity",
      "securityAlerts",
      "incidentReports",
      "patrolTasks",
      "operationalAlerts",
      "tasks",
    ],
    alertCategories: ["perimeter_breach", "unattended_baggage", "crowd_surge"],
    taskCategories: ["cctv_surveillance_round", "entry_gate_inspection", "escort_briefing"],
    quickActions: [
      { label: "Station Security", route: "/employee/assignment" },
      { label: "Incident Desk", route: "/employee/incidents" },
      { label: "Patrol Tasks", route: "/employee/tasks" },
    ],
  },

  // --- Medical & Emergency ---
  railway_medical_officer: {
    id: "railway_medical_officer",
    name: "Railway Medical Officer / Doctor",
    department: "Medical & Emergency",
    departmentId: "medical_emergency",
    description: "Coordinates railway emergency medical relief trains (ARME), trauma care, and passenger first aid.",
    assignmentType: "medical",
    dashboardWidgets: [
      "duty",
      "medicalDuty",
      "emergencyRequests",
      "medicalIncidents",
      "responseStatus",
      "operationalAlerts",
      "tasks",
    ],
    alertCategories: ["cardiac_emergency", "accident_trauma", "arme_dispatch"],
    taskCategories: ["emergency_kit_inspection", "passenger_triage", "medical_handover"],
    quickActions: [
      { label: "Emergency Desk", route: "/employee/incidents" },
      { label: "Medical Alerts", route: "/employee/alerts" },
      { label: "Medical Duty", route: "/employee/duty" },
    ],
  },
  emergency_medical_responder: {
    id: "emergency_medical_responder",
    name: "Emergency Medical Responder",
    department: "Medical & Emergency",
    departmentId: "medical_emergency",
    description: "First-on-scene paramedic providing CPR, stretcher transport, and rapid medical evacuation.",
    assignmentType: "medical",
    dashboardWidgets: [
      "duty",
      "emergencyRequests",
      "responseTasks",
      "incidentLocation",
      "responseStatus",
      "operationalAlerts",
      "tasks",
    ],
    alertCategories: ["stretcher_call", "platform_medical_sos", "ambulance_arrival"],
    taskCategories: ["oxygen_cylinder_check", "first_aid_readiness", "paramedic_patrol"],
    quickActions: [
      { label: "Emergency Incidents", route: "/employee/incidents" },
      { label: "Response Tasks", route: "/employee/tasks" },
      { label: "Duty Status", route: "/employee/duty" },
    ],
  },
};

// -------------------------------------------------------------
// 4. DEMO ROLE & HELPER FUNCTIONS
// -------------------------------------------------------------

/**
 * Default fallback operational role for frontend demonstration
 */
export const demoOperationalRole: OperationalRoleId = "station_master";

/**
 * Retrieve the full role metadata and widget configuration by role ID
 */
export function getRoleConfig(roleId?: string | null): EmployeeRoleMetadata {
  if (roleId && roleId in employeeRoleConfigs) {
    return employeeRoleConfigs[roleId as OperationalRoleId];
  }
  return employeeRoleConfigs[demoOperationalRole];
}

/**
 * Retrieve all roles for a given department
 */
export function getRolesForDepartment(departmentId: DepartmentId): EmployeeRoleMetadata[] {
  const roleIds = roleMatrix[departmentId] || [];
  return roleIds.map((id) => employeeRoleConfigs[id]);
}

/**
 * Get all 22 operational roles as a list
 */
export function getAllOperationalRoles(): EmployeeRoleMetadata[] {
  return Object.values(employeeRoleConfigs);
}

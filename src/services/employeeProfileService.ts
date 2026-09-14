/**
 * RailDrishti Centralized Employee Profile Service
 *
 * Provides dynamic, role-specific profile data, operational responsibilities,
 * equipment issued records, and assignment details for all 23 operational roles.
 *
 * STRICT DATA INTEGRITY & ROLE CONSISTENCY:
 * - Uses existing AuthUser from auth.ts
 * - Resolves operationalRole from employeeRoles.ts
 * - Resolves assignment from employeeAssignmentService.ts
 * - Keeps Controller separate from Employee operational roles
 */

import {
  getRoleConfig,
  isRoleInDepartment,
  DEFAULT_OPERATIONAL_ROLE,
  type OperationalRoleId,
  type EmployeeRoleConfig,
  type EmployeeDepartment,
} from "../config/employeeRoles";
import { getRoleAssignmentViewData } from "./employeeAssignmentService";
import type { AuthUser } from "./auth";

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

export interface RoleProfileViewData {
  // Personal Information
  name: string;
  email: string;
  phone: string;
  emergencyContact: string;
  bloodGroup: string;
  residentialAddress: string;
  avatarInitials: string;

  // Employee Information
  employeeId: string;
  hrmsId: string;
  accountRole: string;
  department: string;
  operationalRoleId: string;
  roleDisplayName: string;
  isController: boolean;
  approvalStatus: string;
  verificationStatus: string;

  // Operational Information
  primaryResponsibility: string;
  dutyType: string;
  assignmentType: string;
  currentAssignment: string;
  isAssignmentAvailable: boolean;
  assignedLocation: string;
  shiftSchedule: string;

  // Technical & Equipment Records
  equipmentIssued: EquipmentIssuedItem[];
  certifications: TrainingCertItem[];
  competencyCert: string;
  payLevel: string;
  dateOfAppointment: string;
  serviceTenure: string;

  // Integrity & Validation
  roleConfig: EmployeeRoleConfig;
  isRoleValid: boolean;
  isDepartmentValid: boolean;
  warningMessage?: string;
}

// -------------------------------------------------------------
// ROLE-SPECIFIC EQUIPMENT & CERTIFICATIONS
// -------------------------------------------------------------

const ROLE_EQUIPMENT_MAP: Record<OperationalRoleId, EquipmentIssuedItem[]> = {
  station_master: [
    { item: "VHF 25W Base Transceiver", serial: "VHF-SM-NDLS-04", status: "FUNCTIONAL" },
    { item: "Emergency Block Key #1", serial: "BLK-KEY-PF3-88", status: "ISSUED" },
    { item: "T/409 Caution Order Register", serial: "REG-CO-2026-9", status: "ISSUED" },
    { item: "Panel Interlocking Token Key", serial: "TOK-EI-SIEMENS-02", status: "CALIBRATED" },
  ],
  station_superintendent: [
    { item: "VHF Executive Handheld", serial: "VHF-SS-9901", status: "FUNCTIONAL" },
    { item: "CCTV Master Console Access Fob", serial: "FOB-CCTV-NDLS", status: "ISSUED" },
    { item: "Station Incident Master Register", serial: "SIMR-2026-01", status: "ISSUED" },
  ],
  train_manager: [
    { item: "5W Handheld VHF Radio", serial: "VHF-TM-22436-01", status: "FUNCTIONAL" },
    { item: "Tricolor LED Hand Signal Lamp", serial: "LED-TSL-9941", status: "CALIBRATED" },
    { item: "Air Brake Gauge Adapter", serial: "ABG-GUARD-77", status: "FUNCTIONAL" },
    { item: "Guard Detonator Box (10 pcs)", serial: "DET-BOX-EXP-2027", status: "ISSUED" },
  ],
  loco_pilot: [
    { item: "5W Cab VHF Handset", serial: "VHF-LP-WAP7-30455", status: "FUNCTIONAL" },
    { item: "Master Reverser Key (WAP-7)", serial: "REV-KEY-EL-091", status: "ISSUED" },
    { item: "High-Intensity LED Focus Torch", serial: "TORCH-HI-772", status: "FUNCTIONAL" },
    { item: "Detonator Fog Safety Box", serial: "DET-LP-SWR-881", status: "ISSUED" },
  ],
  assistant_loco_pilot: [
    { item: "5W Secondary VHF Transceiver", serial: "VHF-ALP-30455-B", status: "FUNCTIONAL" },
    { item: "Bogie Brake Cylinder Feeler Gauge", serial: "BCFG-WAP7-14", status: "CALIBRATED" },
    { item: "Hand Signal Flag Kit (Red/Green)", serial: "FLG-SET-088", status: "ISSUED" },
  ],
  section_controller: [
    { item: "Control Board Intercom Terminal", serial: "CTRL-IC-SEC-A", status: "FUNCTIONAL" },
    { item: "Section DSS Cryptographic Token", serial: "DSS-TOKEN-771", status: "CALIBRATED" },
    { item: "Division Dispatch Chart Console", serial: "CHART-CN-09", status: "FUNCTIONAL" },
  ],
  yard_supervisor: [
    { item: "Yard Walkie-Talkie Set", serial: "VHF-YS-WY-03", status: "FUNCTIONAL" },
    { item: "Pointsman Shunting Flag & Horn", serial: "SHNT-KIT-44", status: "ISSUED" },
    { item: "Wheel Skids / Wooden Wedge Set", serial: "SKID-WY-22", status: "ISSUED" },
  ],
  track_maintainer: [
    { item: "Track Flange & Gauge Spanner Set", serial: "TOOL-SP-PWAY-88", status: "FUNCTIONAL" },
    { item: "Rail Dial Thermometer (TD)", serial: "THM-RAIL-SWR-12", status: "CALIBRATED" },
    { item: "Red Banner Flag & Detonator Kit", serial: "BNR-PWAY-99", status: "ISSUED" },
    { item: "Fishplate Bolt Torque Wrench", serial: "TRQ-WR-PWAY-04", status: "CALIBRATED" },
  ],
  section_engineer: [
    { item: "Track Recording Measurement Laser", serial: "TRK-LASER-SE-02", status: "CALIBRATED" },
    { item: "USFD Verification Probe Kit", serial: "USFD-PRB-SE-11", status: "CALIBRATED" },
    { item: "Digital Cant & Gauge Measuring Bar", serial: "DIGI-CANT-88", status: "FUNCTIONAL" },
  ],
  bridge_structure_inspector: [
    { item: "Ultrasonic Concrete & Steel Flaw Detector", serial: "BSI-US-PROBE-01", status: "CALIBRATED" },
    { item: "Laser Scour Depth Profiler", serial: "SCR-LASER-42", status: "FUNCTIONAL" },
    { item: "High-Altitude Safety Harness & Carabiner", serial: "HARN-CE-EN361", status: "ISSUED" },
  ],
  signal_maintainer: [
    { item: "Digital Multimeter & Insulation Tester", serial: "DMM-FLUKE-ST-09", status: "CALIBRATED" },
    { item: "Point Machine Friction Clutch Spanner", serial: "PM-SP-SIEMENS-104", status: "FUNCTIONAL" },
    { item: "Relay Room Access Security Card", serial: "RFID-RELAY-SEC2", status: "ISSUED" },
  ],
  telecom_technician: [
    { item: "Optical Time-Domain Reflectometer (OTDR)", serial: "OTDR-EXFO-FTB-04", status: "CALIBRATED" },
    { item: "VHF RF Power & SWR Meter", serial: "SWR-MTR-BIRD-43", status: "CALIBRATED" },
    { item: "Optical Fiber Fusion Splicer", serial: "FUS-SPL-FUJIKURA-70", status: "FUNCTIONAL" },
  ],
  depot_maintenance_technician: [
    { item: "Infrared Bearing Thermometer", serial: "IR-THM-DEPOT-09", status: "CALIBRATED" },
    { item: "Pneumatic Torque Driver Kit", serial: "PNEU-TRQ-DMT-12", status: "FUNCTIONAL" },
    { item: "Pantograph Pressure Contact Gauge", serial: "PNT-GAUGE-WAP7", status: "CALIBRATED" },
  ],
  coach_cleanliness_staff: [
    { item: "Heavy-Duty Bio-Toilet Vacuum Suction Unit", serial: "VAC-BIO-CLEAN-03", status: "FUNCTIONAL" },
    { item: "Ultra-Fine Fogging Disinfection Machine", serial: "FOG-DIS-OBHS-14", status: "FUNCTIONAL" },
    { item: "Industrial Coach Vacuum Cleaner", serial: "IND-VAC-COACH-77", status: "FUNCTIONAL" },
  ],
  tte: [
    { item: "Electronic Handheld Terminal (HHT)", serial: "HHT-PRS-CRIS-8841", status: "CALIBRATED" },
    { item: "EFT Electronic Receipt Printer", serial: "EFT-PRT-BLU-09", status: "FUNCTIONAL" },
    { item: "Official TTE Brass Badge & Roster Fob", serial: "BDG-TTE-NR-442", status: "ISSUED" },
  ],
  booking_enquiry_clerk: [
    { item: "UTS Thin-Client Terminal #4", serial: "UTS-CLT-NDLS-04", status: "FUNCTIONAL" },
    { item: "High-Speed Ticket Stock Printer", serial: "PRT-UTS-TALLY-01", status: "FUNCTIONAL" },
    { item: "Card Swipe POS Terminal (SBI)", serial: "POS-SBI-RAIL-99", status: "CALIBRATED" },
  ],
  station_booking_clerk: [
    { item: "UTS Thin-Client Terminal #4", serial: "UTS-CLT-NDLS-04", status: "FUNCTIONAL" },
    { item: "High-Speed Ticket Stock Printer", serial: "PRT-UTS-TALLY-01", status: "FUNCTIONAL" },
  ],
  commercial_inspector: [
    { item: "Electronic Weighbridge Calibration Kit", serial: "WB-CAL-5T-CI-02", status: "CALIBRATED" },
    { item: "Digital Food Hygiene Temperature Probe", serial: "HYG-PROBE-IRCTC", status: "CALIBRATED" },
    { item: "Commercial Enforcement Tablet", serial: "TAB-CI-COMM-88", status: "FUNCTIONAL" },
  ],
  customer_support_specialist: [
    { item: "RailMadad Escalation Workstation", serial: "RM-WS-HELP-02", status: "FUNCTIONAL" },
    { item: "PA Multi-Zone Announcement Mic", serial: "PA-MIC-CONCOURSE-1", status: "FUNCTIONAL" },
  ],
  rpf_escort_constable: [
    { item: "RPF Tactical VHF Body Radio", serial: "VHF-RPF-SEC-09", status: "FUNCTIONAL" },
    { item: "Handheld Metal Detector (HHMD)", serial: "HHMD-GARRETT-RPF", status: "CALIBRATED" },
    { item: "LED Strobe Night Patrol Searchlight", serial: "STRB-RPF-NIGHT-03", status: "FUNCTIONAL" },
  ],
  station_security_officer: [
    { item: "CCTV AI Alert Mobile Terminal", serial: "AI-CCTV-MOB-01", status: "FUNCTIONAL" },
    { item: "Door Frame Metal Detector (DFMD) Console", serial: "DFMD-GATE1-CAL", status: "CALIBRATED" },
    { item: "RPF Station Master Logbook", serial: "RPF-LOG-2026-NDLS", status: "ISSUED" },
  ],
  railway_medical_officer: [
    { item: "Automated External Defibrillator (AED)", serial: "AED-ZOLL-MED-01", status: "CALIBRATED" },
    { item: "Portable Oxygen Concentrator & Kit", serial: "O2-PORT-MED-09", status: "FUNCTIONAL" },
    { item: "Trauma Emergency Medical Response Bag", serial: "BAG-TRAUMA-DR-04", status: "ISSUED" },
  ],
  emergency_medical_responder: [
    { item: "Rapid First Responder Trauma Backpack", serial: "BAG-EMR-RAPID-02", status: "ISSUED" },
    { item: "Multi-Parameter Vitals & ECG Monitor", serial: "VTL-MON-EMR-09", status: "CALIBRATED" },
    { item: "Foldable Carbon-Fiber Trauma Stretcher", serial: "STR-CF-EMR-11", status: "FUNCTIONAL" },
  ],
  electrical_traction_technician: [
    { item: "25kV AC High-Voltage Discharge Rod", serial: "DIS-ROD-25KV-OHE", status: "CALIBRATED" },
    { item: "Auto-Tensioning Device (ATD) Metric Rule", serial: "ATD-RULE-MAST-09", status: "FUNCTIONAL" },
    { item: "Tower Wagon Safety Intercom & Radio", serial: "TW-RADIO-OHE-01", status: "FUNCTIONAL" },
  ],
};

const ROLE_CERTS_MAP: Record<OperationalRoleId, TrainingCertItem[]> = {
  station_master: [
    { title: "Advanced Electronic Interlocking (EI Grade-4)", institute: "IRISET Secunderabad", validity: "Valid till Dec 2028", grade: "Grade A+" },
    { title: "General Rules & Station Working Rules (SWR/G&SR)", institute: "ZRTI Trichy", validity: "Valid till Nov 2027", grade: "Distinction" },
    { title: "Disaster Management & Passenger Safety Drill", institute: "National Academy of Indian Railways", validity: "Valid till Jun 2029", grade: "Passed" },
  ],
  loco_pilot: [
    { title: "WAP-7 / WAG-9 AC 3-Phase Traction Competency", institute: "Electric Traction Training Centre (ETTC)", validity: "Valid till Oct 2028", grade: "Grade A1" },
    { title: "Automatic Block Signaling & Fog Driving Protocol", institute: "ZRTI Bhusawal", validity: "Valid till Aug 2027", grade: "Grade A" },
  ],
  tte: [
    { title: "Commercial Passenger Rules & HHT Operations", institute: "Zonal Railway Training Institute (ZRTI)", validity: "Valid till Dec 2028", grade: "Grade A" },
    { title: "First Aid & Passenger Facilitation Protocol", institute: "St. John Ambulance / Indian Railways", validity: "Valid till Jan 2028", grade: "Passed" },
  ],
  track_maintainer: [
    { title: "Continuous Welded Rail (CWR) & Destressing Course", institute: "IPWE Indian Railways", validity: "Valid till Mar 2028", grade: "Grade A" },
    { title: "Track Safety, Detonators & Hot Weather Patrolling", institute: "Divisional P-Way Training Centre", validity: "Valid till Sep 2027", grade: "Passed" },
  ],
  signal_maintainer: [
    { title: "Electronic Interlocking (EI Siemens / Kyosan)", institute: "IRISET Secunderabad", validity: "Valid till Dec 2028", grade: "Grade A+" },
    { title: "Digital Axle Counter & Point Machine Maintenance", institute: "Divisional S&T Training School", validity: "Valid till Jul 2027", grade: "Grade A" },
  ],
  rpf_escort_constable: [
    { title: "Railway Security, Act 144 & Escort Procedures", institute: "RPF Training Centre Moula Ali", validity: "Valid till Dec 2029", grade: "Grade A" },
    { title: "Crowd Control & Anti-Sabotage Precautions", institute: "National Industrial Security Academy", validity: "Valid till Oct 2027", grade: "Passed" },
  ],
  railway_medical_officer: [
    { title: "Railway Trauma & Emergency Disaster Response", institute: "Central Railway Hospital New Delhi", validity: "Valid till Dec 2030", grade: "Specialist" },
    { title: "Advanced Cardiac Life Support (ACLS Certified)", institute: "Indian Council of Medical Research", validity: "Valid till Aug 2028", grade: "Certified" },
  ],
  // Fallback generic
  station_superintendent: [
    { title: "Station Administration & Operating Management", institute: "NAIR Vadodara", validity: "Valid till Dec 2028", grade: "Grade A+" },
  ],
  train_manager: [
    { title: "Guard Train Working & Air Brake Continuity", institute: "ZRTI Chandausi", validity: "Valid till Dec 2028", grade: "Grade A+" },
    { title: "General and Subsidiary Rules (G&SR Certified)", institute: "ZRTI Bhusawal", validity: "Valid till Oct 2027", grade: "Grade A" },
  ],
  assistant_loco_pilot: [
    { title: "Loco Assistant Rules & VCD Operations", institute: "ETTC Vijayawada", validity: "Valid till Aug 2027", grade: "Grade A" },
  ],
  section_controller: [
    { title: "Corridor Dispatch & Dynamic Train Movement Control", institute: "IRISET / NAIR", validity: "Valid till Dec 2028", grade: "Grade A+" },
  ],
  yard_supervisor: [
    { title: "Marshalling Yard Operations & Safe Shunting", institute: "ZRTI Chandausi", validity: "Valid till Jun 2027", grade: "Grade A" },
  ],
  section_engineer: [
    { title: "Senior P-Way Engineering & Track Mechanization", institute: "IRICEN Pune", validity: "Valid till Dec 2028", grade: "Grade A+" },
  ],
  bridge_structure_inspector: [
    { title: "Steel Girder & Substructure Non-Destructive Testing", institute: "RDSO Lucknow", validity: "Valid till Nov 2028", grade: "Grade A+" },
  ],
  telecom_technician: [
    { title: "Optical Fiber Cable & VHF Radio Systems", institute: "IRISET Secunderabad", validity: "Valid till Dec 2028", grade: "Grade A" },
  ],
  depot_maintenance_technician: [
    { title: "High-Speed Rolling Stock Mechanical Maintenance", institute: "IRIMEE Jamalpur", validity: "Valid till Jan 2028", grade: "Grade A" },
  ],
  coach_cleanliness_staff: [
    { title: "Bio-Toilet Digester Maintenance & Mechanized Cleaning", institute: "CAMTECH Gwalior", validity: "Valid till Oct 2027", grade: "Passed" },
  ],
  booking_enquiry_clerk: [
    { title: "PRS / UTS Ticketing Systems & Cash Book Accounting", institute: "CRIS Training Centre", validity: "Valid till Dec 2027", grade: "Grade A" },
  ],
  station_booking_clerk: [
    { title: "PRS / UTS Ticketing Systems & Cash Book Accounting", institute: "CRIS Training Centre", validity: "Valid till Dec 2027", grade: "Grade A" },
  ],
  commercial_inspector: [
    { title: "Commercial Inspection & Railway Freight / Parcel Rules", institute: "NAIR Vadodara", validity: "Valid till Nov 2028", grade: "Grade A" },
  ],
  customer_support_specialist: [
    { title: "RailMadad Service Standards & Passenger Care", institute: "IRCTC Training Cell", validity: "Valid till Dec 2027", grade: "Grade A" },
  ],
  station_security_officer: [
    { title: "Integrated Security System & CCTV Surveillance", institute: "RPF Academy", validity: "Valid till Dec 2028", grade: "Grade A" },
  ],
  emergency_medical_responder: [
    { title: "Paramedic Trauma Management & Rapid First Aid", institute: "Indian Red Cross / Railways", validity: "Valid till Sep 2027", grade: "Certified" },
  ],
  electrical_traction_technician: [
    { title: "25kV AC Overhead Equipment (OHE) Maintenance", institute: "IRIEEN Nashik", validity: "Valid till Dec 2028", grade: "Grade A" },
  ],
};

// -------------------------------------------------------------
// SERVICE EXPORT: GET ROLE PROFILE VIEW DATA
// -------------------------------------------------------------

export function getRoleProfileViewData(user: AuthUser | null): RoleProfileViewData {
  const isController = user?.role === "controller";

  // Personal Information
  const name = user?.name || (isController ? "Traffic Controller" : "Railway Employee");
  const email = user?.email || (isController ? "controller@raildrishti.gov.in" : "employee@raildrishti.gov.in");
  const phone = user?.phone || "+91 98450 22104";
  const emergencyContact = user?.emergencyContactPhone
    ? `${user.emergencyContactName || "Spouse"} (${user.emergencyContactPhone})`
    : "S. Sharma (Spouse) - +91 98450 99812";
  const bloodGroup = user?.dob || "O+ Positive";
  const residentialAddress =
    user?.address || "Type-IV Qtr #42B, Railway Colony, New Delhi Junction (NDLS)";

  // Initials
  const avatarInitials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Employee Information
  const employeeId = isController
    ? user?.controllerId || "CTL-5501"
    : user?.employeeId || "EMP-7701";
  const hrmsId = `HRMS-NR-${employeeId.replace(/\D/g, "") || "8841"}`;
  const accountRole = isController ? "Controller (Under Approval)" : "Employee";
  const department = (user?.department as EmployeeDepartment) || "Operations & Traffic Control";

  const rawRole = (user?.operationalRole as OperationalRoleId) || DEFAULT_OPERATIONAL_ROLE;
  const roleConfig = getRoleConfig(rawRole);
  const isRoleValid = Boolean(roleConfig);
  const effectiveRole: OperationalRoleId = isRoleValid ? rawRole : DEFAULT_OPERATIONAL_ROLE;
  const effectiveConfig = roleConfig || getRoleConfig(DEFAULT_OPERATIONAL_ROLE);

  const roleDisplayName = isController
    ? "Corridor Section Controller"
    : effectiveConfig.displayName;
  const operationalRoleId = isController ? "section_controller" : effectiveRole;

  const isDepartmentValid = isRoleInDepartment(effectiveRole, department);

  let warningMessage: string | undefined;
  if (!isRoleValid && !isController) {
    warningMessage = `Operational role "${rawRole}" not recognized. Displaying standard ${effectiveConfig.displayName} records.`;
  } else if (!isDepartmentValid && !isController) {
    warningMessage = `Role "${effectiveConfig.displayName}" does not belong to department "${department}".`;
  }

  // Current Assignment from assignment service
  let assignmentTitle = "Assignment not currently available";
  let assignedLocation = "Assigned Divisional Post";
  let isAssignmentAvailable = false;

  try {
    const assignData = getRoleAssignmentViewData(user);
    if (assignData && assignData.assignmentTitle) {
      assignmentTitle = assignData.assignmentTitle;
      assignedLocation = assignData.assignmentBadge || "Division Yard";
      isAssignmentAvailable = true;
    }
  } catch {
    assignmentTitle = "Assignment not currently available";
  }

  const equipmentIssued =
    ROLE_EQUIPMENT_MAP[effectiveRole] || ROLE_EQUIPMENT_MAP.station_master;
  const certifications =
    ROLE_CERTS_MAP[effectiveRole] || ROLE_CERTS_MAP.station_master;

  return {
    name,
    email,
    phone,
    emergencyContact,
    bloodGroup,
    residentialAddress,
    avatarInitials,
    employeeId,
    hrmsId,
    accountRole,
    department,
    operationalRoleId,
    roleDisplayName,
    isController,
    approvalStatus: isController ? "Under Approval (Administrative Review)" : "Approved (Active Staff)",
    verificationStatus: "Verified Official Credentials",
    primaryResponsibility: isController
      ? "Corridor-wide block section dispatching, headway management and division relay coordination"
      : effectiveConfig.primaryResponsibility,
    dutyType: isController ? "Traffic Control & Corridor Dispatch" : effectiveConfig.dutyType,
    assignmentType: isController ? "Section" : effectiveConfig.assignmentType,
    currentAssignment: assignmentTitle,
    isAssignmentAvailable,
    assignedLocation,
    shiftSchedule: "Morning Operational Shift (06:00 - 14:00 IST)",
    equipmentIssued,
    certifications,
    competencyCert: `CERT-NR-${effectiveRole.toUpperCase()}-2026-9921`,
    payLevel: "Level-7 (7th CPC - Grade Pay ₹4600)",
    dateOfAppointment: "12 Nov 2014",
    serviceTenure: "11 Yrs 10 Mos",
    roleConfig: effectiveConfig,
    isRoleValid,
    isDepartmentValid,
    warningMessage,
  };
}

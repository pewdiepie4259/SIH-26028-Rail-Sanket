/**
 * RailDrishti Employee Roles Service
 * Re-exports from centralized configuration in `src/config/employeeRoles.ts`
 * Preserves 100% backward compatibility for existing employee pages & components.
 */

import {
  EMPLOYEE_ROLES,
  DEFAULT_OPERATIONAL_ROLE,
  getRoleConfig as getRoleConfigCore,
  getRolesForDepartment as getRolesForDepartmentCore,
  type EmployeeRoleConfig,
} from "../config/employeeRoles";

export * from "../config/employeeRoles";

// Compatibility aliases
export type EmployeeRoleMetadata = EmployeeRoleConfig;
export const employeeRoleConfigs = EMPLOYEE_ROLES;
export const demoOperationalRole = DEFAULT_OPERATIONAL_ROLE;

export function getRoleConfig(roleId?: string | null): EmployeeRoleConfig {
  return getRoleConfigCore(roleId);
}

export function getRolesForDepartment(department: string): EmployeeRoleConfig[] {
  return getRolesForDepartmentCore(department);
}

export function getAllOperationalRoles(): EmployeeRoleConfig[] {
  return Object.values(EMPLOYEE_ROLES);
}

// Legacy Department ID mapping if referenced
export type DepartmentId =
  | "traffic_operations"
  | "safety_disaster"
  | "signal_telecommunication"
  | "civil_engineering_track"
  | "mechanical_rolling_stock"
  | "commercial_passenger"
  | "electrical_traction";

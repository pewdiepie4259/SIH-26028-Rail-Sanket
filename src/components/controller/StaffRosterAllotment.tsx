import React, { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  Shield,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Building2,
  Award,
  Radio,
  Clock,
} from "lucide-react";
import {
  fetchStaffForController,
  assignEmployeeOperationalRole,
} from "../../services/auth";
import {
  EMPLOYEE_DEPARTMENTS,
  EMPLOYEE_ROLES,
  type OperationalRoleId,
  type EmployeeRoleConfig,
} from "../../config/employeeRoles";

interface StaffMember {
  id: string;
  employee_id?: string;
  employeeId?: string;
  name: string;
  email: string;
  department?: string;
  operational_role?: string;
  operationalRole?: string;
  status?: string;
  phone?: string;
}

export default function StaffRosterAllotment() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    EMPLOYEE_DEPARTMENTS[0]
  );
  const [selectedRole, setSelectedRole] = useState<OperationalRoleId>("station_master");
  const [submitting, setSubmitting] = useState(false);
  const [alertBanner, setAlertBanner] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const data = await fetchStaffForController();
      if (Array.isArray(data)) {
        setStaff(data);
      }
    } catch (err) {
      console.error("Failed to load staff roster:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const openAssignModal = (member: StaffMember) => {
    setSelectedStaff(member);
    const currDept = member.department || EMPLOYEE_DEPARTMENTS[0];
    setSelectedDepartment(currDept);

    const currRole = (member.operational_role ||
      member.operationalRole ||
      "station_master") as OperationalRoleId;
    setSelectedRole(
      (currRole as string) !== "unassigned" && currRole in EMPLOYEE_ROLES
        ? currRole
        : "station_master"
    );
    setIsModalOpen(true);
  };

  const handleDepartmentChange = (dept: string) => {
    setSelectedDepartment(dept);
    const roleEntries = Object.entries(EMPLOYEE_ROLES) as [OperationalRoleId, EmployeeRoleConfig][];
    const matchingRole = roleEntries.find(
      ([, config]) => config.department === dept
    );
    if (matchingRole) {
      setSelectedRole(matchingRole[0]);
    }
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    setSubmitting(true);
    try {
      const empId =
        selectedStaff.id ||
        selectedStaff.employee_id ||
        selectedStaff.employeeId ||
        selectedStaff.email;

      const res = await assignEmployeeOperationalRole(
        empId,
        selectedRole,
        selectedDepartment
      );

      if (res.success) {
        setAlertBanner({
          type: "success",
          message: `Operational Role '${EMPLOYEE_ROLES[selectedRole]?.displayName || selectedRole}' successfully assigned to ${selectedStaff.name}. Real-time synchronization dispatched across network.`,
        });

        setStaff((prev) =>
          prev.map((s) => {
            const match =
              s.id === selectedStaff.id ||
              s.email === selectedStaff.email ||
              (s.employee_id && s.employee_id === selectedStaff.employee_id);
            if (match) {
              return {
                ...s,
                operational_role: selectedRole,
                operationalRole: selectedRole,
                department: selectedDepartment,
              };
            }
            return s;
          })
        );

        setIsModalOpen(false);
      } else {
        setAlertBanner({
          type: "error",
          message: res.message || "Failed to update operational role.",
        });
      }
    } catch {
      setAlertBanner({
        type: "error",
        message: "An unexpected error occurred while assigning role.",
      });
    } finally {
      setSubmitting(false);
      setTimeout(() => setAlertBanner(null), 7000);
    }
  };

  const getRoleBadge = (roleId?: string) => {
    if (!roleId || roleId === "unassigned" || roleId === "none") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock size={12} />
          Unassigned [PENDING]
        </span>
      );
    }

    const config = EMPLOYEE_ROLES[roleId as OperationalRoleId];
    const label = config ? config.displayName : roleId.replace(/_/g, " ");

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-teal-50 text-[#0E5961] border border-teal-200">
        <Award size={12} className="text-[#F59E0B]" />
        {label}
      </span>
    );
  };

  const roleEntries = Object.entries(EMPLOYEE_ROLES) as [OperationalRoleId, EmployeeRoleConfig][];

  return (
    <section className="controller-panel rounded-xl overflow-hidden">
      {/* Header */}
      <div className="controller-header px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-200">
            <Users size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                Staff Operational Roster & Role Allotment
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/40">
                Live Broadcast
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#D7E5EC]/80">
              Section Controller authority to assign and real-time synchronize employee operational roles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadStaff}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition border border-white/20"
            title="Refresh Staff Roster"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh Roster</span>
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {alertBanner && (
        <div
          className={`px-5 py-3 text-xs flex items-center gap-2 border-b ${
            alertBanner.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {alertBanner.type === "success" ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-red-600 shrink-0" />
          )}
          <span>{alertBanner.message}</span>
        </div>
      )}

      {/* Table / List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4 font-bold">Employee Name & ID</th>
              <th className="py-3 px-4 font-bold">Official Email</th>
              <th className="py-3 px-4 font-bold">Department</th>
              <th className="py-3 px-4 font-bold">Operational Role</th>
              <th className="py-3 px-4 font-bold text-right">Controller Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2 text-xs">
                    <RefreshCw size={14} className="animate-spin text-[#0E5961]" />
                    <span>Loading staff personnel records...</span>
                  </div>
                </td>
              </tr>
            ) : staff.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                  No staff members found in this division sector.
                </td>
              </tr>
            ) : (
              staff.map((emp, idx) => {
                const effectiveRole = emp.operational_role || emp.operationalRole || "unassigned";
                const empCode = emp.employee_id || emp.employeeId || `IR-2024-${8840 + idx}`;

                return (
                  <tr
                    key={emp.id || idx}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#071A33] text-xs">{emp.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {empCode}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                      {emp.email}
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={13} className="text-slate-400" />
                        <span>{emp.department || "Operations & Traffic Control"}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {getRoleBadge(effectiveRole)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openAssignModal(emp)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0E5961] hover:bg-[#071A33] text-white font-semibold transition text-xs shadow-xs"
                      >
                        <UserCheck size={13} />
                        <span>Assign Role</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Role Assignment Modal */}
      {isModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-[#F59E0B]">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#071A33]">
                    Operational Role Allotment
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time operational authority assignment for Division Employees
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Employee Preview */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#071A33] text-sm block">
                  {selectedStaff.name}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {selectedStaff.employee_id || selectedStaff.employeeId || "IR-STAFF"} • {selectedStaff.email}
                </span>
              </div>
              <div>{getRoleBadge(selectedStaff.operational_role || selectedStaff.operationalRole)}</div>
            </div>

            <form onSubmit={handleAssignRole} className="space-y-4 text-xs">
              {/* Department Selection */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Railway Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#071A33] focus:outline-none focus:border-teal-500"
                >
                  {EMPLOYEE_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Operational Role Selection */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Assigned Operational Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as OperationalRoleId)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#071A33] focus:outline-none focus:border-teal-500"
                >
                  {roleEntries
                    .filter(([, cfg]) => cfg.department === selectedDepartment)
                    .map(([id, cfg]) => (
                      <option key={id} value={id}>
                        {cfg.displayName} ({cfg.assignmentType})
                      </option>
                    ))}
                  <optgroup label="Other Operational Roles">
                    {roleEntries
                      .filter(([, cfg]) => cfg.department !== selectedDepartment)
                      .map(([id, cfg]) => (
                        <option key={id} value={id}>
                          {cfg.displayName} — {cfg.department}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              {/* Role Scope Details Preview */}
              {EMPLOYEE_ROLES[selectedRole] && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[11px]">
                  <div className="text-[#0E5961] font-bold flex items-center gap-1.5">
                    <Shield size={13} />
                    <span>{EMPLOYEE_ROLES[selectedRole].displayName}</span>
                    <span className="text-slate-500 font-normal">
                      • Duty: {EMPLOYEE_ROLES[selectedRole].dutyType}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {EMPLOYEE_ROLES[selectedRole].primaryResponsibility}
                  </p>
                </div>
              )}

              {/* Real-time Notice */}
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-[#0E5961] text-[11px]">
                <Radio size={14} className="text-teal-600 animate-pulse shrink-0" />
                <span>
                  Real-time synchronization will update the employee's active dashboard, duty roster, and assignment immediately without requiring logout.
                </span>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0E5961] hover:bg-[#071A33] text-white font-bold transition shadow-sm disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Allotting & Broadcasting...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck size={14} />
                      <span>Allot Operational Role</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

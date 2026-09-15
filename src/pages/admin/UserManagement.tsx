import { useMemo, useState } from "react"
import {
  Check,
  CheckCircle2,
  Download,
  Edit2,
  Filter,
  KeyRound,
  Plus,
  RotateCcw,
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from "lucide-react"

export type AdminUserRole = "admin" | "controller" | "employee"
export type AdminUserStatus = "active" | "pending" | "suspended"

export interface AdminUserRecord {
  id: string
  name: string
  email: string
  employeeId: string
  role: AdminUserRole
  department: string
  status: AdminUserStatus
  lastActive: string
  createdAt: string
}

const initialUsers: AdminUserRecord[] = [
  {
    id: "usr_adm_9001",
    name: "Chief Administrator",
    email: "admin@raildrishti.gov.in",
    employeeId: "ADM-HQ-01",
    role: "admin",
    department: "Systems & Infrastructure Administration",
    status: "active",
    lastActive: "Just now",
    createdAt: "2024-01-10",
  },
  {
    id: "usr_ctrl_2001",
    name: "Shriya M",
    email: "shriya.m@raildrishti.gov.in",
    employeeId: "CTRL-SBC-01",
    role: "controller",
    department: "Operations & Traffic Control",
    status: "active",
    lastActive: "5 mins ago",
    createdAt: "2024-02-15",
  },
  {
    id: "usr_ctrl_2002",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@raildrishti.gov.in",
    employeeId: "CTRL-SBC-02",
    role: "controller",
    department: "Operations & Traffic Control",
    status: "active",
    lastActive: "1 hour ago",
    createdAt: "2024-03-01",
  },
  {
    id: "usr_emp_4001",
    name: "Vikram Malhotra",
    email: "vikram.malhotra@raildrishti.gov.in",
    employeeId: "EMP-SBC-401",
    role: "employee",
    department: "Traction & Rolling Stock",
    status: "active",
    lastActive: "35 mins ago",
    createdAt: "2024-04-12",
  },
  {
    id: "usr_emp_4002",
    name: "Pooja Sharma",
    email: "pooja.sharma@raildrishti.gov.in",
    employeeId: "IR-2024-6012",
    role: "employee",
    department: "Mechanical Engineering",
    status: "pending",
    lastActive: "Never",
    createdAt: "2024-09-14",
  },
  {
    id: "usr_emp_4003",
    name: "Dinesh Rao",
    email: "dinesh.rao@raildrishti.gov.in",
    employeeId: "EMP-BYPL-109",
    role: "employee",
    department: "Signal & Telecommunications",
    status: "suspended",
    lastActive: "12 days ago",
    createdAt: "2024-02-20",
  },
]

const rolePermissions: Record<AdminUserRole, { title: string; perms: string[] }> = {
  admin: {
    title: "SYSTEM ADMINISTRATOR",
    perms: [
      "User Management & Role Assignment",
      "System & Infrastructure Configuration",
      "Model & Prediction System Settings",
      "Weather Source & Threshold Configuration",
      "External Integrations & API Credentials",
      "Security Audit Logs & Compliance",
      "Platform Health Monitoring",
    ],
  },
  controller: {
    title: "CONTROLLER",
    perms: [
      "Live Network Command Overview",
      "Individual Train Operations & Tracking",
      "Weather Impact & Sector Alerts",
      "Junction Management & Conflict Resolution",
      "Delay Cascade Analysis & Interventions",
      "Operational Reports & Controller Audit",
    ],
  },
  employee: {
    title: "EMPLOYEE",
    perms: [
      "Personal Operations Dashboard",
      "Duty Roster & Shift Assignments",
      "Assigned Operational Tasks",
      "Sector Alerts & Critical Bulletins",
      "Incident & Fault Reporting",
      "Official Mail & Directives",
      "Duty History & Profile Management",
    ],
  },
}

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUserRecord[]>(initialUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("ALL")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [noticeMessage, setNoticeMessage] = useState<{ type: "success" | "info"; text: string } | null>(null)

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null)
  const [viewingUser, setViewingUser] = useState<AdminUserRecord | null>(null)
  const [showPermissions, setShowPermissions] = useState(false)

  // Add User Form state
  const [newFullName, setNewFullName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newEmployeeId, setNewEmployeeId] = useState("")
  const [newDepartment, setNewDepartment] = useState("Operations & Traffic Control")
  const [newRole, setNewRole] = useState<AdminUserRole>("employee")
  const [addError, setAddError] = useState("")

  // Edit User Form state
  const [editFullName, setEditFullName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editDepartment, setEditDepartment] = useState("")
  const [editRole, setEditRole] = useState<AdminUserRole>("employee")
  const [editStatus, setEditStatus] = useState<AdminUserStatus>("active")

  // Filtered users
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return users.filter((u) => {
      if (q) {
        const matchName = u.name.toLowerCase().includes(q)
        const matchEmail = u.email.toLowerCase().includes(q)
        const matchId = u.employeeId.toLowerCase().includes(q)
        if (!matchName && !matchEmail && !matchId) return false
      }
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false
      if (statusFilter !== "ALL" && u.status !== statusFilter) return false
      return true
    })
  }, [users, searchQuery, roleFilter, statusFilter])

  // Summary counts
  const counts = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.status === "active").length,
      controllers: users.filter((u) => u.role === "controller").length,
      admins: users.filter((u) => u.role === "admin").length,
    }
  }, [users])

  const clearFilters = () => {
    setSearchQuery("")
    setRoleFilter("ALL")
    setStatusFilter("ALL")
  }

  // Handle Add User
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFullName.trim() || !newEmail.trim() || !newEmployeeId.trim()) {
      setAddError("Please fill in all required fields.")
      return
    }
    if (!newEmail.includes("@")) {
      setAddError("Please provide a valid email address.")
      return
    }

    const created: AdminUserRecord = {
      id: `usr_custom_${Date.now()}`,
      name: newFullName.trim(),
      email: newEmail.trim(),
      employeeId: newEmployeeId.trim(),
      role: newRole,
      department: newDepartment,
      status: "active",
      lastActive: "Never",
      createdAt: new Date().toISOString().split("T")[0],
    }

    setUsers([created, ...users])
    setIsAddOpen(false)
    setNewFullName("")
    setNewEmail("")
    setNewEmployeeId("")
    setAddError("")
    setNoticeMessage({
      type: "success",
      text: `User account created for ${created.name} (${created.employeeId}). Note: Persisted in local administrative session.`,
    })
  }

  // Open Edit Modal
  const openEdit = (user: AdminUserRecord) => {
    setEditingUser(user)
    setEditFullName(user.name)
    setEditEmail(user.email)
    setEditDepartment(user.department)
    setEditRole(user.role)
    setEditStatus(user.status)
  }

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setUsers(
      users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              name: editFullName.trim() || u.name,
              email: editEmail.trim() || u.email,
              department: editDepartment.trim() || u.department,
              role: editRole,
              status: editStatus,
            }
          : u
      )
    )

    setEditingUser(null)
    setNoticeMessage({
      type: "success",
      text: `User details updated for ${editingUser.employeeId}.`,
    })
  }

  // Toggle Suspend
  const toggleSuspend = (user: AdminUserRecord) => {
    const newStatus: AdminUserStatus = user.status === "suspended" ? "active" : "suspended"
    setUsers(users.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)))
    setNoticeMessage({
      type: "info",
      text: `Account for ${user.name} (${user.employeeId}) is now ${newStatus.toUpperCase()}.`,
    })
  }

  // Export Users
  const handleExport = () => {
    setNoticeMessage({
      type: "info",
      text: `Export generated for ${filteredUsers.length} user records (CSV format dispatched).`,
    })
  }

  return (
    <div className="controller-page px-4 py-5 lg:px-6">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#F59E0B]">
            Access & Governance
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            User Management
          </h1>

          <p className="mt-1 text-sm text-[#9FB8BE]">
            Manage platform users, roles, credential status, and operational access permissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowPermissions(!showPermissions)}
            className="controller-panel inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#D7E5EC] transition hover:bg-[#08383D]"
          >
            <ShieldCheck size={14} className="text-[#0E7C86]" />
            <span>{showPermissions ? "Hide Permissions" : "View Permissions Matrix"}</span>
          </button>

          <button
            onClick={handleExport}
            className="controller-panel inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#D7E5EC] transition hover:bg-[#08383D]"
          >
            <Download size={14} className="text-[#718F96]" />
            <span>Export Users</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-3 py-2 text-xs font-bold text-white transition hover:scale-[1.02]"
          >
            <Plus size={14} className="text-[#F59E0B]" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {noticeMessage && (
        <div
          className={`mb-4 flex items-center justify-between rounded-lg border p-3 text-xs ${
            noticeMessage.type === "success"
              ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-200"
              : "border-amber-500/30 bg-amber-950/40 text-amber-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>{noticeMessage.text}</span>
          </div>
          <button
            onClick={() => setNoticeMessage(null)}
            className="text-xs hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── SUMMARY STRIP ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="controller-panel rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-[#9FB8BE]">
            <span>Total Users</span>
            <Users size={14} className="text-[#0E7C86]" />
          </div>
          <div className="mt-1 text-xl font-bold text-white">{counts.total}</div>
          <div className="mt-0.5 text-[10px] text-[#718F96]">Platform accounts</div>
        </div>

        <div className="controller-panel rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-[#9FB8BE]">
            <span>Active Users</span>
            <UserCheck size={14} className="text-emerald-400" />
          </div>
          <div className="mt-1 text-xl font-bold text-emerald-300">{counts.active}</div>
          <div className="mt-0.5 text-[10px] text-emerald-400/80">Authorized access</div>
        </div>

        <div className="controller-panel rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-[#9FB8BE]">
            <span>Controllers</span>
            <Shield size={14} className="text-[#0E7C86]" />
          </div>
          <div className="mt-1 text-xl font-bold text-white">{counts.controllers}</div>
          <div className="mt-0.5 text-[10px] text-[#718F96]">Operations desk access</div>
        </div>

        <div className="controller-panel rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-[#9FB8BE]">
            <span>Administrators</span>
            <ShieldCheck size={14} className="text-[#F59E0B]" />
          </div>
          <div className="mt-1 text-xl font-bold text-[#F59E0B]">{counts.admins}</div>
          <div className="mt-0.5 text-[10px] text-[#718F96]">Root governance role</div>
        </div>
      </div>

      {/* ── PERMISSION MATRIX DRAWER (EXPANDABLE) ───────────── */}
      {showPermissions && (
        <section className="mt-4 controller-panel rounded-lg p-4">
          <div className="flex items-center justify-between border-b border-[#145158] pb-2.5">
            <div className="flex items-center gap-2">
              <KeyRound size={16} className="text-[#F59E0B]" />
              <h2 className="text-sm font-bold text-white">
                Platform Role & Permission Matrix (Read-Only)
              </h2>
            </div>
            <button
              onClick={() => setShowPermissions(false)}
              className="text-xs text-[#9FB8BE] hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 grid gap-4 md:grid-cols-3">
            {(["admin", "controller", "employee"] as const).map((r) => {
              const spec = rolePermissions[r]
              return (
                <div
                  key={r}
                  className="rounded-lg border border-[#145158] bg-[#031A1F] p-3"
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-[#F59E0B]">
                    {spec.title}
                  </div>
                  <ul className="mt-2.5 space-y-1.5 text-xs text-[#D7E5EC]">
                    {spec.perms.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check size={13} className="shrink-0 text-emerald-400 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── SEARCH & FILTERS ───────────────────────────────── */}
      <div className="mt-4 controller-panel rounded-lg p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718F96]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user name, official email, or employee ID..."
              className="w-full rounded-md border border-[#145158] bg-[#031A1F] py-2 pl-9 pr-8 text-xs text-white placeholder-[#718F96] transition focus:border-[#0E7C86] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#9FB8BE] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-[#9FB8BE]">
              <Filter size={13} className="text-[#718F96]" />
              <span>Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-md border border-[#145158] bg-[#031A1F] px-2.5 py-1.5 text-xs text-[#D7E5EC] focus:border-[#0E7C86] focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="admin">System Administrator</option>
                <option value="controller">Controller</option>
                <option value="employee">Employee</option>
              </select>
            </div>

            <div className="flex items-center gap-1 text-xs text-[#9FB8BE]">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-[#145158] bg-[#031A1F] px-2.5 py-1.5 text-xs text-[#D7E5EC] focus:border-[#0E7C86] focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {(searchQuery || roleFilter !== "ALL" || statusFilter !== "ALL") && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-md border border-[#145158] px-2.5 py-1.5 text-xs text-[#D7E5EC] hover:bg-[#08383D]"
              >
                <RotateCcw size={12} />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── USER TABLE ─────────────────────────────────────── */}
      <section className="mt-4 controller-panel overflow-hidden rounded-lg">
        <div className="controller-header px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[#F59E0B]" />
              <div>
                <h2 className="text-sm font-bold text-white">
                  Authorized Users ({filteredUsers.length} records)
                </h2>
                <p className="text-[11px] text-[#D7E5EC]/70">
                  Role assignments, division departments, and account access
                </p>
              </div>
            </div>

            <span className="text-xs text-[#9FB8BE]">
              Showing {filteredUsers.length} of {users.length}
            </span>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center p-6 text-center">
            <UserX size={32} className="text-[#0E5961]" />
            <h3 className="mt-2 text-sm font-bold text-white">No Users Found</h3>
            <p className="mt-1 text-xs text-[#9FB8BE]">
              {searchQuery || roleFilter !== "ALL" || statusFilter !== "ALL"
                ? "No user records match your search query and filters."
                : "No user records are currently available."}
            </p>
            {(searchQuery || roleFilter !== "ALL" || statusFilter !== "ALL") && (
              <button
                onClick={clearFilters}
                className="mt-3 rounded border border-[#145158] bg-[#071A33] px-3 py-1 text-xs text-[#D7E5EC] hover:text-white"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#145158] bg-[#071A33] text-[10px] font-bold uppercase tracking-[0.12em] text-[#9FB8BE]">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Employee ID</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Active</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#145158]/50">
                {filteredUsers.map((u) => {
                  const initial = u.name.charAt(0) || "U"

                  return (
                    <tr
                      key={u.id}
                      className="transition-colors hover:bg-[#08383D]/50"
                    >
                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-[#145158] bg-[#071A33] font-bold text-[#F59E0B]">
                            {initial}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{u.name}</div>
                            <div className="text-[11px] text-[#718F96]">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Employee ID */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-[#D7E5EC]">
                          {u.employeeId}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <span
                          className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            u.role === "admin"
                              ? "border-amber-500/40 bg-amber-950/60 text-amber-300"
                              : u.role === "controller"
                              ? "border-[#0E7C86]/40 bg-[#071A33] text-[#0E7C86]"
                              : "border-slate-500/30 bg-slate-900/60 text-slate-300"
                          }`}
                        >
                          {u.role === "admin"
                            ? "System Admin"
                            : u.role === "controller"
                            ? "Controller"
                            : "Employee"}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3 text-[#D7E5EC]">
                        {u.department}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold ${
                            u.status === "active"
                              ? "border-emerald-500/40 bg-emerald-950/60 text-emerald-300"
                              : u.status === "pending"
                              ? "border-amber-500/40 bg-amber-950/60 text-amber-300"
                              : "border-red-500/40 bg-red-950/60 text-red-300"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              u.status === "active"
                                ? "bg-emerald-400"
                                : u.status === "pending"
                                ? "bg-amber-400"
                                : "bg-red-400"
                            }`}
                          />
                          {u.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Last Active */}
                      <td className="px-4 py-3 text-[11px] text-[#9FB8BE]">
                        {u.lastActive}
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3 font-mono text-[11px] text-[#718F96]">
                        {u.createdAt}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingUser(u)}
                            className="rounded border border-[#145158] bg-[#071A33] px-2 py-1 text-[11px] font-semibold text-[#D7E5EC] hover:bg-[#08383D] hover:text-white"
                            title="View Profile"
                          >
                            View
                          </button>

                          <button
                            onClick={() => openEdit(u)}
                            className="rounded border border-[#145158] bg-[#071A33] p-1 text-[#718F96] hover:bg-[#08383D] hover:text-white"
                            title="Edit User"
                          >
                            <Edit2 size={13} />
                          </button>

                          {u.role !== "admin" && (
                            <button
                              onClick={() => toggleSuspend(u)}
                              className={`rounded border p-1 text-[11px] ${
                                u.status === "suspended"
                                  ? "border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/60"
                                  : "border-red-500/40 text-red-400 hover:bg-red-950/60"
                              }`}
                              title={
                                u.status === "suspended"
                                  ? "Reactivate Account"
                                  : "Suspend Account"
                              }
                            >
                              {u.status === "suspended" ? <UserCheck size={13} /> : <UserX size={13} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── ADD USER MODAL ─────────────────────────────────── */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#145158] bg-[#062A2F] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#145158] pb-3">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-[#F59E0B]" />
                <h3 className="text-sm font-bold text-white">Add Platform User</h3>
              </div>
              <button
                onClick={() => {
                  setIsAddOpen(false)
                  setAddError("")
                }}
                className="text-xs text-[#9FB8BE] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3">
              {addError && (
                <div className="rounded border border-red-500/40 bg-red-950/50 p-2 text-xs text-red-200">
                  {addError}
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-[#9FB8BE]">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] px-3 py-1.5 text-xs text-white focus:border-[#0E7C86] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#9FB8BE]">
                  Official Email *
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. ramesh.chandra@raildrishti.gov.in"
                  className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] px-3 py-1.5 text-xs text-white focus:border-[#0E7C86] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#9FB8BE]">
                  Employee ID *
                </label>
                <input
                  type="text"
                  value={newEmployeeId}
                  onChange={(e) => setNewEmployeeId(e.target.value)}
                  placeholder="e.g. CTRL-SBC-03"
                  className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] px-3 py-1.5 text-xs text-white focus:border-[#0E7C86] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#9FB8BE]">
                  Department
                </label>
                <select
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] px-3 py-1.5 text-xs text-white focus:border-[#0E7C86] focus:outline-none"
                >
                  <option value="Operations & Traffic Control">Operations & Traffic Control</option>
                  <option value="Signal & Telecommunications">Signal & Telecommunications</option>
                  <option value="Traction & Rolling Stock">Traction & Rolling Stock</option>
                  <option value="Civil & Track Engineering">Civil & Track Engineering</option>
                  <option value="Systems & Infrastructure Administration">Systems & Infrastructure Administration</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#9FB8BE]">
                  Role *
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as AdminUserRole)}
                  className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] px-3 py-1.5 text-xs text-white focus:border-[#0E7C86] focus:outline-none"
                >
                  <option value="employee">Employee</option>
                  <option value="controller">Controller</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#145158]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded px-3 py-1.5 text-xs text-[#9FB8BE] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded border border-[#F59E0B] bg-[#071A33] px-3.5 py-1.5 text-xs font-bold text-[#F59E0B] hover:bg-[#0E5961] hover:text-white"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT USER MODAL ────────────────────────────────── */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#145158] bg-[#062A2F] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#145158] pb-3">
              <div className="flex items-center gap-2">
                <Edit2 size={16} className="text-[#F59E0B]" />
                <h3 className="text-sm font-bold text-white">
                  Edit User — {editingUser.employeeId}
                </h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-xs text-[#9FB8BE] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#9FB8BE]">
                  Employee ID (Immutable)
                </label>
                <input
                  type="text"
                  value={editingUser.employeeId}
                  disabled
                  className="mt-1 w-full cursor-not-allowed rounded border border-[#145158] bg-[#031A1F]/60 px-3 py-1.5 font-mono text-xs text-[#718F96]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#9FB8BE]">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] px-3 py-1.5 text-xs text-white focus:border-[#0E7C86] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#9FB8BE]">
                  Official Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] px-3 py-1.5 text-xs text-white focus:border-[#0E7C86] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#9FB8BE]">
                  Department
                </label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] px-3 py-1.5 text-xs text-white focus:border-[#0E7C86] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#9FB8BE]">
                  Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as AdminUserRole)}
                  className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] px-3 py-1.5 text-xs text-white focus:border-[#0E7C86] focus:outline-none"
                >
                  <option value="employee">Employee</option>
                  <option value="controller">Controller</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#9FB8BE]">
                  Account Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as AdminUserStatus)}
                  className="mt-1 w-full rounded border border-[#145158] bg-[#031A1F] px-3 py-1.5 text-xs text-white focus:border-[#0E7C86] focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#145158]">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded px-3 py-1.5 text-xs text-[#9FB8BE] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded border border-[#F59E0B] bg-[#071A33] px-3.5 py-1.5 text-xs font-bold text-[#F59E0B] hover:bg-[#0E5961] hover:text-white"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── VIEW USER DRAWER ───────────────────────────────── */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#145158] bg-[#062A2F] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#145158] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#0E7C86]" />
                <h3 className="text-sm font-bold text-white">Platform User Profile</h3>
              </div>
              <button
                onClick={() => setViewingUser(null)}
                className="text-xs text-[#9FB8BE] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-[#145158]/40 pb-2">
                <span className="text-[#718F96]">Full Name</span>
                <span className="font-bold text-white">{viewingUser.name}</span>
              </div>
              <div className="flex justify-between border-b border-[#145158]/40 pb-2">
                <span className="text-[#718F96]">Employee ID</span>
                <span className="font-mono text-[#D7E5EC]">{viewingUser.employeeId}</span>
              </div>
              <div className="flex justify-between border-b border-[#145158]/40 pb-2">
                <span className="text-[#718F96]">Official Email</span>
                <span className="text-[#D7E5EC]">{viewingUser.email}</span>
              </div>
              <div className="flex justify-between border-b border-[#145158]/40 pb-2">
                <span className="text-[#718F96]">Role</span>
                <span className="font-bold text-[#F59E0B] uppercase">{viewingUser.role}</span>
              </div>
              <div className="flex justify-between border-b border-[#145158]/40 pb-2">
                <span className="text-[#718F96]">Department</span>
                <span className="text-[#D7E5EC]">{viewingUser.department}</span>
              </div>
              <div className="flex justify-between border-b border-[#145158]/40 pb-2">
                <span className="text-[#718F96]">Status</span>
                <span className="font-bold text-emerald-400 uppercase">{viewingUser.status}</span>
              </div>
              <div className="flex justify-between border-b border-[#145158]/40 pb-2">
                <span className="text-[#718F96]">Last Active</span>
                <span className="text-[#D7E5EC]">{viewingUser.lastActive}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#718F96]">Created At</span>
                <span className="font-mono text-[#718F96]">{viewingUser.createdAt}</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setViewingUser(null)}
                className="rounded border border-[#145158] bg-[#071A33] px-3.5 py-1.5 text-xs font-semibold text-[#D7E5EC] hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

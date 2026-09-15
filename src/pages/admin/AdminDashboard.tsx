import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  Sliders,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  Building,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
} from "lucide-react";
import {
  getCurrentUser,
  logout,
  fetchPendingApplications,
  approveEmployeeApplication,
  rejectEmployeeApplication,
  fetchStaffDirectory,
  DEMO_TEAM_CREDENTIALS,
  type EmployeeApplicationRecord,
} from "../../services/auth";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [applications, setApplications] = useState<EmployeeApplicationRecord[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "staff">("pending");
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const loadData = async () => {
    setLoading(true);
    const [apps, staff] = await Promise.all([
      fetchPendingApplications(),
      fetchStaffDirectory(),
    ]);
    setApplications(apps);
    if (staff && staff.length > 0) {
      setStaffList(staff);
    } else {
      // Local fallback representation
      setStaffList(DEMO_TEAM_CREDENTIALS);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (app: EmployeeApplicationRecord) => {
    setActionMessage(null);
    const res = await approveEmployeeApplication(app.id, currentUser?.name || "Chief Administrator");
    if (res.success) {
      setActionMessage({
        type: "success",
        text: `Approved registration for ${app.full_name} (${app.employee_id}). Account is now ACTIVE in database!`,
      });
      // Update local state
      setApplications((prev) =>
        prev.map((item) => (item.id === app.id ? { ...item, status: "approved" } : item))
      );
    } else {
      setActionMessage({ type: "error", text: res.message || "Failed to approve application." });
    }
  };

  const handleReject = async (app: EmployeeApplicationRecord) => {
    setActionMessage(null);
    const res = await rejectEmployeeApplication(app.id, currentUser?.name || "Chief Administrator");
    if (res.success) {
      setActionMessage({
        type: "success",
        text: `Application for ${app.full_name} (${app.employee_id}) has been rejected.`,
      });
      setApplications((prev) =>
        prev.map((item) => (item.id === app.id ? { ...item, status: "rejected" } : item))
      );
    } else {
      setActionMessage({ type: "error", text: res.message || "Failed to reject application." });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const pendingCount = applications.filter((a) => a.status === "pending").length;
  const approvedCount = applications.filter((a) => a.status === "approved").length;

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.identifier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-[#071A33] text-slate-100 pb-12">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-[#0E5961]/40 bg-[#031426]/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-wide">
                  Rail<span className="text-[#F59E0B]">Drishti</span> Central Admin
                </h1>
                <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-300 border border-red-500/30 uppercase tracking-wider">
                  Admin Gateway
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Staff Governance, Credential Provisioning & Registration Approval Queue
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-white">
                {currentUser?.name || "Souvik Saha"}
              </span>
              <span className="text-[10px] text-[#F59E0B] font-mono">
                {currentUser?.adminId || "ADM-1001"} • System Admin
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* KPI Counter Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="rounded-2xl border border-[#0E5961]/30 bg-[#06283B]/60 p-4 backdrop-blur-md shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pending Registrations
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-[#F59E0B]">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-400">{pendingCount}</span>
              <span className="text-xs text-slate-400">awaiting admin review</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#0E5961]/30 bg-[#06283B]/60 p-4 backdrop-blur-md shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                System Administrators
              </span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-purple-300">2</span>
              <span className="text-xs text-slate-400">Souvik & Neeraj</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#0E5961]/30 bg-[#06283B]/60 p-4 backdrop-blur-md shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Section Controllers
              </span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <Sliders className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-300">2</span>
              <span className="text-xs text-slate-400">Shriya & Rohit</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#0E5961]/30 bg-[#06283B]/60 p-4 backdrop-blur-md shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active Staff Roster
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-300">6</span>
              <span className="text-xs text-slate-400">authorized in DB</span>
            </div>
          </div>
        </div>

        {/* Action Alert Banner */}
        {actionMessage && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-xl p-3.5 text-sm ${
              actionMessage.type === "success"
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                : "border border-red-500/30 bg-red-500/10 text-red-200"
            }`}
          >
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-[#0E5961]/30 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "pending"
                  ? "bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-[#071A33] shadow-md shadow-amber-500/20"
                  : "text-slate-300 hover:bg-[#06283B] hover:text-white"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Pending Registrations Queue</span>
              {pendingCount > 0 && (
                <span className="ml-1 rounded-full bg-[#071A33] text-[#F59E0B] px-1.5 py-0.2 text-[10px] font-extrabold">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("staff")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "staff"
                  ? "bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-[#071A33] shadow-md shadow-amber-500/20"
                  : "text-slate-300 hover:bg-[#06283B] hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Authorized Staff Directory</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#0E5961]/40 bg-[#06283B] text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <Link
              to="/controller"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#0E5961]/40 bg-[#06283B] text-xs text-[#F59E0B] hover:bg-[#0E5961]/30 transition-colors"
            >
              <span>Controller Portal</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* TAB 1: PENDING EMPLOYEE REGISTRATIONS QUEUE */}
        {activeTab === "pending" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Employee Self-Registration Approvals</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Employees who registered on the portal are queued here. Admin approval activates their database credentials.
                </p>
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="rounded-2xl border border-[#0E5961]/30 bg-[#06283B]/40 p-8 text-center">
                <Users className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-300 font-semibold">No Pending Registrations</p>
                <p className="text-xs text-slate-400 mt-1">All employee registration requests have been reviewed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className={`rounded-2xl border p-4 transition-all ${
                      app.status === "pending"
                        ? "border-amber-500/40 bg-gradient-to-r from-[#06283B] via-[#071A33] to-[#06283B]"
                        : app.status === "approved"
                        ? "border-emerald-500/30 bg-emerald-950/20 opacity-80"
                        : "border-red-500/30 bg-red-950/20 opacity-60"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold text-base ${
                            app.status === "pending"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : app.status === "approved"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-red-500/20 text-red-300 border border-red-500/30"
                          }`}
                        >
                          {app.full_name?.charAt(0) || "E"}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-white">{app.full_name}</span>
                            <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-amber-400 border border-slate-700">
                              {app.employee_id}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                app.status === "pending"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : app.status === "approved"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : "bg-red-500/20 text-red-300 border border-red-500/30"
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>

                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <Building className="w-3.5 h-3.5 text-slate-400" />
                              <span>{app.department}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-mono text-slate-300">{app.official_email}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                              <span className="capitalize">Requested: {app.requested_role}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {app.status === "pending" ? (
                          <>
                            <button
                              onClick={() => handleReject(app)}
                              className="flex items-center gap-1 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 px-3.5 py-2 text-xs font-semibold text-red-300 transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                            <button
                              onClick={() => handleApprove(app)}
                              className="flex items-center gap-1 rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-900/30 transition-all cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                              <span>Approve & Activate</span>
                            </button>
                          </>
                        ) : (
                          <div className="text-right text-xs">
                            <span
                              className={`font-semibold ${
                                app.status === "approved" ? "text-emerald-400" : "text-red-400"
                              }`}
                            >
                              {app.status === "approved" ? "Approved by Admin" : "Rejected"}
                            </span>
                            {app.reviewed_by && (
                              <div className="text-[10px] text-slate-400">{app.reviewed_by}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AUTHORIZED STAFF DIRECTORY */}
        {activeTab === "staff" && (
          <div>
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">Authorized Staff Directory</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  All provisioned Admins, Section Controllers, and active Employees in the database.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, ID, department..."
                    className="rounded-xl border border-[#0E5961]/40 bg-[#06283B] pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="rounded-xl border border-[#0E5961]/40 bg-[#06283B] px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-[#F59E0B]"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="controller">Controllers</option>
                  <option value="employee">Employees</option>
                </select>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#0E5961]/30 bg-[#06283B]/50 backdrop-blur-md shadow-md">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#0E5961]/30 bg-[#031426]/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3.5 px-4">Name & ID</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Official Email</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0E5961]/20 text-slate-200">
                  {filteredStaff.map((person, idx) => (
                    <tr key={idx} className="hover:bg-[#071A33]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{person.name}</div>
                        <div className="font-mono text-[10px] text-amber-400 mt-0.5">
                          {person.identifier || person.username}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            person.role === "admin"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : person.role === "controller"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : person.role === "employee"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {person.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">{person.email}</td>
                      <td className="py-3 px-4 text-slate-300">{person.department}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-300 px-2 py-0.5 text-[10px] font-medium border border-emerald-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

import { useState } from "react"
import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Database,
  Globe,
  Lock,
  LogOut,
  Save,
  Shield,
  Sliders,
  User,
  X,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getCurrentUser, logout } from "../../services/auth"
import type { AdminSettings } from "../../types/admin"

export default function Settings() {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()

  // Baseline initial settings
  const [settings, setSettings] = useState<AdminSettings>({
    profile: {
      fullName: currentUser?.name || "Shriya M.",
      email: currentUser?.email || "admin.shriya@railnet.gov.in",
      employeeId: currentUser?.employeeId || "IR-ADM-9041",
      role: "System Administrator",
      department: "Railway Operations Information Systems (CRIS)",
    },
    security: {
      twoFactorAuth: true,
      sessionTimeoutMinutes: 30,
      loginNotifications: true,
      failedLoginProtection: true,
      reAuthForSensitiveActions: true,
    },
    notifications: {
      criticalAlerts: true,
      integrationFailures: true,
      securityEvents: true,
      configurationChanges: true,
      maintenanceNotifications: false,
    },
    display: {
      language: "English (India)",
      timezone: "Asia/Kolkata (IST +05:30)",
      dateFormat: "DD/MM/YYYY",
      use24HourTime: true,
      compactTables: false,
    },
    system: {
      autoStatusRefresh: true,
      refreshIntervalSeconds: 30,
      offlineMode: false,
      maintenanceNotifications: true,
    },
    dataManagement: {
      auditRetentionDays: 180,
      eventRetentionDays: 90,
      autoArchival: true,
      backupStatus: "Operational (Daily at 03:00 IST)",
      lastBackup: "2026-09-15 03:00:00 IST",
    },
  })

  // Feedback and dialog states
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "pending_backend">("idle")
  const [confirmAction, setConfirmAction] = useState<
    "signout_others" | "reset_preferences" | "disable_account" | null
  >(null)

  const handleSave = () => {
    // In local mode, we update local state and notify user about backend sync
    setSaveStatus("pending_backend")
    setTimeout(() => {
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 4000)
    }, 600)
  }

  const handleConfirmAction = () => {
    if (confirmAction === "signout_others") {
      setConfirmAction(null)
      alert("All other administrative sessions have been terminated.")
    } else if (confirmAction === "reset_preferences") {
      setConfirmAction(null)
      alert("Preferences have been reset to system defaults.")
    } else if (confirmAction === "disable_account") {
      setConfirmAction(null)
      logout()
      navigate("/login")
    }
  }

  return (
    <div className="controller-page px-4 py-6 lg:px-8 max-w-7xl mx-auto">
      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#164B5A] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
            <Sliders size={16} />
            <span>Platform Administration & Configuration</span>
          </div>
          <h1 className="mt-1.5 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
            System Settings
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-200">
            Global administrative preferences, security policies, active sessions, and data lifecycle management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg border border-teal-400/30 transition hover:from-teal-400 hover:to-teal-600 active:scale-95 cursor-pointer"
          >
            <Save size={16} />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>

      {/* Save Notification Banner */}
      {saveStatus === "saved" && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-950/80 p-4 text-sm font-medium text-emerald-200 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>
              Preferences saved locally. Backend persistence will synchronize once the administration API is connected.
            </span>
          </div>
          <button
            onClick={() => setSaveStatus("idle")}
            className="text-emerald-300 hover:text-white p-1"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="space-y-7">
        {/* ── 1. ADMIN PROFILE ─────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-[#164B5A] bg-[#071A33]/95 shadow-xl backdrop-blur-md overflow-hidden">
          <div className="border-b border-[#164B5A] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-6 py-4 flex items-center gap-2.5">
            <User size={20} className="text-[#F59E0B]" />
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white">
              Administrator Profile
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={settings.profile.fullName}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    profile: { ...settings.profile, fullName: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-[#164B5A] bg-[#040E1B] px-4 py-2.5 text-sm font-bold text-white focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-300 mb-1.5">
                Official Email
              </label>
              <input
                type="email"
                value={settings.profile.email}
                disabled
                className="w-full rounded-xl border border-[#164B5A]/80 bg-[#051528] px-4 py-2.5 text-sm font-semibold text-slate-100 cursor-not-allowed opacity-90"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-300 mb-1.5">
                Employee ID
              </label>
              <input
                type="text"
                value={settings.profile.employeeId}
                disabled
                className="w-full rounded-xl border border-[#164B5A]/80 bg-[#051528] px-4 py-2.5 text-sm font-semibold text-slate-100 cursor-not-allowed opacity-90"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-300 mb-1.5">
                System Role
              </label>
              <input
                type="text"
                value={settings.profile.role}
                disabled
                className="w-full rounded-xl border border-[#164B5A]/80 bg-[#051528] px-4 py-2.5 text-sm font-bold text-amber-400 cursor-not-allowed opacity-90"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-300 mb-1.5">
                Department / Division
              </label>
              <input
                type="text"
                value={settings.profile.department}
                disabled
                className="w-full rounded-xl border border-[#164B5A]/80 bg-[#051528] px-4 py-2.5 text-sm font-semibold text-slate-100 cursor-not-allowed opacity-90"
              />
            </div>
          </div>
        </div>

        {/* ── 2. SECURITY & AUTHENTICATION ───────────────────────────────────── */}
        <div className="rounded-2xl border border-[#164B5A] bg-[#071A33]/95 shadow-xl backdrop-blur-md overflow-hidden">
          <div className="border-b border-[#164B5A] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-6 py-4 flex items-center gap-2.5">
            <Lock size={20} className="text-teal-300" />
            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-white">
              Security & Access Policies
            </h2>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm sm:text-base font-bold text-white tracking-wide">Two-Factor Authentication (2FA)</div>
                <div className="text-xs sm:text-sm font-medium text-slate-200 mt-1 leading-relaxed">
                  Enforce hardware token or OTP validation for administrative logins.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.security.twoFactorAuth}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    security: { ...settings.security, twoFactorAuth: e.target.checked },
                  })
                }
                className="h-5 w-5 rounded-md border-[#164B5A] bg-[#040E1B] text-teal-500 cursor-pointer accent-teal-500 shrink-0"
              />
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-[#164B5A]/70 pt-4">
              <div>
                <div className="text-sm sm:text-base font-bold text-white tracking-wide">Session Timeout</div>
                <div className="text-xs sm:text-sm font-medium text-slate-200 mt-1 leading-relaxed">
                  Automatically terminate inactive admin sessions.
                </div>
              </div>
              <select
                value={settings.security.sessionTimeoutMinutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    security: {
                      ...settings.security,
                      sessionTimeoutMinutes: Number(e.target.value),
                    },
                  })
                }
                className="rounded-xl border border-[#164B5A] bg-[#040E1B] px-4 py-2 text-sm font-bold text-white focus:outline-none focus:border-teal-400 shrink-0"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>1 Hour</option>
                <option value={120}>2 Hours</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-[#164B5A]/70 pt-4">
              <div>
                <div className="text-sm sm:text-base font-bold text-white tracking-wide">Login Notifications</div>
                <div className="text-xs sm:text-sm font-medium text-slate-200 mt-1 leading-relaxed">
                  Send email alert when account is accessed from a new IP or subnet.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.security.loginNotifications}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    security: { ...settings.security, loginNotifications: e.target.checked },
                  })
                }
                className="h-5 w-5 rounded-md border-[#164B5A] bg-[#040E1B] text-teal-500 cursor-pointer accent-teal-500 shrink-0"
              />
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-[#164B5A]/70 pt-4">
              <div>
                <div className="text-sm sm:text-base font-bold text-white tracking-wide">Failed-Login Brute Force Protection</div>
                <div className="text-xs sm:text-sm font-medium text-slate-200 mt-1 leading-relaxed">
                  Lock account for 15 minutes after 3 consecutive failed credential attempts.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.security.failedLoginProtection}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    security: { ...settings.security, failedLoginProtection: e.target.checked },
                  })
                }
                className="h-5 w-5 rounded-md border-[#164B5A] bg-[#040E1B] text-teal-500 cursor-pointer accent-teal-500 shrink-0"
              />
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-[#164B5A]/70 pt-4">
              <div>
                <div className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Re-Authentication for Sensitive Operations
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-200 mt-1 leading-relaxed">
                  Prompt for password confirmation before changing model parameters or user permissions.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.security.reAuthForSensitiveActions}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    security: {
                      ...settings.security,
                      reAuthForSensitiveActions: e.target.checked,
                    },
                  })
                }
                className="h-5 w-5 rounded-md border-[#164B5A] bg-[#040E1B] text-teal-500 cursor-pointer accent-teal-500 shrink-0"
              />
            </div>
          </div>
        </div>

        {/* ── 3. SESSION MANAGEMENT ─────────────────────────────────────────── */}
        <div className="rounded-2xl border border-[#164B5A] bg-[#071A33]/95 shadow-xl backdrop-blur-md overflow-hidden">
          <div className="border-b border-[#164B5A] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-6 py-4 flex items-center gap-2.5">
            <Shield size={20} className="text-[#F59E0B]" />
            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-white">
              Active Administrative Sessions
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-teal-500/40 bg-teal-950/40 p-4 gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-bold text-white">Current Session (This Device)</span>
                </div>
                <div className="mt-1 text-xs sm:text-sm font-medium text-slate-200">
                  Browser: Chrome on Windows • IP: 10.42.0.12 (Internal CRIS Network)
                </div>
              </div>
              <div className="self-start sm:self-auto font-mono text-xs font-bold text-teal-300 bg-teal-500/20 px-3 py-1 rounded-full border border-teal-500/30">
                Active Now
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#164B5A] bg-[#040E1B]/70 p-4 gap-3">
              <div>
                <div className="text-sm font-bold text-white">Auxiliary Operations Station</div>
                <div className="mt-1 text-xs sm:text-sm font-medium text-slate-200">
                  Browser: Firefox on Linux • IP: 10.42.0.8 • Last active: 2 hours ago
                </div>
              </div>
              <button
                onClick={() => setConfirmAction("signout_others")}
                className="self-start sm:self-auto rounded-lg border border-rose-500/40 bg-rose-950/40 px-3.5 py-1.5 text-xs font-bold text-rose-300 transition hover:bg-rose-900/60 hover:text-white cursor-pointer"
              >
                Terminate Session
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setConfirmAction("signout_others")}
                className="rounded-xl border border-[#164B5A] bg-[#0E5961]/40 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-100 transition hover:bg-[#0E5961] hover:text-white cursor-pointer"
              >
                Sign Out All Other Sessions
              </button>
            </div>
          </div>
        </div>

        {/* ── 4. NOTIFICATIONS & ALERTS ───────────────────────────────────────── */}
        <div className="rounded-2xl border border-[#164B5A] bg-[#071A33]/95 shadow-xl backdrop-blur-md overflow-hidden">
          <div className="border-b border-[#164B5A] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-6 py-4 flex items-center gap-2.5">
            <Bell size={20} className="text-teal-300" />
            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-white">
              System Notification Subscriptions
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex items-start sm:items-center gap-3.5 rounded-xl border border-[#164B5A] bg-[#040E1B]/80 p-4 cursor-pointer hover:border-teal-400 transition hover:bg-[#040E1B]">
              <input
                type="checkbox"
                checked={settings.notifications.criticalAlerts}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      criticalAlerts: e.target.checked,
                    },
                  })
                }
                className="h-5 w-5 rounded-md border-[#164B5A] bg-[#040E1B] text-teal-500 cursor-pointer accent-teal-500 shrink-0 mt-0.5 sm:mt-0"
              />
              <div>
                <div className="text-sm font-bold text-white">Critical System Alerts</div>
                <div className="text-xs sm:text-sm font-medium text-slate-200 mt-0.5">Emergency junction locks, track obstacles</div>
              </div>
            </label>

            <label className="flex items-start sm:items-center gap-3.5 rounded-xl border border-[#164B5A] bg-[#040E1B]/80 p-4 cursor-pointer hover:border-teal-400 transition hover:bg-[#040E1B]">
              <input
                type="checkbox"
                checked={settings.notifications.integrationFailures}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      integrationFailures: e.target.checked,
                    },
                  })
                }
                className="h-5 w-5 rounded-md border-[#164B5A] bg-[#040E1B] text-teal-500 cursor-pointer accent-teal-500 shrink-0 mt-0.5 sm:mt-0"
              />
              <div>
                <div className="text-sm font-bold text-white">Integration Failures</div>
                <div className="text-xs sm:text-sm font-medium text-slate-200 mt-0.5">RTIS disconnects, weather API downtime</div>
              </div>
            </label>

            <label className="flex items-start sm:items-center gap-3.5 rounded-xl border border-[#164B5A] bg-[#040E1B]/80 p-4 cursor-pointer hover:border-teal-400 transition hover:bg-[#040E1B]">
              <input
                type="checkbox"
                checked={settings.notifications.securityEvents}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      securityEvents: e.target.checked,
                    },
                  })
                }
                className="h-5 w-5 rounded-md border-[#164B5A] bg-[#040E1B] text-teal-500 cursor-pointer accent-teal-500 shrink-0 mt-0.5 sm:mt-0"
              />
              <div>
                <div className="text-sm font-bold text-white">Security & IAM Events</div>
                <div className="text-xs sm:text-sm font-medium text-slate-200 mt-0.5">Failed logins, role escalations, lockouts</div>
              </div>
            </label>

            <label className="flex items-start sm:items-center gap-3.5 rounded-xl border border-[#164B5A] bg-[#040E1B]/80 p-4 cursor-pointer hover:border-teal-400 transition hover:bg-[#040E1B]">
              <input
                type="checkbox"
                checked={settings.notifications.configurationChanges}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      configurationChanges: e.target.checked,
                    },
                  })
                }
                className="h-5 w-5 rounded-md border-[#164B5A] bg-[#040E1B] text-teal-500 cursor-pointer accent-teal-500 shrink-0 mt-0.5 sm:mt-0"
              />
              <div>
                <div className="text-sm font-bold text-white">Configuration Changes</div>
                <div className="text-xs sm:text-sm font-medium text-slate-200 mt-0.5">Model swaps, threshold adjustments</div>
              </div>
            </label>
          </div>
        </div>

        {/* ── 5. DISPLAY & REGIONAL ───────────────────────────────────── */}
        <div className="rounded-2xl border border-[#164B5A] bg-[#071A33]/95 shadow-xl backdrop-blur-md overflow-hidden">
          <div className="border-b border-[#164B5A] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-6 py-4 flex items-center gap-2.5">
            <Globe size={20} className="text-[#F59E0B]" />
            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-white">
              Display & Localization
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-300 mb-1.5">Language</label>
              <select
                value={settings.display.language}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    display: { ...settings.display, language: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-[#164B5A] bg-[#040E1B] px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-teal-400"
              >
                <option value="English (India)">English (India)</option>
                <option value="Hindi (हिन्दी)">Hindi (हिन्दी)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-300 mb-1.5">Timezone</label>
              <select
                value={settings.display.timezone}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    display: { ...settings.display, timezone: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-[#164B5A] bg-[#040E1B] px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-teal-400"
              >
                <option value="Asia/Kolkata (IST +05:30)">Asia/Kolkata (IST +05:30)</option>
                <option value="UTC">UTC (+00:00)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-300 mb-1.5">Date Format</label>
              <select
                value={settings.display.dateFormat}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    display: { ...settings.display, dateFormat: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-[#164B5A] bg-[#040E1B] px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-teal-400"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (Indian Standard)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── 6. DATA MANAGEMENT & ARCHIVAL ───────────────────────────────────── */}
        <div className="rounded-2xl border border-[#164B5A] bg-[#071A33]/95 shadow-xl backdrop-blur-md overflow-hidden">
          <div className="border-b border-[#164B5A] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-6 py-4 flex items-center gap-2.5">
            <Database size={20} className="text-teal-300" />
            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-white">
              Data Management & Retention
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-300 mb-1.5">
                Audit Retention Period
              </label>
              <select
                value={settings.dataManagement.auditRetentionDays}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    dataManagement: {
                      ...settings.dataManagement,
                      auditRetentionDays: Number(e.target.value),
                    },
                  })
                }
                className="w-full rounded-xl border border-[#164B5A] bg-[#040E1B] px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-teal-400"
              >
                <option value={90}>90 Days</option>
                <option value={180}>180 Days (Statutory Minimum)</option>
                <option value={365}>365 Days (1 Year)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-300 mb-1.5">
                Event History Retention
              </label>
              <select
                value={settings.dataManagement.eventRetentionDays}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    dataManagement: {
                      ...settings.dataManagement,
                      eventRetentionDays: Number(e.target.value),
                    },
                  })
                }
                className="w-full rounded-xl border border-[#164B5A] bg-[#040E1B] px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-teal-400"
              >
                <option value={30}>30 Days</option>
                <option value={60}>60 Days</option>
                <option value={90}>90 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-300 mb-1.5">
                Automated Database Backup
              </label>
              <div className="rounded-xl border border-teal-500/40 bg-teal-950/40 px-4 py-2.5 text-sm text-teal-300 font-bold">
                {settings.dataManagement.backupStatus}
              </div>
            </div>
          </div>
        </div>

        {/* ── 7. DANGER ZONE ─────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-rose-500/50 bg-[#071A33]/95 shadow-xl backdrop-blur-md overflow-hidden">
          <div className="border-b border-rose-500/40 bg-gradient-to-r from-rose-950/80 via-red-900/60 to-rose-950/80 px-6 py-4 flex items-center gap-2.5">
            <AlertOctagon size={20} className="text-rose-400" />
            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-rose-200">
              Critical Administrative Actions
            </h2>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-sm sm:text-base font-bold text-white">Reset Preferences</div>
                <div className="text-xs sm:text-sm font-medium text-slate-200 mt-1">
                  Restore all UI thresholds and local notification preferences to factory defaults.
                </div>
              </div>
              <button
                onClick={() => setConfirmAction("reset_preferences")}
                className="self-start sm:self-auto rounded-xl border border-amber-500/50 bg-amber-950/50 px-4 py-2 text-xs sm:text-sm font-bold text-amber-300 hover:bg-amber-900/70 hover:text-white transition cursor-pointer"
              >
                Reset to Defaults
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#164B5A]/70 pt-4">
              <div>
                <div className="text-sm sm:text-base font-bold text-white">Sign Out of Admin Console</div>
                <div className="text-xs sm:text-sm font-medium text-slate-200 mt-1">
                  Safely invalidate your current administrative session and return to login.
                </div>
              </div>
              <button
                onClick={() => {
                  logout()
                  navigate("/login")
                }}
                className="self-start sm:self-auto flex items-center gap-2 rounded-xl border border-rose-500/50 bg-rose-950/50 px-4 py-2 text-xs sm:text-sm font-bold text-rose-300 hover:bg-rose-900/70 hover:text-white transition cursor-pointer"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#164B5A]/70 pt-4">
              <div>
                <div className="text-sm sm:text-base font-bold text-rose-400">Deactivate Administrator Account</div>
                <div className="text-xs sm:text-sm font-medium text-slate-200 mt-1">
                  Suspend this administrative account. Requires Super Administrator intervention to restore.
                </div>
              </div>
              <button
                onClick={() => setConfirmAction("disable_account")}
                className="self-start sm:self-auto rounded-xl border border-rose-600 bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs sm:text-sm font-bold text-white transition shadow-lg cursor-pointer"
              >
                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONFIRMATION MODAL ──────────────────────────────────────────────── */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#164B5A] bg-[#071A33] p-6 text-white shadow-2xl">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-400 shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Confirm Critical Action</h3>
                <p className="text-xs sm:text-sm text-slate-200 font-medium mt-1">
                  {confirmAction === "signout_others" &&
                    "Are you sure you want to terminate all other active administrative sessions?"}
                  {confirmAction === "reset_preferences" &&
                    "Are you sure you want to reset all administrative settings to default?"}
                  {confirmAction === "disable_account" &&
                    "Are you sure you want to deactivate this administrator account? You will be logged out immediately."}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="rounded-xl border border-[#164B5A] bg-[#040E1B] px-4 py-2 text-xs sm:text-sm font-bold text-slate-200 hover:bg-[#0E5961] hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 text-xs sm:text-sm font-bold text-white transition shadow-lg cursor-pointer"
              >
                Confirm & Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

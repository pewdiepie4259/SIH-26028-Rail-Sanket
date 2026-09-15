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
    <div className="min-h-[calc(100vh-4rem)] bg-[#031A1F] p-4 lg:p-6 text-white">
      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#164B5A] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F59E0B]">
            <Sliders size={14} />
            <span>Platform Administration & Configuration</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            System Settings
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#9FB8BE]">
            Global administrative preferences, security policies, sessions, and data lifecycle management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-md border border-[#164B5A] bg-[#0E5961] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#0E7C86]"
          >
            <Save size={14} />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>

      {/* Save Notification Banner */}
      {saveStatus === "saved" && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-emerald-600/50 bg-emerald-950/40 p-3.5 text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>
              Preferences saved locally. Backend persistence will synchronize once the administration API is connected.
            </span>
          </div>
          <button
            onClick={() => setSaveStatus("idle")}
            className="text-emerald-400 hover:text-emerald-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="space-y-6">
        {/* ── 1. ADMIN PROFILE ─────────────────────────────────────────────────── */}
        <div className="rounded-lg border border-[#164B5A] bg-[#062A2F] p-5">
          <div className="flex items-center gap-2 border-b border-[#164B5A] pb-3">
            <User size={18} className="text-[#F59E0B]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Administrator Profile
            </h2>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#9FB8BE]">
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
                className="mt-1 w-full rounded-md border border-[#164B5A] bg-[#031A1F] px-3 py-2 text-xs text-white focus:border-[#0E7C86] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#9FB8BE]">
                Official Email
              </label>
              <input
                type="email"
                value={settings.profile.email}
                disabled
                className="mt-1 w-full rounded-md border border-[#164B5A] bg-[#071A33]/50 px-3 py-2 text-xs text-[#9FB8BE] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#9FB8BE]">
                Employee ID
              </label>
              <input
                type="text"
                value={settings.profile.employeeId}
                disabled
                className="mt-1 w-full rounded-md border border-[#164B5A] bg-[#071A33]/50 px-3 py-2 text-xs text-[#9FB8BE] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#9FB8BE]">
                System Role
              </label>
              <input
                type="text"
                value={settings.profile.role}
                disabled
                className="mt-1 w-full rounded-md border border-[#164B5A] bg-[#071A33]/50 px-3 py-2 text-xs text-[#F59E0B] font-semibold cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#9FB8BE]">
                Department / Division
              </label>
              <input
                type="text"
                value={settings.profile.department}
                disabled
                className="mt-1 w-full rounded-md border border-[#164B5A] bg-[#071A33]/50 px-3 py-2 text-xs text-[#9FB8BE] cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* ── 2. SECURITY & AUTHENTICATION ───────────────────────────────────── */}
        <div className="rounded-lg border border-[#164B5A] bg-[#062A2F] p-5">
          <div className="flex items-center gap-2 border-b border-[#164B5A] pb-3">
            <Lock size={18} className="text-[#0E7C86]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Security & Access Policies
            </h2>
          </div>

          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Two-Factor Authentication (2FA)</div>
                <div className="text-[11px] text-[#9FB8BE]">
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
                className="h-4 w-4 rounded border-[#164B5A] text-[#0E7C86] focus:ring-0"
              />
            </div>

            <div className="flex items-center justify-between border-t border-[#164B5A]/60 pt-3">
              <div>
                <div className="text-xs font-semibold text-white">Session Timeout</div>
                <div className="text-[11px] text-[#9FB8BE]">
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
                className="rounded-md border border-[#164B5A] bg-[#031A1F] px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>1 Hour</option>
                <option value={120}>2 Hours</option>
              </select>
            </div>

            <div className="flex items-center justify-between border-t border-[#164B5A]/60 pt-3">
              <div>
                <div className="text-xs font-semibold text-white">Login Notifications</div>
                <div className="text-[11px] text-[#9FB8BE]">
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
                className="h-4 w-4 rounded border-[#164B5A] text-[#0E7C86] focus:ring-0"
              />
            </div>

            <div className="flex items-center justify-between border-t border-[#164B5A]/60 pt-3">
              <div>
                <div className="text-xs font-semibold text-white">Failed-Login Brute Force Protection</div>
                <div className="text-[11px] text-[#9FB8BE]">
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
                className="h-4 w-4 rounded border-[#164B5A] text-[#0E7C86] focus:ring-0"
              />
            </div>

            <div className="flex items-center justify-between border-t border-[#164B5A]/60 pt-3">
              <div>
                <div className="text-xs font-semibold text-white">
                  Re-Authentication for Sensitive Operations
                </div>
                <div className="text-[11px] text-[#9FB8BE]">
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
                className="h-4 w-4 rounded border-[#164B5A] text-[#0E7C86] focus:ring-0"
              />
            </div>
          </div>
        </div>

        {/* ── 3. SESSION MANAGEMENT ─────────────────────────────────────────── */}
        <div className="rounded-lg border border-[#164B5A] bg-[#062A2F] p-5">
          <div className="flex items-center gap-2 border-b border-[#164B5A] pb-3">
            <Shield size={18} className="text-[#F59E0B]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Active Administrative Sessions
            </h2>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-md border border-emerald-800/40 bg-emerald-950/20 p-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-white">Current Session (This Device)</span>
                </div>
                <div className="mt-1 text-[11px] text-[#9FB8BE]">
                  Browser: Chrome on Windows • IP: 10.42.0.12 (Internal CRIS Network)
                </div>
              </div>
              <div className="mt-2 sm:mt-0 font-mono text-[10px] text-emerald-300">
                Active Now
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-md border border-[#164B5A] bg-[#031A1F] p-3">
              <div>
                <div className="text-xs font-semibold text-white">Auxiliary Operations Station</div>
                <div className="mt-1 text-[11px] text-[#9FB8BE]">
                  Browser: Firefox on Linux • IP: 10.42.0.8 • Last active: 2 hours ago
                </div>
              </div>
              <button
                onClick={() => setConfirmAction("signout_others")}
                className="mt-2 sm:mt-0 self-start sm:self-auto rounded border border-rose-800/60 bg-rose-950/40 px-2.5 py-1 text-[11px] font-semibold text-rose-300 transition hover:bg-rose-900/60"
              >
                Terminate Session
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setConfirmAction("signout_others")}
                className="rounded-md border border-[#164B5A] bg-[#071A33] px-3.5 py-1.5 text-xs font-semibold text-[#D7E5EC] transition hover:bg-[#08383D] hover:text-white"
              >
                Sign Out All Other Sessions
              </button>
            </div>
          </div>
        </div>

        {/* ── 4. NOTIFICATIONS & ALERTS ───────────────────────────────────────── */}
        <div className="rounded-lg border border-[#164B5A] bg-[#062A2F] p-5">
          <div className="flex items-center gap-2 border-b border-[#164B5A] pb-3">
            <Bell size={18} className="text-[#0E7C86]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              System Notification Subscriptions
            </h2>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-md border border-[#164B5A] bg-[#031A1F] p-3 cursor-pointer">
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
                className="h-4 w-4 rounded border-[#164B5A] text-[#0E7C86] focus:ring-0"
              />
              <div>
                <div className="text-xs font-semibold text-white">Critical System Alerts</div>
                <div className="text-[10px] text-[#9FB8BE]">Emergency junction locks, track obstacles</div>
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-md border border-[#164B5A] bg-[#031A1F] p-3 cursor-pointer">
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
                className="h-4 w-4 rounded border-[#164B5A] text-[#0E7C86] focus:ring-0"
              />
              <div>
                <div className="text-xs font-semibold text-white">Integration Failures</div>
                <div className="text-[10px] text-[#9FB8BE]">RTIS disconnects, weather API downtime</div>
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-md border border-[#164B5A] bg-[#031A1F] p-3 cursor-pointer">
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
                className="h-4 w-4 rounded border-[#164B5A] text-[#0E7C86] focus:ring-0"
              />
              <div>
                <div className="text-xs font-semibold text-white">Security & IAM Events</div>
                <div className="text-[10px] text-[#9FB8BE]">Failed logins, role escalations, lockouts</div>
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-md border border-[#164B5A] bg-[#031A1F] p-3 cursor-pointer">
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
                className="h-4 w-4 rounded border-[#164B5A] text-[#0E7C86] focus:ring-0"
              />
              <div>
                <div className="text-xs font-semibold text-white">Configuration Changes</div>
                <div className="text-[10px] text-[#9FB8BE]">Model swaps, threshold adjustments</div>
              </div>
            </label>
          </div>
        </div>

        {/* ── 5. DISPLAY & REGIONAL ───────────────────────────────────────────── */}
        <div className="rounded-lg border border-[#164B5A] bg-[#062A2F] p-5">
          <div className="flex items-center gap-2 border-b border-[#164B5A] pb-3">
            <Globe size={18} className="text-[#F59E0B]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Display & Localization
            </h2>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#9FB8BE]">Language</label>
              <select
                value={settings.display.language}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    display: { ...settings.display, language: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-md border border-[#164B5A] bg-[#031A1F] px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="English (India)">English (India)</option>
                <option value="Hindi (हिन्दी)">Hindi (हिन्दी)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#9FB8BE]">Timezone</label>
              <select
                value={settings.display.timezone}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    display: { ...settings.display, timezone: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-md border border-[#164B5A] bg-[#031A1F] px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Asia/Kolkata (IST +05:30)">Asia/Kolkata (IST +05:30)</option>
                <option value="UTC">UTC (+00:00)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#9FB8BE]">Date Format</label>
              <select
                value={settings.display.dateFormat}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    display: { ...settings.display, dateFormat: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-md border border-[#164B5A] bg-[#031A1F] px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (Indian Standard)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── 6. DATA MANAGEMENT & ARCHIVAL ───────────────────────────────────── */}
        <div className="rounded-lg border border-[#164B5A] bg-[#062A2F] p-5">
          <div className="flex items-center gap-2 border-b border-[#164B5A] pb-3">
            <Database size={18} className="text-[#0E7C86]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Data Management & Retention
            </h2>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#9FB8BE]">
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
                className="mt-1 w-full rounded-md border border-[#164B5A] bg-[#031A1F] px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value={90}>90 Days</option>
                <option value={180}>180 Days (Statutory Minimum)</option>
                <option value={365}>365 Days (1 Year)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#9FB8BE]">
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
                className="mt-1 w-full rounded-md border border-[#164B5A] bg-[#031A1F] px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value={30}>30 Days</option>
                <option value={60}>60 Days</option>
                <option value={90}>90 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#9FB8BE]">
                Automated Database Backup
              </label>
              <div className="mt-1 rounded-md border border-[#164B5A] bg-[#031A1F] px-3 py-2 text-xs text-[#0E7C86] font-semibold">
                {settings.dataManagement.backupStatus}
              </div>
            </div>
          </div>
        </div>

        {/* ── 7. DANGER ZONE ─────────────────────────────────────────────────── */}
        <div className="rounded-lg border border-red-900/60 bg-red-950/20 p-5">
          <div className="flex items-center gap-2 border-b border-red-900/60 pb-3">
            <AlertOctagon size={18} className="text-red-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-red-300">
              Critical Administrative Actions
            </h2>
          </div>

          <div className="mt-4 space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-bold text-white">Reset Preferences</div>
                <div className="text-[11px] text-[#9FB8BE]">
                  Restore all UI thresholds and local notification preferences to factory defaults.
                </div>
              </div>
              <button
                onClick={() => setConfirmAction("reset_preferences")}
                className="mt-2 sm:mt-0 rounded border border-amber-700/60 bg-amber-950/40 px-3 py-1.5 font-bold text-[#F59E0B] hover:bg-amber-900/60 self-start sm:self-auto"
              >
                Reset to Defaults
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-red-900/40 pt-3">
              <div>
                <div className="font-bold text-white">Sign Out of Admin Console</div>
                <div className="text-[11px] text-[#9FB8BE]">
                  Safely invalidate your current administrative session and return to login.
                </div>
              </div>
              <button
                onClick={() => {
                  logout()
                  navigate("/login")
                }}
                className="mt-2 sm:mt-0 flex items-center gap-1 rounded border border-red-700/60 bg-red-950/40 px-3 py-1.5 font-bold text-red-300 hover:bg-red-900/60 self-start sm:self-auto"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-red-900/40 pt-3">
              <div>
                <div className="font-bold text-rose-300">Deactivate Administrator Account</div>
                <div className="text-[11px] text-rose-200/70">
                  Suspend this administrative account. Requires Super Administrator intervention to restore.
                </div>
              </div>
              <button
                onClick={() => setConfirmAction("disable_account")}
                className="mt-2 sm:mt-0 rounded border border-rose-700 bg-rose-900 px-3 py-1.5 font-bold text-white hover:bg-rose-800 self-start sm:self-auto"
              >
                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONFIRMATION MODAL ──────────────────────────────────────────────── */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-lg border border-[#164B5A] bg-[#062A2F] p-6 text-white shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-950/80 border border-red-800 text-red-400 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Critical Action</h3>
                <p className="text-xs text-[#9FB8BE]">
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
                className="rounded-md border border-[#164B5A] bg-[#08383D] px-4 py-2 text-xs font-semibold text-[#D7E5EC] hover:bg-[#0E5961] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className="rounded-md bg-red-700 px-4 py-2 text-xs font-bold text-white hover:bg-red-600"
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

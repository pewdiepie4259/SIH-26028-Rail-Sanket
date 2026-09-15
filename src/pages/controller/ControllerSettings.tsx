import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Bell,
  Check,
  ChevronRight,
  CloudRain,
  Gauge,
  LogOut,
  Radio,
  ShieldCheck,
  User,
} from "lucide-react"

function ControllerSettings() {
  const navigate = useNavigate()

  // Dynamic Toggles State
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    criticalDelay: true,
    junctionConflict: true,
    weatherImpact: true,
    cascadeRisk: true,
    systemNotifications: false,
    weatherAwareEta: true,
    monitorDownstream: true,
    severeWeatherNotifs: true,
  })

  // Dynamic Thresholds State
  const [thresholds, setThresholds] = useState({
    delayAlert: "10",
    criticalDelay: "30",
    cascadeRisk: "70",
    weatherRisk: "60",
  })

  const [savedFeedback, setSavedFeedback] = useState(false)
  const [securityModal, setSecurityModal] = useState<string | null>(null)

  function toggleSetting(key: string) {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function handleSave() {
    setSavedFeedback(true)
    setTimeout(() => setSavedFeedback(false), 3000)
  }

  function handleSignOut() {
    navigate("/login")
  }

  return (
    <div className="controller-page min-h-full px-4 py-5 lg:px-6">
      {/* Header */}
      <div className="mb-5">
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#F59E0B]">
          Control Centre
        </div>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
          Controller Settings
        </h1>

        <p className="mt-1 text-sm text-[#9FB8BE]">
          Manage controller preferences, alerts and operational settings.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        {/* Main settings */}
        <div className="space-y-5">
          {/* Profile */}
          <section className="controller-panel overflow-hidden rounded-lg">
            <div className="controller-header px-4 py-3">
              <div className="flex items-center gap-2">
                <User size={16} className="text-[#F59E0B]" />
                <div>
                  <h2 className="text-sm font-bold text-white">
                    Controller Profile
                  </h2>
                  <p className="mt-0.5 text-[11px] text-[#D7E5EC]/70">
                    Assigned operational information
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wide text-[#718F96]">
                  Name
                </label>
                <div className="mt-2 rounded-md border border-[#145158] bg-[#031A1F] px-3 py-2.5 text-sm text-white">
                  Control Room Operator
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wide text-[#718F96]">
                  Role
                </label>
                <div className="mt-2 rounded-md border border-[#145158] bg-[#031A1F] px-3 py-2.5 text-sm text-white">
                  Traffic Controller
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wide text-[#718F96]">
                  Control Zone
                </label>
                <div className="mt-2 rounded-md border border-[#145158] bg-[#031A1F] px-3 py-2.5 text-sm text-white">
                  Bengaluru Division
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wide text-[#718F96]">
                  Shift
                </label>
                <div className="mt-2 rounded-md border border-[#145158] bg-[#031A1F] px-3 py-2.5 text-sm text-white">
                  Evening · 14:00 – 22:00
                </div>
              </div>
            </div>
          </section>

          {/* Alert settings */}
          <section className="controller-panel overflow-hidden rounded-lg">
            <div className="controller-header px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-[#F59E0B]" />

                <div>
                  <h2 className="text-sm font-bold text-white">
                    Alert Preferences
                  </h2>
                  <p className="mt-0.5 text-[11px] text-[#D7E5EC]/70">
                    Configure operational notifications
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-[#145158]">
              <SettingRow
                title="Critical Delay Alerts"
                description="Notify when a train crosses the configured delay threshold."
                enabled={toggles.criticalDelay}
                onToggle={() => toggleSetting("criticalDelay")}
              />

              <SettingRow
                title="Junction Conflict Alerts"
                description="Notify when conflicting train movements are detected."
                enabled={toggles.junctionConflict}
                onToggle={() => toggleSetting("junctionConflict")}
              />

              <SettingRow
                title="Weather Impact Alerts"
                description="Notify when weather conditions may affect train movement."
                enabled={toggles.weatherImpact}
                onToggle={() => toggleSetting("weatherImpact")}
              />

              <SettingRow
                title="Cascade Risk Alerts"
                description="Notify when delay propagation risk becomes significant."
                enabled={toggles.cascadeRisk}
                onToggle={() => toggleSetting("cascadeRisk")}
              />

              <SettingRow
                title="System Notifications"
                description="Receive platform and integration status notifications."
                enabled={toggles.systemNotifications}
                onToggle={() => toggleSetting("systemNotifications")}
              />
            </div>
          </section>

          {/* ETA settings */}
          <section className="controller-panel overflow-hidden rounded-lg">
            <div className="controller-header px-4 py-3">
              <div className="flex items-center gap-2">
                <Gauge size={16} className="text-[#F59E0B]" />

                <div>
                  <h2 className="text-sm font-bold text-white">
                    ETA & Operational Thresholds
                  </h2>
                  <p className="mt-0.5 text-[11px] text-[#D7E5EC]/70">
                    Thresholds used by the control interface
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <Threshold
                label="Delay Alert Threshold"
                value={thresholds.delayAlert}
                unit="minutes"
                onChange={(val) => setThresholds((t) => ({ ...t, delayAlert: val }))}
              />

              <Threshold
                label="Critical Delay Threshold"
                value={thresholds.criticalDelay}
                unit="minutes"
                onChange={(val) => setThresholds((t) => ({ ...t, criticalDelay: val }))}
              />

              <Threshold
                label="Cascade Risk Threshold"
                value={thresholds.cascadeRisk}
                unit="%"
                onChange={(val) => setThresholds((t) => ({ ...t, cascadeRisk: val }))}
              />

              <Threshold
                label="Weather Risk Threshold"
                value={thresholds.weatherRisk}
                unit="%"
                onChange={(val) => setThresholds((t) => ({ ...t, weatherRisk: val }))}
              />
            </div>
          </section>

          {/* Weather */}
          <section className="controller-panel overflow-hidden rounded-lg">
            <div className="controller-header px-4 py-3">
              <div className="flex items-center gap-2">
                <CloudRain size={16} className="text-[#F59E0B]" />

                <div>
                  <h2 className="text-sm font-bold text-white">
                    Weather Monitoring
                  </h2>
                  <p className="mt-0.5 text-[11px] text-[#D7E5EC]/70">
                    Hyperlocal weather monitoring preferences
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4">
              <SettingRow
                title="Enable Weather-Aware ETA"
                description="Use downstream weather conditions when estimating arrival times."
                enabled={toggles.weatherAwareEta}
                onToggle={() => toggleSetting("weatherAwareEta")}
              />

              <SettingRow
                title="Monitor Downstream Stations"
                description="Include weather conditions along the train's remaining route."
                enabled={toggles.monitorDownstream}
                onToggle={() => toggleSetting("monitorDownstream")}
              />

              <SettingRow
                title="Severe Weather Notifications"
                description="Raise alerts when operational weather thresholds are exceeded."
                enabled={toggles.severeWeatherNotifs}
                onToggle={() => toggleSetting("severeWeatherNotifs")}
              />
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* System status */}
          <section className="controller-panel overflow-hidden rounded-lg">
            <div className="controller-header px-4 py-3">
              <div className="flex items-center gap-2">
                <Radio size={16} className="text-[#F59E0B]" />

                <h2 className="text-sm font-bold text-white">
                  System Connections
                </h2>
              </div>
            </div>

            <div className="space-y-3 p-4">
              <ConnectionStatus
                name="Telemetry Feed"
                status="Connected"
              />

              <ConnectionStatus
                name="Weather Service"
                status="Connected"
              />

              <ConnectionStatus
                name="Railway Network"
                status="Connected"
              />
            </div>
          </section>

          {/* Access & Security */}
          <section className="controller-panel overflow-hidden rounded-lg">
            <div className="controller-header px-4 py-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#F59E0B]" />

                <h2 className="text-sm font-bold text-white">
                  Access & Security
                </h2>
              </div>
            </div>

            <div className="divide-y divide-[#145158]">
              <button
                onClick={() => setSecurityModal(securityModal === "password" ? null : "password")}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-[#08383D]"
              >
                <div>
                  <div className="text-xs font-semibold text-white">
                    Change Password
                  </div>
                  <div className="mt-1 text-[10px] text-[#718F96]">
                    Update your controller account credentials
                  </div>
                </div>

                <ChevronRight size={16} className="text-[#718F96]" />
              </button>

              {securityModal === "password" && (
                <div className="bg-[#031A1F] p-4 text-xs">
                  <div className="text-amber-400 font-bold mb-2">Password Update Protocol</div>
                  <p className="text-[11px] text-[#9FB8BE] mb-3">
                    Contact your Divisional Network Administrator or IRCTC IT Desk to reset Control Room operational credentials.
                  </p>
                  <button
                    onClick={() => setSecurityModal(null)}
                    className="rounded bg-[#08383D] border border-[#145158] px-3 py-1 text-[10px] text-white"
                  >
                    Close
                  </button>
                </div>
              )}

              <button
                onClick={() => setSecurityModal(securityModal === "session" ? null : "session")}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-[#08383D]"
              >
                <div>
                  <div className="text-xs font-semibold text-white">
                    Session Security
                  </div>
                  <div className="mt-1 text-[10px] text-[#718F96]">
                    Review active controller sessions
                  </div>
                </div>

                <ChevronRight size={16} className="text-[#718F96]" />
              </button>

              {securityModal === "session" && (
                <div className="bg-[#031A1F] p-4 text-xs">
                  <div className="text-emerald-400 font-bold mb-1">Active Session Secure</div>
                  <div className="text-[10px] text-[#9FB8BE]">Desk ID: DESK-SBC-04</div>
                  <div className="text-[10px] text-[#9FB8BE]">IP: 10.14.22.81 (Internal Railway VPN)</div>
                  <button
                    onClick={() => setSecurityModal(null)}
                    className="mt-3 rounded bg-[#08383D] border border-[#145158] px-3 py-1 text-[10px] text-white"
                  >
                    Acknowledge
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Save */}
          <section className="controller-panel rounded-lg p-4">
            <div className="text-xs font-semibold text-[#D7E5EC]">
              Configuration
            </div>

            <p className="mt-1 text-[11px] leading-5 text-[#718F96]">
              Changes to operational thresholds should follow authorised
              control-room procedures.
            </p>

            {savedFeedback && (
              <div className="mt-3 flex items-center gap-2 rounded border border-emerald-500/40 bg-emerald-950/40 px-3 py-2 text-xs font-bold text-emerald-400">
                <Check size={14} />
                Preferences updated successfully
              </div>
            )}

            <button
              onClick={handleSave}
              className="controller-button mt-4 flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-xs font-bold"
            >
              <Check size={15} />
              Save Preferences
            </button>
          </section>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-900/60 bg-[#031A1F] px-4 py-3 text-xs font-bold text-red-400 transition hover:bg-red-950/30"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

function SettingRow({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string
  description: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div
      onClick={onToggle}
      className="flex cursor-pointer items-center justify-between gap-4 p-4 transition-colors hover:bg-[#08383D]/40"
    >
      <div>
        <div className="text-xs font-semibold text-white">
          {title}
        </div>

        <div className="mt-1 max-w-xl text-[10px] leading-5 text-[#718F96]">
          {description}
        </div>
      </div>

      <div
        className={
          enabled
            ? "relative h-5 w-9 shrink-0 rounded-full bg-[#0E7C86] transition-colors"
            : "relative h-5 w-9 shrink-0 rounded-full bg-[#145158] transition-colors"
        }
      >
        <div
          className={
            enabled
              ? "absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-all"
              : "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-[#9FB8BE] transition-all"
          }
        />
      </div>
    </div>
  )
}

function Threshold({
  label,
  value,
  unit,
  onChange,
}: {
  label: string
  value: string
  unit: string
  onChange: (val: string) => void
}) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-wide text-[#718F96]">
        {label}
      </label>

      <div className="mt-2 flex overflow-hidden rounded-md border border-[#145158] bg-[#031A1F]">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent px-3 py-2 text-sm font-semibold text-white focus:outline-none"
        />

        <div className="flex items-center border-l border-[#145158] px-3 text-xs font-bold text-[#9FB8BE]">
          {unit}
        </div>
      </div>
    </div>
  )
}

function ConnectionStatus({
  name,
  status,
}: {
  name: string
  status: string
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-[#145158] bg-[#031A1F] px-3 py-3">
      <span className="text-xs font-semibold text-[#D7E5EC]">
        {name}
      </span>

      <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        {status}
      </span>
    </div>
  )
}

export default ControllerSettings

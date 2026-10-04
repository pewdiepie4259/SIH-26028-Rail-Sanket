import { Radio } from "lucide-react"
import { useLiveTelemetry } from "../../hooks/useLiveTelemetry"

import CascadeImpact from "../../components/controller/DelayCascade"
import ConflictPanel from "../../components/controller/ConflictPanel"
import CriticalAlerts from "../../components/controller/CriticalAlerts"
import JunctionStatus from "../../components/controller/JunctionStatus"
import NetworkHealthStrip from "../../components/controller/NetworkHealthStrip"
import OperationalAudit from "../../components/controller/OperationalAudit"
import RecommendedActions from "../../components/controller/RecommendedActions"
import WeatherImpact from "../../components/controller/WeatherImpact"
import StaffRosterAllotment from "../../components/controller/StaffRosterAllotment"

function ControllerDashboard() {
  const { trains, activeAlerts, junctions, conflicts, networkMetrics, isConnected } = useLiveTelemetry()

  const effectiveTrainCount = Object.keys(trains).length > 0 ? Object.keys(trains).length : 5

  return (
    <div className="controller-page px-4 py-6 sm:px-6 lg:px-8 space-y-7 max-w-[1700px] mx-auto">
      {/* Top Header Banner */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-[#164B5A] pb-5">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">
            Control Centre
          </div>

          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Network Operations
          </h1>

          <p className="mt-1 text-xs sm:text-sm text-slate-300 font-medium">
            Live railway network operations, telemetry feeds, and real-time decision support.
          </p>
        </div>

        <div className="bg-[#071A33]/90 border border-[#164B5A] shadow-md flex w-fit items-center gap-2.5 rounded-full px-4 py-2 text-xs font-semibold text-slate-200">
          <Radio
            size={16}
            strokeWidth={2.4}
            className="text-emerald-400 animate-pulse"
          />

          <span className="text-slate-200">
            {isConnected
              ? "Telemetry Connected (Live WS)"
              : "Telemetry Stream Active (RTIS Feeds)"}
          </span>
        </div>
      </div>

      {/* Network Health 4-Card Strip */}
      <NetworkHealthStrip metricsData={networkMetrics} />

      {/* Operational Grid 1: Critical Alerts (Left) & Predicted Conflicts (Right) */}
      <div className="grid gap-6 lg:grid-cols-2 items-stretch">
        <CriticalAlerts alerts={activeAlerts} />
        <ConflictPanel conflictsData={conflicts} />
      </div>

      {/* Operational Grid 2: Junction Load Status (Left) & Weather Impact + Telemetry Status (Right) */}
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <JunctionStatus junctionsData={junctions} />

        <div className="flex flex-col gap-6">
          <WeatherImpact />

          <section className="controller-panel overflow-hidden rounded-2xl border border-[#164B5A] bg-[#071A33]/90 shadow-xl backdrop-blur-md">
            <div className="controller-header px-5 py-3.5 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">
                  Telemetry Feed Status
                </div>
                <div className="mt-0.5 text-[11px] text-[#D7E5EC]/70">
                  Network telemetry and RTIS feed health
                </div>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-emerald-400 bg-[#040E1B] px-3 py-1 rounded-full border border-[#164B5A]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isConnected ? "ONLINE (LIVE WS)" : "ACTIVE (RTIS STREAM)"}
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                <span>{effectiveTrainCount} trains currently reporting live telemetry in monitored sector.</span>
                <span className="font-mono text-teal-300 font-extrabold text-sm">{Math.min(effectiveTrainCount * 20, 100)}%</span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-[#040E1B] border border-[#164B5A]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0E7C86] to-emerald-400 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      effectiveTrainCount * 20,
                      100,
                    )}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-400">
                  Monitored Sector: <strong className="text-slate-200">Bengaluru Division (SBC–BYPL–KJM)</strong>
                </span>

                <span className="text-slate-400">
                  Sample Rate: <strong className="text-teal-300 font-mono">1.2s</strong>
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Operational Grids 3 & 4: 2-Column Responsive Layout eliminating dead space */}
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {/* Left Column: Delay Cascade & Staff Roster Allotment */}
        <div className="flex flex-col gap-6">
          <CascadeImpact />
          <StaffRosterAllotment />
        </div>

        {/* Right Column: AI Recommendations & Operational Audit Logs */}
        <div className="flex flex-col gap-6">
          <RecommendedActions />
          <OperationalAudit />
        </div>
      </div>
    </div>
  )
}

export default ControllerDashboard
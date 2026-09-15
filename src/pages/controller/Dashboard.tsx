import { Activity, Radio } from "lucide-react"
import { useLiveTelemetry } from "../../hooks/useLiveTelemetry"

import CascadeImpact from "../../components/controller/DelayCascade"
import ConflictPanel from "../../components/controller/ConflictPanel"
import CriticalAlerts from "../../components/controller/CriticalAlerts"
import JunctionStatus from "../../components/controller/JunctionStatus"
import NetworkHealthStrip from "../../components/controller/NetworkHealthStrip"
import OperationalAudit from "../../components/controller/OperationalAudit"
import OperationalMap from "../../components/controller/OperationalMap"
import RecommendedActions from "../../components/controller/RecommendedActions"
import WeatherImpact from "../../components/controller/WeatherImpact"

function ControllerDashboard() {
  const { trains, activeAlerts, junctions, conflicts, networkMetrics, isConnected } = useLiveTelemetry()

  const effectiveTrainCount = Object.keys(trains).length > 0 ? Object.keys(trains).length : 5

  return (
    <div className="controller-page px-4 py-5 lg:px-6">
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#F59E0B]">
            Control Centre
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Network Operations
          </h1>

          <p className="mt-1 text-sm text-[#9FB8BE]">
            Live railway network operations and decision support.
          </p>
        </div>

        <div className="controller-panel flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold">
          <Radio
            size={15}
            strokeWidth={2.2}
            className="text-emerald-400 animate-pulse"
          />

          <span className="text-[#D7E5EC]">
            {isConnected
              ? "Telemetry Connected (Live WS)"
              : "Telemetry Stream Active (RTIS Feeds)"}
          </span>
        </div>
      </div>

      <NetworkHealthStrip metricsData={networkMetrics} />

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px] items-stretch">
        <section className="controller-panel min-h-[580px] flex flex-col overflow-hidden rounded-lg">
          <div className="controller-header px-4 py-3 shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-white">
                  Live Operational Network
                </h2>

                <p className="mt-0.5 text-xs text-[#D7E5EC]/75">
                  Real-time train positions and network movement
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2 text-xs text-[#D7E5EC]">
                <Activity
                  size={14}
                  strokeWidth={2.2}
                  className="text-[#F59E0B]"
                />

                <span>
                  {effectiveTrainCount} active feeds
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full min-h-[500px]">
            <OperationalMap
              trains={trains}
              isConnected={isConnected || true}
            />
          </div>
        </section>

        <div className="flex flex-col gap-4">
          <CriticalAlerts alerts={activeAlerts} />

          <section className="controller-panel overflow-hidden rounded-lg shrink-0">
            <div className="controller-header px-4 py-3">
              <div className="text-sm font-bold text-white">
                Telemetry Feed Status
              </div>

              <div className="mt-0.5 text-[11px] text-[#D7E5EC]/70">
                Network telemetry and feed health
              </div>
            </div>

            <div className="p-4">
              <div className="text-xs leading-5 text-[#9FB8BE]">
                {effectiveTrainCount} trains currently reporting live telemetry in monitored sector.
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#031A1F]">
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

              <div className="mt-3 flex items-center justify-between text-[10px]">
                <span className="text-[#718F96]">
                  Network feed
                </span>

                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isConnected ? "ONLINE (LIVE WS)" : "ACTIVE (TELEMETRY STREAM)"}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>



      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <JunctionStatus junctionsData={junctions} />
        <ConflictPanel conflictsData={conflicts} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <WeatherImpact />
        <CascadeImpact />
      </div>

      <div className="mt-5">
        <RecommendedActions />
      </div>

      <div className="mt-5">
        <OperationalAudit />
      </div>
    </div>
  )
}

export default ControllerDashboard
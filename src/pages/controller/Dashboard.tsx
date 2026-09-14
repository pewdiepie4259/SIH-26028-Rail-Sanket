import { Activity, Radio } from "lucide-react"
import { useLiveTelemetry } from "../../hooks/useLiveTelemetry"

import ActiveTrainTable from "../../components/controller/ActiveTrainTable"
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
  const { trains, activeAlerts, isConnected } = useLiveTelemetry()

  const activeTrainCount = Object.keys(trains).length

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
            className={
              isConnected
                ? "text-emerald-400"
                : "text-red-400"
            }
          />

          <span className="text-[#D7E5EC]">
            {isConnected
              ? "Telemetry Connected"
              : "Telemetry Offline"}
          </span>
        </div>
      </div>

      <NetworkHealthStrip />

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="controller-panel min-h-[560px] overflow-hidden rounded-lg">
          <div className="controller-header px-4 py-3">
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
                  {activeTrainCount} active{" "}
                  {activeTrainCount === 1 ? "feed" : "feeds"}
                </span>
              </div>
            </div>
          </div>

          <OperationalMap
            trains={trains}
            isConnected={isConnected}
          />
        </section>

        <div className="space-y-5">
          <CriticalAlerts alerts={activeAlerts} />

          <section className="controller-panel overflow-hidden rounded-lg">
            <div className="controller-header px-4 py-3">
              <div className="text-sm font-bold text-white">
                Active Train Operations
              </div>

              <div className="mt-0.5 text-[11px] text-[#D7E5EC]/70">
                Current telemetry feed status
              </div>
            </div>

            <div className="p-4">
              <div className="text-xs leading-5 text-[#9FB8BE]">
                {activeTrainCount > 0
                  ? `${activeTrainCount} train${
                      activeTrainCount === 1 ? "" : "s"
                    } currently reporting telemetry.`
                  : "Waiting for live train telemetry."}
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#031A1F]">
                <div
                  className="h-full rounded-full bg-[#0E7C86] transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      activeTrainCount * 8,
                      100,
                    )}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px]">
                <span className="text-[#718F96]">
                  Network feed
                </span>

                <span
                  className={
                    isConnected
                      ? "font-bold text-emerald-400"
                      : "font-bold text-red-400"
                  }
                >
                  {isConnected ? "ONLINE" : "OFFLINE"}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-5">
        <ActiveTrainTable
          trains={trains}
          isConnected={isConnected}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <JunctionStatus />
        <ConflictPanel />
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
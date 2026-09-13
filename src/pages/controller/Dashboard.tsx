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
    <div className="min-h-full bg-[#031426] px-4 py-5 text-white lg:px-6">
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#F59E0B]">
            Control Centre
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Network Operations
          </h1>

          <p className="mt-1 text-sm text-[#AFC0D4]">
            Live railway network intelligence and operational decision support.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-lg border border-[#0E5961]/60 bg-[#0A2036] px-3 py-2 text-xs font-semibold">
          <Radio
            size={15}
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
        <section className="min-h-[560px] overflow-hidden rounded-xl border border-[#17344A] bg-[#0A2036]">
          <div className="flex items-center justify-between border-b border-[#17344A] px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-white">
                Live Operational Network
              </h2>

              <p className="mt-0.5 text-xs text-[#AFC0D4]">
                Real-time train positions and network movement
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#AFC0D4]">
              <Activity
                size={14}
                className="text-[#0E7C86]"
              />

              <span>
                {activeTrainCount} active{" "}
                {activeTrainCount === 1 ? "feed" : "feeds"}
              </span>
            </div>
          </div>

          <OperationalMap
            trains={trains}
            isConnected={isConnected}
          />
        </section>

        <div className="space-y-5">
          <CriticalAlerts alerts={activeAlerts} />

          <div className="rounded-xl border border-[#17344A] bg-[#0A2036] p-4">
            <div className="mb-3 text-sm font-bold text-white">
              Active Train Operations
            </div>

            <div className="text-xs leading-5 text-[#AFC0D4]">
              {activeTrainCount > 0
                ? `${activeTrainCount} train${
                    activeTrainCount === 1 ? "" : "s"
                  } currently reporting telemetry.`
                : "Waiting for live train telemetry."}
            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#071A33]">
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
          </div>
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
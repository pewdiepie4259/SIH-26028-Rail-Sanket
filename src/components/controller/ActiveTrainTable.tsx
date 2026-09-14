import {
  ArrowRight,
  ChevronRight,
  Clock3,
  MapPin,
  Radio,
  TrainFront,
} from "lucide-react"

import { Link } from "react-router-dom"
import type { LiveTrain } from "../../hooks/useLiveTelemetry"

interface ActiveTrainTableProps {
  trains: Record<string, LiveTrain>
  isConnected: boolean
}

function ActiveTrainTable({
  trains,
  isConnected,
}: ActiveTrainTableProps) {
  const trainList = Object.values(trains)

  return (
    <section className="overflow-hidden rounded-xl border border-[#16364A] bg-[#0A2036]">
      <div className="flex flex-col gap-3 border-b border-[#16364A] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <TrainFront
              size={17}
              className="text-[#F59E0B]"
            />

            <div>
              <h3 className="text-sm font-bold text-white">
                Active Train Operations
              </h3>

              <p className="mt-1 text-xs text-[#71899C]">
                Current movement and predicted arrival across the monitored
                section.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              isConnected
                ? "bg-emerald-400"
                : "bg-red-400"
            }`}
          />

          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#AFC0D4]">
            {isConnected
              ? "Live telemetry"
              : "Telemetry disconnected"}
          </span>
        </div>
      </div>

      {trainList.length === 0 ? (
        <div className="flex min-h-[260px] items-center justify-center px-5">
          <div className="text-center">
            <Radio
              size={32}
              strokeWidth={1.5}
              className="mx-auto text-[#0E5961]"
            />

            <div className="mt-3 text-sm font-semibold text-[#D7E5EC]">
              Waiting for live train telemetry
            </div>

            <p className="mt-1 max-w-sm text-xs leading-5 text-[#71899C]">
              Train movements will appear here automatically when the
              telemetry WebSocket connection starts sending data.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse">
            <thead>
              <tr className="border-b border-[#16364A] bg-[#071A33] text-left">
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#71899C]">
                  Train
                </th>

                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#71899C]">
                  Current Block
                </th>

                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#71899C]">
                  Next Station
                </th>

                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#71899C]">
                  Speed
                </th>

                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#71899C]">
                  Signal
                </th>

                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#71899C]">
                  Delay
                </th>

                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#71899C]">
                  Predicted Arrival
                </th>

                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#71899C]">
                  Priority
                </th>

                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-[#71899C]">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {trainList.map((train) => {
                const nextForecast = train.forecasts?.[0]

                const delay =
                  nextForecast?.predicted_delay_min ?? 0

                const predictedArrival =
                  nextForecast?.dynamic_gnn_eta ?? "—"

                const nextStation =
                  nextForecast?.station_name ||
                  nextForecast?.station ||
                  "—"

                return (
                  <tr
                    key={train.trainNumber}
                    className="border-b border-[#16364A]/70 transition-colors hover:bg-[#071A33]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#16364A] bg-[#071A33]">
                          <TrainFront
                            size={15}
                            className="text-[#0E7C86]"
                          />
                        </div>

                        <div>
                          <div className="text-xs font-bold text-white">
                            {train.trainNumber}
                          </div>

                          <div className="mt-0.5 max-w-[150px] truncate text-[11px] text-[#71899C]">
                            {train.name || "Unnamed service"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin
                          size={14}
                          className="shrink-0 text-[#0E7C86]"
                        />

                        <span className="text-xs font-semibold text-[#D7E5EC]">
                          {train.currentBlock || "—"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <ArrowRight
                          size={14}
                          className="text-[#71899C]"
                        />

                        <span className="text-xs text-[#D7E5EC]">
                          {nextStation}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-[#D7E5EC]">
                        {Number.isFinite(
                          train.telemetry?.speed_kmh,
                        )
                          ? `${train.telemetry.speed_kmh.toFixed(
                              1,
                            )} km/h`
                          : "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-md border border-[#16364A] bg-[#071A33] px-2 py-1 text-[10px] font-semibold text-[#D7E5EC]">
                        {train.telemetry?.signal || "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Clock3
                          size={14}
                          className={
                            delay > 0
                              ? "text-[#F59E0B]"
                              : "text-emerald-400"
                          }
                        />

                        <span
                          className={`text-xs font-bold ${
                            delay > 0
                              ? "text-[#F59E0B]"
                              : "text-emerald-400"
                          }`}
                        >
                          {delay > 0
                            ? `+${delay} min`
                            : "On time"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-white">
                        {predictedArrival}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-md border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-2 py-1 text-[10px] font-bold text-[#F59E0B]">
                        Tier {train.priority ?? "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/controller/trains/${train.trainNumber}`}
                        className="inline-flex items-center gap-1 rounded-md border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(245,158,11,0.18)]"
                      >
                        View
                        <ChevronRight size={13} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-[#16364A] px-5 py-3">
        <span className="text-[10px] text-[#71899C]">
          {trainList.length > 0
            ? `${trainList.length} active train${
                trainList.length === 1 ? "" : "s"
              }`
            : "No active trains received"}
        </span>

        <span className="text-[10px] font-semibold text-[#0E7C86]">
          {isConnected
            ? "WebSocket connected"
            : "Waiting for connection"}
        </span>
      </div>
    </section>
  )
}

export default ActiveTrainTable
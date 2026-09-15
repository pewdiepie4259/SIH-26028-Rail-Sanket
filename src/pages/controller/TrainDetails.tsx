import {
  AlertTriangle,
  ArrowLeft,
  Clock3,
  Gauge,
  MapPin,
  Radio,
  ShieldAlert,
  TrainFront,
  Wind,
} from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { useLiveTelemetry } from "../../hooks/useLiveTelemetry"

function TrainDetails() {
  const { trainNumber } = useParams()
  const { trains, isConnected } = useLiveTelemetry()

  const train = trainNumber ? trains[trainNumber] : undefined
  const forecast = train?.forecasts?.[0]

  if (!train) {
    return (
      <div className="min-h-full bg-[#031426] px-4 py-6 text-white lg:px-6">
        <Link
          to="/controller/trains"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#AFC0D4] transition hover:text-white"
        >
          <ArrowLeft size={15} />
          Back to Train Operations
        </Link>

        <div className="mt-8 rounded-xl border border-[#16364A] bg-[#0A2036] p-8 text-center">
          <TrainFront
            size={34}
            className="mx-auto text-[#0E5961]"
          />

          <h1 className="mt-4 text-lg font-bold">
            Train telemetry unavailable
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm text-[#71899C]">
            No live telemetry is currently available for train{" "}
            {trainNumber || "requested"}.
          </p>
        </div>
      </div>
    )
  }

  const delay = forecast?.predicted_delay_min ?? 0
  const cascadeRiskRaw = forecast?.cascade_risk ?? 0
  const cascadeRisk =
    cascadeRiskRaw <= 1
      ? cascadeRiskRaw * 100
      : cascadeRiskRaw

  const safeCascadeRisk = Math.min(
    Math.max(cascadeRisk, 0),
    100,
  )

  const isDelayed = delay > 0

  return (
    <div className="min-h-full bg-[#031426] px-4 py-6 text-white lg:px-6">
      <div className="mb-5">
        <Link
          to="/controller/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#AFC0D4] transition hover:text-white"
        >
          <ArrowLeft size={15} />
          Back to Network Operations
        </Link>
      </div>

      <div className="rounded-xl border border-[#16364A] bg-[#0A2036]">
        <div className="flex flex-col gap-4 border-b border-[#16364A] p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10">
              <TrainFront
                size={23}
                className="text-[#F59E0B]"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-bold text-white">
                  {train.trainNumber}
                </h1>

                <span
                  className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    isDelayed
                      ? "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  {isDelayed
                    ? `+${delay} min`
                    : "On Time"}
                </span>
              </div>

              <h2 className="mt-1 text-sm font-semibold text-[#D7E5EC]">
                {train.name || "Unnamed service"}
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#71899C]">
                <span>{train.currentBlock || "Block unavailable"}</span>

                <span>•</span>

                <span>
                  Next:{" "}
                  {forecast?.station_name ||
                    forecast?.station ||
                    "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-[#16364A] bg-[#071A33] px-3 py-2">
            <Radio
              size={14}
              className={
                isConnected
                  ? "text-emerald-400"
                  : "text-red-400"
              }
            />

            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#AFC0D4]">
              {isConnected
                ? "Live telemetry"
                : "Telemetry offline"}
            </span>
          </div>
        </div>

        <div className="grid gap-px bg-[#16364A] sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-[#0A2036] p-5">
            <div className="flex items-center gap-2 text-[#71899C]">
              <Gauge size={15} />
              <span className="text-[10px] font-bold uppercase tracking-wide">
                Current Speed
              </span>
            </div>

            <div className="mt-2 text-xl font-bold text-white">
              {Number.isFinite(
                train.telemetry?.speed_kmh,
              )
                ? `${train.telemetry.speed_kmh.toFixed(1)} km/h`
                : "—"}
            </div>
          </div>

          <div className="bg-[#0A2036] p-5">
            <div className="flex items-center gap-2 text-[#71899C]">
              <Radio size={15} />
              <span className="text-[10px] font-bold uppercase tracking-wide">
                Signal
              </span>
            </div>

            <div className="mt-2 text-xl font-bold text-white">
              {train.telemetry?.signal || "—"}
            </div>
          </div>

          <div className="bg-[#0A2036] p-5">
            <div className="flex items-center gap-2 text-[#71899C]">
              <Clock3 size={15} />
              <span className="text-[10px] font-bold uppercase tracking-wide">
                Predicted Arrival
              </span>
            </div>

            <div className="mt-2 text-xl font-bold text-white">
              {forecast?.dynamic_gnn_eta || "—"}
            </div>
          </div>

          <div className="bg-[#0A2036] p-5">
            <div className="flex items-center gap-2 text-[#71899C]">
              <ShieldAlert size={15} />
              <span className="text-[10px] font-bold uppercase tracking-wide">
                Cascade Risk
              </span>
            </div>

            <div className="mt-2 text-xl font-bold text-[#F59E0B]">
              {Math.round(safeCascadeRisk)}%
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <section className="rounded-xl border border-[#16364A] bg-[#0A2036] p-5 xl:col-span-2">
          <div className="flex items-center gap-2">
            <MapPin
              size={17}
              className="text-[#F59E0B]"
            />

            <h2 className="text-sm font-bold text-white">
              Current Movement
            </h2>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-[#16364A] bg-[#071A33] p-4">
              <div className="text-[10px] font-bold uppercase tracking-wide text-[#71899C]">
                Current Block
              </div>

              <div className="mt-2 text-sm font-bold text-[#D7E5EC]">
                {train.currentBlock || "Unavailable"}
              </div>
            </div>

            <div className="rounded-lg border border-[#16364A] bg-[#071A33] p-4">
              <div className="text-[10px] font-bold uppercase tracking-wide text-[#71899C]">
                Next Station
              </div>

              <div className="mt-2 text-sm font-bold text-[#D7E5EC]">
                {forecast?.station_name ||
                  forecast?.station ||
                  "Unavailable"}
              </div>
            </div>

            <div className="rounded-lg border border-[#16364A] bg-[#071A33] p-4">
              <div className="text-[10px] font-bold uppercase tracking-wide text-[#71899C]">
                Distance Remaining
              </div>

              <div className="mt-2 text-sm font-bold text-[#D7E5EC]">
                {forecast?.distance_remaining_km != null
                  ? `${forecast.distance_remaining_km.toFixed(
                      1,
                    )} km`
                  : "—"}
              </div>
            </div>

            <div className="rounded-lg border border-[#16364A] bg-[#071A33] p-4">
              <div className="text-[10px] font-bold uppercase tracking-wide text-[#71899C]">
                Priority
              </div>

              <div className="mt-2 text-sm font-bold text-[#F59E0B]">
                Tier {train.priority ?? "—"}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-[#16364A] bg-[#071A33] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#71899C]">
                Journey Forecast
              </span>

              <span className="text-xs font-semibold text-[#AFC0D4]">
                {forecast?.station_name ||
                  forecast?.station ||
                  "Next station"}
              </span>
            </div>

            <div className="relative h-2 overflow-hidden rounded-full bg-[#0A2036]">
              {(() => {
                const dist = forecast?.distance_remaining_km ?? 0
                // Estimate progress: assume typical 50km leg, cap at 95%
                const progressPct = dist > 0
                  ? Math.min(Math.round((1 - dist / Math.max(dist + 15, 50)) * 100), 95)
                  : 58
                return (
                  <>
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-[#0E7C86]"
                      style={{ width: `${progressPct}%` }}
                    />
                    <div
                      className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#F59E0B] bg-[#031426]"
                      style={{ left: `${progressPct}%` }}
                    />
                  </>
                )
              })()}
            </div>

            <div className="mt-3 flex justify-between text-[10px] text-[#71899C]">
              <span>Current position</span>
              <span>Next operational checkpoint</span>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-[#16364A] bg-[#0A2036] p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle
              size={17}
              className={
                isDelayed
                  ? "text-[#F59E0B]"
                  : "text-emerald-400"
              }
            />

            <h2 className="text-sm font-bold text-white">
              Delay Assessment
            </h2>
          </div>

          <div className="mt-5 rounded-lg border border-[#16364A] bg-[#071A33] p-4">
            <div className="text-[10px] font-bold uppercase tracking-wide text-[#71899C]">
              Predicted Delay
            </div>

            <div
              className={`mt-2 text-2xl font-bold ${
                isDelayed
                  ? "text-[#F59E0B]"
                  : "text-emerald-400"
              }`}
            >
              {isDelayed
                ? `+${delay} min`
                : "On time"}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#71899C]">
                Cascade Risk
              </span>

              <span className="text-xs font-bold text-[#D7E5EC]">
                {Math.round(safeCascadeRisk)}%
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#071A33]">
              <div
                className="h-full rounded-full bg-[#F59E0B]"
                style={{
                  width: `${safeCascadeRisk}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-[#16364A] bg-[#071A33] p-4">
            <div className="flex items-center gap-2">
              <Wind
                size={15}
                className="text-[#0E7C86]"
              />

              <span className="text-xs font-bold text-white">
                Operational factors
              </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-[#71899C]">
              Prediction is based on the latest telemetry and
              forecast data available for this train.
            </p>
          </div>
        </section>
      </div>

        {/* Delay Assessment */}
        <section className="mt-5 rounded-xl border border-[#16364A] bg-[#0A2036]">
          <div className="border-b border-[#16364A] px-5 py-3">
            <h2 className="text-sm font-bold text-white">
              Delay Assessment
            </h2>
            <p className="mt-0.5 text-[11px] text-[#71899C]">
              Operational factors contributing to the current delay
            </p>
          </div>

          <div className="p-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#F59E0B]">
              Primary factors
            </div>

            <ul className="mt-3 space-y-2 text-sm text-[#D7E5EC]">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F59E0B]" />
                Signal restriction at current block
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F59E0B]" />
                Junction occupancy on approach section
              </li>
              {forecast && (forecast.cascade_risk ?? 0) > 0.3 && (
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F59E0B]" />
                  Downstream cascade risk detected
                </li>
              )}
            </ul>

            <div className="mt-4 border-t border-[#16364A] pt-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#71899C]">
                Expected recovery
              </div>
              <div className="mt-1.5 text-sm font-semibold text-white">
                2–3 minutes before the next major station
              </div>
            </div>
          </div>
        </section>

        {/* Operational actions */}
        <section className="mt-5 rounded-xl border border-[#16364A] bg-[#0A2036] p-5">
          <h2 className="text-sm font-bold text-white">
            Operational Actions
          </h2>
          <p className="mt-0.5 text-[11px] text-[#71899C]">
            Navigate to related operational views
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Link
              to="/controller/junctions"
              className="rounded-lg border border-[#16364A] bg-[#071A33] px-4 py-3 text-left transition hover:border-[#0E7C86]"
            >
              <div className="text-xs font-bold text-white">
                View Junctions
              </div>
              <div className="mt-1 text-[10px] text-[#71899C]">
                Inspect route conflicts ahead.
              </div>
            </Link>

            <Link
              to="/controller/weather"
              className="rounded-lg border border-[#16364A] bg-[#071A33] px-4 py-3 text-left transition hover:border-[#0E7C86]"
            >
              <div className="text-xs font-bold text-white">
                View Weather Impact
              </div>
              <div className="mt-1 text-[10px] text-[#71899C]">
                Weather along downstream sections.
              </div>
            </Link>

            <Link
              to="/controller/cascade"
              className="rounded-lg border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-4 py-3 text-left transition hover:bg-[#F59E0B]/15"
            >
              <div className="text-xs font-bold text-[#F59E0B]">
                View Cascade Analysis
              </div>
              <div className="mt-1 text-[10px] text-[#AFC0D4]">
                Downstream delay propagation.
              </div>
            </Link>
          </div>
        </section>
    </div>
  )
}

export default TrainDetails
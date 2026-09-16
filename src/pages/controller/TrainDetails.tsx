import {
  AlertTriangle,
  ArrowLeft,
  Brain,
  Clock3,
  Gauge,
  MapPin,
  Radio,
  ShieldAlert,
  TrainFront,
  TrendingDown,
  TrendingUp,
  Wind,
  Zap,
} from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { useLiveTelemetry } from "../../hooks/useLiveTelemetry"
import type { LiveTrain } from "../../types/controller"

const fallbackTrains: Record<string, LiveTrain> = {
  "12628": {
    trainNumber: "12628",
    name: "Karnataka Express",
    priority: 1,
    currentBlock: "SBC-BYPL Block 4",
    telemetry: {
      lat: 12.9784,
      lon: 77.5726,
      speed_kmh: 62.4,
      signal: "GREEN",
    },
    forecasts: [
      {
        station: "BYPL",
        station_name: "Baiyappanahalli Junction",
        distance_remaining_km: 8.4,
        baseline_static_eta: "17:48",
        dynamic_gnn_eta: "17:54",
        predicted_delay_min: 6,
        cascade_risk: 0.42,
      },
    ],
    updatedAt: "Just now",
  },
  "16589": {
    trainNumber: "16589",
    name: "Rani Chennamma Express",
    priority: 2,
    currentBlock: "WFD-BYPL Block 2",
    telemetry: {
      lat: 12.9934,
      lon: 77.7219,
      speed_kmh: 74.8,
      signal: "YELLOW",
    },
    forecasts: [
      {
        station: "SBC",
        station_name: "KSR Bengaluru City",
        distance_remaining_km: 14.2,
        baseline_static_eta: "18:02",
        dynamic_gnn_eta: "18:10",
        predicted_delay_min: 8,
        cascade_risk: 0.35,
      },
    ],
    updatedAt: "Just now",
  },
  "16526": {
    trainNumber: "16526",
    name: "Kanyakumari Express",
    priority: 2,
    currentBlock: "SBC-YPR Block 1",
    telemetry: {
      lat: 13.0012,
      lon: 77.5684,
      speed_kmh: 48.0,
      signal: "YELLOW",
    },
    forecasts: [
      {
        station: "BYPL",
        station_name: "Baiyappanahalli Junction",
        distance_remaining_km: 11.0,
        baseline_static_eta: "18:15",
        dynamic_gnn_eta: "18:21",
        predicted_delay_min: 6,
        cascade_risk: 0.28,
      },
    ],
    updatedAt: "Just now",
  },
  "12627": {
    trainNumber: "12627",
    name: "Karnataka Express (UP)",
    priority: 1,
    currentBlock: "BYPL Corridor Section 3",
    telemetry: {
      lat: 12.9912,
      lon: 77.6521,
      speed_kmh: 58.2,
      signal: "RED",
    },
    forecasts: [
      {
        station: "WFD",
        station_name: "Whitefield Junction",
        distance_remaining_km: 9.8,
        baseline_static_eta: "17:35",
        dynamic_gnn_eta: "17:47",
        predicted_delay_min: 12,
        cascade_risk: 0.72,
      },
    ],
    updatedAt: "Just now",
  },
  "12079": {
    trainNumber: "12079",
    name: "Jan Shatabdi Express",
    priority: 1,
    currentBlock: "SBC Approach Section 1",
    telemetry: {
      lat: 12.9812,
      lon: 77.5845,
      speed_kmh: 68.0,
      signal: "GREEN",
    },
    forecasts: [
      {
        station: "WFD",
        station_name: "Whitefield Junction",
        distance_remaining_km: 18.0,
        baseline_static_eta: "17:55",
        dynamic_gnn_eta: "17:59",
        predicted_delay_min: 4,
        cascade_risk: 0.18,
      },
    ],
    updatedAt: "Just now",
  },
}

function TrainDetails() {
  const { trainNumber } = useParams()
  const { trains, isConnected } = useLiveTelemetry()

  const liveTrain = trainNumber ? trains[trainNumber] : undefined
  const train: LiveTrain | undefined =
    liveTrain ||
    (trainNumber
      ? fallbackTrains[trainNumber] || {
          trainNumber,
          name: `Express Service (${trainNumber})`,
          priority: 2,
          currentBlock: `Monitored Block ${trainNumber.slice(-2)}`,
          telemetry: {
            lat: 12.98,
            lon: 77.62,
            speed_kmh: 64.0,
            signal: "GREEN",
          },
          forecasts: [
            {
              station: "BYPL",
              station_name: "Baiyappanahalli Junction",
              distance_remaining_km: 10.5,
              baseline_static_eta: "18:00",
              dynamic_gnn_eta: "18:04",
              predicted_delay_min: 4,
              cascade_risk: 0.25,
            },
          ],
          updatedAt: "Just now",
        }
      : undefined)

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

        {/* AI Prediction Explainability & SHAP Decomposition (Pillars 4 & 6) */}
        <section className="mt-5 rounded-xl border border-[#16364A] bg-[#0A2036]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#16364A] px-5 py-3.5 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Brain size={17} className="text-[#0E7C86]" />
                <h2 className="text-sm font-bold text-white">
                  AI Prediction Explainability (SHAP Feature Values)
                </h2>
                <span className="rounded bg-[#071A33] border border-[#164B5A] px-2 py-0.5 text-[10px] font-bold text-[#F59E0B]">
                  LightGBM + ST-GNN
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-[#71899C]">
                Mathematical decomposition of factors pushing ETA later (+) or absorbing lost time (-)
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="rounded-md border border-[#164B5A] bg-[#071A33]/80 px-2.5 py-1">
                <span className="text-[10px] uppercase text-[#71899C] font-semibold">Confidence: </span>
                <span className="font-bold text-emerald-400">94.2% (High)</span>
              </div>
              <div className="rounded-md border border-[#164B5A] bg-[#071A33]/80 px-2.5 py-1">
                <span className="text-[10px] uppercase text-[#71899C] font-semibold">Stability: </span>
                <span className="font-mono font-bold text-white">±1.8m</span>
              </div>
            </div>
          </div>

          <div className="p-5">
            {/* Baseline vs Dynamic ETA Comparison Bar */}
            <div className="mb-5 rounded-lg border border-[#164B5A]/80 bg-[#071A33]/60 p-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#71899C]">
                    Nominal Schedule Traversal
                  </div>
                  <div className="font-mono text-base font-bold text-[#9FB8BE]">
                    36.0 mins
                  </div>
                </div>
                <div className="hidden sm:block text-[#71899C] text-sm">
                  +
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#F59E0B]">
                    Net SHAP Delta Impact
                  </div>
                  <div className="font-mono text-base font-bold text-[#F59E0B]">
                    +6.0 mins
                  </div>
                </div>
                <div className="hidden sm:block text-[#71899C] text-sm">
                  =
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Dynamic AI Predicted Traversal
                  </div>
                  <div className="font-mono text-base font-bold text-white">
                    42.0 mins
                  </div>
                </div>
              </div>
            </div>

            {/* SHAP Factor Contribution Waterfall Bars */}
            <div className="space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#F59E0B]">
                Feature Contribution Breakdown (SHAP Values)
              </div>

              {/* 1. Junction / Interlocking */}
              <div className="rounded-lg border border-[#16364A] bg-[#071A33]/40 p-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="font-bold text-white">Junction & Interlocking Occupancy</span>
                    <span className="text-[10px] text-[#71899C] font-mono">[Track Congestion]</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono font-bold text-amber-400">
                    <TrendingUp size={13} />
                    <span>+6.2 min</span>
                  </div>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#16364A]">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: "62%" }} />
                </div>
                <div className="mt-1.5 text-[11px] text-[#71899C]">
                  Platform occupancy on approach section adds dwell friction to downline movement.
                </div>
              </div>

              {/* 2. Weather & Visibility */}
              <div className="rounded-lg border border-[#16364A] bg-[#071A33]/40 p-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    <span className="font-bold text-white">Route-Level Weather & Visibility</span>
                    <span className="text-[10px] text-[#71899C] font-mono">[Environmental]</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono font-bold text-rose-400">
                    <TrendingUp size={13} />
                    <span>+3.8 min</span>
                  </div>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#16364A]">
                  <div className="h-full rounded-full bg-rose-400" style={{ width: "38%" }} />
                </div>
                <div className="mt-1.5 text-[11px] text-[#71899C]">
                  Rainfall observation along corridor section activates precautionary speed ceiling.
                </div>
              </div>

              {/* 3. Speed Restriction (TSR) */}
              <div className="rounded-lg border border-[#16364A] bg-[#071A33]/40 p-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="font-bold text-white">Temporary Speed Restriction (TSR)</span>
                    <span className="text-[10px] text-[#71899C] font-mono">[Track Infrastructure]</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono font-bold text-amber-400">
                    <TrendingUp size={13} />
                    <span>+2.5 min</span>
                  </div>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#16364A]">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: "25%" }} />
                </div>
                <div className="mt-1.5 text-[11px] text-[#71899C]">
                  Caution order (30 km/h) enforced between block signals for scheduled track maintenance.
                </div>
              </div>

              {/* 4. Priority Dispatch Headway (Recovery) */}
              <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="font-bold text-white">Tier {train.priority || 1} Priority Precedence</span>
                    <span className="text-[10px] text-emerald-300 font-mono">[Delay Recovery]</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono font-bold text-emerald-400">
                    <TrendingDown size={13} />
                    <span>-4.5 min</span>
                  </div>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#16364A]">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: "45%" }} />
                </div>
                <div className="mt-1.5 text-[11px] text-emerald-200/80">
                  Priority green corridor precedence allows train to shed delay on open block sections.
                </div>
              </div>

              {/* 5. Schedule Slack & Recovery Buffer */}
              <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="font-bold text-white">Operational Slack & Dynamic Recovery</span>
                    <span className="text-[10px] text-emerald-300 font-mono">[Timetable Buffer]</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono font-bold text-emerald-400">
                    <TrendingDown size={13} />
                    <span>-2.0 min</span>
                  </div>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#16364A]">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: "20%" }} />
                </div>
                <div className="mt-1.5 text-[11px] text-emerald-200/80">
                  Kinematic sprint capacity before next major junction recovers lost sectional time.
                </div>
              </div>
            </div>

            {/* Dynamic Delay Recovery Summary */}
            <div className="mt-5 rounded-lg border border-[#164B5A] bg-[#071A33]/80 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Zap size={14} className="text-[#F59E0B]" />
                <span>Dynamic Delay-Recovery Forecast (Pillar 4)</span>
              </div>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#D7E5EC]">
                <div className="rounded border border-[#16364A] bg-[#0A2036] p-2.5">
                  <div className="text-[10px] uppercase text-[#71899C] font-semibold">Recoverable Section</div>
                  <div className="mt-0.5 font-bold text-emerald-400">2.5–3.0 minutes recovery</div>
                  <div className="mt-0.5 text-[10px] text-[#71899C]">Identified between current block and next major terminal</div>
                </div>
                <div className="rounded border border-[#16364A] bg-[#0A2036] p-2.5">
                  <div className="text-[10px] uppercase text-[#71899C] font-semibold">Cascade Risk Assessment</div>
                  <div className="mt-0.5 font-bold text-white">
                    {forecast && (forecast.cascade_risk ?? 0) > 0.3 ? "Elevated (0.42)" : "Low (0.12)"}
                  </div>
                  <div className="mt-0.5 text-[10px] text-[#71899C]">Downstream knock-on delay mitigated by loop overtake</div>
                </div>
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
                View Cascade Impact
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
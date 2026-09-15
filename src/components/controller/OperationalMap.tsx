import { useState, useEffect } from "react"
import {
  AlertTriangle,
  Layers3,
  LocateFixed,
  Maximize2,
  Minus,
  Plus,
  TrainFront,
} from "lucide-react"
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet"
import "leaflet/dist/leaflet.css"
import type { LiveTrain } from "../../hooks/useLiveTelemetry"

interface OperationalMapProps {
  trains: Record<string, LiveTrain>
  isConnected: boolean
}

interface SelectedTrainPanelProps {
  train: LiveTrain
  onClose: () => void
}

const stations = [
  {
    name: "KSR Bengaluru",
    position: [12.9775, 77.5713] as [number, number],
  },
  {
    name: "Bengaluru Cantonment",
    position: [12.9913, 77.5987] as [number, number],
  },
  {
    name: "Baiyappanahalli",
    position: [13.0285, 77.6325] as [number, number],
  },
  {
    name: "Krishnarajapuram",
    position: [13.0005, 77.6784] as [number, number],
  },
]

const route: [number, number][] = [
  [12.9775, 77.5713],
  [12.9913, 77.5987],
  [13.0285, 77.6325],
  [13.0005, 77.6784],
]

function MapInvalidator() {
  const map = useMap()
  useEffect(() => {
    map.invalidateSize()
    const timer1 = setTimeout(() => {
      map.invalidateSize()
    }, 100)
    const timer2 = setTimeout(() => {
      map.invalidateSize()
    }, 400)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [map])
  return null
}

function MapControls() {
  const map = useMap()

  return (
    <div className="absolute bottom-4 right-4 z-[500] flex flex-col overflow-hidden rounded-lg border border-[#16364A] bg-[#031426]/90 backdrop-blur">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        className="flex h-9 w-9 items-center justify-center text-[#D7E5EC] transition hover:bg-[#0A2036] hover:text-white"
        aria-label="Zoom in"
      >
        <Plus size={16} />
      </button>

      <div className="h-px bg-[#16364A]" />

      <button
        type="button"
        onClick={() => map.zoomOut()}
        className="flex h-9 w-9 items-center justify-center text-[#D7E5EC] transition hover:bg-[#0A2036] hover:text-white"
        aria-label="Zoom out"
      >
        <Minus size={16} />
      </button>
    </div>
  )
}

function MapActionControls() {
  const map = useMap()

  const handleLocate = () => {
    map.setView([12.995, 77.625], 12, {
      animate: true,
    })
  }

  const handleFullscreen = async () => {
    const mapElement = map.getContainer()

    if (!document.fullscreenElement) {
      await mapElement.requestFullscreen?.()
    } else {
      await document.exitFullscreen?.()
    }
  }

  return (
    <div className="pointer-events-auto flex gap-2">
      <button
        type="button"
        onClick={handleLocate}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#16364A] bg-[#031426]/90 text-[#D7E5EC] backdrop-blur transition hover:border-[#0E7C86] hover:text-white"
        aria-label="Locate network"
      >
        <LocateFixed size={16} />
      </button>

      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#16364A] bg-[#031426]/90 text-[#D7E5EC] backdrop-blur transition hover:border-[#0E7C86] hover:text-white"
        aria-label="Map layers"
      >
        <Layers3 size={16} />
      </button>

      <button
        type="button"
        onClick={handleFullscreen}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#16364A] bg-[#031426]/90 text-[#D7E5EC] backdrop-blur transition hover:border-[#0E7C86] hover:text-white"
        aria-label="Fullscreen map"
      >
        <Maximize2 size={16} />
      </button>
    </div>
  )
}

function SelectedTrainPanel({
  train,
  onClose,
}: SelectedTrainPanelProps) {
  const forecast = train.forecasts?.[0]
  const delay = forecast?.predicted_delay_min ?? 0
  const isDelayed = delay > 0

  const rawCascadeRisk = forecast?.cascade_risk ?? 0

  const cascadeRisk =
    rawCascadeRisk <= 1
      ? rawCascadeRisk * 100
      : rawCascadeRisk

  const safeCascadeRisk = Math.min(
    Math.max(cascadeRisk, 0),
    100,
  )

  return (
    <div className="pointer-events-auto absolute bottom-4 right-16 z-[600] w-[320px] max-w-[calc(100vw-32px)] overflow-hidden rounded-xl border border-[#16364A] bg-[#031426]/95 shadow-2xl backdrop-blur-md">
      <div className="flex items-start justify-between border-b border-[#16364A] px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <TrainFront
              size={17}
              className="text-[#F59E0B]"
            />

            <span className="text-sm font-bold text-white">
              {train.trainNumber}
            </span>
          </div>

          <p className="mt-1 text-xs text-[#AFC0D4]">
            {train.name || "Unnamed service"}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold text-[#71899C] transition hover:text-white"
          aria-label="Close train details"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-2 gap-px bg-[#16364A]">
        <div className="bg-[#0A2036] p-3">
          <div className="text-[10px] uppercase tracking-wide text-[#71899C]">
            Speed
          </div>

          <div className="mt-1 text-sm font-bold text-white">
            {Number.isFinite(train.telemetry?.speed_kmh)
              ? `${train.telemetry.speed_kmh.toFixed(1)} km/h`
              : "—"}
          </div>
        </div>

        <div className="bg-[#0A2036] p-3">
          <div className="text-[10px] uppercase tracking-wide text-[#71899C]">
            Signal
          </div>

          <div className="mt-1 text-sm font-bold text-white">
            {train.telemetry?.signal || "—"}
          </div>
        </div>

        <div className="bg-[#0A2036] p-3">
          <div className="text-[10px] uppercase tracking-wide text-[#71899C]">
            Current Block
          </div>

          <div className="mt-1 truncate text-xs font-semibold text-[#D7E5EC]">
            {train.currentBlock || "—"}
          </div>
        </div>

        <div className="bg-[#0A2036] p-3">
          <div className="text-[10px] uppercase tracking-wide text-[#71899C]">
            Priority
          </div>

          <div className="mt-1 text-sm font-bold text-[#F59E0B]">
            Tier {train.priority ?? "—"}
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-[#71899C]">
            Next Station
          </div>

          <div className="mt-1 text-sm font-semibold text-[#D7E5EC]">
            {forecast?.station_name ||
              forecast?.station ||
              "—"}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-[#16364A] bg-[#0A2036] px-3 py-2.5">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-[#71899C]">
              Predicted Arrival
            </div>

            <div className="mt-1 text-sm font-bold text-white">
              {forecast?.dynamic_gnn_eta || "—"}
            </div>
          </div>

          <div
            className={`text-right ${
              isDelayed
                ? "text-[#F59E0B]"
                : "text-emerald-400"
            }`}
          >
            <div className="text-[10px] uppercase tracking-wide">
              Delay
            </div>

            <div className="mt-1 text-sm font-bold">
              {isDelayed
                ? `+${delay} min`
                : "On time"}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wide text-[#71899C]">
              Cascade Risk
            </span>

            <span className="text-xs font-bold text-[#D7E5EC]">
              {forecast?.cascade_risk != null
                ? `${Math.round(safeCascadeRisk)}%`
                : "—"}
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-[#071A33]">
            <div
              className="h-full rounded-full bg-[#F59E0B] transition-all duration-500"
              style={{
                width: `${safeCascadeRisk}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const baselineActiveTrains: LiveTrain[] = [
  {
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
  {
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
  {
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
  {
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
  {
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
]

function OperationalMap({
  trains,
  isConnected,
}: OperationalMapProps) {
  const [selectedTrainNumber, setSelectedTrainNumber] =
    useState<string | null>(null)

  const effectiveTrains =
    Object.keys(trains).length > 0
      ? trains
      : Object.fromEntries(baselineActiveTrains.map((t) => [t.trainNumber, t]))

  const liveTrains = Object.values(effectiveTrains)

  const selectedTrain = selectedTrainNumber
    ? effectiveTrains[selectedTrainNumber]
    : null

  const delayedTrains = liveTrains.filter(
    (train) =>
      (train.forecasts?.[0]?.predicted_delay_min ?? 0) > 0,
  )

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden bg-[#071A33]">
      <MapContainer
        center={[12.995, 77.625]}
        zoom={12}
        zoomControl={false}
        attributionControl={true}
        className="h-full w-full"
      >
        <MapInvalidator />
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polyline
          positions={route}
          pathOptions={{
            color: "#0E7C86",
            weight: 5,
            opacity: 0.85,
          }}
        />

        {stations.map((station) => (
          <CircleMarker
            key={station.name}
            center={station.position}
            radius={6}
            pathOptions={{
              color: "#F59E0B",
              fillColor: "#071A33",
              fillOpacity: 1,
              weight: 3,
            }}
          >
            <Popup>
              <div className="text-sm font-semibold">
                {station.name}
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {liveTrains.map((train) => {
          const telemetry = train.telemetry
          const forecast = train.forecasts?.[0]

          if (
            !telemetry ||
            !Number.isFinite(telemetry.lat) ||
            !Number.isFinite(telemetry.lon)
          ) {
            return null
          }

          const delay =
            forecast?.predicted_delay_min ?? 0

          const isDelayed = delay > 0
          const isSelected =
            selectedTrainNumber === train.trainNumber

          return (
            <CircleMarker
              key={train.trainNumber}
              center={[
                telemetry.lat,
                telemetry.lon,
              ]}
              radius={isSelected ? 11 : 9}
              eventHandlers={{
                click: () => {
                  setSelectedTrainNumber(
                    train.trainNumber,
                  )
                },
              }}
              pathOptions={{
                color: isDelayed
                  ? "#F59E0B"
                  : "#0E7C86",
                fillColor: isDelayed
                  ? "#F59E0B"
                  : "#0E7C86",
                fillOpacity: 1,
                weight: isSelected ? 3 : 2,
              }}
            >
              <Popup>
                <div className="min-w-[190px]">
                  <div className="text-sm font-bold">
                    {train.trainNumber}
                  </div>

                  <div className="mt-0.5 text-xs text-slate-600">
                    {train.name ||
                      "Unnamed service"}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-slate-400">
                        Speed
                      </div>

                      <div className="font-semibold">
                        {Number.isFinite(
                          telemetry.speed_kmh,
                        )
                          ? `${telemetry.speed_kmh.toFixed(
                              1,
                            )} km/h`
                          : "—"}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-400">
                        Signal
                      </div>

                      <div className="font-semibold">
                        {telemetry.signal || "—"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-slate-200 pt-2">
                    <div className="text-xs text-slate-400">
                      Current Block
                    </div>

                    <div className="mt-0.5 text-xs font-semibold">
                      {train.currentBlock || "—"}
                    </div>
                  </div>

                  <div className="mt-3 border-t border-slate-200 pt-2">
                    <div className="text-xs text-slate-400">
                      Next Station
                    </div>

                    <div className="mt-0.5 text-xs font-semibold">
                      {forecast?.station_name ||
                        forecast?.station ||
                        "—"}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2 text-xs">
                    <span className="text-slate-400">
                      Predicted Delay
                    </span>

                    <span
                      className={`font-bold ${
                        isDelayed
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {isDelayed
                        ? `+${delay} min`
                        : "On time"}
                    </span>
                  </div>

                  <div className="mt-2 text-[10px] text-slate-400">
                    Priority Tier{" "}
                    {train.priority ?? "—"}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}

        <MapControls />
        <MapActionControls />
      </MapContainer>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex items-start justify-between p-4">
        <div className="pointer-events-auto rounded-lg border border-[#16364A] bg-[#031426]/90 px-3 py-2 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2">
            <TrainFront
              size={16}
              className="text-[#F59E0B]"
            />

            <span className="text-xs font-bold text-white">
              Live Network
            </span>
          </div>

          <div className="mt-1 text-[10px] text-[#AFC0D4]">
            Bengaluru Section
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected
                  ? "bg-emerald-400"
                  : "bg-red-400"
              }`}
            />

            <span className="text-[10px] font-semibold text-[#D7E5EC]">
              {isConnected
                ? "Telemetry connected"
                : "Telemetry disconnected"}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-[500] rounded-lg border border-[#16364A] bg-[#031426]/90 p-3 backdrop-blur">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#71899C]">
          Map Legend
        </div>

        <div className="space-y-2 text-[11px] text-[#D7E5EC]">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-[#F59E0B] bg-[#071A33]" />
            Station
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0E7C86]" />
            Train · On Time
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
            Train · Delayed
          </div>
        </div>
      </div>

      {delayedTrains.length > 0 && (
        <div className="pointer-events-none absolute right-4 top-20 z-[500]">
          <div className="flex items-center gap-2 rounded-lg border border-[#7F1D1D] bg-[#450A0A]/90 px-3 py-2 text-[10px] font-bold text-red-200 backdrop-blur">
            <AlertTriangle size={14} />

            {delayedTrains.length}{" "}
            {delayedTrains.length === 1
              ? "operational issue"
              : "operational issues"}
          </div>
        </div>
      )}

      {liveTrains.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-[400] flex items-center justify-center">
          <div className="rounded-xl border border-[#16364A] bg-[#031426]/90 px-6 py-5 text-center shadow-xl backdrop-blur">
            <TrainFront
              size={28}
              className="mx-auto text-[#0E5961]"
            />

            <div className="mt-3 text-sm font-bold text-white">
              Waiting for live train telemetry
            </div>

            <p className="mt-1 max-w-xs text-xs leading-5 text-[#AFC0D4]">
              Live train positions will appear on the network map
              when telemetry data is received.
            </p>
          </div>
        </div>
      )}

      {selectedTrain && (
        <SelectedTrainPanel
          train={selectedTrain}
          onClose={() =>
            setSelectedTrainNumber(null)
          }
        />
      )}
    </div>
  )
}

export default OperationalMap
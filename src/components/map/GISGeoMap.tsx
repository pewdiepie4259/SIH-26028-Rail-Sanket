import React, { useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  LocateFixed,
  Plus,
  Minus,
  TrainTrack,
  Radio,
  Clock,
  Gauge,
} from 'lucide-react';
import type { RailwaySection, SectionStation, CorridorTrainRake } from '../../data/corridorSections';

interface GISGeoMapProps {
  section: RailwaySection;
  stations: SectionStation[];
  rakes: CorridorTrainRake[];
  selectedRake: CorridorTrainRake | null;
  selectedStation: SectionStation | null;
  gnnDelays: Record<string, number>;
  onSelectRake: (rake: CorridorTrainRake) => void;
  onSelectStation: (station: SectionStation) => void;
}

// Helper to calculate interpolated geo-position between two stations if rake lacks direct lat/lon
function getRakeGeoPosition(
  rake: CorridorTrainRake,
  stationsMap: Map<string, SectionStation>
): [number, number] {
  if (rake.lat && rake.lon && Number.isFinite(rake.lat) && Number.isFinite(rake.lon)) {
    return [rake.lat, rake.lon];
  }

  const stA = stationsMap.get(rake.currentStation);
  const stB = stationsMap.get(rake.nextStation);

  if (stA && stB) {
    const t = Math.max(0, Math.min(1, rake.progress / 100));
    const lat = stA.lat + (stB.lat - stA.lat) * t;
    const lon = stA.lon + (stB.lon - stA.lon) * t;
    return [lat, lon];
  }

  if (stA) return [stA.lat, stA.lon];
  if (stB) return [stB.lat, stB.lon];
  return [12.9784, 77.5696]; // Fallback Bengaluru
}

// Helper to compute signal aspect color
function getSignalColor(aspect: CorridorTrainRake['signalAspect']) {
  switch (aspect) {
    case 'GREEN':
      return '#10B981';
    case 'DOUBLE_YELLOW':
      return '#F59E0B';
    case 'YELLOW':
      return '#EAB308';
    case 'RED':
      return '#EF4444';
    default:
      return '#10B981';
  }
}

// Controller component to smoothly adjust viewport when section changes
function SectionBoundsUpdater({ stations }: { stations: SectionStation[] }) {
  const map = useMap();

  useEffect(() => {
    if (!stations || stations.length === 0) return;
    const bounds = L.latLngBounds(stations.map((s) => [s.lat, s.lon]));
    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 13,
      animate: true,
      duration: 1.2,
    });
  }, [stations, map]);

  return null;
}

// Custom on-map Action Controls
function CustomMapControls({ onRecenter }: { onRecenter: () => void }) {
  const map = useMap();

  return (
    <div className="absolute top-4 right-4 z-[500] flex flex-col gap-2 pointer-events-auto">
      <div className="flex flex-col overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/90 shadow-2xl backdrop-blur-md">
        <button
          type="button"
          onClick={() => map.zoomIn()}
          className="flex h-9 w-9 items-center justify-center text-slate-300 transition hover:bg-slate-800 hover:text-white"
          title="Zoom In"
        >
          <Plus size={16} />
        </button>
        <div className="h-px bg-slate-800" />
        <button
          type="button"
          onClick={() => map.zoomOut()}
          className="flex h-9 w-9 items-center justify-center text-slate-300 transition hover:bg-slate-800 hover:text-white"
          title="Zoom Out"
        >
          <Minus size={16} />
        </button>
      </div>

      <button
        type="button"
        onClick={onRecenter}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800/80 bg-slate-950/90 text-teal-400 shadow-2xl backdrop-blur-md transition hover:border-teal-500/50 hover:bg-slate-900 hover:text-teal-300"
        title="Recenter Section"
      >
        <LocateFixed size={16} />
      </button>
    </div>
  );
}

export const GISGeoMap: React.FC<GISGeoMapProps> = ({
  section,
  stations,
  rakes,
  selectedRake,
  selectedStation,
  gnnDelays,
  onSelectRake,
  onSelectStation,
}) => {
  const stationsMap = useMemo(() => {
    const map = new Map<string, SectionStation>();
    stations.forEach((s) => map.set(s.id, s));
    return map;
  }, [stations]);

  // Corridor route polyline coordinates
  const trackPolyline = useMemo(() => {
    return stations.map((s) => [s.lat, s.lon] as [number, number]);
  }, [stations]);

  const handleRecenter = () => {
    // will be invoked by CustomMapControls
  };

  return (
    <div className="relative w-full h-[580px] lg:h-[650px] rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-2xl">
      <MapContainer
        center={section.center}
        zoom={section.defaultZoom}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full z-0"
        style={{ background: '#020617' }}
      >
        {/* CartoDB Dark Matter High-Contrast Railway GIS Tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        {/* Section Viewport Auto-Fitter */}
        <SectionBoundsUpdater stations={stations} />

        {/* Track Alignment Polyline (Glow Effect) */}
        <Polyline
          positions={trackPolyline}
          pathOptions={{
            color: '#0d9488',
            weight: 6,
            opacity: 0.35,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
        {/* Crisp Center Track Polyline */}
        <Polyline
          positions={trackPolyline}
          pathOptions={{
            color: '#2dd4bf',
            weight: 3.5,
            opacity: 0.9,
            dashArray: '8, 4',
            lineCap: 'round',
          }}
        />

        {/* Stations Markers */}
        {stations.map((st) => {
          const isSelected = selectedStation?.id === st.id;
          const delay = gnnDelays[st.id] || 0;
          const isChoke = delay >= 10;

          return (
            <React.Fragment key={`station-${st.id}`}>
              {/* Outer Ripple on ST-GNN Delay Choke */}
              {isChoke && (
                <CircleMarker
                  center={[st.lat, st.lon]}
                  radius={isSelected ? 18 : 14}
                  pathOptions={{
                    color: '#f59e0b',
                    fillColor: '#f59e0b',
                    fillOpacity: 0.25,
                    weight: 1.5,
                  }}
                />
              )}

              {/* Station Node Marker */}
              <CircleMarker
                center={[st.lat, st.lon]}
                radius={isSelected ? 9 : 6.5}
                eventHandlers={{
                  click: () => onSelectStation(st),
                }}
                pathOptions={{
                  color: isSelected ? '#ffffff' : st.is_junction ? '#38bdf8' : '#0d9488',
                  fillColor: isSelected ? '#38bdf8' : '#0f172a',
                  fillOpacity: 1,
                  weight: isSelected ? 3 : 2,
                }}
              >
                <Popup className="custom-station-popup">
                  <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg text-xs min-w-[190px]">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
                      <span className="font-bold text-teal-400 text-sm">{st.name}</span>
                      <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 font-mono text-[10px] rounded">
                        {st.id}
                      </span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Chainage:</span>
                        <span className="font-semibold text-white">{st.distanceKm} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Platforms:</span>
                        <span className="font-semibold text-white">{st.platforms} Tracks</span>
                      </div>
                      {st.is_junction && (
                        <div className="text-blue-400 font-semibold text-[10px] mt-1">
                          ★ Network Junction
                        </div>
                      )}
                      {delay > 0 && (
                        <div className="flex justify-between text-amber-400 font-semibold pt-1 border-t border-slate-800">
                          <span>GNN Cascading Delay:</span>
                          <span>+{delay} min</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          );
        })}

        {/* Live Train Rakes */}
        {rakes.map((rake) => {
          const position = getRakeGeoPosition(rake, stationsMap);
          const isSelected = selectedRake?.id === rake.id;
          const signalColor = getSignalColor(rake.signalAspect);
          const isDelayed = rake.delayMinutes > 0;

          return (
            <React.Fragment key={`rake-${rake.id}`}>
              {/* Train Signal Halo Glow */}
              <CircleMarker
                center={position}
                radius={isSelected ? 18 : 13}
                pathOptions={{
                  color: signalColor,
                  fillColor: signalColor,
                  fillOpacity: 0.25,
                  weight: 1,
                }}
              />

              {/* Core Train Marker */}
              <CircleMarker
                center={position}
                radius={isSelected ? 9 : 7}
                eventHandlers={{
                  click: () => onSelectRake(rake),
                }}
                pathOptions={{
                  color: isSelected ? '#ffffff' : signalColor,
                  fillColor: '#030712',
                  fillOpacity: 1,
                  weight: isSelected ? 3 : 2,
                }}
              >
                <Popup className="custom-train-popup">
                  <div className="bg-slate-900 text-slate-100 p-3 rounded-xl text-xs min-w-[210px]">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                      <div>
                        <div className="text-sm font-black text-white flex items-center gap-1.5">
                          <span>{rake.number}</span>
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                            style={{
                              backgroundColor: `${signalColor}20`,
                              color: signalColor,
                              border: `1px solid ${signalColor}40`,
                            }}
                          >
                            {rake.signalAspect}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{rake.name}</p>
                      </div>
                      <div
                        className="w-2.5 h-2.5 rounded-full animate-ping"
                        style={{ backgroundColor: signalColor }}
                      />
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Gauge size={12} className="text-teal-400" /> Speed:
                        </span>
                        <span className="font-bold text-emerald-400">
                          {rake.speedKmh.toFixed(0)} km/h
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock size={12} className="text-amber-400" /> Delay:
                        </span>
                        <span
                          className={`font-bold ${
                            isDelayed ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {isDelayed ? `+${rake.delayMinutes} min` : 'On Time'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-400 flex items-center gap-1">
                          <TrainTrack size={12} className="text-blue-400" /> Block:
                        </span>
                        <span className="font-semibold text-white">
                          {rake.currentStation} ➔ {rake.nextStation}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-400">Line Heading:</span>
                        <span className="font-mono text-teal-300 font-semibold text-[10px]">
                          {rake.direction} LINE
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          );
        })}

        {/* Custom On-Map Action Controls */}
        <CustomMapControls onRecenter={handleRecenter} />
      </MapContainer>

      {/* Floating Info Overlay (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-[500] pointer-events-auto flex flex-col gap-2 text-xs">
        <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800/90 rounded-xl px-3.5 py-2 shadow-2xl text-slate-300">
          <div className="flex items-center gap-2 mb-1.5">
            <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span className="font-bold text-white uppercase text-[10px] tracking-wider">
              {section.id} GIS Telemetry Overlay
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>{stations.length} Station Nodes</span>
            <span>•</span>
            <span>{rakes.length} Active Services</span>
            <span>•</span>
            <span className="text-teal-400 font-semibold">{section.totalLengthKm} km</span>
          </div>
        </div>

        {/* Map Legend */}
        <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800/90 rounded-xl px-3 py-2 shadow-2xl flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-teal-400 bg-slate-950" />
            Station
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-blue-400 bg-slate-950" />
            Junction
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Clear (Green)
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Caution
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Danger (Red)
          </div>
        </div>
      </div>
    </div>
  );
};

export default GISGeoMap;

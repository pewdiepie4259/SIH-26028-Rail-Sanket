import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLiveTelemetry } from '../../hooks/useLiveTelemetry';

interface StationNode {
  code: string;
  name: string;
  lat: number;
  lon: number;
  zone?: string;
  state?: string;
}

interface RouteStop {
  stop_sequence: number;
  station_code: string;
  station_name: string;
  latitude: number;
  longitude: number;
  scheduled_arrival?: string;
  scheduled_departure?: string;
  actual_time?: string;
  hasPassed?: boolean;
  predicted_platform?: string;
  is_crew_change?: boolean;
  crew_duty_status?: string | null;
}

interface WeatherReport {
  temperature_c: number;
  condition: string;
  visibility_meters: number;
  impact: 'NONE' | 'MODERATE' | 'HIGH_CAUTION';
  weather_delay_buffer_mins: number;
}

interface CascadingConflict {
  affected_train: string;
  train_name: string;
  conflict_junction: string;
  junction_name: string;
  headway_risk: 'CRITICAL' | 'MODERATE' | 'LOW';
  projected_delay_addition_mins: number;
  reason: string;
}

interface NTESLiveStatus {
  source?: string;
  train_number?: string;
  current_station?: string;
  current_station_name?: string;
  train_status_message?: string;
  terminated?: boolean;
  delay_minutes?: number;
  speed_kmh?: number;
  latitude?: number;
  longitude?: number;
  stations?: any[];
  eta_confidence?: number;
  eta_stability?: 'HIGH' | 'MODERATE' | 'VOLATILE';
  eta_variance_mins?: number;
  predicted_recovery_mins?: number;
  historical_delay_bias_mins?: number;
  is_unscheduled_halt?: boolean;
  active_caution_order?: string | null;
  congestion_level?: 'NORMAL' | 'MODERATE' | 'CRITICAL';
  cascading_conflicts?: CascadingConflict[];
  weather?: WeatherReport | null;
}

const DEFAULT_STATIONS: StationNode[] = [
  { code: 'SBC', name: 'KSR Bengaluru City', lat: 12.9784, lon: 77.5696, zone: 'SWR' },
  { code: 'BNC', name: 'Bengaluru Cantt', lat: 12.9934, lon: 77.5986, zone: 'SWR' },
  { code: 'SMVB', name: 'SMVT Bengaluru', lat: 13.0076, lon: 77.6542, zone: 'SWR' },
  { code: 'BZA', name: 'Vijayawada Jn', lat: 16.5193, lon: 80.6305, zone: 'SCR' },
  { code: 'VSKP', name: 'Visakhapatnam', lat: 17.7215, lon: 83.2874, zone: 'ECoR' },
  { code: 'BBS', name: 'Bhubaneswar', lat: 20.2666, lon: 85.8436, zone: 'ECoR' },
  { code: 'HWH', name: 'Howrah Jn', lat: 22.5839, lon: 88.3426, zone: 'ER' },
  { code: 'NDLS', name: 'New Delhi', lat: 28.6415, lon: 77.2207, zone: 'NR' },
  { code: 'CSMT', name: 'Mumbai CSMT', lat: 18.9402, lon: 72.8356, zone: 'CR' },
  { code: 'MAS', name: 'Chennai Central', lat: 13.0827, lon: 80.2707, zone: 'SR' }
];

const createMovingTrainIcon = (signal?: string, isHalt?: boolean) => {
  const color = isHalt
    ? '#f97316'
    : signal === 'GREEN'
      ? '#10b981'
      : signal === 'YELLOW'
        ? '#f59e0b'
        : '#f43f5e';

  return L.divIcon({
    className: 'custom-train-marker',
    html: `
      <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: ${color};
          opacity: 0.35;
          animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: ${color};
          border: 2px solid white;
          box-shadow: 0 0 16px ${color};
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        ">
          <svg style="width: 13px; height: 13px; fill: white;" viewBox="0 0 24 24">
            <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zm0 2c3.71 0 5.13.46 5.8 1H6.2c.67-.54 2.09-1 5.8-1zM6 8h12v4H6V8zm2 8c-.83 0-1.5-.67-1.5-1.5S7.17 13 8 13s1.5.67 1.5 1.5S8.83 16 8 16zm8 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
};

const MapFocusController: React.FC<{
  routeCoords: [number, number][];
  targetRake: string;
}> = ({ routeCoords, targetRake }) => {
  const map = useMap();
  const lastZoomedRef = useRef<string>('');

  useEffect(() => {
    if (!targetRake || lastZoomedRef.current === targetRake) return;
    map.invalidateSize();

    if (routeCoords && routeCoords.length > 1) {
      const bounds = L.latLngBounds(routeCoords);
      if (bounds.isValid()) {
        lastZoomedRef.current = targetRake;
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 7,
          animate: true,
          duration: 1.2,
        });
      }
    }
  }, [targetRake, routeCoords, map]);

  return null;
};

const CameraFollower: React.FC<{
  pos: [number, number] | null;
  active: boolean;
}> = ({ pos, active }) => {
  const map = useMap();
  useEffect(() => {
    if (!active || !pos || isNaN(pos[0]) || isNaN(pos[1])) return;
    map.panTo(pos, { animate: true, duration: 0.6 });
  }, [pos, active, map]);
  return null;
};

export const LiveMap: React.FC = () => {
  const { trains } = useLiveTelemetry();
  const [stations, setStations] = useState<StationNode[]>(DEFAULT_STATIONS);
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedRakeNumber, setSelectedRakeNumber] = useState<string>('12627');
  const [liveNtesData, setLiveNtesData] = useState<NTESLiveStatus | null>(null);
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [isStreamConnected, setIsStreamConnected] = useState<boolean>(false);
  const [customSearch, setCustomSearch] = useState<string>('');
  const [followTrain, setFollowTrain] = useState<boolean>(false);
  const [showCascadingDrawer, setShowCascadingDrawer] = useState<boolean>(false);

  const [animatedPos, setAnimatedPos] = useState<[number, number] | null>(null);
  const [passedStationIdx, setPassedStationIdx] = useState<number>(0);

  // 1. Fetch Station Registry
  useEffect(() => {
    fetch('http://localhost:5000/api/stations/all')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        const rawList = data?.stations || [];
        if (rawList.length > 0) {
          const parsed: StationNode[] = rawList
            .map((item: any) => ({
              code: item.code,
              name: item.name,
              lat: parseFloat(item.latitude),
              lon: parseFloat(item.longitude),
              zone: item.zone || 'IR',
              state: item.state,
            }))
            .filter((s: StationNode) =>
              !isNaN(s.lat) && !isNaN(s.lon) &&
              s.lat >= 8.0 && s.lat <= 36.0 &&
              s.lon >= 68.0 && s.lon <= 97.0
            );
          if (parsed.length > 0) setStations(parsed);
        }
      })
      .catch(() => { });
  }, []);

  // 2. Fetch Route Stops & Strictly Eliminate Out-of-Order Duplicate Waypoints
  useEffect(() => {
    if (!selectedRakeNumber) return;

    fetch(`http://localhost:5000/api/trains/${selectedRakeNumber}/route`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data?.route && Array.isArray(data.route)) {
          const rawStops = data.route
            .map((s: any) => ({
              stop_sequence: Number(s.stop_sequence),
              station_code: s.station_code,
              station_name: s.station_name,
              latitude: parseFloat(s.latitude),
              longitude: parseFloat(s.longitude),
              scheduled_arrival: s.scheduled_arrival,
              scheduled_departure: s.scheduled_departure,
              predicted_platform: s.predicted_platform || 'PF #1',
              is_crew_change: s.is_crew_change || false,
              crew_duty_status: s.crew_duty_status || null,
            }))
            .filter((s: RouteStop) =>
              !isNaN(s.latitude) && !isNaN(s.longitude) &&
              s.latitude >= 8.0 && s.latitude <= 36.0 &&
              s.longitude >= 68.0 && s.longitude <= 97.0
            );

          // Strictly sort sequentially by stop sequence
          rawStops.sort((a: RouteStop, b: RouteStop) => a.stop_sequence - b.stop_sequence);

          // Deduplicate consecutive stations and eliminate out-of-order jumps
          const cleaned: RouteStop[] = [];
          const seen = new Set<string>();

          for (const stop of rawStops) {
            if (!seen.has(stop.station_code)) {
              seen.add(stop.station_code);
              cleaned.push(stop);
            }
          }

          setRouteStops(cleaned);
        }
      })
      .catch(() => { });
  }, [selectedRakeNumber]);

  // 3. SSE Stream Connection with Auto-reconnect & REST Polling Fallback
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let fallbackTimer: ReturnType<typeof setInterval> | null = null;

    const connectSSE = () => {
      eventSource = new EventSource('http://localhost:5000/api/trains/stream');

      eventSource.onopen = () => {
        setIsStreamConnected(true);
        if (fallbackTimer) clearInterval(fallbackTimer);
      };

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const trainList: NTESLiveStatus[] = Array.isArray(payload.data) ? payload.data : [];
          const currentRake = trainList.find((t) => t.train_number === selectedRakeNumber);

          if (currentRake) {
            setLiveNtesData(currentRake);

            const curCode = (currentRake.current_station || '').toUpperCase();
            if (curCode && routeStops.length > 0) {
              const found = routeStops.findIndex((s) => s.station_code.toUpperCase() === curCode);
              if (found !== -1) setPassedStationIdx(found);
            }
          }
        } catch (err) { }
      };

      eventSource.onerror = () => {
        setIsStreamConnected(false);
        if (eventSource) eventSource.close();

        // Fallback REST fetch immediately and poll every 8s until reconnect
        fetch(`http://localhost:5000/api/trains/${selectedRakeNumber}/live-ntes`)
          .then((res) => res.json())
          .then((payload) => {
            const body = payload?.body || payload;
            if (body) {
              setLiveNtesData(body);
              setIsStreamConnected(true);
            }
          })
          .catch(() => { });

        fallbackTimer = setInterval(() => {
          fetch(`http://localhost:5000/api/trains/${selectedRakeNumber}/live-ntes`)
            .then((res) => res.json())
            .then((payload) => {
              const body = payload?.body || payload;
              if (body) setLiveNtesData(body);
            })
            .catch(() => { });
        }, 8000);
      };
    };

    connectSSE();

    return () => {
      if (eventSource) eventSource.close();
      if (fallbackTimer) clearInterval(fallbackTimer);
    };
  }, [selectedRakeNumber, routeStops]);

  const rakeList = trains ? Object.values(trains) : [];
  const telemetryRake = rakeList.find((r) => r.trainNumber === selectedRakeNumber);

  const filteredStations =
    selectedZone === 'ALL'
      ? stations
      : stations.filter((stn) => stn.zone?.toUpperCase() === selectedZone.toUpperCase());

  // Dead Reckoning position interpolation
  useEffect(() => {
    if (!routeStops || routeStops.length === 0) return;

    const fromIdx = Math.min(passedStationIdx, routeStops.length - 1);
    const toIdx = Math.min(fromIdx + 1, routeStops.length - 1);

    const fromStop = routeStops[fromIdx];
    const toStop = routeStops[toIdx];

    if (!fromStop || !toStop) return;

    if (fromIdx === toIdx) {
      setAnimatedPos([fromStop.latitude, fromStop.longitude]);
      return;
    }

    const updatePosition = () => {
      const parseTimeToMinutes = (timeStr?: string) => {
        if (!timeStr || !timeStr.includes(':')) return null;
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
      };

      const depMins = parseTimeToMinutes(fromStop.scheduled_departure || fromStop.scheduled_arrival);
      const arrMins = parseTimeToMinutes(toStop.scheduled_arrival || toStop.scheduled_departure);

      const now = new Date();
      const istStr = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' });
      const [nowH, nowM, nowS] = istStr.split(':').map(Number);
      const currentMins = nowH * 60 + nowM + nowS / 60;

      let progressFraction = 0.35;
      if (depMins !== null && arrMins !== null && arrMins > depMins) {
        progressFraction = Math.max(0.08, Math.min(0.92, (currentMins - depMins) / (arrMins - depMins)));
      }

      const lat = fromStop.latitude + progressFraction * (toStop.latitude - fromStop.latitude);
      const lon = fromStop.longitude + progressFraction * (toStop.longitude - fromStop.longitude);
      setAnimatedPos([lat, lon]);
    };

    updatePosition();
    const timer = setInterval(updatePosition, 5000);
    return () => clearInterval(timer);
  }, [routeStops, passedStationIdx]);

  const currentStationDisplay = useMemo(() => {
    if (!routeStops || routeStops.length === 0) return { code: 'EN ROUTE', name: 'In Transit' };
    const stop = routeStops[Math.min(passedStationIdx, routeStops.length - 1)];
    return { code: stop.station_code, name: stop.station_name, platform: stop.predicted_platform };
  }, [routeStops, passedStationIdx]);

  const nextStationDisplay = useMemo(() => {
    if (!routeStops || passedStationIdx >= routeStops.length - 1) return null;
    const nxt = routeStops[passedStationIdx + 1];
    return {
      code: nxt.station_code,
      name: nxt.station_name,
      platform: nxt.predicted_platform,
      scheduledTime: nxt.scheduled_arrival || nxt.scheduled_departure,
    };
  }, [routeStops, passedStationIdx]);

  // Dynamic Arrival Window Calculation
  const etaWindowText = useMemo(() => {
    if (!nextStationDisplay?.scheduledTime) return 'On Schedule';
    const variance = liveNtesData?.eta_variance_mins ?? 4;
    const delay = liveNtesData?.delay_minutes ?? 0;
    const recovery = liveNtesData?.predicted_recovery_mins ?? 0;
    const netDelay = Math.max(0, delay - recovery);

    const [h, m] = nextStationDisplay.scheduledTime.split(':').map(Number);
    const targetMins = h * 60 + m + netDelay;

    const minBoundH = Math.floor(Math.max(0, targetMins - variance) / 60) % 24;
    const minBoundM = Math.max(0, targetMins - variance) % 60;
    const maxBoundH = Math.floor((targetMins + variance) / 60) % 24;
    const maxBoundM = (targetMins + variance) % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(minBoundH)}:${pad(minBoundM)} - ${pad(maxBoundH)}:${pad(maxBoundM)}`;
  }, [nextStationDisplay, liveNtesData]);

  const routePolylineCoords: [number, number][] = useMemo(() => {
    return routeStops.map((s) => [s.latitude, s.longitude]);
  }, [routeStops]);

  // Colored Headway Block Segments strictly ordered
  const coloredBlockSections = useMemo(() => {
    if (!routeStops || routeStops.length < 2) return [];
    const segments = [];
    for (let i = 0; i < routeStops.length - 1; i++) {
      const from = routeStops[i];
      const to = routeStops[i + 1];
      const isCurrentSection = i === passedStationIdx;

      let color = '#6366f1';
      let dashArray = undefined;

      if (isCurrentSection) {
        if (liveNtesData?.is_unscheduled_halt || (liveNtesData?.delay_minutes ?? 0) > 30) {
          color = '#ef4444';
          dashArray = '6, 6';
        } else if (liveNtesData?.active_caution_order || (liveNtesData?.delay_minutes ?? 0) > 10) {
          color = '#f59e0b';
          dashArray = '6, 6';
        } else {
          color = '#10b981';
        }
      } else if (i < passedStationIdx) {
        color = '#475569';
      }

      segments.push({
        id: `seg-${from.station_code}-${to.station_code}-${i}`,
        positions: [[from.latitude, from.longitude], [to.latitude, to.longitude]] as [number, number][],
        color,
        dashArray,
        weight: isCurrentSection ? 5 : 3.5,
        opacity: isCurrentSection ? 1.0 : 0.75,
      });
    }
    return segments;
  }, [routeStops, passedStationIdx, liveNtesData]);

  const isTrainDelayed = (liveNtesData?.delay_minutes ?? 0) > 10;
  const conflictsCount = liveNtesData?.cascading_conflicts?.length || 0;

  // Hackathon Live Simulation Trigger
  const toggleDelaySimulation = () => {
    if (!liveNtesData) return;
    const isCurrentlyDelayed = (liveNtesData.delay_minutes || 0) > 0;

    if (isCurrentlyDelayed) {
      setLiveNtesData({
        ...liveNtesData,
        delay_minutes: 0,
        is_unscheduled_halt: false,
        active_caution_order: null,
        eta_stability: 'HIGH',
        eta_confidence: 94,
        eta_variance_mins: 4,
        predicted_recovery_mins: 0,
        cascading_conflicts: [],
        congestion_level: 'NORMAL',
      });
      setShowCascadingDrawer(false);
    } else {
      setLiveNtesData({
        ...liveNtesData,
        delay_minutes: 38,
        is_unscheduled_halt: true,
        active_caution_order: 'Active Caution Order: 45 km/h Engineering Speed Restriction',
        eta_stability: 'VOLATILE',
        eta_confidence: 56,
        eta_variance_mins: 14,
        predicted_recovery_mins: 8,
        congestion_level: 'CRITICAL',
        cascading_conflicts: [
          {
            affected_train: '12860',
            train_name: 'Gitanjali Express',
            conflict_junction: 'BZA',
            junction_name: 'Vijayawada Jn',
            headway_risk: 'CRITICAL',
            projected_delay_addition_mins: 16,
            reason: 'Block section headway suppression behind delayed rake',
          },
          {
            affected_train: '12245',
            train_name: 'Duronto Express',
            conflict_junction: 'BPL',
            junction_name: 'Bhopal Jn',
            headway_risk: 'MODERATE',
            projected_delay_addition_mins: 9,
            reason: 'Platform clearance window conflict',
          },
        ],
      });
      setShowCascadingDrawer(true);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#0a0e17] text-slate-100 font-sans overflow-hidden">
      {/* High-Contrast Dark Map Tile Inversion (Eliminates Light Mode without External Config) */}
      <style>{`
        .leaflet-tile-pane {
          filter: brightness(0.65) invert(1) contrast(3.2) hue-rotate(200deg) saturate(0.35) !important;
        }
      `}</style>

      {/* Top Cascading Alert Banner */}
      {isTrainDelayed && (
        <div className="bg-rose-950/50 border-b border-rose-900/80 px-6 py-2 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-rose-300">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <strong>ST-GNN Cascading Delay Alert:</strong>
            <span>
              Train #{selectedRakeNumber} running (+{liveNtesData?.delay_minutes}m) behind schedule. Section clearance protocol active.
            </span>
          </div>
          <button
            onClick={() => setShowCascadingDrawer(!showCascadingDrawer)}
            className="text-rose-300 bg-rose-900/60 hover:bg-rose-800 px-3 py-1 rounded border border-rose-700 cursor-pointer font-bold transition flex items-center gap-1.5"
          >
            <span>{conflictsCount} DOWNSTREAM CONFLICTS</span>
            <span className="text-[10px]">&rarr;</span>
          </button>
        </div>
      )}

      {/* Weather Caution Banner */}
      {liveNtesData?.weather && liveNtesData.weather.impact !== 'NONE' && (
        <div className="bg-sky-950/50 border-b border-sky-800/80 px-6 py-2 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-sky-300">
            <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
            <strong>ROUTE WEATHER IMPACT:</strong>
            <span>
              {liveNtesData.weather.condition} ({liveNtesData.weather.temperature_c}&deg;C, Vis: {liveNtesData.weather.visibility_meters}m).
              +{liveNtesData.weather.weather_delay_buffer_mins}m buffer injected into ETA range.
            </span>
          </div>
          <span className="text-sky-400 bg-sky-900/40 px-2 py-0.5 rounded border border-sky-800">
            MET-INTELLIGENCE
          </span>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <div className="flex-1 h-full relative">
          {/* Controls Bar with Simulation Trigger */}
          <div className="absolute top-4 left-4 z-[1000] flex flex-wrap items-center gap-2 bg-[#111622]/90 backdrop-blur border border-slate-800 p-2.5 rounded-xl shadow-xl">
            <span className="text-xs font-mono text-slate-400">ZONE:</span>
            {['ALL', 'SWR', 'NR', 'NCR', 'ER', 'SR', 'WR', 'CR'].map((zone) => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`px-2 py-0.5 rounded text-xs font-mono cursor-pointer transition ${selectedZone === zone ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 bg-slate-800/60 hover:text-white'
                  }`}
              >
                {zone}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-700 mx-1" />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (customSearch.trim()) {
                  setFollowTrain(false);
                  setSelectedRakeNumber(customSearch.trim());
                }
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                placeholder="Enter Train (e.g. 12627, 12245)"
                value={customSearch}
                onChange={(e) => setCustomSearch(e.target.value)}
                className="bg-[#161c2b] border border-slate-700 px-2.5 py-1 rounded text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded text-xs font-mono font-bold cursor-pointer transition shadow-lg shadow-indigo-600/30"
              >
                TRACK
              </button>
            </form>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            <button
              type="button"
              onClick={() => setFollowTrain(!followTrain)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer transition flex items-center gap-1.5 ${followTrain
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
            >
              <span className={`h-2 w-2 rounded-full ${followTrain ? 'bg-white animate-pulse' : 'bg-slate-500'}`} />
              {followTrain ? 'FOLLOWING' : 'FOLLOW TRAIN'}
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            {/* Live Presentation Simulation Trigger Button */}
            <button
              type="button"
              onClick={toggleDelaySimulation}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer transition border ${(liveNtesData?.delay_minutes || 0) > 0
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                  : 'bg-rose-950/90 text-rose-300 border-rose-800 hover:bg-rose-900'
                }`}
            >
              {(liveNtesData?.delay_minutes || 0) > 0 ? 'RESET SIMULATION' : 'SIMULATE DELAY SPIKE'}
            </button>
          </div>

          {/* Leaflet Map with Inverted Dark Layer & All State Boundaries */}
          <MapContainer
            center={animatedPos || [20.5937, 78.9629]}
            zoom={5}
            style={{ height: '100%', width: '100%', backgroundColor: '#070a12' }}
          >
            <MapFocusController
              routeCoords={routePolylineCoords}
              targetRake={selectedRakeNumber}
            />

            <CameraFollower pos={animatedPos} active={followTrain} />

            {/* Standard OpenStreetMap Base Rendered in Tactical Dark Mode */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={18}
            />

            {/* Colored Headway Block Sections */}
            {coloredBlockSections.map((seg) => (
              <Polyline
                key={seg.id}
                positions={seg.positions}
                pathOptions={{
                  color: seg.color,
                  weight: seg.weight,
                  dashArray: seg.dashArray,
                  opacity: seg.opacity,
                }}
              />
            ))}

            {(routeStops.length > 0 ? routeStops : filteredStations).map((stn: any) => {
              const code = stn.station_code || stn.code;
              const name = stn.station_name || stn.name;
              const lat = stn.latitude || stn.lat;
              const lon = stn.longitude || stn.lon;
              const isCurrent = code === currentStationDisplay.code;
              const isJunction = name.toLowerCase().includes('junction') || name.toLowerCase().includes('jn');

              return (
                <CircleMarker
                  key={`stn-${code}`}
                  center={[lat, lon]}
                  radius={isCurrent ? 8 : isJunction ? 5 : 3}
                  pathOptions={{
                    color: isCurrent ? '#10b981' : isJunction ? '#f59e0b' : '#6366f1',
                    fillColor: isCurrent ? '#34d399' : isJunction ? '#fbbf24' : '#818cf8',
                    fillOpacity: 0.9,
                    weight: isCurrent ? 3 : isJunction ? 2 : 1,
                  }}
                >
                  <Popup>
                    <div className="font-sans text-xs text-slate-900">
                      <strong className="text-sm font-bold">{name}</strong> ({code})
                      {isJunction && (
                        <div className="text-[10px] text-amber-700 font-bold uppercase mt-0.5">
                          Network Hub Junction (Headway Interlocking Node)
                        </div>
                      )}
                      {stn.predicted_platform && (
                        <div className="text-indigo-600 font-bold mt-0.5">{stn.predicted_platform}</div>
                      )}
                      {stn.is_crew_change && (
                        <div className="text-amber-800 font-bold text-[10px] mt-0.5">
                          Operational Crew Handover Base
                        </div>
                      )}
                      {stn.scheduled_arrival && (
                        <div className="mt-1 text-slate-600">
                          Arr: {stn.scheduled_arrival} | Dep: {stn.scheduled_departure}
                        </div>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {animatedPos && (
              <Marker
                position={animatedPos}
                icon={createMovingTrainIcon(telemetryRake?.telemetry?.signal || 'GREEN', liveNtesData?.is_unscheduled_halt)}
              >
                <Popup>
                  <div className="font-sans text-xs text-slate-900">
                    <strong className="text-indigo-600 font-bold">Train #{selectedRakeNumber}</strong>
                    <br />
                    Status: <strong>{liveNtesData?.train_status_message}</strong>
                    <br />
                    Last Passed: <strong>{currentStationDisplay.name} ({currentStationDisplay.code})</strong>
                    {nextStationDisplay && (
                      <div>Next Station: <strong>{nextStationDisplay.name} ({nextStationDisplay.code}) - {nextStationDisplay.platform}</strong></div>
                    )}
                    Speed: <strong>{liveNtesData?.speed_kmh ?? 76} km/h</strong>
                    {liveNtesData?.weather && (
                      <div className="mt-1 text-sky-700">
                        Weather: {liveNtesData.weather.condition} ({liveNtesData.weather.temperature_c}&deg;C)
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* ST-GNN Cascading Delay Drawer */}
          {showCascadingDrawer && (
            <div className="absolute bottom-4 left-4 z-[1000] w-96 bg-[#111622]/95 backdrop-blur-md border border-rose-900/80 rounded-xl p-4 shadow-2xl space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  ST-GNN CASCADING DELAY MATRIX
                </div>
                <button
                  onClick={() => setShowCascadingDrawer(false)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  &times; CLOSE
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {liveNtesData?.cascading_conflicts && liveNtesData.cascading_conflicts.length > 0 ? (
                  liveNtesData.cascading_conflicts.map((c, i) => (
                    <div key={i} className="bg-[#161c2b] border border-rose-950 p-2.5 rounded-lg space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold">#{c.affected_train} {c.train_name}</span>
                        <span className="text-rose-400 font-bold">+{c.projected_delay_addition_mins}m</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        At: <strong className="text-slate-200">{c.junction_name} ({c.conflict_junction})</strong>
                      </div>
                      <div className="text-[10px] text-amber-300/80">{c.reason}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 py-3 text-center">
                    No downstream conflicts detected on current corridor.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Intelligence Sidebar */}
        <div className="w-full lg:w-88 bg-[#111622] border-l border-slate-800 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Live Dispatch Feed
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${isStreamConnected
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                >
                  {isStreamConnected ? 'REAL-TIME STREAM' : 'OFFLINE'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">Train #{selectedRakeNumber}</h2>

              <p className="text-xs text-slate-300 font-mono mt-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>
                  Passed {currentStationDisplay.code}
                  {nextStationDisplay ? ` • Approaching ${nextStationDisplay.name} (${nextStationDisplay.platform})` : ''}
                </span>
              </p>
            </div>

            {/* AI Predictive ETA Confidence, Range, Slack & Historical Bias Card */}
            <div className="p-3.5 bg-gradient-to-br from-[#161c2b] to-[#121724] border border-slate-700/80 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                  ETA Stability
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${liveNtesData?.eta_stability === 'HIGH'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : liveNtesData?.eta_stability === 'MODERATE'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                  {liveNtesData?.eta_stability || 'HIGH'} ({liveNtesData?.eta_confidence || 92}%)
                </span>
              </div>

              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">Predicted Arrival Window</div>
                <div className="text-lg font-mono font-bold text-indigo-300 mt-0.5">
                  {etaWindowText}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5 flex items-center justify-between">
                  <span>Bound: &plusmn;{liveNtesData?.eta_variance_mins || 4}m variance</span>
                  <span className="text-indigo-400 font-medium">
                    Hist. Bias: +{liveNtesData?.historical_delay_bias_mins || 7}m
                  </span>
                  {liveNtesData?.predicted_recovery_mins ? (
                    <span className="text-emerald-400 font-bold">-{liveNtesData.predicted_recovery_mins}m recovered</span>
                  ) : null}
                </div>
              </div>

              {/* Progress Confidence Bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ${(liveNtesData?.eta_confidence || 92) > 80 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  style={{ width: `${liveNtesData?.eta_confidence || 92}%` }}
                />
              </div>

              {/* Weather & Junction Assessment */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                {liveNtesData?.weather ? (
                  <span className="text-sky-300 truncate">
                    {liveNtesData.weather.condition} ({liveNtesData.weather.temperature_c}&deg;C)
                  </span>
                ) : (
                  <span className="text-slate-400">Weather: Normal</span>
                )}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${liveNtesData?.congestion_level === 'CRITICAL'
                    ? 'bg-rose-950 text-rose-400 border-rose-800'
                    : liveNtesData?.congestion_level === 'MODERATE'
                      ? 'bg-amber-950 text-amber-400 border-amber-800'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                  JCT: {liveNtesData?.congestion_level || 'NORMAL'}
                </span>
              </div>
            </div>

            {/* Live Operational Metrics */}
            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="p-3 bg-[#161c2b] border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase">Current Station</span>
                <div className="text-base font-bold text-white mt-0.5 truncate">
                  {currentStationDisplay.code}
                </div>
                <div className="text-[10px] text-indigo-400 truncate mt-0.5">
                  {currentStationDisplay.platform || 'PF #1'}
                </div>
              </div>

              <div className="p-3 bg-[#161c2b] border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase">Live Delay</span>
                <div className={`text-lg font-bold mt-0.5 ${(liveNtesData?.delay_minutes ?? 0) > 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                  +{liveNtesData?.delay_minutes ?? 0} <span className="text-xs font-normal text-slate-400">min</span>
                </div>
              </div>

              <div className="p-3 bg-[#161c2b] border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase">Section Speed</span>
                <div className="text-lg font-bold text-white mt-0.5">
                  {liveNtesData?.speed_kmh ?? 76} <span className="text-xs font-normal text-slate-400">km/h</span>
                </div>
              </div>

              <div className="p-3 bg-[#161c2b] border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase">Planned Stops</span>
                <div className="text-lg font-bold text-indigo-400 mt-0.5">
                  {routeStops.length || 0}
                </div>
              </div>
            </div>

            {/* Platform & Crew Waypoints */}
            <div>
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-2">
                Platform & Crew Waypoints
              </span>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {routeStops.map((st: any, idx: number) => {
                  const isCurrent = idx === passedStationIdx;

                  return (
                    <div
                      key={idx}
                      className={`p-2 rounded text-xs font-mono flex items-center justify-between border ${isCurrent
                          ? 'bg-indigo-950/80 border-indigo-500 text-white font-bold'
                          : st.hasPassed
                            ? 'bg-[#121722] border-slate-900 text-slate-500'
                            : 'bg-[#161c2b] border-slate-800/80 text-slate-300'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${isCurrent
                              ? 'bg-emerald-400 animate-ping'
                              : st.hasPassed
                                ? 'bg-slate-600'
                                : 'bg-indigo-400'
                            }`}
                        />
                        <span className={isCurrent ? 'text-white font-bold' : ''}>{st.station_code}</span>
                        <span className="text-[10px] text-indigo-400 font-semibold">{st.predicted_platform}</span>
                        {st.is_crew_change && (
                          <span className="text-[9px] bg-amber-950/90 text-amber-300 border border-amber-800 px-1 py-0.2 rounded font-bold">
                            CREW
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 truncate max-w-[80px]">{st.station_name}</span>
                      </div>
                      <span className="text-[10px]">
                        {st.actual_time && st.actual_time !== '--'
                          ? st.actual_time
                          : st.scheduled_arrival || 'Pass'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-2">
              Corridor Hotlist
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {['12627', '12245', '12860', '20608'].map((no) => (
                <button
                  key={no}
                  onClick={() => {
                    setFollowTrain(false);
                    setCustomSearch(no);
                    setSelectedRakeNumber(no);
                  }}
                  className={`py-1.5 rounded border text-xs font-mono text-center transition cursor-pointer ${selectedRakeNumber === no
                      ? 'bg-indigo-600 text-white font-bold border-indigo-500'
                      : 'bg-[#161c2b] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                >
                  #{no}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
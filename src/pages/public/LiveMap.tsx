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
}

interface NTESLiveStatus {
  source?: string;
  current_station?: string;
  current_station_name?: string;
  train_status_message?: string;
  terminated?: boolean;
  delay_minutes?: number;
  speed_kmh?: number;
  latitude?: number;
  longitude?: number;
  stations?: any[];
}

const DEFAULT_STATIONS: StationNode[] = [
  { code: 'SBC', name: 'KSR Bengaluru City', lat: 12.9784, lon: 77.5696, zone: 'SWR' },
  { code: 'BNC', name: 'Bengaluru Cantt', lat: 12.9934, lon: 77.5986, zone: 'SWR' },
  { code: 'BNCE', name: 'Bengaluru East', lat: 13.0012, lon: 77.6184, zone: 'SWR' },
  { code: 'BYPL', name: 'Baiyyappanahalli', lat: 12.9926, lon: 77.6521, zone: 'SWR' },
  { code: 'KJM', name: 'Krishnarajapuram', lat: 13.0004, lon: 77.6888, zone: 'SWR' },
  { code: 'WFD', name: 'Whitefield', lat: 12.9961, lon: 77.7611, zone: 'SWR' },
  { code: 'MLO', name: 'Malur', lat: 13.0045, lon: 77.9405, zone: 'SWR' },
  { code: 'BWT', name: 'Bangarapet Jn', lat: 12.9972, lon: 78.1989, zone: 'SWR' },
  { code: 'MYS', name: 'Mysuru Junction', lat: 12.3164, lon: 76.6433, zone: 'SWR' },
  { code: 'SMVB', name: 'SMVT Bengaluru', lat: 13.0076, lon: 77.6542, zone: 'SWR' },
  { code: 'HWH', name: 'Howrah Jn', lat: 22.5839, lon: 88.3426, zone: 'ER' },
  { code: 'CNB', name: 'Kanpur Central', lat: 26.4547, lon: 80.3507, zone: 'NCR' },
  { code: 'NDLS', name: 'New Delhi', lat: 28.6415, lon: 77.2207, zone: 'NR' },
  { code: 'CSMT', name: 'Mumbai CSMT', lat: 18.9402, lon: 72.8356, zone: 'CR' },
  { code: 'MAS', name: 'Chennai Central', lat: 13.0827, lon: 80.2707, zone: 'SR' },
];

const createMovingTrainIcon = (signal?: string) => {
  const color =
    signal === 'GREEN'
      ? '#10b981'
      : signal === 'YELLOW'
        ? '#f59e0b'
        : signal === 'DOUBLE_YELLOW'
          ? '#eab308'
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
          opacity: 0.4;
          animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;
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
          maxZoom: 10,
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
  const { trains, activeAlerts, isConnected } = useLiveTelemetry();
  const [stations, setStations] = useState<StationNode[]>(DEFAULT_STATIONS);
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedRakeNumber, setSelectedRakeNumber] = useState<string>('12860');
  const [liveNtesData, setLiveNtesData] = useState<NTESLiveStatus | null>(null);
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [isLoadingNtes, setIsLoadingNtes] = useState<boolean>(false);
  const [customSearch, setCustomSearch] = useState<string>('');
  const [followTrain, setFollowTrain] = useState<boolean>(false);

  const [animatedPos, setAnimatedPos] = useState<[number, number] | null>(null);
  const [passedStationIdx, setPassedStationIdx] = useState<number>(0);
  const progressRef = useRef<number>(0);

  const stationLookup = useMemo(() => {
    const map = new Map<string, StationNode>();
    stations.forEach((stn) => map.set(stn.code.toUpperCase(), stn));
    return map;
  }, [stations]);

  // 1. Fetch SQLite station registry
  useEffect(() => {
    fetch('http://localhost:5000/api/stations/all')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        const rawList = data?.stations || (Array.isArray(data) ? data : []);
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
            .filter((s: StationNode) => !isNaN(s.lat) && !isNaN(s.lon) && s.lat !== 0 && s.code);

          if (parsed.length > 0) setStations(parsed);
        }
      })
      .catch(() => { });
  }, []);

  // 2. Fetch train pathway and parse progression
  useEffect(() => {
    if (!selectedRakeNumber) return;

    const loadLiveTrain = () => {
      setIsLoadingNtes(true);

      const routePromise = fetch(`http://localhost:5000/api/trains/${selectedRakeNumber}/route`)
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          if (data?.route && Array.isArray(data.route) && data.route.length > 0) {
            return data.route
              .map((s: any) => ({
                stop_sequence: s.stop_sequence,
                station_code: s.station_code,
                station_name: s.station_name,
                latitude: parseFloat(s.latitude),
                longitude: parseFloat(s.longitude),
                scheduled_arrival: s.scheduled_arrival,
                scheduled_departure: s.scheduled_departure,
              }))
              .filter((s: RouteStop) => !isNaN(s.latitude) && !isNaN(s.longitude));
          }
          return [];
        })
        .catch(() => []);

      const livePromise = fetch(`http://localhost:5000/api/trains/${selectedRakeNumber}/live-ntes`)
        .then((res) => res.json())
        .catch(() => null);

      Promise.all([routePromise, livePromise])
        .then(([dbRoute, ntesPayload]) => {
          const body = ntesPayload?.body || ntesPayload;
          const stationsArray: any[] = body?.stations || [];

          setLiveNtesData({
            source: ntesPayload?.source || 'RAPIDAPI_NTES_LIVE',
            current_station: body?.current_station,
            current_station_name: body?.current_station_name,
            train_status_message: body?.train_status_message,
            terminated: body?.terminated ?? false,
            delay_minutes: body?.delay_minutes ?? 0,
            speed_kmh: body?.speed_kmh ?? 78,
            latitude: body?.latitude,
            longitude: body?.longitude,
            stations: stationsArray,
          });

          let cleanStops: RouteStop[] = [];

          if (stationsArray.length > 0) {
            cleanStops = stationsArray
              .map((st: any, idx: number) => {
                const matched = stationLookup.get((st.stationCode || '').toUpperCase());
                const isPassed =
                  st.status === 'PASSED' ||
                  (st.actual_departure_time && st.actual_departure_time !== '--') ||
                  (st.actual_arrival_time && st.actual_arrival_time !== '--');

                return {
                  stop_sequence: idx + 1,
                  station_code: st.stationCode,
                  station_name: st.stationName || matched?.name || st.stationCode,
                  latitude: matched?.lat || 0,
                  longitude: matched?.lon || 0,
                  scheduled_arrival: st.arrivalTime,
                  scheduled_departure: st.departureTime,
                  actual_time: st.actual_departure_time || st.actual_arrival_time,
                  hasPassed: isPassed,
                };
              })
              .filter((s: RouteStop) => s.latitude !== 0 && s.longitude !== 0);
          } else {
            cleanStops = dbRoute;
          }

          setRouteStops(cleanStops);

          // Find exact last station the train crossed
          let lastPassed = 0;
          cleanStops.forEach((st, idx) => {
            if (st.hasPassed) lastPassed = idx;
          });

          const curCode = (body?.current_station || '').toUpperCase();
          if (curCode) {
            const foundIdx = cleanStops.findIndex((s) => s.station_code.toUpperCase() === curCode);
            if (foundIdx !== -1) lastPassed = Math.max(lastPassed, foundIdx);
          }

          setPassedStationIdx(lastPassed);
          progressRef.current = 0;
        })
        .finally(() => setIsLoadingNtes(false));
    };

    loadLiveTrain();
    const pollInterval = setInterval(loadLiveTrain, 30000);
    return () => clearInterval(pollInterval);
  }, [selectedRakeNumber, stationLookup]);

  const rakeList = trains ? Object.values(trains) : [];
  const telemetryRake = rakeList.find((r) => r.trainNumber === selectedRakeNumber);

  const filteredStations =
    selectedZone === 'ALL'
      ? stations
      : stations.filter((stn) => stn.zone?.toUpperCase() === selectedZone.toUpperCase());

  // Physical Live Movement Loop
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

    let animId: number;
    let lastTime = performance.now();

    const glideTrain = (now: number) => {
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;

      progressRef.current = (progressRef.current + deltaSec * 0.012) % 1;
      const t = progressRef.current;

      const lat = fromStop.latitude + t * (toStop.latitude - fromStop.latitude);
      const lon = fromStop.longitude + t * (toStop.longitude - fromStop.longitude);

      setAnimatedPos([lat, lon]);
      animId = requestAnimationFrame(glideTrain);
    };

    animId = requestAnimationFrame(glideTrain);
    return () => cancelAnimationFrame(animId);
  }, [routeStops, passedStationIdx]);

  // Current Station Display
  const currentStationDisplay = useMemo(() => {
    if (!routeStops || routeStops.length === 0) {
      return { code: 'EN ROUTE', name: 'In Transit' };
    }
    const stop = routeStops[Math.min(passedStationIdx, routeStops.length - 1)];
    return { code: stop.station_code, name: stop.station_name };
  }, [routeStops, passedStationIdx]);

  // Next Upcoming Station
  const nextStationDisplay = useMemo(() => {
    if (!routeStops || passedStationIdx >= routeStops.length - 1) return null;
    const nxt = routeStops[passedStationIdx + 1];
    return { code: nxt.station_code, name: nxt.station_name };
  }, [routeStops, passedStationIdx]);

  const routePolylineCoords: [number, number][] = useMemo(() => {
    return routeStops.map((s) => [s.latitude, s.longitude]);
  }, [routeStops]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#0a0e17] text-slate-100 font-sans overflow-hidden">
      {/* Top Banner */}
      {activeAlerts && activeAlerts.length > 0 && (
        <div className="bg-rose-950/40 border-b border-rose-900/60 px-6 py-2 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-rose-300">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <strong>ST-GNN Cascading Delay Alert:</strong>
            <span>
              Delayed Train {activeAlerts[0].delayed_train} (+{activeAlerts[0].cascade_risk || 12}m) impacting corridor headway.
            </span>
          </div>
          <span className="text-rose-400 bg-rose-900/40 px-2 py-0.5 rounded border border-rose-800">
            SECTION COPILOT ACTIVE
          </span>
        </div>
      )}

      {/* Main Grid View */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <div className="flex-1 h-full relative">
          {/* Top Control Bar */}
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

            {/* Train Search Form */}
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
                placeholder="Enter Train (e.g. 12860, 12627)"
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

            {/* Follow Train Toggle */}
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
          </div>

          {/* Leaflet Map */}
          <MapContainer
            center={animatedPos || [20.5937, 78.9629]}
            zoom={5}
            style={{ height: '100%', width: '100%', backgroundColor: '#0d1117' }}
          >
            <MapFocusController
              routeCoords={routePolylineCoords}
              targetRake={selectedRakeNumber}
            />

            <CameraFollower pos={animatedPos} active={followTrain} />

            <TileLayer
              attribution='Tiles &copy; Esri &mdash; National Geographic, DeLorme, NAVTEQ'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              maxZoom={16}
            />

            {/* Glowing Polyline */}
            {routePolylineCoords.length > 1 && (
              <>
                <Polyline
                  positions={routePolylineCoords}
                  pathOptions={{
                    color: '#6366f1',
                    weight: 6,
                    opacity: 0.35,
                  }}
                />
                <Polyline
                  positions={routePolylineCoords}
                  pathOptions={{
                    color: '#818cf8',
                    weight: 2.5,
                    dashArray: '6, 6',
                    opacity: 0.95,
                  }}
                />
              </>
            )}

            {/* Route Stations */}
            {(routeStops.length > 0 ? routeStops : filteredStations).map((stn: any) => {
              const code = stn.station_code || stn.code;
              const name = stn.station_name || stn.name;
              const lat = stn.latitude || stn.lat;
              const lon = stn.longitude || stn.lon;
              const isCurrent = code === currentStationDisplay.code;

              return (
                <CircleMarker
                  key={`stn-${code}`}
                  center={[lat, lon]}
                  radius={isCurrent ? 7 : 3.5}
                  pathOptions={{
                    color: isCurrent ? '#10b981' : '#6366f1',
                    fillColor: isCurrent ? '#34d399' : '#818cf8',
                    fillOpacity: 0.9,
                    weight: isCurrent ? 2.5 : 1,
                  }}
                >
                  <Popup>
                    <div className="font-sans text-xs text-slate-900">
                      <strong className="text-sm font-bold">{name}</strong> ({code})
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

            {/* Live Moving Train Marker */}
            {animatedPos && (
              <Marker
                position={animatedPos}
                icon={createMovingTrainIcon(telemetryRake?.telemetry?.signal || 'GREEN')}
              >
                <Popup>
                  <div className="font-sans text-xs text-slate-900">
                    <strong className="text-indigo-600 font-bold">Train #{selectedRakeNumber}</strong>
                    <br />
                    Last Passed: <strong>{currentStationDisplay.name} ({currentStationDisplay.code})</strong>
                    {nextStationDisplay && (
                      <div>Next Station: <strong>{nextStationDisplay.name} ({nextStationDisplay.code})</strong></div>
                    )}
                    Speed: <strong>{liveNtesData?.speed_kmh ?? 78} km/h</strong>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-88 bg-[#111622] border-l border-slate-800 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Live Dispatch Feed
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${liveNtesData?.terminated
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                >
                  {isLoadingNtes ? 'SYNCING...' : liveNtesData?.terminated ? 'TERMINATED' : 'LIVE RUNNING'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">Train #{selectedRakeNumber}</h2>

              <p className="text-xs text-slate-300 font-mono mt-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>
                  Passed {currentStationDisplay.code}
                  {nextStationDisplay ? ` • Approaching ${nextStationDisplay.name}` : ''}
                </span>
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="p-3 bg-[#161c2b] border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase">Last Crossed</span>
                <div className="text-base font-bold text-white mt-0.5 truncate">
                  {currentStationDisplay.code}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {currentStationDisplay.name}
                </div>
              </div>

              <div className="p-3 bg-[#161c2b] border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase">Live Delay</span>
                <div className="text-lg font-bold text-amber-400 mt-0.5">
                  +{liveNtesData?.delay_minutes ?? 0} <span className="text-xs font-normal text-slate-400">min</span>
                </div>
              </div>

              <div className="p-3 bg-[#161c2b] border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase">Speed</span>
                <div className="text-lg font-bold text-white mt-0.5">
                  {liveNtesData?.speed_kmh ?? 78} <span className="text-xs font-normal text-slate-400">km/h</span>
                </div>
              </div>

              <div className="p-3 bg-[#161c2b] border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase">Mapped Stops</span>
                <div className="text-lg font-bold text-indigo-400 mt-0.5">
                  {routeStops.length || 0}
                </div>
              </div>
            </div>

            {/* Route Stops Pathway Timeline */}
            <div>
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-2">
                Route Stops Pathway
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
                        <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{st.station_name}</span>
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

          {/* Quick Select Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-2">
              Corridor Hotlist
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {['12860', '12627', '20608', '12051'].map((no) => (
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
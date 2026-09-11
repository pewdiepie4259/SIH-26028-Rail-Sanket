import React, { useState, useEffect } from 'react';
import {
  TrainFront,
  Activity,
  Radio,
  Play,
  Pause,
  RefreshCw,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import {
  fetchCorridorTopology,
  predictCorridorGNN,
  fetchActiveCopilotAlerts,
  type CorridorNode,
  type CopilotBottleneckAlert,
} from '../../services/api';

interface LiveRake {
  id: string;
  name: string;
  number: string;
  currentStation: string;
  nextStation: string;
  progress: number; // 0 to 100 between current and next station
  speedKmh: number;
  delayMinutes: number;
  signalAspect: 'GREEN' | 'YELLOW' | 'DOUBLE_YELLOW' | 'RED';
  route: string[];
}

const DEFAULT_STATIONS: CorridorNode[] = [
  { id: 'SBC', name: 'KSR Bengaluru City', lat: 12.9784, lon: 77.5696, platforms: 10, is_junction: true },
  { id: 'BNC', name: 'Bengaluru Cantt', lat: 12.9934, lon: 77.5983, platforms: 3 },
  { id: 'BNCE', name: 'Bengaluru East', lat: 12.9981, lon: 77.6163, platforms: 2 },
  { id: 'BYPL', name: 'Baiyyappanahalli', lat: 12.9912, lon: 77.6528, platforms: 4, is_junction: true },
  { id: 'KJM', name: 'Krishnarajapuram', lat: 13.0012, lon: 77.6780, platforms: 4, is_junction: true },
  { id: 'WFD', name: 'Whitefield', lat: 12.9942, lon: 77.7583, platforms: 4 },
  { id: 'MLO', name: 'Malur', lat: 13.0039, lon: 77.9392, platforms: 3 },
  { id: 'BWT', name: 'Bangarapet Jn', lat: 12.9988, lon: 78.1969, platforms: 5, is_junction: true },
  { id: 'KGI', name: 'Kengeri', lat: 12.9090, lon: 77.4840, platforms: 4 },
  { id: 'MYA', name: 'Mandya', lat: 12.5234, lon: 76.8986, platforms: 3 },
  { id: 'MYS', name: 'Mysuru Jn', lat: 12.3160, lon: 76.6450, platforms: 6, is_junction: true },
  { id: 'YPR', name: 'Yesvantpur Jn', lat: 13.0238, lon: 77.5503, platforms: 6, is_junction: true },
];

const INITIAL_RAKES: LiveRake[] = [
  {
    id: '1',
    name: 'Vande Bharat Express',
    number: '20661',
    currentStation: 'SBC',
    nextStation: 'BNC',
    progress: 45,
    speedKmh: 92,
    delayMinutes: 0,
    signalAspect: 'GREEN',
    route: ['SBC', 'BNC', 'BNCE', 'BYPL', 'KJM', 'WFD'],
  },
  {
    id: '2',
    name: 'Karnataka Express',
    number: '12627',
    currentStation: 'KGI',
    nextStation: 'SBC',
    progress: 70,
    speedKmh: 68,
    delayMinutes: 18,
    signalAspect: 'YELLOW',
    route: ['KGI', 'SBC', 'BNC', 'BYPL'],
  },
  {
    id: '3',
    name: 'Brindavan Express',
    number: '12639',
    currentStation: 'BYPL',
    nextStation: 'KJM',
    progress: 25,
    speedKmh: 42,
    delayMinutes: 12,
    signalAspect: 'DOUBLE_YELLOW',
    route: ['SBC', 'BNC', 'BNCE', 'BYPL', 'KJM', 'WFD', 'BWT'],
  },
  {
    id: '4',
    name: 'Bengaluru - Mysuru Express',
    number: '12613',
    currentStation: 'KGI',
    nextStation: 'MYA',
    progress: 55,
    speedKmh: 85,
    delayMinutes: 5,
    signalAspect: 'GREEN',
    route: ['SBC', 'KGI', 'MYA', 'MYS'],
  },
  {
    id: '5',
    name: 'Hampi Express',
    number: '16591',
    currentStation: 'YPR',
    nextStation: 'SBC',
    progress: 60,
    speedKmh: 50,
    delayMinutes: 4,
    signalAspect: 'GREEN',
    route: ['YPR', 'SBC', 'KGI', 'MYS'],
  },
];

// Coordinate layout mapping for 2D schematic projection
const STATION_POSITIONS: Record<string, { x: number; y: number }> = {
  YPR: { x: 180, y: 80 },
  SBC: { x: 220, y: 190 },
  BNC: { x: 330, y: 170 },
  BNCE: { x: 430, y: 155 },
  BYPL: { x: 540, y: 140 },
  KJM: { x: 650, y: 130 },
  WFD: { x: 770, y: 145 },
  MLO: { x: 880, y: 160 },
  BWT: { x: 970, y: 175 },
  KGI: { x: 160, y: 300 },
  MYA: { x: 110, y: 410 },
  MYS: { x: 70, y: 510 },
};

export const LiveMap: React.FC = () => {
  const [stations, setStations] = useState<CorridorNode[]>(DEFAULT_STATIONS);
  const [rakes, setRakes] = useState<LiveRake[]>(INITIAL_RAKES);
  const [selectedStation, setSelectedStation] = useState<CorridorNode | null>(null);
  const [selectedRake, setSelectedRake] = useState<LiveRake | null>(INITIAL_RAKES[0]);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [gnnDelays, setGnnDelays] = useState<Record<string, number>>({});
  const [bottleneckAlerts, setBottleneckAlerts] = useState<CopilotBottleneckAlert[]>([]);

  // Fetch initial topology and alerts
  useEffect(() => {
    fetchCorridorTopology()
      .then((data) => {
        if (data.nodes && data.nodes.length > 0) {
          setStations(data.nodes);
        }
      })
      .catch(() => {
        // Fallback already pre-populated
      });

    predictCorridorGNN('12627', { '12627': 18.0, '12639': 12.0 })
      .then((res) => {
        if (res.cascading_delays) {
          setGnnDelays(res.cascading_delays);
        }
      })
      .catch(() => {
        setGnnDelays({
          SBC: 18.0,
          BNC: 16.5,
          BNCE: 14.8,
          BYPL: 15.2,
          KJM: 13.5,
          WFD: 11.2,
          MLO: 9.4,
          BWT: 8.1,
        });
      });

    fetchActiveCopilotAlerts()
      .then((res) => {
        if (res.bottlenecks) {
          setBottleneckAlerts(res.bottlenecks);
        }
      })
      .catch(() => {});
  }, []);

  // Live simulation tick
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setRakes((prev) =>
        prev.map((rake) => {
          let nextProgress = rake.progress + 4;
          let curr = rake.currentStation;
          let next = rake.nextStation;

          if (nextProgress >= 100) {
            nextProgress = 0;
            const currIdx = rake.route.indexOf(next);
            if (currIdx !== -1 && currIdx < rake.route.length - 1) {
              curr = next;
              next = rake.route[currIdx + 1];
            } else {
              // Loop back
              curr = rake.route[0];
              next = rake.route[1] || rake.route[0];
            }
          }

          return {
            ...rake,
            currentStation: curr,
            nextStation: next,
            progress: nextProgress,
            speedKmh: Math.max(35, Math.min(110, rake.speedKmh + (Math.random() * 6 - 3))),
          };
        })
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Compute interpolated train coordinate
  const getRakePosition = (rake: LiveRake) => {
    const posA = STATION_POSITIONS[rake.currentStation] || { x: 220, y: 190 };
    const posB = STATION_POSITIONS[rake.nextStation] || { x: 330, y: 170 };
    const t = rake.progress / 100;
    return {
      x: posA.x + (posB.x - posA.x) * t,
      y: posA.y + (posB.y - posA.y) * t,
    };
  };

  const getSignalColor = (aspect: LiveRake['signalAspect']) => {
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
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400">
              <Radio className="w-6 h-6 animate-pulse" />
            </span>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Bengaluru Corridor Live Network Map
              </h1>
              <p className="text-xs text-slate-400">
                Real-time RTIS Track Geofencing • ST-GNN Cascading Delay Engine • Section Copilot
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
              isSimulating
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isSimulating ? 'Simulation Active' : 'Simulation Paused'}
          </button>

          <button
            onClick={() => {
              predictCorridorGNN('12627', { '12627': 18.0 });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync GNN
          </button>
        </div>
      </div>

      {/* Bottleneck Alert Banner */}
      {bottleneckAlerts.length > 0 && (
        <div className="mt-4 p-3.5 bg-red-950/40 border border-red-500/40 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-red-300 flex items-center gap-2">
                <span>ST-GNN Cascading Delay Detected at {bottleneckAlerts[0].bottleneck_station}</span>
                <span className="px-2 py-0.5 bg-red-900/60 rounded text-[10px] text-red-200">
                  Risk: {(bottleneckAlerts[0].downstream_cascade_risk * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-red-200/80 mt-0.5">
                {bottleneckAlerts[0].recommendation ||
                  `Delayed Train ${bottleneckAlerts[0].delayed_train} (+${bottleneckAlerts[0].predicted_delay_min}m) impacting trailing rakes: ${bottleneckAlerts[0].affected_trains.join(', ')}.`}
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-red-500/20 text-red-300 rounded border border-red-500/30 whitespace-nowrap">
            Section Copilot Active
          </span>
        </div>
      )}

      {/* Main Grid: Schematic View + Inspector */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left 3 Cols: Interactive Schematic Network SVG */}
        <div className="xl:col-span-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 overflow-hidden relative shadow-2xl">
          {/* Schematic Overlay Legend */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur border border-slate-700 rounded-lg text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              Trunk SBC ➔ BWT (East)
            </span>
            <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur border border-slate-700 rounded-lg text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Branch SBC ➔ MYS (South)
            </span>
            <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur border border-slate-700 rounded-lg text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Active GNN Choke Point
            </span>
          </div>

          <div className="overflow-x-auto">
            <svg
              viewBox="0 0 1050 560"
              className="w-full min-w-[720px] h-auto select-none"
              style={{ background: 'radial-gradient(ellipse at 40% 30%, #0f172a 0%, #020617 100%)' }}
            >
              {/* Background Grid Accent */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.15)" strokeWidth="1" />
                </pattern>
                <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#14B8A6" />
                  <stop offset="50%" stopColor="#0EA5E9" />
                  <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
                <linearGradient id="mysuruGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#14B8A6" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>

              <rect width="1050" height="560" fill="url(#grid)" />

              {/* 1. Track Lines */}
              {/* SBC -> YPR (North) */}
              <line
                x1={STATION_POSITIONS.SBC.x}
                y1={STATION_POSITIONS.SBC.y}
                x2={STATION_POSITIONS.YPR.x}
                y2={STATION_POSITIONS.YPR.y}
                stroke="#64748B"
                strokeWidth="5"
                strokeDasharray="4,4"
              />

              {/* Eastward Trunk: SBC -> BNC -> BNCE -> BYPL -> KJM -> WFD -> MLO -> BWT */}
              <path
                d={`M ${STATION_POSITIONS.SBC.x} ${STATION_POSITIONS.SBC.y}
                    L ${STATION_POSITIONS.BNC.x} ${STATION_POSITIONS.BNC.y}
                    L ${STATION_POSITIONS.BNCE.x} ${STATION_POSITIONS.BNCE.y}
                    L ${STATION_POSITIONS.BYPL.x} ${STATION_POSITIONS.BYPL.y}
                    L ${STATION_POSITIONS.KJM.x} ${STATION_POSITIONS.KJM.y}
                    L ${STATION_POSITIONS.WFD.x} ${STATION_POSITIONS.WFD.y}
                    L ${STATION_POSITIONS.MLO.x} ${STATION_POSITIONS.MLO.y}
                    L ${STATION_POSITIONS.BWT.x} ${STATION_POSITIONS.BWT.y}`}
                fill="none"
                stroke="url(#trunkGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Southward Branch: SBC -> KGI -> MYA -> MYS */}
              <path
                d={`M ${STATION_POSITIONS.SBC.x} ${STATION_POSITIONS.SBC.y}
                    L ${STATION_POSITIONS.KGI.x} ${STATION_POSITIONS.KGI.y}
                    L ${STATION_POSITIONS.MYA.x} ${STATION_POSITIONS.MYA.y}
                    L ${STATION_POSITIONS.MYS.x} ${STATION_POSITIONS.MYS.y}`}
                fill="none"
                stroke="url(#mysuruGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 2. Station Nodes */}
              {stations.map((st) => {
                const pos = STATION_POSITIONS[st.id] || { x: 500, y: 250 };
                const delay = gnnDelays[st.id] || 0;
                const isSelected = selectedStation?.id === st.id;
                const isChoke = st.id === 'BYPL' || st.id === 'SBC';

                return (
                  <g
                    key={st.id}
                    onClick={() => setSelectedStation(st)}
                    className="cursor-pointer group"
                  >
                    {/* Ripple on bottleneck */}
                    {isChoke && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="20"
                        fill="rgba(245, 158, 11, 0.2)"
                        className="animate-ping"
                      />
                    )}

                    {/* Outer node circle */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isSelected ? '12' : '9'}
                      fill={st.is_junction ? '#38BDF8' : '#0F172A'}
                      stroke={isSelected ? '#F8FAFC' : isChoke ? '#F59E0B' : '#14B8A6'}
                      strokeWidth={isSelected ? '3' : '2.5'}
                      className="transition-all duration-300 group-hover:scale-125"
                    />

                    {/* Node Center Dot */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="4"
                      fill={isSelected ? '#0F172A' : '#F8FAFC'}
                    />

                    {/* Station Name Label */}
                    <text
                      x={pos.x}
                      y={pos.y - 16}
                      textAnchor="middle"
                      className={`text-[11px] font-bold transition-colors ${
                        isSelected ? 'fill-white' : 'fill-slate-300 group-hover:fill-teal-300'
                      }`}
                    >
                      {st.name} ({st.id})
                    </text>

                    {/* Delay badge */}
                    {delay > 0 && (
                      <g transform={`translate(${pos.x - 16}, ${pos.y + 12})`}>
                        <rect
                          width="32"
                          height="14"
                          rx="3"
                          fill={delay >= 15 ? '#EF4444' : delay >= 10 ? '#F59E0B' : '#059669'}
                        />
                        <text
                          x="16"
                          y="10.5"
                          textAnchor="middle"
                          fill="#FFFFFF"
                          className="text-[9px] font-extrabold"
                        >
                          +{delay}m
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* 3. Moving Trains */}
              {rakes.map((rake) => {
                const pos = getRakePosition(rake);
                const isSelected = selectedRake?.id === rake.id;
                const signalColor = getSignalColor(rake.signalAspect);

                return (
                  <g
                    key={rake.id}
                    onClick={() => setSelectedRake(rake)}
                    className="cursor-pointer group"
                    transform={`translate(${pos.x}, ${pos.y})`}
                  >
                    {/* Animated train shadow / glow */}
                    <circle
                      cx="0"
                      cy="0"
                      r={isSelected ? '18' : '14'}
                      fill={signalColor}
                      opacity="0.25"
                      className="animate-pulse"
                    />

                    {/* Train Marker */}
                    <rect
                      x="-12"
                      y="-12"
                      width="24"
                      height="24"
                      rx="6"
                      fill={isSelected ? '#F8FAFC' : '#1E293B'}
                      stroke={signalColor}
                      strokeWidth="2.5"
                      className="transition-transform group-hover:scale-125"
                    />

                    {/* Icon */}
                    <g transform="translate(-7, -7)">
                      <TrainFront
                        size={14}
                        color={isSelected ? '#0F172A' : '#F8FAFC'}
                        strokeWidth={2.5}
                      />
                    </g>

                    {/* Train Label */}
                    <text
                      x="0"
                      y="26"
                      textAnchor="middle"
                      className="text-[10px] font-black fill-white drop-shadow"
                    >
                      {rake.number} ({rake.speedKmh.toFixed(0)} km/h)
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right 1 Col: Live Inspector Panel */}
        <div className="xl:col-span-1 space-y-4">
          {/* Selected Train / Section Card */}
          {selectedRake && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold tracking-wider text-teal-400">
                  Monitored Rake
                </span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                  style={{ backgroundColor: getSignalColor(selectedRake.signalAspect) }}
                >
                  {selectedRake.signalAspect}
                </span>
              </div>

              <h3 className="text-lg font-black text-white mt-1">{selectedRake.name}</h3>
              <p className="text-xs text-slate-400">Train #{selectedRake.number}</p>

              <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] uppercase text-slate-500 font-semibold">Speed</span>
                  <div className="text-lg font-black text-emerald-400">
                    {selectedRake.speedKmh.toFixed(0)} <span className="text-xs font-normal">km/h</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] uppercase text-slate-500 font-semibold">Delay</span>
                  <div
                    className={`text-lg font-black ${
                      selectedRake.delayMinutes > 10 ? 'text-red-400' : 'text-amber-400'
                    }`}
                  >
                    +{selectedRake.delayMinutes} <span className="text-xs font-normal">min</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Current Block:</span>
                  <span className="font-bold text-teal-300">{selectedRake.currentStation}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Next Signal:</span>
                  <span className="font-bold text-slate-100 flex items-center gap-1">
                    {selectedRake.nextStation} <ArrowRight className="w-3 h-3 text-slate-500" />
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-teal-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${selectedRake.progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Selected Station Inspector */}
          {selectedStation && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-[11px] uppercase font-bold tracking-wider text-blue-400">
                  Station Node
                </span>
                <span className="text-xs font-mono px-2 py-0.5 bg-blue-950 border border-blue-800 rounded text-blue-300">
                  {selectedStation.id}
                </span>
              </div>

              <h4 className="text-base font-bold text-white mt-1">{selectedStation.name}</h4>
              <div className="mt-3 text-xs text-slate-300 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Platforms:</span>
                  <span className="font-semibold">{selectedStation.platforms || 4} Operational</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Predicted GNN Delay:</span>
                  <span className="font-bold text-amber-400">
                    +{gnnDelays[selectedStation.id] || 0} mins
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Coordinates:</span>
                  <span className="font-mono text-[11px]">
                    {selectedStation.lat.toFixed(3)}, {selectedStation.lon.toFixed(3)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Real-time Telemetry Stream Quick Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-teal-400" />
              Live Corridor Telemetry
            </h4>
            <div className="space-y-2 text-xs font-mono">
              {rakes.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedRake(r)}
                  className={`p-2 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                    selectedRake?.id === r.id
                      ? 'bg-teal-950/40 border-teal-500/50 text-teal-200'
                      : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <span className="font-bold text-white">{r.number}</span>
                    <span className="ml-2 text-[10px] text-slate-500">{r.currentStation}➔{r.nextStation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-emerald-400 font-bold">{r.speedKmh.toFixed(0)} km/h</span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getSignalColor(r.signalAspect) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
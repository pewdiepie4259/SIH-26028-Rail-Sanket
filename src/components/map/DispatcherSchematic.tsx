import React, { useState, useMemo, useRef } from 'react';
import {
  TrainFront,
  ZoomIn,
  ZoomOut,
  Layers,
} from 'lucide-react';
import type { RailwaySection, SectionStation, CorridorTrainRake } from '../../data/corridorSections';

interface DispatcherSchematicProps {
  section: RailwaySection;
  stations: SectionStation[];
  rakes: CorridorTrainRake[];
  selectedRake: CorridorTrainRake | null;
  selectedStation: SectionStation | null;
  gnnDelays: Record<string, number>;
  onSelectRake: (rake: CorridorTrainRake) => void;
  onSelectStation: (station: SectionStation) => void;
}

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

export const DispatcherSchematic: React.FC<DispatcherSchematicProps> = ({
  section,
  stations,
  rakes,
  selectedRake,
  selectedStation,
  gnnDelays,
  onSelectRake,
  onSelectStation,
}) => {
  const [zoomScale, setZoomScale] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dimensions
  const PADDING_X = 100;
  const TOTAL_WIDTH = Math.max(1200, stations.length * 170) * zoomScale;
  const HEIGHT = 460;
  const CENTER_Y = 220;
  const UP_LINE_Y = CENTER_Y - 45;
  const DOWN_LINE_Y = CENTER_Y + 45;
  const UP_LOOP_Y = CENTER_Y - 95;
  const DOWN_LOOP_Y = CENTER_Y + 95;

  const totalLengthKm = section.totalLengthKm || 70;

  // Station positions along horizontal axis based on physical chainage km
  const stationPositions = useMemo(() => {
    const posMap = new Map<string, number>();
    const usableWidth = TOTAL_WIDTH - PADDING_X * 2;

    stations.forEach((st, idx) => {
      // Linear interpolation based on km, or evenly spaced fallback if km is equal
      let x = PADDING_X + (st.distanceKm / totalLengthKm) * usableWidth;
      // Prevent station overlap by ensuring minimum spacing
      const minX = PADDING_X + idx * (usableWidth / Math.max(1, stations.length - 1));
      // Blend 70% physical chainage with 30% uniform spacing for clean legible diagram
      const blendedX = x * 0.65 + minX * 0.35;
      posMap.set(st.id, blendedX);
    });

    return posMap;
  }, [stations, totalLengthKm, TOTAL_WIDTH]);

  // Anti-Clumping Engine: computes non-overlapping staggered positions for rakes
  const staggeredRakes = useMemo(() => {
    // Group rakes by block segment
    const blockGroups = new Map<string, CorridorTrainRake[]>();
    rakes.forEach((rake) => {
      const key = `${rake.currentStation}->${rake.nextStation}`;
      if (!blockGroups.has(key)) blockGroups.set(key, []);
      blockGroups.get(key)!.push(rake);
    });

    return rakes.map((rake) => {
      const posA = stationPositions.get(rake.currentStation) ?? PADDING_X;
      const posB = stationPositions.get(rake.nextStation) ?? (PADDING_X + 150);

      // Interpolate progress along track
      const t = Math.max(0, Math.min(1, rake.progress / 100));
      let x = posA + (posB - posA) * t;

      // Determine base Y coordinate based on train direction and track assignment
      let baseY = rake.direction === 'UP' ? UP_LINE_Y : DOWN_LINE_Y;
      if (rake.track === 'LOOP') {
        baseY = rake.direction === 'UP' ? UP_LOOP_Y : DOWN_LOOP_Y;
      }

      // Staggering within block to eliminate clumping
      const key = `${rake.currentStation}->${rake.nextStation}`;
      const group = blockGroups.get(key) || [];
      const rankInGroup = group.findIndex((r) => r.id === rake.id);

      // If multiple trains in same block, add a longitudinal stagger and vertical lane offset
      if (group.length > 1) {
        const deltaX = (rankInGroup - (group.length - 1) / 2) * 48;
        x = Math.max(posA + 20, Math.min(posB - 20, x + deltaX));
        // Vertical staggering: alternating slight offset (±10px) so tags never collide
        const verticalStagger = (rankInGroup % 2 === 1 ? -1 : 1) * 12;
        baseY += verticalStagger;
      }

      return {
        ...rake,
        schematicX: x,
        schematicY: baseY,
      };
    });
  }, [rakes, stationPositions, UP_LINE_Y, DOWN_LINE_Y, UP_LOOP_Y, DOWN_LOOP_Y]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-2xl flex flex-col">
      {/* Schematic Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="p-1.5 bg-teal-500/10 border border-teal-500/30 rounded-lg text-teal-400">
            <Layers className="w-4 h-4" />
          </span>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Dispatcher Linear Track Stringline
            </span>
            <span className="ml-2 text-[11px] text-slate-400 font-mono">
              Dual-Track UP/DOWN Staggering (Anti-Collision Slotting)
            </span>
          </div>
        </div>

        {/* Zoom & Track Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setZoomScale((z) => Math.max(0.75, z - 0.25))}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <span className="px-2 text-[11px] font-mono font-bold text-slate-300">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => setZoomScale((z) => Math.min(2.0, z + 0.25))}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          <button
            onClick={() => setZoomScale(1)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition border border-slate-700"
            title="Reset Zoom"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Scrollable Schematic Canvas Container */}
      <div
        ref={containerRef}
        className="w-full overflow-x-auto overflow-y-hidden select-none cursor-grab active:cursor-grabbing p-4"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #0c1527 0%, #020617 100%)',
        }}
      >
        <svg
          width={TOTAL_WIDTH}
          height={HEIGHT}
          className="w-full h-auto overflow-visible"
          viewBox={`0 0 ${TOTAL_WIDTH} ${HEIGHT}`}
        >
          {/* Subtle Grid Accent */}
          <defs>
            <pattern id="schematicGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(51, 65, 85, 0.08)" strokeWidth="1" />
            </pattern>
            <linearGradient id="upLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <linearGradient id="downLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>
          </defs>

          <rect width={TOTAL_WIDTH} height={HEIGHT} fill="url(#schematicGrid)" />

          {/* Track Line Labels on Left */}
          <g transform="translate(16, 0)">
            <text
              x="0"
              y={UP_LOOP_Y + 4}
              className="text-[10px] font-mono font-bold fill-slate-500 tracking-wider"
            >
              UP LOOP
            </text>
            <text
              x="0"
              y={UP_LINE_Y + 4}
              className="text-[11px] font-mono font-bold fill-sky-400 tracking-wider"
            >
              UP MAIN ◄
            </text>
            <text
              x="0"
              y={DOWN_LINE_Y + 4}
              className="text-[11px] font-mono font-bold fill-teal-400 tracking-wider"
            >
              DOWN MAIN ►
            </text>
            <text
              x="0"
              y={DOWN_LOOP_Y + 4}
              className="text-[10px] font-mono font-bold fill-slate-500 tracking-wider"
            >
              DN LOOP
            </text>
          </g>

          {/* 1. Track Rails */}
          {/* UP Line (Westbound / Toward Origin) */}
          <line
            x1={PADDING_X - 20}
            y1={UP_LINE_Y}
            x2={TOTAL_WIDTH - PADDING_X + 20}
            y2={UP_LINE_Y}
            stroke="url(#upLineGrad)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* UP Track Sleepers / Ties */}
          <line
            x1={PADDING_X - 20}
            y1={UP_LINE_Y}
            x2={TOTAL_WIDTH - PADDING_X + 20}
            y2={UP_LINE_Y}
            stroke="#0369a1"
            strokeWidth="8"
            strokeDasharray="2, 8"
            opacity="0.6"
          />

          {/* DOWN Line (Eastbound / Toward Destination) */}
          <line
            x1={PADDING_X - 20}
            y1={DOWN_LINE_Y}
            x2={TOTAL_WIDTH - PADDING_X + 20}
            y2={DOWN_LINE_Y}
            stroke="url(#downLineGrad)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* DOWN Track Sleepers / Ties */}
          <line
            x1={PADDING_X - 20}
            y1={DOWN_LINE_Y}
            x2={TOTAL_WIDTH - PADDING_X + 20}
            y2={DOWN_LINE_Y}
            stroke="#0f766e"
            strokeWidth="8"
            strokeDasharray="2, 8"
            opacity="0.6"
          />

          {/* 2. Station Platforms & Loops */}
          {stations.map((st) => {
            const x = stationPositions.get(st.id) ?? PADDING_X;
            const isSelected = selectedStation?.id === st.id;
            const delay = gnnDelays[st.id] || 0;
            const isChoke = delay >= 10;

            return (
              <g key={`schematic-station-${st.id}`} className="group cursor-pointer">
                {/* Station Cross-Line / Platform Column */}
                <line
                  x1={x}
                  y1={CENTER_Y - 110}
                  x2={x}
                  y2={CENTER_Y + 110}
                  stroke={isSelected ? '#38bdf8' : isChoke ? '#f59e0b' : '#334155'}
                  strokeWidth={isSelected ? '2' : '1'}
                  strokeDasharray="3, 3"
                />

                {/* Station Loop Lines (Berthing Sidings) */}
                {st.platforms > 2 && (
                  <>
                    <path
                      d={`M ${x - 45} ${UP_LINE_Y} Q ${x - 20} ${UP_LOOP_Y} ${x} ${UP_LOOP_Y} Q ${x + 20} ${UP_LOOP_Y} ${x + 45} ${UP_LINE_Y}`}
                      fill="none"
                      stroke="#475569"
                      strokeWidth="2.5"
                    />
                    <path
                      d={`M ${x - 45} ${DOWN_LINE_Y} Q ${x - 20} ${DOWN_LOOP_Y} ${x} ${DOWN_LOOP_Y} Q ${x + 20} ${DOWN_LOOP_Y} ${x + 45} ${DOWN_LINE_Y}`}
                      fill="none"
                      stroke="#475569"
                      strokeWidth="2.5"
                    />
                  </>
                )}

                {/* Station Central Pier / Node */}
                <g onClick={() => onSelectStation(st)}>
                  {/* Station Outer Ring */}
                  <circle
                    cx={x}
                    cy={CENTER_Y}
                    r={isSelected ? '12' : '9'}
                    fill={st.is_junction ? '#0284c7' : '#0f172a'}
                    stroke={isSelected ? '#ffffff' : isChoke ? '#f59e0b' : '#0d9488'}
                    strokeWidth={isSelected ? '3' : '2'}
                    className="transition-all duration-200 group-hover:scale-125"
                  />
                  <circle
                    cx={x}
                    cy={CENTER_Y}
                    r="4"
                    fill={isSelected ? '#ffffff' : '#38bdf8'}
                  />

                  {/* Station Code & Name Header */}
                  <text
                    x={x}
                    y={CENTER_Y - 120}
                    textAnchor="middle"
                    className={`text-[12px] font-black transition-colors ${
                      isSelected ? 'fill-white' : 'fill-slate-200 group-hover:fill-teal-300'
                    }`}
                  >
                    {st.name}
                  </text>
                  <text
                    x={x}
                    y={CENTER_Y - 135}
                    textAnchor="middle"
                    className="text-[10px] font-mono font-bold fill-teal-400"
                  >
                    {st.id} ({st.platforms} PF)
                  </text>

                  {/* Chainage Marker (Bottom) */}
                  <text
                    x={x}
                    y={CENTER_Y + 130}
                    textAnchor="middle"
                    className="text-[10px] font-mono fill-slate-500"
                  >
                    {st.distanceKm} km
                  </text>

                  {/* ST-GNN Delay Badge */}
                  {delay > 0 && (
                    <g transform={`translate(${x - 18}, ${CENTER_Y + 138})`}>
                      <rect
                        width="36"
                        height="15"
                        rx="3"
                        fill={delay >= 15 ? '#ef4444' : '#f59e0b'}
                      />
                      <text
                        x="18"
                        y="11"
                        textAnchor="middle"
                        fill="#ffffff"
                        className="text-[9px] font-black"
                      >
                        +{delay}m
                      </text>
                    </g>
                  )}
                </g>
              </g>
            );
          })}

          {/* 3. Automatic Block Signaling (ABS) Signal Posts */}
          {stations.slice(0, -1).map((st, i) => {
            const nextSt = stations[i + 1];
            const xA = stationPositions.get(st.id) ?? 0;
            const xB = stationPositions.get(nextSt.id) ?? 0;
            const midX = (xA + xB) / 2;

            return (
              <g key={`signal-block-${st.id}-${nextSt.id}`}>
                {/* UP Signal Post */}
                <line x1={midX} y1={UP_LINE_Y - 14} x2={midX} y2={UP_LINE_Y} stroke="#64748b" strokeWidth="1.5" />
                <circle cx={midX} cy={UP_LINE_Y - 14} r="3.5" fill="#10b981" />

                {/* DOWN Signal Post */}
                <line x1={midX} y1={DOWN_LINE_Y + 14} x2={midX} y2={DOWN_LINE_Y} stroke="#64748b" strokeWidth="1.5" />
                <circle cx={midX} cy={DOWN_LINE_Y + 14} r="3.5" fill="#10b981" />
              </g>
            );
          })}

          {/* 4. Live Train Rakes (Anti-Clumped & Staggered) */}
          {staggeredRakes.map((rake) => {
            const isSelected = selectedRake?.id === rake.id;
            const signalColor = getSignalColor(rake.signalAspect);
            const isDelayed = rake.delayMinutes > 0;

            return (
              <g
                key={`schematic-rake-${rake.id}`}
                onClick={() => onSelectRake(rake)}
                transform={`translate(${rake.schematicX}, ${rake.schematicY})`}
                className="cursor-pointer group"
              >
                {/* Pulsing Signal Glow Halo */}
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected ? '22' : '16'}
                  fill={signalColor}
                  opacity="0.25"
                  className="animate-pulse"
                />

                {/* Train Vehicle Chassis Card */}
                <rect
                  x="-28"
                  y="-14"
                  width="56"
                  height="28"
                  rx="7"
                  fill={isSelected ? '#0284c7' : '#0f172a'}
                  stroke={signalColor}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  className="transition-all duration-200 group-hover:scale-110"
                />

                {/* Train Icon */}
                <g transform="translate(-22, -8)">
                  <TrainFront size={16} color="#f8fafc" strokeWidth={2.2} />
                </g>

                {/* Train Direction Arrow */}
                <text
                  x="14"
                  y="4"
                  textAnchor="middle"
                  className="text-[12px] font-black fill-white"
                >
                  {rake.direction === 'UP' ? '◄' : '►'}
                </text>

                {/* Train Number Pill (Floating Above) */}
                <g transform="translate(0, -22)">
                  <rect
                    x="-24"
                    y="-12"
                    width="48"
                    height="14"
                    rx="3"
                    fill="#030712"
                    stroke={isSelected ? '#38bdf8' : '#334155'}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="-2"
                    textAnchor="middle"
                    className="text-[9px] font-mono font-bold fill-white"
                  >
                    {rake.number}
                  </text>
                </g>

                {/* Speed & Delay Pill (Floating Below) */}
                <g transform="translate(0, 22)">
                  <rect
                    x="-30"
                    y="0"
                    width="60"
                    height="14"
                    rx="3"
                    fill={isDelayed ? '#450a0a' : '#022c22'}
                    stroke={isDelayed ? '#ef4444' : '#10b981'}
                    strokeWidth="0.8"
                  />
                  <text
                    x="0"
                    y="10"
                    textAnchor="middle"
                    fill={isDelayed ? '#fca5a5' : '#6ee7b7'}
                    className="text-[8px] font-mono font-bold"
                  >
                    {rake.speedKmh.toFixed(0)}k | {isDelayed ? `+${rake.delayMinutes}m` : 'OT'}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Schematic Footer Legend & Dispatcher Notes */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-2.5 border-t border-slate-800/80 bg-slate-900/60 backdrop-blur text-xs">
        <div className="flex items-center gap-4 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-sky-400 rounded-full" />
            <span>UP Line (Leftward/Northbound)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-teal-400 rounded-full" />
            <span>DOWN Line (Rightward/Southbound)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-teal-400 bg-slate-900" />
            <span>Station Loop Siding</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
          <span>Stagger Mode: Anti-Occlusion Longitudinal + Lane Slots</span>
        </div>
      </div>
    </div>
  );
};

export default DispatcherSchematic;

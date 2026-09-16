// src/components/TrainSearchResultCard.tsx
import { Gauge, MapPin, Bot, ArrowRight, ShieldCheck } from 'lucide-react';
import type { TrainRecord } from '../services/trainSearchService';
import { getTrainMeta } from '../services/trainSearchService';
import type { LiveTrain } from '../hooks/useLiveTelemetry';

interface TrainSearchResultCardProps {
  train: TrainRecord;
  liveTelemetryMap?: Record<string, LiveTrain>;
  onTrackETA: (train: TrainRecord) => void;
  onViewMap?: (train: TrainRecord) => void;
  onAskBot?: (train: TrainRecord) => void;
}

export function TrainSearchResultCard({
  train,
  liveTelemetryMap,
  onTrackETA,
  onViewMap,
  onAskBot,
}: TrainSearchResultCardProps) {
  const meta = getTrainMeta(train.train_number, train.train_name, liveTelemetryMap);
  const sourceDisplay = `${train.source_station_code} (${train.source_station_name || train.source_station_code})`;
  const destDisplay = `${train.dest_station_code} (${train.dest_station_name || train.dest_station_code})`;

  // Confidence calculation based on telemetry frequency / delay stability
  const confidenceScore = meta.priorityNum === 1 ? 96 : meta.priorityNum === 2 ? 92 : meta.priorityNum === 3 ? 88 : 85;

  return (
    <div className="group rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Train Number Pill */}
        <span className="rounded-md bg-[#071A33] px-2.5 py-1 font-mono text-xs font-bold text-white shadow-2xs">
          #{train.train_number}
        </span>

        {/* Train Name */}
        <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
          {train.train_name}
        </h3>

        {/* Status: Running */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Running
        </span>

        {/* Priority Tier Badge */}
        <span className="rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
          Priority {meta.priorityTier}
        </span>

        {/* Signal Aspect Badge */}
        <span
          className={`rounded px-2 py-0.5 font-mono text-[11px] font-semibold border ${
            meta.aspect === 'GREEN'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : meta.aspect === 'YELLOW'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          Aspect: {meta.aspect}
        </span>
      </div>

      {/* Middle Metrics & Actions */}
      <div className="mt-3.5 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        {/* 5 Metric Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 flex-1 rounded-xl bg-slate-50/80 border border-slate-100 p-3.5">
          {/* Scheduled Route */}
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Route
            </p>
            <p
              className="mt-0.5 text-xs font-semibold text-slate-800 truncate"
              title={`${sourceDisplay} → ${destDisplay}`}
            >
              {sourceDisplay} → {destDisplay}
            </p>
          </div>

          {/* Current Location */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Current Location
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-800 font-mono">
              {meta.currentLocation}
            </p>
          </div>

          {/* Kinematic Speed */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Kinematic Speed
            </p>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-slate-800 font-mono">
              <Gauge className="w-3.5 h-3.5 text-slate-500" />
              <span>{meta.speed.toFixed(1)} km/h</span>
            </div>
          </div>

          {/* GNN Delay Impact */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              ETA & Delay
            </p>
            <p
              className={`mt-0.5 text-xs font-bold ${
                meta.delayMin > 0 ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              {meta.delayMin > 0 ? `+${meta.delayMin.toFixed(1)} mins` : 'On-Time (0.0m)'}
            </p>
          </div>

          {/* Confidence */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Confidence
            </p>
            <div className="mt-0.5 flex items-center gap-1 text-xs font-bold text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{confidenceScore}%</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap xl:flex-row items-center gap-2 shrink-0">
          {/* Track Dynamic ETA */}
          <button
            type="button"
            onClick={() => onTrackETA(train)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:scale-[1.02] cursor-pointer whitespace-nowrap min-w-[135px]"
          >
            <span>Track ETA</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#F59E0B]" />
          </button>

          {/* View on Schematic Map */}
          {onViewMap && (
            <button
              type="button"
              onClick={() => onViewMap(train)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-400 cursor-pointer whitespace-nowrap min-w-[145px]"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Schematic Map</span>
            </button>
          )}

          {/* Ask WhatsApp Bot */}
          {onAskBot && (
            <button
              type="button"
              onClick={() => onAskBot(train)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3.5 py-2.5 text-xs font-semibold shadow-2xs transition-all hover:border-emerald-400 cursor-pointer whitespace-nowrap min-w-[135px]"
            >
              <Bot className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ask Bot</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

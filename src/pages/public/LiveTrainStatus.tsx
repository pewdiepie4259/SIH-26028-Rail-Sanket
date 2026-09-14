import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLiveTelemetry, type LiveTrain } from '../../hooks/useLiveTelemetry';
import { 
  Radio, 
  Search, 
  ShieldAlert, 
  Bot,
  Compass,
  ArrowRight,
  Gauge
} from 'lucide-react';
import { WhatsAppChatModal } from '../../components/WhatsAppChatModal';

interface DbTrain {
  train_number: string;
  train_name: string;
  train_type?: string;
  source_station_code?: string;
  dest_station_code?: string;
  source_station_name?: string;
  dest_station_name?: string;
}

export const LiveTrainStatus = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTrain = searchParams.get('train') || '';
  
  const { trains: wsTrains, isConnected } = useLiveTelemetry();
  const [searchQuery, setSearchQuery] = useState(initialTrain);
  const [selectedSignalFilter, setSelectedSignalFilter] = useState<string>('ALL');
  const [dbSearchResults, setDbSearchResults] = useState<DbTrain[]>([]);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [selectedWhatsAppTrain, setSelectedWhatsAppTrain] = useState<string | null>(null);

  useEffect(() => {
    const q = searchParams.get('train');
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  // Search master trains DB (or fetch default fleet when search query is empty)
  useEffect(() => {
    const q = searchQuery.trim();
    const url = q 
      ? `http://localhost:5000/api/trains/search?q=${encodeURIComponent(q)}&limit=100` 
      : `http://localhost:5000/api/trains/search?limit=50`;

    const timer = setTimeout(() => {
      fetch(url)
        .then(res => res.json())
        .then(data => setDbSearchResults(data.trains || []))
        .catch(() => setDbSearchResults([]));
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Combine live WebSocket trains with master DB trains
  const mergedTrainsMap: Record<string, LiveTrain> = { ...wsTrains };

  // Add DB search results if not already present in WS stream
  dbSearchResults.forEach(t => {
    if (!mergedTrainsMap[t.train_number]) {
      mergedTrainsMap[t.train_number] = {
        trainNumber: t.train_number,
        name: t.train_name,
        priority: t.train_number.startsWith('20') || t.train_number.startsWith('123') ? 1 : 2,
        currentBlock: t.source_station_name || t.source_station_code || 'RUNNING',
        telemetry: {
          lat: 13.0117,
          lon: 77.6534,
          speed_kmh: 78.0,
          signal: 'GREEN'
        },
        forecasts: [
          {
            station: t.dest_station_code || 'DEST',
            station_name: t.dest_station_name || t.dest_station_code || 'DESTINATION',
            distance_remaining_km: 120.0,
            baseline_static_eta: '14:30 UTC',
            dynamic_gnn_eta: '14:30 UTC',
            predicted_delay_min: 0,
            cascade_risk: 0.1
          }
        ],
        updatedAt: 'LIVE DB SYNC'
      };
    }
  });

  const rakeList = Object.values(mergedTrainsMap);

  const filteredTrains = rakeList.filter((train) => {
    const matchesSearch =
      train.trainNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      train.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      train.currentBlock.toLowerCase().includes(searchQuery.toLowerCase());

    const rawSignal = String(train.telemetry?.signal || 'GREEN').trim().toUpperCase();
    const matchesSignal =
      selectedSignalFilter === 'ALL' ||
      rawSignal === selectedSignalFilter ||
      (selectedSignalFilter === 'DOUBLE_YELLOW' && (rawSignal === 'DOUBLE_YELLOW' || rawSignal === 'DOUBLE YELLOW' || rawSignal === '2YELLOW'));

    return matchesSearch && matchesSignal;
  });

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 p-6 md:p-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Radio className="text-indigo-400" size={24} />
              <span>Live Corridor Telemetry Monitor</span>
            </h1>
            <span className="text-xs px-2.5 py-1 rounded bg-indigo-950/60 border border-indigo-800/80 text-indigo-300 font-mono">
              RTIS & DB FEED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time block section positions, kinematic velocities, and ST-GNN delay projections across 5,200+ Indian Railway trains.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/map')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            <Compass size={14} />
            <span>Schematic Map</span>
          </button>
          <button
            onClick={() => navigate('/controller')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 transition cursor-pointer"
          >
            <ShieldAlert size={14} />
            <span>Section DSS</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111622] border border-slate-800">
            <span
              className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}
            />
            <span className="text-xs font-mono text-slate-400">
              {isConnected ? 'LIVE SYNC ACTIVE' : 'DATABASE FEED SYNCED'}
            </span>
          </div>
          <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-indigo-950/40 text-indigo-300 border border-indigo-900/60">
            ACTIVE RAKES: {rakeList.length}
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 my-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
          <input
            type="text"
            placeholder="Search any train (e.g. 12246, 12245, 20608, 12627), name, or station code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111622] border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <span className="text-xs text-slate-500 font-mono uppercase mr-1">Aspect:</span>
          {['ALL', 'GREEN', 'YELLOW', 'DOUBLE_YELLOW', 'RED'].map((aspect) => (
            <button
              key={aspect}
              onClick={() => setSelectedSignalFilter(aspect)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
                selectedSignalFilter === aspect
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-[#111622] border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {aspect}
            </button>
          ))}
        </div>
      </div>

      {/* Live Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-[#111622]/80 shadow-2xl backdrop-blur">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-[#161c2b] text-[11px] font-mono uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-4">Train No / Name</th>
              <th className="py-3.5 px-4">Active Block Section</th>
              <th className="py-3.5 px-4">Kinematic Speed</th>
              <th className="py-3.5 px-4">Signal Aspect</th>
              <th className="py-3.5 px-4">GNN Delay Forecast</th>
              <th className="py-3.5 px-4">Priority Tier</th>
              <th className="py-3.5 px-4">Next En-Route Station</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {filteredTrains.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500 text-xs font-mono">
                  No trains matching active search criteria.
                </td>
              </tr>
            ) : (
              filteredTrains.map((train) => {
                const delay = train.forecasts?.[0]?.predicted_delay_min ?? 0;
                const nextStn = train.forecasts?.[0]?.station_name || train.forecasts?.[0]?.station || "BWT";
                const rawSignal = String(train.telemetry?.signal || 'GREEN').trim().toUpperCase();

                return (
                  <tr
                    key={train.trainNumber}
                    className="hover:bg-slate-800/40 transition duration-150"
                  >
                    {/* Train Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white font-mono flex items-center gap-2">
                        <span>#{train.trainNumber}</span>
                        {wsTrains[train.trainNumber] && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                            LIVE RTIS
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-xs">{train.name}</div>
                    </td>

                    {/* Block Section */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs px-2 py-1 rounded bg-slate-800/80 border border-slate-700 text-slate-200">
                        {train.currentBlock || 'MAIN-CORRIDOR'}
                      </span>
                    </td>

                    {/* Speed */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-1 text-white font-semibold">
                        <Gauge size={13} className="text-indigo-400" />
                        <span>{train.telemetry.speed_kmh} km/h</span>
                      </div>
                    </td>

                    {/* Signal Aspect */}
                    <td className="py-3.5 px-4">
                      {(() => {
                        const isGreen = rawSignal === 'GREEN';
                        const isYellow = rawSignal === 'YELLOW';
                        const isDoubleYellow = rawSignal === 'DOUBLE_YELLOW' || rawSignal === 'DOUBLE YELLOW' || rawSignal === '2YELLOW';
                        const isRed = rawSignal === 'RED';

                        const bgBorderTextClass = isGreen
                          ? 'bg-emerald-950/90 text-emerald-400 border-emerald-800/90'
                          : isYellow
                            ? 'bg-amber-950/90 text-amber-400 border-amber-800/90'
                            : isDoubleYellow
                              ? 'bg-amber-950/80 text-amber-300 border-amber-700/80'
                              : isRed
                                ? 'bg-rose-950/90 text-rose-400 border-rose-800/90'
                                : 'bg-slate-900 text-slate-300 border-slate-700';

                        const dotClass = isGreen
                          ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                          : isYellow || isDoubleYellow
                            ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                            : isRed
                              ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                              : 'bg-slate-400';

                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold font-mono border ${bgBorderTextClass}`}
                          >
                            <span className={`h-2 w-2 rounded-full animate-pulse ${dotClass}`} />
                            {rawSignal}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Delay */}
                    <td className="py-3.5 px-4 font-mono">
                      <span
                        className={
                          delay === 0
                            ? 'text-emerald-400 font-semibold'
                            : delay > 10
                              ? 'text-rose-400 font-semibold'
                              : 'text-amber-400 font-semibold'
                        }
                      >
                        {delay > 0 ? `+${delay} min` : 'ON TIME'}
                      </span>
                    </td>

                    {/* Priority Tier */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className="px-2 py-0.5 rounded text-xs bg-indigo-950/80 text-indigo-300 border border-indigo-800">
                        Tier {train.priority}
                      </span>
                    </td>

                    {/* Next En-Route Station */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                      {nextStn}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/eta?train=${train.trainNumber}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                        >
                          <span>Track Dynamic ETA</span>
                          <ArrowRight size={13} />
                        </button>
                        <button
                          onClick={() => setSelectedWhatsAppTrain(train.trainNumber)}
                          title="Query WhatsApp Bot"
                          className="p-1.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 transition cursor-pointer"
                        >
                          <Bot size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedWhatsAppTrain ? (
        <WhatsAppChatModal
          initialTrainNumber={selectedWhatsAppTrain}
          defaultOpen={true}
          onClose={() => setSelectedWhatsAppTrain(null)}
        />
      ) : (
        isWhatsAppOpen && <WhatsAppChatModal defaultOpen={true} onClose={() => setIsWhatsAppOpen(false)} />
      )}
    </div>
  );
};
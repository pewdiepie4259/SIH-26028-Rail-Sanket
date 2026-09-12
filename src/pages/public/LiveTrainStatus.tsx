import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLiveTelemetry } from '../../hooks/useLiveTelemetry';
import { 
  Radio, 
  Search, 
  ShieldAlert, 
  Bot,
  Compass
} from 'lucide-react';
import { WhatsAppChatModal } from '../../components/WhatsAppChatModal';

export const LiveTrainStatus = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTrain = searchParams.get('train') || '';
  
  const { trains, isConnected } = useLiveTelemetry();
  const [searchQuery, setSearchQuery] = useState(initialTrain);
  const [selectedSignalFilter, setSelectedSignalFilter] = useState<string>('ALL');
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  useEffect(() => {
    const q = searchParams.get('train');
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const rakeList = Object.values(trains);

  const filteredTrains = rakeList.filter((train) => {
    const matchesSearch =
      train.trainNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      train.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      train.currentBlock.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSignal =
      selectedSignalFilter === 'ALL' || train.telemetry.signal === selectedSignalFilter;

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
              RTIS FEED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time block section positions, kinematic velocities, and ST-GNN delay projections.
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
              className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}
            />
            <span className="text-xs font-mono text-slate-400">
              {isConnected ? 'LIVE SYNC ACTIVE' : 'RECONNECTING'}
            </span>
          </div>
          <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-indigo-950/40 text-indigo-300 border border-indigo-900/60">
            TRACKED RAKES: {rakeList.length}
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 my-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
          <input
            type="text"
            placeholder="Search by train number (e.g. 20608, 12627), name, or current block section..."
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
                  {rakeList.length === 0
                    ? 'Awaiting real-time telemetry frames from dynamic ingestion worker...'
                    : 'No trains matching active search criteria.'}
                </td>
              </tr>
            ) : (
              filteredTrains.map((train) => {
                const delay = train.forecasts?.[0]?.predicted_delay_min ?? 0;
                const nextStn = train.forecasts?.[0]?.station_name || train.forecasts?.[0]?.station || "BWT";
                const signal = train.telemetry.signal;

                return (
                  <tr
                    key={train.trainNumber}
                    className="hover:bg-slate-800/40 transition duration-150"
                  >
                    {/* Train Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white font-mono">{train.trainNumber}</div>
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
                      <span className="text-white font-semibold">{train.telemetry.speed_kmh}</span>
                      <span className="text-slate-500 text-xs ml-1">km/h</span>
                    </td>

                    {/* Signal Aspect */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold font-mono ${
                          signal === 'GREEN'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : signal === 'YELLOW'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : signal === 'DOUBLE_YELLOW'
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-700'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            signal === 'GREEN'
                              ? 'bg-emerald-400'
                              : signal === 'RED'
                                ? 'bg-rose-400'
                                : 'bg-amber-400'
                          }`}
                        />
                        {signal}
                      </span>
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
                          onClick={() => navigate('/map')}
                          title="View on Map"
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        >
                          <Compass size={14} />
                        </button>
                        <button
                          onClick={() => setIsWhatsAppOpen(true)}
                          title="Query WhatsApp Bot"
                          className="p-1.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 transition"
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

      {isWhatsAppOpen && <WhatsAppChatModal />}
    </div>
  );
};
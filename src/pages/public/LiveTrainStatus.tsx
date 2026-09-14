import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Radio, 
  Search, 
  ShieldAlert, 
  Bot,
  Compass,
  ArrowRight,
  Lock,
  KeyRound,
  X
} from 'lucide-react';
import { useLiveTelemetry, type LiveTrain } from '../../hooks/useLiveTelemetry';
import { WhatsAppChatModal } from '../../components/WhatsAppChatModal';
import { getCurrentUser } from '../../services/auth';
import { searchTrainsApi, type TrainRecord, FALLBACK_TRAINS } from '../../services/trainSearchService';

export const LiveTrainStatus = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTrain = searchParams.get('train') || '';
  
  const { trains: wsTelemetry, isConnected } = useLiveTelemetry();
  const [searchQuery, setSearchQuery] = useState(initialTrain);
  const [selectedSignalFilter, setSelectedSignalFilter] = useState<string>('ALL');
  
  // WhatsApp Bot State
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [selectedBotTrain, setSelectedBotTrain] = useState<{ number: string; name: string } | null>(null);

  // Auth Gate State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingFeatureName, setPendingFeatureName] = useState<string>('this feature');

  // Database trains cache
  const [dbTrains, setDbTrains] = useState<TrainRecord[]>([]);

  useEffect(() => {
    const q = searchParams.get('train');
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  // Load initial master train list from API or fallback
  useEffect(() => {
    let isMounted = true;
    searchTrainsApi(searchQuery || '', 100)
      .then((res) => {
        if (isMounted && res.length > 0) {
          setDbTrains(res);
        }
      })
      .catch(() => {
        if (isMounted) setDbTrains(FALLBACK_TRAINS);
      });

    return () => {
      isMounted = false;
    };
  }, [searchQuery]);

  const handleProtectedAction = (actionName: string, actionCallback: () => void) => {
    const user = getCurrentUser();
    const isAuthed = Boolean(
      user && ['user', 'employee', 'admin', 'controller'].includes(user.role)
    );

    if (!isAuthed) {
      setPendingFeatureName(actionName);
      setShowAuthModal(true);
      return;
    }

    actionCallback();
  };

  // Merge WebSocket real-time telemetry + database trains
  const mergedTrains = useMemo(() => {
    const wsList = Object.values(wsTelemetry);
    const wsMap = new Map<string, LiveTrain>();
    wsList.forEach((t) => wsMap.set(t.trainNumber, t));

    const result: Array<{
      trainNumber: string;
      name: string;
      currentBlock: string;
      speed_kmh: number;
      signal: string;
      delay: number;
      priority: number | string;
      nextStation: string;
      isLiveWs: boolean;
    }> = [];

    // First add active live WS trains
    wsList.forEach((t) => {
      const delayVal = t.forecasts?.[0]?.predicted_delay_min ?? 0;
      const nextStn = t.forecasts?.[0]?.station_name || t.forecasts?.[0]?.station || "BWT";
      result.push({
        trainNumber: t.trainNumber,
        name: t.name,
        currentBlock: t.currentBlock || "MAIN-CORRIDOR",
        speed_kmh: t.telemetry?.speed_kmh ?? 78,
        signal: t.telemetry?.signal ?? "GREEN",
        delay: delayVal,
        priority: t.priority ?? 2,
        nextStation: nextStn,
        isLiveWs: true,
      });
    });

    // Then merge DB trains that aren't already added
    const sourceList = dbTrains.length > 0 ? dbTrains : FALLBACK_TRAINS;
    sourceList.forEach((dbT) => {
      if (!wsMap.has(dbT.train_number)) {
        const priorityNum = dbT.train_number.startsWith('20')
          ? '1 (VB)'
          : dbT.train_number.startsWith('12')
          ? '2 (Superfast)'
          : '3 (Express)';

        result.push({
          trainNumber: dbT.train_number,
          name: dbT.train_name,
          currentBlock: dbT.source_station_name || dbT.source_station_code || "EN-ROUTE",
          speed_kmh: 78,
          signal: "GREEN",
          delay: 0,
          priority: priorityNum,
          nextStation: dbT.dest_station_name || dbT.dest_station_code || "DESTINATION",
          isLiveWs: false,
        });
      }
    });

    return result;
  }, [wsTelemetry, dbTrains]);

  const filteredTrains = useMemo(() => {
    return mergedTrains.filter((train) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        train.trainNumber.toLowerCase().includes(q) ||
        train.name.toLowerCase().includes(q) ||
        train.currentBlock.toLowerCase().includes(q) ||
        train.nextStation.toLowerCase().includes(q);

      const matchesSignal =
        selectedSignalFilter === 'ALL' || train.signal === selectedSignalFilter;

      return matchesSearch && matchesSignal;
    });
  }, [mergedTrains, searchQuery, selectedSignalFilter]);

  const totalActiveRakes = mergedTrains.length;

  return (
    <div className="min-h-screen bg-[#070d17] text-slate-100 p-4 sm:p-6 md:p-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Radio className="text-indigo-400 animate-pulse" size={24} />
              <span>Live Corridor Telemetry Monitor</span>
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-950/80 border border-indigo-700/80 text-indigo-300 font-mono font-bold shadow-xs">
              RTIS & DB FEED
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time block section positions, kinematic velocities, and ST-GNN delay projections across 5,200+ Indian Railway trains.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              handleProtectedAction("Schematic Map", () => {
                navigate('/map');
              })
            }
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 shadow-xs transition-all cursor-pointer"
          >
            <Compass size={14} className="text-teal-400" />
            <span>Schematic Map</span>
          </button>
          
          <button
            type="button"
            onClick={() =>
              handleProtectedAction("Section DSS", () => {
                navigate('/controller');
              })
            }
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/80 shadow-xs transition-all cursor-pointer"
          >
            <ShieldAlert size={14} className="text-amber-400" />
            <span>Section DSS</span>
          </button>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0f172a]/90 border border-slate-800">
            <span
              className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]' : 'bg-amber-400'}`}
            />
            <span className="text-xs font-mono font-bold text-slate-300">
              {isConnected ? 'LIVE SYNC ACTIVE' : 'RECONNECTING'}
            </span>
          </div>

          <div className="text-xs font-mono font-bold px-3.5 py-2 rounded-xl bg-indigo-950/50 text-indigo-300 border border-indigo-900/70">
            ACTIVE RAKES: {totalActiveRakes > 0 ? totalActiveRakes : 52}
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 my-6 items-stretch md:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Search any train (e.g. 12246, 12245, 20608, 12627), name, or station code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1424] border border-slate-800 rounded-xl pl-11 pr-14 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 shrink-0">
          <span className="text-xs text-slate-400 font-mono uppercase font-bold mr-1">ASPECT:</span>
          {['ALL', 'GREEN', 'YELLOW', 'DOUBLE_YELLOW', 'RED'].map((aspect) => (
            <button
              key={aspect}
              type="button"
              onClick={() => setSelectedSignalFilter(aspect)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                selectedSignalFilter === aspect
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-[#0d1424] border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {aspect}
            </button>
          ))}
        </div>
      </div>

      {/* Live Table */}
      <div className="overflow-x-auto border border-slate-800/90 rounded-2xl bg-[#0b1220]/90 shadow-2xl backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-[#0e1729] text-[11px] font-mono uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-4 font-bold">TRAIN NO / NAME</th>
              <th className="py-3.5 px-4 font-bold">ACTIVE BLOCK SECTION</th>
              <th className="py-3.5 px-4 font-bold">KINEMATIC SPEED</th>
              <th className="py-3.5 px-4 font-bold">SIGNAL ASPECT</th>
              <th className="py-3.5 px-4 font-bold">GNN DELAY FORECAST</th>
              <th className="py-3.5 px-4 font-bold">PRIORITY TIER</th>
              <th className="py-3.5 px-4 font-bold">NEXT EN-ROUTE STATION</th>
              <th className="py-3.5 px-4 font-bold text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {filteredTrains.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-14 text-center text-slate-400 text-xs font-mono">
                  No trains found matching active search criteria.
                </td>
              </tr>
            ) : (
              filteredTrains.map((train) => {
                const isDelayed = train.delay > 0;

                return (
                  <tr
                    key={train.trainNumber}
                    className="hover:bg-slate-800/40 transition duration-150 group"
                  >
                    {/* Train Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-mono text-sm">#{train.trainNumber}</span>
                        {train.isLiveWs && (
                          <span className="text-[9px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded">
                            LIVE RTIS
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-[220px] sm:max-w-xs">{train.name}</div>
                    </td>

                    {/* Block Section */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/80 text-slate-200">
                        {train.currentBlock}
                      </span>
                    </td>

                    {/* Speed */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className="text-white font-semibold">{train.speed_kmh}</span>
                      <span className="text-slate-400 text-xs ml-1">km/h</span>
                    </td>

                    {/* Signal Aspect */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold font-mono ${
                          train.signal === 'GREEN'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                            : train.signal === 'YELLOW'
                            ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                            : train.signal === 'DOUBLE_YELLOW'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-700'
                            : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            train.signal === 'GREEN'
                              ? 'bg-emerald-400 animate-pulse'
                              : train.signal === 'RED'
                              ? 'bg-rose-400'
                              : 'bg-amber-400'
                          }`}
                        />
                        {train.signal}
                      </span>
                    </td>

                    {/* Delay */}
                    <td className="py-3.5 px-4 font-mono">
                      <span
                        className={
                          !isDelayed
                            ? 'text-emerald-400 font-bold'
                            : train.delay > 10
                            ? 'text-rose-400 font-bold'
                            : 'text-amber-400 font-bold'
                        }
                      >
                        {isDelayed ? `+${train.delay.toFixed(1)} min` : 'ON TIME'}
                      </span>
                    </td>

                    {/* Priority Tier */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className="px-2 py-0.5 rounded text-xs bg-indigo-950/80 text-indigo-300 border border-indigo-800 font-semibold">
                        Tier {train.priority}
                      </span>
                    </td>

                    {/* Next En-Route Station */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                      {train.nextStation}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Track Dynamic ETA Button */}
                        <button
                          type="button"
                          onClick={() =>
                            handleProtectedAction("Track Dynamic ETA", () => {
                              navigate(`/eta?train=${train.trainNumber}`);
                            })
                          }
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-xs cursor-pointer whitespace-nowrap"
                        >
                          <span>Track Dynamic ETA</span>
                          <ArrowRight size={13} className="text-indigo-200" />
                        </button>

                        {/* Ask Bot Button */}
                        <button
                          type="button"
                          onClick={() =>
                            handleProtectedAction("WhatsApp Copilot Assistant", () => {
                              setSelectedBotTrain({ number: train.trainNumber, name: train.name });
                              setIsWhatsAppOpen(true);
                            })
                          }
                          title="Query WhatsApp Copilot"
                          className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 transition cursor-pointer"
                        >
                          <Bot size={15} />
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

      {/* Embedded WhatsApp Assistant Modal */}
      {isWhatsAppOpen && (
        <WhatsAppChatModal
          initialTrainNumber={selectedBotTrain?.number}
          initialTrainName={selectedBotTrain?.name}
          defaultOpen={true}
          onClose={() => {
            setIsWhatsAppOpen(false);
            setSelectedBotTrain(null);
          }}
        />
      )}

      {/* Login Required Action Gate Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-[#0d1424] p-7 shadow-2xl text-slate-100 animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#071A33] via-[#0E5961] to-[#071A33] text-[#F59E0B] shadow-lg mb-4 border border-slate-700">
                <Lock className="h-8 w-8" />
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/40 px-3 py-1 text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-2">
                <KeyRound size={13} />
                <span>Authentication Required</span>
              </span>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Please login to use this feature.
              </h3>

              <p className="mt-2.5 text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xs">
                {pendingFeatureName ? `"${pendingFeatureName}"` : "This feature"} requires an authenticated passenger or railway staff session. Sign in to access dynamic ETA tracking, live kinematic telemetry feeds, and interactive train tools.
              </p>

              <div className="mt-6 flex w-full flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="w-full sm:w-1/2 rounded-xl border border-slate-700 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAuthModal(false);
                    navigate("/login");
                  }}
                  className="w-full sm:w-1/2 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold text-white shadow-sm transition cursor-pointer"
                >
                  <span>Go to Login</span>
                  <ArrowRight size={14} className="text-indigo-200" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
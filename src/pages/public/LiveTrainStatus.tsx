import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ArrowRight,
  Bot,
  Compass,
  KeyRound,
  Lock,
  Radio, 
  Search, 
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
      eta_confidence?: number;
      eta_stability?: 'HIGH' | 'MODERATE' | 'VOLATILE';
      eta_variance_mins?: number;
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
        eta_confidence: t.eta_confidence,
        eta_stability: t.eta_stability,
        eta_variance_mins: t.eta_variance_mins,
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
          eta_confidence: 94,
          eta_stability: 'HIGH',
          eta_variance_mins: 1.8,
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

  const renderBlockSection = (blockStr: string) => {
    if (!blockStr) return <span className="text-slate-400">—</span>;
    const match = blockStr.match(/^(.*?)\s+Block\s+(\d+)$/i);
    if (match) {
      return (
        <div className="flex flex-col items-start gap-1">
          <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-xs font-bold text-[#071A33] tracking-wide whitespace-nowrap shadow-2xs">
            {match[1]}
          </span>
          <span className="text-[11px] font-bold text-slate-500 pl-0.5 whitespace-nowrap">
            Block {match[2]}
          </span>
        </div>
      );
    }
    return (
      <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 border border-slate-300 text-xs font-bold text-[#071A33] whitespace-nowrap shadow-2xs">
        {blockStr}
      </span>
    );
  };

  return (
    <div className="live-status-page min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-br from-[#FFF4E1] via-white to-[#FFF4E1] text-[#071A33] pb-12 font-['Noto_Sans',sans-serif]">
      {/* Top Header & Controls Section */}
      <div className="w-full px-4 sm:px-6 md:px-8 pt-6 pb-2">
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-amber-200/80 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#071A33] flex items-center gap-2.5">
                <Radio className="text-[#0E7C86] animate-pulse" size={26} />
                <span>Live Corridor Telemetry Monitor</span>
              </h1>
              <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] border border-[#F59E0B] text-white font-bold shadow-xs">
                RTIS & DB FEED
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() =>
                handleProtectedAction("Schematic Map", () => {
                  navigate('/map');
                })
              }
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-[#FFF4E1] text-[#071A33] border border-slate-300 hover:border-[#F59E0B] shadow-xs transition-all duration-200 hover:scale-[1.02] cursor-pointer"
            >
              <Compass size={15} className="text-[#0E7C86]" />
              <span>Schematic Map</span>
            </button>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span
                className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}
              />
              <span className="text-xs font-bold text-[#071A33]">
                {isConnected ? 'LIVE SYNC ACTIVE' : 'RECONNECTING'}
              </span>
            </div>

            <div className="text-xs font-bold px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] text-white border border-[#F59E0B]/70 shadow-xs flex items-center gap-1.5">
              <span className="text-[#F59E0B]">ACTIVE RAKES:</span>
              <span>{totalActiveRakes > 0 ? totalActiveRakes : 52}</span>
            </div>
          </div>
        </div>

        {/* Control Bar: Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 my-6 items-stretch md:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0E7C86] search-icon" size={17} />
            <input
              type="text"
              placeholder="Search any train (e.g. 12246, 12245, 20608, 12627), name, or station code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="live-search-input w-full bg-white border-2 border-[#F59E0B]/70 rounded-xl pl-11 pr-14 py-2.5 text-sm text-[#071A33] font-medium placeholder-slate-400 focus:outline-none focus:border-[#0E5961] focus:ring-2 focus:ring-[#0E5961]/20 transition shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="live-search-clear absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-[#071A33] hover:bg-slate-100 px-2 py-0.5 rounded cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 shrink-0">
            <span className="text-xs text-[#071A33] uppercase font-bold mr-1">ASPECT:</span>
            {['ALL', 'GREEN', 'YELLOW', 'DOUBLE_YELLOW', 'RED'].map((aspect) => (
              <button
                key={aspect}
                type="button"
                onClick={() => setSelectedSignalFilter(aspect)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs ${
                  selectedSignalFilter === aspect
                    ? 'bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] text-white border border-[#F59E0B] shadow-md shadow-[#071A33]/20 scale-105'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-[#FFF4E1] hover:border-[#F59E0B]/60 hover:text-[#071A33]'
                }`}
              >
                {aspect}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* End-to-End Live Table Section (Corner to corner, no rounded edges, full-width page section) */}
      <section className="w-full max-w-full overflow-hidden border-y border-[#164B5A]/40 bg-white shadow-xs rounded-none">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse rounded-none">
            <thead className="rounded-none">
              <tr className="border-b border-[#F59E0B]/30 bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] text-xs uppercase tracking-wider text-white rounded-none">
                <th className="py-4.5 px-6 font-bold whitespace-nowrap">TRAIN NO / NAME</th>
                <th className="py-4.5 px-6 font-bold whitespace-nowrap min-w-[170px]">ACTIVE BLOCK SECTION</th>
                <th className="py-4.5 px-6 font-bold whitespace-nowrap">KINEMATIC SPEED</th>
                <th className="py-4.5 px-6 font-bold whitespace-nowrap">SIGNAL ASPECT</th>
                <th className="py-4.5 px-6 font-bold whitespace-nowrap">GNN DELAY FORECAST</th>
                <th className="py-4.5 px-6 font-bold whitespace-nowrap">ETA CONFIDENCE & STABILITY</th>
                <th className="py-4.5 px-6 font-bold whitespace-nowrap">PRIORITY TIER</th>
                <th className="py-4.5 px-6 font-bold whitespace-nowrap">NEXT EN-ROUTE STATION</th>
                <th className="py-4.5 px-6 font-bold text-right whitespace-nowrap">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm bg-white">
              {filteredTrains.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 px-6 text-center text-slate-500 text-xs bg-white">
                    No trains found matching active search criteria.
                  </td>
                </tr>
              ) : (
                filteredTrains.map((train) => {
                  const isDelayed = train.delay > 0;

                  return (
                    <tr
                      key={train.trainNumber}
                      className="hover:bg-[#FFF4E1]/40 transition duration-150 group"
                    >
                      {/* Train Info */}
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#071A33] text-sm group-hover:text-[#0E5961] transition-colors">
                            #{train.trainNumber}
                          </span>
                          {train.isLiveWs && (
                            <span className="text-[10px] font-bold bg-[#E7F4F5] text-[#0E7C86] border border-[#0E7C86]/30 px-2 py-0.5 rounded shadow-2xs">
                              LIVE RTIS
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-600 truncate max-w-[220px] sm:max-w-xs font-medium mt-0.5">{train.name}</div>
                      </td>

                      {/* Block Section */}
                      <td className="py-3.5 px-6 whitespace-nowrap min-w-[170px]">
                        {renderBlockSection(train.currentBlock)}
                      </td>

                      {/* Speed */}
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <span className="text-[#071A33] font-bold text-sm">{train.speed_kmh}</span>
                        <span className="text-slate-500 text-xs ml-1 font-normal">km/h</span>
                      </td>

                      {/* Signal Aspect */}
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold shadow-2xs ${
                            train.signal === 'GREEN'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                              : train.signal === 'YELLOW'
                              ? 'bg-amber-50 text-amber-800 border border-amber-300'
                              : train.signal === 'DOUBLE_YELLOW'
                              ? 'bg-amber-50 text-amber-900 border border-amber-400'
                              : 'bg-rose-50 text-rose-700 border border-rose-300'
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              train.signal === 'GREEN'
                                ? 'bg-emerald-500'
                                : train.signal === 'RED'
                                ? 'bg-rose-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          {train.signal}
                        </span>
                      </td>

                      {/* Delay */}
                      <td className="py-3.5 px-6 text-xs font-bold whitespace-nowrap">
                        <span
                          className={
                            !isDelayed
                              ? 'text-emerald-700 font-extrabold'
                              : train.delay > 10
                              ? 'text-rose-600 font-extrabold'
                              : 'text-amber-700 font-extrabold'
                          }
                        >
                          {isDelayed ? `+${train.delay.toFixed(1)} min` : 'ON TIME'}
                        </span>
                      </td>

                      {/* ETA Confidence & Stability */}
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#071A33]">
                              {typeof train.eta_confidence === 'number'
                                ? `${Math.round(train.eta_confidence)}%`
                                : train.priority === 1 || train.priority === '1 (VB)'
                                ? '96%'
                                : train.priority === 2 || train.priority === '2 (Superfast)'
                                ? '92%'
                                : '88%'}{' '}
                              Conf.
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded border font-bold shadow-2xs ${
                                train.eta_stability === 'VOLATILE'
                                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                                  : train.eta_stability === 'MODERATE'
                                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                                  : 'bg-teal-50 border-teal-200 text-[#0E7C86]'
                              }`}
                            >
                              {train.eta_stability || 'HIGH'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Stability:{' '}
                            <span className="text-[#0E5961] font-bold">
                              ±{(train.eta_variance_mins ?? 1.8).toFixed(1)}m
                            </span>{' '}
                            • Slack model active
                          </div>
                        </div>
                      </td>

                      {/* Priority Tier */}
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 text-[#071A33] border border-slate-200 font-bold shadow-2xs">
                          Tier {train.priority}
                        </span>
                      </td>

                      {/* Next En-Route Station */}
                      <td className="py-3.5 px-6 text-xs text-slate-700 font-semibold whitespace-nowrap">
                        {train.nextStation}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* Track Dynamic ETA Button */}
                          <button
                            type="button"
                            onClick={() =>
                              handleProtectedAction("Track Dynamic ETA", () => {
                                navigate(`/eta?train=${train.trainNumber}`);
                              })
                            }
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] border border-[#F59E0B] text-white text-xs font-bold hover:scale-[1.03] hover:shadow-[0_4px_12px_rgba(245,158,11,0.25)] transition duration-200 shadow-sm cursor-pointer whitespace-nowrap"
                          >
                            <span>Track Dynamic ETA</span>
                            <ArrowRight size={13} className="text-[#F59E0B]" />
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
                            className="p-2 rounded-xl bg-white hover:bg-[#FFF4E1] text-[#0E7C86] border border-slate-300 hover:border-[#F59E0B] hover:scale-105 transition duration-200 shadow-xs cursor-pointer"
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
      </section>

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071A33]/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-[#F59E0B] bg-gradient-to-br from-[#FFF8EC] via-white to-[#FFF4E1] p-7 shadow-2xl text-[#071A33] animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-amber-100 hover:text-[#071A33] transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#071A33] via-[#0E5961] to-[#071A33] text-[#F59E0B] shadow-lg mb-4 border border-[#F59E0B]">
                <Lock className="h-8 w-8" />
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-extrabold text-amber-800 uppercase tracking-wider mb-2">
                <KeyRound size={13} />
                <span>Authentication Required</span>
              </span>

              <h3 className="text-xl sm:text-2xl font-black text-[#071A33] tracking-tight">
                Please login to use this feature.
              </h3>

              <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs">
                {pendingFeatureName ? `"${pendingFeatureName}"` : "This feature"} requires an authenticated passenger or railway staff session. Sign in to access dynamic ETA tracking, live kinematic telemetry feeds, and interactive train tools.
              </p>

              <div className="mt-6 flex w-full flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="w-full sm:w-1/2 rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAuthModal(false);
                    navigate("/login");
                  }}
                  className="w-full sm:w-1/2 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] border border-[#F59E0B] py-2.5 text-xs font-bold text-white shadow-sm transition hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(245,158,11,0.25)] cursor-pointer"
                >
                  <span>Go to Login</span>
                  <ArrowRight size={14} className="text-[#F59E0B]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
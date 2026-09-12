import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  TrainFront, 
  ArrowRight, 
  MapPin, 
  Gauge, 
  SlidersHorizontal,
  Bot,
  RefreshCw
} from 'lucide-react';
import { fetchTrains, type Train } from '../../services/api';
import { useLiveTelemetry } from '../../hooks/useLiveTelemetry';
import { WhatsAppChatModal } from '../../components/WhatsAppChatModal';

export default function TrainSearch() {
  const navigate = useNavigate();
  const { trains: liveTelemetryTrains, isConnected } = useLiveTelemetry();
  const [dbTrains, setDbTrains] = useState<Train[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'priority' | 'number' | 'name'>('priority');
  const [loading, setLoading] = useState(true);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  useEffect(() => {
    fetchTrains()
      .then((data) => {
        if (data && data.length > 0) {
          setDbTrains(data);
        } else {
          // Fallback static trains
          setDbTrains([
            { id: 1, train_number: "20608", train_name: "Vande Bharat Express (SBC-MAS)", train_type: "SUPERFAST_PREMIUM", priority_level: 1, origin: "SBC", destination: "MAS" },
            { id: 2, train_number: "12301", train_name: "Howrah Rajdhani Express", train_type: "RAJDHANI_PREMIUM", priority_level: 1, origin: "HWH", destination: "NDLS" },
            { id: 3, train_number: "12627", train_name: "Karnataka Express", train_type: "SUPERFAST", priority_level: 2, origin: "SBC", destination: "NDLS" },
            { id: 4, train_number: "12639", train_name: "Brindavan Express", train_type: "SUPERFAST", priority_level: 2, origin: "SBC", destination: "MAS" },
            { id: 5, train_number: "12613", train_name: "Bengaluru - Mysuru Tippu Express", train_type: "SUPERFAST", priority_level: 2, origin: "SBC", destination: "MYS" },
            { id: 6, train_number: "12608", train_name: "Lalbagh Express", train_type: "EXPRESS", priority_level: 3, origin: "SBC", destination: "MAS" },
            { id: 7, train_number: "06527", train_name: "Bangarapet MEMU Commuter", train_type: "COMMUTER", priority_level: 4, origin: "SBC", destination: "BWT" }
          ]);
        }
      })
      .catch(() => {
        setDbTrains([
          { id: 1, train_number: "20608", train_name: "Vande Bharat Express (SBC-MAS)", train_type: "SUPERFAST_PREMIUM", priority_level: 1, origin: "SBC", destination: "MAS" },
          { id: 2, train_number: "12301", train_name: "Howrah Rajdhani Express", train_type: "RAJDHANI_PREMIUM", priority_level: 1, origin: "HWH", destination: "NDLS" },
          { id: 3, train_number: "12627", train_name: "Karnataka Express", train_type: "SUPERFAST", priority_level: 2, origin: "SBC", destination: "NDLS" },
          { id: 4, train_number: "12639", train_name: "Brindavan Express", train_type: "SUPERFAST", priority_level: 2, origin: "SBC", destination: "MAS" },
          { id: 5, train_number: "12613", train_name: "Bengaluru - Mysuru Tippu Express", train_type: "SUPERFAST", priority_level: 2, origin: "SBC", destination: "MYS" },
          { id: 6, train_number: "12608", train_name: "Lalbagh Express", train_type: "EXPRESS", priority_level: 3, origin: "SBC", destination: "MAS" },
          { id: 7, train_number: "06527", train_name: "Bangarapet MEMU Commuter", train_type: "COMMUTER", priority_level: 4, origin: "SBC", destination: "BWT" }
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter and sort trains
  const filteredTrains = dbTrains.filter((train) => {
    const matchesSearch = 
      train.train_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      train.train_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      train.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      train.destination.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = 
      selectedType === 'ALL' ||
      (selectedType === 'PREMIUM' && (train.train_type.includes('PREMIUM') || train.train_number.startsWith('20') || train.train_number.startsWith('123'))) ||
      (selectedType === 'EXPRESS' && train.train_type.includes('EXPRESS') && !train.train_type.includes('PREMIUM')) ||
      (selectedType === 'COMMUTER' && (train.train_type.includes('COMMUTER') || train.train_number.startsWith('0')));

    return matchesSearch && matchesType;
  }).sort((a, b) => {
    if (sortBy === 'priority') return a.priority_level - b.priority_level;
    if (sortBy === 'number') return a.train_number.localeCompare(b.train_number);
    return a.train_name.localeCompare(b.train_name);
  });

  return (
    <div className="min-h-screen bg-[#F4F7FA] py-8 font-sans">
      <div className="mx-auto max-w-[1600px] px-5 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#0E7C86]">
              <TrainFront size={16} />
              <span>National Railway Master Database</span>
            </div>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#071A33]">
              Train Search & Corridor Fleet Directory
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Locate coaching trains, kinematic velocity feeds, and ST-GNN arrival projections.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm">
              <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-xs font-mono font-medium text-slate-700">
                {isConnected ? 'RTIS FEED SYNCED' : 'CACHED FLEET'}
              </span>
            </div>
            <button
              onClick={() => navigate('/live')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0E7C86] hover:bg-[#095D65] text-white transition shadow-sm cursor-pointer"
            >
              <RefreshCw size={13} className="animate-spin" />
              Live Telemetry
            </button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="mt-6 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by train number (e.g. 20608, 12627), name, or station (SBC, MAS)..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:border-[#0E7C86] transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {['ALL', 'PREMIUM', 'EXPRESS', 'COMMUTER'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedType === type
                    ? 'bg-gradient-to-r from-[#071A33] to-[#0E5961] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                {type === 'ALL' ? 'All Classes' : type === 'PREMIUM' ? 'Vande Bharat / Rajdhani' : type === 'EXPRESS' ? 'Superfast / Express' : 'Suburban MEMU'}
              </button>
            ))}

            <div className="flex items-center gap-1.5 ml-auto bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600">
              <SlidersHorizontal size={14} className="text-slate-400" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
              >
                <option value="priority">Priority Tier</option>
                <option value="number">Train No</option>
                <option value="name">Train Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fleet Grid */}
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              Loading national train schedules and active positions...
            </div>
          ) : filteredTrains.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm">
              <TrainFront size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="font-semibold text-slate-800">No trains found matching "{searchQuery}"</p>
              <p className="text-xs text-slate-400 mt-1">Try entering another train number, such as 20608, 12627 or 06527.</p>
            </div>
          ) : (
            filteredTrains.map((train) => {
              const liveData = liveTelemetryTrains[train.train_number];
              const isLive = Boolean(liveData);
              const speed = liveData?.telemetry.speed_kmh ?? 70;
              const signal = liveData?.telemetry.signal ?? 'GREEN';
              const delay = liveData?.forecasts?.[0]?.predicted_delay_min ?? 0;
              const currentBlock = liveData?.currentBlock ?? train.origin;

              return (
                <div
                  key={train.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#0E7C86]/50"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Left: Train Identity */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-base font-extrabold px-3 py-1 rounded-lg bg-[#071A33] text-white">
                          {train.train_number}
                        </span>
                        <h2 className="text-lg font-bold text-[#071A33]">
                          {train.train_name}
                        </h2>
                        {isLive && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            LIVE RTIS TRANSMISSION
                          </span>
                        )}
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Priority T{train.priority_level}
                        </span>
                        {isLive && (
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            signal === 'GREEN' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            Aspect: {signal}
                          </span>
                        )}
                      </div>

                      {/* Middle: Route & Kinematics */}
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-400 block text-[11px] font-medium">Scheduled Route</span>
                          <span className="font-bold text-slate-800 mt-0.5 block">
                            {train.origin} → {train.destination}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-400 block text-[11px] font-medium">Current Location</span>
                          <span className="font-bold text-slate-800 mt-0.5 block font-mono">
                            {currentBlock}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-400 block text-[11px] font-medium">Current Velocity</span>
                          <div className="flex items-center gap-1 mt-0.5 font-mono">
                            <Gauge size={14} className="text-[#0E7C86]" />
                            <span className="font-bold text-slate-800">{speed} km/h</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-400 block text-[11px] font-medium">GNN Delay Impact</span>
                          <span className={`font-bold mt-0.5 block font-mono ${delay === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {delay === 0 ? 'On-Time (0m)' : `+${delay} mins`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
                      <button
                        onClick={() => navigate(`/live-train-status?train=${train.train_number}`)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] text-white text-xs font-bold hover:scale-[1.02] shadow transition cursor-pointer"
                      >
                        <span>Track Dynamic ETA</span>
                        <ArrowRight size={14} />
                      </button>

                      <button
                        onClick={() => navigate('/map')}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-[#0E7C86] text-slate-700 text-xs font-semibold hover:text-[#0E7C86] transition cursor-pointer"
                      >
                        <MapPin size={14} />
                        <span>View on Schematic Map</span>
                      </button>

                      <button
                        onClick={() => setIsWhatsAppOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition cursor-pointer"
                      >
                        <Bot size={14} className="text-emerald-600" />
                        <span>Ask WhatsApp Bot</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isWhatsAppOpen && <WhatsAppChatModal />}
    </div>
  );
}
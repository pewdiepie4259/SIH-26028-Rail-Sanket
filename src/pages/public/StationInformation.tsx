import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  MapPin, 
  Wifi, 
  Coffee, 
  Car, 
  Layers, 
  Sparkles,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { fetchStations, type Station } from '../../services/api';

const DEFAULT_STATIONS: Station[] = [
  { id: 1, station_code: "SBC", station_name: "KSR Bengaluru City Junction", platforms: 10, is_junction: true, is_terminal: true, latitude: 12.9784, longitude: 77.5696 },
  { id: 2, station_code: "BNC", station_name: "Bengaluru Cantonment", platforms: 4, is_junction: false, is_terminal: false, latitude: 12.9934, longitude: 77.5983 },
  { id: 3, station_code: "BNCE", station_name: "Bengaluru East", platforms: 2, is_junction: false, is_terminal: false, latitude: 12.9981, longitude: 77.6163 },
  { id: 4, station_code: "BYPL", station_name: "Baiyappanahalli Junction", platforms: 4, is_junction: true, is_terminal: false, latitude: 12.9912, longitude: 77.6528 },
  { id: 5, station_code: "KJM", station_name: "Krishnarajapuram Junction", platforms: 4, is_junction: true, is_terminal: false, latitude: 13.0012, longitude: 77.6780 },
  { id: 6, station_code: "WFD", station_name: "Whitefield", platforms: 4, is_junction: false, is_terminal: false, latitude: 12.9942, longitude: 77.7583 },
  { id: 7, station_code: "MLO", station_name: "Malur", platforms: 3, is_junction: false, is_terminal: false, latitude: 13.0039, longitude: 77.9392 },
  { id: 8, station_code: "BWT", station_name: "Bangarapet Junction", platforms: 5, is_junction: true, is_terminal: false, latitude: 12.9988, longitude: 78.1969 },
  { id: 9, station_code: "YPR", station_name: "Yesvantpur Junction", platforms: 6, is_junction: true, is_terminal: true, latitude: 13.0238, longitude: 77.5503 },
  { id: 10, station_code: "KGI", station_name: "Kengeri", platforms: 4, is_junction: false, is_terminal: false, latitude: 12.9090, longitude: 77.4840 },
  { id: 11, station_code: "MYA", station_name: "Mandya", platforms: 3, is_junction: false, is_terminal: false, latitude: 12.5234, longitude: 76.8986 },
  { id: 12, station_code: "MYS", station_name: "Mysuru Junction", platforms: 6, is_junction: true, is_terminal: true, latitude: 12.3160, longitude: 76.6450 },
];

export default function StationInformation() {
  const navigate = useNavigate();
  const [stations, setStations] = useState<Station[]>(DEFAULT_STATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'JUNCTION' | 'TERMINAL'>('ALL');
  const [selectedStation, setSelectedStation] = useState<Station | null>(DEFAULT_STATIONS[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStations()
      .then((data) => {
        if (data && data.length > 0) {
          setStations(data);
          setSelectedStation(data[0]);
        }
      })
      .catch(() => {
        // Fallback default stations already set
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredStations = stations.filter((s) => {
    const matchesSearch =
      s.station_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.station_code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterType === 'ALL' ||
      (filterType === 'JUNCTION' && s.is_junction) ||
      (filterType === 'TERMINAL' && s.is_terminal);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#F4F7FA] py-8 font-sans">
      <div className="mx-auto max-w-[1600px] px-5 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#0E7C86]">
              <Building2 size={16} />
              <span>Corridor Infrastructure Inventory</span>
            </div>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#071A33]">
              Station Information & Node Facilities
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Interlocking layout, platform counts, and passenger amenities across the rail corridor.
            </p>
          </div>

          <button
            onClick={() => navigate('/map')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] text-white text-xs font-bold shadow hover:scale-[1.02] transition cursor-pointer"
          >
            <Compass size={15} />
            <span>Open 2D Schematic Map</span>
          </button>
        </div>

        {/* Search & Type Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search station by name (e.g. Bengaluru, Cantonment) or code (SBC, BWT)..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:border-[#0E7C86] transition"
            />
          </div>

          <div className="flex items-center gap-2">
            {(['ALL', 'JUNCTION', 'TERMINAL'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterType(mode)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filterType === mode
                    ? 'bg-gradient-to-r from-[#071A33] to-[#0E5961] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                {mode === 'ALL' ? 'All Stations' : mode === 'JUNCTION' ? 'Junctions Only' : 'Terminals'}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Station List */}
          <div className="lg:col-span-1 space-y-3 max-h-[720px] overflow-y-auto pr-1">
            {loading ? (
              <p className="text-sm text-slate-400 p-4">Loading corridor nodes...</p>
            ) : filteredStations.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs">
                No stations found matching "{searchQuery}".
              </div>
            ) : (
              filteredStations.map((station) => {
                const isSelected = selectedStation?.station_code === station.station_code;
                return (
                  <div
                    key={station.station_code}
                    onClick={() => setSelectedStation(station)}
                    className={`p-4 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? 'border-[#0E7C86] bg-[#E7F4F5] shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-extrabold px-2.5 py-0.5 rounded bg-[#071A33] text-white">
                        {station.station_code}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {station.is_junction && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                            JUNCTION
                          </span>
                        )}
                        {station.is_terminal && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            TERMINAL
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-2">{station.station_name}</h3>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/60 text-xs text-slate-500">
                      <span>{station.platforms} Active Platforms</span>
                      <span className="font-mono text-[11px]">{station.latitude.toFixed(3)}°N, {station.longitude.toFixed(3)}°E</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Selected Station Deep Dive */}
          <div className="lg:col-span-2">
            {selectedStation ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                {/* Station Top Banner */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-6 border-b border-slate-100 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-mono font-extrabold text-[#0E7C86]">
                        {selectedStation.station_code}
                      </span>
                      <span className="text-slate-300">•</span>
                      <h2 className="text-xl font-extrabold text-[#071A33]">
                        {selectedStation.station_name}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <MapPin size={14} className="text-[#0E7C86]" />
                      <span>Bengaluru Railway Division, South Western Railway (SWR)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/live?station=${selectedStation.station_code}`)}
                      className="px-3 py-1.5 rounded-lg bg-[#071A33] text-white text-xs font-semibold hover:bg-slate-800 transition"
                    >
                      View Live Traffic
                    </button>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-xs font-medium">Platforms</span>
                    <span className="text-2xl font-black text-[#071A33] mt-1 block">
                      {selectedStation.platforms}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1 block">Electrified High-Level</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-xs font-medium">Track Classification</span>
                    <span className="text-base font-bold text-[#071A33] mt-1 block">
                      {selectedStation.is_junction ? "Junction Node" : "Through Section"}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1 block">Automatic Signaling</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-xs font-medium">GIS Georeference</span>
                    <span className="text-xs font-mono font-bold text-[#071A33] mt-1 block truncate">
                      {selectedStation.latitude.toFixed(4)}, {selectedStation.longitude.toFixed(4)}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1 block">RTIS Snapped</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-xs font-medium">Interlocking Type</span>
                    <span className="text-base font-bold text-emerald-600 mt-1 block">
                      Solid State (SSI)
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1 block">Route Relay / Electronic</span>
                  </div>
                </div>

                {/* Amenities & Passenger Facilities */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Passenger Amenities & Smart Station Features
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    {[
                      { icon: Wifi, title: "RailWire High-Speed Wi-Fi", desc: "Available on all platforms" },
                      { icon: Coffee, title: "Executive IRCTC Lounge", desc: "Air-conditioned waiting facility" },
                      { icon: Car, title: "Automated Parking & EV", desc: "Dedicated pre-booked spaces" },
                      { icon: Layers, title: "Escalators & Elevators", desc: "Barrier-free Divyangjan access" },
                      { icon: Sparkles, title: "One Station One Product", desc: "Local artisanal showcase stall" },
                      { icon: CheckCircle2, title: "CCTV Surveillance", desc: "AI passenger flow analytics" }
                    ].map((amenity, i) => (
                      <div key={i} className="p-3 rounded-xl border border-slate-200 bg-white hover:border-[#0E7C86] transition">
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                          <amenity.icon size={16} className="text-[#0E7C86]" />
                          <span>{amenity.title}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-1">{amenity.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interlocking Directives & Topology Note */}
                <div className="p-4 rounded-xl bg-[#FFF8EC] border border-[#F59E0B]/30 flex items-start gap-3">
                  <span className="p-2 rounded-lg bg-[#F59E0B]/20 text-[#071A33] font-bold text-xs">
                    DSS
                  </span>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <strong>Section Controller Decision Support Note:</strong> Station node{' '}
                    <strong>{selectedStation.station_code}</strong> participates in dynamic loop-line precedence optimization.
                    High-priority rakes (Vande Bharat / Rajdhani) receive mainline green clearance while commuter MEMU rakes may be safely routed into passing loops.
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-400 text-sm">
                Select a station node from the left list to view operational specifications.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
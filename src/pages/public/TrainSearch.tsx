import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  TrainFront,
  Building2,
  MapPin,
  ArrowRight,
  Radio,
  Clock,
  Sparkles,
  Layers,
  Compass,
  RotateCcw,
} from 'lucide-react';
import { useLiveTelemetry } from '../../hooks/useLiveTelemetry';
import { type TrainRecord, searchTrainsApi } from '../../services/trainSearchService';
import {
  type AutocompleteItem,
  getSearchSuggestions,
} from '../../services/autocompleteService';
import { SearchAutocompleteDropdown } from '../../components/SearchAutocompleteDropdown';

interface StationRecord {
  code: string;
  name: string;
  state?: string | null;
  zone?: string | null;
  latitude?: number;
  longitude?: number;
  train_count?: number;
}

export default function TrainSearch() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const { trains: wsTelemetry } = useLiveTelemetry();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'ALL' | 'TRAINS' | 'STATIONS'>('ALL');

  // Dynamic Autocomplete suggestions
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const [trainResults, setTrainResults] = useState<TrainRecord[]>([]);
  const [stationResults, setStationResults] = useState<StationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(initialQuery.trim()));

  // Fetch Autocomplete suggestions dynamically as user types (e.g. "raj")
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || q.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
      return;
    }

    let isCancelled = false;
    const fetchSuggestions = async () => {
      try {
        const results = await getSearchSuggestions(q);
        if (!isCancelled) {
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
          setSelectedSuggestionIndex(-1);
        }
      } catch {
        if (!isCancelled) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    };

    const timer = setTimeout(fetchSuggestions, 120);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleSelectSuggestion = (item: AutocompleteItem) => {
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    setSearchQuery(item.codeOrNumber);
    setDebouncedQuery(item.codeOrNumber);
    setHasSearched(true);
    setSearchParams({ q: item.codeOrNumber });
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        return;
      }
      if (event.key === "Enter" && selectedSuggestionIndex >= 0) {
        event.preventDefault();
        handleSelectSuggestion(suggestions[selectedSuggestionIndex]);
        return;
      }
      if (event.key === "Escape") {
        setShowSuggestions(false);
        return;
      }
    }
  };

  // Sync URL search param
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q);
      setDebouncedQuery(q);
      setHasSearched(Boolean(q.trim()));
    }
  }, [searchParams]);

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
      if (searchQuery.trim()) {
        setHasSearched(true);
        setSearchParams({ q: searchQuery.trim() });
      } else {
        setSearchParams({});
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, setSearchParams]);

  // Execute search across complete backend datasets
  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q) {
      setTrainResults([]);
      setStationResults([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    // 1. Fetch trains from backend SQLite API
    const trainPromise = searchTrainsApi(q, 100);

    // 2. Fetch stations from backend SQLite API
    const stationPromise = fetch(
      `http://localhost:5000/api/stations/search?q=${encodeURIComponent(q)}&limit=100`
    )
      .then((res) => (res.ok ? res.json() : { stations: [] }))
      .then((data) => (data?.stations as StationRecord[]) || [])
      .catch(() => [] as StationRecord[]);

    Promise.all([trainPromise, stationPromise])
      .then(([trains, stations]) => {
        if (!isMounted) return;
        setTrainResults(trains || []);
        setStationResults(stations || []);
      })
      .catch((err) => {
        console.warn('Search query error:', err);
        if (isMounted) {
          setTrainResults([]);
          setStationResults([]);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(searchQuery.trim());
    if (searchQuery.trim()) {
      setHasSearched(true);
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setTrainResults([]);
    setStationResults([]);
    setHasSearched(false);
    setSearchParams({});
  };

  const handleQuickSearch = (term: string) => {
    setSearchQuery(term);
    setDebouncedQuery(term);
    setHasSearched(true);
    setSearchParams({ q: term });
  };

  // Popular search suggestions
  const popularSuggestions = [
    { label: '12627', desc: 'Karnataka Express' },
    { label: '20608', desc: 'Vande Bharat' },
    { label: '12246', desc: 'Duronto Express' },
    { label: 'SBC', desc: 'KSR Bengaluru' },
    { label: 'NDLS', desc: 'New Delhi' },
    { label: 'YPR', desc: 'Yesvantpur' },
    { label: 'HWH', desc: 'Howrah' },
    { label: 'MAS', desc: 'MGR Chennai' },
  ];

  const totalResultsCount = trainResults.length + stationResults.length;

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-slate-800 font-sans pb-16">
      {/* 1. PROMINENT SEARCH HEADER SECTION */}
      <section className="border-b border-[#164B5A] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] text-white shadow-lg">
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#F59E0B] backdrop-blur-xs mb-2.5 border border-white/10">
              <Sparkles size={13} />
              <span>National Railway Directory</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              SEARCH TRAINS & STATIONS
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-200">
              Search by train number, train name, station name or station code across complete Indian Railways data.
            </p>
          </div>

          {/* Search Bar Input */}
          <form onSubmit={handleSearchSubmit} className="relative mt-6 max-w-4xl">
            <div className="relative flex items-center rounded-2xl border-2 border-[#F59E0B]/70 bg-white p-2 shadow-xl transition-all focus-within:border-[#F59E0B] focus-within:ring-4 focus-within:ring-[#F59E0B]/20">
              <div className="pl-3 pr-2 text-slate-400">
                <Search size={20} className="text-[#0E7C86]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Search train number, train name, station name or code (e.g. 12627, Karnataka Express, SBC, KSR Bengaluru, Rajahmundry)..."
                className="w-full bg-transparent px-2 py-2 text-sm sm:text-base font-semibold text-[#071A33] placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2 py-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer shrink-0"
              >
                <span>Search</span>
                <ArrowRight size={14} className="text-[#F59E0B]" />
              </button>
            </div>

            {/* Dynamic Autocomplete suggestions */}
            <SearchAutocompleteDropdown
              suggestions={suggestions}
              selectedIndex={selectedSuggestionIndex}
              onSelect={handleSelectSuggestion}
              visible={showSuggestions}
            />
          </form>

          {/* Quick Search Suggestion Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Examples:</span>
            {popularSuggestions.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleQuickSearch(item.label)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 px-2.5 py-1 text-xs font-medium text-white transition-all cursor-pointer"
              >
                <span className="font-bold text-[#F59E0B] font-mono">{item.label}</span>
                <span className="text-slate-300 text-[11px]">({item.desc})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. RESULTS / CONTENT SECTION */}
      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10">
        {/* Filter Tabs (when results exist) */}
        {hasSearched && !loading && totalResultsCount > 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'ALL'
                    ? 'bg-[#071A33] text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                All Results ({totalResultsCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('TRAINS')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'TRAINS'
                    ? 'bg-[#071A33] text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <TrainFront size={14} className={activeTab === 'TRAINS' ? 'text-[#F59E0B]' : 'text-[#0E7C86]'} />
                <span>Trains ({trainResults.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('STATIONS')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'STATIONS'
                    ? 'bg-[#071A33] text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Building2 size={14} className={activeTab === 'STATIONS' ? 'text-[#F59E0B]' : 'text-[#0E7C86]'} />
                <span>Stations ({stationResults.length})</span>
              </button>
            </div>

            <span className="text-xs font-medium text-slate-500 font-mono">
              Found {trainResults.length} trains & {stationResults.length} stations
            </span>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="py-16 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 border border-teal-200 text-[#0E7C86] animate-spin mb-4">
              <RotateCcw size={22} />
            </div>
            <h3 className="text-base font-bold text-[#071A33]">Searching Master Database...</h3>
            <p className="text-xs text-slate-500 mt-1">
              Querying 5,210 trains and all-India railway stations
            </p>
          </div>
        )}

        {/* EMPTY SEARCH STATE (Before Search) */}
        {!hasSearched && !loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-xs text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-[#0E7C86] border border-teal-200 mb-4">
              <Search size={28} />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#071A33] tracking-tight">
              Search for a train or station
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Enter a train number, train name, station name or station code to begin exploring routes, schedules, and live tracking.
            </p>

            {/* Quick Search Helper Guide Cards */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
              <button
                type="button"
                onClick={() => handleQuickSearch('12627')}
                className="rounded-2xl border border-slate-200 p-4 bg-slate-50/70 hover:bg-slate-50 hover:border-[#0E7C86] transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Search by Number</div>
                <div className="text-base font-bold text-[#071A33] mt-1 group-hover:text-[#0E7C86]">12627</div>
                <div className="text-xs text-slate-500 mt-0.5">Karnataka Express</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSearch('Vande Bharat')}
                className="rounded-2xl border border-slate-200 p-4 bg-slate-50/70 hover:bg-slate-50 hover:border-[#0E7C86] transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Search by Name</div>
                <div className="text-base font-bold text-[#071A33] mt-1 group-hover:text-[#0E7C86]">Vande Bharat</div>
                <div className="text-xs text-slate-500 mt-0.5">High-speed coaching fleet</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSearch('SBC')}
                className="rounded-2xl border border-slate-200 p-4 bg-slate-50/70 hover:bg-slate-50 hover:border-[#0E7C86] transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Search by Code</div>
                <div className="text-base font-bold text-[#071A33] mt-1 group-hover:text-[#0E7C86]">SBC / YPR</div>
                <div className="text-xs text-slate-500 mt-0.5">Bengaluru City & Jn</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSearch('New Delhi')}
                className="rounded-2xl border border-slate-200 p-4 bg-slate-50/70 hover:bg-slate-50 hover:border-[#0E7C86] transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Search by Station</div>
                <div className="text-base font-bold text-[#071A33] mt-1 group-hover:text-[#0E7C86]">New Delhi</div>
                <div className="text-xs text-slate-500 mt-0.5">NDLS Major Terminal</div>
              </button>
            </div>
          </div>
        )}

        {/* NO RESULTS STATE */}
        {hasSearched && !loading && totalResultsCount === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-xs text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mb-4">
              <Search size={28} />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#071A33] tracking-tight">
              No trains or stations found.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              We couldn't find any train or station matching <strong className="text-slate-800">"{debouncedQuery}"</strong>.
            </p>

            <div className="mt-6 inline-block rounded-2xl bg-slate-50 border border-slate-200 p-4 text-left max-w-md">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Try searching by:
              </div>
              <ul className="text-xs sm:text-sm text-slate-700 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0E7C86]" />
                  <span>Train number (e.g. 12627, 20608, 12246)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0E7C86]" />
                  <span>Train name (e.g. Karnataka Express, Rajdhani)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0E7C86]" />
                  <span>Station name (e.g. KSR Bengaluru, New Delhi)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0E7C86]" />
                  <span>Station code (e.g. SBC, NDLS, HWH, MAS)</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* RESULTS: TRAINS & STATIONS */}
        {hasSearched && !loading && totalResultsCount > 0 && (
          <div className="space-y-10">
            {/* 3. TRAINS SECTION */}
            {(activeTab === 'ALL' || activeTab === 'TRAINS') && trainResults.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#071A33] text-white">
                      <TrainFront size={16} />
                    </div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#071A33] tracking-tight">
                      TRAINS
                    </h2>
                    <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs font-bold text-[#0E7C86] font-mono">
                      {trainResults.length} matches
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {trainResults.map((train) => {
                    const liveWs = wsTelemetry[train.train_number];
                    const speed = liveWs?.telemetry?.speed_kmh;
                    const delay = liveWs?.forecasts?.[0]?.predicted_delay_min;
                    const currentLoc = liveWs?.currentBlock || train.source_station_name || 'En Route';

                    return (
                      <div
                        key={train.train_number}
                        className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all hover:border-[#0E7C86]/50 hover:shadow-md"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          {/* Left: Train Info & Route */}
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-md bg-[#071A33] text-[#F59E0B]">
                                #{train.train_number}
                              </span>
                              <h3 className="text-sm sm:text-base font-bold text-[#071A33] truncate">
                                {train.train_name}
                              </h3>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Running</span>
                              </span>
                              {train.train_type && (
                                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                  {train.train_type}
                                </span>
                              )}
                            </div>

                            {/* Route */}
                            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                              <span className="text-slate-900">
                                {train.source_station_name || train.source_station_code} ({train.source_station_code})
                              </span>
                              <ArrowRight size={14} className="text-[#0E7C86] shrink-0" />
                              <span className="text-slate-900">
                                {train.dest_station_name || train.dest_station_code} ({train.dest_station_code})
                              </span>
                            </div>

                            {/* Telemetry info row */}
                            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500 font-mono">
                              <div className="flex items-center gap-1">
                                <MapPin size={13} className="text-[#0E7C86]" />
                                <span>Location: <strong className="text-slate-700">{currentLoc}</strong></span>
                              </div>
                              {speed !== undefined && (
                                <div>
                                  Speed: <strong className="text-slate-700">{speed} km/h</strong>
                                </div>
                              )}
                              {delay !== undefined && (
                                <div className={delay > 0 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                                  {delay > 0 ? `+${delay}m Delay` : 'On Time'}
                                </div>
                              )}
                              {train.total_distance_km ? (
                                <div>Distance: {train.total_distance_km} km</div>
                              ) : null}
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                            {/* Live Status Button */}
                            <button
                              type="button"
                              onClick={() => navigate(`/live?train=${train.train_number}`)}
                              className="flex items-center gap-1.5 rounded-xl border border-[#F59E0B]/80 bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer"
                            >
                              <Radio size={13} className="text-[#F59E0B]" />
                              <span>Live Status</span>
                            </button>

                            {/* Route Button */}
                            <button
                              type="button"
                              onClick={() => navigate(`/live?train=${train.train_number}`)}
                              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:border-slate-300 cursor-pointer"
                            >
                              <Layers size={13} className="text-[#0E7C86]" />
                              <span>Route</span>
                            </button>

                            {/* Live Map Button */}
                            <button
                              type="button"
                              onClick={() => navigate(`/map?train=${train.train_number}`)}
                              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:border-slate-300 cursor-pointer"
                            >
                              <Compass size={13} className="text-teal-600" />
                              <span>Map</span>
                            </button>

                            {/* Dynamic ETA */}
                            <button
                              type="button"
                              onClick={() => navigate(`/eta?train=${train.train_number}`)}
                              className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 text-xs font-bold text-indigo-800 shadow-2xs transition-all cursor-pointer"
                            >
                              <Clock size={13} className="text-indigo-600" />
                              <span>ETA</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 4. STATIONS SECTION */}
            {(activeTab === 'ALL' || activeTab === 'STATIONS') && stationResults.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0E7C86] text-white">
                      <Building2 size={16} />
                    </div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#071A33] tracking-tight">
                      STATIONS
                    </h2>
                    <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs font-bold text-[#0E7C86] font-mono">
                      {stationResults.length} matches
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {stationResults.map((station) => (
                    <div
                      key={station.code}
                      className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all hover:border-[#0E7C86]/50 hover:shadow-md flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-md bg-teal-50 text-[#0E7C86] border border-teal-200">
                            {station.code}
                          </span>
                          {station.zone && (
                            <span className="text-[11px] font-bold text-slate-500 font-mono">
                              Zone: {station.zone}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-[#071A33]">
                          {station.name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          {station.state && (
                            <div className="flex items-center gap-1">
                              <MapPin size={13} className="text-[#0E7C86]" />
                              <span>{station.state}</span>
                            </div>
                          )}
                          {station.train_count ? (
                            <div className="font-mono font-semibold text-slate-600">
                              {station.train_count}+ trains connected
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate('/stations')}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:border-slate-300 cursor-pointer"
                        >
                          <Building2 size={13} className="text-[#0E7C86]" />
                          <span>View Station</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/map')}
                          className="flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 px-3.5 py-2 text-xs font-bold text-[#0E7C86] transition-all cursor-pointer"
                        >
                          <Compass size={13} />
                          <span>View on Map</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

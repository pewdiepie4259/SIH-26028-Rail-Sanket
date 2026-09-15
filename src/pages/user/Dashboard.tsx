// src/pages/user/Dashboard.tsx
import { useEffect, useState, useMemo } from "react";
import {
  Search,
  TrainFront,
  ArrowRight,
  Radio,
  Activity,
  Ticket,
  Map,
  Building2,
  CloudRain,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AlertMarquee from "../../components/AlertMarquee";
import ETAFragment, { type ETATrain } from "../../components/ETAFragment";
import UserPNRSection from "../../components/UserPNRSection";
import { WhatsAppChatModal } from "../../components/WhatsAppChatModal";
import { TrainSearchResultCard } from "../../components/TrainSearchResultCard";
import { useLiveTelemetry } from "../../hooks/useLiveTelemetry";
import { getCurrentUser, type AuthUser } from "../../services/auth";
import {
  type TrainRecord,
  type FilterClass,
  type SortOption,
  FALLBACK_TRAINS,
  searchTrainsApi,
  filterAndSortTrains,
} from "../../services/trainSearchService";

interface RecentSearch {
  name: string;
  number: string;
}

interface SavedJourney {
  id: string;
  trainNumber: string;
  trainName: string;
  from: string;
  to: string;
  pnr?: string;
  departureTime: string;
  date: string;
  status: string;
}

const defaultSavedJourneys: SavedJourney[] = [
  {
    id: "j1",
    trainNumber: "12627",
    trainName: "Karnataka Express",
    from: "SBC (KSR Bengaluru)",
    to: "NDLS (New Delhi)",
    pnr: "4529108392",
    departureTime: "19:20",
    date: "Today",
    status: "Confirmed (B3 / 42)",
  },
  {
    id: "j2",
    trainNumber: "20608",
    trainName: "Mysuru - Chennai Vande Bharat",
    from: "SBC (KSR Bengaluru)",
    to: "MAS (Chennai Central)",
    pnr: "8821903411",
    departureTime: "06:00",
    date: "Tomorrow",
    status: "Confirmed (C1 / 18)",
  },
];

const defaultRecentSearches: RecentSearch[] = [
  { name: "Karnataka Express", number: "12627" },
  { name: "Brindavan Express", number: "12639" },
  { name: "Lalbagh Express", number: "12608" },
];

const etaData: Record<string, ETATrain> = {
  "12627": {
    name: "Karnataka Express",
    number: "12627",
    scheduledDeparture: "19:20",
    scheduledArrival: "06:15",
    predictedArrival: "06:33",
    from: "KSR Bengaluru",
    to: "New Delhi",
    lastStation: "Kengeri",
    currentLocation: "Kengeri",
    delayMinutes: 18,
    progress: 24,
    stations: ["KSR Bengaluru", "Kengeri", "Tumakuru", "Guntakal", "New Delhi"],
  },
  "12613": {
    name: "Bengaluru - Mysuru Express",
    number: "12613",
    scheduledDeparture: "06:15",
    scheduledArrival: "08:45",
    predictedArrival: "08:45",
    from: "KSR Bengaluru",
    to: "Mysuru",
    lastStation: "KSR Bengaluru",
    currentLocation: "KSR Bengaluru",
    delayMinutes: 0,
    progress: 8,
    stations: ["KSR Bengaluru", "Kengeri", "Mandya", "Mysuru"],
  },
  "12639": {
    name: "Brindavan Express",
    number: "12639",
    scheduledDeparture: "07:00",
    scheduledArrival: "13:40",
    predictedArrival: "13:52",
    from: "KSR Bengaluru",
    to: "Chennai Central",
    lastStation: "Bengaluru Cantonment",
    currentLocation: "Bengaluru Cantonment",
    delayMinutes: 12,
    progress: 17,
    stations: ["KSR Bengaluru", "Bengaluru Cantonment", "Krishnarajapuram", "Jolarpettai", "Chennai Central"],
  },
  "12610": {
    name: "Mysuru - Chennai Express",
    number: "12610",
    scheduledDeparture: "22:15",
    scheduledArrival: "05:30",
    predictedArrival: "05:30",
    from: "Mysuru",
    to: "Chennai Central",
    lastStation: "Mandya",
    currentLocation: "Mandya",
    delayMinutes: 0,
    progress: 21,
    stations: ["Mysuru", "Mandya", "Bengaluru", "Jolarpettai", "Chennai Central"],
  },
  "12608": {
    name: "Lalbagh Express",
    number: "12608",
    scheduledDeparture: "06:20",
    scheduledArrival: "12:35",
    predictedArrival: "12:48",
    from: "KSR Bengaluru",
    to: "Chennai Central",
    lastStation: "Bengaluru East",
    currentLocation: "Bengaluru East",
    delayMinutes: 13,
    progress: 14,
    stations: ["KSR Bengaluru", "Bengaluru East", "Krishnarajapuram", "Jolarpettai", "Chennai Central"],
  },
  "16591": {
    name: "Hampi Express",
    number: "16591",
    scheduledDeparture: "21:00",
    scheduledArrival: "08:10",
    predictedArrival: "08:10",
    from: "KSR Bengaluru",
    to: "Hubballi",
    lastStation: "Yelahanka",
    currentLocation: "Yelahanka",
    delayMinutes: 0,
    progress: 19,
    stations: ["KSR Bengaluru", "Yelahanka", "Chikballapur", "Hospet", "Hubballi"],
  },
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const { trains: liveTelemetryMap } = useLiveTelemetry();

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getCurrentUser());
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filterClass, setFilterClass] = useState<FilterClass>("all");
  const [sortBy] = useState<SortOption>("priority");

  const [trainsList, setTrainsList] = useState<TrainRecord[]>(FALLBACK_TRAINS);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState<TrainRecord | null>(null);

  const [savedJourneys] = useState<SavedJourney[]>(defaultSavedJourneys);
  const [quickServiceNotice, setQuickServiceNotice] = useState<string | null>(null);

  // WhatsApp Assistant State
  const [botTrainNumber, setBotTrainNumber] = useState<string | undefined>(undefined);
  const [botTrainName, setBotTrainName] = useState<string | undefined>(undefined);

  // Recent searches
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(() => {
    try {
      const saved = localStorage.getItem("raildrishti_recent_searches");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultRecentSearches;
  });

  const addRecentSearch = (item: RecentSearch) => {
    if (!item.name || !item.number) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (s) => s.number !== item.number && s.name.toLowerCase() !== item.name.toLowerCase()
      );
      const updated = [item, ...filtered].slice(0, 4);
      try {
        localStorage.setItem("raildrishti_recent_searches", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Check auth
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      // Allow viewing or redirect if strictly protected
      setCurrentUser({
        id: "usr_pass_demo",
        name: "Passenger",
        email: "passenger@raildrishti.gov.in",
        role: "user",
        status: "active",
        createdAt: new Date().toISOString(),
      });
    } else {
      setCurrentUser(user);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch trains from SQLite backend
  useEffect(() => {
    let isCancelled = false;
    const fetchTrains = async () => {
      setLoadingSearch(true);
      try {
        const results = await searchTrainsApi(debouncedQuery, 80);
        if (!isCancelled && results.length > 0) {
          setTrainsList(results);
        }
      } catch (err) {
        console.warn("Search API failed:", err);
      } finally {
        if (!isCancelled) setLoadingSearch(false);
      }
    };

    fetchTrains();
    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery]);

  const processedTrains = useMemo(() => {
    return filterAndSortTrains(trainsList, filterClass, sortBy, liveTelemetryMap);
  }, [trainsList, filterClass, sortBy, liveTelemetryMap]);

  const displayedTrains = useMemo(() => {
    if (debouncedQuery) return processedTrains;
    return processedTrains.slice(0, 8);
  }, [processedTrains, debouncedQuery]);

  const handleRecentSearch = (search: RecentSearch) => {
    setSearchQuery(search.number);
    addRecentSearch(search);
    setSelectedTrain(null);
  };

  const handleSearchSubmit = () => {
    const q = searchQuery.trim();
    if (!q) {
      setSelectedTrain(null);
      return;
    }

    if (displayedTrains.length > 0) {
      const top = displayedTrains[0];
      addRecentSearch({ name: top.train_name, number: top.train_number });
      if (etaData[top.train_number]) {
        setSelectedTrain(top);
      } else {
        navigate(`/eta?train=${top.train_number}`);
      }
    }
  };

  const handleTrackETA = (train: TrainRecord) => {
    addRecentSearch({ name: train.train_name, number: train.train_number });
    if (etaData[train.train_number]) {
      setSelectedTrain(train);
    } else {
      navigate(`/eta?train=${train.train_number}`);
    }
  };

  const handleViewMap = (train: TrainRecord) => {
    navigate(`/map?train=${train.train_number}`);
  };

  const handleAskWhatsAppBot = (train: TrainRecord) => {
    setBotTrainNumber(train.train_number);
    setBotTrainName(train.train_name);
  };

  const handleQuickServiceClick = (serviceName: string, path?: string) => {
    if (path) {
      navigate(path);
    } else {
      setQuickServiceNotice(
        `${serviceName} portal is integrated with Passenger Reservation Systems. Please search by train or station below for instant live status.`
      );
      setTimeout(() => setQuickServiceNotice(null), 4500);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA]">
      {/* 1. PASSENGER WELCOME & PROFILE HEADER */}
      <section className="bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] text-white border-b border-[#F59E0B]/30 pt-8 pb-10">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#F59E0B] to-amber-600 text-[#071A33] font-black text-2xl shadow-lg border-2 border-white/20">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "P"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#F59E0B]">
                    Passenger Portal
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    <CheckCircle2 size={11} />
                    Active Account
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Welcome, {currentUser?.name || "Passenger"}
                </h1>
                <p className="text-xs sm:text-sm text-[#D7E5EC] mt-0.5">
                  Real-Time RTIS Kinematic Tracking & Live Journey Status
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/user/profile")}
                className="inline-flex items-center gap-2 rounded-xl bg-[#F59E0B] px-4.5 py-2.5 text-xs font-bold text-[#071A33] shadow-md hover:bg-amber-400 transition cursor-pointer"
              >
                <User size={15} />
                <span>My Profile & Settings</span>
              </button>
            </div>
          </div>

          {/* Passenger Saved Journeys / Bookings */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedJourneys.map((j) => (
              <div
                key={j.id}
                className="rounded-2xl border border-white/15 bg-white/10 p-4.5 backdrop-blur-md flex flex-col justify-between space-y-3 hover:border-[#F59E0B]/60 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-[#F59E0B] px-2 py-0.5 text-[10px] font-mono font-bold text-[#071A33]">
                        #{j.trainNumber}
                      </span>
                      <span className="font-bold text-white text-sm sm:text-base">{j.trainName}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-300 font-medium">{j.from} → {j.to}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 whitespace-nowrap">
                    {j.status}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-[#F59E0B]" />
                      {j.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} className="text-[#F59E0B]" />
                      Dep: {j.departureTime}
                    </span>
                    {j.pnr && (
                      <span className="font-mono text-[11px] text-teal-300">PNR: {j.pnr}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/eta?train=${j.trainNumber}`)}
                    className="flex items-center gap-1 font-bold text-[#F59E0B] hover:underline cursor-pointer"
                  >
                    <span>Track Live ETA</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Search Box in Header */}
          <div className="mt-6 w-full max-w-4xl">
            <div className="mb-2 text-xs font-semibold text-white sm:text-sm">
              Search trains, stations or train numbers
            </div>

            <div className="flex flex-col overflow-hidden rounded-xl border border-[#F59E0B] bg-white/95 shadow-2xl backdrop-blur-xl sm:flex-row">
              <div className="flex min-h-[52px] flex-1 items-center gap-3 px-4 sm:px-5">
                <Search size={20} className="shrink-0 text-[#0E7C86]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setSelectedTrain(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSearchSubmit();
                    }
                  }}
                  placeholder="Search train number, train name or station (e.g. 12627, 12245, SBC, YPR)..."
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500 sm:text-base font-medium"
                />
              </div>

              <button
                type="button"
                onClick={handleSearchSubmit}
                className="flex min-h-[52px] items-center justify-center gap-2 bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-6 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_5px_14px_rgba(14,89,97,0.22)] sm:px-7 cursor-pointer"
              >
                <Search size={17} />
                Search
              </button>
            </div>

            {/* Dynamic Recent Searches */}
            <div className="mt-3">
              <div className="mb-2 text-[11px] font-semibold text-white sm:text-xs">
                Recent Searches
              </div>

              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <button
                    key={search.number}
                    type="button"
                    onClick={() => handleRecentSearch(search)}
                    className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md transition hover:border-[#F59E0B]/70 hover:bg-white/15 cursor-pointer"
                  >
                    <span>{search.name}</span>
                    <span className="rounded-full bg-[#F59E0B] px-1.5 py-0.5 text-[10px] font-bold text-[#071A33]">
                      {search.number}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Service Notice Toast */}
      {quickServiceNotice && (
        <div className="mx-auto max-w-[1600px] px-6 pt-4 lg:px-12">
          <div className="rounded-xl border border-teal-200 bg-teal-50/95 p-3.5 text-xs font-medium text-teal-900 shadow-sm flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[#0E7C86] shrink-0" />
              <span>{quickServiceNotice}</span>
            </div>
            <button
              onClick={() => setQuickServiceNotice(null)}
              className="text-xs font-bold text-[#0E7C86] hover:underline shrink-0"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 2. LIVE ALERTS */}
      <div id="alerts" className="mb-2">
        <AlertMarquee />
      </div>

      {/* 3. QUICK SERVICES (4 Key Passenger Quick Actions) */}
      <section className="mx-auto max-w-[1600px] px-6 py-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { id: "live_train", label: "Live Train", icon: TrainFront, path: "/live", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
            { id: "pnr", label: "PNR Status", icon: Ticket, path: "/pnr", color: "text-blue-700 bg-blue-50 border-blue-200" },
            { id: "live_map", label: "Live Map", icon: Map, path: "/map", color: "text-teal-700 bg-teal-50 border-teal-200" },
            { id: "stations", label: "Stations", icon: Building2, path: "/stations", color: "text-purple-700 bg-purple-50 border-purple-200" },
          ].map((svc) => {
            const Icon = svc.icon;
            return (
              <button
                key={svc.id}
                type="button"
                onClick={() => handleQuickServiceClick(svc.label, svc.path)}
                className="group flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#0E7C86] hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
              >
                <div className={`p-3 rounded-xl border ${svc.color} group-hover:scale-110 transition-transform shadow-xs`}>
                  <Icon size={22} />
                </div>
                <span className="mt-2.5 text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#071A33] text-center leading-tight">
                  {svc.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* PNR Status & Active Bookings Section */}
      {currentUser && (
        <UserPNRSection currentUser={currentUser} />
      )}

      {/* In-Page Dynamic ETA View if train selected */}
      {selectedTrain && etaData[selectedTrain.train_number] ? (
        <div className="mx-auto max-w-[1600px] px-6 py-6 lg:px-12">
          <button
            onClick={() => setSelectedTrain(null)}
            className="mb-4 text-xs font-semibold text-[#0E7C86] hover:underline flex items-center gap-1 cursor-pointer"
          >
            ← Back to train search
          </button>
          <ETAFragment train={etaData[selectedTrain.train_number]} />
        </div>
      ) : (
        /* 4. TRAINS ON THE MOVE & NETWORK SEARCH */
        <section className="bg-gradient-to-r from-[#FFF4E1] via-white to-[#FFF4E1] py-8 border-y border-amber-100/60">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
            <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#0E7C86] flex items-center gap-2">
                  <TrainFront size={14} />
                  <span>National Master Database (5,210 Trains) • Real-Time RTIS & GNN Telemetry</span>
                </div>

                <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#071A33] sm:text-3xl flex flex-wrap items-center gap-2.5">
                  <span>Trains on the Move & Network Search</span>
                  {searchQuery.trim() && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#0E7C86]/15 text-[#0E7C86] border border-[#0E7C86]/30">
                      {loadingSearch ? "Searching..." : `${processedTrains.length} ${processedTrains.length === 1 ? "Train" : "Trains"} Found`}
                    </span>
                  )}
                </h2>
              </div>

              {/* Class Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setFilterClass("all")}
                  className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                    filterClass === "all"
                      ? "bg-[#071A33] text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  All Classes
                </button>

                <button
                  type="button"
                  onClick={() => setFilterClass("premium")}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                    filterClass === "premium"
                      ? "bg-[#071A33] text-white shadow-xs font-bold"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Vande Bharat / Duronto / Rajdhani
                </button>

                <button
                  type="button"
                  onClick={() => setFilterClass("sf_exp")}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                    filterClass === "sf_exp"
                      ? "bg-[#071A33] text-white shadow-xs font-bold"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Superfast / Express
                </button>

                <button
                  type="button"
                  onClick={() => setFilterClass("suburban")}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                    filterClass === "suburban"
                      ? "bg-[#071A33] text-white shadow-xs font-bold"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Suburban MEMU
                </button>
              </div>
            </div>

            {/* Train Result Cards */}
            <div className="space-y-3.5">
              {loadingSearch && displayedTrains.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                  <Radio className="mx-auto h-8 w-8 animate-pulse text-[#0E7C86]" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Querying 5,207 trains & real-time schedules...
                  </p>
                </div>
              ) : displayedTrains.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-xs">
                  <TrainFront className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 text-base font-bold text-[#071A33]">
                    No trains match "{searchQuery}"
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Try searching by train number (e.g. 12627, 12245, 20608), name, or station (SBC, YPR, HWH).
                  </p>
                </div>
              ) : (
                displayedTrains.map((train) => (
                  <TrainSearchResultCard
                    key={train.train_number}
                    train={train}
                    liveTelemetryMap={liveTelemetryMap}
                    onTrackETA={handleTrackETA}
                    onViewMap={handleViewMap}
                    onAskBot={handleAskWhatsAppBot}
                  />
                ))
              )}
            </div>

            {!debouncedQuery && processedTrains.length > 8 && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => navigate("/trains")}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-6 py-3 text-xs font-bold text-white shadow-sm transition-all hover:scale-105 hover:shadow-md cursor-pointer"
                >
                  <span>Explore Full Train Directory & Corridor Fleet (5,207 Trains)</span>
                  <ArrowRight size={15} className="text-[#F59E0B]" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 5. NETWORK SNAPSHOT & WEATHER IMPACT */}
      <section className="mx-auto max-w-[1600px] px-6 py-10 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0E7C86]">
                  Network Operations Snapshot
                </span>
                <h3 className="text-xl font-bold text-[#071A33] tracking-tight">
                  Indian Railways Live Fleet Health
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                ● Telemetry Stream Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Active Trains</span>
                  <TrainFront size={18} className="text-[#0E7C86]" />
                </div>
                <div className="text-3xl font-black text-[#071A33]">5,210</div>
                <p className="mt-1 text-xs text-slate-500 font-medium">Master database coaching rakes</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">On-Time Performance</span>
                  <TrendingUp size={18} className="text-emerald-600" />
                </div>
                <div className="text-3xl font-black text-emerald-600">94.2%</div>
                <p className="mt-1 text-xs text-slate-500 font-medium">Corridor kinematic clearance</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Section Advisories</span>
                  <AlertTriangle size={18} className="text-amber-500" />
                </div>
                <div className="text-3xl font-black text-[#071A33]">3 Active</div>
                <p className="mt-1 text-xs text-slate-500 font-medium">Weather & maintenance slots</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0E7C86]">
                  Section Conditions
                </span>
                <CloudRain size={18} className="text-blue-500" />
              </div>
              <h4 className="text-lg font-bold text-[#071A33] tracking-tight">
                Weather & Track Impact
              </h4>
              <p className="mt-1 text-xs text-slate-600 font-medium leading-relaxed">
                Moderate monsoon rainfall observed across Bengaluru – Jolarpettai and Western Ghats sections.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold text-slate-700">
                <span>Estimated ETA Buffer:</span>
                <span className="text-amber-700 font-bold">+8 to 15 mins</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Track Temp / Clearance:</span>
                <span className="font-mono text-slate-700">28°C • Normal</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Visibility:</span>
                <span className="font-mono text-emerald-700 font-bold">&gt;1,200m (Good)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium pt-1">
              <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
              <span>ST-GNN model factoring dynamic weather coefficients</span>
            </div>
          </div>
        </div>
      </section>

      {/* Floating RailDrishti AI RTIS Copilot */}
      <WhatsAppChatModal
        initialTrainNumber={botTrainNumber}
        initialTrainName={botTrainName}
      />
    </div>
  );
}

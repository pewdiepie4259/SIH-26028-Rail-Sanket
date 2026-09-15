// src/pages/PublicDashboard.tsx
import { useEffect, useState, useMemo } from "react";
import {
  Search,
  MapPin,
  TrainFront,
  ArrowRight,
  Radio,
  CloudRain,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AlertMarquee from "../components/AlertMarquee";
import ETAFragment, { type ETATrain } from "../components/ETAFragment";
import { WhatsAppChatModal } from "../components/WhatsAppChatModal";
import { TrainSearchResultCard } from "../components/TrainSearchResultCard";
import { useLiveTelemetry } from "../hooks/useLiveTelemetry";
import { getCurrentUser, type AuthUser } from "../services/auth";
import UserPNRSection from "../components/UserPNRSection";
import {
  type TrainRecord,
  type FilterClass,
  type SortOption,
  FALLBACK_TRAINS,
  searchTrainsApi,
  filterAndSortTrains,
} from "../services/trainSearchService";

interface RailwayStation {
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  image: string;
}

interface RecentSearch {
  name: string;
  number: string;
}

const defaultStation: RailwayStation = {
  name: "KSR Bengaluru Railway Station",
  code: "SBC",
  latitude: 12.9775,
  longitude: 77.5713,
  image:
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/KSR%20Bengaluru%20Railway%20Station.jpg",
};

const bengaluruStations: RailwayStation[] = [
  {
    name: "KSR Bengaluru Railway Station",
    code: "SBC",
    latitude: 12.9775,
    longitude: 77.5713,
    image:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/KSR%20Bengaluru%20Railway%20Station.jpg",
  },
  {
    name: "Yesvantpur Junction",
    code: "YPR",
    latitude: 13.028,
    longitude: 77.5547,
    image:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Yesvantpur%20Junction%20railway%20station%20%28Sept%20%2723%29.jpg",
  },
  {
    name: "Bengaluru Cantonment Railway Station",
    code: "BNC",
    latitude: 12.9937,
    longitude: 77.598,
    image:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Bangalore_Cantonment_railway_station.jpg",
  },
  {
    name: "Bengaluru East Railway Station",
    code: "BNCE",
    latitude: 13.0007,
    longitude: 77.6171,
    image:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Bangalore_East_railway_station.jpg",
  },
  {
    name: "Baiyappanahalli Railway Station",
    code: "BYPL",
    latitude: 13.0285,
    longitude: 77.6328,
    image:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Baiyappanahalli_railway_station.jpg",
  },
  {
    name: "Krishnarajapuram Railway Station",
    code: "KJM",
    latitude: 13.0006,
    longitude: 77.676,
    image:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Krishnarajapuram_railway_station.jpg",
  },
  {
    name: "Kengeri Railway Station",
    code: "KGI",
    latitude: 12.916844,
    longitude: 77.483789,
    image:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Kengeri%20Railway%20Station.jpg",
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
    stations: [
      "KSR Bengaluru",
      "Kengeri",
      "Tumakuru",
      "Guntakal",
      "New Delhi",
    ],
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
    stations: [
      "KSR Bengaluru",
      "Kengeri",
      "Mandya",
      "Mysuru",
    ],
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
    stations: [
      "KSR Bengaluru",
      "Bengaluru Cantonment",
      "Krishnarajapuram",
      "Jolarpettai",
      "Chennai Central",
    ],
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
    stations: [
      "Mysuru",
      "Mandya",
      "Bengaluru",
      "Jolarpettai",
      "Chennai Central",
    ],
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
    stations: [
      "KSR Bengaluru",
      "Bengaluru East",
      "Krishnarajapuram",
      "Jolarpettai",
      "Chennai Central",
    ],
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
    stations: [
      "KSR Bengaluru",
      "Yelahanka",
      "Chikballapur",
      "Hospet",
      "Hubballi",
    ],
  },
};

function calculateDistance(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
) {
  const earthRadius = 6371;
  const latitudeDifference = ((latitude2 - latitude1) * Math.PI) / 180;
  const longitudeDifference = ((longitude2 - longitude1) * Math.PI) / 180;

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos((latitude1 * Math.PI) / 180) *
      Math.cos((latitude2 * Math.PI) / 180) *
      Math.sin(longitudeDifference / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

export default function PublicDashboard() {
  const navigate = useNavigate();
  const { trains: liveTelemetryMap } = useLiveTelemetry();

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getCurrentUser());

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getCurrentUser());
    };
    window.addEventListener("raildrishti_auth_changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("raildrishti_auth_changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const [station, setStation] = useState<RailwayStation>(defaultStation);
  const [locationStatus, setLocationStatus] = useState("Locating...");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filterClass, setFilterClass] = useState<FilterClass>("all");
  const [sortBy] = useState<SortOption>("priority");

  const [trainsList, setTrainsList] = useState<TrainRecord[]>(FALLBACK_TRAINS);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState<TrainRecord | null>(null);


  // WhatsApp Assistant State
  const [botTrainNumber, setBotTrainNumber] = useState<string | undefined>(undefined);
  const [botTrainName, setBotTrainName] = useState<string | undefined>(undefined);

  // Dynamic Recent Searches backed by localStorage
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(() => {
    try {
      const saved = localStorage.getItem("raildrishti_recent_searches");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
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

  // Detect Geolocation for nearest station
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("Location unavailable");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const bengaluruCenter = { latitude: 12.9716, longitude: 77.5946 };
        const distanceFromBengaluru = calculateDistance(
          latitude,
          longitude,
          bengaluruCenter.latitude,
          bengaluruCenter.longitude
        );

        if (distanceFromBengaluru > 45) {
          setStation(defaultStation);
          setLocationStatus("Bengaluru");
          return;
        }

        let nearestStation = bengaluruStations[0];
        let shortestDistance = Infinity;

        bengaluruStations.forEach((railwayStation) => {
          const distance = calculateDistance(
            latitude,
            longitude,
            railwayStation.latitude,
            railwayStation.longitude
          );
          if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestStation = railwayStation;
          }
        });

        setStation(nearestStation);
        setLocationStatus("Nearest railway station");
      },
      () => {
        setStation(defaultStation);
        setLocationStatus("Bengaluru");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch trains using shared search API (5,207+ SQLite database)
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

  // Filtered & Sorted Trains using shared logic
  const processedTrains = useMemo(() => {
    return filterAndSortTrains(trainsList, filterClass, sortBy, liveTelemetryMap);
  }, [trainsList, filterClass, sortBy, liveTelemetryMap]);

  // Top displayed trains on Main Dashboard
  const displayedTrains = useMemo(() => {
    if (debouncedQuery) {
      return processedTrains;
    }
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

  const handleExploreFullDirectory = () => {
    const user = getCurrentUser();
    if (user && ["user", "employee", "admin", "controller"].includes(user.role)) {
      navigate("/trains");
    } else {
      navigate("/login?redirect=/trains");
    }
  };


  return (
    <div className="min-h-screen bg-[#F4F7FA]">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[360px] overflow-hidden sm:min-h-[370px] lg:min-h-[380px]">
        <img
          src={station.image}
          alt={station.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#031426]/95 via-[#06283B]/75 to-[#031426]/60" />

        <div className="relative z-10 mx-auto flex min-h-[340px] max-w-[1600px] flex-col justify-center px-6 py-8 sm:min-h-[350px] lg:min-h-[360px] lg:px-12">
          <div className="w-full max-w-4xl">
            <div className="max-w-3xl pt-2">
              <div className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#F59E0B]">
                WELCOME TO
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Rail<span className="text-[#F59E0B]">Drishti</span>
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#D7E5EC] sm:text-base">
                Dynamic Estimated Time of Arrival System for Indian Coaching Trains.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-[#DDE9EF] sm:text-sm">
                <MapPin size={16} className="text-[#F59E0B]" />
                <span>
                  {locationStatus}: <strong className="text-white">{station.name} ({station.code})</strong>
                </span>
              </div>
            </div>

            {/* Main Train / Station Search Box */}
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

              {/* Quick Feature Indicators */}
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-[#D0DEE5] sm:text-xs">
                <span
                  className="flex items-center gap-1.5 cursor-pointer hover:text-white"
                  onClick={() => navigate('/live')}
                >
                  <TrainFront size={14} className="text-[#F59E0B]" />
                  Live train status
                </span>
                <span
                  className="flex items-center gap-1.5 cursor-pointer hover:text-white"
                  onClick={() => navigate('/eta')}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                  Predictive ETA
                </span>
                <span
                  className="flex items-center gap-1.5 cursor-pointer hover:text-white"
                  onClick={() => navigate('/map')}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                  Live tracking
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE ALERTS MARQUEE */}
      <div id="alerts" className="mb-2">
        <AlertMarquee />
      </div>

      {/* 3. PNR SECTION (Visible only after user logs in) */}
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
            {/* Header & Filter Tabs */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#0E7C86] flex items-center gap-2">
                  <TrainFront size={14} />
                  <span>National Master Database (5,207 Trains) • Serving {station.name}</span>
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

            {/* Train Result Cards List (Shared Real Backend Cards) */}
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
                    Try searching by train number (e.g. 12627, 12245, 20608), name (Karnataka Express, Duronto), or station (SBC, YPR, HWH).
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

            {/* "View All 5,207 Trains in Full Directory" Footer Pill */}
            {!debouncedQuery && processedTrains.length > 8 && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={handleExploreFullDirectory}
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

      {/* 5. NETWORK SNAPSHOT & 6. WEATHER IMPACT */}
      <section className="mx-auto max-w-[1600px] px-6 py-10 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Network Snapshot Column (2/3 width on large screens) */}
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
              {/* Card 1: Active Trains */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Active Trains</span>
                  <TrainFront size={18} className="text-[#0E7C86]" />
                </div>
                <div className="text-3xl font-black text-[#071A33]">5,210</div>
                <p className="mt-1 text-xs text-slate-500 font-medium">Master database coaching rakes</p>
              </div>

              {/* Card 2: On-Time Performance */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">On-Time Performance</span>
                  <TrendingUp size={18} className="text-emerald-600" />
                </div>
                <div className="text-3xl font-black text-emerald-600">94.2%</div>
                <p className="mt-1 text-xs text-slate-500 font-medium">Corridor kinematic clearance</p>
              </div>

              {/* Card 3: Active Section Advisories */}
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

          {/* Weather & Section Condition Card (1/3 width on large screens) */}
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

      {/* Floating RailDrishti AI RTIS Copilot / WhatsApp Bot Simulator */}
      <WhatsAppChatModal
        initialTrainNumber={botTrainNumber}
        initialTrainName={botTrainName}
      />
    </div>
  );
}
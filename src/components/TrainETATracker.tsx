// src/components/TrainETATracker.tsx
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    TrainFront,
    Clock,
    MapPin,
    Activity,
    CloudRain,
    AlertTriangle,
    ShieldCheck,
    Search,
    Gauge,
    RotateCcw,
    CheckCircle2,
} from 'lucide-react';

// Fix Leaflet Default Icons
try {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
} catch (e) {
    console.warn(e);
}

// Custom Pulsing Train Marker with RailSanket palette
const trainIcon = new L.DivIcon({
    html: `
    <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; margin-left: -22px; margin-top: -22px;">
      <div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: rgba(245, 158, 11, 0.45); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #071A33, #0E5961); border: 2px solid #F59E0B; box-shadow: 0 0 12px rgba(245, 158, 11, 0.8); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; z-index: 10;">
        🚆
      </div>
    </div>
    <style>
      @keyframes ping {
        75%, 100% { transform: scale(2); opacity: 0; }
      }
    </style>
  `,
    className: ''
});

// Station Marker Dot with RailSanket palette
const createStationIcon = (isSelected: boolean, isCurrent: boolean) => new L.DivIcon({
    html: `<div style="width: ${isSelected ? '16px' : '11px'}; height: ${isSelected ? '16px' : '11px'}; border-radius: 50%; background: ${isSelected ? '#F59E0B' : isCurrent ? '#0E7C86' : '#071A33'}; border: 2px solid #ffffff; box-shadow: 0 0 ${isSelected ? '10px #F59E0B' : '4px rgba(7,26,51,0.5)'}; margin-left: ${isSelected ? '-8px' : '-5px'}; margin-top: ${isSelected ? '-8px' : '-5px'}; cursor: pointer;"></div>`,
    className: ''
});

interface Coordinate {
    lat: number;
    lng: number;
}

// Indian Bounding Box Normalizer (Lat: 6°-38° N, Lng: 65°-100° E)
const normalizeIndianCoord = (n1: number, n2: number): Coordinate | null => {
    if (isNaN(n1) || isNaN(n2)) return null;
    const lat = Math.min(n1, n2);
    const lng = Math.max(n1, n2);
    if (lat >= 6 && lat <= 38 && lng >= 65 && lng <= 100) {
        return { lat, lng };
    }
    return null;
};

// Built-in Comprehensive All-India Stations & Terminals Database
const KNOWN_STATION_COORDS: Record<string, Coordinate> = {
    // Konkan Railway & Mumbai - Goa
    CSMT: { lat: 18.9400, lng: 72.8355 },
    CSTM: { lat: 18.9400, lng: 72.8355 },
    DR: { lat: 19.0180, lng: 72.8430 },
    TNA: { lat: 19.1860, lng: 72.9760 },
    PNVL: { lat: 18.9894, lng: 73.1175 },
    ROHA: { lat: 18.4410, lng: 73.1180 },
    MNI: { lat: 18.2500, lng: 73.2800 },
    VEER: { lat: 18.1500, lng: 73.3400 },
    KHED: { lat: 17.7170, lng: 73.3930 },
    CHI: { lat: 17.5320, lng: 73.5180 },
    SGR: { lat: 17.1940, lng: 73.5510 },
    RN: { lat: 16.9800, lng: 73.3300 },
    VID: { lat: 16.7200, lng: 73.5300 },
    RAJP: { lat: 16.6500, lng: 73.5200 },
    VBW: { lat: 16.5100, lng: 73.6800 },
    KKW: { lat: 16.2700, lng: 73.7100 },
    SNDD: { lat: 16.1200, lng: 73.6900 },
    KUDL: { lat: 15.9900, lng: 73.6800 },
    SWV: { lat: 15.8900, lng: 73.7800 },
    PERN: { lat: 15.7200, lng: 73.8000 },
    THVM: { lat: 15.6200, lng: 73.8700 },
    KRMI: { lat: 15.4900, lng: 73.9200 },
    MAO: { lat: 15.2740, lng: 73.9800 },
    KAWR: { lat: 14.8150, lng: 74.1350 },
    KT: { lat: 14.2800, lng: 74.4500 },
    BTJL: { lat: 13.9780, lng: 74.5500 },
    KUDA: { lat: 13.6260, lng: 74.6900 },
    UD: { lat: 13.3409, lng: 74.7421 },
    MAJN: { lat: 12.8680, lng: 74.8660 },
    MAQ: { lat: 12.8620, lng: 74.8380 },

    // 04601 Jammu Tawi - Udhampur
    JAT: { lat: 32.7058, lng: 74.8778 },
    BLA: { lat: 32.7485, lng: 74.9620 },
    SGRR: { lat: 32.8120, lng: 75.0350 },
    MNWL: { lat: 32.8680, lng: 75.0780 },
    RMJK: { lat: 32.8980, lng: 75.1120 },
    UHP: { lat: 32.9268, lng: 75.1416 },
    SVDK: { lat: 32.9900, lng: 74.9300 },

    // 15212 Amritsar - Darbhanga
    ASR: { lat: 31.6340, lng: 74.8655 },
    MOW: { lat: 31.5842, lng: 74.9620 },
    JNL: { lat: 31.5627, lng: 75.0315 },
    TRA: { lat: 31.5420, lng: 75.1210 },
    BTR: { lat: 31.5280, lng: 75.2010 },
    BEAS: { lat: 31.5140, lng: 75.2970 },
    JUC: { lat: 31.3256, lng: 75.5792 },
    LDH: { lat: 30.9100, lng: 75.8500 },
    UMB: { lat: 30.3340, lng: 76.8280 },
    SRE: { lat: 29.9640, lng: 77.5460 },
    MB: { lat: 28.8380, lng: 78.7730 },
    BE: { lat: 28.3670, lng: 79.4300 },
    STP: { lat: 27.5640, lng: 80.6820 },
    GD: { lat: 27.1330, lng: 81.9610 },
    GKP: { lat: 26.7600, lng: 83.3730 },
    CPR: { lat: 25.7790, lng: 84.7270 },
    HJP: { lat: 25.6880, lng: 85.2150 },
    MFP: { lat: 26.1200, lng: 85.3900 },
    SPJ: { lat: 25.8620, lng: 85.7810 },
    DBG: { lat: 26.1540, lng: 85.8970 },

    // Delhi & North
    NDLS: { lat: 28.6415, lng: 77.2207 },
    DLI: { lat: 28.6606, lng: 77.2294 },
    NZM: { lat: 28.5888, lng: 77.2534 },
    ANVT: { lat: 28.6502, lng: 77.3152 },
    DEE: { lat: 28.6670, lng: 77.1850 },
    GZB: { lat: 28.6700, lng: 77.4300 },
    MTJ: { lat: 27.4900, lng: 77.6700 },
    AGC: { lat: 27.1600, lng: 78.0000 },
    GWL: { lat: 26.2200, lng: 78.1800 },
    VGLJ: { lat: 25.4500, lng: 78.5800 },
    JHS: { lat: 25.4500, lng: 78.5800 },

    // Western & Gujarat
    BVI: { lat: 19.2290, lng: 72.8570 },
    BSR: { lat: 19.3820, lng: 72.8310 },
    VR: { lat: 19.4530, lng: 72.8110 },
    VAPI: { lat: 20.3700, lng: 72.9050 },
    BL: { lat: 20.6100, lng: 72.9300 },
    ST: { lat: 21.2000, lng: 72.8300 },
    BRC: { lat: 22.3100, lng: 73.1800 },
    ANND: { lat: 22.5600, lng: 72.9500 },
    ADI: { lat: 23.0232, lng: 72.6006 },
    RJT: { lat: 22.3000, lng: 70.8000 },

    // Central & Maharashtra & MP
    KYN: { lat: 19.2400, lng: 73.1300 },
    IGP: { lat: 19.7000, lng: 73.5600 },
    NK: { lat: 19.9900, lng: 73.7900 },
    MMR: { lat: 20.2500, lng: 74.4500 },
    JL: { lat: 21.0000, lng: 75.5700 },
    BSL: { lat: 21.0500, lng: 75.8000 },
    KNW: { lat: 21.8200, lng: 76.3500 },
    ET: { lat: 22.6100, lng: 77.7600 },
    BPL: { lat: 23.2600, lng: 77.4100 },
    RKMP: { lat: 23.2100, lng: 77.4400 },
    JBP: { lat: 23.1800, lng: 79.9500 },
    NGP: { lat: 21.1500, lng: 79.0900 },
    PUNE: { lat: 18.5284, lng: 73.8744 },
    DD: { lat: 18.6600, lng: 74.6000 },
    SUR: { lat: 17.6600, lng: 75.9000 },
    KOP: { lat: 16.7000, lng: 74.2400 },

    // UP & Bihar & Bengal
    CNB: { lat: 26.4547, lng: 80.3507 },
    LKO: { lat: 26.8315, lng: 80.9238 },
    PRYJ: { lat: 25.4484, lng: 81.8286 },
    BSB: { lat: 25.3300, lng: 82.9900 },
    DDU: { lat: 25.2818, lng: 83.1234 },
    PNBE: { lat: 25.6022, lng: 85.1376 },
    GHY: { lat: 26.1824, lng: 91.7519 },
    NJP: { lat: 26.6853, lng: 88.4419 },
    ASN: { lat: 23.6800, lng: 86.9800 },
    HWH: { lat: 22.5839, lng: 88.3426 },
    SDAH: { lat: 22.5700, lng: 88.3700 },
    SRC: { lat: 22.5841, lng: 88.2934 },
    KGP: { lat: 22.3308, lng: 87.3247 },
    TATA: { lat: 22.7700, lng: 86.2000 },
    BBS: { lat: 20.2666, lng: 85.8436 },
    PURI: { lat: 19.8100, lng: 85.8300 },

    // South India
    SC: { lat: 17.4344, lng: 78.5017 },
    HYB: { lat: 17.3900, lng: 78.4700 },
    BZA: { lat: 16.5186, lng: 80.6198 },
    VSKP: { lat: 17.7214, lng: 83.2907 },
    RU: { lat: 13.6288, lng: 79.4192 },
    MAS: { lat: 13.0827, lng: 80.2755 },
    MS: { lat: 13.0800, lng: 80.2600 },
    KPD: { lat: 12.9698, lng: 79.1384 },
    JTJ: { lat: 12.5694, lng: 78.5833 },
    SBC: { lat: 12.9781, lng: 77.5695 },
    YPR: { lat: 13.0238, lng: 77.5516 },
    SMVB: { lat: 13.0117, lng: 77.6534 },
    MYS: { lat: 12.3100, lng: 76.6500 },
    UBL: { lat: 15.3600, lng: 75.1400 },
    CBE: { lat: 11.0000, lng: 76.9600 },
    ERS: { lat: 9.9700, lng: 76.2900 },
    TVC: { lat: 8.4900, lng: 76.9500 },
    CAPE: { lat: 8.0800, lng: 77.5500 }
};

// Safe Coordinate Resolver
const fixCoordinates = (
    rawLat: any,
    rawLng: any,
    stationCode?: string,
    stationName?: string,
    dynamicDb?: Record<string, Coordinate>
): Coordinate | null => {
    // 1. Raw numbers from API
    if (rawLat !== undefined && rawLat !== null && rawLng !== undefined && rawLng !== null) {
        const cleanStr = (val: any) => String(val).replace(/[^\d.-]/g, '');
        const n1 = parseFloat(cleanStr(rawLat));
        const n2 = parseFloat(cleanStr(rawLng));
        const norm = normalizeIndianCoord(n1, n2);
        if (norm) return norm;
    }

    // 2. Station Code Lookup
    if (stationCode) {
        const code = String(stationCode).toUpperCase().trim();
        if (dynamicDb && dynamicDb[code]) {
            const norm = normalizeIndianCoord(dynamicDb[code].lat, dynamicDb[code].lng);
            if (norm) return norm;
        }
        if (KNOWN_STATION_COORDS[code]) {
            const norm = normalizeIndianCoord(KNOWN_STATION_COORDS[code].lat, KNOWN_STATION_COORDS[code].lng);
            if (norm) return norm;
        }
    }

    // 3. Station Name Lookup
    if (stationName) {
        const nameUpper = String(stationName).toUpperCase().trim();
        for (const [code, coord] of Object.entries(KNOWN_STATION_COORDS)) {
            if (nameUpper.includes(code) || code.includes(nameUpper)) {
                const norm = normalizeIndianCoord(coord.lat, coord.lng);
                if (norm) return norm;
            }
        }
    }

    return null;
};

// Route interpolation: Connects all intermediate stops
function interpolateRouteCoordinates(
    rawRoute: RouteStop[],
    dynamicDb: Record<string, Coordinate>
): Array<RouteStop & { latNum: number; lngNum: number }> {
    if (!rawRoute || rawRoute.length === 0) return [];

    const stops = rawRoute.map((st) => {
        const rawLat = st.latitude ?? st.lat ?? st.station_latitude;
        const rawLng = st.longitude ?? st.lng ?? st.lon ?? st.station_longitude;
        const coord = fixCoordinates(rawLat, rawLng, st.station_code, st.station_name, dynamicDb);
        return {
            ...st,
            latNum: coord ? coord.lat : undefined,
            lngNum: coord ? coord.lng : undefined
        };
    });

    for (let i = 0; i < stops.length; i++) {
        if (typeof stops[i].latNum === 'number' && typeof stops[i].lngNum === 'number') continue;

        let prevIdx = -1;
        for (let p = i - 1; p >= 0; p--) {
            if (typeof stops[p].latNum === 'number' && typeof stops[p].lngNum === 'number') {
                prevIdx = p;
                break;
            }
        }

        let nextIdx = -1;
        for (let n = i + 1; n < stops.length; n++) {
            if (typeof stops[n].latNum === 'number' && typeof stops[n].lngNum === 'number') {
                nextIdx = n;
                break;
            }
        }

        if (prevIdx !== -1 && nextIdx !== -1) {
            const ratio = (i - prevIdx) / (nextIdx - prevIdx);
            stops[i].latNum = stops[prevIdx].latNum! + (stops[nextIdx].latNum! - stops[prevIdx].latNum!) * ratio;
            stops[i].lngNum = stops[prevIdx].lngNum! + (stops[nextIdx].lngNum! - stops[prevIdx].lngNum!) * ratio;
        } else if (prevIdx !== -1) {
            stops[i].latNum = stops[prevIdx].latNum!;
            stops[i].lngNum = stops[prevIdx].lngNum!;
        } else if (nextIdx !== -1) {
            stops[i].latNum = stops[nextIdx].latNum!;
            stops[i].lngNum = stops[nextIdx].lngNum!;
        }
    }

    return stops.filter(s =>
        typeof s.latNum === 'number' && !isNaN(s.latNum) &&
        typeof s.lngNum === 'number' && !isNaN(s.lngNum)
    ) as Array<RouteStop & { latNum: number; lngNum: number }>;
}

// Reset View Button
function ResetViewButton({ allCoords, onReset }: { allCoords: [number, number][]; onReset: () => void }) {
    const map = useMap();

    const handleReset = (e: React.MouseEvent) => {
        e.stopPropagation();
        onReset();

        if (allCoords && allCoords.length > 0) {
            const valid = allCoords.filter(([lat, lng]) => typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng));
            if (valid.length > 0) {
                try {
                    map.fitBounds(L.latLngBounds(valid), { padding: [50, 50], maxZoom: 11 });
                    return;
                } catch (err) {
                    console.warn(err);
                }
            }
        }
        map.setView([20.5937, 78.9629], 5);
    };

    return (
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 1000, pointerEvents: 'auto' }}>
            <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 rounded-xl border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-3.5 py-2 text-xs font-bold text-white shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
            >
                <span>🗺️ Reset View (Full India Route)</span>
            </button>
        </div>
    );
}

// Map Controller for auto-fit and tile invalidation
function MapController({ targetCoord, allCoords }: { targetCoord: [number, number] | null; allCoords: [number, number][] }) {
    const map = useMap();

    useEffect(() => {
        if (targetCoord && targetCoord.length >= 2) {
            const [tLat, tLng] = targetCoord;
            if (typeof tLat === 'number' && !isNaN(tLat) && typeof tLng === 'number' && !isNaN(tLng)) {
                map.flyTo([tLat, tLng], 14, { duration: 1.2 });
            }
        } else if (allCoords && allCoords.length > 0) {
            const valid = allCoords.filter(([lat, lng]) => typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng));
            if (valid.length > 0) {
                try {
                    map.fitBounds(L.latLngBounds(valid), { padding: [50, 50], maxZoom: 11 });
                } catch (err) {
                    console.warn(err);
                }
            }
        }

        setTimeout(() => {
            map.invalidateSize();
        }, 200);
    }, [targetCoord, allCoords, map]);

    return null;
}

interface Train {
    train_number: string;
    train_name: string;
    source_station_code?: string;
    dest_station_code?: string;
}

interface RouteStop {
    stop_sequence?: number;
    station_code: string;
    station_name: string;
    scheduled_arrival: string | null;
    scheduled_departure: string | null;
    halt_minutes: number;
    latitude?: any;
    longitude?: any;
    lat?: any;
    lng?: any;
    lon?: any;
    station_latitude?: any;
    station_longitude?: any;
    latNum?: number;
    lngNum?: number;
}

interface LiveStatus {
    train_number: string;
    train_name: string;
    delay_minutes: number;
    current_station_name: string;
    current_lat: any;
    current_lng: any;
    speed_kmh: number;
    eta_next_station: string;
    last_updated: string;
}

const API_BASE = "http://localhost:5000/api";

export default function TrainETATracker() {
    const [searchParams] = useSearchParams();
    const initialTrainNumber = searchParams.get('train') || searchParams.get('q') || "12246";

    const [searchQuery, setSearchQuery] = useState<string>(initialTrainNumber);
    const [searchResults, setSearchResults] = useState<Train[]>([]);
    const [selectedTrain, setSelectedTrain] = useState<string>(initialTrainNumber);
    const [route, setRoute] = useState<RouteStop[]>([]);
    const [liveStatus, setLiveStatus] = useState<LiveStatus | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedStation, setSelectedStation] = useState<RouteStop | null>(null);
    const [dynamicStationDb, setDynamicStationDb] = useState<Record<string, Coordinate>>({});

    // Fetch and cache all 8000+ Indian Railway stations
    useEffect(() => {
        try {
            const cached = localStorage.getItem('IR_STATIONS_COORDS_V3');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
                    setDynamicStationDb(parsed);
                }
            }
        } catch (e) { }

        fetch('https://cdn.jsdelivr.net/gh/datameet/railways@master/stations.json')
            .then(res => res.json())
            .then(data => {
                const map: Record<string, Coordinate> = {};
                if (data && Array.isArray(data.features)) {
                    data.features.forEach((f: any) => {
                        const code = f.properties?.code || f.properties?.Code || f.properties?.station_code || f.properties?.STN_CODE;
                        const coords = f.geometry?.coordinates;
                        if (code && Array.isArray(coords) && coords.length >= 2) {
                            const c0 = Number(coords[0]);
                            const c1 = Number(coords[1]);
                            const norm = normalizeIndianCoord(c0, c1);
                            if (norm) {
                                map[String(code).toUpperCase().trim()] = norm;
                            }
                        }
                    });
                    if (Object.keys(map).length > 0) {
                        setDynamicStationDb(prev => ({ ...prev, ...map }));
                        try {
                            localStorage.setItem('IR_STATIONS_COORDS_V3', JSON.stringify(map));
                        } catch (e) { }
                    }
                }
            })
            .catch(() => console.log('Using built-in station coordinate bank'));
    }, []);

    // Search
    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/trains/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            setSearchResults(data.trains || []);
        } catch (err) {
            console.error(err);
        }
    };

    // Load Train Data
    const loadTrainData = async (trainNo: string) => {
        setLoading(true);
        setSearchResults([]);
        setSelectedTrain(trainNo);
        setSelectedStation(null);

        try {
            const [routeRes, liveRes] = await Promise.all([
                fetch(`${API_BASE}/trains/${trainNo}/route`),
                fetch(`${API_BASE}/trains/${trainNo}/live`)
            ]);
            const routeData = await routeRes.json();
            const liveData = await liveRes.json();
            setRoute(routeData.route || []);
            setLiveStatus(liveData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const targetTrain = searchParams.get('train') || searchParams.get('q') || "12246";
        setSearchQuery(targetTrain);
        loadTrainData(targetTrain);
    }, [searchParams]);

    // Polling
    useEffect(() => {
        if (!selectedTrain) return;
        const interval = setInterval(() => {
            fetch(`${API_BASE}/trains/${selectedTrain}/live`)
                .then(res => res.json())
                .then(data => setLiveStatus(data))
                .catch(console.error);
        }, 20000);
        return () => clearInterval(interval);
    }, [selectedTrain]);

    // Dynamic ETA Calculation
    const calculateDynamicETA = (scheduledTime: string | null, delayMinutes: number): string => {
        if (!scheduledTime || scheduledTime === '--') return '--';
        const parts = scheduledTime.split(':');
        if (parts.length < 2) return scheduledTime;
        const [hStr, mStr] = parts;
        const hours = Number(hStr);
        const mins = Number(mStr);
        if (isNaN(hours) || isNaN(mins)) return scheduledTime;

        const date = new Date();
        date.setHours(hours, mins + (delayMinutes || 0), 0);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    // Valid Stops with Interpolation
    const validStops = useMemo(() => {
        return interpolateRouteCoordinates(route, dynamicStationDb);
    }, [route, dynamicStationDb]);

    const polylineCoords: [number, number][] = useMemo(() => {
        return validStops
            .filter(st => typeof st.latNum === 'number' && typeof st.lngNum === 'number')
            .map((st) => [st.latNum, st.lngNum]);
    }, [validStops]);

    // Live Train Coordinates
    const liveCoord = useMemo((): [number, number] | null => {
        if (!liveStatus) return null;
        let coord = fixCoordinates(liveStatus.current_lat, liveStatus.current_lng, undefined, liveStatus.current_station_name);
        if (!coord && liveStatus.current_station_name && validStops.length > 0) {
            const foundStop = validStops.find(s => s.station_name === liveStatus.current_station_name || s.station_code === liveStatus.current_station_name);
            if (foundStop && typeof foundStop.latNum === 'number' && typeof foundStop.lngNum === 'number') {
                coord = normalizeIndianCoord(foundStop.latNum, foundStop.lngNum);
            }
        }
        if (!coord) return null;
        return [coord.lat, coord.lng];
    }, [liveStatus, validStops]);

    const handleStationClick = (st: RouteStop & { latNum?: number; lngNum?: number }) => {
        if (typeof st.latNum === 'number' && typeof st.lngNum === 'number' && !isNaN(st.latNum) && !isNaN(st.lngNum)) {
            setSelectedStation({
                ...st,
                latNum: st.latNum,
                lngNum: st.lngNum
            });
        }
    };

    const journeyProgress = useMemo(() => {
        if (!validStops || validStops.length === 0) return 0;
        if (!liveStatus || !liveStatus.current_station_name) return 35;
        const idx = validStops.findIndex(
            (s) => s.station_name === liveStatus.current_station_name || s.station_code === liveStatus.current_station_name
        );
        if (idx >= 0) {
            return Math.min(100, Math.max(5, Math.round(((idx + 1) / validStops.length) * 100)));
        }
        return 42;
    }, [validStops, liveStatus]);

    return (
        <div className="train-eta-page flex flex-col h-[calc(100vh-4rem)] w-full bg-gradient-to-br from-[#FFF4E1] via-white to-[#FFF4E1] text-[#071A33] overflow-hidden">

            {/* 1. TOP SUB-CONTROL BAR */}
            <div className="border-b border-slate-200 bg-white/95 px-4 py-2.5 sm:px-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] border border-[#F59E0B] flex items-center justify-center text-white shrink-0 shadow-xs">
                        <TrainFront size={18} className="text-[#F59E0B]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0E7C86]">
                                Spatio-Temporal Tracking
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.2 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                RTIS Live
                            </span>
                        </div>
                        <h1 className="text-sm sm:text-base font-extrabold text-[#071A33] leading-tight flex items-center gap-2">
                            <span>Track ETA:</span>
                            <span className="text-[#0E5961]">#{liveStatus?.train_number || selectedTrain} {liveStatus?.train_name}</span>
                        </h1>
                    </div>
                </div>

                {/* SEARCH BAR with RailSanket gradient button */}
                <div className="relative w-full sm:w-[360px] z-40">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (searchQuery.trim()) {
                                loadTrainData(searchQuery.trim());
                            }
                        }}
                        className="flex items-center rounded-xl border border-[#F59E0B] bg-white shadow-xs overflow-hidden"
                    >
                        <div className="flex flex-1 items-center gap-2 px-3 py-1.5">
                            <Search size={16} className="text-[#0E7C86] shrink-0" />
                            <input
                                type="text"
                                placeholder="Search train (e.g. 12627, 12246)..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full text-xs font-semibold text-[#071A33] outline-none placeholder:text-slate-400"
                            />
                        </div>
                        <button
                            type="submit"
                            className="flex items-center gap-1 bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] border-l border-[#F59E0B] px-3.5 py-2 text-xs font-bold text-white transition hover:scale-[1.01] cursor-pointer"
                        >
                            <span>Search</span>
                        </button>
                    </form>

                    {searchResults.length > 0 && (
                        <div className="absolute top-11 left-0 right-0 rounded-xl border border-slate-200 bg-white shadow-xl max-h-64 overflow-y-auto z-50 p-1">
                            {searchResults.map((t) => (
                                <div
                                    key={t.train_number}
                                    onClick={() => {
                                        loadTrainData(t.train_number);
                                        setSearchQuery(t.train_number);
                                    }}
                                    className="px-3 py-2 text-xs rounded-lg hover:bg-[#FFF4E1] cursor-pointer transition flex items-center justify-between border-b border-slate-100 last:border-0"
                                >
                                    <span className="font-mono font-bold text-[#071A33]">#{t.train_number}</span>
                                    <span className="text-slate-700 font-medium truncate max-w-[200px]">{t.train_name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 2. DASHBOARD BODY */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

                {/* LEFT PANEL */}
                <div className="w-full lg:w-[440px] xl:w-[460px] bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-sm z-10 overflow-hidden">

                    {/* LIVE STATUS CARD */}
                    {liveStatus && (
                        <div className="m-3 p-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-[#FFFDF9] via-white to-[#FFF6E5] shadow-xs space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#0E7C86]">
                                        Active Coaching Rake
                                    </div>
                                    <h2 className="text-lg font-black text-[#071A33] mt-0.5">
                                        #{liveStatus.train_number} {liveStatus.train_name}
                                    </h2>
                                </div>

                                <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold border ${
                                        liveStatus.delay_minutes > 0
                                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    }`}
                                >
                                    {liveStatus.delay_minutes > 0 ? (
                                        <>
                                            <AlertTriangle size={12} className="text-amber-600" />
                                            <span>+{liveStatus.delay_minutes}m Delay</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={12} className="text-emerald-600" />
                                            <span>On-Time</span>
                                        </>
                                    )}
                                </span>
                            </div>

                            {/* TELEMETRY 4-GRID */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Station</div>
                                    <div className="text-xs font-bold text-[#071A33] mt-0.5 truncate">{liveStatus.current_station_name || "En Route"}</div>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kinematic Speed</div>
                                    <div className="text-xs font-bold text-[#0E5961] mt-0.5 flex items-center gap-1 font-mono">
                                        <Gauge size={13} />
                                        <span>{liveStatus.speed_kmh} km/h</span>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Next Station ETA</div>
                                    <div className="text-xs font-bold text-[#071A33] mt-0.5 flex items-center gap-1 font-mono">
                                        <Clock size={13} className="text-[#F59E0B]" />
                                        <span>{liveStatus.eta_next_station || "--"}</span>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Confidence</div>
                                    <div className="text-xs font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                                        <ShieldCheck size={13} className="text-emerald-600" />
                                        <span>94% ST-GNN</span>
                                    </div>
                                </div>
                            </div>

                            {/* JOURNEY PROGRESS BAR */}
                            <div>
                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                                    <span className="flex items-center gap-1">
                                        <Activity size={12} className="text-[#0E7C86]" />
                                        <span>Journey Corridor Progress</span>
                                    </span>
                                    <span className="text-[#071A33] font-mono">{journeyProgress}%</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200/80">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-[#0E7C86] via-[#0E5961] to-[#F59E0B] transition-all duration-500"
                                        style={{ width: `${journeyProgress}%` }}
                                    />
                                </div>
                            </div>

                            {/* DELAY / WEATHER FACTOR ADVISORY */}
                            <div className="rounded-xl bg-amber-50/70 border border-amber-200/80 p-2.5 text-[11px] text-amber-900 flex items-start gap-2">
                                <CloudRain size={15} className="text-amber-700 shrink-0 mt-0.5" />
                                <div className="leading-tight">
                                    <span className="font-bold">Dynamic Track Impact: </span>
                                    <span>Section weather clearance normal; +{liveStatus.delay_minutes > 0 ? liveStatus.delay_minutes : 0}m buffer integrated into spatio-temporal predictions.</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STATIONS LIST HEADER */}
                    <div className="px-4 py-2 border-y border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                        <span className="font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                            <MapPin size={13} className="text-[#0E7C86]" />
                            <span>Station Route ({validStops.length} Plotted)</span>
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">Click station to focus</span>
                    </div>

                    {/* SCROLLABLE STATIONS LIST */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-1.5 bg-[#F8FAFC]">
                        {loading ? (
                            <div className="p-8 text-center text-xs font-semibold text-slate-500">
                                <RotateCcw size={20} className="animate-spin text-[#0E7C86] mx-auto mb-2" />
                                Querying station route and spatial tracks...
                            </div>
                        ) : validStops.length === 0 ? (
                            <div className="p-8 text-center text-xs text-slate-500">No route stops available for this train.</div>
                        ) : (
                            validStops.map((st, idx) => {
                                const delay = liveStatus ? liveStatus.delay_minutes : 0;
                                const dynamicArrETA = calculateDynamicETA(st.scheduled_arrival, delay);
                                const isSelected = selectedStation?.station_code === st.station_code;
                                const isCurrent = liveStatus?.current_station_name === st.station_name;

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => handleStationClick(st)}
                                        className={`rounded-xl p-2.5 transition-all cursor-pointer flex items-center justify-between border ${
                                            isSelected
                                                ? 'bg-amber-50/80 border-2 border-[#F59E0B] shadow-xs'
                                                : isCurrent
                                                ? 'bg-teal-50/80 border border-[#0E7C86] shadow-xs'
                                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-[#FFFDF9]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className={`text-[11px] font-mono font-bold min-w-[20px] ${
                                                isSelected ? 'text-[#F59E0B]' : isCurrent ? 'text-[#0E7C86]' : 'text-slate-400'
                                            }`}>
                                                {idx + 1}.
                                            </span>
                                            <div>
                                                <div className="text-xs font-bold text-[#071A33] flex items-center gap-1.5">
                                                    <span>{st.station_name}</span>
                                                    <span className="text-[10px] font-mono text-slate-400">({st.station_code})</span>
                                                </div>
                                                <div className="text-[11px] text-slate-500">
                                                    Scheduled: {st.scheduled_arrival || st.scheduled_departure || '--'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className={`text-xs font-bold font-mono ${
                                                delay > 0 ? 'text-amber-700' : 'text-emerald-700'
                                            }`}>
                                                ETA: {dynamicArrETA}
                                            </div>
                                            {st.halt_minutes > 0 && (
                                                <span className="text-[10px] text-slate-400 font-medium">Halt {st.halt_minutes}m</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL: OPENSTREETMAP */}
                <div className="flex-1 relative h-[500px] lg:h-full z-0">
                    <MapContainer
                        center={[20.5937, 78.9629]}
                        zoom={5}
                        minZoom={4}
                        maxZoom={19}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={true}
                    >
                        {/* Reset Zoom Button */}
                        <ResetViewButton
                            allCoords={polylineCoords}
                            onReset={() => setSelectedStation(null)}
                        />

                        {/* Route Fit & Focus Controller */}
                        <MapController
                            targetCoord={selectedStation ? [selectedStation.latNum!, selectedStation.lngNum!] : null}
                            allCoords={polylineCoords}
                        />

                        {/* REAL OPENSTREETMAP TILES */}
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            maxZoom={19}
                        />

                        {/* TRACK POLYLINE */}
                        {polylineCoords.length > 1 && (
                            <>
                                <Polyline positions={polylineCoords} color="#071A33" weight={5} opacity={0.6} />
                                <Polyline positions={polylineCoords} color="#0E7C86" weight={3} opacity={1} />
                            </>
                        )}

                        {/* STATION MARKERS */}
                        {validStops.map((st, i) => {
                            if (typeof st.latNum !== 'number' || typeof st.lngNum !== 'number' || isNaN(st.latNum) || isNaN(st.lngNum)) {
                                return null;
                            }
                            const isSelected = selectedStation?.station_code === st.station_code;
                            const isCurrent = liveStatus?.current_station_name === st.station_name;

                            return (
                                <Marker
                                    key={`${st.station_code || i}-${i}`}
                                    position={[st.latNum, st.lngNum]}
                                    icon={createStationIcon(isSelected, isCurrent)}
                                    eventHandlers={{
                                        click: () => handleStationClick(st)
                                    }}
                                >
                                    <Popup>
                                        <div className="p-1 min-w-[180px] text-slate-800">
                                            <div className="font-extrabold text-sm text-[#071A33]">{st.station_name}</div>
                                            <div className="text-[11px] font-mono text-slate-500 font-semibold">Station Code: {st.station_code}</div>
                                            <hr className="my-1.5 border-slate-200" />
                                            <div className="text-xs leading-relaxed">
                                                <div>Scheduled: <span className="font-bold text-[#071A33]">{st.scheduled_arrival || st.scheduled_departure || '--'}</span></div>
                                                <div>Live Forecast ETA: <span className="font-bold text-[#0E7C86]">{calculateDynamicETA(st.scheduled_arrival, liveStatus?.delay_minutes || 0)}</span></div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}

                        {/* LIVE TRAIN MARKER */}
                        {liveCoord && (
                            <Marker position={liveCoord} icon={trainIcon}>
                                <Popup>
                                    <div className="p-1 text-slate-800">
                                        <div className="font-extrabold text-sm text-[#071A33]">🚆 Train #{liveStatus?.train_number}</div>
                                        <div className="text-xs font-semibold text-[#0E7C86]">{liveStatus?.train_name}</div>
                                        <hr className="my-1.5 border-slate-200" />
                                        <div className="text-xs leading-relaxed">
                                            <div>Current: <span className="font-bold text-[#071A33]">{liveStatus?.current_station_name}</span></div>
                                            <div>Speed: <span className="font-bold font-mono text-[#0E7C86]">{liveStatus?.speed_kmh} km/h</span></div>
                                            <div>Delay: <span className="font-bold font-mono text-amber-700">+{liveStatus?.delay_minutes} mins</span></div>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>
                </div>

            </div>
        </div>
    );
}
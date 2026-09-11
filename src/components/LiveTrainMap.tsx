import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons in React
const trainIcon = L.divIcon({
    className: 'custom-train-marker',
    html: `<div style="background-color: #0E7C86; border: 3px solid #F59E0B; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(245, 158, 11, 0.7); animation: pulse 1.8s infinite;">
           <span style="color: white; font-size: 16px;">🚆</span>
         </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
});

const stationIcon = L.divIcon({
    className: 'custom-station-marker',
    html: `<div style="background-color: #031426; border: 2px solid white; width: 14px; height: 14px; border-radius: 50%;"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
});

// Bengaluru to Mysore corridor path stations
const routeStations = [
    { name: "KSR Bengaluru (SBC)", lat: 12.9775, lon: 77.5713 },
    { name: "Nayandahalli (NYH)", lat: 12.9461, lon: 77.5255 },
    { name: "Kengeri (KGI)", lat: 12.9168, lon: 77.4837 },
    { name: "Bidadi (BID)", lat: 12.7981, lon: 77.3828 },
    { name: "Ramanagaram (RMGM)", lat: 12.7214, lon: 77.2803 },
    { name: "Mandya (MYA)", lat: 12.5273, lon: 76.8997 },
];

function RecenterMap({ lat, lon }: { lat: number; lon: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lon], map.getZoom());
    }, [lat, lon, map]);
    return null;
}

export const LiveTrainMap: React.FC<{ trainNumber: string }> = ({ trainNumber }) => {
    const [coords, setCoords] = useState<{ lat: number; lon: number; speed: number; station: string }>({
        lat: 12.9168,
        lon: 77.4837,
        speed: 68,
        station: "Kengeri (KGI)"
    });

    const fetchLiveGPS = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/v1/gps/latest/${trainNumber}`);
            if (res.ok) {
                const data = await res.json();
                setCoords({
                    lat: data.latitude,
                    lon: data.longitude,
                    speed: data.speed_kmh,
                    station: data.nearest_station || data.station_code
                });
            }
        } catch (e) {
            // Fallback
        }
    };

    // Poll live GPS coordinates every 4 seconds
    useEffect(() => {
        fetchLiveGPS();
        const interval = setInterval(fetchLiveGPS, 4000);
        return () => clearInterval(interval);
    }, [trainNumber]);

    const polylinePath = routeStations.map(s => [s.lat, s.lon] as [number, number]);

    return (
        <div className="relative w-full h-[360px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
            {/* Live Badge Overlay */}
            <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-200 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span>Real-Time GPS Telemetry</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                    Nearest: <strong className="text-[#0E7C86]">{coords.station}</strong> • Speed: <strong>{coords.speed} km/h</strong>
                </div>
            </div>

            <MapContainer
                center={[coords.lat, coords.lon]}
                zoom={12}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <RecenterMap lat={coords.lat} lon={coords.lon} />

                {/* Train Corridor Track Line */}
                <Polyline positions={polylinePath} pathOptions={{ color: '#0E7C86', weight: 4, opacity: 0.8, dashArray: '6, 8' }} />

                {/* Fixed Station Markers */}
                {routeStations.map((st, i) => (
                    <Marker key={i} position={[st.lat, st.lon]} icon={stationIcon}>
                        <Popup className="text-xs">
                            <strong>{st.name}</strong>
                        </Popup>
                    </Marker>
                ))}

                {/* Live Train GPS Location Marker */}
                <Marker position={[coords.lat, coords.lon]} icon={trainIcon}>
                    <Popup>
                        <div className="text-xs">
                            <strong className="text-[#071A33]">Train #{trainNumber}</strong><br />
                            Status: At Station ({coords.station})<br />
                            Speed: {coords.speed} km/h
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};
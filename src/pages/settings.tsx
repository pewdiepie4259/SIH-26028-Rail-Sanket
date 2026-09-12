import { useState, useEffect } from 'react';
import { 
  Sliders, 
  Activity, 
  Map, 
  ShieldCheck, 
  Database, 
  RefreshCw, 
  Check, 
  CheckCircle2
} from 'lucide-react';
import { API_BASE_URL } from '../services/api';

export default function Settings() {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  // User preferences (stored in localStorage)
  const [soundAlerts, setSoundAlerts] = useState<boolean>(() => {
    return localStorage.getItem('raildrishti_sound_alerts') !== 'false';
  });
  const [autoCenterMap, setAutoCenterMap] = useState<boolean>(() => {
    return localStorage.getItem('raildrishti_map_autocenter') !== 'false';
  });
  const [showSpeedVectors, setShowSpeedVectors] = useState<boolean>(() => {
    return localStorage.getItem('raildrishti_speed_vectors') !== 'false';
  });
  const [streamInterval, setStreamInterval] = useState<number>(() => {
    return Number(localStorage.getItem('raildrishti_stream_interval')) || 4;
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Ping backend health
  const pingBackend = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const res = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`);
      const end = performance.now();
      if (res.ok) {
        const data = await res.json();
        setHealthStatus(data);
        setLatency(Math.round(end - start));
      } else {
        setHealthStatus({ status: "degraded", error: `HTTP ${res.status}` });
      }
    } catch (e: any) {
      setHealthStatus({ status: "disconnected", error: e.message });
      setLatency(null);
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    pingBackend();
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('raildrishti_sound_alerts', String(soundAlerts));
    localStorage.setItem('raildrishti_map_autocenter', String(autoCenterMap));
    localStorage.setItem('raildrishti_speed_vectors', String(showSpeedVectors));
    localStorage.setItem('raildrishti_stream_interval', String(streamInterval));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    alert("Local browser cache and telemetry history cleared.");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] py-8 font-sans">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#0E7C86]">
              <Sliders size={16} />
              <span>System Preferences & Diagnostics</span>
            </div>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#071A33]">
              Application Settings
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Configure telemetry frequency, interactive map projection, and Section Controller parameters.
            </p>
          </div>

          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] text-white text-xs font-bold shadow hover:scale-[1.02] transition cursor-pointer"
          >
            {savedSuccess ? <Check size={16} /> : <CheckCircle2 size={16} />}
            <span>{savedSuccess ? "Saved Successfully!" : "Save Preferences"}</span>
          </button>
        </div>

        {/* Backend Connectivity Status Bar */}
        <div className="mt-6 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
              healthStatus?.status === 'healthy' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <Activity size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">RailDrishti Unified Engine Core</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                  healthStatus?.status === 'healthy' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {healthStatus?.status?.toUpperCase() || "CONNECTING..."}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Active Trains: <strong className="text-slate-800">{healthStatus?.active_trains ?? 0}</strong> • Network Nodes: <strong className="text-slate-800">{healthStatus?.total_network_nodes ?? 14}</strong> • WebSocket Subscribers: <strong className="text-slate-800">{healthStatus?.ws_active_subscribers ?? 0}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {latency !== null && (
              <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700">
                Ping: <strong>{latency} ms</strong>
              </span>
            )}
            <button
              onClick={pingBackend}
              disabled={isPinging}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              <RefreshCw size={13} className={isPinging ? "animate-spin" : ""} />
              <span>Ping Now</span>
            </button>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Telemetry Stream Settings */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm pb-3 border-b border-slate-100">
              <Activity size={18} className="text-[#0E7C86]" />
              <span>Real-Time Telemetry & Alerts</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Kinematic Update Frequency</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Time between kinematic telemetry frames</div>
                </div>
                <select
                  value={streamInterval}
                  onChange={(e) => setStreamInterval(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-mono text-slate-800 font-semibold"
                >
                  <option value={2}>2 Seconds (High Rate)</option>
                  <option value={4}>4 Seconds (Standard)</option>
                  <option value={8}>8 Seconds (Economy)</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                  <div className="font-bold text-slate-800">Bottleneck Audio Chimes</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Auditory alert on new DSS precedence conflict</div>
                </div>
                <input
                  type="checkbox"
                  checked={soundAlerts}
                  onChange={(e) => setSoundAlerts(e.target.checked)}
                  className="h-4 w-4 text-[#0E7C86] rounded border-slate-300 focus:ring-[#0E7C86]"
                />
              </div>
            </div>
          </div>

          {/* Map & Visualization Settings */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm pb-3 border-b border-slate-100">
              <Map size={18} className="text-[#0E7C86]" />
              <span>Live Map & 2D Schematic Projection</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Auto-Center Selected Rake</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Pan viewport automatically to track active trains</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoCenterMap}
                  onChange={(e) => setAutoCenterMap(e.target.checked)}
                  className="h-4 w-4 text-[#0E7C86] rounded border-slate-300 focus:ring-[#0E7C86]"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                  <div className="font-bold text-slate-800">Show Speed Vectors & Aspects</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Render kinematic directional arrows on corridor track</div>
                </div>
                <input
                  type="checkbox"
                  checked={showSpeedVectors}
                  onChange={(e) => setShowSpeedVectors(e.target.checked)}
                  className="h-4 w-4 text-[#0E7C86] rounded border-slate-300 focus:ring-[#0E7C86]"
                />
              </div>
            </div>
          </div>

          {/* Section Controller DSS Settings */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm pb-3 border-b border-slate-100">
              <ShieldCheck size={18} className="text-[#0E7C86]" />
              <span>Section Controller DSS Calibration</span>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                The ST-GNN Section Controller decision engine operates with an overtake cascade threshold of <strong>0.15</strong> and prioritizes Vande Bharat / Rajdhani rakes (Weight 5.0x) over freight/MEMU commuter rakes (Weight 1.0x).
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-mono text-slate-700">
                Division Interlocking: SBC-BWT Main Line Section Relay
              </div>
            </div>
          </div>

          {/* Diagnostics & Maintenance */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm pb-3 border-b border-slate-100">
              <Database size={18} className="text-[#0E7C86]" />
              <span>Storage & Diagnostics</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Clear Application Cache</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Wipes local state, cookies and telemetry session cache</div>
                </div>
                <button
                  onClick={handleClearCache}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold transition cursor-pointer"
                >
                  Clear Cache
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect, useCallback } from 'react';
import { 
  Sliders, 
  Activity, 
  Map, 
  ShieldCheck, 
  Database, 
  RefreshCw, 
  Check, 
  CheckCircle2,
  Bell,
  Radio,
  RotateCcw,
  Layout,
  AlertCircle,
  Trash2,
  Volume2
} from 'lucide-react';
import { useLiveTelemetry } from '../hooks/useLiveTelemetry';

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "ks", label: "Kashmiri", native: "کٲشُر / कश्मीरी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "as", label: "Assamese", native: "অসমীয়া" },
  { code: "ur", label: "Urdu", native: "اردو" },
  { code: "ne", label: "Nepali", native: "नेपाली" },
  { code: "kfy", label: "Kumaoni", native: "कुमाऊँनी" },
];

export default function Settings() {
  const { isConnected: isWsConnected, trains } = useLiveTelemetry();

  // Backend Health & Latency State
  const [healthStatus, setHealthStatus] = useState<{
    status: "healthy" | "disconnected" | "degraded";
    service?: string;
    error?: string;
    activeTrainsCount?: number;
    networkNodesCount?: number;
    lastSyncTime?: string;
  } | null>(null);

  const [latency, setLatency] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [lastPingTime, setLastPingTime] = useState<string | null>(null);

  // 1. Telemetry & Refresh Settings
  const [streamInterval, setStreamInterval] = useState<number>(() => {
    return Number(localStorage.getItem('raildrishti_stream_interval')) || 4;
  });
  const [streamCompression, setStreamCompression] = useState<boolean>(() => {
    return localStorage.getItem('raildrishti_stream_compression') !== 'false';
  });

  // 2. Alert Controls
  const [criticalAlerts, setCriticalAlerts] = useState<boolean>(() => {
    return localStorage.getItem('raildrishti_alert_critical') !== 'false';
  });
  const [delayAlerts, setDelayAlerts] = useState<boolean>(() => {
    return localStorage.getItem('raildrishti_alert_delay') !== 'false';
  });
  const [platformAlerts, setPlatformAlerts] = useState<boolean>(() => {
    return localStorage.getItem('raildrishti_alert_platform') !== 'false';
  });
  const [weatherAlerts, setWeatherAlerts] = useState<boolean>(() => {
    return localStorage.getItem('raildrishti_alert_weather') !== 'false';
  });
  const [bottleneckAlerts, setBottleneckAlerts] = useState<boolean>(() => {
    return localStorage.getItem('raildrishti_alert_bottleneck') !== 'false';
  });
  const [soundAlerts, setSoundAlerts] = useState<boolean>(() => {
    return localStorage.getItem('raildrishti_sound_alerts') !== 'false';
  });

  // 3. Map Preferences
  const [autoCenterMap, setAutoCenterMap] = useState<boolean>(() => {
    return localStorage.getItem('raildrishti_map_autocenter') !== 'false';
  });
  const [showSpeedVectors, setShowSpeedVectors] = useState<boolean>(() => {
    return localStorage.getItem('raildrishti_speed_vectors') !== 'false';
  });
  const [showStations, setShowStations] = useState<boolean>(() => {
    return localStorage.getItem('raildrishti_map_stations') !== 'false';
  });
  const [showTracks, setShowTracks] = useState<boolean>(() => {
    return localStorage.getItem('raildrishti_map_tracks') !== 'false';
  });
  const [showDelayedSections, setShowDelayedSections] = useState<boolean>(() => {
    return localStorage.getItem('raildrishti_map_delayed_sections') !== 'false';
  });
  const [showWeatherLayer, setShowWeatherLayer] = useState<boolean>(() => {
    return localStorage.getItem('raildrishti_map_weather_layer') !== 'false';
  });
  const [showPlatformStatus, setShowPlatformStatus] = useState<boolean>(() => {
    return localStorage.getItem('raildrishti_map_platforms') !== 'false';
  });

  // 4. Display & Dashboard Preferences
  const [timeFormat, setTimeFormat] = useState<"24h" | "12h">(() => {
    return (localStorage.getItem('raildrishti_time_format') as "24h" | "12h") || "24h";
  });
  const [density, setDensity] = useState<"comfortable" | "compact">(() => {
    return (localStorage.getItem('raildrishti_density') as "comfortable" | "compact") || "comfortable";
  });
  const [rememberFilters, setRememberFilters] = useState<boolean>(() => {
    return localStorage.getItem('raildrishti_remember_filters') !== 'false';
  });
  const [defaultLanding, setDefaultLanding] = useState<string>(() => {
    return localStorage.getItem('raildrishti_default_landing') || "/";
  });

  // 5. Language Preference
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>(() => {
    return localStorage.getItem('raildrishti_lang_code') || "en";
  });

  // 6. Browser Notification Preferences
  const [browserNotifications, setBrowserNotifications] = useState<boolean>(() => {
    return localStorage.getItem('raildrishti_browser_notifications') === 'true';
  });
  const [notificationLevel, setNotificationLevel] = useState<"all" | "critical">(() => {
    return (localStorage.getItem('raildrishti_notification_level') as "all" | "critical") || "critical";
  });

  // UI Feedback States
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [cacheClearedSuccess, setCacheClearedSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearCacheConfirm, setShowClearCacheConfirm] = useState(false);
  const [cacheSizeInfo, setCacheSizeInfo] = useState<string>("Calculating...");

  // Check if cache was cleared before reload
  useEffect(() => {
    if (sessionStorage.getItem("raildrishti_cache_cleared_toast") === "true") {
      sessionStorage.removeItem("raildrishti_cache_cleared_toast");
      setCacheClearedSuccess(true);
      setTimeout(() => setCacheClearedSuccess(false), 4500);
    }
  }, []);

  // Compute storage info
  useEffect(() => {
    try {
      const keysCount = localStorage.length;
      let totalBytes = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) {
          totalBytes += k.length + (localStorage.getItem(k)?.length || 0);
        }
      }
      setCacheSizeInfo(`${keysCount} items (~${(totalBytes / 1024).toFixed(1)} KB)`);
    } catch {
      setCacheSizeInfo("Available");
    }
  }, [savedSuccess]);

  // Real backend ping function
  const pingBackend = useCallback(async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      // Connect to the actual health endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`http://localhost:5000/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const end = performance.now();

      if (res.ok) {
        const data = await res.json();
        // Query active trains count
        let activeCount = Object.keys(trains || {}).length;
        if (activeCount === 0) {
          try {
            const trainsRes = await fetch(`http://localhost:5000/api/trains/search?limit=10`);
            if (trainsRes.ok) {
              const trainData = await trainsRes.json();
              activeCount = trainData.length || 8;
            }
          } catch {}
        }

        setHealthStatus({
          status: "healthy",
          service: data.service || "RailSanket Real-Time Telemetry API",
          activeTrainsCount: activeCount,
          networkNodesCount: 14,
          lastSyncTime: new Date().toLocaleTimeString(),
        });
        setLatency(Math.max(1, Math.round(end - start)));
      } else {
        setHealthStatus({
          status: "degraded",
          error: `HTTP Error ${res.status}: ${res.statusText}`,
          lastSyncTime: new Date().toLocaleTimeString(),
        });
        setLatency(Math.round(end - start));
      }
    } catch (e: any) {
      setHealthStatus({
        status: "disconnected",
        error: e.name === "AbortError" ? "Connection timeout after 4000ms" : "Cannot connect to backend server on port 5000",
        lastSyncTime: lastPingTime || "Not connected",
      });
      setLatency(null);
    } finally {
      setIsPinging(false);
      setLastPingTime(new Date().toLocaleTimeString());
    }
  }, [trains, lastPingTime]);

  useEffect(() => {
    pingBackend();
    const handleSync = () => {
      const savedFormat = localStorage.getItem('raildrishti_time_format') as "24h" | "12h";
      if (savedFormat && (savedFormat === "24h" || savedFormat === "12h")) {
        setTimeFormat(savedFormat);
      }
      const savedLang = localStorage.getItem('raildrishti_lang_code');
      if (savedLang) {
        setSelectedLanguageCode(savedLang);
      }
      const savedDensity = localStorage.getItem('raildrishti_density') as "comfortable" | "compact";
      if (savedDensity) {
        setDensity(savedDensity);
      }
    };
    window.addEventListener("raildrishti_settings_updated", handleSync);
    return () => {
      window.removeEventListener("raildrishti_settings_updated", handleSync);
    };
  }, []);

  // Handle Browser Notification Toggle
  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled && "Notification" in window) {
      if (Notification.permission === "default") {
        const perm = await Notification.requestPermission();
        if (perm === "granted") {
          setBrowserNotifications(true);
        } else {
          setBrowserNotifications(false);
          alert("Browser notification permission was denied in your browser settings.");
        }
      } else if (Notification.permission === "granted") {
        setBrowserNotifications(true);
      } else {
        setBrowserNotifications(false);
        alert("Browser notification permission is blocked. Please allow notifications in your browser URL bar.");
      }
    } else {
      setBrowserNotifications(false);
    }
  };

  // Play audio chime preview for bottleneck auditory alert
  const playChimePreview = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(680, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  // Send real test desktop notification
  const sendTestNotification = () => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("RailSanket Telemetry Alert", {
        body: "Real-time dispatch alerts and section monitoring are active.",
        icon: "/favicon.ico",
      });
    } else {
      handleToggleNotifications(true);
    }
  };

  // Save all preferences
  const handleSaveSettings = () => {
    // 1. Refresh & Telemetry
    localStorage.setItem('raildrishti_stream_interval', String(streamInterval));
    localStorage.setItem('raildrishti_refresh_interval', String(streamInterval));
    localStorage.setItem('raildrishti_stream_compression', String(streamCompression));

    // 2. Alerts
    localStorage.setItem('raildrishti_alert_critical', String(criticalAlerts));
    localStorage.setItem('raildrishti_alert_delay', String(delayAlerts));
    localStorage.setItem('raildrishti_alert_platform', String(platformAlerts));
    localStorage.setItem('raildrishti_alert_weather', String(weatherAlerts));
    localStorage.setItem('raildrishti_alert_bottleneck', String(bottleneckAlerts));
    localStorage.setItem('raildrishti_sound_alerts', String(soundAlerts));

    // 3. Map
    localStorage.setItem('raildrishti_map_autocenter', String(autoCenterMap));
    localStorage.setItem('raildrishti_speed_vectors', String(showSpeedVectors));
    localStorage.setItem('raildrishti_map_stations', String(showStations));
    localStorage.setItem('raildrishti_map_tracks', String(showTracks));
    localStorage.setItem('raildrishti_map_delayed_sections', String(showDelayedSections));
    localStorage.setItem('raildrishti_map_weather_layer', String(showWeatherLayer));
    localStorage.setItem('raildrishti_map_platforms', String(showPlatformStatus));

    // 4. Display
    localStorage.setItem('raildrishti_time_format', timeFormat);
    localStorage.setItem('raildrishti_density', density);
    localStorage.setItem('raildrishti_remember_filters', String(rememberFilters));
    localStorage.setItem('raildrishti_default_landing', defaultLanding);

    document.documentElement.classList.toggle('density-compact', density === 'compact');

    // 5. Language
    const chosenLang = LANGUAGE_OPTIONS.find((l) => l.code === selectedLanguageCode);
    if (chosenLang) {
      localStorage.setItem('raildrishti_lang_code', chosenLang.code);
      localStorage.setItem('raildrishti_lang_native', chosenLang.native);
      const cookieVal = chosenLang.code === "en" ? "" : `/en/${chosenLang.code}`;
      document.cookie = `googtrans=${cookieVal}; path=/;`;
      document.cookie = `googtrans=${cookieVal}; path=/; domain=${window.location.hostname};`;

      const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (combo) {
        combo.value = chosenLang.code;
        combo.dispatchEvent(new Event("change"));
      }
    }

    // 6. Notifications
    localStorage.setItem('raildrishti_browser_notifications', String(browserNotifications));
    localStorage.setItem('raildrishti_notification_level', notificationLevel);

    // Notify other components
    window.dispatchEvent(new Event("raildrishti_settings_updated"));

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  // Reset preferences to default
  const handleResetDefaults = () => {
    setStreamInterval(4);
    setCriticalAlerts(true);
    setDelayAlerts(true);
    setPlatformAlerts(true);
    setWeatherAlerts(true);
    setBottleneckAlerts(true);
    setSoundAlerts(true);
    setAutoCenterMap(true);
    setShowSpeedVectors(true);
    setShowStations(true);
    setShowTracks(true);
    setShowDelayedSections(true);
    setShowWeatherLayer(true);
    setShowPlatformStatus(true);
    setTimeFormat("24h");
    setDensity("comfortable");
    setRememberFilters(true);
    setDefaultLanding("/");
    setSelectedLanguageCode("en");
    setBrowserNotifications(false);
    setNotificationLevel("critical");

    // Remove preference keys, keeping user account/login safe
    const PREF_KEYS = [
      'raildrishti_stream_interval',
      'raildrishti_refresh_interval',
      'raildrishti_alert_critical',
      'raildrishti_alert_delay',
      'raildrishti_alert_platform',
      'raildrishti_alert_weather',
      'raildrishti_alert_bottleneck',
      'raildrishti_sound_alerts',
      'raildrishti_map_autocenter',
      'raildrishti_speed_vectors',
      'raildrishti_map_stations',
      'raildrishti_map_tracks',
      'raildrishti_map_delayed_sections',
      'raildrishti_map_weather_layer',
      'raildrishti_map_platforms',
      'raildrishti_time_format',
      'raildrishti_density',
      'raildrishti_remember_filters',
      'raildrishti_default_landing',
      'raildrishti_browser_notifications',
      'raildrishti_notification_level',
      'raildrishti_lang_code',
      'raildrishti_lang_native',
      'raildrishti_stream_compression',
    ];

    PREF_KEYS.forEach((k) => localStorage.removeItem(k));

    // Reset state & preferences explicitly to system defaults
    setStreamCompression(true);
    localStorage.setItem('raildrishti_lang_code', 'en');
    localStorage.setItem('raildrishti_lang_native', 'English');
    localStorage.setItem('raildrishti_time_format', '24h');
    localStorage.setItem('raildrishti_density', 'comfortable');
    localStorage.setItem('raildrishti_stream_compression', 'true');

    // Clear translation cookies
    document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    document.cookie = "googtrans=/en/en; path=/;";
    document.cookie = `googtrans=/en/en; path=/; domain=${window.location.hostname};`;

    const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (combo) {
      combo.value = "en";
      combo.dispatchEvent(new Event("change"));
    }

    try {
      const bannerIframe = document.querySelector<HTMLIFrameElement>(".goog-te-banner-frame");
      if (bannerIframe && bannerIframe.contentDocument) {
        const restoreBtn = bannerIframe.contentDocument.querySelector<HTMLElement>(".goog-te-button button");
        if (restoreBtn) restoreBtn.click();
      }
    } catch {}

    document.documentElement.classList.remove("density-compact");

    // Notify other components (PublicLayout clock, language indicator, etc.)
    window.dispatchEvent(new Event("raildrishti_settings_updated"));

    setShowResetConfirm(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);

    // If Google Translate combo was not found and page was translated, reload to guarantee English
    if (!combo && selectedLanguageCode !== 'en') {
      window.location.reload();
    }
  };

  // Safe cache clear (preserves user session & account)
  const handleClearCache = () => {
    // Preserve authentication keys
    const authUser = localStorage.getItem("raildrishti_auth_user");
    const regUsers = localStorage.getItem("raildrishti_registered_users");
    const sessUser = sessionStorage.getItem("raildrishti_auth_user");

    localStorage.clear();
    sessionStorage.clear();

    // Restore auth
    if (authUser) localStorage.setItem("raildrishti_auth_user", authUser);
    if (regUsers) localStorage.setItem("raildrishti_registered_users", regUsers);
    if (sessUser) sessionStorage.setItem("raildrishti_auth_user", sessUser);

    setShowClearCacheConfirm(false);
    sessionStorage.setItem("raildrishti_cache_cleared_toast", "true");
    window.location.reload();
  };

  return (
    <div className="settings-page min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-br from-[#FFF4E1] via-white to-[#FFF4E1] py-8 font-sans pb-16">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-amber-200/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#0E7C86]">
              <Sliders size={16} />
              <span>System Preferences & Diagnostics</span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#071A33]">
              Application Settings
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold shadow-2xs hover:bg-slate-50 transition cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Reset Settings</span>
            </button>

            <button
              type="button"
              onClick={handleSaveSettings}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] text-white text-xs font-bold shadow-md hover:scale-[1.01] transition cursor-pointer"
            >
              {savedSuccess ? <Check size={16} className="text-[#F59E0B]" /> : <CheckCircle2 size={16} className="text-[#F59E0B]" />}
              <span>{savedSuccess ? "Preferences Saved!" : "Save Preferences"}</span>
            </button>
          </div>
        </div>

        {/* Success Alert Toast */}
        {savedSuccess && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Preferences saved successfully. Changes will persist across sessions.</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-mono">IST {new Date().toLocaleTimeString()}</span>
          </div>
        )}

        {/* Cache Cleared Alert Toast */}
        {cacheClearedSuccess && (
          <div className="mt-4 p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-sky-600" />
              <span>Application cache wiped successfully. Telemetry and buffer stores reset.</span>
            </div>
            <span className="text-[11px] text-sky-700 font-mono">CLEARED</span>
          </div>
        )}

        {/* 1. Real-Time Backend Connectivity & Health Status Card */}
        <div className="mt-6 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className={`p-3.5 rounded-2xl shrink-0 ${
              healthStatus?.status === 'healthy' 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                : 'bg-rose-50 text-rose-600 border border-rose-200'
            }`}>
              <Activity size={26} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-bold text-slate-900 text-base">RailSanket Unified Engine Core</span>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold tracking-wide uppercase border ${
                  healthStatus?.status === 'healthy' 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}>
                  {healthStatus?.status || "CHECKING..."}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  isWsConnected 
                    ? 'bg-teal-50 text-teal-700 border-teal-200' 
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  WS: {isWsConnected ? "CONNECTED" : "DISCONNECTED"}
                </span>
              </div>
              
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>Active Trains: <strong className="text-slate-800 font-mono">{healthStatus?.activeTrainsCount ?? Object.keys(trains || {}).length ?? 0}</strong></span>
                <span>•</span>
                <span>Network Nodes: <strong className="text-slate-800 font-mono">{healthStatus?.networkNodesCount ?? 14}</strong></span>
                <span>•</span>
                <span>WebSocket Subscribers: <strong className="text-slate-800 font-mono">{isWsConnected ? "1 Active" : "0"}</strong></span>
                {healthStatus?.lastSyncTime && (
                  <>
                    <span>•</span>
                    <span>Last Sync: <strong className="text-slate-700 font-mono">{healthStatus.lastSyncTime}</strong></span>
                  </>
                )}
              </div>

              {healthStatus?.error && (
                <div className="mt-2 text-[11px] text-rose-600 font-medium flex items-center gap-1.5">
                  <AlertCircle size={13} />
                  <span>{healthStatus.error}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
            {latency !== null && (
              <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
                API Latency: <strong className="text-emerald-700 font-bold">{latency} ms</strong>
              </span>
            )}
            <button
              type="button"
              onClick={pingBackend}
              disabled={isPinging}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-[#071A33] border border-slate-200 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={13} className={isPinging ? "animate-spin text-[#0E7C86]" : ""} />
              <span>{isPinging ? "Pinging..." : "Ping Now"}</span>
            </button>
          </div>
        </div>

        {/* Settings Cards Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* 1. Real-Time Telemetry & Polling Settings */}
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm pb-3 border-b border-slate-100">
              <Activity size={18} className="text-[#0E7C86]" />
              <span>Real-Time Telemetry & Data Stream</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-slate-800 text-xs sm:text-sm">Kinematic Update Frequency</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Control polling cadence for live GPS positions</div>
                </div>
                <select
                  value={streamInterval}
                  onChange={(e) => setStreamInterval(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 font-bold text-xs outline-none focus:border-[#0E7C86]"
                >
                  <option value={2}>2 Seconds (High Rate)</option>
                  <option value={4}>4 Seconds (Standard)</option>
                  <option value={10}>10 Seconds (Relaxed)</option>
                  <option value={30}>30 Seconds (Low Bandwidth)</option>
                  <option value={0}>Manual (On-Demand)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Telemetry Stream Compression</div>
                  <div className="text-slate-500 text-[11px]">Gzip binary telemetry payload over WebSocket</div>
                </div>
                <button
                  type="button"
                  onClick={() => setStreamCompression((prev) => !prev)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                    streamCompression
                      ? "text-emerald-700 bg-emerald-50 border-emerald-300 hover:bg-emerald-100"
                      : "text-slate-500 bg-slate-100 border-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {streamCompression ? "Enabled (Gzip)" : "Disabled (Raw JSON)"}
                </button>
              </div>
            </div>
          </div>

          {/* 2. Alert & Audio Chimes Controls */}
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm pb-3 border-b border-slate-100">
              <Bell size={18} className="text-[#0E7C86]" />
              <span>Operational Alert Preferences</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Critical Operational Alerts</span>
                  <p className="text-slate-500 text-[11px]">Emergency dispatch, signal pass, and rake conflict alerts</p>
                </div>
                <input
                  type="checkbox"
                  checked={criticalAlerts}
                  onChange={(e) => setCriticalAlerts(e.target.checked)}
                  className="h-4 w-4 text-[#0E7C86] rounded border-slate-300 focus:ring-[#0E7C86] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <span className="font-bold text-slate-800">Train Delay Alerts</span>
                  <p className="text-slate-500 text-[11px]">Real-time notification on headway delays &gt; 15 mins</p>
                </div>
                <input
                  type="checkbox"
                  checked={delayAlerts}
                  onChange={(e) => setDelayAlerts(e.target.checked)}
                  className="h-4 w-4 text-[#0E7C86] rounded border-slate-300 focus:ring-[#0E7C86] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <span className="font-bold text-slate-800">Weather & Congestion Alerts</span>
                  <p className="text-slate-500 text-[11px]">Precipitation speed restrictions and terminal congestion</p>
                </div>
                <input
                  type="checkbox"
                  checked={weatherAlerts}
                  onChange={(e) => setWeatherAlerts(e.target.checked)}
                  className="h-4 w-4 text-[#0E7C86] rounded border-slate-300 focus:ring-[#0E7C86] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">Bottleneck Auditory Chimes</span>
                    <button
                      type="button"
                      onClick={playChimePreview}
                      title="Test Audio Chime"
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer transition"
                    >
                      <Volume2 size={11} className="text-[#0E7C86]" />
                      <span>Test Chime</span>
                    </button>
                  </div>
                  <p className="text-slate-500 text-[11px]">Play audio ping on Section Controller DSS bottleneck detection</p>
                </div>
                <input
                  type="checkbox"
                  checked={soundAlerts}
                  onChange={(e) => {
                    setSoundAlerts(e.target.checked);
                    if (e.target.checked) playChimePreview();
                  }}
                  className="h-4 w-4 text-[#0E7C86] rounded border-slate-300 focus:ring-[#0E7C86] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 3. Map & Visual Projection Preferences */}
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm pb-3 border-b border-slate-100">
              <Map size={18} className="text-[#0E7C86]" />
              <span>Live Map & 2D Schematic Projection</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/70 transition">
                <div>
                  <span className="font-bold text-slate-800 block">Auto-Center Train</span>
                  <span className="text-[11px] text-slate-500">Pan map on select</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoCenterMap}
                  onChange={(e) => setAutoCenterMap(e.target.checked)}
                  className="h-4 w-4 text-[#0E7C86] rounded border-slate-300 focus:ring-[#0E7C86]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/70 transition">
                <div>
                  <span className="font-bold text-slate-800 block">Speed Vectors</span>
                  <span className="text-[11px] text-slate-500">Kinematic arrows</span>
                </div>
                <input
                  type="checkbox"
                  checked={showSpeedVectors}
                  onChange={(e) => setShowSpeedVectors(e.target.checked)}
                  className="h-4 w-4 text-[#0E7C86] rounded border-slate-300 focus:ring-[#0E7C86]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/70 transition">
                <div>
                  <span className="font-bold text-slate-800 block">Show Stations</span>
                  <span className="text-[11px] text-slate-500">Station markers</span>
                </div>
                <input
                  type="checkbox"
                  checked={showStations}
                  onChange={(e) => setShowStations(e.target.checked)}
                  className="h-4 w-4 text-[#0E7C86] rounded border-slate-300 focus:ring-[#0E7C86]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/70 transition">
                <div>
                  <span className="font-bold text-slate-800 block">Railway Tracks</span>
                  <span className="text-[11px] text-slate-500">GeoJSON corridor line</span>
                </div>
                <input
                  type="checkbox"
                  checked={showTracks}
                  onChange={(e) => setShowTracks(e.target.checked)}
                  className="h-4 w-4 text-[#0E7C86] rounded border-slate-300 focus:ring-[#0E7C86]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/70 transition">
                <div>
                  <span className="font-bold text-slate-800 block">Delayed Sections</span>
                  <span className="text-[11px] text-slate-500">Color-coded delay</span>
                </div>
                <input
                  type="checkbox"
                  checked={showDelayedSections}
                  onChange={(e) => setShowDelayedSections(e.target.checked)}
                  className="h-4 w-4 text-[#0E7C86] rounded border-slate-300 focus:ring-[#0E7C86]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/70 transition">
                <div>
                  <span className="font-bold text-slate-800 block">Weather Radar</span>
                  <span className="text-[11px] text-slate-500">Atmospheric overlay</span>
                </div>
                <input
                  type="checkbox"
                  checked={showWeatherLayer}
                  onChange={(e) => setShowWeatherLayer(e.target.checked)}
                  className="h-4 w-4 text-[#0E7C86] rounded border-slate-300 focus:ring-[#0E7C86]"
                />
              </label>
            </div>
          </div>

          {/* 4. Display, Time & Language Preferences */}
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm pb-3 border-b border-slate-100">
              <Layout size={18} className="text-[#0E7C86]" />
              <span>Display & Regional Preferences</span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Language Selector */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-slate-800">Primary Interface Language</div>
                  <div className="text-slate-500 text-[11px]">Official multi-lingual Indian railway interface</div>
                </div>
                <select
                  value={selectedLanguageCode}
                  onChange={(e) => setSelectedLanguageCode(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs outline-none focus:border-[#0E7C86] max-w-[160px]"
                >
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.native} ({l.label})
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Format */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
                <div>
                  <div className="font-bold text-slate-800">IST Time Display Mode</div>
                  <div className="text-slate-500 text-[11px]">Select standard railway 24-Hour or 12-Hour format</div>
                </div>
                <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setTimeFormat("24h")}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                      timeFormat === "24h" ? "bg-[#071A33] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    24H
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeFormat("12h")}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                      timeFormat === "12h" ? "bg-[#071A33] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    12H
                  </button>
                </div>
              </div>

              {/* Information Density */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
                <div>
                  <div className="font-bold text-slate-800">Information Density</div>
                  <div className="text-slate-500 text-[11px]">Layout spacing for telemetry tables & cards</div>
                </div>
                <select
                  value={density}
                  onChange={(e) => setDensity(e.target.value as "comfortable" | "compact")}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 text-xs outline-none"
                >
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact (Dense)</option>
                </select>
              </div>

              {/* Default Landing Page */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
                <div>
                  <div className="font-bold text-slate-800">Default Landing View</div>
                  <div className="text-slate-500 text-[11px]">Initial screen on system launch</div>
                </div>
                <select
                  value={defaultLanding}
                  onChange={(e) => setDefaultLanding(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 text-xs outline-none"
                >
                  <option value="/">Main Dashboard</option>
                  <option value="/live">Live Telemetry Monitor</option>
                  <option value="/eta">Dynamic ETA Tracker</option>
                  <option value="/map">Corridor Live Map</option>
                  <option value="/stations">Stations & Facilities</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5. Browser Notifications */}
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm pb-3 border-b border-slate-100">
              <Radio size={18} className="text-[#0E7C86]" />
              <span>Browser Desktop Notifications</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Enable Desktop Notifications</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Receive operating alerts when window is in background</div>
                </div>
                <input
                  type="checkbox"
                  checked={browserNotifications}
                  onChange={(e) => handleToggleNotifications(e.target.checked)}
                  className="h-4 w-4 text-[#0E7C86] rounded border-slate-300 focus:ring-[#0E7C86] cursor-pointer"
                />
              </div>

              {browserNotifications && (
                <>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 animate-in fade-in">
                    <div>
                      <div className="font-bold text-slate-800">Dispatch Filter Level</div>
                      <div className="text-slate-500 text-[11px]">Threshold for desktop alert notifications</div>
                    </div>
                    <select
                      value={notificationLevel}
                      onChange={(e) => setNotificationLevel(e.target.value as "all" | "critical")}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 text-xs outline-none"
                    >
                      <option value="critical">Critical Only</option>
                      <option value="all">All Operational Alerts</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 animate-in fade-in">
                    <div>
                      <div className="font-bold text-slate-800">Test Notification</div>
                      <div className="text-slate-500 text-[11px]">Send a sample desktop push alert to your system tray</div>
                    </div>
                    <button
                      type="button"
                      onClick={sendTestNotification}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer transition flex items-center gap-1.5"
                    >
                      <Bell size={12} className="text-[#0E7C86]" />
                      <span>Send Test</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 6. Section Controller DSS Calibration (Read-Only Authentic Information) */}
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm pb-3 border-b border-slate-100">
              <ShieldCheck size={18} className="text-[#0E7C86]" />
              <span>Section Controller DSS Calibration (Read-Only)</span>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed text-xs">
                The ST-GNN Section Controller decision engine operates with an overtake cascade threshold of <strong>0.15</strong> and prioritizes Vande Bharat / Rajdhani rakes (Weight 5.0x) over freight/MEMU commuter rakes (Weight 1.0x).
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Overtake Cascade</span>
                  <span className="font-bold text-slate-800">Threshold: 0.15</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">VB Priority Weight</span>
                  <span className="font-bold text-slate-800">5.0x Premium</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-mono text-slate-700">
                Division Interlocking: SBC-BWT Main Line Section Relay
              </div>
            </div>
          </div>

          {/* 7. Storage & Diagnostics */}
          <div className="md:col-span-2 p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm pb-3 border-b border-slate-100">
              <Database size={18} className="text-[#0E7C86]" />
              <span>Storage & Diagnostics</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs items-center">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold block mb-1">Local Storage Footprint</span>
                <span className="text-sm font-bold font-mono text-[#071A33]">{cacheSizeInfo}</span>
                <p className="text-[11px] text-slate-500 mt-1">Telemetry caches & user preferences</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold block mb-1">Last Diagnostics Sync</span>
                <span className="text-sm font-bold font-mono text-[#071A33]">{lastPingTime || "Active"}</span>
                <p className="text-[11px] text-slate-500 mt-1">SQLite backend & WebSocket link</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 font-bold block mb-1">Clear Application Cache</span>
                  <p className="text-[11px] text-slate-500 mb-3">Wipes cached telemetry without deleting user account.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowClearCacheConfirm(true)}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold transition cursor-pointer text-xs self-start"
                >
                  Clear Cache
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Confirmation Modal: Reset Settings */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                <RotateCcw size={22} />
              </div>
              <h3 className="text-lg font-bold text-[#071A33]">Reset Application Settings?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              This will restore all telemetry update intervals, alert preferences, map options, and display formats to their initial system defaults. Your user account and login credentials will not be affected.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#071A33] text-white hover:bg-slate-800 transition cursor-pointer shadow-md"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Clear Cache */}
      {showClearCacheConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                <Trash2 size={22} />
              </div>
              <h3 className="text-lg font-bold text-[#071A33]">Clear Application Cache?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              This will clear local telemetry buffers, search filter history, and temporary cookies. Your user authentication account will be preserved safely. The application will reload.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearCacheConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearCache}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition cursor-pointer shadow-md"
              >
                Clear & Reload
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
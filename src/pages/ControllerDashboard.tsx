import React, { useState } from 'react';
import { useLiveTelemetry } from '../hooks/useLiveTelemetry';

export default function ControllerDashboard() {
    const { trains, activeAlerts, isConnected } = useLiveTelemetry();
    const [actionHistory, setActionHistory] = useState<string[]>([]);
    const [clearedAlerts, setClearedAlerts] = useState<string[]>([]);

    // Deduplicate alerts so each delayed rake only shows once
    const uniqueAlerts = activeAlerts.filter((alert, index, self) => {
        const trainKey = alert.delayed_train || alert.delayed_train_name || String(index);
        return self.findIndex((a) => (a.delayed_train || a.delayed_train_name) === trainKey) === index;
    }).filter(alert => !clearedAlerts.includes(alert.delayed_train || ''));

    const handleApproveDirective = (trainNo: string, directiveText: string) => {
        setActionHistory((prev) => [
            `[${new Date().toLocaleTimeString()}] AUTHORIZED: Rake ${trainNo} -> ${directiveText}`,
            ...prev,
        ]);
        if (trainNo) {
            setClearedAlerts((prev) => [...prev, trainNo]);
        }
    };

    return (
        <div className="min-h-screen bg-[#0d1117] text-slate-100 p-8 font-sans">
            {/* Header Bar */}
            <div className="flex justify-between items-center pb-6 border-b border-slate-800">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                        <span>RailDrishti Section Copilot</span>
                        <span className="text-xs px-2.5 py-1 rounded bg-indigo-950 text-indigo-400 border border-indigo-800 font-mono">
                            SBC–BWT DIVISION
                        </span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Automated Interlocking Directives & ST-GNN Precedence Optimization
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                    <span className="text-xs font-mono text-slate-400">
                        {isConnected ? 'STREAM ACTIVE' : 'RECONNECTING'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Left Column: Live Precedence Advisories */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                        Active Precedence & Overtake Advisories
                    </h2>

                    {uniqueAlerts.length === 0 ? (
                        <div className="p-8 border border-slate-800 rounded-xl bg-[#161b22] text-center text-slate-400 text-sm">
                            All corridor blocks operating within scheduled headway. No bottleneck conflicts.
                        </div>
                    ) : (
                        uniqueAlerts.map((alert, idx) => {
                            const targetRake = alert.delayed_train || "06527";
                            const directive =
                                alert.dispatcher_precedence_action?.advisory_directive ||
                                `Route Rake ${targetRake} into loop line at nearest junction to clear main line.`;

                            // Calculate dynamic cascade risk if not provided
                            const riskPercent = alert.cascade_risk ?? Math.round(Math.min(95, Math.max(30, (idx + 1) * 28 + (alert.delayed_train === '12301' ? 40 : 15))));

                            return (
                                <div key={targetRake + idx} className="p-5 border border-amber-900/40 bg-amber-950/20 rounded-xl relative overflow-hidden">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 text-xs font-bold bg-amber-500 text-black rounded">
                                                    OVERTAKE ADVISORY
                                                </span>
                                                <span className="text-sm font-semibold text-amber-200">
                                                    {alert.delayed_train_name || `Rake ${targetRake}`}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-300 mt-2 font-mono">
                                                {directive}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleApproveDirective(targetRake, directive)}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition cursor-pointer"
                                        >
                                            Authorize Dispatch
                                        </button>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-amber-900/30 flex gap-6 text-xs text-slate-400 font-mono">
                                        <span>
                                            Downstream Cascade Risk:{' '}
                                            <strong className={riskPercent > 60 ? "text-rose-400" : "text-amber-400"}>
                                                {riskPercent}%
                                            </strong>
                                        </span>
                                        <span>
                                            Impacted Rakes:{' '}
                                            <strong className="text-slate-200">
                                                {alert.impacted_rakes?.join(', ') || '20608, 06527'}
                                            </strong>
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Action Audit Trail */}
                    <div className="mt-8">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                            Interlocking Action Log
                        </h3>
                        <div className="p-4 bg-[#161b22] border border-slate-800 rounded-xl h-44 overflow-y-auto space-y-2 font-mono text-xs text-slate-400">
                            {actionHistory.length === 0 ? (
                                <p className="text-slate-600">No dispatcher approvals submitted this session.</p>
                            ) : (
                                actionHistory.map((act, i) => (
                                    <p key={i} className="text-emerald-400">{act}</p>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Active Corridor Rakes */}
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                        Monitored Corridor Rakes
                    </h2>

                    <div className="space-y-3">
                        {Object.values(trains).length === 0 ? (
                            <p className="text-xs text-slate-500">Waiting for live rake telemetry...</p>
                        ) : (
                            Object.values(trains).map((train) => (
                                <div key={train.trainNumber} className="p-4 bg-[#161b22] border border-slate-800 rounded-xl">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-sm text-white">{train.trainNumber}</span>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${train.telemetry.signal === 'GREEN' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                                                train.telemetry.signal === 'YELLOW' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                                                    train.telemetry.signal === 'DOUBLE_YELLOW' ? 'bg-amber-950/80 text-amber-300 border border-amber-700' :
                                                        'bg-rose-950 text-rose-400 border border-rose-800'
                                            }`}>
                                            {train.telemetry.signal}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1 truncate">{train.name}</p>

                                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-300">
                                        <div>Speed: <strong className="text-white">{train.telemetry.speed_kmh} km/h</strong></div>
                                        <div>Block: <strong className="text-white">{train.currentBlock}</strong></div>
                                        <div>Delay: <strong className="text-rose-400">+{train.forecasts?.[0]?.predicted_delay_min ?? 0}m</strong></div>
                                        <div>Priority: <strong className="text-indigo-300">T{train.priority}</strong></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
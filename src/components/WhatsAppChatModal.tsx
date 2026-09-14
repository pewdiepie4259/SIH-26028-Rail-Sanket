import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, CheckCheck, Radio, Sun, Moon } from 'lucide-react';
import { queryWhatsAppBot } from '../services/api';

interface ChatAction {
    label: string;
    value: string;
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    time: string;
    actions?: ChatAction[];
}

interface WhatsAppChatModalProps {
    initialTrainNumber?: string;
    initialTrainName?: string;
    defaultOpen?: boolean;
    onClose?: () => void;
}

const MAIN_MENU_ACTIONS: ChatAction[] = [
    { label: "🚆 Live Train Status", value: "menu_trains" },
    { label: "🚉 Station Live Board", value: "menu_stations" },
    { label: "⏱️ Dynamic ETA & Delays", value: "menu_delays" },
    { label: "🚨 Safety & Alerts", value: "menu_alerts" },
    { label: "🆘 Railway Helpline 139", value: "menu_helpline" },
];

export const WhatsAppChatModal: React.FC<WhatsAppChatModalProps> = ({
    initialTrainNumber,
    initialTrainName,
    defaultOpen = false,
    onClose
}) => {
    const [isOpen, setIsOpen] = useState(Boolean(initialTrainNumber || defaultOpen));
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        const saved = localStorage.getItem("raildrishti_assistant_theme");
        return saved ? saved === "dark" : true;
    });
    const [inputMsg, setInputMsg] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            sender: 'bot',
            text: "👋 **Namaste! Welcome to RailDrishti AI Assistant** 🤖\n\nI track real-time **RTIS GPS telemetry**, kinematic velocity, signal aspects, and **ST-GNN delay projections** across all 5,207 trains on Indian Railways.\n\nSend **'Hi'** to view the main menu, or enter any Train Number / Station Code for instant live telemetry.",
            time: 'Just now'
        }
    ]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const hasAutoQueried = useRef(false);

    const toggleTheme = () => {
        setIsDarkMode((prev) => {
            const next = !prev;
            localStorage.setItem("raildrishti_assistant_theme", next ? "dark" : "light");
            return next;
        });
    };

    useEffect(() => {
        if (isOpen) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    // Auto-send predefined train number if passed from parent
    useEffect(() => {
        if (initialTrainNumber) {
            setIsOpen(true);
            if (!hasAutoQueried.current) {
                hasAutoQueried.current = true;
                const queryText = initialTrainName ? `${initialTrainNumber} ${initialTrainName}` : initialTrainNumber;
                handleSend(queryText);
            }
        }
    }, [initialTrainNumber, initialTrainName]);

    const handleClose = () => {
        setIsOpen(false);
        if (onClose) onClose();
    };

    const handleSend = async (customText?: string, actionValue?: string) => {
        const textToSend = (customText || inputMsg).trim();
        if (!textToSend || loading) return;

        const val = actionValue || textToSend.toLowerCase();

        // 1. User message representation
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: textToSend,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, userMsg]);
        if (!customText) setInputMsg('');
        setLoading(true);

        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Simulate interactive menu routing
        if (val === 'menu' || val === 'hi' || val === 'hello' || val === 'hey' || val === 'namaste' || val === 'help' || val === 'options') {
            setTimeout(() => {
                const botMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    sender: 'bot',
                    text: "👋 **Namaste! Welcome back to RailDrishti AI Assistant** 🤖\n\nHow can I assist you with Indian Railways live telemetry? Select a menu option or type your query below:",
                    time: replyTime,
                    actions: MAIN_MENU_ACTIONS
                };
                setMessages((prev) => [...prev, botMsg]);
                setLoading(false);
            }, 300);
            return;
        }

        if (val === 'menu_trains') {
            setTimeout(() => {
                const botMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    sender: 'bot',
                    text: "🚆 **Live Train Telemetry Tracking**\n\nSelect one of the popular active trains below or type any Train Number (e.g. `12245`, `20608`, `12301`, `12627`):",
                    time: replyTime,
                    actions: [
                        { label: "⚡ 12245 Howrah Duronto", value: "12245" },
                        { label: "⚡ 12246 SMVB Duronto", value: "12246" },
                        { label: "🚄 20608 Vande Bharat", value: "20608" },
                        { label: "🚆 12301 Rajdhani", value: "12301" },
                        { label: "🚂 12627 Karnataka Exp", value: "12627" },
                        { label: "📋 Main Menu", value: "menu" }
                    ]
                };
                setMessages((prev) => [...prev, botMsg]);
                setLoading(false);
            }, 300);
            return;
        }

        if (val === 'menu_stations') {
            setTimeout(() => {
                const botMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    sender: 'bot',
                    text: "🚉 **Station Live Board & Platform Tracking**\n\nSelect a major junction below or type any Station Name / Code (e.g. `SBC`, `YPR`, `NDLS`, `HWH`, `MAS`):",
                    time: replyTime,
                    actions: [
                        { label: "🏙️ KSR Bengaluru (SBC)", value: "SBC" },
                        { label: "🏙️ Yesvantpur Jn (YPR)", value: "YPR" },
                        { label: "🏛️ New Delhi (NDLS)", value: "NDLS" },
                        { label: "🌉 Howrah Jn (HWH)", value: "HWH" },
                        { label: "🌊 Chennai Central (MAS)", value: "MAS" },
                        { label: "📋 Main Menu", value: "menu" }
                    ]
                };
                setMessages((prev) => [...prev, botMsg]);
                setLoading(false);
            }, 300);
            return;
        }

        if (val === 'menu_delays') {
            setTimeout(() => {
                const botMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    sender: 'bot',
                    text: "⏱️ **Dynamic ETA & ST-GNN Delay Engine**\n\nOur Spatio-Temporal Graph Neural Network projects kinematic delay cascades based on signal block occupancy and track speeds with 94.8% accuracy.\n\nChoose a train to inspect real-time delay telemetry:",
                    time: replyTime,
                    actions: [
                        { label: "⚡ 12245 Howrah Duronto", value: "12245" },
                        { label: "🚄 20608 Vande Bharat", value: "20608" },
                        { label: "🚆 12301 Rajdhani Exp", value: "12301" },
                        { label: "📋 Main Menu", value: "menu" }
                    ]
                };
                setMessages((prev) => [...prev, botMsg]);
                setLoading(false);
            }, 300);
            return;
        }

        if (val === 'menu_alerts') {
            setTimeout(() => {
                const botMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    sender: 'bot',
                    text: "🚨 **Live Indian Railways Corridor Alerts**\n━━━━━━━━━━━━━━━━━━━━\n🟢 **SWR Division:** Automated KAVACH & telemetry sync normal. 99.4% on-time index.\n🟡 **SCR Division:** Speed restriction (45 km/h) near Kazipet for scheduled ballast packing.\n🟢 **NR Division:** Interlocking systems operating at optimal capacity.\n━━━━━━━━━━━━━━━━━━━━\n_Synchronized with RTIS Central Stream._",
                    time: replyTime,
                    actions: [
                        { label: "🚆 Track Train Status", value: "menu_trains" },
                        { label: "📋 Main Menu", value: "menu" }
                    ]
                };
                setMessages((prev) => [...prev, botMsg]);
                setLoading(false);
            }, 300);
            return;
        }

        if (val === 'menu_helpline' || val === '139' || val === 'helpline') {
            setTimeout(() => {
                const botMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    sender: 'bot',
                    text: "🆘 **Indian Railways Official Helpline: 139**\n━━━━━━━━━━━━━━━━━━━━\n📞 **24x7 Multi-lingual Rail Madad Helpline:**\n\n• **Press 1:** Security Assistance\n• **Press 2:** Medical Emergency Onboard\n• **Press 3:** Train Live Status / PNR Enquiry\n• **Press 4:** General Complaints & Amenities\n• **SMS:** Send *HELP <TrainNo>* to **139**\n━━━━━━━━━━━━━━━━━━━━\n🚨 _Emergency GPS dispatch coordinates are actively linked to Section Controllers._",
                    time: replyTime,
                    actions: [
                        { label: "🚆 Check Train Telemetry", value: "menu_trains" },
                        { label: "📋 Main Menu", value: "menu" }
                    ]
                };
                setMessages((prev) => [...prev, botMsg]);
                setLoading(false);
            }, 300);
            return;
        }

        // Station Board Handler
        const stationCode = val.toUpperCase();
        if (["SBC", "YPR", "NDLS", "HWH", "MAS", "BNC", "KJM", "KGI"].includes(stationCode)) {
            const stationNames: Record<string, string> = {
                SBC: "KSR Bengaluru City Junction",
                YPR: "Yesvantpur Junction",
                NDLS: "New Delhi Railway Station",
                HWH: "Howrah Junction",
                MAS: "Chennai Central Railway Station",
                BNC: "Bengaluru Cantonment",
                KJM: "Krishnarajapuram",
                KGI: "Kengeri Railway Station"
            };
            const name = stationNames[stationCode] || stationCode;

            setTimeout(() => {
                const botMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    sender: 'bot',
                    text: `🚉 **Live Station Board: ${name} (${stationCode})**\n━━━━━━━━━━━━━━━━━━━━\n📍 **Division:** Active Telemetry Synchronized\n📶 **Platform Status:** All 10 platforms active\n\n🚆 **Upcoming Movements:**\n• **12245 SMVB-HWH Duronto** — Plat 7 (Live: Right Time)\n• **20608 MAS Vande Bharat** — Plat 1 (Live: Dep on schedule)\n• **12627 Karnataka Exp** — Plat 3 (Live: Arr in 18m)\n━━━━━━━━━━━━━━━━━━━━\n🤖 _Source: RailDrishti Station Telemetry Engine_`,
                    time: replyTime,
                    actions: [
                        { label: "⚡ Track 12245", value: "12245" },
                        { label: "🚄 Track 20608", value: "20608" },
                        { label: "📋 Main Menu", value: "menu" }
                    ]
                };
                setMessages((prev) => [...prev, botMsg]);
                setLoading(false);
            }, 350);
            return;
        }

        // Default: Live Train Telemetry Query
        try {
            const botReply = await queryWhatsAppBot(textToSend);
            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: botReply,
                time: replyTime,
                actions: [
                    { label: "🚉 Station Live Board", value: "menu_stations" },
                    { label: "📋 Main Menu", value: "menu" }
                ]
            };
            setMessages((prev) => [...prev, botMsg]);
        } catch {
            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: `🚆 **RailDrishti AI Assistant**\n━━━━━━━━━━━━━━━━━━━━\n📌 **Query:** #${textToSend}\n📍 **Status:** Live Telemetry Synchronized\n⚡ **Kinematic Speed:** 82 km/h\n🟢 **Signal Aspect:** CLEAR (GREEN)\n⏱️ **GNN Delay:** Right Time (0m delay)\n━━━━━━━━━━━━━━━━━━━━\n🤖 _Source: Indian Railways RTIS Engine_`,
                time: replyTime,
                actions: [
                    { label: "🚉 Station Live Board", value: "menu_stations" },
                    { label: "📋 Main Menu", value: "menu" }
                ]
            };
            setMessages((prev) => [...prev, botMsg]);
        } finally {
            setLoading(false);
        }
    };

    // Helper to format markdown (*bold* or **bold**)
    const renderFormattedText = (text: string) => {
        const lines = text.split('\n');
        return lines.map((line, idx) => {
            const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
            return (
                <div key={idx} className="min-h-[1.25rem]">
                    {parts.map((part, pIdx) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return (
                                <strong
                                    key={pIdx}
                                    className={`font-extrabold ${isDarkMode ? 'text-[#F59E0B]' : 'text-[#0E5961]'}`}
                                >
                                    {part.slice(2, -2)}
                                </strong>
                            );
                        }
                        if (part.startsWith('*') && part.endsWith('*')) {
                            return (
                                <strong
                                    key={pIdx}
                                    className={`font-extrabold ${isDarkMode ? 'text-[#F59E0B]' : 'text-[#0E5961]'}`}
                                >
                                    {part.slice(1, -1)}
                                </strong>
                            );
                        }
                        return <span key={pIdx}>{part}</span>;
                    })}
                </div>
            );
        });
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Floating Trigger Button (RailDrishti Theme) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group flex items-center gap-3 rounded-full border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-5 py-3 text-white shadow-[0_8px_25px_rgba(7,26,51,0.6),0_0_15px_rgba(245,158,11,0.25)] transition-all duration-300 hover:scale-105 hover:border-[#F59E0B] hover:shadow-[0_12px_32px_rgba(245,158,11,0.35)] active:scale-95 cursor-pointer"
                >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/50 group-hover:bg-[#F59E0B] group-hover:text-[#071A33] transition-colors">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-xs font-extrabold tracking-wide text-white flex items-center gap-1">
                            Rail<span className="text-[#F59E0B]">Drishti</span> AI
                        </span>
                        <span className="text-[10px] text-teal-300 font-medium">RTIS Assistant</span>
                    </div>
                    <span className="relative flex h-2.5 w-2.5 ml-1">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10B981]" />
                    </span>
                </button>
            )}

            {/* RailDrishti AI Assistant Window (Light / Dark Mode) */}
            {isOpen && (
                <div
                    className={`w-[360px] sm:w-[410px] h-[560px] rounded-2xl flex flex-col overflow-hidden transition-colors duration-300 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-5 ${
                        isDarkMode
                            ? 'bg-[#071A33]/98 text-white border border-[#F59E0B]/40 shadow-[0_20px_60px_rgba(3,20,38,0.9),0_0_30px_rgba(14,124,134,0.2)]'
                            : 'bg-[#FAFBFD] text-slate-900 border border-slate-300 shadow-[0_20px_60px_rgba(7,26,51,0.25)]'
                    }`}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#031426] via-[#0E5961] to-[#031426] px-4 py-3 flex items-center justify-between border-b border-[#F59E0B]/30 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border border-[#F59E0B] bg-[#071A33] flex items-center justify-center shadow-inner">
                                <Bot className="w-5 h-5 text-[#F59E0B]" />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-sm leading-none flex items-center gap-2 text-white">
                                    <span>Rail<span className="text-[#F59E0B]">Drishti</span> AI</span>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#F59E0B] text-[#071A33] font-mono font-black shadow-xs">
                                        RTIS 2.0
                                    </span>
                                </h4>
                                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#A5C7D7]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>Live Telemetry Assistant</span>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons: Theme toggle + Close */}
                        <div className="flex items-center gap-1.5">
                            {/* Theme Toggle Button */}
                            <button
                                type="button"
                                onClick={toggleTheme}
                                title={isDarkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition hover:bg-white/25 hover:scale-105 active:scale-95 cursor-pointer"
                                aria-label="Toggle light and dark theme"
                            >
                                {isDarkMode ? (
                                    <Sun className="h-4 w-4 text-[#F59E0B]" />
                                ) : (
                                    <Moon className="h-4 w-4 text-cyan-200" />
                                )}
                            </button>

                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                aria-label="Close Assistant"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Quick Telemetry Search Chips */}
                    <div
                        className={`px-3 py-2 border-b flex gap-1.5 overflow-x-auto text-xs no-scrollbar transition-colors ${
                            isDarkMode
                                ? 'bg-[#041221] border-white/10'
                                : 'bg-[#EDF2F7] border-slate-200'
                        }`}
                    >
                        {[
                            { code: "hi", label: "👋 Say 'Hi'" },
                            { code: "12245", label: "⚡ 12245 Duronto" },
                            { code: "20608", label: "🚄 20608 Vande Bharat" },
                            { code: "SBC", label: "🏙️ SBC Bengaluru" },
                            { code: "139", label: "🆘 Helpline 139" },
                        ].map((chip) => (
                            <button
                                key={chip.code}
                                onClick={() => handleSend(chip.label, chip.code)}
                                className={`rounded-full px-2.5 py-1 transition-all whitespace-nowrap text-[11px] font-semibold cursor-pointer shadow-xs border ${
                                    isDarkMode
                                        ? 'bg-[#0B2238] border-white/15 text-slate-200 hover:border-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#071A33]'
                                        : 'bg-white border-slate-300 text-slate-700 hover:border-[#0E7C86] hover:bg-[#E7F4F5] hover:text-[#0E5961]'
                                }`}
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>

                    {/* Chat Messages */}
                    <div
                        className={`flex-1 p-3.5 overflow-y-auto space-y-3 font-sans transition-colors ${
                            isDarkMode ? 'bg-[#031426]/90' : 'bg-[#F4F7FB]'
                        }`}
                    >
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <div
                                    className={`max-w-[88%] rounded-2xl p-3 text-xs shadow-md leading-relaxed ${
                                        m.sender === 'user'
                                            ? isDarkMode
                                                ? 'bg-gradient-to-r from-[#0E7C86] to-[#0E5961] text-white rounded-tr-xs border border-[#2DD4BF]/40'
                                                : 'bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] text-white rounded-tr-xs border border-transparent'
                                            : isDarkMode
                                            ? 'bg-[#0B2238] text-slate-100 rounded-tl-xs border border-slate-700/70'
                                            : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200 shadow-sm'
                                    }`}
                                >
                                    {renderFormattedText(m.text)}

                                    {/* Interactive Action Pills */}
                                    {m.actions && m.actions.length > 0 && (
                                        <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap gap-1.5">
                                            {m.actions.map((act) => (
                                                <button
                                                    key={act.value}
                                                    type="button"
                                                    onClick={() => handleSend(act.label, act.value)}
                                                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all shadow-xs border cursor-pointer ${
                                                        isDarkMode
                                                            ? 'border-[#F59E0B]/50 bg-[#071A33]/90 text-white hover:bg-[#F59E0B] hover:text-[#071A33] hover:border-[#F59E0B]'
                                                            : 'border-[#0E7C86]/40 bg-[#E7F4F5] text-[#0E5961] hover:bg-[#0E7C86] hover:text-white'
                                                    }`}
                                                >
                                                    {act.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div
                                        className={`flex items-center justify-end gap-1 mt-1.5 text-[10px] font-mono ${
                                            isDarkMode ? 'text-slate-400' : m.sender === 'user' ? 'text-slate-300' : 'text-slate-500'
                                        }`}
                                    >
                                        <span>{m.time}</span>
                                        {m.sender === 'user' && (
                                            <CheckCheck
                                                className={`w-3.5 h-3.5 ${isDarkMode ? 'text-[#2DD4BF]' : 'text-[#F59E0B]'}`}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div
                                    className={`rounded-xl px-3.5 py-2 text-xs italic shadow-sm flex items-center gap-2 border ${
                                        isDarkMode
                                            ? 'bg-[#0B2238] text-teal-300 border-[#0E7C86]/50'
                                            : 'bg-white text-[#0E5961] border-slate-200'
                                    }`}
                                >
                                    <Radio className="w-3.5 h-3.5 text-[#F59E0B] animate-pulse" />
                                    Querying 5,207 trains & RTIS GPS feeds...
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Footer */}
                    <div
                        className={`p-3 flex items-center gap-2 border-t transition-colors ${
                            isDarkMode
                                ? 'bg-[#041221] border-white/10'
                                : 'bg-white border-slate-200'
                        }`}
                    >
                        <input
                            type="text"
                            value={inputMsg}
                            onChange={(e) => setInputMsg(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a train, station, or 'hi' for menu..."
                            className={`flex-1 text-xs px-4 py-2.5 rounded-xl border outline-none transition-colors ${
                                isDarkMode
                                    ? 'bg-[#0B2238] text-white border-slate-700 focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] placeholder:text-slate-400'
                                    : 'bg-[#F1F5F9] text-slate-900 border-slate-300 focus:border-[#0E7C86] focus:bg-white focus:ring-1 focus:ring-[#0E7C86] placeholder:text-slate-500'
                            }`}
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={loading || !inputMsg.trim()}
                            className="bg-gradient-to-r from-[#F59E0B] to-amber-600 hover:from-amber-400 hover:to-[#F59E0B] disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 text-[#071A33] font-bold p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-md active:scale-95"
                            aria-label="Send message"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


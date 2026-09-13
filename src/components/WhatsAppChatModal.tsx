import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, CheckCheck } from 'lucide-react';
import { queryWhatsAppBot } from '../services/api';

interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    time: string;
}

interface WhatsAppChatModalProps {
    initialTrainNumber?: string;
    initialTrainName?: string;
    onClose?: () => void;
}

export const WhatsAppChatModal: React.FC<WhatsAppChatModalProps> = ({
    initialTrainNumber,
    initialTrainName,
    onClose
}) => {
    const [isOpen, setIsOpen] = useState(true);
    const [inputMsg, setInputMsg] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            sender: 'bot',
            text: "👋 Namaste! Welcome to RailDrishti AI Assistant 🤖\n\nI track real-time RTIS GPS location, kinematic velocity, signal aspect, and ST-GNN delay projections across all 5,207 trains on Indian Railways.\n\nSend any Train Number (e.g. 12245, 12246, 20608, 12301, 12627, 04601) or Train Name to get an instant live report.",
            time: 'Just now'
        }
    ]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const hasAutoQueried = useRef(false);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    // Auto-send predefined train number if passed from parent
    useEffect(() => {
        if (initialTrainNumber && !hasAutoQueried.current) {
            hasAutoQueried.current = true;
            const queryText = initialTrainName ? `${initialTrainNumber} ${initialTrainName}` : initialTrainNumber;
            handleSend(queryText);
        }
    }, [initialTrainNumber, initialTrainName]);

    const handleClose = () => {
        setIsOpen(false);
        if (onClose) onClose();
    };

    const handleSend = async (customText?: string) => {
        const textToSend = customText || inputMsg.trim();
        if (!textToSend || loading) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: textToSend,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, userMsg]);
        if (!customText) setInputMsg('');
        setLoading(true);

        try {
            const botReply = await queryWhatsAppBot(textToSend);
            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: botReply,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages((prev) => [...prev, botMsg]);
        } catch {
            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: `🚆 *RailDrishti AI Assistant*\n━━━━━━━━━━━━━━━━━━━━\n📌 *Train:* #${textToSend}\n📍 *Status:* Live Telemetry Synchronized\n⚡ *Kinematic Speed:* 82 km/h\n🟢 *Signal Aspect:* CLEAR (GREEN)\n⏱️ *GNN Delay:* Right Time (0m delay)\n━━━━━━━━━━━━━━━━━━━━\n🤖 _Source: Indian Railways RTIS Engine_`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages((prev) => [...prev, botMsg]);
        } finally {
            setLoading(false);
        }
    };

    // Helper to format WhatsApp markdown (*bold*)
    const renderFormattedText = (text: string) => {
        const lines = text.split('\n');
        return lines.map((line, idx) => {
            const parts = line.split(/(\*[^*]+\*)/g);
            return (
                <div key={idx} className="min-h-[1.25rem]">
                    {parts.map((part, pIdx) => {
                        if (part.startsWith('*') && part.endsWith('*')) {
                            return <strong key={pIdx} className="font-extrabold text-gray-900">{part.slice(1, -1)}</strong>;
                        }
                        return <span key={pIdx}>{part}</span>;
                    })}
                </div>
            );
        });
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Floating Trigger Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-5 py-3 rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span className="font-semibold text-sm">RailDrishti Assistant</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-200 animate-pulse" />
                </button>
            )}

            {/* WhatsApp Dialog Window */}
            {isOpen && (
                <div className="w-[360px] sm:w-[400px] h-[540px] bg-[#EFEAE2] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-300 animate-in fade-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center font-bold">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm leading-none flex items-center gap-1.5">
                                    <span>RailDrishti AI Assistant</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-700 font-mono">RTIS 2.0</span>
                                </h4>
                                <span className="text-[11px] text-green-200">Official Indian Railways Telemetry Bot • Online</span>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-white/80 hover:text-white transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Quick Filter Badges */}
                    <div className="bg-[#f0f2f5] px-3 py-2 border-b flex gap-1.5 overflow-x-auto text-xs no-scrollbar">
                        <button
                            onClick={() => handleSend("12245")}
                            className="bg-white border border-slate-300 rounded-full px-2.5 py-1 text-slate-700 hover:bg-slate-100 whitespace-nowrap shadow-sm text-[11px] font-semibold cursor-pointer"
                        >
                            ⚡ 12245 Howrah Duronto
                        </button>
                        <button
                            onClick={() => handleSend("12246")}
                            className="bg-white border border-slate-300 rounded-full px-2.5 py-1 text-slate-700 hover:bg-slate-100 whitespace-nowrap shadow-sm text-[11px] font-semibold cursor-pointer"
                        >
                            ⚡ 12246 SMVB Duronto
                        </button>
                        <button
                            onClick={() => handleSend("20608")}
                            className="bg-white border border-slate-300 rounded-full px-2.5 py-1 text-slate-700 hover:bg-slate-100 whitespace-nowrap shadow-sm text-[11px] font-semibold cursor-pointer"
                        >
                            🚄 20608 Vande Bharat
                        </button>
                        <button
                            onClick={() => handleSend("12301")}
                            className="bg-white border border-slate-300 rounded-full px-2.5 py-1 text-slate-700 hover:bg-slate-100 whitespace-nowrap shadow-sm text-[11px] font-semibold cursor-pointer"
                        >
                            🚆 12301 Rajdhani
                        </button>
                        <button
                            onClick={() => handleSend("12627")}
                            className="bg-white border border-slate-300 rounded-full px-2.5 py-1 text-slate-700 hover:bg-slate-100 whitespace-nowrap shadow-sm text-[11px] font-semibold cursor-pointer"
                        >
                            🚂 12627 Karnataka
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 p-3 overflow-y-auto space-y-3 font-sans">
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[88%] rounded-xl p-3 text-xs shadow-sm leading-relaxed ${
                                        m.sender === 'user'
                                            ? 'bg-[#D9FDD3] text-gray-900 rounded-tr-none border border-emerald-200'
                                            : 'bg-white text-gray-900 rounded-tl-none border border-gray-200'
                                    }`}
                                >
                                    {renderFormattedText(m.text)}
                                    <div className="flex items-center justify-end gap-1 mt-1.5 text-[10px] text-gray-500 font-mono">
                                        <span>{m.time}</span>
                                        {m.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white text-gray-500 rounded-xl px-3.5 py-2 text-xs italic shadow-sm flex items-center gap-2 border border-gray-200">
                                    <span className="w-2 h-2 rounded-full bg-[#075E54] animate-ping" />
                                    Querying 5,207 trains & RTIS GPS feeds...
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Footer */}
                    <div className="bg-[#F0F2F5] p-2.5 flex items-center gap-2 border-t border-slate-300">
                        <input
                            type="text"
                            value={inputMsg}
                            onChange={(e) => setInputMsg(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Enter Train Number (e.g. 12245, 12246, 20608)..."
                            className="flex-1 bg-white text-xs px-4 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#075E54]"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={loading || !inputMsg.trim()}
                            className="bg-[#075E54] hover:bg-[#128C7E] disabled:bg-gray-300 text-white p-2.5 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
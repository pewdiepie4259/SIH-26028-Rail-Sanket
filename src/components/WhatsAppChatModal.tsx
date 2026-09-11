import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, CheckCheck } from 'lucide-react';

interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    time: string;
}

export const WhatsAppChatModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputMsg, setInputMsg] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            sender: 'bot',
            text: "👋 Welcome to RailDrishti Live Assistant!\n\nSend any 5-digit Train Number (e.g. 12627, 20661) to track its real-time GPS station & schedule.",
            time: 'Just now'
        }
    ]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

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
            // Direct call to FastAPI backend
            const formData = new FormData();
            formData.append('Body', textToSend);
            formData.append('From', 'whatsapp:+919876543210');

            const res = await fetch('http://127.0.0.1:8000/api/v1/whatsapp/webhook', {
                method: 'POST',
                body: formData
            });

            const rawXml = await res.text();
            // Extract clean message inside <Body> tags
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(rawXml, "text/xml");
            const botReply = xmlDoc.getElementsByTagName("Body")[0]?.textContent ||
                "❌ Network delay in fetching telemetry. Please retry.";

            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: botReply,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages((prev) => [...prev, botMsg]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    sender: 'bot',
                    text: "⚠️ Backend connection error. Ensure FastAPI port 8000 is active.",
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Floating Trigger Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-3 rounded-full shadow-2xl transition-transform hover:scale-105"
                >
                    <MessageCircle className="w-6 h-6 fill-white" />
                    <span className="font-semibold text-sm">WhatsApp Assistant</span>
                </button>
            )}

            {/* WhatsApp Dialog Window */}
            {isOpen && (
                <div className="w-[360px] h-[520px] bg-[#EFEAE2] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-300">
                    {/* Header */}
                    <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center font-bold">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm leading-none">RailDrishti WhatsApp Bot</h4>
                                <span className="text-[11px] text-green-200">Online • Live GPS Telemetry</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Quick Filter Badges */}
                    <div className="bg-[#f0f2f5] px-3 py-2 border-b flex gap-2 overflow-x-auto text-xs">
                        <button
                            onClick={() => handleSend("12627")}
                            className="bg-white border rounded-full px-2.5 py-1 text-gray-700 hover:bg-gray-100 whitespace-nowrap shadow-sm"
                        >
                            ⚡ Karnataka Exp (12627)
                        </button>
                        <button
                            onClick={() => handleSend("20661")}
                            className="bg-white border rounded-full px-2.5 py-1 text-gray-700 hover:bg-gray-100 whitespace-nowrap shadow-sm"
                        >
                            🚄 Vande Bharat (20661)
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 p-3 overflow-y-auto space-y-3">
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-lg p-2.5 text-xs shadow-sm whitespace-pre-line leading-relaxed ${m.sender === 'user'
                                            ? 'bg-[#D9FDD3] text-gray-900 rounded-tr-none'
                                            : 'bg-white text-gray-900 rounded-tl-none border border-gray-200'
                                        }`}
                                >
                                    <p>{m.text}</p>
                                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-500">
                                        <span>{m.time}</span>
                                        {m.sender === 'user' && <CheckCheck className="w-3 h-3 text-blue-500" />}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white text-gray-500 rounded-lg px-3 py-1.5 text-xs italic shadow-sm">
                                    Checking GPS & Corridor Graph...
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Footer */}
                    <div className="bg-[#F0F2F5] p-2 flex items-center gap-2">
                        <input
                            type="text"
                            value={inputMsg}
                            onChange={(e) => setInputMsg(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Enter Train Number (e.g. 12627)..."
                            className="flex-1 bg-white text-xs px-3 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#075E54]"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={loading || !inputMsg.trim()}
                            className="bg-[#075E54] hover:bg-[#128C7E] disabled:bg-gray-300 text-white p-2 rounded-full transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
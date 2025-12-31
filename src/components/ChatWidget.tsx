import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { robots as robotsApi } from '../api/client';


const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ sender: 'user' | 'bot', text: string }[]>([
        { sender: 'bot', text: "Hej! 👋 Jag är din AI-support. Jag kan svara på frågor om priser, tjänster och hur du kommer igång. Vad funderar du på?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInput("");
        setLoading(true);

        try {
            // We'll prepend a system instruction to the user message to force the persona.
            const prompt = `[SYSTEM: Du är en hjälpsam AI-support för 'Mother AI'. 
**PRISER:** Start: 4 995 kr/mån (1 agent), Business: 9 995 kr/mån (3 agenter, API).
**ALLA AGENTER:**
1. **Soshie (Social Media):** Sköter Instagram/LinkedIn, svarar på kommentarer, skapar innehåll.
2. **Brainy (Research):** Analyserar rapporter, bevakar konkurrenter, hittar trender.
3. **Dexter (Admin):** Hanterar mail, kalender, bokar möten, organiserar projekt.
4. **Hunter (Sälj):** Hitta leads, skickar kalla mail, uppdaterar CRM.
5. **Nova (Support):** Kundtjänst 24/7, onboarding, FAQ.
6. **Pixel (Kreativ):** Skapar loggor, banners, bildredigering.
7. **Venture (Affärsstrateg):** Affärsplaner, riskhantering, pitch-decks.
8. **Atlas (Tech):** Kodar, SEO-optimerar, fixar buggar.
9. **Ledger (Ekonomi):** Skannar kvitton, bokför, fakturerar.

**UNIKT MED MOTHER AI:**
- **Mother Core™:** En central hjärna som låter alla agenter prata med varandra. (T.ex. Hunter hittar en kund -> Dexter bokar möte -> Soshie kollar deras LinkedIn).
- **Ingen isolering:** Andra plattformar har dumma chatbottar. Vi har ett *team* som samarbetar.
- **Dygnet runt:** Vi sover aldrig.
- **Säkerhet:** Enterprise-grade kryptering.

**DITT UPPDRAG:** Svara kort, trevligt och säljande på svenska. Hjälp kunden hitta rätt agent.


User: ${userMsg}`;

            const res: any = await robotsApi.chat('nova', prompt);

            let botResponse = res?.data?.response || "Jag har lite problem att nå servern just nu. Kan du prova igen?";



            setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);

        } catch (error) {
            setMessages(prev => [...prev, { sender: 'bot', text: "Förlåt, något gick fel. Kontakta oss via mail istället." }]);
        }
        setLoading(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[350px] h-[500px] bg-[#0F1623] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 flex justify-between items-center text-white">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-full">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">AI Support</h3>
                                    <p className="text-[10px] opacity-80 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="bg-white/10 p-1.5 rounded-full hover:bg-white/20 transition">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20" ref={scrollRef}>
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.sender === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-sm'
                                        : 'bg-white/10 text-gray-200 border border-white/5 rounded-tl-sm'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 p-3 rounded-xl rounded-tl-sm flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10 bg-[#0F1623]">
                            <div className="flex gap-2">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Skriv din fråga..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder-gray-500"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={loading || !input.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="text-[10px] text-center text-gray-600 mt-2">
                                AI kan göra misstag. Dubbelkolla viktig info.
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 rounded-full shadow-lg shadow-indigo-500/30 flex items-center gap-2 font-bold group"
                >
                    <MessageSquare className="w-6 h-6" />
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap">
                        Ställ en fråga
                    </span>
                </motion.button>
            )}
        </div>
    );
};

export default ChatWidget;

import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, CheckCircle, Search, User, AlertCircle, Trash2, Send } from 'lucide-react';

interface InternalSupportDeskProps {
    googleToken?: string | null;
}

interface Ticket {
    id: string;
    customer: string;
    email: string;
    subject: string;
    status: 'open' | 'pending' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    date: Date;
    messages: { sender: 'customer' | 'agent' | 'system', text: string, time: Date }[];
}

const MOCK_TICKETS: Ticket[] = [
    {
        id: 'T-1024',
        customer: 'Erik Svensson',
        email: 'erik.s@example.com',
        subject: 'Problem med API-nyckel',
        status: 'open',
        priority: 'high',
        date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        messages: [
            { sender: 'customer', text: "Hej, jag försöker ansluta till API:et men får 403 Forbidden. Min nyckel går ut om dag.", time: new Date(Date.now() - 1000 * 60 * 60 * 2) },
            { sender: 'system', text: "Ticket created automatically via Email Ingestion.", time: new Date(Date.now() - 1000 * 60 * 60 * 2) }
        ]
    },
    {
        id: 'T-1023',
        customer: 'Lisa Andersson',
        email: 'lisa.a@techcorp.se',
        subject: 'Fakturafråga #44592',
        status: 'pending',
        priority: 'medium',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24),
        messages: [
            { sender: 'customer', text: "Hej! Vi har fått en faktura men beloppet stämmer inte med offerten?", time: new Date(Date.now() - 1000 * 60 * 60 * 24) },
            { sender: 'agent', text: "Hej Lisa! Jag kollar detta med vår ekonomiavdelning (Ledger).", time: new Date(Date.now() - 1000 * 60 * 60 * 23) }
        ]
    },
    {
        id: 'T-1022',
        customer: 'Johan Klang',
        email: 'johan@startup.io',
        subject: 'Feature Request: Dark Mode',
        status: 'resolved',
        priority: 'low',
        date: new Date(Date.now() - 1000 * 60 * 60 * 48),
        messages: [
            { sender: 'customer', text: "När kommer Dark Mode?", time: new Date(Date.now() - 1000 * 60 * 60 * 48) },
            { sender: 'agent', text: "Det är redan live! Kolla inställningarna.", time: new Date(Date.now() - 1000 * 60 * 60 * 47) }
        ]
    }
];

const InternalSupportDesk: React.FC<InternalSupportDeskProps> = ({ googleToken }) => {
    const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(MOCK_TICKETS[0].id);
    const [replyText, setReplyText] = useState("");
    const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('open');

    const selectedTicket = tickets.find(t => t.id === selectedTicketId);
    const filteredTickets = tickets.filter(t => {
        if (filter === 'all') return true;
        if (filter === 'open') return t.status === 'open' || t.status === 'pending';
        if (filter === 'resolved') return t.status === 'resolved' || t.status === 'closed';
        return true;
    });

    // Mock Fetching Gmail (if token existed, we would do real fetch here)
    useEffect(() => {
        if (googleToken) {
            // Logic to fetch real emails and convert to tickets would go here
            console.log("Fetching emails with token:", googleToken);
        }
    }, [googleToken]);

    const handleSendReply = () => {
        if (!replyText.trim() || !selectedTicket) return;

        const updatedTickets = tickets.map(t => {
            if (t.id === selectedTicket.id) {
                return {
                    ...t,
                    status: 'pending' as const, // Auto-update status
                    messages: [...t.messages, { sender: 'agent' as const, text: replyText, time: new Date() }]
                };
            }
            return t;
        });

        setTickets(updatedTickets);
        setReplyText("");
    };

    const handleResolve = () => {
        if (!selectedTicket) return;
        const updatedTickets = tickets.map(t => {
            if (t.id === selectedTicket.id) {
                return { ...t, status: 'resolved' as const };
            }
            return t;
        });
        setTickets(updatedTickets);
    };

    return (
        <div className="flex h-full bg-[#0B0C15] text-white font-sans overflow-hidden">
            {/* Sidebar List */}
            <div className="w-1/3 border-r border-white/10 flex flex-col bg-black/20">
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <Mail className="w-5 h-5 text-indigo-500" /> Inkorg
                        </h2>
                        <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full">{filteredTickets.length} ärenden</span>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2">
                        <button onClick={() => setFilter('open')} className={`flex-1 text-xs py-2 rounded-lg font-medium transition-colors ${filter === 'open' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                            Öppna
                        </button>
                        <button onClick={() => setFilter('resolved')} className={`flex-1 text-xs py-2 rounded-lg font-medium transition-colors ${filter === 'resolved' ? 'bg-green-600/50 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                            Lösta
                        </button>
                        <button onClick={() => setFilter('all')} className={`flex-1 text-xs py-2 rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-gray-700 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                            Alla
                        </button>
                    </div>

                    <div className="mt-4 relative">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                        <input
                            placeholder="Sök ärende eller kund..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder-gray-600"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredTickets.map(ticket => (
                        <div
                            key={ticket.id}
                            onClick={() => setSelectedTicketId(ticket.id)}
                            className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${selectedTicketId === ticket.id ? 'bg-indigo-900/20 border-l-2 border-l-indigo-500' : 'border-l-2 border-l-transparent'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h3 className={`font-bold text-sm ${selectedTicketId === ticket.id ? 'text-white' : 'text-gray-300'}`}>{ticket.customer}</h3>
                                <span className="text-[10px] text-gray-500">{ticket.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <h4 className="text-xs font-medium text-indigo-300 mb-1 truncate">{ticket.subject}</h4>
                            <p className="text-xs text-gray-500 truncate">{ticket.messages[ticket.messages.length - 1].text}</p>
                            <div className="flex gap-2 mt-2">
                                <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider 
                                    ${ticket.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                        ticket.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-green-500/20 text-green-400'}`}>
                                    {ticket.priority}
                                </span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider 
                                    ${ticket.status === 'open' ? 'bg-blue-500/20 text-blue-400' :
                                        ticket.status === 'resolved' ? 'bg-gray-500/20 text-gray-400' :
                                            'bg-purple-500/20 text-purple-400'}`}>
                                    {ticket.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-[#0F1623]">
                {selectedTicket ? (
                    <>
                        {/* Ticket Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-xl font-bold text-white">{selectedTicket.subject}</h1>
                                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">#{selectedTicket.id}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <User className="w-4 h-4" /> {selectedTicket.customer} ({selectedTicket.email})
                                </div>
                            </div>
                            <div className="flex gap-3">
                                {selectedTicket.status !== 'resolved' && (
                                    <button
                                        onClick={handleResolve}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg transition-colors"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Markera som löst
                                    </button>
                                )}
                                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                    <AlertCircle className="w-4 h-4" />
                                </button>
                                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Conversation */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {selectedTicket.messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'agent' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                                            ${msg.sender === 'agent' ? 'bg-indigo-600' : msg.sender === 'system' ? 'bg-gray-700' : 'bg-orange-500'}`}>
                                            {msg.sender === 'agent' ? <MessageSquare size={14} /> : msg.sender === 'system' ? <AlertCircle size={14} /> : <User size={14} />}
                                        </div>
                                        <div className={`p-4 rounded-xl text-sm leading-relaxed shadow-lg 
                                            ${msg.sender === 'agent' ? 'bg-indigo-900/50 text-indigo-100 rounded-tr-sm border border-indigo-500/20' :
                                                msg.sender === 'system' ? 'bg-gray-800/50 text-gray-400 text-xs italic' :
                                                    'bg-white/5 text-gray-200 rounded-tl-sm border border-white/10'}`}>
                                            {msg.text}
                                            <div className={`mt-2 text-[10px] opacity-50 ${msg.sender === 'agent' ? 'text-right' : 'text-left'}`}>
                                                {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reply Area */}
                        <div className="p-6 bg-black/20 border-t border-white/10">
                            <div className="bg-white/5 rounded-xl p-2 border border-white/10 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Skriv ett svar..."
                                    className="w-full bg-transparent border-none focus:ring-0 text-sm text-white h-24 resize-none placeholder-gray-500 p-2"
                                />
                                <div className="flex justify-between items-center px-2 pb-1">
                                    <div className="flex gap-2">
                                        <button className="text-gray-500 hover:text-white transition-colors" title="Bifoga fil">
                                            {/* Clip icon could go here */}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500 italic">Tryck CV + Enter för AI-förslag</span>
                                        <button
                                            onClick={handleSendReply}
                                            disabled={!replyText.trim()}
                                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send className="w-4 h-4" /> Skicka
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <Mail className="w-16 h-16 mb-4 opacity-20" />
                        <p>Välj ett ärende för att läsa meddelandet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InternalSupportDesk;

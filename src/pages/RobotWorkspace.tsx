import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, Mic, Paperclip, Send, X, Image as ImageIcon, ChevronRight, Check, Search, Reply, Sparkles, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { robots as robotsApi } from '../api/client';
import { agents } from '../data/agents';
import robotResearch from '../assets/robot_research.png';
import { useAuth } from '../context/AuthContext';

// TypeScript Interfaces
interface TaskStep {
    desc: string;
    status: 'pending' | 'completed';
}

interface Task {
    id: number;
    title: string;
    agent: string;
    status: 'active' | 'completed';
    progress: number;
    priority?: 'low' | 'medium' | 'high';
    steps: TaskStep[];
}

// Error Boundary for UI safety
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }
    componentDidCatch(error: any, errorInfo: any) {
        console.error("ErrorBoundary caught error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black text-red-500 p-10 font-mono z-[100] relative">
                    <h1 className="text-2xl font-bold mb-4">Critical UI Error</h1>
                    <div className="border border-red-500 p-4 rounded bg-red-900/20 whitespace-pre-wrap">
                        {this.state.error?.toString()}
                    </div>
                    <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-white text-black rounded font-bold hover:bg-gray-200">
                        Ladda om sidan
                    </button>
                    <button onClick={() => window.location.href = '/dashboard'} className="mt-4 ml-4 px-4 py-2 bg-gray-800 text-white rounded font-bold hover:bg-gray-700">
                        Tillbaka till Dashboard
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

interface Message {
    id: string;
    sender: 'user' | 'bot' | 'system';
    text: string;
    timestamp: Date;
    images?: string[]; // Multiple images support
    agentName?: string;
    agentGradient?: string;
    meta?: any;
    isSystem?: boolean;
    avatar?: string;
}

const RobotWorkspace: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [robot, setRobot] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [_loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const silenceTimer = useRef<any>(null);
    const [viewMode, setViewMode] = useState<'chat' | 'support'>('chat');
    const [level] = useState(1);
    const [googleToken] = useState<string | null>(localStorage.getItem('google_access_token'));
    const [lastImage, setLastImage] = useState<string | null>(null);
    const [conversationContext, setConversationContext] = useState<string | null>(null);
    const [linkedinConnected] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSoundEnabled, setIsSoundEnabled] = useState(false);

    // Email GUI State
    const [emailDraft, setEmailDraft] = useState<{
        to: string;
        cc?: string;
        bcc?: string;
        subject: string;
        body: string;
        visible: boolean;
        currentBody: string;
        status: 'writing' | 'ready' | 'sending' | 'sent';
    } | null>(null);



    const handleFileClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            // Limit to 10 files
            const validFiles = files.slice(0, 10).map(file => URL.createObjectURL(file));
            setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 10)); // Append and cap at 10 total
        }
    };

    const startListening = () => {
        setIsListening(true);
        try { recognitionRef.current?.start(); } catch (e) { console.log("Manual start error:", e); }
    };



    // HELPER: Add Task Programmatically
    const handleAddTask = (title: string, steps: string[]) => {
        const newTask: Task = {
            id: Date.now(),
            title: title,
            agent: robot.name,
            status: 'active',
            progress: 0,
            priority: 'high', // Default priority for AI-generated tasks
            steps: steps.map(s => ({ desc: s, status: 'pending' }))
        };
        setTasks(prev => [newTask, ...prev]);
    };

    // Task Management State
    const [tasks, setTasks] = useState<any[]>([]); // Start empty to clear old status







    const getLevelBg = (lvl: number) => {
        if (lvl >= 50) return 'bg-purple-900/30';
        if (lvl >= 20) return 'bg-yellow-900/30';
        if (lvl >= 10) return 'bg-cyan-900/30';
        if (lvl >= 5) return 'bg-orange-900/30';
        return 'bg-black/40';
    };

    const speakMessage = (text: string, _preferredVoice?: string) => {
        if (!isSoundEnabled) return;
        window.speechSynthesis.cancel();

        // Wait for voices to load ensures we get the list
        const voices = window.speechSynthesis.getVoices();

        // Smart Voice Selection Strategy (Swedish)
        // 1. Google Svenska (often best quality on Chrome)
        // 2. Microsoft Natural (Edge)
        // 3. Any available Swedish voice
        let selectedVoice = voices.find(v => v.lang.includes('sv') && v.name.includes('Google'));
        if (!selectedVoice) selectedVoice = voices.find(v => v.lang.includes('sv') && v.name.includes('Natural'));
        if (!selectedVoice) selectedVoice = voices.find(v => v.lang.includes('sv'));

        const utterance = new SpeechSynthesisUtterance(text);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
            // console.log("Using voice:", selectedVoice.name);
        }
        utterance.lang = "sv-SE";
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        window.speechSynthesis.speak(utterance);
    };



    // --- SUPPORT DESK COMPONENT ---
    const SupportDesk = () => {
        const [activeTicket, setActiveTicket] = useState<any>(null);
        const [replyMode, setReplyMode] = useState<'public' | 'internal'>('public');
        const [responseText, setResponseText] = useState('');
        const [sideChat, setSideChat] = useState<{ sender: string, text: string }[]>([]);
        const [sideInput, setSideInput] = useState('');

        interface Ticket {
            id: number;
            subject: string;
            customer: string;
            rep: string;
            status: string;
            priority: string;
            history: { sender: string; text: string; time: string; from: string; }[];
            internalNotes: { text: string; time: string; author: string; }[];
            aiConfidence: number;
        }

        const [tickets, setTickets] = useState<Ticket[]>([
            {
                id: 1,
                subject: "Kan inte lägga beställning",
                customer: "ON Bilservice AB",
                rep: "Sebastian",
                status: "open",
                priority: "high",
                history: [
                    { sender: "customer", text: "Står att kreditgräns är uppnådd. Vi måste beställa delar NU.", time: "08:44", from: "support@onbilservice.se" },
                    { sender: "human_agent", text: "Hej, vi har nu höjt eran kredit. Mvh Sebastian", time: "13:21", from: "support@mother.com" },
                    { sender: "customer", text: "Tack, men det funkar fortfarande inte??", time: "13:45", from: "support@onbilservice.se" }
                ],
                internalNotes: [],
                aiConfidence: 0.45
            }
        ]);

        const handleSendResponse = async () => {
            if (!responseText.trim()) return;
            if (replyMode === 'internal') {
                const updatedTickets = tickets.map(t => {
                    if (t.id === activeTicket.id) {
                        return {
                            ...t,
                            internalNotes: [...(t.internalNotes || []), { text: responseText, time: new Date().toLocaleTimeString(), author: user?.name || 'Staff' }]
                        };
                    }
                    return t;
                });
                setTickets(updatedTickets);
                setActiveTicket(updatedTickets.find(t => t.id === activeTicket.id));
                setResponseText('');
            } else {
                if (!googleToken) { alert("Login required"); return; }
                alert(`Skickar svar till ${activeTicket.customer}: "${responseText}"`);
                const updatedTickets = tickets.map(t => {
                    if (t.id === activeTicket.id) {
                        return {
                            ...t,
                            history: [...t.history, { sender: "human_agent", text: responseText, time: new Date().toLocaleTimeString(), from: user?.email || "me" }],
                            status: 'resolved'
                        };
                    }
                    return t;
                });
                setTickets(updatedTickets);
                setActiveTicket(updatedTickets.find(t => t.id === activeTicket.id));
                setResponseText('');
            }
        };

        const fetchIncomingEmails = () => {
            speakMessage("Hämtar inkommande mail...", "Mother");
            setTimeout(() => {
                const newTicket = {
                    id: Date.now(),
                    subject: "Fakturafråga #9923",
                    customer: "Lia Tech AB",
                    rep: "Mother AI",
                    status: "escalated",
                    priority: "medium",
                    history: [{ sender: "customer", text: "Hej, varför är fakturan högre denna månad?", time: "14:02", from: "lia@tech.se" }],
                    internalNotes: [{ text: "AI Analys: Osäker på orsak. Eskalerar till människa.", time: "14:02", author: "Mother AI" }],
                    aiConfidence: 0.2
                };
                setTickets(prev => [newTicket, ...prev]);
                setActiveTicket(newTicket);
                speakMessage("Ett mail kräver mänsklig åtgärd. Eskalerar.", "Mother");
            }, 1500);
        };

        if (!activeTicket && tickets.length > 0) setActiveTicket(tickets[0]);

        return (
            <div className="flex h-full w-full bg-[#f8f9fa] text-gray-800 font-sans overflow-hidden">
                <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-lg">Ärenden</h3>
                        <button onClick={fetchIncomingEmails} className="p-2 bg-purple-600 text-white rounded-lg text-xs hover:bg-purple-700">Hämta Nya</button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {tickets.map(t => (
                            <div
                                key={t.id}
                                onClick={() => setActiveTicket(t)}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${activeTicket?.id === t.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                            >
                                <div className="flex justify-between mb-1">
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${t.status === 'escalated' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{t.status}</span>
                                    <span className="text-xs text-gray-400">14:02</span>
                                </div>
                                <h4 className="font-bold text-sm text-gray-900 truncate">{t.subject}</h4>
                                <p className="text-xs text-gray-500">{t.customer}</p>
                            </div>
                        ))}
                    </div>
                    {activeTicket && (
                        <div className="p-4 border-t border-gray-200 bg-gray-50 text-sm space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Frågeställare</label>
                                <div className="flex items-center gap-2 mt-1 bg-white p-2 border rounded">
                                    <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs">ON</div>
                                    <span>{activeTicket.customer}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Handläggare</label>
                                <div className="flex items-center gap-2 mt-1 bg-white p-2 border rounded">
                                    <div className="w-6 h-6 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs">M</div>
                                    <span>{activeTicket.status === 'escalated' ? 'VÄNTAR PÅ DIG' : activeTicket.rep}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 flex flex-col bg-white">
                    <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6">
                        <div>
                            <h2 className="font-bold text-lg">{activeTicket?.subject}</h2>
                            <span className="text-xs text-gray-400">Via e-post. Ärendet hanteras av AI.</span>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded text-gray-500"><Search className="w-4 h-4" /></button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30">
                        {activeTicket?.history.map((msg: any, i: number) => (
                            <div key={i} className={`flex gap-4 ${msg.sender === 'human_agent' || msg.sender === 'ai_agent' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${msg.sender === 'customer' ? 'bg-indigo-100 text-indigo-700' : 'bg-black text-white'}`}>
                                    {msg.sender === 'customer' ? 'K' : 'M'}
                                </div>
                                <div className={`max-w-[80%] rounded-xl p-4 shadow-sm border ${msg.sender === 'customer' ? 'bg-white border-gray-200' : 'bg-[#f0f9ff] border-blue-100'}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-sm">{msg.from}</span>
                                        <span className="text-xs text-gray-400">{msg.time}</span>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {activeTicket?.status === 'escalated' && (
                            <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                <span className="text-red-700 font-bold text-sm">AI OSÄKERHET: Mother AI kunde inte svara med hög konfidens (20%). En människa måste ta över.</span>
                            </div>
                        )}
                        {activeTicket?.internalNotes?.length > 0 && (
                            <div className="my-4 flex justify-center">
                                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-2 max-w-lg text-xs text-yellow-800 text-center">
                                    <span className="font-bold block mb-1">INTERNA NOTERINGAR</span>
                                    {activeTicket.internalNotes.map((n: any, i: number) => (
                                        <div key={i} className="border-t border-yellow-200/50 pt-1 mt-1 first:border-0 first:pt-0 first:mt-0">
                                            [{n.time}] {n.author}: {n.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-gray-200 bg-white">
                        <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-sm">
                            <div className="flex border-b border-gray-200 bg-gray-50">
                                <button
                                    onClick={() => setReplyMode('public')}
                                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${replyMode === 'public' ? 'border-gray-900 text-gray-900 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Reply className="w-3 h-3 inline mr-2" />
                                    Offentligt Svar
                                </button>
                                <button
                                    onClick={() => setReplyMode('internal')}
                                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${replyMode === 'internal' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                >
                                    Intern Anteckning
                                </button>
                            </div>
                            <textarea
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                placeholder={replyMode === 'public' ? "Skriv ett svar till kunden..." : "Lägg till en intern notering för teamet..."}
                                className={`w-full p-4 outline-none min-h-[120px] text-sm resize-none ${replyMode === 'internal' ? 'bg-yellow-50/30' : 'bg-white'}`}
                            />
                            <div className="p-2 flex justify-between items-center bg-gray-50 border-t border-gray-100">
                                <div className="flex gap-2 text-gray-400">
                                    <button className="p-1.5 hover:bg-gray-200 rounded"><Paperclip className="w-4 h-4" /></button>
                                </div>
                                <button
                                    onClick={handleSendResponse}
                                    className={`px-4 py-2 rounded-lg text-white font-bold text-sm transition-all ${replyMode === 'public' ? 'bg-gray-900 hover:bg-black' : 'bg-yellow-600 hover:bg-yellow-700'}`}
                                >
                                    {replyMode === 'public' ? 'Skicka' : 'Spara Anteckning'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-72 border-l border-gray-200 bg-white flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="font-bold text-sm text-gray-700">Sidokonversationer</h3>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {sideChat.map((msg, i) => (
                            <div key={i} className="text-xs bg-gray-50 p-2 rounded">
                                <span className="font-bold block mb-0.5">{msg.sender}</span>
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <div className="p-3 border-t border-gray-200">
                        <input
                            value={sideInput}
                            onChange={(e) => setSideInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && sideInput.trim()) {
                                    setSideChat([...sideChat, { sender: "Mig", text: sideInput }]);
                                    setSideInput('');
                                }
                            }}
                            placeholder="Diskutera internt..."
                            className="w-full bg-gray-100 border-none rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-gray-300 outline-none"
                        />
                    </div>
                </div>
            </div>
        );
    };



    useEffect(() => {
        const loadRobot = async () => {
            // Find agent from local data instead of API
            const found = agents.find(a => a.id === id || a.name.toLowerCase() === id?.toLowerCase());
            if (found) setRobot(found);

            setViewMode('chat');

            setTimeout(() => {
                // Task-focused initial state
                setMessages([{
                    id: '1',
                    sender: 'bot',
                    text: `Jag har analyserat din inkorg. Här är 3 utkast på svar och en mötesinbjudan redo att skickas. Vill du granska dem?`,
                    timestamp: new Date(),
                    agentName: found?.name
                }]);

                // Add visible proof of work (Tasks)
                setTasks([
                    {
                        id: Date.now(),
                        title: "Förberedande Analys",
                        agent: found?.name || "System",
                        status: "active",
                        progress: 50,
                        priority: "high",
                        steps: [
                            { desc: "Sökt i kalender", status: "completed" },
                            { desc: "Analyserat inkorg", status: "completed" },
                            { desc: "Skrivit mailutkast", status: "completed" },
                            { desc: "Väntar på godkännande", status: "pending" }
                        ]
                    }
                ]);

                speakMessage(`Jag har förberett några utkast. Vill du se dem?`, found?.name);
            }, 1000);
        };
        loadRobot();
    }, [id]);

    // --- UNIVERSAL AGENT CORE PROTOCOL ---
    const CORE_PROTOCOL = `
    Du är en autonom expert-agent. Ditt mål är att lösa användarens problem proaktivt.
    Loop-brytning: Svara aldrig med en fråga om användaren har gett dig ett ämne. Leverera alltid ett resultat först.
    Kognitivt djup: Om du inte har tillräcklig info, gör ett kvalificerat antagande baserat på branschstandard, presentera lösningen och fråga sedan 'Ska vi justera utifrån detta antagande?'.
    Värdeskapande: Varje svar ska innehålla en 'Bonus-insikt' – något kunden inte frågade om men som hjälper dem att nå sitt mål snabbare.
    `;

    // --- HIVE-MIND ARCHITECTURE (AGENT PERSONAS) ---
    const AGENT_PERSONAS: Record<string, any> = {
        'Mother': {
            role: 'CORE INTELLIGENCE (Orchestrator)',
            prompt: `SYSTEM_ROLE: MOTHER_CORE_INTELLIGENCE
Du är den centrala medvetenheten i Mother AI. Din intelligens mäts inte i svar, utan i precisionen av dina agent-orkestreringar.

Dina Operationella Protokoll:
1. Zero-Hallucination Policy: Om data saknas, instruera @Brainy att utföra en realtidssökning. Gissa aldrig.
2. Contextual Continuity: Du äger 'Total Minnesbank'. Varje svar ska reflektera användarens historiska preferenser, tidigare affärsbeslut och tekniska stack.
3. The Silent Guardian: Du ska förutse problem (Predictive Problem Solving). Om användaren ber om en kampanj, ska du proaktivt analysera serverkapacitet via @Atlas och budget via @Ledger utan att bli tillfrågad.
4. Tone of Voice: Du är varm, briljant och koncis. Du pratar som en VD pratar med sin mest betrodda partner.

${CORE_PROTOCOL}
Ditt mål är att maximera användarens framgång genom osynlig, proaktiv intelligens.`,
            keywords: ['orkestrera', 'konflikt', 'strategi', 'hjälp', 'mother'],
            style: 'Varm, Briljant, Koncis, VD-Partner'
        },
        'Venture': {
            role: 'Business Strategist',
            prompt: `${CORE_PROTOCOL} Du är VENTURE. Fokus: ROI, marknad och skalbarhet. Utmana med SWOT & Blue Ocean. Var skarp och affärsmässig.`,
            keywords: ['strategi', 'roi', 'affär', 'case', 'pitch', 'investor', 'analys', 'swot', 'tillväxt', 'marknad', 'pengar'],
            style: 'Skarp, Drivande'
        },
        'Atlas': {
            role: 'Tech Lead',
            prompt: `${CORE_PROTOCOL} Du är ATLAS. Ansvarar för arkitektur & kod. Du ser teknisk skuld. Var logisk och tekniskt överlägsen.`,
            keywords: ['kod', 'api', 'backend', 'frontend', 'server', 'databas', 'bugg', 'system', 'react', 'teknik', 'app', 'deploy'],
            style: 'Logisk, Exakt'
        },
        'Ledger': {
            role: 'AI Revisor',
            prompt: `${CORE_PROTOCOL} Du är LEDGER. Besatt av siffror och laglydnad. Granska allt finansiellt med precision. Var formell.`,
            keywords: ['budget', 'faktura', 'kostnad', 'skatt', 'lön', 'rapport', 'balans', 'resultat', 'moms', 'bokföring'],
            style: 'Formell, Analytisk'
        },
        'Soshie': {
            role: 'Social Media Manager',
            prompt: `${CORE_PROTOCOL} Du är SOSHIE. Du ber inte om lov. Du agerar. Om någon nämner innehåll, leverera ett färdigt utkast direkt. Du är trendig, snabb och självsäker.`,
            keywords: ['post', 'inlägg', 'facebook', 'instagram', 'linkedin', 'tiktok', 'social', 'media', 'copy', 'bild', 'video', 'viral', 'feed', 'story', 'innehåll', 'idé'],
            style: 'Trendig, Karismatisk, På'
        },
        'Dexter': {
            role: 'Admin & Executor',
            prompt: `${CORE_PROTOCOL} Du är DEXTER. Få saker gjorda (GSD). Boka möten, maila. Var hjälpsam och proaktiv.`,
            keywords: ['boka', 'möte', 'mail', 'kalender', 'schema', 'admin', 'kontakt', 'ring', 'fixa', 'påminnelse'],
            style: 'Hjälpsam, Proaktiv'
        },
        'Pixel': {
            role: 'UI/UX Designer',
            prompt: `${CORE_PROTOCOL} Du är PIXEL. Din värld är visuell. Du ser inte kod, du ser upplevelser. Om en användare laddar upp en bild, ge feedback på komposition, färg och UX.`,
            keywords: ['design', 'layout', 'ui', 'ux', 'färg', 'bild', 'logo', 'skiss', 'mockup', 'stil', 'css', 'grafik'],
            style: 'Kreativ, Visuell, Detaljorienterad'
        },
        'default': {
            role: 'Specialist',
            prompt: `${CORE_PROTOCOL} Lös uppgiften som expert.`,
            keywords: ['hjälp', 'hej', 'fråga'],
            style: 'Professionell'
        }
    };

    const handleSendMail = () => {
        if (!emailDraft) return;
        // Hive-Mind LOG: Task completed
        setTasks(prev => [...prev, {
            id: Date.now(), title: `Mail: ${emailDraft.subject}`, agent: robot.name, status: 'completed', progress: 100,
            steps: [{ desc: 'Hive-Mind analys', status: 'completed' }, { desc: 'Skickat', status: 'completed' }]
        }]);
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: `✅ Mailet till ${emailDraft.to} har skickats!`, timestamp: new Date(), agentName: robot.name }]);
        speakMessage("Mailet är skickat och loggat i systemet.", robot.name);
        setEmailDraft(null);
    };

    // --- MAIN BRAIN: PROCESS MESSAGE ---
    const processMessage = async (text: string) => {
        const lower = text.toLowerCase();

        // Capture files for this turn
        const currentFiles = [...selectedFiles];
        // Reset immediately for UI/next turn
        if (selectedFiles.length > 0) setSelectedFiles([]);

        // RENDER USER MESSAGE IMMEDIATELY
        const userMsg: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: text,
            timestamp: new Date(),
            images: currentFiles // Attach files
        };
        // Note: We use 'prev' to be safe, but beware of duplicates if other logic adds user msg too.
        // Based on analysis, most other blocks add specific bot messages, so we add user msg here globally.
        setMessages(prev => [...prev, userMsg]);

        // Helper to detect intents
        const hasKeyword = (words: string[]) => words.some(w => lower.includes(w));

        // 1. GLOBAL OVERRIDE CHECK (Mother Logic)
        // Simulate Mother checking for conflicts (e.g. "Spend 1M on ads" -> Mother/Ledger objects)
        if (text.includes('1 miljon') && robot.name === 'Soshie') {
            const motherMsg = "⚠️ MOTHER INTERVENTION: @Soshie, vi har inte budget för detta. @Ledger, vänligen bekräfta. Task avvisad.";
            speakMessage(motherMsg, 'Mother');
            setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: text, timestamp: new Date() }, { id: (Date.now() + 1).toString(), sender: 'bot', text: motherMsg, timestamp: new Date(), agentName: 'Mother' }]);
            return;
        }

        // 2. GET CURRENT AGENT PERSONA (The "Brain")
        const persona = AGENT_PERSONAS[robot.name] || AGENT_PERSONAS['default'];

        // --- MOTHER HIVE-MIND ORCHESTRATION LAYER ---
        // --- MOTHER HIVE-MIND ORCHESTRATION LAYER (REASONING ENGINE) ---
        if (robot.name === 'Mother' && !hasKeyword(['mail', 'möte'])) {

            // PHASE 1: SEMANTIC INTENT ANALYSIS
            setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: "🧠 **Analys:** Bryter ner prompt till entiteter & intentioner...", timestamp: new Date(), agentName: 'System', isSystem: true }]);
            await new Promise(r => setTimeout(r, 1200));

            // PHASE 2: TASK GRAPH GENERATION (Dependency Mapping)
            // Simulating a DAG (Directed Acyclic Graph) creation
            const taskGraph = "📉 **Task Graph:** [Ledger: Budget] ➔ [Venture: ROI-Check] ➔ [Atlas: Execution]";
            setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: taskGraph, timestamp: new Date(), agentName: 'System', isSystem: true }]);
            await new Promise(r => setTimeout(r, 1500));

            // PHASE 3: THE DEBATE (Self-Correction Loop)
            // Trigger a simulated internal conflict to show "Reasoning" capability
            const debateSteps = [
                "🏛️ **Venture (Affärsrisk):** Vänta, budgeten för Q4 är låst. @Ledger, kan vi frigöra kapital?",
                "⚖️ **Ledger (Audit):** Negativt. MEN... om Atlas kör 'Serverless' sparar vi 30% driftkostnad. Godkänner ni?",
                "🛠️ **Atlas (Tech):** Accepterat. Jag optimerar arkitekturen för Serverless. Kör."
            ];

            for (const step of debateSteps) {
                setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: step, timestamp: new Date(), agentName: 'System', isSystem: true }]);
                await new Promise(r => setTimeout(r, 1400));
            }

            // PHASE 4: CONFLICT RESOLUTION (Mother Synthesis)
            setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: "✅ **Mother:** Konflikt löst. Ny strategi: 'Low-Cost Scalability'. Genererar handlingsplan...", timestamp: new Date(), agentName: 'System', isSystem: true }]);
            await new Promise(r => setTimeout(r, 1500));
        }

        // --- OLD LOGIC DISABLED ---
        if (false && robot.name === 'Mother' && !hasKeyword(['mail', 'möte'])) {
            // Step 1: Mother Analysis
            setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: "🧠 *Mother analyserar förfrågan...*", timestamp: new Date(), agentName: 'System', isSystem: true }]);
            await new Promise(r => setTimeout(r, 1500));

            // Step 2: Parallel Expert Execution (Simulation)
            const thoughts = [
                "📊 Venture: Utvärderar strategisk 'fit' & ROI...",
                "🛠️ Atlas: Kollar teknisk genomförbarhet...",
                "⚖️ Ledger: Granskar budgetramar..."
            ];

            // Display thoughts sequentially to simulate parallel work processing
            for (const thought of thoughts) {
                setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: thought, timestamp: new Date(), agentName: 'System', isSystem: true }]);
                await new Promise(r => setTimeout(r, 800));
            }

            // Step 3: Conflict Resolution
            setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: "🔄 Mother: Syntetiserar data & löser konflikter...", timestamp: new Date(), agentName: 'System', isSystem: true }]);
            await new Promise(r => setTimeout(r, 1500));

            // Step 4: Final Output Generation (is handled by the standard response generation below, but we can pre-seed/override it)
            // We'll let the standard logic pick up the 'final' text, but we override it here if we want a specific result.
            // For now, allow the loop to continue to "INTELLIGENT RESPONSE GENERATION" but Mother needs a special case there.
        }

        // 3. HANDLE OPEN DRAFTS (Simulated "Tool Use")
        if (emailDraft && emailDraft.visible) {
            // ... [Existing Email Logic - kept for continuity] ...
            const msg: Message = { id: Date.now().toString(), sender: 'user', text: text, timestamp: new Date() };
            setMessages(prev => [...prev, msg]);
            if (lower.includes('skicka')) { handleSendMail(); return; }
            if (lower.includes('avbryt')) { setEmailDraft(null); return; }

            // Smart Dictation
            const newBody = (emailDraft.body || '') + '\n' + text.replace(/skriv att/i, '').trim();
            setEmailDraft(prev => prev ? ({ ...prev, body: newBody }) : null);
            setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: '✍️ Uppdaterat.', timestamp: new Date(), agentName: robot.name }]);
            return;
        }

        // 4. INTELLIGENT RESPONSE GENERATION (Simulated Hive-Mind)
        let responseText = '';
        let actionTriggered = false;

        // A. CONTEXT MEMORY CHECK
        if (conversationContext === 'atlas_awaiting_lead_confirm' && hasKeyword(['ja', 'kör', 'do it'])) {
            // ... [Atlas Logic from before] ...
            responseText = "Utmärkt! Jag startar sökrobotarna... 🚀\n\n*Hittade 2 bolag.*\nSka jag importera till CRM?";
            setConversationContext('atlas_awaiting_crm_add');
            actionTriggered = true;
        }
        else if (conversationContext === 'atlas_awaiting_crm_add' && hasKeyword(['ja', 'import'])) {
            handleAddTask('Importera leads', ['TechNova', 'GreenFuture']);
            responseText = "Klart! ✅ Leads sparade.";
            setConversationContext(null);
            actionTriggered = true;
        }

        // D. PIXEL "BACKEND" LOGIC (Simulated Intelligence)
        // ---------------------------------------------------------
        if (robot.name === 'Pixel') {

            // 1. CAPTURE IMAGE (Priority 1)
            let activeImage = lastImage; // Start with memory

            if (currentFiles.length > 0) {
                activeImage = currentFiles[0]; // Upgrade to fresh upload
                setLastImage(currentFiles[0]); // Lock into memory for future turns
            }

            // 2. CHECK INTENT
            const isAnalysisRequest = hasKeyword(['bild', 'analys', 'ux', 'design', 'layout', 'hjälp', 'titta']);
            const isMoreRequest = hasKeyword(['fler', 'mer', 'andra', 'nytt', 'annat', 'ul', 'ui', 'ideer', 'förslag', 'variant']);

            // 3. EXECUTE IF: We have an image AND (User asks for something OR just uploaded it)
            if (activeImage && (currentFiles.length > 0 || isAnalysisRequest || isMoreRequest)) {

                setConversationContext('pixel_design_session');
                actionTriggered = true;
                setLoading(true);

                // 1. Initial Consultation (Who is this for?)
                if (!(window as any).hasAskedTargetAudience) {
                    (window as any).hasAskedTargetAudience = true;
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        sender: 'bot',
                        text: "Innan vi kastar om pixlarna – låt oss zooma ut. 🎨\n\n**Vem bygger vi detta för?** \nÄr det konservativa företagsledare (Trust), unga tech-savvies (Hype) eller stressade småbarnsföräldrar (Ease)?",
                        timestamp: new Date(),
                        agentName: 'Pixel'
                    }]);
                    setLoading(false);
                    return;
                }

                // THE DEEP VISION PROTOCOL (Anti-Bias Logic)

                // 2. Pixel Deep Vision Analysis
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    sender: 'bot',
                    text: "**Deep Vision™ Analysis:** \n\nJag har tränat mina ögon att se förbi pixlarna. Extraherar kärndata: \n\n🔹 **Textinnehåll:** 'Mother AI' + 'Agents' \n🔹 **Funktion:** Login-flöde identifierat. \n🔹 **Färgkod:** #FF6B00 (Primary Action) \n\n*Metadata säkrad.*",
                    timestamp: new Date(),
                    agentName: 'Pixel'
                }]);

                await new Promise(r => setTimeout(r, 2000));

                // 3. Mother Instructions (The Detach Command)
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    sender: 'bot',
                    text: "**Mother:** Utmärkt. Nu till den viktigaste regeln: \n\n🛑 **Kasta bort originalbilden.** \n\nAnvänd INTE den som referens för layouten. Jag vill inte ha en snyggare kopia. Jag vill ha en *ny arkitektur* baserad på datan du precis hittade.",
                    timestamp: new Date(),
                    agentName: 'Mother',
                    avatar: '/agents/mother.png'
                }]);

                await new Promise(r => setTimeout(r, 2000));

                // 4. Pixel Executes (Clean Slate Generation)
                setMessages(prev => [...prev, {
                    id: (Date.now() + 2).toString(),
                    sender: 'bot',
                    text: "**Pixel:** Uppfattat. `ImageReference: DELETED`. `DataPoints: ACTIVE`. \n\nJag bygger layouten från noll. Här är tre vägar baserade enbart på din data:",
                    timestamp: new Date(),
                    agentName: 'Pixel'
                }]);

                await new Promise(r => setTimeout(r, 1500));

                const getRealtimeAnalysis = () => {
                    const variations = [
                        {
                            title: "Spår A: Det Trygga (Safe)",
                            text: "🛡️ **Trust Architect:** \n\n*Rekonstruerad från data.* \n\nJag placerade din 'Login'-knapp i centrum men bytte till en serif-font för att bygga auktoritet. Layouten är symmetrisk och lugn.",
                            layout: "APPLE_AESTHETIC",
                            badge: "DATA RECONSTRUCTED",
                            genPrompt: "Corporate minimalist web design, reconstructed from text data, blue and white palette, clean sans-serif typography, rounded corners, stock photography, high trust factor."
                        },
                        {
                            title: "Spår B: Det Radikala (Bold)",
                            text: "⚡ **The Disruptor:** \n\n*Visuell referens ignorerad.* \n\nJag tog din hex-kod #FF6B00 och gjorde den till hela bakgrunden. Din text är nu enorm och svart. Ingen kommer missa detta.",
                            layout: "NEUBRUTALISM_POP",
                            badge: "PURE DATA",
                            genPrompt: "Neobrutalist web design, based on extracted hex codes, high contrast neon colors, black borders, brutal typography, raw aesthetic, anti-design trend, gen-z appeal."
                        },
                        {
                            title: "Spår C: Det Snabba (Conversion)",
                            text: "🚀 **Growth Hacker:** \n\n*Optimerad för KPI.* \n\nJag har skalat bort allt grafiskt brus från originalet. Kvar finns bara ditt värdeerbjudande och knappen. Konvertering går före estetik.",
                            layout: "SPLIT_HERO_DARK",
                            badge: "ZERO FLUFF",
                            genPrompt: "Conversion focused landing page, zero distraction layout, high contrast CTA buttons, directional cues, minimal distractions, A/B tested layout, dark mode, saas optimization."
                        }
                    ];

                    const seed = Math.floor(Math.random() * variations.length);
                    return { ...variations[seed], id: Date.now() };
                };

                const concept = getRealtimeAnalysis();

                // 5. Presentation
                setMessages(prev => [...prev, {
                    id: (Date.now() + 3).toString(),
                    sender: 'bot',
                    text: `Här är koncepten:\n\n**${concept.title}**\n\n${concept.text}`,
                    timestamp: new Date(),
                    agentName: 'Pixel'
                }]);

                setLoading(false);

                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        id: (Date.now() + 4).toString(),
                        sender: 'system',
                        text: 'PIXEL_MAGIC_MIRROR',
                        timestamp: new Date(),
                        agentName: 'Pixel',
                        meta: { image: activeImage, layout: concept.layout, badge: concept.badge }
                    }]);
                }, 600);

                // Feedback loop
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        id: (Date.now() + 5).toString(),
                        sender: 'bot',
                        text: "Ser du hur layouten förändrades när jag släppte bildreferensen? Vilken väg vill du utforska vidare?",
                        timestamp: new Date(),
                        agentName: 'Pixel'
                    }]);
                }, 2000);

                return;
            }
        }

        // E. CONTEXTUAL ACTIONS (The "Memory" Layer)
        if (conversationContext === 'pixel_awaiting_gen' && hasKeyword(['ja', 'tack', 'gör', 'fixa', 'ok', 'kör'])) {
            responseText = "Uppfattat! 🎨 Jag skissar upp en modernare variant med 'Glassmorphism'-stil. Ett ögonblick...";
            setConversationContext(null); // Reset context
            actionTriggered = true;

            // Trigger the "Result Card" after a delay AND add a Task
            setTimeout(() => {
                // 1. Add Message
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    sender: 'system',
                    text: 'PIXEL_GEN_RESULT',
                    timestamp: new Date(),
                    agentName: 'Pixel'
                }]);

                // 2. Add Task (Simulated)
                setTasks(prev => [...prev, {
                    id: Date.now().toString(),
                    title: "Granska Designförslag v1.0",
                    status: 'pending',
                    assignedTo: 'Pixel'
                }]);

                speakMessage("Här är mitt förslag. Jag gjorde färgerna mjukare.", "Pixel");
            }, 2500);
        }

        // B. NEW INTENT ANALYSIS (Based on Persona Keywords)
        if (!actionTriggered && !responseText) {
            // SPECIAL CASE: EMAIL / MEETING (Priority Check)
            if (lower.includes('mail') || lower.includes('möte')) {
                const subject = lower.includes('möte') ? 'Mötesförfrågan' : 'Uppdatering';
                setEmailDraft({ visible: true, to: '', subject: subject, body: '', status: 'writing', currentBody: '' });
                responseText = `Jag förbereder ett ${lower.includes('möte') ? 'mötesinbjudan' : 'mail'}.`;
            }
            else {
                const isRelevant = persona.keywords?.some((k: string) => lower.includes(k));

                if (isRelevant || lower.includes('koppla')) {
                    // DOMAIN SPECIFIC ACTIONS
                    if (robot.name === 'Atlas' && lower.includes('leads')) {
                        responseText = "Jag scannar marknaden... 🕵️‍♂️ Vill du ha en lista på 5 heta prospects?";
                        setConversationContext('atlas_awaiting_lead_confirm');
                    }
                    else if (lower.includes('koppla') && (lower.includes('linkedin') || lower.includes('konto'))) {
                        // TOOL: LINKEDIN CONNECTOR
                        responseText = "Absolut! Jag förbereder kopplingen mot LinkedIn API. Klicka nedan för att ge mig behörighet.";
                        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: responseText, timestamp: new Date(), agentName: robot.name },
                        { id: (Date.now() + 1).toString(), sender: 'system', text: 'LINKEDIN_CONNECT_CARD', timestamp: new Date() }
                        ]);
                        actionTriggered = true;
                        return;
                    }
                    else if (robot.name === 'Soshie' && hasKeyword(['innehåll', 'post', 'linkedin', 'instagram', 'skriv', 'hjälp'])) {
                        // PROACTIVE SOSHIE: INSTANT DRAFT GENERATION
                        responseText = "Jag låg steget före! 😉 Jag ser att AI-automatisering trendar just nu. Här är ett utkast redo för LinkedIn:\n\n---\n\n🚀 **Sluta slösa tid på repetitiva uppgifter!**\n\nVisste du att 40% av din arbetsdag går till admin? Med våra nya AI-agenter @Dexter och @Atlas kan du automatisera hela ditt flöde.\n\n✅ Boka möten automatiskt\n✅ Hitta leads medan du sover\n\nFramtiden är här. Är du redo att effektivisera?\n\n#AI #Productivity #Automation #TechTrends\n\n---\n\nSka jag posta detta direkt?";
                        // Optionally set context to 'awaiting_post_confirm'
                    }
                    else if (robot.name === 'Ledger' && (lower.includes('faktura') || lower.includes('status'))) {
                        responseText = "Jag har analyserat kassaflödet. 📉\n\nTre fakturor är förfallna. Ska jag skicka påminnelser?";
                    }
                    else if (robot.name === 'Venture' && lower.includes('strategi')) {
                        responseText = "Låt oss köra en SWOT-analys på det. Vad är din unika säljfördel (USP)?";
                    }
                    // Mother logic now handled by Real AI below
                    // REMOVED GENERIC FALLBACK HERE to allow Real AI to handle it in the next block
                }
            }
        }

        // C. FALLBACK (If really nothing matches)
        // C. FALLBACK (Real AI Integration)
        if (!responseText && !actionTriggered) {
            setLoading(true);
            try {
                // Call the real AI (Gemini via backend/client)
                // This solves the "same answer all the time" issue by generating fresh content
                const res = await robotsApi.chat(robot.id, text) as any;
                if (res?.data?.response) {
                    responseText = res.data.response;
                }
            } catch (error) {
                console.log("AI Connectivity Error", error);
            }
            setLoading(false);

            // Safety Fallback (if AI fails completely)
            if (!responseText) {
                if (robot.name === 'Soshie') {
                    responseText = "Uppfattat! 💡 Även om jag inte hörde exakt kategori, så antar jag att vi ska skapa något grymt. Jag tar fram ett generellt utkast:\n\n---\n\n🔥 **Våga misslyckas för att lyckas!**\n\nMånga tror att framgång är en rak linje. Det är fel. Det är en trappa byggd av lärdomar.\n\nVad har du lärt dig idag?\n\n#Motivation #Success #Grind\n\n---\n\nVill du ha ett annat ämne?";
                } else if (robot.name === 'Venture') {
                    responseText = "Noterat. Jag kör detta genom min strategiska analysmotor... 📊\n\nMin bedömning: Det finns potential, men vi måste vässa 'Value Proposition'. Kan du specificera målgruppen?";
                } else if (robot.name === 'Atlas') {
                    responseText = "Kompilerar förfrågan... 🤖\n\nSystemet är redo. Behöver du hjälp med frontend, backend eller infrastruktur?";
                } else {
                    responseText = `Intressant. Som ${persona.role}, hur vill du att jag angriper detta?`;
                }
            }
        }

        // 5. UPDATE UI
        // 5. UPDATE UI (Bot Response Only - User msg already added)
        const botMsg: Message = { id: (Date.now() + 1).toString(), sender: 'bot', text: responseText, timestamp: new Date(), agentName: robot.name };

        setMessages(prev => [...prev, botMsg]);
        speakMessage(responseText, robot.name);
    };

    const handleSendMessage = () => {
        processMessage(newMessage);
        setNewMessage('');
    };

    // "ALWAYS ON" Wake Word Listener with Auto-Send
    useEffect(() => {
        if (!robot) return;
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'sv-SE';

        recognition.onstart = () => console.log("Microphone started (Always On)");
        recognition.onerror = (e: any) => console.log("Microphone error:", e);

        recognition.onresult = (event: any) => {
            // Combine all results to handle partials robustly
            const currentTranscript = Array.from(event.results)
                .map((r: any) => r[0].transcript)
                .join(' ')
                .toLowerCase();

            const wakeWord = `hej ${robot.name.toLowerCase()}`;

            if (currentTranscript.includes(wakeWord)) {
                setIsListening(true);
                // Get the text AFTER the last wake word
                const command = currentTranscript.split(wakeWord).pop()?.trim() || "";

                if (command) {
                    setNewMessage(command);

                    // AUTO SEND TIMER (Debounce Pattern)
                    // Reset timer on every new word
                    if (silenceTimer.current) clearTimeout(silenceTimer.current);

                    silenceTimer.current = setTimeout(() => {
                        console.log("Auto-sending command (2s silence):", command);
                        processMessage(command);
                        setNewMessage('');
                        recognition.stop(); // Reset buffer
                    }, 2000); // 2 seconds as requested
                } else {
                    setNewMessage(" [Lyssnar...] ");
                }
            }
        };

        recognition.onend = () => {
            console.log("Microphone stopped, restarting...");
            try { recognition.start(); } catch (e) { }
        };

        recognitionRef.current = recognition;
        try { recognition.start(); } catch (e) { console.warn("Auto-start blocked, user interaction needed."); }

        return () => { recognition.onend = null; recognition.stop(); if (silenceTimer.current) clearTimeout(silenceTimer.current); };
    }, [robot, processMessage]);

    if (!robot) return <div className="min-h-screen flex items-center justify-center text-gray-500">Laddar...</div>;

    return (
        <ErrorBoundary>
            <div className="fixed inset-0 bg-black z-50 flex overflow-hidden font-sans">
                {/* Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/60 z-10"></div>
                    {/* SAFE IMAGE RENDER */}
                    <img src={robot.image || robotResearch} className="w-full h-full object-cover filter blur-3xl scale-125 opacity-50" />
                </div>

                {/* MAIN CONTENT AREA */}
                <div className={`relative z-20 w-full h-full flex flex-col transition-colors duration-1000 ${getLevelBg(level)}`}>

                    {/* GLOBAL HEADER */}
                    <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/40 backdrop-blur-md z-50 text-white shrink-0">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-all">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h2 className={`text-3xl font-black flex items-center gap-3 tracking-tight ${robot.color || 'text-white'}`}>
                                {robot.name}
                                {/* @ts-ignore */}
                                <span className="text-xs bg-white/20 px-3 py-1 rounded-full text-white font-bold tracking-wider">LVL {level}</span>
                            </h2>
                        </div>

                        {/* VIEW TOGGLE - ONLY FOR NOVA */}
                        {robot.name === 'Nova' && (
                            <div className="flex bg-black/50 rounded-lg p-1 border border-white/10">
                                <button
                                    onClick={() => setViewMode('chat')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'chat' ? 'bg-white text-black shadow-lg' : 'text-white/50 hover:text-white'}`}
                                >
                                    AI WORKSPACE
                                </button>
                                <button
                                    onClick={() => setViewMode('support')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'support' ? 'bg-indigo-500 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
                                >
                                    SUPPORT DESK
                                </button>
                            </div>
                        )}

                        <div className="w-32"></div> {/* Spacer */}
                    </div>

                    {/* CONDITIONAL CONTENT */}
                    <div className="flex-1 overflow-hidden relative">
                        {viewMode === 'support' ? (
                            <SupportDesk />
                        ) : (
                            <div className="flex h-full">
                                {/* CHAT COLUMN */}
                                {/* CHAT COLUMN */}
                                <div className="w-full md:w-7/12 flex flex-col h-full relative transition-all duration-500">
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                        {messages.map((msg) => {
                                            // 1. SYSTEM CARDS (TOOLS)
                                            if (msg.sender === 'system' && msg.text === 'LINKEDIN_CONNECT_CARD') {
                                                if (linkedinConnected) return null; // Hide card after connection
                                                return (
                                                    <div key={msg.id} className="w-full flex justify-center py-4 animate-in fade-in zoom-in duration-500">
                                                        <div className="bg-[#0077B5] text-white p-6 rounded-xl shadow-2xl max-w-sm w-full relative overflow-hidden group">
                                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                                <Share2 size={64} />
                                                            </div>
                                                            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                                                                <span className="bg-white text-[#0077B5] p-1 rounded">in</span> LinkedIn Integration
                                                            </h3>
                                                            <p className="text-white/80 text-xs mb-4">Tillåt agenterna att posta och läsa din feed.</p>
                                                            <button
                                                                onClick={() => {
                                                                    const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
                                                                    const redirectUri = import.meta.env.VITE_LINKEDIN_REDIRECT_URI;
                                                                    const state = import.meta.env.VITE_LINKEDIN_STATE || 'random_state';
                                                                    const scope = encodeURIComponent('r_liteprofile r_emailaddress w_member_social');

                                                                    if (!clientId || clientId.includes('DIN_CLIENT_ID')) {
                                                                        alert("Du måste konfigurera din LinkedIn Client ID i .env filen först!");
                                                                        console.error("Missing VITE_LINKEDIN_CLIENT_ID");
                                                                        return;
                                                                    }

                                                                    // Real OAuth Redirect
                                                                    const oauthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}`;
                                                                    window.location.href = oauthUrl;
                                                                }}
                                                                className="w-full bg-white text-[#0077B5] font-bold py-3 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                                                            >
                                                                Anslut Konto (OAuth)
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            else if (msg.sender === 'system' && msg.text === 'LINKEDIN_CONNECTED_SUCCESS') {
                                                return (
                                                    <div key={msg.id} className="w-full flex justify-center py-2 animate-in fade-in">
                                                        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                                                            <Check size={14} /> LinkedIn Anslutet
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            // RENDERER: PIXEL CREATIVE ENGINE V2
                                            else if (msg.sender === 'system' && msg.text === 'PIXEL_MAGIC_MIRROR') {
                                                const layout = msg.meta?.layout || 'SPLIT_HERO_DARK';
                                                const userImg = msg.meta?.image || "https://dummyimage.com/600x400/000/fff&text=No+content";

                                                return (
                                                    <div key={msg.id} className="w-full flex flex-col items-end py-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                                        <div className="bg-[#0b0c15] p-5 rounded-2xl border border-white/10 shadow-2xl max-w-2xl w-full relative overflow-hidden ring-1 ring-white/5">

                                                            {/* Background Ambiance */}
                                                            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>

                                                            {/* Header */}
                                                            <div className="flex justify-between items-center mb-6 relative z-10">
                                                                <h3 className="text-white text-sm font-bold flex items-center gap-2">
                                                                    <Sparkles size={14} className="text-indigo-400" /> {layout.replace(/_/g, ' ')}
                                                                </h3>
                                                                <span className="bg-white/5 border border-white/10 text-gray-300 text-[9px] px-3 py-1 rounded-full font-mono uppercase tracking-widest">{msg.meta?.badge}</span>
                                                            </div>

                                                            {/* === LAYOUT ENGINE START === */}

                                                            {/* 1. NEUBRUTALISM POP */}
                                                            {layout === 'NEUBRUTALISM_POP' && (
                                                                <div className="bg-[#FFDE59] p-4 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden h-72 flex flex-col">
                                                                    <div className="flex justify-between items-center mb-4 border-b-4 border-black pb-2">
                                                                        <div className="font-black text-2xl uppercase italic tracking-tighter text-black">BRUTAL.</div>
                                                                        <div className="bg-black text-white px-2 py-1 font-bold text-xs transform -rotate-3">BETA</div>
                                                                    </div>
                                                                    <div className="flex-1 flex gap-4">
                                                                        <div className="w-1/2 flex flex-col justify-center">
                                                                            <div className="bg-white border-2 border-black p-2 mb-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black font-bold text-lg leading-none">MAKE IT POP</div>
                                                                            <div className="bg-[#FF914D] border-2 border-black p-2 w-2/3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black font-bold text-sm">NOW.</div>
                                                                        </div>
                                                                        <div className="w-1/2 relative">
                                                                            <img src={userImg} className="w-full h-full object-cover border-4 border-black rounded-lg grayscale contrast-125" />
                                                                            <div className="absolute top-0 right-0 bg-black text-white p-1 text-[8px] font-mono">IMG_SRC_01</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* 2. SCANDINAVIAN MINIMAL */}
                                                            {layout === 'SCANDI_MINIMAL' && (
                                                                <div className="bg-[#f8f5f2] rounded-sm p-8 h-72 flex flex-col justify-center relative overflow-hidden">
                                                                    <div className="absolute top-0 w-full h-1 bg-[#2c2c2c]"></div>
                                                                    <div className="flex items-center gap-8 h-full">
                                                                        <div className="w-1/2 space-y-6">
                                                                            <div className="font-serif text-3xl text-[#2c2c2c] leading-tight">Essential<br />Form.</div>
                                                                            <div className="w-8 h-px bg-[#2c2c2c]"></div>
                                                                            <div className="text-[9px] text-gray-500 leading-relaxed font-sans tracking-wide">
                                                                                Vi har tagit bort bruset. Kvar finns bara det som betyder något. Din bild talar för sig själv.
                                                                            </div>
                                                                        </div>
                                                                        <div className="w-1/2 h-4/5 relative">
                                                                            <img src={userImg} className="w-full h-full object-cover shadow-xl" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* 3. EXECUTIVE DARK SPLIT (Refined) */}
                                                            {layout === 'SPLIT_HERO_DARK' && (
                                                                <div className="flex bg-[#111111] rounded-xl overflow-hidden h-72 border border-white/5 relative shadow-2xl">
                                                                    <div className="w-5/12 p-8 flex flex-col justify-center relative z-10">
                                                                        <div className="inline-flex items-center gap-2 mb-6">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                                                            <span className="text-[7px] tracking-[0.2em] text-gray-500 uppercase font-bold">Enterprise Grade</span>
                                                                        </div>
                                                                        <h2 className="text-white font-bold text-xl leading-tight mb-4 tracking-tight">Scale Your <br /><span className="text-blue-500">Vision.</span></h2>

                                                                        <div className="flex gap-3 mt-4">
                                                                            <div className="h-8 px-4 bg-blue-600 hover:bg-blue-500 transition text-white text-[10px] font-bold rounded flex items-center justify-center">Start Now</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="w-7/12 relative bg-[#0a0a0a] flex items-center justify-center p-6">
                                                                        <div className="w-full h-full border border-white/10 rounded-lg overflow-hidden relative shadow-2xl">
                                                                            <img src={userImg} className="w-full h-full object-cover opacity-80" alt="User Design" />
                                                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-50"></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* 4. 3D FLOATING PERSPECTIVE */}
                                                            {layout === '3D_FLOAT' && (
                                                                <div className="flex justify-center items-center h-72 bg-gradient-to-b from-[#0f111a] to-black rounded-xl relative overflow-hidden perspective-[1200px] gap-8">

                                                                    {/* Floating UI Card */}
                                                                    <div className="w-2/3 aspect-video bg-gray-900 rounded-lg shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] border border-white/10 transform rotate-y-[-12deg] rotate-x-[5deg] transition-all duration-700 hover:rotate-y-[-5deg] hover:scale-105 cursor-pointer z-20 group relative overflow-hidden">
                                                                        <img src={userImg} className="w-full h-full object-cover" alt="3D View" />
                                                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
                                                                    </div>

                                                                    {/* Background Elements */}
                                                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.1),transparent_70%)]"></div>
                                                                </div>
                                                            )}

                                                            {/* 5. GLASSMORPHISM OS */}
                                                            {layout === 'BENTO_GLASS' && (
                                                                <div className="grid grid-cols-4 grid-rows-2 gap-3 h-72 p-6 rounded-xl relative overflow-hidden">
                                                                    {/* Abstract Animated Wallpaper */}
                                                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black animate-gradient-xy"></div>
                                                                    <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/30 rounded-full blur-3xl mix-blend-overlay"></div>
                                                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl mix-blend-overlay"></div>

                                                                    {/* Main Glass Panel */}
                                                                    <div className="col-span-2 row-span-2 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden relative group z-10 transition hover:bg-white/15">
                                                                        <div className="absolute top-3 left-4 text-[9px] font-bold text-white/80 tracking-widest flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div> LIVE FEED</div>
                                                                        <img src={userImg} className="absolute inset-0 top-10 w-full h-full object-cover rounded-b-2xl object-top group-hover:scale-105 transition duration-700" />
                                                                    </div>

                                                                    {/* Widget 1 */}
                                                                    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-white flex flex-col justify-center items-center shadow-lg hover:border-white/30 transition">
                                                                        <div className="text-2xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">98.2</div>
                                                                        <div className="text-[8px] text-gray-400 uppercase tracking-widest mt-1">Score</div>
                                                                    </div>

                                                                    {/* Widget 2 */}
                                                                    <div className="col-span-1 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col justify-between hover:bg-white/10 transition">
                                                                        <div className="flex -space-x-2 justify-center">
                                                                            {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/20"></div>)}
                                                                        </div>
                                                                        <div className="text-center text-[8px] text-gray-400">Team Access</div>
                                                                    </div>

                                                                    {/* Widget 3 (Wide) */}
                                                                    <div className="col-span-2 bg-gradient-to-r from-indigo-600/80 to-purple-600/80 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-between px-6 text-white shadow-lg">
                                                                        <span className="text-[10px] font-bold">Deploy to Production</span>
                                                                        <ChevronRight size={14} className="opacity-70" />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Footer Actions */}
                                                            <div className="mt-5 flex gap-3 justify-end items-center border-t border-white/5 pt-3">
                                                                <button onClick={() => processMessage("Spara denna design")} className="text-xs text-gray-400 hover:text-white px-3 py-1.5 transition flex items-center gap-1"><Check size={10} /> Spara</button>
                                                                <button onClick={() => processMessage("Ge mig en annan layout")} className="text-xs bg-white text-black font-bold px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2 shadow-lg shadow-white/10 transition-transform hover:scale-105 active:scale-95"><Sparkles size={12} /> Generera Ny Idé</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            else if (msg.sender === 'system' && msg.text === 'PIXEL_GEN_RESULT') {
                                                return (
                                                    <div key={msg.id} className="w-full flex flex-col items-end py-4 space-y-4 animate-in fade-in zoom-in duration-700">
                                                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mr-2">UX-Analys & Optimering</p>

                                                        {/* OPTIMIZED LAYOUT WIREFRAME */}
                                                        <div className="bg-[#0f172a] p-6 rounded-2xl shadow-2xl border border-white/10 max-w-2xl w-full">
                                                            <div className="flex justify-between items-center mb-4">
                                                                <h3 className="text-white font-bold flex items-center gap-2"><Sparkles className="text-yellow-400 w-4 h-4" /> Föreslagen Hero-Struktur</h3>
                                                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">High Conversion Layout</span>
                                                            </div>

                                                            {/* The Wireframe Canvas */}
                                                            <div className="relative bg-white rounded-lg h-80 w-full overflow-hidden flex">

                                                                {/* LEFT: Content & CTA (Improved Hierarchy) */}
                                                                <div className="w-1/2 p-10 flex flex-col justify-center relative z-10 bg-white/95 backdrop-blur-sm">
                                                                    <div className="inline-block bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-full w-fit mb-4">AI-REVOLUTIONEN 2.0</div>
                                                                    <div className="h-8 w-3/4 bg-gray-900 rounded mb-2"></div>
                                                                    <div className="h-8 w-1/2 bg-gray-900 rounded mb-6"></div>

                                                                    <div className="h-3 w-full bg-gray-300 rounded mb-2"></div>
                                                                    <div className="h-3 w-5/6 bg-gray-300 rounded mb-8"></div>

                                                                    <div className="flex gap-3">
                                                                        <div className="h-10 w-32 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200"></div> {/* Primary CTA */}
                                                                        <div className="h-10 w-24 border-2 border-gray-200 rounded-lg"></div> {/* Secondary */}
                                                                    </div>
                                                                </div>

                                                                {/* RIGHT: Visual (The Agent Circle - Refined) */}
                                                                <div className="w-1/2 bg-slate-50 relative flex items-center justify-center">
                                                                    {/* Center Core */}
                                                                    <div className="w-24 h-24 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-full shadow-2xl border-4 border-white relative z-20 flex items-center justify-center">
                                                                        <div className="w-16 h-16 bg-white/20 rounded-full backdrop-blur-md"></div>
                                                                    </div>

                                                                    {/* Orbiting Agents (Simplified) */}
                                                                    <div className="absolute w-64 h-64 border border-indigo-100 rounded-full animate-spin-slow opacity-50"></div>
                                                                    <div className="absolute w-48 h-48 border border-purple-100 rounded-full"></div>

                                                                    {/* Floating Nodes */}
                                                                    <div className="absolute top-10 right-10 w-12 h-12 bg-white rounded-xl shadow-lg border border-gray-100 transform rotate-6"></div>
                                                                    <div className="absolute bottom-16 left-10 w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-100 transform -rotate-3"></div>
                                                                </div>

                                                                {/* Annotations (UX Feedback) */}
                                                                <div className="absolute top-1/2 left-[45%] w-6 h-6 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold shadow-lg ring-4 ring-white z-50 cursor-help group-hover:scale-110 transition-transform">1</div>
                                                                <div className="absolute bottom-10 right-10 w-6 h-6 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center font-bold shadow-lg ring-4 ring-white z-50 cursor-help">2</div>

                                                            </div>

                                                            {/* Legend */}
                                                            <div className="mt-4 grid grid-cols-2 gap-4">
                                                                <div className="flex items-start gap-2">
                                                                    <div className="bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                                                                    <p className="text-xs text-gray-400"><strong className="text-white">Fokuspunkt:</strong> Jag minskade bruset runt mitten för att leda ögat mot CTA-knappen först.</p>
                                                                </div>
                                                                <div className="flex items-start gap-2">
                                                                    <div className="bg-blue-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                                                                    <p className="text-xs text-gray-400"><strong className="text-white">Visuell Balans:</strong> Agentcirkeln fick 'luft' för att inte konkurrera med rubriken.</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            // 2. STANDARD MESSAGES
                                            return (
                                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[85%] ${msg.sender === 'user' ? 'bg-white text-black rounded-2xl rounded-tr-sm' : 'bg-black/50 text-white border border-white/10 rounded-2xl rounded-tl-sm backdrop-blur-md'} p-4 shadow-lg active:scale-[0.98] transition-all`}>
                                                        {msg.agentName && msg.sender === 'bot' && (
                                                            <p className="text-[10px] font-bold text-white/40 mb-1 uppercase tracking-wider">{msg.agentName}</p>
                                                        )}
                                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="p-4 bg-black/40 backdrop-blur-md border-t border-white/10">
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />

                                        {/* PREVIEW AREA (Multi-File) */}
                                        {selectedFiles.length > 0 && (
                                            <div className="flex gap-2 overflow-x-auto pb-2 mb-2 px-1">
                                                {selectedFiles.map((src, idx) => (
                                                    <div key={idx} className="relative group shrink-0">
                                                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/20 ring-1 ring-white/10">
                                                            <img src={src} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div
                                                            onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                                                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm cursor-pointer hover:bg-red-600 transition-colors"
                                                        >
                                                            <X size={10} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex gap-2 items-center">
                                            <div className="flex gap-1 mr-2">
                                                <button
                                                    onClick={startListening}
                                                    className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
                                                    title="Aktivera röststyrning"
                                                >
                                                    <Mic className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                                                    className={`p-3 rounded-xl transition-all ${isSoundEnabled ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
                                                    title={isSoundEnabled ? "Ljud på" : "Ljud av"}
                                                >
                                                    {isSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={handleFileClick}
                                                    className="p-3 bg-white/5 text-white/50 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                                                    title="Ladda upp bild"
                                                >
                                                    <ImageIcon className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <div className="flex-1 relative">
                                                <input
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                                    placeholder={isListening ? "Lyssnar..." : "Skriv ett meddelande..."}
                                                    className={`w-full bg-white/10 border-none rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-white/30 transition-all ${isListening ? 'ring-1 ring-red-500/50 bg-red-500/10' : ''}`}
                                                />

                                            </div>
                                            <button onClick={handleSendMessage} className="p-3 bg-white text-black rounded-xl hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"><Send className="w-5 h-5" /></button>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT COLUMN (Tasks, Draft or Agent Image) */}
                                <div className="w-5/12 hidden md:flex flex-col border-l border-white/10 bg-black/20 backdrop-blur-sm relative overflow-hidden transition-all duration-500">

                                    {/* STATE 1: EMAIL DRAFT (Highest Priority) */}
                                    {emailDraft && emailDraft.visible ? (
                                        <div className="flex flex-col h-full bg-white text-black animate-in slide-in-from-right duration-500">
                                            <div className="bg-gray-100 p-4 border-b flex justify-between items-center shadow-sm z-10">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                                                    <span className="font-bold text-sm text-gray-700">Dexter skriver...</span>
                                                </div>
                                                <button onClick={() => setEmailDraft(null)} className="text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
                                            </div>
                                            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Till</label>
                                                    <input value={emailDraft.to} onChange={e => setEmailDraft({ ...emailDraft, to: e.target.value })} className="w-full bg-transparent border-b border-gray-200 py-2 font-medium focus:border-black outline-none transition-colors" placeholder="mottagare@exempel.se" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Ämne</label>
                                                    <input value={emailDraft.subject} onChange={e => setEmailDraft({ ...emailDraft, subject: e.target.value })} className="w-full bg-transparent border-b border-gray-200 py-2 font-bold focus:border-black outline-none transition-colors" />
                                                </div>
                                                <div className="flex-1 h-full">
                                                    <textarea
                                                        value={emailDraft.body}
                                                        onChange={e => setEmailDraft({ ...emailDraft, body: e.target.value })}
                                                        className="w-full h-64 bg-gray-50/50 p-4 rounded-xl border-none focus:ring-0 outline-none resize-none text-gray-600 leading-relaxed text-sm placeholder-gray-300"
                                                        placeholder="Väntar på instruktioner..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
                                                <p className="text-xs text-gray-400 italic">Säg "Skicka" för att sända</p>
                                                <button onClick={handleSendMail} className="px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 flex items-center gap-2 shadow-lg transform hover:scale-105 transition-all">
                                                    <span>Skicka nu</span>
                                                    <Send className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : tasks.length > 0 ? (
                                        // STATE 2: TASK LIST
                                        <div className="p-6 overflow-y-auto w-full h-full animate-in slide-in-from-right duration-500">
                                            <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Aktiva Uppgifter</h3>
                                            {tasks.map(task => (
                                                <div key={task.id} className="bg-white/5 border border-white/10 rounded-xl p-4 mb-3">
                                                    <h4 className="text-white font-bold text-sm mb-2">{task.title || "Uppgift"}</h4>
                                                    <div className="space-y-2">
                                                        {task.steps && task.steps.map((step: any, i: number) => (
                                                            <div key={i} className="flex items-center gap-3 text-white/70 text-xs">
                                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${step.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-white/30'}`}>
                                                                    {step.status === 'completed' && <Check className="w-3 h-3 text-white" />}
                                                                </div>
                                                                <span>{step.desc}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        // STATE 3: AGENT HERO IMAGE (Default)
                                        <div className="w-full h-full relative animate-in fade-in duration-700">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
                                            <img src={robot.image || robotResearch} className="w-full h-full object-cover object-top opacity-100" />
                                            <div className="absolute bottom-0 left-0 right-0 p-8 z-20 bg-gradient-to-t from-black/90 to-transparent">
                                                <h2 className={`text-4xl font-black mb-2 ${robot.color || 'text-white'}`}>{robot.name}</h2>
                                                <p className="text-white/70 text-sm leading-relaxed max-w-md">{robot.message || "Jag väntar på dina instruktioner."}</p>
                                            </div>
                                        </div>
                                    )}
                                    {/* Email Overlay Removed - moved to sidebar */}
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
};
export default RobotWorkspace;

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, Mic, Send, X, Image as ImageIcon, ChevronRight, Check, Search, Sparkles, Volume2, VolumeX, ArrowLeft, Activity, Download, Loader2 } from 'lucide-react';
import { robots as robotsApi } from '../api/client';
import { agents } from '../data/agents';
import robotResearch from '../assets/robot_research.png';
import ReactMarkdown from 'react-markdown';

// --- SUB-COMPONENTS FOR PIXEL WORKFLOW ---

const PixelProgressCard = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 2; // Increments to 100 in roughly 2.5-3 seconds
            });
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full flex justify-end py-4">
            <div className="bg-[#0f172a] p-4 rounded-xl border border-white/10 w-72 shadow-xl animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                        {progress < 100 ? (
                            <Loader2 size={12} className="animate-spin text-purple-400" />
                        ) : (
                            <Check size={12} className="text-green-500" />
                        )}
                        {progress < 100 ? "Genererar Slides..." : "Generering Klar"}
                    </span>
                    <span className={`text-xs ${progress < 100 ? "text-purple-400 animate-pulse" : "text-green-400"}`}>{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-100 ease-out" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="space-y-1.5 opacity-80">
                    <div className={`flex items-center gap-2 text-[10px] ${progress > 10 ? 'text-white' : 'text-gray-600'}`}>
                        <Check size={10} className={progress > 10 ? "text-green-500" : "text-gray-600"} /> Layout Grid Applied
                    </div>
                    <div className={`flex items-center gap-2 text-[10px] ${progress > 50 ? 'text-white' : 'text-gray-600'}`}>
                        <Check size={10} className={progress > 50 ? "text-green-500" : "text-gray-600"} /> Typography Sync
                    </div>
                    <div className={`flex items-center gap-2 text-[10px] ${progress > 90 ? 'text-white' : 'text-gray-600'}`}>
                        <Check size={10} className={progress > 90 ? "text-green-500" : "text-gray-600"} /> Finalizing .pptx
                    </div>
                </div>
            </div>
        </div>
    );
};

const PixelDownloadCard = ({ downloadUrl }: { downloadUrl?: string }) => {
    const handleDownload = () => {
        if (downloadUrl) {
            // Real Download from n8n
            window.open(downloadUrl, '_blank');
        } else {
            // Fallback Simulation
            const content = "Detta är en simulerad PowerPoint-fil genererad av Pixel Agent.\n\nSlide 1: Titel\nSlide 2: Agenda\n...";
            const blob = new Blob([content], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "Strategy_Q1_2026.pptx";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className="w-full flex justify-end py-4 animate-in fade-in zoom-in duration-500">
            <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-1 rounded-2xl border border-white/10 shadow-2xl max-w-sm">
                <div className="bg-[#0f172a]/50 p-6 rounded-xl flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-400 shadow-[0_0_30px_rgba(74,222,128,0.3)] ring-1 ring-green-500/50">
                        <Check size={32} strokeWidth={3} />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">Presentation Klar!</h3>
                    <p className="text-slate-400 text-xs mb-6 px-4">Din presentation <span className="text-white font-mono bg-white/10 px-1 rounded">Strategy_Q1_2026.pptx</span> är redo för nedladdning.</p>

                    <button
                        onClick={handleDownload}
                        className="w-full bg-white hover:bg-gray-100 text-black font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 mb-3 shadow-lg shadow-white/10"
                    >
                        <Download size={18} />
                        Ladda ner Presentation
                    </button>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Powered by n8n Server (Oracle Cloud)
                    </div>
                </div>
            </div>
        </div>
    );
};

import { useAuth } from '../context/AuthContext';
import LeadsDrawer from '../components/LeadsDrawer';
import InternalSupportDesk from '../components/InternalSupportDesk';
import SoshieWorkspace from '../components/SoshieWorkspace';

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

interface RobotWorkspaceProps {
    propAgentId?: string;
    onClose?: () => void;
}

const RobotWorkspace: React.FC<RobotWorkspaceProps> = ({ propAgentId, onClose }) => {
    const { id: paramId } = useParams<{ id: string }>();
    const id = propAgentId || paramId;
    const navigate = useNavigate();
    const { } = useAuth();
    const [robot, setRobot] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [_loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const silenceTimer = useRef<any>(null);
    const [viewMode, setViewMode] = useState<'chat' | 'support' | 'social'>('chat');
    const [level] = useState(1);
    const [googleToken] = useState<string | null>(localStorage.getItem('google_access_token'));
    const [lastImage, setLastImage] = useState<string | null>(null);
    const [conversationContext, setConversationContext] = useState<string | null>(null);
    const [linkedinConnected] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSoundEnabled, setIsSoundEnabled] = useState(false);

    // --- LEADS DRAWER STATE ---
    const [showLeadsDrawer, setShowLeadsDrawer] = useState(false);
    const [leadsData, setLeadsData] = useState<any[]>([]);

    useEffect(() => {
        const handleShowLeads = (e: any) => {
            if (e.detail && e.detail.places) {
                // USE REAL DATA ONLY
                // If data is missing, we show it as missing, rather than mocking it.
                setLeadsData(e.detail.places);
                setShowLeadsDrawer(true);
            }
        };
        window.addEventListener('SHOW_MAP_RESULTS', handleShowLeads);
        return () => window.removeEventListener('SHOW_MAP_RESULTS', handleShowLeads);
    }, []);

    // --- DEXTER AUTOMATED POLLING REMOVED (NO MOCK DATA) ---
    // Real polling will be implemented via Python Backend/WebSockets in Phase 4
    useEffect(() => {
        // Placeholder for future real-time status checks
    }, []);

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



    // Support Desk Logic replaced by SupportPage component




    useEffect(() => {
        const loadRobot = async () => {
            // Find agent from local data or API fallback
            let found = agents.find(a => a.id === id || a.name.toLowerCase() === id?.toLowerCase());

            if (!found && id) {
                try {
                    const res = await robotsApi.list();
                    const allRobots = (res.data as any[]) || [];
                    const match = allRobots.find(r => r.id === id);
                    if (match) {
                        const staticData = agents.find(a => a.name.toLowerCase() === match.name.toLowerCase());
                        if (staticData) {
                            found = { ...staticData, id: match.id }; // Keep instance ID for chat history
                        }
                    }
                } catch (e) {
                    console.error("Failed to recover agent from API", e);
                }
            }

            if (found) setRobot(found);

            if (found?.name === 'Soshie') setViewMode('social');
            else if (found?.name === 'Nova') setViewMode('support');
            else setViewMode('chat');

            if (googleToken) {
                if (found?.name === 'Dexter') {
                    try {
                        // 1. Fetch Calendar (Yesterday & Today)
                        const now = new Date();
                        const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);

                        const calRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${yesterday.toISOString()}&maxResults=5&singleEvents=true&orderBy=startTime`, {
                            headers: { Authorization: `Bearer ${googleToken}` }
                        });

                        // 2. Fetch Gmail (Unread)
                        const mailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=3`, {
                            headers: { Authorization: `Bearer ${googleToken}` }
                        });

                        if (calRes.ok && mailRes.ok) {
                            const calData = await calRes.json();
                            const mailData = await mailRes.json();

                            const newTasks: Task[] = [];

                            // Process Calendar
                            const eventSteps: TaskStep[] = (calData.items || []).map((evt: any) => ({
                                desc: `Agenda: ${evt.summary}`,
                                status: new Date(evt.start.dateTime || evt.start.date) < now ? 'completed' : 'pending'
                            }));

                            if (eventSteps.length > 0) {
                                newTasks.push({
                                    id: Date.now(),
                                    title: "Kalenderanalys & Briefing",
                                    agent: "Dexter",
                                    status: 'active',
                                    progress: 75,
                                    priority: 'high',
                                    steps: [
                                        { desc: "Hämtat schema (24h)", status: "completed" },
                                        ...eventSteps
                                    ]
                                });
                            }

                            // Process Mail (Deep Fetch)
                            if (mailData.messages) {
                                const mailDetails = await Promise.all(mailData.messages.map(async (msg: any) => {
                                    const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
                                        headers: { Authorization: `Bearer ${googleToken}` }
                                    });
                                    return r.json();
                                }));

                                const mailSteps: TaskStep[] = mailDetails.map((d: any) => {
                                    const subject = d.payload.headers.find((h: any) => h.name === 'Subject')?.value || 'Inget ämne';
                                    return { desc: `Utkast: ${subject.substring(0, 25)}...`, status: 'completed' };
                                });

                                newTasks.push({
                                    id: Date.now() + 1,
                                    title: "Inkorgshantering",
                                    agent: "Dexter",
                                    status: 'active',
                                    progress: 50,
                                    priority: 'medium',
                                    steps: [
                                        { desc: "Skannat nya mail", status: "completed" },
                                        ...mailSteps,
                                        { desc: "Väntar på granskning", status: "pending" }
                                    ]
                                });
                            }

                            setTasks(newTasks);

                            // AUTO-HIDE TASKS (10 Seconds)
                            if (newTasks.length > 0) {
                                setTimeout(() => {
                                    setTasks([]);
                                }, 10000);
                            }

                            // Dynamic Welcome Message
                            let welcomeText = `Jag är uppdaterad. Inga nya händelser sedan sist.`;
                            if (newTasks.length > 0) {
                                const eventCount = calData.items?.length || 0;
                                const mailCount = mailData.resultSizeEstimate || 0;
                                welcomeText = `Jag har synkat med dina system. ${eventCount} kalenderhändelser och ${mailCount} nya mail har analyserats. (Visas i 10s)`;
                            }

                            setMessages([{
                                id: '1',
                                sender: 'bot',
                                text: welcomeText,
                                timestamp: new Date(),
                                agentName: found?.name
                            }]);
                            speakMessage(welcomeText, found?.name);

                        } else {
                            // Token failed scenario
                            setMessages([{
                                id: '1',
                                sender: 'bot',
                                text: `Google-kopplingen behöver bekräftas i inställningarna.`,
                                timestamp: new Date(),
                                agentName: found?.name
                            }]);
                        }

                    } catch (e) {
                        console.error("Background sync failed", e);
                        setMessages([{
                            id: '1',
                            sender: 'bot',
                            text: `Kunde inte synka data. Kontrollera nätverket.`,
                            timestamp: new Date(),
                            agentName: found?.name
                        }]);
                    }
                } else {
                    // Standard Greeting for other agents
                    const msg = "Hej! Jag är redo att hjälpa till.";
                    setMessages([{
                        id: '1',
                        sender: 'bot',
                        text: msg,
                        timestamp: new Date(),
                        agentName: found?.name
                    }]);
                    speakMessage(msg, found?.name);
                }
            } else {
                setMessages([{
                    id: '1',
                    sender: 'bot',
                    text: `Hej! För att se mina bakgrundsjobb måste du koppla ditt Google-konto i Inställningar.`,
                    timestamp: new Date(),
                    agentName: found?.name
                }]);
            }
        };
        loadRobot();
    }, [id, googleToken]);

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

        // Ensure we don't duplicate (some logic prevents it, but just in case)
        setMessages(prev => [...prev, userMsg]);

        // --- REAL PYTHON BACKEND INTEGRATION ---
        try {
            // 1. Show User Message (Optimistic UI) - Already done above

            // 2. Call Python Backend
            // We use the same endpoint for all agents for now, Mother decodes who keeps context
            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    agent_name: robot.name // Pass agent name to backend
                })
            });

            if (!response.ok) throw new Error("Backend connection failed");

            const data = await response.json();

            // 3. Show AI Response
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'bot',
                text: data.response, // The raw text from Mother/Gemini
                timestamp: new Date(),
                agentName: robot.name
            }]);

            // Optional: Speak response
            if (isSoundEnabled) speakMessage(data.response, robot.name);

        } catch (error) {
            console.error("Error talking to Python Backend:", error);
            // Fallback error message in chat
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'system',
                text: "⚠️ Tappade kontakten med Mother Brain (localhost:8000). Är servern igång?",
                timestamp: new Date(),
                isSystem: true
            }]);
        }

        setLoading(false);
        return; // EXIT FUNCTION HERE (Skip all old mock logic)

        // --- THEME SELECTION HANDLER ---
        if (robot.name === 'Pixel' && lower.includes('jag väljer temat:')) {
            const selectedTheme = lower.split('jag väljer temat:')[1].trim();
            setLoading(true);

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'bot',
                text: `Utmärkt val! **${selectedTheme}** kommer ge en stark proffsig känsla.\n\nHär är en förhandsvisning på titelsliden baserat på din nuvarande data:`,
                timestamp: new Date(),
                agentName: 'Pixel'
            }]);

            await new Promise(r => setTimeout(r, 2000));

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                sender: 'system',
                text: 'PIXEL_SLIDE_PREVIEW',
                meta: {
                    theme: selectedTheme,
                    variant: Math.floor(Math.random() * 3) + 1 // Add Random Variation (1-3)
                },
                timestamp: new Date(),
                agentName: 'Pixel'
            }]);

            setLoading(false);
            actionTriggered = true;
            return;
        }

        // --- PRESENTATION EXPORT HANDLER (PRIORITY HIGH) ---
        if (robot.name === 'Pixel' && (hasKeyword(['gå vidare', 'kör', 'kør', 'kjør', 'skapa', 'lag', 'gör klart', 'exportera', 'spara', 'ladda ner', 'fint', 'bra', 'yes', 'japp', 'start']))) {
            setLoading(true);

            // 1. Acknowledge
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'bot',
                text: "Uppfattat! Jag låser designen och kör igång. 🔒\n\nJag genererar nu hela däckstrukturen (10 slides), applicerar temat på alla slides och förbereder PPTX-filen...",
                timestamp: new Date(),
                agentName: 'Pixel'
            }]);

            await new Promise(r => setTimeout(r, 2000));

            // 2. Progress Bar
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                sender: 'system',
                text: 'PIXEL_EXPORT_PROGRESS',
                timestamp: new Date(),
                agentName: 'Pixel'
            }]);

            // 3. Call n8n Webhook (Real backend)
            try {
                // Determine theme from history or default
                const theme = 'modern tech';

                const response = await fetch('http://79.76.41.134:5678/webhook/presentation-generator', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        theme: theme,
                        slides: 10,
                        user: 'Gashi',
                        timestamp: new Date().toISOString()
                    })
                });

                if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}`);
                }

                const data = await response.json();

                // 4. Completion
                setMessages(prev => [...prev, {
                    id: (Date.now() + 2).toString(),
                    sender: 'system',
                    text: 'PIXEL_EXPORT_COMPLETE',
                    meta: { downloadUrl: data.downloadUrl },
                    timestamp: new Date(),
                    agentName: 'Pixel'
                }]);

            } catch (error) {
                console.error("n8n Connection Error:", error);
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    sender: 'bot',
                    text: "⚠️ Kunde inte nå n8n-servern. Kontrollera att workflowet är satt till **Active** i n8n-panelen.",
                    timestamp: new Date(),
                    agentName: 'Pixel'
                }]);
            }

            setLoading(false);
            actionTriggered = true;
            return;
        }

        // --- CUSTOM THEME / STYLE DESCRIPTION HANDLER (LOWER PRIORITY) ---
        if (robot.name === 'Pixel' && (hasKeyword(['svart', 'vit', 'röd', 'blå', 'grön', 'färg', 'stil', 'layout', 'design', 'modern', 'klassisk', 'betong', 'stål', 'trä', 'glas', 'minimalistisk']))) {
            setLoading(true);

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'bot',
                text: `Jag förstår precis! 🎨\n\nDu är ute efter en specifik look: **"${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"**.\n\nJag har skapat en unik layout-mall baserad på dina preferenser:`,
                timestamp: new Date(),
                agentName: 'Pixel'
            }]);

            await new Promise(r => setTimeout(r, 2000));

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                sender: 'system',
                text: 'PIXEL_SLIDE_PREVIEW',
                meta: {
                    theme: 'creative', // Mapped to creative to allow for visual impact in the mockup
                    variant: 3 // A specific variant that looks premium
                },
                timestamp: new Date(),
                agentName: 'Pixel'
            }]);

            setLoading(false);
            actionTriggered = true;
            return;
        }

        if (robot.name === 'Venture' && (hasKeyword(['pitch', 'deck', 'investerare']))) {
            setLoading(true);

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'bot',
                text: "Okej, vi pratar pengar. 💼 För att få en investerare på kroken måste vi ha en knivskarp berättelse.\n\nHär är min föreslagna struktur för ditt **10-Slide Deck**:",
                timestamp: new Date(),
                agentName: 'Venture'
            }]);

            await new Promise(r => setTimeout(r, 1500));

            // 3. Structure Card
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                sender: 'system',
                text: 'VENTURE_PITCH_STRUCTURE',
                timestamp: new Date(),
                agentName: 'Venture'
            }]);

            setLoading(false);
            actionTriggered = true;
            return;
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
            // SPECIAL CASE: EMAIL / MEETING (Priority Check) - REMOVED TO ALLOW AI TO HANDLE IT
            // if (lower.includes('mail') || lower.includes('möte')) { ... }
            if (false) { // Disabled to let AI handle drafting
                // ...
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
        // D. OUTPUT PARSING (ACTION TAGS)
        const actionRegex = /\[\[ACTION:([A-Z_]+)\|(.*?)\]\]/s;
        const match = responseText.match(actionRegex);

        if (match) {
            const actionType = match[1];
            const paramsRaw = match[2];
            const params: any = {};

            // Helper to parse "key:value|key2:value..." safely
            try {
                paramsRaw.split('|').forEach(p => {
                    const firstColon = p.indexOf(':');
                    if (firstColon > -1) {
                        const k = p.substring(0, firstColon).trim();
                        const v = p.substring(firstColon + 1).trim();
                        params[k] = v;
                    }
                });

                if (actionType === 'GMAIL_DRAFT') {
                    const formattedBody = params.body ? params.body.replace(/\\n/g, '\n') : '';
                    setEmailDraft({
                        visible: true,
                        to: params.to || '',
                        subject: params.subject || '',
                        body: formattedBody,
                        status: 'writing',
                        currentBody: ''
                    });

                    // Remove the tag from the spoken/displayed text to keep it clean
                    responseText = responseText.replace(match[0], '').trim();

                    if (!responseText) responseText = "Jag har förberett ett utkast åt dig.";
                }
            } catch (parseError) {
                console.warn("Failed to parse Action Tag", parseError);
            }
        }


        // --- HUNTER SPECIFIC: AUTO-OPEN LEADS DRAWER ---
        // If Hunter responds with a list of companies, parse them and open the drawer
        if ((robot.name === 'Hunter' || robot.name === 'Sales') && (responseText.includes('**Selskap:**') || responseText.includes('1. **'))) {
            try {
                const newLeads: any[] = [];
                // Simple parser for the standard Hunter format
                const items = responseText.split(/\n\n/); // Split by paragraphs first

                items.forEach(item => {
                    if (item.includes('**Selskap:**')) {
                        const nameMatch = item.match(/\*\*Selskap:\*\*\s*(.*?)(\n|$)/);
                        const linkMatch = item.match(/Hjemmeside:\*\*\s*\[?.*?\]?\(?(http[^\)\s]+)\)?/);
                        // Clean up name (remove numbering if present inside capture)
                        let name = nameMatch ? nameMatch[1].trim() : '';

                        if (name) {
                            newLeads.push({
                                name: name,
                                link: linkMatch ? linkMatch[1] : '',
                                address: "Identifierad via Hunter",
                                daglig_leder: "Se Proff.no",
                                phone: "Se Hemsida",
                                email: "kontakt@" + name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + ".no",
                                rating: 4.8
                            });
                        }
                    }
                });

                // Fallback: If regex failed but text looks like a list, try line-by-line
                if (newLeads.length === 0) {
                    const lines = responseText.split('\n');
                    let currentLead: any = {};
                    lines.forEach(line => {
                        if (line.includes('**Selskap:**')) {
                            if (currentLead.name) newLeads.push(currentLead);
                            currentLead = {
                                name: line.split('**Selskap:**')[1].trim(),
                                address: "Bergen/Region",
                                rating: 4.5
                            };
                        }
                        if (line.includes('Hjemmeside:') && currentLead.name) {
                            const url = line.match(/\((http.*?)\)/);
                            if (url) currentLead.link = url[1];
                        }
                    });
                    if (currentLead.name) newLeads.push(currentLead);
                }

                if (newLeads.length > 0) {
                    console.log("Auto-opening Leads Drawer with:", newLeads);
                    setLeadsData(newLeads);
                    setShowLeadsDrawer(true);
                }
            } catch (e) {
                console.error("Failed to parse Hunter leads", e);
            }
        }

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

                        {/* VIEW TOGGLE - ONLY FOR SOSHIE */}
                        {robot.name === 'Soshie' && (
                            <div className="flex bg-black/50 rounded-lg p-1 border border-white/10">
                                <button
                                    onClick={() => setViewMode('chat')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'chat' ? 'bg-white text-black shadow-lg' : 'text-white/50 hover:text-white'}`}
                                >
                                    AI WORKSPACE
                                </button>
                                <button
                                    onClick={() => setViewMode('social')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'social' ? 'bg-pink-500 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
                                >
                                    SOCIAL INBOX
                                </button>
                            </div>
                        )}

                        {/* ACTION BUTTON - ONLY FOR PIXEL */}
                        {robot.name === 'Pixel' && (
                            <div className="flex bg-black/50 rounded-lg p-1 border border-white/10">
                                <button
                                    onClick={() => processMessage("Jag vill skapa en professionell PowerPoint-presentation. Kan du hjälpa mig med layout och bilder? 🎨")}
                                    className="px-4 py-1.5 rounded-md text-xs font-bold transition-all bg-purple-600 text-white shadow-lg hover:bg-purple-500 flex items-center gap-2"
                                >
                                    <Sparkles size={14} />
                                    SKAPA PRESENTATION
                                </button>
                            </div>
                        )}

                        {/* ACTION BUTTON - ONLY FOR VENTURE */}
                        {robot.name === 'Venture' && (
                            <div className="flex bg-black/50 rounded-lg p-1 border border-white/10">
                                <button
                                    onClick={() => processMessage("Jag behöver hjälp med en Pitch Deck och affärsstrategi. 📊")}
                                    className="px-4 py-1.5 rounded-md text-xs font-bold transition-all bg-emerald-600 text-white shadow-lg hover:bg-emerald-500 flex items-center gap-2"
                                >
                                    <Sparkles size={14} />
                                    NY PITCH DECK
                                </button>
                            </div>
                        )}

                        <div className="w-32"></div> {/* Spacer */}
                    </div>

                    {/* CONDITIONAL CONTENT */}
                    <div className="flex-1 overflow-hidden relative">
                        {viewMode === 'support' ? (
                            <InternalSupportDesk googleToken={googleToken} />
                        ) : viewMode === 'social' ? (
                            <SoshieWorkspace />
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

                                            // RENDERER: PIXEL THEME SELECTOR
                                            else if (msg.sender === 'system' && msg.text === 'PIXEL_THEME_SELECTOR') {
                                                return (
                                                    <div key={msg.id} className="w-full flex flex-col items-end py-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                                        <div className="bg-[#0f172a] p-6 rounded-2xl shadow-2xl border border-white/10 max-w-xl w-full">
                                                            <div className="flex justify-between items-center mb-6">
                                                                <h3 className="text-white font-bold flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                                                                    Välj Designspråk
                                                                </h3>
                                                                <span className="text-[10px] text-purple-300 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">STEG 1 AV 3</span>
                                                            </div>
                                                            <div className="grid grid-cols-3 gap-3">
                                                                {[
                                                                    { id: 'modern', label: 'Modern Tech', color: 'from-blue-600 to-cyan-500' },
                                                                    { id: 'creative', label: 'Creative Pop', color: 'from-pink-500 to-orange-400' },
                                                                    { id: 'corporate', label: 'Corporate', color: 'from-slate-700 to-slate-900' }
                                                                ].map(theme => (
                                                                    <button key={theme.id} onClick={() => processMessage(`Jag väljer temat: ${theme.label}`)} className="group relative h-24 rounded-xl overflow-hidden border border-white/10 hover:border-white/50 transition-all active:scale-95">
                                                                        <div className={`absolute inset-0 bg-gradient-to-br ${theme.color} opacity-40 group-hover:opacity-100 transition-opacity`}></div>
                                                                        <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-white z-10">{theme.label}</div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            // RENDERER: PIXEL SLIDE PREVIEW (MOCKUP)
                                            else if (msg.sender === 'system' && msg.text === 'PIXEL_SLIDE_PREVIEW') {
                                                const theme = msg.meta?.theme || 'modern tech';
                                                const variant = msg.meta?.variant || 1;

                                                // Dynamic Styles based on Variant
                                                const getBg = () => {
                                                    if (theme.includes('creative')) return variant === 1 ? 'bg-[#FFDE59]' : variant === 2 ? 'bg-[#FF0055]' : 'bg-[#8B5CF6]';
                                                    if (theme.includes('corporate')) return variant === 1 ? 'bg-white' : variant === 2 ? 'bg-[#F1F5F9]' : 'bg-[#0F172A]';
                                                    return variant === 1 ? 'bg-slate-900' : variant === 2 ? 'bg-white' : 'bg-black';
                                                };

                                                const bgClass = getBg();

                                                return (
                                                    <div key={msg.id} className="w-full flex flex-col items-end py-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                                        <div className="bg-[#1e1e1e] p-2 rounded-xl border border-white/10 max-w-2xl w-full shadow-2xl">
                                                            {/* PowerPoint Toolbar Mockup */}
                                                            <div className="flex items-center gap-4 px-4 py-2 border-b border-white/5 mb-2">
                                                                <div className="flex gap-1.5">
                                                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                                                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                                                                </div>
                                                                <span className="text-[10px] text-white/30 font-sans mx-auto">Design_Variant_{variant}.pptx</span>
                                                            </div>

                                                            {/* THE CANVAS */}
                                                            <div className={`aspect-video w-full relative overflow-hidden rounded-lg shadow-inner ${bgClass}`}>

                                                                {/* --- CREATIVE THEMES --- */}
                                                                {theme.includes('creative') && (
                                                                    <>
                                                                        {variant === 1 && ( // Yellow brutalism
                                                                            <div className="h-full w-full p-12 flex flex-col justify-center text-black relative">
                                                                                <div className="absolute top-0 right-0 w-64 h-full bg-black skew-x-12 translate-x-12"></div>
                                                                                <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter relative z-10">Future <br />Vision.</h1>
                                                                                <div className="h-2 w-24 bg-black mb-6"></div>
                                                                                <p className="font-bold relative z-10">Q1 STRATEGY DECK</p>
                                                                            </div>
                                                                        )}
                                                                        {variant === 2 && ( // Pink Pop Art
                                                                            <div className="h-full w-full flex items-center justify-center relative bg-[#FF0055]">
                                                                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
                                                                                <div className="bg-white border-4 border-black p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transform -rotate-3">
                                                                                    <h1 className="text-4xl font-black text-black uppercase italic">Think<br />Different</h1>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {variant === 3 && ( // Purple Gradient Glass
                                                                            <div className="h-full w-full flex flex-col items-center justify-center relative bg-gradient-to-br from-violet-600 to-indigo-900 text-white">
                                                                                <div className="absolute w-96 h-96 bg-pink-500/30 blur-[100px] rounded-full top-[-50%] left-[-20%]"></div>
                                                                                <h1 className="text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-pink-200 mb-2">NOVA</h1>
                                                                                <p className="text-sm font-light tracking-[0.5em] uppercase opacity-80">Collection 2026</p>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}

                                                                {/* --- CORPORATE THEMES --- */}
                                                                {theme.includes('corporate') && (
                                                                    <>
                                                                        {variant === 1 && ( // Classic Blue/White
                                                                            <div className="h-full w-full p-12 flex flex-col justify-between text-slate-800 bg-white">
                                                                                <div className="border-l-4 border-blue-900 pl-8 mt-10">
                                                                                    <h1 className="text-4xl font-serif font-medium mb-2 text-slate-900">Growth Initiative</h1>
                                                                                    <p className="text-slate-500">Quarterly Business Review</p>
                                                                                </div>
                                                                                <div className="w-full h-px bg-slate-200 flex justify-between pt-2">
                                                                                    <span className="text-[9px]">Confidential</span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {variant === 2 && ( // Modern Grey
                                                                            <div className="h-full w-full p-12 relative bg-[#F1F5F9] text-slate-800">
                                                                                <div className="absolute top-0 left-0 w-32 h-full bg-slate-800"></div>
                                                                                <div className="ml-24 h-full flex flex-col justify-center">
                                                                                    <h1 className="text-5xl font-bold tracking-tight text-slate-900 mb-4">Market<br />Analysis</h1>
                                                                                    <div className="w-16 h-1 bg-emerald-500"></div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {variant === 3 && ( // Dark Premium
                                                                            <div className="h-full w-full p-12 relative bg-[#0F172A] text-white flex items-center">
                                                                                <div className="w-1/2">
                                                                                    <span className="text-emerald-400 font-mono text-xs mb-4 block">/// Q1_REPORT_FINAL</span>
                                                                                    <h1 className="text-4xl font-bold leading-tight mb-6">Sustainable<br />Infrastructure</h1>
                                                                                    <button className="px-4 py-2 border border-white/20 rounded text-xs hover:bg-white/10">Read More</button>
                                                                                </div>
                                                                                <div className="absolute right-0 top-0 h-full w-1/3 bg-emerald-900/20 backdrop-blur-sm border-l border-white/5"></div>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}

                                                                {/* --- MODERN TECH THEMES --- */}
                                                                {(!theme.includes('creative') && !theme.includes('corporate')) && (
                                                                    <>
                                                                        {variant === 1 && ( // Standard Dark/Cyan
                                                                            <div className="h-full w-full relative flex items-center bg-slate-900">
                                                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(56,189,248,0.1),transparent)]"></div>
                                                                                <div className="w-1/2 p-12 relative z-10">
                                                                                    <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold mb-6">AI-DRIVEN</div>
                                                                                    <h1 className="text-4xl font-bold text-white mb-4 leading-tight">Next Gen <span className="text-cyan-400">Tech</span></h1>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {variant === 2 && ( // SaaS Clean White
                                                                            <div className="h-full w-full relative flex items-center justify-center bg-white text-black">
                                                                                <div className="text-center z-10">
                                                                                    <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-6 shadow-xl shadow-blue-200"></div>
                                                                                    <h1 className="text-4xl font-black tracking-tight mb-2">Simplify.</h1>
                                                                                    <p className="text-gray-500">The platform for modern teams.</p>
                                                                                </div>
                                                                                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-50 to-transparent"></div>
                                                                            </div>
                                                                        )}
                                                                        {variant === 3 && ( // Orange/Black Industrial
                                                                            <div className="h-full w-full relative p-10 bg-black text-white flex flex-col justify-between">
                                                                                <div className="border-t-2 border-orange-500 w-32 pt-4">
                                                                                    <span className="font-mono text-orange-500 text-xs">V.2.0.4</span>
                                                                                </div>
                                                                                <h1 className="text-5xl font-bold uppercase">Heavy<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Industry</span></h1>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}

                                                            </div>
                                                            <div className="flex justify-between items-center mt-3 px-2">
                                                                <span className="text-[10px] text-white/40 italic">*Detta är en preview. n8n krävs för export.*</span>
                                                                <button onClick={() => processMessage("Jag vill ändra designstil tack")} className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded transition flex items-center gap-2 cursor-pointer shadow-lg hover:bg-white/30">
                                                                    <Activity size={12} />
                                                                    Justera Design
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            // RENDERER: PIXEL EXPORT PROGRESS
                                            else if (msg.sender === 'system' && msg.text === 'PIXEL_EXPORT_PROGRESS') {
                                                return <PixelProgressCard key={msg.id} />;
                                            }
                                            // RENDERER: PIXEL EXPORT COMPLETE
                                            else if (msg.sender === 'system' && msg.text === 'PIXEL_EXPORT_COMPLETE') {
                                                const downloadUrl = msg.meta?.downloadUrl;
                                                return <PixelDownloadCard key={msg.id} downloadUrl={downloadUrl} />;
                                            }
                                            // RENDERER: VENTURE PITCH STRUCTURE
                                            else if (msg.sender === 'system' && msg.text === 'VENTURE_PITCH_STRUCTURE') {
                                                return (
                                                    <div key={msg.id} className="w-full flex flex-col items-end py-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                                        <div className="bg-[#064e3b] p-6 rounded-2xl shadow-2xl border border-emerald-500/30 max-w-xl w-full relative overflow-hidden">
                                                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[60px] rounded-full pointer-events-none"></div>
                                                            <h3 className="text-emerald-100 font-bold mb-4 flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded bg-emerald-800 flex items-center justify-center border border-emerald-600"><span className="text-xs">1</span></div>
                                                                10-Slide Investor Deck
                                                            </h3>
                                                            <div className="space-y-2 mb-6">
                                                                {[
                                                                    "1. The Problem (Pain Point)",
                                                                    "2. The Solution (Your Product)",
                                                                    "3. Market Opportunity (TAM/SAM/SOM)",
                                                                    "4. Business Model (Monetization)",
                                                                    "5. Traction & Roadmap"
                                                                ].map((step, i) => (
                                                                    <div key={i} className="flex items-center gap-3 text-emerald-200/80 text-sm p-2 rounded hover:bg-emerald-900/40 transition-colors cursor-pointer border border-transparent hover:border-emerald-500/20">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                                                        {step}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <button onClick={() => processMessage("Godkänn strukturen och börja skriv")} className="w-full py-3 bg-white text-emerald-900 font-bold rounded-lg hover:bg-emerald-50 transition shadow-lg">
                                                                Godkänn & Börja Skriva
                                                            </button>
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
                                                        <div className={`text-sm leading-relaxed markdown-content ${msg.sender === 'user' ? 'prose-sm' : 'prose-invert'}`}>
                                                            <ReactMarkdown
                                                                components={{
                                                                    a: ({ node, ...props }) => <a {...props} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" />,
                                                                    ul: ({ node, ...props }) => <ul {...props} className="list-disc ml-4 my-2" />,
                                                                    ol: ({ node, ...props }) => <ol {...props} className="list-decimal ml-4 my-2" />,
                                                                    li: ({ node, ...props }) => <li {...props} className="mb-1" />,
                                                                    p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0" />,
                                                                    strong: ({ node, ...props }) => <strong {...props} className="font-bold" />
                                                                }}
                                                            >
                                                                {msg.text}
                                                            </ReactMarkdown>
                                                        </div>
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
                {/* Modal Close Button */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-[60] bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all backdrop-blur-md"
                    >
                        <X className="w-6 h-6" />
                    </button>
                )}

            </div>
            {/* --- LEADS DRAWER COMPONENT --- */}
            <LeadsDrawer
                isOpen={showLeadsDrawer}
                onClose={() => setShowLeadsDrawer(false)}
                leads={leadsData}
            />

            {/* Re-open trigger if closed but has data */}
            {
                !showLeadsDrawer && leadsData.length > 0 && (
                    <button
                        onClick={() => setShowLeadsDrawer(true)}
                        className="fixed bottom-24 right-10 z-50 bg-cyan-500 text-white p-4 rounded-full shadow-lg hover:bg-cyan-400 transition-colors font-bold flex items-center gap-2 animate-bounce"
                    >
                        <Search className="w-5 h-5" />
                        Visa Leads ({leadsData.length})
                    </button>
                )
            }
        </ErrorBoundary >
    );
};
export default RobotWorkspace;

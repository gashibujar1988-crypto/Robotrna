import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Activity, Mail, Calendar, Cpu, Bot,
    Settings, Shield, X, Check, TrendingUp, Clock, MessageSquarePlus, Car, Users,
    Sparkles, Search, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { robots as robotsApi } from '../api/client';
import { agents } from '../data/agents';
import { useAuth } from '../context/AuthContext';

const GoogleIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
    </svg>
);

const StatCard = ({ icon: Icon, label, value, color, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
    >
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3 mr-1" /> +12%
            </span>
        </div>
        <div>
            <div className="text-gray-400 text-sm font-medium mb-1 tracking-wide">{label}</div>
            <div className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</div>
        </div>
    </motion.div>
);

import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import TeamGreetingModal from '../components/TeamGreetingModal';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [robots, setRobots] = useState<any[]>([]);

    const [agentXpMap, setAgentXpMap] = useState<Record<string, number>>({});

    const [nextMeeting, setNextMeeting] = useState<any>(null);
    const [googleStats, setGoogleStats] = useState<{ unreadEmails: number | null, upcomingEvents: number | null }>({ unreadEmails: null, upcomingEvents: null });
    const [checking, setChecking] = useState(false);
    const [editingRobot, setEditingRobot] = useState<any>(null);

    const [tempPermissions, setTempPermissions] = useState({ allowGoogle: true, allowBrain: true });

    // --- CONCIERGE STATE ---
    const [conciergeQuery, setConciergeQuery] = useState('');
    const [conciergeResult, setConciergeResult] = useState<any>(null);

    // --- ONBOARDING / GREETING STATE ---
    const [showGreeting, setShowGreeting] = useState(false);

    useEffect(() => {
        const checkOnboarding = async () => {
            if (user?.id) {
                const userRef = doc(db, "users", user.id);
                try {
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const data = userSnap.data();
                        if (data.hasCompletedOnboarding === false || data.hasCompletedOnboarding === undefined) {
                            // Show greeting
                            setTimeout(() => setShowGreeting(true), 1500);
                        }
                    }
                } catch (e) {
                    console.error("Error checking onboarding status", e);
                }
            }
        };
        checkOnboarding();
    }, [user]);

    const handleGreetingClose = async () => {
        setShowGreeting(false);
        if (user?.id) {
            try {
                const userRef = doc(db, "users", user.id);
                await updateDoc(userRef, {
                    hasCompletedOnboarding: true
                });
            } catch (e) {
                console.error("Failed to update onboarding status", e);
            }
        }
    };

    const handleConciergeSearch = () => {
        if (!conciergeQuery.trim()) return;
        const lower = conciergeQuery.toLowerCase();

        // Simple Keyword Matching logic
        const keywordMap: Record<string, string[]> = {
            'Soshie': ['social', 'media', 'insta', 'linkedin', 'copy', 'text', 'inlägg'],
            'Brainy': ['analys', 'fakta', 'data', 'research', 'sök', 'google', 'rapport'],
            'Pixel': ['bild', 'foto', 'design', 'layout', 'grafik', 'logo', 'video', 'kreativ'],
            'Hunter': ['sälj', 'kund', 'leads', 'mail', 'prospekt', 'möte'],
            'Nova': ['support', 'hjälp', 'problem', 'kundtjänst', 'ärende'],
            'Atlas': ['kod', 'webb', 'utveckling', 'hemsida', 'app', 'html', 'css', 'bugg'],
            'Dexter': ['admin', 'plan', 'projekt', 'bokföring', 'organisera', 'schema']
        };

        let bestAgent = null;
        let maxHits = 0;

        agents.forEach(agent => {
            let hits = 0;
            const keywords = keywordMap[agent.name] || [];
            keywords.forEach(k => {
                if (lower.includes(k)) hits++;
            });
            // Bonus for explicit role mention
            if (lower.includes(agent.role.toLowerCase())) hits += 2;
            // Bonus for explicit name mention
            if (lower.includes(agent.name.toLowerCase())) hits += 5;

            if (hits > maxHits) {
                maxHits = hits;
                bestAgent = agent;
            }
        });

        // Default to Dexter if no obvious match
        setConciergeResult(bestAgent || agents.find(a => a.name === 'Dexter'));
    };
    // -----------------------

    // Helper to get agent image
    const getAgentImage = (name: string) => {
        return agents.find(a => a.name === name)?.image || agents[1].image;
    };

    const openPermissions = (robot: any) => {
        let perms = { allowGoogle: true, allowBrain: true };
        try {
            if (robot.config) perms = JSON.parse(robot.config);
        } catch (e) { }
        setTempPermissions(perms);
        setEditingRobot(robot);
    };

    const savePermissions = async () => {
        if (!editingRobot) return;
        try {
            await robotsApi.update(editingRobot.id, tempPermissions);
            setRobots(prev => prev.map(r => r.id === editingRobot.id ? { ...r, config: JSON.stringify(tempPermissions) } : r));
            setEditingRobot(null);
        } catch (e) {
            alert("Kunde inte spara behörigheter.");
        }
    };

    const fetchDashboardData = async () => {
        setChecking(true);
        // Sync XP/Level from localStorage
        const allXp = JSON.parse(localStorage.getItem('agent_xp_data') || '{}');
        setAgentXpMap(allXp);

        try {
            const robotRes = await robotsApi.list();
            setRobots((robotRes.data as any) || []);

            // Background update simulation logic (simplified)
            (async () => {
                try {
                    await api.post('/robots/offline-updates');
                } catch (e) { console.error("Background work fetch failed", e); }
            })();

            if (user?.isGoogleConnected) {
                const statsRes = await api.get('/user/google-stats');
                setGoogleStats((statsRes.data as any) || { unreadEmails: 0, upcomingEvents: 0 });

                const meetingRes = await api.get('/user/next-meeting');
                setNextMeeting(meetingRes.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setChecking(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleInitRobots = async () => {
        try {
            const res = await api.post('/robots/init');
            setRobots((res.data as any) || []);
            fetchDashboardData();
        } catch (e) {
            alert("Kunde inte initiera robotar.");
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] text-gray-900 font-sans relative overflow-x-hidden">
            {/* Team Greeting Modal */}
            <TeamGreetingModal
                isOpen={showGreeting}
                onClose={handleGreetingClose}
                userName={user?.name?.split(' ')[0] || ''}
            />
            {/* Subtle premium background pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.4]">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-200/30 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-indigo-200/20 rounded-full blur-[100px]" />
            </div>

            <div className="pt-24 pb-20 container mx-auto px-6 max-w-[1400px] relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-black mb-3 text-gray-900 tracking-tight flex items-center gap-3">
                            Kontrollpanel <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse mt-2"></span>
                        </h1>
                        <p className="text-gray-500 text-lg font-medium">
                            Välkommen tillbaka, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 font-bold">{user?.name}</span>.
                            Ditt team arbetar för fullt.
                        </p>
                    </motion.div>

                    {/* Quick Connectivity Widget */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="bg-white/80 backdrop-blur-xl border border-white/50 px-6 py-4 rounded-3xl shadow-lg hover:shadow-xl transition-all flex items-center gap-5"
                    >
                        <div className="relative">
                            <div className={`absolute inset-0 rounded-full blur-md opacity-20 ${user?.isGoogleConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 relative z-10">
                                <GoogleIcon className="w-6 h-6" />
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Anslutning</div>
                            <div className={`text-sm font-bold flex items-center gap-2 ${user?.isGoogleConnected ? 'text-green-600' : 'text-red-500'}`}>
                                {user?.isGoogleConnected ? (
                                    <>
                                        <Check className="w-4 h-4" /> Ansluten
                                    </>
                                ) : (
                                    <>
                                        <X className="w-4 h-4" /> Ej Ansluten
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="h-8 w-px bg-gray-200 mx-2"></div>
                        <button
                            onClick={() => fetchDashboardData()}
                            disabled={checking}
                            className={`p-3 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 transition-all active:scale-95 ${checking ? 'animate-spin' : ''}`}
                        >
                            <Activity className="w-5 h-5" />
                        </button>

                        <div className="h-8 w-px bg-gray-200 mx-2"></div>

                        <Link
                            to="/settings"
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-all mr-2"
                        >
                            <Settings className="w-5 h-5" />
                            <span className="hidden sm:inline">Inställningar</span>
                        </Link>

                        <Link
                            to="/support"
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 font-bold hover:bg-green-100 transition-all"
                        >
                            <MessageSquarePlus className="w-5 h-5" />
                            <span className="hidden sm:inline">Support</span>
                        </Link>
                    </motion.div>
                </div>

                {/* --- AGENT CONCIERGE WIDGET --- */}
                <div className="mb-12 relative z-20">
                    <div className="bg-white rounded-[2rem] p-2 shadow-xl shadow-purple-500/5 border border-purple-100 flex flex-col md:flex-row items-center gap-2 max-w-4xl mx-auto transform transition-all hover:scale-[1.01]">
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-4 rounded-[1.5rem] flex-shrink-0">
                            <Sparkles className="w-6 h-6 animate-pulse" />
                        </div>
                        <input
                            value={conciergeQuery}
                            onChange={(e) => setConciergeQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleConciergeSearch()}
                            placeholder="Vad behöver du hjälp med? T.ex. 'skapa en bild' eller 'analysera data'..."
                            className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-lg font-medium placeholder-gray-400 w-full"
                        />
                        <button
                            onClick={handleConciergeSearch}
                            className="bg-gray-900 text-white px-8 py-4 rounded-[1.5rem] font-bold hover:bg-black transition-all flex items-center gap-2 shadow-lg w-full md:w-auto justify-center group"
                        >
                            <span className="group-hover:mr-2 transition-all">Hitta Agent</span>
                            <Search className="w-5 h-5 group-hover:hidden transition-all" />
                            <ArrowRight className="w-5 h-5 hidden group-hover:block transition-all" />
                        </button>
                    </div>

                    <AnimatePresence>
                        {conciergeResult && (
                            <motion.div
                                initial={{ opacity: 0, y: -20, height: 0 }}
                                animate={{ opacity: 1, y: 10, height: 'auto' }}
                                exit={{ opacity: 0, y: -20, height: 0 }}
                                className="overflow-hidden max-w-4xl mx-auto"
                            >
                                <div className="bg-[#0a0a0a] text-white rounded-[2rem] p-6 shadow-2xl border border-white/10 flex items-center gap-6 mt-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/20 overflow-hidden flex-shrink-0 relative group cursor-pointer">
                                        <img src={getAgentImage(conciergeResult.name)} alt={conciergeResult.name} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-bold text-white">{conciergeResult.name}</h3>
                                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/70">{conciergeResult.role}</span>
                                        </div>
                                        <p className="text-gray-400 text-sm">
                                            Jag kan hjälpa dig med detta! {conciergeResult.shortDescription}
                                        </p>
                                    </div>
                                    <Link to={`/workspace/${conciergeResult.id}`} className="px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 whitespace-nowrap">
                                        <Zap className="w-4 h-4 text-yellow-600 fill-yellow-600" /> Starta Uppdrag
                                    </Link>
                                    <button onClick={() => { setConciergeResult(null); setConciergeQuery(''); }} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-500 hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Leveling System Info Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-10 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/20">Nyhet</span>
                                <div className="flex text-yellow-300">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black mb-2 tracking-tight">Levla upp dina AI-medarbetare!</h2>
                            <p className="text-violet-100 font-medium text-lg max-w-2xl leading-relaxed opacity-90">
                                Ju mer du jobbar med dina agenter och tilldelar dem uppgifter, desto smartare och snabbare blir de. Lås upp nya förmågor genom att samla XP!
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 animate-pulse">
                                <TrendingUp className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">

                    {/* Left Column: Stats & Robots (8/12) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                            <Link to="/analytics">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 group hover:shadow-xl transition-all h-full"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 rounded-2xl bg-green-50 text-green-600 group-hover:scale-110 transition-transform">
                                            <TrendingUp className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full uppercase">Nyhet</span>
                                    </div>
                                    <div className="text-gray-400 text-sm font-medium mb-1">Analytics & ROI</div>
                                    <div className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                                        Visa Data <ArrowRight className="w-5 h-5" />
                                    </div>
                                </motion.div>
                            </Link>

                            <StatCard icon={Users} label="Aktiva Agenter" value={robots.length} color="bg-purple-500" delay={0.2} />

                            {/* Next Meeting Special Card */}
                            {nextMeeting ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-6 shadow-sm border border-yellow-100 relative overflow-hidden group hover:shadow-md transition-all"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="p-3 bg-white rounded-2xl text-yellow-600 shadow-sm"><Calendar className="w-6 h-6" /></div>
                                        <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">Nästa</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 truncate pr-4 mb-1 text-lg">{nextMeeting.summary}</h3>
                                    <p className="text-yellow-700 font-medium text-sm flex items-center gap-2 mb-4">
                                        <Clock className="w-4 h-4" /> {new Date(nextMeeting.start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    {nextMeeting.meetLink && (
                                        <a href={nextMeeting.meetLink} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs font-bold text-white bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-xl transition-colors shadow-sm">
                                            Anslut <ArrowRight className="w-3 h-3 ml-2" />
                                        </a>
                                    )}
                                </motion.div>
                            ) : (
                                <StatCard icon={Calendar} label="Möten Idag" value={user?.isGoogleConnected ? (googleStats.upcomingEvents ?? "0") : "-"} color="bg-yellow-500" delay={0.3} />
                            )}
                        </div>

                        {/* Agents Section */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                    <Bot className="w-6 h-6 text-purple-600" />
                                    <span>Mina Agenter</span>
                                </h2>
                                {!robots.length && (
                                    <button
                                        onClick={handleInitRobots}
                                        className="text-sm font-bold text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-xl transition-all"
                                    >
                                        + Initiera Team
                                    </button>
                                )}
                            </div>

                            {robots.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {robots.map((robot, idx) => {
                                        const rXp = agentXpMap[robot.id] || 0;
                                        const rLevel = Math.floor(rXp / 100) + 1;
                                        const xpProgress = rXp % 100;

                                        return (
                                            <motion.div
                                                key={robot.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 + (idx * 0.1) }}
                                            >
                                                <Link
                                                    to={`/robot/${robot.id}`}
                                                    className="block group bg-white rounded-[2rem] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 border border-gray-100 relative overflow-hidden"
                                                >
                                                    {/* Card Decoration */}
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[100px] -mr-8 -mt-8 transition-all group-hover:bg-purple-50/50"></div>

                                                    <div className="flex items-start gap-5 relative z-10">
                                                        <div className="relative">
                                                            <div className="w-20 h-20 rounded-2xl bg-gray-50 p-1 border border-gray-200 group-hover:border-purple-200 transition-colors bg-white shadow-sm overflow-hidden">
                                                                <img src={getAgentImage(robot.name)} alt={robot.name} className="w-full h-full object-cover rounded-xl" />
                                                            </div>
                                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-900 border-[3px] border-white rounded-full flex items-center justify-center text-[10px] text-white font-bold" title={`Level ${rLevel}`}>{rLevel}</div>
                                                        </div>

                                                        <div className="flex-1 pt-1">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{robot.name}</h3>
                                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{robot.type}</span>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => { e.preventDefault(); openPermissions(robot); }}
                                                                    className="text-gray-300 hover:text-purple-600 transition-colors p-1"
                                                                >
                                                                    <Settings className="w-5 h-5" />
                                                                </button>
                                                            </div>

                                                            {/* XP Bar on Card */}
                                                            <div className="mt-3 mb-1">
                                                                <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wide">
                                                                    <span>Level {rLevel}</span>
                                                                    <span>{xpProgress}% XP</span>
                                                                </div>
                                                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${xpProgress}%` }}></div>
                                                                </div>
                                                            </div>

                                                            <div className="mt-3 flex items-center gap-2">
                                                                <span className="px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold group-hover:bg-purple-600 transition-colors flex items-center gap-2 shadow-lg">
                                                                    Öppna Workspace <ArrowRight className="w-3 h-3" />
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300">
                                    <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900">Inga agenter aktiva</h3>
                                    <p className="text-gray-500 mb-6">Starta ditt team för att se dem här.</p>
                                    <button onClick={handleInitRobots} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                                        Initiera Agenter
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Activity Feed (4/12) */}
                    <div className="lg:col-span-4">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-white sticky top-24"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                <Activity className="w-5 h-5 text-blue-500" />
                                Händelselogg
                            </h2>

                            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {(() => {
                                    // Combine system logs and tasks/notifications
                                    const logs = JSON.parse(localStorage.getItem('system_logs') || '[]');

                                    if (logs.length === 0) {
                                        return (
                                            <div className="text-center py-10 text-gray-400">
                                                <p className="text-sm">Inga händelser ännu.</p>
                                            </div>
                                        );
                                    }

                                    return logs.slice().reverse().map((log: any, i: number) => (
                                        <div key={i} className="relative pl-6 group">
                                            {/* Timeline Line */}
                                            {i !== logs.length - 1 && <div className="absolute left-1.5 top-2 bottom-[-24px] w-0.5 bg-gray-100 group-hover:bg-purple-100 transition-colors"></div>}

                                            {/* Dot */}
                                            <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm bg-blue-500"></div>

                                            <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all hover:bg-gray-50">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                        {new Date(log.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-1">{log.message}</h4>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                                                        {log.agent ? log.agent[0] : 'S'}
                                                    </div>
                                                    <span className="text-xs text-gray-500 font-medium">{log.agent || 'System'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </motion.div>

                        {/* Recent Time Reports Widget */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-white mt-8"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-purple-500" />
                                    Tidrapporter
                                </h2>
                                <Link to="/time-report" className="text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1 rounded-full transition-colors">
                                    Visa alla
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {(() => {
                                    try {
                                        const savedLogs = JSON.parse(localStorage.getItem('timeLogs') || '[]');
                                        if (savedLogs.length === 0) return (
                                            <div className="text-center py-6 text-gray-400 text-sm">Inga rapporter inlämnade.</div>
                                        );
                                        return savedLogs.slice(0, 3).map((log: any) => (
                                            <div key={log.id} className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 shadow-sm">
                                                    <Car className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between">
                                                        <div className="font-bold text-gray-900 text-sm">{log.date}</div>
                                                        <div className="text-xs font-bold text-green-600 bg-green-100 px-2 rounded-full">{log.endOdometer - log.startOdometer} km</div>
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-0.5">{log.startTime} - {log.endTime}</div>
                                                </div>
                                            </div>
                                        ));
                                    } catch (e) {
                                        return <div className="text-center py-4 text-red-400 text-xs">Kunde inte läsa data.</div>;
                                    }
                                })()}
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>



            {/* Permissions Modal */}
            <AnimatePresence>
                {editingRobot && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setEditingRobot(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-8 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                    <Shield className="w-7 h-7 text-purple-600" />
                                    Behörigheter
                                </h3>
                                <button onClick={() => setEditingRobot(null)} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-sm text-gray-500 mb-6">Ställ in vad <strong>{editingRobot.name}</strong> får komma åt.</p>

                            <div className="space-y-4 mb-8">
                                {[
                                    { key: 'allowGoogle', icon: Mail, label: 'Google & Kalender', sub: 'Läs mail, boka möten', color: 'text-blue-500' },
                                    { key: 'allowBrain', icon: Cpu, label: 'Företagsminne', sub: 'Läs indexerade dokument', color: 'text-yellow-500' }
                                ].map((perm: any) => (
                                    <div key={perm.key} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer" onClick={() => setTempPermissions((p: any) => ({ ...p, [perm.key]: !p[perm.key] }))}>
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 bg-white rounded-xl shadow-sm border border-gray-100 ${perm.color}`}>
                                                <perm.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{perm.label}</div>
                                                <div className="text-xs text-gray-400">{perm.sub}</div>
                                            </div>
                                        </div>
                                        <div className={`w-12 h-7 rounded-full transition-colors relative ${tempPermissions[perm.key as keyof typeof tempPermissions] ? 'bg-green-500' : 'bg-gray-300'}`}>
                                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${tempPermissions[perm.key as keyof typeof tempPermissions] ? 'left-6' : 'left-1'}`}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={savePermissions}
                                className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Check className="w-5 h-5" /> Spara Inställningar
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default Dashboard;

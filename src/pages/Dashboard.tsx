import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Activity, Calendar, Bot,
    Settings, X, Check, TrendingUp, MessageSquarePlus, Users, Clock,
    Sparkles, Search, Zap, Bell, Network
} from 'lucide-react';
import SystemStatusPanel from '../components/SystemStatusPanel';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { agents } from '../data/agents';
import { useAuth } from '../context/AuthContext';
import { getToken } from 'firebase/messaging';
import { messaging } from '../firebase';
import RobotWorkspace from './RobotWorkspace';

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
        className="relative bg-white dark:bg-gray-800/80 rounded-3xl p-6 shadow-[0_4px_30px_-4px_rgba(0,0,0,0.08)] border border-gray-100/50 dark:border-gray-700/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group overflow-hidden card-shine"
    >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3.5 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20 text-${color.split('-')[1]}-600 dark:text-${color.split('-')[1]}-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-${color.split('-')[1]}-500/10`}>
                    <Icon className="w-6 h-6" />
                </div>
                <motion.span
                    className="flex items-center text-xs font-bold text-green-500 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-3 py-1.5 rounded-full backdrop-blur-sm"
                    whileHover={{ scale: 1.05 }}
                >
                    <TrendingUp className="w-3 h-3 mr-1" /> +12%
                </motion.span>
            </div>
            <div>
                <div className="text-gray-400 text-sm font-medium mb-1.5 tracking-wide uppercase">{label}</div>
                <div className="text-4xl font-black text-gray-900 dark:text-white tracking-tight bg-clip-text">{value}</div>
            </div>
        </div>
    </motion.div>
);

import { db, functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { doc, getDoc, updateDoc, collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import TeamGreetingModal from '../components/TeamGreetingModal';
import BrainFeed from '../components/BrainFeed';
import LiveLog from '../components/LiveLog';
import SocialDraftWidget from '../components/SocialDraftWidget';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const commandInputRef = React.useRef<HTMLInputElement>(null); // Ref for focus

    // DRAFT STATE
    const [draftPost, setDraftPost] = useState<{ platform: string, content: string } | null>(null);

    // Draft Listener
    useEffect(() => {
        const handleDraft = (e: CustomEvent) => {
            console.log("Draft received!", e.detail);
            setDraftPost(e.detail);
        };
        window.addEventListener('draft-received', handleDraft as EventListener);
        return () => window.removeEventListener('draft-received', handleDraft as EventListener);
    }, []);

    const handleApproveDraft = async (content: string) => {
        setDraftPost(null); // Clear draft
        try {
            // Send APPROVAL command back to Mother
            await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `ACTION: linkedin_post INPUT: ${content}`,
                    agent_name: "Soshie"
                })
            });
            alert("Soshie publicerar nu inlägget!");
        } catch (e) {
            console.error(e);
            alert("Fel vid publicering.");
        }
    };

    // Notification Permission Logic
    const requestNotificationPermission = async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const token = await getToken(messaging, { vapidKey: "BEFilSa3kmybsvjtkaywz2uVjpDNKajwMAxLdpau-lP3LFz6hW1ykiWbOJ63z2ptWR0xtBkwrMgZxdhwMZI-Vx0" }).catch(e => {
                    console.warn("VAPID key missing or invalid.", e);
                    return null;
                });

                if (token && user?.id) {
                    await updateDoc(doc(db, "users", user.id), { fcmToken: token });
                    alert("Push-notiser aktiverade! Mother kan nu nå dig.");
                }
            } else {
                alert("Du nekade notiser.");
            }
        } catch (error) {
            console.error("Error asking permission", error);
        }
    };

    const [nextMeeting, setNextMeeting] = useState<any>(null);
    const [googleStats, setGoogleStats] = useState<{ unreadEmails: number | null, upcomingEvents: number | null }>({ unreadEmails: null, upcomingEvents: null });
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [checking, setChecking] = useState(false);

    // --- CONCIERGE STATE ---
    const [conciergeQuery, setConciergeQuery] = useState('');
    const [conciergeResult, setConciergeResult] = useState<any>(null);

    // --- ONBOARDING / GREETING STATE ---
    const [showGreeting, setShowGreeting] = useState(false);

    // --- ACTIVE MISSION STATE ---
    const [activeMissionId, setActiveMissionId] = useState<string | null>(null);

    // FIX: Scroll & Focus function
    const scrollToCommandCenter = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            if (commandInputRef.current) {
                commandInputRef.current.focus();
            }
        }, 600);
    };

    useEffect(() => {
        // Listen for the most recent ACTIVE discussion (not completed ones)
        try {
            const q = query(
                collection(db, "task_discussions"),
                where("consensus_reached", "==", false),
                orderBy("created_at", "desc"),
                limit(1)
            );

            const unsub = onSnapshot(q, (snapshot) => {
                if (!snapshot.empty) {
                    const latest = snapshot.docs[0];
                    setActiveMissionId(latest.id);
                }
            });
            return () => unsub();
        } catch (e) { console.log("Firestore query error", e); }
    }, []);

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
            } catch (e) { console.error(e); }
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

    const fetchDashboardData = async () => {
        setChecking(true);
        try {
            // Background update simulation
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

    // --- MISSION CONTROL STATE ---
    const [missionPrompt, setMissionPrompt] = useState('');
    const [isLaunching, setIsLaunching] = useState(false);

    const handleLaunchMission = async () => {
        if (!missionPrompt.trim()) return;
        setIsLaunching(true);
        try {
            // Call Python Backend directly
            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `MISSION_START: ${missionPrompt}` })
            });
            const data = await response.json();

            // For now, we just clear the prompt and maybe show a success status
            // The LiveLog will show the actual activity
            setMissionPrompt('');
            // setActiveMissionId(res.data.result.task_id); // Future: Get ID from Python

        } catch (e: any) {
            console.error("Mission launch failed", e);
            alert(`Could not connect to Mother Brain: ${e.message}`);
        } finally {
            setIsLaunching(false);
        }
    };

    // Define the full Hive Mind Squad for display
    const hiveMindSquad = ["Hunter", "Soshie", "Pixel", "Ledger", "Atlas", "Dexter", "Brainy", "Venture", "Nova"];

    return (
        <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#0F1623] text-gray-900 dark:text-gray-100 font-sans relative overflow-x-hidden transition-colors duration-300">
            {/* Team Greeting Modal */}
            <TeamGreetingModal
                isOpen={showGreeting}
                onClose={handleGreetingClose}
                userName={user?.name?.split(' ')[0] || ''}
            />
            {/* Subtle premium background pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.4]">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-200/30 dark:bg-purple-900/10 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-[100px]" />
            </div>

            <div className="pt-24 pb-20 container mx-auto px-4 md:px-6 max-w-[1400px] relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-3xl md:text-5xl font-black mb-3 text-gray-900 dark:text-white tracking-tight flex items-center gap-3 break-words">
                            Kontrollpanel <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse mt-2 flex-shrink-0"></span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                            Välkommen tillbaka, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 font-bold">{user?.name}</span>.
                            Ditt team arbetar för fullt.
                        </p>
                    </motion.div>

                    {/* Quick Connectivity Widget */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative z-[60] flex items-center gap-2 flex-wrap pointer-events-auto"
                    >
                        <div className="relative">
                            <div className={`absolute inset-0 rounded-full blur-md opacity-20 ${user?.isGoogleConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-600 relative z-10">
                                <GoogleIcon className="w-5 h-5" />
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Anslutning</div>
                            <div className={`text-sm font-bold flex items-center gap-2 ${user?.isGoogleConnected ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                {user?.isGoogleConnected ? (
                                    <>
                                        <Check className="w-4 h-4" /> Ansluten
                                    </>
                                ) : (
                                    <>
                                        <X className="w-3 h-3" /> Ej Ansluten
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
                        <button
                            onClick={() => fetchDashboardData()}
                            disabled={checking}
                            className={`p-2 rounded-full bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-300 transition-all active:scale-95 ${checking ? 'animate-spin' : ''}`}
                        >
                            <Activity className="w-4 h-4" />
                        </button>

                        <div className="h-8 w-px bg-gray-200 mx-2"></div>

                        <button
                            onClick={requestNotificationPermission}
                            className="relative z-20 cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all hover:scale-105 active:scale-95 text-sm"
                        >
                            <Bell className="w-4 h-4" />
                            <span className="hidden lg:inline">Notiser</span>
                        </button>

                        <Link
                            to="/settings"
                            className="relative z-20 cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all hover:scale-105 active:scale-95 text-sm"
                        >
                            <Settings className="w-4 h-4" />
                            <span className="hidden lg:inline">Inställningar</span>
                        </Link>

                        <Link
                            to="/support"
                            className="relative z-20 cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-bold hover:bg-green-100 dark:hover:bg-green-900/50 transition-all hover:scale-105 active:scale-95 text-sm"
                        >
                            <MessageSquarePlus className="w-4 h-4" />
                            <span className="hidden lg:inline">Support</span>
                        </Link>


                    </motion.div>
                </div>

                {/* --- LIVE BRAIN CONSOLE (Python Backend Monitor) --- */}
                <div className="mb-12 relative z-50">
                    <LiveLog />
                </div>

                {/* --- MOTHER HIVE COMMAND CENTER (Mission Launchpad) --- */}
                {!activeMissionId && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-12 relative z-20"
                    >
                        <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white rounded-[2.5rem] p-10 shadow-2xl border border-white/10 overflow-hidden">
                            {/* Animated background elements */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-[120px] -mr-32 -mt-32 animate-pulse-slow"></div>
                                <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/15 rounded-full blur-[100px] -ml-20 -mb-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-violet-500/10 rounded-full animate-spin-slow"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-cyan-500/5 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
                            </div>

                            {/* Shimmer overlay */}
                            <div className="absolute inset-0 animate-shimmer pointer-events-none"></div>

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <div className="flex items-center gap-4 mb-3">
                                            <motion.div
                                                className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-500/40 relative"
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                transition={{ type: "spring", stiffness: 400 }}
                                            >
                                                <Bot className="w-7 h-7 text-white" />
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 status-indicator"></div>
                                            </motion.div>
                                            <div>
                                                <h2 className="text-3xl font-black tracking-tight">Mother Hive Command</h2>
                                                <p className="text-violet-300/80 text-sm font-medium">AI Orchestration System</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden md:flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/10">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-xs font-bold text-green-400">SYSTEM ONLINE</span>
                                    </div>
                                </div>

                                <p className="text-gray-400 mb-8 max-w-2xl text-lg leading-relaxed">
                                    Starta en komplex mission. <span className="text-violet-300">High Council</span> (Architect, Critic, Synthesizer) koordinerar det optimala agentteamet för din förfrågan.
                                </p>

                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                                        <input
                                            ref={commandInputRef}
                                            value={missionPrompt}
                                            onChange={(e) => setMissionPrompt(e.target.value)}
                                            placeholder="Beskriv din mission (t.ex. 'Analysera EcoTech-trender och skapa LinkedIn-kampanj')..."
                                            className="relative w-full bg-gray-800/80 border border-white/20 rounded-2xl px-6 py-5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:bg-gray-800 transition-all text-lg"
                                            onKeyDown={(e) => e.key === 'Enter' && handleLaunchMission()}
                                        />
                                    </div>
                                    <motion.button
                                        onClick={handleLaunchMission}
                                        disabled={isLaunching || !missionPrompt.trim()}
                                        className={`px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl flex items-center gap-3 transition-all relative overflow-hidden ${isLaunching ? 'bg-gray-700 cursor-wait' : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500'}`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                        <span className="relative z-10 flex items-center gap-2">
                                            {isLaunching ? (
                                                <>Initierar <Activity className="w-5 h-5 animate-spin" /></>
                                            ) : (
                                                <>Starta Mission <Zap className="w-6 h-6 fill-current" /></>
                                            )}
                                        </span>
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- AGENT CONCIERGE WIDGET --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-12 relative z-20"
                >
                    <div className="relative bg-white dark:bg-gray-800/90 rounded-[2.5rem] p-2 shadow-2xl shadow-purple-500/10 border border-purple-100/50 dark:border-purple-900/30 flex flex-col md:flex-row items-center gap-2 max-w-4xl mx-auto transform transition-all hover:shadow-purple-500/20 hover:scale-[1.005] duration-500 backdrop-blur-xl">
                        {/* Gradient border effect */}
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 rounded-[2.5rem] -z-10 animate-gradient-x"></div>

                        <motion.div
                            className="bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 text-white p-5 rounded-[2rem] flex-shrink-0 shadow-lg shadow-purple-500/30"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            <Sparkles className="w-7 h-7 animate-pulse" />
                        </motion.div>
                        <input
                            value={conciergeQuery}
                            onChange={(e) => setConciergeQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleConciergeSearch()}
                            placeholder="Vad behöver du hjälp med? T.ex. 'skapa en bild' eller 'analysera data'..."
                            className="flex-1 bg-transparent border-none outline-none px-5 py-4 text-lg font-medium placeholder-gray-400 text-gray-900 dark:text-white w-full"
                        />
                        <motion.button
                            onClick={handleConciergeSearch}
                            className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-10 py-5 rounded-[2rem] font-bold hover:from-black hover:to-gray-900 transition-all flex items-center gap-3 shadow-xl w-full md:w-auto justify-center group relative overflow-hidden"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <span className="relative z-10 group-hover:mr-1 transition-all">Hitta Agent</span>
                            <Search className="w-5 h-5 relative z-10 group-hover:scale-0 transition-all absolute right-10" />
                            <ArrowRight className="w-5 h-5 relative z-10 scale-0 group-hover:scale-100 transition-all" />
                        </motion.button>
                    </div>

                    <AnimatePresence>
                        {conciergeResult && (
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 10, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="overflow-hidden max-w-4xl mx-auto"
                            >
                                <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white rounded-[2.5rem] p-8 shadow-2xl border border-white/10 flex flex-col md:flex-row items-center gap-6 mt-4 overflow-hidden">
                                    {/* Glow effect */}
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/20 rounded-full blur-[60px] pointer-events-none"></div>

                                    <motion.div
                                        className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-violet-500/30 overflow-hidden flex-shrink-0 relative shadow-xl shadow-violet-500/20"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                    >
                                        <img src={getAgentImage(conciergeResult.name)} alt={conciergeResult.name} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-violet-500/20 to-transparent"></div>
                                    </motion.div>
                                    <div className="flex-1 text-center md:text-left">
                                        <div className="flex flex-col md:flex-row items-center md:items-start gap-2 mb-2">
                                            <h3 className="text-2xl font-black text-white">{conciergeResult.name}</h3>
                                            <span className="text-xs bg-violet-500/20 border border-violet-500/30 px-3 py-1 rounded-full text-violet-300 font-semibold">{conciergeResult.role}</span>
                                        </div>
                                        <p className="text-gray-400 text-base">
                                            Jag kan hjälpa dig med detta! {conciergeResult.shortDescription}
                                        </p>
                                    </div>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Link to={`/workspace/${conciergeResult.id}`} className="px-8 py-4 rounded-2xl bg-gradient-to-r from-white to-gray-100 text-black font-bold hover:from-gray-100 hover:to-white transition-all flex items-center gap-3 whitespace-nowrap shadow-xl">
                                            <Zap className="w-5 h-5 text-yellow-600 fill-yellow-600" /> Starta Uppdrag
                                        </Link>
                                    </motion.div>
                                    <button onClick={() => { setConciergeResult(null); setConciergeQuery(''); }} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-gray-500 hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* --- BRAIN FEED (Active Council Session) --- */}
                <AnimatePresence>
                    {activeMissionId && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="mb-12 relative z-20"
                        >
                            <BrainFeed taskId={activeMissionId} onReset={() => setActiveMissionId(null)} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Leveling System Info Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="mb-12 relative"
                >
                    <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-[2.5rem] p-10 text-white overflow-hidden shadow-2xl shadow-violet-500/25">
                        {/* Animated background elements */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>
                            <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-400/10 rounded-full blur-[60px] -ml-10 -mb-10"></div>
                            <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-yellow-400 rounded-full animate-subtle-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-cyan-400 rounded-full animate-subtle-bounce" style={{ animationDelay: '0.5s' }}></div>
                            <div className="absolute bottom-1/3 right-1/5 w-2 h-2 bg-white rounded-full animate-subtle-bounce" style={{ animationDelay: '1s' }}></div>
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <motion.span
                                        className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md border border-white/30"
                                        animate={{ scale: [1, 1.02, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        ✨ Nyhet
                                    </motion.span>
                                    <div className="flex text-yellow-300 gap-1">
                                        {[...Array(3)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{ y: [0, -3, 0] }}
                                                transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity, repeatDelay: 2 }}
                                            >
                                                <TrendingUp className="w-4 h-4" />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">Levla upp dina AI-medarbetare!</h2>
                                <p className="text-violet-100 font-medium text-lg max-w-2xl leading-relaxed">
                                    Ju mer du jobbar med dina agenter och tilldelar dem uppgifter, desto smartare och snabbare blir de. <span className="text-yellow-300 font-bold">Lås upp nya förmågor</span> genom att samla XP!
                                </p>
                            </div>
                            <motion.div
                                className="hidden md:flex items-center justify-center"
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-2xl relative">
                                    <TrendingUp className="w-12 h-12 text-white" />
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-xl flex items-center justify-center text-black font-black text-sm shadow-lg">
                                        XP
                                    </div>
                                </div>
                            </motion.div>
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
                                    className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 group hover:shadow-xl transition-all h-full"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 rounded-2xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                                            <TrendingUp className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-full uppercase">Nyhet</span>
                                    </div>
                                    <div className="text-gray-400 text-sm font-medium mb-1">Analytics & ROI</div>
                                    <div className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                                        Visa Data <ArrowRight className="w-5 h-5" />
                                    </div>
                                </motion.div>
                            </Link>

                            <StatCard icon={Users} label="Totala Agenter" value={hiveMindSquad.length} color="bg-purple-500" delay={0.2} />

                            {/* Next Meeting Special Card */}
                            {nextMeeting ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-3xl p-6 shadow-sm border border-yellow-100 dark:border-yellow-900/30 relative overflow-hidden group hover:shadow-md transition-all"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl text-yellow-600 dark:text-yellow-400 shadow-sm"><Calendar className="w-6 h-6" /></div>
                                        <span className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">Nästa</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white truncate pr-4 mb-1 text-lg">{nextMeeting.summary}</h3>
                                    <p className="text-yellow-700 dark:text-yellow-400 font-medium text-sm flex items-center gap-2 mb-4">
                                        <Clock className="w-4 h-4" /> {new Date(nextMeeting.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                    >
                                        <Bot className="w-6 h-6 text-white" />
                                    </motion.div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Mina Agenter</h2>
                                        <p className="text-gray-400 text-sm">9 AI-medarbetare redo att hjälpa dig</p>
                                    </div>
                                </div>
                                {!activeMissionId && (
                                    <motion.button
                                        onClick={scrollToCommandCenter}
                                        className="text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 px-6 py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Zap className="w-4 h-4" /> Starta Uppdrag
                                    </motion.button>
                                )}
                            </div>

                            {/* ALWAYS SHOW HIVE MIND SQUAD */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {hiveMindSquad.map((agentName, idx) => {
                                    const isActive = activeMissionId !== null;
                                    const agentInfo = agents.find(a => a.name === agentName) || agents[0]; // Fallback info

                                    return (
                                        <motion.div
                                            key={agentName}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.06, duration: 0.5 }}
                                            className={`relative rounded-[2rem] transition-all duration-500 hover-lift card-shine
                                                ${isActive
                                                    ? "bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10 border-2 border-violet-500/40 shadow-2xl shadow-violet-500/20"
                                                    : "bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700/50 hover:border-violet-500/30 shadow-xl"
                                                }`}
                                            whileHover={{ y: -4 }}
                                        >
                                            {/* Gradient border effect on hover */}
                                            <div className="absolute -inset-[1px] bg-gradient-to-r from-violet-500/0 via-cyan-500/0 to-purple-500/0 rounded-[2rem] opacity-0 hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm"></div>

                                            <div onClick={() => setSelectedAgentId(agentInfo.id)} className="block h-full cursor-pointer relative z-10 outline-none focus:ring-2 focus:ring-violet-500 rounded-[1.8rem] p-1">
                                                <div className="bg-white dark:bg-gray-800 rounded-[1.6rem] p-6 h-full flex flex-col relative overflow-hidden group">
                                                    {/* Decorative glow */}
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-violet-500/10 transition-all duration-500 pointer-events-none"></div>

                                                    <div className="absolute top-3 right-3 flex gap-2">
                                                        {isActive && (
                                                            <motion.span
                                                                className="bg-green-500/20 text-green-400 text-[10px] font-bold px-3 py-1.5 rounded-full border border-green-500/30 flex items-center gap-1.5"
                                                                animate={{ scale: [1, 1.05, 1] }}
                                                                transition={{ duration: 2, repeat: Infinity }}
                                                            >
                                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> LIVE
                                                            </motion.span>
                                                        )}
                                                    </div>
                                                    <div className="w-full flex flex-col items-center relative z-10">

                                                        {/* Agent Info & Image */}
                                                        <div className="flex flex-col items-center z-20 rounded-2xl p-2">
                                                            <motion.div
                                                                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden shadow-xl mb-4 relative border-2 border-white dark:border-gray-600"
                                                                whileHover={{ scale: 1.08, rotate: 3 }}
                                                                transition={{ type: "spring", stiffness: 400 }}
                                                            >
                                                                <img src={getAgentImage(agentName)} alt={agentName} className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-violet-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                            </motion.div>
                                                            <div className="text-center">
                                                                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{agentName}</h3>
                                                                <div className="text-sm text-violet-500 dark:text-violet-400 font-medium">{agentInfo.role}</div>
                                                            </div>
                                                        </div>

                                                        {/* TREE CONNECTOR CABLE (Only if sub-agents exist) */}
                                                        {agentInfo.subAgents && agentInfo.subAgents.length > 0 && (
                                                            <div className="flex flex-col items-center w-full mt-[-10px] pt-[10px] relative z-0">
                                                                {/* Main Vertical Trunk */}
                                                                <div className="w-[2px] h-8 bg-gradient-to-b from-violet-500 to-violet-300"></div>

                                                                {/* Horizontal Branch Bar */}
                                                                <div className="w-[140px] h-[2px] bg-violet-300 relative">
                                                                    {/* Vertical Drops to Sub-Agents */}
                                                                    <div className="absolute left-0 top-0 w-[2px] h-4 bg-violet-300"></div>
                                                                    <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[2px] h-4 bg-violet-300"></div>
                                                                    <div className="absolute right-0 top-0 w-[2px] h-4 bg-violet-300"></div>
                                                                </div>

                                                                {/* Sub-Agent Icons Row */}
                                                                <div className="flex justify-between w-[160px] mt-2">
                                                                    {agentInfo.subAgents.map(sub => (
                                                                        <div key={sub.id} className="flex flex-col items-center group/sub cursor-help relative">
                                                                            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-violet-200 dark:border-violet-900 flex items-center justify-center hover:scale-110 hover:border-violet-500 transition-all shadow-sm">
                                                                                <img src={sub.smallIcon} alt={sub.name} className="w-6 h-6 opacity-70 group-hover/sub:opacity-100" />
                                                                            </div>
                                                                            <div className="opacity-0 group-hover/sub:opacity-100 absolute -bottom-6 text-[9px] bg-black text-white px-2 py-1 rounded whitespace-nowrap transition-opacity pointer-events-none z-30">
                                                                                {sub.name}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="mt-auto">
                                                        {isActive ? (
                                                            <>
                                                                <div className="text-xs text-gray-500 mb-2">Status: Active in Hive Mind</div>
                                                                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-violet-500 w-full animate-pulse-slow"></div>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="text-xs text-gray-400">
                                                                Väntar på uppdrag från Mother Hive...
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* System Status Dashboard */}
                            <div className="mt-12">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                    <Network className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                                    <span>Mother System Status</span>
                                </h2>
                                <SystemStatusPanel />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Activity Feed (4/12) */}
                    <div className="lg:col-span-4">
                        {/* DRAFT WIDGET (Sits above logs) */}
                        <AnimatePresence>
                            {draftPost && (
                                <SocialDraftWidget
                                    draft={draftPost}
                                    onReject={() => setDraftPost(null)}
                                    onApprove={handleApproveDraft}
                                />
                            )}
                        </AnimatePresence>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="relative bg-white dark:bg-gray-800/90 rounded-[2.5rem] p-8 shadow-2xl shadow-gray-200/50 dark:shadow-violet-500/5 border border-gray-100 dark:border-gray-700/50 sticky top-24 backdrop-blur-xl overflow-hidden"
                        >
                            {/* Decorative background */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-violet-500/5 rounded-full blur-[60px] -mr-10 -mt-10 pointer-events-none"></div>

                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                    >
                                        <Activity className="w-5 h-5 text-white" />
                                    </motion.div>
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Händelselogg</h2>
                                </div>
                                <div className="flex items-center gap-1.5 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-bold text-green-600 dark:text-green-400">Live</span>
                                </div>
                            </div>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                                {(() => {
                                    // Combine system logs and tasks/notifications
                                    const logs = JSON.parse(localStorage.getItem('system_logs') || '[]');

                                    if (logs.length === 0) {
                                        return (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-center py-16"
                                            >
                                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <Activity className="w-8 h-8 text-gray-300 dark:text-gray-500" />
                                                </div>
                                                <p className="text-gray-400 font-medium">Inga händelser ännu</p>
                                                <p className="text-gray-300 dark:text-gray-600 text-sm mt-1">Starta en mission för att se aktivitet</p>
                                            </motion.div>
                                        );
                                    }

                                    return logs.slice().reverse().map((log: any, i: number) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="relative pl-7 group"
                                        >
                                            {/* Timeline Line */}
                                            {i !== logs.length - 1 && (
                                                <div className="absolute left-[7px] top-6 bottom-[-16px] w-0.5 bg-gradient-to-b from-violet-200 to-transparent dark:from-violet-900/50 group-hover:from-violet-400 transition-colors"></div>
                                            )}

                                            {/* Dot with glow */}
                                            <div className="absolute left-0 top-3 w-4 h-4 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30 border-2 border-white dark:border-gray-800 z-10"></div>

                                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700/50 transition-all hover:bg-white dark:hover:bg-gray-700/50 hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-500/30 group-hover:translate-x-1">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-violet-500 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-2 py-0.5 rounded-full">
                                                        {new Date(log.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 leading-snug">{log.message}</h4>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-md">
                                                        {log.agent ? log.agent[0].toUpperCase() : 'S'}
                                                    </div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{log.agent || 'System'}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ));
                                })()}
                            </div>
                        </motion.div>


                    </div>

                </div>
            </div>



            {/* Permissions Modal */}

            {/* CHAT OVERLAY */}
            {selectedAgentId && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 flex items-center justify-center p-4">
                    <div className="w-full h-full max-w-[1600px] max-h-[90vh] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl relative">
                        <RobotWorkspace propAgentId={selectedAgentId} onClose={() => setSelectedAgentId(null)} />
                    </div>
                </div>
            )}
        </div >
    );
};

export default Dashboard;

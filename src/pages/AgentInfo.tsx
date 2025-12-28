import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Zap, Brain, Rocket, X, TrendingUp } from 'lucide-react';
import { agents } from '../data/agents';
import type { Skill } from '../data/agents';
import { useAuth } from '../context/AuthContext';
import { useAgentLeveling } from '../hooks/useAgentLeveling';
import robotStandingWave from '../assets/robot_standing_wave.png';

import PaymentModal from '../components/PaymentModal';

const AgentInfo: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const agent = useMemo(() => agents.find(a => a.id === id), [id]);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

    // Leveling Hook - Always call hooks at top level, but handle null agent safely
    // Since we check !agent later, we technically violate rules if we don't handle it, 
    // but React Router usually unmounts if ID changes. 
    // Safer to just default to empty/first agent if null to keep hook order valid, then return null.
    const leveling = useAgentLeveling(agent || agents[0]);


    if (!agent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Agenten hittades inte</h2>
                    <Link to="/" className="text-purple-600 hover:underline">Gå tillbaka till startsidan</Link>
                </div>
            </div>
        );
    }

    const handleHire = () => {
        if (isAuthenticated) {
            setIsPaymentModalOpen(true);
        } else {
            navigate('/dashboard');
        }
    };

    const handlePaymentSuccess = () => {
        setIsPaymentModalOpen(false);
        navigate(`/robot/${agent.id}`);
    };

    // Mock extra data for "Filled Page" feel
    const tools = [
        { name: 'Gmail', icon: '📧' },
        { name: 'Calendar', icon: '📅' },
        { name: 'Slack', icon: '💬' },
        { name: 'Drive', icon: '📁' }
    ];

    // Dynamic Success Stories based on role
    const successStories = useMemo(() => {
        const isTech = agent.role.includes('Tech') || agent.role.includes('Utveckling');
        const isCreative = agent.role.includes('Creative') || agent.role.includes('Design');
        const isSales = agent.role.includes('Sales') || agent.role.includes('Sälj');

        if (isTech) return [
            { title: 'E-handelsplattform', metric: '-45% Laddtid', desc: 'Omskrivning av kärnmoduler resulterade i rekord-snabb checkout.', icon: '⚡️' },
            { title: 'Säkerhetsaudit', metric: 'A+ Rating', desc: 'Identifierade och åtgärdade 12 kritiska sårbarheter inom 24h.', icon: '🛡️' }
        ];
        if (isCreative) return [
            { title: 'Rebranding Q3', metric: '+200% Reach', desc: 'Ny visuell identitet som ökade engagemanget i sociala medier.', icon: '🎨' },
            { title: 'Kampanj Assets', metric: '48h Leverans', desc: 'Skapade komplett material för produktlansering på rekordtid.', icon: '🚀' }
        ];
        if (isSales) return [
            { title: 'Q4 Outreach', metric: '+150 Leads', desc: 'Automatiserat flöde som genererade kvalificerade möten.', icon: '📈' },
            { title: 'CRM Städning', metric: '10k Kontakter', desc: 'Verifierade och uppdaterade hela kundregistret automatiskt.', icon: '✨' }
        ];

        // Generic fallback
        return [
            { title: 'Workflow Automation', metric: '20h Sparat/v', desc: 'Automatiserade manuell rapportering för ledningsgruppen.', icon: '⚙️' },
            { title: 'Dataanalys', metric: 'Insikter', desc: 'Identifierade kostnadsbesparingar på 15% i molninfrastrukturen.', icon: '📊' }
        ];
    }, [agent]);



    return (
        <div className="min-h-screen bg-white">
            {/* Immersive Hero Section */}
            <div className={`relative w-full h-[600px] bg-gradient-to-br ${agent.gradient} overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

                {/* Decorative Circles */}
                <div className="absolute top-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-3xl" />

                <div className="container mx-auto px-4 h-full flex flex-col md:flex-row items-center relative z-10 pt-20">
                    {/* Floating Back Button - Positioned absolutely to the left */}
                    <Link to="/agents" className="absolute top-24 md:top-32 left-4 md:-left-12 inline-flex items-center text-white/60 hover:text-white transition-colors backdrop-blur-md bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 hover:border-white/30 z-50">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Tillbaka till alla agenter
                    </Link>

                    {/* Text Side */}
                    <div className="flex-1 text-white space-y-6 md:pl-8">


                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block"
                        >
                            <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-1.5 rounded-full text-sm font-semibold tracking-wider uppercase mb-4 inline-block shadow-lg">
                                {agent.role}
                            </span>
                            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 drop-shadow-sm">
                                {agent.name}
                            </h1>
                            <p className="text-xl md:text-2xl text-white/90 max-w-xl leading-relaxed font-light drop-shadow-md">
                                {agent.shortDescription}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex gap-4 pt-8"
                        >
                            <button
                                onClick={handleHire}
                                className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                <Rocket className="w-5 h-5" />
                                {isAuthenticated ? 'Öppna Workspace' : `Anställ ${agent.name}`}
                            </button>
                            <button
                                onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-8 py-4 rounded-full font-bold border border-white/30 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors text-white"
                            >
                                Se portfolio
                            </button>
                        </motion.div>
                    </div>

                    {/* Image Side - Redesigned "Portal" Look */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="flex-1 h-full relative flex items-center justify-center perspective-1000"
                    >
                        <div className="relative w-[500px] h-[500px] flex items-center justify-center">

                            {/* 1. Behind Glow/Ring */}
                            <div className={`absolute inset-0 bg-gradient-to-tr ${agent.gradient} opacity-40 blur-[80px] rounded-full animate-pulse-slow`}></div>
                            <div className="absolute inset-[-20px] border border-white/20 rounded-full animate-[spin_10s_linear_infinite] opacity-30 border-dashed"></div>

                            {/* 2. Main Image Container (The Portal) */}
                            <motion.div
                                animate={{ y: [-15, 15, -15] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="relative z-10 w-[90%] h-[90%] rounded-[3rem] overflow-hidden border-[8px] border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.3)] bg-black/20 backdrop-blur-sm group"
                            >
                                {/* Glass Shine Effect */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-20 pointer-events-none" />

                                <img
                                    src={leveling.currentImage}
                                    alt={agent.name}
                                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                                />

                                {/* Level Up Animation Overlay */}
                                <AnimatePresence>
                                    <motion.div
                                        key={leveling.level}
                                        initial={{ opacity: 0, scale: 1.5 }}
                                        animate={{ opacity: 0, scale: 1.5 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center"
                                    >
                                        <div className="text-white font-black text-4xl drop-shadow-[0_0_10px_rgba(255,255,255,1)]">LEVEL UP!</div>
                                    </motion.div>
                                </AnimatePresence>

                                {/* 3. Floating UI Badges overlapping the frame */}
                                {/* Leveling System Badge */}
                                <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-md border border-white/20 p-4 rounded-2xl z-30">
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-white font-bold shadow-lg`}>
                                                {leveling.level}
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-white/60 uppercase font-bold tracking-wider">Nuvarande Level</div>
                                                <div className="text-sm text-white font-bold">
                                                    {leveling.level < 10 ? 'Novis Agent' : leveling.level < 20 ? 'Erfaren Agent' : 'Mästar Agent'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-white/80 font-mono">{Math.floor(leveling.xp)} / {leveling.nextLevelXp} XP</div>
                                    </div>

                                    {/* XP Progress Bar */}
                                    <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`absolute left-0 top-0 h-full bg-gradient-to-r ${agent.gradient} rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out`}
                                            style={{ width: `${leveling.progressToNextPercent}%` }}
                                        />
                                    </div>

                                    <div className="mt-2 flex items-center justify-between text-[10px] text-white/50">
                                        <button
                                            onClick={() => leveling.addXp(250)}
                                            className="hover:text-white bg-white/10 px-2 py-1 rounded hover:bg-white/20 transition-all cursor-pointer"
                                        >
                                            + TEST XP
                                        </button>
                                        <span className="flex items-center gap-1">
                                            {leveling.level % 10 === 9 ? '⚠️ EVOLUTION NÄRA' : '✨ Slutför uppdrag för XP'}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                    {/* Left Column: Story & Data */}
                    <div className="lg:col-span-8 space-y-20">
                        {/* Story Section */}
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <div className={`p-3 rounded-2xl bg-gradient-to-br ${agent.gradient} text-white shadow-lg`}>
                                    <Brain className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-4xl font-bold text-gray-900">Vem är {agent.name}?</h2>
                                    <p className="text-gray-500">Lär känna din nya kollega</p>
                                </div>
                            </div>
                            <div className="prose prose-lg text-gray-600 leading-relaxed max-w-none">
                                <p className="text-xl font-medium text-gray-800 mb-6 border-l-4 border-purple-500 pl-6 italic">
                                    "{agent.shortDescription}"
                                </p>
                                <p className="mb-6">{agent.fullDescription}</p>
                                <p>
                                    Med en personlighet som beskrivs som <strong>{agent.personality}</strong>, passar {agent.name} perfekt in i team som värdesätter effektivitet och innovation.
                                </p>
                            </div>

                            {/* Live Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col items-center text-center">
                                    <div className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">IQ Nivå</div>
                                    <div className="text-3xl font-black text-gray-900">{leveling.currentStats.intelligence}</div>
                                    <div className="text-xs text-green-600 font-bold mt-1">
                                        +{((leveling.currentStats.intelligence / agent.baseStats.intelligence * 100) - 100).toFixed(0)}% Boost
                                    </div>
                                </div>
                                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col items-center text-center">
                                    <div className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">Processhastighet</div>
                                    <div className="text-3xl font-black text-gray-900">{leveling.currentStats.speed} <span className="text-sm font-normal text-gray-400">t/s</span></div>
                                    <div className="text-xs text-green-600 font-bold mt-1">
                                        +{((leveling.currentStats.speed / agent.baseStats.speed * 100) - 100).toFixed(0)}% Snabbare
                                    </div>
                                </div>
                                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col items-center text-center">
                                    <div className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">Kreativitet</div>
                                    <div className="text-3xl font-black text-gray-900">{leveling.currentStats.creativity}</div>
                                    <div className="text-xs text-purple-600 font-bold mt-1">Optimerad</div>
                                </div>
                            </div>

                        </section>

                        {/* Capabilities / Tasks Detail Section */}
                        <section>
                            <div className="flex items-center gap-4 mb-10">
                                <div className={`p-3 rounded-2xl bg-gray-100 text-gray-900 shadow-sm`}>
                                    <Zap className="w-8 h-8" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900">Vad jag kan göra för dig</h2>
                            </div>

                            <div className="space-y-6">
                                {agent.capabilities?.map((cap, i) => (
                                    <div key={i} className="flex flex-col md:flex-row gap-6 p-8 rounded-3xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-xl hover:border-purple-100 transition-all duration-300 group">
                                        <div className="shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl bg-white text-2xl font-bold text-purple-600 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-gray-900 mb-3">{cap.title}</h4>
                                            <p className="text-gray-600 leading-relaxed text-lg">{cap.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Visual Skills */}
                        <section>
                            <h2 className="text-3xl font-bold text-gray-900 mb-0 text-center">Expertisområden</h2>

                            {/* Agent Standing "Behind" Cards - Lifted High to Show Feet - No Overlap Issues */}
                            {agent.name === 'Atlas' && (
                                <div className="relative h-80 flex justify-center items-end -mb-0 z-0 pointer-events-none">
                                    <div className="relative flex justify-center">
                                        <img
                                            src={robotStandingWave}
                                            alt="Agent waving"
                                            className="h-80 w-auto object-contain"
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {agent.skills.map((skill, i) => (
                                    <motion.div
                                        key={i}
                                        onClick={() => setSelectedSkill(skill)}
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="aspect-square rounded-3xl bg-[#0f1115] border border-gray-800 shadow-xl flex flex-col items-center justify-center p-4 text-center hover:shadow-2xl hover:border-gray-700 hover:bg-black cursor-pointer transition-all duration-300 group relative overflow-hidden"
                                    >
                                        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${agent.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />

                                        <div className={`w-14 h-14 mb-4 rounded-2xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-white text-xl font-bold shadow-lg ring-4 ring-black/40`}>
                                            {skill.title[0]}
                                        </div>
                                        <span className="font-bold text-white text-sm line-clamp-2 mb-2">{skill.title}</span>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest group-hover:text-white transition-colors">Läs mer</span>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Key Info & CTA */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Sticky Card */}
                        <div className="sticky top-24 space-y-8">

                            {/* Capabilities Card */}
                            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${agent.gradient}`} />
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-500" />
                                    Konkreta Use Cases
                                </h3>
                                <ul className="space-y-4">
                                    {agent.useCases.map((uc, i) => (
                                        <li key={i} className="flex items-start gap-3 text-gray-600">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                            <span className="text-sm font-medium">{uc}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Growth/Evolution Card */}
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl p-8 border border-gray-700/50 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-purple-500/30 transition-colors"></div>

                                <div className="flex items-center gap-3 mb-4 relative z-10">
                                    <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold">Utvecklingspotential</h3>
                                </div>

                                <p className="text-gray-300 mb-6 leading-relaxed text-sm">
                                    {agent.name} är just nu <strong>Level 1 (Novis)</strong>. Genom att samarbeta regelbundet kommer agenten att:
                                </p>

                                <ul className="space-y-3 relative z-10">
                                    {[
                                        'Lära sig din kommunikationsstil',
                                        'Förstå din affär på djupet',
                                        'Bli 3x snabbare på rutinuppgifter'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm font-medium text-gray-200">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0 shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-purple-300">
                                    <span>Nästa Nivå:</span>
                                    <span>Erfaren Agent</span>
                                </div>
                            </div>

                            {/* Tech Stack / Tools / Portfolio */}
                            <div id="portfolio" className="bg-white rounded-3xl p-0 shadow-xl border border-gray-100 overflow-hidden">
                                {/* Header */}
                                <div className="p-8 pb-4">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Rocket className="w-5 h-5 text-purple-600" />
                                        Senaste Projekt
                                    </h3>
                                </div>

                                {/* Success Stories List */}
                                <div className="px-8 pb-6 space-y-4">
                                    {successStories.map((story, i) => (
                                        <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-purple-200 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-bold text-gray-900 flex items-center gap-2">
                                                    <span>{story.icon}</span> {story.title}
                                                </div>
                                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">{story.metric}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-snug">{story.desc}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Tools Footer */}
                                <div className="bg-gray-900 p-8 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Verktygslåda</h4>
                                    <div className="grid grid-cols-4 gap-4 relative z-10">
                                        {tools.map((t, i) => (
                                            <div key={i} className="flex flex-col items-center gap-2 group">
                                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl group-hover:bg-white/20 group-hover:scale-110 transition-all cursor-help" title={t.name}>
                                                    {t.icon}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Bottom CTA */}
                            <div className="text-center p-6 bg-purple-50 rounded-3xl border border-purple-100">
                                <h4 className="font-bold text-purple-900 mb-2">Redo att skala upp?</h4>
                                <p className="text-purple-600 text-sm mb-4">Anställ {agent.name} idag och se resultat direkt.</p>
                                <button
                                    onClick={handleHire}
                                    className={`w-full py-3.5 px-6 rounded-xl font-bold text-white shadow-lg focus:ring-4 focus:ring-purple-200 transition-all bg-gradient-to-r ${agent.gradient} hover:shadow-xl`}
                                >
                                    Anställ Nu
                                </button>
                            </div>

                        </div>
                    </div>

                </div>

                {/* Meet the Rest of the Team Section */}
                <div className="mt-32 pt-16 border-t border-gray-100">
                    <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Möt resten av teamet</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {agents.filter(a => a.id !== agent.id).map((otherAgent) => (
                            <Link to={`/agent/${otherAgent.id}`} key={otherAgent.id} className="group relative bg-white rounded-3xl p-6 border border-gray-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${otherAgent.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />

                                <div className="flex items-center gap-6 mb-4">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md">
                                        <img src={otherAgent.image} alt={otherAgent.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{otherAgent.name}</h3>
                                        <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">{otherAgent.role}</span>
                                    </div>
                                </div>
                                <p className="text-gray-500 line-clamp-2 text-sm mb-4">{otherAgent.shortDescription}</p>
                                <span className="inline-flex items-center text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                                    Läs mer <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                agentName={agent.name}
                onSuccess={handlePaymentSuccess}
            />

            {/* Skill Detail Modal */}
            <AnimatePresence>
                {selectedSkill && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedSkill(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${agent.gradient}`} />

                            <button
                                onClick={() => setSelectedSkill(null)}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>

                            <div className="flex items-start gap-6">
                                <div className={`shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                                    {selectedSkill.title[0]}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedSkill.title}</h3>
                                    <p className="text-gray-600 leading-relaxed text-lg">
                                        {selectedSkill.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AgentInfo;

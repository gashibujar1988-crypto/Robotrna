
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { agents } from '../data/agents';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AgentsPage: React.FC = () => {
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['All', 'Marketing', 'Sales', 'Support', 'Tech', 'Data'];

    // Helper to categorize agents strictly for filtering
    const getCategory = (role: string) => {
        const r = role.toLowerCase();
        if (r.includes('social') || r.includes('creative') || r.includes('kreativ')) return 'Marketing';
        if (r.includes('sales') || r.includes('business') || r.includes('sälj') || r.includes('affärs')) return 'Sales';
        if (r.includes('support') || r.includes('assistant') || r.includes('kundtjänst')) return 'Support';
        if (r.includes('tech') || r.includes('web') || r.includes('utveckling')) return 'Tech';
        if (r.includes('research') || r.includes('analyst') || r.includes('analys')) return 'Data';
        return 'Other';
    };

    const filteredAgents = agents.filter(agent => {
        const matchesCategory = filter === 'All' || getCategory(agent.role) === filter;
        const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.skills.some(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="bg-white dark:bg-[#0F1623] min-h-screen font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <Navbar />

            {/* Header / Hero */}
            <header className="pt-32 pb-16 bg-white dark:bg-[#0F1623] relative overflow-hidden transition-colors duration-300">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-50 via-white to-white dark:from-purple-900/20 dark:via-[#0F1623] dark:to-[#0F1623] opacity-70 pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800 px-4 py-1.5 rounded-full text-purple-700 dark:text-purple-300 font-semibold text-sm mb-6"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Din Digitala Arbetsstyrka</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-gray-900 dark:text-white"
                    >
                        Utforska Våra <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">AI-Agenter</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        Hitta rätt expertis för dina behov. Våra agenter är specialiserade, alltid tillgängliga och redo att integreras i ditt team direkt.
                    </motion.p>
                </div>
            </header>

            {/* Value Proposition Section */}
            <section className="py-12 bg-white dark:bg-[#0F1623] border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Benefit 1 */}
                        <div className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-transparent dark:border-gray-700">
                            <div className="p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-green-600 dark:text-green-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Skala utan risk</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                    Undvik dyra rekryteringsprocesser. Skala upp ditt team på sekunder, inte månader, och betala bara för det du använder.
                                </p>
                            </div>
                        </div>

                        {/* Benefit 2 */}
                        <div className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-transparent dark:border-gray-700">
                            <div className="p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-blue-600 dark:text-blue-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Supermänsklig fart</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                    Våra agenter sover aldrig. De svarar på mail, analyserar data och skapar content dygnet runt, året om.
                                </p>
                            </div>
                        </div>

                        {/* Benefit 3 */}
                        <div className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-transparent dark:border-gray-700">
                            <div className="p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-purple-600 dark:text-purple-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Specialiserad Expertis</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                    Varje agent är tränad på en specifik uppgift. Få tillgång till "Senior Level" kompetens till priset av en prenumeration.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Controls Section */}
            <div className="sticky top-20 z-40 bg-white/80 dark:bg-[#0F1623]/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 py-4 mb-12 transition-colors duration-300">
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Categories */}
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap
                                    ${filter === cat
                                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-lg scale-105'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}
                                `}
                            >
                                {cat === 'All' ? 'Alla' : cat}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Sök efter kompetens eller namn..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Agents Grid */}
            <main className="container mx-auto px-4 pb-32">
                <AnimatePresence mode="popLayout">
                    {filteredAgents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredAgents.map((agent) => (
                                <motion.div
                                    key={agent.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    className="group relative"
                                >
                                    <Link to={`/agent/${agent.id}`} className="block h-full">
                                        <div className="h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[2rem] p-8 hover:shadow-2xl hover:border-purple-200 dark:hover:border-purple-900 hover:-translate-y-2 transition-all duration-300 flex flex-col">

                                            {/* Header with Avatar */}
                                            <div className="flex items-start justify-between mb-8">
                                                <div className="absolute right-4 top-4 z-20 flex flex-col items-end gap-2">
                                                    {agent.id === '10' && (
                                                        <>
                                                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                                                                NYHET
                                                            </span>
                                                            <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                                                                Powered by Nova
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="relative w-24 h-24">
                                                        <div className={`absolute inset-0 bg-gradient-to-r ${agent.gradient} opacity-20 blur-2xl rounded-full`} />
                                                        <img
                                                            src={agent.image}
                                                            alt={agent.name}
                                                            className="w-full h-full object-cover rounded-2xl border-2 border-white dark:border-gray-600 shadow-lg relative z-10 bg-gray-50 dark:bg-gray-700 animate-float"
                                                        />
                                                    </div>

                                                    {/* Sub-Agent Visuals */}
                                                    {agent.subAgents && agent.subAgents.length > 0 && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.2, duration: 0.5 }}
                                                            className="sub-agent-tree flex justify-center relative pt-4"
                                                        >
                                                            {/* Connector (Cable) */}
                                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-4 bg-gradient-to-b from-gray-200 to-gray-50 dark:from-gray-700 dark:to-gray-800" />

                                                            <div className="sub-icon-container flex gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-full border border-gray-100 dark:border-gray-700 backdrop-blur-sm shadow-sm z-10">
                                                                {agent.subAgents.map((sub: any) => (
                                                                    <div key={sub.id} className="relative group/icon">
                                                                        <img
                                                                            src={sub.smallIcon}
                                                                            className="w-6 h-6 rounded-full grayscale hover:grayscale-0 transition-all duration-300 hover:scale-125 cursor-help border border-white/30"
                                                                            alt={sub.name}
                                                                        />
                                                                        {/* Tooltip */}
                                                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-[10px] rounded opacity-0 group-hover/icon:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                                            {sub.name}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </div>
                                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-300 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/30 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                    <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="mb-6 flex-grow">
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{agent.name}</h3>
                                                <p className="text-purple-600 dark:text-purple-400 font-bold text-sm mb-3 uppercase tracking-wide">{agent.role}</p>


                                                {/* Problem Solved Tagline */}
                                                <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 text-xs font-medium px-3 py-2 rounded-lg border border-red-100 dark:border-red-900/30 flex items-start gap-2">
                                                    <span className="text-red-500 dark:text-red-400 shrink-0 mt-0.5">⚠️</span>
                                                    <span className="italic">"Löser: {agent.problemSolved}"</span>
                                                </div>

                                                <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm mb-6 line-clamp-3">
                                                    {agent.shortDescription}
                                                </p>

                                                {/* Top Tasks List */}
                                                <div className="space-y-2 mb-6">
                                                    <h4 className="text-xs font-bold text-gray-900 dark:text-gray-200 uppercase tracking-widest mb-2">Jag kan:</h4>
                                                    {agent.useCases.slice(0, 3).map((task, idx) => (
                                                        <div key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                                            <span>{task}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* USP Badge */}
                                            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-700">
                                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-start gap-3 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 transition-colors">
                                                    <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm text-yellow-500">
                                                        <Sparkles className="w-4 h-4 fill-current" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-0.5">Unik Superkraft</p>
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">{agent.usp}</p>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-6 text-gray-400 dark:text-gray-500">
                                <Filter className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Inga agenter hittades</h3>
                            <p className="text-gray-500 dark:text-gray-400">Prova att ändra filter eller söktermer.</p>
                            <button
                                onClick={() => { setFilter('All'); setSearchQuery(''); }}
                                className="mt-6 px-6 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-full font-bold hover:bg-black dark:hover:bg-gray-200 transition-colors"
                            >
                                Rensa filter
                            </button>
                        </div>
                    )}
                </AnimatePresence>
            </main>

            <Footer />
        </div>
    );
};

export default AgentsPage;

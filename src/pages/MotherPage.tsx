import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Brain, Cpu, Globe, Network, Shield, Sparkles, Check, X, GitMerge, Layers, Zap, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import motherFull from '../assets/mother_abstract.jpg';

const MotherPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0F1623] text-gray-900 dark:text-gray-100 overflow-hidden relative transition-colors duration-300">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100/50 via-gray-50 to-gray-50 dark:from-purple-900/20 dark:via-[#0F1623] dark:to-[#0F1623] z-0" />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-300/30 dark:via-purple-700/30 to-transparent" />

            <div className="relative z-10 container mx-auto px-6 pt-32 pb-12">
                {/* Header / Nav */}
                <div className="flex items-center justify-end mb-16">
                    <div className="px-4 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold tracking-widest uppercase">
                        Systemstatus: Online
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Column: Image & Visuals */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative flex justify-center"
                    >
                        <div className="relative w-[500px] h-[700px] rounded-[3rem] overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-2xl bg-white dark:bg-gray-800 backdrop-blur-sm">
                            <img
                                src={motherFull}
                                alt="Mother Core AI"
                                className="w-full h-full object-cover"
                            />
                            {/* Scanning overlay effect */}
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-80" />
                            <div className="absolute bottom-0 inset-x-0 p-8">
                                <h2 className="text-4xl font-black text-white tracking-wider mb-2">MOTHER</h2>
                                <p className="text-purple-200 font-mono text-sm">v9.0.4 • CENTRAL INTELLIGENS</p>
                            </div>
                        </div>

                        {/* Floating elements */}
                        <motion.div
                            animate={{ y: [-10, 10, -10] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-20 -right-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xl"
                        >
                            <Brain className="w-8 h-8 text-purple-600 mb-2" />
                            <div className="text-xs text-gray-500 dark:text-gray-400">Neural Kapacitet</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">100 PB</div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [10, -10, 10] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-40 -left-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xl"
                        >
                            <Network className="w-8 h-8 text-pink-500 mb-2" />
                            <div className="text-xs text-gray-500 dark:text-gray-400">Anslutna Agenter</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">9 Aktiva</div>
                        </motion.div>
                    </motion.div>

                    {/* Right Column: Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="space-y-8"
                    >
                        <div>
                            <h1 className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                                Framtidens Centrala <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Intelligens.</span>
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
                                Mother är det centrala neurala nätverket som orkestrerar vår svärm av specialiserade AI-agenter. Hon säkerställer sömlöst samarbete, datasynkronisering och strategisk anpassning över alla dina affärsfunktioner.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { icon: Cpu, title: "Processkraft", desc: "Orkestrerar komplexa arbetsflöden för flera agenter i realtid." },
                                { icon: Globe, title: "Helhetsbild", desc: "Behåller full medvetenhet om hela ditt affärsekosystem." },
                                { icon: Shield, title: "Säkerhetskärna", desc: "Kryptering och behörighetshantering i företagsklass." },
                                { icon: Sparkles, title: "Självutvecklande", desc: "Förbättrar strategier kontinuerligt baserat på resultat." }
                            ].map((feature, i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg transition-all">
                                    <feature.icon className="w-6 h-6 text-purple-600 mb-3" />
                                    <h3 className="text-gray-900 dark:text-white font-bold mb-1">{feature.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8">
                            <Link to={isAuthenticated ? "/dashboard" : "/pricing"} className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-bold hover:shadow-[0_0_30px_rgba(147,51,234,0.3)] transition-all transform hover:scale-105">
                                Anslut till Kärnan
                            </Link>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mt-32 mb-20"
                >
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Orkestrering i Världsklass</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            De flesta AI-lösningar är isolerade verktyg. Mother är bindväven som gör dem till ett team.
                            Genom att centralisera minne och beslut, skapas en synergi som överträffar summan av delarna.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { icon: GitMerge, title: "Synkronisering", desc: "Dataflöden mellan agenter i realtid." },
                            { icon: Layers, title: "Kontext-lager", desc: "Djup förståelse för tidigare beslut." },
                            { icon: Zap, title: "Blixtsnabb", desc: "Millisekunders fördröjning i beslutskedjan." },
                            { icon: Database, title: "Total Minnesbank", desc: "All historik lagrad och sökbar." }
                        ].map((feat, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-md hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-900 transition-all group">
                                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                                    <feat.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feat.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {feat.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mt-40 border-t border-gray-200 dark:border-gray-800 pt-24"
                >
                    <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
                        <div className="order-2 md:order-1">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Hive-Mind Arkitektur</h2>
                            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6">
                                Traditionella AI-system lider av "amnesi" mellan sessioner och verktyg. Mother eliminerar detta genom att agera som ett delat långtidsminne för hela din organisation.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Centraliserad kunskapsbas som växer organiskt",
                                    "Kontextuellt minne över alla konversationer",
                                    "Automatisk konfliktlösning mellan agenters mål"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                                            <Check className="w-3.5 h-3.5" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="order-1 md:order-2 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-3xl p-8 border border-white/50 dark:border-gray-700 shadow-inner relative overflow-hidden">
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30 shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">S</div>
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        <span className="text-purple-600 dark:text-purple-400 font-bold">@Sälj</span> hittade ny kundinsikt.
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <ArrowLeft className="rotate-[-90deg] text-gray-300 dark:text-gray-600" />
                                </div>
                                <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-purple-200 dark:border-purple-800 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                                    <Brain className="w-10 h-10 text-purple-600" />
                                    <div className="text-sm text-gray-800 dark:text-gray-200">
                                        <span className="font-bold">Mother</span> uppdaterar global strategi...
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <ArrowLeft className="rotate-[-90deg] text-gray-300 dark:text-gray-600" />
                                </div>
                                <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30 shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center text-pink-600 dark:text-pink-400 font-bold">M</div>
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        <span className="text-purple-600 dark:text-purple-400 font-bold">@Marknad</span> justerar kampanj.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comparison Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 md:p-12 border border-gray-100 dark:border-gray-700 shadow-xl">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Mother vs. Traditionell Automation</h2>
                            <p className="text-gray-500 dark:text-gray-400">Varför världens ledande företag väljer en orkestrerad lösning.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Competitors */}
                            <div className="space-y-6 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                                <div className="text-xl font-bold text-gray-400 dark:text-gray-500 text-center mb-8">Vanliga Chatbots</div>
                                {[
                                    { good: false, text: "Isolerade konversationer" },
                                    { good: false, text: "Kräver manuell styrning" },
                                    { good: false, text: "Glömmer kontexten dagligen" },
                                    { good: false, text: "Reaktiv - väntar på order" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <X className="w-5 h-5 text-red-500 shrink-0" />
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Mother */}
                            <div className="relative md:-mt-8 md:-mb-8 bg-gray-900 dark:bg-[#070b14] rounded-3xl p-6 border border-gray-800 shadow-2xl z-10 transform md:scale-105">
                                <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">BÄST VAL</div>
                                <div className="text-2xl font-black text-white text-center mb-8 flex justify-center gap-2 items-center">
                                    <span className="text-purple-400">Mother</span> System
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { good: true, text: "Fullt integrerat ekosystem" },
                                        { good: true, text: "Självstyrande autonomi" },
                                        { good: true, text: "Oändligt långtidsminne" },
                                        { good: true, text: "Proaktiv - föreslår lösningar" },
                                        { good: true, text: "Realtids-lärande" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                                            <Check className="w-5 h-5 text-green-400 shrink-0" />
                                            <span className="text-sm text-white font-medium">{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8">
                                    <Link to="/pricing" className="block w-full py-4 bg-white text-gray-900 font-bold text-center rounded-xl hover:bg-gray-100 transition-colors">
                                        Starta Uppgradering
                                    </Link>
                                </div>
                            </div>

                            {/* Agencies */}
                            <div className="space-y-6 opacity-80 md:pt-4">
                                <div className="text-xl font-bold text-gray-400 dark:text-gray-500 text-center mb-8">Mänskliga Konsulter</div>
                                {[
                                    { good: true, text: "Hög kreativitet & empati" },
                                    { good: false, text: "Dyrt & svårt att skala" },
                                    { good: false, text: "Otillgängliga utanför kontorstid" },
                                    { good: false, text: "Långsam kunskapsöverföring" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                        {item.good ? <Check className="w-5 h-5 text-green-500 shrink-0" /> : <X className="w-5 h-5 text-red-400 shrink-0" />}
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default MotherPage;

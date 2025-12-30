import React from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle, TrendingUp, Users } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { agents } from '../data/agents';
import ResultsMap from './ResultsMap';
import LeadsDrawer from './LeadsDrawer';
import heroImage from '../assets/hero_woman_working.png';

const Hero: React.FC = () => {
    const { signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [showLeadsDrawer, setShowLeadsDrawer] = React.useState(false);
    const [leadsData, setLeadsData] = React.useState<any[]>([]);

    React.useEffect(() => {
        const handleShowLeads = (e: any) => {
            if (e.detail && e.detail.places) {
                // Enrich with mock data for the demo if missing
                const enriched = e.detail.places.map((p: any) => ({
                    ...p,
                    daglig_leder: p.daglig_leder || "Ola Nordmann",
                    phone: p.phone || "+47 22 33 44 55",
                    email: p.email || `post@${p.name.replace(/\s+/g, '').toLowerCase()}.no`
                }));
                setLeadsData(enriched);
                setShowLeadsDrawer(true);
            }
        };
        window.addEventListener('SHOW_MAP_RESULTS', handleShowLeads);
        return () => window.removeEventListener('SHOW_MAP_RESULTS', handleShowLeads);
    }, []);

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to init Google Auth', error);
        }
    };

    // Safety check
    if (!agents || agents.length < 6) {
        return <div className="w-full h-screen bg-[#050609] flex items-center justify-center text-white">Loading Agents...</div>;
    }

    return (
        <section className="relative w-full h-[100vh] overflow-hidden bg-[#050609]">

            {/* ================= BACKGROUND IMAGE (FULL SCREEN) ================= */}
            <div className="absolute inset-0 z-0">
                <img
                    src={heroImage}
                    alt="Office Background"
                    className="w-full h-full object-cover object-[80%_center]"
                />
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#050609] via-[#050609]/85 to-transparent"></div>
            </div>

            {/* ================= RESULTS MAP (POPUP) ================= */}
            <ResultsMap />

            {/* ================= LEADS DRAWER (RIGHT SIDE) ================= */}
            <LeadsDrawer
                isOpen={showLeadsDrawer}
                onClose={() => setShowLeadsDrawer(false)}
                leads={leadsData}
            />

            {/* Re-open trigger if closed but has data */}
            {!showLeadsDrawer && leadsData.length > 0 && (
                <motion.button
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    onClick={() => setShowLeadsDrawer(true)}
                    className="fixed bottom-10 right-10 z-50 bg-cyan-500 text-white p-4 rounded-full shadow-lg hover:bg-cyan-400 transition-colors font-bold flex items-center gap-2"
                >
                    <Users className="w-5 h-5" />
                    Visa Leads ({leadsData.length})
                </motion.button>
            )}

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(2deg); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>

            {/* Content Container */}
            <div className="container mx-auto px-6 relative z-10 h-full flex flex-col justify-center">

                {/* ================= LEFT: TEXT CONTENT ================= */}
                <div className="w-full lg:w-[45%] xl:w-[40%] text-left pt-20 lg:pt-0">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-cyan-300 border border-white/10 mb-6 font-bold text-[11px] uppercase tracking-wider backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                        AI-Revolutionen är här
                    </div>

                    <h1 className="text-4xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-8">
                        Anställ din framtida <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                            Arbetskraft
                        </span>
                    </h1>

                    <p className="text-lg text-slate-300 mb-10 leading-relaxed font-light max-w-xl">
                        Få tillgång till ett komplett team av specialiserade AI-agenter.
                        Med vår <strong>Mother Core™</strong> teknologi arbetar de synkroniserat för att automatisera ditt företag.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleGoogleLogin}
                            className="group px-8 py-4 rounded-full bg-white text-slate-900 font-bold hover:bg-cyan-50 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all transform hover:-translate-y-1"
                        >
                            <div className="w-5 h-5">
                                <img src="https://www.google.com/favicon.ico" alt="G" className="w-full h-full" />
                            </div>
                            <span>Logga in med Google</span>
                        </button>

                        <Link
                            to="/how-it-works"
                            className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-bold hover:bg-white/10 backdrop-blur-md transition-all flex items-center justify-center gap-2 min-w-[180px]"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            <span>Se hur det funkar</span>
                        </Link>
                    </div>
                </div>

                {/* ================= FLOATING GLASS CARDS LAYER ================= */}
                <div className="absolute inset-0 z-20 pointer-events-none hidden lg:block">

                    {/* 1. STRATEGY (Venture) - High Right */}
                    <GlassCard
                        initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4 }}
                        className="absolute top-[12%] right-[5%] z-20 pointer-events-auto border-emerald-500/30"
                    >
                        <div className="flex items-center gap-4">
                            <img src={agents[6].image} className="w-14 h-14 object-contain drop-shadow-lg rounded-full bg-emerald-500/10 p-1" alt="Venture" />
                            <div>
                                <h4 className="text-white font-bold text-base">Affärsutveckling</h4>
                                <div className="text-sm text-slate-300">Har sparat 15% i driftskostnader</div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* 2. CREATIVE (Pixel) - Top Mid-Right */}
                    <GlassCard
                        initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
                        className="absolute top-[18%] right-[25%] z-30 pointer-events-auto border-violet-500/30"
                    >
                        <div className="flex items-center gap-4">
                            <img src={agents[5].image} className="w-14 h-14 object-contain drop-shadow-lg rounded-full bg-violet-500/10 p-1" alt="Pixel" />
                            <div>
                                <h4 className="text-white font-bold text-base">Marknadsmaterial</h4>
                                <div className="text-sm text-slate-300">50 Annonser skapade & redo</div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* 3. SALES (Hunter) - Mid Right */}
                    <GlassCard
                        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                        className="absolute top-[35%] right-[8%] z-40 pointer-events-auto shadow-emerald-900/20"
                    >
                        <div className="flex items-center gap-4">
                            <img src={agents[3].image} className="w-16 h-16 object-contain drop-shadow-lg rounded-full bg-green-500/10 p-1" alt="Hunter" />
                            <div>
                                <h4 className="text-white font-bold text-lg">Nya Kunder</h4>
                                <div className="text-sm text-slate-300">Hittade 20 heta leads i morse</div>
                                <div className="mt-2 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-400 w-[95%] rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* 4. ADMIN (Dexter) - Mid Left (Important!) */}
                    <GlassCard
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5 }}
                        className="absolute top-[28%] right-[40%] z-20 pointer-events-auto opacity-100 border-orange-500/40 shadow-lg"
                    >
                        <div className="flex items-center gap-4">
                            <img src={agents[2].image} className="w-16 h-16 object-contain drop-shadow-lg rounded-full bg-orange-500/10 p-1" alt="Dexter" />
                            <div>
                                <h4 className="text-white font-bold text-lg">Mötesbokning</h4>
                                <div className="text-sm text-slate-300 font-medium">Bokade 10 nya kundmöten</div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* 5. RESEARCH (Brainy) - Bottom Right Floating */}
                    <GlassCard
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }}
                        className="absolute bottom-[35%] right-[2%] z-30 pointer-events-auto border-blue-500/30"
                    >
                        <div className="flex items-center gap-4">
                            <img src={agents[1].image} className="w-14 h-14 object-contain drop-shadow-lg rounded-full bg-blue-500/10 p-1" alt="Brainy" />
                            <div>
                                <h4 className="text-white font-bold text-base">Beslutsunderlag</h4>
                                <div className="text-sm text-slate-300">Analyserade 100 konkurrenter</div>
                            </div>
                        </div>
                    </GlassCard>


                    {/* 6. SUPPORT (Nova) - Center Focus */}
                    <GlassCard
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}
                        className="absolute top-[48%] right-[28%] z-50 pointer-events-auto border-indigo-500/40 shadow-[0_0_40px_rgba(99,102,241,0.25)]"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1 rounded bg-indigo-500/20 text-indigo-400">
                                <CheckCircle size={16} />
                            </div>
                            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Support</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <img src={agents[4].image} className="w-16 h-16 object-contain drop-shadow-2xl" alt="Nova" />
                            <div>
                                <div className="text-lg text-white font-bold">Kundtjänst</div>
                                <div className="text-sm text-slate-300 font-medium whitespace-nowrap">Löste 50 ärenden åt dig</div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* 7. TECH (Atlas) - Low Left */}
                    <GlassCard
                        initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}
                        className="absolute top-[65%] right-[45%] z-20 pointer-events-auto border-cyan-500/30"
                    >
                        <div className="flex items-center gap-4">
                            <img src={agents[7].image} className="w-14 h-14 object-contain drop-shadow-lg rounded-full bg-cyan-500/10 p-1" alt="Atlas" />
                            <div>
                                <div className="text-base font-bold text-white">IT & Säkerhet</div>
                                <div className="text-sm text-slate-300">Sajten laddar 200% snabbare</div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* 8. FINANCE (Ledger) - Low Center */}
                    <GlassCard
                        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
                        className="absolute bottom-[10%] right-[32%] z-40 pointer-events-auto border-slate-700 bg-slate-900/80"
                    >
                        <div className="flex items-center gap-4">
                            <img src={agents[8].image} className="w-14 h-14 object-contain drop-shadow-lg rounded-full bg-emerald-600/10 p-1" alt="Ledger" />
                            <div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-base font-bold text-white">Bokföring</span>
                                    <span className="text-emerald-400 font-bold text-sm">KLAR</span>
                                </div>
                                <div className="text-sm text-slate-300 mt-0.5">Din redovisning är färdigställd</div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* 9. SOCIAL (Soshie) - Bottom Right Corner */}
                    <GlassCard
                        initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }}
                        className="absolute bottom-[15%] right-[10%] z-50 pointer-events-auto border-pink-500/30"
                    >
                        <div className="flex items-center gap-4">
                            <img src={agents[0].image} className="w-14 h-14 object-contain drop-shadow-lg rounded-full bg-pink-500/10 p-1" alt="Soshie" />
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <TrendingUp size={16} className="text-pink-400" />
                                    <h4 className="text-white font-bold text-base">Sociala Medier</h4>
                                </div>
                                <div className="text-sm text-slate-300">Nådde 10k nya kunder organiskt</div>
                            </div>
                        </div>
                    </GlassCard>

                </div>
            </div>

            {/* Map Visualization Component */}
            <ResultsMap />
        </section>
    );
};

// --- Subcomponents for the UI ---

const GlassCard = ({ children, className, initial, animate, transition }: any) => {
    return (
        <motion.div
            initial={initial}
            animate={animate}
            transition={transition}
            className={`
                bg-slate-900/75 
                backdrop-blur-xl 
                border border-white/20 
                shadow-[0_8px_40px_0_rgba(0,0,0,0.6)] 
                rounded-2xl 
                p-5
                min-w-[260px] 
                hover:border-white/40 
                hover:bg-slate-900/90 
                hover:scale-105
                hover:z-50
                transition-all 
                duration-300
                cursor-default
                ${className}
            `}
        >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
            {children}
        </motion.div>
    );
};

export default Hero;

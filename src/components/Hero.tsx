import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Play, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import Assets
import heroImage from '../assets/hero_real_woman.png';
import soshieAgent from '../assets/robot_social.png';
import novaAgent from '../assets/robot_support.png';
import hunterAgent from '../assets/robot_venture_new.png';
import atlasAgent from '../assets/robot_atlas_new.png';

const FloatingTaskCard = ({ agentImg, name, task, stats, delay, positionClass }: { agentImg: string, name: string, task: string, stats: string, delay: number, positionClass: string }) => (
    <motion.div
        className={`absolute hidden lg:flex items-center gap-4 bg-slate-900/95 p-4 rounded-xl border border-blue-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-sm z-20 ${positionClass}`}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
            duration: 0.5,
            delay: delay,
            type: "spring",
            stiffness: 100
        }}
    >
        {/* Agent Avatar with Glow */}
        <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-full bg-slate-800 p-1 border border-blue-400/50 shadow-[0_0_10px_rgba(60,169,255,0.3)] overflow-hidden">
                <img src={agentImg} alt={name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full border-2 border-slate-900 shadow-sm">
                <CheckCircle2 className="w-3 h-3" />
            </div>
        </div>

        {/* Content */}
        <div className="min-w-[180px]">
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs uppercase font-extrabold text-blue-400 tracking-wider">{name}</span>
                <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">Active</span>
            </div>
            <div className="text-sm font-bold text-white leading-tight mb-1">{task}</div>
            <div className="text-xs font-medium text-gray-400">{stats}</div>
        </div>
    </motion.div>
);

const Hero: React.FC = () => {
    const navigate = useNavigate();

    return (
        <section className="relative w-full h-[100vh] min-h-[700px] overflow-hidden bg-[#0F1623]">

            {/* Full Screen Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src={heroImage}
                    alt="AI Automation Workspace"
                    className="w-full h-full object-cover object-center lg:object-right"
                />
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0F1623] via-[#0F1623]/80 to-[#0F1623]/20 lg:to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1623] via-transparent to-transparent"></div>
            </div>

            <div className="container mx-auto px-6 max-w-7xl h-full relative z-10 flex items-center">
                <div className="w-full lg:w-1/2">

                    {/* Hero Content */}
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 backdrop-blur-md border border-blue-500/20 text-blue-300 font-bold text-sm mb-8"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            AI-Agentering för framtiden
                        </motion.div>

                        <motion.h1
                            className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-8 tracking-tight"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            Ditt <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">drömteam</span><br />
                            är digitalt.
                        </motion.h1>

                        <motion.p
                            className="text-xl text-gray-300 mb-10 leading-relaxed max-w-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        >
                            Automatisera din verksamhet med specialiserade AI-agenter som arbetar dygnet runt. Se dem i arbete direkt på skärmen.
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            <button
                                onClick={() => navigate('/agents')}
                                className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-105 flex items-center justify-center gap-2"
                            >
                                <Bot className="w-5 h-5" />
                                Starta ditt team
                            </button>
                            <button
                                onClick={() => navigate('/solutions')}
                                className="px-8 py-4 bg-white/5 backdrop-blur-md text-white border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                            >
                                <Play className="w-5 h-5 fill-current" />
                                Se live demo
                            </button>
                        </motion.div>
                    </div>

                </div>
            </div>

            {/* Floating Agent Task Cards - Positioned Carefully over the Image Empty Spaces */}

            {/* 1. Hunter (Sales) - Top Right Area */}
            <FloatingTaskCard
                agentImg={hunterAgent}
                name="Hunter"
                task="Möte bokat: VD på TechCorp"
                stats="Potentiellt värde: 50.000 kr"
                delay={1.2}
                positionClass="top-[25%] right-[5%]"
            />

            {/* 2. Nova (Support) - Middle Right (Near Hand/Laptop) */}
            <FloatingTaskCard
                agentImg={novaAgent}
                name="Nova"
                task="Löste ärende #402"
                stats="Svarstid: 30 sekunder"
                delay={1.5}
                positionClass="top-[50%] right-[20%]"
            />

            {/* 3. Soshie (Social) - Bottom Right */}
            <FloatingTaskCard
                agentImg={soshieAgent}
                name="Soshie"
                task="Publicerade LinkedIn Kampanj"
                stats="125 klick första timmen"
                delay={1.8}
                positionClass="bottom-[15%] right-[8%]"
            />

            {/* 4. Atlas (Code) - Top Center/Right - MOVED from top over head */}
            <FloatingTaskCard
                agentImg={atlasAgent}
                name="Atlas"
                task="Systemoptimering Slutförd"
                stats="Prestanda ökad med 25%"
                delay={2.1}
                positionClass="top-[10%] right-[18%]"
            />

        </section>
    );
};

export default Hero;

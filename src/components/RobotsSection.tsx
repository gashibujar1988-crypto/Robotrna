import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Search, Calendar, Target, Headset, Palette, Briefcase, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { agents } from '../data/agents';

// Map icon strings (if I stored them as strings in JSON) or just map manually since icons are components.
// Since agents.ts doesn't store the icon component itself (it stores strings/data), I'll map them here based on ID or Role.
// Wait, my agents.ts didn't include the Icon Component. I should map it here.

const iconMap: Record<string, any> = {
    '1': MessageCircle,
    '2': Search,
    '3': Calendar,
    '4': Target,
    '5': Headset,
    '6': Palette,
    '7': Briefcase,
    '8': Globe,
    '9': Briefcase,
    '10': Headset
};

const RobotsSection: React.FC = () => {
    return (
        <section id="robots" className="py-24 relative overflow-hidden bg-white">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Möt Ditt Nya <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">AI-Team</span></h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Specialiserade AI-agenter med unika personligheter och färdigheter, redo att automatisera din verksamhet.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {agents.map((agent, i) => {
                        const Icon = iconMap[agent.id] || Globe;

                        return (
                            <motion.div
                                key={agent.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="group relative"
                            >
                                <Link to={`/agent/${agent.id}`} className="block h-full">
                                    <div className="card h-full flex flex-col items-center text-center p-6 border border-blue-900 bg-[#172554] hover:bg-[#1e3a8a] hover:border-blue-700 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 rounded-3xl">

                                        <div className="relative w-32 h-32 mb-6 group-hover:scale-105 transition-transform duration-500">
                                            <div className={`absolute inset-0 bg-gradient-to-r ${agent.gradient} opacity-20 blur-[30px] rounded-full group-hover:opacity-40 transition-opacity`} />
                                            <img
                                                src={agent.image}
                                                alt={agent.name}
                                                className="w-full h-full object-cover rounded-full border border-blue-900 shadow-xl relative z-10 bg-[#172554]"
                                            />
                                        </div>

                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 backdrop-blur-sm">
                                            <Icon className={`w-3 h-3 ${agent.color}`} />
                                            <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">{agent.role.split(' ')[0]}</span>
                                        </div>

                                        <h3 className="text-xl font-bold mb-2 text-white">{agent.name}</h3>
                                        <p className="text-white/50 text-sm mb-6 leading-relaxed line-clamp-3">
                                            {agent.shortDescription}
                                        </p>

                                        <div className="mt-auto w-full">
                                            <div
                                                className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-white/5 hover:bg-white/10 border border-white/5 text-white text-sm group-hover:border-white/20"
                                            >
                                                Läs mer <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default RobotsSection;

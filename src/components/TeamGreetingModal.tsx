import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface TeamGreetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
}

const TeamGreetingModal: React.FC<TeamGreetingModalProps> = ({ isOpen, onClose, userName }) => {
    if (!isOpen) return null;

    // Agent Data for Greeting
    const agents = [
        {
            name: 'Dexter',
            role: 'Executive Assistant',
            message: `Välkommen ${userName || 'Chef'}! Jag är Dexter, din koordinator. Jag har precis synkat din kalender och rensat bort 14 oviktiga mail så att du kan fokusera på det som betyder mest idag. Mitt team står redo – vad vill du prioritera först?`,
            image: '/assets/robot_dexter.png', // Fallback path
            color: 'bg-blue-50 text-blue-900 border-blue-100',
            iconColor: 'bg-blue-500'
        },
        {
            name: 'Hunter',
            role: 'Sales Director',
            message: "Hej! Hunter här. Medan Dexter satte upp ditt konto passade jag på att identifiera 3 heta leads i din bransch som vi borde kontakta direkt. Vill du se utkasten jag förberett?",
            image: '/assets/robot_hunter.png',
            color: 'bg-purple-50 text-purple-900 border-purple-100',
            iconColor: 'bg-purple-500'
        },
        {
            name: 'Brainy',
            role: 'Head of Research',
            message: "Och jag är Brainy. Jag har redan gjort en snabbanalys av din marknadsposition. Det finns en ny trend inom din bransch som vi kan utnyttja för att få ett försprång. Jag har lagt detaljerna i din Research-lab.",
            image: '/assets/robot_brainy.png',
            color: 'bg-emerald-50 text-emerald-900 border-emerald-100',
            iconColor: 'bg-emerald-500'
        }
    ];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative"
                >
                    {/* Header */}
                    <div className="bg-gray-900 p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-indigo-900 opacity-90"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Välkommen till Teamet</h2>
                            <p className="text-purple-200 text-lg">Dina 3 dedikerade AI-agenter är redan igång.</p>
                        </div>
                    </div>

                    <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                        {agents.map((agent, i) => (
                            <motion.div
                                key={agent.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.4 }}
                                className={`flex gap-4 p-4 rounded-2xl border ${agent.color}`}
                            >
                                <div className={`w-12 h-12 rounded-full ${agent.iconColor} flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0`}>
                                    {agent.name[0]}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg">{agent.name}</h3>
                                        <span className="text-xs uppercase tracking-wider font-bold opacity-60 bg-white/50 px-2 py-0.5 rounded-full">{agent.role}</span>
                                    </div>
                                    <p className="text-sm font-medium leading-relaxed opacity-90">"{agent.message}"</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={onClose}
                            className="bg-gray-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                        >
                            Nu kör vi! <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TeamGreetingModal;

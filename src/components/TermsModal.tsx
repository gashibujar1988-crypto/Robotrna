import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, FileText } from 'lucide-react';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'terms' | 'privacy';
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, type }) => {
    const title = type === 'terms' ? 'Allmänna Villkor' : 'Integritetspolicy';
    const icon = type === 'terms' ? <FileText className="w-6 h-6 text-purple-400" /> : <Shield className="w-6 h-6 text-green-400" />;

    const content = type === 'terms' ? (
        <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
            <h4 className="font-bold text-white text-lg">1. Tjänstens Omfattning</h4>
            <p>Robotrna tillhandahåller AI-baserade automationstjänster. Genom att prenumerera godkänner du att våra digitala agenter behandlar den data du tillhandahåller.</p>

            <h4 className="font-bold text-white text-lg">2. Betalning & Prenumeration</h4>
            <p>Betalning sker månadsvis i förskott. Ingen bindningstid tillämpas om inget annat avtalats. Uppsägning kan ske när som helst och träder i kraft vid nästa periodskifte.</p>

            <h4 className="font-bold text-white text-lg">3. Ansvarsbegränsning</h4>
            <p>Även om våra AI-agenter är avancerade, ansvarar Robotrna inte för direkta eller indirekta skador som uppstår till följd av deras handlingar eller beslut. Slutgsiltigt ansvar för publicerat material och affärsbeslut ligger hos kunden.</p>

            <h4 className="font-bold text-white text-lg">4. Tillgänglighet (SLA)</h4>
            <p>Vi strävar efter 99.9% upptid. Vid planerade driftstopp meddelas detta i förväg.</p>
        </div>
    ) : (
        <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
            <h4 className="font-bold text-white text-lg">1. Datainsamling</h4>
            <p>Vi samlar in information nödvändig för att leverera tjänsten, inklusive e-post, företagsnamn och data du laddar upp till din "Brain".</p>

            <h4 className="font-bold text-white text-lg">2. AI & Tredje Part</h4>
            <p>Din data kan komma att processas av betrodda tredje parter (t.ex. Google Cloud, OpenAI) för att generera AI-svar. Vi säljer aldrig din data till annonsörer.</p>

            <h4 className="font-bold text-white text-lg">3. Säkerhet</h4>
            <p>All data krypteras både vid överföring och lagring (AES-256). Endast behörig personal och dina tilldelade AI-agenter har tillgång till din data.</p>

            <h4 className="font-bold text-white text-lg">4. Rätten att bli glömd</h4>
            <p>Du kan när som helst begära att vi raderar all din data från våra system genom att kontakta supporten.</p>
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-[#0f1115] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-lg border border-white/5">
                                        {icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-white">{title}</h3>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="p-8 overflow-y-auto custom-scrollbar bg-[#0a0a0a]">
                                {content}
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Stäng
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default TermsModal;

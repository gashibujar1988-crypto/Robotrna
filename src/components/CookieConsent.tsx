import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Check, Shield } from 'lucide-react';

const CookieConsent: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('robotrna_cookie_consent');
        if (!consent) {
            // Delay visibility slightly for better UX
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('robotrna_cookie_consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('robotrna_cookie_consent', 'declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 flex justify-center pointer-events-none"
                >
                    <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col md:flex-row items-start md:items-center gap-5 pointer-events-auto relative overflow-hidden group">

                        {/* Glowing Background Effect */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/20 transition-all duration-700"></div>

                        {/* Icon */}
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 shrink-0">
                            <Cookie className="w-6 h-6 text-cyan-400" />
                        </div>

                        {/* Text */}
                        <div className="flex-1 space-y-1">
                            <h3 className="text-white font-bold text-base flex items-center gap-2">
                                Cookies & Dataintegritet
                                <Shield className="w-3 h-3 text-green-400" />
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Vi använder cookies för att optimera Robotrna och ge dig en personlig upplevelse.
                                Genom att fortsätta godkänner du vår hantering av data.
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                            <button
                                onClick={handleDecline}
                                className="px-4 py-2.5 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex-1 md:flex-none border border-transparent hover:border-white/10"
                            >
                                Avvisa
                            </button>
                            <button
                                onClick={handleAccept}
                                className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-white hover:bg-cyan-50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] flex-1 md:flex-none"
                            >
                                <Check className="w-4 h-4" />
                                Acceptera
                            </button>
                        </div>

                        <button
                            onClick={handleDecline}
                            className="absolute top-2 right-2 p-1 text-gray-500 hover:text-white transition-colors md:hidden"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieConsent;

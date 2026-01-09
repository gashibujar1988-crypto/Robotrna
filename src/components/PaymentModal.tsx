import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Check, Wallet } from 'lucide-react';
import TermsModal from './TermsModal';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    agentName: string; // Used as "Plan name" in this context
    price: string;
    onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, agentName, price, onSuccess }) => {
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Terms & Conditions State
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [termsModalOpen, setTermsModalOpen] = useState(false);
    const [termsType, setTermsType] = useState<'terms' | 'privacy'>('terms');

    const paymentMethods = [
        { id: 'apple_pay', name: 'Apple Pay', icon: '🍎', color: 'bg-black text-white hover:bg-gray-800' },
        { id: 'google_pay', name: 'Google Pay', icon: '🇬', color: 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50' },
        { id: 'paypal', name: 'PayPal', icon: '🅿️', color: 'bg-[#0079C1] text-white hover:bg-[#005ea6]' },
        { id: 'swish', name: 'Swish', icon: '⚪', color: 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50' },
        { id: 'vipps', name: 'Vipps', icon: '🟠', color: 'bg-[#ff5b24] text-white hover:bg-[#e04512]' },
        { id: 'card', name: 'Kortbetalning', icon: <CreditCard className="w-5 h-5" />, color: 'bg-indigo-600 text-white hover:bg-indigo-700' },
    ];

    const handlePay = () => {
        if (!selectedMethod || !acceptedTerms) return;
        setIsProcessing(true);

        // Simulate API call and Backend Log
        console.log(`[BACKEND LOG] User accepted terms v1.0 at ${new Date().toISOString()}`);
        console.log(`[BACKEND LOG] Processing payment for ${agentName} via ${selectedMethod}`);

        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
            setTimeout(() => {
                onSuccess();
            }, 1500);
        }, 2000);
    };

    const openTerms = (type: 'terms' | 'privacy') => {
        setTermsType(type);
        setTermsModalOpen(true);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="overflow-y-auto custom-scrollbar">
                                {/* Header */}
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Välj {agentName}</h3>
                                        <p className="text-sm text-gray-500">Slutför din beställning säkert</p>
                                    </div>
                                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-4">
                                    {!isSuccess ? (
                                        <>
                                            <div className="grid grid-cols-1 gap-3">
                                                {paymentMethods.map((method) => (
                                                    <button
                                                        key={method.id}
                                                        onClick={() => setSelectedMethod(method.id)}
                                                        className={`
                                                    relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-200
                                                    ${selectedMethod === method.id ? 'ring-2 ring-purple-600 ring-offset-2 scale-[1.02]' : 'hover:scale-[1.01]'}
                                                    ${method.color}
                                                `}
                                                    >
                                                        <div className="w-8 h-8 flex items-center justify-center text-xl shrink-0">
                                                            {typeof method.icon === 'string' ? method.icon : method.icon}
                                                        </div>
                                                        <span className="font-bold flex-1 text-left">{method.name}</span>
                                                        {selectedMethod === method.id && (
                                                            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white">
                                                                <Check className="w-3.5 h-3.5" />
                                                            </div>
                                                        )}
                                                        {method.id === 'swish' && (
                                                            <span className="text-xs font-bold text-gray-400 absolute right-12">SE</span>
                                                        )}
                                                        {method.id === 'vipps' && (
                                                            <span className="text-xs font-bold text-white/50 absolute right-12">NO</span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Terms Checkbox */}
                                            <div className="flex items-start gap-3 mt-6 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="pt-0.5">
                                                    <input
                                                        type="checkbox"
                                                        id="terms"
                                                        checked={acceptedTerms}
                                                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                                                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                                    />
                                                </div>
                                                <label htmlFor="terms" className="text-xs text-gray-500 cursor-pointer select-none leading-relaxed">
                                                    Jag godkänner Bora Ais <button onClick={() => openTerms('terms')} className="text-purple-600 font-bold hover:underline">Allmänna Villkor</button> och <button onClick={() => openTerms('privacy')} className="text-purple-600 font-bold hover:underline">Integritetspolicy</button>. Jag förstår att tjänsten startar omedelbart.
                                                </label>
                                            </div>

                                            <div className="mt-6 pt-6 border-t border-gray-100">
                                                <div className="flex justify-between items-center mb-6">
                                                    <span className="text-gray-500">Totalt att betala</span>
                                                    <div className="text-right">
                                                        <span className="text-2xl font-bold text-gray-900">{price}</span>
                                                        <span className="text-sm text-gray-400">/månad</span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handlePay}
                                                    disabled={!selectedMethod || isProcessing || !acceptedTerms}
                                                    className={`
                                                w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all
                                                flex items-center justify-center gap-2
                                                ${(!selectedMethod || isProcessing || !acceptedTerms) ? 'bg-gray-300 cursor-not-allowed grayscale' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl hover:-translate-y-0.5'}
                                            `}
                                                >
                                                    {isProcessing ? (
                                                        <span className="animate-pulse">Bearbetar...</span>
                                                    ) : (
                                                        <>
                                                            <Wallet className="w-5 h-5" />
                                                            Slutför Köp
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="py-12 flex flex-col items-center justify-center text-center">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6"
                                            >
                                                <Check className="w-12 h-12" />
                                            </motion.div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Betalning Godkänd!</h3>
                                            <p className="text-gray-500">Välkommen till framtiden.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer Trust Badges */}
                                {!isSuccess && (
                                    <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t border-gray-100 italic">
                                        Säkrad med 256-bit SSL kryptering. 100% nöjd kund-garanti.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Terms Modal Overlay */}
                    <TermsModal
                        isOpen={termsModalOpen}
                        onClose={() => setTermsModalOpen(false)}
                        type={termsType}
                    />
                </>
            )}
        </AnimatePresence>
    );
};

export default PaymentModal;

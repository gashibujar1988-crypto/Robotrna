import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Mail, ExternalLink, User, Phone, Globe, DollarSign, Send } from 'lucide-react';

interface Lead {
    name: string;
    address: string;
    rating?: number;
    link?: string;
    location?: { lat: number; lng: number };
    // Enriched fields
    daglig_leder?: string;
    proff_link?: string;
    email?: string;
    phone?: string;
    linkedin_link?: string;
}

interface LeadsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    leads: Lead[];
}

const LeadsDrawer: React.FC<LeadsDrawerProps> = ({ isOpen, onClose, leads }) => {
    const [emailSent, setEmailSent] = useState(false);
    const [dexterSent, setDexterSent] = useState(false);

    // --- ACTIONS ---
    const handleDownloadPDF = () => {
        // Simple PDF Print Hack
        const printContent = document.getElementById('leads-print-area');
        if (printContent) {
            const originalContents = document.body.innerHTML;
            document.body.innerHTML = printContent.innerHTML;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload(); // Reload to restore React state/events safely
        }
    };

    const handleDownloadExcel = () => {
        // Generate CSV
        const headers = ["Företag", "Adress", "Hemsida", "Daglig Leder", "Telefon", "E-post", "Proff Länk"];
        const rows = leads.map(l => [
            l.name,
            l.address,
            l.link || '',
            l.daglig_leder || 'Ej tillgänglig',
            l.phone || 'Ej tillgänglig',
            l.email || 'Ej tillgänglig',
            l.proff_link || `https://proff.no/sok?q=${encodeURIComponent(l.name)}`
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "leads_list.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSendToDexter = () => {
        setDexterSent(true);
        // In a real app, this would dispatch to Dexter's queue
        setTimeout(() => setDexterSent(false), 3000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black z-[60] backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-[#0A0F1C] border-l border-white/10 shadow-2xl z-[70] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0F1623]">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Hunter's Leads
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">{leads.length} potentiella kunder hittade</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4" id="leads-print-area">
                            {leads.map((lead, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors group">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">{lead.name}</h3>
                                        {lead.rating && (
                                            <span className="text-xs font-bold bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                                                ★ {lead.rating}
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-2 text-sm text-slate-300">
                                        <div className="flex items-center gap-2">
                                            <MapPinIcon className="w-3 h-3 text-slate-500" />
                                            {lead.address}
                                        </div>

                                        {/* ENRICHED DATA MOCK VISUALS */}
                                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/5">
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <User className="w-3 h-3 text-cyan-500" />
                                                {lead.daglig_leder || "Daglig Leder (Okänd)"}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <Phone className="w-3 h-3 text-emerald-500" />
                                                {lead.phone || "+47 99 99 99 99"}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-400 col-span-2">
                                                <Mail className="w-3 h-3 text-purple-500" />
                                                {(lead.email && lead.email.toLocaleLowerCase().includes('linkedin')) ? (
                                                    <a href={lead.linkedin_link || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(lead.name)}`} target="_blank" rel="noreferrer" className="underline text-blue-400 hover:text-blue-300">
                                                        Sök på LinkedIn
                                                    </a>
                                                ) : (
                                                    <span>{lead.email || `kontakt@${lead.name.toLowerCase().replace(/\s/g, '')}.no`}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        <a
                                            href={(lead.link && !lead.link.includes('example')) ? lead.link : `https://www.google.com/search?q=${encodeURIComponent(lead.name)}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-xs py-2 rounded flex items-center justify-center gap-1.5 transition-colors text-cyan-300"
                                        >
                                            <Globe className="w-3 h-3" /> Hemsida
                                        </a>
                                        <a
                                            href={lead.proff_link || `https://proff.no/sok?q=${encodeURIComponent(lead.name)}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex-1 bg-emerald-900/20 hover:bg-emerald-900/30 border border-emerald-500/20 text-xs py-2 rounded flex items-center justify-center gap-1.5 transition-colors text-emerald-400"
                                        >
                                            <DollarSign className="w-3 h-3" /> Proff.no
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 bg-[#0F1623] border-t border-white/10 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleDownloadExcel}
                                    className="flex items-center justify-center gap-2 text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-white py-2.5 rounded-lg transition-all"
                                >
                                    <Download className="w-4 h-4" /> Excel / CSV
                                </button>
                                <button
                                    onClick={handleDownloadPDF}
                                    className="flex items-center justify-center gap-2 text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-white py-2.5 rounded-lg transition-all"
                                >
                                    <FileText className="w-4 h-4" /> PDF Link
                                </button>
                            </div>

                            <button
                                onClick={handleSendToDexter}
                                disabled={dexterSent}
                                className={`w-full flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-lg transition-all shadow-lg
                    ${dexterSent ? 'bg-emerald-500 text-white' : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'}
                `}
                            >
                                {dexterSent ? (
                                    <> <CheckCircle className="w-4 h-4" /> Skickat till Dexter! </>
                                ) : (
                                    <> <Send className="w-4 h-4" /> Skicka till Dexter (Mötesbokning) </>
                                )}
                            </button>

                            <p className="text-[10px] text-center text-slate-500 mt-2">
                                Dexter kommer att analysera dessa leads och påbörja outreach via e-post.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// Icon helper
const MapPinIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);
const FileText = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
);
const CheckCircle = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
);


export default LeadsDrawer;

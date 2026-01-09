import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Mail, User, Phone, Globe, DollarSign, Send, CheckCircle, Loader2 } from 'lucide-react';
import { onSnapshot, doc } from 'firebase/firestore';
import { n8n } from '../api/client';
import { db } from '../firebase';

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
    types?: string[];
}

interface LeadsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    leads: Lead[];
}

const LeadsDrawer: React.FC<LeadsDrawerProps> = ({ isOpen, onClose, leads }) => {
    const [dexterSent, setDexterSent] = useState(false); // Slutgiltig bekräftelse
    const [isGenerating, setIsGenerating] = useState(false);
    const [drafts, setDrafts] = useState<any[]>([]);
    const [showDrafts, setShowDrafts] = useState(false);
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

    // --- MOCK ORACLE / N8N INTEGRATIONS ---

    // 1. Simulate Polling Oracle for Drafts (Triggered by 'email_draft' appearing)
    useEffect(() => {
        let interval: any;
        if (isGenerating && activeTaskId) {
            interval = setInterval(async () => {
                // Mock: Check GLOBAL_MEMORY_HUB WHERE task_id = activeTaskId AND data_type = 'email_draft'
                console.log(`[Oracle] Polling for drafts (Task: ${activeTaskId})...`);

                // Simulate finding drafts after 3 seconds
                const mockDraftsFound = [
                    {
                        id: 'draft-1',
                        emailTo: 'kontakt@technova.no',
                        leadName: 'TechNova AS',
                        subject: 'Samarbete kring AI-integration?',
                        content: "Hej!\n\nJag såg er senaste lansering av 'FutureTech' – imponerande hastighet! 🚀\n\nPå Bora Ai hjälper vi bolag som TechNova att automatisera just den typen av workflows. Skulle ni vara öppna för en 15-min demo?\n\n/Hunter"
                    },
                    {
                        id: 'draft-2',
                        emailTo: 'vd@greenfuture.se',
                        leadName: 'GreenFuture AB',
                        subject: 'Effektivisering av er sälj-pipeline',
                        content: "Hej Anders,\n\nLäste om ert hållbarhetsmål 2026. Vi har en lösning (Dexter) som kan frigöra 20h/vecka för säljteamet att fokusera på just det målet.\n\nHörs gärna,\nHunter"
                    }
                ];

                if (mockDraftsFound.length > 0) {
                    clearInterval(interval);
                    setDrafts(mockDraftsFound);
                    setIsGenerating(false);
                    setShowDrafts(true); // AUTO-OPEN POPUP
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isGenerating, activeTaskId]);

    const handleGenerateDrafts = async () => {
        setIsGenerating(true);
        const newTaskId = `task-${Date.now()}`;
        setActiveTaskId(newTaskId);

        try {
            // Trigger n8n Dexter workflow
            await n8n.triggerDexter(leads, newTaskId);

            // Lyssna på resultat från Firestore
            const unsubscribe = onSnapshot(
                doc(db, 'n8n_results', newTaskId),
                (docSnap) => {
                    const data = docSnap.data();
                    if (data && data.status === 'READY' && data.type === 'email_draft') {
                        const parsedDrafts = data.payload?.drafts || [];
                        setDrafts(parsedDrafts);
                        setIsGenerating(false);
                        setShowDrafts(true);
                        unsubscribe();
                    }
                },
                (error) => {
                    console.error('Firestore listener error:', error);
                    setIsGenerating(false);
                }
            );

            // Timeout efter 2 minuter
            setTimeout(() => {
                if (isGenerating) {
                    setIsGenerating(false);
                    alert('Dexter tar längre tid än förväntat. Kolla igen om en stund.');
                }
            }, 120000);

        } catch (error: any) {
            console.error('Failed to trigger Dexter:', error);
            alert(`Error: ${error.message}`);
            setIsGenerating(false);
        }
    };

    const handleConfirmSend = async () => {
        // 1. Trigger Oracle Update: UPDATE STATUS = 'APPROVED'
        console.log(`[Oracle] UPDATE GLOBAL_MEMORY_HUB SET status = 'APPROVED' WHERE task_id = '${activeTaskId}'`);

        // 2. This DB change would auto-trigger the next n8n step (Send Email)
        console.log(`[n8n] Trigger: Send Email Loop startad...`);

        // UI Feedback
        setShowDrafts(false);
        setDexterSent(true);
        setActiveTaskId(null); // Reset
        setTimeout(() => setDexterSent(false), 5000);
    };

    // --- ACTIONS ---
    const handleDownloadPDF = () => {
        const printContent = document.getElementById('leads-print-area');
        if (printContent) {
            const originalContents = document.body.innerHTML;
            document.body.innerHTML = printContent.innerHTML;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload();
        }
    };

    const handleDownloadExcel = () => {
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
                        className="fixed top-0 right-0 h-full w-full md:w-[600px] bg-[#0A0F1C] border-l border-white/10 shadow-2xl z-[70] flex flex-col"
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
                                onClick={handleGenerateDrafts}
                                disabled={dexterSent || isGenerating}
                                className={`w-full flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-lg transition-all shadow-lg
                                    ${dexterSent ? 'bg-emerald-500 text-white cursor-default' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'}
                                    ${isGenerating ? 'opacity-80 cursor-wait' : ''}
                                `}
                            >
                                {dexterSent ? (
                                    <> <CheckCircle className="w-4 h-4" /> Kampanj Startad! (Kolla email-loggar) </>
                                ) : isGenerating ? (
                                    <> <Loader2 className="w-4 h-4 animate-spin" /> Dexter analyserar & skriver... </>
                                ) : (
                                    <> <Send className="w-4 h-4" /> Skicka till Dexter (Mötesbokning) </>
                                )}
                            </button>

                            <p className="text-[10px] text-center text-slate-500 mt-2">
                                Dexter kommer att analysera dessa leads och skapa personliga utkast som du får godkänna.
                            </p>
                        </div>
                    </motion.div>

                    {/* DRAFTS REVIEW MODAL */}
                    {showDrafts && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none"
                        >
                            <div className="bg-[#111] w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl border border-white/20 flex flex-col pointer-events-auto overflow-hidden">
                                <div className="p-6 border-b border-white/10 bg-[#161b22] flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Dexter's Drafts</h3>
                                        <p className="text-sm text-gray-400">Review generated emails before sending</p>
                                    </div>
                                    <button onClick={() => setShowDrafts(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0d1117]">
                                    {drafts.map((draft, i) => (
                                        <div key={i} className="bg-[#1c2128] rounded-xl p-4 border border-white/10">
                                            <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-2">
                                                <span className="text-indigo-400 font-bold text-sm">To: {draft.emailTo}</span>
                                                <span className="text-xs text-gray-500 bg-black/30 px-2 py-1 rounded">{draft.leadName}</span>
                                            </div>
                                            <div className="mb-2">
                                                <span className="text-gray-500 text-xs uppercase font-bold">Subject:</span>
                                                <div className="text-white text-sm font-medium">{draft.subject}</div>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 text-xs uppercase font-bold">Body:</span>
                                                <div className="text-gray-300 text-sm whitespace-pre-wrap font-mono bg-black/20 p-3 rounded-lg border border-white/5 mt-1">
                                                    {draft.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-6 border-t border-white/10 bg-[#161b22] flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowDrafts(false)}
                                        className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmSend}
                                        className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold flex items-center gap-2"
                                    >
                                        <Send className="w-4 h-4" /> Approve & Send All
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </>
            )}
        </AnimatePresence>
    );
};

// Icon helpers
const MapPinIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);
const FileText = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
);

export default LeadsDrawer;

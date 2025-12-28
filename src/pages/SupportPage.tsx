
import { ArrowLeft, ExternalLink, MessageSquarePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SupportPage = () => {
    const navigate = useNavigate();
    const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/1_OyHLs8CYhZo6qHXwVdeK7Iv_qiVk5UouLQBLb6LQb4/viewform?embedded=true";

    // Fallback if iframe fails or is blocked
    const openExternal = () => {
        window.open(GOOGLE_FORM_URL.replace("?embedded=true", ""), "_blank");
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-4xl flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Tillbaka till Dashboard
                </button>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    Supportcenter
                </h1>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-4xl bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">

                {/* Top Bar inside Card */}
                <div className="bg-[#1a1a1a] p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <MessageSquarePlus className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-white">Skapa nytt ärende</h2>
                            <p className="text-xs text-white/50">Beskriv ditt problem så hjälper vi dig direkt.</p>
                        </div>
                    </div>
                    <button
                        onClick={openExternal}
                        className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        Öppna i nytt fönster <ExternalLink className="w-3 h-3" />
                    </button>
                </div>

                {/* Iframe Container */}
                <div className="w-full h-[800px] bg-white relative">
                    <iframe
                        src={GOOGLE_FORM_URL}
                        width="100%"
                        height="100%"
                        className="border-none"
                        title="Support Form"
                    >Laddar...</iframe>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;

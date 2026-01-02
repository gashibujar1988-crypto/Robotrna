import React from 'react';

interface Discussion {
    brain_feed: { agent: string; message: string; timestamp: string }[];
    consensus_reached: boolean;
}

interface FinalConsensusViewProps {
    discussion: Discussion;
    onReset: () => void;
}

const FinalConsensusView: React.FC<FinalConsensusViewProps> = ({ discussion, onReset }) => {
    // Hämta det sista meddelandet från Synthesizer som innehåller lösningen
    const finalOutput = discussion.brain_feed
        .filter((m: any) => m.agent === "High_Council_Synthesizer")
        .pop();

    const handleDownload = () => {
        if (!finalOutput?.message) return;

        const element = document.createElement("a");
        const file = new Blob([finalOutput.message], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "Mother_Hive_Strategy.txt";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        document.body.removeChild(element);
    }

    return (
        <div className="relative z-30 bg-gradient-to-br from-violet-900/40 to-black border-2 border-yellow-500/50 rounded-xl p-8 shadow-[0_0_30px_rgba(212,175,55,0.2)] animate-fade-in-up">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.5)]">
                    <span className="text-black font-bold text-xl">Σ</span>
                </div>
                <div>
                    <h2 className="text-yellow-500 font-bold text-2xl uppercase tracking-tighter">Final Strategy Approved</h2>
                    <p className="text-gray-400 text-sm italic">Verified by The High Council Logic</p>
                </div>
                <button
                    onClick={onReset}
                    className="ml-auto text-gray-500 hover:text-white transition-colors"
                    title="Close and Start New Mission"
                >
                    ✕
                </button>
            </div>

            <div className="prose prose-invert max-w-none mb-8">
                <p className="text-lg leading-relaxed text-white whitespace-pre-wrap select-text">
                    {finalOutput?.message || "Synthesizing final results..."}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-yellow-500/20 pt-6">
                <div className="text-center">
                    <span className="block text-yellow-500 text-xs uppercase mb-1">Architect</span>
                    <span className="text-green-500 text-sm font-mono">● STRUCTURE VERIFIED</span>
                </div>
                <div className="text-center border-x border-yellow-500/10">
                    <span className="block text-yellow-500 text-xs uppercase mb-1">Critic</span>
                    <span className="text-green-500 text-sm font-mono">● QUALITY CHECKED</span>
                </div>
                <div className="text-center">
                    <span className="block text-yellow-500 text-xs uppercase mb-1">Synthesizer</span>
                    <span className="text-green-500 text-sm font-mono">● OUTPUT READY</span>
                </div>
            </div>

            <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center relative z-40">
                <button
                    onClick={handleDownload}
                    className="relative z-50 cursor-pointer bg-yellow-500 text-black px-6 py-3 rounded-full font-bold hover:bg-yellow-400 transition-all shadow-lg hover:shadow-yellow-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                    DOWNLOAD FULL PACKAGE
                </button>
                <button
                    onClick={onReset}
                    className="relative z-50 cursor-pointer border border-green-500 text-green-500 px-6 py-3 rounded-full font-bold hover:bg-green-500/10 transition-all active:scale-95"
                >
                    START NEW MISSION
                </button>
            </div>
        </div>
    );
};

export default FinalConsensusView;

import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

import FinalConsensusView from './FinalConsensusView';

interface BrainFeedProps {
    taskId: string;
    onReset: () => void;
}

const BrainFeed: React.FC<BrainFeedProps> = ({ taskId, onReset }) => {
    const [discussion, setDiscussion] = useState<any>(null);
    const feedLengthRef = React.useRef(0);

    const playNotification = () => {
        const audio = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-click-900.mp3"); // Example Sci-Fi beep
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio autoplay prevented", e));
    };

    useEffect(() => {
        // Lyssna på diskussionen i realtid från Firestore
        const unsub = onSnapshot(doc(db, "task_discussions", taskId), (doc) => {
            const data = doc.data();
            setDiscussion(data);

            // Sound effect logic
            const feed = data?.brain_feed;
            if (feed && feed.length > feedLengthRef.current) {
                const lastMsg = feed[feed.length - 1];
                if (lastMsg.agent.includes("High_Council")) {
                    playNotification();
                }
                feedLengthRef.current = feed.length;
            }
        });
        return () => unsub();
    }, [taskId]);

    if (!discussion) return <div className="text-yellow-500 font-mono text-xs">Initializing Mother Hive Core...</div>;

    if (discussion.consensus_reached) {
        return <FinalConsensusView discussion={discussion} onReset={onReset} />;
    }

    return (
        <div className="bg-black/50 border border-violet-500/30 rounded-lg p-4 font-mono text-sm shadow-xl backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4 border-b border-violet-500/20 pb-2">
                <h3 className="text-violet-400 uppercase tracking-widest font-bold text-xs md:text-sm">Brain-Feed: High Council Meeting</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${discussion.consensus_reached ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-500 animate-pulse"}`}>
                    {discussion.consensus_reached ? "● CONSENSUS REACHED" : "● DISCUSSION IN PROGRESS"}
                </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-violet-500/30 scrollbar-track-transparent">
                {discussion.brain_feed.map((entry: any, index: number) => (
                    <div key={index} className={`p-3 rounded-lg border-l-4 transition-all duration-300 hover:bg-white/5 ${getAgentStyle(entry.agent)}`}>
                        <div className="flex justify-between text-[10px] uppercase opacity-70 mb-1 font-semibold tracking-wider">
                            <span>{entry.agent}</span>
                            <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-gray-200 leading-relaxed">{entry.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Hjälpfunktion för att ge olika agenter olika färger i UI:t
const getAgentStyle = (agent: string) => {
    if (agent.includes("High_Council")) return "border-yellow-500 bg-yellow-500/5 text-yellow-100";
    if (agent.includes("Hunter")) return "border-green-500 bg-green-500/5 text-green-100";
    if (agent.includes("Pixel")) return "border-blue-500 bg-blue-500/5 text-blue-100";
    if (agent.includes("Soshie")) return "border-pink-500 bg-pink-500/5 text-pink-100";
    if (agent.includes("Ledger")) return "border-emerald-500 bg-emerald-500/5 text-emerald-100";
    if (agent.includes("Atlas")) return "border-cyan-500 bg-cyan-500/5 text-cyan-100";
    if (agent.includes("Lex")) return "border-red-500 bg-red-500/5 text-red-100";
    if (agent.includes("Sage")) return "border-purple-500 bg-purple-500/5 text-purple-100";
    if (agent.includes("Spark")) return "border-orange-500 bg-orange-500/5 text-orange-100";
    if (agent.includes("Echo")) return "border-teal-500 bg-teal-500/5 text-teal-100";
    return "border-gray-500 bg-gray-500/5 text-gray-200";
};

export default BrainFeed;

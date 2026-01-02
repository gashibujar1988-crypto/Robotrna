import React, { useState } from 'react';
import { agents } from '../data/agents';
import { TrendingUp, Edit2, Send, MessageSquare, ThumbsUp } from 'lucide-react';

const SoshieWorkspace: React.FC = () => {
    // Dummy state for demonstration
    const [activeFeed, setActiveFeed] = useState('001');

    // Hämta Soshie och hennes sub-agenter
    const soshie = agents.find(a => a.name === 'Soshie');
    const subAgents = soshie?.subAgents || [];

    // Dummy data för sociala feeds
    const feeds = [
        { id: '001', network: 'LinkedIn', title: 'AI Revolution in Oslo', status: 'Action Required', comments: 12 },
        { id: '002', network: 'Facebook', title: 'Campanj: Sommarledigt', status: 'Posted', comments: 45 },
        { id: '003', network: 'Instagram', title: 'Reel: Office Tour', status: 'Drafting', comments: 0 },
    ];

    const currentPost = feeds.find(f => f.id === activeFeed);

    return (
        <div className="flex bg-[#0a0a0c] text-white font-sans h-full overflow-hidden rounded-3xl relative z-10">
            {/* VÄNSTER: FEED SELECTOR */}
            <div className="w-80 border-r border-white/10 bg-[#0d0d10] flex flex-col">
                <div className="p-5 border-b border-white/10 flex justify-between items-center">
                    <div>
                        <h2 className="text-pink-400 font-bold uppercase text-xs tracking-widest mb-1">Social Inbox</h2>
                        <span className="text-gray-500 text-[10px] font-medium">Soshie Manager</span>
                    </div>
                    <span className="bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded text-[10px] font-bold">4 LIVE</span>
                </div>
                <div className="overflow-y-auto flex-1 p-3 space-y-2 custom-scrollbar">
                    {feeds.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setActiveFeed(item.id)}
                            className={`p-4 rounded-xl cursor-pointer transition-all border ${activeFeed === item.id
                                ? 'bg-pink-500/10 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.1)]'
                                : 'bg-[#15151a] border-transparent hover:bg-white/5 hover:border-white/10'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${item.network === 'LinkedIn' ? 'bg-blue-900/40 text-blue-400' :
                                    item.network === 'Facebook' ? 'bg-indigo-900/40 text-indigo-400' :
                                        'bg-purple-900/40 text-purple-400'
                                    }`}>
                                    {item.network}
                                </span>
                                <span className="text-[10px] text-gray-400">{item.comments} <MessageSquare className="w-3 h-3 inline ml-1" /></span>
                            </div>
                            <h4 className="text-sm font-bold text-gray-200 mb-1 line-clamp-1">{item.title}</h4>
                            <p className="text-[10px] text-gray-500 uppercase font-medium flex items-center gap-1">
                                {item.id === '001' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />}
                                Status: {item.status}
                            </p>
                        </div>
                    ))}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-gray-800/50 to-transparent border border-dashed border-white/10 text-center cursor-pointer hover:border-pink-500/50 hover:bg-white/5 transition-all group">
                        <span className="text-xs text-gray-500 font-bold group-hover:text-pink-400">+ Add New Channel</span>
                    </div>
                </div>
            </div>

            {/* MITTEN: CONTENT & INTERACTION */}
            <div className="flex-1 flex flex-col bg-[#0f0f13] relative">
                {/* Header */}
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#0d0d10]/95 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                            {currentPost?.network[0]}
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white tracking-tight">{currentPost?.title}</h1>
                            <p className="text-xs text-gray-500 flex items-center gap-2">
                                Post ID: #SOC-5521 <span className="bg-white/10 w-1 h-1 rounded-full"></span> 2 min ago
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                            <TrendingUp className="w-3 h-3 text-pink-500" /> View Analytics
                        </button>
                        <button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-pink-500/20 flex items-center gap-2 text-white border border-white/10">
                            APPROVE ALL REPLIES
                        </button>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                    {/* Original Post Preview */}
                    <div className="bg-[#15151a] p-5 rounded-2xl border border-white/5 max-w-3xl mx-auto shadow-sm opacity-70 hover:opacity-100 transition-opacity">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-2 block">Original Post</p>
                        <p className="text-gray-300 text-sm leading-relaxed italic">
                            "Excited to announce our new AI integration! It's been a journey, but efficiency has skyrocketed by 300%. What are your thoughts on ethical AI implementation? #AI #Tech #Future"
                        </p>
                        <div className="mt-3 flex gap-4 text-xs text-gray-600">
                            <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> 245 Likes</span>
                            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> 12 Comments</span>
                        </div>
                    </div>

                    <div className="w-full h-px bg-white/5 max-w-3xl mx-auto"></div>

                    {/* Comment 1 */}
                    <div className="flex gap-4 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 text-blue-400 font-bold">JD</div>
                        <div className="space-y-2 max-w-xl">
                            <div className="bg-[#1a1a20] p-5 rounded-2xl rounded-tl-sm border border-white/10 shadow-lg relative">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-bold text-gray-200">John Doe</span>
                                    <span className="text-[10px] text-gray-500">10:42 AM</span>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    "Fantastiskt inlägg! Men hur ser ni på säkerheten i Mother Hive? Jag är orolig för GDPR-compliance när man kör 'Deep Scans'."
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Soshie Solution */}
                    <div className="flex gap-4 justify-end max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="space-y-4 max-w-xl">
                            <div className="bg-pink-900/10 p-5 rounded-2xl rounded-tr-sm border border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.05)] relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-pink-500/50"></div>

                                {/* Header */}
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center">
                                            <TrendingUp className="w-2 h-2 text-white" />
                                        </div>
                                        <p className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">GrowthHacker Suggestion</p>
                                    </div>
                                    <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded border border-pink-500/20">High Confidence (94%)</span>
                                </div>

                                {/* Content */}
                                <p className="text-sm text-white/90 leading-relaxed">
                                    "Hej John! 👋 Säkerhet är vår (och Mother Hives) absolut högsta prioritet. <br /><br />
                                    Vi använder krypterad 'Edge-Computing' och följer strikta GDPR-protokoll där ingen data sparas permanent utan ditt godkännande. 🔒<br /><br />
                                    Vill du se vårt 'Security Whitepaper'?"
                                </p>

                                {/* Actions */}
                                <div className="mt-4 flex gap-2 pt-4 border-t border-pink-500/10">
                                    <button className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white text-[10px] uppercase font-bold px-4 py-2 rounded-lg transition-all shadow-lg shadow-pink-900/20">
                                        <Send className="w-3 h-3" /> Post Reply Now
                                    </button>
                                    <button className="flex items-center gap-2 bg-transparent border border-white/10 hover:bg-white/5 text-gray-300 text-[10px] uppercase font-bold px-4 py-2 rounded-lg transition-all">
                                        <Edit2 className="w-3 h-3" /> Edit Suggestion
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-[1px] shadow-lg shadow-pink-500/20">
                                <div className="w-full h-full bg-black rounded-full overflow-hidden">
                                    <img src={soshie?.image} alt="Soshie" className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* HÖGER: AGENT STATUS */}
            <div className="w-72 border-l border-white/10 bg-[#0d0d10] p-6 relative flex flex-col items-center">
                {/* Glowing line connection */}
                <div className="absolute top-20 bottom-20 left-1/2 w-[2px] bg-gradient-to-b from-transparent via-pink-500/20 to-transparent -translate-x-1/2"></div>

                <div className="mb-8 text-center relative z-10 w-full">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Hive Intelligence</h3>
                    <div className="h-px w-16 bg-gradient-to-r from-transparent via-pink-500/50 to-transparent mx-auto"></div>
                </div>

                <div className="space-y-10 w-full relative z-10">
                    {subAgents.map((sub, i) => (
                        <div key={i} className="flex items-center gap-4 group cursor-help p-2 rounded-xl hover:bg-white/5 transition-all">
                            {/* Icon Wrapper */}
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-[#15151a] border border-pink-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.15)] group-hover:border-pink-500 group-hover:scale-110 transition-all z-20 relative">
                                    <img src={sub.smallIcon} alt={sub.name} className="w-6 h-6 opacity-80 group-hover:opacity-100" />
                                </div>
                                {/* Pulse Effect */}
                                <div className="absolute inset-0 bg-pink-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>

                            {/* Text Info (Right Side) */}
                            <div className="flex-1 text-left">
                                <h4 className="text-xs font-bold text-gray-200 group-hover:text-pink-400 transition-colors">{sub.name}</h4>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    <span className="text-[9px] text-gray-500 uppercase font-medium">Monitoring</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Stats */}
                <div className="mt-auto w-full bg-[#15151a] rounded-xl p-4 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500/10 rounded-full blur-xl -mr-8 -mt-8"></div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Engagement Rate</h4>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-white">4.8%</span>
                        <span className="text-xs text-green-500 font-bold mb-1">▲ 1.2%</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                        <div className="w-[65%] h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SoshieWorkspace;

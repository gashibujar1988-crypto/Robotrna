import React, { useState, useEffect } from 'react';
import { agents } from '../data/agents';
import { TrendingUp, Edit2, Send, MessageSquare, ThumbsUp, Linkedin, Facebook, Instagram, Plus, LayoutGrid, CheckCircle2, Link as LinkIcon, Smartphone, Music, Filter, MoreHorizontal, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, onSnapshot, doc, setDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

interface SocialPost {
    id: string;
    network: 'LinkedIn' | 'Facebook' | 'Instagram' | 'TikTok';
    title: string;
    status: 'Action Required' | 'Posted' | 'Drafting' | 'Review';
    comments: number;
    likes: number;
    content: string;
    replySuggestion?: {
        text: string;
        confidence: number;
    };
    thread?: {
        author: string;
        text: string;
        timestamp: any;
        avatar?: string;
    }[];
}

const SoshieWorkspace: React.FC = () => {
    const { user } = useAuth();
    const [activeFeedId, setActiveFeedId] = useState<string | null>(null);
    const [subAgentStatuses, setSubAgentStatuses] = useState<{ [key: string]: 'IDLE' | 'WORKING' | 'COMPLETED' }>({});
    const [feeds, setFeeds] = useState<SocialPost[]>([]);

    // Soshie's Sub-Agents Map based on User request
    // const soshieAgentNames = ["Trend Hunter", "Copy Specialist", "Growth Hacker"];

    // Mock Simulation of Sub-Agent Activity Loop
    useEffect(() => {
        // Trigger only when a new post is being drafted or processed
        if (activeFeedId && feeds.find(f => f.id === activeFeedId)?.status === 'Drafting') {
            const runSimulation = async () => {
                // Reset
                setSubAgentStatuses({});

                // 1. Trend Hunter WORKING
                setSubAgentStatuses(prev => ({ ...prev, "Trend Hunter": "WORKING" }));
                await new Promise(r => setTimeout(r, 2000));
                setSubAgentStatuses(prev => ({ ...prev, "Trend Hunter": "COMPLETED" }));

                // 2. Copy Specialist WORKING
                setSubAgentStatuses(prev => ({ ...prev, "Copy Specialist": "WORKING" }));
                await new Promise(r => setTimeout(r, 2000));
                setSubAgentStatuses(prev => ({ ...prev, "Copy Specialist": "COMPLETED" }));

                // 3. Growth Hacker WORKING
                setSubAgentStatuses(prev => ({ ...prev, "Growth Hacker": "WORKING" }));
                await new Promise(r => setTimeout(r, 2000));
                setSubAgentStatuses(prev => ({ ...prev, "Growth Hacker": "COMPLETED" }));
            };
            runSimulation();
        }
    }, [activeFeedId, feeds]);
    const [filter, setFilter] = useState<'ALL' | 'LinkedIn' | 'Facebook' | 'Instagram' | 'TikTok'>('ALL');
    const [integrations, setIntegrations] = useState<{ linkedin: boolean; facebook: boolean; instagram: boolean; tiktok: boolean } | null>(null);
    const [loading, setLoading] = useState(true);

    // Hämta Soshie info
    const soshie = agents.find(a => a.name === 'Soshie');
    const subAgents = soshie?.subAgents || [];

    // --- MOCK API FUNCTIONS (Simulating Backend/Oracle Oracle & n8n Backend) ---

    // 1. SELECT FROM GLOBAL_MEMORY_HUB WHERE DATA_TYPE = 'social_post'
    const fetchOracleSocialPosts = async (): Promise<SocialPost[]> => {
        try {
            const postsSnapshot = await getDocs(
                query(
                    collection(db, 'social_posts'),
                    where('status', '==', 'READY'),
                    orderBy('timestamp', 'desc'),
                    limit(10)
                )
            );

            return postsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as SocialPost[];
        } catch (error) {
            console.error('Failed to fetch social posts:', error);
            // Fallback to mock data
            return [
                {
                    id: 'oracle-id-1',
                    network: 'LinkedIn',
                    title: 'AI Revolution in Oslo (Oracle DB)',
                    status: 'Action Required',
                    comments: 12,
                    likes: 245,
                    content: "Excited to announce our new AI integration! It's been a journey, but efficiency has skyrocketed by 300%. What are your thoughts on ethical AI implementation? #AI #Tech #Future",
                    replySuggestion: {
                        text: "Fantastiskt initiativ! 🚀 Etik är kärnan i hållbar AI. Hur ser ni på transparens i algoritmerna?",
                        confidence: 94
                    },
                    thread: [
                        { author: 'John Doe', text: "Fantastiskt inlägg! Men hur ser ni på säkerheten i Mother Hive? Jag är orolig för GDPR-compliance när man kör 'Deep Scans'.", timestamp: new Date(), avatar: 'JD' }
                    ]
                },
                {
                    id: 'oracle-id-2',
                    network: 'TikTok',
                    title: 'Viral Challenge: AI Dance',
                    status: 'Action Required',
                    comments: 842,
                    likes: 12500,
                    content: "When the AI takes over the dance floor... 🤖💃 #BoraAi #AIDance #Trending",
                    replySuggestion: { text: "Bora Ai-style för vinsten! Ska vi göra en del 2? 😎🔥", confidence: 99 },
                    thread: [
                        { author: 'DanceKing_99', text: "Haha this is epic! Which model is this?", timestamp: new Date(), avatar: 'DK' }
                    ]
                },
                {
                    id: 'oracle-id-3',
                    network: 'Facebook',
                    title: 'Campanj: Sommarledigt',
                    status: 'Posted',
                    comments: 45,
                    likes: 120,
                    content: "Solen skiner och vi laddar upp för sommaren! ☀️ Glöm inte att boka din demo innan semestern.",
                    replySuggestion: { text: "Vi har fortfarande några tider kvar i juni!", confidence: 88 },
                    thread: []
                }
            ];
        }
    };

    // 2. Trigger n8n Webhook
    const triggerBackendPostWorkflow = async (post: SocialPost) => {
        console.log(`[Backend Trigger] Sending command to post for ID: ${post.id}`);
        const payload = {
            id: post.id,
            network: post.network,
            content: post.replySuggestion?.text || "",
            originalTitle: post.title,
            action: 'post_reply'
        };

        try {
            // NOTE: Ensure your backend workflow has a Webhook node listening at /webhook-test/soshie-action
            // or /webhook/soshie-action (for production)
            const response = await fetch('http://158.179.206.103:5678/webhook-test/soshie-action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.error("backend responded with error:", response.statusText);
                return false;
            }

            const result = await response.text(); // or .json() depending on n8n response
            console.log("[Backend Response]", result);
            return true;
        } catch (error) {
            console.error("Failed to trigger backend workflow:", error);
            // We return false here so the UI doesn't optimistically update if the network fails
            return false;
        }
    };

    // --- EFFECTS ---

    // 1. Lyssna på integrationer
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        const ref = doc(db, 'integrations', user.id);
        const unsub = onSnapshot(ref, (snap) => {
            if (snap.exists()) {
                setIntegrations(snap.data() as any);
            } else {
                setIntegrations({ linkedin: false, facebook: false, instagram: false, tiktok: false });
            }
            setLoading(false);
        });
        return () => unsub();
    }, [user]);

    // 2. Fetch Data (Oracle Simulation)
    useEffect(() => {
        let mounted = true;
        const loadData = async () => {
            // We fallback to mock Oracle data instead of Firestore for this demo step
            const oracleData = await fetchOracleSocialPosts();
            if (mounted) {
                setFeeds(oracleData);
                if (!activeFeedId && oracleData.length > 0) setActiveFeedId(oracleData[0].id);
            }
        };
        loadData();
        return () => { mounted = false; };
    }, []); // Run once on mount

    const handleConnect = async (platform: string) => {
        if (!user) return;
        try {
            await setDoc(doc(db, 'integrations', user.id), { [platform.toLowerCase()]: true }, { merge: true });
        } catch (e) {
            console.error("Connection failed", e);
        }
    };

    const handlePostReply = async (post: SocialPost) => {
        if (!post.replySuggestion) return;
        try {
            // 1. Call Backend
            const success = await triggerBackendPostWorkflow(post);
            if (!success) {
                console.error("Aborting UI update because n8n trigger failed.");
                return;
            }

            // 2. Optimistic Update (Locally)
            setFeeds(prev => prev.map(p => {
                if (p.id === post.id) {
                    return {
                        ...p,
                        status: 'Posted',
                        replySuggestion: undefined, // Clear suggestion
                        thread: [...(p.thread || []), {
                            author: 'Soshie (AI)',
                            text: post.replySuggestion?.text || "",
                            timestamp: new Date(),
                            avatar: 'AI'
                        }]
                    };
                }
                return p;
            }));

        } catch (e) {
            console.error("Post failed", e);
        }
    };

    const handleApproveAll = () => {
        // Bulk update logic
        feeds.filter(f => f.status === 'Action Required').forEach(async (f) => {
            if (f.replySuggestion) {
                await handlePostReply(f);
            }
        });
    };

    const filteredFeeds = feeds.filter(f => filter === 'ALL' || f.network === filter);
    const currentPost = feeds.find(f => f.id === activeFeedId) || feeds[0];
    const isConnected = integrations && (integrations.linkedin || integrations.facebook || integrations.instagram || integrations.tiktok);

    // --- SETUP VIEW ---
    if (!loading && !isConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-[#0a0a0c] text-white p-10 relative overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-900/10 to-transparent pointer-events-none" />

                <div className="z-10 max-w-4xl w-full text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-pink-500/20">
                        <Smartphone className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-black mb-4 tracking-tight">Välkommen till Social Inbox</h1>
                    <p className="text-gray-400 mb-12 text-lg">För att Soshie ska kunna arbeta behöver du koppla dina konton. Välj vilka plattformar du vill aktivera.</p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-[#0077b5]' },
                            { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-[#1877f2]' },
                            { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' },
                            { id: 'tiktok', name: 'TikTok', icon: Music, color: 'bg-black border border-white/20' }
                        ].map((platform) => (
                            <div key={platform.id} className="bg-[#15151a] border border-white/10 p-6 rounded-2xl hover:border-pink-500/50 transition-all group">
                                <div className={`w-12 h-12 ${platform.color} rounded-xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}>
                                    <platform.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-lg mb-4">{platform.name}</h3>
                                <button
                                    onClick={() => handleConnect(platform.id)}
                                    className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all">
                                    <LinkIcon className="w-4 h-4" /> Koppla
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // --- MAIN WORKSPACE ---
    return (
        <div className="flex bg-[#0a0a0c] text-white font-sans h-full overflow-hidden rounded-3xl relative z-10">
            {/* VÄNSTER: FEED SELECTOR (Modern Sidebar) */}
            <div className="w-80 border-r border-[#2C2C35] bg-[#1E1E24] flex flex-col shadow-2xl z-20">
                {/* Header Area */}
                <div className="p-6 border-b border-[#2C2C35]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-pink-500/20">
                                <Smartphone size={16} />
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-sm tracking-wide">Social Inbox</h2>
                                <span className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">Soshie Intelligence</span>
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-white transition-colors">
                            <MoreHorizontal size={18} />
                        </button>
                    </div>

                    {/* Modern Tabs / Filter */}
                    <div className="flex items-center bg-[#15151A] p-1 rounded-xl border border-[#2C2C35]">
                        {['ALL', 'LinkedIn', 'Facebook', 'Instagram', 'TikTok'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all text-xs font-bold ${filter === f
                                    ? 'bg-[#2C2C35] text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                                title={f}
                            >
                                {f === 'ALL' && <LayoutGrid size={14} />}
                                {f === 'LinkedIn' && <Linkedin size={14} />}
                                {f === 'Facebook' && <Facebook size={14} />}
                                {f === 'Instagram' && <Instagram size={14} />}
                                {f === 'TikTok' && <Music size={14} />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status Filter */}
                <div className="px-6 py-3 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-[#2C2C35]/50">
                    <span>Active Feeds</span>
                    <div className="flex items-center gap-2">
                        <Filter size={10} />
                        <span>Sort By: Newest</span>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 p-4 space-y-3 custom-scrollbar">
                    {filteredFeeds.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setActiveFeedId(item.id)}
                            className={`p-4 rounded-2xl cursor-pointer transition-all border group relative overflow-hidden ${activeFeedId === item.id
                                ? 'bg-[#2C2C35] border-pink-500/30'
                                : 'bg-transparent border-transparent hover:bg-[#2C2C35]/50'
                                }`}
                        >
                            {/* Active Indicator Strip */}
                            {activeFeedId === item.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-purple-600"></div>}

                            <div className="flex justify-between items-start mb-3 pl-2">
                                <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white shadow-sm ${item.network === 'LinkedIn' ? 'bg-[#0077b5]' :
                                        item.network === 'Facebook' ? 'bg-[#1877f2]' :
                                            item.network === 'Instagram' ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' :
                                                'bg-black border border-white/20'
                                        }`}>
                                        {item.network === 'LinkedIn' && <Linkedin size={10} />}
                                        {item.network === 'Facebook' && <Facebook size={10} />}
                                        {item.network === 'Instagram' && <Instagram size={10} />}
                                        {item.network === 'TikTok' && <Music size={10} />}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                {item.status === 'Action Required' && (
                                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.6)]"></span>
                                )}
                            </div>

                            <h4 className={`text-sm font-bold mb-1 pl-2 transition-colors ${activeFeedId === item.id ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                {item.title}
                            </h4>

                            <div className="flex items-center gap-4 mt-3 pl-2 text-[11px] font-medium text-gray-500">
                                <span className="flex items-center gap-1 group-hover:text-pink-400 transition-colors">
                                    <MessageSquare size={12} /> {item.comments}
                                </span>
                                <span className="flex items-center gap-1 group-hover:text-blue-400 transition-colors">
                                    <ThumbsUp size={12} /> {item.likes}
                                </span>
                                <span className={`ml-auto px-2 py-0.5 rounded text-[9px] uppercase tracking-wider ${item.status === 'Posted' ? 'text-green-400 bg-green-500/10' :
                                    item.status === 'Drafting' ? 'text-yellow-400 bg-yellow-500/10' :
                                        'text-pink-400 bg-pink-500/10'
                                    }`}>
                                    {item.status}
                                </span>
                            </div>
                        </div>
                    ))}

                    <button className="w-full py-4 mt-2 border border-dashed border-[#2C2C35] rounded-xl text-gray-500 hover:text-white hover:border-gray-500 hover:bg-[#2C2C35]/50 transition-all flex flex-col items-center justify-center gap-2 group">
                        <div className="w-8 h-8 rounded-full bg-[#15151A] flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                            <Plus size={16} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wide">Connect New Channel</span>
                    </button>
                </div>
            </div>

            {/* MITTEN: CONTENT & INTERACTION */}
            <div className="flex-1 flex flex-col bg-[#0f0f13] relative">
                {currentPost ? (
                    <>
                        {/* Header */}
                        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#0d0d10]/95 backdrop-blur-md sticky top-0 z-20">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg ${currentPost.network === 'LinkedIn' ? 'bg-[#0077b5]' :
                                    currentPost.network === 'Facebook' ? 'bg-[#1877f2]' :
                                        currentPost.network === 'Instagram' ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' :
                                            'bg-black border border-white/20' // TikTok
                                    }`}>
                                    {currentPost.network === 'LinkedIn' && <Linkedin className="w-5 h-5" />}
                                    {currentPost.network === 'Facebook' && <Facebook className="w-5 h-5" />}
                                    {currentPost.network === 'Instagram' && <Instagram className="w-5 h-5" />}
                                    {currentPost.network === 'TikTok' && <Music className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-white tracking-tight">{currentPost.title}</h1>
                                    <p className="text-xs text-gray-500 flex items-center gap-2">
                                        Post ID: #{currentPost.id.substring(0, 6).toUpperCase()} <span className="bg-white/10 w-1 h-1 rounded-full"></span> {currentPost.status}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3 text-pink-500" /> View Analytics
                                </button>
                                {currentPost.status === 'Action Required' && (
                                    <button
                                        onClick={handleApproveAll}
                                        className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-pink-500/20 flex items-center gap-2 text-white border border-white/10"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> APPROVE ALL REPLIES
                                    </button>
                                )}
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
                                    "{currentPost.content}"
                                </p>
                                <div className="mt-3 flex gap-4 text-xs text-gray-600">
                                    <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {currentPost.likes} Likes</span>
                                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {currentPost.comments} Comments</span>
                                </div>
                            </div>

                            <div className="w-full h-px bg-white/5 max-w-3xl mx-auto"></div>

                            {/* Thread (Comments) */}
                            {currentPost.thread?.map((comment, idx) => (
                                <div key={idx} className={`flex gap-4 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 ${comment.author.includes('Soshie') ? 'justify-end' : ''}`}>
                                    {!comment.author.includes('Soshie') && (
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 text-blue-400 font-bold">
                                            {comment.avatar || comment.author[0]}
                                        </div>
                                    )}
                                    <div className="space-y-2 max-w-xl">
                                        <div className={`p-5 rounded-2xl border shadow-lg relative ${comment.author.includes('Soshie') ? 'bg-pink-900/10 border-pink-500/30 rounded-tr-sm' : 'bg-[#1a1a20] rounded-tl-sm border-white/10'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-sm font-bold ${comment.author.includes('Soshie') ? 'text-pink-400' : 'text-gray-200'}`}>{comment.author}</span>
                                                <span className="text-[10px] text-gray-500">Just now</span>
                                            </div>
                                            <p className="text-sm text-gray-300 leading-relaxed">
                                                "{comment.text}"
                                            </p>
                                        </div>
                                    </div>
                                    {comment.author.includes('Soshie') && (
                                        <div className="w-10 h-10 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center flex-shrink-0">
                                            <img src={soshie?.image} alt="Soshie" className="w-full h-full object-cover rounded-full" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Soshie Suggestion (If active) */}
                            {currentPost.replySuggestion && currentPost.replySuggestion.text && currentPost.status !== 'Posted' && (
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
                                                <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded border border-pink-500/20">High Confidence ({currentPost.replySuggestion.confidence}%)</span>
                                            </div>

                                            {/* Content */}
                                            <p className="text-sm text-white/90 leading-relaxed">
                                                "{currentPost.replySuggestion.text}"
                                            </p>

                                            {/* Actions */}
                                            <div className="mt-4 flex gap-2 pt-4 border-t border-pink-500/10">
                                                <button
                                                    onClick={() => handlePostReply(currentPost)}
                                                    className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white text-[10px] uppercase font-bold px-4 py-2 rounded-lg transition-all shadow-lg shadow-pink-900/20"
                                                >
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
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>Inga inlägg hittades</p>
                        </div>
                    </div>
                )}
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
                    {subAgents.map((sub, i) => {
                        const status = subAgentStatuses[sub.name] || 'IDLE'; // Default to IDLE if not set
                        const isWorking = status === 'WORKING';
                        const isCompleted = status === 'COMPLETED';

                        return (
                            <div key={i} className={`flex items-center gap-4 group cursor-help p-2 rounded-xl transition-all ${isWorking ? 'bg-pink-500/10 border border-pink-500/30' : 'hover:bg-white/5'}`}>
                                {/* Icon Wrapper */}
                                <div className="relative">
                                    <div className={`w-12 h-12 rounded-xl bg-[#15151a] border flex items-center justify-center shadow-lg transition-all z-20 relative ${isWorking ? 'border-pink-500 scale-110 shadow-[0_0_20px_rgba(236,72,153,0.4)]' : isCompleted ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border-white/10 group-hover:border-pink-500/50'}`}>
                                        <img src={sub.smallIcon} alt={sub.name} className="w-6 h-6 opacity-80 group-hover:opacity-100" />

                                        {/* Status Badge */}
                                        {isCompleted && (
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 text-black rounded-full p-0.5 border border-black animate-in zoom-in">
                                                <Check size={8} strokeWidth={4} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Pulse Effect */}
                                    {isWorking && (
                                        <div className="absolute inset-0 bg-pink-500 rounded-xl blur-md opacity-40 animate-pulse"></div>
                                    )}
                                </div>

                                {/* Text Info (Right Side) */}
                                <div className="flex-1 text-left">
                                    <h4 className={`text-xs font-bold transition-colors ${isWorking ? 'text-pink-400' : isCompleted ? 'text-green-400' : 'text-gray-200'}`}>{sub.name}</h4>
                                    <div className="flex items-center gap-1 mt-1">
                                        {isWorking ? (
                                            <>
                                                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping"></span>
                                                <span className="text-[9px] text-pink-300 uppercase font-medium">ANALYZING...</span>
                                            </>
                                        ) : isCompleted ? (
                                            <>
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                <span className="text-[9px] text-green-400 uppercase font-medium">DONE</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                                                <span className="text-[9px] text-gray-500 uppercase font-medium">IDLE</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Stats or Trend Radar */}
                {(filter === 'TikTok' || currentPost?.network === 'TikTok') ? (
                    <div className="mt-auto w-full bg-[#15151a] rounded-xl p-4 border border-cyan-500/30 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-cyan-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>

                        <div className="flex justify-between items-center mb-4 relative z-10">
                            <h4 className="text-[10px] font-bold text-cyan-400 uppercase flex items-center gap-2">
                                <TrendingUp className="w-3 h-3" /> TikTok Trend Radar
                            </h4>
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping"></span>
                        </div>

                        <div className="space-y-3 relative z-10">
                            {[
                                { id: 1, title: 'Sound: "Future Funk"', growth: '+840%', type: 'Audio' },
                                { id: 2, title: 'Challenge: AI Swap', growth: '+320%', type: 'Filter' },
                                { id: 3, title: 'Topic: Ethical AI', growth: '+150%', type: 'Niche' }
                            ].map((trend) => (
                                <div key={trend.id} className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5 hover:border-cyan-500/50 transition-all cursor-pointer">
                                    <div>
                                        <p className="text-xs font-bold text-gray-200">{trend.title}</p>
                                        <p className="text-[9px] text-cyan-500 font-mono">{trend.growth} • {trend.type}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const newPost: SocialPost = {
                                                id: 'draft-' + Date.now(),
                                                network: 'TikTok',
                                                title: `Trend: ${trend.title}`,
                                                status: 'Drafting',
                                                comments: 0,
                                                likes: 0,
                                                content: `Drafting content based on trending ${trend.type.toLowerCase()}: ${trend.title}...`,
                                                replySuggestion: { text: '', confidence: 0 },
                                                thread: []
                                            };
                                            // Optimistic Update (Real impl would sync to FireStore)
                                            setFeeds(prev => [newPost, ...prev]);
                                            setActiveFeedId(newPost.id);
                                        }}
                                        className="p-1.5 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-white rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
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
                )}
            </div>
        </div>
    );
};

export default SoshieWorkspace;

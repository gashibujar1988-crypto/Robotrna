import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Cpu, Network, Share2, Zap, Database, Globe,
    Check, Activity, Server, Split, MessageSquare, Terminal, Beaker, Shield
} from 'lucide-react';
import { agents } from '../data/agents';

// --- N8N WORKFLOW DATA (Enhanced Source of Truth) ---
const motherPipeline = [
    { id: 'webhook', label: 'Start: Webhook', type: 'trigger', icon: Zap, details: 'POST /mother-hive-mind' },
    { id: 'oracle1', label: '0. Fetch Context', type: 'database', icon: Database, details: 'Oracle DB: Select Context' },

    // THE 5 BRAINS
    { id: 'pre-processor', label: '1. Input Processor', type: 'ai', icon: Beaker, details: 'Model: Gemini Flash (Analysis)' },
    { id: 'architect', label: '2. The Architect', type: 'ai', icon: Cpu, details: 'Model: Gemini Pro 1.5 (Plan)' },
    { id: 'critic', label: '3. The Critic', type: 'ai', icon: MessageSquare, details: 'Model: GPT-4 (Review)' },
    { id: 'synthesizer', label: '4. The Synthesizer', type: 'ai', icon: Network, details: 'Model: GPT-4 (Decision)' },
    { id: 'post-processor', label: '5. Output Guard', type: 'ai', icon: Shield, details: 'Model: Gemini Flash (Safety)' },

    { id: 'oracle2', label: '6. Save Decision', type: 'database', icon: Database, details: 'Oracle DB: Insert Log' },
    { id: 'router', label: 'Agent Router', type: 'router', icon: Split, details: 'Switch: Route to Agent' },
];

const agentWorkflows: Record<string, any> = {
    // Soshie
    '1': {
        core: { label: 'Soshie Core', type: 'ai', details: 'Context: Social Media Manager' },
        squad: { label: 'Soshie Squad', type: 'router', details: 'Switch: Select Sub-Agent' },
        nodes: [
            {
                label: 'Trend Spotter', type: 'http', details: 'Task: Scam Trends',
                apis: [{ label: 'Reddit API', icon: Globe }, { label: 'Twitter API', icon: Globe }]
            },
            {
                label: 'Engagement Bot', type: 'ai', details: 'Task: Generate Replies',
                apis: [{ label: 'Instagram Graph', icon: Share2 }]
            },
            {
                label: 'Content Scheduler', type: 'http', details: 'Task: Post to Feed',
                apis: [{ label: 'Buffer API', icon: Globe }]
            }
        ]
    },
    // Brainy
    '2': {
        core: { label: 'Brainy Core', type: 'ai', details: 'Context: Head of Research' },
        squad: { label: 'Brainy Squad', type: 'router', details: 'Switch: Select Sub-Agent' },
        nodes: [
            {
                label: 'Deep Search', type: 'http', details: 'Task: Broad Scan',
                apis: [{ label: 'Serper.dev', icon: Globe }, { label: 'Google Search', icon: Globe }]
            },
            {
                label: 'Data Analyst', type: 'code', details: 'Task: Process Datasets',
                apis: [{ label: 'Pandas (Py)', icon: Terminal }]
            },
            {
                label: 'Report Generator', type: 'doc', details: 'Task: Compile PDF',
                apis: [{ label: 'Google Docs API', icon: Globe }]
            }
        ]
    },
    // Dexter
    '3': {
        core: { label: 'Dexter Core', type: 'ai', details: 'Context: Outreach Specialist' },
        squad: { label: 'Dexter Squad', type: 'router', details: 'Switch: Select Sub-Agent' },
        nodes: [
            {
                label: 'WarmUp Expert', type: 'http', details: 'Task: Domain Health',
                apis: [{ label: 'Instantly API', icon: Globe }]
            },
            {
                label: 'HyperPersonalizer', type: 'ai', details: 'Task: Write Intros',
                apis: [{ label: 'LinkedIn API', icon: Globe }]
            },
            {
                label: 'Thread Manager', type: 'mail', details: 'Task: Monitor Replies',
                apis: [{ label: 'Gmail API', icon: Globe }]
            }
        ]
    },
    // Hunter
    '4': {
        core: { label: 'Hunter Core', type: 'ai', details: 'Context: Sales Director' },
        squad: { label: 'Hunter Squad', type: 'router', details: 'Switch: Select Sub-Agent' },
        nodes: [
            {
                label: 'Lead Scraper', type: 'http', details: 'Task: Find Prospects',
                apis: [{ label: 'Apollo API', icon: Globe }, { label: 'Hunter.io', icon: Globe }]
            },
            {
                label: 'Email Sequencer', type: 'mail', details: 'Task: Send Campaigns',
                apis: [{ label: 'SendGrid', icon: Globe }]
            },
            {
                label: 'CRM Updater', type: 'database', details: 'Task: Sync Records',
                apis: [{ label: 'Oracle DB', icon: Database }, { label: 'HubSpot', icon: Globe }]
            }
        ]
    },
    // Nova
    '5': {
        core: { label: 'Nova Core', type: 'ai', details: 'Context: Customer Success' },
        squad: { label: 'Nova Squad', type: 'router', details: 'Switch: Select Sub-Agent' },
        nodes: [
            {
                label: 'Ticket Router', type: 'code', details: 'Task: Triage & Tag',
                apis: [{ label: 'Zendesk API', icon: Globe }]
            },
            {
                label: 'Smart Chatbot', type: 'ai', details: 'Task: Auto-Reply',
                apis: [{ label: 'Intercom', icon: Globe }]
            },
            {
                label: 'Feedback Analyzer', type: 'ai', details: 'Task: Sentiment Analysis',
                apis: [{ label: 'Typeform', icon: Globe }]
            }
        ]
    },
    // Pixel
    '6': {
        core: { label: 'Pixel Core', type: 'ai', details: 'Context: Creative Director' },
        squad: { label: 'Pixel Squad', type: 'router', details: 'Switch: Select Sub-Agent' },
        nodes: [
            {
                label: 'Layout Gen', type: 'ai', details: 'Task: Gen UI Concepts',
                apis: [{ label: 'DALL-E 3', icon: Globe }, { label: 'Midjourney', icon: Globe }]
            },
            {
                label: 'Color Matcher', type: 'code', details: 'Task: Extract Palette',
                apis: [{ label: 'Colormind API', icon: Globe }]
            },
            {
                label: 'Asset Resizer', type: 'http', details: 'Task: Optimization',
                apis: [{ label: 'Cloudinary', icon: Globe }]
            }
        ]
    },
    // Venture
    '7': {
        core: { label: 'Venture Core', type: 'ai', details: 'Context: Business Strategist' },
        squad: { label: 'Venture Squad', type: 'router', details: 'Switch: Select Sub-Agent' },
        nodes: [
            {
                label: 'Risk Analyst', type: 'ai', details: 'Task: SWOT Analysis',
                apis: [{ label: 'Crunchbase', icon: Globe }]
            },
            {
                label: 'Market Sim', type: 'code', details: 'Task: Monte Carlo',
                apis: [{ label: 'Python SciPy', icon: Terminal }]
            },
            {
                label: 'Pitch AI', type: 'doc', details: 'Task: Slide Decks',
                apis: [{ label: 'Google Slides', icon: Globe }]
            }
        ]
    },
    // Atlas
    '8': {
        core: { label: 'Atlas Core', type: 'ai', details: 'Context: Tech Lead' },
        squad: { label: 'Atlas Squad', type: 'router', details: 'Switch: Select Sub-Agent' },
        nodes: [
            {
                label: 'Code Reviewer', type: 'ai', details: 'Task: Static Analysis',
                apis: [{ label: 'GitHub API', icon: Globe }]
            },
            {
                label: 'SEO Scanner', type: 'http', details: 'Task: Audit Site',
                apis: [{ label: 'Ahrefs API', icon: Globe }, { label: 'PageSpeed', icon: Globe }]
            },
            {
                label: 'Load Balancer', type: 'code', details: 'Task: Traffic Shape',
                apis: [{ label: 'Cloudflare', icon: Globe }]
            }
        ]
    },
    // Ledger
    '9': {
        core: { label: 'Ledger Core', type: 'ai', details: 'Context: Finance & Accounting' },
        squad: { label: 'Ledger Squad', type: 'router', details: 'Switch: Select Sub-Agent' },
        nodes: [
            {
                label: 'Receipt OCR', type: 'http', details: 'Task: Scan & Parse',
                apis: [{ label: 'Google Vision', icon: Globe }]
            },
            {
                label: 'Invoice Bot', type: 'mail', details: 'Task: Send Bills',
                apis: [{ label: 'Stripe API', icon: Globe }, { label: 'Gmail', icon: Share2 }]
            },
            {
                label: 'Tax Helper', type: 'ai', details: 'Task: Calculate VAT',
                apis: [{ label: 'Skatteverket', icon: Globe }]
            }
        ]
    }
};


// Internal node for the n8n Workflow Visualization
const WorkflowNode = ({ label, type, details, isLast = false, icon: Icon, apis = [] }: { label: string, type: string, details: string, isLast?: boolean, icon?: any, apis?: any[] }) => {
    let colorClass = 'border-slate-700 bg-slate-800';
    let iconColor = 'text-slate-400';

    if (type === 'trigger') { colorClass = 'border-pink-900/50 bg-pink-900/20'; iconColor = 'text-pink-500'; }
    if (type === 'database') { colorClass = 'border-blue-900/50 bg-blue-900/20'; iconColor = 'text-blue-500'; }
    if (type === 'ai') { colorClass = 'border-emerald-900/50 bg-emerald-900/20'; iconColor = 'text-emerald-500'; }
    if (type === 'router') { colorClass = 'border-purple-900/50 bg-purple-900/20'; iconColor = 'text-purple-500'; }
    if (type === 'http') { colorClass = 'border-amber-900/50 bg-amber-900/20'; iconColor = 'text-amber-500'; }
    if (type === 'code') { colorClass = 'border-cyan-900/50 bg-cyan-900/20'; iconColor = 'text-cyan-500'; }
    if (type === 'mail') { colorClass = 'border-red-900/50 bg-red-900/20'; iconColor = 'text-red-500'; }
    if (type === 'doc') { colorClass = 'border-blue-500/30 bg-blue-500/10'; iconColor = 'text-blue-400'; }

    return (
        <div className="relative">
            <div className={`flex flex-col gap-2 p-3 rounded-lg border ${colorClass} mb-3 relative z-10 transition-transform hover:scale-[1.02]`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md bg-black/20 ${iconColor}`}>
                        {Icon ? <Icon size={14} /> : <Activity size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-white text-xs font-bold truncate">{label}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{details}</div>
                    </div>
                </div>

                {/* Visualizing APIs/Connections */}
                {apis.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1 ml-10">
                        {apis.map((api, idx) => (
                            <div key={idx} className="flex items-center gap-1 bg-black/30 px-1.5 py-0.5 rounded text-[9px] text-slate-300 border border-slate-700/50">
                                {api.icon && <api.icon size={8} />}
                                <span>{api.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {!isLast && (
                <div className="absolute left-6 bottom-[-16px] w-px h-6 bg-slate-700 z-0"></div>
            )}
        </div>
    );
};

// Helper for dynamic icons
const TypeIcon = (type: string) => {
    switch (type) {
        case 'ai': return Cpu;
        case 'code': return Terminal;
        case 'database': return Database;
        default: return Zap;
    }
};

const SystemArchitecture: React.FC = () => {
    const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

    // Filter out Mother/Core if present in data, otherwise we hardcode Mother as center
    const activeAgents = agents.filter(a => a.name !== 'Mother');

    return (
        <div className="min-h-screen bg-[#0F1623] text-white overflow-hidden relative font-sans">

            {/* --- BACKGROUND GRID & EFFECTS --- */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:50px_50px]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F1623]/80 to-[#0F1623] pointer-events-none"></div>

            <div className="relative z-10 container mx-auto px-4 py-24 h-full">

                {/* --- HEADER --- */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
                        <Activity size={12} /> System Status: Operational
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4">
                        System Architecture <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500">Overview</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Visualisering av det neurala nätverket. Se hur Mother orkestrerar sub-agenter och kopplar samman din data via n8n-servern i Oracle Cloud.
                    </p>
                </div>

                {/* --- MAIN ARCHITECTURE VISUALIZATION --- */}
                <div className="relative h-[800px] w-full flex items-center justify-center">

                    {/* CENTRAL CORE: MOTHER */}
                    <div className="relative z-20 group cursor-pointer" onClick={() => setSelectedAgent('mother')}>
                        {/* Orbit rings associated with Mother */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-dashed border-slate-700/50 rounded-full animate-spin-slow pointer-events-none"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-slate-700 rounded-full opacity-30 pointer-events-none"></div>

                        {/* Mother Node */}
                        <div className="w-40 h-40 bg-slate-900 rounded-full border-4 border-purple-500 shadow-[0_0_100px_rgba(168,85,247,0.4)] flex flex-col items-center justify-center relative z-20 transition-transform group-hover:scale-105">
                            <Cpu size={48} className="text-white mb-2" />
                            <span className="font-black tracking-widest text-lg">MOTHER</span>
                            <span className="text-[10px] text-purple-400 font-bold bg-purple-900/50 px-2 py-0.5 rounded mt-1">HIVE MIND CORE</span>

                            {/* Connecting Lines to Agents (CSS Visuals) */}
                            {activeAgents.map((_agent, i) => {
                                const angle = (i * (360 / activeAgents.length) - 90) * (Math.PI / 180);
                                const x = Math.cos(angle) * 200; // Radius
                                const y = Math.sin(angle) * 200;
                                return (
                                    <svg key={i} className="absolute top-1/2 left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[-1]" style={{ overflow: 'visible' }}>
                                        <motion.path
                                            d={`M 250 250 L ${250 + x} ${250 + y}`}
                                            stroke="url(#gradientLine)"
                                            strokeWidth="2"
                                            strokeOpacity="0.3"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ duration: 1.5, delay: i * 0.1 }}
                                        />
                                        <defs>
                                            <linearGradient id="gradientLine" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#A855F7" />
                                                <stop offset="100%" stopColor="#38BDF8" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                );
                            })}
                        </div>
                    </div>

                    {/* SATELLITE AGENTS */}
                    {activeAgents.map((agent, i) => {
                        const angle = (i * (360 / activeAgents.length) - 90) * (Math.PI / 180);
                        const radius = 280; // Distance from center
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;

                        return (
                            <React.Fragment key={agent.id}>
                                {/* SUB-AGENTS (Orbiting their parent) */}
                                {agent.subAgents && agent.subAgents.map((sub, j) => {
                                    const subCount = agent.subAgents?.length || 0;
                                    const subAngle = (j * (360 / subCount) + (i * 20)) * (Math.PI / 180); // Rotate based on index to differentiate
                                    const subRadius = 80;
                                    const subX = x + Math.cos(subAngle) * subRadius;
                                    const subY = y + Math.sin(subAngle) * subRadius;

                                    return (
                                        <motion.div
                                            key={sub.id}
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5 + (j * 0.1) }}
                                            className="absolute z-20 flex flex-col items-center justify-center pointer-events-none"
                                            style={{
                                                top: `calc(50% + ${subY}px)`,
                                                left: `calc(50% + ${subX}px)`,
                                                transform: 'translate(-50%, -50%)',
                                            }}
                                        >
                                            {/* Line to Parent */}
                                            <svg className="absolute w-[200px] h-[200px] -translate-x-1/2 -translate-y-1/2 -z-10" style={{ pointerEvents: 'none' }}>
                                                <line
                                                    x1="100" y1="100"
                                                    x2={100 - (Math.cos(subAngle) * subRadius)}
                                                    y2={100 - (Math.sin(subAngle) * subRadius)}
                                                    stroke="#475569"
                                                    strokeWidth="1"
                                                    strokeDasharray="4 2"
                                                />
                                            </svg>

                                            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center p-1 shadow-lg">
                                                <img src={sub.smallIcon} alt={sub.name} className="w-full h-full object-contain opacity-80" />
                                            </div>
                                            <span className="text-[8px] text-slate-400 mt-1 bg-black/50 px-1 rounded backdrop-blur-sm whitespace-nowrap">
                                                {sub.name}
                                            </span>
                                        </motion.div>
                                    );
                                })}

                                {/* MAIN AGENT NODE */}
                                <motion.div
                                    className="absolute bg-slate-800/90 backdrop-blur-md p-4 rounded-xl border border-slate-700 w-64 shadow-2xl cursor-pointer hover:border-cyan-500/50 transition-all z-30 group"
                                    style={{
                                        top: `calc(50% + ${y}px)`,
                                        left: `calc(50% + ${x}px)`,
                                        transform: 'translate(-50%, -50%)',
                                        zIndex: selectedAgent === agent.id ? 50 : 30
                                    }}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => setSelectedAgent(agent.id)}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${agent.gradient || 'from-gray-700 to-gray-900'} flex items-center justify-center text-white font-bold shadow-lg`}>
                                            {agent.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{agent.name}</div>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-wider">{agent.role}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-slate-300">
                                            <Activity size={10} className="text-emerald-400" />
                                            <span>Latency: 24ms</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-300">
                                            <Server size={10} className="text-cyan-400" />
                                            <span>Node: Oracle Cloud (SE)</span>
                                        </div>
                                        <div className="h-1 w-full bg-slate-700 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-cyan-500 w-[85%]"></div>
                                        </div>
                                    </div>

                                    {/* Connector Dot */}
                                    <div className={`absolute top-1/2 ${x > 0 ? '-left-1.5' : '-right-1.5'} w-3 h-3 bg-cyan-500 rounded-full border-2 border-slate-900 shadow-[0_0_10px_#22d3ee]`}></div>
                                </motion.div>
                            </React.Fragment>
                        );
                    })}

                    {/* BACKEND LAYER (Bottom) */}
                    <div className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 w-full max-w-4xl">
                        <div className="flex justify-center items-center gap-8 opacity-50">
                            <div className="flex flex-col items-center gap-2">
                                <Database className="text-slate-600" />
                                <span className="text-xs font-mono text-slate-600">ORACLE DB (MEMORY)</span>
                            </div>
                            <div className="h-px w-32 bg-slate-700"></div>
                            <div className="flex flex-col items-center gap-2">
                                <Server className="text-slate-600" />
                                <span className="text-xs font-mono text-slate-600">N8N SERVER (ORCHESTRATOR)</span>
                            </div>
                            <div className="h-px w-32 bg-slate-700"></div>
                            <div className="flex flex-col items-center gap-2">
                                <Globe className="text-slate-600" />
                                <span className="text-xs font-mono text-slate-600">APIs (EXTERNAL)</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* --- DETAILS MODAL / DRAWER --- */}
                <AnimatePresence>
                    {selectedAgent && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="fixed right-0 top-0 bottom-0 w-full md:w-[480px] bg-[#0F1623] border-l border-slate-700 shadow-2xl z-50 overflow-y-auto"
                        >
                            <div className="p-8">
                                <button onClick={() => setSelectedAgent(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
                                    <span className="text-2xl">×</span>
                                </button>

                                {selectedAgent === 'mother' ? (
                                    <div>
                                        <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-purple-900/20">
                                            <Cpu size={32} className="text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold mb-1">Mother Hive Mind</h2>
                                        <p className="text-purple-400 text-sm font-mono mb-8">SYSTEM ARCHITECTURE v2.0</p>

                                        <div className="mb-8">
                                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Zap size={14} /> Intelligence Pipeline (5 Brains)
                                            </h3>
                                            <div className="relative pl-2">
                                                <div className="absolute left-[19px] top-6 bottom-6 w-px bg-slate-800"></div>
                                                {motherPipeline.map((node, i) => (
                                                    <WorkflowNode
                                                        key={node.id}
                                                        label={node.label}
                                                        type={node.type}
                                                        details={node.details}
                                                        icon={node.icon}
                                                        isLast={i === motherPipeline.length - 1}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Hive Mind Statistics</h4>
                                            <div className="grid grid-cols-2 gap-4 text-center">
                                                <div className="bg-slate-800 p-2 rounded">
                                                    <div className="text-2xl font-bold text-white">42.5k</div>
                                                    <div className="text-[10px] text-slate-500 uppercase">Tokens Processed</div>
                                                </div>
                                                <div className="bg-slate-800 p-2 rounded">
                                                    <div className="text-2xl font-bold text-white">9</div>
                                                    <div className="text-[10px] text-slate-500 uppercase">Active Agents</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    (() => {
                                        const agent = agents.find(a => a.id === selectedAgent);
                                        const workflow = agentWorkflows[agent?.id || ''];
                                        if (!agent) return null;

                                        return (
                                            <div>
                                                <div className={`w-16 h-16 bg-gradient-to-br ${agent.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-xl`}>
                                                    <span className="text-2xl font-bold">{agent.name.charAt(0)}</span>
                                                </div>
                                                <h2 className="text-2xl font-bold mb-1">{agent.name}</h2>
                                                <p className="text-slate-400 text-sm mb-8">{agent.role}</p>

                                                <div className="mb-8">
                                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                        <Activity size={14} /> Full Workflow & APIs
                                                    </h3>

                                                    {workflow ? (
                                                        <div className="space-y-4">
                                                            {/* Core Node */}
                                                            <WorkflowNode
                                                                label={workflow.core.label}
                                                                type={workflow.core.type}
                                                                details={workflow.core.details}
                                                                icon={Cpu}
                                                            />

                                                            {/* Squad Router */}
                                                            <WorkflowNode
                                                                label={workflow.squad.label}
                                                                type={workflow.squad.type}
                                                                details={workflow.squad.details}
                                                                icon={Split}
                                                            />

                                                            {/* Parallel Sub-Agents */}
                                                            <div className="pl-6 border-l border-dashed border-slate-700 ml-4 space-y-3">
                                                                {workflow.nodes.map((node: any, i: number) => (
                                                                    <div key={i} className="relative">
                                                                        {/* Horizontal Connector */}
                                                                        <div className="absolute -left-6 top-1/2 w-6 h-px bg-slate-700 border-b border-dashed"></div>
                                                                        <WorkflowNode
                                                                            label={node.label}
                                                                            type={node.type}
                                                                            details={node.details}
                                                                            isLast={true}
                                                                            apis={node.apis}
                                                                            icon={
                                                                                node.type === 'http' ? Globe :
                                                                                    node.type === 'mail' ? Share2 :
                                                                                        node.type === 'doc' ? Terminal :
                                                                                            node.type === 'database' ? Database :
                                                                                                TypeIcon(node.type)
                                                                            }
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 border border-dashed border-slate-700 rounded text-center">
                                                            <p className="text-xs text-slate-500">Initializing connection...</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mb-8">
                                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Core Skills</h3>
                                                    <ul className="space-y-2">
                                                        {agent.skills.slice(0, 3).map((skill, i) => (
                                                            <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                                                <Check size={14} className="mt-1 text-cyan-500 shrink-0" />
                                                                {skill.title}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <Link to={`/robot/${agent.id}`} className="block w-full py-3 bg-white text-black font-bold text-center rounded-lg hover:bg-gray-200 transition-colors">
                                                    Öppna Agent Workspace
                                                </Link>
                                            </div>
                                        );
                                    })()
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};

export default SystemArchitecture;

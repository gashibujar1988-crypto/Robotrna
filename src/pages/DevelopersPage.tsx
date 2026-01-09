import React from 'react';
import { Terminal, Code, Cpu, Shield, Zap, Database } from 'lucide-react';
import { seedAgentConfigs } from '../utils/seedAgentConfigs';
import { seedGlobalSettings } from '../utils/seedGlobalSettings';

const CodeBlock = ({ code }: { code: string }) => (
    <div className="bg-[#1e1e1e] rounded-xl p-6 font-mono text-sm text-gray-300 overflow-x-auto border border-gray-800 shadow-xl">
        <pre>{code}</pre>
    </div>
);

const CheckIndicator = () => (
    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const DevelopersPage: React.FC = () => {

    const handleSeed = async () => {
        if (confirm("Detta kommer att skriva över agent-konfigurationer och globala regler i Firestore. Vill du fortsätta?")) {
            await seedAgentConfigs();
            await seedGlobalSettings();
            alert("Database seeded successfully!");
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-purple-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-900/40 to-transparent"></div>
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 container mx-auto px-6 py-24">

                {/* Header */}
                <div className="max-w-4xl mx-auto mb-20 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-purple-400 mb-6">
                        <Terminal className="w-3 h-3" />
                        <span>v1.0.4 Public Beta</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-gray-400">
                        Build on Mother™
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Integrera världens mest avancerade AI-orkestrering direkt i din applikation.
                        Skalbar, säker och byggd för enterprise.
                    </p>
                    <div className="mt-10 flex gap-4 justify-center">
                        <button className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                            <Code className="w-5 h-5" /> Get API Keys
                        </button>
                        <button className="px-8 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-white/10 transition-colors">
                            Documentation
                        </button>
                        <button onClick={handleSeed} className="px-8 py-3 bg-purple-600 border border-purple-500 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                            Initialize AI Brain (Admin)
                        </button>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-32">
                    {[
                        { icon: Zap, title: "Ultra Low Latency", desc: "Global Edge Network för <50ms svarstider på agent-routing." },
                        { icon: Shield, title: "Enterprise Security", desc: "SOC2 Type II compliant. End-to-end kryptering av all payload." },
                        { icon: Database, title: "Universal Context", desc: "Dela minne och kontext mellan miljontals agenter i realtid." }
                    ].map((item, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors">
                            <item.icon className="w-8 h-8 text-purple-400 mb-4" />
                            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Code Showcase Section */}
                <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
                    <div>
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                            <Cpu className="w-8 h-8 text-blue-400" />
                            Simple SDK Integration
                        </h2>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            Vårt SDK hanterar komplexiteten. Du initierar bara klienten och börjar dispatcha tasks. Mother tar hand om routing, context-retrieval och error handling.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold text-xs"><CheckIndicator /></div>
                                <span className="text-gray-300">Auto-scaling agents</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs"><CheckIndicator /></div>
                                <span className="text-gray-300">Real-time WebSocket events</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs"><CheckIndicator /></div>
                                <span className="text-gray-300">Type-safe TypeScript definitions</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl opacity-20 blur-xl"></div>
                        <CodeBlock code={`import { MotherClient } from '@boraai/sdk';

const client = new MotherClient({
  apiKey: process.env.BORAAI_KEY
});

// Dispatch a complex task
const result = await client.dispatch({
  intent: "analyze_market_trends",
  context: { region: "Nordics", sector: "SaaS" },
  priority: "high"
});

console.log(result.insights);
// Output: { growth: "+12%", sentiment: "positive" ... }`} />
                    </div>
                </div>

                {/* API Reference Preview */}
                <div className="border-t border-white/10 pt-20">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">REST API Endpoints</h2>
                        <p className="text-gray-400">Direkt tillgång via HTTP/2 för total kontroll.</p>
                    </div>

                    <div className="grid gap-4 max-w-3xl mx-auto">
                        {[
                            { method: "POST", path: "/v1/agents/spawn", desc: "Skapa en ny, specialiserad agentinstans." },
                            { method: "GET", path: "/v1/context/search", desc: "Semantisk sökning i företagets Vector Store." },
                            { method: "POST", path: "/v1/orchestrator/sync", desc: "Tvinga synkronisering mellan alla aktiva noder." },
                        ].map((ep, i) => (
                            <div key={i} className="flex items-center gap-4 bg-[#111] p-4 rounded-lg border border-white/5 font-mono text-sm hover:border-purple-500/30 transition-colors">
                                <span className={`px-2 py-1 rounded bg-white/10 font-bold ${ep.method === 'GET' ? 'text-blue-400' : 'text-green-400'}`}>{ep.method}</span>
                                <span className="text-white flex-1">{ep.path}</span>
                                <span className="text-gray-500">{ep.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-32 text-center">
                    <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500">
                        <div className="bg-[#09090b] rounded-xl px-12 py-16">
                            <h2 className="text-4xl font-bold mb-6">Redo att bygga framtiden?</h2>
                            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                                Få Early Access till vårt Developer Program och börja bygga intelligenta system idag.
                            </p>
                            <button className="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">
                                Request Access
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};



export default DevelopersPage;

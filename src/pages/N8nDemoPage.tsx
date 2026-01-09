import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Database, Globe, Play, Server, Zap, CheckCircle, Mail, MessageSquare } from 'lucide-react';
import Navbar from '../components/Navbar';

const N8nDemoPage: React.FC = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [step, setStep] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    const runDemo = () => {
        if (isRunning) return;
        setIsRunning(true);
        setStep(0);
        setLogs([]);

        const sequence = [
            { t: 500, log: "🚀 Trigger mottagen: 'Nytt Lead' från Webbsida" },
            { t: 1500, log: "🌍 Webhook: Hämtar data från formulär..." },
            { t: 2500, log: "🧠 AI-Analys (GPT-4): Kvalificerar lead..." },
            { t: 3500, log: "✅ Beslut: Hett lead! (Score: 92/100)" },
            { t: 4500, log: "💾 Databas: Sparar till CRM (HubSpot)..." },
            { t: 5500, log: "📧 Email: Skickar välkomstmail..." },
            { t: 6500, log: "💬 Slack: Notifierar säljteamet..." },
            { t: 7500, log: "✨ Workflow slutfört!" }
        ];

        sequence.forEach((item, index) => {
            setTimeout(() => {
                setStep(index + 1);
                setLogs(prev => [...prev, item.log]);
                if (index === sequence.length - 1) setIsRunning(false);
            }, item.t);
        });
    };

    return (
        <div className="min-h-screen bg-[#0F1623] text-white font-sans selection:bg-purple-500/30">
            <Navbar />

            <div className="container mx-auto px-4 pt-32 pb-20">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 px-4 py-1.5 rounded-full text-orange-400 font-mono text-sm mb-6">
                        <Zap className="w-4 h-4" />
                        <span>POWERED BY N8N AUTOMATION</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
                        Detta händer <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Bakom Kulisserna</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        När vi har installerat din Oracle-server kommer n8n att vara hjärtat i din verksamhet.
                        Här är en simulering av ett "Lead-to-Deal"-flöde.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* VISUAL WORKFLOW EDITOR (MOCKUP) */}
                    <div className="lg:col-span-2 bg-[#1a202c] rounded-2xl border border-gray-800 overflow-hidden relative shadow-2xl h-[600px]">
                        {/* Grid Background */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                        {/* Nodes */}
                        <div className="relative w-full h-full p-10 flex items-center justify-center">

                            {/* Connecting Lines */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                                {/* Lines would be dynamic in real n8n, here static for demo */}
                                <path d="M150 300 L 280 300" stroke={step >= 1 ? "#F97316" : "#374151"} strokeWidth="4" fill="none" className="transition-colors duration-500" />
                                <path d="M380 300 L 480 300" stroke={step >= 3 ? "#F97316" : "#374151"} strokeWidth="4" fill="none" className="transition-colors duration-500" />
                                <path d="M580 300 L 680 200" stroke={step >= 5 ? "#F97316" : "#374151"} strokeWidth="4" fill="none" className="transition-colors duration-500" />
                                <path d="M580 300 L 680 400" stroke={step >= 6 ? "#F97316" : "#374151"} strokeWidth="4" fill="none" className="transition-colors duration-500" />
                            </svg>

                            {/* Node 1: Webhook */}
                            <motion.div
                                animate={{ scale: step === 1 ? 1.1 : 1, boxShadow: step === 1 ? "0 0 20px #F97316" : "none" }}
                                className={`absolute left-10 top-1/2 -translate-y-1/2 w-32 h-24 bg-[#2D3748] rounded-xl border-2 ${step >= 1 ? 'border-orange-500' : 'border-gray-700'} flex flex-col items-center justify-center z-10`}
                            >
                                <Globe className="w-8 h-8 text-blue-400 mb-2" />
                                <span className="text-xs font-bold text-gray-300">Webhook</span>
                                <span className="text-[10px] text-gray-500">PÅ: Nytt Lead</span>
                            </motion.div>

                            {/* Node 2: AI Processor */}
                            <motion.div
                                animate={{ scale: step >= 2 && step <= 4 ? 1.1 : 1, boxShadow: step >= 2 && step <= 4 ? "0 0 20px #8B5CF6" : "none" }}
                                className={`absolute left-[300px] top-1/2 -translate-y-1/2 w-32 h-24 bg-[#2D3748] rounded-xl border-2 ${step >= 2 ? 'border-purple-500' : 'border-gray-700'} flex flex-col items-center justify-center z-10`}
                            >
                                <Activity className="w-8 h-8 text-purple-400 mb-2" />
                                <span className="text-xs font-bold text-gray-300">AI Agent</span>
                                <span className="text-[10px] text-gray-500">Analysera</span>
                            </motion.div>

                            {/* Node 3: Router */}
                            <motion.div
                                animate={{ scale: step === 4 ? 1.1 : 1 }}
                                className={`absolute left-[520px] top-1/2 -translate-y-1/2 w-16 h-16 bg-[#2D3748] rounded-full border-2 ${step >= 4 ? 'border-green-500' : 'border-gray-700'} flex items-center justify-center z-10`}
                            >
                                <Server className="w-6 h-6 text-green-400" />
                            </motion.div>

                            {/* Node 4: Email */}
                            <motion.div
                                animate={{ scale: step === 5 ? 1.1 : 1, boxShadow: step === 5 ? "0 0 20px #10B981" : "none" }}
                                className={`absolute right-10 top-[150px] w-32 h-24 bg-[#2D3748] rounded-xl border-2 ${step >= 5 ? 'border-emerald-500' : 'border-gray-700'} flex flex-col items-center justify-center z-10`}
                            >
                                <Mail className="w-8 h-8 text-emerald-400 mb-2" />
                                <span className="text-xs font-bold text-gray-300">Gmail</span>
                                <span className="text-[10px] text-gray-500">Skicka Svar</span>
                            </motion.div>

                            {/* Node 5: Slack */}
                            <motion.div
                                animate={{ scale: step === 6 ? 1.1 : 1, boxShadow: step === 6 ? "0 0 20px #E11D48" : "none" }}
                                className={`absolute right-10 top-[350px] w-32 h-24 bg-[#2D3748] rounded-xl border-2 ${step >= 6 ? 'border-rose-500' : 'border-gray-700'} flex flex-col items-center justify-center z-10`}
                            >
                                <MessageSquare className="w-8 h-8 text-rose-400 mb-2" />
                                <span className="text-xs font-bold text-gray-300">Slack</span>
                                <span className="text-[10px] text-gray-500">Notifiera Team</span>
                            </motion.div>

                        </div>

                        {/* Controls */}
                        <div className="absolute bottom-6 right-6">
                            <button
                                onClick={runDemo}
                                disabled={isRunning}
                                className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all ${isRunning ? 'bg-gray-700 cursor-not-allowed opacity-50' : 'bg-orange-600 hover:bg-orange-500 hover:scale-105'}`}
                            >
                                {isRunning ? <Activity className="animate-spin" /> : <Play fill="currentColor" />}
                                {isRunning ? 'Kör Workflow...' : 'Testa Workflow'}
                            </button>
                        </div>
                    </div>

                    {/* LIVE SERVER LOGS */}
                    <div className="bg-black/50 backdrop-blur-md rounded-2xl border border-gray-800 p-6 h-[600px] flex flex-col">
                        <div className="flex items-center gap-3 mb-4 border-b border-gray-800 pb-4">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                            <h3 className="font-mono font-bold text-green-500">SERVER TERMINAL</h3>
                            <span className="text-xs text-gray-600 ml-auto">n8n@oracle-cloud-sweden</span>
                        </div>

                        <div className="flex-1 overflow-y-auto font-mono text-sm space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-800">
                            <div className="text-gray-500 italic">Antigravity System ready...</div>
                            {logs.map((log, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-start gap-2"
                                >
                                    <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span>
                                    <span className={log.includes('Trigger') ? 'text-blue-400' : log.includes('Beslut') ? 'text-green-400 font-bold' : log.includes('Workflow') ? 'text-orange-400' : 'text-gray-300'}>
                                        {log}
                                    </span>
                                </motion.div>
                            ))}
                            {isRunning && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ repeat: Infinity, duration: 0.8 }}
                                    className="w-2 h-4 bg-orange-500"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* INFO SECTION */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-6 bg-[#1a202c] rounded-2xl border border-gray-800">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 text-blue-400">
                            <Database className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-xl mb-2">100% Ägandeskap</h3>
                        <p className="text-gray-400 text-sm">
                            Med din egen Oracle-server äger du all data. Inga dyra månadsavgifter per "workflow execution" som hos Zapier.
                        </p>
                    </div>
                    <div className="p-6 bg-[#1a202c] rounded-2xl border border-gray-800">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 text-purple-400">
                            <Activity className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-xl mb-2">Obegränsad Kraft</h3>
                        <p className="text-gray-400 text-sm">
                            Din server har 4 OCPU och 24GB RAM. Det räcker för att köra tusentals automatiseringar samtidigt.
                        </p>
                    </div>
                    <div className="p-6 bg-[#1a202c] rounded-2xl border border-gray-800">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 text-green-400">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-xl mb-2">GDPR Säkrat</h3>
                        <p className="text-gray-400 text-sm">
                            Eftersom servern står i Stockholm (Sweden North) stannar all din känsliga data inom EU:s gränser.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default N8nDemoPage;

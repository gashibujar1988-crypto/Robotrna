import React, { useEffect, useState, useRef } from 'react';
import { Terminal, Activity, Wifi } from 'lucide-react';

interface LogMessage {
    id: number;
    text: string;
    timestamp: string;
    type: 'system' | 'mother' | 'agent' | 'error';
}

export default function LiveLog() {
    const [logs, setLogs] = useState<LogMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Connect to WebSocket
        const connect = () => {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
            const wsUrl = backendUrl.replace('http', 'ws');
            const ws = new WebSocket(`${wsUrl}/ws/logs`);
            wsRef.current = ws;

            ws.onopen = () => {
                setIsConnected(true);
                addLog('Connected to Mother AI Neural Network...', 'system');
            };

            ws.onclose = () => {
                setIsConnected(false);
                addLog('Connection lost. Retrying...', 'error');
                setTimeout(connect, 3000); // Reconnect after 3s
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    // Handle Structured Events
                    if (data.type === 'log') {
                        // DETECT DRAFT (Special Protocol)
                        if (data.message.includes('DRAFT_READY|')) {
                            try {
                                // Extract payload regardless of prefix
                                const parts = data.message.split('DRAFT_READY|');
                                if (parts.length > 1) {
                                    const jsonPayload = parts[1].trim();
                                    const draftData = JSON.parse(jsonPayload);
                                    window.dispatchEvent(new CustomEvent('draft-received', { detail: draftData }));
                                    addLog(`[Soshie] -> 📝 Draft Created for ${draftData.platform}`, 'agent');
                                    return; // Don't show raw message
                                }
                            } catch (e) {
                                console.error("Draft parsing error", e);
                            }
                        }

                        let type: LogMessage['type'] = 'system';
                        if (data.message.includes('[Mother]')) type = 'mother';
                        if (data.message.includes('ERROR')) type = 'error';
                        // Check for agent names in brackets, e.g. [Dexter]
                        const agentMatch = data.message.match(/\[(.*?)]/);
                        if (agentMatch && agentMatch[1] !== 'Mother' && agentMatch[1] !== 'System' && agentMatch[1] !== 'LOG') {
                            type = 'agent';
                        }
                        addLog(data.message, type);
                    } else if (data.type === 'agent_status') {
                        // Visualize State Changes
                        const statusColor = data.status === 'WORKING' ? 'text-green-400' : 'text-gray-500';
                        addLog(`[STATUS] ${data.agent} is now ${data.status}`, 'system');

                        // Dispatch global event for other components (Dashboard Cards)
                        window.dispatchEvent(new CustomEvent('agent-status-update', { detail: data }));
                    }

                } catch (e) {
                    // Fallback for raw text messages (Legacy)
                    const text = event.data;
                    let type: LogMessage['type'] = 'system';
                    if (text.includes('[Mother]')) type = 'mother';
                    if (text.includes('[Dexter]') || text.includes('[Soshie]')) type = 'agent';
                    if (text.includes('ERROR')) type = 'error';
                    addLog(text, type);
                }
            };
        };

        connect();

        return () => {
            wsRef.current?.close();
        };
    }, []);

    const addLog = (text: string, type: LogMessage['type']) => {
        setLogs(prev => [...prev, {
            id: Date.now(),
            text,
            timestamp: new Date().toLocaleTimeString(),
            type
        }].slice(-50)); // Keep last 50 logs
    };

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="bg-black border border-green-500/30 rounded-lg overflow-hidden font-mono shadow-[0_0_20px_rgba(0,255,0,0.1)] h-96 flex flex-col">
            {/* Header */}
            <div className="bg-green-900/20 border-b border-green-500/20 p-3 flex justify-between items-center">
                <div className="flex items-center gap-2 text-green-400">
                    <Terminal size={18} />
                    <span className="font-bold tracking-wider">LIVE BRAIN CONSOLE</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1.5 text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                        <Wifi size={14} />
                        <span>{isConnected ? 'ONLINE' : 'OFFLINE'}</span>
                    </div>
                    <Activity className="text-green-500 animate-pulse" size={16} />
                </div>
            </div>

            {/* Terminal Output */}
            <div
                ref={scrollRef}
                className="flex-1 p-4 overflow-y-auto space-y-2 text-sm"
                style={{ scrollBehavior: 'smooth' }}
            >
                {logs.length === 0 && (
                    <div className="text-green-500/40 italic text-center mt-20">
                        Waiting for neural activity...
                    </div>
                )}
                {logs.map((log) => (
                    <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className="text-green-800 select-none">[{log.timestamp}]</span>
                        <span className={`
              ${log.type === 'mother' ? 'text-purple-400 font-bold' : ''}
              ${log.type === 'agent' ? 'text-blue-400' : ''}
              ${log.type === 'error' ? 'text-red-400' : ''}
              ${log.type === 'system' ? 'text-green-400' : ''}
            `}>
                            {log.text}
                        </span>
                    </div>
                ))}
                {/* Typing cursor */}
                <div className="w-2 h-4 bg-green-500/50 animate-pulse inline-block ml-1" />
            </div>
        </div>
    );
}

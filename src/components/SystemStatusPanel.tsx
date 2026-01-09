import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Server, Database, Zap, Activity, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { n8n } from '../api/client';

interface SystemStatus {
    motherHive: { status: string; brains: { name: string; status: string }[]; executions?: number };
    agents: { name: string; status: string; lastActive: any }[];
    n8nWebhooks: { name: string; status: string; lastExecution: any }[];
    oracleDb: { status: string; latency: number };
}

const SystemStatusPanel: React.FC = () => {
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = async () => {
        try {
            const result = await n8n.getSystemStatus();
            setStatus(result as SystemStatus);
            setError(null);
        } catch (e: any) {
            console.error('Failed to fetch system status:', e);
            setError(e.message || 'Status unavailable');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 10000); // Poll var 10:e sekund
        return () => clearInterval(interval);
    }, []);

    const StatusBadge = ({ online }: { online: boolean }) => (
        online ?
            <div className="flex items-center gap-1 text-emerald-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold">LIVE</span>
            </div> :
            <div className="flex items-center gap-1 text-red-500">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs font-bold">OFFLINE</span>
            </div>
    );

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !status) {
        return (
            <div className="bg-red-900/10 border border-red-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-bold">System Status Unavailable</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">{error || 'Could not connect to backend'}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Mother Hive Core */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-violet-900/20 to-purple-900/20 border border-violet-500/30 rounded-2xl p-6 shadow-xl"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Server className="w-5 h-5 text-violet-400" />
                        Mother Hive Core (5 Brains)
                    </h3>
                    <StatusBadge online={status.motherHive.status === 'ONLINE'} />
                </div>

                {status.motherHive.status === 'ONLINE' && status.motherHive.executions !== undefined && (
                    <div className="text-xs text-gray-400 mb-3">
                        Total Executions: {status.motherHive.executions}
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {status.motherHive.brains.map(brain => (
                        <div key={brain.name} className="bg-black/30 rounded-lg p-3 border border-white/10">
                            <div className="text-xs text-gray-400 mb-1">{brain.name}</div>
                            <div className="text-sm font-bold text-white flex items-center gap-1">
                                {brain.status === 'ACTIVE' ?
                                    <><CheckCircle className="w-3 h-3 text-green-500" /> Active</> :
                                    <><XCircle className="w-3 h-3 text-gray-500" /> Idle</>
                                }
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* AI Agents Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl"
            >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    AI Agents ({status.agents.length} Total)
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {status.agents.map(agent => (
                        <div key={agent.name} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-black/20 border border-white/5 hover:border-white/20 transition-colors">
                            <div className={`w-3 h-3 rounded-full ${
                                agent.status === 'OFFLINE' ? 'bg-red-500' :
                                agent.status === 'WORKING' ? 'bg-yellow-500 animate-pulse' :
                                'bg-green-500'
                            }`} />
                            <span className="text-xs font-bold text-white text-center">{agent.name}</span>
                            <span className="text-[10px] text-gray-400">{agent.status}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* System Infrastructure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* N8N Webhooks */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-orange-900/10 border border-orange-500/20 rounded-xl p-4"
                >
                    <h4 className="text-sm font-bold text-orange-400 mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        N8N Webhooks
                    </h4>
                    <div className="space-y-2">
                        {status.n8nWebhooks.map(hook => (
                            <div key={hook.name} className="flex justify-between items-center">
                                <span className="text-xs text-gray-300 capitalize">{hook.name}</span>
                                {hook.status === 'ONLINE' ?
                                    <CheckCircle className="w-4 h-4 text-green-500" /> :
                                    <XCircle className="w-4 h-4 text-red-500" />
                                }
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Oracle Database */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-4"
                >
                    <h4 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Oracle Database
                    </h4>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-300">Connection</span>
                            {status.oracleDb.status === 'ONLINE' ?
                                <CheckCircle className="w-4 h-4 text-green-500" /> :
                                <XCircle className="w-4 h-4 text-red-500" />
                            }
                        </div>
                        {status.oracleDb.status === 'ONLINE' && (
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-300">Latency</span>
                                <span className="text-xs font-bold text-white">{status.oracleDb.latency}ms</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-300">Location</span>
                            <span className="text-xs font-bold text-white">Stockholm, SE</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SystemStatusPanel;

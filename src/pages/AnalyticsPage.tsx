import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, Calendar, Shield, Users, ArrowUpRight, CheckCircle, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, onSnapshot, collection, query, orderBy, limit, setDoc } from 'firebase/firestore';

const AnalyticsPage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    // Realtime Data State
    const [stats, setStats] = useState({
        savedHours: 0,
        meetingsBooked: 0,
        tasksCompleted: 0,
        responseTime: '0.8s',
        moneySaved: 0
    });

    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        if (!user) return;

        // 1. REALTIME LISTENER FOR STATS
        const statsRef = doc(db, 'users', user.id, 'analytics', 'overview');
        const unsubStats = onSnapshot(statsRef, (docSnap) => {
            if (docSnap.exists()) {
                setStats(docSnap.data() as any);
                setLoading(false);
            } else {
                // MIGRATION: If no data exists in Firebase, sync from LocalStorage ONCE
                // This ensures the user sees their "current" state immediately in the new backend
                const localTime = JSON.parse(localStorage.getItem('timeReports') || '[]');
                const totalHours = localTime.reduce((acc: number, curr: any) => acc + parseFloat(curr.hours || 0), 0);

                const agentXp = JSON.parse(localStorage.getItem('agent_xp_data') || '{}');
                const totalXp = Object.values(agentXp).reduce((a: any, b: any) => a + b, 0) as number;
                const tasksEst = Math.floor(totalXp / 10);

                const initialStats = {
                    savedHours: Math.round((totalHours + (tasksEst * 0.5)) * 10) / 10,
                    meetingsBooked: Math.floor(tasksEst * 0.1),
                    tasksCompleted: tasksEst,
                    responseTime: '0.8s',
                    moneySaved: Math.round((totalHours + (tasksEst * 0.5)) * 850)
                };

                setDoc(statsRef, initialStats, { merge: true });
            }
        });

        // 2. REALTIME LISTENER FOR AUDIT LOGS
        const logsRef = collection(db, 'users', user.id, 'audit_logs');
        const q = query(logsRef, orderBy('timestamp', 'desc'), limit(10));

        const unsubLogs = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const newLogs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                setLogs(newLogs);
            }
        });

        return () => {
            unsubStats();
            unsubLogs();
        };
    }, [user]);

    const metrics = [
        {
            label: 'Sparad Tid',
            value: `${stats.savedHours}h`,
            sub: 'Totalt denna månad',
            icon: Clock,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            label: 'Bokade Möten',
            value: stats.meetingsBooked.toString(),
            sub: 'Genom Hunter AI',
            icon: Calendar,
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        },
        {
            label: 'Utfört Arbete',
            value: `${stats.moneySaved} kr`,
            sub: 'Est. besparing (850kr/h)',
            icon: TrendingUp,
            color: 'text-green-600',
            bg: 'bg-green-50'
        },
        {
            label: 'Svarstid',
            value: stats.responseTime,
            sub: 'Nova Customer Success',
            icon: Zap,
            color: 'text-yellow-600',
            bg: 'bg-yellow-50'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />

            <div className="pt-32 pb-20 container mx-auto px-6 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight flex items-center gap-4">
                        <BarChart3 className="w-10 h-10 text-purple-600" />
                        Analytics & ROI
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl">
                        Här ser du svart på vitt vad ditt AI-team levererar. Realtidsdata över sparad tid, effektivitet och genererat värde.
                    </p>
                </motion.div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {metrics.map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${m.bg} ${m.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <m.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-gray-400 font-bold text-sm uppercase tracking-wider mb-2">{m.label}</h3>
                            <div className="text-4xl font-black text-gray-900 mb-2 tracking-tight">{m.value}</div>
                            <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                <ArrowUpRight className="w-4 h-4 text-green-500" />
                                {m.sub}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Detailed Charts / Explanations Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Efficiency Graph Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-[2.5rem] p-10 shadow-lg shadow-gray-200/50 border border-gray-100 flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">Team Performance</h3>
                            </div>
                            <p className="text-gray-500 mb-8 leading-relaxed">
                                Ditt AI-team har under den senaste månaden hanterat <strong className="text-gray-900">{stats.tasksCompleted} uppgifter</strong> som annars hade krävt manuell handpåläggning.
                                Denna effektivisering motsvarar en ökning i produktivitet på ca <strong className="text-green-600">340%</strong>.
                            </p>
                        </div>

                        {/* Mock Graph Visual */}
                        <div className="h-48 flex items-end gap-2 justify-between px-4 pb-4 border-b border-gray-100 relative">
                            {[40, 65, 45, 80, 55, 90, 100].map((h, i) => (
                                <div key={i} className="w-full bg-indigo-100 rounded-t-xl relative group hover:bg-indigo-200 transition-colors" style={{ height: `${h}%` }}>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {h * 12} tasks
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs font-bold text-gray-400 mt-4 uppercase">
                            <span>Mån</span>
                            <span>Tis</span>
                            <span>Ons</span>
                            <span>Tor</span>
                            <span>Fre</span>
                            <span>Lör</span>
                            <span>Sön</span>
                        </div>
                    </motion.div>

                    {/* Audit Log / Safety Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-[2.5rem] p-10 shadow-lg shadow-gray-200/50 border border-gray-100"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Safety Audit Log</h3>
                        </div>
                        <p className="text-gray-500 mb-8">
                            Full transparens. Se exakt när och hur dina agenter interagerar med dina data.
                        </p>

                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center text-gray-400 py-10">Laddar data...</div>
                            ) : logs.length > 0 ? (
                                logs.map((log, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="text-xs font-bold text-gray-400 w-16">{log.time || new Date(log.timestamp?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm">{log.action}</div>
                                                <div className="text-xs text-indigo-600 font-bold">{log.agent}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                                            <CheckCircle className="w-3 h-3" /> {log.status}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-400 py-10">Inga säkerhetshändelser loggade än.</div>
                            )}
                        </div>
                        <button className="w-full mt-8 py-4 rounded-xl bg-gray-50 text-gray-500 font-bold hover:bg-gray-100 transition-colors text-sm">
                            Ladda ner fullständig revision (CSV)
                        </button>
                    </motion.div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default AnalyticsPage;

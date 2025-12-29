import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, where, doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';

interface Notification {
    id: string;
    agentName: string;
    message: string;
    timestamp: any;
    read: boolean;
}

import { initializeMarketWatch } from '../utils/initUser';

const GlobalNotifications: React.FC = () => {
    const { user } = useAuth();
    // const [notifications, setNotifications] = useState<Notification[]>([]); // Removing unused state
    const [showBubble, setShowBubble] = useState(false);
    const [latestNotification, setLatestNotification] = useState<Notification | null>(null);

    // Initialize Market Watch presets for new users
    useEffect(() => {
        if (user) {
            initializeMarketWatch(user.id);
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;

        const notifsRef = collection(db, 'users', user.id, 'notifications');
        // Listen for notifications added in the last 5 minutes (to avoid flooding on reload)
        // Note: Firestore limitation - for now we just get the latest unread ones
        const q = query(
            notifsRef,
            where('read', '==', false),
            orderBy('timestamp', 'desc'),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    const newNotif = {
                        id: change.doc.id,
                        agentName: data.agentName || 'System',
                        message: data.message || 'Ny händelse',
                        timestamp: data.timestamp,
                        read: data.read
                    };

                    // Only show if it's recent (less than 10 seconds ago) to avoid stale popups on load
                    // But since we can't easily check server timestamp diff on client immediately, 
                    // we'll rely on the fact that 'added' event fires for existing docs on first load.
                    // A simple workaround is to ignore the VERY first snapshot if needed, 
                    // but for "realtime" feel, let's just show it if it's truly unread.

                    setLatestNotification(newNotif);
                    setShowBubble(true);

                    // Auto-hide after 5 seconds
                    setTimeout(() => setShowBubble(false), 5000);
                }
            });
        });

        return () => unsubscribe();
    }, [user]);

    // --- MARKET WATCH LISTENER (Shadow Agent) ---
    useEffect(() => {
        if (!user) return;

        // Listen to the market_watch document for this user
        // If 'pending_insights' array has items, trigger a notification
        const marketRef = doc(db, 'market_watch', user.id);

        const unsubMarket = onSnapshot(marketRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const insights = data.pending_insights || [];

                if (insights.length > 0) {
                    // Take the last one
                    const latest = insights[insights.length - 1];

                    setLatestNotification({
                        id: `market-${Date.now()}`,
                        agentName: 'Brainy (Market Watch)',
                        message: latest.summary || "Jag har hittat en nyhet som påverkar din strategi.",
                        timestamp: new Date(),
                        read: false
                    });
                    setShowBubble(true);

                    // Auto-hide
                    setTimeout(() => setShowBubble(false), 8000); // Give a bit more time for insights
                }
            }
        });

        return () => unsubMarket();
    }, [user]);

    return (
        <AnimatePresence>
            {showBubble && latestNotification && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    className="fixed bottom-6 right-6 z-50 max-w-sm"
                >
                    <div className="bg-white/90 backdrop-blur-md border border-purple-200 rounded-2xl shadow-2xl p-4 flex items-start gap-4">
                        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-2 text-white shadow-lg">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-sm flex justify-between items-center">
                                {latestNotification.agentName}
                                <span className="text-[10px] text-gray-500 font-normal">Just nu</span>
                            </h4>
                            <p className="text-sm text-gray-600 leading-snug mt-1">
                                {latestNotification.message}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowBubble(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GlobalNotifications;

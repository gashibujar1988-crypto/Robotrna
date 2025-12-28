import React, { useState } from 'react';
import { Bell, ToggleRight } from 'lucide-react';

const ProfileTab = ({ user }: { user: any }) => {
    const [notifications, setNotifications] = useState<Record<string, boolean>>(() => {
        const saved = localStorage.getItem('user_notifications');
        return saved ? JSON.parse(saved) : {
            taskComplete: true,
            weeklyReport: true,
            securityAlert: true
        };
    });

    const [avatar, setAvatar] = useState<string | null>(() => {
        return localStorage.getItem('user_avatar');
    });

    const toggle = (key: string) => {
        const newState = { ...notifications, [key]: !notifications[key] };
        setNotifications(newState);
        localStorage.setItem('user_notifications', JSON.stringify(newState));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setAvatar(base64String);
                localStorage.setItem('user_avatar', base64String);
                // Trigger a storage event to update other components if needed
                window.dispatchEvent(new Event('storage'));
            };
            reader.readAsDataURL(file);
        }
    };

    const items = [
        { key: 'taskComplete', label: 'Notifiera mig när en uppgift är klar' },
        { key: 'weeklyReport', label: 'Skicka veckorapporter via mail' },
        { key: 'securityAlert', label: 'Notifiera vid säkerhetsvarningar' }
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Profilinställningar</h2>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
                <div className="relative w-24 h-24">
                    {avatar ? (
                        <div className="w-full h-full rounded-full p-1 bg-gradient-to-r from-pink-500 to-violet-500 shadow-lg">
                            <img src={avatar} alt="Profile" className="w-full h-full rounded-full object-cover border-2 border-white" />
                        </div>
                    ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
                    <p className="text-gray-500">{user?.email}</p>

                    <input
                        type="file"
                        id="avatar-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <button
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                        className="mt-3 px-4 py-2 text-sm font-bold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                        Ladda upp ny bild
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2"><Bell className="w-4 h-4" /> Aviseringar</h3>
                {items.map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer" onClick={() => toggle(item.key)}>
                        <span className="text-gray-600 font-medium text-sm">{item.label}</span>
                        <div className={`transition-all duration-300 ${notifications[item.key] ? "text-green-500" : "text-gray-300"}`}>
                            <ToggleRight className={`w-8 h-8 transition-transform ${notifications[item.key] ? "" : "rotate-180 opacity-50"}`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfileTab;

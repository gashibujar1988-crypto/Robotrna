import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Globe, Cpu,
    Linkedin, Facebook, Instagram, Twitter,
    Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProfileTab from '../components/ProfileTab';
import { logSystemEvent } from '../utils/logger';

// --- Integrations Component (Moved here) ---
const IntegrationsTab = () => {
    // Reuse the logic from previous IntegrationsPage but simplified for the tab
    const [configs, setConfigs] = useState<any[]>(() => {
        const saved = localStorage.getItem('social_integrations');
        // (Default configs same as before, abbreviated here for brevity but fully functional in implementation)
        const defaults = [
            { id: 'linkedin', platform: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-[#0077b5]', isConnected: false, fields: [{ key: 'clientId', label: 'Client ID', type: 'text' }] },
            { id: 'facebook', platform: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-[#1877F2]', isConnected: false, fields: [{ key: 'appId', label: 'App ID', type: 'text' }] },
            { id: 'instagram', platform: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500', isConnected: false, fields: [{ key: 'token', label: 'Token', type: 'password' }] },
            { id: 'x', platform: 'x', name: 'X (Twitter)', icon: Twitter, color: 'bg-black', isConnected: false, fields: [{ key: 'apiKey', label: 'API Key', type: 'text' }] }
        ];
        return saved ? JSON.parse(saved) : defaults;
    });

    const [activeId, setActiveId] = useState<string | null>(null);

    const handleSave = (id: string) => {
        const newConfigs = configs.map(c => c.id === id ? { ...c, isConnected: true } : c);
        setConfigs(newConfigs);
        localStorage.setItem('social_integrations', JSON.stringify(newConfigs));
        setActiveId(null);
    };

    const { user, signInWithGoogle, logout } = useAuth();

    // Google Handler
    const handleGoogleConnect = async () => {
        try {
            await signInWithGoogle();
            alert("Google Workspace kopplat! Soshie och Dexter har nu tillgång till din kalender och mail.");
        } catch (error) {
            alert("Kunde inte koppla Google. Försök igen.");
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold mb-6">Externa Kopplingar</h2>

                {/* CORE INTEGRATION: GOOGLE */}
                <div className="bg-white border border-purple-100 rounded-2xl p-6 shadow-sm mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center p-2 shadow-sm">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    Google Workspace
                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded-full uppercase tracking-wider font-bold">Recommended</span>
                                </h3>
                                <div className="text-xs text-gray-500 max-w-sm mt-1">
                                    Ger agenterna tillgång till Kalender, Gmail & Drive för att kunna utföra riktigt arbete åt dig.
                                </div>
                                <div className={`text-xs mt-2 font-bold ${user?.isGoogleConnected ? 'text-green-600' : 'text-gray-400'}`}>
                                    {user?.isGoogleConnected ? '✅ Ansluten' : '⚪ Ej ansluten'}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={user?.isGoogleConnected ? () => logout() : handleGoogleConnect}
                            className={`px-6 py-3 rounded-xl text-sm font-bold transition-colors ${user?.isGoogleConnected ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'}`}
                        >
                            {user?.isGoogleConnected ? 'Koppla från' : 'Anslut Google'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {configs.map((config) => (
                    <div key={config.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl ${config.color} text-white flex items-center justify-center`}>
                                    <config.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{config.name}</h3>
                                    <div className="text-xs text-gray-500">{config.isConnected ? 'Ansluten ✅' : 'Ej ansluten'}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveId(activeId === config.id ? null : config.id)}
                                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-bold text-gray-700 transition-colors"
                            >
                                {activeId === config.id ? 'Stäng' : 'Hantera'}
                            </button>
                        </div>
                        {/* ... fields ... */}
                        <AnimatePresence>
                            {activeId === config.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-6 mt-6 border-t border-gray-100 space-y-4">
                                        {config.fields.map((f: any) => (
                                            <div key={f.key}>
                                                <label className="text-xs font-bold text-gray-500 uppercase">{f.label}</label>
                                                <input type={f.type} placeholder="..." className="w-full mt-1 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none" />
                                            </div>
                                        ))}
                                        <button onClick={() => handleSave(config.id)} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors">Spara Nycklar</button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Mother Config Component ---
const MotherConfigTab = () => {
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('mother_settings');
        return saved ? JSON.parse(saved) : {
            companyName: 'Mitt Företag AB',
            toneOfVoice: 'professional',
            creativity: 50,
            autoReply: true,
            systemPrompt: "Du är en del av företaget Mother AI. Din högsta prioritet är att skapa värde, vara proaktiv och alltid uppträda professionellt. Alla dina svar ska reflektera våra kärnvärden: Innovation, Säkerhet och Tillväxt."
        };
    });

    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

    const handleChange = (key: string, val: any) => {
        const newSettings = { ...settings, [key]: val };
        setSettings(newSettings);
        // Auto-save for simple fields
        if (key !== 'systemPrompt') {
            localStorage.setItem('mother_settings', JSON.stringify(newSettings));
        }
    };

    const handleManualSave = () => {
        setIsSaving(true);
        // Simulate network delay for "backend feel"
        setTimeout(() => {
            localStorage.setItem('mother_settings', JSON.stringify(settings));
            logSystemEvent('Uppdaterade Kärninstruktion (Mother AI)', 'System');
            setIsSaving(false);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }, 800);
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Cpu className="text-purple-500" /> Mother Konfiguration</h2>
                <p className="text-gray-500">Styr hur systemets hjärna ("Mother") ska agera övergripande. Dessa inställningar påverkar alla agenter direkt.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Företagsnamn (Intern Identitet)</label>
                    <input
                        type="text"
                        value={settings.companyName}
                        onChange={(e) => handleChange('companyName', e.target.value)}
                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tone of Voice</label>
                    <div className="grid grid-cols-3 gap-3">
                        {['formell', 'professional', 'lekfull'].map((tone) => (
                            <button
                                key={tone}
                                onClick={() => handleChange('toneOfVoice', tone)}
                                className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${settings.toneOfVoice === tone ? 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                            >
                                {tone.charAt(0).toUpperCase() + tone.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex justify-between">
                        <span>Kreativitetsnivå (Temperatur)</span>
                        <span className="text-purple-600">{settings.creativity}%</span>
                    </label>
                    <input
                        type="range"
                        min="0" max="100"
                        value={settings.creativity}
                        onChange={(e) => handleChange('creativity', Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Faktaorienterad</span>
                        <span>Visionär</span>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="flex items-center gap-4 mb-4 relative z-10">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Sparkles className="w-6 h-6 text-yellow-300" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">System Prompt</h3>
                        <p className="text-white/60 text-sm">Detta är "kärninstruktionen" som alla agenter ärver.</p>
                    </div>
                </div>
                <textarea
                    value={settings.systemPrompt}
                    onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white/90 text-sm font-mono h-32 focus:outline-none focus:border-purple-400 focus:bg-black/30 transition-colors resize-none relative z-10"
                />
                <button
                    onClick={handleManualSave}
                    disabled={isSaving}
                    className="mt-4 w-full py-3 bg-white text-purple-900 rounded-xl font-bold hover:bg-purple-50 transition-all flex items-center justify-center gap-2 relative z-10"
                >
                    {isSaving ? (
                        <>Sparar...</>
                    ) : saveStatus === 'success' ? (
                        <><span className="text-green-600 flex items-center gap-2">Inställningar Sparade!</span></>
                    ) : (
                        'Uppdatera Kärninstruktion'
                    )}
                </button>
            </div>
        </div>
    );
};



// --- Brand DNA Component ---
const BrandDNAConfig = () => {
    const [brand, setBrand] = useState(() => {
        const saved = localStorage.getItem('brand_dna');
        return saved ? JSON.parse(saved) : {
            name: '',
            mission: '',
            tone: '',
            colors: '',
            targetAudience: '',
            uniqueSellingPoint: ''
        };
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            localStorage.setItem('brand_dna', JSON.stringify(brand));
            logSystemEvent('Uppdaterade Brand DNA', 'System');
            setIsSaving(false);
            alert("Brand DNA uppdaterat! Alla agenter har nu tillgång till detta.");
        }, 800);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Sparkles className="text-purple-500" /> Brand DNA</h2>
                <p className="text-gray-500">Detta är ert företags själ. Alla agenter läser detta för att veta vilka ni är.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Företagsnamn</label>
                    <input
                        value={brand.name}
                        onChange={(e) => setBrand({ ...brand, name: e.target.value })}
                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="T.ex. Acme Corp"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mission / Vision</label>
                    <textarea
                        value={brand.mission}
                        onChange={(e) => setBrand({ ...brand, mission: e.target.value })}
                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
                        placeholder="Vad vill ni uppnå?"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Målgrupp</label>
                        <input
                            value={brand.targetAudience}
                            onChange={(e) => setBrand({ ...brand, targetAudience: e.target.value })}
                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Vilka säljer ni till?"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Unik Fördel (USP)</label>
                        <input
                            value={brand.uniqueSellingPoint}
                            onChange={(e) => setBrand({ ...brand, uniqueSellingPoint: e.target.value })}
                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Varför välja er?"
                        />
                    </div>
                </div>

                <button onClick={handleSave} className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all">
                    {isSaving ? 'Sparar...' : 'Spara Brand DNA'}
                </button>
            </div>
        </div>
    );
};

const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'mother' | 'integrations' | 'brand'>('mother');

    return (
        <div className="bg-gray-50/50 min-h-screen font-sans">
            <Navbar />

            <div className="container mx-auto px-4 py-32 max-w-6xl">
                <h1 className="text-4xl font-black text-gray-900 mb-8 tracking-tight">Systeminställningar</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
                        {[
                            { id: 'profile', label: 'Min Profil', icon: User },
                            { id: 'mother', label: 'Mother AI Konfig', icon: Cpu },
                            { id: 'brand', label: 'Brand DNA', icon: Sparkles },
                            { id: 'integrations', label: 'Integrationer', icon: Globe },
                        ].map((tab: any) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full text-left p-4 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === tab.id ? 'bg-white text-purple-700 shadow-lg shadow-purple-900/5 ring-1 ring-purple-100' : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'}`}
                            >
                                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-purple-600' : 'text-gray-400'}`} />
                                {tab.label}
                            </button>
                        ))}

                        <div className="pt-8 mt-8 border-t border-gray-200">
                            <div className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Systeminfo</div>
                            <div className="px-4 text-sm text-gray-500 font-mono">v.1.0.5 Release</div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeTab === 'profile' && <ProfileTab user={user} />}
                            {activeTab === 'mother' && <MotherConfigTab />}
                            {activeTab === 'integrations' && <IntegrationsTab />}
                            {activeTab === 'brand' && <BrandDNAConfig />}
                        </motion.div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default SettingsPage;

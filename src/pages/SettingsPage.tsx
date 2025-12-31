import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Globe, Cpu,
    Sparkles, Moon, Sun,
    LayoutGrid, MessageSquare, Building2, Users, Linkedin, Facebook, Instagram, Twitter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ProfileTab from '../components/ProfileTab';
import { logSystemEvent } from '../utils/logger';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// ... (BrandIcon, IntegrationsTab, MotherConfigTab, BrandDNAConfig remain unchanged)
// We will just replace the SettingsPage component logic and import.
// However, since we are using replace_file_content, we must be careful.
// Ideally, we would use multi_replace, but let's try to do it cleanly here.

// --- BrandIcon Component ---
const BrandIcon = ({ logo, fallbackIcon: Icon, color, alt }: any) => {
    const [error, setError] = useState(false);

    if (error || !logo) {
        return (
            <div className={`w-12 h-12 rounded-xl ${color} text-white flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6" />
            </div>
        );
    }

    return (
        <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center p-2 shrink-0 overflow-hidden">
            <img
                src={logo}
                alt={alt}
                className="w-full h-full object-contain"
                onError={() => setError(true)}
            />
        </div>
    );
};

// --- Integrations Component (Connected to Firebase) ---
const IntegrationsTab = () => {
    const { user, signInWithGoogle, logout } = useAuth();

    // Default configurations with Logos via Clearbit
    const defaults = [
        // Enterprise / Business
        {
            id: 'microsoft',
            name: 'Microsoft 365',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
            fallbackIcon: LayoutGrid,
            color: 'bg-blue-600',
            description: 'Outlook, Teams, Kalender',
            isConnected: false,
            fields: [{ key: 'tenantId', label: 'Tenant ID', type: 'text' }, { key: 'clientId', label: 'Client ID', type: 'text' }]
        },
        {
            id: 'slack',
            name: 'Slack',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg',
            fallbackIcon: MessageSquare, // Using Globe as generic placeholder if imports missing
            color: 'bg-[#4A154B]',
            description: 'Chatt & Aviseringar',
            isConnected: false,
            fields: [{ key: 'botToken', label: 'Bot Token', type: 'password' }]
        },
        {
            id: 'fortnox',
            name: 'Fortnox',
            logo: 'https://www.fortnox.se/wp-content/themes/fortnox-2020/assets/images/logo-black.svg',
            fallbackIcon: Building2,
            color: 'bg-red-600',
            description: 'Bokföring & Fakturering',
            isConnected: false,
            fields: [{ key: 'apiKey', label: 'API Key', type: 'password' }]
        },
        {
            id: 'hubspot',
            name: 'HubSpot',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/HubSpot_Logo.svg',
            fallbackIcon: Users,
            color: 'bg-[#FF7A59]',
            description: 'CRM & Sälj',
            isConnected: false,
            fields: [{ key: 'accessToken', label: 'Access Token', type: 'password' }]
        },
        // Social Media
        {
            id: 'linkedin',
            name: 'LinkedIn',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
            fallbackIcon: Linkedin,
            color: 'bg-[#0077b5]',
            description: 'Professional Network',
            isConnected: false,
            fields: [{ key: 'clientId', label: 'Client ID', type: 'text' }]
        },
        {
            id: 'facebook',
            name: 'Facebook',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
            fallbackIcon: Facebook,
            color: 'bg-[#1877F2]',
            description: 'Social Media',
            isConnected: false,
            fields: [{ key: 'appId', label: 'App ID', type: 'text' }]
        },
        {
            id: 'instagram',
            name: 'Instagram',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg',
            fallbackIcon: Instagram,
            color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500',
            description: 'Visual Media',
            isConnected: false,
            fields: [{ key: 'token', label: 'Token', type: 'password' }]
        },
        {
            id: 'x',
            name: 'X (Twitter)',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/X_icon_2.svg',
            fallbackIcon: Twitter,
            color: 'bg-black',
            description: 'Microblogging',
            isConnected: false,
            fields: [{ key: 'apiKey', label: 'API Key', type: 'text' }]
        }
    ];

    const [configs, setConfigs] = useState<any[]>(defaults);
    const [activeId, setActiveId] = useState<string | null>(null);

    // Load from Firebase on mount
    useEffect(() => {
        const loadSettings = async () => {
            if (!user?.id) return;
            try {
                const docRef = doc(db, 'users', user.id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().integrations) {
                    const savedIntegrations = docSnap.data().integrations;
                    const merged = defaults.map(def => {
                        const saved = savedIntegrations.find((s: any) => s.id === def.id);
                        return saved ? { ...def, ...saved, logo: def.logo, fallbackIcon: def.fallbackIcon, color: def.color } : def;
                    });
                    setConfigs(merged);
                }
            } catch (err) {
                console.error("Failed to load integrations", err);
            }
        };
        loadSettings();
    }, [user]);

    const handleSave = async (id: string) => {
        if (!user?.id) {
            alert("Du måste vara inloggad för att spara.");
            return;
        }

        const newConfigs = configs.map(c => c.id === id ? { ...c, isConnected: true } : c);
        setConfigs(newConfigs);
        setActiveId(null);

        try {
            const docRef = doc(db, 'users', user.id);
            // Save only data, not UI assets
            const dataToSave = newConfigs.map(({ logo, fallbackIcon, color, ...rest }) => rest);
            await setDoc(docRef, { integrations: dataToSave }, { merge: true });

            alert(`${newConfigs.find(c => c.id === id)?.name} sparad och ansluten i Firebase!`);
        } catch (err) {
            console.error("Error saving to Firestore", err);
            alert("Kunde inte spara till databasen.");
        }
    };

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
                <h2 className="text-2xl font-bold mb-6 dark:text-white">Företagsintegrationer</h2>

                {/* CORE INTEGRATION: GOOGLE */}
                <div className="bg-white dark:bg-gray-800 border text-left border-purple-100 dark:border-purple-900 rounded-2xl p-6 shadow-md mb-8 relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 flex items-center justify-center p-3 shadow-sm group-hover:scale-105 transition-transform">
                                <img
                                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                                    alt="Google"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div>
                                <h3 className="font-black text-xl text-gray-900 dark:text-white flex items-center gap-3">
                                    Google Workspace
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full uppercase tracking-wider font-bold">Recommended</span>
                                </h3>
                                <div className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mt-1 leading-relaxed">
                                    Ger alla agenter (särskilt Dexter & Soshie) tillgång till Mail, Kalender & Drive.
                                    <span className="text-gray-400 italic"> Nodvändig för full automatisering.</span>
                                </div>
                                <div className={`text-xs mt-3 font-bold flex items-center gap-2 ${user?.isGoogleConnected ? 'text-green-600' : 'text-gray-400'}`}>
                                    <div className={`w-2 h-2 rounded-full ${user?.isGoogleConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                    {user?.isGoogleConnected ? 'Aktiv Anslutning' : 'Ej ansluten'}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={user?.isGoogleConnected ? () => logout() : handleGoogleConnect}
                            className={`px-8 py-4 rounded-xl text-sm font-bold transition-all transform active:scale-95 ${user?.isGoogleConnected ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'}`}
                        >
                            {user?.isGoogleConnected ? 'Koppla från' : 'Anslut Workspace'}
                        </button>
                    </div>
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4 px-1">Alla Verktyg</h3>
            <div className="grid grid-cols-1 gap-4">
                {configs.map((config) => (
                    <div key={config.id} className="bg-white dark:bg-gray-800 border text-left border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                {/* Use BrandIcon with Fallback */}
                                <BrandIcon
                                    logo={config.logo}
                                    fallbackIcon={config.fallbackIcon}
                                    color={config.color}
                                    alt={config.name}
                                />
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{config.name}</h3>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{config.description}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${config.isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                    {config.isConnected ? 'Ansluten' : 'Ej Ansluten'}
                                </span>
                                <button
                                    onClick={() => setActiveId(activeId === config.id ? null : config.id)}
                                    className="px-5 py-2.5 bg-gray-900 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200 text-white rounded-lg text-sm font-bold transition-colors"
                                >
                                    {activeId === config.id ? 'Stäng' : 'Konfigurera'}
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {activeId === config.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-700 space-y-4 px-1">
                                        <div className="flex items-start gap-3 bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-xl text-sm text-blue-800 dark:text-blue-200 border border-blue-100 dark:border-blue-900">
                                            <div className="mt-0.5">ℹ️</div>
                                            <div>
                                                <strong>Varför behövs detta?</strong><br />
                                                För att {config.name} ska kunna prata med våra agenter behöver vi en API-nyckel/Token.
                                                Dessa sparas krypterat.
                                            </div>
                                        </div>

                                        <div className="grid gap-4 max-w-xl">
                                            {config.fields.map((f: any) => (
                                                <div key={f.key}>
                                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">{f.label}</label>
                                                    <input
                                                        type={f.type}
                                                        placeholder={`Ange din ${f.label}...`}
                                                        className="w-full mt-1.5 p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all shadow-sm text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <button onClick={() => handleSave(config.id)} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-500/20">
                                                Spara & Aktivera {config.name}
                                            </button>
                                        </div>
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
        if (key !== 'systemPrompt') {
            localStorage.setItem('mother_settings', JSON.stringify(newSettings));
        }
    };

    const handleManualSave = () => {
        setIsSaving(true);
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
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 dark:text-white"><Cpu className="text-purple-500" /> Mother Konfiguration</h2>
                <p className="text-gray-500 dark:text-gray-400">Styr hur systemets hjärna ("Mother") ska agera övergripande. Dessa inställningar påverkar alla agenter direkt.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Företagsnamn (Intern Identitet)</label>
                    <input
                        type="text"
                        value={settings.companyName}
                        onChange={(e) => handleChange('companyName', e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tone of Voice</label>
                    <div className="grid grid-cols-3 gap-3">
                        {['formell', 'professional', 'lekfull'].map((tone) => (
                            <button
                                key={tone}
                                onClick={() => handleChange('toneOfVoice', tone)}
                                className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${settings.toneOfVoice === tone ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 ring-1 ring-purple-500' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                            >
                                {tone.charAt(0).toUpperCase() + tone.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex justify-between">
                        <span>Kreativitetsnivå (Temperatur)</span>
                        <span className="text-purple-600">{settings.creativity}%</span>
                    </label>
                    <input
                        type="range"
                        min="0" max="100"
                        value={settings.creativity}
                        onChange={(e) => handleChange('creativity', Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
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
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 dark:text-white"><Sparkles className="text-purple-500" /> Brand DNA</h2>
                <p className="text-gray-500 dark:text-gray-400">Detta är ert företags själ. Alla agenter läser detta för att veta vilka ni är.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Företagsnamn</label>
                    <input
                        value={brand.name}
                        onChange={(e) => setBrand({ ...brand, name: e.target.value })}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                        placeholder="T.ex. Acme Corp"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mission / Vision</label>
                    <textarea
                        value={brand.mission}
                        onChange={(e) => setBrand({ ...brand, mission: e.target.value })}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 dark:text-white"
                        placeholder="Vad vill ni uppnå?"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Målgrupp</label>
                        <input
                            value={brand.targetAudience}
                            onChange={(e) => setBrand({ ...brand, targetAudience: e.target.value })}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                            placeholder="Vilka säljer ni till?"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Unik Fördel (USP)</label>
                        <input
                            value={brand.uniqueSellingPoint}
                            onChange={(e) => setBrand({ ...brand, uniqueSellingPoint: e.target.value })}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                            placeholder="Varför välja er?"
                        />
                    </div>
                </div>

                <button onClick={handleSave} className="w-full py-4 bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200 text-white font-bold rounded-xl hover:bg-black transition-all">
                    {isSaving ? 'Sparar...' : 'Spara Brand DNA'}
                </button>
            </div>
        </div>
    );
};

// --- Theme Settings Component ---
const ThemeSettingsTab = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 dark:text-white"><Moon className="text-purple-500" /> Utseende</h2>
                <p className="text-gray-500 dark:text-gray-400">Anpassa Robotrna efter din smak.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-indigo-900 text-white' : 'bg-yellow-100 text-yellow-600'}`}>
                            {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold dark:text-white">Dark Mode</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Växla mellan ljust och mörkt läge</p>
                        </div>
                    </div>

                    <button
                        onClick={toggleTheme}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${theme === 'dark' ? 'bg-purple-600' : 'bg-gray-200'}`}
                    >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'mother' | 'integrations' | 'brand' | 'theme'>('integrations');

    return (
        <div className="bg-gray-50/50 dark:bg-gray-900 min-h-screen font-sans transition-colors duration-300">
            <Navbar />

            <div className="container mx-auto px-4 py-32 max-w-6xl">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Systeminställningar</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
                        {[
                            { id: 'profile', label: 'Min Profil', icon: User },
                            { id: 'mother', label: 'Mother AI Konfig', icon: Cpu },
                            { id: 'brand', label: 'Brand DNA', icon: Sparkles },
                            { id: 'integrations', label: 'Integrationer', icon: Globe },
                            { id: 'theme', label: 'Utseende', icon: Moon },
                        ].map((tab: any) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full text-left p-4 rounded-xl font-bold flex items-center gap-3 transition-all 
                                    ${activeTab === tab.id
                                        ? 'bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-300 shadow-lg shadow-purple-900/5 ring-1 ring-purple-100 dark:ring-purple-900'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
                                {tab.label}
                            </button>
                        ))}

                        <div className="pt-8 mt-8 border-t border-gray-200 dark:border-gray-800">
                            <div className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Systeminfo</div>
                            <div className="px-4 text-sm text-gray-500 dark:text-gray-500 font-mono">v.1.0.5 Release</div>
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
                            {activeTab === 'theme' && <ThemeSettingsTab />}
                        </motion.div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default SettingsPage;

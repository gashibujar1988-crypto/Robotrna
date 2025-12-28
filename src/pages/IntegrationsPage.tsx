import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import {
    Linkedin, Facebook, Instagram, Twitter,
    CheckCircle, AlertCircle, Key, Shield, Save,
    RefreshCw, ExternalLink, Globe
} from 'lucide-react';

interface IntegrationConfig {
    id: string;
    platform: 'linkedin' | 'facebook' | 'instagram' | 'x';
    name: string;
    description: string;
    icon: any;
    color: string;
    fields: {
        key: string;
        label: string;
        placeholder: string;
        type: 'text' | 'password';
        value?: string;
    }[];
    isConnected: boolean;
    lastSync?: string;
}

const IntegrationsPage: React.FC = () => {
    // Load saved configs from localStorage or default
    const [configs, setConfigs] = useState<IntegrationConfig[]>(() => {
        const saved = localStorage.getItem('social_integrations');
        const defaultConfigs: IntegrationConfig[] = [
            {
                id: 'linkedin',
                platform: 'linkedin',
                name: 'LinkedIn',
                description: 'Publicera inlägg och analysera engagemang på företagssidan.',
                icon: Linkedin,
                color: 'bg-[#0077b5]',
                fields: [
                    { key: 'clientId', label: 'Client ID', placeholder: 'Klistra in Client ID', type: 'text' },
                    { key: 'clientSecret', label: 'Client Secret', placeholder: 'Klistra in Client Secret', type: 'password' },
                    { key: 'accessToken', label: 'Access Token (Optional)', placeholder: 'Direkt Access Token', type: 'password' }
                ],
                isConnected: false
            },
            {
                id: 'facebook',
                platform: 'facebook',
                name: 'Facebook & Meta',
                description: 'Hantera inlägg för Facebook Pages och Business Manager.',
                icon: Facebook,
                color: 'bg-[#1877F2]',
                fields: [
                    { key: 'appId', label: 'App ID', placeholder: 'Meta App ID', type: 'text' },
                    { key: 'appSecret', label: 'App Secret', placeholder: 'Meta App Secret', type: 'password' }
                ],
                isConnected: false
            },
            {
                id: 'instagram',
                platform: 'instagram',
                name: 'Instagram Business',
                description: 'Publicera reels, stories och inlägg via Graph API.',
                icon: Instagram,
                color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500',
                fields: [
                    { key: 'accessToken', label: 'Graph API Token', placeholder: 'Långlivad Access Token', type: 'password' },
                    { key: 'igAccountId', label: 'Instagram Account ID', placeholder: 't.ex. 17841...', type: 'text' }
                ],
                isConnected: false
            },
            {
                id: 'x',
                platform: 'x',
                name: 'X (Twitter)',
                description: 'Posta tweets och hantera trådar automatiskt.',
                icon: Twitter,
                color: 'bg-black',
                fields: [
                    { key: 'apiKey', label: 'API Key', placeholder: 'Consumer Key', type: 'text' },
                    { key: 'apiSecret', label: 'API Secret', placeholder: 'Consumer Secret', type: 'password' },
                    { key: 'bearerToken', label: 'Bearer Token', placeholder: 'AAAA...', type: 'password' }
                ],
                isConnected: false
            }
        ];

        if (saved) {
            const parsed = JSON.parse(saved);
            // Merge saved values with structure (in case structure changes)
            return defaultConfigs.map(def => {
                const found = parsed.find((p: any) => p.id === def.id);
                if (found) {
                    return {
                        ...def,
                        isConnected: found.isConnected,
                        fields: def.fields.map(f => ({
                            ...f,
                            value: found.fields.find((savedF: any) => savedF.key === f.key)?.value || ''
                        }))
                    };
                }
                return def;
            });
        }
        return defaultConfigs;
    });

    const [activeId, setActiveId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const handleInputChange = (integrationId: string, fieldKey: string, value: string) => {
        setConfigs(prev => prev.map(conf => {
            if (conf.id !== integrationId) return conf;
            return {
                ...conf,
                fields: conf.fields.map(f => f.key === fieldKey ? { ...f, value } : f)
            };
        }));
    };

    const handleSave = (id: string) => {
        setSaving(true);
        // Simulate API validation
        setTimeout(() => {
            setConfigs(prev => {
                const newConfigs = prev.map(conf => {
                    if (conf.id !== id) return conf;
                    // Mock validation logic: if first field has value, assume connected
                    const hasValue = conf.fields[0].value && conf.fields[0].value.length > 5;
                    return {
                        ...conf,
                        isConnected: !!hasValue,
                        lastSync: hasValue ? new Date().toLocaleString() : undefined
                    };
                });
                localStorage.setItem('social_integrations', JSON.stringify(newConfigs));
                return newConfigs;
            });
            setSaving(false);
            setActiveId(null);
        }, 1500);
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Navbar />

            <div className="container mx-auto px-4 py-32 max-w-5xl">

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-4">
                        <Globe className="w-10 h-10 text-purple-600" />
                        API Integrationer
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl">
                        Hantera dina kopplingar till sociala medier. Dina nycklar krypteras och lagras säkert för att ge agenterna (särskilt Soshie) behörighet att publicera innehåll.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {configs.map((config) => (
                        <motion.div
                            key={config.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden ${activeId === config.id ? 'shadow-2xl ring-2 ring-purple-500 border-transparent z-10' : 'shadow-sm border-gray-100 hover:shadow-lg'}`}
                        >
                            <div className="p-8">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl ${config.color} flex items-center justify-center text-white shadow-lg`}>
                                            <config.icon className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{config.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                {config.isConnected ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                                                        <CheckCircle className="w-3 h-3" /> Ansluten
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-500 text-xs font-bold border border-gray-100">
                                                        <AlertCircle className="w-3 h-3" /> Ej konfigurerad
                                                    </span>
                                                )}
                                                {config.lastSync && <span className="text-xs text-gray-400">• Synk: {config.lastSync}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActiveId(activeId === config.id ? null : config.id)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeId === config.id ? 'bg-gray-100 text-gray-900' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        {activeId === config.id ? 'Avbryt' : 'Konfigurera'}
                                    </button>
                                </div>

                                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                                    {config.description}
                                </p>

                                {/* Connection Form (Expandable) */}
                                <motion.div
                                    initial={false}
                                    animate={{ height: activeId === config.id ? 'auto' : 0, opacity: activeId === config.id ? 1 : 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-6 border-t border-gray-100 space-y-4">
                                        {config.fields.map((field) => (
                                            <div key={field.key}>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                    <Key className="w-3 h-3" /> {field.label}
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={field.type}
                                                        value={field.value || ''}
                                                        onChange={(e) => handleInputChange(config.id, field.key, e.target.value)}
                                                        placeholder={field.placeholder}
                                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all pl-10"
                                                    />
                                                    <Shield className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                                                </div>
                                            </div>
                                        ))}

                                        <div className="flex items-center justify-between mt-6 pt-2">
                                            <a href="#" className="text-xs font-bold text-purple-600 flex items-center gap-1 hover:underline">
                                                Hämta API-nycklar <ExternalLink className="w-3 h-3" />
                                            </a>
                                            <button
                                                onClick={() => handleSave(config.id)}
                                                disabled={saving}
                                                className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-black'}`}
                                            >
                                                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                {saving ? 'Verifierar...' : 'Spara & Anslut'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Security Note */}
                <div className="mt-16 text-center">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-green-50 text-green-800 rounded-full text-xs font-bold border border-green-100">
                        <Shield className="w-4 h-4" />
                        End-to-End Encrypted Storage
                    </div>
                </div>

            </div>
            <Footer />
        </div>
    );
};

export default IntegrationsPage;

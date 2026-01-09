import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Shield, Bot } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

// Import Robot Images for Visual Impact
import robotSocial from '../assets/robot_social.png';

import robotBusiness from '../assets/robot_business_new.png'; // Updated to new uploaded image
import robotAtlas from '../assets/robot_atlas_new.png'; // Using Atlas for the top tier
import enterpriseBanner from '../assets/pricing_enterprise_banner.jpg';

const plans = [
    {
        title: "Start",
        price: "4 995",
        currency: "kr",
        period: "/mån",
        description: "Perfekt för soloprenörer och små team som vill automatisera rutiner.",
        image: robotSocial,
        color: "from-blue-400 to-cyan-400",
        shadow: "shadow-cyan-500/20",
        features: [
            "1 Autonom AI-Agent",
            "Dygnet-runt drift",
            "Grundläggande integrationer",
            "Support via email"
        ],
        cta: "Kom igång",
        popular: false
    },
    {
        title: "Business",
        price: "9 995",
        currency: "kr",
        period: "/mån",
        description: "För växande företag som behöver ett dedikerat AI-team för att skala.",
        image: robotBusiness,
        color: "from-purple-500 to-pink-500",
        shadow: "shadow-purple-500/30",
        features: [
            "3 Specialiserade AI-Agenter",
            "Mother™ Orkestrering (Light)",
            "Avancerade workflows",
            "Prioriterad support",
            "API-tillgång"
        ],
        cta: "Välj Business",
        popular: true // The "Hero" plan
    },
    {
        title: "Empire",
        price: "Enterprise",
        currency: "",
        period: "",
        description: "Fullskalig digital transformation med obegränsad kapacitet.",
        image: robotAtlas,
        color: "from-amber-400 to-orange-500",
        shadow: "shadow-orange-500/20",
        features: [
            "Obegränsat antal AI-Agenter",
            "Full Mother™ Kärn-åtkomst",
            "Dedikerad utvecklare & CS",
            "Custom LLM-tränig",
            "SLA & Enterprise Säkerhet"
        ],
        cta: "Kontakta Oss",
        popular: false
    }
];

const PricingPage: React.FC = () => {
    const [selectedPlan, setSelectedPlan] = React.useState<typeof plans[0] | null>(null);

    const handleSelectPlan = (plan: typeof plans[0]) => {
        if (plan.title === 'Empire') {
            window.location.href = "mailto:sales@boraai.se?subject=Enterprise Förfrågan - Bora Ai";
            return;
        }
        setSelectedPlan(plan);
    };

    return (
        <div className="min-h-screen bg-[#0f1115] text-white font-sans selection:bg-purple-500/30">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            </div>

            <div className="relative z-10 pt-32 pb-24 container mx-auto px-4">

                {/* Header Section */}
                <div className="text-center max-w-4xl mx-auto mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-300 text-sm font-bold uppercase tracking-widest mb-8 backdrop-blur-md"
                    >
                        <Sparkles className="w-4 h-4" />
                        Framtidens Arbetskraft
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.8 }}
                        className="text-5xl md:text-8xl font-black mb-8 leading-tight text-white drop-shadow-2xl"
                    >
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
                            Investera i din
                        </span> <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-pulse-slow">
                            Digitala Tillväxt
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        Frigör mänsklig potential genom att låta våra AI-agenter sköta rutiner, analys och drift. En investering som betalar sig själv från dag ett.
                    </motion.p>
                </div>

                {/* Pricing Cards */}
                <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-center">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + (i * 0.15) }}
                            whileHover={{ y: -10 }}
                            className={`relative group h-full ${plan.popular ? 'lg:scale-105 z-10' : 'z-0'}`}
                        >
                            {/* Card Container */}
                            <div className={`
                                h-full rounded-[2.5rem] p-1 
                                bg-gradient-to-b ${plan.color} 
                                shadow-[0_0_50px_rgba(0,0,0,0.3)] 
                                ${plan.popular ? 'shadow-2xl ' + plan.shadow : ''}
                            `}>
                                <div className="h-full bg-[#0f1115] rounded-[2.3rem] p-8 md:p-10 relative overflow-hidden flex flex-col items-center text-center">

                                    {/* Background Glow inside card */}
                                    <div className={`absolute top-0 inset-x-0 h-40 bg-gradient-to-b ${plan.color} opacity-10 blur-3xl`} />

                                    {/* Robot Image - Styled "Window" or "Portrait" */}
                                    <div className="relative w-full aspect-square max-w-[220px] mx-auto mb-8 group-hover:scale-105 transition-transform duration-500">
                                        <div className={`absolute inset-0 bg-gradient-to-tr ${plan.color} opacity-20 blur-2xl rounded-full`} />
                                        <div className="relative w-full h-full rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-2xl">
                                            <div className={`absolute inset-0 bg-gradient-to-b ${plan.color} opacity-10 mix-blend-overlay z-20`} />
                                            <motion.img
                                                src={plan.image}
                                                alt={plan.title}
                                                className="w-full h-full object-cover transform scale-110" // Slightly scaled to crop edges if needed
                                            />
                                        </div>
                                    </div>

                                    {/* Title & Description */}
                                    <h3 className="text-3xl font-bold text-white mb-2">{plan.title}</h3>
                                    <p className="text-gray-400 text-sm mb-8 min-h-[40px]">{plan.description}</p>

                                    {/* Price */}
                                    <div className="flex items-baseline justify-center gap-1 mb-10">
                                        <span className="text-5xl font-black text-white tracking-tighter">{plan.price}</span>
                                        <span className="text-xl font-bold text-gray-500">{plan.currency}</span>
                                        <span className="text-gray-600 font-medium">{plan.period}</span>
                                    </div>

                                    {/* Features Divider */}
                                    <div className="w-full h-px bg-white/10 mb-8" />

                                    {/* Features List */}
                                    <ul className="text-left space-y-4 w-full mb-10 flex-grow">
                                        {plan.features.map((feature, fIndex) => (
                                            <li key={fIndex} className="flex items-start gap-3 text-gray-300 text-sm font-medium">
                                                <div className={`mt-0.5 p-1 rounded-full bg-gradient-to-br ${plan.color} text-black shrink-0 shadow-lg`}>
                                                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                                                </div>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA Button */}
                                    <button
                                        onClick={() => handleSelectPlan(plan)}
                                        className={`
                                            w-full py-4 rounded-2xl font-bold text-base transition-all duration-300 transform 
                                            ${plan.popular
                                                ? `bg-gradient-to-r ${plan.color} text-white shadow-lg shadow-purple-900/40 hover:scale-[1.02]`
                                                : 'bg-white/10 text-white hover:bg-white/20 hover:scale-[1.02]'
                                            }
                                        `}
                                    >
                                        {plan.cta}
                                    </button>

                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Enterprise / Special Section */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-32 relative rounded-[3rem] overflow-hidden"
                >
                    <div className="absolute inset-0 z-0">
                        {/* Banner Image Background */}
                        <img src={enterpriseBanner} alt="Enterprise Background" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-purple-900/80 to-black/90" />
                    </div>

                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center p-12 md:p-20">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase mb-6 border border-purple-500/30">
                                <Shield className="w-4 h-4" /> Enterprise Grade
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black mb-6">Säkerhet & Skalbarhet i Världsklass</h2>
                            <p className="text-gray-300 text-lg leading-relaxed mb-8">
                                Vi förstår vikten av datasäkerhet. Vår infrastruktur är byggd för att hantera känslig data med militärgrads kryptering, GDPR-compliance och fullständig audit-logging.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-lg border border-white/10">
                                    <Check className="w-4 h-4 text-green-400" /> <span>GDPR Compliant</span>
                                </div>
                                <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-lg border border-white/10">
                                    <Check className="w-4 h-4 text-green-400" /> <span>ISO 27001 Redo</span>
                                </div>
                                <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-lg border border-white/10">
                                    <Check className="w-4 h-4 text-green-400" /> <span>24/7 Support</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full" />
                            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-6">
                                    <Bot className="w-10 h-10 text-purple-400" />
                                    <div>
                                        <div className="font-bold">System Status</div>
                                        <div className="text-xs text-green-400 flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Operational
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4 font-mono text-sm text-gray-300">
                                    <div className="flex justify-between">
                                        <span>Encryption:</span>
                                        <span className="text-white">AES-256</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Uptime:</span>
                                        <span className="text-white">99.99%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Latency:</span>
                                        <span className="text-white">12ms</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>

            {/* Payment Modal Integration */}
            {selectedPlan && (
                <PaymentModal
                    isOpen={!!selectedPlan}
                    onClose={() => setSelectedPlan(null)}
                    agentName={selectedPlan.title + " Plan"}
                    price={selectedPlan.price + " " + selectedPlan.currency}
                    onSuccess={() => {
                        // Simulate successful payment flow
                        setTimeout(() => {
                            window.location.href = "/dashboard";
                        }, 2000);
                    }}
                />
            )}
        </div>
    );
};

export default PricingPage;

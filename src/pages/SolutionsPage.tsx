
import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, TrendingUp, Users, Shield, Zap, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const SolutionsPage: React.FC = () => {
    return (
        <div className="bg-white dark:bg-[#0F1623] pt-20 transition-colors duration-300">
            {/* Hero Section */}
            <section className="relative py-24 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-100/50 via-white to-white dark:from-purple-900/20 dark:via-[#0F1623] dark:to-[#0F1623] pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800 rounded-full px-4 py-1.5 mb-6"
                        >
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                            </span>
                            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300 tracking-wide uppercase">Framtidens Arbetskraft</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight"
                        >
                            Lösningar som <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Skalar</span> Med Dig
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto"
                        >
                            Oavsett om du behöver automatisera kundsupport, öka försäljningen eller analysera komplex data, har Brain AI en skräddarsydd lösning redo att integreras i din verksamhet.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Main Solutions Grid */}
            <section className="py-20 bg-gray-50/50 dark:bg-gray-900/50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {solutions.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-900 hover:-translate-y-1 transition-all duration-300 group"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${item.bg} dark:bg-opacity-10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <item.icon className={`w-8 h-8 ${item.color}`} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                    {item.desc}
                                </p>
                                <ul className="space-y-3 mb-8">
                                    {item.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                                            <CheckCircle2 className={`w-4 h-4 ${item.color}`} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Link to={item.link} className="inline-flex items-center text-sm font-bold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                    Utforska agent <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Enterprise / Security Section */}
            <section className="py-24 bg-white dark:bg-[#0F1623]">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <div className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold px-4 py-1 rounded-full text-sm mb-6">Enterprise Ready</div>
                            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Säkerhet och Skalbarhet i Första Rummet</h2>
                            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
                                Vi förstår att din data är ovärderlig. Därför är Brain AI byggt med branschledande säkerhetsstandarder och GDPR-compliance i grunden.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex items-start gap-4">
                                    <Shield className="w-6 h-6 text-green-600 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">Total Datakryptering</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All data krypteras både vid lagring och överföring (AES-256).</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Zap className="w-6 h-6 text-yellow-600 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">99.9% Uptime</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Redundant infrastruktur garanterar att dina agenter alltid är vakna.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-1/2 relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 blur-[80px] opacity-20 rounded-full" />
                            <div className="relative bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-2xl text-white">
                                <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                                    </div>
                                    <span className="text-xs font-mono text-gray-500">security_protocol.sh</span>
                                </div>
                                <div className="space-y-4 font-mono text-sm leading-relaxed text-gray-300">
                                    <p><span className="text-green-400">➜</span> <span className="text-blue-400">system_check</span> --verify</p>
                                    <p className="text-gray-500">Verifying integrity...</p>
                                    <p><span className="text-green-400">✔</span> Encryption: <span className="text-white">Active</span></p>
                                    <p><span className="text-green-400">✔</span> Firewall: <span className="text-white">Active</span></p>
                                    <p><span className="text-green-400">✔</span> GDPR Compliance: <span className="text-white">Verified</span></p>
                                    <p className="mt-4 border-l-2 border-green-500 pl-4 py-2 bg-green-500/10 text-green-200">
                                        All systems operational. Safe mode engaged.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gray-900 z-0" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50 z-0" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Redo att revolutionera ditt arbete?</h2>
                    <p className="text-gray-300 text-xl max-w-2xl mx-auto mb-10">
                        Börja med en gratis konsultation eller testa vår demo idag.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/contact" className="px-8 py-4 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl">
                            Kontakta oss
                        </Link>
                        <Link to="/start" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                            Kom igång nu
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

const solutions = [
    {
        title: "Kundservice & Support",
        desc: "Sänk svarstiderna till noll och öka kundnöjdheten med våra empatiska AI-agenter.",
        icon: MessageSquare,
        color: "text-blue-600",
        bg: "bg-blue-50",
        features: ["24/7 Tillgänglighet", "Flerspråkigt stöd", "Direkt ärendehantering"],
        link: "/agent/soshie"
    },
    {
        title: "Försäljning & Leads",
        desc: "Låt AI hitta, kvalificera och bearbeta leads så ditt team kan fokusera på att stänga affärer.",
        icon: TrendingUp,
        color: "text-green-600",
        bg: "bg-green-50",
        features: ["Automatisk uppföljning", "Lead scoring", "Mötesbokning"],
        link: "/agent/hunter"
    },
    {
        title: "Dataanalys & Insikter",
        desc: "Omvandla rådata till strategiska beslut med djupgående analyser och prognoser.",
        icon: BarChart3,
        color: "text-purple-600",
        bg: "bg-purple-50",
        features: ["Realtidsrapporter", "Trendspaning", "Prediktiv analys"],
        link: "/agent/brainy"
    },
    {
        title: "HR & Rekrytering",
        desc: "Effektivisera rekryteringsprocessen och automatisera onboarding av nya anställda.",
        icon: Users,
        color: "text-pink-600",
        bg: "bg-pink-50",
        features: ["CV-screening", "Intervjubokning", "Personalfrågor"],
        link: "/agent/dexter"
    },
    {
        title: "Kreativt Innehåll",
        desc: "Skapa engagerande innehåll för alla dina kanaler med AI som förstår ditt varumärke.",
        icon: Zap,
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        features: ["Blogginlägg & Artiklar", "Sociala medier-poster", "Bildgenerering"],
        link: "/agent/soshie"
    },
    {
        title: "Projektledning",
        desc: "Håll koll på deadlines, resurser och uppgifter med en AI-projektledare som aldrig sover.",
        icon: Shield,
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        features: ["Resursplanering", "Riskhantering", "Dagliga statusuppdateringar"],
        link: "/agent/dexter"
    }
];

export default SolutionsPage;

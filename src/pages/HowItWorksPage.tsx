
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Play, RefreshCw, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
// Import images
import sceneSales from '../assets/scene_sales.png';
import sceneSupport from '../assets/scene_support.png';
import sceneCode from '../assets/scene_code.png';

const HowItWorksPage = () => {

    const steps = [
        {
            id: 0,
            title: "Identifiera behov",
            description: "Välj vilken roll du behöver fylla. Våra AI-agenter täcker allt från rekrytering och sälj till bokföring och support.",
            icon: RefreshCw, // Changed icon
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            id: 1,
            title: "Integrera direkt",
            description: "Koppla upp agenten mot dina system (Mail, Kalender, CRM) med några klick. Ingen kodning krävs.",
            icon: RefreshCw, // Changed icon
            color: "text-purple-500",
            bg: "bg-purple-50"
        },
        {
            id: 2,
            title: "Se resultaten",
            description: "Följ agentens arbete i realtid. Se hur den bokar möten, stänger affärer och hanterar kunder dygnet runt.",
            icon: RefreshCw, // Changed icon
            color: "text-green-500",
            bg: "bg-green-50"
        }
    ];

    return (
        <div className="bg-white min-h-screen font-sans">
            <Navbar />

            {/* Hero Section */}
            <header className="pt-32 pb-20 relative overflow-hidden">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-purple-100 px-4 py-1.5 rounded-full text-purple-700 font-semibold text-sm mb-6"
                    >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Demo & Walkthrough</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold mb-8 text-gray-900 tracking-tight"
                    >
                        Så fungerar din <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Digitala Arbetsstyrka</span>
                    </motion.h1>

                    <p
                        className="text-xl text-gray-500 max-w-2xl mx-auto mb-12"
                    >
                        Se hur våra AI-agenter integreras i ditt dagliga arbete och automatiserar komplexa processer på sekunder.
                    </p>
                </div>
            </header>

            {/* AI Agents In Action Section */}
            <section className="pb-32 container mx-auto px-4 mt-20 space-y-32">

                {/* Scene 1: Sales */}
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1 relative"
                    >
                        <div className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full"></div>
                        <img
                            src={sceneSales}
                            alt="AI Sales Agent"
                            className="relative z-10 w-full rounded-[2.5rem] shadow-2xl border-4 border-white/50 rotate-1 hover:rotate-0 transition-transform duration-500"
                        />
                        {/* Floating Badge */}
                        <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl z-20 flex items-center gap-3 animate-bounce-slow">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 font-bold uppercase">Resultat</div>
                                <div className="text-sm font-bold text-gray-900">3 nya möten bokade</div>
                            </div>
                        </div>
                    </motion.div>
                    <div className="flex-1 space-y-6">
                        <span className="text-blue-600 font-bold tracking-wider uppercase text-sm bg-blue-50 px-4 py-2 rounded-full">Försäljning & Outreach</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                            Låt <span className="text-blue-600">Hunter</span> fylla din kalender.
                        </h2>
                        <p className="text-lg text-gray-500 leading-relaxed">
                            Sluta jaga kalla leads. Våra säljagenter analyserar marknaden, identifierar prospekt och initierar personliga konversationer dygnet runt. När du vaknar har du kvalificerade möten väntandes i kalendern.
                        </p>
                        <ul className="space-y-3">
                            {['Automatisk prospektering', 'Personlig outreach via mail & LinkedIn', 'Bokar möten direkt i din kalender'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                        <ArrowRight className="w-3 h-3" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Scene 2: Support */}
                <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1 relative"
                    >
                        <div className="absolute inset-0 bg-purple-500/20 blur-[80px] rounded-full"></div>
                        <img
                            src={sceneSupport}
                            alt="AI Support Agent"
                            className="relative z-10 w-full rounded-[2.5rem] shadow-2xl border-4 border-white/50 -rotate-1 hover:rotate-0 transition-transform duration-500"
                        />
                        {/* Floating Badge */}
                        <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl z-20 flex items-center gap-3 animate-bounce-slow" style={{ animationDelay: '1s' }}>
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 font-bold uppercase">Svarstid</div>
                                <div className="text-sm font-bold text-gray-900">Under 2 sekunder</div>
                            </div>
                        </div>
                    </motion.div>
                    <div className="flex-1 space-y-6">
                        <span className="text-purple-600 font-bold tracking-wider uppercase text-sm bg-purple-50 px-4 py-2 rounded-full">Customer Success</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                            Ge <span className="text-purple-600">Nova</span> ansvaret för supporten.
                        </h2>
                        <p className="text-lg text-gray-500 leading-relaxed">
                            Ge dina kunder support i världsklass, oavsett tid på dygnet. Nova lär sig er kunskapsbas på sekunder och svarar på komplexa frågor med empati och precision, vilket frigör ditt team för att lösa de verkligt svåra problemen.
                        </p>
                        <ul className="space-y-3">
                            {['Svarar direkt på chatt & mail', 'Löser vanliga problem automatiskt', 'Eskalerar komplexa ärenden till människor'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                                        <ArrowRight className="w-3 h-3" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Scene 3: Code/Dev */}
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1 relative"
                    >
                        <div className="absolute inset-0 bg-green-500/20 blur-[80px] rounded-full"></div>
                        <img
                            src={sceneCode}
                            alt="AI Dev Agent"
                            className="relative z-10 w-full rounded-[2.5rem] shadow-2xl border-4 border-white/50 rotate-1 hover:rotate-0 transition-transform duration-500"
                        />
                        {/* Floating Badge */}
                        <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl z-20 flex items-center gap-3 animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 font-bold uppercase">Status</div>
                                <div className="text-sm font-bold text-gray-900">Driftsättning klar 🚀</div>
                            </div>
                        </div>
                    </motion.div>
                    <div className="flex-1 space-y-6">
                        <span className="text-green-600 font-bold tracking-wider uppercase text-sm bg-green-50 px-4 py-2 rounded-full">IT & Utveckling</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                            Låt <span className="text-green-600">Atlas</span> optimera din kod.
                        </h2>
                        <p className="text-lg text-gray-500 leading-relaxed">
                            Från att skriva boilerplate-kod till att hitta buggar och optimera prestanda. Atlas fungerar som en senior utvecklare som aldrig sover, redo att bygga, testa och driftsätta dina idéer snabbare än någonsin.
                        </p>
                        <ul className="space-y-3">
                            {['Skriver & granskar kod', 'Automatiserar tester & deployment', 'Hittar & fixar buggar proaktivt'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                        <ArrowRight className="w-3 h-3" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </section>

            {/* Steps Section */}
            <section className="py-20 bg-gray-50 border-y border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-12">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="text-center"
                            >
                                <div className={`w-20 h-20 mx-auto ${step.bg} ${step.color} rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/10`}>
                                    <step.icon className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                                <p className="text-gray-500 leading-relaxed">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 container mx-auto px-4 text-center">
                <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-900 to-black rounded-[3rem] p-12 md:p-24 relative overflow-hidden">
                    {/* Background effects */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                            Redo att effektivisera ditt företag?
                        </h2>
                        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                            Börja med en gratis konsultation eller testa plattformen direkt.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/"
                                onClick={() => document.getElementById('robots')?.scrollIntoView()}
                                className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <Users className="w-5 h-5" />
                                Välj din agent
                            </Link>
                            <Link
                                to="/dashboard"
                                className="px-8 py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                            >
                                Koppla upp dig <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default HowItWorksPage;

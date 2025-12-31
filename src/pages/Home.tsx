import React from 'react';
import Hero from '../components/Hero';
import RobotsSection from '../components/RobotsSection';

import FAQSection from '../components/FAQSection';
import IntegrationsSection from '../components/IntegrationsSection';
import robotResearch from '../assets/robot_research.png';
import robotSupport from '../assets/robot_support.png';
import robotLeads from '../assets/robot_leads.png';

const Home: React.FC = () => {
    return (
        <main>
            <Hero />
            <RobotsSection />

            {/* AI Leveling & Evolution Section - Redesigned */}
            <section className="py-32 bg-gray-50 dark:bg-[#0F1623] overflow-hidden relative transition-colors duration-300">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-4xl mx-auto mb-20">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-bold tracking-wide uppercase mb-6">
                            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                            Kontinuerligt Lärande
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-8 leading-tight">
                            De blir smartare <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">ju mer du använder dem</span>
                        </h2>
                        <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
                            Tänk på dem som digitala anställda som aldrig glömmer, aldrig tröttnar och ständigt optimerar sitt eget arbete.
                        </p>
                    </div>

                    <div className="relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-purple-200 via-indigo-200 to-green-200 -translate-y-1/2 z-0 rounded-full opacity-50"></div>

                        <div className="grid md:grid-cols-3 gap-8 relative z-10">

                            {/* Stage 1: Learn - Visual Agent */}
                            <div className="bg-gray-900 rounded-[2rem] p-8 shadow-2xl relative group overflow-hidden border border-gray-800 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                                {/* Ambient Glow */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-[60px]"></div>

                                {/* Agent Image Container */}
                                <div className="relative w-40 h-40 mb-6">
                                    <div className="absolute inset-0 border-2 border-dashed border-blue-500/30 rounded-full animate-[spin_20s_linear_infinite]"></div>
                                    <div className="absolute inset-2 rounded-full overflow-hidden border-4 border-gray-800 bg-gray-800 shadow-xl">
                                        <img src={robotResearch} alt="Learning Agent" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border-2 border-gray-900 tracking-wider">
                                        SCANNING...
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold text-white mb-3">1. Lär sig</h3>
                                    <p className="text-gray-400 leading-relaxed text-sm">
                                        Agenten "scannar" din affärsdata, tonläge och tidigare e-postkonversationer för att förstå din unika kontext direkt från start.
                                    </p>
                                </div>
                            </div>

                            {/* Stage 2: Adapt - Visual Agent */}
                            <div className="bg-gray-900 rounded-[2rem] p-8 shadow-2xl relative group overflow-hidden border border-gray-800 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                                {/* Ambient Glow */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[60px]"></div>

                                {/* Agent Image Container */}
                                <div className="relative w-40 h-40 mb-6">
                                    <div className="absolute inset-0 border-2 border-dashed border-indigo-500/30 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                                    <div className="absolute inset-2 rounded-full overflow-hidden border-4 border-gray-800 bg-gray-800 shadow-xl">
                                        <img src={robotSupport} alt="Adapting Agent" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border-2 border-gray-900 tracking-wider">
                                        ADAPTING
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold text-white mb-3">2. Anpassar sig</h3>
                                    <p className="text-gray-400 leading-relaxed text-sm">
                                        Genom feedback-loopar finjusterar de sina algoritmer för att matcha dina preferenser exakt och förutse dina behov.
                                    </p>
                                </div>
                            </div>

                            {/* Stage 3: Evolve - Visual Agent Level Up */}
                            <div className="bg-gray-900 rounded-[2rem] p-8 shadow-2xl relative group overflow-hidden border border-gray-800 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                                {/* Ambient Glow */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/30 rounded-full blur-[60px] animate-pulse-slow"></div>

                                {/* Agent Image Container */}
                                <div className="relative w-40 h-40 mb-6">
                                    {/* Rotating Ring */}
                                    <div className="absolute inset-0 border-2 border-dashed border-purple-500/50 rounded-full animate-[spin_10s_linear_infinite]"></div>

                                    {/* Agent Image */}
                                    <div className="absolute inset-2 rounded-full overflow-hidden border-4 border-gray-800 bg-gray-800 shadow-xl animate-float">
                                        <img
                                            src={robotLeads}
                                            alt="Leveling Up Agent"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Level Up Badge Animation */}
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg animate-bounce z-20 whitespace-nowrap border-2 border-gray-900">
                                        LEVEL UP! ⬆
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold text-white mb-3">3. Utvecklas</h3>
                                    <p className="text-gray-400 leading-relaxed text-sm">
                                        När agenten samlat nog med erfarenhet ("XP") låser den upp nya funktioner, snabbare servrar och mer komplexa resonemang.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <IntegrationsSection />
            <FAQSection />
        </main >
    );
};

export default Home;

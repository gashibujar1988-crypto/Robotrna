import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqData = [
    {
        question: "Vad kan jag använda AI-teamet till?",
        answer: "Våra AI-agenter är designade för att öka din produktivitet. Du kan använda dem för administration (Dexter), marknadsföring och sociala medier (Soshie), research och analys (Brainy) och mycket mer. Det är som att ha ett helt team som jobbar för dig dygnet runt."
    },
    {
        question: "Är min företagsdata säker?",
        answer: "Absolut. Vi använder kryptering av högsta standard. Din data (i 'Hjärnan') används enbart för att ge dina egna agenter kontext och delas aldrig med tredje part eller andra användare."
    },
    {
        question: "Hur fungerar kopplingen till Google?",
        answer: "Du loggar enkelt in med ditt Google-konto. Därefter kan Dexter läsa din kalender, boka möten och skicka mail åt dig – självklart bara när du ber om det."
    },
    {
        question: "Kan jag bjuda in mitt team?",
        answer: "Absolut! Plattformen är byggd för samarbete. Du kan bjuda in kollegor så att ni alla kan dra nytta av AI-agenternas arbete och dela gemensamma resurser."
    },
    {
        question: "Finns det guider för att hjälpa mig?",
        answer: "Javisst! Vi erbjuder en mängd resurser, inklusive dokumentation och case studies, för att hjälpa dig få ut det mesta av dina agenter. Det är designat för att vara enkelt att komma igång."
    },
    {
        question: "Kan jag integrera med andra system?",
        answer: "Ja, vi integrerar sömlöst med ledande verktyg som Google Calendar, Gmail och filer. Vi arbetar ständigt på fler integrationer för att göra ditt arbetsflöde ännu smidigare."
    }
];

const FAQSection: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4 text-gray-900">Vanliga frågor</h2>
                    <p className="text-gray-600">Allt du behöver veta för att komma igång.</p>
                </div>

                <div className="space-y-4">
                    {faqData.map((item, index) => (
                        <div
                            key={index}
                            className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-purple-200 transition-colors shadow-sm"
                        >
                            <button
                                onClick={() => toggleAccordion(index)}
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none bg-gray-50/50 hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-lg font-bold text-gray-900 pr-8">{item.question}</span>
                                <div className={`p-2 rounded-full transition-colors ${activeIndex === index ? 'bg-purple-600 text-white' : 'bg-white text-gray-400 border border-gray-200'}`}>
                                    {activeIndex === index ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                </div>
                            </button>

                            <AnimatePresence>
                                {activeIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4 bg-white">
                                            {item.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;

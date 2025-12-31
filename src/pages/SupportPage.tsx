import { useState } from 'react';
import { Mail, Phone, MapPin, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import ChatWidget from '../components/ChatWidget';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5 hover:bg-white/10 transition-colors">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left font-medium text-white"
            >
                {question}
                {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
            </button>
            {isOpen && (
                <div className="p-4 pt-0 text-sm text-gray-400 leading-relaxed border-t border-white/5 mt-2">
                    {answer}
                </div>
            )}
        </div>
    );
};

const SupportPage = () => {
    const faqs = [
        {
            question: "Hur kommer jag igång med AI-agenter?",
            answer: "Att komma igång är enkelt! Skapa ett konto, välj dina agenter från 'Marketplace' och konfigurera dem med våra enkla steg-för-steg guider. Du kan vara igång på under 10 minuter."
        },
        {
            question: "Vad kostar tjänsten?",
            answer: "Vi erbjuder flexibla paket för alla behov. 'Start' kostar 4 995 kr/månad och passar perfekt för soloprenörer och små team. 'Business' kostar 9 995 kr/månad och ger tillgång till avancerade funktioner och fler agenter."
        },
        {
            question: "Kan jag integrera med mina nuvarande system?",
            answer: "Ja! Våra agenter är byggda för att samarbeta. Vi har färdiga integrationer för Gmail, Google Calendar, LinkedIn och många fler CRM-system. Vi hjälper dig gärna med setup."
        },
        {
            question: "Erbjuder ni personlig support?",
            answer: "Absolut. Alla våra kunder har tillgång till vår AI-support dygnet runt. Pro-kunder har även tillgång till personlig rådgivning via video eller telefon."
        }
    ];

    return (
        <div className="w-full min-h-screen bg-[#0B0C15] relative pt-28 pb-12">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none"></div>

            <div className="max-w-5xl mx-auto px-6 py-12 relative z-10 font-sans">

                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-full mb-6">
                        <HelpCircle className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                        Hur kan vi <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">hjälpa dig?</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Har du hittat en bugg, undrar du över priser eller vill du bara säga hej? Vi är här för dig dygnet runt.
                    </p>
                </div>

                {/* Contact Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div className="bg-[#151B2B] p-8 rounded-2xl border border-white/5 hover:border-indigo-500/50 transition-colors group text-center">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Mail className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">Maila oss</h3>
                        <p className="text-gray-400 text-sm mb-4">För generella frågor och support.</p>
                        <a href="mailto:bujar@b2bmeeting.no" className="text-indigo-400 hover:text-indigo-300 font-medium">bujar@b2bmeeting.no</a>
                    </div>

                    <div className="bg-[#151B2B] p-8 rounded-2xl border border-white/5 hover:border-emerald-500/50 transition-colors group text-center">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Phone className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">Ring oss</h3>
                        <p className="text-gray-400 text-sm mb-4">Mån-Fre, 08:00 - 17:00</p>
                        <a href="tel:+4747738137" className="text-emerald-400 hover:text-emerald-300 font-medium">477 38 137</a>
                    </div>

                    <div className="bg-[#151B2B] p-8 rounded-2xl border border-white/5 hover:border-purple-500/50 transition-colors group text-center">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <MapPin className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">Besök oss</h3>
                        <p className="text-gray-400 text-sm mb-4">Kom förbi på en kaffe.</p>
                        <span className="text-purple-400 font-medium">Oslo, Norge</span>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">Vanliga frågor</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <FAQItem key={index} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>
                </div>

            </div>

            {/* AI Chat Widget */}
            <ChatWidget />
        </div>
    );
};

export default SupportPage;

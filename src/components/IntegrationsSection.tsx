import React from 'react';
import { Linkedin, Facebook, Mail, HardDrive, BarChart3, FileText, LayoutGrid, Calendar } from 'lucide-react';

const icons = [
    { Icon: Linkedin, color: "text-[#0077b5]", label: "LinkedIn" },
    { Icon: Facebook, color: "text-[#1877F2]", label: "Facebook" },
    { Icon: Mail, color: "text-[#EA4335]", label: "Gmail" },
    { Icon: HardDrive, color: "text-[#34A853]", label: "Drive" },
    { Icon: BarChart3, color: "text-[#F4B400]", label: "Analytics" },
    { Icon: FileText, color: "text-white", label: "Notion" },
    { Icon: LayoutGrid, color: "text-[#00A4EF]", label: "Microsoft" },
    { Icon: Calendar, color: "text-[#4285F4]", label: "Calendar" },
];

const IntegrationsSection: React.FC = () => {
    return (
        <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
            <div className="container mx-auto px-4 text-center">

                {/* Icons Row */}
                <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-12">
                    {icons.map(({ Icon, color, label }, index) => (
                        <div
                            key={index}
                            className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shadow-md hover:scale-110 hover:shadow-lg hover:border-purple-100 transition-all duration-300 group"
                            title={label}
                        >
                            <Icon className={`w-8 h-8 md:w-10 md:h-10 ${color === 'text-white' ? 'text-gray-900' : color}`} />
                        </div>
                    ))}
                </div>

                {/* Text Content */}
                <h2 className="text-4xl md:text-5xl font-bold mb-6 max-w-3xl mx-auto leading-tight text-gray-900">
                    Seamless connection for <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">effortless growth</span>
                </h2>

                <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
                    Connect Gmail, Notion and more — and run your entire business from one place.
                </p>

            </div>

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-100/40 blur-[100px] -z-10 rounded-full pointer-events-none" />
        </section>
    );
};

export default IntegrationsSection;

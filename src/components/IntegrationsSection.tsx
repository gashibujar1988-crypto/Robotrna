import React from 'react';

// Custom Brand Icons
const BrandIcon = ({ name, className }: { name: string, className?: string }) => {
    switch (name) {
        case 'Microsoft':
            return (
                <svg viewBox="0 0 23 23" className={className}>
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
            );
        case 'Slack':
            return (
                <svg viewBox="0 0 127 127" className={className}>
                    <path fill="#E01E5A" d="M28.05 85.55A14.02 14.02 0 1 1 14 71.5h14.05v14.05z" />
                    <path fill="#E01E5A" d="M35.65 85.55a14.05 14.05 0 1 1 28.1 0v35.1a14.05 14.05 0 1 1-28.1 0v-35.1z" />
                    <path fill="#36C5F0" d="M42.15 28.05A14.02 14.02 0 1 1 56.2 14v14.05H42.15z" />
                    <path fill="#36C5F0" d="M42.15 35.65a14.05 14.05 0 1 1 0 28.1h-35.1a14.05 14.05 0 1 1 0-28.1h35.1z" />
                    <path fill="#2EB67D" d="M98.95 42.15a14.02 14.02 0 1 1 14.05 14.05h-14.05V42.15z" />
                    <path fill="#2EB67D" d="M91.35 42.15a14.05 14.05 0 1 1-28.1 0v-35.1a14.05 14.05 0 1 1 28.1 0v35.1z" />
                    <path fill="#ECB22E" d="M84.85 98.95a14.02 14.02 0 1 1-14.05-14.05h14.05v14.05z" />
                    <path fill="#ECB22E" d="M84.85 91.35a14.05 14.05 0 1 1 0-28.1h35.1a14.05 14.05 0 1 1 0 28.1h-35.1z" />
                </svg>
            );
        case 'Fortnox':
            return (
                <svg viewBox="0 0 100 100" className={className}>
                    <rect width="100" height="100" rx="20" fill="#D62E28" />
                    <path fill="white" d="M30 70V30h10v25h15V30h10v40H55V45H40v25H30z" /> {/* Simplified building/F shape */}
                </svg>
            );
        case 'HubSpot':
            return (
                <svg viewBox="0 0 24 24" className={className} fill="#FF7A59">
                    <path d="M12 2a2 2 0 1 0-2 2 2 2 0 0 0 2-2zm-3 8a3 3 0 1 0-3 3 3 3 0 0 0 3-3zm6 3a4 4 0 1 0 4 4 4 4 0 0 0-4-4zm-3-5a2 2 0 1 0-2 2 2 2 0 0 0 2-2zm-1.5 6.43V6.26a3.79 3.79 0 0 1 3 0v5.17a5.94 5.94 0 0 1 0 7.85v.07a3.86 3.86 0 0 1-3 0v-4.5z" />
                </svg>
            );
        case 'LinkedIn':
            return (
                <svg viewBox="0 0 24 24" className={className} fill="#0077b5">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
            );
        case 'Facebook':
            return (
                <svg viewBox="0 0 24 24" className={className} fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            );
        case 'Instagram':
            return (
                <svg viewBox="0 0 24 24" className={className}>
                    <defs>
                        <linearGradient id="instaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#833AB4" />
                            <stop offset="50%" stopColor="#FD1D1D" />
                            <stop offset="100%" stopColor="#FCB045" />
                        </linearGradient>
                    </defs>
                    <path fill="url(#instaGrad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
            );
        case 'X':
            return (
                <svg viewBox="0 0 24 24" className={className} fill="black">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            );
        default:
            return null;
    }
};

const icons = [
    { name: "Microsoft", label: "Microsoft 365" },
    { name: "Slack", label: "Slack" },
    { name: "Fortnox", label: "Fortnox" },
    { name: "HubSpot", label: "HubSpot" },
    { name: "LinkedIn", label: "LinkedIn" },
    { name: "Facebook", label: "Facebook" },
    { name: "Instagram", label: "Instagram" },
    { name: "X", label: "X (Twitter)" },
];

const IntegrationsSection: React.FC = () => {
    return (
        <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-[#0F1623] dark:to-black relative overflow-hidden transition-colors duration-300">
            <div className="container mx-auto px-4 text-center">

                {/* Icons Row */}
                <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-12">
                    {icons.map(({ name, label }, index) => (
                        <div
                            key={index}
                            className="w-16 h-16 md:w-20 md:h-20 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-gray-700 shadow-md hover:scale-110 hover:shadow-lg hover:border-purple-100 dark:hover:border-purple-900 transition-all duration-300 group"
                            title={label}
                        >
                            <BrandIcon name={name} className="w-8 h-8 md:w-10 md:h-10" />
                        </div>
                    ))}
                </div>

                {/* Text Content */}
                <h2 className="text-4xl md:text-5xl font-bold mb-6 max-w-3xl mx-auto leading-tight text-gray-900 dark:text-white">
                    Seamless connection for <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">effortless growth</span>
                </h2>

                <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
                    Connect Gmail, Notion and more — and run your entire business from one place.
                </p>

            </div>

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-100/40 blur-[100px] -z-10 rounded-full pointer-events-none" />
        </section>
    );
};

export default IntegrationsSection;

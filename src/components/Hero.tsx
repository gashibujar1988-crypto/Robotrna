import React from 'react';
import { motion } from 'framer-motion';
import { Play, Star } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { agents } from '../data/agents';
import motherFull from '../assets/mother_full.jpg';

const Hero: React.FC = () => {
    const { signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to init Google Auth', error);
        }
    };

    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">

            {/* 1. Dynamic Background Mesh */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-200/40 rounded-full blur-[120px] mix-blend-multiply" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply" />
                <div className="absolute top-[20%] left-[20%] w-[30vw] h-[30vw] bg-pink-200/40 rounded-full blur-[100px] mix-blend-multiply animate-pulse-slow" />
                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 Mix-blend-overlay"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Left Column: Text Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex-1 text-center lg:text-left max-w-2xl"
                    >

                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-8 hover:shadow-md transition-shadow cursor-default"
                        >
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-sm font-semibold text-gray-600 tracking-wide uppercase">AI-Revolutionen är här</span>
                        </motion.div>

                        {/* Heading */}
                        <h1 className="text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-8">
                            Anställ din framtida <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 animate-gradient-x">
                                Arbetskraft
                            </span>
                        </h1>

                        {/* Subheading */}
                        <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
                            Få tillgång till ett komplett team av specialiserade AI-agenter. De sover aldrig, klagar aldrig och levererar resultat från dag ett.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <button
                                onClick={handleGoogleLogin}
                                className="px-8 py-4 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Logga in med Google
                                Logga in med Google
                            </button>

                            <Link
                                to="/how-it-works"
                                className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
                            >
                                <Play className="w-5 h-5 text-gray-400 group-hover:text-violet-400 transition-colors fill-current" />
                                Se hur det funkar
                            </Link>
                        </div>

                        {/* Social Proof / Stats */}
                        <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 border-t border-gray-100 pt-8">
                            <div>
                                <div className="flex items-center gap-1 mb-1">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />)}
                                </div>
                                <p className="text-sm text-gray-500 font-medium">Betygsatt 4.9/5 av företag</p>
                            </div>
                            <div className="h-8 w-px bg-gray-200 hidden sm:block" />
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-600">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500 font-medium">1000+ Anställda agenter</p>
                            </div>
                        </div>

                    </motion.div>

                    {/* Right Column: Visual Composition */}
                    <div className="flex-1 relative w-full h-[600px] hidden lg:block perspective-1000">
                        {/* Rotating Base Plate (Visual anchor) */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-gradient-to-t from-gray-50 to-white rounded-[100%] border border-white shadow-2xl skew-x-12 opacity-50" />

                        {/* Main Floating Agents - Radial Composition */}
                        <div className="relative w-full h-[900px] scale-90 lg:scale-100 origin-center flex items-center justify-center -translate-y-24">

                            {/* Concentric Orbit Rings (Background) */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                                <div className="w-[600px] h-[600px] rounded-full border border-purple-200/20 border-dashed animate-[spin_60s_linear_infinite]" />
                                <div className="absolute w-[450px] h-[450px] rounded-full border border-indigo-200/20 border-dashed animate-[spin_40s_linear_infinite_reverse]" />
                            </div>

                            {/* --- CENTER: MOTHER AI (CIRCULAR & INTEGRATED) --- */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="relative z-10 flex flex-col items-center justify-center"
                            >
                                <Link to="/mother-ai" className="group relative flex flex-col items-center">
                                    {/* Circular Image Container */}
                                    <div className="w-64 h-64 rounded-full border-[6px] border-white/20 shadow-[0_0_60px_rgba(139,92,246,0.4)] overflow-hidden bg-gray-900 transition-transform duration-500 group-hover:scale-105 group-hover:border-purple-400/50 group-hover:shadow-[0_0_90px_rgba(168,85,247,0.6)]">
                                        <img
                                            src={motherFull}
                                            alt="Mother AI"
                                            className="w-full h-full object-cover object-top"
                                        />
                                    </div>

                                    {/* Text Below Image */}
                                    <div className="absolute -bottom-16 flex flex-col items-center">
                                        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 tracking-[0.2em] uppercase drop-shadow-sm">
                                            MOTHER CORE
                                        </span>
                                        <span className="text-xs text-purple-200/60 font-medium tracking-wider mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            KLICKA FÖR ATT UTFORSKA
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>


                            {/* --- ORBITING AGENTS (Mathematically Perfect Circle) --- */}
                            {(() => {
                                // Define the specific order to maintain logical grouping (Tech Top, Sales Right, Social Bottom, Finance Left)
                                const orderedAgents = [
                                    agents[7], // Atlas - Tech
                                    agents[6], // Venture - Strategy
                                    agents[3], // Hunter - Sales
                                    agents[5], // Pixel - Creative
                                    agents[0], // Soshie - Social
                                    agents[2], // Dexter - Admin
                                    agents[8], // Ledger - Finance
                                    agents[1], // Brainy - Research
                                    agents[4]  // Nova - Support
                                ];

                                const radius = 280; // Distance from center in pixels (Reduced from 320)
                                const startAngle = -90; // Start at top

                                return orderedAgents.map((agent, index) => {
                                    const angle = startAngle + (index * (360 / orderedAgents.length));

                                    // Determine if agent is in the bottom half
                                    const isBottom = index >= 3 && index <= 6;

                                    return (
                                        <div
                                            key={agent.id}
                                            className="absolute top-1/2 left-1/2 w-24 h-24 -ml-12 -mt-12 z-20"
                                            style={{
                                                transform: `rotate(${angle}deg) translate(${radius}px) rotate(${-angle}deg)`
                                            }}
                                        >
                                            <motion.div
                                                animate={{ y: [-5, 5, -5] }}
                                                transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
                                            >
                                                <Link
                                                    to={`/agent/${agent.id}`}
                                                    className={`group flex items-center hover:scale-110 transition-transform duration-300 ${isBottom ? 'flex-col-reverse' : 'flex-col'}`}
                                                >
                                                    <div className="relative">
                                                        <img
                                                            src={agent.image}
                                                            alt={agent.name}
                                                            className="w-24 h-24 object-cover rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-white/50 bg-white hover:border-purple-400 transition-colors"
                                                        />
                                                        {/* Hover Glow */}
                                                        <div className="absolute inset-0 rounded-2xl bg-purple-400/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>

                                                    {/* Label - Position changes based on orbit location */}
                                                    <span className={`text-xs font-bold text-gray-700 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm whitespace-nowrap border border-white/50 group-hover:bg-purple-50 group-hover:text-purple-700 transition-colors ${isBottom ? 'mb-3' : 'mt-3'}`}>
                                                        {agent.role}
                                                    </span>
                                                </Link>
                                            </motion.div>
                                        </div>
                                    );
                                });
                            })()}

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Hero;

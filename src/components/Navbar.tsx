import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import LoginModal from './LoginModal';
import boraLogo from '../assets/bora_ai_logo_match.png';

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const [avatar, setAvatar] = useState<string | null>(localStorage.getItem('user_avatar'));

    useEffect(() => {
        const handleStorageChange = () => {
            setAvatar(localStorage.getItem('user_avatar'));
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Always use dark theme styles for the navbar to match the blue background
    const navClass = "w-full absolute top-0 z-50 bg-transparent transition-all duration-300 pointer-events-none";
    const textClass = "text-gray-300 hover:text-white";
    const buttonClass = "bg-gray-900 text-white hover:bg-black";

    return (
        <>
            <nav className={navClass}>
                <div className="container mx-auto px-4 pointer-events-auto">
                    <div className="flex justify-between items-center h-20">
                        <Link to="/" className="flex-shrink-0 flex items-center cursor-pointer group bg-transparent" onClick={() => window.scrollTo(0, 0)}>
                            <motion.img
                                src={boraLogo}
                                alt="Bora AI"
                                className="h-12 w-auto object-contain drop-shadow-[0_0_10px_rgba(6,182,212,0.3)] group-hover:drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-300"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                            />
                        </Link>

                        <div className="hidden md:flex items-center space-x-12">
                            <Link to="/" className={`${textClass} text-lg transition-colors`} onClick={() => window.scrollTo(0, 0)}>Hem</Link>
                            <Link to="/solutions" className={`${textClass} text-lg transition-colors`}>Lösningar</Link>
                            <Link to="/agents" className={`${textClass} text-lg transition-colors`}>AI-Medarbetare</Link>
                            <Link to="/pricing" className={`${textClass} text-lg transition-colors`}>Priser</Link>

                            <Link to="/support" className={`${textClass} text-lg transition-colors text-green-500 hover:text-green-400 font-medium`}>Support</Link>
                        </div>

                        <div className="hidden md:flex items-center space-x-6">
                            {isAuthenticated && user ? (
                                <div className="flex items-center gap-6">
                                    <Link to="/dashboard" className={`${textClass} text-lg transition-colors font-medium`}>Dashboard</Link>
                                    <div className="flex items-center gap-3 pl-2">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white overflow-hidden shadow-sm">
                                            {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-white text-lg">{user.name}</span>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="text-gray-400 hover:text-white transition-colors"
                                        title="Logga ut"
                                    >
                                        <LogOut className="w-6 h-6" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setShowLogin(true)}
                                        className="text-white font-medium hover:text-gray-300 bg-transparent border-none transition-colors text-lg"
                                    >
                                        Logga in
                                    </button>
                                    <button
                                        onClick={() => setShowLogin(true)}
                                        className={`${buttonClass} font-medium px-8 py-3 rounded-full transition-colors border-none text-lg`}
                                    >
                                        Kom igång
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="md:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="text-gray-300 hover:text-white bg-transparent border-none"
                            >
                                {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="md:hidden bg-[#0F1623] border-t border-white/10 shadow-lg"
                        >
                            <div className="px-4 pt-4 pb-8 space-y-4">
                                <Link to="/" className="block px-3 py-2 text-lg font-medium text-gray-300 hover:text-white inverted-hover" onClick={() => setIsOpen(false)}>Hem</Link>
                                <Link to="/solutions" className="block px-3 py-2 text-lg font-medium text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>Lösningar</Link>
                                <Link to="/agents" className="block px-3 py-2 text-lg font-medium text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>AI-Medarbetare</Link>
                                <Link to="/pricing" className="block px-3 py-2 text-lg font-medium text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>Priser</Link>
                                <Link to="/support" className="block px-3 py-2 text-lg font-medium text-green-500 hover:text-green-400" onClick={() => setIsOpen(false)}>Support</Link>

                                {isAuthenticated && user ? (
                                    <div className="border-t border-white/10 pt-6 mt-6">
                                        <div className="flex items-center px-3 mb-6 gap-4 bg-[#131B2B] p-3 rounded-xl border border-gray-800/50">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white overflow-hidden">
                                                {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-white text-lg">{user.name}</span>
                                        </div>
                                        <button onClick={logout} className="w-full text-left px-3 py-2 text-red-400 hover:text-red-300 flex items-center gap-3 text-lg">
                                            <LogOut className="w-5 h-5" /> Logga ut
                                        </button>
                                    </div>
                                ) : (
                                    <div className="pt-4 flex flex-col gap-4">
                                        <button onClick={() => { setShowLogin(true); setIsOpen(false); }} className="w-full text-center py-3 text-gray-300 text-lg">Logga in</button>
                                        <button onClick={() => { setShowLogin(true); setIsOpen(false); }} className="w-full bg-white text-black font-medium py-4 rounded-full text-lg">
                                            Kom igång
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
        </>
    );
};

export default Navbar;

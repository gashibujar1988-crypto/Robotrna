import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, Settings, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import LoginModal from './LoginModal';

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

    // Always use light theme styles now
    const navClass = "w-full fixed top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300";
    const textClass = "text-gray-600 hover:text-gray-900";
    const buttonClass = "bg-gray-900 text-white hover:bg-black";

    return (
        <>
            <nav className={navClass}>
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-20">
                        <Link to="/" className="flex-shrink-0 flex items-center cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
                            <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl mr-3 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">
                                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <BrainCircuit className="text-white w-6 h-6" />
                            </div>
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight group-hover:to-purple-600 transition-all duration-300">
                                Mother AI
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/" className={`${textClass} transition-colors`}>Hem</Link>
                            <Link to="/solutions" className={`${textClass} transition-colors`}>Lösningar</Link>
                            <Link to="/agents" className={`${textClass} transition-colors`}>AI-Medarbetare</Link>
                            <Link to="/pricing" className={`${textClass} transition-colors`}>Priser</Link>
                            <Link to="/developers" className={`${textClass} transition-colors`}>Developers</Link>

                            <Link to="/support" className={`${textClass} transition-colors text-green-600 font-medium`}>Support</Link>
                            <Link to="/mother" className={`${textClass} transition-colors`}>Mother</Link>
                        </div>

                        <div className="hidden md:flex items-center space-x-4">
                            {isAuthenticated && user ? (
                                <div className="flex items-center gap-4">
                                    <Link to="/settings" className="flex items-center gap-2 px-3 py-2 bg-gray-100/50 hover:bg-gray-100 text-gray-700 rounded-full transition-all border border-transparent hover:border-gray-200" title="Inställningar & Integrationer">
                                        <Settings className="w-4 h-4" />
                                        <span className="text-sm font-bold">Inställningar</span>
                                    </Link>
                                    <Link to="/dashboard" className={`${textClass} transition-colors font-medium`}>Dashboard</Link>
                                    <div className={`flex items-center gap-2 text-sm font-medium text-gray-900`}>
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center text-white overflow-hidden">
                                            {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span>{user.name}</span>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className={`p-2 rounded-full transition-colors text-gray-500 hover:text-gray-900 hover:bg-gray-100`}
                                        title="Logga ut"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setShowLogin(true)}
                                        className={`${textClass} bg-transparent border-none`}
                                    >
                                        Logga in
                                    </button>
                                    <button
                                        onClick={() => setShowLogin(true)}
                                        className={`${buttonClass} font-medium px-6 py-2 rounded-full transition-colors border-none`}
                                    >
                                        Kom igång
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="md:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="text-gray-600 hover:text-gray-900 bg-transparent border-none"
                            >
                                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
                            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-lg"
                        >
                            <div className="px-4 pt-2 pb-6 space-y-2">
                                <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900" onClick={() => setIsOpen(false)}>Hem</Link>
                                <a href="/#robots" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900" onClick={() => setIsOpen(false)}>AI-Medarbetare</a>
                                <Link to="/pricing" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900" onClick={() => setIsOpen(false)}>Priser</Link>

                                <Link to="/support" className="block px-3 py-2 text-base font-medium text-green-600 hover:text-green-700" onClick={() => setIsOpen(false)}>Support</Link>
                                <Link to="/mother" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900" onClick={() => setIsOpen(false)}>Mother</Link>

                                {isAuthenticated && user ? (
                                    <div className="border-t border-gray-100 pt-4 mt-4">
                                        <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-purple-600 bg-purple-50 rounded-xl mb-2">Dashboard</Link>
                                        <Link to="/settings" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-xl mb-4 flex items-center gap-2">
                                            <Settings className="w-4 h-4" /> Inställningar
                                        </Link>
                                        <div className="flex items-center px-3 mb-4 gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center text-white overflow-hidden">
                                                {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-white">{user.name}</span>
                                        </div>
                                        <button onClick={logout} className="w-full text-left px-3 py-2 text-red-400 hover:text-red-300 flex items-center gap-2">
                                            <LogOut className="w-4 h-4" /> Logga ut
                                        </button>
                                    </div>
                                ) : (
                                    <div className="pt-4 flex flex-col gap-3">
                                        <button onClick={() => { setShowLogin(true); setIsOpen(false); }} className="w-full text-center py-2 text-gray-300">Logga in</button>
                                        <button onClick={() => { setShowLogin(true); setIsOpen(false); }} className="w-full bg-white text-black font-medium py-3 rounded-full">
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

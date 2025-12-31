import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase'; // Build-in auth from firebase
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signInWithGoogle } = useAuth(); // We just rely on onAuthStateChanged in the context
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                // Context handles state update
                onClose();
                navigate('/dashboard');
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
                // Context handles state update
                onClose();
                navigate('/dashboard');
            }
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/wrong-password') {
                setError('Fel lösenord.');
            } else if (err.code === 'auth/user-not-found') {
                setError('Användaren hittades inte.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Emailadressen används redan.');
            } else {
                setError('Ett fel uppstod vid inloggning: ' + err.code);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleClick = async () => {
        setError('');
        try {
            await signInWithGoogle();
            onClose();
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Google Auth Error:', err);
            if (err.code === 'auth/operation-not-allowed') {
                setError('Google-inloggning är inte aktiverad i konsolen.');
            } else if (err.code === 'auth/popup-closed-by-user') {
                setError('Inloggningen avbröts.');
            } else {
                setError('Google-inloggning misslyckades. Försök igen.');
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
                        animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                        exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
                        className="fixed left-1/2 top-1/2 w-[90%] max-w-[480px] bg-[#0F0F0F] border border-white/5 rounded-3xl p-0 z-50 shadow-2xl overflow-hidden"
                    >
                        {/* Header Area */}
                        <div className="relative p-8 pb-0">
                            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                                {isLogin ? 'Välkommen' : 'Bli medlem'}
                            </h2>
                            <p className="text-gray-400 text-sm max-w-[200px]">
                                {isLogin ? 'Logga in till ditt HQ' : 'Starta din AI-resa idag'}
                            </p>

                            <div className="absolute top-6 right-6 flex items-center gap-3">
                                <button
                                    onClick={onClose}
                                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 pt-6">
                            {/* Google Sign In - Prominent Button */}
                            <button
                                onClick={handleGoogleClick}
                                className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3.5 rounded-2xl hover:bg-gray-100 transition-all transform hover:scale-[1.01] active:scale-[0.99] mb-6 shadow-lg shadow-white/5"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span>Fortsätt med Google</span>
                            </button>

                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-3 bg-[#0F0F0F] text-gray-500 font-medium">Eller med e-post</span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {!isLogin && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Namn</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-[#1A1A1A] border border-white/5 focus:border-white/20 rounded-2xl px-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-medium"
                                                placeholder="Vad heter du?"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-[#1A1A1A] border border-white/5 focus:border-white/20 rounded-2xl px-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-medium"
                                            placeholder="namn@exempel.se"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Lösenord</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-[#1A1A1A] border border-white/5 focus:border-white/20 rounded-2xl px-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-medium"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-red-400 text-sm text-center bg-red-500/10 py-2.5 rounded-xl border border-red-500/10"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 text-lg tracking-tight hover:scale-[1.01] active:scale-[0.99]"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                                            Bearbetar...
                                        </span>
                                    ) : (isLogin ? 'Logga in' : 'Skapa konto')}
                                </button>
                            </form>

                            <div className="mt-8 text-center">
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-gray-500 hover:text-white text-sm transition-colors"
                                >
                                    {isLogin ? (
                                        <>Ny här? <span className="text-white font-semibold underline decoration-white/30 hover:decoration-white underline-offset-4">Skapa ett konto</span></>
                                    ) : (
                                        <>Redan medlem? <span className="text-white font-semibold underline decoration-white/30 hover:decoration-white underline-offset-4">Logga in</span></>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default LoginModal;

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Image as ImageIcon, Database, Loader, CheckCircle, Heart } from 'lucide-react';
import motherImage from '../assets/mother_gen.png';
import { useAuth } from '../context/AuthContext';
import { brain } from '../api/client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const BrainPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);
        setError('');
        setUploadSuccess(false);

        try {
            await brain.upload(file);
            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 3000); // Hide success after 3s
        } catch (err) {
            console.error(err);
            setError('Kunde inte ladda upp filen. Försök igen.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            setUploading(true);
            setError('');

            brain.upload(file).then(() => {
                setUploadSuccess(true);
                setTimeout(() => setUploadSuccess(false), 3000);
            }).catch(() => {
                setError('Kunde inte ladda upp filen.');
            }).finally(() => {
                setUploading(false);
            });
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <section id="mother" className="pt-32 pb-24 relative overflow-hidden bg-white min-h-[calc(100vh-80px)]">
                {/* Ambient Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-100 via-white to-white opacity-80"></div>

                <div className="container mx-auto px-4 relative z-10 flex flex-col justify-center h-full">
                    <div className="flex flex-col lg:flex-row items-center gap-16">

                        {/* Left Side: Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="flex-1"
                        >
                            <div className="inline-flex items-center gap-2 text-pink-600 mb-6 font-mono text-sm uppercase tracking-[0.2em] border border-pink-200 px-3 py-1 rounded-full bg-pink-50">
                                <Heart className="w-3 h-3" />
                                <span>Livet till alla agenter</span>
                            </div>

                            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-900">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-pink-800 to-purple-600">
                                    Utbilda Mother
                                </span>
                            </h2>

                            <p className="text-gray-600 text-lg mb-8 leading-relaxed max-w-xl">
                                Mother är kärnan som ger liv åt alla dina AI-medarbetare. Genom att utbilda henne med information, riktlinjer och kunskap, växer och utvecklas hela ditt digitala team i harmoni.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { title: 'Företagsfakta', desc: 'Ge Mother kontext', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                                    { title: 'Varumärkeskänsla', desc: 'Låt henne se din vision', icon: ImageIcon, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100' },
                                    { title: 'Kunskapsbas', desc: 'Siffror och data', icon: Database, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' }
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`flex items-center gap-4 p-4 rounded-xl bg-white border ${item.border} hover:shadow-lg hover:border-pink-200 transition-all group cursor-default shadow-sm`}
                                    >
                                        <div className={`p-3 rounded-lg ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                                            <p className="text-xs text-gray-500">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right Side: Mother Visualization */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1 }}
                            className="flex-1 relative w-full flex justify-center perspective-1000"
                        >
                            {/* The Core Container */}
                            <div className="relative w-full max-w-lg aspect-square group">

                                {/* Animated Glow Rings - Warm/Life colors */}
                                <div className="absolute inset-0 bg-pink-200/50 blur-[120px] rounded-full animate-pulse-slow"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-pink-200 rounded-full animate-[spin_20s_linear_infinite]"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-dashed border-pink-300/30 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>

                                {/* The Mother Image - Masked to be rounder */}
                                <div className="relative z-10 w-full h-full rounded-full overflow-hidden border-4 border-pink-200/20 shadow-2xl">
                                    <motion.img
                                        src={motherImage}
                                        alt="Mother AI Core"
                                        className="w-full h-full object-cover"
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
                                    />
                                </div>

                                {/* Status Feedback Overlay (Visible only during action) */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 z-20 pointer-events-none">
                                    <div
                                        className={`
                                            w-full h-full rounded-full flex flex-col items-center justify-center text-center
                                            transition-all duration-300
                                            ${(uploading || uploadSuccess || error) ? 'bg-white/95 backdrop-blur-xl shadow-2xl scale-100 opacity-100 border border-purple-100' : 'bg-transparent scale-95 opacity-0'}
                                        `}
                                    >
                                        {/* Status states remain here for feedback */}
                                        {error && (
                                            <div className="flex flex-col items-center animate-in fade-in zoom-in px-4">
                                                <span className="text-red-600 font-bold mb-1">Fel vid uppladdning</span>
                                                <span className="text-red-500 text-xs">{error}</span>
                                            </div>
                                        )}

                                        {uploading && (
                                            <div className="flex flex-col items-center animate-in fade-in zoom-in">
                                                <Loader className="w-12 h-12 text-purple-600 animate-spin mb-2" />
                                                <span className="text-purple-700 font-mono text-sm animate-pulse">Analyserar data...</span>
                                            </div>
                                        )}

                                        {uploadSuccess && (
                                            <div className="flex flex-col items-center animate-in fade-in zoom-in">
                                                <CheckCircle className="w-16 h-16 text-green-500 mb-2 drop-shadow-md" />
                                                <span className="text-gray-900 font-bold">Data Absorberad!</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                {/* Connection Lines (Cosmetic) */}
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="absolute w-32 h-[1px] bg-gradient-to-r from-purple-400/50 to-transparent top-1/2 left-1/2 origin-left" style={{ transform: `rotate(${i * 120}deg) translateX(150px)` }}>
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-sm"></div>
                                    </div>
                                ))}

                            </div>

                            {/* New Dedicated Upload Button - Stabilized */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold shadow-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all z-30 whitespace-nowrap"
                            >
                                <Upload className="w-5 h-5" />
                                <span>Ladda upp filer</span>
                            </motion.button>
                        </motion.div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default BrainPage;

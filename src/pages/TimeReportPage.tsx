import React, { useState, useEffect } from 'react';
import { logSystemEvent } from '../utils/logger';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Car, MapPin, Camera, Save, RefreshCw, Calendar, History, FileText, Check } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAvailableModel } from "../api/client";

// Initialize Gemini for OCR (using the key from env if available)
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

interface TimeLog {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    breakMinutes: number;
    regNo: string;
    startOdometer: number;
    endOdometer: number;
    startLocation: { lat: number; lng: number } | null;
    endLocation: { lat: number; lng: number } | null;
    odometerImage: string | null;
}

const TimeReportPage = () => {
    const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
    const [logs, setLogs] = useState<TimeLog[]>(() => {
        const saved = localStorage.getItem('timeLogs');
        return saved ? JSON.parse(saved) : [];
    });

    // Form State
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [breakMinutes, setBreakMinutes] = useState(30);

    // Car State
    const [regNo, setRegNo] = useState('');
    const [startOdometer, setStartOdometer] = useState<number | ''>('');
    const [endOdometer, setEndOdometer] = useState<number | ''>('');

    // GPS State
    const [startLocation, setStartLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [endLocation, setEndLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [loadingLocation, setLoadingLocation] = useState<'start' | 'end' | null>(null);

    // Image & OCR State
    const [odometerImage, setOdometerImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        localStorage.setItem('timeLogs', JSON.stringify(logs));
    }, [logs]);

    const getLocation = (type: 'start' | 'end') => {
        if (!navigator.geolocation) {
            alert("Din webbläsare stödjer inte geotaggning.");
            return;
        }
        setLoadingLocation(type);
        navigator.geolocation.getCurrentPosition((pos) => {
            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            if (type === 'start') setStartLocation(coords);
            else setEndLocation(coords);
            setLoadingLocation(null);
        }, (err) => {
            console.error(err);
            alert("Kunde inte hämta plats. Kontrollera behörigheter.");
            setLoadingLocation(null);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            setOdometerImage(base64);

            // Perform OCR/Analysis if API Key exists
            if (genAI) {
                setIsAnalyzing(true);
                try {
                    // Use dynamic high-performance model (defaults to 1.5 Pro)
                    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
                    const modelName = await getAvailableModel(apiKey);
                    const model = genAI.getGenerativeModel({ model: modelName });

                    // Convert base64 to standard format for Gemini
                    const base64Data = base64.split(',')[1];

                    const prompt = "Analyze this image of a vehicle dashboard/odometer. Extract the numeric odometer reading (mätarställning). Return ONLY the number.";

                    const imagePart = {
                        inlineData: {
                            data: base64Data,
                            mimeType: file.type,
                        },
                    };

                    const result = await model.generateContent([prompt, imagePart]);
                    const response = await result.response;
                    const text = response.text();
                    const number = parseInt(text.replace(/[^0-9]/g, ''));

                    if (!isNaN(number)) {
                        // Smart logic: if start odometer is empty, fill it. Else fill end odometer.
                        if (startOdometer === '') setStartOdometer(number);
                        else setEndOdometer(number);
                        alert(`OCR Lyckades! Hittade mätarställning: ${number}`);
                    }
                } catch (error) {
                    console.error("OCR Error:", error);
                    alert("Kunde inte läsa av mätarställningen automatiskt.");
                } finally {
                    setIsAnalyzing(false);
                }
            }
        };
        reader.readAsDataURL(file);
    };

    const calculateTotalHours = () => {
        if (!startTime || !endTime) return 0;
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        let diffMs = end.getTime() - start.getTime();
        if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; // Handle over midnight
        const diffMinutes = Math.floor(diffMs / 60000) - breakMinutes;
        return (diffMinutes / 60).toFixed(2);
    };

    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = () => {
        const newLog: TimeLog = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            startTime,
            endTime,
            breakMinutes,
            regNo,
            startOdometer: Number(startOdometer) || 0,
            endOdometer: Number(endOdometer) || 0,
            startLocation,
            endLocation,
            odometerImage: odometerImage || null // Fix type safety
        };
        const updatedLogs = [newLog, ...logs];
        setLogs(updatedLogs);
        localStorage.setItem('timeLogs', JSON.stringify(updatedLogs)); // Force save immediately

        logSystemEvent(`Tidrapport inlämnad: ${startLocation} -> ${endLocation}`, 'System');

        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            setActiveTab('history');
            // Reset form partially
            setStartTime('');
            setEndTime('');
        }, 1500);
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Navbar />

            <div className="container mx-auto px-4 py-24 md:py-32 max-w-2xl">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

                    {/* Header Tabs */}
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('new')}
                            className={`flex-1 py-4 text-center results font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'new' ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <Calendar className="w-5 h-5" />
                            Ny Rapport
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 py-4 text-center font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <History className="w-5 h-5" />
                            Historik
                        </button>
                    </div>

                    <div className="p-6 md:p-8">
                        {activeTab === 'new' ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

                                {/* 1. Tidrapportering */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                                        <Clock className="w-5 h-5 text-purple-500" /> Tidrapportering
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Starttid</label>
                                            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Sluttid</label>
                                            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Rast (minuter)</label>
                                        <input type="number" value={breakMinutes} onChange={e => setBreakMinutes(Number(e.target.value))} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                    </div>
                                    <div className="text-right text-sm font-medium text-purple-600">
                                        Totalt: {calculateTotalHours()} timmar
                                    </div>
                                </div>

                                <div className="border-t border-gray-100" />

                                {/* 2. Körjournal & OCR */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                                        <Car className="w-5 h-5 text-blue-500" /> Körjournal
                                    </h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Registreringsnummer</label>
                                        <input type="text" placeholder="ABC 123" value={regNo} onChange={e => setRegNo(e.target.value.toUpperCase())} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                    </div>

                                    {/* OCR Camera Input */}
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg">
                                                {isAnalyzing ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-blue-900">Fota mätarställning</p>
                                                <p className="text-xs text-blue-700">AI läser av siffrorna automatiskt</p>
                                            </div>
                                            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                                        </label>

                                        {odometerImage && (
                                            <div className="mt-3 relative w-full h-32 rounded-lg overflow-hidden bg-black">
                                                <img src={odometerImage} alt="Odometer" className="object-cover w-full h-full opacity-80" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Start (km)</label>
                                            <input type="number" value={startOdometer} onChange={e => setStartOdometer(Number(e.target.value))} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Slut (km)</label>
                                            <input type="number" value={endOdometer} onChange={e => setEndOdometer(Number(e.target.value))} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100" />

                                {/* 3. Geotaggning */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                                        <MapPin className="w-5 h-5 text-red-500" /> Geotaggning
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => getLocation('start')}
                                            disabled={!!startLocation}
                                            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${startLocation ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200 hover:border-purple-300'}`}
                                        >
                                            {loadingLocation === 'start' ? <RefreshCw className="animate-spin w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                                            <span className="text-sm font-medium">{startLocation ? "Start Loggad" : "Starta Resa"}</span>
                                        </button>
                                        <button
                                            onClick={() => getLocation('end')}
                                            disabled={!!endLocation}
                                            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${endLocation ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200 hover:border-purple-300'}`}
                                        >
                                            {loadingLocation === 'end' ? <RefreshCw className="animate-spin w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                                            <span className="text-sm font-medium">{endLocation ? "Slut Loggad" : "Avsluta Resa"}</span>
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-400 text-center">
                                        GPS-koordinater sparas för verifiering.
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                >
                                    <Save className="w-5 h-5" /> Spara Rapport
                                </button>

                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                {/* Historik View */}
                                {logs.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p>Inga rapporter än.</p>
                                    </div>
                                ) : (
                                    logs.map((log) => (
                                        <div key={log.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-bold text-gray-800">{log.date}</h4>
                                                    <p className="text-sm text-gray-500">{log.regNo || "Inget regnr"}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                                                        {(log.endOdometer - log.startOdometer)} km
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    {log.startTime} - {log.endTime}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Car className="w-4 h-4 text-gray-400" />
                                                    {log.startOdometer} ➝ {log.endOdometer}
                                                </div>
                                            </div>

                                            {(log.startLocation || log.endLocation) && (
                                                <div className="mt-3 pt-3 border-t border-gray-50 flex gap-4 text-xs text-gray-400">
                                                    {log.startLocation && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Start OK</span>}
                                                    {log.endLocation && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Slut OK</span>}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[2rem] p-10 flex flex-col items-center shadow-2xl max-w-sm w-full text-center"
                        >
                            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-500 shadow-sm border border-green-100">
                                <Check className="w-12 h-12" strokeWidth={3} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Rapport Sparad!</h3>
                            <p className="text-gray-500 font-medium">Din resa har registrerats och syns nu i din dashboard.</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default TimeReportPage;

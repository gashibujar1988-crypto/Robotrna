import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const GoogleCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            handleCallback(code);
        } else {
            setError('Ingen kod mottogs från Google.');
            setTimeout(() => navigate('/'), 3000);
        }
    }, [searchParams]);

    const handleCallback = async (code: string) => {
        try {
            // We use the same client.ts instance which might have auth headers,
            // but this endpoint handles both linked and unlinked scenarios.
            const res = await api.post('/auth/google/callback', { code });

            // Log in the user (updates context and localstorage)
            login(res.data.token, res.data.user);

            // Redirect to dashboard
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Google Auth Failed', err);
            setError(err.response?.data?.error || 'Inloggning misslyckades.');
            // Go home on error
            setTimeout(() => navigate('/'), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            {error ? (
                <div className="text-center">
                    <p className="text-red-500 mb-2 font-medium">⚠️ {error}</p>
                    <p className="text-gray-500 text-sm">Omdirigerar...</p>
                </div>
            ) : (
                <div className="flex flex-col items-center animate-pulse">
                    <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mb-4"></div>
                    <p className="text-gray-300">Ansluter till Google...</p>
                </div>
            )}
        </div>
    );
};

export default GoogleCallback;

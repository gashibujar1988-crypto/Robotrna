
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const synthesizeSpeech = async (text: string, agentType: string): Promise<HTMLAudioElement | null> => {
    if (!OPENAI_API_KEY) {
        console.warn("TTS: No OpenAI API Key available (VITE_OPENAI_API_KEY)");
        return null; // Will fallback to browser TTS in the UI component
    }

    // Map Agent Type to OpenAI Premium Neural Voices
    // These voices are state-of-the-art and sound extremely human (Zephyr/Live quality).

    let voiceName = 'alloy'; // Default

    // Character mapping
    switch (agentType) {
        case 'social': // Soshie - Energetic
            voiceName = 'nova';
            break;
        case 'research': // Brainy - Analytical
            voiceName = 'echo';
            break;
        case 'leads': // Hunter - Assertive
            voiceName = 'onyx';
            break;
        case 'support': // Nova - Friendly
            voiceName = 'shimmer';
            break;
        case 'web_dev': // Atlas - Tech
            voiceName = 'fable';
            break;
        case 'creative': // Pixel - Artistic
            voiceName = 'alloy';
            break;
        case 'strategy': // Venture - Professional
            voiceName = 'onyx';
            break;
        default:
            voiceName = 'alloy';
    }

    const url = `https://api.openai.com/v1/audio/speech`;

    const payload = {
        model: "tts-1", // "tts-1" is low latency (optimized for real-time), "tts-1-hd" is higher quality but slower.
        input: text,
        voice: voiceName,
        response_format: "mp3",
        speed: 1.0
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("OpenAI TTS Error:", err);
            return null;
        }

        // OpenAI returns a binary stream (Blob), not Base64
        const blob = await response.blob();
        const audioSrc = URL.createObjectURL(blob);
        const audio = new Audio(audioSrc);
        return audio;

    } catch (e) {
        console.error("OpenAI TTS Network Error:", e);
    }
    return null;
};

import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    const key = process.env.GEMINI_API_KEY || '';
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const res = await fetch(url);
        const data: any = await res.json();
        if (data.models) {
            console.log("AVAILABLE MODELS:");
            data.models.forEach((m: any) => console.log(m.name));
        } else {
            console.log("No models field in response:", data);
        }
    } catch (e: any) {
        console.log("Error:", e.message);
    }
}

listModels();

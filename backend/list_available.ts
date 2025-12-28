
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

// Attempt raw fetch to list models
async function listRaw() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Listing models via raw fetch...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.log("Error:", data.error);
        } else if (data.models) {
            console.log("Available Models:");
            data.models.forEach((m: any) => console.log(` - ${m.name}`));
        } else {
            console.log("No models found or unknown format", data);
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

listRaw();

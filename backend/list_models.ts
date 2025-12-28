
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log("NO_KEY");
        return;
    }

    // Note: The SDK might not expose listModels easily on the instance, 
    // but we can try a direct fetch if needed, or just rely on the fact that 404 means "Enabled but wrong model".
    // Let's try to find a working model by brute forcing a few known ones.

    const models = ["gemini-pro", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"];

    console.log("Testing models...");
    const genAI = new GoogleGenerativeAI(apiKey);

    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            await model.generateContent("Hi");
            console.log(`SUCCESS: ${m}`);
            return;
        } catch (e: any) {
            console.log(`FAILED: ${m} - ${e.message.split(':')[0]}`);
        }
    }
}

listModels();

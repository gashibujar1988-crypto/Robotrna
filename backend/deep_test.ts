
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function deepTest() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    // List of candidates to try
    const candidates = [
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-pro",
        "gemini-pro"

    ];

    console.log("Starting Deep Test...");

    for (const modelName of candidates) {
        process.stdout.write(`Testing ${modelName}... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log("SUCCESS! ✅");
            console.log("Response:", result.response.text());
            return; // Found one!
        } catch (e: any) {
            console.log("FAILED ❌");
            const err = e.toString();
            if (err.includes('403') || err.includes('SERVICE_DISABLED')) {
                console.log("CRITICAL: API DISABLED (403)");
            } else if (err.includes('404')) {
                console.log("Model not found (404)");
            } else {
                console.log("Error:", e.message);
            }
        }
    }
    console.log("All models failed.");
}

deepTest();

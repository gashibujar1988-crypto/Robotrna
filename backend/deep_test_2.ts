
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function deepTest() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    // Broader list
    const candidates = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b",
        "gemini-1.5-pro",
        "gemini-1.0-pro",
        "gemini-pro",
        "gemini-2.0-flash-exp"
    ];

    console.log("Starting Deep Test 2...");

    for (const modelName of candidates) {
        process.stdout.write(`Testing ${modelName}... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log("SUCCESS! ✅");
            return;
        } catch (e: any) {
            console.log("FAILED ❌");
            const err = e.toString();
            if (err.includes('403') || err.includes('SERVICE_DISABLED')) {
                console.log("  -> SERVICE DISABLED");
            } else if (err.includes('404')) {
                console.log("  -> Not Found (404)");
            } else if (err.includes('429')) {
                console.log("  -> Quota/Rate Limit (429)");
            } else {
                console.log("  -> " + e.message.split(':')[0]);
            }
        }
    }
}

deepTest();

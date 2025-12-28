
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function targetedTest() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    const targets = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-2.0-flash-exp"
    ];

    console.log("Starting Targeted Test...");

    for (const modelName of targets) {
        process.stdout.write(`Testing ${modelName}... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log("SUCCESS! ✅");
            console.log("Response:", result.response.text());
            return;
        } catch (e: any) {
            console.log("FAILED ❌");
            const err = e.toString();
            console.log("Error details:", err);
        }
    }
}

targetedTest();

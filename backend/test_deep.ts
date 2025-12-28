import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    const key = process.env.GEMINI_API_KEY || '';
    console.log("Checking with key:", key);

    // Test a broader range of models
    const models = [
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b',
        'gemini-1.5-pro',
        'gemini-1.0-pro',
        'gemini-pro'
    ];

    for (const m of models) {
        try {
            console.log(`Testing ${m}...`);
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Hi");
            console.log(`SUCCESS: ${m}`);
            return;
        } catch (e: any) {
            console.log(`FAILED ${m}: ${e.message}`);
        }
    }
}

test();

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    const key = process.env.GEMINI_API_KEY || '';
    const genAI = new GoogleGenerativeAI(key);

    try {
        console.log("Testing with apiVersion: v1...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
        const result = await model.generateContent("Hi");
        console.log("SUCCESS with v1");
    } catch (e: any) {
        console.log("FAILED v1:", e.message);
    }
}

test();

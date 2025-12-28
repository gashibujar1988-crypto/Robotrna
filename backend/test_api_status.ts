
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function testApi() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log("NO_KEY");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const result = await model.generateContent("Test");
        const response = await result.response;
        console.log("ENABLED");
    } catch (error: any) {
        const errString = error.toString() + (error.message || '');
        if (errString.includes('SERVICE_DISABLED') || errString.includes('403') || errString.includes('Generative Language API has not been used')) {
            console.log("DISABLED");
            console.log("DETAILS:", errString);
        } else {
            console.log("ENABLED_BUT_ERROR");
            console.log("DETAILS:", errString);
        }
    }
}

testApi();

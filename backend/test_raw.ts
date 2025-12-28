import dotenv from 'dotenv';
dotenv.config();

async function testRaw() {
    const key = process.env.GEMINI_API_KEY || '';
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        console.log("Fetching models list...");
        const res = await fetch(url);
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Data:", JSON.stringify(data, null, 2));
    } catch (e: any) {
        console.log("Error:", e.message);
    }
}

testRaw();

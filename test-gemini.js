import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAts3RJInUBgazj8Sy0BRmcvtpNC5OEwYo");

async function test() {
    const models = [
        'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-flash-latest',
        'gemini-2.0-flash-exp',
    ];

    console.log("Starting model test round 2...");

    for (const m of models) {
        console.log(`\nTesting model: ${m}...`);
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Quick hello.");
            const response = await result.response;
            console.log(`✅ SUCCESS! Model '${m}' worked.`);
            console.log(`Response: ${response.text()}`);
            process.exit(0);
        } catch (e) {
            console.log(`❌ FAILED model '${m}':`);
            console.log(e.message?.substring(0, 200) + "...");
        }
    }
    console.log("\nAll models failed.");
}

test();

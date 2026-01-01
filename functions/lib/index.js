"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onComplexTaskRequest = exports.onAgentTaskActivated = exports.getMotherInsights = exports.onHunterConfirmation = void 0;
const dotenv = require("dotenv");
dotenv.config();
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios_1 = require("axios");
const openai_1 = require("openai");
admin.initializeApp();
exports.onHunterConfirmation = functions.firestore
    .document("chats/{chatId}/messages/{messageId}")
    .onCreate(async (snapshot, context) => {
    var _a, _b;
    const newMessage = snapshot.data();
    if (!newMessage)
        return;
    const userId = newMessage.userId;
    // 1. Identifiera bekräftelse (t.ex. "Ja", "Kör", "Stemmer")
    const confirmationWords = ["ja", "kör", "stemmer", "yes", "gör det"];
    if (!newMessage.text || !confirmationWords.includes(newMessage.text.toLowerCase().trim()))
        return;
    // 2. Mother Hive öppnar Minnesbanken för att se vad Hunter frågade om sist
    const userRef = admin.firestore().collection("users").doc(userId);
    const userDoc = await userRef.get();
    const lastTask = (_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.lastAgentQuestion; // T.ex. "Söka leads i Oslo?"
    if (lastTask) {
        functions.logger.info(`Mother Hive: Aktiverar Hunter för uppdrag: ${lastTask}`);
        // 3. Tvinga Hunter till HANDLING (Action)
        // Här simulerar vi en sökning. I nästa steg kopplar vi Google Places API.
        const leadResults = [
            { name: "Oslo Marketing AS", web: "oslomarketing.no" },
            { name: "Digital Vekst", web: "digitalvekst.no" }
        ];
        // 4. Spara resultatet i Total Minnesbank så det aldrig glöms bort
        await userRef.update({
            totalMinnesbank: admin.firestore.FieldValue.arrayUnion(...leadResults),
            hunterStatus: "SUCCESS"
        });
        // 5. Skicka Push-notis till telefonen (Steg 2)
        // Denna rad gör att det plingar i telefonen även om hemsidan är stängd
        const fcmToken = (_b = userDoc.data()) === null || _b === void 0 ? void 0 : _b.fcmToken;
        if (fcmToken) {
            await admin.messaging().send({
                token: fcmToken,
                notification: {
                    title: "Hunter har levererat!",
                    body: `Hittade ${leadResults.length} leads i Oslo medan du var borta.`
                }
            });
        }
    }
});
async function getProactiveInsights(userId, currentTask) {
    const db = admin.firestore();
    // 1. Hämta ALLA tidigare lyckade uppdrag för denna användare
    // Notera: Skapa 'memory_bank' collection i Firestore om den inte finns
    const pastSuccesses = await db.collection("users").doc(userId)
        .collection("memory_bank")
        .where("status", "==", "SUCCESS")
        .limit(5)
        .get();
    let contextString = "Här är tidigare insikter från Minnesbanken: ";
    if (pastSuccesses.empty) {
        contextString += "Inga tidigare uppdrag hittades.";
    }
    else {
        pastSuccesses.forEach(doc => {
            contextString += (doc.data().insight || "") + " ";
        });
    }
    // 2. Mother Hive analyserar om gammal info kan hjälpa den nya uppgiften
    return `MOTHER_HIVE_INSTRUCTION: Baserat på minnesbanken vet vi att användaren gillar ${contextString}. 
            Använd denna info för att lösa uppgiften: ${currentTask}`;
}
exports.getMotherInsights = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const { task } = data;
    const userId = context.auth.uid;
    const insights = await getProactiveInsights(userId, task || "Generell assistans");
    return { insights };
});
// --- Helper Functions (Placeholders for real logic) ---
async function getGlobalMemory(userId) {
    const insights = await getProactiveInsights(userId, "Context Fetch");
    return { context: insights };
}
async function saveToTotalMinnesbank(userId, agentName, result) {
    await admin.firestore().collection("users").doc(userId).collection("memory_bank").add({
        agentName,
        result,
        status: "SUCCESS",
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
}
async function sendPushToUser(userId, message) {
    var _a;
    const userDoc = await admin.firestore().collection("users").doc(userId).get();
    const fcmToken = (_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.fcmToken;
    if (fcmToken) {
        await admin.messaging().send({
            token: fcmToken,
            notification: {
                title: "Mother Hive Update",
                body: message
            }
        });
    }
}
// Implementering av Hunter (Lead Generation) med Google Places API
async function runHunterLeadGen(params, memory) {
    const query = params.query || "Marketing agencies in Oslo";
    const apiKey = "AIzaSyBxLqpOcRT9kF3gjM6NezGOgjlvxHZOe8k"; // Använder nyckeln från frontend för demo
    try {
        // Sök efter platser (Text Search)
        const response = await axios_1.default.get(`https://maps.googleapis.com/maps/api/place/textsearch/json`, {
            params: {
                query: query,
                key: apiKey
            }
        });
        if (response.data.status !== "OK") {
            console.error("Google Places Error:", response.data);
            return { error: "Google Places API failed", details: response.data.status };
        }
        // Formatera resultaten
        const leads = response.data.results.slice(0, 5).map((place) => ({
            name: place.name,
            address: place.formatted_address,
            rating: place.rating,
            placeId: place.place_id,
            types: place.types
        }));
        return {
            status: "SUCCESS",
            leads: leads,
            source: "Google Places API",
            count: leads.length
        };
    }
    catch (error) {
        console.error("Hunter Error:", error.message);
        return { status: "ERROR", error: error.message };
    }
}
// VIKTIGT: Byt ut denna mot din riktiga OpenAI API-nyckel!
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new openai_1.default({ apiKey: OPENAI_API_KEY });
// --- AGENT IMPLEMENTATIONS ---
// 2. Soshie (Social Media Manager)
async function runSoshieSocialCampaign(params, memory) {
    const topic = params.topic || "AI in Business";
    const platform = params.platform || "LinkedIn";
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: `You are Soshie, an expert social media manager. Write a viral ${platform} post about the topic. Use emojis and hashtags.` },
                { role: "user", content: `Topic: ${topic}. Context from memory: ${memory.context}` }
            ],
            model: "gpt-4-turbo",
        });
        const postContent = completion.choices[0].message.content;
        return {
            status: "SUCCESS",
            platform,
            content: postContent,
            likes: Math.floor(Math.random() * 500) // Simulerad statistik
        };
    }
    catch (e) {
        return { status: "ERROR", error: e.message };
    }
}
// 3. Pixel (Creative Director)
async function runPixelDesignEngine(params, memory) {
    var _a, _b, _c, _d;
    const prompt = params.description || "A futuristic robot office";
    try {
        const image = await openai.images.generate({
            model: "dall-e-3",
            prompt: `High quality, professional studio lighting. ${prompt}`,
            n: 1,
            size: "1024x1024",
        });
        return {
            status: "SUCCESS",
            imageUrl: (_b = (_a = image.data) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.url,
            revisedPrompt: (_d = (_c = image.data) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.revised_prompt
        };
    }
    catch (e) {
        return { status: "ERROR", error: e.message };
    }
}
// 4. Ledger (CFO / Audit)
async function runLedgerAudit(params, memory) {
    const dataToAnalyze = params.data || "Revenue: 1M, Cost: 1.2M";
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are Ledger, a cynical and precise CFO. Analyze the financial data and find risks." },
                { role: "user", content: `Data: ${dataToAnalyze}` }
            ],
            model: "gpt-4-turbo",
        });
        return {
            status: "SUCCESS",
            auditReport: completion.choices[0].message.content,
            riskLevel: "HIGH"
        };
    }
    catch (e) {
        return { status: "ERROR", error: e.message };
    }
}
// 5. Generic / Default Agent
async function runGenericAgentTask(agentName, params, memory) {
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: `You are ${agentName}, an AI assistant.` },
                { role: "user", content: `Task: ${JSON.stringify(params)}. Context: ${memory.context}` }
            ],
            model: "gpt-4-turbo",
        });
        return {
            status: "SUCCESS",
            output: completion.choices[0].message.content,
            agent: agentName
        };
    }
    catch (e) {
        return { status: "ERROR", error: e.message };
    }
}
exports.onAgentTaskActivated = functions.firestore
    .document("users/{userId}/active_tasks/{taskId}")
    .onCreate(async (snapshot, context) => {
    const task = snapshot.data();
    if (!task)
        return;
    const userId = context.params.userId;
    const agentName = task.agentName;
    // Mother Hive hämtar kontext för att hjälpa agenten
    const memory = await getGlobalMemory(userId);
    functions.logger.info(`Mother Hive aktiverar ${agentName} för uppdrag: ${task.description}`);
    let result;
    // Dynamisk hantering av ALLA agenter
    switch (agentName) {
        case "Hunter":
            result = await runHunterLeadGen(task.params, memory);
            break;
        case "Soshie":
            result = await runSoshieSocialCampaign(task.params, memory);
            break;
        case "Pixel":
            result = await runPixelDesignEngine(task.params, memory);
            break;
        case "Ledger":
            result = await runLedgerAudit(task.params, memory);
            break;
        // ... lägg till fler agenter här vid behov
        default:
            result = await runGenericAgentTask(agentName, task.params, memory);
    }
    // Spara resultatet i Minnesbanken och skicka push-notis
    await saveToTotalMinnesbank(userId, agentName, result);
    await sendPushToUser(userId, `${agentName} har slutfört sitt uppdrag!`);
});
// --- COMPLEX TASK ORCHESTRATION (THE HIGH COUNCIL) ---
async function runAllAgents(userTask) {
    // I en full implementation skulle detta parallellköra relevanta agenter.
    // Här simulerar vi att "Generic", "Soshie" och "Ledger" gör varsitt utkast.
    const agents = ["Generic", "Soshie", "Ledger"];
    const drafts = {};
    for (const agent of agents) {
        drafts[agent] = await runGenericAgentTask(agent, { task: userTask }, { context: "Initial Draft" });
    }
    return drafts;
}
const highCouncil = {
    evaluate: async (drafts) => {
        try {
            const completion = await openai.chat.completions.create({
                messages: [
                    { role: "system", content: "You are the High Council, a supreme AI judge. Evaluate these drafts. If they are perfect, set isPerfect: true. If not, provide specific instructions for refinement." },
                    { role: "user", content: `Drafts: ${JSON.stringify(drafts)}` }
                ],
                model: "gpt-4-turbo",
                response_format: { type: "json_object" }
            });
            return JSON.parse(completion.choices[0].message.content || '{"isPerfect": false, "instructions": "Refine everything."}');
        }
        catch (e) {
            console.error("High Council Error:", e);
            return { isPerfect: false, instructions: "System error. Try again." };
        }
    }
};
const agents = {
    refine: async (drafts, instructions) => {
        const refinedDrafts = {};
        for (const agentKey of Object.keys(drafts)) {
            // Varje agent försöker förbättra sitt bidrag baserat på feedback
            const params = { originalDraft: drafts[agentKey], feedback: instructions };
            refinedDrafts[agentKey] = await runGenericAgentTask(agentKey, params, { context: "Refinement Phase" });
        }
        return refinedDrafts;
    }
};
async function solveComplexTask(userId, userTask) {
    functions.logger.info(`STARTING COMPLEX TASK for ${userId}: ${userTask}`);
    // 1. Agenterna genererar första utkastet
    let drafts = await runAllAgents(userTask);
    // 2. Diskussionen startar (Max 3 rundor för att nå perfektion)
    for (let i = 0; i < 3; i++) {
        functions.logger.info(`High Council Round ${i + 1}...`);
        const feedback = await highCouncil.evaluate(drafts);
        if (feedback.isPerfect) {
            functions.logger.info("High Council is satisfied.");
            break;
        }
        // Agenterna får feedback och försöker igen
        functions.logger.info(`Refining based on feedback: ${feedback.instructions}`);
        drafts = await agents.refine(drafts, feedback.instructions);
    }
    return drafts;
}
exports.onComplexTaskRequest = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const { task } = data;
    const userId = context.auth.uid;
    const result = await solveComplexTask(userId, task);
    // Spara slutresultatet
    await saveToTotalMinnesbank(userId, "The High Council", result);
    return { status: "SUCCESS", result };
});
//# sourceMappingURL=index.js.map
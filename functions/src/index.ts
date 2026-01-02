import * as dotenv from "dotenv";
dotenv.config();

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import OpenAI from "openai";

admin.initializeApp();

export const onHunterConfirmation = functions.firestore
    .document("chats/{chatId}/messages/{messageId}")
    .onCreate(async (snapshot, context) => {
        const newMessage = snapshot.data();
        if (!newMessage) return;

        const userId = newMessage.userId;

        // 1. Identifiera bekräftelse (t.ex. "Ja", "Kör", "Stemmer")
        const confirmationWords = ["ja", "kör", "stemmer", "yes", "gör det"];
        if (!newMessage.text || !confirmationWords.includes(newMessage.text.toLowerCase().trim())) return;

        // 2. Mother Hive öppnar Minnesbanken för att se vad Hunter frågade om sist
        const userRef = admin.firestore().collection("users").doc(userId);
        const userDoc = await userRef.get();
        const lastTask = userDoc.data()?.lastAgentQuestion; // T.ex. "Söka leads i Oslo?"

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
            const fcmToken = userDoc.data()?.fcmToken;
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

async function getProactiveInsights(userId: string, currentTask: string) {
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
    } else {
        pastSuccesses.forEach(doc => {
            contextString += (doc.data().insight || "") + " ";
        });
    }

    // 2. Mother Hive analyserar om gammal info kan hjälpa den nya uppgiften
    return `MOTHER_HIVE_INSTRUCTION: Baserat på minnesbanken vet vi att användaren gillar ${contextString}. 
            Använd denna info för att lösa uppgiften: ${currentTask}`;
}

export const getMotherInsights = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const { task } = data;
    const userId = context.auth.uid;

    const insights = await getProactiveInsights(userId, task || "Generell assistans");
    return { insights };
});

// --- Helper Functions (Placeholders for real logic) ---
async function getGlobalMemory(userId: string) {
    const insights = await getProactiveInsights(userId, "Context Fetch");
    return { context: insights };
}

async function saveToTotalMinnesbank(userId: string, agentName: string, result: any) {
    await admin.firestore().collection("users").doc(userId).collection("memory_bank").add({
        agentName,
        result,
        status: "SUCCESS",
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
}

async function sendPushToUser(userId: string, message: string) {
    const userDoc = await admin.firestore().collection("users").doc(userId).get();
    const fcmToken = userDoc.data()?.fcmToken;
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
async function runHunterLeadGen(params: any, memory: any) {
    const query = params.query || "Marketing agencies in Oslo";
    const apiKey = "AIzaSyBxLqpOcRT9kF3gjM6NezGOgjlvxHZOe8k"; // Använder nyckeln från frontend för demo

    try {
        // Sök efter platser (Text Search)
        const response = await axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json`, {
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
        const leads = response.data.results.slice(0, 5).map((place: any) => ({
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

    } catch (error: any) {
        console.error("Hunter Error:", error.message);
        return { status: "ERROR", error: error.message };
    }
}


// VIKTIGT: Byt ut denna mot din riktiga OpenAI API-nyckel!
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// --- AGENT IMPLEMENTATIONS ---

// 2. Soshie (Social Media Manager)
async function runSoshieSocialCampaign(params: any, memory: any) {
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
    } catch (e: any) {
        return { status: "ERROR", error: e.message };
    }
}

// 3. Pixel (Creative Director)
async function runPixelDesignEngine(params: any, memory: any) {
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
            imageUrl: image.data?.[0]?.url,
            revisedPrompt: image.data?.[0]?.revised_prompt
        };
    } catch (e: any) {
        return { status: "ERROR", error: e.message };
    }
}

// 4. Ledger (CFO / Audit)
async function runLedgerAudit(params: any, memory: any) {
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
    } catch (e: any) {
        return { status: "ERROR", error: e.message };
    }
}

// 5. Generic / Default Agent
async function runGenericAgentTask(agentName: string, params: any, memory: any) {
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
    } catch (e: any) {
        return { status: "ERROR", error: e.message };
    }
}


export const onAgentTaskActivated = functions.firestore
    .document("users/{userId}/active_tasks/{taskId}")
    .onCreate(async (snapshot, context) => {
        const task = snapshot.data();
        if (!task) return;

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

// --- THE HIVE MIND ARCHITECTURE ---

// 1. Definition of the 9 Agents and their 27 Sub-agents
const AGENT_ROSTRUM: any = {
    Hunter: {
        role: "Sales",
        subs: {
            LeadScout: "Finds raw lead data (API)",
            LeadAnalyst: "Qualifies leads via Memory Bank",
            Ghostwriter: "Creates personalized outreach"
        }
    },
    Soshie: {
        role: "Marketing",
        subs: {
            TrendHunter: "Scans social media for trends in customer niche",
            CopySpecialist: "Writes engaging copy for ads and posts",
            GrowthHacker: "Optimizes campaigns for conversion"
        }
    },
    Pixel: {
        role: "Design",
        subs: {
            UIArchitect: "Creates structural layouts (Bento, Glassmorphism)",
            BrandStylist: "Selects colors, typography and visual identity",
            AssetEngine: "Generates assets via DALL-E/Midjourney"
        }
    },
    Ledger: {
        role: "Finance",
        subs: {
            CostAuditor: "Audits expenses and finds hidden costs",
            RevenuePredictor: "Forecasts revenue based on sales data",
            ComplianceOfficer: "Ensures financial regulation compliance"
        }
    },
    Atlas: {
        role: "Tech",
        subs: {
            SystemArchitect: "Designs database schemas and cloud architecture",
            CodeAuditor: "Reviews code for bugs and security",
            APIIntegrator: "Connects different systems and services"
        }
    },
    Lex: {
        role: "Legal",
        subs: {
            ContractDrafter: "Drafts legal documents like NDAs",
            PrivacyExpert: "Ensures GDPR compliance and data protection",
            RiskAssessor: "Identifies legal risks in business ideas"
        }
    },
    Sage: {
        role: "Strategy",
        subs: {
            MarketAnalyst: "Performs SWOT analysis on competitors",
            InnovationScout: "Finds new business opportunities",
            RoadmapPlanner: "Creates long-term execution plans"
        }
    },
    Spark: {
        role: "Innovation",
        subs: {
            Ideator: "Generates 50+ wild ideas without limits",
            ConceptPolisher: "Refines ideas into business concepts",
            FutureCaster: "Predicts future needs based on tech trends"
        }
    },
    Echo: {
        role: "Support",
        subs: {
            KnowledgeBaseManager: "Organizes internal documentation",
            ResponseDesigner: "Creates customer response templates",
            QualityChecker: "Analyzes support tickets for quality"
        }
    },
    Dexter: {
        role: "Operations & Outreach",
        subs: {
            WarmUpExpert: "Du är Dexters leverans-specialist. Uppdrag: Kontrollera om kundens domän har några specifika säkerhetsinställningar (SPF, DKIM, DMARC) som kräver att vi ändrar mejlformatet till ren text. Rensa mejlet från 'spam-ord' (t.ex. 'free', 'buy now') och skapa slumpmässiga tidsfördröjningar.",
            HyperPersonalizer: "Du är Dexters innehålls-specialist med tillstånd att använda 'Website_Scraper' och 'LinkedIn_API'. Uppdrag: För varje lead, (1) Skanna deras officiella hemsida efter 'Våra Tjänster' och 'Om oss'. (2) Identifiera specifika projekt eller värdeord. (3) Hitta en specifik smärtpunkt (t.ex. manuell bokföring) och använd det som krok. (4) Sök på LinkedIn efter företagets senaste post. Ingen copy-paste är tillåten.",
            ThreadManager: "Du är Dexters uppföljnings-strateg. Uppdrag: Bevaka om kunden har postat något nytt på Facebook/LinkedIn nyligen och väv in det i uppföljningsmejlet om de inte svarar på första utkastet. Skapa 'följa-upp'-sekvenser som ser ut som naturliga svar."
        }
    }
};

// 2. Helper to run a specific Sub-agent using OpenAI
async function runSubAgent(agentName: string, subName: string, subRole: string, task: string, context: string) {
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: `You are ${subName}, a specialist sub-agent for ${agentName} (${AGENT_ROSTRUM[agentName].role}). Your specific role: ${subRole}.` },
                { role: "user", content: `(TIMESTAMP: ${new Date().toISOString()}) Task: ${task}. \nGlobal Context: ${context}` }
            ],
            model: "gpt-4-turbo",
        });
        return {
            agent: `${agentName}_${subName}`,
            message: completion.choices[0].message.content,
            timestamp: new Date().toISOString()
        };
    } catch (e: any) {
        return {
            agent: `${agentName}_${subName}`,
            message: `Error executing ${subName}: ${e.message}`,
            timestamp: new Date().toISOString()
        };
    }
}

// 3. Orchestrate a Main Agent (runs all 3 subs)
async function activateAgentSquad(taskId: string, agentName: string, task: string, globalContext: string) {
    const squad = AGENT_ROSTRUM[agentName].subs;
    const promises = Object.keys(squad).map(async subName => {
        // LOGIC REQUESTED BY USER:
        // Simulera att sub-agenten börjar jobba
        await admin.firestore().collection("task_discussions").doc(taskId).update({
            brain_feed: admin.firestore.FieldValue.arrayUnion({
                agent: `${agentName}_${subName}`,
                message: `Initialiserar specialistuppgift: Analyserar '${task.substring(0, 30)}...'`,
                timestamp: new Date().toISOString()
            })
        });

        return runSubAgent(agentName, subName, squad[subName], task, globalContext);
    });

    // Run subs in parallel
    const feed = await Promise.all(promises);
    return feed; // Returns array of brain_feed items
}

// 4. THE HIGH COUNCIL LOGIC
export const HIGH_COUNCIL = {
    Architect: "You are The Architect. Verify technical feasibility and logical flow. If plans collide, order restructuring.",
    Critic: "You are The Critic. Challenge every proposal. Find weaknesses. Never approve without questioning.",
    Synthesizer: "You are The Synthesizer. Merge all insights into one perfect final response. You have the final word."
};

/*
async function consultHighCouncil(brainFeed: any[], task: string) {
    const context = JSON.stringify(brainFeed, null, 2);

    // Step 1: The Architect
    const archResponse = await openai.chat.completions.create({
        messages: [
            { role: "system", content: HIGH_COUNCIL.Architect },
            { role: "user", content: `Analyze this Brain Feed for task "${task}":\n${context}` }
        ], model: "gpt-4-turbo"
    });
    const archFeedback = archResponse.choices[0].message.content;

    // Step 2: The Critic (sees Architect's feedback)
    const criticResponse = await openai.chat.completions.create({
        messages: [
            { role: "system", content: HIGH_COUNCIL.Critic },
            { role: "user", content: `Analyze Feed + Architect's feedback:\nFeed: ${context}\nArchitect: ${archFeedback}` }
        ], model: "gpt-4-turbo"
    });
    const criticFeedback = criticResponse.choices[0].message.content;

    // Step 3: The Synthesizer (The Decision Maker)
    const synthResponse = await openai.chat.completions.create({
        messages: [
            { role: "system", content: HIGH_COUNCIL.Synthesizer },
            {
                role: "user", content: `Synthesize everything into a final output for the user.
            Task: ${task}
            Brain Feed: ${context}
            Architect says: ${archFeedback}
            Critic says: ${criticFeedback}`
            }
        ], model: "gpt-4-turbo"
    });

    return {
        architect: archFeedback,
        critic: criticFeedback,
        finalVerdict: synthResponse.choices[0].message.content
    };
}
*/


// --- MAIN ENTRY POINT: SOLVE COMPLEX TASK ---

async function solveComplexTask(userId: string, userTask: string) {
    functions.logger.info(`STARTING HIVE MIND for ${userId}: ${userTask}`);

    // Create Task Document
    const taskId = `task_${Date.now()}`;
    const db = admin.firestore();
    const taskRef = db.collection("task_discussions").doc(taskId);

    // Init doc
    await taskRef.set({
        taskId: taskId,
        userId: userId,
        task: userTask,
        created_at: new Date().toISOString(),
        brain_feed: [],
        consensus_reached: false
    });

    // Helper to log to feed
    const addToFeed = async (agent: string, msg: string) => {
        await taskRef.update({
            brain_feed: admin.firestore.FieldValue.arrayUnion({
                agent: agent,
                message: msg,
                timestamp: new Date().toISOString()
            })
        });
    };

    // 0. Mother Hive Delegate: Determine active agents
    // FULL HIVE MIND ACTIVATION: All agents engaged.
    const activeAgents = ["Hunter", "Soshie", "Pixel", "Ledger", "Atlas", "Lex", "Sage", "Spark", "Echo", "Dexter"];
    const globalMemory = await getGlobalMemory(userId);

    // 1. Sub-Execution: Trigger agents
    // We run this *after* returning response? No, Cloud Functions time out if we don't await.
    // So we await the execution, but we update the feed as we go.

    // Notify start
    await addToFeed("Mother_Hive_Core", `Received task: "${userTask}". Initiating Agent Squads...`);

    for (const agent of activeAgents) {
        // Log Agent Activation
        await addToFeed("Mother_Hive_Core", `Activating ${agent} Team...`);

        // Run Squad
        const squadResults = await activateAgentSquad(taskId, agent, userTask, globalMemory.context);

        // Post results to feed
        for (const res of squadResults) {
            await addToFeed(res.agent, res.message || "No output generated.");
        }
    }

    // Return the ID so frontend can subscribe
    return {
        task_id: taskId,
        status: "started",
        message: "Agents activated. Monitor Brain-Feed for High Council consensus."
    };
}

export const onComplexTaskRequest = functions.runWith({ timeoutSeconds: 540, memory: '1GB' }).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const { task } = data;
    const userId = context.auth.uid;

    const result = await solveComplexTask(userId || "anonymous", task);

    // Task started. Result will appear in Firestore feed.

    return { status: "SUCCESS", result };
});

// --- REAL-TIME BRAIN FEED LOGIC ---

export const onBrainFeedUpdate = functions.firestore
    .document("task_discussions/{taskId}")
    .onUpdate(async (change, context) => {
        const data = change.after.data();
        // const previousData = change.before.data(); // Not used currently
        const feed = data.brain_feed;
        if (!feed || feed.length === 0) return;

        const lastMessage = feed[feed.length - 1];

        // Om Synthesizer redan har satt consensus till true, avsluta diskussionen
        if (data.consensus_reached) return;

        functions.logger.info(`Mother Hive: Nytt inlägg i tråden från ${lastMessage.agent}`);

        // LOGIK FÖR DISKUSSION (The High Council Check-in)

        // 1. Om en Sub-agent (t.ex. Hunter_Scout) postat rådata -> Väck THE CRITIC
        // Vi måste vara försiktiga med oändliga loopar. Kolla vem som skrev sist.
        if (lastMessage.agent.includes("_") && !lastMessage.agent.includes("High_Council")) {
            await addMessageToFeed(context.params.taskId, "High_Council_Critic",
                `Jag granskar ${lastMessage.agent}s output. Är detta verkligen optimerat för kundens mål i Minnesbanken?`);
        }

        // 2. Om THE CRITIC har gett feedback -> Väck THE ARCHITECT för att strukturera om
        if (lastMessage.agent === "High_Council_Critic") {
            await addMessageToFeed(context.params.taskId, "High_Council_Architect",
                "Jag justerar nu den tekniska strukturen baserat på Critics feedback.");
        }

        // 3. Om ARCHITECT är klar -> Låt THE SYNTHESIZER skapa slutgiltig lösning och nå CONSENSUS
        if (lastMessage.agent === "High_Council_Architect") {
            const isReady = await checkQualityScore(feed);

            if (isReady) {
                // Generera den riktiga slutrapporten med OpenAI
                const context = feed.map((f: any) => `${f.agent}: ${f.message}`).join("\n");

                const completion = await openai.chat.completions.create({
                    messages: [
                        { role: "system", content: HIGH_COUNCIL.Synthesizer },
                        { role: "user", content: `Review the discussion below and synthesize a final, comprehensive strategy for the user. this is the final output they will pay for.\n\nDISCUSSION LOG:\n${context}` }
                    ],
                    model: "gpt-4-turbo",
                });

                const finalVerdict = completion.choices[0].message.content || "Error generating verdict.";

                await change.after.ref.update({ consensus_reached: true });
                await addMessageToFeed(context.params.taskId, "High_Council_Synthesizer", finalVerdict);
            }
        }
    });

async function addMessageToFeed(taskId: string, agentName: string, text: string) {
    // Förhindra snabba loopar med en liten fördröjning om det vore produktion
    await admin.firestore().collection("task_discussions").doc(taskId).update({
        brain_feed: admin.firestore.FieldValue.arrayUnion({
            agent: agentName,
            message: text,
            timestamp: new Date().toISOString()
        })
    });
}

// Placeholder for quality check AI
async function checkQualityScore(feed: any[]): Promise<boolean> {
    // Här skulle man kunna köra en LLM-koll igen.
    // För demo-syfte, vi säger alltid JA efter att Architect har talat.
    return true;
}

export const generateDexterDrafts = functions.runWith({ timeoutSeconds: 300 }).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in.');
    }
    const { leads } = data;
    const userId = context.auth.uid;
    const memory = await getGlobalMemory(userId);

    const drafts = [];

    // Process max 3 leads for demo speed/cost, or all if few
    const leadsToProcess = leads.slice(0, 3);

    for (const lead of leadsToProcess) {
        // Use Dexter's HyperPersonalizer to write the email
        const result = await runSubAgent(
            "Dexter",
            "HyperPersonalizer",
            AGENT_ROSTRUM.Dexter.subs.HyperPersonalizer,
            `Create a personalized cold email for ${lead.name}. They are located at ${lead.address}. If you have info on '${lead.daglig_leder}', address them directly. Verify if they are a 'Marketing Agency' based on types: ${lead.types}`,
            memory.context
        );

        drafts.push({
            leadName: lead.name,
            emailTo: lead.email || "unknown@domain.com",
            subject: `Fråga gällande samarbete med ${lead.name}`,
            content: result.message
        });
    }

    return { drafts };
});

// --- DEXTER OUTREACH AUTOMATION ---

async function triggerDexterProcess(leads: any[], userId: string) {
    const memory = await getGlobalMemory(userId);
    const results = [];

    // Limit to 3 leads for demo purposes to save tokens/time
    const leadsToProcess = leads.slice(0, 3);

    for (const lead of leadsToProcess) {
        // 1. WarmUp Expert checks domain
        const warmUpRes = await runSubAgent(
            "Dexter",
            "WarmUpExpert",
            AGENT_ROSTRUM.Dexter.subs.WarmUpExpert,
            `SIMULATE_DOMAIN_CHECK: Analyze ${lead.name}. Check SPF/DKIM/DMARC records. Look for spam-trigger words in our potential draft. Output a safety score (0-100%).`,
            memory.context
        );

        // 2. HyperPersonalizer writes content
        const personRes = await runSubAgent(
            "Dexter",
            "HyperPersonalizer",
            AGENT_ROSTRUM.Dexter.subs.HyperPersonalizer,
            `EXECUTE_DEEP_SCAN:
            1. Search LinkedIn for ${lead.name}'s latest post.
            2. Scrape official website (if available) for 'Våra Tjänster'.
            3. Find a pain point (e.g. manual accounting) to use as a hook.
            4. Write a highly personalized intro sentence based on this data.`,
            memory.context
        );

        // Save to Firestore so UI can pick it up
        await admin.firestore().collection(`users/${userId}/dexter_drafts`).add({
            leadName: lead.name,
            warmUpAnalysis: warmUpRes.message,
            emailContent: personRes.message,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            status: "ready"
        });

        results.push({ lead: lead.name, status: "processed" });
    }
    return results;
}

export const onSendToDexter = functions.firestore
    .document("users/{userId}/lead_transfers/{transferId}")
    .onCreate(async (snapshot, context) => {
        const data = snapshot.data();
        if (!data || !data.leads) return;

        console.log(`Mottog ${data.leads.length} leads för Dexter. Startar process...`);

        // 1. Väck Dexters specialister
        await triggerDexterProcess(data.leads, context.params.userId);

        // 2. Skapa ett diskussionsämne i Brain-Feed så du ser det i realtid
        // Vi skapar detta med en referens så vi kan fylla på
        const taskRef = await admin.firestore().collection("task_discussions").add({
            userId: context.params.userId,
            task: `Outreach för ${data.leads.length} nya leads (från Hunter)`,
            created_at: new Date().toISOString(),
            consensus_reached: false,
            brain_feed: []
        });

        // 3. Logga första meddelandet
        await taskRef.update({
            brain_feed: admin.firestore.FieldValue.arrayUnion({
                agent: "Mother_Hive",
                message: "Hunters leads mottagna. Aktiverar Dexter och hans 3 specialister för outreach.",
                timestamp: new Date().toISOString()
            })
        });
    });

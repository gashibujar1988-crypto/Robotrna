import { db, auth } from '../firebase';
import { collection, getDocs, query, where, doc, updateDoc, addDoc, serverTimestamp, orderBy, limit, getDoc } from 'firebase/firestore';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// Default robots data for initialization
import { agents } from '../data/agents';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || "AIzaSyBxLqpOcRT9kF3gjM6NezGOgjlvxHZOe8k"; // Fallback for debugging
const genAI = new GoogleGenerativeAI(API_KEY);

const getUserId = () => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    return user.uid;
};

// Helper: Smart Retry for Rate Limits (429)
const generateWithRetry = async (model: any, prompt: string, retries = 5, delay = 2000): Promise<any> => {
    try {
        return await model.generateContent(prompt);
    } catch (e: any) {
        // If it's a rate limit error (429) and we have retries left
        if (retries > 0 && (e.message?.includes('429') || e.message?.includes('Quota'))) {
            console.log(`⏳ Rate limit hit. Waiting ${delay}ms before retry...`);
            await new Promise(r => setTimeout(r, delay));
            return generateWithRetry(model, prompt, retries - 1, delay * 1.5);
        }
        throw e;
    }
};

// Model Discovery Cache
let cachedModelName: string | null = null;
export const getAvailableModel = async (apiKey: string | undefined): Promise<string> => {
    if (cachedModelName && !cachedModelName.includes('latest')) return cachedModelName; // Avoid caching volatile aliases
    if (!apiKey) return "gemini-pro";

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!res.ok) throw new Error(`List models failed: ${res.statusText}`);
        const data = await res.json();

        const available = data.models?.map((m: any) => m.name.replace('models/', '')) || [];
        console.log("Available Gemini Models:", available);

        // PRIORITY LIST (Safe Mode)
        // Reverting to Flash as primary because Pro returns 404 despite being listed.
        // Likely a regional restriction (EU AI Act) or Project API mismatch.
        const preferences = [
            'gemini-2.0-flash-exp',
            'gemini-1.5-flash',
            'gemini-1.5-flash-002',
            'gemini-1.5-pro',
            'gemini-1.5-pro-002',
            'gemini-pro'
        ];

        for (const pref of preferences) {
            if (available.includes(pref)) {
                console.log(`Selected Systems Model: ${pref}`);
                cachedModelName = pref;
                return pref;
            }
        }

    } catch (e) {
        console.warn("Model discovery check failed (using default fallback)", e);
    }
    // Safe default fallback
    return "gemini-1.5-flash-002";
};

// Compatibility wrapper for Axios-like syntax
const api = {
    get: async (url: string) => {
        const userId = getUserId();

        if (url === '/robots') {
            try {
                const q = query(collection(db, 'robots'), where('userId', '==', userId));
                const snapshot = await getDocs(q);
                let availableRobots = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

                // Auto-sync missing agents for existing users
                if (availableRobots.length > 0 && availableRobots.length < agents.length) {
                    const existingNames = new Set(availableRobots.map((r: any) => r.name));
                    const newAgents = agents.filter(a => !existingNames.has(a.name));

                    if (newAgents.length > 0) {
                        const batchPromises = newAgents.map(agent =>
                            addDoc(collection(db, 'robots'), {
                                name: agent.name,
                                type: agent.role,
                                userId: userId,
                                config: JSON.stringify({ allowGoogle: true, allowBrain: true }),
                                createdAt: serverTimestamp()
                            })
                        );
                        await Promise.all(batchPromises);

                        // Fetch again to include the new ones
                        const updatedSnapshot = await getDocs(q);
                        availableRobots = updatedSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                    }
                }

                return { data: availableRobots };
            } catch (error) {
                console.warn("Firestore access failed, falling back to local mode:", error);
                // Fallback to local data so the app works without DB
                return {
                    data: agents.map(a => ({
                        ...a,
                        type: a.role, // Map 'role' from static data to 'type' expected by dashboard
                        config: JSON.stringify({ allowGoogle: true, allowBrain: true })
                    }))
                };
            }
        }

        if (url === '/tasks') {
            const q = query(collection(db, 'tasks'), where('userId', '==', userId));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            // Client side sort
            return { data: data.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)) };
        }

        if (url === '/user/next-meeting') {
            const token = localStorage.getItem('google_access_token');
            if (!token) return { data: null };

            try {
                const now = new Date().toISOString();
                const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&maxResults=1&orderBy=startTime&singleEvents=true`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.items && data.items.length > 0) {
                        const evt = data.items[0];
                        return {
                            data: {
                                id: evt.id,
                                summary: evt.summary,
                                start: evt.start.dateTime || evt.start.date,
                                link: evt.htmlLink,
                                meetLink: evt.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === 'video')?.uri
                            }
                        };
                    }
                }
            } catch (e) {
                console.warn("Failed to fetch next meeting", e);
            }
            return { data: null };
        }

        if (url === '/user/google-stats') {
            const token = localStorage.getItem('google_access_token');
            let upcomingEvents = 0;
            let unreadEmails = 0;

            if (token) {
                try {
                    const now = new Date().toISOString();
                    const endOfDay = new Date();
                    endOfDay.setHours(23, 59, 59, 999);

                    // Fetch Calendar Events
                    const calRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&timeMax=${endOfDay.toISOString()}&singleEvents=true`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (calRes.ok) {
                        const data = await calRes.json();
                        upcomingEvents = data.items?.length || 0;
                    }

                    // Fetch Unread Emails from Gmail
                    const mailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels/UNREAD', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (mailRes.ok) {
                        const mailData = await mailRes.json();
                        unreadEmails = mailData.messagesUnread || 0;
                    }
                } catch (e) {
                    console.warn("Failed to fetch google stats", e);
                }
            }
            return { data: { unreadEmails, upcomingEvents } };
        }

        if (url.startsWith('/chat/')) {
            const robotId = url.split('/')[2];
            try {
                // Fetch messages from USER-SCOPED subcollection
                const messagesRef = collection(db, 'users', userId, 'chats', robotId, 'messages');
                const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(50));
                const snapshot = await getDocs(q);

                const messages = snapshot.docs.map(d => {
                    const data = d.data();
                    return {
                        id: d.id,
                        sender: data.sender,
                        text: data.content,
                        timestamp: data.timestamp?.toDate() || new Date()
                    };
                });
                return { data: messages };
            } catch (e) {
                console.warn("Could not fetch messages from DB", e);
                return { data: [] };
            }
        }

        if (url.startsWith('/agent-config/')) {
            const agentName = url.split('/')[2];
            try {
                const docRef = doc(db, 'agent_configs', agentName.toLowerCase());
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    return { data: docSnap.data() };
                }
            } catch (e) {
                console.warn("Failed to fetch agent config", e);
            }
            return { data: null };
        }

        console.warn(`Unmocked GET request to ${url}`);
        return { data: [] };
    },
    post: async (url: string, data?: any) => {
        const userId = getUserId();

        if (url === '/robots/init') {
            const q = query(collection(db, 'robots'), where('userId', '==', userId));
            const snapshot = await getDocs(q);
            const existingRobots = snapshot.docs.map(d => d.data());
            const existingNames = new Set(existingRobots.map(r => r.name));

            const newAgents = agents.filter(a => !existingNames.has(a.name));

            if (newAgents.length > 0) {
                const batchPromises = newAgents.map(agent =>
                    addDoc(collection(db, 'robots'), {
                        name: agent.name,
                        type: agent.role, // Mapping 'role' to 'type' as per existing schema
                        userId: userId,
                        config: JSON.stringify({ allowGoogle: true, allowBrain: true }),
                        createdAt: serverTimestamp()
                    })
                );
                await Promise.all(batchPromises);
            }

            // Re-fetch all to ensure we have IDs
            const finalQ = query(collection(db, 'robots'), where('userId', '==', userId));
            const finalSnapshot = await getDocs(finalQ);
            return { data: finalSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) };
        }

        if (url.startsWith('/chat/')) {
            const robotId = url.split('/')[2];
            const userMsg = data.message;
            let messagesRef;

            // 1. Try Save User Message to DB (User Scoped)
            try {
                messagesRef = collection(db, 'users', userId, 'chats', robotId, 'messages');
                await addDoc(messagesRef, {
                    content: userMsg,
                    sender: 'user',
                    timestamp: serverTimestamp()
                });
            } catch (e) {
                console.warn("Could not save user message to DB", e);
            }

            // 2. Call Gemini
            // Determine robot context (Moved outside try for Error Fallback Scope)
            let robotName = "AI Assistant";
            let robotRole = "Helpful Assistant";
            const agent = agents.find(a => a.id === robotId || a.name === robotId);
            if (agent) {
                robotName = agent.name;
                robotRole = agent.role;
            }

            let resolvedModelName = "gemini-1.5-flash"; // Default for error scope visibility
            try {
                // Check Key
                if (!API_KEY || API_KEY.includes('YOUR_API_KEY')) {
                    throw new Error("API key missing or invalid in .env (VITE_GOOGLE_API_KEY)");
                }

                // --- TOOLS DEFINITION ---
                const tools = [
                    {
                        functionDeclarations: [
                            {
                                name: "send_email",
                                description: "Send an email to a specific recipient with a subject and body.",
                                parameters: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        to: { type: SchemaType.STRING, description: "The email address of the recipient" },
                                        subject: { type: SchemaType.STRING, description: "The subject of the email" },
                                        body: { type: SchemaType.STRING, description: "The plain text body content of the email" },
                                    },
                                    required: ["to", "subject", "body"],
                                },
                            },
                            {
                                name: "list_calendar_events",
                                description: "List upcoming calendar events.",
                                parameters: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        count: { type: SchemaType.STRING, description: "Number of events to retrieve (default 10)" },
                                    },
                                },
                            },
                            {
                                name: "create_calendar_event",
                                description: "Schedule a new event in the calendar.",
                                parameters: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        summary: { type: SchemaType.STRING, description: "Title of the event" },
                                        startTime: { type: SchemaType.STRING, description: "Start time in ISO format (e.g. 2024-12-25T14:00:00)" },
                                        endTime: { type: SchemaType.STRING, description: "End time in ISO format (e.g. 2024-12-25T15:00:00)" },
                                        description: { type: SchemaType.STRING, description: "Description or notes for the event" },
                                    },
                                    required: ["summary", "startTime", "endTime"],
                                },
                            },
                            {
                                name: "send_sms",
                                description: "Send an SMS reminder or message to a phone number.",
                                parameters: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        to: { type: SchemaType.STRING, description: "The phone number to send to" },
                                        message: { type: SchemaType.STRING, description: "The SMS message content" },
                                    },
                                    required: ["to", "message"],
                                },
                            },
                            {
                                name: "create_document",
                                description: "Create a new Google Doc.",
                                parameters: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        title: { type: SchemaType.STRING, description: "Title of the document" },
                                        content: { type: SchemaType.STRING, description: "Initial text content to insert" },
                                    },
                                    required: ["title"],
                                },
                            },
                            {
                                name: "read_document",
                                description: "Read the text content of a Google Doc.",
                                parameters: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        documentId: { type: SchemaType.STRING, description: "The ID of the document to read" },
                                    },
                                    required: ["documentId"],
                                },
                            },
                            {
                                name: "list_documents",
                                description: "List recent Google Docs.",
                                parameters: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        count: { type: SchemaType.STRING, description: "Number of documents to list" },
                                    },
                                },
                            },
                            {
                                name: "create_spreadsheet",
                                description: "Create a new Google Sheet.",
                                parameters: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        title: { type: SchemaType.STRING, description: "Title of the spreadsheet" },
                                    },
                                    required: ["title"],
                                },
                            },
                            {
                                name: "read_sheet_values",
                                description: "Read values from a specific range in a Google Sheet.",
                                parameters: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        spreadsheetId: { type: SchemaType.STRING, description: "ID of the spreadsheet" },
                                        range: { type: SchemaType.STRING, description: "Range to read (e.g., 'Sheet1!A1:B10')" },
                                    },
                                    required: ["spreadsheetId", "range"],
                                },
                            },
                            {
                                name: "append_to_sheet",
                                description: "Append a row of values to a Google Sheet.",
                                parameters: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        spreadsheetId: { type: SchemaType.STRING, description: "ID of the spreadsheet" },
                                        range: { type: SchemaType.STRING, description: "Range/Sheet to append to (e.g., 'Sheet1!A1')" },
                                        values: { type: SchemaType.STRING, description: "JSON string of array of strings to append (e.g. '[\"Value1\", \"Value2\"]')" },
                                    },
                                    required: ["spreadsheetId", "range", "values"],
                                },
                            },
                            {
                                name: "search_places",
                                description: "Search for places, businesses, or points of interest using Google Maps.",
                                parameters: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        query: { type: SchemaType.STRING, description: "Text query for places (e.g. 'Coffee shops in Stockholm', 'Gyms nearby')" },
                                    },
                                    required: ["query"],
                                },
                            },
                            {
                                name: "list_analytics_properties",
                                description: "List Google Analytics 4 properties accessible to the user.",
                                parameters: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        dummy: { type: SchemaType.STRING, description: "Ignored" },
                                    },
                                },
                            },
                            {
                                name: "get_analytics_report",
                                description: "Get basic traffic stats from a Google Analytics 4 property.",
                                parameters: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        propertyId: { type: SchemaType.STRING, description: "The Analytics Property ID (e.g., '123456789')" },
                                        startDate: { type: SchemaType.STRING, description: "Start date (e.g., '30daysAgo', '2024-01-01')" },
                                        endDate: { type: SchemaType.STRING, description: "End date (e.g., 'today', '2024-01-31')" },
                                    },
                                    required: ["propertyId"],
                                },
                            },
                            {
                                name: "list_gtm_accounts",
                                description: "List Google Tag Manager accounts.",
                                parameters: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        dummy: { type: SchemaType.STRING, description: "Ignored" },
                                    },
                                },
                            },
                            {
                                name: "list_gtm_containers",
                                description: "List containers for a specific GTM account.",
                                parameters: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        accountId: { type: SchemaType.STRING, description: "The GTM Account Path (e.g., 'accounts/12345')" },
                                    },
                                    required: ["accountId"],
                                },
                            },
                        ],
                    },
                ];

                // --- TOOL IMPLEMENTATION ---
                const functions: any = {
                    create_document: async ({ title, content }: any) => {
                        const token = localStorage.getItem('google_access_token');
                        if (!token) return "Error: User is not connected to Google.";

                        try {
                            // 1. Create Doc
                            const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify({ title })
                            });
                            if (!createRes.ok) return "Error creating document.";
                            const docData = await createRes.json();
                            const docId = docData.documentId;

                            // 2. Insert Content (if provided)
                            if (content) {
                                await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
                                    method: 'POST',
                                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        requests: [{
                                            insertText: {
                                                text: content,
                                                location: { index: 1 }
                                            }
                                        }]
                                    })
                                });
                            }
                            return `Document created! Title: "${title}", ID: ${docId}, Link: https://docs.google.com/document/d/${docId}`;
                        } catch (e: any) { return `Error creating document: ${e.message}`; }
                    },
                    read_document: async ({ documentId }: any) => {
                        const token = localStorage.getItem('google_access_token');
                        if (!token) return "Error: User is not connected to Google.";

                        try {
                            const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (!res.ok) return "Error reading document.";
                            const data = await res.json();
                            // Extract text from structural elements
                            let text = "";
                            data.body.content.forEach((elem: any) => {
                                if (elem.paragraph) {
                                    elem.paragraph.elements.forEach((pElem: any) => {
                                        if (pElem.textRun) text += pElem.textRun.content;
                                    });
                                }
                            });
                            return text || "Document is empty.";
                        } catch (e: any) { return `Error reading document: ${e.message}`; }
                    },
                    list_documents: async ({ count }: any) => {
                        const token = localStorage.getItem('google_access_token');
                        if (!token) return "Error: User is not connected to Google.";

                        try {
                            const max = count || 10;
                            const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.document'&pageSize=${max}&orderBy=modifiedTime desc`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (!res.ok) return "Error listing documents.";
                            const data = await res.json();
                            if (!data.files || data.files.length === 0) return "No documents found.";
                            return JSON.stringify(data.files.map((f: any) => ({
                                name: f.name,
                                id: f.id,
                                link: `https://docs.google.com/document/d/${f.id}`
                            })));
                        } catch (e: any) { return `Error listing documents: ${e.message}`; }
                    },
                    create_spreadsheet: async ({ title }: any) => {
                        const token = localStorage.getItem('google_access_token');
                        if (!token) return "Error: User is not connected to Google.";

                        try {
                            const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify({ properties: { title } })
                            });
                            if (!res.ok) {
                                const err = await res.json();
                                return `Error creating sheet: ${err.error?.message}`;
                            }
                            const data = await res.json();
                            return `Spreadsheet created! Title: "${data.properties.title}", ID: ${data.spreadsheetId}, Link: ${data.spreadsheetUrl}`;
                        } catch (e: any) { return `Error creating spreadsheet: ${e.message}`; }
                    },
                    read_sheet_values: async ({ spreadsheetId, range }: any) => {
                        const token = localStorage.getItem('google_access_token');
                        if (!token) return "Error: User is not connected to Google.";

                        try {
                            const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (!res.ok) return "Error reading sheet.";
                            const data = await res.json();
                            if (!data.values || data.values.length === 0) return "No data found in range.";
                            return JSON.stringify(data.values);
                        } catch (e: any) { return `Error reading sheet: ${e.message}`; }
                    },
                    append_to_sheet: async ({ spreadsheetId, range, values }: any) => {
                        const token = localStorage.getItem('google_access_token');
                        if (!token) return "Error: User is not connected to Google.";

                        try {
                            const valuesArray = JSON.parse(values);
                            const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify({ values: [valuesArray] })
                            });
                            if (!res.ok) {
                                const err = await res.json();
                                return `Error appending to sheet: ${err.error?.message}`;
                            }
                            const data = await res.json();
                            return `Successfully appended data to ${range}. Updated ${data.updates?.updatedCells} cells.`;
                        } catch (e: any) { return `Error appending to sheet: ${e.message}`; }
                    },
                    search_places: async ({ query }: any) => {
                        try {
                            const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-Goog-Api-Key': API_KEY, // Use the shared API key
                                    'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.priceLevel,places.rating,places.googleMapsUri'
                                },
                                body: JSON.stringify({ textQuery: query })
                            });

                            if (!res.ok) {
                                const err = await res.json();
                                return `Error searching places: ${err.error?.message || res.statusText}`;
                            }

                            const data = await res.json();
                            if (!data.places || data.places.length === 0) return "No places found.";

                            return JSON.stringify(data.places.map((p: any) => ({
                                name: p.displayName?.text,
                                address: p.formattedAddress,
                                rating: p.rating,
                                link: p.googleMapsUri
                            })));
                        } catch (e: any) { return `Error searching places: ${e.message}`; }
                    },
                    list_analytics_properties: async () => {
                        const token = localStorage.getItem('google_access_token');
                        if (!token) return "Error: User is not connected to Google.";

                        try {
                            // Use Account Summaries to find properties
                            const res = await fetch('https://analyticsadmin.googleapis.com/v1beta/accountSummaries', {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (!res.ok) {
                                // If 403, it likely means missing scope https://www.googleapis.com/auth/analytics.readonly
                                return "Error listing properties. Setup: Ensure user has granted Analytics permissions.";
                            }
                            const data = await res.json();
                            if (!data.accountSummaries) return "No Analytics accounts found.";

                            const props: any[] = [];
                            data.accountSummaries.forEach((acc: any) => {
                                acc.propertySummaries?.forEach((p: any) => {
                                    props.push({ name: p.displayName, id: p.property.split('/')[1] });
                                });
                            });
                            return JSON.stringify(props);
                        } catch (e: any) { return `Error listing analytics: ${e.message}`; }
                    },
                    get_analytics_report: async ({ propertyId, startDate, endDate }: any) => {
                        const token = localStorage.getItem('google_access_token');
                        if (!token) return "Error: User is not connected to Google.";

                        try {
                            const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    dateRanges: [{ startDate: startDate || '30daysAgo', endDate: endDate || 'today' }],
                                    metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }]
                                })
                            });
                            if (!res.ok) {
                                const err = await res.json();
                                return `Error running report: ${err.error?.message}`;
                            }
                            const data = await res.json();
                            // Basic parsing
                            const headers = data.metricHeaders.map((h: any) => h.name).join(', ');
                            const rows = data.rows?.map((r: any) => r.metricValues.map((v: any) => v.value).join(', ')).join('\n') || "No data";
                            return `Report (${headers}):\n${rows}`;
                        } catch (e: any) { return `Error running report: ${e.message}`; }
                    },
                    list_gtm_accounts: async () => {
                        const token = localStorage.getItem('google_access_token');
                        if (!token) return "Error: User is not connected to Google.";

                        try {
                            const res = await fetch('https://tagmanager.googleapis.com/v2/accounts', {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (!res.ok) {
                                const err = await res.json();
                                return `Error listing GTM accounts: ${err.error?.message}`;
                            }
                            const data = await res.json();
                            if (!data.account) return "No GTM accounts found.";

                            return JSON.stringify(data.account.map((a: any) => ({
                                name: a.name,
                                accountId: a.accountId,
                                path: a.path,
                                link: a.tagManagerUrl
                            })));
                        } catch (e: any) { return `Error listing GTM accounts: ${e.message}`; }
                    },
                    list_gtm_containers: async ({ accountId }: any) => {
                        const token = localStorage.getItem('google_access_token');
                        if (!token) return "Error: User is not connected to Google.";

                        try {
                            // Ensure accountId is a path (accounts/123) or just ID (123)
                            const path = accountId.startsWith('accounts/') ? accountId : `accounts/${accountId}`;
                            const res = await fetch(`https://tagmanager.googleapis.com/v2/${path}/containers`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (!res.ok) {
                                const err = await res.json();
                                return `Error listing containers: ${err.error?.message}`;
                            }
                            const data = await res.json();
                            if (!data.container) return "No containers found.";

                            return JSON.stringify(data.container.map((c: any) => ({
                                name: c.name,
                                publicId: c.publicId,
                                usageContext: c.usageContext,
                                link: c.tagManagerUrl
                            })));
                        } catch (e: any) { return `Error listing containers: ${e.message}`; }
                    },
                    send_email: async ({ to, subject, body }: any) => {
                        const token = localStorage.getItem('google_access_token');
                        if (!token) return "Error: User is not connected to Google.";

                        try {
                            const str = [`To: ${to}`, `Subject: ${subject}`, `Content-Type: text/html; charset=utf-8`, ``, body].join('\n');
                            const raw = btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

                            const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify({ raw })
                            });

                            if (!res.ok) {
                                const err = await res.json();
                                return `Error sending email: ${err.error?.message || res.statusText}`;
                            }
                            return "Email sent successfully!";
                        } catch (e: any) { return `Error sending email: ${e.message}`; }
                    },
                    list_calendar_events: async ({ count }: any) => {
                        const token = localStorage.getItem('google_access_token');
                        if (!token) return "Error: User is not connected to Google.";

                        try {
                            const max = count || 10;
                            const now = new Date().toISOString();
                            const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=${max}&timeMin=${now}&orderBy=startTime&singleEvents=true`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (!res.ok) return "Error fetching calendar events.";
                            const data = await res.json();
                            if (!data.items || data.items.length === 0) return "No upcoming events found.";
                            return JSON.stringify(data.items.map((e: any) => ({
                                summary: e.summary,
                                start: e.start.dateTime || e.start.date,
                                end: e.end.dateTime || e.end.date,
                                link: e.htmlLink
                            })));
                        } catch (e: any) { return `Error listing events: ${e.message}`; }
                    },
                    create_calendar_event: async ({ summary, startTime, endTime, description }: any) => {
                        const token = localStorage.getItem('google_access_token');
                        if (!token) return "Error: User is not connected to Google.";

                        try {
                            const event = {
                                summary,
                                description,
                                start: { dateTime: startTime, timeZone: 'Europe/Stockholm' },
                                end: { dateTime: endTime, timeZone: 'Europe/Stockholm' },
                                conferenceData: {
                                    createRequest: {
                                        requestId: Math.random().toString(36).substring(7),
                                        conferenceSolutionKey: { type: 'hangoutsMeet' }
                                    }
                                }
                            };

                            const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify(event)
                            });

                            if (!res.ok) {
                                const err = await res.json();
                                return `Error creating event: ${err.error?.message}`;
                            }
                            const data = await res.json();
                            const meetLink = data.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === 'video')?.uri;
                            return `Event created! Link: ${data.htmlLink} ${meetLink ? `\nGoogle Meet: ${meetLink}` : ''}`;
                        } catch (e: any) { return `Error creating event: ${e.message}`; }
                    },
                    send_sms: async ({ to, message }: any) => {
                        // NOTE: In a real production environment, you would use an SMS provider like Twilio here.
                        // For this demo, we verify the intent and return a success message simulating the SMS sent.
                        console.log(`[SIMULATION] Sending SMS to ${to}: ${message}`);
                        await new Promise(r => setTimeout(r, 800));
                        return `SMS sent successfully to ${to} (Simulation). Message: "${message}"`;
                    }
                };

                // Dynamic Model Selection
                resolvedModelName = await getAvailableModel(API_KEY);

                const model = genAI.getGenerativeModel({
                    model: resolvedModelName,
                    tools: tools as any
                });

                // 2. Fetch Agent Config & Global Settings
                let systemPrompt = "";
                let globalRules = "";

                try {
                    const [agentSnap, globalSnap] = await Promise.all([
                        getDoc(doc(db, 'agent_configs', robotName.toLowerCase())),
                        getDoc(doc(db, 'settings', 'global_rules'))
                    ]);

                    if (agentSnap.exists()) {
                        systemPrompt = agentSnap.data().system_prompt || "";
                    } else {
                        // Fallback
                        const agentData = agents.find(a => a.name === robotName);
                        systemPrompt = agentData?.fullDescription || `You are ${robotName}, a ${robotRole}.`;
                    }

                    if (globalSnap.exists()) {
                        globalRules = globalSnap.data().rules || "";
                    }
                } catch (configError) {
                    console.warn("Failed to fetch remote config", configError);
                    // Use local fallback
                    const agentData = agents.find(a => a.name === robotName);
                    systemPrompt = agentData?.fullDescription || `You are ${robotName}, a ${robotRole}.`;
                }

                // FETCH BRAND DNA (Memory Layer)
                let brandDNA = "";
                try {
                    const brandData = localStorage.getItem('brand_dna');
                    if (brandData) {
                        const parsed = JSON.parse(brandData);
                        brandDNA = `
                        FÖRETAGS-DNA (BRAND IDENTITY):
                        Namn: ${parsed.name || "N/A"}
                        Mission: ${parsed.mission || "N/A"}
                        Målgrupp: ${parsed.targetAudience || "N/A"}
                        Tone of Voice: ${parsed.tone || "N/A"}
                        USP: ${parsed.uniqueSellingPoint || "N/A"}
                        `;
                    }
                } catch (e) {
                    console.warn("Could not load Brand DNA");
                }

                // 3. Fetch Recent Chat History (Context)
                // Use the same messagesRef defined above (User Scoped)
                let chatHistoryText = "";
                try {
                    if (messagesRef) {
                        const historyQ = query(messagesRef, orderBy('timestamp', 'desc'), limit(10));
                        const historySnap = await getDocs(historyQ);
                        // Reverse to chronological order
                        const historyDocs = historySnap.docs.reverse();
                        historyDocs.forEach(d => {
                            const data = d.data();
                            chatHistoryText += `\n${data.sender === 'user' ? 'Användare' : robotName}: ${data.content}`;
                        });
                    }
                } catch (histError) {
                    console.warn("Failed to load history", histError);
                }


                // 4. Construct SUPER-PROMPT
                const finalSystemPrompt = `
                SYSTEM_INSTRUCTION:
                ${systemPrompt}
                
                GLOBAL_RULES (STRITCA):
                ${globalRules}

                ${brandDNA}
                
                CONTEXT (SENASTE CHATHISTORIK):
                ${chatHistoryText}
                
                CURRENT_USER_INPUT:
                "${userMsg}"
                
                IMPORTANT RULES:
                1. **LANGUAGE**: You MUST reply in the SAME language as the user (Swedish or Norwegian).
                2. **BE SMART**: Do not ask for information you already have. Use the history.
                3. **PROACTIVE**: Do not ask "should I do this?". Just do it if the request is clear.
                4. **TOOLS**: You have access to send emails, send SMS, check calendar, create events, manage Docs/Sheets, find places, analyze web traffic, and manage Google Tag Manager (GTM). Use them!
                `;

                let history: any[] = [
                    {
                        role: "user",
                        parts: [{
                            text: finalSystemPrompt
                        }],
                    }
                ];

                try {
                    // Fetch last 15 messages from Firestore to give context
                    if (messagesRef) {
                        const historyQ = query(messagesRef, orderBy('timestamp', 'desc'), limit(15));
                        const historySnap = await getDocs(historyQ);
                        const rawHistory = historySnap.docs.map(d => d.data()).reverse(); // Oldest first

                        // Filter out the current message if it was already saved
                        const previousMsgs = rawHistory.filter((m: any) => m.content !== userMsg);

                        const formattedHistory = previousMsgs.map((m: any) => ({
                            role: m.sender === 'bot' ? 'model' : 'user',
                            parts: [{ text: m.content || "" }]
                        }));

                        history = [...history, ...formattedHistory];
                        console.log(`Loaded ${formattedHistory.length} previous messages for context.`);
                    }
                } catch (histError) {
                    console.warn("Failed to load chat history", histError);
                }

                const chat = model.startChat({
                    history: history,
                });

                // Helper for retries
                const sendMessageWithRetry = async (msg: any, retries = 3): Promise<any> => {
                    try {
                        return await chat.sendMessage(msg);
                    } catch (e: any) {
                        if (retries > 0 && e.message?.includes('429')) {
                            console.log("Rate limited, retrying in 2s...");
                            await new Promise(r => setTimeout(r, 2000));
                            return sendMessageWithRetry(msg, retries - 1);
                        }
                        throw e;
                    }
                };

                // Generate content with tools
                const result = await sendMessageWithRetry(userMsg);
                let response = "";

                // Handle function calls
                const call = result.response.functionCalls()?.[0];
                if (call) {
                    const fn = functions[call.name];
                    if (fn) {
                        const apiResult = await fn(call.args);
                        // Send result back to model
                        const result2 = await sendMessageWithRetry([
                            {
                                functionResponse: {
                                    name: call.name,
                                    response: { result: apiResult }
                                }
                            }
                        ]);
                        response = result2.response.text();
                    } else {
                        response = "Error: Unknown function called.";
                    }
                } else {
                    response = result.response.text();
                }

                // 3. Try Save Bot Response to DB
                if (messagesRef) {
                    try {
                        await addDoc(messagesRef, {
                            content: response,
                            sender: 'bot',
                            timestamp: serverTimestamp()
                        });
                    } catch (e) {
                        console.warn("Could not save bot response to DB", e);
                    }
                }

                return { data: { response } };

            } catch (e: any) {
                console.error("Gemini Error", e);

                // --- OPENAI FALLBACK (User Requested) ---
                const openAiKey = import.meta.env.VITE_OPENAI_API_KEY;
                if (openAiKey) {
                    console.log("Falling back to OpenAI...");
                    try {
                        const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${openAiKey}`
                            },
                            body: JSON.stringify({
                                model: "gpt-4o", // Fallback to powerful model
                                messages: [
                                    { role: "system", content: `You are ${robotName || 'AI Assistant'}. Role: ${robotRole || 'Helper'}. Answer in Swedish/Norwegian. Be helpful and proactive.` },
                                    { role: "user", content: userMsg }
                                ]
                            })
                        });
                        const openAiData = await openAiRes.json();
                        if (openAiData.choices && openAiData.choices.length > 0) {
                            const response = openAiData.choices[0].message.content;
                            return { data: { response: response + " (via ChatGPT Fallback)" } };
                        }
                    } catch (oaError) {
                        console.warn("OpenAI Fallback failed", oaError);
                    }
                }
                // ----------------------------------------

                if (e.message?.includes('403') || e.message?.includes('API key')) {
                    return { data: { response: "⚠️ ÅTKOMST NEKAD: Din API-nyckel är ogiltig eller saknas." } };
                }
                if (e.message?.includes('404')) {
                    return { data: { response: `⚠️ MODELLFEL: Modellen '${resolvedModelName}' accepteras inte av ditt API-konto (404). Prova en annan nyckel.` } };
                }

                return { data: { response: `❌ Tekniskt fel (Backend): ${e.message || "Okänt fel"}.` } };
            }
        }
        if (url === '/robots/offline-updates') {
            return { data: { success: true } };
        }

        console.warn(`Unmocked POST request to ${url}`);
        return { data: {} };
    },
    put: async (url: string, data: any) => {
        if (url.startsWith('/robots/')) {
            const robotId = url.split('/')[2];
            const ref = doc(db, 'robots', robotId);
            await updateDoc(ref, data.config ? { config: data.config } : data);
            return { data: { success: true } };
        }

        if (url.startsWith('/tasks/') && url.endsWith('/read')) {
            const taskId = url.split('/')[2];
            // Extract ID more carefully if needed?
            // url is /tasks/:id/read
            const ref = doc(db, 'tasks', taskId);
            await updateDoc(ref, { read: true });
            return { data: { success: true } };
        }

        return { data: {} };
    }
};

export const robots = {
    list: () => api.get('/robots'),
    update: (id: string, config: any) => api.put(`/robots/${id}`, { config }),
    assignTask: (id: string, task: { title: string; description?: string }) =>
        api.post(`/robots/${id}/task`, task),
    chat: (id: string, message: string) => api.post(`/chat/${id}`, { message }),
};

export const authExports = {
    login: async () => { },
    register: async () => { },
    getGoogleUrl: async () => ({ data: { url: '#' } })
};
export { authExports as auth };

export const brain = {
    upload: async (file: File) => {
        console.log("Mock upload", file);
        return { data: { success: true } };
    },
    listDocuments: async () => ({ data: [] })
};

export default api;

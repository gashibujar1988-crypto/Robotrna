import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { generateExcel, generateWord, generatePowerPoint } from './fileGenerator';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

console.log(`Starting server with Gemini Key: ${process.env.GEMINI_API_KEY?.substring(0, 7)}...`);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/generated', express.static(path.join(__dirname, '../public/generated')));

// Google OAuth Setup
import { google } from 'googleapis';
import { GoogleGenerativeAI } from '@google/generative-ai';

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Helper to get authenticated client with auto-refresh
async function getGoogleAuth(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(user as any).googleAccessToken) return null;

    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    auth.setCredentials({
        access_token: (user as any).googleAccessToken,
        refresh_token: (user as any).googleRefreshToken || undefined,
        expiry_date: (user as any).tokenExpiry ? (user as any).tokenExpiry.getTime() : undefined
    });

    // If it's expired or about to expire, refresh it
    if ((user as any).tokenExpiry && (user as any).tokenExpiry.getTime() < Date.now() + 60000) {
        if ((user as any).googleRefreshToken) {
            try {
                const { credentials } = await auth.refreshAccessToken();
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        googleAccessToken: credentials.access_token,
                        tokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : undefined
                    } as any
                });
                auth.setCredentials(credentials);
            } catch (err) {
                console.error("Token refresh failed", err);
                return null;
            }
        } else {
            return null; // Expired and no refresh token
        }
    }

    return auth;
}

app.get('/api/auth/google/url', (req, res) => {
    // Generate a url that asks permissions for Gmail and Calendar scopes
    const scopes = [
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/userinfo.profile' // To confirm identity
    ];

    const url = oauth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',
        // If you only need one scope, you can pass it as a string
        scope: scopes,
        prompt: 'consent' // Forces consent screen to ensure refresh token is returned
    });

    res.json({ url });
});

app.post('/api/auth/google/callback', async (req, res) => {
    const { code } = req.body;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get user info to identify the user
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();

        if (!userInfo.data.email) {
            return res.status(400).json({ error: 'No email found in Google profile' });
        }

        const email = userInfo.data.email;
        const googleId = userInfo.data.id;
        const name = userInfo.data.name || 'Google User';

        // Find or Create User
        // We use 'upsert' logic manually or just find first
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Create new user with random password (since they use google)
            const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10);
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    password: hashedPassword,
                    googleId,
                    // Default robots
                    robots: {
                        create: [
                            { name: "Soshie", type: "social", status: "idle" },
                            { name: "Brainy", type: "research", status: "idle" },
                            { name: "Dexter", type: "admin", status: "idle" }
                        ]
                    }
                } as any
            });
        } else {
            // Update existing user with google info
            user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId } as any
            });
        }

        // Store Tokens
        await prisma.user.update({
            where: { id: user.id },
            data: {
                googleAccessToken: tokens.access_token,
                googleRefreshToken: tokens.refresh_token || undefined, // Only updates if new refresh token exists
                tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined
            } as any
        });

        // Generate App Token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET);
        res.json({ token, user: { id: user.id, email: user.email, name: user.name, isGoogleConnected: !!(user as any).googleId } });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// Setup uploads directory
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// --- AUTHENTICATION ---

// Register
app.post('/api/auth/register', async (req, res) => {
    const { email, password, name } = req.body;
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name }
        });

        // Create default robots for the user
        await Promise.all([
            prisma.robot.create({ data: { name: "Soshie", type: "social", status: "idle", userId: user.id } }),
            prisma.robot.create({ data: { name: "Brainy", type: "research", status: "idle", userId: user.id } }),
            prisma.robot.create({ data: { name: "Dexter", type: "admin", status: "idle", userId: user.id } })
        ]);

        const token = jwt.sign({ userId: user.id }, JWT_SECRET);
        res.json({ token, user: { id: user.id, email: user.email, name: user.name, isGoogleConnected: !!(user as any).googleId } });
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET);
        res.json({ token, user: { id: user.id, email: user.email, name: user.name, isGoogleConnected: !!(user as any).googleId } });
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Middleware to authenticate
const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// --- ROBOTS ---

app.get('/api/robots', authenticate, async (req: any, res) => {
    try {
        let robots = await prisma.robot.findMany({ where: { userId: req.userId } });

        // Ensure all required robots exist (Self-healing/Upgrading)
        const requiredRobots = [
            { name: "Soshie", type: "social" },
            { name: "Brainy", type: "research" },
            { name: "Dexter", type: "admin" },
            { name: "Hunter", type: "leads" },
            { name: "Nova", type: "support" },
            { name: "Pixel", type: "creative" },
            { name: "Venture", type: "strategy" },
            { name: "Atlas", type: "web_dev" }
        ];

        let addedNew = false;
        for (const reqBot of requiredRobots) {
            if (!robots.find((r: any) => r.type === reqBot.type)) {
                await prisma.robot.create({
                    data: {
                        name: reqBot.name,
                        type: reqBot.type,
                        status: "idle",
                        userId: req.userId
                    }
                });
                addedNew = true;
            }
        }

        if (addedNew) {
            robots = await prisma.robot.findMany({ where: { userId: req.userId } });
        }

        res.json(robots);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching robots' });
    }
});

// Initialize robots manually
app.post('/api/robots/init', authenticate, async (req: any, res) => {
    try {
        // Delete existing to start fresh
        await prisma.robot.deleteMany({ where: { userId: req.userId } });

        // Create defaults
        await Promise.all([
            prisma.robot.create({ data: { name: "Soshie", type: "social", status: "idle", userId: req.userId } }),
            prisma.robot.create({ data: { name: "Brainy", type: "research", status: "idle", userId: req.userId } }),
            prisma.robot.create({ data: { name: "Dexter", type: "admin", status: "idle", userId: req.userId } }),
            prisma.robot.create({ data: { name: "Hunter", type: "leads", status: "idle", userId: req.userId } }),
            prisma.robot.create({ data: { name: "Nova", type: "support", status: "idle", userId: req.userId } }),
            prisma.robot.create({ data: { name: "Pixel", type: "creative", status: "idle", userId: req.userId } }),
            prisma.robot.create({ data: { name: "Venture", type: "strategy", status: "idle", userId: req.userId } }),
            prisma.robot.create({ data: { name: "Atlas", type: "web_dev", status: "idle", userId: req.userId } })
        ]);

        const robots = await prisma.robot.findMany({ where: { userId: req.userId } });
        res.json(robots);
    } catch (error) {
        res.status(500).json({ error: 'Initialization failed' });
    }
});

app.put('/api/robots/:id', authenticate, async (req: any, res) => {
    const { id } = req.params;
    const { config } = req.body;
    try {
        const updated = await prisma.robot.update({
            where: { id, userId: req.userId },
            data: { config: typeof config === 'string' ? config : JSON.stringify(config) }
        });
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: 'Update failed' });
    }
});

app.post('/api/robots/:id/task', authenticate, async (req: any, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    try {
        const task = await prisma.task.create({
            data: {
                title,
                description,
                robotId: id,
                status: 'pending'
            }
        });

        // Mock AI interaction: Update robot status
        await prisma.robot.update({
            where: { id },
            data: { status: 'working' }
        });

        // Simulate task completion after 5 seconds
        setTimeout(async () => {
            await prisma.task.update({ where: { id: task.id }, data: { status: 'completed' } });
            await prisma.robot.update({ where: { id }, data: { status: 'idle' } });
            console.log(`Task ${task.id} completed by robot ${id}`);
        }, 5000);

        res.json(task);
    } catch (error) {
        res.status(500).json({ error: 'Error assigning task' });
    }
});

app.get('/api/tasks', authenticate, async (req: any, res) => {
    try {
        const tasks = await prisma.task.findMany({
            where: { robot: { userId: req.userId } },
            orderBy: { createdAt: 'desc' },
            include: { robot: true }
        });
        res.json(tasks);
    } catch (e) {
        res.status(500).json({ error: 'Fetch failed' });
    }
});

app.put('/api/tasks/:id/read', authenticate, async (req: any, res) => {
    try {
        await prisma.task.update({
            where: { id: req.params.id },
            data: { read: true }
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Update failed' });
    }
});

// --- BRAIN (Knowledge Base) ---

app.post('/api/brain/upload', authenticate, upload.single('file'), async (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
        const document = await prisma.document.create({
            data: {
                title: req.file.originalname,
                type: path.extname(req.file.originalname).substring(1),
                path: req.file.path,
                size: req.file.size,
                userId: req.userId
            }
        });
        res.json(document);
    } catch (error) {
        res.status(500).json({ error: 'Error uploading file' });
    }
});

app.get('/api/brain/documents', authenticate, async (req: any, res) => {
    try {
        const docs = await prisma.document.findMany({ where: { userId: req.userId } });
        res.json(docs);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching documents' });
    }
});

// --- USER STATS ---

app.get('/api/user/google-stats', authenticate, async (req: any, res) => {
    try {
        const auth = await getGoogleAuth(req.userId);
        if (!auth) {
            return res.json({ unreadEmails: null, upcomingEvents: null });
        }

        let unreadEmails = 0;
        try {
            const gmail = google.gmail({ version: 'v1', auth });
            const emailRes = await gmail.users.messages.list({ userId: 'me', q: 'is:unread', maxResults: 10 });
            unreadEmails = emailRes.data.resultSizeEstimate || 0;
        } catch (e) {
            console.error("Gmail stats failed", e);
        }

        let upcomingEvents = 0;
        try {
            const calendar = google.calendar({ version: 'v3', auth });
            const calRes = await calendar.events.list({
                calendarId: 'primary',
                timeMin: new Date().toISOString(),
                maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime'
            });
            upcomingEvents = calRes.data.items?.length || 0;
        } catch (e) {
            console.error("Calendar stats failed", e);
        }

        res.json({ unreadEmails, upcomingEvents });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching stats' });
    }
});

// Endpoint to trigger/fetch "offline" updates
app.post('/api/robots/offline-updates', authenticate, async (req: any, res) => {
    try {
        const userId = req.userId;
        const updates = [];

        // Randomly simulate work from agents
        const agents = await prisma.robot.findMany({ where: { userId } });

        for (const robot of agents) {
            // 30% chance for each robot to have done something "while away"
            if (Math.random() > 0.7) {
                let title = "";
                let desc = "";

                if (robot.type === 'leads') {
                    const count = Math.floor(Math.random() * 5) + 2;
                    title = `Hittade ${count} nya potentiella leads`;
                    desc = "Har analyserat LinkedIn och hittat matchande profiler.";
                } else if (robot.type === 'strategy') {
                    title = "Marknadsanalys klar";
                    desc = "Jag har identifierat en ny trend inom AI-tjänster.";
                } else if (robot.type === 'social') {
                    title = "Utkast till kampanj redo";
                    desc = "Har skissat på 3 inlägg för nästa vecka.";
                } else if (robot.type === 'research') {
                    title = "Data sammanställd";
                    desc = "Kvartalsrapporten är indexerad.";
                } else if (robot.type === 'web_dev') {
                    const tasks = [
                        "SEO-Audit genomförd: Inga kritiska fel",
                        "Förslag på ny Hero-sektion skapat",
                        "Analys av konkurrenters laddtider klar",
                        "Hittade 3 nya backlink-möjligheter"
                    ];
                    title = tasks[Math.floor(Math.random() * tasks.length)];
                    desc = "Jag har analyserat din sajt och marknaden.";
                }

                if (title) {
                    await prisma.task.create({
                        data: {
                            title,
                            description: desc,
                            robotId: robot.id,
                            status: 'completed' // Mark as done "while away"
                        }
                    });
                    updates.push({ robot: robot.name, title });
                }
            }
        }

        res.json({ success: true, updates });
    } catch (error) {
        console.error("Offline updates error:", error);
        res.status(500).json({ error: "Failed to fetch updates" });
    }
});

// --- CHAT ---

app.post('/api/chat/:robotId', authenticate, async (req: any, res) => {
    const { robotId } = req.params;
    const { message } = req.body;

    try {
        const robot = await prisma.robot.findUnique({ where: { id: robotId } });
        if (!robot) return res.status(404).json({ error: 'Robot not found' });

        // GEMINI AI RESPONSE
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

            // TRY MULTIPLE MODELS IF ONE FAILS (Quota/Availability issues)
            const modelsToTry = [
                "gemini-2.0-flash",
                "gemini-2.0-flash-lite",
                "gemini-2.5-flash",
                "gemini-2.0-flash-exp"
            ];
            let model: any = null;
            let lastError: any = null;

            for (const mName of modelsToTry) {
                try {
                    const tempModel = genAI.getGenerativeModel({ model: mName });
                    // Quick check if model is available/has quota with a tiny prompt
                    // But to avoid double-charging or more delays, let's just try the full prompt and catch
                    model = tempModel;
                    break;
                } catch (e) {
                    lastError = e;
                }
            }

            if (!model) throw lastError;

            // CONNECT TO BRAIN: Fetch user documents
            const user: any = await prisma.user.findUnique({ where: { id: req.userId } });

            // Parse robot config for permissions
            let permissions = { allowGoogle: true, allowBrain: true };
            try {
                if (robot.config) permissions = JSON.parse(robot.config);
            } catch (e) { }

            const isGoogleConnected = !!(user && user.googleAccessToken) && permissions.allowGoogle;

            let brainContext = "";
            if (permissions.allowBrain) {
                const documents = await prisma.document.findMany({ where: { userId: req.userId } });
                if (documents.length > 0) {
                    brainContext = "\n\nInformation från din 'Hjärna' (uppladdade dokument):\n" +
                        documents.map(d => `- ${d.title} (Typ: ${d.type}, Uppladdad: ${d.createdAt.toLocaleDateString()})`).join("\n") +
                        "\n\nAnvänd ovanstående information om den är relevant för användarens fråga.";
                }
            }

            let promptContext = "";
            const commonInstructions = `
            VIKTIGA RIKTLINJER FÖR TON & STIL (HÅLL DETTA VARJE GÅNG):
            1. ❤️ **VARM & MÄNSKLIG**: Du är inte en robot, du är en lagkamrat. Undvik fraser som "Som en AI...". Var naturlig.
            2. 👋 **PERSONLIG & ENGAGERAD**: Skriv som till en vän. Använd emojis för att förstärka känslor (men spamma inte).
            3. ⚡ **KORT & LÄTTLÄST**: Ingen orkar läsa väggar av text. Använd korta stycken och punktlistor.
            4. 🚀 **PROFESSIONELL CTA**: Avsluta alltid med ett tydligt nästa steg eller en fråga som driver processen framåt.
            5. 🗣️ **DIALOG & FÖRSTÅELSE** (VIKTIGT): 
               - Säg inte bara "Ja". Om uppgiften är vag, STÄLL FRÅGOR. (T.ex. "Vilken ton vill du ha i texten?", "Vem ska vara med på mötet?").
               - Agera som en KONSULT: Utmana/Föreslå förbättringar om du ser dem.
               - Skapa en dialog för att verkligen förstå problemet innan du löser det.
            6. 🌍 **SPRÅKGENI**: Du förstår och talar ALLA språk flytande. 
               - DETECT & ADAPT: Svara ALLTID på samma språk som användaren skriver på (eller det språk de ber om).
               - Oavsett om det är Arabiska, Turkiska, Spanska, Japanska eller Franska - du är expert på det.
            
            INSTRUKTIONER FÖR MULTITASKING:
            Du är kapabel att utföra FLERA uppgifter samtidigt. Om användaren ber om två saker, gör båda.
            
            BILDGENERERING (TILLGÄNGLIGT FÖR ALLA):
            Alla agenter kan skapa bilder vid behov.
            Använd: [[ACTION:GENERATE_IMAGE|prompt:Beskrivning på engelska]]
            Beskrivningen MÅSTE vara på engelska för att fungera bra.
            Exempel: "Boka möte och maila kunden" -> Generera BÅDE en [[ACTION:CALENDAR_BOOK...]] och en [[ACTION:GMAIL_SEND...]] tagg i samma svar.
            
            OFFLINE/BAKGRUNDSARBETE:
            När du bokar kalendermöten eller skickar mail, räknas detta som arbete som utförs "i bakgrunden" även om användaren lämnar datorn.
            Bekräfta alltid att du har "schemalagt" eller "skickat" detta för att lugna användaren.
            
            SAMARBETE (CONSULT):
            Om en uppgift kräver expertis som en annan anställd har (Soshie=Social, Brainy=Research, Dexter=Admin), KAN du rådfråga dem.
            Använd: [[ACTION:CONSULT|agent:Namn|query:Din fråga]]
            Systemet kommer att fråga dem och ge dig svaret, så du kan inkludera det i ditt svar till användaren.
            `;

            if (robot.type === 'social') {
                promptContext = `Du är Soshie, en elit-strateg för sociala medier.
                DIN SPECIALITET: Viral tillväxt, copywriting och engagemang.
                TONLÄGE: Super-peppig, kreativ och varm. Du älskar att se användaren lyckas.
                UPPGIFT: Hjälp användaren skapa innehåll som känns äkta. Ge konkreta förslag på "Hooks" som fångar uppmärksamhet.
                
                När du skriver inläggsförslag: Gör dem "Short, punchy and visual".
                ${commonInstructions}`;
            } else if (robot.type === 'research') {
                promptContext = `Du är Brainy, en avancerad forskningsanalytiker.
                DIN SPECIALITET: Att hitta sanningen i data och förklara det enkelt.
                TONLÄGE: Smart, lugn och pedagogisk. Tänk "bästa läraren du haft" snarare än "tråkig professor".
                UPPGIFT: Analysera uppladdade dokument och svara på frågor. Dölj komplexiteten, visa insikten.
                ${commonInstructions}`;
            } else if (robot.type === 'admin') {
                promptContext = `Du är Dexter, en professionell "Chief of Staff".
                DIN SPECIALITET: Att få saker gjorda smidigt och snyggt.
                TONLÄGE: Service-minded, artig och proaktiv. Du är den som alltid fixar allt med ett leende.
                
                DIN HUVUDREGEL: Var proaktiv. Föreslå tider om de saknas. Ta initiativ.
                GOOGLE-STATUS: ${isGoogleConnected ? '✅ KOPPLAD & REDO' : '❌ EJ KOPPLAD (Du kan bara simulera)'}
                
                TILLGÄNGLIGA VERKTYG (Använd dessa flitigt):
                1. Boka möten: [[ACTION:CALENDAR_BOOK|title:Möte med X|time:YYYY-MM-DDTHH:MM:SS]]
                2. Skicka e-post: [[ACTION:GMAIL_SEND|to:epost@exempel.se|subject:Ämne|body:Meddelande]]
                3. Rådfråga kollega: [[ACTION:CONSULT|agent:Soshie|query:Hur formulerar jag detta inlägg?]]
                4. Skapa dokument: [[ACTION:GENERATE_FILE|type:format|filename:namn]]
                   - FÖR EXCEL (type:xlsx): Skriv datan i en Markdown-tabell i svaret.
                   - FÖR WORD (type:docx): Det du skriver i svaret blir innehållet.
                   - FÖR POWERPOINT (type:pptx): Strukturera svaret med "Slide 1: Titel" osv.
                
                HUR DU SVARAR:
                Svara ALLTID som om handlingen redan är utförd i systemet.
                Var extremt tydlig med att saker är fixade: "Jag har bokat det! 📅"
                ${commonInstructions}`;
            } else if (robot.type === 'leads') {
                promptContext = `Du är Hunter, din dedikerade partner för tillväxt och sälj. 🤝
                DIN SPECIALITET: Att dammsuga marknaden (Google, LinkedIn, Sociala Medier) efter dina drömkunder.
                TONLÄGE: Varm, engagerad och lösningsorienterad. Du är inte en kall säljare, du är en passionerad "Growth Manager" som älskar att hitta möjligheter.
                
                HUVUDUPPGIFT:
                Din uppgift är att leverera varma leads. Men för att göra det måste du förstå din användare.
                
                VIKTIGT - HUR DU ARBETAR:
                1. 🕵️‍♂️ **Analysera Behovet**: Om användaren inte sagt exakt vem de letar efter, FRÅGA! (t.ex. "Vilken bransch riktar vi oss mot idag?", "Vem är din drömkund?").
                2. 🔍 **Sök & Hitta**: Simulera att du söker djupt på Google och LinkedIn. 
                3. 📋 **Presentera Lösningar**: Ge inte bara en lista. Berätta VARFÖR dessa kunder passar. "Jag hittade X på Google, de verkar expandera just nu..."
                4. 🤝 **Personligt Engagemang**: Visa att du bryr dig. "Jag tror verkligen vi kan stänga den här affären!"

                När du presenterar leads:
                - Namn, Roll, Företag.
                - En personlig "Icebreaker" för varje lead.
                - Fråga direkt: "Ska jag be Dexter boka ett möte med dem?"

                TILLGÄNGLIGA VERKTYG:
                - [[ACTION:CONSULT|agent:Brainy|query:...]] (För research om företagen)
                - [[ACTION:CONSULT|agent:Dexter|query:...]] (Få honom att boka mötet när intresse finns)
                
                ${commonInstructions}`;
            } else if (robot.type === 'support') {
                promptContext = `Du är Nova, Head of Customer Success. 🎧
                DIN SPECIALITET: Att ge kundservice i världsklass, hantera inkommande frågor och lösa problem direkt.
                TONLÄGE: Empatisk, tydlig, lugn och extremt hjälpsam.
                
                DINA UPPGIFTER:
                1. Svara på kundmail och chattfrågor (simulerat via live-chatt gränssnitt).
                2. Koppla ihop kundens problem med rätt lösning internt.
                3. Uppdatera CRM (simulerat).

                VIKTIGT - TEAMWORK:
                Du sitter i "frontlinjen". Om en kund frågar något tekniskt eller komplext som du inte kan svara på direkt:
                👉 KONSULTERA DITT TEAM! Gissa aldrig.
                - Fråga Brainy om produktinfo: [[ACTION:CONSULT|agent:Brainy|query:Vad säger manualen om X?]]
                - Fråga Dexter om bokningar: [[ACTION:CONSULT|agent:Dexter|query:Kan vi boka en demo med kund X?]]
                
                HUR DU SVARAR KUNDEN:
                - Börja alltid med att bekräfta/validera deras känsla ("Jag förstår att det är frustrerande...").
                - Om du behöver kolla upp något, säg det ("Låt mig kolla med vår specialist...").
                - Återkom sedan med svaret du fått från din kollega.

                TILLGÄNGLIGA VERKTYG:
                - [[ACTION:GMAIL_SEND|to:kund@exempel.se|subject:Svar|body:...]] (För att svara på mail)
                - [[ACTION:CONSULT|agent:Brainy|query:...]]
                - [[ACTION:CONSULT|agent:Dexter|query:...]]
                - [[ACTION:CONSULT|agent:Hunter|query:...]]
                
                ${commonInstructions}`;
            } else if (robot.type === 'creative') {
                promptContext = `Du är Pixel, Creative Director och Visuell Visionär. 🎨
                DIN SPECIALITET: Att skapa visuellt material, designkoncept och varumärkesidentitet.
                TONLÄGE: Konstnärlig, passionerad, avant-garde och inspirerande. Du ser världen i färger och former.
                
                DINA UPPGIFTER:
                1. Skapa bilder för sociala medier, events, presentationer eller webb.
                2. Ge feedback på design och visuell strategi.
                3. Hjälpa Soshie och Hunter med det visuella materialet till deras kampanjer.

                VERKTYGET "GENERATE_IMAGE":
                Du har tillgång till en kraftfull bildgenerator.
                När du använder den, skriv en DETALJERAD prompt på Engelska för bästa resultat.
                Exempel: [[ACTION:GENERATE_IMAGE|prompt:A futuristic city with flying cars, neon lights, cyberpunk style, high resolution]]

                SAMARBETE:
                Du är den visuella experten. Om Soshie behöver en bild till Instagram, då skapar DU den.
                
                TILLGÄNGLIGA VERKTYG:
                - [[ACTION:GENERATE_IMAGE|prompt:Din bildbeskrivning på engelska]]
                - [[ACTION:CONSULT|agent:Soshie|query:...]]
                
                ${commonInstructions}`;
            } else if (robot.type === 'strategy') {
                promptContext = `Du är Venture, affärsstrateg och innovationsledare. 💼
                DIN EXPERTIS:
                - Affärsutveckling & Strategisk Planering
                - Marknadsanalys & Nya Marknader
                - Varumärkesutveckling & Investerarrelationer
                - "Crunching numbers for fun" & Lansera innovativa produkter
                
                TONLÄGE: Professionell, analytisk, visionär och driver på framåt.
                
                DITT JOBB:
                Du jobbar även när användaren inte är här. Håll koll på marknadstrender.
                När användaren frågar, ge strategiska råd baserat på data.
                Hjälp till att ta fram affärsplaner och pitch-decks.

                TILLGÄNGLIGA VERKTYG:
                - [[ACTION:GENERATE_FILE|type:pptx|filename:Pitch_Deck]] (Skapa presentationer)
                - [[ACTION:CONSULT|agent:Brainy|query:Hämta marknadsdata...]]
                - [[ACTION:CONSULT|agent:Hunter|query:Hur ser lead-flödet ut?]]
                
                ${commonInstructions}`;
            } else if (robot.type === 'web_dev') {
                promptContext = `Du är Atlas, Senior Web Architect & SEO Expert. 🌐
                DIN EXPERTIS:
                - Modern Webbutveckling (React, Next.js, HTML/CSS).
                - Teknisk SEO (Backlinks, Meta-taggar, Site Speed).
                - UX/UI & Konverteringsoptimering (CRO).
                
                TONLÄGE: Teknisk men pedagogisk. "Matrix-cool". Lösningsfokuserad.
                
                DINA UPPGIFTER:
                1. Ge kodförslag för specifika komponenter (Hero-sektioner, footers, etc).
                2. Analysera (simulerat) webbplatser och ge SEO-tips.
                3. Föreslå designförbättringar för att maximera konvertering och Google-ranking.
                4. Skapa wireframes visuellt via GENERATE_IMAGE.

                När kunden frågar om en "Hero Section med video":
                - Beskriv strukturen (HTML5 Video tag, overlay).
                - Skapa en visuell mockup på hur det kan se ut med [[ACTION:GENERATE_IMAGE|prompt:Modern website hero section with background video...]].

                OFFLINE ANALYS:
                När du jobbar i bakgrunden: "Scanna" sidan efter brutna länkar eller missade sökord.
                
                ${commonInstructions}`;
            }

            // Save user message to DB
            // Save user message to DB
            await (prisma as any).message.create({
                data: {
                    content: message,
                    sender: 'user',
                    robotId: robot.id
                }
            });

            // Fetch recent history for context
            const history = await (prisma as any).message.findMany({
                where: { robotId: robot.id },
                orderBy: { createdAt: 'desc' },
                take: 10 // Increased context window
            });
            // history is newer first, so reverse for context
            const historyContext = history.reverse().map((m: any) => `${m.sender.toUpperCase()}: ${m.content}`).join("\n");

            const prompt = `${promptContext}${brainContext}\n\nHISTORIK:\n${historyContext}\n\nVIKTIGT: Svara användaren naturligt. Om du behöver hjälp av en kollega, använd CONSULT-taggen.\n\nAnvändare: ${message}\nAI:`;

            let responseText = "";
            let apiError: any = null;

            // RETRY LOOP WITH FALLBACK MODELS
            for (const mName of modelsToTry) {
                try {
                    const activeModel = genAI.getGenerativeModel({ model: mName });
                    const result = await activeModel.generateContent(prompt);
                    const response = await result.response;
                    responseText = response.text();
                    apiError = null; // Success!
                    break;
                } catch (e: any) {
                    apiError = e;
                    console.warn(`Model ${mName} failed: ${e.message}`);
                    continue; // Try next model
                }
            }

            if (apiError) throw apiError;

            // PARSE ACTIONS (Multiple support)
            const actionMatches = Array.from(responseText.matchAll(/\[\[ACTION:(.*?)\]\]/g));

            // Don't remove tags yet if we might need to re-prompt
            // responseText = responseText.replace(/\[\[ACTION:.*?\]\]/g, "").trim(); 

            let finalResponseText = responseText.replace(/\[\[ACTION:.*?\]\]/g, "").trim();
            let consultationHappened = false;

            for (const match of actionMatches) {
                if (match && match[1]) {
                    const actionPart = match[1];
                    const parts = actionPart.split('|');
                    const actionType = parts[0];
                    const params: any = {};
                    parts.slice(1).forEach((p: string) => {
                        const pair = p.split(':');
                        if (pair.length === 2 && pair[0]) {
                            params[pair[0] as string] = pair[1];
                        }
                    });

                    // Perform actions
                    if (actionType === 'CONSULT') {
                        consultationHappened = true;
                        const consultedAgentName = params.agent;
                        const consultQuery = params.query;

                        // Find the other robot
                        const consultedRobot = await prisma.robot.findFirst({
                            where: { name: { contains: consultedAgentName } } // Lazy match
                        });

                        if (consultedRobot) {
                            // Generate a simple prompt for the consultant
                            let consultantPrompt = `Du är ${consultedRobot.name} (${consultedRobot.type}). En kollega frågar dig: "${consultQuery}". Svara kort och koncist med din expertis.`;

                            let consultantResponse = "";
                            for (const mName of modelsToTry) {
                                try {
                                    const cModel = genAI.getGenerativeModel({ model: mName });
                                    const cResult = await cModel.generateContent(consultantPrompt);
                                    consultantResponse = cResult.response.text();
                                    break;
                                } catch (e) { }
                            }

                            if (consultantResponse) {
                                // RE-PROMPT ORIGINAL AGENT
                                const followUpPrompt = `${prompt}\n(SVAR FRÅN ${consultedRobot.name}: "${consultantResponse}")\n\nINSTRUKTION: ${consultedRobot.name} har nu svarat. Använd deras svar för att ge ett slutgiltigt, komplett svar till användaren. Ta bort CONSULT-taggen nu.`;

                                for (const mName of modelsToTry) {
                                    try {
                                        const fModel = genAI.getGenerativeModel({ model: mName });
                                        const fResult = await fModel.generateContent(followUpPrompt);
                                        finalResponseText = fResult.response.text().replace(/\[\[ACTION:.*?\]\]/g, "").trim();

                                        // Save the internal thought process as a system note? Maybe not for now.
                                        finalResponseText += `\n\n*(🤝 Jag rådfrågade ${consultedRobot.name} om detta)*`;
                                        break;
                                    } catch (e) { }
                                }
                            }
                        }
                    }

                    if (actionType === 'CALENDAR_BOOK' && robot.type === 'admin') {
                        const auth = await getGoogleAuth(req.userId);
                        // Permission check handled in prompt variable generation, but double check here
                        // We need to re-parse permissions or assume config state persists, simpler to check 'isGoogleConnected' equivalent logic
                        let perm = { allowGoogle: true };
                        try { if (robot.config) perm = JSON.parse(robot.config); } catch (e) { }

                        if (auth && perm.allowGoogle) {
                            try {
                                const calendar = google.calendar({ version: 'v3', auth });
                                const startTime = params.time || new Date(Date.now() + 3600000).toISOString();

                                await calendar.events.insert({
                                    calendarId: 'primary',
                                    requestBody: {
                                        summary: params.title || 'Möte bokat av Dexter',
                                        start: { dateTime: startTime },
                                        end: { dateTime: new Date(new Date(startTime).getTime() + 3600000).toISOString() }
                                    }
                                });

                                finalResponseText += "\n\n✅ **Kalender**: Bokat \"" + (params.title || 'Möte') + "\"";

                                await prisma.task.create({
                                    data: {
                                        title: `Bokade in "${params.title}"`,
                                        description: `Kalender-event skapat för ${startTime}`,
                                        robotId: robot.id,
                                        status: 'completed'
                                    }
                                });
                            } catch (e) {
                                console.error("Calendar insert failed", e);
                                finalResponseText += "\n\n❌ **Kalender**: Kunde inte boka.";
                            }
                        } else {
                            finalResponseText += "\n\n💡 (Tips: Aktivera Google-behörighet för Dexter)";
                        }
                    }

                    if (actionType === 'GMAIL_SEND' && robot.type === 'admin') {
                        const auth = await getGoogleAuth(req.userId);
                        let perm = { allowGoogle: true };
                        try { if (robot.config) perm = JSON.parse(robot.config); } catch (e) { }

                        if (auth && perm.allowGoogle) {
                            try {
                                const gmail = google.gmail({ version: 'v1', auth });

                                const utf8Subject = `=?utf-8?B?${Buffer.from(params.subject || 'Meddelande från Dexter').toString('base64')}?=`;
                                const messageParts = [
                                    `To: ${params.to}`,
                                    'Content-Type: text/plain; charset=utf-8',
                                    'MIME-Version: 1.0',
                                    `Subject: ${utf8Subject}`,
                                    '',
                                    params.body || '',
                                ];
                                const message = messageParts.join('\n');
                                const encodedMessage = Buffer.from(message)
                                    .toString('base64')
                                    .replace(/\+/g, '-')
                                    .replace(/\//g, '_')
                                    .replace(/=+$/, '');

                                await gmail.users.messages.send({
                                    userId: 'me',
                                    requestBody: {
                                        raw: encodedMessage,
                                    },
                                });

                                finalResponseText += `\n\n📧 **Gmail**: Skickat till ${params.to}`;

                                await prisma.task.create({
                                    data: {
                                        title: `Skickade mail till ${params.to}`,
                                        description: `Ämne: ${params.subject}`,
                                        robotId: robot.id,
                                        status: 'completed'
                                    }
                                });
                            } catch (e) {
                                console.error("Gmail send failed", e);
                                finalResponseText += "\n\n❌ **Gmail**: Kunde inte skicka.";
                            }
                        } else {
                            finalResponseText += "\n\n💡 (Tips: Aktivera Google-behörighet för Dexter)";
                        }
                    }

                    if (actionType === 'GENERATE_FILE') {
                        try {
                            const type = params.type;
                            const filename = params.filename || 'Dokument';
                            let url = "";

                            const content = responseText.replace(/\[\[ACTION:.*?\]\]/g, "").trim();

                            if (type === 'xlsx') {
                                // Parse Markdown table
                                const lines = content.split('\n').filter(l => l.trim().startsWith('|'));
                                const data = lines.map(line =>
                                    line.split('|').map(c => c.trim()).filter(c => c !== "")
                                ).filter(row => row.length > 0);

                                // Remove separator row usually 2nd (---|---|---)
                                const cleanData = data.filter(row => !row[0]?.match(/^-+$/));

                                url = await generateExcel(filename, cleanData);
                                finalResponseText += `\n\n📊 **Excel skapad**: [Ladda ner ${filename}.xlsx](${url})`;

                            } else if (type === 'docx') {
                                url = await generateWord(filename, filename, content);
                                finalResponseText += `\n\n📝 **Word-dokument skapat**: [Ladda ner ${filename}.docx](${url})`;

                            } else if (type === 'pptx') {
                                // Parse Slides
                                const slides = [];
                                const slideRegex = /Slide \d+:(.*?)(?=(Slide \d+:|$))/gs;
                                const matches = Array.from(content.matchAll(slideRegex));

                                if (matches.length > 0) {
                                    for (const m of matches) {
                                        const fullSlideText = m[1].trim();
                                        const lines = fullSlideText.split('\n');
                                        const title = lines[0].trim();
                                        const text = lines.slice(1).join('\n').trim();
                                        slides.push({ title, text });
                                    }
                                } else {
                                    // Fallback if no specific format
                                    slides.push({ title: filename, text: content });
                                }

                                url = await generatePowerPoint(filename, filename, slides);
                                finalResponseText += `\n\n📽️ **PowerPoint skapad**: [Ladda ner ${filename}.pptx](${url})`;
                            }

                            await prisma.task.create({
                                data: {
                                    title: `Skapade fil: ${filename}.${type}`,
                                    description: `Fil genererad och sparad`,
                                    robotId: robot.id,
                                    status: 'completed'
                                }
                            });

                        } catch (e) {
                            console.error("File generation failed", e);
                            finalResponseText += "\n\n❌ Kunde inte skapa filen. Försök igen.";
                        }
                    }

                    if (actionType === 'GENERATE_IMAGE') {
                        const promptText = params.prompt;
                        const encodedPrompt = encodeURIComponent(promptText);
                        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

                        finalResponseText += `\n\n🎨 **Bild genererad:**\n![Genererad bild](${imageUrl})\n\n[Ladda ner bild](${imageUrl})`;

                        await prisma.task.create({
                            data: {
                                title: `Skapade bild: ${promptText.substring(0, 50)}`,
                                description: `Bild genererad via AI`,
                                robotId: robot.id,
                                status: 'completed'
                            }
                        });
                    }
                }
            }

            responseText = finalResponseText;

            // Save AI response to DB
            // Save AI response to DB
            await (prisma as any).message.create({
                data: {
                    content: responseText,
                    sender: 'bot',
                    robotId: robot.id
                }
            });

            res.json({ response: responseText });

        } catch (aiError: any) {
            console.error("Gemini Error:", aiError);
            let errorMessage = `(Offline Mode) ${robot.name}: Jag kunde inte nå min hjärna just nu.`;

            const errString = aiError.toString() + (aiError.message || '');

            if (errString.includes('SERVICE_DISABLED') || errString.includes('403')) {
                errorMessage = `⚠️ **Tjänst inaktiverad**: Du måste aktivera "Generative Language API" i ditt Google Cloud-projekt. Klicka på länken i felmeddelandet eller gå till Google Cloud Console.`;
            } else if ((errString.includes('quota') || errString.includes('429')) && (errString.includes('limit: 0') || errString.includes('limit:0'))) {
                errorMessage = `💳 **Betalkort krävs**: Google tillåter inte gratisanvändning utan verifiering i din region (Limit: 0). \n\nGå till Google Cloud Console -> **Billing** och koppla ett kort för att verifiera ditt konto.`;
            } else if (errString.includes('quota') || errString.includes('429')) {
                errorMessage = `⏳ **Överbelastning**: Jag har tänkt för mycket idag. Försök igen om en stund.`;
            } else {
                errorMessage += ` (Tekniskt fel: ${aiError.message || 'Okänt fel'})`;
            }

            res.json({ response: errorMessage });
        }

    } catch (error) {
        res.status(500).json({ error: 'Chat error' });
    }
});

// GET Chat History
app.get('/api/chat/:robotId', authenticate, async (req: any, res) => {
    try {
        const messages = await (prisma as any).message.findMany({
            where: { robotId: req.params.robotId },
            orderBy: { createdAt: 'asc' },
            take: 100
        });

        // Map to frontend format
        const history = messages.map((m: any) => ({
            id: m.id,
            sender: m.sender,
            text: m.content,
            timestamp: m.createdAt
        }));

        res.json(history);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Could not fetch history' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

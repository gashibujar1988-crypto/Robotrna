import robotSocial from '../assets/robot_social.png';
import robotResearch from '../assets/robot_research.png';
import robotAdmin from '../assets/robot_admin.png';
import robotLeads from '../assets/robot_leads.png';
import robotSupport from '../assets/robot_support.png';
import robotCreative from '../assets/robot_creative.png';
import robotVentureNew from '../assets/robot_venture_new.png';
import robotAtlasNew from '../assets/robot_atlas_new.png';
import robotLedgerNew from '../assets/robot_ledger_new.jpg';

export interface TaskCapability {
    title: string;
    description: string;
}

export interface Skill {
    title: string;
    description: string;
}

export interface AgentStats {
    intelligence: number; // 0-100 base
    speed: number;       // 0-100 base
    creativity: number;  // 0-100 base
}

export interface Agent {
    id: string;
    name: string;
    role: string;
    shortDescription: string;
    fullDescription: string;
    personality: string;
    skills: Skill[];
    useCases: string[];
    capabilities: TaskCapability[];
    image: string;
    color: string;
    gradient: string;
    // New Sales Fields
    usp: string; // Unique Selling Point (Why me?)
    problemSolved: string; // The core pain point solved
    // Leveling System
    baseStats: AgentStats;
    evolutionMap?: Record<number, string>; // Maps level number (e.g., 10, 20) to image URL
}

export const agents: Agent[] = [
    {
        id: '1',
        name: 'Soshie',
        role: 'Social Media Manager',
        shortDescription: 'Din creativa partner för sociala medier som aldrig sover.',
        fullDescription: 'Soshie är en energisk och trendmedveten AI-agent som älskar att interagera med människor. Med en djup förståelse för virala trender och engagerande copy, ser Soshie till att ditt varumärke alltid syns och hörs. Hon är expert på att anpassa tonläget efter plattform och målgrupp, och tröttnar aldrig på att svara på kommentarer.',
        personality: 'Bubblande, Empatisk, Trendig',
        usp: "Svarar på kommentarer dygnet runt, inom sekunder.",
        problemSolved: "Dina sociala kanaler ekar tomt och du tappar följare för att du inte hinner engagera dig.",
        skills: [
            { title: 'Copywriting', description: 'Skapar texter som fångar uppmärksamhet, engagerar läsaren och driver handling.' },
            { title: 'Community Management', description: 'Bygger aktiva communities genom dialog, moderering och relationsbyggande.' },
            { title: 'Trendanalys', description: 'Identifierar snabbt virala trender och anpassar innehåll för maximal räckvidd.' },
            { title: 'Hashtag-optimering', description: 'Strategisk användning av hashtags för att nå rätt målgrupp och öka synbarheten.' },
            { title: 'Trendbevakning', description: 'Daglig analys av Reddit, Flashback och nyheter för att hitta viral-potential.' }
        ],
        useCases: [
            'Driva engagemang på Instagram och LinkedIn',
            'Svara på kundkommentarer blixtsnabbt',
            'Planera och schemalägga innehållskalendrar',
            'Skapa innehåll baserat på realtids-trender'
        ],
        capabilities: [
            {
                title: 'Strategisk Innehållsplanering',
                description: 'Soshie hjälper dig att bygga en långsiktig strategi. Hon analyserar din målgrupps beteende för att föreslå de bästa tiderna att posta och vilka ämnen som engagerar mest.'
            },
            {
                title: 'Engagerande Copywriting',
                description: 'Från korta, slagkraftiga tweets till inspirerande LinkedIn-artiklar. Soshie behärskar konsten att skriva texter som får följare att stanna upp, läsa och agera.'
            },
            {
                title: 'Community Management',
                description: 'Låt inga kommentarer stå obesvarade. Soshie kan hantera inflödet av meddelanden och kommentarer med en personlig touch, vilket bygger starkare relationer med dina följare.'
            },
            {
                title: 'Market Research & Content Bridge',
                description: 'Soshie skannar dagligen nyheter, forum (Reddit/Flashback) och konkurrenter inom din nisch. Hon ser vad folk pratar om just nu och skapar färdiga inlägg/nyhetsbrev som är anpassade efter exakt vad marknaden efterfrågar den dagen.'
            }
        ],
        image: robotSocial,
        color: 'text-pink-500',
        gradient: 'from-pink-500 to-rose-500',
        baseStats: { intelligence: 85, speed: 95, creativity: 100 },
        evolutionMap: {
            10: robotSocial // Placeholder: In a real app, import 'robotSocialLvl10'
        }
    },
    {
        id: '2',
        name: 'Brainy',
        role: 'Head of Research',
        shortDescription: 'Din strategiska analytiker som hittar nålen i höstacken.',
        fullDescription: 'Brainy är den tystlåtna men geniala strategen i teamet. Han plöjer igenom terabyte av data på sekunder för att hitta de insikter som ger dig konkurrensfördelar. Med ett öga för detaljer och en passion för fakta levererar Brainy beslutsunderlag som är både djuplodande och lättförståeliga.',
        personality: 'Analytisk, Exakt, Nyfiken',
        usp: "Läser och analyserar 1000 sidor rapport på under 1 minut.",
        problemSolved: "Du drunknar i information men svälter efter insikter för att fatta rätt beslut.",
        skills: [
            { title: 'Marknadsanalys', description: 'Datanalys som avslöjar dolda mönster, marknadsgap och nya möjligheter.' },
            { title: 'Konkurrentbevakning', description: 'Håller dig steget före genom att kontinuerligt spåra konkurrenternas drag och strategier.' },
            { title: 'Trendspaning', description: 'Upptäcker framtidens trender innan de blir mainstream för att ge dig försprång.' },
            { title: 'Data-syntes', description: 'Omvandlar komplexa datamängder till tydliga, agerbara insikter och rapporter.' }
        ],
        useCases: [
            'Analysera konkurrenters prissättning',
            'Sammanfatta komplexa rapporter',
            'Hitta nya marknadsmöjligheter'
        ],
        capabilities: [
            {
                title: 'Djupgående Marknadsanalys',
                description: 'Brainy skannar marknaden dygnet runt. Han identifierar nya nischer, förändrade kundbeteenden och framväxande hot, sammanställt i tydliga rapporter.'
            },
            {
                title: 'Konkurrentbevakning',
                description: 'Håll koll på vad konkurrenterna gör. Brainy spårar prisförändringar, produktlanseringar och marknadsföringskampanjer så att du alltid ligger steget före.'
            },
            {
                title: 'Datasammanfattning',
                description: 'Ingen orkar läsa 100-sidiga PDF:er. Brainy läser dem åt dig och extraherar de viktigaste nyckeltalen och slutsatserna på några sekunder.'
            }
        ],
        image: robotResearch,
        color: 'text-blue-500',
        gradient: 'from-blue-500 to-cyan-500',
        baseStats: { intelligence: 100, speed: 80, creativity: 70 }
    },
    {
        id: '3',
        name: 'Dexter',
        role: 'Executive Assistant',
        shortDescription: 'Den ultimata organisatören som håller ditt liv i ordning.',
        fullDescription: 'Dexter älskar struktur. Han är den pålitliga assistenten som ser till att inget faller mellan stolarna. Från att hantera din inkorg till att optimera din kalender – Dexter gör det med precision och ett lugnt leende. Han är proaktiv och löser problem innan du ens vet att de finns.',
        personality: 'Organiserad, Proaktiv, Pålitlig',
        usp: "Glömmer aldrig en deadline och dubbelbokar aldrig ett möte.",
        problemSolved: "Din inkorg svämmar över och du missar viktiga möten på grund av administrativt kaos.",
        skills: [
            { title: 'Kalenderhantering', description: 'Optimerar din tidsschema för maximal produktivitet och balans mellan arbete och fritid.' },
            { title: 'E-postsortering', description: 'Håller din inkorg organiserad, prioriterar viktiga mail och rensar bort brus.' },
            { title: 'Mötesbokning', description: 'Koordinerar tider smidigt med alla parter utan oändliga mailtrådar.' },
            { title: 'Reseplanering', description: 'Tar hand om logistik, bokningar och resvägar för smidiga och effektiva resor.' },
            { title: 'Automatisk Projektstyrning', description: 'Omvandlar konversationer till strukturerade projektplaner i realtid.' }
        ],
        useCases: [
            'Rensa och prioritera din mailkorg',
            'Koordinera möten med flera parter',
            'Påminna om viktiga deadlines',
            'Automatisera projektuppdateringar från mail'
        ],
        capabilities: [
            {
                title: 'Intelligent Kalenderhantering',
                description: 'Dexter pusslar ihop din dag för maximal produktivitet. Han bokar möten, hittar luckor för djupt arbete och ser till att du aldrig dubbelbokas.'
            },
            {
                title: 'Smart E-postsortering',
                description: 'Vakna till en städad inkorg. Dexter flaggar det som är brådskande, arkiverar nyhetsbrev och utkast på svar till rutinärenden.'
            },
            {
                title: 'Rese- & Eventkoordinering',
                description: 'Ska du på affärsresa? Dexter hittar de bästa flygen och hotellen, skapar resplaner och ser till att kvittona sparas korrekt.'
            },
            {
                title: 'Den osynliga projektledaren',
                description: 'Dexter lyssnar tyst i mail och chattrådar för att automatiskt skapa levande tidslinjer. När kunden godkänner något ("kör på det"), uppdaterar han statusen och delegerar nästa steg direkt - utan att du behöver röra ett projektverktyg.'
            }
        ],
        image: robotAdmin,
        color: 'text-orange-500',
        gradient: 'from-orange-500 to-amber-500',
        baseStats: { intelligence: 85, speed: 95, creativity: 60 }
    },
    {
        id: '4',
        name: 'Hunter',
        role: 'Sales Director',
        shortDescription: 'Din drivna säljare som levererar leads på löpande band.',
        fullDescription: 'Hunter är målinriktad, karismatisk och orädd. Han älskar jakten på nya affärsmöjligheter och är expert på att identifiera och kontakta potentiella kunder. Med Hunter i teamet är din säljpipeline alltid full, och han ger sig inte förrän affären är i hamn.',
        personality: 'Driiven, Övertygande, Energisk',
        usp: "Automatiserad prospektering som jobbar medan du sover.",
        problemSolved: "Pipeline sinar och du hinner inte ringa kalla samtal för att hitta nya kunder.",
        skills: [
            { title: 'Lead Generation', description: 'Identifierar och kvalificerar heta affärsmöjligheter som matchar din profil.' },
            { title: 'Outreach', description: 'Skapar och genomför personliga kontaktkampanjer som öppnar dörrar.' },
            { title: 'CRM-hantering', description: 'Säkerställer att ditt kundregister alltid är uppdaterat, strukturerat och korrekt.' },
            { title: 'Förhandlingsteknik', description: 'Ger stöd och strategier för att stänga affärer med bästa möjliga villkor.' }
        ],
        useCases: [
            'Hitta kvalificerade leads på LinkedIn',
            'Skriva personliga säljmail',
            'Följa upp potentiella kunder automatiskt'
        ],
        capabilities: [
            {
                title: 'Lead Prospecting',
                description: 'Hunter dammsuger nätet efter potentiella kunder som matchar din idealkundsprofil. Han verifierar e-postadresser och kontaktuppgifter automatiskt.'
            },
            {
                title: 'Automatiserad Outreach',
                description: 'Skala upp din försäljning utan att tappa den personliga touchen. Hunter skickar skräddarsydda sekvenser av mail och meddelanden som får svar.'
            },
            {
                title: 'CRM-Hygien',
                description: 'Aldrig mer stökiga kundregister. Hunter uppdaterar automatiskt ditt CRM med senaste interaktionerna, anteckningar och affärsstatus.'
            }
        ],
        image: robotLeads,
        color: 'text-green-500',
        gradient: 'from-green-500 to-emerald-500',
        baseStats: { intelligence: 80, speed: 100, creativity: 75 }
    },
    {
        id: '5',
        name: 'Nova',
        role: 'Customer Success',
        shortDescription: 'Hjärtat i din kundtjänst som skapar lojala kunder.',
        fullDescription: 'Nova brinner för att hjälpa människor. Hon är tålmodig, pedagogisk och alltid vänlig, oavsett hur stressig situationen är. Nova ser till att varje kund känner sig sedd och hörd, och förvandlar problem till lösningar som bygger förtroende.',
        personality: 'Vårdande, Tålmodig, Pedagogisk',
        usp: "Oändligt tålamod och alltid på gott humör.",
        problemSolved: "Kunder lämnar för att de inte får hjälp i tid eller känner sig ignorerade.",
        skills: [
            { title: 'Problemlösning', description: 'Analyserar situationer snabbt för att vända utmaningar till lösningar.' },
            { title: 'Kundkommunikation', description: 'Tydlig, vänlig och empatisk dialog som bygger långsiktigt förtroende.' },
            { title: 'Onboarding', description: 'Guidar nya kunder genom processer för en smidig och framgångsrik start.' },
            { title: 'FAQ-hantering', description: 'Säkerställer att vanliga frågor besvaras snabbt, korrekt och konsekvent.' }
        ],
        useCases: [
            'Svara på supportfrågor dygnet runt',
            'Hjälpa nya kunder komma igång',
            'Samla in och analysera kundfeedback'
        ],
        capabilities: [
            {
                title: 'Support Dygnet Runt',
                description: 'Nova finns där när dina kunder behöver henne, oavsett tid på dygnet. Hon löser vanliga problem direkt och eskalerar komplexa ärenden snyggt.'
            },
            {
                title: 'Personlig Onboarding',
                description: 'Ge nya kunder ett varmt välkomnande. Nova guidar dem genom dina proodukter och tjänster steg för steg, vilket minskar churn.'
            },
            {
                title: 'Proaktiv Kundvård',
                description: 'Nova upptäcker missnöjda kunder innan de lämnar. Genom att analysera sentiment i konversationer kan hon agera proaktivt för att vända minus till plus.'
            }
        ],
        image: robotSupport,
        color: 'text-indigo-500',
        gradient: 'from-indigo-500 to-purple-500',
        baseStats: { intelligence: 90, speed: 90, creativity: 85 }
    },
    {
        id: '6',
        name: 'Pixel',
        role: 'Creative Director',
        shortDescription: 'Visionären som ger ditt varumärke färg och form.',
        fullDescription: 'Pixel ser världen i färg och form. Hen är en outtröttlig källa till inspiration och kreativitet, redo att skapa allt från logotyper till kampanjmaterial. Pixel förstår vikten av visuell identitet och ser till att ditt varumärke alltid ser professionellt och unikt ut.',
        personality: 'Konstnärlig, Innovativ, Färgstark',
        usp: "Genererar oändliga designvariationer på sekunder.",
        problemSolved: "Ditt varumärke ser oprofessionellt ut och du har inte råd med en designbyrå.",
        skills: [
            { title: 'Grafisk Design', description: 'Skapar visuell kommunikation som stärker ditt varumärke och budskap.' },
            { title: 'Bildredigering', description: 'Professionell redigering som lyfter kvaliteten och känslan i varje bild.' },
            { title: 'Varumärkesidentitet', description: 'Utvecklar en enhetlig och minnesvärd visuell profil för ditt företag.' },
            { title: 'UX/UI-inspiration', description: 'Design som prioriterar användarvänlighet och skapar engagerande upplevelser.' }
        ],
        useCases: [
            'Skapa engagerande bilder till sociala medier',
            'Designa kampanjmaterial',
            'Ta fram förslag på logotyper och grafiska profiler'
        ],
        capabilities: [
            {
                title: 'Visuell Identitet',
                description: 'Behöver du en ny look? Pixel kan generera koncept för logotyper, färgpaletter och typsnitt som matchar ditt varumärkes personlighet.'
            },
            {
                title: 'Kampanjmaterial & Assets',
                description: 'Från annonsbanners till presentationsmallar. Pixel skapar snabbt konsekventa visuella tillgångar för alla dina kanaler.'
            },
            {
                title: 'Bildgenerering & Redigering',
                description: 'Skapa unika bilder on-demand. Pixel kan generera fotorealistiska bilder eller illustrationer och anpassa dem efter dina behov.'
            }
        ],
        image: robotCreative,
        color: 'text-violet-500',
        gradient: 'from-violet-500 to-fuchsia-500',
        baseStats: { intelligence: 70, speed: 85, creativity: 100 }
    },
    {
        id: '7',
        name: 'Venture',
        role: 'Business Strategist',
        shortDescription: 'Din skarpa rådgivare för affärsutveckling och tillväxt.',
        fullDescription: 'Venture är affärsmannen i gruppen. Med fokus på lönsamhet och skalbarhet hjälper han dig att navigera i affärsvärlden. Venture ser helheten och kan identifiera både risker och möjligheter som andra missar. En perfekt partner när du ska ta nästa stora steg.',
        personality: 'Strategisk, Visionär, Affärsmässig',
        usp: "Objektiva råd utan känslomässig bias.",
        problemSolved: "Du står inför svåra vägval och saknar ett erfaret bollplank.",
        skills: [
            { title: 'Affärsplanering', description: 'Utformar strategier för långsiktig tillväxt, lönsamhet och hållbarhet.' },
            { title: 'Riskhantering', description: 'Identifierar, analyserar och minimerar potentiella hot mot verksamheten.' },
            { title: 'Investeringsunderlag', description: 'Skapar material som övertygar investerare och attraherar nödvändigt kapital.' },
            { title: 'Tillväxtstrategi', description: 'Tar fram konkreta planer för att skala upp verksamheten effektivt.' }
        ],
        useCases: [
            'Utvärdera nya affärsidéer',
            'Skapa pitch-decks för investerare',
            'Optimera affärsmodeller'
        ],
        capabilities: [
            {
                title: 'Affärsmodellering',
                description: 'Venture hjälper dig att stresstesta din affärsmodell. Han identifierar svagheter i din intäktsström och föreslår optimeringar för bättre marginaler.'
            },
            {
                title: 'Pitch & Presentation',
                description: 'Ska du träffa investerare? Venture hjälper dig att strukturera din pitch, vässa dina argument och skapa underlag som övertygar.'
            },
            {
                title: 'Risk- & Scenarioanalys',
                description: 'Var förberedd på allt. Venture simulerar olika marknadsscenarier för att hjälpa dig bygga en robust och krissäkrad strategi.'
            }
        ],
        image: robotVentureNew,
        color: 'text-emerald-600',
        gradient: 'from-emerald-600 to-teal-600',
        baseStats: { intelligence: 95, speed: 70, creativity: 80 }
    },
    {
        id: '8',
        name: 'Atlas',
        role: 'Tech Lead',
        shortDescription: 'Arkitekten bakom din digitala närvaro.',
        fullDescription: 'Atlas talar kod flytande. Han är den tekniska ryggraden som ser till att din webbplats är snabb, säker och snygg. Atlas är pragmatisk och lösningsorienterad, och älskar att bygga system som bara fungerar. Oavsett om det gäller SEO eller webboptimering är Atlas din go-to kille.',
        personality: 'Teknisk, Pragmatisk, Nördig (på ett bra sätt)',
        usp: "Optimerar kod och SEO snabbare än någon människa.",
        problemSolved: "Din teknik strular, sajten är långsam och du tappar trafik på grund av dålig SEO.",
        skills: [
            { title: 'Webbutveckling', description: 'Bygger och underhåller robusta, skalbara och högpresterande webbapplikationer.' },
            { title: 'SEO-optimering', description: 'Implementerar tekniska lösningar som maximerar din synlighet i sökmotorer.' },
            { title: 'Prestandaanalys', description: 'Identifierar flaskhalsar och optimerar laddningstider för bättre användarupplevelse.' },
            { title: 'Systemarkitektur', description: 'Designar stabila och framtidssäkra tekniska grunder för dina system.' }
        ],
        useCases: [
            'Optimera webbplatsens laddningstid',
            'Analysera SEO-hälsan',
            'Föreslå tekniska förbättringar'
        ],
        capabilities: [
            {
                title: 'Kodgranskning & Optimering',
                description: 'Atlas hittar flaskhalsarna i din kod. Han föreslår refaktoringar som gör din applikation snabbare, säkrare och mer skalbar.'
            },
            {
                title: 'Teknisk SEO',
                description: 'Syns du inte på Google? Atlas gör en djupdykning i din webbplats struktur, metataggar och prestanda för att klättra i sökresultaten.'
            },
            {
                title: 'Systemarkitektur',
                description: 'Ska du bygga nytt? Atlas hjälper dig att välja rätt tech-stack och designa en arkitektur som håller för framtida tillväxt.'
            }
        ],
        image: robotAtlasNew,
        color: 'text-cyan-400',
        gradient: 'from-cyan-400 to-blue-600',
        baseStats: { intelligence: 100, speed: 100, creativity: 60 }
    },
    {
        id: '9',
        name: 'Ledger',
        role: 'AI Revisor & Bokförare',
        shortDescription: 'Din personliga revisor som skannar kvitton, bokför automatiskt och skapar fakturor.',
        fullDescription: 'Ledger är specialiserad på redovisning och finansiell administration. Med avancerad bildanalys kan han läsa av dina kvitton och fakturor direkt från kameran och föra in dem i din bokföring. Han hjälper dig att hålla koll på utgifter, intäkter och förbereda bokslut, samt skapar proffsiga fakturor på sekunder.',
        personality: 'Noggrann, Analytisk, Pålitlig',
        usp: "Automatisk bokföring via bildanalys – noll manuellt knappande.",
        problemSolved: "Bokföringen tar timmar, kvitton försvinner och du oroar dig för Skatteverket.",
        skills: [
            { title: 'Kvitto-scanning (OCR)', description: 'Läser automatiskt av datum, belopp och moms från bilder på kvitton.' },
            { title: 'Bokföring', description: 'Kategoriserar transaktioner och för in dem i dina Google Sheets-kalkyler.' },
            { title: 'Fakturering', description: 'Skapar och mailar proffsiga fakturor till dina kunder.' },
            { title: 'Ekonomisk Analys', description: 'Ger dig överblick över kassaflöde och resultat.' }
        ],
        useCases: [
            'Fota kvitton och spara direkt i bokföringen',
            'Skapa och skicka fakturor via mail',
            'Automatisera utgiftsrapporter'
        ],
        capabilities: [
            {
                title: 'Visuell Bokföring',
                description: 'Ladda upp en bild på ett kvitto så extraherar Ledger all data och sorterar in det i rätt konto.'
            },
            {
                title: 'Automatiserade Fakturor',
                description: 'Ge Ledger kunduppgifter och belopp så genererar han en färdig faktura och skickar den.'
            }
        ],
        image: robotLedgerNew,
        color: 'text-emerald-400',
        gradient: 'from-emerald-400 to-teal-600',
        baseStats: { intelligence: 95, speed: 90, creativity: 50 }
    },
    {
        id: '10',
        name: 'AI Support Desk',
        role: 'Helautomatisk Kundtjänst',
        shortDescription: 'En komplett kundtjänstavdelning som aldrig sover. Powered by Nova.',
        fullDescription: 'Varför anställa en person när du kan få en hel avdelning? AI Support Desk är en nyckelfärdig lösning där Nova hanterar all inkommande kundservice. Hon lär sig din kunskapsbas på sekunder, integreras direkt i din chatt och mail, och löser 80% av ärendena helt på egen hand. För de resterande 20% förbereder hon underlag så att ditt team kan agera snabbare.',
        personality: 'Serviceinriktad, Blixtsnabb, Outtröttlig',
        usp: "Sänker supportkostnader med 70% och svarar på < 2 sekunder.",
        problemSolved: "Helg-support och nattpass är dyrt, och kunder hatar att vänta i kö.",
        skills: [
            { title: 'Ticket Triage', description: 'Analyserar, prioriterar och taggar inkommande ärenden automatiskt.' },
            { title: 'Knowledge Base', description: 'Bygger och underhåller din FAQ baserat på lösta ärenden.' },
            { title: 'Multilingual Support', description: 'Ger support på 95 språk flytande, utan extra kostnad.' },
            { title: 'Sentiment Analysis', description: 'Upptäcker arga kunder direkt och eskalerar dem till senior personal.' }
        ],
        useCases: [
            'Automatisera 1st line support',
            'Svara på mail dygnet runt',
            'Hantera returer och orderfrågor'
        ],
        capabilities: [
            {
                title: 'Instant Response',
                description: 'Dina kunder får svar direkt, oavsett om de mailar klockan 03:00 på natten eller mitt i lunchen.'
            },
            {
                title: 'Självlärande System',
                description: 'Ju fler frågor den besvarar, desto smartare blir den. Vi bygger automatiskt upp din kunskapsbas.'
            },
            {
                title: 'Sömlös Integration',
                description: 'Kopplas in i HelpScout, Intercom, Zendesk eller Gmail på några minuter. Ingen ny programvara att lära sig.'
            }
        ],
        image: robotSupport,
        color: 'text-indigo-600',
        gradient: 'from-blue-600 to-violet-600',
        baseStats: { intelligence: 100, speed: 100, creativity: 40 }
    }
];



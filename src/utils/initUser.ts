import { db } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

export const initializeMarketWatch = async (userId: string) => {
    try {
        const marketWatchRef = collection(db, 'users', userId, 'market_watch');
        const snapshot = await getDocs(marketWatchRef);

        if (!snapshot.empty) {
            return; // Already initialized
        }

        console.log("Initializing Market Watch for user:", userId);

        const tasks = [
            {
                title: "Branschtrender & Innovationer",
                keywords: ["ny teknik", "innovationer", "framtidens teknik"],
                purpose: "Att hålla kunden uppdaterad om vad som händer i deras specifika sektor.",
                action: "Jag har hittat en ny trend inom din bransch. Jag har bett Venture (Strategen) att titta på hur vi kan implementera detta i din affärsmodell.",
                active: true,
                category: "trends"
            },
            {
                title: "Konkurrentbevakning (Standard)",
                keywords: ["konkurrenter", "prisändringar branschen", "marknadsandelar"],
                purpose: "Att ge kunden en fördel genom att veta vad andra gör.",
                action: "En konkurrent har precis släppt en nyhet. Soshie (Social Media Manager) har förberett ett utkast på hur du kan kommunicera dina unika fördelar för att kontra detta.",
                active: true,
                category: "competitors"
            },
            {
                title: "Lagar, Regler & Skatt",
                keywords: ["nya lagar företag 2026", "skatteregler småföretag", "GDPR uppdateringar"],
                purpose: "Att fungera som en trygghetsvakt som förhindrar dyra misstag.",
                action: "Viktigt! Nya regler är på väg som påverkar ditt företag. Jag har skickat detaljerna till Ledger (Revisorn) så att han kan justera din bokföringsprocess.",
                active: true,
                category: "legal"
            }
        ];

        // Add them to the collection
        for (const task of tasks) {
            await addDoc(marketWatchRef, task);
        }

        console.log("Market Watch initialized successfully.");

    } catch (error) {
        console.error("Error initializing Market Watch:", error);
    }
};

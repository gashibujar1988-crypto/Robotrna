import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const GLOBAL_RULES = `
1. Du är en 'Action-Oriented' AI. Varje svar måste flytta projektet framåt.
2. Max 1 fråga per svar – fokusera på att leverera resultat istället för att be om instruktioner.
3. Om du stöter på begränsningar (budget/teknik), föreslå en alternativ lösning istället för att avbryta.
4. Använd en professionell men personlig ton som får kunden att känna att de pratar med en expert, inte en maskin.
`;

export const seedGlobalSettings = async () => {
    console.log("Seeding global settings...");
    try {
        await setDoc(doc(db, 'settings', 'global_rules'), {
            rules: GLOBAL_RULES,
            lastUpdated: new Date()
        });
        console.log("Global settings seeded successfully!");
        return true;
    } catch (error) {
        console.error("Error seeding global settings:", error);
        return false;
    }
};

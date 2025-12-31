import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onHunterConfirmation = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
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
//# sourceMappingURL=index.js.map
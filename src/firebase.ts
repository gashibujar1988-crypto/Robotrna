
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDvqtZY377CR3wEJcPn0JKQdR3eg_aHhuU",
    authDomain: "robotrna-demo-gashi.firebaseapp.com",
    projectId: "robotrna-demo-gashi",
    storageBucket: "robotrna-demo-gashi.firebasestorage.app",
    messagingSenderId: "379676193678",
    appId: "1:379676193678:web:a7bd6347f51f5bb318aadf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.addScope('https://www.googleapis.com/auth/contacts.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');

export { auth, db, googleProvider };

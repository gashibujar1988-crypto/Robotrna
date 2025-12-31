/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyDvqtZY377CR3wEJcPn0JKQdR3eg_aHhuU",
    authDomain: "robotrna-demo-gashi.firebaseapp.com",
    projectId: "robotrna-demo-gashi",
    storageBucket: "robotrna-demo-gashi.firebasestorage.app",
    messagingSenderId: "379676193678",
    appId: "1:379676193678:web:a7bd6347f51f5bb318aadf"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/favicon.ico'
    };

    self.registration.showNotification(notificationTitle,
        notificationOptions);
});

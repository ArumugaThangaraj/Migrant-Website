import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Your Firebase config
export const firebaseConfig = {
    apiKey: "AIzaSyDk_ATpeRx7lSm1Bj8lL3YJqS8Dzrovm1w",
    authDomain: "migrant-support-hub-ed02c.firebaseapp.com",
    projectId: "migrant-support-hub-ed02c",
    storageBucket: "migrant-support-hub-ed02c.firebasestorage.app",
    messagingSenderId: "1093269407270",
    appId: "1:1093269407270:web:ac56480a66211dd0ca88e7",
    measurementId: "G-5Y8X1JHG75"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
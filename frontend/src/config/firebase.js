import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAX_Oll9por3wDtE8Ql3Qq-EWmXEnnH-q8",
  authDomain: "escannora-dev.firebaseapp.com",
  projectId: "escannora-dev",
  storageBucket: "escannora-dev.firebasestorage.app",
  messagingSenderId: "841028827620",
  appId: "1:841028827620:web:648493fa7f26e34826eff1",
  measurementId: "G-R7M0590RDM"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

let analytics = null;

// Initialize Analytics if supported in browser environment
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
    console.log("🔥 Firebase Client Analytics (GA4) initialized successfully (G-R7M0590RDM)");
  } else {
    console.warn("⚠️ Firebase Analytics is not supported in this browser environment.");
  }
}).catch((err) => {
  console.error("❌ Failed to check Firebase Analytics support:", err);
});

export { app, analytics };

import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCKEucsh-l3O110lt7fFB_JGAH3bonZziU",
  authDomain: "escannova-development.firebaseapp.com",
  projectId: "escannova-development",
  storageBucket: "escannova-development.firebasestorage.app",
  messagingSenderId: "630465079759",
  appId: "1:630465079759:web:a9cca705007cfb31c64aba",
  measurementId: "G-LSD1NGC6QZ"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

let analytics = null;

// Initialize Analytics if supported in browser environment
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
    console.log("🔥 Firebase Client Analytics (GA4) initialized successfully (G-LSD1NGC6QZ)");
  } else {
    console.warn("⚠️ Firebase Analytics is not supported in this browser environment.");
  }
}).catch((err) => {
  console.error("❌ Failed to check Firebase Analytics support:", err);
});

export { app, analytics };

import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// This block provides a better error message if the keys are missing.
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    const message = "Your Firebase configuration is missing. Please copy the .env.local.example file to a new file named .env.local, fill in your Firebase project details, and then restart the development server.";
    // We only want to throw an error on the server, as it would crash the client.
    if (typeof window === 'undefined') {
        throw new Error(message);
    } else {
        // On the client, Firebase will throw its own error, but we can add context.
        console.error(message);
    }
}


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, auth, googleProvider };
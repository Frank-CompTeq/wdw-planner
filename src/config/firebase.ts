import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Validation des variables d'environnement requises
const requiredEnvVars = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Vérifier si toutes les variables requises sont définies
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => `EXPO_PUBLIC_FIREBASE_${key.toUpperCase().replace(/([A-Z])/g, '_$1')}`);

if (missingVars.length > 0) {
  throw new Error(
    `🔥 Firebase Configuration Error:\n\n` +
    `Missing required environment variables:\n` +
    `${missingVars.map(v => `  - ${v}`).join('\n')}\n\n` +
    `Setup Instructions:\n` +
    `1. Copy .env.example to .env\n` +
    `2. Get your Firebase credentials from:\n` +
    `   https://console.firebase.google.com/project/YOUR_PROJECT/settings/general\n` +
    `3. Fill in all required values in .env\n` +
    `4. Restart the development server\n\n` +
    `⚠️  IMPORTANT: Never commit .env to version control!\n` +
    `See FIREBASE_SETUP.md for detailed instructions.`
  );
}

// Configuration Firebase - WDW Planner
const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey!,
  authDomain: requiredEnvVars.authDomain!,
  projectId: requiredEnvVars.projectId!,
  storageBucket: requiredEnvVars.storageBucket!,
  messagingSenderId: requiredEnvVars.messagingSenderId!,
  appId: requiredEnvVars.appId!,
  measurementId: requiredEnvVars.measurementId!,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

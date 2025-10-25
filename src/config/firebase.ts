import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Configuration Firebase - WDW Planner
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyBGukrVrDVgOLTQX-XymuqXqRJFRcyBkxM",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "wdw-planner-3ee98.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "wdw-planner-3ee98",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "wdw-planner-3ee98.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "154493174498",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:154493174498:web:0bccdc5a9e540d034754bb",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-8WP725NMG1"
};

// Vérifier si les variables d'environnement sont définies
const hasValidConfig = process.env.EXPO_PUBLIC_FIREBASE_API_KEY && 
                      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;

if (!hasValidConfig) {
  console.warn('⚠️ Variables d\'environnement Firebase non définies. Utilisation des clés par défaut.');
  console.warn('📝 Créez un fichier .env pour une configuration sécurisée.');
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

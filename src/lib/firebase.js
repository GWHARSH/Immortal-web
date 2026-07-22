import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBUpl_AESpsBdP7nxCYwsMvb0oNqXFBpa8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'my-web-5225c.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'my-web-5225c',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'my-web-5225c.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '14052464524',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:14052464524:web:33c4063a1b79d8774ca8a9',
};

export const isFirebaseConfigured = true;

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

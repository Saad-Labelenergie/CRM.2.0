import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIwNiOmrOsCr0kbESImdFf7h1srfi07uY",
  authDomain: "crm-label-pose.firebaseapp.com",
  projectId: "crm-label-pose",
  storageBucket: "crm-label-pose.firebasestorage.app",
  messagingSenderId: "39234841334",
  appId: "1:39234841334:web:5051dfdbdff49789325ad7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
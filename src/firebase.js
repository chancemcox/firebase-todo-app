import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBtK4DqP3HhCe_2z2SB1Yc7G5gSQng36ms",
  authDomain: "todo-list-e7788.firebaseapp.com",
  projectId: "todo-list-e7788",
  storageBucket: "todo-list-e7788.firebasestorage.app",
  messagingSenderId: "82740211196",
  appId: "1:82740211196:web:7297f087941f3fdb5f5679",
  measurementId: "G-NMEYHYHE17"
};

console.log('Firebase config:', firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('Firebase app initialized:', app);

// Initialize Firebase services
export const auth = getAuth(app);
console.log('Firebase auth initialized:', auth);

export const db = getFirestore(app);
console.log('Firebase Firestore initialized:', db);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Auth functions
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export default app;

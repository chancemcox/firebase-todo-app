import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBtK4DqP3HhCe_2z2SB1Yc7G5gSQng36ms",
  authDomain: "todo.cox-fam.com",
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

// Chrome-specific optimizations
if (typeof window !== 'undefined' && window.navigator && window.navigator.userAgent.includes('Chrome')) {
  // Add Chrome-specific parameters for better compatibility
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
}

// Auth functions
export const signInWithGoogle = async () => {
  try {
    // Try popup first (faster, better UX)
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.log('Popup failed, falling back to redirect:', error);
    
    // If popup fails, use redirect (more reliable across browsers)
    if (error.code === 'auth/popup-closed-by-user' || 
        error.code === 'auth/popup-blocked' ||
        error.message?.includes('popup') ||
        error.message?.includes('blocked')) {
      
      // Use redirect method as fallback
      await signInWithRedirect(auth, googleProvider);
      // Note: User will be redirected to Google and then back to your app
      // The redirect result will be handled in the component
      return null;
    }
    
    // Re-throw other errors
    throw error;
  }
};

// Export redirect result handler
export const handleRedirectResult = () => getRedirectResult(auth);

export default app;

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

// Google Auth Provider with proper configuration
export const googleProvider = new GoogleAuthProvider();

// Set custom parameters for better OAuth flow (guarded for non-browser/test envs)
try {
  if (typeof googleProvider.setCustomParameters === 'function') {
    const hostname = typeof window !== 'undefined' && window.location ? window.location.hostname : 'localhost';
    googleProvider.setCustomParameters({
      prompt: 'select_account',
      ...(hostname !== 'localhost' && { hd: 'cox-fam.com' })
    });
  }
  if (typeof googleProvider.addScope === 'function') {
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
  }
} catch (e) {
  // In tests or SSR-like environments, provider methods may be missing; skip silently
}

// Auth functions with better error handling
export const signInWithGoogle = async () => {
  try {
    console.log('Attempting Google sign-in...');
    console.log('Current domain:', window.location.hostname);
    
    // Try popup first (faster, better UX)
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Google sign-in successful via popup:', result.user.email);
    return result;
  } catch (error) {
    console.error('Google sign-in error:', error);
    
    // Handle specific error cases
    if (error.code === 'auth/popup-closed-by-user') {
      console.log('User closed popup, not an error');
      return null;
    }
    
    if (error.code === 'auth/popup-blocked' || 
        error.code === 'auth/unauthorized-domain' ||
        error.message?.includes('popup') ||
        error.message?.includes('blocked') ||
        error.message?.includes('redirect_uri_mismatch')) {
      
      console.log('Popup blocked or unauthorized domain, falling back to redirect...');
      
      // Use redirect method as fallback
      try {
        await signInWithRedirect(auth, googleProvider);
        console.log('Redirect initiated successfully');
        return null;
      } catch (redirectError) {
        console.error('Redirect also failed:', redirectError);
        throw redirectError;
      }
    }
    
    // Re-throw other errors
    throw error;
  }
};

// Export redirect result handler
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log('Redirect result successful:', result.user.email);
    }
    return result;
  } catch (error) {
    console.error('Error handling redirect result:', error);
    throw error;
  }
};

export default app;

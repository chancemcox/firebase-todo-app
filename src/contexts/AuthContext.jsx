import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, displayName) {
    try {
      if (!auth) {
        throw new Error('Firebase auth is not initialized');
      }
      if (!db) {
        throw new Error('Firebase Firestore is not initialized');
      }
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(result.user, { displayName });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        displayName: displayName,
        createdAt: new Date().toISOString(),
        photoURL: null
      });
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  async function login(email, password) {
    if (!auth) {
      throw new Error('Firebase auth is not initialized');
    }
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    if (!auth) {
      throw new Error('Firebase auth is not initialized');
    }
    return signOut(auth);
  }

  async function loginWithGoogle() {
    try {
      const { signInWithGoogle } = await import('../firebase');

      const result = await signInWithGoogle();
      
      // Check if user document exists, if not create it
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          createdAt: new Date().toISOString(),
          photoURL: result.user.photoURL
        });
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  async function getUserProfile(uid) {
    try {
      if (!db) {
        throw new Error('Firebase Firestore is not initialized');
      }
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  useEffect(() => {
    let unsubscribe = () => {};
    
    console.log('AuthContext: Setting up auth state listener...');
    console.log('AuthContext: Auth object:', auth);
    console.log('AuthContext: onAuthStateChanged available:', typeof onAuthStateChanged === 'function');
    
    // Check if Firebase is properly initialized
    if (!auth) {
      console.error('AuthContext: Firebase auth is not initialized!');
      setLoading(false);
      return;
    }
    
    if (typeof onAuthStateChanged === 'function') {
      try {
        console.log('AuthContext: Setting up listener...');
        unsubscribe = onAuthStateChanged(auth, (user) => {
          console.log('AuthContext: Auth state changed:', user);
          setCurrentUser(user);
          setLoading(false);
        });
        console.log('AuthContext: Listener set up successfully');
      } catch (error) {
        console.error('AuthContext: Error setting up auth listener:', error);
        setLoading(false);
      }
    } else {
      console.error('AuthContext: onAuthStateChanged is not available');
      setLoading(false);
    }

    return () => {
      try { 
        console.log('AuthContext: Cleaning up listener...');
        unsubscribe && unsubscribe(); 
      } catch (e) {
        console.log('AuthContext: Error cleaning up listener:', e);
      }
    };
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loginWithGoogle,
    getUserProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

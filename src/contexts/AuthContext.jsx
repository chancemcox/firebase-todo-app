import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, displayName) {
    try {
      const [{ default: firebaseModule }, authPkg, firestorePkg] = await Promise.all([
        import('../firebase'),
        import('firebase/auth'),
        import('firebase/firestore')
      ]);
      const { auth, db } = firebaseModule;
      const { createUserWithEmailAndPassword, updateProfile } = authPkg;
      const { doc, setDoc } = firestorePkg;

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
    const [{ default: firebaseModule }, { signInWithEmailAndPassword }] = await Promise.all([
      import('../firebase'),
      import('firebase/auth')
    ]);
    const { auth } = firebaseModule;
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    const [{ default: firebaseModule }, { signOut }] = await Promise.all([
      import('../firebase'),
      import('firebase/auth')
    ]);
    const { auth } = firebaseModule;
    return signOut(auth);
  }

  async function loginWithGoogle() {
    try {
      const [{ signInWithGoogle, default: firebaseModule }, firestorePkg] = await Promise.all([
        import('../firebase'),
        import('firebase/firestore')
      ]);
      const { db } = firebaseModule;
      const { doc, setDoc, getDoc } = firestorePkg;

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
      const [{ default: firebaseModule }, { doc, getDoc }] = await Promise.all([
        import('../firebase'),
        import('firebase/firestore')
      ]);
      const { db } = firebaseModule;
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
    (async () => {
      const [{ default: firebaseModule }] = await Promise.all([
        import('../firebase')
      ]);
      const { auth } = firebaseModule;
      // Use auth's onAuthStateChanged if available from mocks
      const listener = auth && typeof auth.onAuthStateChanged === 'function'
        ? auth.onAuthStateChanged
        : null;
      if (listener) {
        unsubscribe = listener((user) => {
          setCurrentUser(user);
          setLoading(false);
        });
      } else {
        // Fallback: mark loading false
        setLoading(false);
      }
    })();

    return () => {
      try { unsubscribe && unsubscribe(); } catch {}
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

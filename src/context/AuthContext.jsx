import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const timeout = setTimeout(() => {
      if (loading) setLoading(false);
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeout);
      if (firebaseUser) {
        try {
          let role = 'user';
          if (db) {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              role = userDoc.data().role || 'user';
            }
          }
          setUser({ ...firebaseUser, role });
        } catch {
          setUser({ ...firebaseUser, role: 'user' });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signIn = async (email, password) => {
    if (!isFirebaseConfigured || !auth) {
      return { data: null, error: new Error('Firebase not configured') };
    }
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { data: result, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    if (auth) await firebaseSignOut(auth);
  };

  const value = { user, signIn, signOut };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050508', color: 'white', fontFamily: "'Outfit', sans-serif" }}>
          <div style={{ border: '4px solid rgba(244,114,182,0.1)', borderLeftColor: '#f472b6', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginLeft: '15px', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.8rem' }}>Synchronizing Protocol...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}

import { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { login as apiLogin, register as apiRegister, googleLogin as apiGoogleLogin, getMe } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await getMe();
          if (data.success) {
            setUser(data.data);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Session restoration failed:', error.message);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginUser = async (email, password) => {
    try {
      // 1. Attempt client-side Firebase Auth sign-in
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (fbErr) {
        console.warn('Firebase client sign-in warning:', fbErr.message);
      }

      // 2. Call backend login API
      const { data } = await apiLogin({ email, password });
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        setUser(data.data);
        toast.success(`Welcome back, ${data.data.name}!`);
        return true;
      }
      return false;
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Invalid email or password';
      toast.error(errMsg);
      throw new Error(errMsg);
    }
  };

  const registerUser = async (name, email, password) => {
    try {
      // 1. Attempt client-side Firebase Auth user creation
      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        if (userCred.user) {
          await updateProfile(userCred.user, { displayName: name });
        }
      } catch (fbErr) {
        if (fbErr.code !== 'auth/email-already-in-use') {
          console.warn('Firebase client sign-up warning:', fbErr.message);
        }
      }

      // 2. Call backend register API
      const { data } = await apiRegister({ name, email, password });
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        setUser(data.data);
        toast.success(`Account created! Welcome, ${data.data.name}!`);
        return true;
      }
      return false;
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Registration failed';
      toast.error(errMsg);
      throw new Error(errMsg);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const { data } = await apiGoogleLogin(idToken);
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        setUser(data.data);
        toast.success(`Welcome, ${data.data.name}!`);
        return true;
      }
      return false;
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        toast('Google Sign-In cancelled.', { icon: 'ℹ️' });
        return false;
      }
      const errMsg = error.response?.data?.error || error.message || 'Google login failed';
      toast.error(errMsg);
      throw new Error(errMsg);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const refreshUser = async () => {
    try {
      const { data } = await getMe();
      if (data.success) {
        setUser(data.data);
      }
    } catch (error) {
      console.error('Session refresh failed:', error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: loginUser,
        register: registerUser,
        loginWithGoogle,
        logout: logoutUser,
        isAuthenticated: !!user,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

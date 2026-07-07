import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getMe } from '../services/api';
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

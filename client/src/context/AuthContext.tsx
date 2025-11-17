import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';

interface User {
  id: number;
  name: string;
  email: string;
  nationality: string;
  is_ait_certified: boolean;
  role: string;
  is_verified: boolean;
  profile_picture?: string;
}

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  mockLogin: (userId: number) => Promise<void>;
  logout: () => void;
  setCurrentUser: (user: User) => void;
  loading: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  nationality: string;
  profile_picture?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const updateCurrentUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setCurrentUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
      const { user, token: authToken } = response.data;
      
      setCurrentUser(user);
      setToken(authToken);
      
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/register`, userData);
      
      // New flow: User gets logged in immediately after registration
      const { user, token: authToken, message } = response.data;
      
      if (authToken) {
        setCurrentUser(user);
        setToken(authToken);
        
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        
        // Show success message about verification
        if (message) {
          alert(message);
        }
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  };

  const mockLogin = async (userId: number) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/mock-login`, { userId });
      const { user, token: authToken } = response.data;
      
      setCurrentUser(user);
      setToken(authToken);
      
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Mock login failed');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    currentUser,
    token,
    login,
    register,
    mockLogin,
    logout,
    setCurrentUser: updateCurrentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

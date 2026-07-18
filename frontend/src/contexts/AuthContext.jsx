import { createContext, useState } from 'react';
import axios from 'axios';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch {
      return null;
    }
  });
  const [loading] = useState(false);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}` + '/api/auth/login', { email, password });
      setUser(data);
      try {
        localStorage.setItem('userInfo', JSON.stringify(data));
      } catch (storageError) {
        console.warn('localStorage is not available for writing:', storageError);
      }
      return { success: true };
    } catch (error) {
      console.error('Login error details:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Login failed' 
      };
    }
  };

  const register = async (username, email, password, role) => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}` + '/api/auth/register', { username, email, password, role });
      setUser(data);
      try {
        localStorage.setItem('userInfo', JSON.stringify(data));
      } catch (storageError) {
        console.warn('localStorage is not available for writing:', storageError);
      }
      return { success: true };
    } catch (error) {
      // 1. FRONTEND DEBUGGING: Log the exact error object and backend response
      console.error('Full Registration Error:', error);
      if (error.response) {
        console.error('Backend Response Data:', error.response.data);
      }
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('userInfo');
    } catch (storageError) {
      console.warn('localStorage is not available for writing:', storageError);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

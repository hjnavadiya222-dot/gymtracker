import { createContext, useState } from 'react';
import axios from 'axios';

// Cookie helpers for session persistence fallback on mobile browsers
const setCookie = (name, value, days) => {
  try {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (encodeURIComponent(value) || "") + expires + "; path=/; SameSite=Lax; Secure";
  } catch (e) {
    console.error('Error setting cookie:', e);
  }
};

const getCookie = (name) => {
  try {
    const nameEQ = name + "=";
    const ca = document.cookie.split(' ');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ';') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    // Try semicolon-split search in case formatting varies
    const ca2 = document.cookie.split(';');
    for (let i = 0; i < ca2.length; i++) {
      let c = ca2[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  } catch (e) {
    console.error('Error getting cookie:', e);
  }
  return null;
};

const eraseCookie = (name) => {
  try {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax; Secure';
  } catch (e) {
    console.error('Error erasing cookie:', e);
  }
};

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      // First try localStorage
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        return JSON.parse(userInfo);
      }
      
      // If empty, check persistent fallback cookie
      const cookieInfo = getCookie('userInfo');
      if (cookieInfo) {
        try {
          localStorage.setItem('userInfo', cookieInfo);
        } catch (storageError) {
          console.warn('Syncing cookie to localStorage failed:', storageError);
        }
        return JSON.parse(cookieInfo);
      }
    } catch (e) {
      console.warn('Failed to load user state from storage/cookie:', e);
    }
    return null;
  });
  const [loading] = useState(false);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}` + '/api/auth/login', { email, password });
      setUser(data);
      try {
        const dataStr = JSON.stringify(data);
        localStorage.setItem('userInfo', dataStr);
        setCookie('userInfo', dataStr, 30); // Save for 30 days
      } catch (storageError) {
        console.warn('localStorage or cookie writing failed:', storageError);
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
        const dataStr = JSON.stringify(data);
        localStorage.setItem('userInfo', dataStr);
        setCookie('userInfo', dataStr, 30); // Save for 30 days
      } catch (storageError) {
        console.warn('localStorage or cookie writing failed:', storageError);
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
      eraseCookie('userInfo');
    } catch (storageError) {
      console.warn('localStorage or cookie removal failed:', storageError);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

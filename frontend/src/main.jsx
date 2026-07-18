import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext.jsx'

// Redefine/polyfill localStorage methods if it's blocked or restricted (e.g. in private browsing)
try {
  const testKey = '__storage_test__';
  window.localStorage.setItem(testKey, testKey);
  window.localStorage.removeItem(testKey);
} catch {
  const memoryStore = new Map();
  Storage.prototype.getItem = function (key) {
    try {
      return memoryStore.get(key) || null;
    } catch {
      return null;
    }
  };
  Storage.prototype.setItem = function (key, value) {
    try {
      memoryStore.set(key, String(value));
    } catch {
      // Ignore
    }
  };
  Storage.prototype.removeItem = function (key) {
    try {
      memoryStore.delete(key);
    } catch {
      // Ignore
    }
  };
  Storage.prototype.clear = function () {
    try {
      memoryStore.clear();
    } catch {
      // Ignore
    }
  };
}

// Dynamically intercept all Axios requests to rewrite local API URL to the actual host
axios.interceptors.request.use(
  (config) => {
    const protocol = window.location.protocol;
    const defaultApiUrl = import.meta.env.VITE_API_URL || `${protocol}//${window.location.hostname}:5005`;
    if (config.url && config.url.startsWith('http://localhost:5005')) {
      config.url = config.url.replace('http://localhost:5005', defaultApiUrl);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)


// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://uni-market-backend.onrender.com' 
    : 'http://localhost:3001');

export const API_BASE = `${API_URL}/api`;

// Log config for debugging (only in development)
if (import.meta.env.DEV) {
  console.log('API Configuration:', { API_URL, API_BASE, MODE: import.meta.env.MODE });
}

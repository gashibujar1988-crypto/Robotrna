import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('google_client_id') || "PLACEHOLDER_CLIENT_ID";

createRoot(document.getElementById('run')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

if (window.location.port === '5174') {
  // Completely HIDE any mismatch errors by silently and instantly
  // proxying the user over to the exact same page on the authorized 5173 port.
  window.location.replace(window.location.href.replace(':5174', ':5173'));
} else {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <GoogleOAuthProvider clientId="90872154996-uovdvfs99noj5vm4iukv93lomlahks4f.apps.googleusercontent.com">
        <BrowserRouter basename="/admin-panel">
          <App />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </StrictMode>,
  );
}

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getApiBaseUrl } from './utils/api';

// Pages and Components
import Login from './pages/Login';
import CreateAccount from './pages/CreateAccount';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Settings from './pages/Settings';
import AdminProfile from './pages/AdminProfile';
import Notifications from './pages/Notifications';

import Layout from './components/Layout';

function App() {
  // null = still verifying, true = authenticated, false = not authenticated
  const [isAuthenticated, setIsAuthenticated] = React.useState(null);

  const verifyToken = React.useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/admin/verify-token`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        // Token is expired or invalid — clear it and force login
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setIsAuthenticated(false);
      }
    } catch {
      // Network error — keep token but mark as unauthenticated to prevent access
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      setIsAuthenticated(false);
    }
  }, []);

  React.useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  React.useEffect(() => {
    const syncAuth = () => verifyToken();
    window.addEventListener('storage', syncAuth);
    window.addEventListener('auth-changed', syncAuth);
    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('auth-changed', syncAuth);
    };
  }, [verifyToken]);

  // Show a minimal loading screen while verifying token — prevents protected pages from flashing
  if (isAuthenticated === null) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0f0f0f',
        color: '#d4af37',
        flexDirection: 'column',
        gap: '16px',
        fontFamily: 'sans-serif',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #333',
          borderTop: '3px solid #d4af37',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>Verifying session…</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/create-account" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <CreateAccount />} />
      <Route
        element={isAuthenticated ? <Layout /> : <Navigate to="/" replace />}
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/products" element={<Products />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<AdminProfile />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>
      {/* Catch-all — redirect unknown paths */}
      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />} />
    </Routes>
  );
}

export default App;

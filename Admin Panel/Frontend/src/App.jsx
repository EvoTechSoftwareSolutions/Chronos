import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

// Pages and Components
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Settings from './pages/Settings';
import AdminProfile from './pages/AdminProfile';
import Notifications from './pages/Notifications';

import Layout from './components/Layout';
import { ModalProvider } from './context/ModalContext';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sso = params.get('sso');
    if (sso) {
      localStorage.setItem("adminUser", sso);
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <ModalProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/products" element={<Products />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<AdminProfile />} />
          <Route path="/notifications" element={<Notifications />} />

        </Route>
      </Routes>
    </ModalProvider>
  );
}

export default App;

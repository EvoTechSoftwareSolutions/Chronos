import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import Header from '../components/Header';

import '../styles/Settings.css';

// We'll use local assets if they exist, or placeholders if dropped later.
// Please place your 'tissot--1--1.png' and '2609951_af9fa-1.png' in the src/assets folder
// and update these imports to point to them!
import wavesImage from '../assets/waves.png'; 
import watch1 from '../assets/watch1bg(1).png';
import watch2 from '../assets/watch1bg(2).png';
import watch3 from '../assets/watchbg3.png';
import watch4 from '../assets/watch1bg(3).png';

// Fallback logic for images will be handled via CSS or regular img tags with alt.
export default function Settings() {
  const [settings, setSettings] = useState({
    store_name: '',
    contact_email: '',
    phone_number: '',
    dark_mode: true,
    accent_color: '#d4af37',
    email_alerts_orders: true,
    low_stock_alerts: true
  });
  
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(true);
  
  // Role-based access control
  const storedUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const isAdmin = storedUser.role !== "Store Information Admin";
  
  const location = useLocation();
  const securityRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:5001/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!loading && location.hash) {
      if (location.hash === '#security' && securityRef.current) {
        securityRef.current.scrollIntoView({ behavior: 'smooth' });
      } else if (location.hash === '#notifications' && notificationsRef.current) {
        notificationsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [loading, location.hash]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSettings({ ...settings, [e.target.name]: value });
  };

  const handleSecurityChange = (e) => {
    setSecurityData({ ...securityData, [e.target.name]: e.target.value });
  };

  const handleSaveSettings = () => {
    if (!isAdmin) {
      alert("Role Restriction: Store Information Admins cannot modify these settings.");
      return;
    }

    fetch('http://localhost:5001/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...settings, role: storedUser.role })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save settings');
        alert('Settings Saved!');
      })
      .catch(err => {
        console.error(err);
        alert(err.message);
      });
  };

  const handleSaveSecurity = () => {
    if (!securityData.currentPassword || !securityData.newPassword) {
      alert("Please fill in both current and new passwords.");
      return;
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    fetch('http://localhost:5001/api/admin/profile/security', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(securityData)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update password');
        alert('Password updated successfully!');
        setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      })
      .catch(err => {
        console.error(err);
        alert(err.message);
      });
  };

  if (loading) return <div className="loading">Loading Settings...</div>;

  return (
    <div className="settings-page">
      <Header 
        title="Settings" 
        searchPlaceholder="Search your item here"
      />

      <div className="settings-layout">
        <div className="settings-forms">
          {/* Store Info */}
          <div className="settings-section">
            <h3>Store Information</h3>
            <div className="form-group">
              <label>Store Name</label>
              <input name="store_name" type="text" value={settings.store_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input name="contact_email" type="email" value={settings.contact_email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input name="phone_number" type="text" value={settings.phone_number} onChange={handleChange} />
            </div>
            <button 
              className={`gold-solid-btn mt-3 ${!isAdmin ? 'disabled-btn' : ''}`} 
              onClick={handleSaveSettings}
              disabled={!isAdmin}
            >
              Save Info
            </button>
          </div>

          {/* Appearance */}
          <div className="settings-section">
            <h3>Appearance</h3>
            <div className="toggle-group">
              <label>Dark Mode</label>
              <label className="switch">
                <input name="dark_mode" type="checkbox" checked={settings.dark_mode} onChange={handleChange} />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="toggle-group">
              <label>Accent Color</label>
              <input name="accent_color" type="color" value={settings.accent_color} onChange={handleChange} className="color-picker" />
            </div>
            <button 
              className={`gold-solid-btn mt-3 ${!isAdmin ? 'disabled-btn' : ''}`} 
              onClick={handleSaveSettings}
              disabled={!isAdmin}
            >
              Save Appearance
            </button>
          </div>

          {/* Notifications */}
          <div className="settings-section" ref={notificationsRef}>
            <h3>Notifications</h3>
            <div className="toggle-group">
              <label>Email Alerts for New Orders</label>
              <label className="switch">
                <input name="email_alerts_orders" type="checkbox" checked={settings.email_alerts_orders} onChange={handleChange} />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="toggle-group">
              <label>Low Stock Alerts</label>
              <label className="switch">
                <input name="low_stock_alerts" type="checkbox" checked={settings.low_stock_alerts} onChange={handleChange} />
                <span className="slider round"></span>
              </label>
            </div>
            <button 
              className={`gold-solid-btn mt-3 ${!isAdmin ? 'disabled-btn' : ''}`} 
              onClick={handleSaveSettings}
              disabled={!isAdmin}
            >
              Save Notifications
            </button>
          </div>

          {/* Security */}
          <div className="settings-section" ref={securityRef}>
            <h3>Security</h3>
            <div className="form-group">
              <label>Current Password</label>
              <input name="currentPassword" type="password" value={securityData.currentPassword} onChange={handleSecurityChange} />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input name="newPassword" type="password" value={securityData.newPassword} onChange={handleSecurityChange} />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input name="confirmPassword" type="password" value={securityData.confirmPassword} onChange={handleSecurityChange} />
            </div>
            <button className="gold-solid-btn mt-3" onClick={handleSaveSecurity}>Update Password</button>
          </div>
        </div>

        {/* Right side background */}
        <div className="settings-background">
           <img className="bg-abstract" src={wavesImage} alt="Golden Waves" onError={(e) => e.target.style.display = 'none'} />
         <div className="bg-watch-container">
             <div className="bg-watch-title-new">
                <h2>CHRONOS</h2>
                <div className="title-divider"></div>
                <p>WATCHES</p>
             </div>
             <div className="stacked-watches">
                 <img className="stack-img watch1" src={watch1} alt="Watch" onError={(e) => e.target.style.display = 'none'} />
                 <img className="stack-img watch2" src={watch2} alt="Watch" onError={(e) => e.target.style.display = 'none'} />
                 <img className="stack-img watch3" src={watch3} alt="Watch" onError={(e) => e.target.style.display = 'none'} />
                 <img className="stack-img watch4" src={watch4} alt="Watch" onError={(e) => e.target.style.display = 'none'} />
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

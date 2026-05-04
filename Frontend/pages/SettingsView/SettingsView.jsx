import React, { useState, useEffect } from 'react';
import { ChevronLeft, User, Bell, Shield, CreditCard, Save, Lock, Trash2, Plus, BellRing, Smartphone, Mail, ShieldCheck, X, CheckCircle2, AlertCircle } from 'lucide-react';
import profileImg from '../../assets/imageperson.png';
import cardLogos from '../../assets/card_logos.png';
import '../SettingView and Collection.css';
import axios from 'axios';
import { Star } from 'lucide-react';

export default function SettingsView({ user, setUser, onBack }) {
  const [activeTab, setActiveTab] = useState('Personal');
  const [toastStatus, setToastStatus] = useState({ show: false, hiding: false, title: '', message: '' });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zip_code: ''
  });
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (user?.email) {
      axios.get(`http://localhost:5000/api/user/profile?email=${user.email}`)
        .then(res => {
          if (res.data.success) {
            setFormData(prev => ({
              ...prev,
              ...res.data.user
            }));
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showToast = (title, message) => {
    setToastStatus({ show: true, hiding: false, title, message });
    setTimeout(() => setToastStatus(prev => ({ ...prev, hiding: true })), 3500);
    setTimeout(() => setToastStatus({ show: false, hiding: false, title: '', message: '' }), 4000);
  };

  const handleSavePersonal = (e) => {
    e.preventDefault();
    axios.put('http://localhost:5000/api/user/profile', formData)
      .then(res => {
        if (res.data.success) {
          showToast('Profile Updated', 'Your personal information has been saved.');
          // Update parent state and localStorage
          const updatedUser = { ...user, name: formData.name };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
          alert('Failed to update profile.');
        }
      })
      .catch(err => console.error(err));
  };

  const tabs = [
    { id: 'Personal', icon: User, label: 'Personal' },
    { id: 'Notifications', icon: Bell, label: 'Notifications' },
    { id: 'Security', icon: Shield, label: 'Security' },
    { id: 'Billing', icon: CreditCard, label: 'Billing' },
  ];

  return (
    <div className="settings-view-container">
      <section className="orders-profile-pic-container">
        <div className="profile-pic-wrapper small-profile-pic">
          <img src={user?.avatar || profileImg} alt={user?.name || 'Customer'} className="profile-pic" />
        </div>
        <h3 className="orders-profile-name">{user?.name || 'Customer'}</h3>
      </section>

      <div className="orders-nav-header">
        <button className="back-to-profile-btn" onClick={onBack}>
          <div className="back-icon-wrapper">
            <ChevronLeft size={16} />
          </div>
          <span>Back To Profile</span>
        </button>
      </div>

      <h1 className="orders-main-title">Account Settings</h1>

      {/* Tabs Navigation */}
      <div className="settings-tabs-wrapper">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`settings-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} className="tab-icon" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="settings-content-card">
        {activeTab === 'Personal' && (
          <form className="settings-form" onSubmit={handleSavePersonal}>
            <h4 className="settings-section-title">Personal Information</h4>
            
            <div className="form-group-row">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email (Read Only)</label>
                <input type="email" name="email" value={formData.email} readOnly style={{ opacity: 0.7 }} />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890" />
              </div>
            </div>

            <div className="settings-divider"></div>

            <h4 className="settings-section-title">Shipping Credentials</h4>
            
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="123 Luxury Ave" />
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="New York" />
              </div>
              <div className="form-group">
                <label>Zip Code</label>
                <input type="text" name="zip_code" value={formData.zip_code} onChange={handleChange} placeholder="10001" />
              </div>
            </div>

            <div className="settings-actions">
              <button type="submit" className="settings-save-btn" disabled={loading}>
                {loading ? 'Loading...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'Notifications' && (
          <div className="settings-form">
            <h4 className="settings-section-title">Notification Preferences</h4>
            <p className="settings-subtext mb-6">Choose what updates you want to receive from Chronos.</p>
            
            <div className="settings-toggle-group">
              <div className="settings-toggle-text">
                <label>Email Updates</label>
                <span>Receive emails about new collections and exclusive offers.</span>
              </div>
              <input type="checkbox" defaultChecked className="settings-toggle-checkbox" />
            </div>

            <div className="settings-toggle-group">
              <div className="settings-toggle-text">
                <label>SMS Alerts</label>
                <span>Get text messages about your order shipping status.</span>
              </div>
              <input type="checkbox" defaultChecked className="settings-toggle-checkbox" />
            </div>

            <div className="settings-actions">
              <button className="settings-save-btn" onClick={() => showToast('Preferences Saved', 'Your notification settings have been updated.')}>Save Preferences</button>
            </div>
          </div>
        )}

        {activeTab === 'Security' && (
          <div className="settings-form">
            <h4 className="settings-section-title">Security Settings</h4>
            <p className="settings-subtext mb-6">Update your password and secure your account.</p>

            <div className="form-group mb-4">
              <label>Current Password</label>
              <input type="password" placeholder="••••••••" />
            </div>
            
            <div className="form-group-row">
              <div className="form-group">
                <label>New Password</label>
                <input type="password" placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" placeholder="••••••••" />
              </div>
            </div>

            <div className="settings-divider"></div>
            
            <div className="settings-toggle-group border-gold">
              <div className="settings-toggle-text">
                <label className="gold-text">Two-Factor Authentication</label>
                <span>Add an extra layer of security to your account.</span>
              </div>
              <button className="settings-outline-btn">Enable</button>
            </div>

            <div className="settings-actions">
              <button className="settings-save-btn" onClick={() => showToast('Password Updated', 'Your security settings have been saved.')}>Update Password</button>
            </div>
          </div>
        )}

        {activeTab === 'Billing' && (
          <div className="settings-form">
            <h4 className="settings-section-title">Payment Methods</h4>
            <p className="settings-subtext mb-6">Manage your saved credit cards and billing addresses.</p>

            <div className="settings-payment-card">
              <div className="payment-card-info">
                <div className="payment-card-icon">VISA</div>
                <div className="payment-card-details">
                  <p className="payment-card-name">Visa ending in 4242</p>
                  <p className="payment-card-expiry">Expires 12/28</p>
                </div>
              </div>
              <button className="payment-card-remove">Remove</button>
            </div>

            <button className="settings-add-btn">
              + Add New Payment Method
            </button>

            <h4 className="settings-section-title">Billing Address</h4>
            <div className="settings-checkbox-group">
              <input type="checkbox" defaultChecked className="settings-toggle-checkbox small" id="sameShipping" />
              <label htmlFor="sameShipping">Same as Shipping Address</label>
            </div>
            
            <div className="settings-actions">
              <button className="settings-save-btn" onClick={() => showToast('Billing Updated', 'Your payment methods have been saved.')}>Save Billing Info</button>
            </div>
          </div>
        )}
      </div>

      {toastStatus.show && (
        <div className="success-toast-overlay">
          <div className={`luxury-success-toast ${toastStatus.hiding ? 'hiding' : ''}`}>
            <div className="toast-icon-wrapper">
              <Star size={20} fill="currentColor" />
            </div>
            <div className="toast-content-wrapper">
              <h4 className="toast-title">{toastStatus.title}</h4>
              <p className="toast-message">{toastStatus.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

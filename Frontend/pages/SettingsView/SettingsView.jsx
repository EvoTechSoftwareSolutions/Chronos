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

  // Security State
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Billing State
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({ cardNumber: '', expiry: '', cvv: '' });

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

      fetchPaymentMethods();
    }
  }, [user]);

  const fetchPaymentMethods = () => {
    axios.get(`http://localhost:5000/api/user/payment-methods?email=${user?.email}`)
      .then(res => {
        if (res.data.success) {
          setPaymentMethods(res.data.paymentMethods);
        }
      })
      .catch(console.error);
  };

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
          showToast('Error', 'Failed to update profile.');
        }
      })
      .catch(err => console.error(err));
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('Error', 'New passwords do not match.');
      return;
    }
    if (passwords.newPassword.length < 6) {
      showToast('Error', 'Password must be at least 6 characters.');
      return;
    }

    axios.put('http://localhost:5000/api/user/password', {
      email: user.email,
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword
    })
    .then(res => {
      if (res.data.success) {
        showToast('Password Updated', 'Your security settings have been saved.');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showToast('Update Failed', res.data.message || 'Incorrect current password.');
      }
    })
    .catch(err => {
      showToast('Error', err.response?.data?.message || 'Failed to update password.');
    });
  };

  const handleAddPaymentMethod = (e) => {
    e.preventDefault();
    if (newCard.cardNumber.length < 15 || newCard.expiry.length < 5 || newCard.cvv.length < 3) {
      showToast('Error', 'Please enter valid card details including CVV.');
      return;
    }

    axios.post('http://localhost:5000/api/user/payment-methods', {
      email: user.email,
      cardNumber: newCard.cardNumber,
      expiry: newCard.expiry
    })
    .then(res => {
      if (res.data.success) {
        showToast('Success', 'Payment method added.');
        setNewCard({ cardNumber: '', expiry: '', cvv: '' });
        setShowAddCard(false);
        fetchPaymentMethods();
      }
    })
    .catch(console.error);
  };

  const handleRemovePaymentMethod = (id) => {
    axios.delete(`http://localhost:5000/api/user/payment-methods/${id}?email=${user.email}`)
      .then(res => {
        if (res.data.success) {
          showToast('Success', 'Payment method removed.');
          fetchPaymentMethods();
        }
      })
      .catch(console.error);
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
          <form className="settings-form" onSubmit={handleUpdatePassword}>
            <h4 className="settings-section-title">Security Settings</h4>
            <p className="settings-subtext mb-6">Update your password and secure your account.</p>

            <div className="form-group mb-4">
              <label>Current Password</label>
              <input 
                type="password" 
                name="currentPassword" 
                value={passwords.currentPassword} 
                onChange={handlePasswordChange} 
                placeholder="••••••••" 
                required 
              />
            </div>
            
            <div className="form-group-row">
              <div className="form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  name="newPassword" 
                  value={passwords.newPassword} 
                  onChange={handlePasswordChange} 
                  placeholder="••••••••" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={passwords.confirmPassword} 
                  onChange={handlePasswordChange} 
                  placeholder="••••••••" 
                  required 
                />
              </div>
            </div>

            <div className="settings-divider"></div>
            
            <div className="settings-toggle-group border-gold">
              <div className="settings-toggle-text">
                <label className="gold-text">Two-Factor Authentication</label>
                <span>Add an extra layer of security to your account.</span>
              </div>
              <button type="button" className="settings-outline-btn">Enable</button>
            </div>

            <div className="settings-actions">
              <button type="submit" className="settings-save-btn">Update Password</button>
            </div>
          </form>
        )}

        {activeTab === 'Billing' && (
          <div className="settings-form">
            <h4 className="settings-section-title">Payment Methods</h4>
            <p className="settings-subtext mb-6">Manage your saved credit cards and billing addresses.</p>

            {paymentMethods.length === 0 ? (
              <p className="text-gray-400 text-sm mb-4">No payment methods saved.</p>
            ) : (
              paymentMethods.map(method => (
                <div key={method.id} className="settings-payment-card mb-4 flex justify-between items-center bg-[#1a1a1a] p-4 rounded-xl border border-white/5">
                  <div className="payment-card-info flex items-center gap-4">
                    <div className="payment-card-icon font-bold text-[#D4AF37] uppercase">{method.card_type}</div>
                    <div className="payment-card-details">
                      <p className="payment-card-name text-white font-medium">•••• •••• •••• {method.card_last_four}</p>
                      <p className="payment-card-expiry text-xs text-gray-500">Expires {method.expiry}</p>
                    </div>
                  </div>
                  <button onClick={() => handleRemovePaymentMethod(method.id)} className="payment-card-remove text-red-400 hover:text-red-300 transition-colors text-sm">Remove</button>
                </div>
              ))
            )}

            {!showAddCard ? (
              <button className="settings-add-btn mt-2" onClick={() => setShowAddCard(true)}>
                + Add New Payment Method
              </button>
            ) : (
              <div className="mt-4 p-4 border border-[#D4AF37]/30 rounded-xl bg-black/20">
                <h5 className="text-[#D4AF37] mb-3 text-sm">Add New Card</h5>
                <div className="form-group mb-3">
                  <label>Card Number</label>
                  <input type="text" placeholder="0000 0000 0000 0000" value={newCard.cardNumber} onChange={(e) => setNewCard({...newCard, cardNumber: e.target.value})} maxLength={19} />
                </div>
                <div className="form-group-row mb-4">
                  <div className="form-group flex-1">
                    <label>Expiry Date (MM/YY)</label>
                    <input type="text" placeholder="MM/YY" value={newCard.expiry} onChange={(e) => setNewCard({...newCard, expiry: e.target.value})} maxLength={5} />
                  </div>
                  <div className="form-group flex-1">
                    <label>CVV <span className="text-gray-500 text-[10px] lowercase tracking-normal ml-1">(Not stored)</span></label>
                    <input type="password" placeholder="•••" value={newCard.cvv} onChange={(e) => setNewCard({...newCard, cvv: e.target.value})} maxLength={4} />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button 
                    className="flex-1 py-3 bg-[#D4AF37] text-black font-bold uppercase tracking-widest text-[10px] md:text-xs rounded-xl hover:bg-[#c9a430] hover:scale-[1.02] transition-all duration-300 shadow-[0_4px_15px_rgba(212,175,55,0.2)]" 
                    onClick={handleAddPaymentMethod}
                  >
                    Save Card
                  </button>
                  <button 
                    className="flex-1 py-3 bg-transparent border border-[#D4AF37]/50 text-[#D4AF37] font-bold uppercase tracking-widest text-[10px] md:text-xs rounded-xl hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all duration-300" 
                    onClick={() => setShowAddCard(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="settings-divider my-8"></div>

            <h4 className="settings-section-title">Billing Address</h4>
            <div className="settings-checkbox-group">
              <input type="checkbox" defaultChecked className="settings-toggle-checkbox small" id="sameShipping" />
              <label htmlFor="sameShipping">Same as Shipping Address</label>
            </div>
            
            <div className="settings-actions mt-6">
              <button className="settings-save-btn" onClick={() => showToast('Billing Updated', 'Your billing address preferences have been saved.')}>Save Billing Info</button>
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

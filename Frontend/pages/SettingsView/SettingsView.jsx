import React, { useState, useEffect } from 'react';
import { ChevronLeft, User, Bell, Shield, CreditCard, Save, Lock, Trash2, Plus, BellRing, Smartphone, Mail, ShieldCheck, X, CheckCircle2, AlertCircle } from 'lucide-react';
import profileImg from '../../assets/imageperson.png';
import cardLogos from '../../assets/card_logos.png';
import '../SettingView and Collection.css';
import axios from 'axios';
import { usePopup } from '../../context/PopupContext';

export default function SettingsView({ user, onBack }) {
  const [activeTab, setActiveTab] = useState('Personal');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showAlert, showConfirm } = usePopup();

  // Form States
  const [personalData, setPersonalData] = useState({
// ... (rest of the file follows)
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    province: user?.province || '',
    zip_code: user?.zip_code || ''
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    notif_orders: true,
    notif_promos: true
  });

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({
    card_holder: '',
    card_number: '',
    exp_date: '',
    card_type: 'Visa'
  });

  useEffect(() => {
    if (activeTab === 'Notifications') fetchNotifications();
    if (activeTab === 'Billing') fetchPaymentMethods();
  }, [activeTab]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`/api/user/notifications?email=${user.email}`);
      if (res.data.success) setNotificationSettings(res.data.settings);
    } catch (err) { console.error(err); }
  };

  const fetchPaymentMethods = async () => {
    try {
      const res = await axios.get(`/api/user/billing?email=${user.email}`);
      if (res.data.success) setPaymentMethods(res.data.paymentMethods);
    } catch (err) { console.error(err); }
  };

  const handlePersonalSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put('/api/user/profile', { ...personalData, email: user.email });
      if (res.data.success) {
        const updatedUser = { ...user, ...personalData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        showAlert('Profile Saved', 'Your personal information has been successfully saved.', 'success', () => window.location.reload());
      } else {
        showAlert('Update Failed', res.data.message || 'Error updating profile', 'error');
      }
    } catch (err) { 
      showAlert('Connection Error', 'Unable to reach authentication server.', 'error');
    }
    setSaving(false);
  };

  const handleSecuritySave = async (e) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      showAlert('Password Mismatch', 'New password and confirmation do not match.', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await axios.post('/api/user/security', {
        email: user.email,
        currentPassword: securityData.currentPassword,
        newPassword: securityData.newPassword
      });
      if (res.data.success) {
        showAlert('Security Saved', 'Your passphrase has been changed successfully.', 'success');
        setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showAlert('Security Error', res.data.message || 'Error updating password', 'error');
      }
    } catch (err) { 
      showAlert('Connection Error', 'Security synchronizer is currently unavailable.', 'error');
    }
    setSaving(false);
  };

  const handleNotificationToggle = async (key) => {
    const isEnabling = !notificationSettings[key];
    const updated = { ...notificationSettings, [key]: isEnabling };
    setNotificationSettings(updated);
    try {
      await axios.put('/api/user/notifications', { ...updated, email: user.email });
      
      const title = key === 'notif_orders' ? 'Order Alerts' : 'Newsletter Alert';
      const msg = key === 'notif_orders' 
        ? `Order update notification ${isEnabling ? 'enabled' : 'disabled'}`
        : `Newsletter notification ${isEnabling ? 'enabled' : 'disabled'}`;
      
      showAlert(title, msg, 'success');
    } catch (err) { 
      showAlert('Error', 'Failed to synchronize preferences.', 'error');
    }
  };

  const handleAddBilling = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/user/billing', {
        ...newCard,
        user_email: user.email,
        is_default: paymentMethods.length === 0
      });
      if (res.data.success) {
        setShowAddCard(false);
        setNewCard({ card_holder: '', card_number: '', exp_date: '', card_type: 'Visa' });
        fetchPaymentMethods();
        showAlert('Card Saved', 'New payment method has been secured in your portfolio.', 'success');
      }
    } catch (err) { showAlert('Error', 'Failed to add card. Please try again.', 'error'); }
  };

  const handleDeleteBilling = async (id, holderName) => {
    showConfirm('Delete Method?', `Do you want to delete this card [${holderName}]?`, async () => {
      try {
        await axios.delete(`/api/user/billing/${id}`);
        fetchPaymentMethods();
        showAlert('Method Removed', 'The payment method has been successfully purged from your portfolio.', 'success');
      } catch (err) { console.error(err); }
    });
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
          <form className="settings-form" onSubmit={handlePersonalSave}>
            <div className="flex justify-between items-center mb-8">
               <h4 className="settings-section-title !mb-0">Personal Information</h4>
               <span className="text-[10px] uppercase tracking-widest text-gray-500">Member since {new Date().getFullYear()}</span>
            </div>
            
            <div className="form-group-row">
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={personalData.name} 
                  onChange={(e) => setPersonalData({...personalData, name: e.target.value})} 
                  placeholder="Your display name"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                   type="tel" 
                   value={personalData.phone} 
                   onChange={(e) => setPersonalData({...personalData, phone: e.target.value})} 
                   placeholder="+1 (555) 000-0000" 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={user?.email || ''} readOnly className="opacity-50 cursor-not-allowed bg-white/5" />
              <p className="text-[10px] text-gray-600 mt-2 italic">* Email cannot be modified for security reasons.</p>
            </div>

            <div className="settings-divider"></div>

            <h4 className="settings-section-title">Shipping Credentials</h4>
            
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Street Address</label>
              <input 
                 type="text" 
                 value={personalData.address} 
                 onChange={(e) => setPersonalData({...personalData, address: e.target.value})} 
                 placeholder="123 Luxury Ave, Suite 100" 
              />
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>City</label>
                <input 
                   type="text" 
                   value={personalData.city} 
                   onChange={(e) => setPersonalData({...personalData, city: e.target.value})} 
                   placeholder="Geniva" 
                />
              </div>
              <div className="form-group">
                <label>Province / State</label>
                <input 
                   type="text" 
                   value={personalData.province} 
                   onChange={(e) => setPersonalData({...personalData, province: e.target.value})} 
                   placeholder="CH-GE" 
                />
              </div>
              <div className="form-group">
                <label>Zip Code</label>
                <input 
                   type="text" 
                   value={personalData.zip_code} 
                   onChange={(e) => setPersonalData({...personalData, zip_code: e.target.value})} 
                   placeholder="1201" 
                />
              </div>
            </div>

            <div className="settings-actions">
              <button type="submit" className="settings-save-btn" disabled={saving}>
                {saving ? 'Synchronizing...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'Notifications' && (
           <div className="notifications-settings">
              <div className="flex items-center gap-3 mb-8">
                 <BellRing className="text-[#D4AF37]" size={24} />
                 <h4 className="settings-section-title !mb-0 text-xl">Alert Preferences</h4>
              </div>

              <div className="notif-list space-y-6">
                 <div className="notif-item flex justify-between items-center p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-[#D4AF37]/30 transition-all">
                    <div className="flex items-start gap-4">
                       <Smartphone className="text-gray-400 mt-1" size={20} />
                       <div>
                          <h5 className="text-white font-medium">Order Updates</h5>
                          <p className="text-xs text-gray-500 mt-1">Real-time alerts via push & email for tracking status.</p>
                       </div>
                    </div>
                    <label className="switch">
                       <input type="checkbox" checked={notificationSettings.notif_orders} onChange={() => handleNotificationToggle('notif_orders')} />
                       <span className="slider round"></span>
                    </label>
                 </div>

                 <div className="notif-item flex justify-between items-center p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-[#D4AF37]/30 transition-all">
                    <div className="flex items-start gap-4">
                       <Mail className="text-gray-400 mt-1" size={20} />
                       <div>
                          <h5 className="text-white font-medium">Newsletters & Perks</h5>
                          <p className="text-xs text-gray-500 mt-1">Exclusive early access to limited edition pieces.</p>
                       </div>
                    </div>
                    <label className="switch">
                       <input type="checkbox" checked={notificationSettings.notif_promos} onChange={() => handleNotificationToggle('notif_promos')} />
                       <span className="slider round"></span>
                    </label>
                 </div>
              </div>
              
              <div className="mt-10 p-4 border border-[#D4AF37]/10 rounded-xl bg-[#D4AF37]/5 text-center">
                 <p className="text-[10px] uppercase tracking-widest text-[#D4AF37]">Communication Preferences are Auto-Saved</p>
              </div>
           </div>
        )}

        {activeTab === 'Security' && (
           <form className="security-settings" onSubmit={handleSecuritySave}>
              <div className="flex items-center gap-3 mb-8">
                 <ShieldCheck className="text-[#D4AF37]" size={24} />
                 <h4 className="settings-section-title !mb-0 text-xl">Access Control</h4>
              </div>

              <div className="space-y-6">
                 <div className="form-group">
                    <label>Current Password</label>
                    <div className="relative">
                       <input 
                          type="password" 
                          required 
                          placeholder="••••••••" 
                          value={securityData.currentPassword}
                          onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                       />
                       <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" />
                    </div>
                 </div>

                 <div className="form-group-row">
                    <div className="form-group">
                       <label>New Password</label>
                       <input 
                          type="password" 
                          required 
                          placeholder="New Passphrase" 
                          value={securityData.newPassword}
                          onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                       />
                    </div>
                    <div className="form-group">
                       <label>Confirm Passphrase</label>
                       <input 
                          type="password" 
                          required 
                          placeholder="Verify New Passphrase" 
                          value={securityData.confirmPassword}
                          onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                       />
                    </div>
                 </div>
              </div>

              <div className="settings-actions mt-12">
                 <button type="submit" className="settings-save-btn" disabled={saving}>
                    {saving ? 'Securing...' : 'Update Security Credentials'}
                 </button>
              </div>
           </form>
        )}

        {activeTab === 'Billing' && (
           <div className="billing-settings">
              <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-3">
                    <CreditCard className="text-[#D4AF37]" size={24} />
                    <h4 className="settings-section-title !mb-0 text-xl">Payment Cards</h4>
                 </div>
                 <button onClick={() => setShowAddCard(true)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4AF37] hover:underline">
                    <Plus size={14} /> Add New Method
                 </button>
              </div>

              {showAddCard ? (
                 <form className="add-card-form p-6 rounded-2xl bg-white/5 border border-[#D4AF37]/30 mb-8" onSubmit={handleAddBilling}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                       <div className="form-group hover:border-[#D4AF37]/50 transition-all">
                          <label>Identity Name</label>
                          <input 
                             name="auth_holder"
                             id="auth_holder"
                             required 
                             autoComplete="off"
                             spellCheck="false"
                             data-lpignore="true"
                             value={newCard.card_holder} 
                             onChange={e => setNewCard({...newCard, card_holder: e.target.value})} 
                             placeholder="Full Name on Card" 
                          />
                       </div>
                       <div className="form-group">
                          <label>Card Type</label>
                          <div className="flex items-center gap-3">
                             <div 
                                className={`card-logo-container !h-8 !w-12 !border-none ${newCard.card_type.toLowerCase()}`}
                                style={{ backgroundImage: `url(${cardLogos})` }}
                             ></div>
                             <select className="form-select w-full bg-transparent border-none outline-none" value={newCard.card_type} onChange={e => setNewCard({...newCard, card_type: e.target.value})}>
                                <option value="Visa">Visa</option>
                                <option value="Mastercard">Mastercard</option>
                                <option value="AMEX">American Express</option>
                             </select>
                          </div>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                       <div className="form-group">
                          <label>Identification Digit</label>
                          <input 
                             name="auth_code"
                             id="auth_code"
                             maxLength="16" 
                             minLength="12" 
                             placeholder="Full identification" 
                             required 
                             autoComplete="off"
                             data-lpignore="true"
                             value={newCard.card_number} 
                             onChange={e => setNewCard({...newCard, card_number: e.target.value})} 
                          />
                       </div>
                       <div className="form-group">
                          <label>Validity Term</label>
                          <input 
                             name="auth_term"
                             id="auth_term"
                             placeholder="MM/YY" 
                             required 
                             autoComplete="off"
                             data-lpignore="true"
                             value={newCard.exp_date} 
                             onChange={e => setNewCard({...newCard, exp_date: e.target.value})} 
                          />
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <button type="submit" className="settings-save-btn !py-2 !text-[10px]">Verify & Add</button>
                       <button type="button" onClick={() => setShowAddCard(false)} className="px-6 text-gray-500 hover:text-white transition-colors">Cancel</button>
                    </div>
                 </form>
              ) : (
                 <div className="payment-methods-list space-y-4">
                    {paymentMethods.length === 0 ? (
                       <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                          <p className="text-gray-500 text-sm">No payment methods stored.</p>
                       </div>
                    ) : (
                       paymentMethods.map(method => (
                          <div key={method.id} className="flex justify-between items-center p-6 rounded-2xl bg-[#0F0F0F] border border-white/10 hover:border-[#D4AF37]/30 transition-all">
                             <div className="flex items-center gap-4">
                                <div 
                                   className={`card-logo-container ${method.card_type.toLowerCase()}`}
                                   style={{ backgroundImage: `url(${cardLogos})` }}
                                ></div>
                                <div>
                                   <p className="text-sm font-medium tracking-widest text-[#D4AF37]">
                                      •••• •••• •••• {method.card_number ? method.card_number.slice(-4) : '****'}
                                   </p>
                                   <p className="text-[10px] text-gray-500 uppercase mt-1">{method.card_holder} · Exp {method.exp_date}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-4">
                                {method.is_default && <span className="text-[9px] uppercase tracking-tighter bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-1 rounded">Primary</span>}
                                <button onClick={() => handleDeleteBilling(method.id, method.card_holder)} className="text-gray-700 hover:text-red-500 transition-colors">
                                   <Trash2 size={16} />
                                </button>
                             </div>
                          </div>
                       ))
                    )}
                 </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
}

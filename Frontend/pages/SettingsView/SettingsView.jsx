import React, { useState } from 'react';
import { ChevronLeft, User, Bell, Shield, CreditCard } from 'lucide-react';
import profileImg from '../../assets/imageperson.png';
import '../SettingView and Collection.css';
export default function SettingsView({ onBack }) {
  const [activeTab, setActiveTab] = useState('Personal');

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
          <img src={profileImg} alt="Pathum Nissanka" className="profile-pic" />
        </div>
        <h3 className="orders-profile-name">Pathum Nissanka</h3>
      </section>

      <div className="orders-nav-header">
        <button className="back-to-profile-btn" onClick={onBack}>
          <div className="back-icon-wrapper">
            <ChevronLeft size={16} />
          </div>
          <span>Back To Profile</span>
        </button>
      </div>

      <h1 className="orders-main-title">My Profile</h1>

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
          <form className="settings-form" onSubmit={(e) => e.preventDefault()}>
            <h4 className="settings-section-title">Personal Information</h4>
            
            <div className="form-group-row">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" defaultValue="John" />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" defaultValue="Doe" />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>Email</label>
                <input type="email" defaultValue="john@example.com" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" defaultValue="+1 234 567 890" />
              </div>
            </div>

            <div className="settings-divider"></div>

            <h4 className="settings-section-title">Shipping Address</h4>
            
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Address</label>
              <input type="text" defaultValue="123 Luxury Ave" />
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>City</label>
                <input type="text" defaultValue="New York" />
              </div>
              <div className="form-group">
                <label>Zip Code</label>
                <input type="text" defaultValue="10001" />
              </div>
            </div>

            <div className="settings-actions">
              <button type="submit" className="settings-save-btn">Save Changes</button>
            </div>
          </form>
        )}

        {activeTab !== 'Personal' && (
          <div className="settings-empty-state">
            <p>Settings for {activeTab} will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

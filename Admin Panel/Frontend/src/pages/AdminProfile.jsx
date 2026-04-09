import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Header from '../components/Header';

import '../styles/AdminProfile.css';

export default function AdminProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5001/api/admin/profile')
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(err => console.error('Error fetching profile:', err));
  }, []);

  const handleSave = () => {
    setSaving(true);
    fetch('http://localhost:5001/api/admin/profile', {      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    })
      .then(res => res.json())
      .then(() => {
        setSaving(false);
        alert('Profile saved!');
      })
      .catch(err => {
        console.error('Error saving profile:', err);
        setSaving(false);
      });
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="loading">Loading Profile...</div>;

  return (
    <div className="admin-profile-page">
      <Header 
        title="Admin Profile Settings" 
        searchPlaceholder="Search your item here"
      />
      
      <div className="profile-header-card">
        <div className="profile-identity">
          <h3>{profile.first_name || 'Admin'} {profile.last_name || ''}</h3>
          <span className="status-badge active">Active</span>
        </div>
        
        <div className="profile-tabs">
          <button className="tab-btn active">Personal Info</button>
          <button className="tab-btn" onClick={() => navigate('/settings#security')}>Security</button>
          <button className="tab-btn" onClick={() => navigate('/settings#notifications')}>Notifications</button>
        </div>
      </div>

      <div className="profile-content-card">
        <div className="card-header">
          <h3>Personal Information</h3>
          <p>Update your personal details and profile information.</p>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>First Name</label>
            <input name="first_name" type="text" value={profile.first_name || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input name="last_name" type="text" value={profile.last_name || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input name="email" type="email" value={profile.email || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input name="phone" type="text" value={profile.phone || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Role</label>
            <input name="role" type="text" value={profile.role || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Department</label>
            <input name="department" type="text" value={profile.department || ''} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group bio-group">
          <label>Bio</label>
          <textarea name="bio" rows="4" value={profile.bio || ''} onChange={handleChange}></textarea>
        </div>

        <div className="form-actions">
          <button className="cancel-btn" onClick={() => window.location.reload()}>Cancel</button>
          <button className="gold-solid-btn save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

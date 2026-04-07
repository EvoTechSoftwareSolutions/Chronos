import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import axios from 'axios';

function SettingsView({ onBack }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [name, setName] = useState(user.name || '');
  const [email] = useState(user.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState('');

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setSaving('name');
    try {
      await axios.put('http://localhost:5000/api/user/update', { email, name });
      const updated = { ...user, name };
      localStorage.setItem('user', JSON.stringify(updated));
      setStatus('success');
      setMessage('Name updated successfully!');
    } catch {
      setStatus('error');
      setMessage('Failed to update name.');
    } finally {
      setSaving('');
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('New passwords do not match.');
      return;
    }
    setSaving('password');
    try {
      await axios.put('http://localhost:5000/api/user/update-password', {
        email,
        currentPassword,
        newPassword,
      });
      setStatus('success');
      setMessage('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setSaving('');
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(212,175,55,0.4)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: 'white',
    outline: 'none',
    fontSize: '0.9rem',
  };

  const labelStyle = {
    display: 'block',
    color: '#D4AF37',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1rem',
    marginBottom: '0.5rem',
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#D4AF37',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.8rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: '2rem',
        }}
      >
        <ChevronLeft size={16} />
        Back To Profile
      </button>

      <h1 style={{
        fontFamily: "'Playfair Display SC', serif",
        fontSize: '2rem',
        color: '#fff',
        letterSpacing: '0.1em',
        marginBottom: '0.5rem',
      }}>
        Settings
      </h1>
      <div style={{ width: '40px', height: '2px', background: '#D4AF37', marginBottom: '2.5rem' }} />

      {/* Status Message */}
      {status && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          background: status === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${status === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
          color: status === 'success' ? '#86efac' : '#fca5a5',
          fontSize: '0.85rem',
        }}>
          {message}
        </div>
      )}

      {/* Update Name */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: '12px',
        padding: '1.75rem',
        marginBottom: '1.5rem',
      }}>
        <h2 style={{ color: '#D4AF37', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          Account Information
        </h2>
        <form onSubmit={handleUpdateName} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Display Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle}
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              value={email}
              style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
              disabled
            />
          </div>
          <button
            type="submit"
            disabled={saving === 'name'}
            style={{
              background: '#D4AF37',
              color: '#000',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontSize: '0.75rem',
              cursor: saving === 'name' ? 'not-allowed' : 'pointer',
              alignSelf: 'flex-start',
              opacity: saving === 'name' ? 0.7 : 1,
            }}
          >
            {saving === 'name' ? 'Saving...' : 'Update Name'}
          </button>
        </form>
      </div>

      {/* Update Password */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: '12px',
        padding: '1.75rem',
      }}>
        <h2 style={{ color: '#D4AF37', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          Change Password
        </h2>
        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              style={inputStyle}
              placeholder="Enter current password"
              required
            />
          </div>
          <div>
            <label style={labelStyle}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={inputStyle}
              placeholder="Enter new password"
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={inputStyle}
              placeholder="Confirm new password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving === 'password'}
            style={{
              background: '#D4AF37',
              color: '#000',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontSize: '0.75rem',
              cursor: saving === 'password' ? 'not-allowed' : 'pointer',
              alignSelf: 'flex-start',
              opacity: saving === 'password' ? 0.7 : 1,
            }}
          >
            {saving === 'password' ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SettingsView;

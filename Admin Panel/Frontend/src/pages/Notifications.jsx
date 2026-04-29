import React, { useState, useEffect } from 'react';
import { Search, Bell, Trash2, CheckCircle, Clock, AlertTriangle, Info } from 'lucide-react';
import '../styles/Notifications.css';
import { apiFetch } from '../utils/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    apiFetch('/api/admin/notifications')
      .then(res => res.json())
      .then(json => {
        setNotifications(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, []);

  const markAsRead = (id) => {
    apiFetch(`/api/admin/notifications/${id}/read`, { method: 'PUT' })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setNotifications(notifications.filter(n => n.id !== id));
        }
      })
      .catch(err => console.error('Update error:', err));
  };

  const markAllAsRead = () => {
    apiFetch('/api/admin/notifications/mark-all-read', { method: 'PUT' })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setNotifications([]);
        }
      })
      .catch(err => console.error('Update error:', err));
  };

  const filteredNotifications = notifications.filter(n => 
    n.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (type) => {
    switch (type) {
      case 'low_stock': return <AlertTriangle size={18} className="text-red-500" />;
      case 'order': return <Clock size={18} className="text-gold-500" />;
      case 'info': return <Info size={18} className="text-blue-500" />;
      default: return <Bell size={18} />;
    }
  };

  if (loading) return <div className="loading">Loading Notifications...</div>;

  return (
    <div className="notifications-page">
      <header className="page-header">
        <div>
          <h1>Notifications</h1>
          <p className="page-sub">Chronos Admin Messages</p>
        </div>
        <div className="header-actions">
          <div className="search-bar">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search notifications..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="gold-solid-btn" onClick={markAllAsRead}>Clear All Notifications</button>
        </div>
      </header>

      <div className="notifications-list-container">
        <div className="notif-table-header">
           <span>{filteredNotifications.length} Notifications found</span>
        </div>
        <table className="notifications-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Type</th>
              <th>Message</th>
              <th>Date & Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map(n => (
                <tr key={n.id} className={n.is_read ? 'read-row' : 'unread-row'}>
                  <td className="status-col">
                    {!n.is_read && <span className="unread-dot"></span>}
                    {n.is_read ? <CheckCircle size={16} className="read-icon" /> : <Bell size={16} className="unread-icon" />}
                  </td>
                  <td className="type-col">
                    <div className="type-wrap">
                      {getIcon(n.type)}
                      <span>{n.type.replace('_', ' ').toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="msg-col">{n.text}</td>
                  <td className="date-col">{new Date(n.created_at).toLocaleString()}</td>
                  <td className="actions-col">
                    <button className="mark-read-btn" onClick={() => markAsRead(n.id)}>
                      Clear
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="empty-msg">No notifications found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

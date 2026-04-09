import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import '../styles/Dashboard.css'; // Reuse existing styles for consistency

export default function Header({ title, subtitle, searchTerm, setSearchTerm, searchPlaceholder = "Search..." }) {
  const { setIsSidebarOpen } = useOutletContext();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const fetchNotifications = () => {
    fetch('http://localhost:5001/api/admin/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data.notifications) setNotifications(data.notifications);
      })
      .catch(err => console.error('Error fetching notifications:', err));
  };

  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    // Real-time polling every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleClearNotification = (e, id) => {
    e.stopPropagation(); // Prevent navigating to notifications page
    fetch(`http://localhost:5001/api/admin/notifications/${id}/read`, { method: 'PUT' })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setNotifications(prev => prev.filter(n => n.id !== id));
        }
      })
      .catch(err => console.error('Error clearing:', err));
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    fetch('http://localhost:5001/api/admin/notifications/mark-all-read', { method: 'PUT' })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setNotifications([]);
        }
      })
      .catch(err => console.error('Error clearing all:', err));
  };

  const unreadCount = notifications.length;

  return (
    <header className="page-header">
      <div className="header-left">
        <button className="mobile-toggle" onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} color="#d4af37" />
        </button>
        <div>
          <h1>{title}</h1>
          <p className="page-sub">{subtitle || 'Chronos'}</p>
        </div>
      </div>
      <div className="header-actions">
        {setSearchTerm && (
          <div className="search-bar">
            <Search size={16} color="#888" />
            <input 
              type="text" 
              placeholder={searchPlaceholder} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
        <div className="notification-wrapper" style={{ position: 'relative' }}>
          <button className="icon-btn gold-outline-btn" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={18} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>
          {showNotifications && (
            <div className="notifications-dropdown">
               <div className="notif-header">
                 <span>Notifications ({notifications.length})</span>
                 {notifications.length > 0 && (
                   <button className="clear-all-notif" onClick={handleClearAll}>Clear All</button>
                 )}
               </div>
               {notifications.length > 0 ? (
                 notifications.map(n => (
                   <div key={n.id} className="notif-item">
                      <div className="notif-content">
                        <p>{n.text}</p>
                        <span>{n.time}</span>
                      </div>
                      <button className="clear-one-notif" onClick={(e) => handleClearNotification(e, n.id)}>×</button>
                   </div>
                 ))
               ) : (
                 <div className="notif-item"><p>No new notifications</p></div>
               )}
               <div className="notif-footer" onClick={() => { setShowNotifications(false); navigate('/notifications'); }}>View All</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

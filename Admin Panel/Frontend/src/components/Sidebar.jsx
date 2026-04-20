import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Box, ShoppingBag, Users, Settings, LogOut } from 'lucide-react';
import logo from '../assets/watchlogo.png';
import '../styles/Sidebar.css';

export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState({ name: 'Admin', role: 'Administrator' });

  useEffect(() => {
    const userStr = localStorage.getItem('adminUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.name) {
          setAdminUser({ name: user.name, role: user.role || 'Administrator' });
        }
      } catch (e) {
        console.error("Error parsing adminUser", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const menuItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/products", icon: Box, label: "Products" },
    { to: "/orders", icon: ShoppingBag, label: "Orders" },
    { to: "/customers", icon: Users, label: "Customers" },
    { to: "/settings", icon: Settings, label: "Settings" }
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
         <img src={logo} alt="Chronos Logo" className="brand-logo" />
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <NavLink 
            key={item.to} 
            to={item.to} 
            className={({isActive}) => isActive ? "nav-item active" : "nav-item"}
            onClick={() => setIsOpen(false)}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile" onClick={() => { navigate('/profile'); setIsOpen(false); }} style={{ cursor: 'pointer' }}>
          <div className="avatar">{getInitials(adminUser.name)}</div>
          <div className="user-info">
            <h4>{adminUser.name}</h4>
            <p>{adminUser.role}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} color="#d4af37" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}

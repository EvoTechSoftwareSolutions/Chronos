import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Box, ShoppingBag, Users, Settings, LogOut } from 'lucide-react';
import logo from '../assets/watchlogo.png';
import '../styles/Sidebar.css';

export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
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
          <div className="avatar">KS</div>
          <div className="user-info">
            <h4>Kasun Silva</h4>
            <p>CEO</p>
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

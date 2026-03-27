import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const navLinks = [
    { name: 'Home', to: '/home' },
    { name: 'Collection', to: '/collection' },
    { name: 'About', to: '/about' },
    { name: 'Contact', to: '/contact' },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const query = searchQuery.toLowerCase();
    
    // Search mapping
    let targetId = null;
    if (query.includes('rolex') || query.includes('omega') || query.includes('hk') || query.includes('hero') || query.includes('latest') || query.includes('best selling')) {
      targetId = 'hero-watches';
    } else if (query.includes('luxury')) {
      targetId = 'category-luxury';
    } else if (query.includes('sport')) {
      targetId = 'category-sport';
    } else if (query.includes('analog')) {
      targetId = 'category-analog';
    } else if (query.includes('smart')) {
      targetId = 'category-smart';
    } else if (query.includes('watch') || query.includes('collection') || query.includes('chronos')) {
      targetId = 'categories-section';
    }

    if (targetId) {
      const element = document.getElementById(targetId);
      if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        // Scroll with an offset for the fixed navbar
        window.scrollTo({
          top: elementPosition - 120,
          behavior: 'smooth'
        });
      }
    }
    
    // Close search after submit
    setIsSearchOpen(false);
    setSearchQuery('');
  };
  return (
    <nav className="fixed top-0 left-0 w-full z-50 py-6 px-16 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-white/10 transition-all duration-300">
      {/* Logo */}
      <div className="flex items-center">
        <img src={logo} alt="Chronos Logo" className="h-16 object-contain" />
      </div>

      {/* Center Links */}
      <ul className="flex space-x-12 text-white text-lg tracking-wide">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`pb-1 transition font-medium ${
                  isActive
                    ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]'
                    : 'text-gray-200 hover:text-[#D4AF37]'
                }`}
              >
                {link.name}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Right Icons */}
      <div className="flex space-x-5 relative">
        {/* Search Icon */}
        <button 
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="w-11 h-11 rounded-full border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition duration-300 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>

        {/* Cart Icon */}
        <Link to="/cart" className="w-11 h-11 rounded-full border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition duration-300 group">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </Link>

        {/* User Icon */}
        <Link to="/profile" className="w-11 h-11 rounded-full border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition duration-300 group">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </Link>

        {/* Search Dropdown Bar */}
        <div 
          className={`absolute top-16 right-0 transition-all duration-300 transform origin-top-right ${isSearchOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
        >
           <form 
              onSubmit={handleSearchSubmit} 
              className="flex items-center bg-[#21211e]/90 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-[360px]"
           >
              <div className="pl-4 pr-3 text-[#D4AF37]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your item here" 
                className="bg-transparent text-white placeholder-gray-300 outline-none w-full py-3 pr-4 text-sm font-light"
                autoFocus={isSearchOpen}
              />
           </form>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

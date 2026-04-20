import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/images/ui/logo.png';
import { useCart } from '../context/CartContext';

function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();

  const navLinks = [
    { name: 'Home', to: '/home' },
    { name: 'Collection', to: '/collection' },
    { name: 'About', to: '/about' },
    { name: 'Contact', to: '/contact' },
  ];

  //handleSearchSubmit, useEffect, handleSuggestionClick remain the same
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearchOpen(false);
    navigate(`/collection?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
    setSuggestions([]);
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/products/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await response.json();
        setSuggestions(data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSuggestionClick = (product) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSuggestions([]);
    const category = (product.category || 'luxury').toLowerCase();
    navigate(`/product/${category}/${product.id}`);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 py-4 lg:py-6 px-6 lg:px-16 flex justify-between items-center bg-black/60 backdrop-blur-lg border-b border-white/10 transition-all duration-300">
      {/* Logo */}
      <div className="flex items-center">
        <img src={logo} alt="Chronos Logo" className="h-12 lg:h-16 object-contain" />
      </div>

      {/* Desktop Links (Hidden on mobile/tablet) */}
      <ul className="hidden lg:flex space-x-12 text-white text-lg tracking-wide">
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
      <div className="flex items-center space-x-3 lg:space-x-5 relative">
        {/* Search Icon */}
        <button 
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="w-10 h-10 lg:w-11 lg:h-11 rounded-full border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition duration-300 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>

        {/* Cart Icon */}
        <Link to="/cart" className="relative w-10 h-10 lg:w-11 lg:h-11 rounded-full border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition duration-300 group">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#D4AF37] text-black text-[10px] font-bold flex items-center justify-center leading-none shadow-lg">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </Link>

        {/* User Icon (Desktop Only) */}
        <Link to="/profile" className="hidden sm:flex w-10 h-10 lg:w-11 lg:h-11 rounded-full border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition duration-300 group">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </Link>

        {/* Hamburger Menu (Mobile/Tablet Only) */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden w-10 h-10 rounded-full border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition duration-300"
        >
          {isMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>

        {/* Search Dropdown Bar */}
        <div 
          className={`absolute top-16 right-0 transition-all duration-300 transform origin-top-right ${isSearchOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
        >
            <form 
              onSubmit={handleSearchSubmit} 
              className="flex items-center bg-[#21211e]/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-[280px] sm:w-[360px] relative"
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
                placeholder="Search..." 
                className="bg-transparent text-white placeholder-gray-300 outline-none w-full py-3 pr-4 text-sm font-light"
                autoFocus={isSearchOpen}
              />

              {/* Suggestions Dropdown */}
              {isSearchOpen && (searchQuery.trim() !== "" || isLoading) && (
                <div className="absolute top-[102%] left-0 w-full bg-[#1a1a1a] border border-white/10 rounded-xl mt-1 overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.7)] z-[100]">
                  {isLoading ? (
                    <div className="p-4 flex items-center justify-center gap-3 text-gray-400 text-sm">
                      <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                      Searching...
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="flex flex-col max-h-[300px] overflow-y-auto">
                      {suggestions.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleSuggestionClick(product)}
                          className="flex items-center px-4 py-3 hover:bg-[#D4AF37]/10 transition-colors border-b border-white/5 last:border-0 group text-left"
                        >
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex-shrink-0 mr-4 overflow-hidden border border-white/10 group-hover:border-[#D4AF37]/30 transition-colors">
                            <img 
                              src={product.image_url ? (product.image_url.startsWith('http') ? product.image_url : `http://localhost:5000${product.image_url}`) : 'https://via.placeholder.com/48?text=Watch'} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => e.target.src = 'https://via.placeholder.com/48?text=Watch'}
                            />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-white text-xs font-semibold truncate group-hover:text-[#D4AF37] transition-colors">{product.name}</span>
                            <span className="text-[#D4AF37] text-[10px] font-bold mt-0.5">Rs. {String(product.price).replace('$', '').trim()}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
           </form>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`lg:hidden fixed inset-x-0 top-[72px] lg:top-[88px] bg-black/95 backdrop-blur-2xl border-b border-white/10 transition-all duration-300 z-40 overflow-hidden ${
          isMenuOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="flex flex-col p-6 space-y-4">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className={`text-xl tracking-widest uppercase py-2 block ${
                  location.pathname === link.to ? 'text-[#D4AF37]' : 'text-gray-300'
                }`}
              >
                {link.name}
              </Link>
            </li>
          ))}
          <li>
            <Link
              to="/profile"
              onClick={() => setIsMenuOpen(false)}
              className="text-xl tracking-widest uppercase py-2 block text-gray-300 sm:hidden"
            >
              Profile
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;

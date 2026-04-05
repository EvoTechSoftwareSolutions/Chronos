import React, { useState } from 'react';
import axios from 'axios';

const CheckIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12l3 3 6-6" />
  </svg>
);

const ArrowUpIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStatus(null);
    try {
      // Send subscription request to the backend
      const response = await axios.post('http://localhost:5000/subscribe', { email });
      if (response.data.success) {
        setStatus({ type: 'success', message: response.data.message });
        setEmail('');
      } else {
        setStatus({ type: 'error', message: response.data.message });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to connect to the server. Please check your connection.' });
      console.error(error);
    } finally {
      setLoading(false);
      // Clear status after 5 seconds
      setTimeout(() => setStatus(null), 5000);
    }
  };

  return (
    <section className="w-full px-8 py-20 relative text-white">
      <div className="max-w-5xl mx-auto bg-[#1A1A1A] border border-[#D4AF37]/40 rounded-lg p-10 md:p-16 relative shadow-[0_0_15px_rgba(212,175,55,0.1)]">
        
        {/* Title Container */}
        <div className="text-center mb-16">
          <h4 className="text-[#D4AF37] uppercase tracking-[0.2em] font-serif text-sm mb-4 font-bold">News Letter</h4>
          <h2 className="text-3xl md:text-5xl font-serif mb-4 tracking-wide text-gray-100">JOIN THE INNER CIRCLE</h2>
          <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto">
            Be the first to know about new releases, exclusive events, and members-only offers.
          </p>
          <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mt-8"></div>
        </div>

        {/* Content Container */}
        <div className="flex flex-col md:flex-row gap-12 md:gap-8 justify-between items-center max-w-4xl mx-auto">
          
          {/* Left Side: Features */}
          <div className="w-full md:w-1/2 flex flex-col gap-5 pl-4 md:pl-0 list-none">
            <div className="flex items-center gap-4">
              <CheckIcon className="text-[#D4AF37] flex-shrink-0" />
              <span className="text-gray-200 lg:text-lg">Early access to new collections</span>
            </div>
            <div className="flex items-center gap-4">
              <CheckIcon className="text-[#D4AF37] flex-shrink-0" />
              <span className="text-gray-200 lg:text-lg">Exclusive member discounts</span>
            </div>
            <div className="flex items-center gap-4">
              <CheckIcon className="text-[#D4AF37] flex-shrink-0" />
              <span className="text-gray-200 lg:text-lg">Invites to private events</span>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="w-full md:w-1/2 max-w-sm">
            <form onSubmit={handleSubscribe} className="flex flex-col gap-5">
              <div>
                <input 
                  type="email" 
                  required
                  placeholder="Your Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#1A1A1A] border border-gray-600 text-white rounded-md px-5 py-3 focus:outline-none focus:border-[#D4AF37] transition-colors disabled:opacity-50"
                  style={{ backgroundColor: 'rgb(26, 26, 26)' }}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#D4AF37] text-black font-bold tracking-wide rounded-md px-5 py-3 hover:bg-[#E5C158] transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
              
              {/* Status Message */}
              {status && (
                <p className={`text-sm text-center transition-opacity ${status.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {status.message}
                </p>
              )}
            </form>
          </div>

        </div>
      </div>

      {/* Embedded Footer Logo & Scroll To Top */}
      <div className="max-w-7xl mx-auto flex items-center justify-center relative mt-24">
        
        {/* Center Logo */}
        <div className="text-center flex flex-col items-center">
          <h2 className="text-[#D4AF37] tracking-[0.25em] text-2xl font-serif mb-1">CHRONOS</h2>
          <p className="text-white text-[10px] uppercase tracking-widest opacity-80">Watches</p>
        </div>

        {/* Scroll To Top Button - Right Aligned (Absolute) */}
        <button 
          onClick={scrollToTop}
          type="button"
          className="absolute right-0 w-12 h-12 rounded-full border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors shadow-lg group mr-4 md:mr-0"
          aria-label="Scroll to top"
        >
          <ArrowUpIcon className="group-hover:-translate-y-1 transition-transform duration-300" />
        </button>

      </div>
    </section>
  );
}

export default Newsletter;

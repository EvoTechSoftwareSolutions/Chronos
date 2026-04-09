import React from 'react';
import { Link } from 'react-router-dom';
import footerBg from '../assets/images/ui/footer.png';
import logo from '../assets/images/ui/logo.png';
import fbIcon from '../assets/icons/social/fb.png';
import instaIcon from '../assets/icons/social/intra.png';
import tiktokIcon from '../assets/icons/social/ticktok.png';

const MailIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const PhoneIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MapPinIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

function Footer() {
  return (
    <footer className="w-full relative mt-20 pt-4 pb-4 px-4">
      {/* Outer Bordered Container wrapper to match the image design (rounded gold border enclosing everything) */}
      <div className="max-w-[1400px] mx-auto rounded-xl border-2 border-[#D4AF37]/80 overflow-hidden relative shadow-[0_0_20px_rgba(212,175,55,0.15)] flex flex-col">
        
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={footerBg} 
            alt="Footer Background" 
            className="w-full h-full object-cover"
          />
          
        </div>

        {/* Main Footer Content */}
        <div className="relative z-10 w-full px-6 sm:px-10 lg:px-16 py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-24">
            
            {/* Column 1: Brand Info */}
            <div className="flex flex-col gap-5 items-center sm:items-start text-center sm:text-left">
              <img src={logo} alt="Chronos Logo" className="w-40 lg:w-48 h-auto object-contain" />
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-sm opacity-80">
                Crafting timeless elegance since 2026. Each timepiece tells a story of precision, passion, and uncompromising quality.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-4 mt-2">
                <a href="#" className="w-10 h-10 rounded-full border border-[#D4AF37]/50 flex items-center justify-center hover:bg-[#D4AF37]/20 transition-colors group">
                  <img src={fbIcon} alt="Facebook" className="w-4 h-4 object-contain opacity-80 group-hover:opacity-100" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-[#D4AF37]/50 flex items-center justify-center hover:bg-[#D4AF37]/20 transition-colors group">
                  <img src={instaIcon} alt="Instagram" className="w-4 h-4 object-contain opacity-80 group-hover:opacity-100" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-[#D4AF37]/50 flex items-center justify-center hover:bg-[#D4AF37]/20 transition-colors group">
                  <img src={tiktokIcon} alt="TikTok" className="w-4 h-4 object-contain opacity-80 group-hover:opacity-100" />
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left mt-4 sm:mt-0">
              <h3 className="text-white font-serif tracking-widest text-lg mb-2 uppercase">Quick Links</h3>
              <div className="w-16 h-0.5 bg-[#D4AF37] mb-6 sm:mb-8"></div>
              
              <div className="flex flex-col gap-3 sm:gap-4 text-xs sm:text-sm text-gray-300">
                <Link to="/collection" className="hover:text-[#D4AF37] transition-colors">Collection</Link>
                <Link to="/about" className="hover:text-[#D4AF37] transition-colors">About</Link>
                <Link to="/contact" className="hover:text-[#D4AF37] transition-colors">Contact</Link>
              </div>
            </div>

            {/* Column 3: Contact */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left mt-4 lg:mt-0 sm:col-span-2 lg:col-span-1">
              <h3 className="text-white font-serif tracking-widest text-lg mb-2 uppercase">Contact</h3>
              <div className="w-10 h-0.5 bg-[#D4AF37] mb-6 sm:mb-8"></div>
              
              <div className="flex flex-col gap-3 sm:gap-4 text-xs sm:text-sm text-gray-300 items-center sm:items-start">
                <div className="flex items-center gap-3">
                  <MailIcon className="text-[#D4AF37] flex-shrink-0" />
                  <a href="mailto:info@chronos.com" className="hover:text-[#D4AF37] transition-colors">info@chronos.com</a>
                </div>
                <div className="flex items-center gap-3">
                  <PhoneIcon className="text-[#D4AF37] flex-shrink-0" />
                  <a href="tel:+94711111111" className="hover:text-[#D4AF37] transition-colors">+94 71 111 1111</a>
                </div>
                <div className="flex items-center gap-3">
                  <MapPinIcon className="text-[#D4AF37] flex-shrink-0" />
                  <span>Galle, Sri Lanka</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar within the rounded border */}
        <div className="relative z-10 w-full px-6 sm:px-16 py-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto bg-black/40">
          
          {/* Logo element for mobile bottom layout if desired, hidden here to prioritize copyright */}
          <div className="hidden md:block w-1/3"></div>

          {/* Copyright Centered */}
          <div className="text-[#D4AF37] text-[10px] sm:text-xs tracking-[0.1em] font-serif w-full md:w-1/3 text-center order-2 md:order-none">
            &copy; 2026 CHRONOS
          </div>

          {/* Legal Links Right Aligned */}
          <div className="flex gap-4 sm:gap-6 text-[9px] sm:text-[10px] md:text-xs text-gray-400 w-full md:w-1/3 justify-center md:justify-end order-1 md:order-none">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy & Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
          </div>
          
        </div>

      </div>
    </footer>
  );
}

export default Footer;

import React from 'react';

function Footer() {
  return (
    <footer className="bg-black py-10 border-t border-[#D4AF37]/30 text-center text-gray-400">
      <div className="mb-4">
        <h2 className="text-[#D4AF37] font-playfair tracking-widest text-2xl font-bold">CHRONOS</h2>
      </div>
      <p className="text-sm">&copy; {new Date().getFullYear()} Chronos Watches. All rights reserved.</p>
    </footer>
  );
}

export default Footer;

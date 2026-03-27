import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

function Collection() {
  return (
    <div className="bg-black text-white w-full min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h4 className="text-[#D4AF37] uppercase tracking-widest text-sm mb-4 font-serif">Our</h4>
          <h1 className="text-5xl md:text-7xl font-serif tracking-wide mb-6">COLLECTION</h1>
          <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mb-8"></div>
          <p className="text-gray-400 max-w-md mx-auto">
            Explore our curated selection of luxury timepieces.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Collection;

import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

function Cart() {
  return (
    <div className="bg-black text-white w-full min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h4 className="text-[#D4AF37] uppercase tracking-widest text-sm mb-4 font-serif">Your</h4>
          <h1 className="text-5xl md:text-7xl font-serif tracking-wide mb-6">CART</h1>
          <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mb-8"></div>
          <p className="text-gray-400 max-w-md mx-auto">Your cart is empty. Browse our collection and add your favourite timepieces.</p>
          <a href="/collection" className="inline-block mt-8 px-8 py-3 border border-[#D4AF37] text-[#D4AF37] font-serif tracking-widest hover:bg-[#D4AF37] hover:text-black transition-colors duration-300">
            Browse Collection
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Cart;

import React from 'react';

function Newsletter() {
  return (
    <section className="py-20 px-4 flex justify-center">
      <div className="bg-[#1E1E1E] border border-[#D4AF37] rounded-lg p-10 max-w-3xl w-full text-center">
        <h3 className="text-2xl font-bold text-white mb-4">Join The Chronos Club</h3>
        <p className="text-gray-400 mb-6">Subscribe to receive exclusive offers and updates on new collections.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="p-3 bg-transparent border border-gray-600 rounded text-white focus:border-[#D4AF37] outline-none w-full sm:w-64"
          />
          <button className="bg-[#D4AF37] text-black px-6 py-3 rounded font-semibold hover:bg-yellow-400 transition">
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
}

export default Newsletter;

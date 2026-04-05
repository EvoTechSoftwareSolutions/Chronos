import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

function Profile() {
  return (
    <div className="bg-black text-white w-full min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full border-2 border-[#D4AF37] flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-[#D4AF37]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <h4 className="text-[#D4AF37] uppercase tracking-widest text-sm mb-4 font-serif">My</h4>
          <h1 className="text-5xl md:text-7xl font-serif tracking-wide mb-6">PROFILE</h1>
          <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mb-8"></div>
          <p className="text-gray-400 max-w-md mx-auto">Manage your account details, order history, and preferences.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Profile;

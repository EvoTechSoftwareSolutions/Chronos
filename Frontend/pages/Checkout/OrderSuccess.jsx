import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';

function OrderSuccess() {
  const { orderId } = useParams();
  const { clearCart } = useCart();

  React.useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="bg-[#030303] min-h-screen text-white font-poppins relative overflow-hidden">
      <Navbar />
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-6 text-center">
        {/* Animated Checkmark Circle */}
        <div className="w-24 h-24 rounded-full bg-[#D4AF37]/10 border-2 border-[#D4AF37] flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(212,175,55,0.2)] animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-[#D4AF37] uppercase tracking-[0.2em] mb-4 drop-shadow-lg">
          Order Confirmed
        </h1>
        
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-8" />

        {orderId && (
          <div className="bg-[#111111]/50 backdrop-blur-sm border border-[#D4AF37]/20 px-6 py-2 rounded-full mb-8">
            <p className="text-gray-400 text-xs tracking-[0.2em] uppercase">
              Order Reference: <span className="text-[#D4AF37] font-bold ml-1">#ORD-{String(orderId).padStart(4, '0')}</span>
            </p>
          </div>
        )}

        <p className="text-gray-300 max-w-lg leading-relaxed text-sm md:text-base mb-12 font-light tracking-wide">
          Your journey with Chronos has begun. A confirmation email has been sent to your inbox. 
          Our master watchmakers will now prepare your selection with the precision it deserves.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <Link
            to="/home"
            className="px-10 py-4 bg-[#D4AF37] text-black font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs rounded-full hover:bg-[#b8962d] transition-all transform hover:scale-105 shadow-[0_10px_20px_rgba(212,175,55,0.2)]"
          >
            Continue Shopping
          </Link>
          
          <Link
            to="/profile"
            className="px-10 py-4 border border-[#D4AF37] text-[#D4AF37] font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs rounded-full hover:bg-[#D4AF37]/10 transition-all"
          >
            Track My Order
          </Link>
        </div>
      </div>

      <div className="pt-10">
        <Footer />
      </div>
    </div>
  );
}

export default OrderSuccess;


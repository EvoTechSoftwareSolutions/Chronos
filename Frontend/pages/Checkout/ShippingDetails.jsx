import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';

// dynamically loading data

function fmt(n) {
  return Number(n).toLocaleString('en-US');
}

function CartBtnIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
  );
}

function ShippingDetails() {
  const { cartItems, setShippingDetails, shippingDetails } = useCart();
  const navigate = useNavigate();
  const [related, setRelated] = useState([]);



  React.useEffect(() => {
     fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
         const parsed = data.slice(0, 3).map((p, i) => {
             let imgList = [];
             try { imgList = JSON.parse(p.images); } catch(e){}
             return {
                id: p.id,
                brand: p.brand,
                name: p.name,
                priceNum: parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0,
                image: imgList[0] ? `http://localhost:5000${imgList[0]}` : p.image_url ? `http://localhost:5000${p.image_url}` : null,
             };
         });
         setRelated(parsed);
      })
      .catch(console.error);
  }, []);

  const [formData, setFormData] = useState({
    firstName: shippingDetails?.firstName || '',
    lastName: shippingDetails?.lastName || '',
    email: shippingDetails?.email || '',
    address: shippingDetails?.address || '',
    mobile: shippingDetails?.mobile || '',
    city: shippingDetails?.city || '',
    province: shippingDetails?.province || '',
    zipCode: shippingDetails?.zipCode || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const subtotal = cartItems.reduce((s, i) => {
    const price = typeof i.priceNum === 'number' ? i.priceNum : parseFloat(String(i.price ?? '0').replace(/[^0-9.]/g, '')) || 0;
    return s + price * i.quantity;
  }, 0);
  const discountAmt = 0;
  const total = subtotal;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    for (const key in formData) {
      if (!formData[key]) {
        setError("Please fill in all shipping details.");
        return;
      }
    }

    setShippingDetails(formData);
    navigate('/checkout/shipping-method');
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-[#0B0B0B] text-white w-full min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
          <h1 className="font-playfair text-4xl mb-4 uppercase tracking-widest">Your Cart is Empty</h1>
          <Link to="/home" className="px-8 py-3 bg-[#D4AF37] text-black font-semibold rounded-full uppercase tracking-widest text-sm hover:bg-[#c9a430] transition-all">
            Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#0B0B0B] text-white w-full min-h-screen relative overflow-x-hidden font-poppins">
      <Navbar />

      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <svg className="absolute right-[-10%] top-20 w-[60%] h-auto opacity-[0.05]" viewBox="0 0 500 700" fill="none">
          <path d="M480 10 C480 120 80 180 220 350 C360 520 60 580 200 700" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
          <path d="M450 30 C450 140 100 190 240 360 C380 530 80 590 220 710" stroke="#D4AF37" strokeWidth="0.8" fill="none" />
        </svg>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 lg:px-16 pt-28 md:pt-36 pb-8 text-center md:text-left">
          <h1 className="font-playfair uppercase tracking-widest text-white leading-tight"
              style={{ fontSize: 'clamp(1.8rem, 6vw, 3.5rem)' }}>
            Shipping Details
          </h1>
          <div className="w-16 h-[2px] bg-[#D4AF37] mt-3 mx-auto md:ml-0" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-16 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-[62%_33%] gap-10 lg:gap-16 items-start">
            
            {/* LEFT — Shipping Form */}
            <div className="bg-[#111111]/80 backdrop-blur-md rounded-2xl border border-[#2a2a2a] p-6 sm:p-8 md:p-10 shadow-2xl">
              <h2 className="text-white font-medium tracking-wide text-xl mb-8 border-b border-white/5 pb-4">Contact Information</h2>
              
              {error && <p className="text-red-500 mb-6 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-widest text-gray-400">First Name</label>
                    <input 
                      type="text" name="firstName" value={formData.firstName} onChange={handleInputChange}
                      placeholder="First Name" className="w-full bg-transparent border border-[#333] focus:border-[#D4AF37] py-3 px-4 rounded-lg outline-none transition-colors text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-widest text-gray-400">Last Name</label>
                    <input 
                      type="text" name="lastName" value={formData.lastName} onChange={handleInputChange}
                      placeholder="Last Name" className="w-full bg-transparent border border-[#333] focus:border-[#D4AF37] py-3 px-4 rounded-lg outline-none transition-colors text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-gray-400">Email Address</label>
                  <input 
                    type="email" name="email" value={formData.email} onChange={handleInputChange}
                    placeholder="Your Email" className="w-full bg-transparent border border-[#333] focus:border-[#D4AF37] py-3 px-4 rounded-lg outline-none transition-colors text-sm"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-gray-400">Shipping Address</label>
                  <input 
                    type="text" name="address" value={formData.address} onChange={handleInputChange}
                    placeholder="Your Address" className="w-full bg-transparent border border-[#333] focus:border-[#D4AF37] py-3 px-4 rounded-lg outline-none transition-colors text-sm"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-gray-400">Mobile Number</label>
                  <input 
                    type="text" name="mobile" value={formData.mobile} onChange={handleInputChange}
                    placeholder="Mobile Number" className="w-full bg-transparent border border-[#333] focus:border-[#D4AF37] py-3 px-4 rounded-lg outline-none transition-colors text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-widest text-gray-400">City</label>
                    <input 
                      type="text" name="city" value={formData.city} onChange={handleInputChange}
                      placeholder="City" className="w-full bg-transparent border border-[#333] focus:border-[#D4AF37] py-3 px-4 rounded-lg outline-none transition-colors text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-widest text-gray-400">Province</label>
                    <input 
                      type="text" name="province" value={formData.province} onChange={handleInputChange}
                      placeholder="Province" className="w-full bg-transparent border border-[#333] focus:border-[#D4AF37] py-3 px-4 rounded-lg outline-none transition-colors text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-widest text-gray-400">Zip code</label>
                    <input 
                      type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange}
                      placeholder="zip code" className="w-full bg-transparent border border-[#333] focus:border-[#D4AF37] py-3 px-4 rounded-lg outline-none transition-colors text-sm"
                    />
                  </div>
                </div>

                <button 
                  type="submit" disabled={loading}
                  className="w-full bg-[#D4AF37] text-black font-semibold py-4 rounded-lg uppercase tracking-[0.2em] text-sm mt-4 hover:bg-[#c9a430] transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Continue to Delivery'}
                </button>
              </form>
            </div>

            {/* RIGHT — Order Summary */}
            <div className="lg:sticky lg:top-32">
              <div className="bg-[#111111] rounded-2xl border border-[#2a2a2a] p-8">
                <h2 className="text-white font-medium tracking-widest uppercase text-sm mb-6 pb-4 border-b border-[#2a2a2a]">Order Summary</h2>
                
                <div className="flex flex-col gap-6 mb-8 max-h-[300px] overflow-y-auto pr-2">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="w-16 h-16 bg-[#181818] rounded-lg overflow-hidden border border-[#2a2a2a]">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs uppercase font-medium tracking-wide text-white">{item.brand}</h4>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest truncate w-40">{item.name}</p>
                        <p className="text-[10px] text-gray-500 mt-1">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-xs font-medium text-white">$ {fmt((item.priceNum || parseFloat(String(item.price).replace(/[^0-9.]/g,''))) * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-4 text-xs tracking-widest uppercase text-gray-400">
                  <div className="flex justify-between">
                    <span>Amount</span>
                    <span className="text-white">$ {fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-white">Free</span>
                  </div>
                </div>

                <div className="w-full h-px bg-[#2a2a2a] my-6" />

                <div className="flex justify-between items-center">
                  <span className="text-white font-medium uppercase text-sm tracking-widest">Total</span>
                  <span className="text-white text-xl font-semibold tracking-wide">$ {fmt(total)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RELATED SECTION */}
        <div className="max-w-7xl mx-auto px-6 md:px-16 pb-24">
          <div className="text-center mb-14">
            <h2 className="font-playfair text-3xl md:text-4xl text-white tracking-widest uppercase">You May Also Like</h2>
            <div className="w-16 h-[2px] bg-[#D4AF37] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {related.map((p) => (
              <div key={p.id} className="group bg-[#111111] rounded-xl border border-[#2a2a2a] hover:border-[#D4AF37] transition-all duration-500 overflow-hidden cursor-pointer">
                <div className="aspect-square bg-[#181818] overflow-hidden relative">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="p-6">
                  <p className="text-[#D4AF37] text-[10px] tracking-[0.4em] uppercase font-bold mb-2">{p.brand}</p>
                  <div className="w-full h-px bg-[#D4AF37]/30 mb-4" />
                  <h4 className="text-white text-[13px] font-normal uppercase tracking-widest leading-snug mb-4 h-10 overflow-hidden">{p.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-semibold tracking-wide">$ {fmt(p.priceNum)}</span>
                    <button className="w-9 h-9 rounded-full border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all">
                      <CartBtnIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center py-10 mb-4">
          <p className="text-[#D4AF37] font-playfair tracking-[0.6em] text-2xl uppercase opacity-80">CHRONOS</p>
          <p className="text-gray-600 text-[10px] tracking-[0.4em] uppercase mt-2">Watches</p>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default ShippingDetails;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';

// Payment Logos
import creditLogo from '../../assets/images/ui/credit.png';
import applePayLogo from '../../assets/images/ui/apple_pay_logo.png';
import paypalLogo from '../../assets/images/ui/paypal.png';

// ─── Related products (Same as ShippingDetails for consistency) ─────────────────────────
import rImg1 from '../../assets/images/products/latest1.png';
import rImg2 from '../../assets/images/products/latest2.png';
import rImg3 from '../../assets/images/products/latest3.png';

const RELATED = [
  { id: 'r1', brand: 'ROLEX', name: 'Submariner Black',       priceNum: 8000,  image: rImg1 },
  { id: 'r2', brand: 'ROLEX', name: 'Royal Chronograph Gold', priceNum: 11000, image: rImg2 },
  { id: 'r3', brand: 'OMEGA', name: 'Ocean Blue Master',      priceNum: 9800,  image: rImg3 },
];

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

function PaymentDetails() {
  const { cartItems, clearCart, shippingDetails, shippingMethod } = useCart();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('Credit/Debit');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    cardName: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const subtotal = cartItems.reduce((s, i) => {
    const price = typeof i.priceNum === 'number' ? i.priceNum : parseFloat(String(i.price ?? '0').replace(/,/g, '')) || 0;
    return s + price * i.quantity;
  }, 0);
  const discountAmt = Math.round(subtotal * 0.15);
  const total = subtotal - discountAmt;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    // Simple validation for card data
    if (paymentMethod === 'Credit/Debit') {
      if (!cardData.cardNumber || !cardData.expiry || !cardData.cvc || !cardData.cardName) {
        setError("Please fill in all card details.");
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        items: cartItems.map((item) => ({
          brand: item.brand,
          name: item.name,
          price: typeof item.priceNum === 'number' ? item.priceNum : parseFloat(String(item.price ?? '0').replace(/,/g, '')),
          color: item.color,
          size: item.size ?? 'M',
          quantity: item.quantity,
        })),
        subtotal,
        discount: discountAmt,
        total,
        shippingDetails,
        shippingMethod,
        paymentMethod
      };

      const res = await axios.post('http://localhost:5000/checkout', payload);
      
      if (res.data.success) {
        clearCart();
        alert("Order placed successfully! Order ID: " + res.data.orderId);
        navigate('/home');
      } else {
        setError(res.data.message || "Order placement failed.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
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
        <div className="max-w-7xl mx-auto px-6 md:px-16 pt-36 pb-8 text-left">
          <h1 className="font-playfair text-4xl md:text-5xl text-white tracking-widest uppercase">
            Checkout - Payment Details
          </h1>
          <div className="w-24 h-[3px] bg-[#D4AF37] mt-4" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-16 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-[60%_35%] gap-12 items-start">
            
            {/* LEFT — Payment Details Form */}
            <div className="bg-[#111111]/80 backdrop-blur-md rounded-2xl border border-[#2a2a2a] p-8 md:p-10">
              <h2 className="text-white font-medium tracking-wide text-xl mb-8">payment Details</h2>
              
              {error && <p className="text-red-500 mb-6 text-sm">{error}</p>}

              {/* Payment Tabs */}
              <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-none">
                {['Credit/Debit', 'Apple pay', 'PayPal'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-lg border transition-all duration-300 whitespace-nowrap ${
                      paymentMethod === method 
                        ? 'bg-[#D4AF37] border-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                        : 'bg-transparent border-[#2a2a2a] text-gray-400 hover:border-[#D4AF37]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                        {method === 'Credit/Debit' && (
                            <img src={creditLogo} alt="Credit Card" className="w-8 h-auto object-contain mix-blend-lighten" />
                        )}
                        {method === 'Apple pay' && (
                            <img src={applePayLogo} alt="Apple Pay" className="w-10 h-auto object-contain mix-blend-lighten" />
                        )}
                        {method === 'PayPal' && (
                            <img src={paypalLogo} alt="PayPal" className="w-12 h-auto object-contain mix-blend-lighten" />
                        )}
                        <span className={`text-xs font-medium ${paymentMethod === method ? 'text-black' : 'text-gray-400'}`}>{method}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Card Form */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500">Card number</label>
                    <input 
                      type="text" name="cardNumber" value={cardData.cardNumber} onChange={handleInputChange}
                      placeholder="XXXX XXXX XXXX XXXX" className="w-full bg-transparent border border-[#2a2a2a] focus:border-[#D4AF37] py-4 px-5 rounded-lg outline-none transition-colors text-sm font-light tracking-[0.2em]"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500">MM / YY</label>
                    <input 
                      type="text" name="expiry" value={cardData.expiry} onChange={handleInputChange}
                      placeholder="MM / YY" className="w-full bg-transparent border border-[#2a2a2a] focus:border-[#D4AF37] py-4 px-5 rounded-lg outline-none transition-colors text-sm font-light tracking-[0.2em]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500">CVC</label>
                    <input 
                      type="password" name="cvc" value={cardData.cvc} onChange={handleInputChange}
                      placeholder="CVC" className="w-full bg-transparent border border-[#2a2a2a] focus:border-[#D4AF37] py-4 px-5 rounded-lg outline-none transition-colors text-sm font-light tracking-[0.2em]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500">Name of card</label>
                    <input 
                      type="text" name="cardName" value={cardData.cardName} onChange={handleInputChange}
                      placeholder="NAME ON CARD" className="w-full bg-transparent border border-[#2a2a2a] focus:border-[#D4AF37] py-4 px-5 rounded-lg outline-none transition-colors text-sm font-light tracking-[0.2em] uppercase"
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-4 mt-8">
                  <button 
                    onClick={() => navigate('/checkout/shipping-method')}
                    className="flex-1 border border-[#D4AF37] text-[#D4AF37] font-semibold py-4 rounded-lg uppercase tracking-[0.2em] text-sm hover:bg-[#D4AF37]/10 transition-all"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-[2] bg-[#D4AF37] text-black font-semibold py-4 rounded-lg uppercase tracking-[0.2em] text-sm hover:bg-[#c9a430] transition-all disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Place order'}
                  </button>
                </div>
              </div>
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
                      <span className="text-xs font-medium text-white">$ {fmt((item.priceNum || parseFloat(String(item.price).replace(/,/g,''))) * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-4 text-xs tracking-widest uppercase text-gray-400">
                  <div className="flex justify-between">
                    <span>Amount</span>
                    <span className="text-white">$ {fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span className="text-[#D4AF37]">15%</span>
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
            {RELATED.map((p) => (
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

export default PaymentDetails;

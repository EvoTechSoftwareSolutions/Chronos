import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import emailjs from '@emailjs/browser';

// Payment Logos
import creditLogo from '../../assets/images/ui/credit.png';
import applePayLogo from '../../assets/images/ui/apple_pay_logo.png';
import paypalLogo from '../../assets/images/ui/paypal.png';



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
    const price = typeof i.priceNum === 'number' ? i.priceNum : parseFloat(String(i.price ?? '0').replace(/[^0-9.]/g, '')) || 0;
    return s + price * i.quantity;
  }, 0);
  const discountAmt = 0;
  const total = subtotal;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({ ...prev, [name]: value }));
  };

  const [successMsg, setSuccessMsg] = useState('');

  const [relatedProducts, setRelatedProducts] = useState([]);

  React.useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => {
        const all = res.data;
        const filtered = all.slice(0, 3).map(p => {
          let imgs = [];
          try { 
            const parsed = JSON.parse(p.images); 
            if (Array.isArray(parsed)) imgs = parsed;
          } catch(e){}
          return {
            ...p,
            image: (imgs && imgs[0]) ? `http://localhost:5000${imgs[0]}` : p.image_url ? `http://localhost:5000${p.image_url}` : null
          };
        });
        setRelatedProducts(filtered);
      })
      .catch(console.error);
  }, []);

  const sendOrderMails = (orderId) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const profileEmail = user.email;
    const shipEmail = shippingDetails?.email;
    
    // Format cart items
    const itemsList = cartItems.map(item => 
      `${item.quantity}x ${item.brand} ${item.name} - Rs. ${fmt((item.priceNum || parseFloat(String(item.price).replace(/[^0-9.]/g,''))) * item.quantity)}`
    ).join('\n<br>\n');
    
    // Address string
    const addressStr = `${shippingDetails?.firstName} ${shippingDetails?.lastName}<br>${shippingDetails?.address}<br>${shippingDetails?.city}, ${shippingDetails?.province} ${shippingDetails?.zipCode}<br>Mobile: ${shippingDetails?.mobile}`;

    const sendMail = (targetEmail) => {
      const templateParams = {
        to_email: targetEmail,
        email: targetEmail,
        user_email: targetEmail,
        recipient_email: targetEmail,
        customer_name: shippingDetails?.firstName || "Valued Customer",
        order_id: String(orderId),
        subtotal: fmt(subtotal),
        total: fmt(total),
        items_list: itemsList,
        shipping_address: addressStr
      };

      emailjs.send(
        'service_x486mx3',
        'template_0wiujko',
        templateParams,
        '_VBkrk2a0KdGSbidM'
      ).then(res => {
        console.log("EmailJS Success:", res);
      }).catch(err => {
        console.error("EmailJS Error:", err);
        alert(`EmailJS Failed: ${err.text || JSON.stringify(err)}\n\nIf you created a new EmailJS account, make sure to update the Public Key 'jRpr4VVc-GA7LLA3Z' in PaymentDetails.jsx!`);
      });
    };

    // Send to shipping email
    if (shipEmail) sendMail(shipEmail);
    // Send to profile email if distinct
    if (profileEmail && profileEmail !== shipEmail) sendMail(profileEmail);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    try {
      // Get logged-in user from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const payload = {
        items: cartItems.map((item) => ({
          id: item.id,
          brand: item.brand,
          name: item.name,
          price: typeof item.priceNum === 'number' ? item.priceNum : parseFloat(String(item.price ?? '0').replace(/[^0-9.]/g, '')),
          color: item.color,
          size: item.size ?? 'M',
          quantity: item.quantity,
        })),
        subtotal,
        discount: discountAmt,
        total,
        shippingDetails,
        shippingMethod,
        paymentMethod,
        email: user.email || shippingDetails?.email,
        accountId: user.account_id || null
      };

      const res = await axios.post('http://localhost:5000/checkout', payload);
      
      if (res.data.success) {
        const orderId = res.data.orderId;

        if (paymentMethod === 'Credit/Debit') {
          // Fetch PayHere Hash
          const hashRes = await axios.post('http://localhost:5000/generate-payhere-hash', {
            order_id: orderId,
            amount: total,
            currency: 'LKR'
          });

          const { hash, merchant_id } = hashRes.data;

          // Initialize PayHere payment
          const payment = {
            sandbox: true,
            merchant_id: merchant_id,
            return_url: "http://localhost:5173/home", 
            cancel_url: "http://localhost:5173/checkout/payment-details",
            notify_url: "http://localhost:5000/payhere-notify",
            order_id: String(orderId),
            items: "Chronos Luxury Watches Order #" + orderId,
            amount: Number(total).toFixed(2),
            currency: "LKR",
            hash: hash,
            first_name: shippingDetails?.firstName || "Guest",
            last_name: shippingDetails?.lastName || "Customer",
            email: shippingDetails?.email || "customer@example.com",
            phone: shippingDetails?.mobile || "",
            address: shippingDetails?.address || "",
            city: shippingDetails?.city || "",
            country: "Sri Lanka",
          };

          window.payhere.onCompleted = function onCompleted(orderId) {
            
            axios.post('http://localhost:5000/api/orders/update-payment-status', {
               orderId: orderId,
               status: 'Paid'
            }).catch(console.error);

            sendOrderMails(orderId);

            clearCart();
            setLoading(false);
            navigate(`/checkout/success/${orderId}`);
          };
          window.payhere.onDismissed = function onDismissed() {
            setError("Payment dismissed. Your order is pending payment. Please try again.");
            setLoading(false);
          };
          window.payhere.onError = function onError(error) {
            setError("Payment error: " + error);
            setLoading(false);
          };

          window.payhere.startPayment(payment);

        } else {
          sendOrderMails(orderId);
          clearCart();
          setSuccessMsg("Order placed successfully! Order ID: " + orderId);
          setLoading(false);
        }

      } else {
        setError(res.data.message || "Order placement failed.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Server error. Please try again.";
      setError(msg);
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
        <div className="max-w-7xl mx-auto px-6 lg:px-16 pt-28 md:pt-36 pb-8 text-center md:text-left">
          <h1 className="font-playfair uppercase tracking-widest text-white leading-tight"
              style={{ fontSize: 'clamp(1.8rem, 6vw, 3.5rem)' }}>
            Payment Details
          </h1>
          <div className="w-16 h-[2px] bg-[#D4AF37] mt-3 mx-auto md:ml-0" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-16 pb-20">
          {successMsg ? (
            <div className="flex flex-col items-center justify-center py-24 mb-10 border border-[#D4AF37]/30 bg-[#111111]/80 rounded-2xl shadow-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 md:h-24 w-20 md:w-24 text-[#D4AF37] mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-[#D4AF37] text-2xl md:text-3xl font-playfair tracking-widest uppercase mb-4 text-center px-4 leading-tight">{successMsg}</h2>
              <p className="text-gray-400 text-xs md:text-sm tracking-wide mb-10 text-center max-w-md px-6 leading-relaxed">An order confirmation email has been dispatched. Thank you for shopping with Chronos Luxury Watches.</p>
              <button 
                onClick={() => navigate('/home')}
                className="px-8 md:px-10 py-3.5 md:py-4 border border-[#D4AF37] text-[#D4AF37] font-semibold rounded-full uppercase tracking-widest text-[10px] md:text-xs hover:bg-[#D4AF37] hover:text-black transition-all"
              >
                Return to Collection
              </button>
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[62%_33%] gap-10 lg:gap-16 items-start">
            
            {/* LEFT — Payment Details Form */}
            <div className="bg-[#111111]/80 backdrop-blur-md rounded-2xl border border-[#2a2a2a] p-6 sm:p-8 md:p-10 shadow-2xl">
              <h2 className="text-white font-medium tracking-wide text-xl mb-8 border-b border-white/5 pb-4">Payment Method</h2>
              
              {error && <p className="text-red-500 mb-6 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

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

              {/* Secure Payment Summary */}
              <div className="flex flex-col gap-6 mt-4">
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-[#2a2a2a] rounded-xl bg-[#151515] relative overflow-hidden group">
                  {/* Subtle Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {paymentMethod === 'Credit/Debit' ? (
                    <>
                      <img src={creditLogo} alt="Credit Card" className="h-10 mb-6 opacity-80 mix-blend-lighten drop-shadow-[0_0_15px_rgba(212,175,55,0.2)]" />
                      <h3 className="text-[#D4AF37] font-playfair tracking-widest uppercase mb-3 text-lg">Secure Gateway</h3>
                      <p className="text-gray-400 text-xs tracking-wider leading-relaxed max-w-[280px]">
                        You will be securely redirected to PayHere's encrypted portal to complete your transaction without storing any card details on our servers.
                      </p>
                    </>
                  ) : paymentMethod === 'Apple pay' ? (
                    <>
                      <img src={applePayLogo} alt="Apple Pay" className="h-12 mb-6 opacity-80 mix-blend-lighten drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                      <h3 className="text-white font-playfair tracking-widest uppercase mb-3 text-lg">Apple Pay Check</h3>
                      <p className="text-gray-400 text-xs tracking-wider leading-relaxed max-w-[280px]">
                        Complete your purchase instantly using Apple Pay. Please make sure you have an active Apple Wallet configuration.
                      </p>
                    </>
                  ) : (
                    <>
                      <img src={paypalLogo} alt="PayPal" className="h-12 mb-6 opacity-90 mix-blend-lighten drop-shadow-[0_0_15px_rgba(0,112,186,0.2)]" />
                      <h3 className="text-blue-400 font-playfair tracking-widest uppercase mb-3 text-lg">PayPal Checkout</h3>
                      <p className="text-gray-400 text-xs tracking-wider leading-relaxed max-w-[280px]">
                        You will be redirected to PayPal's secure login environment to approve the final amount and review payment resources.
                      </p>
                    </>
                  )}
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
                    {loading ? 'Processing...' : `Pay With ${paymentMethod}`}
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
                      <span className="text-xs font-medium text-white">Rs. {fmt((item.priceNum || parseFloat(String(item.price).replace(/[^0-9.]/g,''))) * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-4 text-xs tracking-widest uppercase text-gray-400">
                  <div className="flex justify-between">
                    <span>Amount</span>
                    <span className="text-white">Rs. {fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-white">Free</span>
                  </div>
                </div>

                <div className="w-full h-px bg-[#2a2a2a] my-6" />

                <div className="flex justify-between items-center">
                  <span className="text-white font-medium uppercase text-sm tracking-widest">Total</span>
                  <span className="text-white text-xl font-semibold tracking-wide">Rs. {fmt(total)}</span>
                </div>
              </div>
            </div>

          </div>
          )}
        </div>

        {/* RELATED SECTION */}
        <div className="max-w-7xl mx-auto px-6 md:px-16 pb-24">
          <div className="text-center mb-14">
            <h2 className="font-playfair text-3xl md:text-4xl text-white tracking-widest uppercase">You May Also Like</h2>
            <div className="w-16 h-[2px] bg-[#D4AF37] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {relatedProducts.map((p) => (
              <div key={p.id} onClick={() => navigate(`/product/${(p.category || 'luxury').toLowerCase()}/${p.id}`)} className="group bg-[#111111] rounded-xl border border-[#2a2a2a] hover:border-[#D4AF37] transition-all duration-500 overflow-hidden cursor-pointer">
                <div className="aspect-square bg-[#181818] overflow-hidden relative">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="p-6">
                  <p className="text-[#D4AF37] text-[10px] tracking-[0.4em] uppercase font-bold mb-2">{p.brand}</p>
                  <div className="w-full h-px bg-[#D4AF37]/30 mb-4" />
                  <h4 className="text-white text-[13px] font-normal uppercase tracking-widest leading-snug mb-4 h-10 overflow-hidden">{p.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-semibold tracking-wide">Rs. {fmt(p.price || p.priceNum || 0)}</span>
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

import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';

// dynamically loading data

const SRI_LANKA = {
  "Central": ["Kandy", "Matale", "Nuwara Eliya"],
  "Eastern": ["Ampara", "Batticaloa", "Trincomalee"],
  "North Central": ["Anuradhapura", "Polonnaruwa"],
  "Northern": ["Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya"],
  "North Western": ["Kurunegala", "Puttalam"],
  "Sabaragamuwa": ["Kegalle", "Ratnapura"],
  "Southern": ["Galle", "Matara", "Hambantota"],
  "Uva": ["Badulla", "Moneragala"],
  "Western": ["Colombo", "Gampaha", "Kalutara"],
};

function getLoggedInEmail() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.email || "";
  } catch {
    return "";
  }
}

function addressesKey(email) {
  return `chronos_shipping_addresses_${email || "guest"}`;
}

function safeJsonParse(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function loadSavedAddresses(email) {
  const key = addressesKey(email);
  const stored = localStorage.getItem(key);
  const parsed = safeJsonParse(stored || "[]", []);
  return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
}

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

  // Checkout is behind login. Use logged-in email ONLY as the storage key owner.
  // Shipping details email is allowed to differ (contact email for this order).
  const accountEmail = useMemo(() => getLoggedInEmail(), []);
  const [selectedSavedId, setSelectedSavedId] = useState("new");

  const [savedAddresses, setSavedAddresses] = useState(() => loadSavedAddresses(accountEmail));

  React.useEffect(() => {
    setSavedAddresses(loadSavedAddresses(accountEmail));
    setSelectedSavedId("new");
  }, [accountEmail]);

  React.useEffect(() => {
    const onStorage = (e) => {
      if (!accountEmail) return;
      if (e && typeof e.key === "string" && e.key !== addressesKey(accountEmail)) return;
      setSavedAddresses(loadSavedAddresses(accountEmail));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [accountEmail]);

  const provinces = useMemo(() => Object.keys(SRI_LANKA), []);
  const districts = useMemo(() => {
    const prov = formData.province;
    return prov && SRI_LANKA[prov] ? SRI_LANKA[prov] : [];
  }, [formData.province]);

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

  const selectSavedAddress = (id) => {
    setSelectedSavedId(id);
    if (id === "new") {
      setFormData({
        firstName: '',
        lastName: '',
        email: formData.email || accountEmail || '',
        address: '',
        mobile: '',
        city: '',
        province: '',
        zipCode: '',
      });
      setError('');
      return;
    }
    const found = savedAddresses.find((a) => String(a.id) === String(id));
    if (!found) return;
    setFormData({
      firstName: found.firstName || '',
      lastName: found.lastName || '',
      email: found.email || accountEmail || '',
      address: found.address || '',
      mobile: found.mobile || '',
      city: found.city || '',
      province: found.province || '',
      zipCode: found.zipCode || '',
    });
    setError('');
  };

  const removeSavedAddress = (id) => {
    if (id === "new") return;
    const key = addressesKey(accountEmail);
    const updated = savedAddresses.filter((a) => String(a.id) !== String(id));
    localStorage.setItem(key, JSON.stringify(updated));
    setSavedAddresses(updated);
    setSelectedSavedId("new");
    setFormData({
      firstName: '',
      lastName: '',
      email: accountEmail || '',
      address: '',
      mobile: '',
      city: '',
      province: '',
      zipCode: '',
    });
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

    // Persist address for reuse (per logged-in account), but keep shipping email as user-entered.
    const key = addressesKey(accountEmail);
    const list = loadSavedAddresses(accountEmail);

    const nextId =
      selectedSavedId !== "new"
        ? selectedSavedId
        : `addr_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    const nextAddress = { id: nextId, ...formData };
    const nextList = [
      nextAddress,
      ...list.filter((a) => String(a.id) !== String(nextId)),
    ].slice(0, 10); // keep last 10

    localStorage.setItem(key, JSON.stringify(nextList));
    setSavedAddresses(nextList);
    setSelectedSavedId(String(nextId));

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
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-gray-400">Shipping address</label>
                  <div className="relative flex items-center gap-3">
                    <select
                      value={selectedSavedId}
                      onChange={(e) => selectSavedAddress(e.target.value)}
                      className="flex-1 bg-transparent text-white border border-[#333] focus:border-[#D4AF37] py-3 px-4 rounded-lg outline-none transition-colors text-sm"
                    >
                      <option value="new" className="text-black">+ Add New Address</option>
                      {savedAddresses.map((a) => (
                        <option key={a.id} value={a.id} className="text-black">
                          {a.firstName} {a.lastName} — {a.address}, {a.city} ({a.province})
                        </option>
                      ))}
                    </select>
                    {selectedSavedId !== "new" && (
                      <button
                        type="button"
                        onClick={() => removeSavedAddress(selectedSavedId)}
                        className="p-3 text-red-500 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-lg transition-all"
                        title="Remove this address"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {savedAddresses.length > 0
                      ? "Select a saved address to reuse it, or choose “Add New Address” to enter different shipping details."
                      : "No saved addresses yet. Choose “Add New Address” and submit to save it for next time."}
                  </p>
                </div>

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
                    <label className="text-xs uppercase tracking-widest text-gray-400">Province</label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={(e) => {
                        const province = e.target.value;
                        const nextDistricts = SRI_LANKA[province] || [];
                        setFormData((prev) => ({
                          ...prev,
                          province,
                          city: nextDistricts.includes(prev.city) ? prev.city : (nextDistricts[0] || ''),
                        }));
                      }}
                      className="w-full bg-transparent text-white border border-[#333] focus:border-[#D4AF37] py-3 px-4 rounded-lg outline-none transition-colors text-sm"
                    >
                      <option value="" className="text-black">Select Province</option>
                      {provinces.map((p) => (
                        <option key={p} value={p} className="text-black">{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-widest text-gray-400">District</label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!formData.province}
                      className="w-full bg-transparent text-white border border-[#333] focus:border-[#D4AF37] py-3 px-4 rounded-lg outline-none transition-colors text-sm disabled:opacity-50"
                    >
                      <option value="" className="text-black">{formData.province ? "Select District" : "Select Province First"}</option>
                      {districts.map((d) => (
                        <option key={d} value={d} className="text-black">{d}</option>
                      ))}
                    </select>
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
                    <span className="text-white text-sm font-semibold tracking-wide">Rs. {fmt(p.priceNum)}</span>
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

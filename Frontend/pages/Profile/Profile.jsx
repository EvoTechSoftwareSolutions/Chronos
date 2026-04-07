import React, { useState, useEffect } from 'react';
import { Package, Settings, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SettingsView from './SettingsView';

import './Profile.css';

function Profile() {
  const [currentView, setCurrentView] = useState('profile');
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [orders, setOrders] = useState([]);
  
  const [reviewOrder, setReviewOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const usr = JSON.parse(localStorage.getItem('user') || '{}');
    if(!usr.email) {
       navigate('/login');
    } else {
       setUser(usr);
    }
  }, [navigate]);

  useEffect(() => {
    if(currentView === 'orders' && user.email) {
       axios.get(`http://localhost:5000/api/user/orders?email=${user.email}`)
        .then(res => {
          if (res.data.success) {
            const mappedOrders = res.data.orders.map(o => {
              let items = [];
              try { items = JSON.parse(o.items); } catch(e){}
              
              // Map to UI friendly format
              return {
                ...o,
                displayDate: new Date(o.created_at).toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric' }),
                itemSummary: items.map(i => i.name).join(', '),
                itemCount: items.reduce((sum, item) => sum + item.quantity, 0) + " Items",
                displayTotal: "$ " + Number(o.total).toLocaleString()
              };
            });
            setOrders(mappedOrders);
          }
        })
        .catch(console.error);
    }
  }, [currentView, user.email]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const submitReview = () => {
     axios.post("http://localhost:5000/api/reviews", {
         product_id: parseInt(reviewOrder.id) || 1,
         order_id: parseInt(reviewOrder.id) || 1,
         rating,
         comment
     }).then(() => {
         alert("Feedback submitted successfully!");
         setReviewOrder(null);
         setComment("");
     }).catch(console.error);
  };

  return (
    <div className="bg-black text-white w-full min-h-screen relative">
      <Navbar />

      <main className="profile-main-content">
        <div className="wave-bg"></div>

        {currentView === 'profile' ? (
          <>
            <header className="profile-header w-heading">
              <h3 className="subtitle">Manage Your Profile</h3>
              <h1 className="title b-heading">Profile</h1>
              <h2 className="welcome-text b-heading">WELCOME TO CHRONOS</h2>
              <p className="welcome-subtext">
                Sign in to manage your orders, track shipments, and access exclusive member benefits.
              </p>
            </header>

            <section className="profile-pic-container">
              <div className="profile-pic-wrapper">
                <div className="profile-pic profile-avatar">{(user.name || 'U').charAt(0).toUpperCase()}</div>
              </div>
              <h3 className="profile-name">{user.name || "Registered Client"}</h3>
              <p className="text-gray-400 text-sm mt-1">{user.email}</p>
            </section>

            <section className="actions-grid">
              <div className="action-card" onClick={() => setCurrentView('orders')}>
                <div className="card-icon">
                  <Package size={24} />
                </div>
                <h3 className="card-title b-heading">My Orders</h3>
                <p className="card-desc">Track your Purchases</p>
              </div>

              <div className="action-card" onClick={() => setCurrentView('settings')}>
                <div className="card-icon">
                  <Settings size={24} />
                </div>
                <h3 className="card-title b-heading">Settings</h3>
                <p className="card-desc">Manage your Profile</p>
              </div>
            </section>

            <div className="logout-btn-container">
              <button className="logout-btn" onClick={handleLogout}>Log Out</button>
            </div>
          </>
        ) : currentView === 'orders' ? (
          <div className="orders-view-container">
            <section className="orders-profile-pic-container">
              <div className="profile-pic-wrapper small-profile-pic">
                <div className="profile-pic profile-avatar">{(user.name || 'U').charAt(0).toUpperCase()}</div>
              </div>
              <h3 className="orders-profile-name">{user.name || "Registered Client"}</h3>
            </section>

            <div className="orders-nav-header">
              <button className="back-to-profile-btn" onClick={() => setCurrentView('profile')}>
                <div className="back-icon-wrapper">
                  <ChevronLeft size={16} />
                </div>
                <span>Back To Profile</span>
              </button>
            </div>

            <h1 className="orders-main-title b-heading">My Orders</h1>

            <div className="orders-list">
              {orders.length === 0 && (
                <div className="text-center py-20 opacity-50">
                  <p className="uppercase tracking-[0.3em] text-sm">No orders found yet</p>
                </div>
              )}
              {orders.map((order, idx) => (
                <div key={idx} className="order-item-card flex flex-col">
                  <div className="flex w-full justify-between items-center">
                    <div className="order-card-content">
                      <div className="order-card-header">
                        <h3 className="order-id">ORDER #{order.id}</h3>
                        <div className="flex gap-2">
                           <span className={`badge-${(order.payment_status || 'Pending').toLowerCase()}`}>{order.payment_status || 'Pending'}</span>
                           <span className="badge-processing">{order.order_status || 'Processing'}</span>
                        </div>
                      </div>
                      <p className="order-product-name">{order.itemSummary}</p>
                      <div className="order-details-bottom">
                        <span className="order-date">{order.displayDate}</span>
                        <span className="order-items-count">{order.itemCount}</span>
                        <span className="order-price">{order.displayTotal}</span>
                      </div>
                    </div>
                  </div>
                  {order.order_status === 'Delivered' && (
                     <div className="mt-4 border-t border-gray-700 pt-3">
                        <button onClick={() => setReviewOrder(order)} className="text-[#D4AF37] text-sm font-semibold tracking-widest uppercase hover:text-white transition">Leave Feedback</button>
                     </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : currentView === 'settings' ? (
          <SettingsView onBack={() => setCurrentView('profile')} />
        ) : null}
        
        {/* Feedback Modal */}
        {reviewOrder && (
           <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
             <div className="bg-[#111111] border border-[#D4AF37] p-8 rounded-xl w-[90%] max-w-[400px]">
                <h3 className="text-white text-xl font-semibold mb-4 uppercase tracking-widest text-[#D4AF37]">Rate Your Purchase</h3>
                <p className="text-gray-400 text-sm mb-6 uppercase tracking-widest">{reviewOrder.product}</p>
                <div className="flex gap-2 mb-6">
                   {[1,2,3,4,5].map(star => (
                      <Star key={star} onClick={() => setRating(star)} size={24} className={`cursor-pointer ${rating >= star ? "text-[#D4AF37] fill-[#D4AF37]" : "text-gray-600"}`} />
                   ))}
                </div>
                <textarea 
                   className="w-full bg-[#181818] border border-gray-700 text-white p-3 rounded-lg outline-none focus:border-[#D4AF37] mb-6" 
                   rows="4" 
                   value={comment}
                   onChange={e => setComment(e.target.value)}
                   placeholder="Tell us what you think..."
                />
                <div className="flex justify-between">
                   <button onClick={() => setReviewOrder(null)} className="text-gray-400 hover:text-white transition uppercase text-sm tracking-widest">Cancel</button>
                   <button onClick={submitReview} className="bg-[#D4AF37] text-black px-6 py-2 rounded font-semibold uppercase text-sm tracking-widest hover:bg-white transition">Submit</button>
                </div>
             </div>
           </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Profile;

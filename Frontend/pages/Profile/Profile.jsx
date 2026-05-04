import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Package, MapPin, CreditCard, Truck, X, Settings, Star, Camera } from 'lucide-react';
import profilePlaceholder from '../../assets/imageperson.png';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../SettingView and Collection.css';
import SettingsView from '../SettingsView/SettingsView';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('main'); // 'main', 'orders', 'settings'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || { name: 'Customer', email: '' });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [toastStatus, setToastStatus] = useState({ show: false, hiding: false });

  useEffect(() => {
    if (!user.email) {
      setLoading(false);
      return;
    }
    fetchUserOrders();
  }, [user.email]);

  const fetchUserOrders = () => {
    axios.get(`http://localhost:5000/api/user/orders?email=${user.email}`)
      .then(res => {
        if (res.data.success) {
          const mapped = res.data.orders.map(o => {
             let items = [];
             try { items = JSON.parse(o.items); } catch(e){}
             return {
                id: "ORD-" + String(o.id).padStart(4, "0"),
                rawId: o.id,
                date: new Date(o.created_at).toLocaleDateString(),
                placedOn: new Date(o.created_at).toDateString(),
                status: o.payment_status || 'Processing',
                order_status: o.order_status || 'Processing',
                productName: items[0]?.name || 'Chronos Timepiece',
                productId: items[0]?.id,
                itemsCount: items.length + (items.length === 1 ? ' Item' : ' Items'),
                price: '$ ' + o.total,
                address: `${o.address}, ${o.city}, ${o.province} ${o.zip_code}`,
                payment: o.payment_method || 'Credit/Debit',
                tracking: 'TRACK-' + Math.random().toString(36).substring(7).toUpperCase()
             };
          });
          setOrders(mapped);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('auth-changed'));
    navigate('/login');
  };

  const submitFeedback = (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    
    // GUARD: Ensure product ID exists (missing for orders placed before data sync fix)
    if (!selectedOrder.productId) {
       alert("Data Limitation: This order was placed before the review system was fully integrated. Reviews can only be submitted for more recent purchases. We apologize for the inconvenience.");
       setShowFeedback(false);
       return;
    }

    setSubmittingFeedback(true);
    
    axios.post('http://localhost:5000/api/reviews', {
      product_id: selectedOrder.productId,
      order_id: selectedOrder.rawId,
      rating: feedbackRating,
      comment: feedbackComment,
      customer_name: user?.name || user?.email?.split('@')[0] || "Customer"
    })
    .then(() => {
      setShowFeedback(false);
      setFeedbackComment('');
      setSubmittingFeedback(false);
      
      // Show Luxury Success Toast
      setToastStatus({ show: true, hiding: false });
      setTimeout(() => setToastStatus(prev => ({ ...prev, hiding: true })), 3500);
      setTimeout(() => setToastStatus({ show: false, hiding: false }), 4000);
    })
    .catch(err => {
      console.error(err);
      const msg = err.response?.data?.message || "Error submitting review. Please try again.";
      alert(msg);
      setSubmittingFeedback(false);
    });
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('email', user.email);

    // Update local state temporarily for UX
    const reader = new FileReader();
    reader.onload = (event) => {
       const newUser = { ...user, avatar: event.target.result };
       setUser(newUser);
       localStorage.setItem('user', JSON.stringify(newUser));
    };
    reader.readAsDataURL(file);

    // In a real app we'd upload to backend here:
    // axios.post('http://localhost:5000/api/user/avatar', formData)...
  };

  const renderMain = () => (
    <div className="main-content">
      <div className="profile-header">
        <h3 className="subtitle b-heading">Manage Your Profile</h3>
        <h1 className="title b-heading">Profile</h1>
        <h2 className="welcome-text b-heading">Welcome, {user.name.split(' ')[0]}</h2>
        <p className="welcome-subtext">
          Manage your orders, track shipments, and access<br/>exclusive member benefits.
        </p>
      </div>

      <div className="profile-pic-container">
        <div className="profile-pic-wrapper relative">
          <img src={user.avatar || profilePlaceholder} alt={user.name} className="profile-pic" />
          <label className="absolute bottom-0 right-0 p-2 bg-[#D4AF37] rounded-full cursor-pointer hover:scale-110 transition-transform">
             <Camera size={16} color="black" />
             <input type="file" className="hidden" onChange={handleProfilePhotoChange} />
          </label>
        </div>
        <h3 className="profile-name">{user.name}</h3>
        <p className="text-gray-500 text-xs">{user.email}</p>
      </div>

      <div className="actions-grid">
        <div className="action-card" onClick={() => setCurrentView('orders')}>
          <div className="card-icon">
            <Package size={24} />
          </div>
          <h3 className="card-title">My Orders</h3>
          <p className="card-desc">Track your Purchases</p>
        </div>

        <div className="action-card" onClick={() => setCurrentView('settings')}>
          <div className="card-icon">
            <Settings size={24} />
          </div>
          <h3 className="card-title">Settings</h3>
          <p className="card-desc">Manage your Profile</p>
        </div>
      </div>

      <div className="logout-btn-container">
        <button className="logout-btn" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="main-content">
      <div className="orders-view-container">
        <section className="orders-profile-pic-container">
          <div className="profile-pic-wrapper small-profile-pic">
            <img src={user.avatar || profilePlaceholder} alt={user.name} className="profile-pic" />
          </div>
          <h3 className="orders-profile-name">{user.name}</h3>
        </section>

        <div className="orders-nav-header">
          <button className="back-to-profile-btn" onClick={() => setCurrentView('main')}>
            <div className="back-icon-wrapper">
              <ChevronLeft size={16} />
            </div>
            <span>Back To Profile</span>
          </button>
        </div>

        <h1 className="orders-main-title">My Orders</h1>

        {orders.length === 0 ? (
          <div className="empty-orders text-center py-20">
             <p className="text-gray-500">You haven't placed any orders yet.</p>
             <button onClick={() => navigate('/collection')} className="mt-4 text-[#D4AF37] underline">Start Shopping</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order, index) => (
              <div key={index} className="order-item-card" onClick={() => setSelectedOrder(order)}>
                <div className="order-card-content">
                  <div className="order-card-header">
                    <span className="order-id">{order.id}</span>
                    <span className={`badge-delivered ${order.order_status?.toLowerCase()}`}>{order.order_status}</span>
                  </div>
                  <span className="order-product-name">{order.productName}</span>
                  <div className="order-details-bottom">
                    <span className="order-date">{order.date}</span>
                    <span className="order-items-count">{order.itemsCount}</span>
                    <span className="order-price">{order.price}</span>
                  </div>
                </div>
                <div className="order-arrow">
                  <ChevronRight size={24} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedOrder(null)}>
              <X size={24} />
            </button>
            
            <h2 className="modal-title">{selectedOrder.id}</h2>
            <p className="modal-subtitle">Order placed on {selectedOrder.placedOn}</p>
            
            <div className="modal-status-row">
              <span className="modal-status-label">Status</span>
              <span className={`badge-delivered ${selectedOrder.order_status?.toLowerCase()}`}>{selectedOrder.order_status}</span>
            </div>
            
            <div className="modal-details-list">
              <div className="modal-detail-item">
                <div className="modal-icon"><Package size={24} /></div>
                <div>
                  <div className="modal-detail-title">{selectedOrder.productName}</div>
                  <div className="modal-detail-subtitle">{selectedOrder.itemsCount} · {selectedOrder.price}</div>
                </div>
              </div>

              <div className="modal-detail-item">
                <div className="modal-icon"><MapPin size={24} /></div>
                <div>
                  <div className="modal-detail-title">Shipping Address</div>
                  <div className="modal-detail-subtitle">{selectedOrder.address}</div>
                </div>
              </div>

              <div className="modal-detail-item">
                <div className="modal-icon"><CreditCard size={24} /></div>
                <div>
                  <div className="modal-detail-title">Payment</div>
                  <div className="modal-detail-subtitle">{selectedOrder.payment}</div>
                </div>
              </div>

              <div className="modal-detail-item">
                <div className="modal-icon"><Truck size={24} /></div>
                <div>
                  <div className="modal-detail-title">Tracking</div>
                  <div className="modal-detail-subtitle">{selectedOrder.tracking}</div>
                </div>
              </div>
            </div>

            {selectedOrder.order_status === 'Delivered' && (
              <div className="feedback-section border-t border-white/5 mt-6 pt-6">
                <button 
                  onClick={() => setShowFeedback(true)}
                  className="w-full py-3 bg-[#D4AF37]/10 border border-[#D4AF37] text-[#D4AF37] rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#D4AF37] hover:text-black transition-colors"
                >
                  Give Feedback
                </button>

                {/* Feedback Modal */}
                {showFeedback && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#111111] border border-[#D4AF37]/30 w-full max-w-lg rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)] animate-in fade-in zoom-in duration-300">
                      <div className="p-8">
                        <div className="flex justify-between items-center mb-8">
                          <div>
                            <h2 className="text-2xl font-playfair text-white tracking-wide">Product Experience</h2>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Order {selectedOrder.id}</p>
                          </div>
                          <button onClick={() => setShowFeedback(false)} className="text-gray-500 hover:text-white transition-colors">
                            <X size={24} />
                          </button>
                        </div>

                        <div className="mb-10 text-center">
                          <p className="text-gray-400 text-sm mb-4">How would you rate your {selectedOrder.productName}?</p>
                          <div className="flex justify-center gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setFeedbackRating(star)}
                                className={`transition-all duration-300 transform hover:scale-110 ${
                                  feedbackRating >= star ? 'text-[#D4AF37]' : 'text-gray-700'
                                }`}
                              >
                                <Star size={36} fill={feedbackRating >= star ? 'currentColor' : 'none'} strokeWidth={1.5} />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="mb-8">
                          <label className="block text-xs uppercase tracking-[0.2em] text-gray-500 mb-3 ml-1">Your Perspective</label>
                          <textarea
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                            placeholder="Share your thoughts on the craftsmanship, design, and performance..."
                            className="w-full h-32 bg-black/40 border border-[#222] rounded-xl p-4 text-sm text-gray-200 focus:border-[#D4AF37]/50 focus:outline-none transition-colors resize-none placeholder:text-gray-700"
                          />
                        </div>

                        <button
                          onClick={submitFeedback}
                          disabled={submittingFeedback || !feedbackComment.trim()}
                          className="w-full py-4 bg-[#D4AF37] text-black font-bold uppercase tracking-[0.2em] text-xs rounded-xl hover:bg-[#c9a430] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(212,175,55,0.2)]"
                        >
                          {submittingFeedback ? "Dispatching..." : "Submit Review"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (loading) return (
    <div className="app-container bg-[#0B0B0B] min-h-screen flex items-center justify-center">
       <div className="animate-pulse text-[#D4AF37] font-playfair tracking-widest">LOADING PROFILE...</div>
    </div>
  );

  return (
    <div className="app-container">
      <Navbar />
      {currentView === 'main' && renderMain()}
      {currentView === 'orders' && renderOrders()}
      {currentView === 'settings' && (
        <div className="main-content">
          <SettingsView user={user} setUser={setUser} onBack={() => setCurrentView('main')} />
        </div>
      )}
      {toastStatus.show && (
        <div className="success-toast-overlay">
          <div className={`luxury-success-toast ${toastStatus.hiding ? 'hiding' : ''}`}>
            <div className="toast-icon-wrapper">
              <Star size={20} fill="currentColor" />
            </div>
            <div className="toast-content-wrapper">
              <h4 className="toast-title">Critique Published</h4>
              <p className="toast-message">Your perspective is now live</p>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}


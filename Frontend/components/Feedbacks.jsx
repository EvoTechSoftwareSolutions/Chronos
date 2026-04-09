import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QuoteIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
  </svg>
);

const StarIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

function Feedbacks() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/reviews-featured')
      .then(res => {
        setReviews(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching featured reviews:", err);
        setLoading(false);
      });
  }, []);

  const getInitials = (name) => {
    if (!name) return "NP";
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) return null; // Or a subtle skeleton
  if (reviews.length === 0) return null; // Hide section if no reviews match criteria

  return (
    <section className="py-12 lg:py-20 px-6 sm:px-10 lg:px-8 relative w-full max-w-7xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 lg:mb-16">
        <div className="mb-6 md:mb-0 w-full md:w-auto text-center md:text-left">
          <h3 className="text-[#D4AF37] text-lg lg:text-xl font-serif tracking-[0.2em]">CHRONOS</h3>
          <p className="text-white text-[10px] sm:text-xs uppercase tracking-widest mt-1 opacity-80">Watches</p>
        </div>
        <div className="w-full md:w-auto text-center md:text-right">
          <h4 className="text-[#D4AF37] uppercase tracking-widest text-xs sm:text-sm mb-2 font-serif text-center md:text-right">Feedbacks</h4>
          <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-serif tracking-wide text-center md:text-right uppercase">Clients Love</h2>
          <div className="w-16 h-0.5 bg-[#D4AF37] mt-4 lg:mt-6 mx-auto md:ml-auto md:mr-0"></div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((feedback) => (
          <div 
            key={feedback.id}
            className="rounded-2xl bg-[#1E1E1E]/60 border border-gray-800 hover:border-[#D4AF37] p-8 transition-colors duration-500 backdrop-blur-sm shadow-xl flex flex-col h-full"
          >
            {/* Card Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-[#D4AF37] flex flex-col justify-center items-center text-[#D4AF37] font-serif text-sm">
                  {getInitials(feedback.customer_name)}
                </div>
                <div>
                  <h4 className="text-white font-medium">{feedback.customer_name}</h4>
                  <p className="text-gray-400 text-xs">Verified Collector</p>
                </div>
              </div>
              <QuoteIcon className="text-[#D4AF37]/50" />
            </div>

            {/* Stars */}
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="text-[#D4AF37]" />
              ))}
            </div>

            {/* Review Text */}
            <p className="text-gray-300 text-sm leading-relaxed mb-6 flex-grow italic">
              "{feedback.comment}"
            </p>

            {/* Product Details */}
            <div className="flex flex-col gap-2 text-sm mt-auto border-t border-white/5 pt-4">
              <div className="flex items-center">
                <span className="text-[#D4AF37] w-24">Purchased</span>
                <span className="text-gray-100">: {feedback.product_name || "Luxury Timepiece"}</span>
              </div>
              <div className="flex items-center">
                <span className="text-[#D4AF37] w-24">Color</span>
                <span className="text-gray-300">: {feedback.product_color || "Obsidian Black"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Feedbacks;

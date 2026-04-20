import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Eye = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ShoppingCart = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);

const Star = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

function BestSeller() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
     fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
         // Filter for Best Sellers (matching with LatestArrivals logic or explicitly marked)
         const parsed = data.filter(p => p.isBestSeller).slice(0, 3).map((p, i) => {
             let imgList = [];
             try { imgList = JSON.parse(p.images); } catch(e){}
             return {
                id: p.id,
                brand: p.brand,
                name: p.name,
                price: "Rs. " + String(p.price),
                rating: p.feedback_rate || '0.0',
                reviews: p.feedback_count || '0',
                category: p.category || 'luxury',
                image: imgList[0] ? `http://localhost:5000${imgList[0]}` : p.image_url ? `http://localhost:5000${p.image_url}` : "",
             };
         });
         setProducts(parsed);
      })
      .catch(console.error);
  }, []);

  const handleQuickView = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${product.category.toLowerCase()}/${product.id}`);
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    const priceNum = parseFloat(product.price.replace(/[,\\$a-zA-Z\\s.]/g, '')) || 0;

    addToCart({
      id: product.id,
      category: product.category.toLowerCase(), 
      brand: product.brand,
      name: product.name,
      price: product.price,
      priceNum: priceNum,
      image: product.image,
      color: 'Standard',
      size: 'Default',
      quantity: 1
    });
  };

  return (
    <section className="py-12 lg:py-20 px-6 sm:px-10 lg:px-8 relative w-full max-w-7xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 lg:mb-16">
        <div>
          <h4 className="text-[#D4AF37] uppercase tracking-widest text-xs sm:text-sm mb-2 font-serif">Most Popular</h4>
          <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-serif tracking-wide uppercase">Best Seller</h2>
          <div className="w-16 h-0.5 bg-[#D4AF37] mt-4 lg:mt-6"></div>
        </div>
        <div className="mt-6 md:mt-0 text-left md:text-right">
          <h3 className="text-[#D4AF37] text-lg lg:text-xl font-serif tracking-[0.2em]">CHRONOS</h3>
          <p className="text-white text-[10px] sm:text-xs uppercase tracking-widest mt-1 opacity-80">Watches</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {products.map((product) => (
          <div 
            key={product.id}
            className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 bg-[#0a0a0a]/40 border border-gray-800 hover:border-[#D4AF37]"
            style={{ aspectRatio: '3/4' }}
          >
            {/* Watch Image */}
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Overlay Gradient on Hover */}
            <div className="absolute inset-0 bg-black/40 transition-opacity duration-500 opacity-0 group-hover:opacity-100"></div>

            {/* Quick View Button - Centered */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0">
              <button 
                onClick={(e) => handleQuickView(e, product)}
                className="flex items-center gap-2 px-6 py-2 rounded-full border border-[#D4AF37]/50 bg-black/30 backdrop-blur-sm text-white hover:bg-[#D4AF37]/20 transition-colors"
              >
                <Eye size={18} className="text-[#D4AF37]" />
                <span className="text-sm font-medium">Quick View</span>
              </button>
            </div>

            {/* Bottom Details Panel - Slides up on Hover */}
            <div className="absolute bottom-0 left-0 right-0 p-5 rounded-2xl bg-black/60 backdrop-blur-md border border-transparent border-t-white/10 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-hover:border-[#D4AF37] transition-all duration-500">
              <div className="flex justify-between items-start mb-1">
                <h5 className="text-[#D4AF37] font-serif tracking-widest text-sm">{product.brand}</h5>
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-[#D4AF37] fill-[#D4AF37]" />
                  <span className="text-white text-xs">{product.rating}({product.reviews})</span>
                </div>
              </div>
              <p className="text-white/90 text-sm font-medium mb-3 uppercase tracking-wider truncate">{product.name}</p>
              
              <div className="flex justify-between items-center">
                <span className="text-white text-lg font-bold">{product.price}</span>
                <button 
                  onClick={(e) => handleAddToCart(e, product)}
                  className="w-10 h-10 rounded-full border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors"
                >
                  <ShoppingCart size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default BestSeller;

import React from 'react';

// Using available assets for demo
import watch1 from '../assets/images/hero/Heroimg1.png';
import watch2 from '../assets/images/hero/heroimage2.png';
import watch3 from '../assets/images/hero/heroimage3.png';

const products = [
  {
    id: 1,
    image: watch1,
    brand: 'ROLEX',
    title: 'Royal Chronograph Gold',
    rating: '4.9',
    reviews: '128',
    price: '$12,000'
  },
  {
    id: 2,
    image: watch2,
    brand: 'ROLEX',
    title: 'Royal Chronograph Gold',
    rating: '4.9',
    reviews: '128',
    price: '$12,000'
  },
  {
    id: 3,
    image: watch3,
    brand: 'ROLEX',
    title: 'Royal Chronograph Gold',
    rating: '4.9',
    reviews: '128',
    price: '$12,000'
  }
];

function BestSeller() {
  return (
    <section className="relative w-full py-28 px-8 lg:px-20 min-h-screen">

      {/* Header Area */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end mb-20">
        
        {/* Left Side: CHRONOS WATCHES */}
        <div className="flex flex-col mb-8 md:mb-0">
          <h2 className="text-[#D4AF37] font-playfair text-2xl lg:text-3xl tracking-[0.2em] uppercase mb-1">
            Chronos
          </h2>
          <span className="text-gray-300 tracking-[0.3em] text-[10px] uppercase ml-1">
            Watches
          </span>
        </div>
        
        {/* Right Side: MOST POPULAR / BEST SELLER */}
        <div className="flex flex-col text-left md:text-right md:items-end">
          <span className="text-[#D4AF37] tracking-[0.3em] font-medium text-[11px] mb-2 uppercase">
            Most Popular
          </span>
          <h2 className="text-white font-playfair text-4xl lg:text-5xl uppercase tracking-widest leading-none mb-4">
            Best Seller
          </h2>
          <div className="w-16 h-[2px] bg-[#D4AF37]"></div>
        </div>

      </div>

      {/* Product Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="bg-[#181818] rounded-xl border border-[#2a2a2a] hover:border-[#D4AF37] transition-all duration-500 overflow-hidden relative group cursor-pointer shadow-2xl"
          >
            
            {/* Image Box */}
            <div className="relative h-80 flex justify-center items-center p-6 bg-gradient-to-b from-black/80 to-[#181818] overflow-hidden">
              <img 
                src={product.image} 
                alt={product.title} 
                className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105" 
              />
              
              {/* Quick View Hover State */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
                <button className="border border-[#D4AF37] bg-[#111111]/90 text-white rounded-[30px] px-8 py-3 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 ease-out font-medium tracking-wide shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:bg-[#D4AF37] hover:text-black">
                  Quick View
                </button>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-8 pb-10">
              
              <div className="mb-4 inline-block">
                <h4 className="text-white text-lg font-playfair tracking-[0.3em] uppercase mb-1">
                  {product.brand}
                </h4>
                <div className="w-full h-[2px] bg-[#D4AF37]"></div>
              </div>
              
              <h3 className="text-white font-normal text-2xl mb-2">
                {product.title}
              </h3>
              
              {/* Rating */}
              <div className="flex items-center gap-1.5 mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#D4AF37" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-400 text-xs font-light tracking-wider">
                  {product.rating}({product.reviews})
                </span>
              </div>
              
              {/* Price & Cart */}
              <div className="flex items-center justify-between mt-2">
                <span className="text-gray-200 text-sm font-light tracking-wide">
                  {product.price}
                </span>
                
                {/* Glowing Cart Button */}
                <button className="w-12 h-12 rounded-full border border-gray-600 flex items-center justify-center text-[#D4AF37] transition-all duration-500 ease-out hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-black hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] group/cart">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover/cart:scale-110 transition-transform duration-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
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

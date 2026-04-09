import React from 'react';
import { Link } from 'react-router-dom';


import luxuryImg from '../assets/images/categories/canalog.png';
import sportImg from '../assets/images/categories/Cimg1.png';
import analogImg from '../assets/images/categories/csmart.png';
import smartImg from '../assets/images/categories/csport.png';

function CategoryCard({ id, to, title, items, image, imagePlaceholder, heightClass }) {
  return (
    <Link id={id} to={to} className={`relative rounded-xl overflow-hidden group cursor-pointer block border border-transparent hover:border-[#D4AF37] transition-all duration-500 w-full lg:w-72 bg-[#111111] shadow-2xl ${heightClass}`}>
      
      {/* Simulated Image Background */}
      <div className="absolute inset-0 bg-black/60 transition-transform duration-700 group-hover:scale-110">
        {image ? (
          <img src={image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={title} />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-30 group-hover:opacity-60 transition-opacity">
            <span className="text-[#D4AF37] text-xs uppercase tracking-widest">+ Add {imagePlaceholder}</span>
          </div>
        )}
      </div>
      
      {/* Dark Gradient Overlay for legible text */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>
      
      {/* Hover Content Container */}
      <div className="absolute bottom-6 left-6 right-6 flex flex-col z-20 overflow-hidden">
        
        {/* Title */}
        <h4 className="text-white font-playfair text-[28px] tracking-[0.15em] uppercase mb-1 transform group-hover:-translate-y-1 transition-transform duration-500 ease-out drop-shadow-lg">
          {title}
        </h4>
        
        {/* Sub-items block (Item Count & Button) */}
        <div className="flex items-center justify-between opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out delay-75">
          <span className="text-gray-300 text-[13px] tracking-wide font-light">{items}</span>
          <button className="border border-[#D4AF37] bg-transparent text-white text-[10px] px-3.5 py-1.5 rounded-full uppercase tracking-wider hover:bg-[#D4AF37] hover:text-black transition-colors">
            Quick View
          </button>
        </div>
        
        {/* Expanding Gold Line */}
        <div className="w-0 group-hover:w-full h-[2px] bg-[#D4AF37] mt-3.5 transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100"></div>
        
      </div>
    </Link>
  );
}

function Categories() {
  return (
    <section id="categories-section" className="relative w-full py-28 px-8 lg:px-20 mt">
      
      {/* Header Banner */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end mb-24">
        {/* Left Titling */}
        <div className="flex flex-col mb-8 md:mb-0">
          <span className="text-[#D4AF37] tracking-[0.3em] font-medium text-xs mb-3 uppercase">Items</span>
          <h2 className="text-white font-playfair text-4xl lg:text-[44px] uppercase tracking-widest leading-none mb-4">Categories</h2>
          <div className="w-20 h-1 bg-[#D4AF37]"></div>
        </div>
        
        {/* Right Titling */}
        <div className="flex flex-col text-left md:text-right">
          <h2 className="text-[#D4AF37] font-playfair text-xl lg:text-2xl tracking-[0.2em] uppercase mb-1.5">Chronos</h2>
          <span className="text-white tracking-[0.25em] text-[10px] uppercase opacity-80">Watches</span>
        </div>
      </div>

      {/* Grid Layout (Staggered Masonry feel) */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-center justify-items-center mt-10">
        
        {/* Column 1: Luxury */}
        <div className="w-full flex justify-center lg:justify-end">
          <CategoryCard 
            id="category-luxury"
            to="/category/luxury"
            image={luxuryImg}
            title="Luxury" 
            items="24 Items" 
            imagePlaceholder="LUXURY IMG" 
            heightClass="h-[380px] lg:h-[420px]" 
          />
        </div>
        
        {/* Column 2: Sport & Analog */}
        <div className="w-full flex flex-col gap-8 items-center lg:-mt-8 lg:mb-8">
          <CategoryCard 
            id="category-sport"
            to="/category/sport"
            image={sportImg}
            title="Sport" 
            items="18 Items" 
            imagePlaceholder="SPORT IMG" 
            heightClass="h-[280px] lg:h-[300px]" 
          />
          <CategoryCard 
            id="category-analog"
            to="/category/analog"
            image={analogImg}
            title="Analog" 
            items="32 Items" 
            imagePlaceholder="ANALOG IMG" 
            heightClass="h-[280px] lg:h-[300px]" 
          />
        </div>
        
        {/* Column 3: Smart */}
        <div className="w-full flex justify-center lg:justify-start">
          <CategoryCard 
            id="category-smart"
            to="/category/smart"
            image={smartImg}
            title="Smart" 
            items="12 Items" 
            imagePlaceholder="SMART IMG" 
            heightClass="h-[380px] lg:h-[420px]" 
          />
        </div>

      </div>
      
    </section>
  );
}

export default Categories;

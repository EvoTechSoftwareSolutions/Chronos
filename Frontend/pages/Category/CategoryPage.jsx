import React, { useState, useMemo, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// ─── Asset Imports ────────────────────────────────────────────────────────────
import img1  from '../../assets/images/products/latest1.png';
import img2  from '../../assets/images/products/latest2.png';
import img3  from '../../assets/images/products/latest3.png';
import img4  from '../../assets/images/hero/Heroimg1.png';
import img5  from '../../assets/images/hero/heroimage2.png';
import img6  from '../../assets/images/hero/heroimage3.png';
import img7  from '../../assets/images/categories/Cimg1.png';
import img8  from '../../assets/images/categories/canalog.png';
import img9  from '../../assets/images/categories/csport.png';
import img10 from '../../assets/images/categories/csmart.png';
import heroBg from '../../assets/images/hero/lherobg.png';

// ─── Product Data ─────────────────────────────────────────────────────────────
const IMAGES = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10];

// Colors mapped to swatch hex values
const COLOR_MAP = {
  '#D4AF37': 'gold',
  '#1A1A1A': 'black',
  '#1E88E5': 'blue',
  '#F5F5F5': 'white',
};
const SWATCHES = Object.keys(COLOR_MAP);

function makeProducts(category) {
  // Static definitions removed; replaced by API.
  return [];
}

// ─── Config per category ──────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  luxury: { title: 'Luxury Watches',  subtitle: 'OUR COLLECTION' },
  analog: { title: 'Analog Watches',  subtitle: 'OUR COLLECTION' },
  sport:  { title: 'Sport Watches',   subtitle: 'OUR COLLECTION' },
  smart:  { title: 'Smart Watches',   subtitle: 'OUR COLLECTION' },
};

const PAGE_SIZE = 9;

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ id, category, brand, name, price, image, isNew, isBestSeller, stock_quantity }) {
  const product = { id, brand, name, price, image, isNew, isBestSeller, stock_quantity };
  return (
    <Link
      to={`/product/${category}/${id}`}
      state={{ product }}
      className={`group relative bg-[#111111] rounded-xl border border-[#2a2a2a] hover:border-[#D4AF37] transition-all duration-300 overflow-hidden cursor-pointer block ${stock_quantity <= 0 ? 'opacity-75' : ''}`}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {stock_quantity <= 0 ? (
          <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-lg">
            Sold Out
          </span>
        ) : (
          <>
            {isBestSeller && (
              <span className="text-[9px] bg-[#D4AF37] text-black px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                Best Seller
              </span>
            )}
            {isNew && (
              <span className="text-[9px] bg-white/10 border border-white/20 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                New
              </span>
            )}
          </>
        )}
      </div>

      {/* Image */}
      <div className="bg-[#181818] aspect-square flex items-center justify-center overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Info */}
      <div className="px-4 py-3">
        <p className="text-[#aaa] text-[10px] tracking-[0.2em] uppercase font-medium mb-1">{brand}</p>
        <h4 className="text-white text-sm font-medium leading-snug tracking-wide mb-2 uppercase">{name}</h4>
        <p className="text-[#D4AF37] text-sm font-semibold">Rs. {price}</p>
      </div>
    </Link>
  );
}

// ─── Up/Down Arrow Icons ──────────────────────────────────────────────────────
function ArrowUpIcon()   { return <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" /></svg>; }
function ArrowDownIcon() { return <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" /></svg>; }

// ─── Main Component ───────────────────────────────────────────────────────────
function CategoryPage({ category: propCategory }) {
  const { categoryName } = useParams();
  const category = propCategory || categoryName || 'luxury';

  const config   = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.luxury;
  const [allProducts, setAllProducts] = useState([]);

  // ── State ──
  const [activeSort,  setActiveSort]  = useState('All');        // All | Best Selling | New Arrival
  const [activeColor, setActiveColor] = useState(null);         // null or hex string
  const [priceDir,    setPriceDir]    = useState('asc');        // asc | desc
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showTop,      setShowTop]    = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
         let items = data;
         if (category && category !== 'all') {
            items = data.filter(p => (p.category?.toLowerCase() || '') === category.toLowerCase());
         }
         const parsed = items.map((p, i) => {
             let imgList = [];
             try { imgList = JSON.parse(p.images); } catch(e){}
             return {
                id: p.id,
                brand: p.brand,
                name: p.name,
                priceVal: p.priceVal || parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0,
                price: String(p.price),
                image: imgList[0] ? `http://localhost:5000${imgList[0]}` : p.image_url ? `http://localhost:5000${p.image_url}` : "",
                isBestSeller: p.isBestSeller,
                isNew: p.isNew,
                color: p.color, // Already normalized by backend
                stock_quantity: parseInt(p.stock_quantity) || 0
             };
         });
         setAllProducts(parsed);
      })
      .catch(console.error);
  }, [category]);

  // ── Scroll to top button visibility ──
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const nearFooter =
        window.innerHeight + scrolled >= document.body.offsetHeight - 500;
      setShowTop(scrolled > 300 && !nearFooter);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Filtering + Sorting ──
  const processed = useMemo(() => {
    let list = [...allProducts];

    // 1. Sort filter (Best Selling / New Arrival)
    if (activeSort === 'Best Selling') {
      list = list.filter(p => p.isBestSeller);
    } else if (activeSort === 'New Arrival') {
      list = list.filter(p => p.isNew);
    }

    // 2. Color filter
    if (activeColor) {
      const colorName = COLOR_MAP[activeColor];
      list = list.filter(p => (p.color || '').toLowerCase() === (colorName || '').toLowerCase());
    }

    // 3. Price sort
    list.sort((a, b) =>
      priceDir === 'asc' ? a.priceVal - b.priceVal : b.priceVal - a.priceVal
    );

    return list;
  }, [allProducts, activeSort, activeColor, priceDir]);

  // Reset visible count when filters change
  const resetAndSet = (fn) => { fn(); setVisibleCount(PAGE_SIZE); };

  const visible = processed.slice(0, visibleCount);
  const hasMore = visibleCount < processed.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + PAGE_SIZE, processed.length));
  };

  const togglePrice = () => {
    resetAndSet(() => setPriceDir(d => d === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div className="bg-[#0B0B0B] text-white w-full min-h-screen">
      <Navbar />

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="relative w-full h-[280px] md:h-[380px] flex items-center justify-center overflow-hidden">
        <img
          src={heroBg}
          alt="hero background"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-center px-6">
          <p className="text-[#D4AF37] uppercase tracking-[0.35em] text-[10px] md:text-[11px] mb-3 font-medium">
            {config.subtitle}
          </p>
          <h1
            className="text-white uppercase font-playfair tracking-widest leading-tight"
            style={{ fontSize: 'clamp(2rem, 8vw, 4rem)' }}
          >
            {config.title}
          </h1>
          <div className="w-12 md:w-16 h-[2px] bg-[#D4AF37] mx-auto mt-4 md:mt-5" />
        </div>
      </div>

      {/* ── Filter / Sort Bar ────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 lg:px-10 mt-8 md:mt-10 mb-6 flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-4">

        {/* Sort label & pills */}
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-[10px] md:text-xs uppercase tracking-widest">Sort :</span>
          <div className="flex flex-wrap gap-2 justify-center">
            {['All', 'Best Selling', 'New Arrival'].map((f) => (
              <button
                key={f}
                onClick={() => resetAndSet(() => setActiveSort(f))}
                className={`px-4 md:px-5 py-1.5 rounded-full text-[10px] tracking-widest uppercase transition-all duration-300 border ${
                  activeSort === f
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-semibold'
                    : 'bg-transparent text-gray-300 border-gray-600 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Color swatches */}
        <div className="flex items-center gap-3 md:ml-auto">
          <span className="text-gray-500 text-[10px] md:text-xs uppercase tracking-widest mr-1">Color :</span>
          <div className="flex gap-2.5">
            {SWATCHES.map((hex) => (
              <button
                key={hex}
                onClick={() => resetAndSet(() => setActiveColor(activeColor === hex ? null : hex))}
                title={COLOR_MAP[hex]}
                style={{ backgroundColor: hex }}
                className={`w-5 h-5 md:w-5.5 md:h-5.5 rounded-full border-2 transition-all duration-200 ${
                  activeColor === hex
                    ? 'border-[#D4AF37] scale-125 shadow-[0_0_8px_rgba(212,175,55,0.6)]'
                    : 'border-transparent hover:border-white/60'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Price toggle */}
        <button
          onClick={togglePrice}
          className="flex items-center gap-2 text-[10px] md:text-xs text-gray-300 hover:text-[#D4AF37] uppercase tracking-widest transition-colors duration-200 border-l border-gray-800 pl-4 h-5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
          </svg>
          <span className="hidden sm:inline">Price :</span>
          <span className="text-[#D4AF37] font-medium">
            {priceDir === 'asc' ? 'Low To High' : 'High To Low'}
          </span>
        </button>
      </div>

      {/* Active filter chips */}
      {(activeSort !== 'All' || activeColor) && (
        <div className="max-w-6xl mx-auto px-6 md:px-10 mb-4 flex flex-wrap gap-2 items-center">
          <span className="text-gray-600 text-[10px] uppercase tracking-widest">Active filters:</span>
          {activeSort !== 'All' && (
            <span className="flex items-center gap-1.5 bg-[#1a1a1a] border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
              {activeSort}
              <button onClick={() => resetAndSet(() => setActiveSort('All'))} className="hover:text-white leading-none text-base">×</button>
            </span>
          )}
          {activeColor && (
            <span className="flex items-center gap-2 bg-[#1a1a1a] border border-[#D4AF37]/40 text-gray-300 text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
              <span className="w-3 h-3 rounded-full border border-white/30" style={{ backgroundColor: activeColor }} />
              {COLOR_MAP[activeColor]}
              <button onClick={() => resetAndSet(() => setActiveColor(null))} className="hover:text-white leading-none text-base ml-0.5">×</button>
            </span>
          )}
        </div>
      )}

      {/* separator line */}
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="w-full h-px bg-[#2a2a2a] mb-10" />
      </div>

      {/* ── Product Grid ──────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 pb-20">

        {/* Empty state */}
        {processed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <p className="text-gray-500 text-sm uppercase tracking-widest mb-1">No products found</p>
            <p className="text-gray-700 text-xs">Try adjusting your filters</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              category={category}
              brand={product.brand}
              name={product.name}
              price={product.price}
              image={product.image}
              isNew={product.isNew}
              isBestSeller={product.isBestSeller}
              stock_quantity={product.stock_quantity}
            />
          ))}
        </div>

        {/* Result count */}
        {processed.length > 0 && (
          <p className="text-center text-gray-600 text-[11px] uppercase tracking-widest mt-8">
            Showing {Math.min(visibleCount, processed.length)} of {processed.length} items
          </p>
        )}

        {/* ── Load More Button ─────────────────────────────────────────── */}
        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              className="group relative px-10 py-3.5 border border-[#D4AF37] text-[#D4AF37] text-xs tracking-[0.25em] uppercase font-medium rounded-full overflow-hidden transition-all duration-300 hover:text-black"
            >
              <span className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
              <span className="relative z-10">Load More</span>
            </button>
          </div>
        )}
      </div>

      <Footer />

      {/* ── Scroll To Top Button ─────────────────────────────────────── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
        className={`fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center transition-all duration-400 group hover:bg-[#D4AF37] hover:text-black shadow-[0_0_16px_rgba(212,175,55,0.25)] ${
          showTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
        </svg>
      </button>
    </div>
  );
}

export default CategoryPage;

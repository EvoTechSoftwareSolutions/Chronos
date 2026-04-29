import React, { useState, useMemo, useEffect } from 'react';
import { ArrowUpDown, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import heroBg from '../../assets/herebg.png';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../SettingView and Collection.css';
import axios from 'axios';

const categories = ['Luxury', 'Analog', 'Sport', 'Smart'];

const colorOptions = [
  { label: 'White', hex: '#FFFFFF' },
  { label: 'Gold',  hex: '#D4AF37' },
  { label: 'Blue',  hex: '#1E88E5' },
  { label: 'Black', hex: '#000000ff' },
];

export default function Collection() {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSort, setActiveSort] = useState('All');
  const [activeColor, setActiveColor] = useState(null);
  const [priceDir, setPriceDir] = useState('asc');
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => {
        const parsed = res.data.map(p => {
          let imgList = [];
          try { 
            // Handle both stringified and already-parsed JSON
            imgList = typeof p.images === 'string' ? JSON.parse(p.images) : p.images; 
          } catch(e){}
          
          return {
            ...p,
            // Fallback price logic if server hasn't calculated it
            priceVal: p.priceVal || parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0,
            img: imgList && imgList[0]
              ? `http://localhost:5000${imgList[0]}`
              : p.image_url
              ? `http://localhost:5000${p.image_url}`
              : '',
          };
        });
        setAllProducts(parsed);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch products error:", err);
        setLoading(false);
      });
  }, []);

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

  const filteredAndSortedWatches = useMemo(() => {
    let result = [...allProducts];
    if (activeSort === 'Best Selling') result = result.filter(w => w.isBestSeller);
    if (activeSort === 'New Arrival') result = result.filter(w => w.isNew);
    
    if (activeColor) {
      // Find the label in colorOptions for comparison if needed, 
      // but backend already provides normalized names
      const colorOption = colorOptions.find(o => o.hex === activeColor);
      const colorName = colorOption ? colorOption.label : '';
      result = result.filter(w => (w.color || '').toLowerCase() === colorName.toLowerCase());
    }

    result.sort((a, b) =>
      priceDir === 'asc' ? a.priceVal - b.priceVal : b.priceVal - a.priceVal
    );
    
    return result;
  }, [allProducts, activeSort, activeColor, priceDir]);


  if (loading) return (
    <div className="app-container bg-[#0B0B0B] min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-[#D4AF37] font-playfair tracking-widest text-2xl uppercase">CHRONOS...</div>
    </div>
  );

  return (
    <div className="app-container">
      <Navbar />

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div className="coll-hero h-[320px] md:h-[380px]" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="coll-hero-inner px-4">
          <p className="coll-hero-sub text-[10px] md:text-sm">WATCHES</p>
          <h1 className="coll-hero-title" style={{ fontSize: 'clamp(2.2rem, 8vw, 4rem)' }}>Our Collection</h1>
          <div className="coll-hero-line w-12 md:w-16" />
        </div>
      </div>

      {/* ── Filter Bar ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-10 mb-6 flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-[10px] md:text-xs uppercase tracking-widest font-medium">Sort :</span>
          <div className="flex flex-wrap gap-2 justify-center">
            {['All', 'Best Selling', 'New Arrival'].map(t => (
              <button
                key={t}
                onClick={() => setActiveSort(t)}
                className={`px-4 md:px-5 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] tracking-[0.15em] uppercase transition-all duration-300 border ${
                  activeSort === t 
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold' 
                    : 'bg-transparent text-gray-400 border-gray-800 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 md:ml-auto">
          <span className="text-gray-500 text-[10px] md:text-xs uppercase tracking-widest font-medium">Color :</span>
          <div className="flex gap-2">
            {colorOptions.map(c => (
              <button
                key={c.hex}
                title={c.label}
                onClick={() => setActiveColor(activeColor === c.hex ? null : c.hex)}
                className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 transition-all duration-300 ${
                  activeColor === c.hex ? 'border-[#D4AF37] scale-110 shadow-lg' : 'border-transparent hover:border-gray-500'
                }`}
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => setPriceDir(prev => prev === 'asc' ? 'desc' : 'asc')}
          className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400 hover:text-[#D4AF37] uppercase tracking-widest transition-all duration-300 border-l border-gray-800 pl-4 h-6"
        >
          <ArrowUpDown size={14} className="text-[#D4AF37]" />
          <span>Price: <span className="text-[#D4AF37] font-semibold">{priceDir === 'asc' ? 'Low To High' : 'High To Low'}</span></span>
        </button>
      </div>

      {/* Active Filter Chips */}
      {(activeSort !== 'All' || activeColor) && (
        <div className="max-w-7xl mx-auto px-6 md:px-10 mb-8 flex flex-wrap gap-3 items-center">
          <span className="text-gray-600 text-[10px] uppercase tracking-widest font-bold">Filters:</span>
          {activeSort !== 'All' && (
            <span className="flex items-center gap-2 bg-[#121212] border border-[#d4af37]/30 text-[#D4AF37] text-[10px] px-3 py-1.5 rounded-full uppercase tracking-widest">
              {activeSort}
              <button onClick={() => setActiveSort('All')} className="hover:text-white ml-1 text-sm leading-none">×</button>
            </span>
          )}
          {activeColor && (
            <span className="flex items-center gap-2 bg-[#121212] border border-[#d4af37]/30 text-gray-300 text-[10px] px-3 py-1.5 rounded-full uppercase tracking-widest">
              <span className="w-3 h-3 rounded-full border border-gray-700" style={{ backgroundColor: activeColor }} />
              {colorOptions.find(c => c.hex === activeColor)?.label}
              <button onClick={() => setActiveColor(null)} className="hover:text-white ml-1 text-sm leading-none">×</button>
            </span>
          )}
        </div>
      )}

      {/* ── Category Sections ────────────────────────────────────────────────── */}
      <div className="coll-body">
        {categories.map(cat => {
          const watches = filteredAndSortedWatches.filter(
            w => (w.category || '').toLowerCase() === cat.toLowerCase()
          );
          if (watches.length === 0) return null;

          return (
            <section key={cat} className="coll-category">
              {/* Category header */}
              <div className="coll-cat-header">
                <div>
                  <h2 className="coll-cat-title">{cat.toUpperCase()}</h2>
                  <div className="coll-cat-underline" />
                </div>
                <Link to={`/category/${cat.toLowerCase()}`} className="coll-view-all">
                  view all <ChevronRight size={14} className="inline ml-1" />
                </Link>
              </div>

              {/* Product grid */}
              <div className="coll-grid">
                {watches.slice(0, 4).map(item => (
                  <div
                    key={item.id}
                    className="coll-card"
                    onClick={() => navigate(`/product/${item.category?.toLowerCase()}/${item.id}`, { state: { product: item } })}
                  >
                    <div className="coll-card-img-wrap">
                      <div className="coll-card-glow" />
                      {item.img && (
                        <img src={item.img} alt={item.name} className="coll-card-img" />
                      )}
                    </div>
                    <div className="coll-card-info">
                      <p className="coll-card-brand">{item.brand}</p>
                      <h3 className="coll-card-name">{item.name}</h3>
                      <p className="coll-card-price">Rs. {String(item.price).replace(/[^0-9.]/g, '').trim()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {filteredAndSortedWatches.length === 0 && (
          <div className="coll-empty">
            <h3>No watches match your selected filters.</h3>
            <p>Try clearing your color or sort selections to see more products.</p>
          </div>
        )}
      </div>

      <Footer />

      {/* ── Scroll To Top Button (Migrated from CategoryPage) ────────────── */}
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

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';

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

import wavesBg from '../../assets/images/ui/background.png';

const ALL_IMGS = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10];

// ─── Static data ──────────────────────────────────────────────────────────────
const DESCRIPTIONS = {
  luxury: 'Built for those who demand performance without compromise. This watch features the best military-grade materials and extreme water resistance for the most demanding environments.',
  analog: 'A masterpiece of mechanical watchmaking — precise, elegant and built to last generations. The perfect union of tradition and modern craftsmanship.',
  sport:  'Engineered for peak performance. Lightweight construction, sapphire crystal glass and a water-resistant case built for every adventure.',
  smart:  'The next generation of intelligent timekeeping. Tracks health metrics, notifications and GPS all within a premium stainless steel case.',
};

const TAGS        = ['Order Free', 'Free Delivery', 'Last Price'];
const SIZES       = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS_HEX  = ['#D4AF37', '#F5F5F5', '#1A1A1A', '#1E88E5', '#FFFFFF'];



// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars({ count = 5, className = '' }) {
  const rounded = Math.round(count);
  return (
    <span className={`flex gap-0.5 ${className}`}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < rounded ? 'text-[#D4AF37]' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function ProductDetail() {
  const location          = useLocation();
  const { category, id }  = useParams();
  const navigate          = useNavigate();

  const [product, setProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!product);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    // If we don't have product in state, or to ensure fresh data
    axios.get(`http://localhost:5000/api/products/${id}`)
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching product:", err);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (product?.id) {
       axios.get(`http://localhost:5000/api/reviews/${product.id}`)
         .then(res => setReviews(res.data || []))
         .catch(console.error);
       
       // Fetch related products
       axios.get(`http://localhost:5000/api/products`)
         .then(res => {
            const all = res.data;
            const filtered = all
              .filter(p => p.id !== product.id && p.category === product.category)
              .slice(0, 3)
              .map(p => {
                 let imgs = [];
                 try { imgs = JSON.parse(p.images); } catch(e){}
                 return {
                   ...p,
                   image: imgs[0] ? `http://localhost:5000${imgs[0]}` : p.image_url ? `http://localhost:5000${p.image_url}` : ""
                 };
              });
            setRelatedProducts(filtered);
         })
         .catch(console.error);
    }
  }, [product?.id, product?.category]);

  // ── ALL hooks must be called unconditionally (Rules of Hooks) ──
  // ── Parse images from DB ──
  const [images, setImages] = useState([]);
  const [activeImg, setActiveImg] = useState(null);

  useEffect(() => {
    if (product) {
      let imgList = [];
      try {
        if (product.images) {
          const parsed = JSON.parse(product.images);
          if (Array.isArray(parsed) && parsed.length > 0) imgList = parsed;
        } 
        
        if (imgList.length === 0 && (product.image_url || product.image)) {
           imgList = [product.image_url || product.image];
        }
      } catch (e) {
        if (product.image_url) imgList = [product.image_url];
      }
      
      const fullPaths = imgList
        .filter(path => !!path)
        .map(img => img.startsWith('http') ? img : `http://localhost:5000${img}`);
        
      setImages(fullPaths);
      setActiveImg(fullPaths.length > 0 ? fullPaths[0] : null);
    }
  }, [product]);

  const [activeColor, setActiveColor] = useState(COLORS_HEX[0]);
  const [activeSize,  setActiveSize]  = useState('M');
  const [qty,         setQty]         = useState(1);
  const [showTop,     setShowTop]     = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const imgRef = useRef(null);
  const [glowHeight, setGlowHeight] = useState(0);

  const handleImgLoad = () => {
    if (imgRef.current) setGlowHeight(imgRef.current.offsetHeight);
  };

  // ── Calculate Review Stats ──
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id:       product.id,
      category: product.category || category,
      brand:    product.brand,
      name:     product.name,
      price:    product.price,
      priceNum: typeof product.priceNum === 'number'
                  ? product.priceNum
                  : parseFloat(String(product.price ?? '0').replace(/[^0-9.]/g, '')) || 0,
      image:    images[0],
      tags:     product.tags || [],
      color:    activeColor,
      size:     activeSize,
      quantity: qty,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  // Redirect if product not found after loading
  useEffect(() => {
    if (!loading && !product) {
       navigate(`/collection`, { replace: true });
    }
  }, [product, loading, navigate]);

  // Scroll to top on mount
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  // Scroll-to-top button visibility
  useEffect(() => {
    const onScroll = () => {
      const scrolled    = window.scrollY;
      const nearFooter  = window.innerHeight + scrolled >= document.body.offsetHeight - 500;
      setShowTop(scrolled > 300 && !nearFooter);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Guard after hooks
  if (loading) return (
    <div className="bg-[#0B0B0B] text-white w-full min-h-screen flex items-center justify-center">
       <p className="text-[#D4AF37] animate-pulse">Loading Product Details...</p>
    </div>
  );
  if (!product) return null;

  const categoryLabel = product.category
    ? product.category.charAt(0).toUpperCase() + product.category.slice(1).toLowerCase() + ' Watches'
    : 'Watches';

  return (
    <div 
      className="bg-[#0B0B0B] text-white w-full min-h-screen relative overflow-x-hidden"
      style={{
        backgroundImage: `url(${wavesBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      
      <div className="relative z-10">
        <Navbar />
      <div className="pt-28" />

      {/* ── Breadcrumb & Back ───────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-10 pb-6 flex items-center gap-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all duration-300 group flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="flex items-center gap-2 text-[13px] text-gray-400 tracking-wider font-medium">
          <Link to="/home" className="hover:text-[#D4AF37] transition-colors">Home</Link>
          <span className="text-gray-600">/</span>
          <Link to={`/category/${product.category}`} className="hover:text-[#D4AF37] transition-colors uppercase">{product.category || 'Watches'}</Link>
          <span className="text-gray-600">/</span>
          <span className="text-white/60">{product.name}</span>
        </div>
      </div>

      {/* ── Product Section ─────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-stretch">

          {/* LEFT — Image Gallery Side */}
          <div className="lg:w-[48%] relative">
            <div className="sticky top-32 flex flex-col md:flex-row gap-8">
              {/* Thumbnails */}
              <div className="flex md:flex-col order-2 md:order-1 gap-4 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide justify-center md:justify-start">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(img)}
                    className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 transition-all duration-500 flex-shrink-0 ${
                      activeImg === img
                        ? 'border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.25)] scale-105'
                        : 'border-white/5 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    {img && <img src={img} alt="" className="w-full h-full object-cover p-1" />}
                  </button>
                ))}
              </div>

              {/* Main image */}
              <div className="order-1 md:order-2 flex-grow bg-white/[0.03] rounded-[40px] p-6 md:p-10 flex items-center justify-center min-h-[400px] lg:min-h-[550px] border border-white/5 overflow-hidden">
                {activeImg && (
                  <img
                    ref={imgRef}
                    onLoad={handleImgLoad}
                    src={activeImg}
                    alt={product.name}
                    className="w-full h-full object-contain object-center max-h-[500px] transition-transform duration-1000 hover:scale-110"
                  />
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — Product Info Side */}
          <div className="lg:w-[50%] flex flex-col gap-8 pt-4">

            {/* Brand */}
            <p className="text-gray-400 text-sm tracking-[0.6em] uppercase font-bold text-center lg:text-left">
              {product.brand}
            </p>

            {/* Name */}
            <h1 className="text-white text-4xl lg:text-6xl font-bold uppercase tracking-tight leading-[1.1] text-center lg:text-left"
                style={{ fontFamily: "'Playfair Display SC', serif" }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <Stars count={parseFloat(averageRating)} className="scale-125" />
              <span className="text-gray-400 text-xs tracking-[0.2em] font-medium pt-1">
                {averageRating}({totalReviews} REVIEWS)
              </span>
            </div>

            {/* Price */}
            <p className="text-[#D4AF37] text-4xl lg:text-5xl font-bold tracking-tight text-center lg:text-left mt-4 py-2">
              Rs. <span className="ml-2">{String(product.price).replace('Rs. ', '').trim()}</span>
            </p>

            {/* Description */}
            <p className="text-gray-400 text-[15px] leading-relaxed max-w-xl mx-auto lg:mx-0 text-center lg:text-left font-medium opacity-80">
              {product.description || (DESCRIPTIONS[product.category?.toLowerCase()] || DESCRIPTIONS.luxury)}
            </p>

            {/* Feature Tags */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-2">
              {['Carbon Fiber', 'Super-LumiNova', 'Gold Strap'].map(tag => (
                <div
                  key={tag}
                  className="text-[10px] border border-white/10 text-gray-400 px-8 py-3 rounded-xl tracking-widest font-bold bg-white/[0.02] hover:border-[#D4AF37]/40 transition-all cursor-default"
                >
                  {tag}
                </div>
              ))}
            </div>

            <div className="h-px bg-white/5 my-4" />

            {/* Selectors Group */}
            <div className="flex flex-col gap-10">
              
              {/* Color Selector */}
              <div className="flex items-center gap-8">
                 <p className="text-white text-sm font-bold tracking-widest min-w-[100px]">Color :</p>
                 <div className="flex gap-4">
                    {COLORS_HEX.map(hex => (
                      <button
                        key={hex}
                        onClick={() => setActiveColor(hex)}
                        style={{ backgroundColor: hex }}
                        className={`group relative w-10 h-10 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                          activeColor === hex
                            ? 'border-[#D4AF37] scale-110 shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                         {activeColor === hex && (
                            <div className="absolute inset-0 rounded-full border border-[#D4AF37] scale-125 opacity-40 animate-pulse" />
                         )}
                      </button>
                    ))}
                 </div>
              </div>

              {/* Strap Size */}
              <div className="flex items-center gap-8">
                <p className="text-white text-sm font-bold tracking-widest min-w-[100px]">Strap Size :</p>
                <div className="flex gap-3">
                  {[24, 26, 28, 30, 32].map(s => (
                    <button
                      key={s}
                      onClick={() => setActiveSize(String(s))}
                      className={`w-11 h-11 rounded-full text-xs font-bold border transition-all duration-500 flex items-center justify-center ${
                        activeSize === String(s)
                          ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-110'
                          : 'bg-transparent text-gray-500 border-white/10 hover:border-[#D4AF37]/40 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-8">
                <p className="text-white text-sm font-bold tracking-widest min-w-[100px]">Quantity :</p>
                <div className="flex items-center border border-white/10 rounded-xl overflow-hidden h-12 bg-white/[0.03] backdrop-blur-sm">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-[#D4AF37] hover:bg-white/5 transition-colors text-xl font-light"
                  >−</button>
                  <span className="w-14 h-full flex items-center justify-center text-white text-base font-bold border-x border-white/5 bg-white/[0.02]">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-[#D4AF37] hover:bg-white/5 transition-colors text-xl font-light"
                  >+</button>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-6 mt-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity <= 0}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[13px] transition-all duration-500 overflow-hidden relative group ${
                  addedToCart
                    ? 'bg-green-600 text-white'
                    : product.stock_quantity <= 0
                    ? 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed'
                    : 'bg-[#D4AF37] hover:bg-[#c9a430] text-black shadow-[0_10px_30px_rgba(212,175,55,0.3)] hover:-translate-y-1 active:scale-[0.98]'
                }`}
              >
                <span className="relative z-10">{addedToCart ? '✓ Added to Cart' : (product.stock_quantity > 0 ? 'Add to Cart' : 'Sold Out')}</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
              
              <button
                onClick={() => { handleAddToCart(); navigate('/cart'); }}
                className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[13px] bg-transparent border border-[#D4AF37]/40 text-white hover:bg-[#D4AF37]/5 hover:border-[#D4AF37] transition-all duration-500 hover:-translate-y-1 active:scale-[0.98]"
              >
                Buy Now
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ── What Customers Say ───────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 md:px-16 mb-32">
        <div className="mb-14 text-center">
          <h2 className="font-playfair text-3xl md:text-4xl text-white tracking-widest uppercase mb-4">What Customers Say</h2>
          <div className="w-20 h-[1.5px] bg-[#D4AF37] mx-auto" />
        </div>
        
        {reviews.length === 0 ? (
          <div className="text-center py-20 border border-white/5 rounded-3xl bg-[#0d0d0d]">
             <p className="text-gray-500 italic font-playfair tracking-widest">Awaiting the first critique of this masterwork.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.slice(0, visibleCount).map((r, i) => (
                <div key={i} className="group bg-[#111111] border border-[#1e1e1e] hover:border-[#D4AF37]/40 rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/5 text-[#D4AF37] flex items-center justify-center text-sm font-bold border border-[#D4AF37]/20 uppercase">
                        {(r.customer_name || "C")[0]}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium tracking-wide">{r.customer_name || "Valued Client"}</p>
                        <Stars count={r.rating} className="mt-1" />
                      </div>
                    </div>
                    <div className="opacity-20 group-hover:opacity-40 transition-opacity">
                      <svg className="w-8 h-8 text-[#D4AF37]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.748-9.57 9-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.995zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.999v10h-9.999z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-gray-400 text-[13px] leading-relaxed mb-6 font-light italic">"{r.comment}"</p>
                  <div className="flex items-center gap-2 pt-6 border-t border-white/5">
                    <span className="text-[10px] text-gray-600 uppercase tracking-widest">{new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {visibleCount < totalReviews && (
              <div className="mt-14 text-center">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 3)}
                  className="px-10 py-3 border border-[#D4AF37]/30 text-[#D4AF37] rounded-full text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#D4AF37] hover:text-black transition-all duration-500 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                >
                  Load More Experiences
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── You May Also Like ────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 mb-24">
        <div className="mb-10 text-center">
          <h2 className="font-playfair text-3xl text-white tracking-wide mb-3">You May Also Like</h2>
          <div className="w-16 h-[2px] bg-[#D4AF37] mx-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {relatedProducts.map((p, i) => (
            <Link
              key={i}
              to={`/product/${(p.category || category).toLowerCase()}/${p.id}`}
              state={{ product: p }}
              onClick={() => window.scrollTo({ top: 0 })}
              className="group bg-[#111111] rounded-xl border border-[#2a2a2a] hover:border-[#D4AF37] transition-all duration-300 overflow-hidden"
            >
              <div className="aspect-square overflow-hidden bg-[#181818]">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="px-4 py-3">
                <p className="text-[#D4AF37] text-[10px] tracking-[0.2em] uppercase font-medium mb-1">{p.brand}</p>
                <h4 className="text-white text-sm font-medium uppercase tracking-wide mb-1">{p.name}</h4>
                <p className="text-white text-sm font-semibold">Rs. {p.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── CHRONOS label ────────────────────────────────────────────────── */}
      <div className="text-center py-6 mb-4">
        <p className="text-[#D4AF37] font-playfair tracking-[0.5em] text-sm uppercase">CHRONOS</p>
        <p className="text-gray-600 text-[10px] tracking-[0.3em] uppercase mt-1">Watches</p>
      </div>

      <Footer />

      {/* ── Scroll To Top ────────────────────────────────────────────────── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
        className={`fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center transition-all duration-300 group hover:bg-[#D4AF37] hover:text-black shadow-[0_0_16px_rgba(212,175,55,0.25)] ${
          showTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
        </svg>
      </button>
      </div>
    </div>
  );
}

export default ProductDetail;

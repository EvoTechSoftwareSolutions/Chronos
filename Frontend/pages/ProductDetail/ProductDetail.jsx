import React, { useState, useEffect } from 'react';
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

const REVIEWS = [
  { name: 'Nelson Varona', stars: 5, text: "I've purchased from many luxury retailers, but Chronos stands apart. The attention to detail from packaging to after-sales is great.", product: 'Royal Chronograph Gold', color: 'Gold', avatar: 'N' },
  { name: 'Nelson Varona', stars: 5, text: "I've purchased from many luxury retailers, but Chronos stands apart. The collection is stunning and everything arrived on time.", product: 'Royal Chronograph Gold', color: 'Gold', avatar: 'N' },
  { name: 'Nelson Varona', stars: 5, text: "I've purchased from many luxury retailers, but Chronos stands apart. From packaging to after-sales they are great.", product: 'Royal Chronograph Gold', color: 'Gold', avatar: 'N' },
];

// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars({ count = 5, className = '' }) {
  return (
    <span className={`flex gap-0.5 ${className}`}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < count ? 'text-[#D4AF37]' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
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
  const [activeImg, setActiveImg] = useState('');

  useEffect(() => {
    if (product) {
      let imgList = [];
      try {
        if (product.images) {
          imgList = JSON.parse(product.images);
        } else if (product.image_url) {
          imgList = [product.image_url];
        }
      } catch (e) {
        if (product.image_url) imgList = [product.image_url];
      }
      
      const fullPaths = imgList.map(img => img.startsWith('http') ? img : `http://localhost:5000${img}`);
      setImages(fullPaths);
      setActiveImg(fullPaths[0] || '');
    }
  }, [product]);

  const [activeColor, setActiveColor] = useState(COLORS_HEX[0]);
  const [activeSize,  setActiveSize]  = useState('M');
  const [qty,         setQty]         = useState(1);
  const [showTop,     setShowTop]     = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

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

      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 mb-8 pt-4">
        <nav className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all duration-300 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-[0.2em] font-medium">
             <Link to="/home" className="hover:text-[#D4AF37] transition-colors">Home</Link>
             <span>/</span>
             <Link to={`/category/${product.category}`} className="hover:text-[#D4AF37] transition-colors">{categoryLabel}</Link>
             <span>/</span>
             <span className="text-gray-300 font-semibold">{product.name}</span>
          </div>
        </nav>
      </div>

      {/* ── Product Section ─────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 mb-20">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Left — Image Gallery */}
          <div className="flex flex-col lg:flex-row gap-6 lg:w-1/2">
            {/* Thumbnails column - Extreme Left */}
            <div className="flex lg:flex-col gap-4 justify-start">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(img)}
                  className={`w-20 h-20 lg:w-24 lg:h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${
                    activeImg === img
                      ? 'border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                      : 'border-white/5 hover:border-white/20 bg-[#111111]'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main image - Portrait with large rounded corners */}
            <div className="flex-1 aspect-[4/5] bg-[#111111] rounded-[40px] border border-white/5 overflow-hidden flex items-center justify-center relative group shadow-2xl">
              <img
                src={activeImg}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Right — Product Info */}
          <div className="lg:w-1/2 flex flex-col gap-6">

            <p className="text-[#D4AF37] text-sm tracking-[0.4em] uppercase font-bold">
              {product.brand}
            </p>
 
            <h1 className="font-playfair text-4xl md:text-5xl uppercase tracking-[0.1em] leading-tight text-white font-medium">
              {product.name}
            </h1>
 
            <div className="flex items-center gap-3">
              <Stars count={5} />
              <span className="text-gray-400 text-xs font-medium tracking-wider">4.7(203 REVIEWS)</span>
            </div>
 
            <p className="text-[#D4AF37] text-4xl font-semibold tracking-wide">
              $ <span className="ml-1">{product.price}</span>
            </p>
 
            <p className="text-gray-300 text-sm leading-relaxed font-light max-w-lg">
              {product.description || (DESCRIPTIONS[product.category?.toLowerCase()] || DESCRIPTIONS.luxury)}
            </p>
 
            {/* Mockup Tags */}
            <div className="flex flex-wrap gap-4">
              {['Carbon Fiber', 'Super-LumiNova', 'Gold Strap'].map(tag => (
                <span key={tag} className="text-[10px] border border-[#D4AF37]/30 text-gray-300 px-6 py-2 rounded-full uppercase tracking-[0.2em] font-medium bg-[#111111]/50 backdrop-blur-sm hover:border-[#D4AF37] transition-colors cursor-default">
                  {tag}
                </span>
              ))}
            </div>

            <div className="w-full h-px bg-[#2a2a2a]" />

            {/* Color */}
            <div className="flex items-center gap-6">
              <p className="text-white text-sm font-medium tracking-wide w-20">Color :</p>
              <div className="flex gap-4">
                {COLORS_HEX.map(hex => (
                  <button
                    key={hex}
                    onClick={() => setActiveColor(hex)}
                    style={{ backgroundColor: hex }}
                    className={`relative w-8 h-8 rounded-full border transition-all duration-300 flex items-center justify-center ${
                      activeColor === hex
                        ? 'border-[#D4AF37] ring-1 ring-[#D4AF37] ring-offset-2 ring-offset-black'
                        : 'border-white/20 hover:border-white/60'
                    }`}
                  >
                    {activeColor === hex && hex === '#D4AF37' && (
                       <span className="text-[8px] text-black font-bold uppercase pointer-events-none">Gold</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
 
            {/* Strap Size */}
            <div className="flex items-center gap-6">
              <p className="text-white text-sm font-medium tracking-wide w-20">Strap Size :</p>
              <div className="flex flex-wrap gap-3">
                {[24, 26, 28, 30, 32].map(s => (
                  <button
                    key={s}
                    onClick={() => setActiveSize(String(s))}
                    className={`w-9 h-9 rounded-full text-[10px] font-bold border transition-all duration-300 ${
                      activeSize === String(s)
                        ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                        : 'bg-transparent text-gray-400 border-white/20 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-6">
              <p className="text-white text-sm font-medium tracking-wide w-20">Quantity :</p>
              <div className="flex items-center bg-[#111111] border border-white/10 rounded-lg overflow-hidden h-10">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="px-4 text-gray-400 hover:text-[#D4AF37] transition-colors text-lg"
                >−</button>
                <div className="w-10 h-8 flex items-center justify-center bg-black/50 border-x border-white/10 text-sm font-bold">
                  {qty}
                </div>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="px-4 text-gray-400 hover:text-[#D4AF37] transition-colors text-lg"
                >+</button>
              </div>
            </div>
 
            {/* CTA */}
            <div className="flex flex-col gap-4 mt-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity <= 0}
                className={`w-full py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-sm transition-all duration-500 shadow-xl ${
                  addedToCart
                    ? 'bg-green-600 text-white shadow-green-900/20'
                    : product.stock_quantity <= 0
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-[#D4AF37] hover:bg-[#c9a430] text-black shadow-[#D4AF37]/10'
                }`}
              >
                {addedToCart ? '✓ Item Added' : (product.stock_quantity > 0 ? 'Add to Cart' : 'Sold Out')}
              </button>
              <button
                onClick={() => { handleAddToCart(); navigate('/cart'); }}
                className="w-full py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-sm bg-transparent border border-[#D4AF37]/50 text-white hover:bg-[#D4AF37]/10 transition-all duration-300 shadow-xl"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── What Customers Say ───────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 mb-24">
        <div className="mb-10">
          <h2 className="font-playfair text-3xl text-white tracking-wide mb-3">What Customers Say</h2>
          <div className="w-16 h-[2px] bg-[#D4AF37]" />
        </div>
        {reviews.length === 0 ? <p className="text-gray-500 italic">No reviews yet. Be the first to review this product!</p> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <div key={i} className="bg-[#111111] border border-[#1e1e1e] hover:border-[#D4AF37]/30 rounded-2xl p-6 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center text-sm font-bold">
                    V
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Verified Buyer</p>
                    <Stars count={r.rating} className="mt-0.5" />
                  </div>
                </div>
                <svg className="w-6 h-6 text-[#D4AF37]/30" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.748-9.57 9-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.995zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.999v10h-9.999z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{r.comment}</p>
              <div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-widest">
                <span className="text-gray-600">Date: <span className="text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span></span>
              </div>
            </div>
          ))}
        </div>
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
                <p className="text-white text-sm font-semibold">$ {p.price}</p>
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

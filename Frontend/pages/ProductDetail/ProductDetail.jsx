import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
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

  const product = location.state?.product;

  // ── ALL hooks must be called unconditionally (Rules of Hooks) ──
  const mainImg    = product?.image ?? ALL_IMGS[0];
  const thumbPool  = ALL_IMGS.filter(i => i !== mainImg);
  const thumbs     = [mainImg, ...thumbPool.slice(0, 3)];

  const [activeImg,   setActiveImg]   = useState(mainImg);
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
      category: category,
      brand:    product.brand,
      name:     product.name,
      price:    product.price,
      priceNum: typeof product.priceNum === 'number'
                  ? product.priceNum
                  : parseFloat(String(product.price ?? '0').replace(/,/g, '')) || 0,
      image:    product.image,
      tags:     product.tags || [],
      color:    activeColor,
      size:     activeSize,
      quantity: qty,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  // Redirect when there is no product state
  useEffect(() => {
    if (!product) {
      navigate(`/category/${category || 'luxury'}`, { replace: true });
    }
  }, [product, category, navigate]);

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
  if (!product) return null;

  const relatedProducts = thumbPool.slice(2, 5).map((img, i) => ({
    id: i,
    image: img,
    brand: product.brand,
    name:  product.name,
    price: product.price,
    tags:  product.tags || [],
  }));

  const categoryLabel = category
    ? category.charAt(0).toUpperCase() + category.slice(1) + ' Watches'
    : 'Watches';

  return (
    <div className="bg-[#0B0B0B] text-white w-full min-h-screen">
      <Navbar />
      <div className="pt-28" />

      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 mb-6">
        <nav className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-widest">
          <Link to={`/category/${category}`} className="hover:text-[#D4AF37] transition-colors">
            {categoryLabel}
          </Link>
          <span>/</span>
          <span className="text-gray-300">{product.name}</span>
        </nav>
      </div>

      {/* ── Product Section ─────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 mb-20">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Left — Image Gallery */}
          <div className="flex flex-col-reverse lg:flex-row gap-4 lg:w-5/12">
            {/* Thumbnails column */}
            <div className="flex lg:flex-col gap-3 justify-center">
              {thumbs.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(img)}
                  className={`w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
                    activeImg === img
                      ? 'border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                      : 'border-[#2a2a2a] hover:border-gray-500'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="flex-1 bg-[#111111] rounded-2xl border border-[#2a2a2a] overflow-hidden flex items-center justify-center min-h-[340px] lg:min-h-[420px]">
              <img
                src={activeImg}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-500"
              />
            </div>
          </div>

          {/* Right — Product Info */}
          <div className="lg:w-7/12 flex flex-col gap-5">

            <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase font-medium">
              {product.brand}
            </p>

            <h1 className="font-playfair text-3xl md:text-4xl uppercase tracking-widest leading-tight text-white">
              {product.name}
            </h1>

            <div className="flex items-center gap-2">
              <Stars count={5} />
              <span className="text-[#D4AF37] text-xs font-semibold">4.7</span>
              <span className="text-gray-500 text-xs">(225 reviews)</span>
            </div>

            <p className="text-white text-3xl font-light tracking-wide">
              $ <span className="font-semibold">{product.price}</span>
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {TAGS.map(tag => (
                <span key={tag} className="text-[10px] border border-[#D4AF37]/40 text-[#D4AF37] px-3 py-1 rounded-full uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-gray-400 text-sm leading-relaxed">
              {DESCRIPTIONS[category] || DESCRIPTIONS.luxury}
            </p>

            <div className="w-full h-px bg-[#2a2a2a]" />

            {/* Color */}
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">Color</p>
              <div className="flex gap-3">
                {COLORS_HEX.map(hex => (
                  <button
                    key={hex}
                    onClick={() => setActiveColor(hex)}
                    style={{ backgroundColor: hex }}
                    className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${
                      activeColor === hex
                        ? 'border-[#D4AF37] scale-125 shadow-[0_0_8px_rgba(212,175,55,0.5)]'
                        : 'border-transparent hover:border-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Strap Size */}
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">Strap Size</p>
              <div className="flex flex-wrap gap-2">
                {SIZES.map(s => (
                  <button
                    key={s}
                    onClick={() => setActiveSize(s)}
                    className={`w-10 h-10 rounded-full text-xs font-medium border transition-all duration-200 ${
                      activeSize === s
                        ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                        : 'bg-transparent text-gray-300 border-[#333] hover:border-[#D4AF37] hover:text-[#D4AF37]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <p className="text-gray-400 text-xs uppercase tracking-widest">Quantity :</p>
              <div className="flex items-center border border-[#333] rounded-full overflow-hidden">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-[#D4AF37] transition-colors text-lg"
                >−</button>
                <span className="w-10 text-center text-sm font-medium">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-[#D4AF37] transition-colors text-lg"
                >+</button>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={handleAddToCart}
                className={`flex-1 font-semibold py-4 rounded-full uppercase tracking-widest text-sm transition-all duration-300 ${
                  addedToCart
                    ? 'bg-green-500 text-white'
                    : 'bg-[#D4AF37] hover:bg-[#c9a430] text-black'
                }`}
              >
                {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
              </button>
              <button
                onClick={() => { handleAddToCart(); navigate('/cart'); }}
                className="flex-1 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-semibold py-4 rounded-full uppercase tracking-widest text-sm transition-all duration-300"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((r, i) => (
            <div key={i} className="bg-[#111111] border border-[#1e1e1e] hover:border-[#D4AF37]/30 rounded-2xl p-6 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center text-sm font-bold">
                    {r.avatar}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{r.name}</p>
                    <Stars count={r.stars} className="mt-0.5" />
                  </div>
                </div>
                <svg className="w-6 h-6 text-[#D4AF37]/30" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.748-9.57 9-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.995zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.999v10h-9.999z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{r.text}</p>
              <div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-widest">
                <span className="text-gray-600">Purchased: <span className="text-gray-400">{r.product}</span></span>
                <span className="text-gray-600">Color: <span className="text-[#D4AF37]">{r.color}</span></span>
              </div>
            </div>
          ))}
        </div>
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
              to={`/product/${category}/${p.id}`}
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
  );
}

export default ProductDetail;

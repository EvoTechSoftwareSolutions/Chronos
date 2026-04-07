import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './Collection.css';
import heroBg from '../../assets/images/ui/background.png';
import wavesBg from '../../assets/images/ui/background.png';

export default function Collection() {
  const [searchParams] = useSearchParams();
  const searchQ = searchParams.get('search');
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState('All');
  const [colorFilter, setColorFilter] = useState('All');
  const [priceSort, setPriceSort] = useState('default');
  const [showTop, setShowTop] = useState(false);

  const [dbWatches, setDbWatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = searchQ
      ? `http://localhost:5000/api/products/search?q=${searchQ}`
      : 'http://localhost:5000/api/admin/products';

    axios.get(url).then(res => {
      const items = res.data.products || res.data;
      const mapped = items.map(p => {
        let parsedImages = [];
        try { parsedImages = JSON.parse(p.images); } catch (e) {}
        const imagePath = parsedImages && parsedImages.length > 0 ? parsedImages[0] : p.image_url;
        return {
          id: p.id,
          category: (p.category || 'LUXURY').toUpperCase(),
          brand: p.brand || 'CHRONOS',
          name: p.name,
          priceVal: parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0,
          price: p.price,
          color: p.color || 'black',
          img: imagePath ? `http://localhost:5000${imagePath}` : '',
        };
      });
      setDbWatches(mapped);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [searchQ]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const filteredWatches = useMemo(() => {
    let result = [...dbWatches];
    if (colorFilter !== 'All') result = result.filter(w => w.color === colorFilter);
    if (priceSort === 'low') result.sort((a, b) => a.priceVal - b.priceVal);
    else if (priceSort === 'high') result.sort((a, b) => b.priceVal - a.priceVal);
    return result;
  }, [dbWatches, colorFilter, priceSort]);

  const categories = ['LUXURY', 'ANALOG', 'SPORT', 'SMART'];
  const COLORS = [
    { key: 'silver', bg: '#C0C0C0', label: 'Silver' },
    { key: 'gold',   bg: '#D4AF37', label: 'Gold' },
    { key: 'blue',   bg: '#1E40AF', label: 'Blue' },
    { key: 'black',  bg: '#1a1a1a', label: 'Black', border: '#555' },
    { key: 'white',  bg: '#F5F5F5', label: 'White', border: '#aaa' },
  ];

  return (
    <div className="col-page">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <div
        className="col-hero"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="col-hero-overlay" />
        <div className="col-hero-content">
          <p className="col-hero-sub">WATCHES</p>
          <h1 className="col-hero-title">Our Collection</h1>
          <div className="col-hero-line" />
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div
        className="col-body"
        style={{
          backgroundImage: `url(${wavesBg})`,
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center',
        }}
      >
        <div className="col-body-overlay" />

        <div className="col-inner">

          {/* Filter Bar */}
          <div className="col-filter-bar">
            {/* Sort Pills */}
            <div className="col-filter-left">
              {['All', 'Best Selling', 'New Arrival'].map(t => (
                <button
                  key={t}
                  className={`col-pill ${filterType === t ? 'col-pill-active' : ''}`}
                  onClick={() => setFilterType(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Color Swatches */}
            <div className="col-filter-center">
              <span className="col-filter-label">Color :</span>
              <div className="col-swatches">
                {COLORS.map(c => (
                  <button
                    key={c.key}
                    className={`col-swatch ${colorFilter === c.key ? 'col-swatch-active' : ''}`}
                    style={{ background: c.bg, borderColor: c.border || c.bg }}
                    title={c.label}
                    onClick={() => setColorFilter(colorFilter === c.key ? 'All' : c.key)}
                  />
                ))}
              </div>
            </div>

            {/* Price Sort */}
            <div className="col-filter-right">
              <span className="col-filter-label">Sort by Price :</span>
              <select
                className="col-select"
                value={priceSort}
                onChange={e => setPriceSort(e.target.value)}
              >
                <option value="default">Default</option>
                <option value="low">Low To High</option>
                <option value="high">High To Low</option>
              </select>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <p className="col-loading">Loading Collection...</p>
          )}

          {/* Search Result Banner */}
          {searchQ && !loading && (
            <div className="col-search-banner">
              <p>Showing results for: <span className="col-search-term">"{searchQ}"</span></p>
              <button className="col-clear-search" onClick={() => navigate('/collection')}>
                ✕ Clear Search
              </button>
            </div>
          )}

          {/* Category Sections */}
          {!loading && categories.map(cat => {
            const watches = filteredWatches.filter(w => w.category === cat);
            if (watches.length === 0) return null;
            return (
              <section key={cat} className="col-category">
                <div className="col-cat-header">
                  <div>
                    <h2 className="col-cat-title">{cat}</h2>
                    <div className="col-cat-line" />
                  </div>
                  <button
                    className="col-view-all"
                    onClick={() => navigate(`/category/${cat.toLowerCase()}`)}
                  >
                    View All →
                  </button>
                </div>

                <div className="col-grid">
                  {watches.map(item => (
                    <div
                      key={item.id}
                      className="col-card"
                      onClick={() => navigate(`/product/${item.category.toLowerCase()}/${item.id}`)}
                    >
                      <div className="col-card-img-wrap">
                        <div className="col-card-glow" />
                        {item.img
                          ? <img src={item.img} alt={item.name} className="col-card-img" />
                          : <div className="col-card-no-img">No Image</div>
                        }
                      </div>
                      <div className="col-card-info">
                        <p className="col-card-brand">{item.brand}</p>
                        <h3 className="col-card-name">{item.name}</h3>
                        <p className="col-card-price">{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          {/* Empty State */}
          {!loading && filteredWatches.length === 0 && (
            <div className="col-empty">
              <p className="col-empty-title">No watches match your selected filters.</p>
              <p className="col-empty-sub">Try clearing your color or sort selections.</p>
            </div>
          )}

          {/* Chronos Label */}
          <div className="col-brand-label">
            <p className="col-brand-name">CHRONOS</p>
            <p className="col-brand-tagline">Watches</p>
          </div>

        </div>
      </div>

      <Footer />

      {/* Scroll To Top */}
      <button
        className={`col-scroll-top ${showTop ? 'col-scroll-top-visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </div>
  );
}

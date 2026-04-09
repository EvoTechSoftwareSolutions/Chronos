import React from 'react'
import './About.css'
import back from '../../assets/images/ui/BACK.jpg'
import aboutImg from '../../assets/images/ui/aboutimg.jpg'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import ScrollToTopButton from '../../components/ScrollToTopButton'
import { useNavigate } from 'react-router-dom'

const About = () => {
  const navigate = useNavigate()

  return (
    <div className="about-page">
      <Navbar />
      <div className="about-hero">
        <img src={back} alt="back" className='hero-bg'/>
        <div className="hero-gradient"></div>
        <div className="about-hero-content relative section-with-glow">
          <div className="gold-glow-circle"></div>
          <h1 className="relative z-10">Since 2026</h1>
          <p className="relative z-10">OUR STORY</p>
          <div className="gold-line relative z-10"></div>
        </div>
      </div>

      <div className="first">
        <div className="glow glow-top-right"></div>
        <div className="left">
          <span className="sub-heading">Who we are</span>
          <h2>The Premier Destination for <span className="spantext">Luxury Timepieces</span></h2>
          <p>CHRONOS is a premier luxury watch retailer, curating the finest timepieces from the world's most celebrated brands. From Rolex and Patek Philippe to Audemars Piguet and beyond — we bring you an unparalleled selection of horological excellence.</p>
          <p>Whether you're a seasoned collector or purchasing your first luxury watch, our team of passionate experts is here to guide you every step of the way  ensuring you find a timepiece that speaks to your style and story.</p>
        </div>
        <div className="right">
          <img src={back} alt="Luxury Timepiece" className="right-img" />
        </div>
      </div>

     

      <div className="promise-section">
        <div className="glow glow-center"></div>
        <div className="promise-header">
          <h3>WHY CHRONOS</h3>
          <h2>THE <span>CHRONOS</span> PROMISE</h2>
          <div className="promise-line"></div>
        </div>

        <div className="promise-grid">
          <div className="promise-col">
            <div className="promise-card">
              <div className="icon-container">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
              </div>
              <h4>100% AUTHENTIC</h4>
              <p>Every timepiece is verified and certified authentic by our expert horologists.</p>
            </div>
            
            <div className="promise-card">
              <div className="icon-container">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="12" height="15" rx="2" ry="2" /><path d="M15 8h4l4 5v5h-8" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></svg>
              </div>
              <h4>FREE GLOBAL SHIPPING</h4>
              <p>Complimentary insured shipping on all orders, delivered to your doorstep worldwide</p>
            </div>
          </div>

          <div className="promise-col">
            <div className="center-title">
              <h3>CHRONOS</h3>
              <p>WATCHES</p>
            </div>
            
            <div className="promise-card">
              <div className="icon-container">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V7l7-5 7 5v14M9 21v-6h6v6M9 11h6"/></svg>
              </div>
              <h4>AUTHORIZED DEALER</h4>
              <p>Official partnerships with the world's most prestigious luxury watch brands.</p>
            </div>

            <div className="promise-card">
              <div className="icon-container">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
              <h4>CONCIERGE SERVICE</h4>
              <p>Dedicated personal shoppers to help you find the perfect timepiece.</p>
            </div>
          </div>

          <div className="promise-col">
            <div className="promise-card">
              <div className="icon-container">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3h12l4 6-10 12L2 9z" /></svg>
              </div>
              <h4>CURATED SELECTION</h4>
              <p>Hand-picked collections from over 50 iconic luxury watchmakers.</p>
            </div>

            <div className="promise-card">
              <div className="icon-container">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
              </div>
              <h4>2-YEAR WARRANTY</h4>
              <p>Every purchase backed by our comprehensive warranty and after-sales care.</p>
            </div>
          </div>
        </div>
      </div>
       <div className="mission-section">
        <div className="glow glow-bottom-left"></div>
        <div className="mission-content">
          <div className="mission-left">
            <img src={aboutImg} alt="Watch Collection" className="mission-img" />
          </div>
          <div className="mission-right relative section-with-glow">
            <div className="gold-glow-circle"></div>
            <span className="sub-heading relative z-10">OUR MISSION</span>
            <h2 className="relative z-10">MAKING LUXURY <br/>
              <span className="spantext-mission">ACCESSIBLE</span>
            </h2>
            <div className="mission-line"></div>
            <p>CHRONOS is a premier luxury watch retailer, curating the finest timepieces from the world's most celebrated brands. From Rolex and Patek Philippe to Audemars Piguet and beyond — we bring you an unparalleled selection of horological excellence.</p>
            <p>Whether you're a seasoned collector or purchasing your first luxury watch, our team of passionate experts is here to guide you every step of the way  ensuring you find a timepiece that speaks to your style and story.</p>
          </div>
        </div>
        
        <div className="mission-stats">
          <div className="stat-item">
            <h3>50+</h3>
            <p>Premium Brands</p>
          </div>
          <div className="stat-item">
            <h3>25K+</h3>
            <p>Watches Sold</p>
          </div>
          <div className="stat-item">
            <h3>98%</h3>
            <p>Customer Satisfaction</p>
          </div>
        </div>
      </div>
      <div className="center-title" style={{position: 'relative'}}>
              <h3>CHRONOS</h3>
              <p>WATCHES</p>
              <ScrollToTopButton />
            </div>
      <Footer />
    </div>
  )
}

export default About
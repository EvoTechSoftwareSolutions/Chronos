import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

function OrderSuccess() {
  const { orderId } = useParams();

  return (
    <div style={{ background: '#030303', minHeight: '100vh', color: '#fff' }}>
      <Navbar />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        textAlign: 'center',
        padding: '2rem',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(212,175,55,0.15)',
          border: '2px solid #D4AF37',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          marginBottom: '2rem',
        }}>
          ✓
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display SC', serif",
          fontSize: '2.5rem',
          color: '#D4AF37',
          letterSpacing: '0.1em',
          marginBottom: '1rem',
        }}>
          Order Confirmed
        </h1>
        <div style={{ width: '40px', height: '1px', background: '#D4AF37', margin: '0 auto 1.5rem' }} />
        {orderId && (
          <p style={{ color: '#aaa', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Order ID: <span style={{ color: '#D4AF37' }}>#{orderId}</span>
          </p>
        )}
        <p style={{ color: '#ccc', maxWidth: '480px', lineHeight: '1.8', marginBottom: '3rem' }}>
          Thank you for your purchase. A confirmation email has been sent to you.
          Our team will prepare your timepiece with the utmost care.
        </p>
        <Link
          to="/home"
          style={{
            background: '#D4AF37',
            color: '#000',
            padding: '0.875rem 2.5rem',
            textDecoration: 'none',
            fontWeight: '700',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontSize: '0.8rem',
            transition: 'background 0.3s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#b8962d'}
          onMouseLeave={e => e.currentTarget.style.background = '#D4AF37'}
        >
          Continue Shopping
        </Link>
      </div>
      <Footer />
    </div>
  );
}

export default OrderSuccess;

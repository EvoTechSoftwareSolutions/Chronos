import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

function Terms() {
  return (
    <div style={{ background: '#030303', minHeight: '100vh', color: '#fff' }}>
      <Navbar />
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '8rem 2rem 6rem' }}>
        <h4 style={{ color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.75rem', marginBottom: '1rem' }}>
          Legal
        </h4>
        <h1 style={{ fontFamily: "'Playfair Display SC', serif", fontSize: '2.5rem', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          Terms & Conditions
        </h1>
        <div style={{ width: '40px', height: '2px', background: '#D4AF37', marginBottom: '3rem' }} />

        {[
          {
            title: '1. Acceptance of Terms',
            body: 'By accessing and using the CHRONOS website, you accept and agree to be bound by the terms and provisions of this agreement.',
          },
          {
            title: '2. Products & Authenticity',
            body: 'All timepieces sold through CHRONOS are 100% authentic and sourced from authorized distributors. Each watch is guaranteed against manufacturing defects.',
          },
          {
            title: '3. Purchases & Payments',
            body: 'All prices are listed in the applicable currency. We reserve the right to refuse or cancel any order due to pricing errors, fraud, or availability issues.',
          },
          {
            title: '4. Returns & Refunds',
            body: 'Items may be returned within 14 days of receipt in original, unworn condition with all original packaging and documentation. Custom orders are non-refundable.',
          },
          {
            title: '5. Shipping',
            body: 'We ship worldwide. Shipping times vary by location and selected shipping method. Risk of loss passes to you upon delivery.',
          },
          {
            title: '6. Intellectual Property',
            body: 'All content on this site, including images, logos, and text, is the property of CHRONOS and may not be reproduced without written permission.',
          },
          {
            title: '7. Limitation of Liability',
            body: 'CHRONOS shall not be liable for any indirect, incidental, or consequential damages arising out of your use of our services or products.',
          },
          {
            title: '8. Governing Law',
            body: 'These terms shall be governed by and construed in accordance with applicable local laws, without regard to conflict of law provisions.',
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: '#D4AF37', fontSize: '1rem', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              {section.title}
            </h2>
            <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '0.9rem' }}>{section.body}</p>
          </div>
        ))}

        <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '4rem' }}>Last updated: April 2026</p>
      </div>
      <Footer />
    </div>
  );
}

export default Terms;

import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

function Privacy() {
  return (
    <div style={{ background: '#030303', minHeight: '100vh', color: '#fff' }}>
      <Navbar />
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '8rem 2rem 6rem' }}>
        <h4 style={{ color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.75rem', marginBottom: '1rem' }}>
          Legal
        </h4>
        <h1 style={{ fontFamily: "'Playfair Display SC', serif", fontSize: '2.5rem', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          Privacy & Policy
        </h1>
        <div style={{ width: '40px', height: '2px', background: '#D4AF37', marginBottom: '3rem' }} />

        {[
          {
            title: '1. Information We Collect',
            body: 'We collect information you provide directly, such as your name, email address, shipping address, and payment information when you create an account or make a purchase.',
          },
          {
            title: '2. How We Use Your Information',
            body: 'Your information is used to process orders, communicate order status, improve our services, and send you promotional offers only with your consent.',
          },
          {
            title: '3. Data Security',
            body: 'We implement industry-standard security measures to protect your personal data. Payment information is encrypted and processed through secure third-party payment gateways.',
          },
          {
            title: '4. Cookies',
            body: 'We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You may disable cookies in your browser settings.',
          },
          {
            title: '5. Third-Party Sharing',
            body: 'We do not sell or rent your personal information to third parties. We may share data with trusted service providers who assist in our operations under strict confidentiality agreements.',
          },
          {
            title: '6. Your Rights',
            body: 'You have the right to access, correct, or delete your personal data. Contact us at contact@chronos.com to exercise these rights.',
          },
          {
            title: '7. Changes to This Policy',
            body: 'We may update this policy periodically. Changes will be posted on this page with an updated revision date.',
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

export default Privacy;

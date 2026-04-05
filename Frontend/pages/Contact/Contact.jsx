import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ScrollToTopButton from '../../components/ScrollToTopButton';
import './Contact.css'; 
import tissotLogo from '../../assets/images/ui/tissot.png';
import rolexLogo from '../../assets/images/ui/rolex.png';
import omegaLogo from '../../assets/images/ui/omega.png';
import casioLogo from '../../assets/images/ui/casio.png';
import contactImg from '../../assets/images/ui/contactimg.jpg';
import wavesBg from '../../assets/images/ui/Waves.png';

function Contact() {
  const [activeFaq, setActiveFaq] = useState(0);

  const faqs = [
    {
      question: "Are all watches at CHRONOS authentic?",
      answer: "Absolutely. Every timepiece sold through CHRONOS is 100% authentic and sourced directly from authorized distributors. Each watch comes with original manufacturer documentation, certificate of authenticity, and our own CHRONOS guarantee."
    },
    {
      question: "Do all watches on CHRONOS authentic?",
      answer: "Yes, we guarantee the authenticity of every watch. We have a rigorous authentication process and work strictly with authorized dealers."
    },
    {
      question: "Are all watches on CHRONOS Authentic?",
      answer: "We stand behind the authenticity of our entire collection. All items are verified by our expert horologists before being listed."
    },
    {
      question: "Are all watches on CHRONOS Authentic?",
      answer: "Authenticity is our core promise. You will receive all original paperwork and boxes with your luxury timepiece purchase."
    },
    {
      question: "Are all watches on CHRONOS Authentic?",
      answer: "Every single watch we offer is 100% genuine. We provide a lifetime authenticity guarantee for your complete peace of mind."
    }
  ];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const logos = [tissotLogo, rolexLogo, omegaLogo, casioLogo, tissotLogo, rolexLogo, omegaLogo, casioLogo];

  return (
    <div className="contact-container min-h-screen text-white font-poppins relative">
      <Navbar />
      
      <div className="waves-overlay"></div>

      <div className="contact-hero-bg">
        <img src={contactImg} alt="contact-img" />
        <div className="hero-titles">
          <h4 className="get-in-touch">Get In Touch</h4>
          <h1 className="contact-us">Contact Us</h1>
          <div className="title-line"></div>
          <div className="hero-glow-sm"></div>
        </div>
      </div>

      <div className="contact-content max-w-7xl mx-auto px-6 pt-20 pb-20">

    
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-32">
          
       
          <div>
            <h2 className="text-3xl font-serif text-white mb-8 tracking-wider uppercase">Send A Message</h2>
            <div className="w-12 h-[1px] bg-[#D4AF37] mb-10"></div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="contact-label">First Name</label>
                  <input type="text" className="contact-input" placeholder="First Name" />
                </div>
                <div>
                  <label className="contact-label">Last Name</label>
                  <input type="text" className="contact-input" placeholder="Last Name" />
                </div>
              </div>
              
              <div>
                <label className="contact-label">Email Address</label>
                <input type="email" className="contact-input" placeholder="Email Address" />
              </div>
              
              <div>
                <label className="contact-label">Phone Number</label>
                <input type="tel" className="contact-input" placeholder="Phone Number" />
              </div>
              
              <div>
                <label className="contact-label">Message</label>
                <textarea className="contact-input" rows="4" placeholder="Message"></textarea>
              </div>
              
              <button type="submit" className="contact-submit-btn">
                Send Message
              </button>
            </form>
          </div>

        
          <div>
            <h2 className="text-3xl font-serif text-white mb-8 tracking-wider uppercase">Visit Our Boutique</h2>
            <div className="w-12 h-[1px] bg-[#D4AF37] mb-10"></div>
            
            <p className="text-gray-300 leading-relaxed mb-10 text-sm md:text-base">
              Experience the world of CHRONOS in person. Our boutique offers private appointments, resulting consultations, and the opportunity to view our complete collection.
            </p>
            
              <div className="boutique-item">
                <div className="boutique-icon-box">
                  <svg className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <span className="boutique-label">Email</span>
                  <p className="boutique-value">contact@chronos.com</p>
                </div>
              </div>
              
              <div className="boutique-item">
                <div className="boutique-icon-box">
                  <svg className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
                <div>
                  <span className="boutique-label">Call</span>
                  <p className="boutique-value">+1 (555) 123-4567</p>
                </div>
              </div>
              
              <div className="boutique-item">
                <div className="boutique-icon-box">
                  <svg className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div>
                  <span className="boutique-label">Location</span>
                  <p className="boutique-value">123 Luxury Ave, New York, NY 10022</p>
                </div>
              </div>

              <div className="boutique-item">
                <div className="boutique-icon-box">
                  <svg className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <span className="boutique-label">Hours</span>
                  <p className="boutique-value">Mon - Sat: 10:00 - 20:00</p>
                </div>
              </div>
          </div>
        </div>

        {/* Partners Section with Glow */}
        <div className="mb-32 text-center relative section-with-glow">
          <div className="gold-glow-circle"></div>
          <h4 className="text-[#D4AF37] uppercase tracking-widest text-xs font-semibold mb-3 relative z-10">Partners</h4>
          <h2 className="text-4xl md:text-5xl font-serif tracking-widest mb-6 uppercase text-white relative z-10">Our Partners</h2>
          <div className="w-12 h-0.5 bg-[#D4AF37] mx-auto mb-16 relative z-10"></div>
          
          <div className="marquee-container relative z-10">
            <div className="marquee-content">
              {[...logos, ...logos].map((logo, index) => (
                <div key={index} className="brand-logo-box">
                  <img src={logo} alt="Brand Partner Logo" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section with Glow */}
        <div className="max-w-4xl mx-auto relative section-with-glow">
          <div className="gold-glow-circle"></div>
          <div className="text-center mb-16 relative z-10">
            <h4 className="text-[#D4AF37] uppercase tracking-widest text-xs font-semibold mb-3">Common Questions</h4>
            <h2 className="text-3xl md:text-4xl font-serif tracking-widest mb-6 uppercase text-white">Frequently Asked Questions</h2>
            <div className="w-12 h-0.5 bg-[#D4AF37] mx-auto mb-12"></div>
          </div>

          <div className="space-y-2 relative z-10">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`accordion-item ${activeFaq === index ? 'active' : ''}`}
              >
                <div 
                  className="accordion-header" 
                  onClick={() => toggleFaq(index)}
                >
                  <h3 className="accordion-title">{faq.question}</h3>
                  <span className="accordion-icon">
                    {activeFaq === index ? '▼' : '▼'}
                  </span>
                </div>
                {activeFaq === index && (
                  <div className="accordion-content">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
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
  );
}

export default Contact;

<<<<<<< HEAD
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
=======
import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ScrollToTopButton from '../../components/ScrollToTopButton';
import './Contact.css';
import backgroundImg from '../../assets/images/ui/background.png';
>>>>>>> dev/dilsara

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

<<<<<<< HEAD
=======
  const form = useRef();
  const [submitStatus, setSubmitStatus] = useState(null); // 'loading', 'success', 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const sendEmail = (e) => {
    e.preventDefault();
    setSubmitStatus('loading');

    // 1. Send the inquiry to the company inbox
    const sendCompanyDetails = emailjs.sendForm('service_s32i6fn', 'template_alznjaq', form.current, 'jRpr4VVc-GA7LLA3Z');
    
    // 2. Send the "thank you" auto-reply directly to the customer
    const sendCustomerThanks = emailjs.sendForm('service_s32i6fn', 'template_ndmi7q4', form.current, 'jRpr4VVc-GA7LLA3Z');

    Promise.all([sendCompanyDetails, sendCustomerThanks])
      .then((results) => {
          setSubmitStatus('success');
      })
      .catch((error) => {
          setSubmitStatus('error');
          setErrorMsg(error.text || 'Failed to dispatch emails.');
      });
  };

>>>>>>> dev/dilsara
  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

<<<<<<< HEAD
  const logos = [tissotLogo, rolexLogo, omegaLogo, casioLogo, tissotLogo, rolexLogo, omegaLogo, casioLogo];

  return (
    <div className="contact-container min-h-screen text-white font-poppins relative">
      <Navbar />
      
      <div className="waves-overlay"></div>

      <div className="contact-hero-bg">
        <img src={contactImg} alt="contact-img" />
=======
  const logos = [backgroundImg, backgroundImg, backgroundImg, backgroundImg, backgroundImg, backgroundImg, backgroundImg, backgroundImg];

  return (
    <div className="contact-container min-h-screen text-white relative">
      <Navbar />

      <div className="waves-overlay"></div>

      <div className="contact-hero-bg">
        <img src={backgroundImg} alt="contact-img" />
>>>>>>> dev/dilsara
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
            
<<<<<<< HEAD
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
=======
            {submitStatus === 'success' ? (
              <div className="flex flex-col items-center justify-center p-12 py-16 bg-[#111111]/80 backdrop-blur-md rounded-2xl border border-[#D4AF37]/30 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 text-[#D4AF37] mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
                <h3 className="text-[#D4AF37] font-playfair text-2xl tracking-widest uppercase mb-4">Inquiry Received</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-sm tracking-wide">
                  Thank you for reaching out to Chronos. One of our dedicated luxury watch consultants will contact you shortly to address your inquiry.
                </p>
                <button 
                  onClick={() => setSubmitStatus(null)} 
                  className="mt-10 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-semibold uppercase tracking-widest text-xs px-8 py-3 rounded-full transition-all duration-300"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form ref={form} onSubmit={sendEmail} className="space-y-6">
                {submitStatus === 'error' && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
                    Error sending message: {errorMsg}. Please try checking your EmailJS configuration!
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="contact-label">First Name</label>
                    <input type="text" name="firstName" className="contact-input" placeholder="First Name" required />
                  </div>
                  <div>
                    <label className="contact-label">Last Name</label>
                    <input type="text" name="lastName" className="contact-input" placeholder="Last Name" required />
                  </div>
                </div>
                
                <div>
                  <label className="contact-label">Email Address</label>
                  <input type="email" name="email" className="contact-input" placeholder="Email Address" required />
                </div>
                
                <div>
                  <label className="contact-label">Phone Number</label>
                  <input type="tel" name="phone" className="contact-input" placeholder="Phone Number" />
                </div>
                
                <div>
                  <label className="contact-label">Message</label>
                  <textarea name="message" className="contact-input" rows="4" placeholder="Your Message" required></textarea>
                </div>
                
                <button 
                  type="submit" 
                  disabled={submitStatus === 'loading'}
                  className="contact-submit-btn flex items-center justify-center gap-2"
                >
                  {submitStatus === 'loading' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            )}
>>>>>>> dev/dilsara
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

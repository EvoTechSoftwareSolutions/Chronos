import React from 'react'
import './Privacy.css'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import ScrollToTopButton from '../../components/ScrollToTopButton'

const Privacy = () => {
    return (
        <div className="privacy-page">
            <Navbar />
            <div className="glow glow-privacy-top"></div>
            <div className="glow glow-privacy-left"></div>
            <div className="glow glow-privacy-right"></div>
            <div className="privacy-container">

                <div className="privacy-header">
                    <span className="sub-heading">LEGAL</span>
                    <h1>PRIVACY POLICY</h1>
                    <p className="last-updated">Last Updated 15/03/2026</p>
                    <div className="gold-line"></div>
                </div>

                <div className="privacy-intro">
                    <p>At CHRONOS, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and make purchases from our store.</p>
                </div>

                <div className="privacy-content">
                    <div className="privacy-section">
                        <h2>INFORMATION WE COLLECT</h2>
                        <p>We collect information you provide directly, such as your name, email address, shipping address, and payment details when you make a purchase. We also automatically collect certain information when you visit our website, including your IP address, browser type, operating system, referring URLs, and browsing behavior through cookies and similar technologies.</p>
                        <ul>
                            <li><strong>Personal Information:</strong> Name, email address, phone number, shipping address, billing address.</li>
                            <li><strong>Payment Information:</strong> Credit card details, billing information (processed securely through third-party payment gateways).</li>
                            <li><strong>Usage Data:</strong> IP address, browser type, operating system, pages visited, time spent on site.</li>
                            <li><strong>Cookies and Tracking Technologies:</strong> We use cookies to enhance your browsing experience.</li>
                        </ul>
                    </div>

                    <div className="privacy-section">
                        <h2>1.HOW WE USE YOUR INFORMATION</h2>
                        <p>We use your personal information to process and fulfill orders, communicate with you about your purchases, send promotional materials (with your consent), improve our website and services, prevent fraud and ensure security, and comply with legal obligations. We will never sell your personal data to third parties.</p>
                    </div>

                    <div className="privacy-section">
                        <h2>2.COOKIES & TRACKING</h2>
                        <p>Our website uses cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie preferences through your browser settings. Essential cookies are required for the website to function properly, while analytics and marketing cookies are optional.</p>
                    </div>

                    <div className="privacy-section">
                        <h2>3.DATA SECURITY</h2>
                        <p>We implement industry-standard security measures including SSL encryption, secure payment processing, and regular security audits to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
                    </div>

                    <div className="privacy-section">
                        <h2>4.CHANGES TO THIS POLICY</h2>
                        <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically.</p>
                    </div>

                    <div className="privacy-section">
                        <h2>5.OUR RIGHTS</h2>
                        <p>You have the right to access, correct, or delete your personal data. You may also object to or restrict certain processing activities, request data portability, and withdraw consent at any time. To exercise these rights, please contact us at privacy@chronos.com.</p>
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

export default Privacy
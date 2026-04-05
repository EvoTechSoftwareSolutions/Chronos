import React from 'react'
import './Terms.css'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import ScrollToTopButton from '../../components/ScrollToTopButton'

const Terms = () => {
    return (
        <div className="terms-page">
            <Navbar />
            <div className="glow glow-terms-top"></div>
            <div className="glow glow-terms-left"></div>
            <div className="glow glow-terms-right"></div>
            <div className="terms-container">

                <div className="terms-header">
                    <span className="sub-heading">LEGAL</span>
                    <h1>TERM OF SERVICES</h1>
                    <p className="last-updated">Last Updated 15/03/2026</p>
                    <div className="gold-line"></div>
                </div>

                <div className="terms-intro">
                    <p>Welcome to CHRONOS. Please read these Terms of Service carefully before using our website or making any purchases. These terms govern your use of our services and your relationship with CHRONOS.</p>
                </div>

                <div className="terms-content">
                    <div className="terms-section">
                        <h2>1. ACCEPTANCE OF TERMS</h2>
                        <p>By accessing and using the CHRONOS website, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services.</p>
                    </div>

                    <div className="terms-section">
                        <h2>2. PRODUCTS & PRICING</h2>
                        <p>All watches listed on our website are subject to availability. We reserve the right to modify prices at any time without prior notice. Prices displayed include applicable taxes unless otherwise stated. Product images are for illustration purposes and may vary slightly from the actual product.</p>
                    </div>

                    <div className="terms-section">
                        <h2>3. ORDERS & PAYMENT</h2>
                        <p>By placing an order, you are making an offer to purchase. We reserve the right to accept or decline any order. Payment must be made in full at the time of purchase using accepted payment methods including credit cards, debit cards, and bank transfers. All transactions are processed securely through our payment partners.</p>
                    </div>

                    <div className="terms-section">
                        <h2>4. SHIPPING & DELIVERY</h2>
                        <p>We offer worldwide shipping with full insurance on all orders. Delivery times vary based on your location and chosen shipping method. CHRONOS is not responsible for delays caused by customs, weather, or other factors beyond our control. Risk of loss passes to you upon delivery.</p>
                    </div>

                    <div className="terms-section">
                        <h2>5. RETURNS & REFUNDS</h2>
                        <p>We accept returns within 14 days of delivery for unworn watches in original packaging with all tags attached. Custom or engraved watches are non-returnable. Refunds will be processed within 10 business days of receiving the returned item. Return shipping costs are the responsibility of the buyer unless the item is defective.</p>
                    </div>

                    <div className="terms-section">
                        <h2>6. WARRANTY</h2>
                        <p>All watches purchased through CHRONOS come with the manufacturer's warranty. We also provide a 2-year CHRONOS warranty covering manufacturing defects. Warranty does not cover damage from misuse, unauthorized modifications, or normal wear and tear. For warranty claims, contact our support team.</p>
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

export default Terms
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CartProvider } from "./context/CartContext";

import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import Collection from "./pages/Collection/Collection";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import Cart from "./pages/Cart/Cart";
import Profile from "./pages/Profile/Profile";
import LuxuryPage from "./pages/Category/LuxuryPage";
import AnalogPage from "./pages/Category/AnalogPage";
import SportPage from "./pages/Category/SportPage";
import SmartPage from "./pages/Category/SmartPage";
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import ShippingDetails from "./pages/Checkout/ShippingDetails";
import ShippingMethod from "./pages/Checkout/ShippingMethod";
import PaymentDetails from "./pages/Checkout/PaymentDetails";

function App() {
  return (
    <CartProvider>
      <GoogleOAuthProvider clientId="90872154996-uovdvfs99noj5vm4iukv93lomlahks4f.apps.googleusercontent.com">
        <Router>
          <Routes>
            <Route path="/" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/category/luxury" element={<LuxuryPage />} />
            <Route path="/category/analog" element={<AnalogPage />} />
            <Route path="/category/sport" element={<SportPage />} />
            <Route path="/category/smart" element={<SmartPage />} />
            <Route path="/product/:category/:id" element={<ProductDetail />} />
            <Route path="/checkout/shipping" element={<ShippingDetails />} />
            <Route path="/checkout/shipping-method" element={<ShippingMethod />} />
            <Route path="/checkout/payment-details" element={<PaymentDetails />} />
          </Routes>
        </Router>
      </GoogleOAuthProvider>
    </CartProvider>
  );
}

export default App;

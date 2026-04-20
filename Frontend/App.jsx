import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CartProvider } from "./context/CartContext";
import { PopupProvider } from "./context/PopupContext";
import PopupModal from "./components/PopupModal";

import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import Collection from "./pages/Collection/Collection";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import Cart from "./pages/Cart/Cart";
import Profile from "./pages/Profile/Profile";
import CategoryPage from "./pages/Category/CategoryPage";
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import ShippingDetails from "./pages/Checkout/ShippingDetails";
import ShippingMethod from "./pages/Checkout/ShippingMethod";
import PaymentDetails from "./pages/Checkout/PaymentDetails";
import OrderSuccess from "./pages/Checkout/OrderSuccess";
import Privacy from "./pages/Privacy/Privacy";
import Terms from "./pages/Terms/Terms";
import AdminSSO from "./pages/AdminSSO";
import AdminGateway from "./pages/AdminGateway";

function App() {
  return (
    <PopupProvider>
      <CartProvider>
      <GoogleOAuthProvider clientId="90872154996-uovdvfs99noj5vm4iukv93lomlahks4f.apps.googleusercontent.com">
        <Router>
          <div className="relative">
            <PopupModal />
            <Routes>
            <Route path="/" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin-gateway" element={<AdminGateway />} />
            <Route path="/admin-sso" element={<AdminSSO />} />
            <Route path="/home" element={<Home />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/category/:categoryName" element={<CategoryPage />} />
            <Route path="/product/:category/:id" element={<ProductDetail />} />
            <Route path="/checkout/shipping" element={<ShippingDetails />} />
            <Route path="/checkout/shipping-method" element={<ShippingMethod />} />
            <Route path="/checkout/payment-details" element={<PaymentDetails />} />
            <Route path="/checkout/success/:orderId" element={<OrderSuccess />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
              </Routes>
            </div>
          </Router>
        </GoogleOAuthProvider>
      </CartProvider>
    </PopupProvider>
  );
}

export default App;

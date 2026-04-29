import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import CategoryPage from "./pages/Category/CategoryPage";
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import ShippingDetails from "./pages/Checkout/ShippingDetails";
import ShippingMethod from "./pages/Checkout/ShippingMethod";
import PaymentDetails from "./pages/Checkout/PaymentDetails";
import OrderSuccess from "./pages/Checkout/OrderSuccess";
import Privacy from "./pages/Privacy/Privacy";
import Terms from "./pages/Terms/Terms";
import ScrollToTop from "./components/ScrollToTop";

function getLoggedIn() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return Boolean(user && user.email);
  } catch {
    return false;
  }
}

// Redirects unauthenticated users to /login
function RequireUser({ children }) {
  const [authed, setAuthed] = React.useState(getLoggedIn);

  React.useEffect(() => {
    const sync = () => setAuthed(getLoggedIn());
    window.addEventListener("storage", sync);
    window.addEventListener("auth-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth-changed", sync);
    };
  }, []);

  if (!authed) return <Navigate to="/login" replace />;
  return children;
}

// Redirects already-logged-in users away from auth pages (login / register)
function RedirectIfLoggedIn({ children }) {
  const [authed, setAuthed] = React.useState(getLoggedIn);

  React.useEffect(() => {
    const sync = () => setAuthed(getLoggedIn());
    window.addEventListener("storage", sync);
    window.addEventListener("auth-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth-changed", sync);
    };
  }, []);

  if (authed) return <Navigate to="/home" replace />;
  return children;
}

function App() {
  return (
    <CartProvider>
      <GoogleOAuthProvider clientId="90872154996-uovdvfs99noj5vm4iukv93lomlahks4f.apps.googleusercontent.com">
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Auth pages — redirect logged-in users away */}
            <Route path="/" element={<RedirectIfLoggedIn><Register /></RedirectIfLoggedIn>} />
            <Route path="/login" element={<RedirectIfLoggedIn><Login /></RedirectIfLoggedIn>} />

            {/* Protected routes (require login) */}
            <Route path="/home" element={<RequireUser><Home /></RequireUser>} />
            <Route path="/collection" element={<RequireUser><Collection /></RequireUser>} />
            <Route path="/cart" element={<RequireUser><Cart /></RequireUser>} />
            <Route path="/profile" element={<RequireUser><Profile /></RequireUser>} />
            <Route path="/checkout/shipping" element={<RequireUser><ShippingDetails /></RequireUser>} />
            <Route path="/checkout/shipping-method" element={<RequireUser><ShippingMethod /></RequireUser>} />
            <Route path="/checkout/payment-details" element={<RequireUser><PaymentDetails /></RequireUser>} />
            <Route path="/checkout/success/:orderId" element={<RequireUser><OrderSuccess /></RequireUser>} />

            {/* Public routes */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/category/:categoryName" element={<CategoryPage />} />
            <Route path="/product/:category/:id" element={<ProductDetail />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to={getLoggedIn() ? "/home" : "/login"} replace />} />
          </Routes>
        </Router>
      </GoogleOAuthProvider>
    </CartProvider>
  );
}

export default App;

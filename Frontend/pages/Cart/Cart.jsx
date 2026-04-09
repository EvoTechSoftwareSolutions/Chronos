import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';

// ─── Related products ─────────────────────────────────────────────────────────
import rImg1 from '../../assets/images/products/latest1.png';
import rImg2 from '../../assets/images/products/latest2.png';
import rImg3 from '../../assets/images/products/latest3.png';

const RELATED = [
  { id: 'r1', brand: 'ROLEX', name: 'Submariner Black',       priceNum: 8000,  image: rImg1 },
  { id: 'r2', brand: 'ROLEX', name: 'Royal Chronograph Gold', priceNum: 11000, image: rImg2 },
  { id: 'r3', brand: 'OMEGA', name: 'Ocean Blue Master',      priceNum: 9800,  image: rImg3 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const COLOR_NAMES = {
  '#D4AF37': 'Gold',
  '#F5F5F5': 'Silver',
  '#1A1A1A': 'Black',
  '#1E88E5': 'Blue',
  '#FFFFFF': 'White',
};
const DISCOUNT = 0;

function fmt(n) {
  return Number(n).toLocaleString('en-US');
}
function getColorName(hex) {
  return COLOR_NAMES[hex] ?? hex ?? 'N/A';
}
function getPrice(item) {
  return typeof item.priceNum === 'number'
    ? item.priceNum
    : parseFloat(String(item.price ?? '0').replace(/[^0-9.]/g, '')) || 0;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}

function CartBtnIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
  );
}

// ─── Compact Cart Item Card ────────────────────────────────────────────────────
function CartItemCard({ item, onRemove, onQtyChange }) {
  const colorName = getColorName(item.color);

  return (
    <div className="bg-[#111111] rounded-xl border border-[#2a2a2a] hover:border-[#D4AF37]/50 transition-all duration-300 overflow-hidden group">
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-[#181818] relative">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Delete button — always visible on touch, hover on desktop */}
        <button
          onClick={() => onRemove(item.cartId)}
          aria-label="Remove item"
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-black/90 transition-all duration-200 lg:opacity-0 lg:group-hover:opacity-100"
        >
          <TrashIcon />
        </button>
      </div>

      {/* Details */}
      <div className="p-4">
        {/* Brand */}
        <p className="text-[#D4AF37] text-[9px] tracking-[0.35em] uppercase font-semibold mb-1">
          {item.brand}
        </p>

        {/* Name */}
        <h3 className="font-playfair text-white text-[13px] uppercase tracking-wide leading-snug mb-2.5">
          {item.name}
        </h3>

        {/* Color + Size row */}
        <div className="flex flex-col gap-0.5 mb-3">
          <p className="text-[10px] tracking-widest uppercase">
            <span className="text-gray-500">COLOR :</span>{' '}
            <span className="text-[#D4AF37] font-medium">{colorName.toUpperCase()}</span>
          </p>
          <p className="text-[10px] tracking-widest uppercase">
            <span className="text-gray-500">STRAP SIZE :</span>{' '}
            <span className="text-white font-medium">{item.size ?? 'M'}</span>
          </p>
        </div>

        {/* Quantity + item price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center border border-[#2a2a2a] rounded-full overflow-hidden">
            <button
              onClick={() => onQtyChange(item.cartId, item.quantity - 1)}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#D4AF37] transition-colors text-base leading-none"
            >
              −
            </button>
            <span className="w-7 text-center text-xs font-medium text-white">
              {item.quantity}
            </span>
            <button
              onClick={() => onQtyChange(item.cartId, item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#D4AF37] transition-colors text-base leading-none"
            >
              +
            </button>
          </div>
          <span className="text-white text-xs font-semibold tracking-wide">
            ${fmt(getPrice(item) * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  const [status, setStatus]   = useState(null);
  const [loading, setLoading] = useState(false);

  // Totals
  const subtotal    = cartItems.reduce((s, i) => s + getPrice(i) * i.quantity, 0);
  const discountAmt = Math.round(subtotal * DISCOUNT);
  const total       = subtotal - discountAmt;
  const firstColor  = cartItems.length > 0 ? getColorName(cartItems[0].color) : 'N/A';

  // Checkout - Redirect to Shipping Details
  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    navigate('/checkout/shipping');
  };

  // ── Empty cart ──────────────────────────────────────────────────────────────
  if (cartItems.length === 0 && !status) {
    return (
      <div className="bg-[#0B0B0B] text-white w-full min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-6">
          <p className="text-[#D4AF37] uppercase tracking-[0.3em] text-xs font-medium">Your</p>
          <h1 className="font-playfair text-6xl md:text-7xl uppercase tracking-widest">CART</h1>
          <div className="w-16 h-[2px] bg-[#D4AF37] mx-auto" />
          <p className="text-gray-400 max-w-md leading-relaxed">
            Your cart is empty. Browse our exclusive collection and add your favourite timepieces.
          </p>
          <Link
            to="/home"
            className="mt-4 px-10 py-3.5 border border-[#D4AF37] text-[#D4AF37] font-playfair tracking-widest text-sm uppercase hover:bg-[#D4AF37] hover:text-black transition-all duration-300 rounded-full"
          >
            Shop Now
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#0B0B0B] text-white w-full min-h-screen relative overflow-x-hidden">
      <Navbar />

      {/* ── Background Decoration ─────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <svg className="absolute right-0 top-20 w-[50%] h-auto opacity-[0.04]"
          viewBox="0 0 500 700" fill="none">
          <path d="M480 10 C480 120 80 180 220 350 C360 520 60 580 200 700"
            stroke="#D4AF37" strokeWidth="1.5" fill="none" />
          <path d="M450 20 C450 130 110 175 240 345 C365 510 95 565 225 700"
            stroke="#D4AF37" strokeWidth="0.7" fill="none" />
        </svg>
        <div className="absolute top-60 right-1/3 w-80 h-80 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(ellipse, #D4AF37 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10">
        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 lg:px-16 pt-28 md:pt-36 pb-8 text-center md:text-left">
          <h1 className="font-playfair uppercase tracking-widest text-white leading-tight"
              style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)' }}>
            Shopping Cart
          </h1>
          <div className="w-16 h-[2px] bg-[#D4AF37] mt-3 mx-auto md:ml-0" />
        </div>

        {/* ── Status Banner ────────────────────────────────────────────────── */}
        {status && (
          <div className="max-w-7xl mx-auto px-6 md:px-16 mb-6">
            <div className={`p-4 rounded-xl border text-sm ${
              status.type === 'success'
                ? 'bg-[#D4AF37]/10 border-[#D4AF37]/40 text-[#D4AF37]'
                : 'bg-red-500/10 border-red-500/40 text-red-400'
            }`}>
              {status.message}
              {status.type === 'success' && (
                <Link to="/home" className="ml-4 underline hover:text-white transition-colors">
                  Continue Shopping
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ── Main Cart Grid ───────────────────────────────────────────────── */}
        {cartItems.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 lg:px-16 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">

              {/* LEFT — Cart Items (2-col card grid) ─────────────────────── */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {cartItems.map((item) => (
                    <CartItemCard
                      key={item.cartId}
                      item={item}
                      onRemove={removeFromCart}
                      onQtyChange={updateQuantity}
                    />
                  ))}
                </div>
              </div>

              {/* RIGHT — Order Summary ───────────────────────────────────── */}
              <div className="lg:col-span-1 lg:sticky lg:top-32">
                <div className="bg-[#111111] rounded-2xl border border-[#2a2a2a] p-7">
                  <h2 className="text-white font-medium tracking-[0.15em] uppercase text-sm mb-5">
                    Order Summary
                  </h2>
                  <div className="w-full h-px bg-[#2a2a2a] mb-5" />

                  <div className="flex flex-col gap-3.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 tracking-wide text-xs">Amount</span>
                      <span className="text-white font-medium text-xs">$ {fmt(subtotal)}</span>
                    </div>
                    {cartItems.length === 1 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 tracking-wide text-xs">Color</span>
                        <span className="text-white font-medium text-xs">{firstColor}</span>
                      </div>
                    )}
                    {cartItems.length > 1 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 tracking-wide text-xs">Items</span>
                        <span className="text-white font-medium text-xs">
                          {cartItems.reduce((s, i) => s + i.quantity, 0)} watches
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="w-full h-px bg-[#2a2a2a] my-5" />

                  <div className="flex justify-between items-center mb-7">
                    <span className="text-white font-medium tracking-wide uppercase text-xs">Total</span>
                    <span className="text-white text-lg font-semibold">$ {fmt(total)}</span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full bg-[#D4AF37] hover:bg-[#c9a430] text-black font-semibold py-3.5 rounded-lg uppercase tracking-[0.15em] text-xs transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mb-3"
                  >
                    {loading ? 'Processing…' : 'Proceed To Checkout'}
                  </button>

                  <button
                    onClick={() => navigate('/home')}
                    className="w-full border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-semibold py-3.5 rounded-lg uppercase tracking-[0.15em] text-xs transition-all duration-300"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── You May Also Like ─────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 lg:px-16 pb-24">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="font-playfair text-3xl sm:text-4xl text-white tracking-wide uppercase">
              You May Also Like
            </h2>
            <div className="w-16 h-[2.5px] bg-[#D4AF37] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {RELATED.map((p) => (
              <div
                key={p.id}
                className="group bg-[#111111] rounded-xl border border-[#2a2a2a] hover:border-[#D4AF37] transition-all duration-300 overflow-hidden cursor-pointer"
              >
                <div className="aspect-square bg-[#181818] overflow-hidden relative">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                </div>
                <div className="p-5">
                  <p className="text-[#D4AF37] text-[9px] tracking-[0.35em] uppercase font-semibold mb-1">
                    {p.brand}
                  </p>
                  <div className="w-full h-px bg-[#D4AF37] mb-3" />
                  <h4 className="text-white text-sm font-normal uppercase tracking-wide leading-snug mb-3">
                    {p.name}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-xs font-medium">$ {fmt(p.priceNum)}</span>
                    <button className="w-8 h-8 rounded-full border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all duration-300">
                      <CartBtnIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CHRONOS brand mark ────────────────────────────────────────────── */}
        <div className="text-center py-10 mb-4">
          <p className="text-[#D4AF37] font-playfair tracking-[0.5em] text-xl uppercase">CHRONOS</p>
          <p className="text-gray-500 text-[10px] tracking-[0.35em] uppercase mt-1">Watches</p>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default Cart;

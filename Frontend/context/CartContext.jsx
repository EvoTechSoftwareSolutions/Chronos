import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem('chronos_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('chronos_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const [shippingDetails, setShippingDetails] = useState(() => {
    try {
      const stored = localStorage.getItem('chronos_shipping');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [shippingMethod, setShippingMethod] = useState(null);

  // Persist shipping details to localStorage
  useEffect(() => {
    if (shippingDetails) {
      localStorage.setItem('chronos_shipping', JSON.stringify(shippingDetails));
    }
  }, [shippingDetails]);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) =>
          item.id === product.id &&
          item.category === product.category &&
          item.color === product.color &&
          item.size === product.size
      );
      if (existing) {
        return prev.map((item) =>
          item.cartId === existing.cartId
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
      }
      return [...prev, { ...product, cartId: `cart_${Date.now()}_${Math.random()}` }];
    });
  };

  const removeFromCart = (cartId) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const updateQuantity = (cartId, quantity) => {
    if (quantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) => (item.cartId === cartId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setShippingDetails(null);
    setShippingMethod(null);
    localStorage.removeItem('chronos_cart');
    localStorage.removeItem('chronos_shipping');
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ 
        cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount,
        shippingDetails, setShippingDetails, shippingMethod, setShippingMethod
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

const getUserCartKey = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.email) {
      return `chronos_cart_${user.email}`;
    }
    return 'chronos_cart_guest';
  } catch {
    return 'chronos_cart_guest';
  }
};

export function CartProvider({ children }) {
  const [cartKey, setCartKey] = useState(getUserCartKey);

  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem(getUserCartKey());
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Listen for login/logout to switch carts
  useEffect(() => {
    const handleAuthChange = () => {
      const newKey = getUserCartKey();
      if (newKey !== cartKey) {
        setCartKey(newKey);
        try {
          const stored = localStorage.getItem(newKey);
          setCartItems(stored ? JSON.parse(stored) : []);
        } catch {
          setCartItems([]);
        }
      }
    };
    
    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [cartKey]);

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(cartItems));
  }, [cartItems, cartKey]);

  const [shippingDetails, setShippingDetails] = useState(() => {
    try {
      const stored = localStorage.getItem('chronos_shipping');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [shippingMethod, setShippingMethod] = useState(() => {
    try {
      const stored = localStorage.getItem('chronos_shipping_method');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Persist shipping details to localStorage
  useEffect(() => {
    if (shippingDetails) {
      localStorage.setItem('chronos_shipping', JSON.stringify(shippingDetails));
    } else {
      localStorage.removeItem('chronos_shipping');
    }
  }, [shippingDetails]);

  // Persist shipping method to localStorage
  useEffect(() => {
    if (shippingMethod) {
      localStorage.setItem('chronos_shipping_method', JSON.stringify(shippingMethod));
    } else {
      localStorage.removeItem('chronos_shipping_method');
    }
  }, [shippingMethod]);

  const addToCart = useCallback((product) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) =>
          item.id === product.id &&
          item.category === product.category &&
          item.color === product.color &&
          item.size === product.size
      );
      if (existing) {
        const maxStock = Number(existing.maxStock ?? product.maxStock);
        return prev.map((item) => {
          if (item.cartId !== existing.cartId) return item;
          const nextQty = Number(item.quantity) + Number(product.quantity || 0);
          if (Number.isFinite(maxStock) && maxStock > 0) {
            return { ...item, quantity: Math.min(nextQty, maxStock), maxStock };
          }
          return { ...item, quantity: nextQty };
        });
      }
      const maxStock = Number(product.maxStock);
      const initialQty = Number(product.quantity || 1);
      const safeQty = Number.isFinite(maxStock) && maxStock > 0 ? Math.min(initialQty, maxStock) : initialQty;
      return [...prev, { ...product, quantity: safeQty, cartId: `cart_${Date.now()}_${Math.random()}` }];
    });
  }, []);

  const removeFromCart = useCallback((cartId) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  }, []);

  const updateQuantity = useCallback((cartId, quantity) => {
    if (quantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.cartId !== cartId) return item;
        const maxStock = Number(item.maxStock);
        if (Number.isFinite(maxStock) && maxStock > 0) {
          return { ...item, quantity: Math.min(Number(quantity), maxStock) };
        }
        return { ...item, quantity: Number(quantity) };
      })
    );
  }, []);
  const clearCart = useCallback(() => {
    setCartItems([]);
    setShippingDetails(null);
    setShippingMethod(null);
    localStorage.removeItem(cartKey);
    localStorage.removeItem('chronos_shipping');
    localStorage.removeItem('chronos_shipping_method');
  }, [cartKey]);

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

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  quantity: number;
  vendorName?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on init
  useEffect(() => {
    const savedCart = localStorage.getItem('dailymarket_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const openCart = () => setIsCartOpen(true);

  // Sync with localStorage
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('dailymarket_cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, {
        id: product.id,
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: 1,
        vendorName: product.vendorName
      }];
    });
    // Auto-open cart drawer when adding
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      subtotal,
      isCartOpen,
      setIsCartOpen,
      openCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

const SAFE_DEFAULT: CartContextType = {
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  subtotal: 0,
  isCartOpen: false,
  setIsCartOpen: () => {},
  openCart: () => {},
};

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    // If called outside of CartProvider (e.g., SSR mismatch), return safe defaults
    // instead of crashing the entire page.
    if (typeof window === 'undefined') return SAFE_DEFAULT;
    console.warn('[DailyMarket] useCart called outside of CartProvider — using safe defaults.');
    return SAFE_DEFAULT;
  }
  return context;
}

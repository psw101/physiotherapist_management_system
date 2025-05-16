"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  option: string;
  imageUrl?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number, option: string) => void;
  updateQuantity: (id: number, option: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Load cart from localStorage when component mounts
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);
  
  // Add item to cart
  const addToCart = (item: CartItem) => {
    setCart(prevCart => {
      // Check if item already exists in cart with same option
      const existingItemIndex = prevCart.findIndex(
        cartItem => cartItem.id === item.id && cartItem.option === item.option
      );
      
      if (existingItemIndex !== -1) {
        // Update quantity of existing item
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += item.quantity;
        return updatedCart;
      } else {
        // Add new item to cart
        return [...prevCart, item];
      }
    });
  };
  
  // Remove item from cart
  const removeFromCart = (id: number, option: string) => {
    setCart(prevCart => prevCart.filter(item => 
      !(item.id === id && item.option === option)
    ));
  };
  
  // Update item quantity
  const updateQuantity = (id: number, option: string, quantity: number) => {
    if (quantity < 1) return;
    
    setCart(prevCart => prevCart.map(item => 
      (item.id === id && item.option === option)
        ? { ...item, quantity }
        : item
    ));
  };
  
  // Clear entire cart
  const clearCart = () => {
    setCart([]);
  };
  
  // Calculate total items
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  // Calculate total price
  const totalPrice = cart.reduce((total, item) => 
    total + (item.price * item.quantity), 0
  );
  
  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string; // menuItemId
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  dietary?: string | null;
  specialRequest?: string;
}

interface CartContextType {
  items: CartItem[];
  tableNumber: string | null;
  setTableNumber: (table: string | null) => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalAmount: number;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children, slug }: { children: React.ReactNode; slug: string }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Restore cart from localStorage per business slug on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`menugo_cart_${slug}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.items)) {
          setItems(parsed.items);
        }
        if (parsed.tableNumber) {
          setTableNumber(parsed.tableNumber);
        }
      }
    } catch (e) {
      console.error("Failed to restore cart from localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, [slug]);

  // 2. Persist cart to localStorage ONLY AFTER initial restore is complete
  useEffect(() => {
    if (!isLoaded) return; // Prevent overwriting stored cart on initial render before restore!

    try {
      localStorage.setItem(
        `menugo_cart_${slug}`,
        JSON.stringify({ items, tableNumber })
      );
    } catch (e) {
      console.error("Failed to save cart to localStorage:", e);
    }
  }, [items, tableNumber, slug, isLoaded]);

  const addItem = (newItem: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === newItem.id);
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantity: copy[existingIndex].quantity + 1,
          specialRequest: newItem.specialRequest || copy[existingIndex].specialRequest,
        };
        return copy;
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(`menugo_cart_${slug}`);
    } catch {}
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        tableNumber,
        setTableNumber,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalCount,
        totalAmount,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CartLine } from "@/types";

interface CartContextType {
  lines: CartLine[];
  addItem: (item: Omit<CartLine, "quantity">) => void;
  removeItem: (menuItemId: string) => void;
  increment: (menuItemId: string) => void;
  decrement: (menuItemId: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ tableNumber, children }: { tableNumber: string; children: ReactNode }) {
  const storageKey = `us_cart_table_${tableNumber}`;
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(storageKey, JSON.stringify(lines));
  }, [lines, hydrated, storageKey]);

  function addItem(item: Omit<CartLine, "quantity">) {
    setLines((prev) => {
      const existing = prev.find((l) => l.menuItemId === item.menuItemId);
      if (existing) {
        return prev.map((l) => (l.menuItemId === item.menuItemId ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function removeItem(menuItemId: string) {
    setLines((prev) => prev.filter((l) => l.menuItemId !== menuItemId));
  }

  function increment(menuItemId: string) {
    setLines((prev) => prev.map((l) => (l.menuItemId === menuItemId ? { ...l, quantity: l.quantity + 1 } : l)));
  }

  function decrement(menuItemId: string) {
    setLines((prev) =>
      prev
        .map((l) => (l.menuItemId === menuItemId ? { ...l, quantity: l.quantity - 1 } : l))
        .filter((l) => l.quantity > 0)
    );
  }

  function clear() {
    setLines([]);
  }

  const count = lines.reduce((s, l) => s + l.quantity, 0);
  const subtotal = lines.reduce((s, l) => s + l.quantity * l.price, 0);

  return (
    <CartContext.Provider value={{ lines, addItem, removeItem, increment, decrement, clear, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

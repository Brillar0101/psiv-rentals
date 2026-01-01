// src/store/cartStore.ts
// Global Cart State Management using Zustand

import { create } from 'zustand';

export interface CartItem {
  id: string;
  equipmentId: string;
  name: string;
  image: string;
  dailyRate: number;
  quantity: number;
  startDate: string;
  endDate: string;
  days: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [], // Start with empty cart

  addItem: (item) => {
    set((state) => {
      // Check if item already exists
      const existingItem = state.items.find((i) => i.equipmentId === item.equipmentId);
      
      if (existingItem) {
        // Update quantity if exists
        return {
          items: state.items.map((i) =>
            i.equipmentId === item.equipmentId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      } else {
        // Add new item
        return {
          items: [...state.items, { ...item, id: Date.now().toString() }],
        };
      }
    });
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }
    
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    }));
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce(
      (total, item) => total + item.dailyRate * item.quantity * item.days,
      0
    );
  },
}));

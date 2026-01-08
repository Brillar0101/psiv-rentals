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
  maxQuantity: number; // Track max available stock
  startDate: string;
  endDate: string;
  days: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => boolean; // Returns false if stock exceeded
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => boolean; // Returns false if stock exceeded
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemQuantity: (equipmentId: string) => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [], // Start with empty cart

  addItem: (item) => {
    const state = get();
    // Check if item already exists
    const existingItem = state.items.find((i) => i.equipmentId === item.equipmentId);

    if (existingItem) {
      // Check if adding one more exceeds max quantity
      if (existingItem.quantity >= existingItem.maxQuantity) {
        return false; // Cannot add more - stock exceeded
      }
      // Update quantity if exists
      set({
        items: state.items.map((i) =>
          i.equipmentId === item.equipmentId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      });
      return true;
    } else {
      // Check if max quantity allows adding
      if (item.maxQuantity < 1) {
        return false; // No stock available
      }
      // Add new item
      set({
        items: [...state.items, { ...item, id: Date.now().toString() }],
      });
      return true;
    }
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return true;
    }

    const state = get();
    const item = state.items.find((i) => i.id === id);

    // Check if new quantity exceeds max
    if (item && quantity > item.maxQuantity) {
      return false; // Cannot exceed max quantity
    }

    set({
      items: state.items.map((i) =>
        i.id === id ? { ...i, quantity } : i
      ),
    });
    return true;
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

  getItemQuantity: (equipmentId) => {
    const item = get().items.find((i) => i.equipmentId === equipmentId);
    return item ? item.quantity : 0;
  },
}));

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  color?: string;
  size: string;
  price: number;
  stock: number;
  quantity: number;
};

type CartState = {
  items: CartLine[];
  couponCode: string | null;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  addItem: (line: CartLine) => void;
  removeItem: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  applyCoupon: (code: string | null) => void;
  clear: () => void;
  mergeServerCart: (lines: CartLine[]) => void;
  subtotal: () => number;
  count: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      addItem: (line) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === line.variantId);
          if (existing) {
            const qty = Math.min(existing.quantity + line.quantity, existing.stock || 20);
            return {
              items: state.items.map((i) =>
                i.variantId === line.variantId ? { ...i, quantity: qty } : i
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, line], isOpen: true };
        }),
      removeItem: (variantId) =>
        set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),
      setQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0),
        })),
      applyCoupon: (code) => set({ couponCode: code }),
      clear: () => set({ items: [], couponCode: null }),
      mergeServerCart: (lines) =>
        set((state) => {
          const map = new Map<string, CartLine>();
          for (const l of state.items) map.set(l.variantId, l);
          for (const l of lines) {
            const existing = map.get(l.variantId);
            if (existing) {
              map.set(l.variantId, {
                ...existing,
                quantity: Math.min(existing.quantity + l.quantity, existing.stock || 20),
              });
            } else {
              map.set(l.variantId, l);
            }
          }
          return { items: Array.from(map.values()) };
        }),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "furikai-cart",
      partialize: (state) => ({ items: state.items, couponCode: state.couponCode }),
    }
  )
);

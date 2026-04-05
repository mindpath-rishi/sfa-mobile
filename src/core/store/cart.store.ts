import { CartItemWithDetails } from '@/features/product';
import { create } from 'zustand';
import { storage } from '../storage';

/* ================= TYPES ================= */

export interface CartSummary {
  totalSkus: number;
  totalValue: number;
  totalItems: number;
  totalCases: number;
  totalPieces: number;
  totalNetWeight: number;
}

interface CartStore {
  items: CartItemWithDetails[];
  summary: CartSummary;

  addItems: (items: CartItemWithDetails[]) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, type: 'cases' | 'units', quantity: number) => void;
  clearCart: () => void;

  hydrate: () => Promise<void>;

  // New helper methods
  getCartSummary: () => {
    subtotal: number;
    tax: number;
    total: number;
    netWeight: number;
    caseDetails: {
      totalCases: number;
      totalCaseWeight: number;
    };
    pieceDetails: {
      totalPieces: number;
      totalPieceWeight: number;
    };
  };
}

/* ================= STORAGE ================= */

const STORAGE_KEY = 'cart-storage';

const saveToStorage = async (state: { items: CartItemWithDetails[]; summary: CartSummary }) => {
  try {
    await storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // silent fail
  }
};

const loadFromStorage = async () => {
  try {
    const data = await storage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

/* ================= SUMMARY ================= */

const calculateSummary = (items: CartItemWithDetails[]): CartSummary => {
  const summary = items.reduce(
    (acc, item) => {
      const caseQty = item.caseQty || 0;
      const pieceQty = item.pieceQty || 0;

      const caseNetWeight = (item.caseNetWeight || 0) * caseQty;
      const pieceNetWeight = (item.pieceNetWeight || 0) * pieceQty;
      const itemNetWeight = caseNetWeight + pieceNetWeight;

      acc.totalCases += caseQty;
      acc.totalPieces += pieceQty;

      // ❌ REMOVE OLD LOGIC
      // acc.totalSkus += caseQty * item.unitQtyInCase + pieceQty;

      acc.totalValue += caseQty * item.casePrice + pieceQty * item.piecePrice;

      acc.totalItems += caseQty + pieceQty;

      acc.totalNetWeight += itemNetWeight;

      return acc;
    },
    {
      totalSkus: 0,
      totalValue: 0,
      totalItems: 0,
      totalCases: 0,
      totalPieces: 0,
      totalNetWeight: 0,
    },
  );

  // ✅ SKU COUNT (IMPORTANT)
  summary.totalSkus = items.length;

  return summary;
};

/* ================= STORE ================= */

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  summary: {
    totalSkus: 0,
    totalValue: 0,
    totalItems: 0,
    totalCases: 0,
    totalPieces: 0,
    totalNetWeight: 0,
  },

  /* ================= HYDRATE ================= */

  hydrate: async () => {
    const currentItems = get().items;

    // ✅ Prevent re-hydration if already loaded
    if (currentItems.length > 0) return;

    const data = await loadFromStorage();
    if (!data) return;

    set({
      items: data.items || [],
      summary: data.summary || calculateSummary(data.items || []),
    });
  },

  /* ================= ADD ================= */

  addItems: (newItems) => {
    set((state) => {
      const updated = [...state.items];

      newItems.forEach((newItem) => {
        const caseQty = newItem.caseQty || 0;
        const pieceQty = newItem.pieceQty || 0;

        const index = updated.findIndex((item) => item.productId === newItem.productId);

        // ✅ REMOVE if both zero
        if (caseQty === 0 && pieceQty === 0) {
          if (index !== -1) {
            updated.splice(index, 1);
          }
          return;
        }

        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            caseQty,
            pieceQty,
            // Preserve weight fields from existing item or new item
            caseNetWeight: newItem.caseNetWeight || updated[index].caseNetWeight,
            pieceNetWeight: newItem.pieceNetWeight || updated[index].pieceNetWeight,
          };
        } else {
          updated.push({
            ...newItem,
            caseQty,
            pieceQty,
          });
        }
      });

      const newState = {
        items: updated,
        summary: calculateSummary(updated),
      };

      saveToStorage(newState); // async non-blocking

      return newState;
    });
  },

  /* ================= REMOVE ================= */

  removeItem: (productId) => {
    set((state) => {
      const updated = state.items.filter((item) => item.productId !== productId);

      const newState = {
        items: updated,
        summary: calculateSummary(updated),
      };

      saveToStorage(newState);

      return newState;
    });
  },

  /* ================= UPDATE ================= */

  updateQuantity: (productId, type, quantity) => {
    set((state) => {
      let updated = state.items.map((item) => {
        if (item.productId !== productId) return item;

        return type === 'cases'
          ? { ...item, caseQty: Math.max(0, quantity) }
          : { ...item, pieceQty: Math.max(0, quantity) };
      });

      updated = updated.filter((item) => (item.caseQty || 0) > 0 || (item.pieceQty || 0) > 0);

      const newState = {
        items: updated,
        summary: calculateSummary(updated),
      };

      saveToStorage(newState);

      return newState;
    });
  },

  /* ================= CLEAR ================= */

  clearCart: () => {
    const newState = {
      items: [],
      summary: {
        totalSkus: 0,
        totalValue: 0,
        totalItems: 0,
        totalCases: 0,
        totalPieces: 0,
        totalNetWeight: 0,
      },
    };

    saveToStorage(newState);
    set(newState);
  },

  /* ================= GET CART SUMMARY ================= */

  getCartSummary: () => {
    const { items, summary } = get();

    // Calculate financial totals
    const subtotal = items.reduce((sum, item) => {
      const itemTotal =
        (item.caseQty || 0) * item.casePrice + (item.pieceQty || 0) * item.piecePrice;
      return sum + itemTotal;
    }, 0);

    const tax = 0;
    const total = subtotal + tax;

    // Calculate weight details
    let totalCaseWeight = 0;
    let totalPieceWeight = 0;
    let totalCases = 0;
    let totalPieces = 0;

    items.forEach((item) => {
      const caseQty = item.caseQty || 0;
      const pieceQty = item.pieceQty || 0;

      totalCases += caseQty;
      totalPieces += pieceQty;
      totalCaseWeight += (item.caseNetWeight || 0) * caseQty;
      totalPieceWeight += (item.pieceNetWeight || 0) * pieceQty;
    });

    const netWeight = totalCaseWeight + totalPieceWeight;

    return {
      subtotal,
      tax,
      total,
      netWeight,
      caseDetails: {
        totalCases,
        totalCaseWeight: Number(totalCaseWeight.toFixed(3)),
      },
      pieceDetails: {
        totalPieces,
        totalPieceWeight: Number(totalPieceWeight.toFixed(3)),
      },
    };
  },
}));

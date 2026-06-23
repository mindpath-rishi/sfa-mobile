// import { CartItemWithDetails } from '@/features/product';
// import { create } from 'zustand';
// import { storage } from '../storage';

// /* ================= TYPES ================= */

// export interface CartSummary {
//   totalSkus: number;
//   totalValue: number;
//   totalItems: number; // now = totalQty
//   totalCases: number;
//   totalPieces: number;
//   totalNetWeight: number;
// }

// interface CartStore {
//   items: CartItemWithDetails[];
//   summary: CartSummary;

//   addItems: (items: CartItemWithDetails[]) => void;
//   removeItem: (productId: string) => void;
//   updateQuantity: (productId: string, type: 'cases' | 'units', quantity: number) => void;
//   clearCart: () => void;

//   hydrate: () => Promise<void>;

//   getCartSummary: () => {
//     subtotal: number;
//     tax: number;
//     total: number;
//     totalQty: number; // ✅ added
//     totalNetWeight: number;
//     caseDetails: {
//       totalCases: number;
//       totalCaseWeight: number;
//     };
//     pieceDetails: {
//       totalPieces: number;
//       totalPieceWeight: number;
//     };
//   };
// }

// /* ================= STORAGE ================= */

// const STORAGE_KEY = 'cart-storage';

// const saveToStorage = async (state: { items: CartItemWithDetails[]; summary: CartSummary }) => {
//   try {
//     await storage.setItem(STORAGE_KEY, JSON.stringify(state));
//   } catch {}
// };

// const loadFromStorage = async () => {
//   try {
//     const data = await storage.getItem(STORAGE_KEY);
//     return data ? JSON.parse(data) : null;
//   } catch {
//     return null;
//   }
// };

// /* ================= HELPERS ================= */

// const toFixed4 = (value: number) => Number((value || 0).toFixed(4));

// const getItemNetWeight = (item: CartItemWithDetails) => {
//   const caseQty = item.caseQty ?? 0;
//   const pieceQty = item.pieceQty ?? 0;

//   const caseWeight = Number(item.caseNetWeight ?? 0) * caseQty;
//   const pieceWeight = Number(item.pieceNetWeight ?? 0) * pieceQty;

//   return {
//     caseWeight,
//     pieceWeight,
//     total: caseWeight + pieceWeight,
//   };
// };

// /* ================= SUMMARY ================= */

// const calculateSummary = (items: CartItemWithDetails[]): CartSummary => {
//   const summary = items.reduce(
//     (acc, item) => {
//       const caseQty = item.caseQty ?? 0;
//       const pieceQty = item.pieceQty ?? 0;
//       const unitQtyInCase = item.unitQtyInCase ?? 1;

//       const casePrice = item.casePrice;
//       const piecePrice = item.piecePrice ?? 0;

//       const quantity = caseQty * unitQtyInCase + pieceQty;
//       const { total } = getItemNetWeight(item);

//       acc.totalCases += caseQty;
//       acc.totalPieces += pieceQty;

//       acc.totalItems += quantity; // ✅ FIXED
//       acc.totalValue += caseQty * casePrice + pieceQty * piecePrice;
//       acc.totalNetWeight += total;

//       return acc;
//     },
//     {
//       totalSkus: 0,
//       totalValue: 0,
//       totalItems: 0,
//       totalCases: 0,
//       totalPieces: 0,
//       totalNetWeight: 0,
//     },
//   );

//   summary.totalSkus = items.length;

//   return {
//     ...summary,
//     totalValue: toFixed4(summary.totalValue),
//     totalNetWeight: toFixed4(summary.totalNetWeight),
//   };
// };

// /* ================= STORE ================= */

// export const useCartStore = create<CartStore>((set, get) => ({
//   items: [],
//   summary: {
//     totalSkus: 0,
//     totalValue: 0,
//     totalItems: 0,
//     totalCases: 0,
//     totalPieces: 0,
//     totalNetWeight: 0,
//   },

//   hydrate: async () => {
//     const currentItems = get().items;
//     if (currentItems.length > 0) return;

//     const data = await loadFromStorage();
//     if (!data) return;

//     set({
//       items: data.items || [],
//       summary: data.summary || calculateSummary(data.items || []),
//     });
//   },

//   addItems: (newItems) => {
//     set((state) => {
//       const updated = [...state.items];

//       newItems.forEach((newItem) => {
//         const caseQty = newItem.caseQty ?? 0;
//         const pieceQty = newItem.pieceQty ?? 0;

//         const index = updated.findIndex((item) => item.productId === newItem.productId);

//         if (caseQty === 0 && pieceQty === 0) {
//           if (index !== -1) updated.splice(index, 1);
//           return;
//         }

//         if (index !== -1) {
//           updated[index] = {
//             ...updated[index],
//             caseQty,
//             pieceQty,
//             unitQtyInCase: newItem.unitQtyInCase ?? updated[index].unitQtyInCase ?? 1,
//             caseNetWeight: newItem.caseNetWeight ?? updated[index].caseNetWeight,
//             pieceNetWeight: newItem.pieceNetWeight ?? updated[index].pieceNetWeight,
//             casePrice: newItem.casePrice ?? updated[index].casePrice ?? 0,
//             piecePrice: newItem.piecePrice ?? updated[index].piecePrice ?? 0,
//           };
//         } else {
//           updated.push({
//             ...newItem,
//             caseQty,
//             pieceQty,
//             unitQtyInCase: newItem.unitQtyInCase ?? 1,
//             casePrice: newItem.casePrice ?? 0,
//             piecePrice: newItem.piecePrice ?? 0,
//           });
//         }
//       });

//       const newState = {
//         items: updated,
//         summary: calculateSummary(updated),
//       };

//       saveToStorage(newState);
//       return newState;
//     });
//   },

//   removeItem: (productId) => {
//     set((state) => {
//       const updated = state.items.filter((item) => item.productId !== productId);

//       const newState = {
//         items: updated,
//         summary: calculateSummary(updated),
//       };

//       saveToStorage(newState);
//       return newState;
//     });
//   },

//   updateQuantity: (productId, type, quantity) => {
//     set((state) => {
//       let updated = state.items.map((item) => {
//         if (item.productId !== productId) return item;

//         return type === 'cases'
//           ? { ...item, caseQty: Math.max(0, quantity) }
//           : { ...item, pieceQty: Math.max(0, quantity) };
//       });

//       updated = updated.filter((item) => (item.caseQty ?? 0) > 0 || (item.pieceQty ?? 0) > 0);

//       const newState = {
//         items: updated,
//         summary: calculateSummary(updated),
//       };

//       saveToStorage(newState);
//       return newState;
//     });
//   },

//   clearCart: () => {
//     const newState = {
//       items: [],
//       summary: {
//         totalSkus: 0,
//         totalValue: 0,
//         totalItems: 0,
//         totalCases: 0,
//         totalPieces: 0,
//         totalNetWeight: 0,
//       },
//     };

//     saveToStorage(newState);
//     set(newState);
//   },

//   getCartSummary: () => {
//     const { items } = get();

//     const subtotalRaw = items.reduce((sum, item) => {
//       return (
//         sum +
//         (item.caseQty ?? 0) * Number(item.casePrice ?? 0) +
//         (item.pieceQty ?? 0) * Number(item.piecePrice ?? 0)
//       );
//     }, 0);

//     let totalCaseWeight = 0;
//     let totalPieceWeight = 0;
//     let totalCases = 0;
//     let totalPieces = 0;
//     let totalQty = 0;

//     items.forEach((item) => {
//       const caseQty = item.caseQty ?? 0;
//       const pieceQty = item.pieceQty ?? 0;
//       const unitQtyInCase = item.unitQtyInCase ?? 1;

//       const quantity = caseQty * unitQtyInCase + pieceQty;

//       const { caseWeight, pieceWeight } = getItemNetWeight(item);

//       totalCases += caseQty;
//       totalPieces += pieceQty;
//       totalQty += quantity;

//       totalCaseWeight += caseWeight;
//       totalPieceWeight += pieceWeight;
//     });

//     return {
//       subtotal: toFixed4(subtotalRaw),
//       tax: toFixed4(0),
//       total: toFixed4(subtotalRaw),
//       totalQty, // ✅ FIXED
//       totalNetWeight: toFixed4(totalCaseWeight + totalPieceWeight),

//       caseDetails: {
//         totalCases,
//         totalCaseWeight: toFixed4(totalCaseWeight),
//       },
//       pieceDetails: {
//         totalPieces,
//         totalPieceWeight: toFixed4(totalPieceWeight),
//       },
//     };
//   },
// }));

import { CartItemWithDetails } from '@/features/product';
import { create } from 'zustand';
import { storage } from '../storage';
import { registerStoreReset } from './reset.store';

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
  reset: () => void; // ✅ added

  hydrate: () => Promise<void>;

  getCartSummary: () => {
    subtotal: number;
    tax: number;
    total: number;
    totalQty: number;
    totalNetWeight: number;
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

/* ================= INITIAL STATE ================= */

const initialState = {
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

/* ================= STORAGE ================= */

const STORAGE_KEY = 'cart-storage';

const saveToStorage = async (state: { items: CartItemWithDetails[]; summary: CartSummary }) => {
  try {
    await storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
};

const loadFromStorage = async () => {
  try {
    const data = await storage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

/* ================= HELPERS ================= */

const toFixed4 = (value: number) => Number((value || 0).toFixed(4));

const getItemNetWeight = (item: CartItemWithDetails) => {
  const caseQty = item.caseQty ?? 0;
  const pieceQty = item.pieceQty ?? 0;

  const caseWeight = Number(item.caseNetWeight ?? 0) * caseQty;
  const pieceWeight = Number(item.pieceNetWeight ?? 0) * pieceQty;

  return {
    caseWeight,
    pieceWeight,
    total: caseWeight + pieceWeight,
  };
};

/* ================= SUMMARY ================= */

// const calculateSummary = (items: CartItemWithDetails[]): CartSummary => {
//   const summary = items.reduce(
//     (acc, item) => {
//       const caseQty = item.caseQty ?? 0;
//       const pieceQty = item.pieceQty ?? 0;
//       const unitQtyInCase = item.unitQtyInCase ?? 1;

//       const casePrice = item.casePrice;
//       const piecePrice = item.piecePrice ?? 0;

//       const quantity = caseQty * unitQtyInCase + pieceQty;
//       const { total } = getItemNetWeight(item);

//       acc.totalCases += caseQty;
//       acc.totalPieces += pieceQty;
//       acc.totalItems += quantity;
//       acc.totalValue += caseQty * casePrice + pieceQty * piecePrice;
//       acc.totalNetWeight += total;

//       return acc;
//     },
//     {
//       totalSkus: 0,
//       totalValue: 0,
//       totalItems: 0,
//       totalCases: 0,
//       totalPieces: 0,
//       totalNetWeight: 0,
//     },
//   );

//   summary.totalSkus = items.length;

//   return {
//     ...summary,
//     totalValue: toFixed4(summary.totalValue),
//     totalNetWeight: toFixed4(summary.totalNetWeight),
//   };
// };

const calculateSummary = (items: CartItemWithDetails[]): CartSummary => {
  const summary = items.reduce(
    (acc, item) => {
      const caseQty = item.caseQty ?? 0;
      const pieceQty = item.pieceQty ?? 0;

      const casePrice = item.casePrice ?? 0;
      const piecePrice = item.piecePrice ?? 0;

      const { total } = getItemNetWeight(item);

      // ✅ Cases & Pieces
      acc.totalCases += caseQty;
      acc.totalPieces += pieceQty;

      // ✅ Items = cases + pieces
      acc.totalItems += caseQty + pieceQty;

      // ✅ SKU (only if qty exists)
      if (caseQty > 0 || pieceQty > 0) {
        acc.totalSkus += 1;
      }

      // ✅ Value
      acc.totalValue += caseQty * casePrice + pieceQty * piecePrice;

      // ✅ Weight
      acc.totalNetWeight += total;

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

  return {
    ...summary,
    totalValue: toFixed4(summary.totalValue),
    totalNetWeight: toFixed4(summary.totalNetWeight),
  };
};
/* ================= STORE ================= */

export const useCartStore = create<CartStore>((set, get) => {
  // 🔥 AUTO REGISTER RESET
  registerStoreReset('cart', () => {
    set(initialState);
  });

  return {
    ...initialState,

    // ✅ RESET METHOD
    reset: () => {
      set(initialState);
    },

    hydrate: async () => {
      const currentItems = get().items;
      if (currentItems.length > 0) return;

      const data = await loadFromStorage();
      if (!data) return;

      set({
        items: data.items || [],
        summary: data.summary || calculateSummary(data.items || []),
      });
    },

    addItems: (newItems) => {
      set((state) => {
        const updated = [...state.items];

        newItems.forEach((newItem) => {
          const caseQty = newItem.caseQty ?? 0;
          const pieceQty = newItem.pieceQty ?? 0;

          const index = updated.findIndex((item) => item.productId === newItem.productId);

          if (caseQty === 0 && pieceQty === 0) {
            if (index !== -1) updated.splice(index, 1);
            return;
          }

          if (index !== -1) {
            updated[index] = {
              ...updated[index],
              caseQty,
              pieceQty,
              unitQtyInCase: newItem.unitQtyInCase ?? updated[index].unitQtyInCase ?? 1,
              caseNetWeight: newItem.caseNetWeight ?? updated[index].caseNetWeight,
              pieceNetWeight: newItem.pieceNetWeight ?? updated[index].pieceNetWeight,
              casePrice: newItem.casePrice ?? updated[index].casePrice ?? 0,
              piecePrice: newItem.piecePrice ?? updated[index].piecePrice ?? 0,
              compCode: newItem.compCode ?? updated[index].compCode,
              categoryId: newItem.categoryId ?? updated[index].categoryId,
              parentCategoryId: newItem.parentCategoryId ?? updated[index].parentCategoryId,
            };
          } else {
            updated.push({
              ...newItem,
              caseQty,
              pieceQty,
              unitQtyInCase: newItem.unitQtyInCase ?? 1,
              casePrice: newItem.casePrice ?? 0,
              piecePrice: newItem.piecePrice ?? 0,
            });
          }
        });

        const newState = {
          items: updated,
          summary: calculateSummary(updated),
        };

        saveToStorage(newState);
        return newState;
      });
    },

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

    updateQuantity: (productId, type, quantity) => {
      set((state) => {
        let updated = state.items.map((item) => {
          if (item.productId !== productId) return item;

          return type === 'cases'
            ? { ...item, caseQty: Math.max(0, quantity) }
            : { ...item, pieceQty: Math.max(0, quantity) };
        });

        updated = updated.filter((item) => (item.caseQty ?? 0) > 0 || (item.pieceQty ?? 0) > 0);

        const newState = {
          items: updated,
          summary: calculateSummary(updated),
        };

        saveToStorage(newState);
        return newState;
      });
    },

    clearCart: () => {
      const newState = { ...initialState };
      saveToStorage(newState);
      set(newState);
    },

    getCartSummary: () => {
      const { items } = get();

      const subtotalRaw = items.reduce((sum, item) => {
        return (
          sum +
          (item.caseQty ?? 0) * Number(item.casePrice ?? 0) +
          (item.pieceQty ?? 0) * Number(item.piecePrice ?? 0)
        );
      }, 0);

      let totalCaseWeight = 0;
      let totalPieceWeight = 0;
      let totalCases = 0;
      let totalPieces = 0;
      let totalQty = 0;

      items.forEach((item) => {
        const caseQty = item.caseQty ?? 0;
        const pieceQty = item.pieceQty ?? 0;
        const unitQtyInCase = item.unitQtyInCase ?? 1;

        const quantity = caseQty * unitQtyInCase + pieceQty;

        const { caseWeight, pieceWeight } = getItemNetWeight(item);

        totalCases += caseQty;
        totalPieces += pieceQty;
        totalQty += quantity;

        totalCaseWeight += caseWeight;
        totalPieceWeight += pieceWeight;
      });

      return {
        subtotal: toFixed4(subtotalRaw),
        tax: toFixed4(0),
        total: toFixed4(subtotalRaw),
        totalQty,
        totalNetWeight: toFixed4(totalCaseWeight + totalPieceWeight),

        caseDetails: {
          totalCases,
          totalCaseWeight: toFixed4(totalCaseWeight),
        },
        pieceDetails: {
          totalPieces,
          totalPieceWeight: toFixed4(totalPieceWeight),
        },
      };
    },
  };
});

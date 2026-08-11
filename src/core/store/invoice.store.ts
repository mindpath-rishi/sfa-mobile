import { create } from 'zustand';

type InvoiceState = {
  latestInvoice: any | null;
  setLatestInvoice: (invoice: any | null) => void;
  clearLatestInvoice: () => void;
};

export const useInvoiceStore = create<InvoiceState>((set) => ({
  latestInvoice: null,
  setLatestInvoice: (invoice) => set({ latestInvoice: invoice }),
  clearLatestInvoice: () => set({ latestInvoice: null }),
}));

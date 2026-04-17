// FilterContext.tsx
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface FilterContextType {
  // Products
  productsFilterCount: number;
  updateProductsFilterCount: (count: number) => void;
  resetProductsFilterCount: () => void;

  // Outlets
  outletsFilterCount: number;
  updateOutletsFilterCount: (count: number) => void;
  resetOutletsFilterCount: () => void;

  // Reports
  reportsFilterCount: number;
  updateReportsFilterCount: (count: number) => void;
  resetReportsFilterCount: () => void;

  // Payments
  paymentsFilterCount: number;
  updatePaymentsFilterCount: (count: number) => void;
  resetPaymentsFilterCount: () => void;

  // Van Inventory Top-up
  topupFilterCount: number;
  updateTopupFilterCount: (count: number) => void;
  resetTopupFilterCount: () => void;

  // Stock Count
  stockCountFilterCount: number;
  updateStockCountFilterCount: (count: number) => void;
  resetStockCountFilterCount: () => void;

  // ✅ Product Filter Handler
  openProductFilter: () => void;
  setOpenProductFilterHandler: (fn: () => void) => void;

  // ✅ Outlet Filter Handler
  openOutletFilter: () => void;
  setOpenOutletFilterHandler: (fn: () => void) => void;

  // ✅ Payment Filter Handler
  openPaymentFilter: () => void;
  setOpenPaymentFilterHandler: (fn: () => void) => void;

  // ✅ Top-up Filter Handler
  openTopupFilter: () => void;
  setOpenTopupFilterHandler: (fn: () => void) => void;

  // ✅ Stock Count Filter Handler
  openStockCountFilter: () => void;
  setOpenStockCountFilterHandler: (fn: () => void) => void;

  // Reset all filters
  resetAllFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  /* ================= FILTER COUNTS ================= */

  const [productsFilterCount, setProductsFilterCount] = useState(0);
  const [outletsFilterCount, setOutletsFilterCount] = useState(0);
  const [reportsFilterCount, setReportsFilterCount] = useState(0);
  const [paymentsFilterCount, setPaymentsFilterCount] = useState(0);
  const [topupFilterCount, setTopupFilterCount] = useState(0);
  const [stockCountFilterCount, setStockCountFilterCount] = useState(0);

  // Products
  const updateProductsFilterCount = useCallback((count: number) => {
    setProductsFilterCount(count);
  }, []);

  const resetProductsFilterCount = useCallback(() => {
    setProductsFilterCount(0);
  }, []);

  // Outlets
  const updateOutletsFilterCount = useCallback((count: number) => {
    setOutletsFilterCount(count);
  }, []);

  const resetOutletsFilterCount = useCallback(() => {
    setOutletsFilterCount(0);
  }, []);

  // Reports
  const updateReportsFilterCount = useCallback((count: number) => {
    setReportsFilterCount(count);
  }, []);

  const resetReportsFilterCount = useCallback(() => {
    setReportsFilterCount(0);
  }, []);

  // Payments
  const updatePaymentsFilterCount = useCallback((count: number) => {
    setPaymentsFilterCount(count);
  }, []);

  const resetPaymentsFilterCount = useCallback(() => {
    setPaymentsFilterCount(0);
  }, []);

  // Top-up
  const updateTopupFilterCount = useCallback((count: number) => {
    setTopupFilterCount(count);
  }, []);

  const resetTopupFilterCount = useCallback(() => {
    setTopupFilterCount(0);
  }, []);

  // Stock Count
  const updateStockCountFilterCount = useCallback((count: number) => {
    setStockCountFilterCount(count);
  }, []);

  const resetStockCountFilterCount = useCallback(() => {
    setStockCountFilterCount(0);
  }, []);

  /* ================= PRODUCT FILTER HANDLER ================= */

  const [openProductFilterHandler, setOpenProductFilterHandlerState] = useState<() => void>(
    () => () => {},
  );

  const setOpenProductFilterHandler = useCallback((fn: () => void) => {
    setOpenProductFilterHandlerState(() => fn);
  }, []);

  const openProductFilter = useCallback(() => {
    openProductFilterHandler();
  }, [openProductFilterHandler]);

  /* ================= OUTLET FILTER HANDLER ================= */

  const [openOutletFilterHandler, setOpenOutletFilterHandlerState] = useState<() => void>(
    () => () => {},
  );

  const setOpenOutletFilterHandler = useCallback((fn: () => void) => {
    setOpenOutletFilterHandlerState(() => fn);
  }, []);

  const openOutletFilter = useCallback(() => {
    openOutletFilterHandler();
  }, [openOutletFilterHandler]);

  /* ================= PAYMENT FILTER HANDLER ================= */

  const [openPaymentFilterHandler, setOpenPaymentFilterHandlerState] = useState<() => void>(
    () => () => {},
  );

  const setOpenPaymentFilterHandler = useCallback((fn: () => void) => {
    setOpenPaymentFilterHandlerState(() => fn);
  }, []);

  const openPaymentFilter = useCallback(() => {
    openPaymentFilterHandler();
  }, [openPaymentFilterHandler]);

  /* ================= TOP-UP FILTER HANDLER ================= */

  const [openTopupFilterHandler, setOpenTopupFilterHandlerState] = useState<() => void>(
    () => () => {},
  );

  const setOpenTopupFilterHandler = useCallback((fn: () => void) => {
    setOpenTopupFilterHandlerState(() => fn);
  }, []);

  const openTopupFilter = useCallback(() => {
    openTopupFilterHandler();
  }, [openTopupFilterHandler]);

  /* ================= STOCK COUNT FILTER HANDLER ================= */

  const [openStockCountFilterHandler, setOpenStockCountFilterHandlerState] = useState<() => void>(
    () => () => {},
  );

  const setOpenStockCountFilterHandler = useCallback((fn: () => void) => {
    setOpenStockCountFilterHandlerState(() => fn);
  }, []);

  const openStockCountFilter = useCallback(() => {
    openStockCountFilterHandler();
  }, [openStockCountFilterHandler]);

  /* ================= RESET ALL FILTERS ================= */

  const resetAllFilters = useCallback(() => {
    // Reset all filter counts
    setProductsFilterCount(0);
    setOutletsFilterCount(0);
    setReportsFilterCount(0);
    setPaymentsFilterCount(0);
    setTopupFilterCount(0);
    setStockCountFilterCount(0);

    // Reset all filter handlers (optional - set to empty functions)
    setOpenProductFilterHandlerState(() => () => {});
    setOpenOutletFilterHandlerState(() => () => {});
    setOpenPaymentFilterHandlerState(() => () => {});
    setOpenTopupFilterHandlerState(() => () => {});
    setOpenStockCountFilterHandlerState(() => () => {});
  }, []);

  /* ================= PROVIDER ================= */

  return (
    <FilterContext.Provider
      value={{
        // Products
        productsFilterCount,
        updateProductsFilterCount,
        resetProductsFilterCount,

        // Outlets
        outletsFilterCount,
        updateOutletsFilterCount,
        resetOutletsFilterCount,

        // Reports
        reportsFilterCount,
        updateReportsFilterCount,
        resetReportsFilterCount,

        // Payments
        paymentsFilterCount,
        updatePaymentsFilterCount,
        resetPaymentsFilterCount,

        // Top-up
        topupFilterCount,
        updateTopupFilterCount,
        resetTopupFilterCount,

        // Stock Count
        stockCountFilterCount,
        updateStockCountFilterCount,
        resetStockCountFilterCount,

        // Product Filter
        openProductFilter,
        setOpenProductFilterHandler,

        // Outlet Filter
        openOutletFilter,
        setOpenOutletFilterHandler,

        // Payment Filter
        openPaymentFilter,
        setOpenPaymentFilterHandler,

        // Top-up Filter
        openTopupFilter,
        setOpenTopupFilterHandler,

        // Stock Count Filter
        openStockCountFilter,
        setOpenStockCountFilterHandler,

        // Reset all
        resetAllFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

/* ================= HOOK ================= */

export const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilterContext must be used within FilterProvider');
  }
  return context;
};
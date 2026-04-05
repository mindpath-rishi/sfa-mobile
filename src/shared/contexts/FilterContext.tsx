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

  // ✅ Product Filter Handler
  openProductFilter: () => void;
  setOpenProductFilterHandler: (fn: () => void) => void;

  // ✅ Outlet Filter Handler
  openOutletFilter: () => void;
  setOpenOutletFilterHandler: (fn: () => void) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  /* ================= FILTER COUNTS ================= */

  const [productsFilterCount, setProductsFilterCount] = useState(0);
  const [outletsFilterCount, setOutletsFilterCount] = useState(0);
  const [reportsFilterCount, setReportsFilterCount] = useState(0);

  const updateProductsFilterCount = useCallback((count: number) => {
    setProductsFilterCount(count);
  }, []);

  const resetProductsFilterCount = useCallback(() => {
    setProductsFilterCount(0);
  }, []);

  const updateOutletsFilterCount = useCallback((count: number) => {
    setOutletsFilterCount(count);
  }, []);

  const resetOutletsFilterCount = useCallback(() => {
    setOutletsFilterCount(0);
  }, []);

  const updateReportsFilterCount = useCallback((count: number) => {
    setReportsFilterCount(count);
  }, []);

  const resetReportsFilterCount = useCallback(() => {
    setReportsFilterCount(0);
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

        // Product Filter
        openProductFilter,
        setOpenProductFilterHandler,

        // Outlet Filter
        openOutletFilter,
        setOpenOutletFilterHandler,
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

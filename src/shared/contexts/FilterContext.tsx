// shared/contexts/FilterContext.tsx
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface FilterContextType {
  // Products
  productsFilterCount: number;
  updateProductsFilterCount: (count: number) => void;
  resetProductsFilterCount: () => void;

  // Customers
  customersFilterCount: number;
  updateCustomersFilterCount: (count: number) => void;
  resetCustomersFilterCount: () => void;

  // Reports
  reportsFilterCount: number;
  updateReportsFilterCount: (count: number) => void;
  resetReportsFilterCount: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [productsFilterCount, setProductsFilterCount] = useState(0);
  const [customersFilterCount, setCustomersFilterCount] = useState(0);
  const [reportsFilterCount, setReportsFilterCount] = useState(0);

  const updateProductsFilterCount = useCallback((count: number) => {
    setProductsFilterCount(count);
  }, []);

  const resetProductsFilterCount = useCallback(() => {
    setProductsFilterCount(0);
  }, []);

  const updateCustomersFilterCount = useCallback((count: number) => {
    setCustomersFilterCount(count);
  }, []);

  const resetCustomersFilterCount = useCallback(() => {
    setCustomersFilterCount(0);
  }, []);

  const updateReportsFilterCount = useCallback((count: number) => {
    setReportsFilterCount(count);
  }, []);

  const resetReportsFilterCount = useCallback(() => {
    setReportsFilterCount(0);
  }, []);

  return (
    <FilterContext.Provider
      value={{
        productsFilterCount,
        updateProductsFilterCount,
        resetProductsFilterCount,
        customersFilterCount,
        updateCustomersFilterCount,
        resetCustomersFilterCount,
        reportsFilterCount,
        updateReportsFilterCount,
        resetReportsFilterCount,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilterContext must be used within FilterProvider');
  }
  return context;
};

import React, { createContext, useContext, useState } from 'react';

/* ============================
 * TYPES
 * ============================ */

export type HeaderConfig = {
  title?: string;
  subtitle?: string;

  showBack?: boolean;
  showMenu?: boolean;

  showFilter?: boolean;
  filterActive?: boolean;
  filterCount?: number;
  onFilterPress?: () => void;

  onRightPress?: () => void;
  onSecondRightPress?: () => void;

  badgeCount?: number;

  centeredTitle?: boolean;
  elevated?: boolean;
  showBorder?: boolean;

  hidden?: boolean;
  backgroundColor?: string;
};

type HeaderContextType = {
  config: HeaderConfig;
  setHeader: (config: Partial<HeaderConfig>) => void;
  resetHeader: () => void;
};

/* ============================
 * DEFAULT CONFIG
 * ============================ */

const defaultConfig: HeaderConfig = {
  title: '',
  subtitle: undefined,

  showBack: false,
  showMenu: false,

  showFilter: false,
  filterActive: false,
  filterCount: 0,

  centeredTitle: true,
  elevated: true,
  showBorder: true,

  badgeCount: 0,

  hidden: false,
  backgroundColor: 'white',
};

/* ============================
 * CONTEXT
 * ============================ */

const HeaderContext = createContext<HeaderContextType>({
  config: defaultConfig,
  setHeader: () => {},
  resetHeader: () => {},
});

/* ============================
 * PROVIDER
 * ============================ */

export const HeaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<HeaderConfig>(defaultConfig);

  /* ============================
   * SET HEADER (MERGE SAFE)
   * ============================ */

  const setHeader = (newConfig: Partial<HeaderConfig>) => {
    setConfig((prev) => ({
      ...prev,
      ...newConfig, // ✅ merge instead of override
    }));
  };

  /* ============================
   * RESET HEADER
   * ============================ */

  const resetHeader = () => {
    setConfig(defaultConfig);
  };

  return (
    <HeaderContext.Provider value={{ config, setHeader, resetHeader }}>
      {children}
    </HeaderContext.Provider>
  );
};

/* ============================
 * HOOK
 * ============================ */

export const useHeader = () => useContext(HeaderContext);

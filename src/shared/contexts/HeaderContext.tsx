import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

import { useSegments } from 'expo-router';

import { useTheme } from '@/shared/hooks/useTheme';

export type HeaderConfig = {
  title?: string;
  subtitle?: string;

  showBack?: boolean;
  showMenu?: boolean;
  onBackPress?: () => void;

  showSearch?: boolean;
  showFilter?: boolean;

  searchValue?: string;
  searchPlaceholder?: string;

  onSearchChange?: (text: string) => void;
  onSearchClear?: () => void;
  onSearchPress?: () => void;

  filterActive?: boolean;
  filterCount?: number;
  onFilterPress?: () => void;

  rightIcon?: string;
  rightIcon2?: string;
  badgeCount?: number;

  onRightPress?: () => void;
  onRightPress2?: () => void;

  hidden?: boolean;

  backgroundColor?: string;

  size?: 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg';
};

type HeaderActions = {
  setHeader: (config: Partial<HeaderConfig>) => void;
  resetHeader: () => void;
};

/*
 * Config and actions live in separate contexts: screens only set the header,
 * so they must not re-render every time any screen changes it. Only the
 * header bar subscribes to the config.
 */
const HeaderConfigContext = createContext<HeaderConfig | undefined>(undefined);
const HeaderActionsContext = createContext<HeaderActions | undefined>(undefined);

export const HeaderProvider = ({ children }: { children: React.ReactNode }) => {
  const segments = useSegments();

  const { colors } = useTheme();

  const isHome = segments.includes('home');

  const baseConfig = useMemo<HeaderConfig>(
    () => ({
      title: '',

      subtitle: '',

      showBack: !isHome,

      showMenu: isHome,

      showSearch: false,

      showFilter: false,

      searchValue: '',

      searchPlaceholder: 'Search...',

      filterActive: false,

      filterCount: 0,

      centeredTitle: true,

      elevated: true,

      showBorder: false,

      hidden: false,

      backgroundColor: colors.primary,

      size: 'small',

      rightIcon: undefined,
      rightIcon2: undefined,
      badgeCount: 0,

      onRightPress: undefined,
      onRightPress2: undefined,

      onSearchChange: undefined,
      onSearchClear: undefined,
      onSearchPress: undefined,

      onFilterPress: undefined,
    }),
    [isHome, colors.primary],
  );

  const [config, setConfig] = useState<HeaderConfig>(baseConfig);

  const setHeader = useCallback(
    (newConfig: Partial<HeaderConfig>) => {
      setConfig({
        ...baseConfig,
        ...newConfig,
      });
    },
    [baseConfig],
  );

  const resetHeader = useCallback(() => {
    setConfig(baseConfig);
  }, [baseConfig]);

  const actions = useMemo(() => ({ setHeader, resetHeader }), [setHeader, resetHeader]);

  return (
    <HeaderActionsContext.Provider value={actions}>
      <HeaderConfigContext.Provider value={config}>{children}</HeaderConfigContext.Provider>
    </HeaderActionsContext.Provider>
  );
};

/** Set or reset the header from a screen; does not re-render on header changes. */
export const useHeader = () => {
  const context = useContext(HeaderActionsContext);

  if (!context) {
    throw new Error('useHeader must be used within HeaderProvider');
  }

  return context;
};

/** Current header config, for the header bar itself. */
export const useHeaderConfig = () => {
  const config = useContext(HeaderConfigContext);

  if (!config) {
    throw new Error('useHeaderConfig must be used within HeaderProvider');
  }

  return config;
};

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useSegments } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';

/* ============================
 * TYPES
 * ============================ */

export type HeaderConfig = {
  title?: string;
  subtitle?: string;

  showBack?: boolean;
  showMenu?: boolean;
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

  onRightPress?: () => void;
  onRightPress2?: () => void;

  secondRightIcon?: string;
  onSecondRightPress?: () => void;

  badgeCount?: number;

  centeredTitle?: boolean;
  elevated?: boolean;
  showBorder?: boolean;
  useGradient?: boolean;
  gradientColors?: string[];
  transparent?: boolean;

  hidden?: boolean;
  backgroundColor?: string;
  size?: 'small' | 'medium' | 'large';

  __ts?: number; // 🔥 force re-render key
};

type HeaderContextType = {
  config: HeaderConfig;
  setHeader: (config: Partial<HeaderConfig>) => void;
};

/* ============================
 * CONTEXT
 * ============================ */

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

/* ============================
 * ROUTE KEY
 * ============================ */

const getRouteKey = (segments: string[]) => {
  if (!segments || segments.length === 0) return 'root';

  return segments
    .map((seg) => {
      if (/^\d+$/.test(seg)) return '[id]';
      if (seg.length > 20) return '[param]';
      return seg;
    })
    .join('/');
};

/* ============================
 * PROVIDER
 * ============================ */

export const HeaderProvider = ({ children }: { children: React.ReactNode }) => {
  const segments = useSegments();
  const { colors } = useTheme();

  const routeKey = useMemo(() => getRouteKey(segments), [segments]);

  const [configs, setConfigs] = useState<Record<string, HeaderConfig>>({});

  /* ============================
   * BASE CONFIG
   * ============================ */

  const baseConfig: HeaderConfig = useMemo(() => {
    const isRoot = segments.length <= 1;

    console.log(isRoot, "==================root=====================")

    return {
      title: '',
      showBack: !isRoot,
      showMenu: isRoot,
      showSearch: false,
      showFilter: false,
      searchValue: '',
      searchPlaceholder: 'Search...',
      filterActive: false,
      filterCount: 0,
      badgeCount: 0,
      centeredTitle: true,
      elevated: true,
      showBorder: false,
      useGradient: false,
      transparent: false,
      hidden: false,
      backgroundColor: colors.primary,
      size: 'medium',
    };
  }, [segments, colors.primary]);

  /* ============================
   * SET HEADER (FIXED)
   * ============================ */

const setHeader = useCallback(
  (newConfig: Partial<HeaderConfig>) => {
    setConfigs((prev) => ({
      ...prev,
      [routeKey]: {
        ...newConfig, // ✅ no merge with old config
        __ts: Date.now(),
      },
    }));
  },
  [routeKey],
);

  /* ============================
   * FINAL CONFIG (MEMOIZED)
   * ============================ */

  const config = useMemo(() => {
    return {
      ...baseConfig,
      ...(configs[routeKey] || {}),
    };
  }, [baseConfig, configs, routeKey]);

  return (
    <HeaderContext.Provider value={{ config, setHeader }}>
      {children}
    </HeaderContext.Provider>
  );
};

/* ============================
 * HOOK
 * ============================ */

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader must be used within HeaderProvider');
  }
  return context;
};
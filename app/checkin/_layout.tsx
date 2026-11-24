// SaleLayout.tsx
import { Stack } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { Header } from '@/core/components/Header';

/*
 * The header content (title, back/menu, filter, search) comes from HeaderContext:
 * each screen sets it via `useHeader().setHeader(...)`. Screen options here only
 * control whether the header is shown at all.
 */
type ScreenOptions = {
  headerShown?: boolean;
};

export default function SaleLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        header: ({ options }) => {
          const customOptions = options as ScreenOptions;

          /* ======================================================
           * ✅ RELIABLE HEADER HIDE
           * ====================================================== */
          if (customOptions.headerShown === false) {
            return null;
          }

          return <Header />;
        },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {/* ================= SHARE INVOICE ================= */}
      <Stack.Screen name="shareinvoice" options={{ headerShown: false }} />
    </Stack>
  );
}

// import React from 'react';
// import { View, Text, TouchableOpacity } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useTheme } from '@/shared/hooks/useTheme';
// import { StatPill } from './StatPill';

// interface HeaderCardProps {
//   outletName: string | undefined;
//   customerId: string | undefined;
//   reference: string | undefined;

//   totals: {
//     totalCases: number;
//     totalPieces: number;
//     totalSkus: number;
//     totalItems: number;
//   };

//   onReset: () => void;
//   isProcessing?: boolean;
// }

// export const HeaderCard: React.FC<HeaderCardProps> = ({
//   outletName,
//   customerId,
//   reference,
//   totals,
//   onReset,
//   isProcessing = false,
// }) => {
//   const { colors } = useTheme();

//   return (
//     <View
//       style={{
//         backgroundColor: colors.surface,
//         borderRadius: 16,
//         padding: 16,
//         borderWidth: 0.5,
//         borderColor: colors.border + '30',
//       }}
//     >
//       {/* ================= HEADER ================= */}
//       <View
//         style={{
//           flexDirection: 'row',
//           justifyContent: 'space-between',
//           alignItems: 'flex-start',
//           marginBottom: 14,
//         }}
//       >
//         <View>
//           <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
//             {outletName}
//           </Text>
//           <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 2 }}>
//             {reference} · #{customerId}
//           </Text>
//         </View>

//         <TouchableOpacity
//           onPress={onReset}
//           disabled={isProcessing}
//           style={{
//             flexDirection: 'row',
//             alignItems: 'center',
//             gap: 6,
//             paddingHorizontal: 12,
//             paddingVertical: 8,
//             borderRadius: 10,
//             borderWidth: 0.5,
//             borderColor: colors.border + '50',
//             backgroundColor: colors.background,
//           }}
//         >
//           <Ionicons name="refresh-outline" size={16} color={colors.textSecondary} />
//           <Text style={{ fontSize: 12, color: colors.textSecondary }}>Reset</Text>
//         </TouchableOpacity>
//       </View>

//       {/* ================= STATS ================= */}
//       <View style={{ flexDirection: 'row', gap: 8 }}>
//         <StatPill value={totals.totalSkus} label="SKU" highlight={totals.totalSkus > 0} />
//         <StatPill value={totals.totalCases} label="CASES" highlight={totals.totalCases > 0} />

//         <StatPill value={totals.totalPieces} label="PIECES" highlight={totals.totalPieces > 0} />

//         <StatPill value={totals.totalItems} label="ITEMS" highlight={totals.totalItems > 0} />
//       </View>
//     </View>
//   );
// };

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import { StatPill } from './StatPill';

interface HeaderCardProps {
  outletName: string | undefined;
  customerId: string | undefined;
  reference: string | undefined;
  totals: {
    totalCases: number;
    totalPieces: number;
    totalSkus: number;
    totalItems: number;
  };
  onReset?: () => void;
  isProcessing?: boolean;
  mode?: 'sales' | 'topup';
  title?: string;
  warehouseId?: string;
  warehouseName?: string;
  date?: string;
}

export const HeaderCard: React.FC<HeaderCardProps> = ({
  outletName,
  customerId,
  reference,
  totals,
  onReset,
  isProcessing = false,
  mode = 'sales',
  title,
  warehouseId,
  warehouseName,
  date,
}) => {
  const { colors } = useTheme();

  const displayTitle = title || (mode === 'sales' ? 'Sales Summary' : 'Top-up Summary');
  const displaySubtitle =
    mode === 'sales'
      ? `${reference} · #${customerId}`
      : `${reference} · ${warehouseName || warehouseId || 'Warehouse'}`;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 0.5,
        borderColor: colors.border + '30',
      }}
    >
      {/* ================= HEADER ================= */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 14,
        }}
      >
        <View>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
            {outletName || displayTitle}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 2 }}>
            {displaySubtitle}
          </Text>
          {mode === 'topup' && date && (
            <Text style={{ fontSize: 11, color: colors.textTertiary, marginTop: 2 }}>{date}</Text>
          )}
        </View>

        {onReset && (
          <TouchableOpacity
            onPress={onReset}
            disabled={isProcessing}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 10,
              borderWidth: 0.5,
              borderColor: colors.border + '50',
              backgroundColor: colors.background,
            }}
          >
            <Ionicons name="refresh-outline" size={16} color={colors.textSecondary} />
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ================= STATS ================= */}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <StatPill value={totals.totalSkus} label="SKU" highlight={totals.totalSkus > 0} />
        <StatPill value={totals.totalCases} label="CASES" highlight={totals.totalCases > 0} />
        <StatPill value={totals.totalPieces} label="PIECES" highlight={totals.totalPieces > 0} />
        <StatPill value={totals.totalItems} label="ITEMS" highlight={totals.totalItems > 0} />
      </View>
    </View>
  );
};

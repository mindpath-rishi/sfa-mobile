// import React from 'react';
// import { View, Text } from 'react-native';
// import { useTheme } from '@/shared/hooks/useTheme';
// import { CartItemWithDetails, Product } from '@/features/product';
// import { ProductItem } from './ProductItem';
// import { EmptyState } from '@/core/components/EmptyState/EmptyState';
// import { useCartStore } from '@/core/store/cart.store';

// interface ProductsSectionProps {
//   products: CartItemWithDetails[];
//   hasItems: boolean;
// }

// export const ProductsSection: React.FC<ProductsSectionProps> = ({ products, hasItems }) => {
//   const { colors } = useTheme();

//   // ✅ get cart from store
//   const { items } = useCartStore();

//   return (
//     <>
//       <View
//         style={{
//           flexDirection: 'row',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           marginTop: 6,
//           marginBottom: 8,
//           paddingHorizontal: 2,
//         }}
//       >
//         <Text
//           style={{
//             fontSize: 12,
//             fontWeight: '600',
//             color: colors.textTertiary,
//             textTransform: 'uppercase',
//             letterSpacing: 0.6,
//           }}
//         >
//           Products ({products.length})
//         </Text>

//         <Text style={{ fontSize: 11, color: colors.textTertiary }}>
//           {hasItems ? `${items.length} items selected` : 'select products'}
//         </Text>
//       </View>

//       {products.map((product, idx) => (
//         <ProductItem
//           key={product.productId} // ✅ FIXED
//           product={product}
//           index={idx}
//         />
//       ))}

//       {!hasItems && <EmptyState title="Item" />}
//     </>
//   );
// };

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { CartItemWithDetails, Product } from '@/features/product';
import { ProductItem } from './ProductItem';
import { EmptyState } from '@/core/components/EmptyState/EmptyState';
import { useCartStore } from '@/core/store/cart.store';

interface ProductsSectionProps {
  products: CartItemWithDetails[];
  hasItems: boolean;
  mode?: 'sales' | 'topup';
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  products,
  hasItems,
  mode = 'sales',
}) => {
  const { colors } = useTheme();

  // ✅ get cart from store
  const { items } = useCartStore();

  // Calculate total cases and pieces
  const totalCases = products.reduce((acc, item) => acc + (item.caseQty || 0), 0);
  const totalPieces = products.reduce((acc, item) => acc + (item.pieceQty || 0), 0);
  const totalWeight = products.reduce((acc, item) => {
    return (
      acc +
      (item.caseQty || 0) * (item.caseNetWeight || 0) +
      (item.pieceQty || 0) * (item.pieceNetWeight || 0)
    );
  }, 0);

  // Mode-specific text
  const getModeText = () => {
    if (mode === 'topup') {
      return {
        title: 'Top-up Items',
        emptyTitle: 'No items added',
        emptyMessage: 'Add products to your top-up request',
        statsText: `${products.length} items • ${totalCases} cases • ${totalPieces} pieces`,
        weightText: totalWeight > 0 ? ` • ${totalWeight.toFixed(2)} kg` : '',
      };
    }
    return {
      title: 'Cart Items',
      emptyTitle: 'Cart is empty',
      emptyMessage: 'Add products to continue',
      statsText: `${products.length} items • ${totalCases} cases • ${totalPieces} pieces`,
      weightText: '',
    };
  };

  const modeText = getModeText();

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 6,
          marginBottom: 8,
          paddingHorizontal: 2,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: colors.textTertiary,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
          }}
        >
          {modeText.title} ({products.length})
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {hasItems && (
            <Text style={{ fontSize: 11, color: colors.textTertiary }}>
              {modeText.statsText}
              {mode === 'topup' && modeText.weightText && (
                <Text style={{ color: colors.warning }}>{modeText.weightText}</Text>
              )}
            </Text>
          )}
          <Text style={{ fontSize: 11, color: colors.textTertiary }}>
            {hasItems ? `${items.length} items selected` : 'select products'}
          </Text>
        </View>
      </View>

      {products.map((product, idx) => (
        <ProductItem key={product.productId} product={product} index={idx} mode={mode} />
      ))}

      {!hasItems && (
        <EmptyState
          title={modeText.emptyTitle}
          // message={modeText.emptyMessage as any}
          // icon={mode === 'topup' ? 'truck-fast' : 'cart-outline'}
        />
      )}
    </>
  );
};

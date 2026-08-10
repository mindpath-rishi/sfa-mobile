import React, { useCallback, useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';

import { AppCard } from '@/core/components/Card';
import { AppText } from '@/core/components';

import { ProductStatusBadge } from './ProductStatusBadge';
import { ProductUnitSelector } from './ProductUnitSelector';
import { CartItemWithDetails } from '../../types/product.types';
import { useProductCardStyles } from '../../styles/ProductCard.styles';
import { useCartStore } from '@/core/store/cart.store';
import { getSchemePreviewFromRecords, type SchemeRecord } from '@/shared/services/scheme.service';

interface Props {
  product: any;
  index: number;
  onAddToCart?: (items: CartItemWithDetails[]) => void;
  mode: 'sales' | 'topup';
}

const ProductCardComponent: React.FC<Props> = ({ product, onAddToCart, mode }) => {
  const styles = useProductCardStyles();
  const schemeBenefit = useCartStore((state) => state.schemeDiscounts[product?.productId]);
  const schemePreview = useMemo(
    () =>
      mode === 'sales'
        ? getSchemePreviewFromRecords(
            (product?.applicableSchemes ?? []) as SchemeRecord[],
            Number(product?.casePrice ?? 0),
            Number(product?.piecePrice ?? 0),
          )
        : null,
    [mode, product?.applicableSchemes, product?.casePrice, product?.piecePrice],
  );

  const handlePress = useCallback(() => {
    // Product detail navigation disabled for now.
    // router.push(`/products/${product?.productId}`);
  }, []);

  const handleAddToCart = useCallback(
    (items: CartItemWithDetails[]) => {
      onAddToCart?.(items);
    },
    [onAddToCart],
  );

  const isInStock = Number(product?.stock ?? 0) > 0;
  const discount = Number(product?.discount ?? 0);
  const grossValue =
    Number(product?.caseQty ?? 0) * Number(product?.casePrice ?? 0) +
    Number(product?.pieceQty ?? 0) * Number(product?.piecePrice ?? 0);
  const schemeDiscount = Math.min(schemeBenefit?.discountAmount ?? 0, grossValue);
  const displayedScheme = schemeBenefit ?? schemePreview;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <AppCard variant="elevated" padding="sm">
          <View style={styles.contentRow}>
            <View style={styles.detailsContainer}>
              <View style={styles.headerRow}>
                <View style={styles.titleContainer}>
                  <AppText style={styles.productName} numberOfLines={2}>
                    {product?.name || 'Unnamed Product'}
                  </AppText>

                  {!!product?.brand && (
                    <AppText style={styles.productBrand} numberOfLines={1}>
                      {product.brand}
                    </AppText>
                  )}
                  <AppText style={styles.productCategory} numberOfLines={1}>
                    {[
                      product?.parentCategoryName || product?.parentCategory,
                      product?.categoryName ||
                        product?.subCategory ||
                        product?.category ||
                        product?.categoryId,
                    ]
                      .filter(Boolean)
                      .join(' / ') || 'Uncategorized'}
                  </AppText>
                </View>

                <ProductStatusBadge status={isInStock ? 'in_stock' : 'out_of_stock'} />
              </View>

              {mode === 'sales' && displayedScheme && (
                <View style={styles.schemeContainer}>
                  <AppText style={styles.schemeText} numberOfLines={2}>
                    🏷️ {displayedScheme.schemeName}
                    {!schemeBenefit && displayedScheme.minimumQuantity > 0
                      ? ` • Min ${displayedScheme.minimumQuantity}`
                      : ''}
                    {schemeDiscount > 0 ? ` • Save K${schemeDiscount.toFixed(2)}` : ''}
                  </AppText>
                </View>
              )}

              {!displayedScheme && discount > 0 && (
                <View style={styles.schemeContainer}>
                  <AppText style={styles.schemeText}>🏷️ {discount}% OFF</AppText>
                </View>
              )}

              <ProductUnitSelector product={product} onAddToCart={handleAddToCart} mode={mode} />
            </View>
          </View>
        </AppCard>
      </TouchableOpacity>
    </View>
  );
};

export const ProductCard = React.memo(ProductCardComponent, (prev, next) => {
  return (
    prev.mode === next.mode &&
    prev.product?.productId === next.product?.productId &&
    prev.product?.name === next.product?.name &&
    prev.product?.brand === next.product?.brand &&
    prev.product?.categoryName === next.product?.categoryName &&
    prev.product?.parentCategoryName === next.product?.parentCategoryName &&
    prev.product?.categoryId === next.product?.categoryId &&
    prev.product?.stock === next.product?.stock &&
    prev.product?.discount === next.product?.discount &&
    prev.product?.caseQty === next.product?.caseQty &&
    prev.product?.pieceQty === next.product?.pieceQty &&
    prev.product?.casePrice === next.product?.casePrice &&
    prev.product?.piecePrice === next.product?.piecePrice &&
    prev.product?.applicableSchemes === next.product?.applicableSchemes &&
    prev.product?.unitQtyInCase === next.product?.unitQtyInCase &&
    prev.product?.caseNetWeight === next.product?.caseNetWeight &&
    prev.product?.pieceNetWeight === next.product?.pieceNetWeight
  );
});

ProductCard.displayName = 'ProductCard';

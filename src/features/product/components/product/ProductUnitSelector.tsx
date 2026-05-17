// ProductUnitSelector.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import { CartItemWithDetails } from '../../types/product.types';
import { AppText } from '@/core/components';
import { useProductUnitSelectorStyles } from '../../styles/ProductUnitSelector.styles';

interface Props {
  product: CartItemWithDetails;
  onAddToCart?: (items: CartItemWithDetails[]) => void;
  mode: 'topup' | 'sales';
  showName?: boolean;
}

export const ProductUnitSelector: React.FC<Props> = ({
  product,
  onAddToCart,
  mode,
  showName = true,
}) => {
  const { colors } = useTheme();
  const styles = useProductUnitSelectorStyles();

  const UNITS_PER_CASE = product.unitQtyInCase || 1;
  const casePrice = product.casePrice || 0;
  const piecePrice = product.piecePrice || (UNITS_PER_CASE > 0 ? casePrice / UNITS_PER_CASE : 0);
  const availableStock = product.stock || 0;

  // For topup mode, we don't have stock limits
  const isUnlimitedMode = mode === 'topup';

  const [caseQuantity, setCaseQuantity] = useState(product.caseQty || 0);
  const [unitQuantity, setUnitQuantity] = useState(product.pieceQty || 0);

  const totalUnits = caseQuantity * UNITS_PER_CASE + unitQuantity;
  const totalValue = caseQuantity * casePrice + unitQuantity * piecePrice;

  // Stock limits only apply to sales mode
  const isMaxStock = !isUnlimitedMode && totalUnits >= availableStock;
  const maxCases = isUnlimitedMode
    ? 10 // No limit for topup
    : Math.floor((availableStock - unitQuantity) / UNITS_PER_CASE);
  const maxUnits = isUnlimitedMode
    ? 10 // No limit for topup
    : availableStock - caseQuantity * UNITS_PER_CASE;

  useEffect(() => {
    setCaseQuantity(product.caseQty || 0);
    setUnitQuantity(product.pieceQty || 0);
  }, [product.caseQty, product.pieceQty]);

  // Only apply stock validation for sales mode
  useEffect(() => {
    if (!isUnlimitedMode && totalUnits > availableStock && availableStock > 0) {
      const maxUnitsVal = availableStock - caseQuantity * UNITS_PER_CASE;
      setUnitQuantity(Math.max(0, maxUnitsVal));
    }
  }, [caseQuantity, unitQuantity, availableStock, totalUnits, isUnlimitedMode]);

  // Update cart whenever quantities change
  useEffect(() => {
    if (!onAddToCart) return;

    onAddToCart([
      {
        productId: product.productId,
        productName: product.productName,
        casePrice,
        piecePrice,
        unitQtyInCase: UNITS_PER_CASE,
        caseQty: caseQuantity,
        pieceQty: unitQuantity,
        stock: availableStock,
      },
    ]);
  }, [caseQuantity, unitQuantity]);

  const setMaxQuantity = useCallback(() => {
    if (isUnlimitedMode) {
      setCaseQuantity(100);
      setUnitQuantity(0);
    } else {
      const maxCasesPossible = Math.floor(availableStock / UNITS_PER_CASE);
      const remainingUnits = availableStock % UNITS_PER_CASE;
      setCaseQuantity(maxCasesPossible);
      setUnitQuantity(remainingUnits);
    }
  }, [availableStock, UNITS_PER_CASE, isUnlimitedMode]);

  const clearQuantities = useCallback(() => {
    setCaseQuantity(0);
    setUnitQuantity(0);
  }, []);

  const formatCurrency = (amount: number) =>
    `K${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const availableCases = Math.floor(availableStock / UNITS_PER_CASE);
  const remainingPieces = availableStock % UNITS_PER_CASE;

  return (
    <View style={styles.container}>
      {/* Header with Actions */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          {showName && (
            <AppText style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={1}>
              {product.productName}
            </AppText>
          )}
          {!isUnlimitedMode && availableStock < 10 && availableStock > 0 && (
            <View style={[styles.lowStockBadge, { backgroundColor: colors.warning + '20' }]}>
              <AppText style={[styles.lowStockText, { color: colors.warning }]}>Low Stock</AppText>
            </View>
          )}
        </View>

        <View style={styles.actionIcons}>
          {isUnlimitedMode && (
            <TouchableOpacity onPress={setMaxQuantity} style={styles.actionButton}>
              <Ionicons name="flash-outline" size={16} color={colors.primary} />
              <AppText style={[styles.actionText, { color: colors.primary }]}>Max</AppText>
            </TouchableOpacity>
          )}
          {(caseQuantity > 0 || unitQuantity > 0) && (
            <TouchableOpacity onPress={clearQuantities} style={styles.actionButton}>
              <Ionicons name="trash-outline" size={14} color={colors.error} />
              <AppText style={[styles.actionText, { color: colors.error }]}>Clear</AppText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Cases and Pieces Row */}
      <View style={styles.quantityRow}>
        {/* Cases */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <AppText style={[styles.sectionTitle, { color: colors.textPrimary }]}>Cases</AppText>
            <AppText style={[styles.sectionPrice, { color: colors.primary }]}>
              {formatCurrency(casePrice)}
            </AppText>
          </View>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              onPress={decrementCase}
              disabled={caseQuantity === 0}
              style={[
                styles.quantityButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  opacity: caseQuantity === 0 ? 0.4 : 1,
                },
              ]}
            >
              <Ionicons name="remove" size={16} color={colors.primary} />
            </TouchableOpacity>
            <TextInput
              style={[
                styles.quantityInput,
                {
                  color: colors.textPrimary,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              value={caseQuantity.toString()}
              onChangeText={updateCaseQuantity}
              keyboardType="numeric"
            />
            <TouchableOpacity
              onPress={incrementCase}
              disabled={!isUnlimitedMode && (isMaxStock || caseQuantity >= maxCases)}
              style={[
                styles.quantityButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  opacity: !isUnlimitedMode && (isMaxStock || caseQuantity >= maxCases) ? 0.4 : 1,
                },
              ]}
            >
              <Ionicons name="add" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Pieces */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <AppText style={[styles.sectionTitle, { color: colors.textPrimary }]}>Pieces</AppText>
            <AppText style={[styles.sectionPrice, { color: colors.warning }]}>
              {formatCurrency(piecePrice)}
            </AppText>
          </View>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              onPress={decrementUnit}
              disabled={unitQuantity === 0}
              style={[
                styles.quantityButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  opacity: unitQuantity === 0 ? 0.4 : 1,
                },
              ]}
            >
              <Ionicons name="remove" size={16} color={colors.warning} />
            </TouchableOpacity>
            <TextInput
              style={[
                styles.quantityInput,
                {
                  color: colors.textPrimary,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              value={unitQuantity.toString()}
              onChangeText={updateUnitQuantity}
              keyboardType="numeric"
            />
            <TouchableOpacity
              onPress={incrementUnit}
              disabled={!isUnlimitedMode && (isMaxStock || unitQuantity >= maxUnits)}
              style={[
                styles.quantityButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  opacity: !isUnlimitedMode && (isMaxStock || unitQuantity >= maxUnits) ? 0.4 : 1,
                },
              ]}
            >
              <Ionicons name="add" size={16} color={colors.warning} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Compact Stock Info */}
      <View style={[styles.stockInfoRow, { borderTopColor: colors.divider }]}>
        <View style={styles.stockInfoLeft}>
          <View style={styles.stockInfoItem}>
            <Ionicons name="cube-outline" size={12} color={colors.textSecondary} />
            <AppText style={[styles.stockInfoText, { color: colors.textSecondary }]}>
              {availableStock} pcs
            </AppText>
          </View>
          {availableCases > 0 && (
            <View style={styles.stockInfoItem}>
              <Ionicons name="options-outline" size={10} color={colors.textSecondary} />
              <AppText style={[styles.stockInfoDetail, { color: colors.textSecondary }]}>
                {availableCases}c {remainingPieces > 0 && `+${remainingPieces}p`}
              </AppText>
            </View>
          )}
          {!isUnlimitedMode && totalUnits === availableStock && totalUnits > 0 && (
            <View style={styles.stockInfoItem}>
              <Ionicons name="checkmark-circle" size={10} color={colors.success} />
              <AppText style={[styles.allStockText, { color: colors.success }]}>Max</AppText>
            </View>
          )}
        </View>
        <View style={styles.totalValueContainer}>
          <AppText style={[styles.totalLabel, { color: colors.textSecondary }]}>Total:</AppText>
          <AppText style={[styles.totalValue, { color: colors.primary }]}>
            {formatCurrency(totalValue)}
          </AppText>
        </View>
      </View>
    </View>
  );

  function updateCaseQuantity(value: string) {
    const num = parseInt(value) || 0;
    if (isUnlimitedMode) {
      setCaseQuantity(Math.max(0, num));
    } else {
      const maxCase = Math.floor((availableStock - unitQuantity) / UNITS_PER_CASE);
      setCaseQuantity(Math.min(Math.max(0, num), maxCase));
    }
  }

  function updateUnitQuantity(value: string) {
    const num = parseInt(value) || 0;
    if (isUnlimitedMode) {
      setUnitQuantity(Math.max(0, num));
    } else {
      const maxUnitsVal = availableStock - caseQuantity * UNITS_PER_CASE;
      setUnitQuantity(Math.min(Math.max(0, num), maxUnitsVal));
    }
  }

  function incrementCase() {
    if (isUnlimitedMode) {
      setCaseQuantity((prev) => prev + 1);
    } else if (!isMaxStock && caseQuantity < maxCases) {
      setCaseQuantity((prev) => prev + 1);
    }
  }

  function decrementCase() {
    if (caseQuantity > 0) {
      setCaseQuantity((prev) => prev - 1);
    }
  }

  function incrementUnit() {
    if (isUnlimitedMode) {
      setUnitQuantity((prev) => prev + 1);
    } else if (!isMaxStock && unitQuantity < maxUnits) {
      setUnitQuantity((prev) => prev + 1);
    }
  }

  function decrementUnit() {
    if (unitQuantity > 0) {
      setUnitQuantity((prev) => prev - 1);
    }
  }
};

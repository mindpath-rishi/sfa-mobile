import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import { CartItemWithDetails } from '../../types/product.types';
import { useProductUnitSelectorStyles } from '../../styles/ProductUnitSelector.styles';
import { AppText } from '@/core/components';

interface Props {
  product: CartItemWithDetails;
  onAddToCart?: (items: CartItemWithDetails[]) => void;
}

export const ProductUnitSelector: React.FC<Props> = ({ product, onAddToCart }) => {
  const { colors } = useTheme();
  const styles = useProductUnitSelectorStyles();

  const UNITS_PER_CASE = product.unitQtyInCase || 1;
  const casePrice = product.casePrice || 0;
  const piecePrice = product.piecePrice || casePrice / UNITS_PER_CASE;

  const availableStock = product.stock || 0;

  const availableCases = Math.floor(availableStock / UNITS_PER_CASE);
  const remainingPieces = availableStock % UNITS_PER_CASE;

  const [caseQuantity, setCaseQuantity] = useState(product.caseQty || 0);
  const [unitQuantity, setUnitQuantity] = useState(product.pieceQty || 0);

  /**
   * ================= SYNC =================
   */
  useEffect(() => {
    setCaseQuantity(product.caseQty || 0);
    setUnitQuantity(product.pieceQty || 0);
  }, [product.caseQty, product.pieceQty]);

  /**
   * ================= STRONG VALIDATION =================
   */
  useEffect(() => {
    const total = caseQuantity * UNITS_PER_CASE + unitQuantity;

    if (total > availableStock) {
      const maxUnits = availableStock - caseQuantity * UNITS_PER_CASE;

      setUnitQuantity(Math.max(0, maxUnits));
    }
  }, [caseQuantity, unitQuantity, availableStock]);

  /**
   * ================= UPDATE CART =================
   */
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

  /**
   * ================= HANDLERS =================
   */

  // ✅ Manual Case Input
  const updateCaseQuantity = (value: string) => {
    const num = parseInt(value) || 0;

    const maxCase = Math.floor((availableStock - unitQuantity) / UNITS_PER_CASE);

    setCaseQuantity(Math.min(Math.max(0, num), maxCase));
  };

  // ✅ Manual Piece Input
  const updateUnitQuantity = (value: string) => {
    const num = parseInt(value) || 0;

    const maxUnits = availableStock - caseQuantity * UNITS_PER_CASE;

    setUnitQuantity(Math.min(Math.max(0, num), maxUnits));
  };

  // ✅ Strong Case Increment
  const incrementCase = () => {
    const next = caseQuantity + 1;

    const total = next * UNITS_PER_CASE + unitQuantity;

    if (total <= availableStock) {
      setCaseQuantity(next);
    }
  };

  const decrementCase = () => {
    if (caseQuantity > 0) {
      setCaseQuantity(caseQuantity - 1);
    }
  };

  // ✅ Strong Piece Increment
  const incrementUnit = () => {
    const total = caseQuantity * UNITS_PER_CASE + unitQuantity + 1;

    if (total <= availableStock) {
      setUnitQuantity(unitQuantity + 1);
    }
  };

  const decrementUnit = () => {
    if (unitQuantity > 0) {
      setUnitQuantity(unitQuantity - 1);
    }
  };

  /**
   * ================= UI =================
   */
  return (
    <View style={[styles.container, { borderColor: colors.border + '30' }]}>
      {/* CASE */}
      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <AppText style={[styles.label, { color: colors.textPrimary }]}>Case</AppText>
          <AppText style={[styles.price, { color: colors.textPrimary }]}>K{casePrice}</AppText>
        </View>

        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={[styles.quantityButton, { borderColor: colors.border }]}
            onPress={decrementCase}
            disabled={caseQuantity === 0}
          >
            <Ionicons
              name="remove"
              size={14}
              color={caseQuantity === 0 ? colors.border : colors.textPrimary}
            />
          </TouchableOpacity>

          <TextInput
            style={[
              styles.quantityInput,
              {
                width: 80, // ✅ increased width
                borderColor: colors.border,
                color: colors.textPrimary,
                backgroundColor: colors.surface,
                textAlign: 'center',
              },
            ]}
            value={caseQuantity.toString()}
            onChangeText={updateCaseQuantity}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={[styles.quantityButton, { borderColor: colors.border }]}
            onPress={incrementCase}
            disabled={caseQuantity * UNITS_PER_CASE + unitQuantity >= availableStock}
          >
            <Ionicons
              name="add"
              size={14}
              color={
                caseQuantity * UNITS_PER_CASE + unitQuantity >= availableStock
                  ? colors.border
                  : colors.textPrimary
              }
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* PIECE */}
      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <AppText style={[styles.label, { color: colors.textPrimary }]}>Piece</AppText>
          <AppText style={[styles.price, { color: colors.textPrimary }]}>K{piecePrice}</AppText>
        </View>

        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={[styles.quantityButton, { borderColor: colors.border }]}
            onPress={decrementUnit}
            disabled={unitQuantity === 0}
          >
            <Ionicons
              name="remove"
              size={14}
              color={unitQuantity === 0 ? colors.border : colors.textPrimary}
            />
          </TouchableOpacity>

          <TextInput
            style={[
              styles.quantityInput,
              {
                width: 80, // ✅ bigger for manual input
                borderColor: colors.border,
                color: colors.textPrimary,
                backgroundColor: colors.surface,
                textAlign: 'center',
              },
            ]}
            value={unitQuantity.toString()}
            onChangeText={updateUnitQuantity}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={[styles.quantityButton, { borderColor: colors.border }]}
            onPress={incrementUnit}
            disabled={caseQuantity * UNITS_PER_CASE + unitQuantity >= availableStock}
          >
            <Ionicons
              name="add"
              size={14}
              color={
                caseQuantity * UNITS_PER_CASE + unitQuantity >= availableStock
                  ? colors.border
                  : colors.textPrimary
              }
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* STOCK */}
      <AppText style={[styles.stockInfo, { color: colors.textTertiary }]}>
        Available Stock: {availableStock} pcs
        {availableCases > 0 && ` • ${availableCases} cases`}
        {remainingPieces > 0 && ` + ${remainingPieces} pcs`}
        {UNITS_PER_CASE && ` (${UNITS_PER_CASE} pcs/case)`}
      </AppText>
    </View>
  );
};

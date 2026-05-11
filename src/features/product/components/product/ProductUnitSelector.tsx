import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import { CartItemWithDetails } from '../../types/product.types';
import { AppText } from '@/core/components';

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

  const UNITS_PER_CASE = product.unitQtyInCase || 1;
  const casePrice = product.casePrice || 0;
  const piecePrice = product.piecePrice || (UNITS_PER_CASE > 0 ? casePrice / UNITS_PER_CASE : 0);
  const availableStock = product.stock || 0;

  const isUnlimitedMode = mode === 'topup';

  const [caseQuantity, setCaseQuantity] = useState(product.caseQty || 0);
  const [unitQuantity, setUnitQuantity] = useState(product.pieceQty || 0);

  const totalUnits = caseQuantity * UNITS_PER_CASE + unitQuantity;
  const totalValue = caseQuantity * casePrice + unitQuantity * piecePrice;

  const isMaxStock = !isUnlimitedMode && totalUnits >= availableStock;
  const maxCases = isUnlimitedMode
    ? 999
    : Math.floor((availableStock - unitQuantity) / UNITS_PER_CASE);
  const maxUnits = isUnlimitedMode ? 999 : availableStock - caseQuantity * UNITS_PER_CASE;

  useEffect(() => {
    setCaseQuantity(product.caseQty || 0);
    setUnitQuantity(product.pieceQty || 0);
  }, [product.caseQty, product.pieceQty]);

  useEffect(() => {
    if (!isUnlimitedMode && totalUnits > availableStock && availableStock > 0) {
      const maxUnitsVal = availableStock - caseQuantity * UNITS_PER_CASE;
      setUnitQuantity(Math.max(0, maxUnitsVal));
    }
  }, [caseQuantity, unitQuantity, availableStock, totalUnits, isUnlimitedMode]);

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
    <View
      style={{
        backgroundColor: colors.surface,
        marginBottom: 6,
        padding: 8,
        borderRadius: 8,
        borderWidth: 0.5,
        borderColor: colors.border + '30',
      }}
    >
      {/* Header - Product Name & Actions */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        {showName && (
          <AppText
            style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '500', flex: 1 }}
            numberOfLines={1}
          >
            {product.productName}
          </AppText>
        )}

        {/* <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {!isUnlimitedMode && availableStock < 10 && availableStock > 0 && (
            <View
              style={{
                backgroundColor: colors.warning + '20',
                paddingHorizontal: 4,
                paddingVertical: 1,
                borderRadius: 3,
              }}
            >
              <AppText style={{ color: colors.warning, fontSize: 9, fontWeight: '600' }}>
                Low Stock
              </AppText>
            </View>
          )}

          {isUnlimitedMode && (
            <TouchableOpacity
              onPress={setMaxQuantity}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
            >
              <Ionicons name="flash-outline" size={14} color={colors.primary} />
              <AppText style={{ color: colors.primary, fontSize: 10, fontWeight: '500' }}>
                Max
              </AppText>
            </TouchableOpacity>
          )}

          {(caseQuantity > 0 || unitQuantity > 0) && (
            <TouchableOpacity onPress={clearQuantities}>
              <Ionicons name="trash-outline" size={14} color={colors.error} />
            </TouchableOpacity>
          )}
        </View> */}
      </View>

      {/* Cases & Pieces Row */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
        {/* Cases */}
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background + '50',
            borderRadius: 6,
            padding: 6,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4,
            }}
          >
            <AppText style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '600' }}>
              Case
            </AppText>
            <AppText style={{ color: colors.primary, fontSize: 11, fontWeight: '600' }}>
              {formatCurrency(casePrice)}
            </AppText>
          </View>

          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <TouchableOpacity
              onPress={decrementCase}
              disabled={caseQuantity === 0}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                backgroundColor: colors.surface,
                borderWidth: 0.5,
                borderColor: colors.border,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: caseQuantity === 0 ? 0.4 : 1,
              }}
            >
              <Ionicons name="remove" size={14} color={colors.primary} />
            </TouchableOpacity>

            <TextInput
              style={{
                width: 45,
                textAlign: 'center',
                fontSize: 14,
                fontWeight: '600',
                color: colors.textPrimary,
                paddingVertical: 4,
                backgroundColor: colors.surface,
                borderRadius: 6,
                borderWidth: 0.5,
                borderColor: colors.border,
              }}
              value={caseQuantity.toString()}
              onChangeText={updateCaseQuantity}
              keyboardType="numeric"
            />

            <TouchableOpacity
              onPress={incrementCase}
              disabled={!isUnlimitedMode && (isMaxStock || caseQuantity >= maxCases)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                backgroundColor: colors.surface,
                borderWidth: 0.5,
                borderColor: colors.border,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: !isUnlimitedMode && (isMaxStock || caseQuantity >= maxCases) ? 0.4 : 1,
              }}
            >
              <Ionicons name="add" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Pieces */}
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background + '50',
            borderRadius: 6,
            padding: 6,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4,
            }}
          >
            <AppText style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '600' }}>
              Piece
            </AppText>
            <AppText style={{ color: colors.warning, fontSize: 11, fontWeight: '600' }}>
              {formatCurrency(piecePrice)}
            </AppText>
          </View>

          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <TouchableOpacity
              onPress={decrementUnit}
              disabled={unitQuantity === 0}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                backgroundColor: colors.surface,
                borderWidth: 0.5,
                borderColor: colors.border,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: unitQuantity === 0 ? 0.4 : 1,
              }}
            >
              <Ionicons name="remove" size={14} color={colors.warning} />
            </TouchableOpacity>

            <TextInput
              style={{
                width: 45,
                textAlign: 'center',
                fontSize: 14,
                fontWeight: '600',
                color: colors.textPrimary,
                paddingVertical: 4,
                backgroundColor: colors.surface,
                borderRadius: 6,
                borderWidth: 0.5,
                borderColor: colors.border,
              }}
              value={unitQuantity.toString()}
              onChangeText={updateUnitQuantity}
              keyboardType="numeric"
            />

            <TouchableOpacity
              onPress={incrementUnit}
              disabled={!isUnlimitedMode && (isMaxStock || unitQuantity >= maxUnits)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                backgroundColor: colors.surface,
                borderWidth: 0.5,
                borderColor: colors.border,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: !isUnlimitedMode && (isMaxStock || unitQuantity >= maxUnits) ? 0.4 : 1,
              }}
            >
              <Ionicons name="add" size={14} color={colors.warning} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Footer - Stock Info & Total */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 4,
          borderTopWidth: 0.5,
          borderTopColor: colors.divider,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Ionicons name="cube-outline" size={10} color={colors.textSecondary} />
            <AppText style={{ color: colors.textSecondary, fontSize: 9 }}>
              {availableStock} pcs
            </AppText>
          </View> */}

          {availableCases > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              {/* <Ionicons name="options-outline" size={9} color={colors.textSecondary} /> */}
              <AppText style={{ color: colors.textSecondary, fontSize: 9 }}>
                {availableCases}c {remainingPieces > 0 && `+${remainingPieces}p`}
              </AppText>
            </View>
          )}

          {!isUnlimitedMode && totalUnits === availableStock && totalUnits > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Ionicons name="checkmark-circle" size={9} color={colors.success} />
              <AppText style={{ color: colors.success, fontSize: 9 }}>Max</AppText>
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <AppText style={{ color: colors.textSecondary, fontSize: 10 }}>Total:</AppText>
          <AppText style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>
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

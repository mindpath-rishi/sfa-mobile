import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import { Product } from '../../types/product.types';
import { useProductUnitSelectorStyles } from '../../styles/ProductUnitSelector.styles';
import { AppText } from '@/core/components';

interface CartItem {
  type: 'cases' | 'units';
  quantity: number;
}

interface Props {
  product: Product;
  onAddToCart?: (items: CartItem[]) => void;
}

export const ProductUnitSelector: React.FC<Props> = ({ product, onAddToCart }) => {
  const { colors } = useTheme();
  const styles = useProductUnitSelectorStyles();

  const UNITS_PER_CASE = 12;
  const casePrice = product.price * UNITS_PER_CASE * 0.95; // 5% discount
  const availableCases = Math.floor(product.stock / UNITS_PER_CASE);

  const [caseQuantity, setCaseQuantity] = useState(0);
  const [unitQuantity, setUnitQuantity] = useState(0);
  const [prevCaseQuantity, setPrevCaseQuantity] = useState(0);
  const [prevUnitQuantity, setPrevUnitQuantity] = useState(0);

  // Auto-add to cart when quantities change
  useEffect(() => {
    // Only trigger if quantities have actually changed
    const caseChanged = caseQuantity !== prevCaseQuantity;
    const unitChanged = unitQuantity !== prevUnitQuantity;

    if ((caseChanged || unitChanged) && onAddToCart) {
      const items: CartItem[] = [];

      // Add the changed items only (incrementally)
      if (caseChanged) {
        const diff = caseQuantity - prevCaseQuantity;
        if (diff > 0) {
          items.push({ type: 'cases', quantity: diff });
        }
      }

      if (unitChanged) {
        const diff = unitQuantity - prevUnitQuantity;
        if (diff > 0) {
          items.push({ type: 'units', quantity: diff });
        }
      }

      if (items.length > 0) {
        onAddToCart(items);
      }

      // Update previous quantities
      setPrevCaseQuantity(caseQuantity);
      setPrevUnitQuantity(unitQuantity);
    }
  }, [caseQuantity, unitQuantity, onAddToCart]);

  const updateCaseQuantity = (value: string) => {
    const num = parseInt(value) || 0;
    setCaseQuantity(Math.min(Math.max(0, num), availableCases));
  };

  const updateUnitQuantity = (value: string) => {
    const num = parseInt(value) || 0;
    const maxUnits = product.stock - caseQuantity * UNITS_PER_CASE;
    setUnitQuantity(Math.min(Math.max(0, num), maxUnits));
  };

  const incrementCase = () => {
    if (caseQuantity < availableCases) {
      setCaseQuantity(caseQuantity + 1);
    }
  };

  const decrementCase = () => {
    if (caseQuantity > 0) {
      setCaseQuantity(caseQuantity - 1);
    }
  };

  const incrementUnit = () => {
    const maxUnits = product.stock - caseQuantity * UNITS_PER_CASE;
    if (unitQuantity < maxUnits) {
      setUnitQuantity(unitQuantity + 1);
    }
  };

  const decrementUnit = () => {
    if (unitQuantity > 0) {
      setUnitQuantity(unitQuantity - 1);
    }
  };

  return (
    <View style={[styles.container, { borderColor: colors.border + '30' }]}>
      {/* Cases Row */}
      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <AppText style={[styles.label, { color: colors.textPrimary }]}>Case</AppText>
          <AppText style={[styles.price, { color: colors.textPrimary }]}>
            ₹{casePrice.toFixed(2)}
          </AppText>
          {availableCases > 0 && (
            <View style={[styles.discountBadge, { backgroundColor: colors.success }]}>
              <AppText style={styles.discountText}>-5%</AppText>
            </View>
          )}
        </View>

        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={[styles.quantityButton, { borderColor: colors.border }]}
            onPress={decrementCase}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
                borderColor: colors.border,
                color: colors.textPrimary,
                backgroundColor: colors.surface,
              },
            ]}
            value={caseQuantity.toString()}
            onChangeText={updateCaseQuantity}
            keyboardType="numeric"
            maxLength={2}
            editable={availableCases > 0}
          />

          <TouchableOpacity
            style={[styles.quantityButton, { borderColor: colors.border }]}
            onPress={incrementCase}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            disabled={caseQuantity >= availableCases}
          >
            <Ionicons
              name="add"
              size={14}
              color={caseQuantity >= availableCases ? colors.border : colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Units Row */}
      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <AppText style={[styles.label, { color: colors.textPrimary }]}>Unit</AppText>
          <AppText style={[styles.price, { color: colors.textPrimary }]}>₹{product.price}</AppText>
        </View>

        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={[styles.quantityButton, { borderColor: colors.border }]}
            onPress={decrementUnit}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
                borderColor: colors.border,
                color: colors.textPrimary,
                backgroundColor: colors.surface,
              },
            ]}
            value={unitQuantity.toString()}
            onChangeText={updateUnitQuantity}
            keyboardType="numeric"
            maxLength={3}
          />

          <TouchableOpacity
            style={[styles.quantityButton, { borderColor: colors.border }]}
            onPress={incrementUnit}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="add" size={14} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stock Info */}
      <AppText style={[styles.stockInfo, { color: colors.textTertiary }]}>
        Stock: {product.stock} units • {availableCases} cases available
      </AppText>
    </View>
  );
};

// import React, { useState, useEffect } from 'react';
// import { View, TouchableOpacity, TextInput } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useTheme } from '@/shared/hooks/useTheme';
// import { CartItemWithDetails } from '../../types/product.types';
// import { useProductUnitSelectorStyles } from '../../styles/ProductUnitSelector.styles';
// import { AppText } from '@/core/components';

// interface Props {
//   product: CartItemWithDetails;
//   onAddToCart?: (items: CartItemWithDetails[]) => void;
// }

// export const ProductUnitSelector: React.FC<Props> = ({ product, onAddToCart }) => {
//   const { colors } = useTheme();
//   const styles = useProductUnitSelectorStyles();

//   const UNITS_PER_CASE = product.unitQtyInCase || 1;
//   const casePrice = product.casePrice || 0;
//   const piecePrice = product.piecePrice || casePrice / UNITS_PER_CASE;

//   const availableStock = product.stock || 0;

//   const availableCases = Math.floor(availableStock / UNITS_PER_CASE);
//   const remainingPieces = availableStock % UNITS_PER_CASE;

//   const [caseQuantity, setCaseQuantity] = useState(product.caseQty || 0);
//   const [unitQuantity, setUnitQuantity] = useState(product.pieceQty || 0);

//   /**
//    * ================= SYNC =================
//    */
//   useEffect(() => {
//     setCaseQuantity(product.caseQty || 0);
//     setUnitQuantity(product.pieceQty || 0);
//   }, [product.caseQty, product.pieceQty]);

//   /**
//    * ================= STRONG VALIDATION =================
//    */
//   useEffect(() => {
//     const total = caseQuantity * UNITS_PER_CASE + unitQuantity;

//     if (total > availableStock) {
//       const maxUnits = availableStock - caseQuantity * UNITS_PER_CASE;

//       setUnitQuantity(Math.max(0, maxUnits));
//     }
//   }, [caseQuantity, unitQuantity, availableStock]);

//   /**
//    * ================= UPDATE CART =================
//    */
//   useEffect(() => {
//     if (!onAddToCart) return;

//     onAddToCart([
//       {
//         productId: product.productId,
//         productName: product.productName,
//         casePrice,
//         piecePrice,
//         unitQtyInCase: UNITS_PER_CASE,
//         caseQty: caseQuantity,
//         pieceQty: unitQuantity,
//         stock: availableStock,
//       },
//     ]);
//   }, [caseQuantity, unitQuantity]);

//   /**
//    * ================= HANDLERS =================
//    */

//   // ✅ Manual Case Input
//   const updateCaseQuantity = (value: string) => {
//     const num = parseInt(value) || 0;

//     const maxCase = Math.floor((availableStock - unitQuantity) / UNITS_PER_CASE);

//     setCaseQuantity(Math.min(Math.max(0, num), maxCase));
//   };

//   // ✅ Manual Piece Input
//   const updateUnitQuantity = (value: string) => {
//     const num = parseInt(value) || 0;

//     const maxUnits = availableStock - caseQuantity * UNITS_PER_CASE;

//     setUnitQuantity(Math.min(Math.max(0, num), maxUnits));
//   };

//   // ✅ Strong Case Increment
//   const incrementCase = () => {
//     const next = caseQuantity + 1;

//     const total = next * UNITS_PER_CASE + unitQuantity;

//     if (total <= availableStock) {
//       setCaseQuantity(next);
//     }
//   };

//   const decrementCase = () => {
//     if (caseQuantity > 0) {
//       setCaseQuantity(caseQuantity - 1);
//     }
//   };

//   // ✅ Strong Piece Increment
//   const incrementUnit = () => {
//     const total = caseQuantity * UNITS_PER_CASE + unitQuantity + 1;

//     if (total <= availableStock) {
//       setUnitQuantity(unitQuantity + 1);
//     }
//   };

//   const decrementUnit = () => {
//     if (unitQuantity > 0) {
//       setUnitQuantity(unitQuantity - 1);
//     }
//   };

//   /**
//    * ================= UI =================
//    */
//   return (
//     <View style={[styles.container, { borderColor: colors.border + '30' }]}>
//       {/* CASE */}
//       <View style={styles.row}>
//         <View style={styles.labelContainer}>
//           <AppText style={[styles.label, { color: colors.textPrimary }]}>Case</AppText>
//           <AppText style={[styles.price, { color: colors.textPrimary }]}>K{casePrice}</AppText>
//         </View>

//         <View style={styles.quantityControl}>
//           <TouchableOpacity
//             style={[styles.quantityButton, { borderColor: colors.border }]}
//             onPress={decrementCase}
//             disabled={caseQuantity === 0}
//           >
//             <Ionicons
//               name="remove"
//               size={14}
//               color={caseQuantity === 0 ? colors.border : colors.textPrimary}
//             />
//           </TouchableOpacity>

//           <TextInput
//             style={[
//               styles.quantityInput,
//               {
//                 width: 80, // ✅ increased width
//                 borderColor: colors.border,
//                 color: colors.textPrimary,
//                 backgroundColor: colors.surface,
//                 textAlign: 'center',
//               },
//             ]}
//             value={caseQuantity.toString()}
//             onChangeText={updateCaseQuantity}
//             keyboardType="numeric"
//           />

//           <TouchableOpacity
//             style={[styles.quantityButton, { borderColor: colors.border }]}
//             onPress={incrementCase}
//             disabled={caseQuantity * UNITS_PER_CASE + unitQuantity >= availableStock}
//           >
//             <Ionicons
//               name="add"
//               size={14}
//               color={
//                 caseQuantity * UNITS_PER_CASE + unitQuantity >= availableStock
//                   ? colors.border
//                   : colors.textPrimary
//               }
//             />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* PIECE */}
//       <View style={styles.row}>
//         <View style={styles.labelContainer}>
//           <AppText style={[styles.label, { color: colors.textPrimary }]}>Piece</AppText>
//           <AppText style={[styles.price, { color: colors.textPrimary }]}>K{piecePrice}</AppText>
//         </View>

//         <View style={styles.quantityControl}>
//           <TouchableOpacity
//             style={[styles.quantityButton, { borderColor: colors.border }]}
//             onPress={decrementUnit}
//             disabled={unitQuantity === 0}
//           >
//             <Ionicons
//               name="remove"
//               size={14}
//               color={unitQuantity === 0 ? colors.border : colors.textPrimary}
//             />
//           </TouchableOpacity>

//           <TextInput
//             style={[
//               styles.quantityInput,
//               {
//                 width: 80, // ✅ bigger for manual input
//                 borderColor: colors.border,
//                 color: colors.textPrimary,
//                 backgroundColor: colors.surface,
//                 textAlign: 'center',
//               },
//             ]}
//             value={unitQuantity.toString()}
//             onChangeText={updateUnitQuantity}
//             keyboardType="numeric"
//           />

//           <TouchableOpacity
//             style={[styles.quantityButton, { borderColor: colors.border }]}
//             onPress={incrementUnit}
//             disabled={caseQuantity * UNITS_PER_CASE + unitQuantity >= availableStock}
//           >
//             <Ionicons
//               name="add"
//               size={14}
//               color={
//                 caseQuantity * UNITS_PER_CASE + unitQuantity >= availableStock
//                   ? colors.border
//                   : colors.textPrimary
//               }
//             />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* STOCK */}
//       <AppText style={[styles.stockInfo, { color: colors.textTertiary }]}>
//         Available Stock: {availableStock} pcs
//         {availableCases > 0 && ` • ${availableCases} cases`}
//         {remainingPieces > 0 && ` + ${remainingPieces} pcs`}
//         {UNITS_PER_CASE && ` (${UNITS_PER_CASE} pcs/case)`}
//       </AppText>
//     </View>
//   );
// };

// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { View, TouchableOpacity, TextInput } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useTheme } from '@/shared/hooks/useTheme';
// import { CartItemWithDetails } from '../../types/product.types';
// import { AppText } from '@/core/components';

// interface Props {
//   product: CartItemWithDetails;
//   onAddToCart?: (items: CartItemWithDetails[]) => void;
//   mode: 'topup' | 'sales';
// }

// export const ProductUnitSelector: React.FC<Props> = ({ product, onAddToCart, mode }) => {
//   const { colors } = useTheme();

//   const UNITS_PER_CASE = product.unitQtyInCase || 1;
//   const casePrice = product.casePrice || 0;
//   const piecePrice = product.piecePrice || (UNITS_PER_CASE > 0 ? casePrice / UNITS_PER_CASE : 0);
//   const availableStock = product.stock || 0;

//   const [caseQuantity, setCaseQuantity] = useState(product.caseQty || 0);
//   const [unitQuantity, setUnitQuantity] = useState(product.pieceQty || 0);

//   const totalUnits = caseQuantity * UNITS_PER_CASE + unitQuantity;
//   const totalValue = caseQuantity * casePrice + unitQuantity * piecePrice;
//   const isMaxStock = totalUnits >= availableStock;
//   const maxCases = Math.floor((availableStock - unitQuantity) / UNITS_PER_CASE);
//   const maxUnits = availableStock - caseQuantity * UNITS_PER_CASE;

//   useEffect(() => {
//     setCaseQuantity(product.caseQty || 0);
//     setUnitQuantity(product.pieceQty || 0);
//   }, [product.caseQty, product.pieceQty]);

//   useEffect(() => {
//     if (totalUnits > availableStock && availableStock > 0) {
//       const maxUnitsVal = availableStock - caseQuantity * UNITS_PER_CASE;
//       setUnitQuantity(Math.max(0, maxUnitsVal));
//     }
//   }, [caseQuantity, unitQuantity, availableStock, totalUnits]);

//   useEffect(() => {
//     if (!onAddToCart) return;
//     console.log(mode, '====================Mode====================');
//     if (caseQuantity > 0 || unitQuantity > 0 || mode === 'topup') {
//       onAddToCart([
//         {
//           productId: product.productId,
//           productName: product.productName,
//           casePrice,
//           piecePrice,
//           unitQtyInCase: UNITS_PER_CASE,
//           caseQty: caseQuantity,
//           pieceQty: unitQuantity,
//           stock: availableStock,
//         },
//       ]);
//     } else if (product.caseQty > 0 || product.pieceQty > 0) {
//       onAddToCart([]);
//     }
//   }, [caseQuantity, unitQuantity]);

//   const setMaxQuantity = useCallback(() => {
//     const maxCasesPossible = Math.floor(availableStock / UNITS_PER_CASE);
//     const remainingUnits = availableStock % UNITS_PER_CASE;
//     setCaseQuantity(maxCasesPossible);
//     setUnitQuantity(remainingUnits);
//   }, [availableStock, UNITS_PER_CASE]);

//   const clearQuantities = useCallback(() => {
//     setCaseQuantity(0);
//     setUnitQuantity(0);
//   }, []);

//   const formatCurrency = (amount: number) =>
//     `K${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

//   return (
//     <View
//       style={{
//         backgroundColor: colors.surface,
//         marginBottom: 8,
//         padding: 12,
//         borderRadius: 10,
//         borderWidth: 1,
//         borderColor: colors.border + '20',
//         shadowColor: colors.textPrimary,
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.05,
//         shadowRadius: 2,
//         elevation: 1,
//       }}
//     >
//       {/* Row 1: Product Name and Action Icons */}
//       <View
//         style={{
//           flexDirection: 'row',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           marginBottom: 10,
//         }}
//       >
//         <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
//           <AppText
//             style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '600' }}
//             numberOfLines={1}
//           >
//             {product.productName}
//           </AppText>
//           {availableStock < 10 && availableStock > 0 && (
//             <View
//               style={{
//                 backgroundColor: colors.warning + '20',
//                 paddingHorizontal: 6,
//                 paddingVertical: 2,
//                 borderRadius: 4,
//               }}
//             >
//               <AppText style={{ color: colors.warning, fontSize: 10, fontWeight: '600' }}>
//                 Low Stock
//               </AppText>
//             </View>
//           )}
//         </View>

//         {/* Action Icons - Max and Remove */}
//         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
//           {mode === 'topup' && (
//             <TouchableOpacity
//               onPress={setMaxQuantity}
//               style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
//             >
//               <Ionicons name="flash-outline" size={18} color={colors.primary} />
//               <AppText style={{ color: colors.primary, fontSize: 11, fontWeight: '500' }}>
//                 Max
//               </AppText>
//             </TouchableOpacity>
//           )}

//           {(caseQuantity > 0 || unitQuantity > 0) && (
//             <TouchableOpacity
//               onPress={clearQuantities}
//               style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
//             >
//               <Ionicons name="trash-outline" size={16} color={colors.error} />
//               <AppText style={{ color: colors.error, fontSize: 11, fontWeight: '500' }}>
//                 Remove
//               </AppText>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       {/* Row 2: Cases and Pieces */}
//       <View style={{ flexDirection: 'row', gap: 12, marginBottom: 10 }}>
//         {/* Cases Section */}
//         <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: 8, padding: 8 }}>
//           <View
//             style={{
//               flexDirection: 'row',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               marginBottom: 8,
//             }}
//           >
//             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
//               <Ionicons name="cube-outline" size={16} color={colors.primary} />
//               <AppText style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '600' }}>
//                 Cases
//               </AppText>
//             </View>
//             <AppText style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>
//               {formatCurrency(casePrice)}
//             </AppText>
//           </View>

//           <View
//             style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
//           >
//             <TouchableOpacity
//               onPress={decrementCase}
//               disabled={caseQuantity === 0 && mode === 'sales'}
//               style={{
//                 width: 32,
//                 height: 32,
//                 borderRadius: 8,
//                 backgroundColor: colors.surface,
//                 borderWidth: 1,
//                 borderColor: colors.border,
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 opacity: caseQuantity === 0 ? 0.4 : 1,
//               }}
//             >
//               <Ionicons name="remove" size={18} color={colors.primary} />
//             </TouchableOpacity>

//             <TextInput
//               style={{
//                 width: 55,
//                 textAlign: 'center',
//                 fontSize: 16,
//                 fontWeight: '700',
//                 color: colors.textPrimary,
//                 paddingVertical: 6,
//                 backgroundColor: colors.surface,
//                 borderRadius: 8,
//                 borderWidth: 1,
//                 borderColor: colors.border,
//               }}
//               value={caseQuantity.toString()}
//               onChangeText={updateCaseQuantity}
//               keyboardType="numeric"
//             />

//             <TouchableOpacity
//               onPress={incrementCase}
//               disabled={isMaxStock || caseQuantity >= maxCases}
//               style={{
//                 width: 32,
//                 height: 32,
//                 borderRadius: 8,
//                 backgroundColor: colors.surface,
//                 borderWidth: 1,
//                 borderColor: colors.border,
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 opacity: isMaxStock || caseQuantity >= maxCases ? 0.4 : 1,
//               }}
//             >
//               <Ionicons name="add" size={18} color={colors.primary} />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Pieces Section */}
//         <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: 8, padding: 8 }}>
//           <View
//             style={{
//               flexDirection: 'row',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               marginBottom: 8,
//             }}
//           >
//             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
//               <Ionicons name="grid-outline" size={16} color={colors.warning} />
//               <AppText style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '600' }}>
//                 Pieces
//               </AppText>
//             </View>
//             <AppText style={{ color: colors.warning, fontSize: 13, fontWeight: '700' }}>
//               {formatCurrency(piecePrice)}
//             </AppText>
//           </View>

//           <View
//             style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
//           >
//             <TouchableOpacity
//               onPress={decrementUnit}
//               disabled={unitQuantity === 0 && mode === 'sales'}
//               style={{
//                 width: 32,
//                 height: 32,
//                 borderRadius: 8,
//                 backgroundColor: colors.surface,
//                 borderWidth: 1,
//                 borderColor: colors.border,
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 opacity: unitQuantity === 0 ? 0.4 : 1,
//               }}
//             >
//               <Ionicons name="remove" size={18} color={colors.warning} />
//             </TouchableOpacity>

//             <TextInput
//               style={{
//                 width: 55,
//                 textAlign: 'center',
//                 fontSize: 16,
//                 fontWeight: '700',
//                 color: colors.textPrimary,
//                 paddingVertical: 6,
//                 backgroundColor: colors.surface,
//                 borderRadius: 8,
//                 borderWidth: 1,
//                 borderColor: colors.border,
//               }}
//               value={unitQuantity.toString()}
//               onChangeText={updateUnitQuantity}
//               keyboardType="numeric"
//             />

//             <TouchableOpacity
//               onPress={incrementUnit}
//               disabled={(isMaxStock || unitQuantity >= maxUnits) && mode === 'sales'}
//               style={{
//                 width: 32,
//                 height: 32,
//                 borderRadius: 8,
//                 backgroundColor: colors.surface,
//                 borderWidth: 1,
//                 borderColor: colors.border,
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 opacity: (isMaxStock || unitQuantity >= maxUnits) && mode === 'sales' ? 0.4 : 1,
//               }}
//             >
//               <Ionicons name="add" size={18} color={colors.warning} />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>

//       {/* Row 3: Stock Info with Icons and Summary */}
//       <View
//         style={{
//           flexDirection: 'row',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           paddingTop: 8,
//           borderTopWidth: 1,
//           borderTopColor: colors.divider,
//         }}
//       >
//         {/* Stock Info with Icons */}
//         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
//           <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
//             <Ionicons name="cube-outline" size={14} color={colors.primary} />
//             <AppText style={{ color: colors.textSecondary, fontSize: 12 }}>
//               Stock: {availableStock}
//             </AppText>
//           </View>

//           <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
//             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
//               <Ionicons name="options-outline" size={14} color={colors.textSecondary} />
//               <AppText style={{ color: colors.textSecondary, fontSize: 12 }}>
//                 Total: {totalUnits} units
//               </AppText>
//             </View>
//           </View>

//           {totalUnits === availableStock && totalUnits > 0 && (
//             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
//               <Ionicons name="checkmark-circle" size={14} color={colors.success} />
//               <AppText style={{ color: colors.success, fontSize: 11 }}>Max Stock</AppText>
//             </View>
//           )}
//         </View>

//         {/* Total Value */}
//         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
//           <AppText style={{ color: colors.textSecondary, fontSize: 12 }}>Value:</AppText>
//           <AppText style={{ color: colors.primary, fontWeight: '700', fontSize: 16 }}>
//             {formatCurrency(totalValue)}
//           </AppText>
//         </View>
//       </View>

//       {/* Progress Bar */}
//       {availableStock > 0 && totalUnits > 0 && (
//         <View style={{ marginTop: 8 }}>
//           <View
//             style={{
//               height: 3,
//               backgroundColor: colors.divider,
//               borderRadius: 2,
//               overflow: 'hidden',
//             }}
//           >
//             <View
//               style={{
//                 width: `${(totalUnits / availableStock) * 100}%`,
//                 height: '100%',
//                 backgroundColor: totalUnits === availableStock ? colors.success : colors.primary,
//                 borderRadius: 2,
//               }}
//             />
//           </View>
//         </View>
//       )}
//     </View>
//   );

//   function updateCaseQuantity(value: string) {
//     const num = parseInt(value) || 0;
//     const maxCase = Math.floor((availableStock - unitQuantity) / UNITS_PER_CASE);
//     setCaseQuantity(Math.min(Math.max(0, num), maxCase));
//   }

//   function updateUnitQuantity(value: string) {
//     const num = parseInt(value) || 0;
//     const maxUnitsVal = availableStock - caseQuantity * UNITS_PER_CASE;
//     setUnitQuantity(Math.min(Math.max(0, num), maxUnitsVal));
//   }

//   function incrementCase() {
//     if (!isMaxStock && caseQuantity < maxCases) {
//       setCaseQuantity((prev) => prev + 1);
//     }
//   }

//   function decrementCase() {
//     if (caseQuantity > 0) {
//       setCaseQuantity((prev) => prev - 1);
//     }
//   }

//   function incrementUnit() {
//     if (!isMaxStock && unitQuantity < maxUnits) {
//       setUnitQuantity((prev) => prev + 1);
//     }
//   }

//   function decrementUnit() {
//     if (unitQuantity > 0) {
//       setUnitQuantity((prev) => prev - 1);
//     }
//   }
// };

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

  // For topup mode, we don't have stock limits
  const isUnlimitedMode = mode === 'topup';

  const [caseQuantity, setCaseQuantity] = useState(product.caseQty || 0);
  const [unitQuantity, setUnitQuantity] = useState(product.pieceQty || 0);

  const totalUnits = caseQuantity * UNITS_PER_CASE + unitQuantity;
  const totalValue = caseQuantity * casePrice + unitQuantity * piecePrice;

  // Stock limits only apply to sales mode
  const isMaxStock = !isUnlimitedMode && totalUnits >= availableStock;
  const maxCases = isUnlimitedMode
    ? 999999 // No limit for topup
    : Math.floor((availableStock - unitQuantity) / UNITS_PER_CASE);
  const maxUnits = isUnlimitedMode
    ? 999999 // No limit for topup
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

    // For topup mode, always send cart update even if quantities are 0
    // For sales mode, only send if quantities > 0
    if (caseQuantity > 0 || unitQuantity > 0 || isUnlimitedMode) {
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
    } else if (product.caseQty > 0 || product.pieceQty > 0) {
      onAddToCart([]);
    }
  }, [caseQuantity, unitQuantity]);

  const setMaxQuantity = useCallback(() => {
    if (isUnlimitedMode) {
      // For topup mode, set a reasonable default (e.g., 100 cases)
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

  // Calculate available cases and pieces for display
  const availableCases = Math.floor(availableStock / UNITS_PER_CASE);
  const remainingPieces = availableStock % UNITS_PER_CASE;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        marginBottom: 8,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border + '20',
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      {/* Row 1: Product Name and Action Icons */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {showName && (
            <AppText
              style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '600' }}
              numberOfLines={2}
            >
              {product.productName}
            </AppText>
          )}
          {!isUnlimitedMode && availableStock < 10 && availableStock > 0 && (
            <View
              style={{
                backgroundColor: colors.warning + '20',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              <AppText style={{ color: colors.warning, fontSize: 10, fontWeight: '600' }}>
                Low Stock
              </AppText>
            </View>
          )}
          {isUnlimitedMode && (
            <View
              style={{
                backgroundColor: colors.primary + '15',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              <AppText style={{ color: colors.primary, fontSize: 10, fontWeight: '600' }}>
                Top-up Mode
              </AppText>
            </View>
          )}
        </View>

        {/* Action Icons - Max and Remove */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {/* Max button - only for topup mode */}
          {isUnlimitedMode && (
            <TouchableOpacity
              onPress={setMaxQuantity}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Ionicons name="flash-outline" size={18} color={colors.primary} />
              <AppText style={{ color: colors.primary, fontSize: 11, fontWeight: '500' }}>
                Max
              </AppText>
            </TouchableOpacity>
          )}

          {/* Remove button - show when any quantity > 0 */}
          {(caseQuantity > 0 || unitQuantity > 0) && (
            <TouchableOpacity
              onPress={clearQuantities}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Ionicons name="trash-outline" size={16} color={colors.error} />
              <AppText style={{ color: colors.error, fontSize: 11, fontWeight: '500' }}>
                Remove
              </AppText>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {/* Row 2: Cases and Pieces */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 10 }}>
        {/* Cases Section */}
        <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: 8, padding: 8 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="cube-outline" size={16} color={colors.primary} />
              <AppText style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '600' }}>
                Cases
              </AppText>
            </View>
            <AppText style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>
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
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: caseQuantity === 0 ? 0.4 : 1,
              }}
            >
              <Ionicons name="remove" size={18} color={colors.primary} />
            </TouchableOpacity>

            <TextInput
              style={{
                width: 55,
                textAlign: 'center',
                fontSize: 16,
                fontWeight: '700',
                color: colors.textPrimary,
                paddingVertical: 6,
                backgroundColor: colors.surface,
                borderRadius: 8,
                borderWidth: 1,
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
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: !isUnlimitedMode && (isMaxStock || caseQuantity >= maxCases) ? 0.4 : 1,
              }}
            >
              <Ionicons name="add" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Pieces Section */}
        <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: 8, padding: 8 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="grid-outline" size={16} color={colors.warning} />
              <AppText style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '600' }}>
                Pieces
              </AppText>
            </View>
            <AppText style={{ color: colors.warning, fontSize: 13, fontWeight: '700' }}>
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
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: unitQuantity === 0 ? 0.4 : 1,
              }}
            >
              <Ionicons name="remove" size={18} color={colors.warning} />
            </TouchableOpacity>

            <TextInput
              style={{
                width: 55,
                textAlign: 'center',
                fontSize: 16,
                fontWeight: '700',
                color: colors.textPrimary,
                paddingVertical: 6,
                backgroundColor: colors.surface,
                borderRadius: 8,
                borderWidth: 1,
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
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: !isUnlimitedMode && (isMaxStock || unitQuantity >= maxUnits) ? 0.4 : 1,
              }}
            >
              <Ionicons name="add" size={18} color={colors.warning} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Row 3: Stock Info with Icons and Summary */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: colors.divider,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        {/* Stock Info with Icons */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {!isUnlimitedMode ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="cube-outline" size={14} color={colors.primary} />
                <AppText style={{ color: colors.textSecondary, fontSize: 12 }}>
                  Stock: {availableStock} pcs
                </AppText>
              </View>

              {availableCases > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <Ionicons name="options-outline" size={12} color={colors.textSecondary} />
                  <AppText style={{ color: colors.textSecondary, fontSize: 11 }}>
                    {availableCases} cases
                    {remainingPieces > 0 && ` + ${remainingPieces} pcs`}
                    {` (${UNITS_PER_CASE} pcs/case)`}
                  </AppText>
                </View>
              )}
            </>
          ) : (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="infinite" size={14} color={colors.primary} />
                <AppText style={{ color: colors.textSecondary, fontSize: 12 }}>
                  No quantity limit
                </AppText>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Ionicons name="options-outline" size={12} color={colors.textSecondary} />
                <AppText style={{ color: colors.textSecondary, fontSize: 11 }}>
                  {UNITS_PER_CASE} pcs/case
                </AppText>
              </View>
            </>
          )}

          {/* Selected Total */}
          {/* {totalUnits > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Ionicons name="cart-outline" size={12} color={colors.success} />
              <AppText style={{ color: colors.success, fontSize: 11 }}>
                Selected: {totalUnits} units
              </AppText>
            </View>
          )} */}

          {/* Max Stock Indicator - Sales Mode Only */}
          {!isUnlimitedMode && totalUnits === availableStock && totalUnits > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="checkmark-circle" size={12} color={colors.success} />
              <AppText style={{ color: colors.success, fontSize: 11 }}>All Stock</AppText>
            </View>
          )}
        </View>

        {/* Total Value */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <AppText style={{ color: colors.textSecondary, fontSize: 12 }}>Total:</AppText>
          <AppText style={{ color: colors.primary, fontWeight: '700', fontSize: 16 }}>
            {formatCurrency(totalValue)}
          </AppText>
        </View>
      </View>
      {/* Progress Bar - Sales Mode Only */}
      {!isUnlimitedMode && availableStock > 0 && totalUnits > 0 && (
        <View style={{ marginTop: 8 }}>
          <View
            style={{
              height: 3,
              backgroundColor: colors.divider,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${(totalUnits / availableStock) * 100}%`,
                height: '100%',
                backgroundColor: totalUnits === availableStock ? colors.success : colors.primary,
                borderRadius: 2,
              }}
            />
          </View>
          <AppText style={{ color: colors.textTertiary, fontSize: 10, marginTop: 4 }}>
            {Math.round((totalUnits / availableStock) * 100)}% of available stock
          </AppText>
        </View>
      )}
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

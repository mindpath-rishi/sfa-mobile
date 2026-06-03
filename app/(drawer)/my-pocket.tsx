// src/screens/PocketMISScreen.tsx

// INSTALL FIRST
// expo install @react-native-community/datetimepicker expo-linear-gradient

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Dimensions,
  Platform,
  Animated,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Ionicons, MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';

const { width } = Dimensions.get('window');

// Typography scale - REDUCED SIZES for consistency
const TYPOGRAPHY = {
  h1: { size: 24, weight: '800' as const, lineHeight: 30 },
  h2: { size: 20, weight: '700' as const, lineHeight: 26 },
  h3: { size: 16, weight: '700' as const, lineHeight: 22 },
  h4: { size: 14, weight: '600' as const, lineHeight: 20 },
  body: { size: 13, weight: '400' as const, lineHeight: 18 },
  bodySmall: { size: 12, weight: '400' as const, lineHeight: 16 },
  caption: { size: 10, weight: '400' as const, lineHeight: 14 },
  button: { size: 12, weight: '600' as const, lineHeight: 16 },
  stat: { size: 20, weight: '800' as const, lineHeight: 26 },
  statSmall: { size: 18, weight: '700' as const, lineHeight: 24 },
  time: { size: 12, weight: '500' as const, lineHeight: 16 },
};

export default function PocketMISScreen() {
  const [showProductWiseModal, setShowProductWiseModal] = useState(false);
  const [showDayWiseModal, setShowDayWiseModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('MTD');
  const [selectedCategory, setSelectedCategory] = useState('PRIMARYCATEGORY');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('performance');

  const scrollY = new Animated.Value(0);
  const { colors, isDark } = useTheme();

  const openDatePicker = () => {
    if (Platform.OS === 'web') {
      // For web, we'll use a modal with a date input
      setShowDatePicker(true);
    } else if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: selectedDate,
        mode: 'date',
        is24Hour: true,
        maximumDate: new Date(),
        onChange: (_event, date) => {
          if (date) {
            setSelectedDate(date);
          }
        },
      });
    } else {
      setShowDatePicker(true);
    }
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const summaryData = {
    retailing: 3,
    leaveAbsent: '0 / 18',
    officialWork: 0,
    total: 21,
    avgRetailingTime: '2h 30m',
    avgTotalTime: '6h 45m',
  };

  const performanceData = {
    tc: 3,
    pc: 2,
    upc: 2,
    utc: 3,
    lpc: 2,
    avgFirstCall: '10:53:32',
    avgFirstPC: '10:53:32',
    avgTC: 3,
    avgPC: 2,
    achievement: 87,
    target: 100,
  };

  const productData = {
    sc: 376,
    tc: 3,
    pc: 2,
    netValue: 43,
    cases: 3.071,
    lpc: 2,
    categories: [
      { name: 'Confectionery', value: 43, pcs: 43, cases: 3.071, growth: 12 },
      { name: 'Beverages', value: 82, pcs: 68, cases: 1.8, growth: 8 },
      { name: 'Snacks', value: 56, pcs: 45, cases: 2.1, growth: 15 },
    ],
  };

  const SummaryItem = ({ value, label, color, icon, trend }: any) => (
    <View style={{ width: '33%', alignItems: 'center', marginBottom: 16 }}>
      {icon && (
        <View style={{ marginBottom: 4 }}>
          <Ionicons name={icon} size={16} color={color || colors.primary} />
        </View>
      )}
      <Text
        style={{
          fontSize: TYPOGRAPHY.stat.size,
          fontWeight: TYPOGRAPHY.stat.weight,
          color: color || colors.textPrimary,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: TYPOGRAPHY.caption.size,
          color: colors.textTertiary,
          marginTop: 2,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
      {trend && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <Ionicons
            name={trend > 0 ? 'trending-up' : 'trending-down'}
            size={8}
            color={trend > 0 ? colors.success : colors.error}
          />
          <Text
            style={{
              fontSize: TYPOGRAPHY.caption.size,
              marginLeft: 2,
              color: trend > 0 ? colors.success : colors.error,
            }}
          >
            {Math.abs(trend)}%
          </Text>
        </View>
      )}
    </View>
  );

  const SectionHeader = ({ title, icon, section, onPress }: any) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingVertical: 4,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            backgroundColor: colors.primary + '15',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 8,
          }}
        >
          <Ionicons name={icon} size={14} color={colors.primary} />
        </View>
        <Text
          style={{
            fontSize: TYPOGRAPHY.h3.size,
            fontWeight: TYPOGRAPHY.h3.weight,
            color: colors.textPrimary,
          }}
        >
          {title}
        </Text>
      </View>
      <Ionicons
        name={expandedSection === section ? 'chevron-up' : 'chevron-down'}
        size={18}
        color={colors.textTertiary}
      />
    </TouchableOpacity>
  );

  const GradientCard = ({ children, colors: gradientColors, style }: any) => (
    <LinearGradient
      colors={gradientColors || colors.gradientPrimary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderRadius: 16, padding: 14, marginBottom: 12 }, style]}
    >
      {children}
    </LinearGradient>
  );

  const QuickActionButton = ({ title, icon, onPress, gradient, subtitle }: any) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={{ flex: 1 }}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 16,
          padding: 14,
          minHeight: 110,
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name={icon} size={20} color={colors.primaryContrast} />
        </View>
        <View>
          <Text
            style={{
              fontSize: TYPOGRAPHY.body.size,
              fontWeight: '700',
              lineHeight: 16,
              color: colors.primaryContrast,
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={{
                fontSize: TYPOGRAPHY.caption.size,
                color: colors.primaryContrast + 'CC',
                marginTop: 2,
              }}
            >
              {subtitle}
            </Text>
          )}
          <Feather
            name="arrow-right"
            size={14}
            color={colors.primaryContrast}
            style={{ marginTop: 8 }}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Web Date Picker Modal Component
  const WebDatePickerModal = () => {
    const [tempDate, setTempDate] = useState(selectedDate);

    const handleConfirm = () => {
      setSelectedDate(tempDate);
      setShowDatePicker(false);
    };

    return (
      <Modal
        visible={showDatePicker && Platform.OS === 'web'}
        transparent={true}
        animationType="fade"
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 20,
              width: width - 40,
              maxWidth: 400,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text
              style={{
                fontSize: TYPOGRAPHY.h3.size,
                fontWeight: TYPOGRAPHY.h3.weight,
                color: colors.textPrimary,
                marginBottom: 20,
                textAlign: 'center',
              }}
            >
              Select Date
            </Text>

            <input
              type="date"
              value={tempDate.toISOString().split('T')[0]}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                if (e.target.value) {
                  setTempDate(new Date(e.target.value));
                }
              }}
              style={{
                width: '100%',
                padding: 12,
                fontSize: '16px',
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                backgroundColor: colors.background,
                color: colors.textPrimary,
                marginBottom: 20,
                fontFamily: 'inherit',
              }}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: colors.textTertiary, fontSize: TYPOGRAPHY.button.size }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirm}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: colors.primaryContrast,
                    fontSize: TYPOGRAPHY.button.size,
                    fontWeight: '600',
                  }}
                >
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const ProductWiseModal = () => (
    <Modal visible={showProductWiseModal} animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar
          backgroundColor={colors.background}
          barStyle={isDark ? 'light-content' : 'dark-content'}
        />

        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          }}
        >
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setShowProductWiseModal(false)}>
                <Ionicons name="arrow-back" size={22} color={colors.primaryContrast} />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: TYPOGRAPHY.h2.size,
                  fontWeight: TYPOGRAPHY.h2.weight,
                  marginLeft: 12,
                  color: colors.primaryContrast,
                }}
              >
                Product Wise Sales
              </Text>
            </View>
            <TouchableOpacity>
              <Feather name="download" size={18} color={colors.primaryContrast} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 30 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginVertical: 14 }}
          >
            {['MTD', 'LAST MONTH', 'CUSTOM DATE', 'Calendar'].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => {
                  setSelectedFilter(item);
                  if (item === 'Calendar') openDatePicker();
                }}
                style={{
                  borderWidth: 1,
                  borderColor: colors.primary,
                  backgroundColor: selectedFilter === item ? colors.primary : colors.surface,
                  borderRadius: 20,
                  paddingVertical: 6,
                  paddingHorizontal: 16,
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.button.size,
                    fontWeight: TYPOGRAPHY.button.weight,
                    color: selectedFilter === item ? colors.primaryContrast : colors.textPrimary,
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <GradientCard colors={colors.gradientPrimary}>
            <Text
              style={{
                color: colors.primaryContrast,
                fontSize: TYPOGRAPHY.h4.size,
                fontWeight: TYPOGRAPHY.h4.weight,
                marginBottom: 10,
                textAlign: 'center',
              }}
            >
              Overview
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <SummaryItem
                value={productData.sc}
                label="SC"
                icon="stats-chart"
                color={colors.primaryContrast}
              />
              <SummaryItem
                value={productData.tc}
                label="TC"
                icon="time"
                color={colors.primaryContrast}
              />
              <SummaryItem
                value={productData.pc}
                label="PC"
                icon="cart"
                color={colors.primaryContrast}
              />
              <SummaryItem
                value={`ZMW ${productData.netValue}`}
                label="Net Value"
                icon="cash"
                color={colors.primaryContrast}
              />
              <SummaryItem
                value={productData.cases}
                label="Cases"
                icon="cube"
                color={colors.primaryContrast}
              />
              <SummaryItem
                value={productData.lpc}
                label="LPC"
                icon="people"
                color={colors.primaryContrast}
              />
            </View>
          </GradientCard>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              marginTop: 8,
              overflow: 'hidden',
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              {['PRIMARYCATEGORY', 'SECONDARYCATEGORY', 'SKU'].map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setSelectedCategory(item)}
                  style={{
                    flex: 1,
                    backgroundColor: selectedCategory === item ? colors.primary : colors.surface,
                    paddingVertical: 10,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.caption.size,
                      fontWeight: '700',
                      color:
                        selectedCategory === item ? colors.primaryContrast : colors.textPrimary,
                    }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ marginTop: 14 }}>
            <View
              style={{
                flexDirection: 'row',
                marginBottom: 8,
                paddingHorizontal: 8,
                paddingVertical: 6,
                backgroundColor: colors.backgroundSecondary,
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  flex: 2,
                  fontSize: TYPOGRAPHY.bodySmall.size,
                  fontWeight: '600',
                  color: colors.textSecondary,
                }}
              >
                Value
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: TYPOGRAPHY.bodySmall.size,
                  fontWeight: '600',
                  color: colors.textSecondary,
                }}
              >
                Pcs
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: 'right',
                  fontSize: TYPOGRAPHY.bodySmall.size,
                  fontWeight: '600',
                  color: colors.textSecondary,
                }}
              >
                Cases
              </Text>
            </View>

            {productData.categories.map((item, index) => (
              <TouchableOpacity key={index} activeOpacity={0.8}>
                <View
                  style={{
                    flexDirection: 'row',
                    paddingHorizontal: 8,
                    paddingVertical: 12,
                    borderBottomWidth: index < productData.categories.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View style={{ flex: 2 }}>
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.bodySmall.size,
                        fontWeight: '700',
                        color: colors.primary,
                      }}
                    >
                      {index + 1}. {item.name}
                    </Text>
                    <Text
                      style={{
                        marginTop: 2,
                        fontSize: TYPOGRAPHY.body.size,
                        fontWeight: '600',
                        color: colors.textPrimary,
                      }}
                    >
                      ZMW {item.value}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                      <Ionicons name="trending-up" size={8} color={colors.success} />
                      <Text
                        style={{
                          fontSize: TYPOGRAPHY.caption.size,
                          color: colors.success,
                          marginLeft: 2,
                        }}
                      >
                        +{item.growth}%
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      fontSize: TYPOGRAPHY.body.size,
                      fontWeight: '600',
                      color: colors.textPrimary,
                      marginTop: 12,
                    }}
                  >
                    {item.pcs}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      textAlign: 'right',
                      fontSize: TYPOGRAPHY.body.size,
                      fontWeight: '600',
                      color: colors.textPrimary,
                      marginTop: 12,
                    }}
                  >
                    {item.cases}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const DayWiseModal = () => (
    <Modal visible={showDayWiseModal} animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setShowDayWiseModal(false)}>
              <Ionicons name="arrow-back" size={22} color={colors.primaryContrast} />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: TYPOGRAPHY.h2.size,
                fontWeight: TYPOGRAPHY.h2.weight,
                marginLeft: 12,
                color: colors.primaryContrast,
              }}
            >
              Day Wise Summary
            </Text>
          </View>
        </LinearGradient>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 30 }}
        >
          {[1, 2].map((_, index) => (
            <TouchableOpacity key={index} activeOpacity={0.9}>
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 14,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.bodySmall.size,
                      color: colors.textTertiary,
                      fontWeight: '600',
                    }}
                  >
                    Today - Wed, 22-Apr-2026
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.successLight,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.success,
                        fontSize: TYPOGRAPHY.caption.size,
                        fontWeight: '600',
                      }}
                    >
                      2 min ago
                    </Text>
                  </View>
                </View>

                <LinearGradient
                  colors={colors.gradientSuccess}
                  style={{ borderRadius: 10, overflow: 'hidden', marginVertical: 8 }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.primaryContrast,
                        fontWeight: '700',
                        fontSize: TYPOGRAPHY.body.size,
                      }}
                    >
                      Retailing
                    </Text>
                    <Text
                      style={{
                        color: colors.primaryContrast,
                        fontSize: TYPOGRAPHY.statSmall.size,
                        fontWeight: '800',
                      }}
                    >
                      10 Miles
                    </Text>
                  </View>
                </LinearGradient>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 6,
                    padding: 6,
                    backgroundColor: colors.backgroundSecondary,
                    borderRadius: 8,
                  }}
                >
                  <Ionicons name="location-outline" size={12} color={colors.textTertiary} />
                  <Text
                    style={{
                      marginLeft: 4,
                      fontSize: TYPOGRAPHY.caption.size,
                      color: colors.textTertiary,
                      flex: 1,
                    }}
                  >
                    H7JC+GJ6, Chinika, Lusaka, Zambia
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 12,
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}
                >
                  {['First Call', 'First PC', 'TC'].map((item, i) => (
                    <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: colors.primaryLight + '20',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginBottom: 2,
                        }}
                      >
                        <Ionicons
                          name={
                            i === 0
                              ? 'call-outline'
                              : i === 1
                                ? 'phone-portrait-outline'
                                : 'time-outline'
                          }
                          size={12}
                          color={colors.primary}
                        />
                      </View>
                      <Text
                        style={{
                          fontSize: TYPOGRAPHY.statSmall.size,
                          fontWeight: '800',
                          color: colors.textPrimary,
                        }}
                      >
                        --
                      </Text>
                      <Text
                        style={{
                          marginTop: 2,
                          fontSize: TYPOGRAPHY.caption.size,
                          color: colors.textTertiary,
                        }}
                      >
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* iOS Date Picker */}
      {Platform.OS === 'ios' && showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="spinner"
          maximumDate={new Date()}
          onChange={(_event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      {/* Web Date Picker Modal */}
      <WebDatePickerModal />

      <ProductWiseModal />
      <DayWiseModal />

      <Animated.ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
      >
        {/* HEADER */}
        <View style={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 8 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: TYPOGRAPHY.h1.size,
                  fontWeight: TYPOGRAPHY.h1.weight,
                  color: colors.textPrimary,
                }}
              >
                My Pocket MIS
              </Text>
              <Text
                style={{ marginTop: 2, fontSize: TYPOGRAPHY.body.size, color: colors.textTertiary }}
              >
                Performance Dashboard
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 2.5,
                    backgroundColor: colors.success,
                    marginRight: 4,
                  }}
                />
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.caption.size,
                    color: colors.success,
                    fontWeight: '600',
                  }}
                >
                  Live Updates
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={openDatePicker}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons name="calendar-outline" size={14} color={colors.primary} />
              <Text
                style={{
                  marginLeft: 4,
                  fontSize: TYPOGRAPHY.time.size,
                  fontWeight: '600',
                  color: colors.textPrimary,
                }}
              >
                {formatDate(selectedDate)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* QUICK ACTION BUTTONS */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: 18, gap: 10 }}>
          <QuickActionButton
            title="Day Wise Summary"
            subtitle=""
            icon="calendar-outline"
            onPress={() => setShowDayWiseModal(true)}
            gradient={colors.gradientPrimary}
          />
          <QuickActionButton
            title="Product Sales"
            subtitle="Track performance"
            icon="cube-outline"
            onPress={() => setShowProductWiseModal(true)}
            gradient={colors.gradientSuccess}
          />
          <QuickActionButton
            title="Dispatch Status"
            subtitle=""
            icon="car-outline"
            onPress={() => {}}
            gradient={[colors.warning, colors.warningDark] as const}
          />
        </View>

        {/* SHARE CARD */}
        <GradientCard
          colors={[colors.secondary, colors.secondaryDark]}
          style={{ marginHorizontal: 16, marginTop: 18 }}
        >
          <Text
            style={{
              textAlign: 'center',
              fontSize: TYPOGRAPHY.h4.size,
              fontWeight: '800',
              color: colors.secondaryContrast,
              marginBottom: 4,
            }}
          >
            Share Your Progress
          </Text>
          <Text
            style={{
              textAlign: 'center',
              fontSize: TYPOGRAPHY.caption.size,
              color: colors.secondaryContrast + 'CC',
              marginBottom: 14,
            }}
          >
            Keep your manager updated with daily achievements
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {['SHARE MSR', 'SHARE DSR'].map((item, index) => (
              <TouchableOpacity key={index} style={{ flex: 1 }}>
                <LinearGradient
                  colors={
                    index === 0
                      ? [colors.surface, colors.backgroundSecondary]
                      : ['#1E293B', '#0F172A']
                  }
                  style={{
                    paddingVertical: 8,
                    borderRadius: 12,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons
                    name="share-social-outline"
                    size={14}
                    color={index === 0 ? colors.primary : colors.primaryContrast}
                  />
                  <Text
                    style={{
                      marginLeft: 4,
                      fontSize: TYPOGRAPHY.button.size,
                      fontWeight: '600',
                      color: index === 0 ? colors.primary : colors.primaryContrast,
                    }}
                  >
                    {item}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </GradientCard>

        {/* ACHIEVEMENT CARD */}
        {/* <View style={{ marginHorizontal: 16, marginTop: 18 }}>
          <LinearGradient
            colors={[colors.info, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 16, padding: 14 }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  color: colors.primaryContrast,
                  fontSize: TYPOGRAPHY.h4.size,
                  fontWeight: '800',
                }}
              >
                Monthly Target
              </Text>
              <FontAwesome5 name="medal" size={18} color={colors.primaryContrast} />
            </View>
            <View style={{ alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: colors.primaryContrast, fontSize: 28, fontWeight: '800' }}>
                {performanceData.achievement}%
              </Text>
              <Text
                style={{
                  color: colors.primaryContrast + 'CC',
                  fontSize: TYPOGRAPHY.caption.size,
                  marginTop: 2,
                }}
              >
                Achievement Rate
              </Text>
            </View>
            <View
              style={{
                width: '100%',
                height: 5,
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 2.5,
                overflow: 'hidden',
              }}
            >
              <LinearGradient
                colors={colors.gradientSuccess}
                style={{
                  width: `${performanceData.achievement}%`,
                  height: '100%',
                  borderRadius: 2.5,
                }}
              />
            </View>
            <Text
              style={{
                color: colors.primaryContrast + 'CC',
                fontSize: TYPOGRAPHY.caption.size,
                textAlign: 'center',
                marginTop: 6,
              }}
            >
              Target: {performanceData.target} | Achieved: {performanceData.achievement}
            </Text>
          </LinearGradient>
        </View> */}

        {/* DAY WISE SUMMARY SECTION */}
        <View style={{ marginTop: 22, marginHorizontal: 16 }}>
          <SectionHeader
            title="DAY WISE SUMMARY"
            icon="calendar"
            section="daywise"
            onPress={() => setExpandedSection(expandedSection === 'daywise' ? null : 'daywise')}
          />
          {expandedSection === 'daywise' && (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <SummaryItem
                  value={summaryData.retailing}
                  label="Retailing"
                  color={colors.success}
                  icon="storefront"
                  trend={12}
                />
                <SummaryItem
                  value={summaryData.leaveAbsent}
                  label="Leave / Absent"
                  color={colors.warning}
                  icon="calendar"
                />
                <SummaryItem
                  value={summaryData.avgRetailingTime}
                  label="Avg. Retailing Time"
                  icon="time"
                  color={colors.info}
                />
                <SummaryItem
                  value={summaryData.officialWork}
                  label="Official Work"
                  icon="briefcase"
                  color={colors.success}
                />
                <SummaryItem
                  value={summaryData.total}
                  label="Total Activities"
                  icon="checkmark-done"
                  color={colors.primary}
                />
                <SummaryItem
                  value={summaryData.avgTotalTime}
                  label="Avg. Total Time"
                  icon="hourglass"
                  color={colors.textTertiary}
                />
              </View>
            </View>
          )}
        </View>

        {/* PERFORMANCE SUMMARY SECTION */}
        <View style={{ marginTop: 14, marginHorizontal: 16 }}>
          <SectionHeader
            title="PERFORMANCE SUMMARY"
            icon="stats-chart"
            section="performance"
            onPress={() =>
              setExpandedSection(expandedSection === 'performance' ? null : 'performance')
            }
          />
          {expandedSection === 'performance' && (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  backgroundColor: colors.primaryLight + '20',
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 8,
                  alignSelf: 'flex-start',
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontWeight: '700',
                    color: colors.primary,
                    fontSize: TYPOGRAPHY.caption.size,
                  }}
                >
                  MTD
                </Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <SummaryItem
                  value={performanceData.tc}
                  label="Total Calls"
                  icon="call"
                  color={colors.primary}
                  trend={5}
                />
                <SummaryItem
                  value={performanceData.pc}
                  label="Productive Calls"
                  icon="checkmark-circle"
                  color={colors.success}
                  trend={8}
                />
                <SummaryItem
                  value={performanceData.upc}
                  label="Unique PC"
                  icon="person"
                  color={colors.info}
                />
                <SummaryItem
                  value={performanceData.utc}
                  label="Unique TC"
                  icon="people"
                  color={colors.primary}
                />
                <SummaryItem
                  value={performanceData.lpc}
                  label="LPC"
                  icon="location"
                  color={colors.warning}
                  trend={-2}
                />
              </View>

              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 14 }} />

              <View
                style={{
                  backgroundColor: colors.infoLight + '20',
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 8,
                  alignSelf: 'flex-start',
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontWeight: '700',
                    color: colors.info,
                    fontSize: TYPOGRAPHY.caption.size,
                  }}
                >
                  AVERAGE METRICS
                </Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <SummaryItem
                  value={performanceData.avgFirstCall}
                  label="Avg First Call Time"
                  icon="alarm"
                  color={colors.info}
                />
                <SummaryItem
                  value={performanceData.avgFirstPC}
                  label="Avg First PC Time"
                  icon="timer"
                  color={colors.info}
                />
                <SummaryItem
                  value={performanceData.avgTC}
                  label="Avg TC/Day"
                  icon="bar-chart"
                  color={colors.primary}
                />
                <SummaryItem
                  value={performanceData.avgPC}
                  label="Avg PC/Day"
                  icon="trending-up"
                  color={colors.success}
                />
              </View>
            </View>
          )}
        </View>

        {/* RECENT ACTIVITIES */}
        <View style={{ marginHorizontal: 16, marginTop: 14, marginBottom: 24 }}>
          <Text
            style={{
              fontSize: TYPOGRAPHY.h3.size,
              fontWeight: TYPOGRAPHY.h3.weight,
              marginBottom: 12,
              color: colors.textPrimary,
            }}
          >
            Recent Activities
          </Text>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {[
              {
                icon: 'checkmark-circle',
                text: 'Completed 3 retailing visits',
                time: '2 hours ago',
                color: colors.success,
              },
              {
                icon: 'trophy',
                text: 'Achieved daily target',
                time: '5 hours ago',
                color: colors.warning,
              },
              {
                icon: 'trending-up',
                text: 'Increased PC by 15%',
                time: 'Yesterday',
                color: colors.primary,
              },
            ].map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 8,
                  borderBottomWidth: index < 2 ? 1 : 0,
                  borderBottomColor: colors.border,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: item.color + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name={item.icon as any} size={16} color={item.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.body.size,
                      fontWeight: '600',
                      color: colors.textPrimary,
                    }}
                  >
                    {item.text}
                  </Text>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.caption.size,
                      color: colors.textTertiary,
                      marginTop: 1,
                    }}
                  >
                    {item.time}
                  </Text>
                </View>
                <Feather name="more-horizontal" size={14} color={colors.textTertiary} />
              </View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

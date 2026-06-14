import React from 'react';
import { View, Text, Pressable, TextInput, Platform, StatusBar } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';
import { useHeaderStyles } from './Header.styles';
import { useTheme } from '@/shared/hooks/useTheme';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { router } from 'expo-router';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Header: React.FC = () => {
  const { config } = useHeader();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  /* ============================
   * SAFE CONFIG (prevents leakage)
   * ============================ */
  const safeConfig = {
    title: config?.title ?? '',
    subtitle: config?.subtitle,

    showBack: config?.showBack ?? false,
    showMenu: config?.showMenu ?? false,
    showSearch: config?.showSearch ?? false,
    showFilter: config?.showFilter ?? false,
    showSearchBar: config?.showSearchBar ?? false,

    rightIcon: config?.rightIcon,
    rightIcon2: config?.rightIcon2,
    badgeCount: config?.badgeCount ?? 0,
    onRightPress: config?.onRightPress,
    onRightPress2: config?.onRightPress2,

    filterActive: config?.filterActive ?? false,
    filterCount: config?.filterCount ?? 0,

    useGradient: config?.useGradient ?? false,
    gradientColors: config?.gradientColors,

    hidden: config?.hidden ?? true,
    backgroundColor: config?.backgroundColor,

    searchValue: config?.searchValue,
    searchPlaceholder: config?.searchPlaceholder,
    onSearchChange: config?.onSearchChange,
    onSearchClear: config?.onSearchClear,
    onSearchPress: config?.onSearchPress,
    autoFocusSearch: config?.autoFocusSearch ?? false,
  };

  /* ============================
   * ANIMATION
   * ============================ */
  const backButtonScale = useSharedValue(1);
  const menuButtonScale = useSharedValue(1);
  const filterButtonScale = useSharedValue(1);
  const searchScale = useSharedValue(1);

  const styles = useHeaderStyles({
    elevated: config.elevated ?? true,
    centeredTitle: config.centeredTitle ?? true,
    transparent: config.transparent ?? false,
    size: config.size ?? 'sm',
    showBorder: config.showBorder ?? true,
    showSearchBar: safeConfig.showSearchBar,
  });

  const useGradient = safeConfig.useGradient;
  const gradientColors = safeConfig.gradientColors || [
    colors.primary,
    colors.primaryDark || '#1E3A8A',
  ];

  const handlePressIn = (scaleValue: any) => {
    scaleValue.value = withSpring(0.92);
  };

  const handlePressOut = (scaleValue: any) => {
    scaleValue.value = withSpring(1);
  };

  const handleBackPress = () => {
    backButtonScale.value = withSequence(withTiming(0.8), withTiming(1));
    router.back();
  };

  const handleMenuPress = () => {
    menuButtonScale.value = withSequence(withTiming(0.8), withTiming(1));
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  const handleFilterPress = () => {
    filterButtonScale.value = withSequence(withTiming(0.8), withTiming(1));
    config.onFilterPress?.();
  };

  const handleSearchPress = () => {
    searchScale.value = withSequence(withTiming(0.8), withTiming(1));
    safeConfig.onSearchPress?.();
  };

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backButtonScale.value }],
  }));

  const menuStyle = useAnimatedStyle(() => ({
    transform: [{ scale: menuButtonScale.value }],
  }));

  const filterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: filterButtonScale.value }],
  }));

  const searchStyle = useAnimatedStyle(() => ({
    transform: [{ scale: searchScale.value }],
  }));

  const bgColor = config.transparent
    ? 'transparent'
    : safeConfig.backgroundColor || colors.background;

  /* ============================
   * BADGE
   * ============================ */
  const renderFilterBadge = () => {
    if (!safeConfig.filterCount) return null;

    const badgeText = safeConfig.filterCount > 99 ? '99+' : safeConfig.filterCount.toString();

    return (
      <View style={[styles.filterBadge, { backgroundColor: colors.success || '#10B981' }]}>
        <Text style={styles.filterBadgeText}>{badgeText}</Text>
      </View>
    );
  };

  const renderIconBadge = () => {
    if (!safeConfig.badgeCount) return null;

    const badgeText = safeConfig.badgeCount > 99 ? '99+' : safeConfig.badgeCount.toString();

    return (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badgeText}</Text>
      </View>
    );
  };

  /* ============================
   * HEADER CONTENT
   * ============================ */
  const renderHeaderContent = () => (
    <>
      {/* LEFT SECTION - Back/Menu Button */}
      <View style={styles.leftSection}>
        {safeConfig.showBack ? (
          <AnimatedPressable
            onPress={handleBackPress}
            onPressIn={() => handlePressIn(backButtonScale)}
            onPressOut={() => handlePressOut(backButtonScale)}
            style={[backStyle, styles.buttonBase]}
          >
            <Feather name="chevron-left" size={24} color={useGradient ? '#fff' : colors.surface} />
          </AnimatedPressable>
        ) : safeConfig.showMenu ? (
          <AnimatedPressable
            onPress={handleMenuPress}
            onPressIn={() => handlePressIn(menuButtonScale)}
            onPressOut={() => handlePressOut(menuButtonScale)}
            style={[menuStyle, styles.buttonBase]}
          >
            <Feather name="menu" size={22} color={useGradient ? '#fff' : colors.surface} />
          </AnimatedPressable>
        ) : safeConfig.showSearchBar ? null : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {/* CENTER SECTION - Search Bar (when enabled) or Title */}
      {safeConfig.showSearchBar ? (
        <View style={styles.centerSectionWithSearch}>
          <View style={styles.searchContainerInline}>
            <Ionicons name="search" size={20} color={colors.textTertiary} />
            <TextInput
              style={styles.searchInputInline}
              placeholder={safeConfig.searchPlaceholder || 'Search...'}
              placeholderTextColor={colors.textTertiary}
              value={safeConfig.searchValue}
              onChangeText={safeConfig.onSearchChange}
              autoFocus={safeConfig.autoFocusSearch}
              returnKeyType="search"
              onSubmitEditing={() => {
                safeConfig.onSearchPress?.();
              }}
            />
            {safeConfig.searchValue && safeConfig.onSearchClear && (
              <Pressable onPress={safeConfig.onSearchClear} style={styles.clearButtonInline}>
                <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
              </Pressable>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.centerSection}>
          <Text style={styles.title}>{safeConfig.title}</Text>
          {safeConfig.subtitle && <Text style={styles.subtitle}>{safeConfig.subtitle}</Text>}
        </View>
      )}

      {/* RIGHT SECTION - Filter and Other Icons */}
      <View style={styles.rightSection}>
        {safeConfig.showSearch && !safeConfig.showSearchBar && (
          <AnimatedPressable
            onPress={handleSearchPress}
            onPressIn={() => handlePressIn(searchScale)}
            onPressOut={() => handlePressOut(searchScale)}
            style={[searchStyle, styles.buttonBase]}
          >
            <Feather name="search" size={20} color={useGradient ? '#fff' : colors.surface} />
          </AnimatedPressable>
        )}

        {safeConfig.showFilter && (
          <AnimatedPressable
            onPress={handleFilterPress}
            onPressIn={() => handlePressIn(filterButtonScale)}
            onPressOut={() => handlePressOut(filterButtonScale)}
            style={[filterStyle, styles.buttonBase]}
          >
            <Feather name="sliders" size={20} color={useGradient ? '#fff' : colors.surface} />
            {renderFilterBadge()}
          </AnimatedPressable>
        )}

        {[safeConfig.rightIcon, safeConfig.rightIcon2].filter(Boolean).map((icon, i) => (
          <Pressable
            key={i}
            onPress={i === 0 ? safeConfig.onRightPress : safeConfig.onRightPress2}
            style={({ pressed }) => [
              styles.buttonBase,
              { marginLeft: 6, transform: [{ scale: pressed ? 0.95 : 1 }] },
            ]}
          >
            <Feather name={icon as any} size={22} color={useGradient ? '#fff' : colors.surface} />
            {i === 0 && renderIconBadge()}
          </Pressable>
        ))}
      </View>
    </>
  );

  if (safeConfig.hidden) return null;

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={{ paddingTop: insets.top, backgroundColor: bgColor }}>
        {useGradient ? (
          <LinearGradient colors={gradientColors} style={styles.container}>
            {renderHeaderContent()}
          </LinearGradient>
        ) : (
          <View style={styles.container}>{renderHeaderContent()}</View>
        )}
      </View>
    </>
  );
};

export default Header;

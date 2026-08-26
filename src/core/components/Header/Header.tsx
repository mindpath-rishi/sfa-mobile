import React from 'react';
import { View, Text, Pressable, TextInput, StatusBar } from 'react-native';
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
  withRepeat,
} from 'react-native-reanimated';

import { useHeaderStyles } from './Header.styles';
import { useTheme } from '@/shared/hooks/useTheme';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { router } from 'expo-router';

import { useOfflineStore } from '@/core/offline/offline.store';
import { useAuthStore } from '@/core/store/auth.store';
import { isSalesman } from '@/core/navigation/role.utils';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Header: React.FC = () => {
  const { config } = useHeader();
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const user = useAuthStore((state) => state.user);

  const offlineEnabled = useOfflineStore((state) => state.offlineEnabled);
  const isConnected = useOfflineStore((state) => state.isConnected);
  const isInternetReachable = useOfflineStore((state) => state.isInternetReachable);
  const pendingCount = useOfflineStore((state) => state.pendingCount);
  const isSyncing = useOfflineStore((state) => state.isSyncing);
  const offlineSetupInProgress = useOfflineStore((state) => state.offlineSetupInProgress);

  const canUseOnlineFeature = isSalesman(user) && user?.offlineAccessAllowed === true;

  const isNetworkOnline = Boolean(isConnected && isInternetReachable);
  const isOfflineModeActive = Boolean(offlineEnabled || !isNetworkOnline);
  const isOfflineBusy = Boolean(isSyncing || offlineSetupInProgress);

  const indicatorColor = isOfflineBusy
    ? colors.warning || '#F59E0B'
    : isOfflineModeActive
      ? colors.error || '#EF4444'
      : colors.success || '#10B981';

  /* ============================
   * SAFE CONFIG
   * ============================ */
  const safeConfig = {
    title: config?.title ?? '',
    subtitle: config?.subtitle,

    showBack: config?.showBack ?? false,
    showMenu: config?.showMenu ?? false,
    onBackPress: config?.onBackPress,

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
  const onlineScale = useSharedValue(1);

  const dotOpacity = useSharedValue(1);
  const dotScale = useSharedValue(1);

  React.useEffect(() => {
    dotOpacity.value = withRepeat(
      withSequence(withTiming(0.25, { duration: 600 }), withTiming(1, { duration: 600 })),
      -1,
      true,
    );

    dotScale.value = withRepeat(
      withSequence(withTiming(0.85, { duration: 600 }), withTiming(1.15, { duration: 600 })),
      -1,
      true,
    );
  }, [dotOpacity, dotScale]);

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

    if (safeConfig.onBackPress) {
      safeConfig.onBackPress();
      return;
    }

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

  const onlineStyle = useAnimatedStyle(() => ({
    transform: [{ scale: onlineScale.value }],
  }));

  const blinkingDotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
    transform: [{ scale: dotScale.value }],
  }));

  const bgColor = config.transparent
    ? 'transparent'
    : safeConfig.backgroundColor || colors.background;

  // Keep the status bar visually attached to whatever the header actually paints —
  // a flat color, a gradient's start color, or the transparent/background fallback —
  // instead of a hardcoded primary color that only matched some header variants.
  const statusBarColor = config.transparent
    ? 'transparent'
    : useGradient
      ? gradientColors[0]
      : bgColor;

  const statusBarStyle = useGradient || safeConfig.backgroundColor
    ? 'light-content'
    : isDark
      ? 'light-content'
      : 'dark-content';

  /* ============================
   * BADGES
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

  const renderPendingBadge = () => {
    if (!pendingCount) return null;

    const badgeText = pendingCount > 99 ? '99+' : String(pendingCount);

    return (
      <View
        style={{
          position: 'absolute',
          top: -6,
          right: -8,
          minWidth: 14,
          height: 14,
          borderRadius: 7,
          paddingHorizontal: 3,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.error || '#EF4444',
          borderWidth: 1,
          borderColor: useGradient ? '#fff' : colors.background,
        }}
      >
        <Text
          style={{
            color: '#fff',
            fontSize: 8,
            fontWeight: '700',
            lineHeight: 10,
          }}
        >
          {badgeText}
        </Text>
      </View>
    );
  };

  /* ============================
   * ONLINE / OFFLINE INDICATOR
   * ============================ */
  const renderOnlineOfflineIndicator = () => {
    if (!canUseOnlineFeature) return null;

    return (
      <AnimatedPressable
        onPressIn={() => handlePressIn(onlineScale)}
        onPressOut={() => handlePressOut(onlineScale)}
        style={[
          onlineStyle,
          {
            width: 22,
            height: 34,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 4,
            backgroundColor: 'transparent',
            borderWidth: 0,
            position: 'relative',
          },
        ]}
      >
        <Animated.View
          style={[
            blinkingDotStyle,
            {
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: indicatorColor,
            },
          ]}
        />

        {renderPendingBadge()}
      </AnimatedPressable>
    );
  };

  /* ============================
   * HEADER CONTENT
   * ============================ */
  const renderHeaderContent = () => (
    <>
      {/* LEFT SECTION */}
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

      {/* CENTER SECTION */}
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

      {/* RIGHT SECTION */}
      <View style={styles.rightSection}>
        {renderOnlineOfflineIndicator()}

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
              {
                marginLeft: 6,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
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
      <StatusBar barStyle={statusBarStyle} backgroundColor={statusBarColor} />

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

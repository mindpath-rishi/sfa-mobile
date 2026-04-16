// src/core/components/Header/Header.tsx

import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';
import { HeaderProps } from './Header.types';
import { useHeaderStyles } from './Header.styles';
import { useTheme } from '@/shared/hooks/useTheme';
import { useHeader } from '@/shared/contexts/HeaderContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Header: React.FC<HeaderProps> = (props: any) => {
  const { config } = useHeader();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // Animation values
  const backButtonScale = useSharedValue(1);
  const menuButtonScale = useSharedValue(1);
  const filterButtonScale = useSharedValue(1);

  const styles = useHeaderStyles({
    elevated: props.elevated,
    centeredTitle: props.centeredTitle,
    transparent: props.transparent,
    size: props.size,
    showBorder: props.showBorder,
  });

  // Merge logic
  const title = config.title ?? props.title;
  const subtitle = config.subtitle ?? props.subtitle;

  const showBack = config.showBack ?? props.showBack ?? navigation.canGoBack();
  const showMenu = config.showMenu ?? props.showMenu;
  const showFilter = config.showFilter ?? props.showFilter;
  const filterActive = config.filterActive ?? props.filterActive;
  const filterCount = config.filterCount ?? props.filterCount;
  const onFilterPress = config.onFilterPress ?? props.onFilterPress;
  const badgeCount = config.badgeCount ?? props.badgeCount;

  const bgColor = props.transparent
    ? 'transparent'
    : config.backgroundColor || props.headerBackgroundColor || colors.background;

  const Container = props.transparent ? BlurView : View;

  // Animation handlers
  const handlePressIn = (scaleValue: any) => {
    scaleValue.value = withSpring(0.92, { damping: 10, stiffness: 300 });
  };

  const handlePressOut = (scaleValue: any) => {
    scaleValue.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const handleBackPress = () => {
    backButtonScale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withTiming(1, { duration: 150 }),
    );
    navigation.goBack();
  };

  const handleMenuPress = () => {
    menuButtonScale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withTiming(1, { duration: 150 }),
    );
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  const handleFilterPress = () => {
    filterButtonScale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withTiming(1, { duration: 150 }),
    );
    onFilterPress?.();
  };

  const backButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backButtonScale.value }],
  }));

  const menuButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: menuButtonScale.value }],
  }));

  const filterButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: filterButtonScale.value }],
  }));

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: bgColor }}>
      <Container
        intensity={props.transparent ? 80 : undefined}
        style={[
          styles.container,
          {
            backgroundColor: bgColor,
            paddingHorizontal: 16,
            paddingVertical: 12,
          },
          props.style,
        ]}
      >
        {/* LEFT SECTION - Modern Back/Menu Button */}
        <View style={styles.leftSection}>
          {showBack ? (
            <AnimatedPressable
              onPress={handleBackPress}
              onPressIn={() => handlePressIn(backButtonScale)}
              onPressOut={() => handlePressOut(backButtonScale)}
              style={[
                backButtonAnimatedStyle,
                {
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  // backgroundColor: props.transparent ? 'rgba(255,255,255,0.15)' : colors.surface,
                  // shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                },
              ]}
            >
              <Feather
                name="chevron-left"
                size={24}
                color={colors.textPrimary}
                style={{ marginLeft: -2 }}
              />
            </AnimatedPressable>
          ) : showMenu ? (
            <AnimatedPressable
              onPress={handleMenuPress}
              onPressIn={() => handlePressIn(menuButtonScale)}
              onPressOut={() => handlePressOut(menuButtonScale)}
              style={[
                menuButtonAnimatedStyle,
                {
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  // backgroundColor: props.transparent ? 'rgba(255,255,255,0.15)' : colors.surface,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                },
              ]}
            >
              <Feather name="menu" size={22} color={colors.textPrimary} />
            </AnimatedPressable>
          ) : (
            <View style={{ width: 40 }} /> // Spacer for alignment
          )}
        </View>

        {/* CENTER SECTION - Modern Typography */}
        <View style={styles.centerSection}>
          <View style={{ alignItems: 'flex-start' }}>
            <Text
              style={[
                styles.title,
                {
                  fontSize: props.size === 'small' ? 16 : props.size === 'large' ? 10 : 18,
                  fontWeight: '500',
                  letterSpacing: -0.3,
                  color: colors.textPrimary,
                },
              ]}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[
                  styles.subtitle,
                  {
                    fontSize: 13,
                    color: colors.textSecondary,
                    marginTop: 2,
                    letterSpacing: -0.2,
                  },
                ]}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {/* RIGHT SECTION - Modern Actions */}
        <View style={styles.rightSection}>
          {showFilter && (
            <AnimatedPressable
              onPress={handleFilterPress}
              onPressIn={() => handlePressIn(filterButtonScale)}
              onPressOut={() => handlePressOut(filterButtonScale)}
              style={[
                filterButtonAnimatedStyle,
                {
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  // backgroundColor: filterActive
                  //   ? colors.primary + '15'
                  //   : props.transparent
                  //     ? 'rgba(255,255,255,0.15)'
                  //     : colors.surface,
                  position: 'relative',
                },
              ]}
            >
              <Feather
                name="sliders"
                size={20}
                color={filterActive ? colors.primary : colors.textPrimary}
              />
              {filterCount ? (
                <View
                  style={[
                    styles.badge,
                    {
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      backgroundColor: colors.error,
                      borderRadius: 12,
                      minWidth: 20,
                      height: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: 6,
                      borderWidth: 2,
                      borderColor: bgColor,
                    },
                  ]}
                >
                  <Text
                    style={[styles.badgeText, { color: 'white', fontSize: 11, fontWeight: '600' }]}
                  >
                    {filterCount > 99 ? '99+' : filterCount}
                  </Text>
                </View>
              ) : null}
            </AnimatedPressable>
          )}

          {props.rightIcon && (
            <Pressable
              onPress={props.onRightPress}
              style={({ pressed }) => ({
                width: 40,
                height: 40,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: pressed
                  ? props.transparent
                    ? 'rgba(255,255,255,0.2)'
                    : colors.surface
                  : 'transparent',
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              <Feather name={props.rightIcon as any} size={22} color={colors.textPrimary} />
              {badgeCount ? (
                <View
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    backgroundColor: colors.error,
                    borderRadius: 10,
                    width: 18,
                    height: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: bgColor,
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>
                    {badgeCount}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          )}
        </View>
      </Container>
    </View>
  );
};

export default Header;

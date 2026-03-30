// src/core/components/Header/Header.tsx
import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { HeaderProps } from './Header.types';
import { useHeaderStyles } from './Header.styles';
import { useTheme } from '@/shared/hooks/useTheme';

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showMenu = false,
  rightIcon,
  secondRightIcon,
  onRightPress,
  onSecondRightPress,
  leftComponent,
  rightComponent,
  centerComponent,
  elevated = true,
  centeredTitle = true,
  transparent = false,
  size = 'sm',
  showBorder = true,
  showSearch = false,
  searchValue = '',
  searchPlaceholder = 'Search...',
  onSearchChange,
  onSearchSubmit,
  badgeCount,
  badgeColor,
  avatar,
  avatarText,
  style,
  titleStyle,
  testID = 'header',

  // Filter props
  showFilter = false,
  filterActive = false,
  filterCount = 0,
  onFilterPress,
  filterIcon = 'options-outline',
  filterActiveIcon = 'options',
  filterPosition = 'right',
}) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useHeaderStyles({ elevated, centeredTitle, transparent, size, showBorder });
  const [leftPressed, setLeftPressed] = useState(false);
  const [rightPressed, setRightPressed] = useState(false);
  const [secondRightPressed, setSecondRightPressed] = useState(false);
  const [filterPressed, setFilterPressed] = useState(false);

  const handleLeftPress = () => {
    if (showBack) {
      navigation.goBack();
    } else if (showMenu) {
      navigation.dispatch(DrawerActions.toggleDrawer());
    }
  };

  const handleFilterPress = () => {
    if (onFilterPress) {
      onFilterPress();
    }
  };

  const renderLeftSection = () => {
    if (leftComponent) return leftComponent;

    if (showBack || showMenu) {
      return (
        <Pressable
          onPress={handleLeftPress}
          onPressIn={() => setLeftPressed(true)}
          onPressOut={() => setLeftPressed(false)}
          style={[styles.iconButton, leftPressed && styles.iconButtonPressed]}
          testID={`${testID}-left-button`}
        >
          <Ionicons
            name={showBack ? 'arrow-back' : 'menu'}
            size={size === 'lg' ? 28 : 24}
            color={colors.textPrimary}
          />
        </Pressable>
      );
    }

    if (avatar) {
      return (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarText}</Text>
        </View>
      );
    }

    // Render filter on left if position is left
    if (showFilter && filterPosition === 'left') {
      return (
        <Pressable
          onPress={handleFilterPress}
          onPressIn={() => setFilterPressed(true)}
          onPressOut={() => setFilterPressed(false)}
          style={[
            styles.iconButton,
            filterPressed && styles.iconButtonPressed,
            filterActive && styles.filterButtonActive,
          ]}
          testID={`${testID}-filter-button`}
        >
          <View>
            <Ionicons
              name={filterActive ? filterActiveIcon : filterIcon}
              size={size === 'lg' ? 28 : 24}
              color={filterActive ? colors.primary : colors.textPrimary}
            />
            {filterCount > 0 && (
              <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.filterBadgeText}>{filterCount > 99 ? '99+' : filterCount}</Text>
              </View>
            )}
          </View>
        </Pressable>
      );
    }

    return null;
  };

  const renderCenterSection = () => {
    if (centerComponent) return centerComponent;

    if (showSearch) {
      return (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            value={searchValue}
            onChangeText={onSearchChange}
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.placeholder}
            onSubmitEditing={onSearchSubmit}
            returnKeyType="search"
            testID={`${testID}-search`}
          />
        </View>
      );
    }

    if (title) {
      return (
        <View style={styles.centerContent}>
          <Text style={[styles.title, titleStyle]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      );
    }

    return null;
  };

  const renderRightSection = () => {
    if (rightComponent) return rightComponent;

    return (
      <View style={styles.rightSection}>
        {/* Render filter on right if position is right (default) */}
        {showFilter && filterPosition === 'right' && (
          <Pressable
            onPress={handleFilterPress}
            onPressIn={() => setFilterPressed(true)}
            onPressOut={() => setFilterPressed(false)}
            style={[
              styles.iconButton,
              filterPressed && styles.iconButtonPressed,
              filterActive && styles.filterButtonActive,
            ]}
            testID={`${testID}-filter-button`}
          >
            <View>
              <Ionicons
                name={filterActive ? filterActiveIcon : filterIcon}
                size={size === 'lg' ? 28 : 24}
                color={filterActive ? colors.primary : colors.textPrimary}
              />
              {filterCount > 0 && (
                <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.filterBadgeText}>
                    {filterCount > 99 ? '99+' : filterCount}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        )}

        {secondRightIcon && (
          <Pressable
            onPress={onSecondRightPress}
            onPressIn={() => setSecondRightPressed(true)}
            onPressOut={() => setSecondRightPressed(false)}
            style={[styles.iconButton, secondRightPressed && styles.iconButtonPressed]}
            testID={`${testID}-second-right-button`}
          >
            <Ionicons
              name={secondRightIcon as any}
              size={size === 'lg' ? 28 : 24}
              color={colors.textPrimary}
            />
          </Pressable>
        )}

        {rightIcon && (
          <Pressable
            onPress={onRightPress}
            onPressIn={() => setRightPressed(true)}
            onPressOut={() => setRightPressed(false)}
            style={[styles.iconButton, rightPressed && styles.iconButtonPressed]}
            testID={`${testID}-right-button`}
          >
            <View>
              <Ionicons
                name={rightIcon as any}
                size={size === 'lg' ? 28 : 24}
                color={colors.textPrimary}
              />
              {badgeCount !== undefined && badgeCount > 0 && (
                <View style={[styles.badge, badgeColor && { backgroundColor: badgeColor }]}>
                  <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
                </View>
              )}
            </View>
          </Pressable>
        )}
      </View>
    );
  };

  const Container = transparent ? BlurView : View;

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: colors.background }}>
      <Container
        intensity={transparent ? 80 : undefined}
        style={[styles.container, style]}
        testID={testID}
      >
        <View style={styles.leftSection}>{renderLeftSection()}</View>
        <View style={styles.centerSection}>{renderCenterSection()}</View>
        <View style={styles.rightSection}>{renderRightSection()}</View>
      </Container>
    </View>
  );
};

export default Header;

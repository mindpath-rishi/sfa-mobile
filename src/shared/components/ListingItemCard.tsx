import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/shared/hooks/useTheme';
import { ListingCard } from '@/shared/components/ListingCard';

type ListingItemCardProps = {
  onPress?: () => void;
  leading?: React.ReactNode;

  title: React.ReactNode;
  headerRight?: React.ReactNode;

  subtitle?: React.ReactNode;
  subtitleRight?: React.ReactNode;

  children?: React.ReactNode;

  showChevron?: boolean;
  testID?: string;
};

export function ListingItemCard({
  onPress,
  leading,
  title,
  headerRight,
  subtitle,
  subtitleRight,
  children,
  showChevron = true,
  testID = 'listing-item-card',
}: ListingItemCardProps) {
  const { colors } = useTheme();

  return (
    <ListingCard onPress={onPress} testID={testID}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        {leading ? <View>{leading}</View> : null}

        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: subtitle || subtitleRight || children ? 6 : 0,
            }}
          >
            <View style={{ flex: 1 }}>{title}</View>
            {headerRight ? <View style={{ marginLeft: 12 }}>{headerRight}</View> : null}
          </View>

          {subtitle || subtitleRight ? (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: children ? 6 : 0,
              }}
            >
              <View style={{ flex: 1 }}>{subtitle ?? null}</View>
              {subtitleRight ? <View style={{ marginLeft: 12 }}>{subtitleRight}</View> : null}
            </View>
          ) : null}

          {children}
        </View>
      </View>

      {showChevron ? (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.textTertiary}
          style={{ marginLeft: 8 }}
        />
      ) : null}
    </ListingCard>
  );
}

import React from 'react';
import { View } from 'react-native';
import { Ionicons as IoniconsComponent } from '@expo/vector-icons';

type IoniconName = React.ComponentProps<typeof IoniconsComponent>['name'];

type IconTileProps = {
  icon: IoniconName;
  color: string;
  size?: number;
  backgroundAlphaHex?: string;
  testID?: string;
};

export function IconTile({
  icon,
  color,
  size = 22,
  backgroundAlphaHex = '12',
  testID = 'icon-tile',
}: IconTileProps) {
  return (
    <View
      testID={testID}
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: `${color}${backgroundAlphaHex}`,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <IoniconsComponent name={icon} size={size} color={color} />
    </View>
  );
}

import React from 'react';
import { View, Image } from 'react-native';
import { AppText } from '@/core/components';
import { Outlet } from '../../types/outlet.types';
import { useOutletAvatarStyles } from '../../styles/OutletAvatar.styles';

interface Props {
  outlet: Outlet;
}

export const OutletAvatar: React.FC<Props> = ({ outlet }) => {
  const styles = useOutletAvatarStyles();

  return (
    <View style={styles.container}>
      {outlet.avatar ? (
        <Image source={{ uri: outlet.avatar }} style={styles.avatar} />
      ) : (
        <AppText style={styles.initials}>{outlet.name.charAt(0)}</AppText>
      )}
    </View>
  );
};

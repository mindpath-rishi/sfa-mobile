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
  const primaryImage = outlet.images?.find((image) => image.isPrimary) || outlet.images?.[0];
  const imageUri = outlet.avatar || primaryImage?.urls?.small || primaryImage?.url;

  return (
    <View style={styles.container}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.avatar} />
      ) : (
        <AppText style={styles.initials}>{outlet.name.charAt(0)}</AppText>
      )}
    </View>
  );
};

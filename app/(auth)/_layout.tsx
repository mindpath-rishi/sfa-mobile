import React from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function AuthLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          gestureEnabled: true,
          contentStyle: {
            backgroundColor: 'transparent', // This is crucial!
          },
        }}
      />
    </View>
  );
}

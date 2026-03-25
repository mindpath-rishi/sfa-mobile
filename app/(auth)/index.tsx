import LoginScreen from '@/features/auth/screens/Login';
import { View } from 'react-native';

export default function AuthScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <LoginScreen />
    </View>
  );
}

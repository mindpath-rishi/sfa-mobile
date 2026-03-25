import React, { FC } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppErrorType } from '../../errors/error.enums';
import { ERROR_MESSAGES } from '../../errors/error.constants';
import { useTheme } from '@/shared/hooks/useTheme';
import { useStyles } from './AppError.style';

export interface AppErrorScreenProps {
  type?: AppErrorType;
  onRetry?: () => void;
}

const AppErrorScreen: FC<AppErrorScreenProps> = ({ type = AppErrorType.UNKNOWN, onRetry }) => {
  const { colors } = useTheme();
  const styles = useStyles(colors);

  const error = ERROR_MESSAGES[type];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Text style={styles.icon}>⚠️</Text>

      <Text style={styles.title}>{error.title}</Text>

      <Text style={styles.message}>{error.message}</Text>

      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default AppErrorScreen;

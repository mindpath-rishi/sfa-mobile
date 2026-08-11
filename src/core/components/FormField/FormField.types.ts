import { Ionicons } from '@expo/vector-icons';
import InputProps from '../Input/Input.types';

export interface FormFieldProps extends Omit<InputProps, 'error'> {
  label?: string;
  errorText?: string;
  helperText?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  iconColor?: string;
  secureTextEntry?: boolean;
  required?: boolean;
  success?: boolean;
  successText?: string;
  touched?: boolean;
  onIconPress?: () => void;
  iconPosition?: 'left' | 'right';
  clearable?: boolean;
  onClear?: () => void;
  characterCount?: boolean;
  maxLength?: number;
}

// Form.tsx remains the same, using the separate styles file
import { useTheme } from '@/shared/hooks/useTheme';
import { useFormFieldStyles } from '@/shared/styles/FormField.style';
import React, { createContext, useContext } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from 'react-native';


interface FormContextValue {
  disabled?: boolean;
}

const FormContext = createContext<FormContextValue>({});

export interface FormProps {
  children: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  contentContainerStyle?: ViewStyle;
}

export const Form: React.FC<FormProps> = ({
  children,
  disabled = false,
  style,
  scrollable = true,
  keyboardAvoiding = true,
  contentContainerStyle,
}) => {
  const { colors } = useTheme()
  const styles = useFormFieldStyles(colors);
  
  const content = (
    <FormContext.Provider value={{ disabled }}>
      <View style={[styles.container, style]}>
        {children}
      </View>
    </FormContext.Provider>
  );
  
  if (scrollable) {
    const scrollContent = (
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContainer,
          contentContainerStyle,
        ]}
      >
        {content}
    </ScrollView>
    );
    
    if (keyboardAvoiding && Platform.OS === 'ios') {
      return (
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
          style={{ flex: 1 }}
        >
          {scrollContent}
        </KeyboardAvoidingView>
      );
    }
    
    return scrollContent;
  }
  
  return content;
};

export const useForm = () => useContext(FormContext);
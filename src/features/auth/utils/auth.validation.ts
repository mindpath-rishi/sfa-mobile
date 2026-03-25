import { LoginFormData } from '../types/login.types';

export const validateLoginForm = (data: LoginFormData) => {
  const errors: Partial<Record<keyof LoginFormData, string>> = {};

  if (!data.userId.trim()) {
    errors.userId = 'auth.login.userIdRequired';
  }

  if (!data.password.trim()) {
    errors.password = 'auth.login.passwordRequired';
  } else if (data.password.length < 6) {
    errors.password = 'auth.login.passwordMinLength';
  }

  return errors;
};

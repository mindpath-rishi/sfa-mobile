export interface LoginFormData {
  userId: string;
  password: string;
}

export interface LoginScreenProps {
  redirectUrl?: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

/* ======================================================
 * REQUEST TYPES
 * ====================================================== */

// Device Info (for FCM + tracking)
export interface DeviceInfo {
  deviceId: string;
  deviceType: string; // android | ios | web
  os: string;
  osVersion: string;
  browser?: string;
  appVersion: string;
  fcmToken?: string | null;
}

// Login Request Payload
export interface LoginRequest {
  loginId: string;
  password: string;
  deviceInfo: DeviceInfo;
}

// Form Data (UI only)
export interface LoginFormData {
  userId: string;
  password: string;
}

export interface LoginScreenProps {
  redirectUrl?: string;
}

/* ======================================================
 * RESPONSE TYPES
 * ====================================================== */

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;

  user: {
    id: string;
    name: string;
    email: string;
  };

  // Optional: useful if backend returns device/session info
  deviceId?: string;
}

type StartNativeLocationOptions = {
  workSessionId: string;
  intervalMs?: number;
  distanceMeters?: number;
};

export const isNativeLocationAvailable = () => false;

export const startNativeBackgroundLocation = async (_options: StartNativeLocationOptions) => {
  return false;
};

export const stopNativeBackgroundLocation = async () => {
  return false;
};

export const syncNativePendingLocationUploads = async () => {
  return false;
};

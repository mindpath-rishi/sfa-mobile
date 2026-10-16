const isCameraAvailable = () =>
  typeof navigator !== 'undefined' &&
  Boolean(navigator.mediaDevices?.getUserMedia);

export const useCameraPermissionCompat = () => ({
  // The browser asks for camera permission when SelfieFaceCamera calls
  // getUserMedia. This hook only checks API availability so the start-day
  // flow can open the browser camera prompt instead of rejecting every time.
  hasPermission: isCameraAvailable(),
  requestPermission: async () => isCameraAvailable(),
});

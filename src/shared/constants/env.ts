import Constants from "expo-constants";

type Extra = { apiUrl?: string };

export const ENV = {
  API_URL: (Constants.expoConfig?.extra as Extra | undefined)?.apiUrl ?? "https://example.com/api",
};

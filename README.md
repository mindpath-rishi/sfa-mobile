# Expo JWT Tabs Template (ULTIMATE - Production Ready)

✅ Expo Router (Auth + Tabs)  
✅ JWT Login  
✅ Refresh token auto-retry on 401  
✅ Secure token storage (expo-secure-store)  
✅ Axios interceptors (token attach + refresh queue)  
✅ React Query provider  
✅ Zustand auth store  
✅ Toast notifications  
✅ EAS build config  
✅ `.env.example` for environment setup  

## Setup

```bash
npm install
cp .env.example .env
npx expo start
```

## Environment

Set API URL inside `.env`:

```
EXPO_PUBLIC_API_URL=https://your-backend.com/api
```

## Backend required endpoints

- `POST /auth/login` -> `{ accessToken, refreshToken? }`
- `POST /auth/refresh` -> `{ accessToken, refreshToken? }`

## Build (Play Store / App Store)

```bash
npm i -g eas-cli
eas build -p android --profile production
eas build -p ios --profile production
```

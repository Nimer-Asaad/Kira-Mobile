# Mobile Deployment Guide

## Wrapper App Setup
This app acts as a native shell (WebView) for your deployed frontend.

## Configuration
1. **App Name/Slug**: Update `app.json` if needed.
2. **Web URL**:
   The app uses the `EXPO_PUBLIC_WEB_APP_URL` environment variable to determine which URL to load.

## Building APK (Android)
To build an installable APK file for Android:

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   eas login
   ```
2. **Set the Web URL**:
   Create a `.env` file or pass it inline:
   ```bash
   EXPO_PUBLIC_WEB_APP_URL=https://your-frontend.vercel.app npx eas build -p android --profile preview
   ```
   *(Replace with your actual Vercel URL)*

3. **Download**:
   EAS will generate a download link for the `.apk` file.

## Testing Locally
To test the WebView pointing to production locally:
```bash
EXPO_PUBLIC_WEB_APP_URL=https://your-frontend.vercel.app npx expo start --android
```

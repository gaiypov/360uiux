# Frontend Setup Instructions

## Dependencies to Install

Run the following command in the root directory:

```bash
npm install socket.io-client react-native-image-picker react-native-video react-native-permissions react-native-onesignal
```

### What each package does:

1. **socket.io-client** - WebSocket client for real-time events
2. **react-native-image-picker** - Camera/video picker for recording videos
3. **react-native-video** - Video playback for video messages
4. **react-native-permissions** - Handle iOS/Android permissions
5. **react-native-onesignal** - Push notifications service

**Note:** Voice messages and image attachments have been removed from the architecture. Chat now only supports text and video messages (jobseeker sends video with 2-view limit).

## iOS Setup (if targeting iOS)

```bash
cd ios
pod install
cd ..
```

Add permissions to `ios/YourApp/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>We need access to your camera to record video messages</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photo library to select videos</string>
<key>NSMicrophoneUsageDescription</key>
<string>We need access to your microphone to record video with audio</string>
```

## Android Setup

Add permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

## OneSignal Push Notifications Setup

### 1. Create OneSignal Account

1. Go to [https://onesignal.com/](https://onesignal.com/)
2. Create a free account
3. Create a new app and get your **App ID**

### 2. Configure iOS (Apple Push Notification Service)

1. Create Push Notification Certificate in Apple Developer Portal
2. Upload certificate to OneSignal dashboard
3. Update `src/services/OneSignalService.ts` with your App ID:

```typescript
const ONESIGNAL_APP_ID = 'your-onesignal-app-id';
```

### 3. Configure Android (Firebase Cloud Messaging)

1. Create Firebase project
2. Download `google-services.json`
3. Place in `android/app/google-services.json`
4. Add Firebase Server Key to OneSignal dashboard
5. Update `android/build.gradle`:

```gradle
dependencies {
    classpath 'com.google.gms:google-services:4.3.15'
}
```

6. Update `android/app/build.gradle`:

```gradle
apply plugin: 'com.google.gms.google-services'
```

### 4. Initialize OneSignal in App

Add to your `App.tsx`:

```typescript
import { oneSignalService } from './src/services/OneSignalService';

useEffect(() => {
  oneSignalService.initialize();
}, []);

// After user login:
oneSignalService.registerUser(userId, userRole);
```

### 5. Backend Push Token Endpoint

Ensure your backend has the following endpoint:

```
PUT /api/v1/users/push-token
Body: {
  push_token: string,
  push_enabled: boolean,
  push_platform: 'ios' | 'android'
}
```

## Metro Config

If you encounter issues with WebSocket, update `metro.config.js`:

```javascript
module.exports = {
  resolver: {
    extraNodeModules: {
      'crypto': require.resolve('crypto-browserify'),
      'stream': require.resolve('stream-browserify'),
    },
  },
};
```

## Backend URL

Update your API base URL in `src/services/api.ts` to point to your backend:

```typescript
const API_BASE_URL = __DEV__
  ? 'http://localhost:5000/api/v1'
  : 'https://your-production-url.com/api/v1';

const WS_URL = __DEV__
  ? 'http://localhost:5000'
  : 'https://your-production-url.com';
```

## Run the App

```bash
# Android
npm run android

# iOS
npm run ios
```

## Troubleshooting

### Socket.io not connecting
- Check that backend is running on http://localhost:5000
- Check CORS settings in backend
- Try using IP address instead of localhost on Android

### Camera/Video Picker not working
- Make sure permissions are granted
- Run `pod install` after adding permissions (iOS)
- Rebuild the app after adding permissions (Android)
- Test on real device (may not work in simulator)

### OneSignal push notifications not working
- Verify App ID is correct in `OneSignalService.ts`
- Check that certificates/Firebase keys are properly configured in OneSignal dashboard
- Push notifications only work on real devices (not simulator/emulator)
- On iOS, make sure app has notification permission granted
- Check OneSignal dashboard for delivery status and errors
- Verify backend is receiving and storing push tokens correctly

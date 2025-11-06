# Frontend Setup Instructions

## Dependencies to Install

Run the following command in the root directory:

```bash
npm install socket.io-client react-native-image-picker react-native-video react-native-permissions
```

### What each package does:

1. **socket.io-client** - WebSocket client for real-time events
2. **react-native-image-picker** - Camera/video picker for recording videos
3. **react-native-video** - Video playback for video messages
4. **react-native-permissions** - Handle iOS/Android permissions

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

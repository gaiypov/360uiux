# Frontend Setup Instructions

## Dependencies to Install

Run the following command in the root directory:

```bash
npm install socket.io-client react-native-image-picker react-native-audio-recorder-player react-native-fs react-native-permissions
```

### What each package does:

1. **socket.io-client** - WebSocket client for real-time events
2. **react-native-image-picker** - Image/camera picker
3. **react-native-audio-recorder-player** - Record and play audio
4. **react-native-fs** - File system access (for audio files)
5. **react-native-permissions** - Handle iOS/Android permissions

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
<string>We need access to your photo library to send images</string>
<key>NSMicrophoneUsageDescription</key>
<string>We need access to your microphone to record audio messages</string>
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

### Camera/Image Picker not working
- Make sure permissions are granted
- Run `pod install` after adding permissions (iOS)
- Rebuild the app after adding permissions (Android)

### Audio recording not working
- Check microphone permissions
- Test on real device (may not work in simulator)

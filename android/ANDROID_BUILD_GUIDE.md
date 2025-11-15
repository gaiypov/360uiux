# 360 Rabota - Android Build Guide

Complete guide for building and deploying the Android app.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Configuration](#project-configuration)
3. [Local Development Build](#local-development-build)
4. [Release Build](#release-build)
5. [EAS Build Setup](#eas-build-setup)
6. [Google Play Deployment](#google-play-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js**: >= 18.0.0
- **Java JDK**: 17 (recommended) or 11+
- **Android Studio**: Latest version with Android SDK
- **Android SDK**: API 34 (Android 14)
- **Gradle**: 8.6+ (included via wrapper)

### Environment Setup

1. **Install Java JDK 17**:
   ```bash
   # macOS (Homebrew)
   brew install openjdk@17

   # Ubuntu/Debian
   sudo apt install openjdk-17-jdk

   # Windows (Chocolatey)
   choco install openjdk17
   ```

2. **Set JAVA_HOME**:
   ```bash
   # macOS/Linux
   export JAVA_HOME=$(/usr/libexec/java_home -v 17)  # macOS
   export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64  # Linux

   # Windows (System Environment Variables)
   JAVA_HOME=C:\Program Files\Java\jdk-17
   ```

3. **Install Android Studio**:
   - Download from https://developer.android.com/studio
   - Install Android SDK 34
   - Install Android SDK Build-Tools 34.0.0
   - Install NDK 26.1.10909125

4. **Set ANDROID_HOME**:
   ```bash
   # macOS/Linux
   export ANDROID_HOME=$HOME/Android/Sdk  # Linux
   export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools

   # Windows
   ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
   ```

---

## Project Configuration

### 1. Install Dependencies

```bash
# From project root
npm install

# Verify React Native CLI
npx react-native --version
```

### 2. Verify Android Configuration

```bash
# Check Java version
java -version  # Should be 17.x

# Check Android SDK
sdkmanager --list

# Check Gradle
cd android && ./gradlew --version
```

### 3. Generate Debug Keystore (if not exists)

```bash
cd android/app
keytool -genkey -v -keystore debug.keystore \
  -storepass android \
  -alias androiddebugkey \
  -keypass android \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -dname "CN=360 Rabota Debug, OU=Development, O=360 Rabota, L=Almaty, ST=Almaty Region, C=KZ"
```

---

## Local Development Build

### Method 1: React Native CLI (Recommended)

1. **Start Metro bundler**:
   ```bash
   npm start
   ```

2. **In a new terminal, run Android**:
   ```bash
   npm run android
   # Or
   npx react-native run-android
   ```

3. **Run on specific device**:
   ```bash
   # List devices
   adb devices

   # Run on specific device
   npx react-native run-android --deviceId=DEVICE_ID
   ```

### Method 2: Android Studio

1. Open `android/` folder in Android Studio
2. Wait for Gradle sync to complete
3. Click "Run" (green play button)
4. Select emulator or connected device

### Method 3: Direct Gradle Build

```bash
cd android

# Debug build
./gradlew assembleDebug

# Install on device
./gradlew installDebug

# Build + Install + Launch
./gradlew assembleDebug && adb install -r app/build/outputs/apk/debug/app-debug.apk
```

**Output**: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Release Build

### 1. Generate Release Keystore

```bash
cd android/app
keytool -genkey -v -keystore 360rabota-release.keystore \
  -alias 360rabota-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**CRITICAL:** Store the keystore and password securely! If lost, you cannot update the app on Google Play.

### 2. Configure Signing

Create `android/gradle.properties` (or add to existing):

```properties
MYAPP_UPLOAD_STORE_FILE=360rabota-release.keystore
MYAPP_UPLOAD_KEY_ALIAS=360rabota-release
MYAPP_UPLOAD_STORE_PASSWORD=your_secure_password
MYAPP_UPLOAD_KEY_PASSWORD=your_secure_password
```

**IMPORTANT:** Add `gradle.properties` to `.gitignore`!

### 3. Build Release APK/AAB

```bash
cd android

# Build release APK
./gradlew assembleRelease

# Build release AAB (for Google Play)
./gradlew bundleRelease
```

**Outputs**:
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

### 4. Test Release Build

```bash
# Install release APK on device
adb install -r android/app/build/outputs/apk/release/app-release.apk

# Or use bundletool for AAB testing
bundletool build-apks --bundle=app-release.aab --output=app.apks --mode=universal
bundletool install-apks --apks=app.apks
```

---

## EAS Build Setup

Expo Application Services (EAS) provides cloud-based builds and distribution.

### 1. Install EAS CLI

```bash
npm install -g eas-cli

# Login to Expo
eas login
```

### 2. Initialize EAS

```bash
# From project root
eas build:configure
```

This creates `eas.json`:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 3. Build with EAS

```bash
# Development build
eas build --platform android --profile development

# Preview build (for internal testing)
eas build --platform android --profile preview

# Production build (for Google Play)
eas build --platform android --profile production
```

### 4. Configure App Credentials

EAS can automatically generate and manage keystores:

```bash
# Setup credentials
eas credentials

# Or use existing keystore
eas credentials -p android
```

Choose:
- **Generate new keystore** (recommended for new apps)
- **Upload existing keystore** (if you have one)

### 5. Download Build

After build completes (5-15 minutes):

```bash
# Download APK/AAB
eas build:download --platform android --profile production
```

---

## Google Play Deployment

### 1. Create Google Play Console Account

1. Go to https://play.google.com/console
2. Pay $25 one-time registration fee
3. Create new app: "360 Rabota"

### 2. Prepare Store Listing

Required assets:

- **App Icon**: 512x512 PNG (already in `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` - upscale to 512x512)
- **Feature Graphic**: 1024x500 PNG
- **Screenshots**: Minimum 2 per device type (phone, tablet)
  - Phone: 16:9 ratio (e.g., 1080x1920)
  - Tablet: 1536x2048 or similar
- **Privacy Policy URL**: Required
- **App Description**: Short (80 chars) and full (4000 chars)

### 3. Upload AAB

1. **Go to**: Production → Releases
2. **Create new release**
3. **Upload**: `app-release.aab`
4. **Fill release notes**
5. **Save and review**

### 4. Complete All Sections

- ✅ App content (age rating, privacy policy)
- ✅ Store listing (descriptions, screenshots)
- ✅ Content rating questionnaire
- ✅ Target audience
- ✅ News apps declaration (if applicable)
- ✅ Pricing & distribution

### 5. Submit for Review

- Click "Submit for review"
- Review takes 1-7 days
- Check for emails from Google Play team

### 6. Using EAS Submit

Alternatively, submit directly via EAS:

```bash
# Submit to Google Play
eas submit --platform android --profile production

# Follow prompts to upload service account key
```

---

## Troubleshooting

### Common Issues

#### 1. `JAVA_HOME` not set

```bash
# Verify
echo $JAVA_HOME

# Fix (Linux/macOS)
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

#### 2. Android SDK not found

```bash
# Verify
echo $ANDROID_HOME

# Fix
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### 3. Gradle build fails

```bash
# Clean build
cd android
./gradlew clean

# Rebuild
./gradlew assembleDebug --stacktrace
```

#### 4. Metro bundler issues

```bash
# Clear cache
npm start -- --reset-cache

# Or
npx react-native start --reset-cache
```

#### 5. App crashes on launch

```bash
# View logs
adb logcat | grep ReactNative
adb logcat | grep 360Rabota
```

#### 6. Native module linking issues

```bash
# Clear and reinstall
cd android && ./gradlew clean
cd ..
rm -rf node_modules
npm install
cd android && ./gradlew assembleDebug
```

---

## Build Optimization

### Reduce APK Size

1. **Enable ProGuard** (already enabled in release):
   ```gradle
   // android/app/build.gradle
   buildTypes {
       release {
           minifyEnabled true
           shrinkResources true
       }
   }
   ```

2. **Split APKs by architecture**:
   ```gradle
   splits {
       abi {
           enable true
           reset()
           include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
           universalApk false
       }
   }
   ```

3. **Use AAB instead of APK** (Google Play automatically generates optimized APKs)

---

## Performance Profiling

```bash
# Profile app
./gradlew assembleRelease --profile

# Analyze APK
bundletool dump manifest --bundle=app-release.aab
bundletool get-size total --bundle=app-release.aab
```

---

## Next Steps

1. ✅ Complete local development build
2. ✅ Test on physical Android device
3. ✅ Generate release keystore
4. ✅ Build release AAB
5. ✅ Create Google Play Console account
6. ✅ Prepare store assets (icon, screenshots, descriptions)
7. ✅ Submit for review
8. ✅ Monitor release status

---

## Support

- **React Native Docs**: https://reactnative.dev/docs/environment-setup
- **Android Developer Guide**: https://developer.android.com/studio/build
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **Google Play Console**: https://support.google.com/googleplay/android-developer

---

**Project**: 360 Rabota
**Package**: com.r360rabotaapp
**React Native**: 0.74.5
**Target SDK**: 34 (Android 14)
**Min SDK**: 24 (Android 7.0)

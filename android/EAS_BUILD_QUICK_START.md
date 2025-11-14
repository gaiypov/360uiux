# EAS Build Quick Start for 360 Rabota Android

Ultra-fast guide to build Android app using Expo Application Services (EAS).

## ⚡ Quick Setup (5 minutes)

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### Step 2: Initialize EAS in Project

```bash
cd /path/to/360uiux
eas build:configure
```

This creates `eas.json` configuration file.

### Step 3: Build Android APK (Development)

```bash
# Development build (APK for testing)
eas build --platform android --profile development
```

**Build time**: ~10-15 minutes (cloud build)

### Step 4: Build Android AAB (Production)

```bash
# Production build (AAB for Google Play)
eas build --platform android --profile production
```

---

## 📥 Download Build

```bash
# Download latest build
eas build:download --platform android

# Or visit: https://expo.dev/accounts/YOUR_ACCOUNT/projects/360uiux/builds
```

---

## 🔑 Keystore Management

EAS automatically generates and manages keystores for you.

### View Credentials

```bash
eas credentials -p android
```

### Download Keystore (for backup)

```bash
eas credentials -p android
# Choose: "Download credentials"
```

**IMPORTANT**: Backup your keystore in a secure location!

---

## 📱 Install Build on Device

### Method 1: Direct Install URL

EAS provides a direct install URL after build completes:

```
https://expo.dev/artifacts/eas/[BUILD_ID].apk
```

Open this URL on your Android device to install.

### Method 2: Download and ADB Install

```bash
# Download APK
eas build:download --platform android --profile development

# Install on connected device
adb install -r app-*.apk
```

---

## 🚀 Submit to Google Play

### Step 1: Build Production AAB

```bash
eas build --platform android --profile production
```

### Step 2: Submit via EAS (Recommended)

```bash
eas submit --platform android --profile production
```

You'll need:
- Google Play Console service account key (JSON)
- Instructions: https://docs.expo.dev/submit/android/

### Step 3: Manual Upload

1. Download AAB: `eas build:download`
2. Go to Google Play Console
3. Upload to Production → Create Release

---

## 📋 EAS Configuration (eas.json)

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
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    },
    "production": {
      "android": {
        "buildType": "aab",
        "gradleCommand": ":app:bundleRelease"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "production"
      }
    }
  }
}
```

---

## 🔧 Build Profiles Explained

| Profile | Build Type | Use Case |
|---------|------------|----------|
| **development** | APK | Local testing, debugging |
| **preview** | APK | Internal testing, QA |
| **production** | AAB | Google Play release |

---

## 🐛 Troubleshooting

### Build Failed: Gradle Error

Check build logs:
```bash
eas build:list
# Click on failed build to view logs
```

Common fixes:
- Verify `android/build.gradle` syntax
- Check native dependencies are compatible
- Review ProGuard rules

### Build Succeeded but App Crashes

View device logs:
```bash
adb logcat | grep ReactNative
```

Common issues:
- Missing permissions in `AndroidManifest.xml`
- Native module configuration
- ProGuard stripping required classes

### Cannot Submit to Google Play

Requirements:
- App must be reviewed and approved first time manually
- Service account needs "Release Manager" role
- Enable Google Play Developer API

---

## 📊 Monitor Builds

### Web Dashboard

Visit: https://expo.dev/accounts/YOUR_ACCOUNT/projects/360uiux/builds

### CLI

```bash
# List all builds
eas build:list --platform android

# View specific build
eas build:view BUILD_ID

# Cancel running build
eas build:cancel
```

---

## ✅ Recommended Workflow

### For Development

```bash
# Build once per week or when testing native changes
eas build --platform android --profile development

# Most development happens with local builds
npm run android
```

### For Testing (QA)

```bash
# Build when ready for QA team
eas build --platform android --profile preview

# Share install URL with QA team
```

### For Production

```bash
# Build for Google Play release
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android --profile production
```

---

## 💰 EAS Pricing

- **Free Tier**:
  - Limited builds per month
  - Slower queue priority
  - Suitable for small projects

- **Paid Tier**:
  - Unlimited builds
  - Priority queue
  - Faster build times
  - Required for serious development

Check: https://expo.dev/pricing

---

## 🎯 Next Steps

1. ✅ Run `eas build:configure`
2. ✅ Build development APK: `eas build --platform android --profile development`
3. ✅ Test on device
4. ✅ Fix any issues
5. ✅ Build production AAB: `eas build --platform android --profile production`
6. ✅ Submit to Google Play

---

## 📚 Additional Resources

- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **EAS Submit Docs**: https://docs.expo.dev/submit/introduction/
- **Android Credentials**: https://docs.expo.dev/app-signing/android-credentials/
- **Troubleshooting**: https://docs.expo.dev/build-reference/troubleshooting/

---

**Ready to build?** Run `eas build --platform android` now! 🚀

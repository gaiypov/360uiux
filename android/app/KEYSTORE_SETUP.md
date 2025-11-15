# Android Keystore Setup for 360 Rabota

## Debug Keystore

For development builds, you need a debug keystore. Run this command in the `android/app/` directory:

```bash
keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000
```

When prompted for information:
- First and last name: `360 Rabota Debug`
- Organizational unit: `Development`
- Organization: `360 Rabota`
- City: `Almaty`
- State: `Almaty Region`
- Country code: `KZ`

This will create `android/app/debug.keystore` which is required for debug builds.

## Release Keystore (for Google Play)

For production releases, create a separate release keystore:

```bash
keytool -genkey -v -keystore 360rabota-release.keystore -alias 360rabota-release -keyalg RSA -keysize 2048 -validity 10000
```

**IMPORTANT:**
- Use a strong password
- Store the keystore file securely (NOT in Git)
- Keep the password in a secure location (password manager)
- If you lose this keystore, you cannot update your app on Google Play

## Configuring Release Keystore

1. Create `android/gradle.properties` (or add to existing):

```properties
MYAPP_UPLOAD_STORE_FILE=360rabota-release.keystore
MYAPP_UPLOAD_KEY_ALIAS=360rabota-release
MYAPP_UPLOAD_STORE_PASSWORD=your_keystore_password
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
```

2. Add to `.gitignore`:
```
# Keystores
*.keystore
*.jks
gradle.properties
```

## EAS Build Configuration

For Expo Application Services (EAS), you don't need to manage keystores manually. EAS will generate and manage them for you.

See `ANDROID_BUILD_GUIDE.md` for EAS Build instructions.

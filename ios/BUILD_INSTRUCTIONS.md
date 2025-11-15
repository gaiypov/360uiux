# 🏗️ iOS Build Instructions for 360 Rabota

## Prerequisites

### Required Software
- **Xcode**: 15.0+ (from App Store)
- **CocoaPods**: Latest version
- **Node.js**: 18+
- **Ruby**: 2.7+ (for CocoaPods)
- **Xcode Command Line Tools**

### Installation

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install CocoaPods
sudo gem install cocoapods

# Verify installations
xcode-select -p
pod --version
node --version
```

## Initial Setup

### 1. Install Node Dependencies
```bash
cd /path/to/360uiux
npm install
```

### 2. Install iOS Dependencies
```bash
cd ios
pod install
```

Expected output:
```
Analyzing dependencies
Downloading dependencies
Installing ...
Generating Pods project
```

### 3. Generate App Icons (REQUIRED)
```bash
# See ICON_GENERATION_GUIDE.md for detailed instructions
# Quick method using ImageMagick:
cd Images.xcassets/AppIcon.appiconset

# Generate base icon
convert -size 1024x1024 xc:white \
  -gravity center \
  -pointsize 250 \
  -font Helvetica-Bold \
  -fill black \
  -annotate +0+0 "360" \
  Icon-1024.png

# Generate all sizes (see guide for full commands)
```

## Building the Project

### Option 1: Using React Native CLI (Recommended for Development)
```bash
# From project root
npm run ios

# Or specify device
npm run ios -- --simulator="iPhone 15 Pro"

# Or for physical device
npm run ios -- --device "Your iPhone Name"
```

### Option 2: Using Xcode
```bash
# Open workspace
cd ios
open 360Rabota.xcworkspace

# In Xcode:
# 1. Select scheme: 360Rabota
# 2. Select target device/simulator
# 3. Press Cmd+R to build and run
```

### Option 3: Build for Release
```bash
# From project root
cd ios

# Clean build
xcodebuild clean -workspace 360Rabota.xcworkspace -scheme 360Rabota

# Build for device
xcodebuild archive \
  -workspace 360Rabota.xcworkspace \
  -scheme 360Rabota \
  -configuration Release \
  -archivePath ./build/360Rabota.xcarchive

# Export IPA
xcodebuild -exportArchive \
  -archivePath ./build/360Rabota.xcarchive \
  -exportPath ./build \
  -exportOptionsPlist ExportOptions.plist
```

## Common Issues & Solutions

### Issue 1: "No such module 'React'"
**Solution:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
```

### Issue 2: "Command PhaseScriptExecution failed"
**Solution:**
```bash
# Clear React Native cache
npx react-native start --reset-cache

# Clean iOS build
cd ios
xcodebuild clean -workspace 360Rabota.xcworkspace -scheme 360Rabota
```

### Issue 3: "Unable to boot device"
**Solution:**
```bash
# Reset simulator
xcrun simctl erase all

# Or specific simulator
xcrun simctl erase "iPhone 15 Pro"
```

### Issue 4: "Code signing error"
**Solution:**
1. Open Xcode
2. Select project > Signing & Capabilities
3. Select your Team
4. Enable "Automatically manage signing"

### Issue 5: "AppDelegate.mm: No such file or directory"
**Solution:**
Ensure file structure is correct:
```
ios/
  360Rabota/
    AppDelegate.h
    AppDelegate.mm
    Info.plist
    main.m
    LaunchScreen.storyboard
    Images.xcassets/
      AppIcon.appiconset/
```

## Verification Checklist

Before submitting to App Store, verify:

- [ ] App launches without crashes
- [ ] Launch screen displays correctly
- [ ] App icon appears in all sizes
- [ ] Camera permission works
- [ ] Microphone permission works
- [ ] Photo library permission works
- [ ] Video playback works
- [ ] Navigation works
- [ ] Dark mode support (if applicable)
- [ ] All orientations work (if supported)
- [ ] No console warnings
- [ ] Release build works
- [ ] TestFlight build works

## Module Name Verification

The app must use `360RabotaApp` as the module name. Verify:

### In AppDelegate.mm:
```objc
self.moduleName = @"360RabotaApp";
```

### In index.js (project root):
```javascript
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
```

### In app.json:
```json
{
  "name": "360RabotaApp",
  "displayName": "360 Rabota"
}
```

## Running on Physical Device

### 1. Connect iPhone via USB
### 2. Trust computer on iPhone
### 3. Select device in Xcode
### 4. Configure signing:
   - Open project settings
   - Select 360Rabota target
   - Signing & Capabilities tab
   - Select your Team
   - Change Bundle Identifier if needed (com.yourcompany.360rabota)
### 5. Build and Run (Cmd+R)

## Troubleshooting Build Errors

### Full Clean Build
```bash
# 1. Clean npm
rm -rf node_modules package-lock.json
npm install

# 2. Clean iOS
cd ios
rm -rf Pods Podfile.lock build
pod deintegrate
pod install

# 3. Clean React Native
cd ..
npx react-native start --reset-cache

# 4. Rebuild
npm run ios
```

### Check Logs
```bash
# Metro bundler logs
npx react-native start

# iOS device logs
xcrun simctl spawn booted log stream --predicate 'process == "360Rabota"' --level=debug

# Or use Console.app (Applications > Utilities > Console)
```

## Performance Optimization

### Debug Build
- Slower performance
- Hot reloading enabled
- Developer menu accessible (Cmd+D)

### Release Build
- Optimized performance
- No developer tools
- Minified JavaScript
- Production-ready

## Next Steps

After successful build:
1. Test all features thoroughly
2. Fix any runtime errors
3. Optimize performance
4. Prepare for TestFlight
5. Submit to App Store

---

**Need Help?**
- Check Xcode logs: Product > Scheme > Edit Scheme > Run > Arguments > Environment Variables
- Enable debugging: Set `OS_ACTIVITY_MODE=disable` to reduce noise
- React Native docs: https://reactnative.dev/docs/running-on-device
- iOS docs: https://developer.apple.com/documentation/

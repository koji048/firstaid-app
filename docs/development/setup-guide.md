# Development Environment Setup Guide

## System Requirements

### For iOS Development

- **Operating System**: macOS 10.15 (Catalina) or later
- **Xcode**: Version 14.0 or later
  - Download from Mac App Store or [Apple Developer site](https://developer.apple.com/xcode/)
  - Includes iOS Simulator
- **CocoaPods**: Version 1.11.0 or later
  ```bash
  sudo gem install cocoapods
  ```
- **Hardware Requirements**:
  - Mac with Apple Silicon (M1/M2) or Intel processor
  - Minimum 8GB RAM (16GB recommended)
  - At least 20GB free disk space

### For Android Development

- **Operating System**: macOS, Windows 10/11, or Linux
- **Android Studio**: Latest stable version
  - Download from [Android Developer site](https://developer.android.com/studio)
- **Java Development Kit (JDK)**: Version 11
  - Bundled with Android Studio or install separately
- **Android SDK**: API Level 23 (Android 6.0) or higher
  - Install via Android Studio SDK Manager
- **Hardware Requirements**:
  - Minimum 8GB RAM (16GB recommended)
  - At least 10GB free disk space
  - Intel HAXM or AMD Hypervisor for emulator acceleration

### Common Requirements

- **Node.js**: Version 18.0.0 or later
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`
- **npm**: Version 9.0.0 or later (comes with Node.js)
  - Verify installation: `npm --version`
- **Git**: Version 2.0.0 or later
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify installation: `git --version`
- **Watchman** (optional but recommended for macOS/Linux):
  ```bash
  brew install watchman
  ```

## iOS Development Setup

### 1. Install Xcode

1. Open Mac App Store
2. Search for "Xcode"
3. Click "Install" (this may take some time as it's a large download)
4. Once installed, open Xcode and agree to the license agreement
5. Install additional components when prompted

### 2. Configure Xcode Command Line Tools

```bash
xcode-select --install
```

### 3. Install CocoaPods

```bash
sudo gem install cocoapods
pod setup
```

### 4. Install iOS Dependencies

```bash
cd ios
pod install
cd ..
```

### 5. Configure iOS Simulator

1. Open Xcode
2. Navigate to Xcode → Preferences → Components
3. Download desired iOS Simulator versions
4. Recommended: iOS 16.0 and 17.0 simulators

## Android Development Setup

### 1. Install Android Studio

1. Download Android Studio from the official website
2. Run the installer and follow the setup wizard
3. Choose "Standard" installation type
4. Accept licenses and wait for SDK components to download

### 2. Configure Android SDK

1. Open Android Studio
2. Go to Settings/Preferences → Appearance & Behavior → System Settings → Android SDK
3. SDK Platforms tab:
   - Check Android 13.0 (API 33)
   - Check Android 12.0 (API 31)
   - Check Android 8.0 (API 26) - minimum supported
4. SDK Tools tab:
   - Android SDK Build-Tools
   - Android Emulator
   - Android SDK Platform-Tools
   - Intel x86 Emulator Accelerator (HAXM installer) - for Intel Macs
5. Click "Apply" to install selected components

### 3. Configure Environment Variables

#### macOS/Linux

Add to `~/.bash_profile` or `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Reload configuration:

```bash
source ~/.bash_profile  # or source ~/.zshrc
```

#### Windows

1. Open System Properties → Advanced → Environment Variables
2. Add new system variables:
   - `ANDROID_HOME`: `C:\Users\[Username]\AppData\Local\Android\Sdk`
3. Add to PATH:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\emulator`
   - `%ANDROID_HOME%\tools`
   - `%ANDROID_HOME%\tools\bin`

### 4. Create Android Virtual Device (AVD)

1. Open Android Studio
2. Click "AVD Manager" icon or Tools → AVD Manager
3. Click "Create Virtual Device"
4. Select a device (e.g., Pixel 6)
5. Select system image (API 33 recommended)
6. Configure AVD settings and finish

## Development Device Testing

### iOS Physical Device Setup

1. Connect iPhone/iPad via USB
2. Trust the computer on your device when prompted
3. In Xcode:
   - Select your device from the device list
   - Configure signing (requires Apple Developer account)
   - Enable Developer Mode on iOS 16+ devices

### Android Physical Device Setup

1. Enable Developer Options:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings → Developer Options → USB Debugging
3. Connect device via USB
4. Accept debugging permission on device
5. Verify connection:
   ```bash
   adb devices
   ```

## Verify Installation

### Check React Native Environment

```bash
npx react-native doctor
```

This command will check for common issues and missing dependencies.

### Run the Project

#### iOS

```bash
npx react-native run-ios
```

Or specify a simulator:

```bash
npx react-native run-ios --simulator="iPhone 14"
```

#### Android

Start emulator first, then:

```bash
npx react-native run-android
```

Or with a specific device:

```bash
npx react-native run-android --deviceId=emulator-5554
```

## Troubleshooting

### Common iOS Issues

- **Pod install fails**: Try `cd ios && pod deintegrate && pod install`
- **Build fails**: Clean build folder in Xcode (Cmd+Shift+K)
- **Simulator not found**: Reset simulators in Xcode → Window → Devices and Simulators

### Common Android Issues

- **JAVA_HOME not set**: Ensure JDK 11 is installed and JAVA_HOME is set
- **Gradle build fails**: Try `cd android && ./gradlew clean`
- **Emulator won't start**: Check virtualization is enabled in BIOS
- **Metro bundler port conflict**: Kill process on port 8081 or use `--port=8082`

## Next Steps

After setting up your development environment:

1. Install project dependencies: `npm install`
2. Install iOS pods: `cd ios && pod install`
3. Start Metro bundler: `npm start`
4. Run on your preferred platform: `npm run ios` or `npm run android`

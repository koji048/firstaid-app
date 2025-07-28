# 🚨 First Aid Room - Emergency Services Demo Guide

## Quick Access to Error Logs from Xcode:

### Method 1: Xcode Console
1. Open **Xcode** → Window → Devices and Simulators
2. Select your **iPhone 16 Pro** simulator  
3. Click **Open Console** button
4. Run your app - errors will appear here
5. **Right-click any error → Copy** to clipboard

### Method 2: Xcode Debug Navigator  
1. In Xcode, click the **⚠️ triangle icon** in left sidebar
2. Shows all build errors and runtime issues
3. **Right-click error → Copy** to get full details

### Method 3: Terminal Logs
```bash
# Get real-time simulator logs
xcrun simctl spawn booted log stream --predicate 'processImagePath endswith "FirstAidRoom"'

# Or use React Native logs
npx react-native log-ios
```

---

## 🎯 Emergency Services Features Demo

### Core Features to Test:

#### 1. **Emergency Mode Activation**
- **Location**: Main tab navigation → Emergency Services
- **Features**:
  - Toggle emergency mode ON/OFF
  - Red emergency status banner appears when active
  - One-tap 911 calling becomes available

#### 2. **Shake Detection** 
- **Test**: Use simulator menu → Device → Shake Gesture
- **Expected**: Alert asking to activate emergency mode
- **Result**: Emergency banner appears with pulse animation

#### 3. **Long Press Activation**
- **Test**: Long-press the emergency toggle (2+ seconds)
- **Expected**: Haptic feedback + confirmation dialog
- **Result**: Emergency mode activates with visual feedback

#### 4. **Emergency Status Banner**
- **When Active**: Shows at bottom of screen
- **Features**:
  - "Emergency Mode Active" with pulsing red background
  - Status indicators: "One-tap 911 ready", "Location available", "Contacts ready"
  - Tap banner for more emergency options

#### 5. **Emergency Services Button**
- **Appearance**: Large red button when emergency mode is active
- **Function**: Simulates 911 calling (safe for demo)
- **Accessibility**: 56px touch target, screen reader compatible

#### 6. **Location Services**
- **Test**: First time use triggers permission dialog
- **Flow**: Location permission → GPS detection → Manual entry fallback
- **Result**: Location status shown in emergency banner

#### 7. **Nearby Hospitals**
- **Location**: Emergency Services → Hospitals section
- **Features**: 
  - Search nearby hospitals
  - Call hospital directly
  - Get directions
  - Distance and rating display

#### 8. **Accessibility Features**
- **Screen Reader**: Turn on VoiceOver to test announcements
- **Voice Commands**: Simulated support for "Call emergency"
- **High Contrast**: Available in emergency mode
- **Large Text**: Automatic scaling for accessibility

---

## 🔍 **If You See Errors:**

### Common Issues & Fixes:

1. **Module Resolution Errors**:
   ```bash
   cd ios && pod install
   npm start --reset-cache
   ```

2. **Metro Bundler Issues**:
   ```bash
   pkill -f "node.*metro" 
   npm start
   ```

3. **Build Errors**:
   ```bash
   cd ios && xcodebuild clean
   npm run ios
   ```

4. **Missing Dependencies**:
   ```bash
   npm install
   cd ios && pod install
   ```

---

## 📱 **Expected App Structure:**

```
First Aid Room App
├── 🏠 Home Tab
├── 📚 Guides Tab  
├── 🚨 Emergency Tab     ← Main demo area
├── 🏥 Hospitals Tab     ← Hospital search
└── ⚙️  Settings Tab
```

---

## 🎬 **Demo Script:**

1. **Launch app** → Navigate to Emergency tab
2. **Show normal state** → Emergency toggle OFF
3. **Activate emergency mode** → Toggle ON or shake device
4. **Point out red banner** → Emergency status indicators
5. **Demonstrate 911 button** → Large red emergency button
6. **Show hospitals** → Nearby facilities with calling
7. **Test accessibility** → VoiceOver announcements
8. **Deactivate** → Return to normal mode

---

**Need help?** Share the specific error message you're seeing and I can provide targeted assistance!
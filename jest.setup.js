// Remove extend-expect as it's no longer needed in newer versions
// import '@testing-library/react-native/extend-expect';

// Mock React Native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setInternetCredentials: jest.fn(() => Promise.resolve(true)),
  getInternetCredentials: jest.fn(() => Promise.resolve(false)),
  resetInternetCredentials: jest.fn(() => Promise.resolve(true)),
  ACCESSIBLE: {
    WHEN_UNLOCKED: 'WHEN_UNLOCKED',
  },
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(),
    Directions: {},
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-screens
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  createNativeStackNavigator: jest.fn(),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock react-native-elements
jest.mock('react-native-elements', () => ({
  Icon: 'Icon',
  Header: 'Header',
  ListItem: 'ListItem',
  Avatar: 'Avatar',
  Badge: 'Badge',
  Button: 'Button',
  Card: 'Card',
  CheckBox: 'CheckBox',
  Divider: 'Divider',
  Input: 'Input',
  SearchBar: 'SearchBar',
  Text: 'Text',
  ThemeProvider: 'ThemeProvider',
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#4CD964',
    warning: '#FF9500',
    error: '#FF3B30',
  },
}));

// Mock react-native-haptic-feedback
jest.mock(
  'react-native-haptic-feedback',
  () => ({
    trigger: jest.fn(),
    HapticFeedbackTypes: {
      selection: 'selection',
      impactLight: 'impactLight',
      impactMedium: 'impactMedium',
      impactHeavy: 'impactHeavy',
      notificationSuccess: 'notificationSuccess',
      notificationWarning: 'notificationWarning',
      notificationError: 'notificationError',
    },
  }),
  { virtual: true },
);

// Mock @react-native-voice/voice
jest.mock(
  '@react-native-voice/voice',
  () => ({
    start: jest.fn(),
    stop: jest.fn(),
    destroy: jest.fn().mockResolvedValue(undefined),
    removeAllListeners: jest.fn(),
    onSpeechStart: jest.fn(),
    onSpeechEnd: jest.fn(),
    onSpeechError: jest.fn(),
    onSpeechResults: jest.fn(),
  }),
  { virtual: true },
);

// Mock shake detection service
jest.mock('./src/services/shakeDetection', () => ({
  ShakeDetectionService: {
    addListener: jest.fn(() => jest.fn()),
    removeAllListeners: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    isActive: jest.fn(() => false),
    simulateShake: jest.fn(),
  },
}));

// Mock @react-native-community/geolocation
jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  requestAuthorization: jest.fn(),
}));

// Mock @sentry/react-native
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  configureScope: jest.fn(),
  withScope: jest.fn(),
  setUser: jest.fn(),
  setTag: jest.fn(),
  setContext: jest.fn(),
}));

// Mock react-native-share
jest.mock(
  'react-native-share',
  () => ({
    open: jest.fn(),
    share: jest.fn(),
  }),
  { virtual: true },
);

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Setup fetch mock
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  }),
);

// Mock console methods to avoid cluttering test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Add custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

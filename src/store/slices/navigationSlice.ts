import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface NavigationState {
  currentScreen: string;
  currentTab: string;
  navigationHistory: string[];
  isNavigating: boolean;
  lastNavigationTime: number;
  emergencyNavigationCount: number;
  screenTransitionTimes: Record<string, number>;
}

const initialState: NavigationState = {
  currentScreen: 'Home',
  currentTab: 'HomeStack',
  navigationHistory: ['Home'],
  isNavigating: false,
  lastNavigationTime: 0,
  emergencyNavigationCount: 0,
  screenTransitionTimes: {},
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setCurrentScreen: (state, action: PayloadAction<string>) => {
      state.currentScreen = action.payload;
      state.lastNavigationTime = Date.now();

      // Add to history (keep last 50 entries)
      state.navigationHistory.push(action.payload);
      if (state.navigationHistory.length > 50) {
        state.navigationHistory.shift();
      }
    },

    setCurrentTab: (state, action: PayloadAction<string>) => {
      state.currentTab = action.payload;
      state.lastNavigationTime = Date.now();
    },

    setNavigating: (state, action: PayloadAction<boolean>) => {
      state.isNavigating = action.payload;
    },

    recordEmergencyNavigation: (state) => {
      state.emergencyNavigationCount += 1;
      state.lastNavigationTime = Date.now();
    },

    recordScreenTransitionTime: (
      state,
      action: PayloadAction<{ screen: string; duration: number }>,
    ) => {
      state.screenTransitionTimes[action.payload.screen] = action.payload.duration;
    },

    clearNavigationHistory: (state) => {
      state.navigationHistory = [state.currentScreen];
    },

    resetNavigationState: (state) => {
      return {
        ...initialState,
        currentScreen: state.currentScreen,
        currentTab: state.currentTab,
      };
    },
  },
});

export const {
  setCurrentScreen,
  setCurrentTab,
  setNavigating,
  recordEmergencyNavigation,
  recordScreenTransitionTime,
  clearNavigationHistory,
  resetNavigationState,
} = navigationSlice.actions;

// Selectors
export const selectCurrentScreen = (state: { navigation: NavigationState }) =>
  state.navigation.currentScreen;

export const selectCurrentTab = (state: { navigation: NavigationState }) =>
  state.navigation.currentTab;

export const selectNavigationHistory = (state: { navigation: NavigationState }) =>
  state.navigation.navigationHistory;

export const selectIsNavigating = (state: { navigation: NavigationState }) =>
  state.navigation.isNavigating;

export const selectEmergencyNavigationCount = (state: { navigation: NavigationState }) =>
  state.navigation.emergencyNavigationCount;

export const selectAverageTransitionTime = (state: { navigation: NavigationState }) => {
  const times = Object.values(state.navigation.screenTransitionTimes);
  if (times.length === 0) {
    return 0;
  }
  return times.reduce((sum, time) => sum + time, 0) / times.length;
};

export const selectSlowScreens = (state: { navigation: NavigationState }, threshold = 300) =>
  Object.entries(state.navigation.screenTransitionTimes)
    .filter(([, duration]) => duration > threshold)
    .map(([screen]) => screen);

export default navigationSlice.reducer;
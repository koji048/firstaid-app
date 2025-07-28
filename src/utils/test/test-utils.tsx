import React, { ReactElement } from 'react';
import { RenderOptions, render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@styles/ThemeProvider';
import { configureStore } from '@reduxjs/toolkit';
import { RootState, store as defaultStore } from '@store/store';
import authReducer from '@store/slices/authSlice';
import guidesReducer from '@store/slices/guidesSlice';
import emergencyReducer from '@store/slices/emergencySlice';
import medicalReducer from '@store/slices/medicalSlice';
import offlineReducer from '@store/slices/offlineSlice';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: typeof defaultStore;
}

const AllTheProviders = ({
  children,
  store,
}: {
  children: React.ReactNode;
  store: typeof defaultStore;
}) => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <NavigationContainer>{children}</NavigationContainer>
      </ThemeProvider>
    </Provider>
  );
};

const customRender = (
  ui: ReactElement,
  { preloadedState, store = defaultStore, ...renderOptions }: CustomRenderOptions = {},
) => {
  if (preloadedState) {
    store = configureStore({
      reducer: {
        auth: authReducer,
        guides: guidesReducer,
        emergency: emergencyReducer,
        medical: medicalReducer,
        offline: offlineReducer,
      },
      preloadedState,
    });
  }

  return render(ui, {
    wrapper: ({ children }) => <AllTheProviders store={store}>{children}</AllTheProviders>,
    ...renderOptions,
  });
};

// Mock data generators
export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  phone: '+1234567890',
  hasCompletedOnboarding: true,
  ...overrides,
});

export const createMockEmergencyContact = (overrides = {}) => ({
  id: '1',
  userId: '1',
  name: 'John Doe',
  phone: '+1234567890',
  relationship: 'spouse',
  category: 'family' as const,
  isPrimary: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockGuide = (overrides = {}) => ({
  id: '1',
  title: 'CPR Guide',
  category: 'emergency',
  severity: 'critical' as const,
  summary: 'Learn how to perform CPR',
  content: {
    steps: [
      {
        order: 1,
        title: 'Check responsiveness',
        description: 'Tap the person and shout',
      },
    ],
  },
  searchTags: ['cpr', 'emergency', 'cardiac'],
  version: 1,
  isOfflineAvailable: true,
  viewCount: 100,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockMedicalProfile = (overrides = {}) => ({
  id: '1',
  userId: '1',
  bloodType: 'O+',
  emergencyNotes: 'No known allergies',
  physicianName: 'Dr. Smith',
  physicianPhone: '+1234567890',
  insuranceProvider: 'Health Insurance Co',
  insurancePolicyNumber: 'POL123456',
  allergies: [],
  medications: [],
  conditions: [],
  lastUpdated: new Date().toISOString(),
  ...overrides,
});

// Re-export everything
export * from '@testing-library/react-native';
export { customRender as render };

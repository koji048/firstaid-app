# Frontend Architecture

## Component Architecture

### Component Organization

```text
apps/mobile/src/
├── components/
│   ├── common/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.styles.ts
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Card/
│   │   ├── LoadingSpinner/
│   │   └── ErrorBoundary/
│   ├── emergency/
│   │   ├── EmergencyButton/
│   │   ├── ContactQuickDial/
│   │   └── LocationShare/
│   ├── guides/
│   │   ├── GuideCard/
│   │   ├── GuideViewer/
│   │   ├── StepNavigator/
│   │   └── SearchBar/
│   └── medical/
│       ├── MedicalProfileForm/
│       ├── AllergyList/
│       └── MedicationList/
├── screens/
│   ├── HomeScreen/
│   ├── EmergencyScreen/
│   ├── GuidesScreen/
│   ├── ProfileScreen/
│   └── SettingsScreen/
├── navigation/
│   ├── RootNavigator.tsx
│   ├── TabNavigator.tsx
│   └── AuthNavigator.tsx
└── hooks/
    ├── useEmergencyMode.ts
    ├── useOfflineSync.ts
    └── useLocation.ts
```

### Component Template

```typescript
import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { styles } from './ComponentName.styles';

interface ComponentNameProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
}

export const ComponentName = memo<ComponentNameProps>(
  ({ title, onPress, disabled = false, testID = 'component-name' }) => {
    const { colors } = useTheme();

    return (
      <TouchableOpacity
        style={[styles.container, disabled && styles.disabled]}
        onPress={onPress}
        disabled={disabled}
        testID={testID}
      >
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      </TouchableOpacity>
    );
  },
);

ComponentName.displayName = 'ComponentName';
```

## State Management Architecture

### State Structure

```typescript
// store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import guidesReducer from './slices/guidesSlice';
import emergencyReducer from './slices/emergencySlice';
import medicalReducer from './slices/medicalSlice';
import offlineReducer from './slices/offlineSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    guides: guidesReducer,
    emergency: emergencyReducer,
    medical: medicalReducer,
    offline: offlineReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// State shape
interface AppState {
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    tokens: AuthTokens | null;
  };
  guides: {
    guides: FirstAidGuide[];
    currentGuide: FirstAidGuide | null;
    bookmarks: string[];
    downloadedGuides: string[];
  };
  emergency: {
    contacts: EmergencyContact[];
    primaryContact: EmergencyContact | null;
    isEmergencyMode: boolean;
    nearbyHospitals: Hospital[];
  };
  medical: {
    profile: MedicalProfile | null;
    isLoading: boolean;
  };
  offline: {
    syncQueue: SyncItem[];
    lastSyncTime: string | null;
    isOnline: boolean;
  };
}
```

### State Management Patterns

- Use Redux Toolkit slices for feature-based organization
- Implement RTK Query for API data fetching with caching
- Use normalized state shape for entities (guides, contacts)
- Persist critical state to AsyncStorage (auth, emergency contacts)
- Implement optimistic updates for offline actions
- Use selectors for derived state computation

## Routing Architecture

### Route Organization

```text
Navigation Structure:
├── RootNavigator (Stack)
│   ├── AuthNavigator (Stack) - Not authenticated
│   │   ├── WelcomeScreen
│   │   ├── LoginScreen
│   │   ├── RegisterScreen
│   │   └── ForgotPasswordScreen
│   └── MainNavigator (Tab) - Authenticated
│       ├── HomeStack
│       │   ├── HomeScreen
│       │   └── EmergencyModeScreen
│       ├── GuidesStack
│       │   ├── GuidesListScreen
│       │   ├── GuideDetailScreen
│       │   └── GuideSearchScreen
│       ├── MedicalStack
│       │   ├── MedicalProfileScreen
│       │   └── MedicalEditScreen
│       └── SettingsStack
│           ├── SettingsScreen
│           ├── ProfileScreen
│           └── AboutScreen
```

### Protected Route Pattern

```typescript
// navigation/ProtectedRoute.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from '@react-navigation/native';
import { RootState } from '../store/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const hasCompletedOnboarding = useSelector(
    (state: RootState) => state.auth.user?.hasCompletedOnboarding,
  );

  if (!isAuthenticated) {
    return <Navigate to="Login" />;
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to="Onboarding" />;
  }

  return <>{children}</>;
};

// Usage in navigator
<Stack.Screen name="Medical" component={ProtectedRoute}>
  <MedicalNavigator />
</Stack.Screen>;
```

## Frontend Services Layer

### API Client Setup

```typescript
// services/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { store } from '../../store/store';
import { addToSyncQueue } from '../../store/slices/offlineSlice';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.firstaidroom.app/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for auth
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Handle token refresh
          await this.refreshToken();
        }

        if (!error.response && error.code === 'NETWORK_ERROR') {
          // Handle offline mode
          return this.handleOfflineRequest(error.config);
        }

        return Promise.reject(error);
      },
    );
  }

  private async handleOfflineRequest(config: AxiosRequestConfig) {
    const { method, url, data } = config;

    if (method === 'GET') {
      // Try to return cached data
      const cachedData = await this.getCachedData(url!);
      if (cachedData) {
        return { data: cachedData, cached: true };
      }
    } else {
      // Queue mutation for sync
      store.dispatch(
        addToSyncQueue({
          method: method!,
          url: url!,
          data,
          timestamp: new Date().toISOString(),
        }),
      );
    }

    throw new Error('No network connection');
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
```

### Service Example

```typescript
// services/emergency.service.ts
import { apiClient } from './api/client';
import { EmergencyContact, Hospital } from '@shared/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class EmergencyService {
  private static CONTACTS_CACHE_KEY = 'emergency_contacts';

  static async getEmergencyContacts(): Promise<EmergencyContact[]> {
    try {
      const contacts = await apiClient.get<EmergencyContact[]>('/emergency-contacts');
      // Cache for offline access
      await AsyncStorage.setItem(this.CONTACTS_CACHE_KEY, JSON.stringify(contacts));
      return contacts;
    } catch (error) {
      // Fallback to cached data
      const cached = await AsyncStorage.getItem(this.CONTACTS_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
      throw error;
    }
  }

  static async addEmergencyContact(
    contact: Omit<EmergencyContact, 'id'>,
  ): Promise<EmergencyContact> {
    const newContact = await apiClient.post<EmergencyContact>('/emergency-contacts', contact);

    // Update cache
    const cached = await AsyncStorage.getItem(this.CONTACTS_CACHE_KEY);
    if (cached) {
      const contacts = JSON.parse(cached);
      contacts.push(newContact);
      await AsyncStorage.setItem(this.CONTACTS_CACHE_KEY, JSON.stringify(contacts));
    }

    return newContact;
  }

  static async findNearbyHospitals(
    latitude: number,
    longitude: number,
    radius: number = 10,
  ): Promise<Hospital[]> {
    try {
      const hospitals = await apiClient.get<Hospital[]>('/emergency/hospitals', {
        params: { lat: latitude, lng: longitude, radius },
      });
      return hospitals;
    } catch (error) {
      // Return empty array if offline
      console.error('Failed to fetch hospitals:', error);
      return [];
    }
  }

  static async callEmergency(contactId: string, location?: { lat: number; lng: number }) {
    // Log the emergency call attempt
    await apiClient
      .post('/emergency/call-log', {
        contactId,
        location,
        timestamp: new Date().toISOString(),
      })
      .catch(() => {
        // Don't block the call if logging fails
      });
  }
}
```

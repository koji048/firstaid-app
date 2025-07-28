import React, { useRef, useEffect } from 'react';
import { View, Platform } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '../store/hooks';
import { RootStackParamList } from './types';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import EmergencyModeScreen from '../screens/EmergencyModeScreen';
import { GlobalEmergencyButton } from '../components/emergency/GlobalEmergencyButton/GlobalEmergencyButton';
import NavigationPerformanceMonitor from './NavigationPerformanceMonitor';

const Stack = createNativeStackNavigator<RootStackParamList>();

// IBM design-inspired transition configuration
const transitionConfig = {
  animation: 'fade' as const,
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 250, // Under 300ms for responsiveness
        useNativeDriver: true,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 200, // Faster closing
        useNativeDriver: true,
      },
    },
  },
};

const emergencyTransitionConfig = {
  presentation: 'fullScreenModal' as const,
  animation: Platform.OS === 'ios' ? 'fade_from_bottom' : 'slide_from_bottom' as const,
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 300, // Emergency mode can be slightly slower for emphasis
        useNativeDriver: true,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 250,
        useNativeDriver: true,
      },
    },
  },
};

const RootNavigator = () => {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isEmergencyMode = useAppSelector((state) => state.emergency.isEmergencyMode);

  // Initialize performance monitoring
  useEffect(() => {
    if (navigationRef.current && __DEV__) {
      const monitor = NavigationPerformanceMonitor.getInstance();
      monitor.setNavigationRef(navigationRef.current);
      monitor.startMonitoring();

      return () => {
        monitor.stopMonitoring();
      };
    }
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <View style={{ flex: 1 }}>
        <Stack.Navigator 
          screenOptions={{ 
            headerShown: false,
            ...transitionConfig,
          }}
        >
          {isEmergencyMode ? (
            <Stack.Screen
              name="EmergencyMode"
              component={EmergencyModeScreen}
              options={emergencyTransitionConfig}
            />
          ) : isAuthenticated ? (
            <Stack.Screen 
              name="Main" 
              component={MainNavigator}
              options={transitionConfig}
            />
          ) : (
            <Stack.Screen 
              name="Auth" 
              component={AuthNavigator}
              options={transitionConfig}
            />
          )}
        </Stack.Navigator>
        
        {/* Global Emergency Button - Always visible when authenticated */}
        {isAuthenticated && <GlobalEmergencyButton />}
      </View>
    </NavigationContainer>
  );
};

export default RootNavigator;

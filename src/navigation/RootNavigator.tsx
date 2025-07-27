import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '@store/hooks';
import { RootStackParamList } from './types';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import EmergencyModeScreen from '@screens/EmergencyModeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isEmergencyMode = useAppSelector((state) => state.emergency.isEmergencyMode);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isEmergencyMode ? (
          <Stack.Screen
            name="EmergencyMode"
            component={EmergencyModeScreen}
            options={{
              presentation: 'fullScreenModal',
              animation: 'fade_from_bottom',
            }}
          />
        ) : isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';

// Placeholder screens - will be replaced with actual implementations
import WelcomeScreen from '@screens/auth/WelcomeScreen';
import LoginScreen from '@screens/auth/LoginScreen';
import RegisterScreen from '@screens/auth/RegisterScreen';
import ForgotPasswordScreen from '@screens/auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerTintColor: '#007AFF',
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign In' }} />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Create Account' }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: 'Reset Password' }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;

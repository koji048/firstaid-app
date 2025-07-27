import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../types';

// Placeholder screens
import SettingsScreen from '@screens/settings/SettingsScreen';
import ProfileScreen from '@screens/settings/ProfileScreen';
import AboutScreen from '@screens/settings/AboutScreen';
import PrivacyScreen from '@screens/settings/PrivacyScreen';
import NotificationsScreen from '@screens/settings/NotificationsScreen';
import DataSyncScreen from '@screens/settings/DataSyncScreen';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

const SettingsNavigator = () => {
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
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{ title: 'Privacy & Security' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen name="DataSync" component={DataSyncScreen} options={{ title: 'Data & Sync' }} />
    </Stack.Navigator>
  );
};

export default SettingsNavigator;

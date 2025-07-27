import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { MainTabParamList } from './types';

// Stack navigators
import HomeNavigator from './stacks/HomeNavigator';
import GuidesNavigator from './stacks/GuidesNavigator';
import MedicalNavigator from './stacks/MedicalNavigator';
import SettingsNavigator from './stacks/SettingsNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0.5,
          borderTopColor: '#E5E5EA',
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
      }}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            // Placeholder icon - will be replaced with actual icon component
            <></>
          ),
        }}
      />
      <Tab.Screen
        name="GuidesStack"
        component={GuidesNavigator}
        options={{
          tabBarLabel: 'Guides',
          tabBarIcon: ({ color, size }) => (
            // Placeholder icon - will be replaced with actual icon component
            <></>
          ),
        }}
      />
      <Tab.Screen
        name="MedicalStack"
        component={MedicalNavigator}
        options={{
          tabBarLabel: 'Medical',
          tabBarIcon: ({ color, size }) => (
            // Placeholder icon - will be replaced with actual icon component
            <></>
          ),
        }}
      />
      <Tab.Screen
        name="SettingsStack"
        component={SettingsNavigator}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            // Placeholder icon - will be replaced with actual icon component
            <></>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;

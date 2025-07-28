import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { MainTabParamList } from './types';

// Stack navigators
import HomeNavigator from './stacks/HomeNavigator';
import GuidesNavigator from './stacks/GuidesNavigator';
import MedicalNavigator from './stacks/MedicalNavigator';
import SettingsNavigator from './stacks/SettingsNavigator';

// IBM Design System Colors
const IBM_COLORS = {
  blue: '#0f62fe',
  textSecondary: '#525252',
  bgPrimary: '#ffffff',
  border: '#e0e0e0',
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: IBM_COLORS.blue,
        tabBarInactiveTintColor: IBM_COLORS.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '400',
          fontFamily: Platform.OS === 'ios' ? 'IBM Plex Sans' : 'IBMPlexSans-Regular',
        },
        tabBarStyle: {
          backgroundColor: IBM_COLORS.bgPrimary,
          borderTopWidth: 1,
          borderTopColor: IBM_COLORS.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 85 : 65,
          elevation: 0,
          shadowOpacity: 0,
        },
        // Smooth tab transitions
        lazy: false, // Pre-load all tabs for instant switching
        tabBarHideOnKeyboard: true,
        unmountOnBlur: false, // Keep tab state between switches
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;
          let accessibilityLabel: string;

          if (route.name === 'HomeStack') {
            iconName = 'home';
            accessibilityLabel = 'Home tab';
          } else if (route.name === 'GuidesStack') {
            iconName = 'book';
            accessibilityLabel = 'First aid guides tab';
          } else if (route.name === 'MedicalStack') {
            iconName = 'local-hospital';
            accessibilityLabel = 'Medical profile tab';
          } else if (route.name === 'SettingsStack') {
            iconName = 'settings';
            accessibilityLabel = 'Settings tab';
          } else {
            iconName = 'help';
            accessibilityLabel = 'Tab';
          }

          return (
            <Icon
              name={iconName}
              size={size}
              color={color}
              accessibilityLabel={accessibilityLabel}
              accessible={true}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarAccessibilityLabel: 'Home tab - Quick actions and emergency access',
        }}
      />
      <Tab.Screen
        name="GuidesStack"
        component={GuidesNavigator}
        options={{
          tabBarLabel: 'Guides',
          tabBarAccessibilityLabel: 'Guides tab - First aid guides and instructions',
        }}
      />
      <Tab.Screen
        name="MedicalStack"
        component={MedicalNavigator}
        options={{
          tabBarLabel: 'Medical',
          tabBarAccessibilityLabel: 'Medical tab - Medical profile and information',
        }}
      />
      <Tab.Screen
        name="SettingsStack"
        component={SettingsNavigator}
        options={{
          tabBarLabel: 'Settings',
          tabBarAccessibilityLabel: 'Settings tab - App settings and preferences',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;

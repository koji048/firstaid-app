import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../types';

// Placeholder screens
import HomeScreen from '@screens/home/HomeScreen';
import EmergencyContactsScreen from '@screens/home/EmergencyContactsScreen';
import AddEmergencyContactScreen from '@screens/home/AddEmergencyContactScreen';

// IBM Design Colors
const IBM_COLORS = {
  blue: '#0f62fe',
  textPrimary: '#161616',
  bgPrimary: '#ffffff',
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerTintColor: IBM_COLORS.blue,
        headerStyle: {
          backgroundColor: IBM_COLORS.bgPrimary,
        },
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '400', // IBM light weight
          color: IBM_COLORS.textPrimary,
          fontFamily: Platform.OS === 'ios' ? 'IBM Plex Sans' : 'IBMPlexSans-Regular',
        },
        // Gesture navigation support
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        fullScreenGestureEnabled: true,
        // Smooth transitions
        animation: 'slide_from_right',
        animationDuration: 250,
        // Accessibility
        headerBackAccessibilityLabel: 'Go back',
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'First Aid Room',
          headerLargeTitle: true,
          headerAccessibilityLabel: 'First Aid Room home screen',
        }}
      />
      <Stack.Screen
        name="EmergencyContacts"
        component={EmergencyContactsScreen}
        options={{
          title: 'Emergency Contacts',
          headerAccessibilityLabel: 'Emergency contacts screen',
          headerBackAccessibilityLabel: 'Back to home',
        }}
      />
      <Stack.Screen
        name="AddEmergencyContact"
        component={AddEmergencyContactScreen}
        options={({ route }) => ({
          title: route.params?.contactId ? 'Edit Contact' : 'Add Contact',
          presentation: 'modal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
          headerAccessibilityLabel: route.params?.contactId 
            ? 'Edit emergency contact' 
            : 'Add new emergency contact',
          headerBackAccessibilityLabel: 'Cancel and return to contacts',
        })}
      />
    </Stack.Navigator>
  );
};

export default HomeNavigator;

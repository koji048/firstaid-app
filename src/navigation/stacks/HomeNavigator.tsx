import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../types';

// Placeholder screens
import HomeScreen from '@screens/home/HomeScreen';
import EmergencyContactsScreen from '@screens/home/EmergencyContactsScreen';
import AddEmergencyContactScreen from '@screens/home/AddEmergencyContactScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeNavigator = () => {
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
        name="Home"
        component={HomeScreen}
        options={{
          title: 'First Aid Room',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="EmergencyContacts"
        component={EmergencyContactsScreen}
        options={{ title: 'Emergency Contacts' }}
      />
      <Stack.Screen
        name="AddEmergencyContact"
        component={AddEmergencyContactScreen}
        options={({ route }) => ({
          title: route.params?.contactId ? 'Edit Contact' : 'Add Contact',
          presentation: 'modal',
        })}
      />
    </Stack.Navigator>
  );
};

export default HomeNavigator;

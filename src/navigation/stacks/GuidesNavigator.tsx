import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GuidesStackParamList } from '../types';

// Placeholder screens
import GuidesListScreen from '@screens/guides/GuidesListScreen';
import GuideDetailScreen from '@screens/guides/GuideDetailScreen';
import GuideSearchScreen from '@screens/guides/GuideSearchScreen';

const Stack = createNativeStackNavigator<GuidesStackParamList>();

const GuidesNavigator = () => {
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
        name="GuidesList"
        component={GuidesListScreen}
        options={{
          title: 'First Aid Guides',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="GuideDetail"
        component={GuideDetailScreen}
        options={{
          title: '',
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="GuideSearch"
        component={GuideSearchScreen}
        options={{
          title: 'Search Guides',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

export default GuidesNavigator;

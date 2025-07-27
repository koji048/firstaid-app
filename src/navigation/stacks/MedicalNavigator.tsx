import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MedicalStackParamList } from '../types';

// Placeholder screens
import MedicalProfileScreen from '@screens/medical/MedicalProfileScreen';
import MedicalEditScreen from '@screens/medical/MedicalEditScreen';
import AddAllergyScreen from '@screens/medical/AddAllergyScreen';
import AddMedicationScreen from '@screens/medical/AddMedicationScreen';
import AddConditionScreen from '@screens/medical/AddConditionScreen';

const Stack = createNativeStackNavigator<MedicalStackParamList>();

const MedicalNavigator = () => {
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
        name="MedicalProfile"
        component={MedicalProfileScreen}
        options={{
          title: 'Medical Profile',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="MedicalEdit"
        component={MedicalEditScreen}
        options={{
          title: 'Edit Medical Info',
        }}
      />
      <Stack.Screen
        name="AddAllergy"
        component={AddAllergyScreen}
        options={({ route }) => ({
          title: route.params?.allergyId ? 'Edit Allergy' : 'Add Allergy',
          presentation: 'modal',
        })}
      />
      <Stack.Screen
        name="AddMedication"
        component={AddMedicationScreen}
        options={({ route }) => ({
          title: route.params?.medicationId ? 'Edit Medication' : 'Add Medication',
          presentation: 'modal',
        })}
      />
      <Stack.Screen
        name="AddCondition"
        component={AddConditionScreen}
        options={({ route }) => ({
          title: route.params?.conditionId ? 'Edit Condition' : 'Add Condition',
          presentation: 'modal',
        })}
      />
    </Stack.Navigator>
  );
};

export default MedicalNavigator;

import React, { useLayoutEffect, useState } from 'react';
import { Alert } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { HomeStackParamList, NavigationProp } from '../../navigation/types';
import { ContactForm } from '../../components/emergency/ContactForm';
import {
  useAddContact,
  useEmergencyContact,
  useUpdateContact,
} from '../../hooks/useEmergencyContacts';
import { NewEmergencyContact, UpdateEmergencyContact } from '../../types/emergencyContact';

type AddEmergencyContactRouteProp = RouteProp<HomeStackParamList, 'AddEmergencyContact'>;

const AddEmergencyContactScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddEmergencyContactRouteProp>();
  const contactId = route.params?.contactId;
  const isEditMode = !!contactId;

  const existingContact = useEmergencyContact(contactId || '');
  const { addContact, isLoading: isAdding } = useAddContact();
  const { updateContact, isLoading: isUpdating } = useUpdateContact();

  const [isSubmitting, setIsSubmitting] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'Edit Contact' : 'Add Contact',
    });
  }, [navigation, isEditMode]);

  const handleSubmit = async (values: NewEmergencyContact) => {
    setIsSubmitting(true);

    try {
      if (isEditMode && contactId) {
        const updates: UpdateEmergencyContact = {
          name: values.name,
          phone: values.phone,
          relationship: values.relationship,
          category: values.category,
          isPrimary: values.isPrimary,
          notes: values.notes,
        };
        await updateContact(contactId, updates);
        Alert.alert('Success', 'Contact updated successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        await addContact(values);
        Alert.alert('Success', 'Contact added successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'add'} contact. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <ContactForm
      initialValues={existingContact}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isSubmitting || isAdding || isUpdating}
    />
  );
};

export default AddEmergencyContactScreen;

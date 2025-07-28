import React, { useCallback, useLayoutEffect, useState, useRef } from 'react';
import { Alert, SafeAreaView, StyleSheet, View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Icon } from 'react-native-elements';
import { NavigationProp } from '../../navigation/types';
import { ContactList } from '../../components/emergency/ContactList';
import { ContactSearchBar } from '../../components/emergency/ContactSearchBar';
import { EmergencyModeToggle } from '../../components/emergency/EmergencyModeToggle';
import { LocationShareToggle } from '../../components/emergency/LocationShareToggle';
import { PrimaryContactCard } from '../../components/emergency/PrimaryContactCard';
import { CallConfirmationModal } from '../../components/emergency/CallConfirmationModal';
import { QuickDialButtonRef } from '../../components/emergency/QuickDialButton';
import { useDeleteContact } from '../../hooks/useEmergencyContacts';
import { useAppDispatch } from '../../store/hooks';
import {
  selectSearchQuery,
  selectIsEmergencyMode,
  selectPrimaryContact,
  selectLocationSharing,
  setSearchQuery,
  toggleEmergencyMode,
  setLocationSharingEnabled,
  setLocationTracking,
  updateCurrentLocation,
  setLocationSharingError,
} from '../../store/slices/emergencyContactsSlice';
import { EmergencyContact } from '../../types/emergencyContact';
import { PhoneService } from '../../services/phone';

const EmergencyContactsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const searchQuery = useSelector(selectSearchQuery);
  const isEmergencyMode = useSelector(selectIsEmergencyMode);
  const primaryContact = useSelector(selectPrimaryContact);
  const locationSharing = useSelector(selectLocationSharing);
  const { deleteContact } = useDeleteContact();

  // Local state for call confirmation modal
  const [confirmationModal, setConfirmationModal] = useState<{
    visible: boolean;
    contact: EmergencyContact | null;
  }>({
    visible: false,
    contact: null,
  });

  const quickDialRef = useRef<QuickDialButtonRef>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Icon
          name="add"
          type="material"
          size={28}
          color="#0f62fe"
          onPress={() =>
            navigation.navigate('Home', {
              screen: 'AddEmergencyContact',
              params: {},
            })
          }
          containerStyle={{ marginRight: 16 }}
        />
      ),
    });
  }, [navigation]);

  const handleContactPress = useCallback(
    (contact: EmergencyContact) => {
      if (isEmergencyMode && contact.phone) {
        // In emergency mode, handle quick call
        handleQuickCall(contact);
      } else {
        // In normal mode, show contact details or actions
        Alert.alert(
          contact.name,
          `Phone: ${contact.phone}\nRelationship: ${contact.relationship}`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Call', onPress: () => handleCallRequest(contact) },
            { text: 'Edit', onPress: () => handleEditPress(contact) },
          ],
        );
      }
    },
    [isEmergencyMode],
  );

  // Emergency mode and calling handlers
  const handleEmergencyToggle = useCallback(
    (enabled: boolean) => {
      dispatch(toggleEmergencyMode());
    },
    [dispatch],
  );

  const handleQuickCall = useCallback(async (contact: EmergencyContact) => {
    if (!contact.phone) {
      Alert.alert('No Phone Number', `${contact.name} does not have a phone number.`);
      return;
    }

    try {
      const result = await PhoneService.makePhoneCall(contact.phone, contact.name);
      if (!result.success && result.error) {
        PhoneService.handleCallError(result.error, contact.name);
      }
    } catch (error) {
      PhoneService.handleCallError('Failed to make call', contact.name);
    }
  }, []);

  const handleCallRequest = useCallback((contact: EmergencyContact) => {
    if (!contact.phone) {
      Alert.alert('No Phone Number', `${contact.name} does not have a phone number.`);
      return;
    }

    setConfirmationModal({
      visible: true,
      contact,
    });
  }, []);

  const handleCallConfirm = useCallback(async () => {
    const { contact } = confirmationModal;
    if (contact) {
      setConfirmationModal({ visible: false, contact: null });
      await handleQuickCall(contact);
    }
  }, [confirmationModal, handleQuickCall]);

  const handleCallCancel = useCallback(() => {
    setConfirmationModal({ visible: false, contact: null });
  }, []);

  // Location sharing handlers
  const handleLocationToggle = useCallback(
    (enabled: boolean) => {
      dispatch(setLocationSharingEnabled(enabled));
    },
    [dispatch],
  );

  const handleLocationUpdate = useCallback(
    (location: any) => {
      dispatch(updateCurrentLocation(location));
    },
    [dispatch],
  );

  const handleLocationTrackingChange = useCallback(
    (tracking: boolean) => {
      dispatch(setLocationTracking(tracking));
    },
    [dispatch],
  );

  const handleLocationError = useCallback(
    (error: string | null) => {
      dispatch(setLocationSharingError(error));
    },
    [dispatch],
  );

  const handleNoPrimaryContactPress = useCallback(() => {
    navigation.navigate('Home', {
      screen: 'AddEmergencyContact',
      params: { setPrimary: true },
    });
  }, [navigation]);

  const handleEditPress = useCallback(
    (contact: EmergencyContact) => {
      navigation.navigate('Home', {
        screen: 'AddEmergencyContact',
        params: { contactId: contact.id },
      });
    },
    [navigation],
  );

  const handleDeletePress = useCallback(
    (contact: EmergencyContact) => {
      Alert.alert('Delete Contact', `Are you sure you want to delete ${contact.name}?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteContact(contact.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete contact. Please try again.');
            }
          },
        },
      ]);
    },
    [deleteContact],
  );

  const handleSearchChange = useCallback(
    (text: string) => {
      dispatch(setSearchQuery(text));
    },
    [dispatch],
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Emergency Mode Toggle */}
        <EmergencyModeToggle isEmergencyMode={isEmergencyMode} onToggle={handleEmergencyToggle} />

        {/* Primary Contact Card */}
        <PrimaryContactCard
          primaryContact={primaryContact}
          isEmergencyMode={isEmergencyMode}
          onCallInitiated={(contact) => {}}
          onCallCompleted={(contact, success) => {}}
          onNoPrimaryContactPress={handleNoPrimaryContactPress}
        />

        {/* Location Sharing (only in emergency mode) */}
        <LocationShareToggle
          isEnabled={locationSharing.isEnabled}
          isTracking={locationSharing.isTracking}
          currentLocation={locationSharing.currentLocation}
          error={locationSharing.error}
          isEmergencyMode={isEmergencyMode}
          onToggle={handleLocationToggle}
          onLocationUpdate={handleLocationUpdate}
          onTrackingChange={handleLocationTrackingChange}
          onError={handleLocationError}
        />

        {/* Search Bar (hidden in emergency mode) */}
        {!isEmergencyMode && (
          <View style={styles.searchContainer}>
            <ContactSearchBar
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder="Search by name, phone, or notes"
            />
          </View>
        )}

        {/* Contact List */}
        <View style={[styles.listContainer, isEmergencyMode && styles.emergencyListContainer]}>
          <ContactList
            onContactPress={handleContactPress}
            onEditPress={handleEditPress}
            onDeletePress={handleDeletePress}
            isEmergencyMode={isEmergencyMode}
            onQuickCall={handleQuickCall}
          />
        </View>
      </ScrollView>

      {/* Call Confirmation Modal */}
      <CallConfirmationModal
        visible={confirmationModal.visible}
        contact={confirmationModal.contact}
        onConfirm={handleCallConfirm}
        onCancel={handleCallCancel}
        autoConfirmTimeout={0} // No auto-confirm in normal mode
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  emergencyListContainer: {
    backgroundColor: '#fff9f9',
    paddingVertical: 8,
  },
});

export default EmergencyContactsScreen;

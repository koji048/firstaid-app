import React, { memo, useState } from 'react';
import { Alert, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { styles } from './ManualLocationEntry.styles';

export interface ManualLocationEntryProps {
  visible: boolean;
  onClose: () => void;
  onLocationEntered: (location: ManualLocation) => void;
  isEmergencyMode?: boolean;
  testID?: string;
}

export interface ManualLocation {
  address: string;
  landmark?: string;
  notes?: string;
  timestamp: number;
}

export const ManualLocationEntry = memo<ManualLocationEntryProps>(
  ({
    visible,
    onClose,
    onLocationEntered,
    isEmergencyMode = false,
    testID = 'manual-location-entry',
  }) => {
    const [address, setAddress] = useState('');
    const [landmark, setLandmark] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = () => {
      if (!address.trim()) {
        Alert.alert('Address Required', 'Please enter your current address or nearby location.');
        return;
      }

      setIsSubmitting(true);

      const location: ManualLocation = {
        address: address.trim(),
        landmark: landmark.trim() || undefined,
        notes: notes.trim() || undefined,
        timestamp: Date.now(),
      };

      // Simulate brief processing
      setTimeout(() => {
        onLocationEntered(location);
        handleClear();
        setIsSubmitting(false);
      }, 500);
    };

    const handleClear = () => {
      setAddress('');
      setLandmark('');
      setNotes('');
    };

    const handleClose = () => {
      if (address || landmark || notes) {
        Alert.alert(
          'Discard Changes',
          'Are you sure you want to discard the location information you entered?',
          [
            { text: 'Keep Editing', style: 'cancel' },
            {
              text: 'Discard',
              style: 'destructive',
              onPress: () => {
                handleClear();
                onClose();
              },
            },
          ],
        );
      } else {
        onClose();
      }
    };

    const quickLocationOptions = [
      'At home',
      'At work',
      'In a vehicle',
      'On the street',
      'In a building',
      'At a park',
      'At a store',
      'At a restaurant',
    ];

    const handleQuickLocation = (option: string) => {
      if (address) {
        setAddress(`${address}, ${option.toLowerCase()}`);
      } else {
        setAddress(option);
      }
    };

    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
        testID={testID}
      >
        <View style={styles.overlay}>
          <View style={[styles.container, isEmergencyMode && styles.emergencyContainer]}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, isEmergencyMode && styles.emergencyHeaderTitle]}>
                Enter Your Location
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                testID="close-manual-location"
              >
                <Icon name="close" type="material" size={24} color="#525252" />
              </TouchableOpacity>
            </View>

            {/* Emergency Banner */}
            {isEmergencyMode && (
              <View style={styles.emergencyBanner}>
                <Icon
                  name="warning"
                  type="material"
                  size={20}
                  color="#da1e28"
                  style={styles.emergencyBannerIcon}
                />
                <Text style={styles.emergencyBannerText}>
                  Emergency Mode: Please provide as much detail as possible to help emergency
                  services locate you
                </Text>
              </View>
            )}

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsText}>
                Please provide your current location. Include street address, building name, or
                nearby landmarks to help emergency services find you quickly.
              </Text>
            </View>

            {/* Address Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Address or Location <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.textInput, styles.addressInput]}
                value={address}
                onChangeText={setAddress}
                placeholder="e.g., 123 Main St, Downtown Office Building"
                placeholderTextColor="#a8a8a8"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                testID="address-input"
              />
            </View>

            {/* Quick Location Options */}
            <View style={styles.quickOptionsContainer}>
              <Text style={styles.quickOptionsLabel}>Quick options:</Text>
              <View style={styles.quickOptionsGrid}>
                {quickLocationOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.quickOption}
                    onPress={() => handleQuickLocation(option)}
                    testID={`quick-option-${option.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Text style={styles.quickOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Landmark Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nearby Landmark (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={landmark}
                onChangeText={setLandmark}
                placeholder="e.g., Next to City Hall, Across from McDonald's"
                placeholderTextColor="#a8a8a8"
                testID="landmark-input"
              />
            </View>

            {/* Notes Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Additional Notes (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g., Third floor, Unit 5B, Red door"
                placeholderTextColor="#a8a8a8"
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                testID="notes-input"
              />
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.primaryButton, isEmergencyMode && styles.emergencyButton]}
                onPress={handleSubmit}
                disabled={isSubmitting || !address.trim()}
                testID="submit-location-button"
              >
                <Text
                  style={[
                    styles.primaryButtonText,
                    isEmergencyMode && styles.emergencyButtonText,
                  ]}
                >
                  {isSubmitting ? 'Saving...' : 'Save Location'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleClose}
                disabled={isSubmitting}
                testID="cancel-location-button"
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {/* Help Text */}
            <View style={styles.helpContainer}>
              <Text style={styles.helpText}>
                This information is only used to help emergency services locate you and is not
                stored permanently.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);

ManualLocationEntry.displayName = 'ManualLocationEntry';
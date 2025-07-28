import React, { memo, useState, useImperativeHandle, forwardRef } from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { Icon } from 'react-native-elements';
import { EmergencyContact, ContactRelationship } from '../../../types/emergencyContact';
import { PhoneService } from '../../../services/phone';
import { styles } from './QuickDialButton.styles';

export interface QuickDialButtonProps {
  contact: EmergencyContact;
  isEmergencyMode?: boolean;
  disabled?: boolean;
  requireConfirmation?: boolean;
  onCallInitiated?: (contact: EmergencyContact) => void;
  onCallCompleted?: (contact: EmergencyContact, success: boolean) => void;
  onCallRequested?: (contact: EmergencyContact) => void;
  testID?: string;
}

export interface QuickDialButtonRef {
  makeCall: () => Promise<void>;
}

const RELATIONSHIP_LABELS: Record<ContactRelationship, string> = {
  [ContactRelationship.SPOUSE]: 'Spouse',
  [ContactRelationship.PARENT]: 'Parent',
  [ContactRelationship.CHILD]: 'Child',
  [ContactRelationship.SIBLING]: 'Sibling',
  [ContactRelationship.FRIEND]: 'Friend',
  [ContactRelationship.DOCTOR]: 'Doctor',
  [ContactRelationship.OTHER]: 'Other',
};

export const QuickDialButton = memo(
  forwardRef<QuickDialButtonRef, QuickDialButtonProps>(
    (
      {
        contact,
        isEmergencyMode = false,
        disabled = false,
        requireConfirmation = false,
        onCallInitiated,
        onCallCompleted,
        onCallRequested,
        testID = 'quick-dial-button',
      },
      ref,
    ) => {
      const [isDialing, setIsDialing] = useState(false);

      const makeCall = async () => {
        setIsDialing(true);
        onCallInitiated?.(contact);

        try {
          const result = await PhoneService.makePhoneCall(contact.phone, contact.name);
          onCallCompleted?.(contact, result.success);

          if (!result.success && result.error) {
            PhoneService.handleCallError(result.error, contact.name);
          }
        } catch (error) {
          onCallCompleted?.(contact, false);
          PhoneService.handleCallError('Unknown error occurred', contact.name);
        } finally {
          setIsDialing(false);
        }
      };

      useImperativeHandle(ref, () => ({
        makeCall,
      }));

      const handlePress = async () => {
        if (disabled || isDialing || !contact.phone) {
          return;
        }

        // If confirmation is required and not in emergency mode, request confirmation
        if (requireConfirmation && !isEmergencyMode) {
          onCallRequested?.(contact);
          return;
        }

        // Direct call - emergency mode or no confirmation required
        await makeCall();
      };

      const isDisabled = disabled || !contact.phone || isDialing;
      const buttonStyle = [
        styles.container,
        isEmergencyMode && styles.emergencyContainer,
        isDisabled && styles.disabled,
      ];

      const iconSize = isEmergencyMode ? 28 : 24;
      const iconColor = isDisabled ? '#a8a8a8' : '#ffffff';

      return (
        <TouchableOpacity
          style={buttonStyle}
          onPress={handlePress}
          disabled={isDisabled}
          activeOpacity={0.7}
          testID={testID}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              {isDialing ? (
                <ActivityIndicator size="small" color={iconColor} testID="dialing-spinner" />
              ) : (
                <Icon
                  name="phone"
                  type="material"
                  size={iconSize}
                  color={iconColor}
                  testID="dial-icon"
                />
              )}
            </View>

            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.contactName,
                  isEmergencyMode && styles.emergencyContactName,
                  isDisabled && styles.disabledText,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {contact.name}
              </Text>

              <Text
                style={[
                  styles.relationship,
                  isEmergencyMode && styles.emergencyRelationship,
                  isDisabled && styles.disabledText,
                ]}
                numberOfLines={1}
              >
                {RELATIONSHIP_LABELS[contact.relationship]}
              </Text>

              {contact.phone ? (
                <Text
                  style={[
                    styles.phoneNumber,
                    isEmergencyMode && styles.emergencyPhoneNumber,
                    isDisabled && styles.disabledText,
                  ]}
                  numberOfLines={1}
                >
                  {contact.phone}
                </Text>
              ) : (
                <Text style={[styles.noPhone, isDisabled && styles.disabledText]}>
                  No phone number
                </Text>
              )}
            </View>

            {contact.isPrimary && (
              <Icon
                name="star"
                type="material"
                size={isEmergencyMode ? 22 : 18}
                color="#ffd700"
                style={styles.primaryStar}
                testID="primary-star"
              />
            )}
          </View>
        </TouchableOpacity>
      );
    },
  ),
);

QuickDialButton.displayName = 'QuickDialButton';

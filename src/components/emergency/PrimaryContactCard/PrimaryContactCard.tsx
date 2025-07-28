import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { EmergencyContact } from '../../../types/emergencyContact';
import { QuickDialButton } from '../QuickDialButton';
import { styles } from './PrimaryContactCard.styles';

export interface PrimaryContactCardProps {
  primaryContact: EmergencyContact | null;
  isEmergencyMode?: boolean;
  onCallInitiated?: (contact: EmergencyContact) => void;
  onCallCompleted?: (contact: EmergencyContact, success: boolean) => void;
  onNoPrimaryContactPress?: () => void;
  testID?: string;
}

export const PrimaryContactCard: React.FC<PrimaryContactCardProps> = memo(
  ({
    primaryContact,
    isEmergencyMode = false,
    onCallInitiated,
    onCallCompleted,
    onNoPrimaryContactPress,
    testID = 'primary-contact-card',
  }) => {
    if (!primaryContact) {
      return (
        <View style={[styles.container, styles.noPrimaryContainer]} testID={testID}>
          <View style={styles.noPrimaryContent}>
            <Icon
              name="star-border"
              type="material"
              size={48}
              color="#a8a8a8"
              testID="no-primary-icon"
            />
            <Text style={styles.noPrimaryTitle}>No Primary Contact</Text>
            <Text style={styles.noPrimarySubtitle}>Tap to set one for quick emergency access</Text>

            {onNoPrimaryContactPress && (
              <TouchableOpacity
                style={styles.setPrimaryButton}
                onPress={onNoPrimaryContactPress}
                testID="set-primary-button"
              >
                <Text style={styles.setPrimaryButtonText}>Set Primary Contact</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.container, styles.primaryContainer]} testID={testID}>
        <View style={styles.headerContainer}>
          <View style={styles.titleRow}>
            <Icon
              name="star"
              type="material"
              size={24}
              color="#ffd700"
              testID="primary-star-icon"
            />
            <Text style={[styles.primaryLabel, isEmergencyMode && styles.emergencyPrimaryLabel]}>
              Primary Contact
            </Text>
          </View>

          {isEmergencyMode && (
            <View style={styles.emergencyBadge}>
              <Text style={styles.emergencyBadgeText}>EMERGENCY</Text>
            </View>
          )}
        </View>

        <View style={styles.contactContainer}>
          <QuickDialButton
            contact={primaryContact}
            isEmergencyMode={isEmergencyMode}
            onCallInitiated={onCallInitiated}
            onCallCompleted={onCallCompleted}
            testID="primary-quick-dial"
          />
        </View>

        {!isEmergencyMode && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>One-tap calling in emergency mode</Text>
          </View>
        )}
      </View>
    );
  },
);

PrimaryContactCard.displayName = 'PrimaryContactCard';

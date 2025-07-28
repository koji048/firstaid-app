import React, { memo, useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Vibration,
  View,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { ContactRelationship, EmergencyContact } from '../../../types/emergencyContact';
import { getPhoneDisplay } from '../../../utils/phoneNumber';
import { styles } from './CallConfirmationModal.styles';

export interface CallConfirmationModalProps {
  visible: boolean;
  contact: EmergencyContact | null;
  onConfirm: () => void;
  onCancel: () => void;
  autoConfirmTimeout?: number; // in milliseconds, 0 to disable
  testID?: string;
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

export const CallConfirmationModal: React.FC<CallConfirmationModalProps> = memo(
  ({
    visible,
    contact,
    onConfirm,
    onCancel,
    autoConfirmTimeout = 0,
    testID = 'call-confirmation-modal',
  }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const countdownRef = useRef<number>(0);
    const [countdown, setCountdown] = React.useState(0);

    useEffect(() => {
      if (visible) {
        // Start enter animation
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();

        // Start auto-confirm timer if enabled
        if (autoConfirmTimeout > 0) {
          const countdownSeconds = Math.ceil(autoConfirmTimeout / 1000);
          setCountdown(countdownSeconds);
          countdownRef.current = countdownSeconds;

          const countdownInterval = setInterval(() => {
            countdownRef.current -= 1;
            setCountdown(countdownRef.current);

            if (countdownRef.current <= 0) {
              clearInterval(countdownInterval);
            }
          }, 1000);

          timeoutRef.current = setTimeout(() => {
            clearInterval(countdownInterval);
            onConfirm();
          }, autoConfirmTimeout);

          // Vibrate to alert user
          Vibration.vibrate([0, 200, 100, 200]);
        }
      } else {
        // Start exit animation
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();

        // Clear timers
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setCountdown(0);
        countdownRef.current = 0;
      }

      // Cleanup on unmount
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [visible, autoConfirmTimeout, fadeAnim, scaleAnim, onConfirm]);

    const handleConfirm = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      onConfirm();
    };

    const handleCancel = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      onCancel();
    };

    if (!contact) {
      return null;
    }

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="none"
        onRequestClose={handleCancel}
        testID={testID}
      >
        <TouchableWithoutFeedback onPress={handleCancel}>
          <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.modalContainer,
                  {
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <View style={styles.header}>
                  <Icon name="phone" type="material" size={32} color="#0f62fe" testID="call-icon" />
                  <Text style={styles.title}>Confirm Call</Text>
                  {countdown > 0 && (
                    <View style={styles.countdownContainer}>
                      <Text style={styles.countdownText}>{countdown}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.relationship}>
                    {RELATIONSHIP_LABELS[contact.relationship]}
                  </Text>
                  <Text style={styles.phoneNumber}>{getPhoneDisplay(contact.phone)}</Text>
                </View>

                {autoConfirmTimeout > 0 && countdown > 0 && (
                  <View style={styles.autoConfirmInfo}>
                    <Text style={styles.autoConfirmText}>
                      Auto-calling in {countdown} second{countdown !== 1 ? 's' : ''}
                    </Text>
                  </View>
                )}

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={handleCancel}
                    testID="cancel-button"
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.confirmButton]}
                    onPress={handleConfirm}
                    testID="confirm-button"
                  >
                    <Icon
                      name="phone"
                      type="material"
                      size={18}
                      color="#ffffff"
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.confirmButtonText}>Call Now</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  },
);

CallConfirmationModal.displayName = 'CallConfirmationModal';

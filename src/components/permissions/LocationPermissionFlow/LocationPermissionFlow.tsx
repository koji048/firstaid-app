import React, { memo, useEffect, useState } from 'react';
import { Alert, Modal, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { LocationPermissions, LocationPermissionResult } from '../../../services/locationPermissions';
import { styles } from './LocationPermissionFlow.styles';

export interface LocationPermissionFlowProps {
  visible: boolean;
  onClose: () => void;
  onPermissionGranted: () => void;
  onPermissionDenied: () => void;
  isEmergencyMode?: boolean;
  title?: string;
  description?: string;
  testID?: string;
}

interface PermissionStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  isCompleted: boolean;
  isActive: boolean;
}

export const LocationPermissionFlow = memo<LocationPermissionFlowProps>(
  ({
    visible,
    onClose,
    onPermissionGranted,
    onPermissionDenied,
    isEmergencyMode = false,
    title,
    description,
    testID = 'location-permission-flow',
  }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [permissionResult, setPermissionResult] = useState<LocationPermissionResult | null>(null);
    const [isRequesting, setIsRequesting] = useState(false);

    const steps: PermissionStep[] = [
      {
        id: 'explanation',
        title: 'Location Access Required',
        description: isEmergencyMode
          ? 'We need your location to help emergency services find you quickly and accurately.'
          : 'We need your location to share it during emergencies and find nearby hospitals.',
        icon: 'location-on',
        isCompleted: false,
        isActive: currentStep === 0,
      },
      {
        id: 'permission',
        title: 'Grant Permission',
        description: 'Please allow location access when prompted by your device.',
        icon: 'security',
        isCompleted: false,
        isActive: currentStep === 1,
      },
      {
        id: 'verification',
        title: 'Verification',
        description: 'Verifying location access...',
        icon: 'check-circle',
        isCompleted: false,
        isActive: currentStep === 2,
      },
    ];

    // Check permission status when modal opens
    useEffect(() => {
      if (visible) {
        checkCurrentPermission();
      }
    }, [visible]);

    const checkCurrentPermission = async () => {
      try {
        const result = await LocationPermissions.check();
        setPermissionResult(result);

        if (result.granted) {
          setCurrentStep(2);
          setTimeout(() => {
            onPermissionGranted();
          }, 1000);
        } else {
          setCurrentStep(0);
        }
      } catch (error) {
        console.error('Error checking location permission:', error);
      }
    };

    const requestPermission = async () => {
      setIsRequesting(true);
      setCurrentStep(1);

      try {
        const result = await LocationPermissions.requestWithExplanation({
          title: title || 'Location Permission Required',
          message:
            description ||
            (isEmergencyMode
              ? 'This app needs access to your location to help emergency services find you quickly during emergencies.'
              : 'This app needs access to your location to share it during emergencies and help you find nearby hospitals.'),
          buttonPositive: 'Allow',
          buttonNegative: 'Cancel',
        });

        setPermissionResult(result);

        if (result.granted) {
          setCurrentStep(2);
          setTimeout(() => {
            onPermissionGranted();
          }, 1000);
        } else {
          handlePermissionDenied(result);
        }
      } catch (error) {
        console.error('Error requesting location permission:', error);
        Alert.alert('Error', 'Failed to request location permission. Please try again.');
      } finally {
        setIsRequesting(false);
      }
    };

    const handlePermissionDenied = (result: LocationPermissionResult) => {
      if (result.canAskAgain) {
        Alert.alert(
          'Permission Denied',
          'Location access is required for emergency features. Would you like to try again?',
          [
            { text: 'Cancel', style: 'cancel', onPress: onPermissionDenied },
            { text: 'Try Again', onPress: requestPermission },
          ],
        );
      } else {
        // Permission permanently denied
        Alert.alert(
          'Permission Required',
          'Location access has been permanently denied. Please enable it in your device settings to use emergency features.',
          [
            { text: 'Cancel', style: 'cancel', onPress: onPermissionDenied },
            {
              text: 'Open Settings',
              onPress: () => {
                LocationPermissions.openSettings();
                onPermissionDenied();
              },
            },
          ],
        );
      }
    };

    const handleManualLocationEntry = () => {
      Alert.alert(
        'Manual Location Entry',
        'You can manually enter your location in emergency situations. However, automatic location detection is more accurate and faster.',
        [
          { text: 'Continue Without Location', onPress: onPermissionDenied },
          { text: 'Grant Permission', onPress: requestPermission },
        ],
      );
    };

    const renderStep = (step: PermissionStep, index: number) => {
      const isCompleted = index < currentStep || (index === 2 && permissionResult?.granted);
      const isActive = index === currentStep;

      return (
        <View
          key={step.id}
          style={[
            styles.stepContainer,
            isActive && styles.stepContainerActive,
            isCompleted && styles.stepContainerCompleted,
          ]}
        >
          <View style={styles.stepHeader}>
            <View
              style={[
                styles.stepIcon,
                isActive && styles.stepIconActive,
                isCompleted && styles.stepIconCompleted,
              ]}
            >
              <Icon
                name={isCompleted ? 'check' : step.icon}
                type="material"
                size={24}
                color={isCompleted ? '#24a148' : isActive ? '#0f62fe' : '#a8a8a8'}
              />
            </View>
            <Text
              style={[
                styles.stepTitle,
                isActive && styles.stepTitleActive,
                isCompleted && styles.stepTitleCompleted,
              ]}
            >
              {step.title}
            </Text>
          </View>
          <Text
            style={[
              styles.stepDescription,
              isActive && styles.stepDescriptionActive,
              isCompleted && styles.stepDescriptionCompleted,
            ]}
          >
            {step.description}
          </Text>
        </View>
      );
    };

    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
        testID={testID}
      >
        <View style={styles.overlay}>
          <View style={[styles.container, isEmergencyMode && styles.emergencyContainer]}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, isEmergencyMode && styles.emergencyHeaderTitle]}>
                Location Permission
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                testID="close-permission-flow"
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
                  Emergency Mode: Location access is critical for emergency services
                </Text>
              </View>
            )}

            {/* Steps */}
            <View style={styles.stepsContainer}>
              {steps.map((step, index) => renderStep(step, index))}
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              {currentStep === 0 && (
                <>
                  <TouchableOpacity
                    style={[styles.primaryButton, isEmergencyMode && styles.emergencyButton]}
                    onPress={requestPermission}
                    disabled={isRequesting}
                    testID="request-permission-button"
                  >
                    <Text
                      style={[
                        styles.primaryButtonText,
                        isEmergencyMode && styles.emergencyButtonText,
                      ]}
                    >
                      {isRequesting ? 'Requesting...' : 'Allow Location Access'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleManualLocationEntry}
                    testID="manual-location-button"
                  >
                    <Text style={styles.secondaryButtonText}>Enter Location Manually</Text>
                  </TouchableOpacity>
                </>
              )}

              {currentStep === 1 && (
                <View style={styles.waitingContainer}>
                  <Text style={styles.waitingText}>Waiting for your response...</Text>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={checkCurrentPermission}
                    testID="check-permission-button"
                  >
                    <Text style={styles.secondaryButtonText}>Check Again</Text>
                  </TouchableOpacity>
                </View>
              )}

              {currentStep === 2 && permissionResult?.granted && (
                <View style={styles.successContainer}>
                  <Icon
                    name="check-circle"
                    type="material"
                    size={32}
                    color="#24a148"
                    style={styles.successIcon}
                  />
                  <Text style={styles.successText}>Location access granted!</Text>
                </View>
              )}
            </View>

            {/* Help Text */}
            <View style={styles.helpContainer}>
              <Text style={styles.helpText}>
                Your location data is only used for emergency services and is never stored or
                shared without your consent.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);

LocationPermissionFlow.displayName = 'LocationPermissionFlow';
import React, { memo, useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { useEmergencyMode } from '../../../providers/EmergencyModeProvider';
import { useEmergencyTheme } from '../../../providers/EmergencyUIProvider';
import { styles } from './EmergencyStatusBanner.styles';

export interface EmergencyStatusBannerProps {
  onPress?: () => void;
  onDismiss?: () => void;
  showCloseButton?: boolean;
  position?: 'top' | 'bottom';
  testID?: string;
}

export const EmergencyStatusBanner = memo<EmergencyStatusBannerProps>(
  ({
    onPress,
    onDismiss,
    showCloseButton = false,
    position = 'bottom',
    testID = 'emergency-status-banner',
  }) => {
    const theme = useEmergencyTheme();
    const { isEmergencyMode, deactivateEmergencyMode } = useEmergencyMode();
    const primaryContact = useSelector((state: RootState) => state.emergency.primaryContact);
    const userLocation = useSelector((state: RootState) => state.emergency.userLocation);

    // Animation values
    const slideAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (isEmergencyMode) {
        // Slide in and fade in
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();

        // Start pulse animation
        const pulseAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
        );
        pulseAnimation.start();

        return () => pulseAnimation.stop();
      } else {
        // Slide out and fade out
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();

        // Reset pulse
        pulseAnim.setValue(1);
      }
    }, [isEmergencyMode, slideAnim, pulseAnim, fadeAnim]);

    const handlePress = () => {
      if (onPress) {
        onPress();
      }
    };

    const handleDismiss = () => {
      if (onDismiss) {
        onDismiss();
      } else {
        deactivateEmergencyMode();
      }
    };

    if (!isEmergencyMode) {
      return null;
    }

    const containerStyle = [
      styles.container,
      position === 'top' ? styles.containerTop : styles.containerBottom,
      {
        backgroundColor: theme.colors.error,
        borderColor: theme.colors.background,
        transform: [
          { scale: pulseAnim },
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: position === 'top' ? [-100, 0] : [100, 0],
            }),
          },
        ],
        opacity: fadeAnim,
      },
    ];

    return (
      <Animated.View style={containerStyle} testID={testID}>
        <TouchableOpacity
          style={styles.content}
          onPress={handlePress}
          activeOpacity={0.8}
          testID="banner-content"
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Icon
              name="emergency"
              type="material"
              size={24}
              color={theme.colors.background}
            />
            <View
              style={[
                styles.pulseIndicator,
                {
                  borderColor: theme.colors.background,
                },
              ]}
            />
          </View>

          {/* Content */}
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.background,
                  fontSize: theme.fontSize.medium,
                },
              ]}
            >
              Emergency Mode Active
            </Text>
            
            <View style={styles.statusItems}>
              <View style={styles.statusItem}>
                <Icon
                  name="phone"
                  type="material"
                  size={12}
                  color={theme.colors.background}
                  style={styles.statusIcon}
                />
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: theme.colors.background,
                      fontSize: theme.fontSize.small,
                    },
                  ]}
                >
                  One-tap 911 ready
                </Text>
              </View>

              {userLocation && (
                <View style={styles.statusItem}>
                  <Icon
                    name="location-on"
                    type="material"
                    size={12}
                    color={theme.colors.background}
                    style={styles.statusIcon}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: theme.colors.background,
                        fontSize: theme.fontSize.small,
                      },
                    ]}
                  >
                    Location available
                  </Text>
                </View>
              )}

              {primaryContact && (
                <View style={styles.statusItem}>
                  <Icon
                    name="contact-phone"
                    type="material"
                    size={12}
                    color={theme.colors.background}
                    style={styles.statusIcon}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: theme.colors.background,
                        fontSize: theme.fontSize.small,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {primaryContact.name}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Indicators */}
          <View style={styles.actionContainer}>
            <Text
              style={[
                styles.actionText,
                {
                  color: theme.colors.background,
                  fontSize: theme.fontSize.small - 2,
                },
              ]}
            >
              TAP FOR OPTIONS
            </Text>
            <Icon
              name="keyboard-arrow-right"
              type="material"
              size={16}
              color={theme.colors.background}
            />
          </View>
        </TouchableOpacity>

        {/* Close Button */}
        {showCloseButton && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleDismiss}
            testID="banner-close"
          >
            <Icon
              name="close"
              type="material"
              size={20}
              color={theme.colors.background}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  },
);

EmergencyStatusBanner.displayName = 'EmergencyStatusBanner';
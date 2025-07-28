import React, { memo, useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { useEmergencyMode } from '../../../providers/EmergencyModeProvider';
import { useEmergencyTheme } from '../../../providers/EmergencyUIProvider';
import { styles } from './EmergencyHeader.styles';

export interface EmergencyHeaderProps {
  title?: string;
  onEmergencyPress?: () => void;
  onBackPress?: () => void;
  showBack?: boolean;
  showEmergencyToggle?: boolean;
  testID?: string;
}

export const EmergencyHeader = memo<EmergencyHeaderProps>(
  ({
    title = 'First Aid Room',
    onEmergencyPress,
    onBackPress,
    showBack = false,
    showEmergencyToggle = true,
    testID = 'emergency-header',
  }) => {
    const theme = useEmergencyTheme();
    const { isEmergencyMode, toggleEmergencyMode } = useEmergencyMode();
    const primaryContact = useSelector((state: RootState) => state.emergency.primaryContact);

    // Animation for emergency mode
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (isEmergencyMode) {
        // Slide in emergency banner
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();

        // Start pulse animation
        const pulseAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        );
        pulseAnimation.start();

        return () => pulseAnimation.stop();
      } else {
        // Slide out emergency banner
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();

        // Reset pulse
        pulseAnim.setValue(1);
      }
    }, [isEmergencyMode, pulseAnim, slideAnim]);

    const handleEmergencyPress = () => {
      if (onEmergencyPress) {
        onEmergencyPress();
      } else {
        toggleEmergencyMode();
      }
    };

    const headerStyle = [
      styles.container,
      {
        backgroundColor: theme.colors.background,
        borderBottomColor: theme.colors.border,
      },
      isEmergencyMode && {
        backgroundColor: theme.colors.error,
        borderBottomColor: theme.colors.background,
      },
    ];

    const titleStyle = [
      styles.title,
      {
        color: theme.colors.text,
        fontSize: theme.fontSize.large,
      },
      isEmergencyMode && {
        color: theme.colors.background,
        fontSize: theme.fontSize.extraLarge,
      },
    ];

    return (
      <View testID={testID}>
        {/* Emergency Banner */}
        {isEmergencyMode && (
          <Animated.View
            style={[
              styles.emergencyBanner,
              {
                backgroundColor: theme.colors.error,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-50, 0],
                    }),
                  },
                ],
                opacity: slideAnim,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.emergencyBannerContent,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Icon
                name="warning"
                type="material"
                size={20}
                color={theme.colors.background}
                style={styles.emergencyBannerIcon}
              />
              <Text
                style={[
                  styles.emergencyBannerText,
                  {
                    color: theme.colors.background,
                    fontSize: theme.fontSize.small,
                  },
                ]}
              >
                EMERGENCY MODE ACTIVE - One-tap calling enabled
              </Text>
            </Animated.View>

            {primaryContact && (
              <View style={styles.emergencyContactInfo}>
                <Text
                  style={[
                    styles.emergencyContactText,
                    {
                      color: theme.colors.background,
                      fontSize: theme.fontSize.small - 2,
                    },
                  ]}
                >
                  Emergency Contact: {primaryContact.name}
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* Main Header */}
        <View style={headerStyle}>
          <View style={styles.headerContent}>
            {/* Back Button */}
            {showBack && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={onBackPress}
                testID="header-back-button"
              >
                <Icon
                  name="arrow-back"
                  type="material"
                  size={24}
                  color={isEmergencyMode ? theme.colors.background : theme.colors.text}
                />
              </TouchableOpacity>
            )}

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={titleStyle} numberOfLines={1}>
                {title}
              </Text>
              {isEmergencyMode && (
                <Text
                  style={[
                    styles.subtitle,
                    {
                      color: theme.colors.background,
                      fontSize: theme.fontSize.small,
                    },
                  ]}
                >
                  Emergency Services Ready
                </Text>
              )}
            </View>

            {/* Emergency Toggle */}
            {showEmergencyToggle && (
              <TouchableOpacity
                style={[
                  styles.emergencyToggle,
                  isEmergencyMode && styles.emergencyToggleActive,
                  {
                    borderColor: isEmergencyMode ? theme.colors.background : theme.colors.error,
                  },
                ]}
                onPress={handleEmergencyPress}
                testID="header-emergency-toggle"
              >
                <Icon
                  name={isEmergencyMode ? 'emergency' : 'emergency-outlined'}
                  type="material"
                  size={20}
                  color={isEmergencyMode ? theme.colors.error : theme.colors.error}
                />
                {isEmergencyMode && (
                  <View
                    style={[
                      styles.emergencyIndicator,
                      {
                        backgroundColor: theme.colors.background,
                      },
                    ]}
                  />
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Progress Indicator for Emergency Mode */}
          {isEmergencyMode && (
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: theme.colors.background,
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: theme.colors.error,
                      width: '100%', // Always full in emergency mode
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    );
  },
);

EmergencyHeader.displayName = 'EmergencyHeader';
import React, { memo } from 'react';
import { Alert, Linking, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { Hospital, HospitalService } from '../../../services/hospital';
import { LocationCoordinates } from '../../../services/location';
import { PhoneService } from '../../../services/phone';
import { styles } from './HospitalCard.styles';

export interface HospitalCardProps {
  hospital: Hospital;
  currentLocation?: LocationCoordinates;
  isEmergencyMode?: boolean;
  onPress?: (hospital: Hospital) => void;
  testID?: string;
}

export const HospitalCard = memo<HospitalCardProps>(
  ({ hospital, currentLocation, isEmergencyMode = false, onPress, testID = 'hospital-card' }) => {
    const handlePress = () => {
      onPress?.(hospital);
    };

    const handleCallPress = async () => {
      if (!hospital.phone) {
        Alert.alert('No Phone Number', 'Phone number not available for this hospital', [
          { text: 'OK' },
        ]);
        return;
      }

      const result = await PhoneService.makePhoneCall(hospital.phone, hospital.name);
      if (!result.success && result.error) {
        PhoneService.handleCallError(result.error, hospital.name);
      }
    };

    const handleDirectionsPress = async () => {
      if (!currentLocation) {
        Alert.alert(
          'Location Required',
          'Please enable location services to get directions',
          [{ text: 'OK' }],
        );
        return;
      }

      const url = HospitalService.getDirectionsUrl(hospital, currentLocation);
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Navigation Error', 'Unable to open navigation app', [{ text: 'OK' }]);
      }
    };

    const getTypeIcon = () => {
      switch (hospital.type) {
        case 'emergency':
          return 'local-hospital';
        case 'urgent_care':
          return 'healing';
        default:
          return 'medical-services';
      }
    };

    const getTypeColor = () => {
      if (isEmergencyMode) return '#da1e28';
      switch (hospital.type) {
        case 'emergency':
          return '#da1e28';
        case 'urgent_care':
          return '#f1c21b';
        default:
          return '#0f62fe';
      }
    };

    return (
      <TouchableOpacity
        style={[styles.container, isEmergencyMode && styles.emergencyContainer]}
        onPress={handlePress}
        activeOpacity={0.7}
        testID={testID}
      >
        <View style={styles.header}>
          <Icon
            name={getTypeIcon()}
            type="material"
            size={24}
            color={getTypeColor()}
            style={styles.typeIcon}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {hospital.name}
            </Text>
            {hospital.hasEmergencyRoom && (
              <View style={styles.emergencyBadge}>
                <Text style={styles.emergencyBadgeText}>24/7 ER</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.address} numberOfLines={2}>
          {hospital.address}
        </Text>

        <View style={styles.distanceRow}>
          <View style={styles.distanceItem}>
            <Icon name="directions-car" type="material" size={16} color="#525252" />
            <Text style={styles.distanceText}>
              {hospital.distance ? HospitalService.formatDistance(hospital.distance) : 'N/A'}
            </Text>
          </View>
          <View style={styles.distanceItem}>
            <Icon name="access-time" type="material" size={16} color="#525252" />
            <Text style={styles.distanceText}>
              {hospital.estimatedTime ? `~${hospital.estimatedTime} min` : 'N/A'}
            </Text>
          </View>
          {hospital.rating && (
            <View style={styles.distanceItem}>
              <Icon name="star" type="material" size={16} color="#f1c21b" />
              <Text style={styles.distanceText}>{hospital.rating}</Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            onPress={handleCallPress}
            disabled={!hospital.phone}
            testID={`${testID}-call`}
          >
            <Icon
              name="phone"
              type="material"
              size={20}
              color={hospital.phone ? '#ffffff' : '#a8a8a8'}
            />
            <Text style={[styles.actionButtonText, styles.callButtonText]}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.directionsButton]}
            onPress={handleDirectionsPress}
            disabled={!currentLocation}
            testID={`${testID}-directions`}
          >
            <Icon
              name="directions"
              type="material"
              size={20}
              color={currentLocation ? '#0f62fe' : '#a8a8a8'}
            />
            <Text style={styles.actionButtonText}>Directions</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  },
);

HospitalCard.displayName = 'HospitalCard';
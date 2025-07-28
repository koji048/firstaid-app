import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../store/store';
import { setEmergencyMode } from '../store/slices/emergencySlice';
import { EmergencyServicesButton } from '../components/emergency/EmergencyServicesButton';
import { LocationDisplay } from '../components/emergency/LocationDisplay';
import { PrimaryContactCard } from '../components/emergency/PrimaryContactCard';
import { HospitalList } from '../components/emergency/HospitalList';
import { LocationCoordinates } from '../services/location';
import { Hospital } from '../services/hospital';

const EmergencyModeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isEmergencyMode = useSelector((state: RootState) => state.emergency.isEmergencyMode);
  const primaryContact = useSelector((state: RootState) => state.emergency.primaryContact);
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates | null>(null);

  useEffect(() => {
    // Enable emergency mode when screen is mounted
    if (!isEmergencyMode) {
      dispatch(setEmergencyMode(true));
    }

    // Set status bar to red in emergency mode
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('#da1e28');

    return () => {
      // Cleanup status bar on unmount
      StatusBar.setBarStyle('default');
      StatusBar.setBackgroundColor('#ffffff');
    };
  }, [dispatch, isEmergencyMode]);

  const handleExitEmergencyMode = () => {
    Alert.alert('Exit Emergency Mode', 'Are you sure you want to exit emergency mode?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Exit',
        style: 'destructive',
        onPress: () => {
          dispatch(setEmergencyMode(false));
          navigation.goBack();
        },
      },
    ]);
  };

  const handleLocationUpdate = (location: LocationCoordinates | null) => {
    setCurrentLocation(location);
  };

  const handleHospitalSelect = (hospital: Hospital) => {
    Alert.alert(
      hospital.name,
      `${hospital.address}\n\nPhone: ${hospital.phone || 'Not available'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        ...(hospital.phone
          ? [
              {
                text: 'Call',
                onPress: async () => {
                  const { PhoneService } = require('../services/phone');
                  const result = await PhoneService.makePhoneCall(
                    hospital.phone!,
                    hospital.name,
                  );
                  if (!result.success && result.error) {
                    PhoneService.handleCallError(result.error, hospital.name);
                  }
                },
              },
            ]
          : []),
        {
          text: 'Get Directions',
          onPress: async () => {
            if (!currentLocation) {
              Alert.alert('Location Required', 'Please enable location services', [
                { text: 'OK' },
              ]);
              return;
            }
            const { HospitalService } = require('../services/hospital');
            const { Linking } = require('react-native');
            const url = HospitalService.getDirectionsUrl(hospital, currentLocation);
            await Linking.openURL(url);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#da1e28" />

      {/* Emergency Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Icon
            name="warning"
            type="material"
            size={28}
            color="#ffffff"
            style={styles.headerIcon}
          />
          <Text style={styles.headerTitle}>EMERGENCY MODE</Text>
        </View>
        <TouchableOpacity
          style={styles.exitButton}
          onPress={handleExitEmergencyMode}
          testID="exit-emergency-mode"
        >
          <Icon name="close" type="material" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Emergency Services Button */}
        <View style={styles.section}>
          <EmergencyServicesButton />
        </View>

        {/* Location Display */}
        <View style={styles.section}>
          <LocationDisplay
            emergencyMode={true}
            onLocationUpdate={handleLocationUpdate}
            autoFetch={true}
          />
        </View>

        {/* Emergency Contact */}
        {primaryContact && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Primary Emergency Contact</Text>
            <PrimaryContactCard contact={primaryContact} isEmergencyMode={true} />
          </View>
        )}

        {/* Emergency Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What to Tell 911</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Icon
                name="location-on"
                type="material"
                size={20}
                color="#da1e28"
                style={styles.infoIcon}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Your Location</Text>
                <Text style={styles.infoText}>
                  {currentLocation
                    ? `Lat: ${currentLocation.latitude.toFixed(
                        6,
                      )}, Long: ${currentLocation.longitude.toFixed(6)}`
                    : 'Share your current address or nearest landmark'}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Icon
                name="medical-services"
                type="material"
                size={20}
                color="#da1e28"
                style={styles.infoIcon}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nature of Emergency</Text>
                <Text style={styles.infoText}>Describe what happened and any injuries</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Icon
                name="people"
                type="material"
                size={20}
                color="#da1e28"
                style={styles.infoIcon}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Number of People</Text>
                <Text style={styles.infoText}>How many people need help</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Icon
                name="access-time"
                type="material"
                size={20}
                color="#da1e28"
                style={styles.infoIcon}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Stay on the Line</Text>
                <Text style={styles.infoText}>Don't hang up until told to do so</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Nearby Hospitals */}
        <View style={[styles.section, styles.hospitalSection]}>
          <Text style={styles.sectionTitle}>Nearby Hospitals</Text>
          <View style={styles.hospitalListContainer}>
            <HospitalList
              location={currentLocation}
              isEmergencyMode={isEmergencyMode}
              onHospitalSelect={handleHospitalSelect}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#da1e28',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'IBMPlexSans-SemiBold',
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 1.2,
  },
  exitButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '500',
    color: '#161616',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  infoCard: {
    backgroundColor: '#f4f4f4',
    marginHorizontal: 16,
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '500',
    color: '#161616',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#525252',
    lineHeight: 20,
  },
  hospitalSection: {
    flex: 1,
    marginBottom: 24,
  },
  hospitalListContainer: {
    height: 400,
    marginTop: 8,
  },
});

export default EmergencyModeScreen;

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-elements';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../store/store';
import { toggleEmergencyMode } from '../../store/slices/emergencySlice';
import { EmergencyModeToggle } from '../../components/emergency/EmergencyModeToggle/EmergencyModeToggle';
import { QuickActionsBar } from '../../components/guides/QuickActionsBar/QuickActionsBar';
import { styles } from './HomeScreen.styles';
import type { HomeStackScreenProps } from '../../navigation/types';

type HomeScreenProps = HomeStackScreenProps<'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = memo(() => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { isEmergencyMode, primaryContact, contacts } = useSelector(
    (state: RootState) => state.emergency,
  );

  const { guides } = useSelector((state: RootState) => state.guides);

  const handleEmergencyModeToggle = useCallback(
    (enabled: boolean) => {
      dispatch(toggleEmergencyMode(enabled));
    },
    [dispatch],
  );

  const handleNavigateToGuides = useCallback(() => {
    navigation.navigate('GuidesStack', { screen: 'GuidesList' });
  }, [navigation]);

  const handleNavigateToMedical = useCallback(() => {
    navigation.navigate('MedicalStack', { screen: 'MedicalProfile' });
  }, [navigation]);

  const handleNavigateToEmergencyContacts = useCallback(() => {
    navigation.navigate('EmergencyContacts');
  }, [navigation]);

  const handleNavigateToSettings = useCallback(() => {
    navigation.navigate('SettingsStack', { screen: 'Settings' });
  }, [navigation]);

  const QuickActionCard: React.FC<{
    title: string;
    description: string;
    iconName: string;
    iconType?: string;
    onPress: () => void;
    backgroundColor?: string;
    textColor?: string;
    testID?: string;
  }> = ({
    title,
    description,
    iconName,
    iconType = 'material',
    onPress,
    backgroundColor = '#f4f4f4',
    textColor = '#161616',
    testID,
  }) => (
    <TouchableOpacity
      style={[styles.quickActionCard, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.8}
      testID={testID}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
    >
      <View style={styles.cardIconContainer}>
        <Icon
          name={iconName}
          type={iconType}
          size={32}
          color={textColor}
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: textColor }]}>{title}</Text>
        <Text style={[styles.cardDescription, { color: textColor }]}>{description}</Text>
      </View>
      <Icon
        name="chevron-right"
        type="material"
        size={24}
        color={textColor}
        style={styles.cardChevron}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle={isEmergencyMode ? 'light-content' : 'dark-content'}
        backgroundColor={isEmergencyMode ? '#da1e28' : '#ffffff'}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appTitle}>First Aid Room</Text>
          <Text style={styles.subtitle}>
            Quick access to emergency services and first aid guidance
          </Text>
        </View>

        {/* Emergency Mode Toggle */}
        <View style={styles.emergencySection}>
          <EmergencyModeToggle
            isEmergencyMode={isEmergencyMode}
            onToggle={handleEmergencyModeToggle}
            testID="home-emergency-toggle"
          />
        </View>

        {/* Quick Actions Bar - Only show in emergency mode */}
        {isEmergencyMode && (
          <View style={styles.quickActionsSection}>
            <QuickActionsBar testID="home-quick-actions" />
          </View>
        )}

        {/* Quick Action Cards Grid */}
        <View style={styles.quickActionsGrid}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.cardGrid}>
            <QuickActionCard
              title="Emergency Contacts"
              description={
                contacts.length > 0
                  ? `${contacts.length} contact${contacts.length > 1 ? 's' : ''} saved`
                  : 'Add emergency contacts'
              }
              iconName="contacts"
              onPress={handleNavigateToEmergencyContacts}
              testID="emergency-contacts-card"
            />

            <QuickActionCard
              title="First Aid Guides"
              description={
                guides.length > 0
                  ? `${guides.length} guide${guides.length > 1 ? 's' : ''} available`
                  : 'Browse medical guides'
              }
              iconName="book-open"
              iconType="material-community"
              onPress={handleNavigateToGuides}
              testID="guides-card"
            />

            <QuickActionCard
              title="Medical Profile"
              description="View your medical information"
              iconName="local-hospital"
              onPress={handleNavigateToMedical}
              testID="medical-profile-card"
            />

            <QuickActionCard
              title="Settings"
              description="App preferences and data"
              iconName="settings"
              onPress={handleNavigateToSettings}
              testID="settings-card"
            />
          </View>
        </View>

        {/* Emergency Contact Summary */}
        {primaryContact && (
          <View style={styles.primaryContactSection}>
            <Text style={styles.sectionTitle}>Primary Emergency Contact</Text>
            <View style={styles.contactCard}>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{primaryContact.name}</Text>
                <Text style={styles.contactRelation}>
                  {primaryContact.relationship} • {primaryContact.phone}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.contactCallButton}
                onPress={() => {
                  Alert.alert(
                    'Call Emergency Contact',
                    `Call ${primaryContact.name} at ${primaryContact.phone}?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Call',
                        onPress: () => {
                          // Handle emergency contact call
                        },
                      },
                    ],
                  );
                }}
                accessible={true}
                accessibilityLabel={`Call ${primaryContact.name}`}
                accessibilityRole="button"
              >
                <Icon name="phone" type="material" size={20} color="#0f62fe" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
});

HomeScreen.displayName = 'HomeScreen';

export default HomeScreen;

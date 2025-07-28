import React, { memo, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { Hospital, HospitalService } from '../../../services/hospital';
import { LocationCoordinates } from '../../../services/location';
import { HospitalCard } from '../HospitalCard';
import { styles } from './HospitalList.styles';

export interface HospitalListProps {
  location: LocationCoordinates | null;
  isEmergencyMode?: boolean;
  onHospitalSelect?: (hospital: Hospital) => void;
  testID?: string;
}

export const HospitalList = memo<HospitalListProps>(
  ({ location, isEmergencyMode = false, onHospitalSelect, testID = 'hospital-list' }) => {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      if (location) {
        fetchHospitals();
      }
    }, [location]);

    const fetchHospitals = async (isRefresh = false) => {
      if (!location) {
        setError('Location required to find nearby hospitals');
        return;
      }

      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const result = await HospitalService.getNearbyHospitals(location, !isRefresh);

        if (result.success && result.hospitals) {
          setHospitals(result.hospitals);
        } else {
          setError(result.error || 'Failed to fetch hospitals');
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };

    const handleRefresh = () => {
      fetchHospitals(true);
    };

    const renderItem = ({ item }: { item: Hospital }) => (
      <HospitalCard
        hospital={item}
        currentLocation={location || undefined}
        isEmergencyMode={isEmergencyMode}
        onPress={onHospitalSelect}
        testID={`${testID}-card-${item.id}`}
      />
    );

    const renderEmpty = () => {
      if (isLoading) {
        return null;
      }

      return (
        <View style={styles.emptyContainer}>
          <Icon
            name="local-hospital"
            type="material"
            size={48}
            color="#a8a8a8"
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>
            {!location
              ? 'Enable location to find nearby hospitals'
              : 'No hospitals found nearby'}
          </Text>
        </View>
      );
    };

    const renderHeader = () => {
      if (hospitals.length === 0) return null;

      return (
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {hospitals.length} hospital{hospitals.length !== 1 ? 's' : ''} nearby
          </Text>
          {isEmergencyMode && (
            <View style={styles.emergencyNote}>
              <Icon name="info" type="material" size={16} color="#da1e28" />
              <Text style={styles.emergencyNoteText}>
                Showing hospitals with emergency rooms first
              </Text>
            </View>
          )}
        </View>
      );
    };

    if (!location && !isLoading) {
      return (
        <View style={[styles.container, styles.centerContent]} testID={testID}>
          <Icon
            name="location-off"
            type="material"
            size={48}
            color="#a8a8a8"
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>Location required to find nearby hospitals</Text>
        </View>
      );
    }

    if (isLoading && hospitals.length === 0) {
      return (
        <View style={[styles.container, styles.centerContent]} testID={testID}>
          <ActivityIndicator size="large" color="#0f62fe" />
          <Text style={styles.loadingText}>Finding nearby hospitals...</Text>
        </View>
      );
    }

    if (error && hospitals.length === 0) {
      return (
        <View style={[styles.container, styles.centerContent]} testID={testID}>
          <Icon
            name="error"
            type="material"
            size={48}
            color="#da1e28"
            style={styles.emptyIcon}
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={hospitals}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#0f62fe']}
            tintColor="#0f62fe"
          />
        }
        contentContainerStyle={hospitals.length === 0 ? styles.emptyListContent : undefined}
        showsVerticalScrollIndicator={false}
        testID={testID}
      />
    );
  },
);

HospitalList.displayName = 'HospitalList';
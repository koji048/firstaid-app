import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, RefreshControl, SectionList, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useEmergencyContacts } from '../../../hooks/useEmergencyContacts';
import {
  selectFilteredContacts,
  selectSearchQuery,
} from '../../../store/slices/emergencyContactsSlice';
import { ContactCategory, EmergencyContact } from '../../../types/emergencyContact';
import ContactListItem from '../ContactListItem';
import EmptyContactsState from '../EmptyContactsState';
import { styles } from './ContactList.styles';

export interface ContactListProps {
  onContactPress: (contact: EmergencyContact) => void;
  onEditPress: (contact: EmergencyContact) => void;
  onDeletePress: (contact: EmergencyContact) => void;
  isEmergencyMode?: boolean;
  onQuickCall?: (contact: EmergencyContact) => void;
}

interface SectionData {
  title: string;
  data: EmergencyContact[];
}

const CATEGORY_ORDER: ContactCategory[] = [
  ContactCategory.FAMILY,
  ContactCategory.MEDICAL,
  ContactCategory.WORK,
  ContactCategory.OTHER,
];

const CATEGORY_LABELS: Record<ContactCategory, string> = {
  [ContactCategory.FAMILY]: 'Family',
  [ContactCategory.MEDICAL]: 'Medical',
  [ContactCategory.WORK]: 'Work',
  [ContactCategory.OTHER]: 'Other',
};

export const ContactList: React.FC<ContactListProps> = ({
  onContactPress,
  onEditPress,
  onDeletePress,
  isEmergencyMode = false,
  onQuickCall,
}) => {
  const { loading, refreshing, refreshContacts } = useEmergencyContacts();
  const filteredContacts = useSelector(selectFilteredContacts);
  const searchQuery = useSelector(selectSearchQuery);

  const sections = useMemo((): SectionData[] => {
    const grouped = CATEGORY_ORDER.reduce((acc, category) => {
      const categoryContacts = filteredContacts.filter((c) => c.category === category);
      if (categoryContacts.length > 0) {
        acc.push({
          title: CATEGORY_LABELS[category],
          data: categoryContacts.sort((a, b) => {
            if (a.isPrimary && !b.isPrimary) {
              return -1;
            }
            if (!a.isPrimary && b.isPrimary) {
              return 1;
            }
            return a.name.localeCompare(b.name);
          }),
        });
      }
      return acc;
    }, [] as SectionData[]);

    return grouped;
  }, [filteredContacts]);

  const renderItem = useCallback(
    ({ item }: { item: EmergencyContact }) => (
      <ContactListItem
        contact={item}
        onPress={() => onContactPress(item)}
        onEditPress={() => onEditPress(item)}
        onDeletePress={() => onDeletePress(item)}
        isEmergencyMode={isEmergencyMode}
        onQuickCall={onQuickCall}
      />
    ),
    [onContactPress, onEditPress, onDeletePress, isEmergencyMode, onQuickCall],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: SectionData }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
      </View>
    ),
    [],
  );

  const keyExtractor = useCallback((item: EmergencyContact) => item.id, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0f62fe" testID="loading-indicator" />
      </View>
    );
  }

  if (filteredContacts.length === 0 && !searchQuery) {
    return <EmptyContactsState />;
  }

  if (filteredContacts.length === 0 && searchQuery) {
    return (
      <View style={styles.noResultsContainer}>
        <Text style={styles.noResultsText}>No contacts found matching "{searchQuery}"</Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={keyExtractor}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshContacts} tintColor="#0f62fe" />
      }
      stickySectionHeadersEnabled={true}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

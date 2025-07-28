import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import {
  ContactCategory,
  ContactRelationship,
  EmergencyContact,
} from '../../../types/emergencyContact';
import { styles } from './ContactListItem.styles';

export interface ContactListItemProps {
  contact: EmergencyContact;
  onPress: () => void;
  onEditPress: () => void;
  onDeletePress: () => void;
  isEmergencyMode?: boolean;
  onQuickCall?: (contact: EmergencyContact) => void;
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

const CATEGORY_COLORS: Record<ContactCategory, string> = {
  [ContactCategory.FAMILY]: '#0f62fe',
  [ContactCategory.MEDICAL]: '#24a148',
  [ContactCategory.WORK]: '#8a3ffc',
  [ContactCategory.OTHER]: '#525252',
};

export const ContactListItem: React.FC<ContactListItemProps> = memo(
  ({ contact, onPress, onEditPress, onDeletePress, isEmergencyMode = false, onQuickCall }) => {
    const categoryColor = CATEGORY_COLORS[contact.category];

    const handleMainPress = () => {
      if (isEmergencyMode && onQuickCall && contact.phone) {
        onQuickCall(contact);
      } else {
        onPress();
      }
    };

    const containerStyle = [styles.container, isEmergencyMode && styles.emergencyContainer];

    const nameStyle = [styles.name, isEmergencyMode && styles.emergencyName];

    const phoneStyle = [styles.phone, isEmergencyMode && styles.emergencyPhone];

    const relationshipStyle = [
      styles.relationship,
      isEmergencyMode && styles.emergencyRelationship,
    ];

    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={handleMainPress}
        activeOpacity={0.7}
        testID="contact-list-item"
      >
        <View
          style={[styles.categoryIndicator, { backgroundColor: categoryColor }]}
          testID="category-indicator"
        />

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={nameStyle}>{contact.name}</Text>
            {contact.isPrimary && (
              <Icon
                name="star"
                type="material"
                size={isEmergencyMode ? 24 : 20}
                color="#ffd700"
                style={styles.primaryIcon}
                testID="primary-icon"
              />
            )}
          </View>

          <Text style={phoneStyle}>{contact.phone}</Text>

          <Text style={relationshipStyle}>{RELATIONSHIP_LABELS[contact.relationship]}</Text>
        </View>

        {isEmergencyMode ? (
          <View style={styles.emergencyCallIcon}>
            <Icon
              name="phone"
              type="material"
              size={28}
              color={contact.phone ? '#da1e28' : '#a8a8a8'}
              testID="emergency-call-icon"
            />
          </View>
        ) : (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onEditPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              testID="edit-button"
            >
              <Icon name="edit" type="material" size={22} color="#0f62fe" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={onDeletePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              testID="delete-button"
            >
              <Icon name="delete" type="material" size={22} color="#da1e28" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  },
);

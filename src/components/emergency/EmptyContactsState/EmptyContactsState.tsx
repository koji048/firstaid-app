import React from 'react';
import { Text, View } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../../navigation/types';
import { styles } from './EmptyContactsState.styles';

export type EmptyContactsStateProps = Record<string, never>;

export const EmptyContactsState: React.FC<EmptyContactsStateProps> = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleAddContact = () => {
    navigation.navigate('Home', {
      screen: 'AddEmergencyContact',
      params: {},
    });
  };

  return (
    <View style={styles.container}>
      <Icon
        name="contacts"
        type="material"
        size={80}
        color="#e0e0e0"
        style={styles.icon}
        testID="empty-state-icon"
      />

      <Text style={styles.title}>No Emergency Contacts</Text>

      <Text style={styles.description}>
        Add emergency contacts to quickly reach them in case of an emergency. Store family members,
        doctors, and other important contacts.
      </Text>

      <Button
        title="Add Your First Contact"
        onPress={handleAddContact}
        buttonStyle={styles.button}
        titleStyle={styles.buttonText}
        icon={<Icon name="add" type="material" size={20} color="#ffffff" />}
      />
    </View>
  );
};

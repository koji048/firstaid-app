import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Switch, Text, View } from 'react-native';
import { Button, Input } from 'react-native-elements';
import { Picker } from '@react-native-picker/picker';
import { Controller, useForm } from 'react-hook-form';
import {
  ContactCategory,
  ContactRelationship,
  EmergencyContact,
  NewEmergencyContact,
} from '../../../types/emergencyContact';
import { formatPhoneNumber, validatePhoneNumber } from '../../../utils/phoneNumber';
import { styles } from './ContactForm.styles';

export interface ContactFormProps {
  initialValues?: Partial<EmergencyContact>;
  onSubmit: (values: NewEmergencyContact) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormValues {
  name: string;
  phone: string;
  relationship: ContactRelationship;
  category: ContactCategory;
  isPrimary: boolean;
  notes: string;
}

const CATEGORY_OPTIONS = [
  { label: 'Family', value: ContactCategory.FAMILY },
  { label: 'Medical', value: ContactCategory.MEDICAL },
  { label: 'Work', value: ContactCategory.WORK },
  { label: 'Other', value: ContactCategory.OTHER },
];

const RELATIONSHIP_OPTIONS = [
  { label: 'Spouse', value: ContactRelationship.SPOUSE },
  { label: 'Parent', value: ContactRelationship.PARENT },
  { label: 'Child', value: ContactRelationship.CHILD },
  { label: 'Sibling', value: ContactRelationship.SIBLING },
  { label: 'Friend', value: ContactRelationship.FRIEND },
  { label: 'Doctor', value: ContactRelationship.DOCTOR },
  { label: 'Other', value: ContactRelationship.OTHER },
];

export const ContactForm: React.FC<ContactFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: initialValues?.name || '',
      phone: initialValues?.phone || '',
      relationship: initialValues?.relationship || ContactRelationship.OTHER,
      category: initialValues?.category || ContactCategory.OTHER,
      isPrimary: initialValues?.isPrimary || false,
      notes: initialValues?.notes || '',
    },
  });

  const onFormSubmit = (data: FormValues) => {
    onSubmit({
      name: data.name.trim(),
      phone: data.phone,
      relationship: data.relationship,
      category: data.category,
      isPrimary: data.isPrimary,
      notes: data.notes.trim(),
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Controller
          control={control}
          name="name"
          rules={{
            required: 'Name is required',
            maxLength: {
              value: 50,
              message: 'Name must be less than 50 characters',
            },
          }}
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label="Name"
              placeholder="Enter contact name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              errorMessage={errors.name?.message}
              inputContainerStyle={styles.inputContainer}
              labelStyle={styles.label}
              inputStyle={styles.input}
              errorStyle={styles.error}
              autoCapitalize="words"
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          rules={{
            required: 'Phone number is required',
            validate: (value) => validatePhoneNumber(value) || 'Invalid phone number',
          }}
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label="Phone Number"
              placeholder="Enter phone number"
              value={value}
              onChangeText={(text) => onChange(formatPhoneNumber(text))}
              onBlur={onBlur}
              errorMessage={errors.phone?.message}
              inputContainerStyle={styles.inputContainer}
              labelStyle={styles.label}
              inputStyle={styles.input}
              errorStyle={styles.error}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          )}
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Relationship</Text>
          <Controller
            control={control}
            name="relationship"
            render={({ field: { onChange, value } }) => (
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  {RELATIONSHIP_OPTIONS.map((option) => (
                    <Picker.Item key={option.value} label={option.label} value={option.value} />
                  ))}
                </Picker>
              </View>
            )}
          />
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Category</Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <Picker.Item key={option.value} label={option.label} value={option.value} />
                  ))}
                </Picker>
              </View>
            )}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Primary Contact</Text>
          <Controller
            control={control}
            name="isPrimary"
            render={({ field: { onChange, value } }) => (
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: '#e0e0e0', true: '#0f62fe' }}
                thumbColor="#ffffff"
                ios_backgroundColor="#e0e0e0"
              />
            )}
          />
        </View>

        <Controller
          control={control}
          name="notes"
          rules={{
            maxLength: {
              value: 200,
              message: 'Notes must be less than 200 characters',
            },
          }}
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label="Notes (Optional)"
              placeholder="Add any additional notes"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              errorMessage={errors.notes?.message}
              inputContainerStyle={styles.inputContainer}
              labelStyle={styles.label}
              inputStyle={[styles.input, styles.textArea]}
              errorStyle={styles.error}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          )}
        />

        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={onCancel}
            buttonStyle={[styles.button, styles.cancelButton]}
            titleStyle={styles.cancelButtonText}
            disabled={isLoading}
          />
          <Button
            title={initialValues ? 'Update Contact' : 'Add Contact'}
            onPress={handleSubmit(onFormSubmit)}
            buttonStyle={[styles.button, styles.submitButton]}
            titleStyle={styles.submitButtonText}
            loading={isLoading}
            disabled={isLoading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { styles } from './ContactSearchBar.styles';

export interface ContactSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const DEBOUNCE_DELAY = 300;

export const ContactSearchBar: React.FC<ContactSearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search contacts...',
}) => {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChangeText = useCallback(
    (text: string) => {
      setLocalValue(text);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onChangeText(text);
      }, DEBOUNCE_DELAY);
    },
    [onChangeText],
  );

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChangeText('');
    inputRef.current?.focus();
  }, [onChangeText]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" type="material" size={20} color="#525252" style={styles.searchIcon} />

        <TextInput
          ref={inputRef}
          style={styles.input}
          value={localValue}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor="#525252"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="never"
        />

        {localValue.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.clearButton}
            testID="clear-button"
          >
            <Icon name="close" type="material" size={20} color="#525252" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-elements';
import Voice from '@react-native-voice/voice';
import Haptics from 'react-native-haptic-feedback';
import { debounce } from 'lodash';
import { styles } from './SearchBar.styles';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  suggestions?: string[];
  recentSearches?: string[];
  onSuggestionPress?: (suggestion: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  testID?: string;
}

const COMMON_MISSPELLINGS: Record<string, string> = {
  'hart attack': 'heart attack',
  hart: 'heart',
  breething: 'breathing',
  breathe: 'breathing',
  unconcious: 'unconscious',
  unconsius: 'unconscious',
  chocking: 'choking',
  choked: 'choking',
  bleding: 'bleeding',
  poisin: 'poison',
  poisining: 'poisoning',
  alergic: 'allergic',
  alergy: 'allergy',
  diabetis: 'diabetes',
  seisure: 'seizure',
  sezure: 'seizure',
  stroak: 'stroke',
  strok: 'stroke',
  burnd: 'burned',
  electrik: 'electric',
  electical: 'electrical',
};

const SYMPTOM_ALIASES: Record<string, string[]> = {
  'chest pain': ['heart attack', 'cardiac emergency', 'angina'],
  "can't breathe": ['choking', 'asthma', 'breathing difficulty', 'respiratory emergency'],
  bleeding: ['hemorrhage', 'wound', 'cut', 'laceration'],
  'not breathing': ['cpr', 'cardiac arrest', 'respiratory arrest'],
  unconscious: ['fainting', 'passed out', 'unresponsive'],
  burn: ['scald', 'thermal injury', 'heat injury'],
  'broken bone': ['fracture', 'break', 'bone injury'],
  'head injury': ['concussion', 'head trauma', 'skull fracture'],
  'stomach pain': ['abdominal pain', 'poisoning', 'appendicitis'],
  'allergic reaction': ['anaphylaxis', 'allergy', 'hives'],
};

export const SearchBar: React.FC<SearchBarProps> = memo(
  ({
    value,
    onChangeText,
    onSubmit,
    suggestions = [],
    recentSearches = [],
    onSuggestionPress,
    placeholder = 'Search: choking, bleeding, burns...',
    autoFocus = false,
    testID = 'search-bar',
  }) => {
    const [isListening, setIsListening] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [voiceError, setVoiceError] = useState<string | null>(null);
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
      Voice.onSpeechStart = () => setIsListening(true);
      Voice.onSpeechEnd = () => setIsListening(false);
      Voice.onSpeechError = (e) => {
        setIsListening(false);
        setVoiceError('Voice recognition failed. Please try again.');
        console.error('Voice error:', e);
      };
      Voice.onSpeechResults = (e) => {
        if (e.value && e.value[0]) {
          const spokenText = e.value[0].toLowerCase();
          const correctedText = correctMisspelling(spokenText);
          onChangeText(correctedText);
          setIsListening(false);
        }
      };

      return () => {
        Voice.destroy().then(Voice.removeAllListeners);
      };
    }, [onChangeText]);

    const correctMisspelling = (text: string): string => {
      let corrected = text.toLowerCase();

      Object.entries(COMMON_MISSPELLINGS).forEach(([misspelling, correction]) => {
        const regex = new RegExp(`\\b${misspelling}\\b`, 'gi');
        corrected = corrected.replace(regex, correction);
      });

      return corrected;
    };

    const handleTextChange = useCallback(
      (text: string) => {
        const correctedText = correctMisspelling(text);
        onChangeText(correctedText);
        setShowSuggestions(true);
        setVoiceError(null);
      },
      [onChangeText],
    );

    const debouncedTextChange = useCallback(debounce(handleTextChange, 300), [handleTextChange]);

    const startVoiceRecognition = async () => {
      try {
        setVoiceError(null);
        await Voice.start('en-US');
        Haptics.trigger('impactMedium', {
          enableVibrateFallback: true,
          ignoreAndroidSystemSettings: false,
        });
      } catch (e) {
        setVoiceError('Voice recognition not available');
        console.error('Voice start error:', e);
      }
    };

    const stopVoiceRecognition = async () => {
      try {
        await Voice.stop();
        setIsListening(false);
      } catch (e) {
        console.error('Voice stop error:', e);
      }
    };

    const handleClear = () => {
      onChangeText('');
      setShowSuggestions(false);
      inputRef.current?.focus();
      Haptics.trigger('impactLight');
    };

    const handleSuggestionPress = (suggestion: string) => {
      onChangeText(suggestion);
      setShowSuggestions(false);
      Keyboard.dismiss();
      if (onSuggestionPress) {
        onSuggestionPress(suggestion);
      }
      Haptics.trigger('impactLight');
    };

    const getAllSuggestions = () => {
      const allSuggestions = [...suggestions];

      if (value && recentSearches.length > 0) {
        const recentMatches = recentSearches.filter((search) =>
          search.toLowerCase().includes(value.toLowerCase()),
        );
        allSuggestions.unshift(...recentMatches.map((s) => `Recent: ${s}`));
      }

      const symptomMatches = Object.entries(SYMPTOM_ALIASES).filter(([symptom]) =>
        value.toLowerCase().includes(symptom),
      );

      symptomMatches.forEach(([, aliases]) => {
        aliases.forEach((alias) => {
          if (!allSuggestions.includes(alias)) {
            allSuggestions.push(`Try: ${alias}`);
          }
        });
      });

      return allSuggestions.slice(0, 10);
    };

    const renderSuggestion = ({ item }: { item: string }) => (
      <TouchableOpacity
        style={styles.suggestionItem}
        onPress={() => handleSuggestionPress(item.replace(/^(Recent: |Try: )/, ''))}
        testID={`suggestion-${item}`}
      >
        <Icon
          name={item.startsWith('Recent:') ? 'history' : 'search'}
          type="material"
          size={20}
          color="#525252"
          style={styles.suggestionIcon}
        />
        <Text style={styles.suggestionText}>{item}</Text>
      </TouchableOpacity>
    );

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.searchContainer}>
          <Icon name="search" type="material" size={24} color="#525252" style={styles.searchIcon} />

          <TextInput
            ref={inputRef}
            style={styles.input}
            value={value}
            onChangeText={debouncedTextChange}
            onSubmitEditing={onSubmit}
            placeholder={placeholder}
            placeholderTextColor="#6f6f6f"
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={autoFocus}
            onFocus={() => setShowSuggestions(true)}
            testID={testID}
            accessible={true}
            accessibilityLabel="Search for first aid guides"
            accessibilityHint="Type to search or use voice input"
          />

          {value.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              testID="clear-button"
              accessible={true}
              accessibilityLabel="Clear search"
              accessibilityRole="button"
            >
              <Icon name="close" type="material" size={20} color="#525252" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
            onPress={isListening ? stopVoiceRecognition : startVoiceRecognition}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            testID="voice-button"
            accessible={true}
            accessibilityLabel={isListening ? 'Stop voice input' : 'Start voice input'}
            accessibilityRole="button"
          >
            <Icon
              name={isListening ? 'mic' : 'mic-none'}
              type="material"
              size={24}
              color={isListening ? '#da1e28' : '#525252'}
            />
          </TouchableOpacity>
        </View>

        {voiceError && (
          <Text style={styles.errorText} testID="voice-error">
            {voiceError}
          </Text>
        )}

        {!value && recentSearches.length > 0 && showSuggestions && (
          <View style={styles.helperTextContainer}>
            <Text style={styles.helperText}>Recent searches</Text>
          </View>
        )}

        {value && showSuggestions && (
          <View style={styles.helperTextContainer}>
            <Text style={styles.helperText}>Try: "chest pain", "can't breathe", "bleeding"</Text>
          </View>
        )}

        {showSuggestions && getAllSuggestions().length > 0 && (
          <FlatList
            data={getAllSuggestions()}
            renderItem={renderSuggestion}
            keyExtractor={(item, index) => `${item}-${index}`}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            testID="suggestions-list"
          />
        )}
      </KeyboardAvoidingView>
    );
  },
);

SearchBar.displayName = 'SearchBar';

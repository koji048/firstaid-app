import React, { memo } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { styles } from './Button.styles';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const Button = memo<ButtonProps>(
  ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
    textStyle,
    testID = 'button',
  }) => {
    const { colors } = useTheme();

    const isDisabled = disabled || loading;

    return (
      <TouchableOpacity
        style={[
          styles.container,
          styles[variant],
          styles[size],
          isDisabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        disabled={isDisabled}
        testID={testID}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} size="small" />
        ) : (
          <Text
            style={[
              styles.text,
              styles[`${variant}Text`],
              styles[`${size}Text`],
              isDisabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
      </TouchableOpacity>
    );
  },
);

Button.displayName = 'Button';

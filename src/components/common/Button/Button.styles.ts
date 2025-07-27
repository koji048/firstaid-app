import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
  },

  // Variants
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#F2F2F7',
  },
  danger: {
    backgroundColor: '#FF3B30',
  },

  // Sizes
  small: {
    paddingVertical: 8,
    minWidth: 80,
  },
  medium: {
    paddingVertical: 12,
    minWidth: 120,
  },
  large: {
    paddingVertical: 16,
    minWidth: 160,
  },

  // States
  disabled: {
    opacity: 0.5,
  },

  // Text styles
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#000000',
  },
  dangerText: {
    color: '#FFFFFF',
  },

  // Text sizes
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },

  disabledText: {
    opacity: 0.7,
  },
});

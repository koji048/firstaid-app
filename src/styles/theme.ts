import { Theme } from '@react-navigation/native';

export const Colors = {
  primary: '#007AFF',
  secondary: '#5AC8FA',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  info: '#5856D6',

  // Grays
  gray1: '#8E8E93',
  gray2: '#AEAEB2',
  gray3: '#C7C7CC',
  gray4: '#D1D1D6',
  gray5: '#E5E5EA',
  gray6: '#F2F2F7',

  // Semantic colors
  background: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',
  text: '#000000',
  textSecondary: '#3C3C43',
  textTertiary: '#C7C7CC',
  border: '#C6C6C8',

  // Dark mode colors
  darkBackground: '#000000',
  darkBackgroundSecondary: '#1C1C1E',
  darkText: '#FFFFFF',
  darkTextSecondary: '#EBEBF5',
  darkTextTertiary: '#48484A',
  darkBorder: '#38383A',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Typography = {
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: 0.41,
  },
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 0.36,
  },
  title2: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: 0.35,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.38,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.41,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    letterSpacing: -0.41,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: -0.32,
  },
  subheadline: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: -0.24,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: -0.08,
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    letterSpacing: 0.07,
  },
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export const LightTheme: Theme = {
  dark: false,
  colors: {
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.background,
    text: Colors.text,
    border: Colors.border,
    notification: Colors.danger,
  },
};

export const DarkTheme: Theme = {
  dark: true,
  colors: {
    primary: Colors.primary,
    background: Colors.darkBackground,
    card: Colors.darkBackgroundSecondary,
    text: Colors.darkText,
    border: Colors.darkBorder,
    notification: Colors.danger,
  },
};

export const theme = {
  colors: Colors,
  spacing: Spacing,
  typography: Typography,
  shadows: Shadows,
};

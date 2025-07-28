import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { StatusBar, Appearance, ColorSchemeName } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface EmergencyUITheme {
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  fontSize: {
    small: number;
    medium: number;
    large: number;
    extraLarge: number;
  };
  spacing: {
    small: number;
    medium: number;
    large: number;
    extraLarge: number;
  };
  borderRadius: number;
  elevation: number;
  isEmergencyMode: boolean;
  isHighContrast: boolean;
  isLargeText: boolean;
}

interface EmergencyUIContextType {
  theme: EmergencyUITheme;
  enableHighContrast: () => void;
  disableHighContrast: () => void;
  toggleHighContrast: () => void;
  enableLargeText: () => void;
  disableLargeText: () => void;
  toggleLargeText: () => void;
}

const EmergencyUIContext = createContext<EmergencyUIContextType | undefined>(undefined);

interface EmergencyUIProviderProps {
  children: ReactNode;
  autoHighContrast?: boolean;
  autoLargeText?: boolean;
}

const normalTheme: Omit<EmergencyUITheme, 'isEmergencyMode' | 'isHighContrast' | 'isLargeText'> = {
  colors: {
    primary: '#0f62fe',
    background: '#ffffff',
    surface: '#f4f4f4',
    text: '#161616',
    textSecondary: '#525252',
    border: '#e0e0e0',
    error: '#da1e28',
    success: '#24a148',
    warning: '#f1c21b',
  },
  fontSize: {
    small: 12,
    medium: 14,
    large: 16,
    extraLarge: 18,
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
    extraLarge: 32,
  },
  borderRadius: 0, // IBM design uses sharp corners
  elevation: 4,
};

const emergencyTheme: Omit<EmergencyUITheme, 'isEmergencyMode' | 'isHighContrast' | 'isLargeText'> = {
  colors: {
    primary: '#da1e28',
    background: '#ffffff',
    surface: '#fff1f1',
    text: '#161616',
    textSecondary: '#525252',
    border: '#da1e28',
    error: '#da1e28',
    success: '#24a148',
    warning: '#f1c21b',
  },
  fontSize: {
    small: 14,
    medium: 16,
    large: 18,
    extraLarge: 20,
  },
  spacing: {
    small: 12,
    medium: 20,
    large: 28,
    extraLarge: 36,
  },
  borderRadius: 0,
  elevation: 6,
};

const highContrastTheme: Partial<typeof normalTheme> = {
  colors: {
    primary: '#000000',
    background: '#ffffff',
    surface: '#ffffff',
    text: '#000000',
    textSecondary: '#000000',
    border: '#000000',
    error: '#d40000',
    success: '#006600',
    warning: '#cc6600',
  },
};

const emergencyHighContrastTheme: Partial<typeof emergencyTheme> = {
  colors: {
    primary: '#ffffff',
    background: '#da1e28',
    surface: '#ffffff',
    text: '#ffffff',
    textSecondary: '#ffffff',
    border: '#ffffff',
    error: '#ffffff',
    success: '#ffffff',
    warning: '#ffffff',
  },
};

export const EmergencyUIProvider: React.FC<EmergencyUIProviderProps> = ({
  children,
  autoHighContrast = true,
  autoLargeText = true,
}) => {
  const isEmergencyMode = useSelector((state: RootState) => state.emergency.isEmergencyMode);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isLargeText, setIsLargeText] = useState(false);
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());

  // Listen to system color scheme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  // Auto-enable high contrast and large text in emergency mode
  useEffect(() => {
    if (isEmergencyMode) {
      if (autoHighContrast) {
        setIsHighContrast(true);
      }
      if (autoLargeText) {
        setIsLargeText(true);
      }
    } else {
      // Reset to normal when exiting emergency mode
      setIsHighContrast(false);
      setIsLargeText(false);
    }
  }, [isEmergencyMode, autoHighContrast, autoLargeText]);

  // Update status bar based on emergency mode and high contrast
  useEffect(() => {
    if (isEmergencyMode) {
      if (isHighContrast) {
        StatusBar.setBarStyle('light-content');
        StatusBar.setBackgroundColor('#da1e28');
      } else {
        StatusBar.setBarStyle('light-content');
        StatusBar.setBackgroundColor('#da1e28');
      }
    } else {
      StatusBar.setBarStyle('dark-content');
      StatusBar.setBackgroundColor('#ffffff');
    }
  }, [isEmergencyMode, isHighContrast]);

  const createTheme = (): EmergencyUITheme => {
    let baseTheme = isEmergencyMode ? emergencyTheme : normalTheme;

    if (isHighContrast) {
      const contrastOverride = isEmergencyMode ? emergencyHighContrastTheme : highContrastTheme;
      baseTheme = {
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          ...contrastOverride.colors,
        },
      };
    }

    if (isLargeText) {
      baseTheme = {
        ...baseTheme,
        fontSize: {
          small: baseTheme.fontSize.small + 2,
          medium: baseTheme.fontSize.medium + 2,
          large: baseTheme.fontSize.large + 2,
          extraLarge: baseTheme.fontSize.extraLarge + 2,
        },
        spacing: {
          small: baseTheme.spacing.small + 2,
          medium: baseTheme.spacing.medium + 4,
          large: baseTheme.spacing.large + 6,
          extraLarge: baseTheme.spacing.extraLarge + 8,
        },
      };
    }

    return {
      ...baseTheme,
      isEmergencyMode,
      isHighContrast,
      isLargeText,
    };
  };

  const theme = createTheme();

  const contextValue: EmergencyUIContextType = {
    theme,
    enableHighContrast: () => setIsHighContrast(true),
    disableHighContrast: () => setIsHighContrast(false),
    toggleHighContrast: () => setIsHighContrast(!isHighContrast),
    enableLargeText: () => setIsLargeText(true),
    disableLargeText: () => setIsLargeText(false),
    toggleLargeText: () => setIsLargeText(!isLargeText),
  };

  return (
    <EmergencyUIContext.Provider value={contextValue}>{children}</EmergencyUIContext.Provider>
  );
};

export const useEmergencyUI = (): EmergencyUIContextType => {
  const context = useContext(EmergencyUIContext);
  if (context === undefined) {
    throw new Error('useEmergencyUI must be used within an EmergencyUIProvider');
  }
  return context;
};

// Hook for accessing theme directly
export const useEmergencyTheme = (): EmergencyUITheme => {
  const { theme } = useEmergencyUI();
  return theme;
};
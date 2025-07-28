import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeProvider as ElementsThemeProvider } from 'react-native-elements';
import { Colors, theme } from './theme';

interface ThemeContextType {
  isDarkMode: boolean;
  colors: typeof Colors;
  theme: typeof theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const themeColors = useMemo(
    () => ({
      ...Colors,
      background: isDarkMode ? Colors.darkBackground : Colors.background,
      backgroundSecondary: isDarkMode ? Colors.darkBackgroundSecondary : Colors.backgroundSecondary,
      text: isDarkMode ? Colors.darkText : Colors.text,
      textSecondary: isDarkMode ? Colors.darkTextSecondary : Colors.textSecondary,
      textTertiary: isDarkMode ? Colors.darkTextTertiary : Colors.textTertiary,
      border: isDarkMode ? Colors.darkBorder : Colors.border,
    }),
    [isDarkMode],
  );

  const elementsTheme = {
    colors: {
      primary: Colors.primary,
      secondary: Colors.secondary,
      success: Colors.success,
      warning: Colors.warning,
      error: Colors.danger,
      grey0: Colors.gray1,
      grey1: Colors.gray2,
      grey2: Colors.gray3,
      grey3: Colors.gray4,
      grey4: Colors.gray5,
      grey5: Colors.gray6,
      greyOutline: Colors.border,
      searchBg: Colors.gray6,
      divider: Colors.border,
      platform: {
        ios: {
          primary: Colors.primary,
          secondary: Colors.secondary,
          success: Colors.success,
          warning: Colors.warning,
          error: Colors.danger,
        },
        android: {
          primary: Colors.primary,
          secondary: Colors.secondary,
          success: Colors.success,
          warning: Colors.warning,
          error: Colors.danger,
        },
      },
    },
    Button: {
      buttonStyle: {
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
      },
      titleStyle: {
        fontSize: 17,
        fontWeight: '600',
      },
    },
    Input: {
      inputStyle: {
        fontSize: 17,
      },
      containerStyle: {
        paddingHorizontal: 0,
      },
      inputContainerStyle: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
      },
    },
    Card: {
      containerStyle: {
        borderRadius: 12,
        borderWidth: 0,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    },
    ListItem: {
      containerStyle: {
        backgroundColor: isDarkMode ? Colors.darkBackgroundSecondary : Colors.background,
      },
      titleStyle: {
        color: isDarkMode ? Colors.darkText : Colors.text,
      },
      subtitleStyle: {
        color: isDarkMode ? Colors.darkTextSecondary : Colors.textSecondary,
      },
    },
  };

  const contextValue = useMemo(
    () => ({
      isDarkMode,
      colors: themeColors,
      theme,
    }),
    [isDarkMode, themeColors],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <ElementsThemeProvider theme={elementsTheme}>{children}</ElementsThemeProvider>
    </ThemeContext.Provider>
  );
};

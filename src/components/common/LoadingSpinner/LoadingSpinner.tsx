import React, { memo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Overlay } from 'react-native-elements';
import { useAppTheme } from '@styles/ThemeProvider';

interface LoadingSpinnerProps {
  visible?: boolean;
  message?: string;
  size?: 'small' | 'large';
  overlay?: boolean;
  fullScreen?: boolean;
}

export const LoadingSpinner = memo<LoadingSpinnerProps>(
  ({ visible = true, message, size = 'large', overlay = false, fullScreen = false }) => {
    const { colors } = useAppTheme();

    const content = (
      <View style={styles.container}>
        <ActivityIndicator size={size} color={colors.primary} animating={visible} />
        {message && <Text style={[styles.message, { color: colors.text }]}>{message}</Text>}
      </View>
    );

    if (overlay) {
      return (
        <Overlay
          isVisible={visible}
          overlayStyle={[
            styles.overlay,
            { backgroundColor: colors.background },
            fullScreen && styles.fullScreenOverlay,
          ]}
        >
          {content}
        </Overlay>
      );
    }

    if (!visible) {
      return null;
    }

    return content;
  },
);

LoadingSpinner.displayName = 'LoadingSpinner';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  overlay: {
    padding: 40,
    borderRadius: 12,
  },
  fullScreenOverlay: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
});

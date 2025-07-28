import { StyleSheet } from 'react-native';

// IBM Design System Colors
const IBM_COLORS = {
  error: '#da1e28',
  errorHover: '#ba1b23',
  white: '#ffffff',
  textPrimary: '#161616',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

export const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 100, // Above tab bar
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },

  container: {
    width: 64,
    height: 64,
    borderRadius: 0, // IBM sharp corners
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: IBM_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  emergencyInactive: {
    backgroundColor: IBM_COLORS.error,
  },

  emergencyActive: {
    backgroundColor: IBM_COLORS.errorHover,
  },

  content: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  // Pulse animation for emergency mode
  pulseAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 0, // IBM sharp corners
    borderWidth: 2,
    borderColor: IBM_COLORS.error,
    opacity: 0.6,
    // Animation would be handled by Animated API in real implementation
  },

  pulseRingDelay: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 0, // IBM sharp corners
    borderWidth: 2,
    borderColor: IBM_COLORS.error,
    opacity: 0.3,
    // Animation would be handled by Animated API in real implementation
  },

  // Status indicator
  statusIndicator: {
    position: 'absolute',
    top: -12,
    backgroundColor: IBM_COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 0, // IBM sharp corners
  },

  statusText: {
    color: IBM_COLORS.white,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
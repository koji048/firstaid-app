import { StyleSheet } from 'react-native';
import { Colors } from '@styles/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  containerHighContrast: {
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 17,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  errorTextHighContrast: {
    color: '#CCCCCC',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
  },
  retryButtonHighContrast: {
    backgroundColor: '#FFFFFF',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  retryButtonTextHighContrast: {
    color: '#000000',
  },
  allStepsContainer: {
    paddingBottom: 100,
  },
  emergencyButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  emergencyButtonHighContrast: {
    backgroundColor: '#FFFFFF',
  },
  emergencyBanner: {
    backgroundColor: Colors.danger,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyBannerHighContrast: {
    backgroundColor: '#FFFFFF',
  },
  emergencyBannerText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  emergencyBannerTextHighContrast: {
    color: '#000000',
  },
});

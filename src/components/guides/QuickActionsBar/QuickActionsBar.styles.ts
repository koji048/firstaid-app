import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 56,
    marginHorizontal: 4,
  },
  emergencyButton: {
    backgroundColor: '#da1e28',
  },
  locationButton: {
    backgroundColor: '#0f62fe',
  },
  buttonIcon: {
    marginRight: 8,
  },
  emergencyButtonText: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-SemiBold',
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  locationButtonText: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-SemiBold',
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});

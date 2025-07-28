import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  primaryContainer: {
    borderColor: '#ffd700',
    backgroundColor: '#fffef7',
  },
  noPrimaryContainer: {
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryLabel: {
    fontSize: 18,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '500',
    color: '#161616',
    marginLeft: 8,
  },
  emergencyPrimaryLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#da1e28',
  },
  emergencyBadge: {
    backgroundColor: '#da1e28',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  emergencyBadgeText: {
    fontSize: 12,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  contactContainer: {
    marginBottom: 12,
  },
  infoContainer: {
    backgroundColor: '#f4f4f4',
    borderRadius: 6,
    padding: 8,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#525252',
    textAlign: 'center',
  },
  noPrimaryContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noPrimaryTitle: {
    fontSize: 18,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '500',
    color: '#161616',
    marginTop: 12,
    marginBottom: 4,
  },
  noPrimarySubtitle: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#525252',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  setPrimaryButton: {
    backgroundColor: '#0f62fe',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  setPrimaryButtonText: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '500',
    color: '#ffffff',
  },
});

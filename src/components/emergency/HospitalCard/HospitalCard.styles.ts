import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emergencyContainer: {
    borderWidth: 2,
    borderColor: '#da1e28',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeIcon: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '500',
    color: '#161616',
    flex: 1,
  },
  emergencyBadge: {
    backgroundColor: '#da1e28',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  emergencyBadgeText: {
    fontSize: 10,
    fontFamily: 'IBMPlexSans-SemiBold',
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  address: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#525252',
    lineHeight: 20,
    marginBottom: 12,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  distanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  distanceText: {
    fontSize: 12,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#525252',
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  callButton: {
    backgroundColor: '#da1e28',
    borderColor: '#da1e28',
  },
  directionsButton: {
    backgroundColor: '#ffffff',
    borderColor: '#0f62fe',
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '500',
    color: '#0f62fe',
    marginLeft: 8,
  },
  callButtonText: {
    color: '#ffffff',
  },
});
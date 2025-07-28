import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryIndicator: {
    width: 4,
    height: 56,
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '500',
    color: '#161616',
  },
  primaryIcon: {
    marginLeft: 8,
  },
  phone: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#161616',
    marginBottom: 2,
  },
  relationship: {
    fontSize: 12,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#525252',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  // Emergency mode styles
  emergencyContainer: {
    minHeight: 80,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginVertical: 4,
    backgroundColor: '#fff9f9',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  emergencyName: {
    fontSize: 20,
    fontWeight: '600',
  },
  emergencyPhone: {
    fontSize: 16,
    fontWeight: '500',
  },
  emergencyRelationship: {
    fontSize: 14,
  },
  emergencyCallIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffcdd2',
  },
});

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f62fe',
    borderRadius: 8,
    padding: 16,
    marginVertical: 4,
    minHeight: 64,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emergencyContainer: {
    backgroundColor: '#da1e28',
    minHeight: 80,
    padding: 20,
    marginVertical: 8,
    shadowOpacity: 0.15,
    elevation: 8,
  },
  disabled: {
    backgroundColor: '#c6c6c6',
    shadowOpacity: 0,
    elevation: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  contactName: {
    fontSize: 16,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 2,
  },
  emergencyContactName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  relationship: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#f4f4f4',
    marginBottom: 2,
  },
  emergencyRelationship: {
    fontSize: 16,
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 12,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#e0e0e0',
  },
  emergencyPhoneNumber: {
    fontSize: 14,
    color: '#f4f4f4',
  },
  noPhone: {
    fontSize: 12,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#ffab91',
    fontStyle: 'italic',
  },
  disabledText: {
    color: '#8d8d8d',
  },
  primaryStar: {
    marginLeft: 8,
  },
});

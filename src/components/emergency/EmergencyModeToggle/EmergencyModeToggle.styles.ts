import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  container: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative',
  },
  emergencyActive: {
    backgroundColor: '#da1e28',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  emergencyInactive: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  disabled: {
    opacity: 0.5,
  },
  longPressing: {
    backgroundColor: '#f1c21b',
    borderColor: '#da1e28',
    transform: [{ scale: 0.98 }],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '500',
    marginBottom: 2,
  },
  labelActive: {
    color: '#ffffff',
  },
  labelInactive: {
    color: '#161616',
  },
  labelDisabled: {
    color: '#a8a8a8',
  },
  description: {
    fontSize: 12,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
  },
  descriptionActive: {
    color: '#f4f4f4',
  },
  descriptionInactive: {
    color: '#525252',
  },
  descriptionDisabled: {
    color: '#a8a8a8',
  },
  switchContainer: {
    marginLeft: 12,
  },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    padding: 2,
  },
  switchOn: {
    backgroundColor: '#ffffff',
  },
  switchOff: {
    backgroundColor: '#e0e0e0',
  },
  switchDisabled: {
    backgroundColor: '#c6c6c6',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbOn: {
    backgroundColor: '#da1e28',
    alignSelf: 'flex-end',
  },
  switchThumbOff: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
  },
  activeIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  pulseOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#da1e28',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff1f1',
    borderWidth: 1,
    borderColor: '#ffb3ba',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  warningIcon: {
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '500',
    color: '#da1e28',
  },
});

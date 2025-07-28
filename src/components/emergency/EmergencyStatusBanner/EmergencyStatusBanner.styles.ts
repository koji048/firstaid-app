import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  containerTop: {
    top: 100, // Below header
  },
  containerBottom: {
    bottom: 100, // Above tab bar
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  pulseIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'IBMPlexSans-SemiBold',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 2,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
  },
  actionContainer: {
    alignItems: 'center',
    marginLeft: 8,
  },
  actionText: {
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    minHeight: 88,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  severityIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '500',
    color: '#161616',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#525252',
    marginBottom: 4,
    lineHeight: 18,
  },
  guideCount: {
    fontSize: 12,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#6f6f6f',
  },
  chevron: {
    marginLeft: 8,
  },
});

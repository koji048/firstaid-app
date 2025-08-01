import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    minHeight: 120,
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
  },
  severityText: {
    fontSize: 12,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '600',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#24a14815',
  },
  offlineText: {
    fontSize: 12,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '500',
    color: '#24a148',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '600',
    color: '#161616',
    marginBottom: 8,
    lineHeight: 24,
  },
  summary: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#525252',
    marginBottom: 12,
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    marginRight: 4,
  },
  category: {
    fontSize: 12,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#6f6f6f',
    textTransform: 'capitalize',
  },
  separator: {
    fontSize: 12,
    color: '#6f6f6f',
    marginHorizontal: 6,
  },
  readTime: {
    fontSize: 12,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#6f6f6f',
  },
  bookmarkButton: {
    padding: 8,
    marginLeft: 8,
  },
});

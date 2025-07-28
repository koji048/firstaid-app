import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerText: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#525252',
    marginBottom: 4,
  },
  emergencyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  emergencyNoteText: {
    fontSize: 12,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#da1e28',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#6f6f6f',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#525252',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#da1e28',
    textAlign: 'center',
  },
});
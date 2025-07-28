import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  containerHighContrast: {
    backgroundColor: '#000000',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerHighContrast: {
    backgroundColor: '#000000',
    borderBottomColor: '#ffffff',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '600',
    color: '#161616',
  },
  titleHighContrast: {
    color: '#ffffff',
  },
  filterList: {
    maxHeight: 56,
  },
  filterListContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#f4f4f4',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 40,
    justifyContent: 'center',
  },
  filterChipSelected: {
    backgroundColor: '#0f62fe',
    borderColor: '#0f62fe',
  },
  filterChipHighContrast: {
    backgroundColor: '#262626',
    borderColor: '#ffffff',
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#161616',
  },
  filterChipTextSelected: {
    color: '#ffffff',
    fontWeight: '500',
  },
  filterChipTextHighContrast: {
    color: '#ffffff',
  },
  resultsList: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '500',
    color: '#161616',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyTitleHighContrast: {
    color: '#ffffff',
  },
  suggestionsList: {
    alignItems: 'flex-start',
    width: '100%',
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#525252',
    marginVertical: 4,
    lineHeight: 20,
  },
  suggestionTextHighContrast: {
    color: '#c6c6c6',
  },
  clearFilterButton: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f4f4f4',
  },
  clearFilterText: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '500',
    color: '#0f62fe',
  },
});

export default styles;

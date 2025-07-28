import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    minHeight: 56,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#161616',
    paddingVertical: 12,
  },
  clearButton: {
    padding: 8,
    marginLeft: 8,
  },
  voiceButton: {
    padding: 8,
    marginLeft: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonActive: {
    backgroundColor: '#ffebee',
    borderRadius: 22,
  },
  helperTextContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  helperText: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#6f6f6f',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#da1e28',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  suggestionsList: {
    maxHeight: 240,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#e0e0e0',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f4',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#161616',
  },
});

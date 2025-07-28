import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  containerHighContrast: {
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  title: {
    fontSize: 24,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '600',
    color: '#161616',
  },
  titleHighContrast: {
    color: '#ffffff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    padding: 8,
    marginRight: 12,
  },
  contrastToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contrastIcon: {
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '500',
    color: '#161616',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionTitleHighContrast: {
    color: '#ffffff',
  },
  horizontalList: {
    paddingHorizontal: 12,
  },
  horizontalCardWrapper: {
    width: 320,
    marginHorizontal: 4,
  },
});

export default styles;

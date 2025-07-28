import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  toggleContainer: {
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleEnabled: {
    backgroundColor: '#e8f5e8',
    borderColor: '#24a148',
  },
  toggleDisabled: {
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
  },
  toggleError: {
    backgroundColor: '#fff1f1',
    borderColor: '#da1e28',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '500',
    marginBottom: 2,
  },
  titleEnabled: {
    color: '#161616',
  },
  titleDisabled: {
    color: '#525252',
  },
  titleError: {
    color: '#da1e28',
  },
  status: {
    fontSize: 12,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
  },
  statusEnabled: {
    color: '#24a148',
  },
  statusDisabled: {
    color: '#a8a8a8',
  },
  statusError: {
    color: '#da1e28',
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
    backgroundColor: '#24a148',
  },
  switchOff: {
    backgroundColor: '#e0e0e0',
  },
  switchError: {
    backgroundColor: '#da1e28',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
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
    alignSelf: 'flex-end',
  },
  switchThumbOff: {
    alignSelf: 'flex-start',
  },
  shareInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#b3d7ff',
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
  },
  infoIcon: {
    marginRight: 8,
  },
  shareInfoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#0f62fe',
    lineHeight: 16,
  },
});

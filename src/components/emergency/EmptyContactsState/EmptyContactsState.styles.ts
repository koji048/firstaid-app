import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#ffffff',
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: 'IBMPlexSans-Light',
    fontWeight: '300',
    color: '#161616',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#525252',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#0f62fe',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 0,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '500',
  },
});

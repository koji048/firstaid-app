import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  emergencyBanner: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emergencyBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyBannerIcon: {
    marginRight: 8,
  },
  emergencyBannerText: {
    fontFamily: 'IBMPlexSans-SemiBold',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emergencyContactInfo: {
    marginTop: 4,
    alignItems: 'center',
  },
  emergencyContactText: {
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    textAlign: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'IBMPlexSans-SemiBold',
    fontWeight: '600',
  },
  subtitle: {
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emergencyToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginLeft: 8,
  },
  emergencyToggleActive: {
    backgroundColor: '#ffffff',
  },
  emergencyIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#da1e28',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
});
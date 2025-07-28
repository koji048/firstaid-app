import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emergencyContainer: {
    borderWidth: 2,
    borderColor: '#da1e28',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'IBMPlexSans-SemiBold',
    fontWeight: '600',
    color: '#161616',
  },
  emergencyHeaderTitle: {
    color: '#da1e28',
  },
  closeButton: {
    padding: 4,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff1f1',
    borderWidth: 1,
    borderColor: '#ffb3ba',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  emergencyBannerIcon: {
    marginRight: 8,
  },
  emergencyBannerText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '500',
    color: '#da1e28',
  },
  stepsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  stepContainer: {
    marginBottom: 24,
  },
  stepContainerActive: {
    backgroundColor: '#f0f8ff',
    marginHorizontal: -8,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  stepContainerCompleted: {
    opacity: 0.7,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f4f4f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepIconActive: {
    backgroundColor: '#e8f3ff',
    borderWidth: 2,
    borderColor: '#0f62fe',
  },
  stepIconCompleted: {
    backgroundColor: '#e8f5e8',
    borderWidth: 2,
    borderColor: '#24a148',
  },
  stepTitle: {
    fontSize: 16,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '500',
    color: '#525252',
  },
  stepTitleActive: {
    color: '#161616',
  },
  stepTitleCompleted: {
    color: '#24a148',
  },
  stepDescription: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#6f6f6f',
    marginLeft: 52,
    lineHeight: 20,
  },
  stepDescriptionActive: {
    color: '#525252',
  },
  stepDescriptionCompleted: {
    color: '#6f6f6f',
  },
  actionsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#0f62fe',
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  emergencyButton: {
    backgroundColor: '#da1e28',
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '500',
    color: '#ffffff',
  },
  emergencyButtonText: {
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0f62fe',
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '500',
    color: '#0f62fe',
  },
  waitingContainer: {
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#525252',
    marginBottom: 16,
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    fontFamily: 'IBMPlexSans-Medium',
    fontWeight: '500',
    color: '#24a148',
    textAlign: 'center',
  },
  helpContainer: {
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  helpText: {
    fontSize: 12,
    fontFamily: 'IBMPlexSans-Regular',
    fontWeight: '400',
    color: '#6f6f6f',
    textAlign: 'center',
    lineHeight: 16,
  },
});
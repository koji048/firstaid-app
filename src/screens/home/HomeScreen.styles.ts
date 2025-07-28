import { StyleSheet } from 'react-native';

// IBM Design System Colors
const IBM_COLORS = {
  blue: '#0f62fe',
  textPrimary: '#161616',
  textSecondary: '#525252',
  textHelper: '#6f6f6f',
  bgPrimary: '#ffffff',
  bgSecondary: '#f4f4f4',
  bgTertiary: '#e0e0e0',
  border: '#e0e0e0',
  borderSubtle: '#c6c6c6',
  error: '#da1e28',
};

// IBM Spacing System (8px base)
const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: IBM_COLORS.bgPrimary,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingBottom: SPACING.xxxl,
  },

  // Header Section
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    alignItems: 'flex-start',
  },
  
  welcomeText: {
    fontSize: 16,
    fontWeight: '400',
    color: IBM_COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  
  appTitle: {
    fontSize: 32,
    fontWeight: '300',
    color: IBM_COLORS.textPrimary,
    marginBottom: SPACING.sm,
    lineHeight: 40,
  },
  
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: IBM_COLORS.textHelper,
    lineHeight: 24,
  },

  // Emergency Section
  emergencySection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },

  // Quick Actions Section
  quickActionsSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },

  // Quick Actions Grid
  quickActionsGrid: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: IBM_COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  
  cardGrid: {
    gap: SPACING.md,
  },
  
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: IBM_COLORS.bgSecondary,
    borderWidth: 1,
    borderColor: IBM_COLORS.border,
    borderRadius: 0, // IBM sharp corners
    minHeight: 80,
  },
  
  cardIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: IBM_COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  
  cardDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: IBM_COLORS.textSecondary,
    lineHeight: 20,
  },
  
  cardChevron: {
    opacity: 0.6,
  },

  // Primary Contact Section
  primaryContactSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: IBM_COLORS.bgSecondary,
    borderWidth: 1,
    borderColor: IBM_COLORS.border,
    borderRadius: 0, // IBM sharp corners
  },
  
  contactInfo: {
    flex: 1,
  },
  
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: IBM_COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  
  contactRelation: {
    fontSize: 14,
    fontWeight: '400',
    color: IBM_COLORS.textSecondary,
  },
  
  contactCallButton: {
    width: 40,
    height: 40,
    borderRadius: 0, // IBM sharp corners
    backgroundColor: IBM_COLORS.bgPrimary,
    borderWidth: 1,
    borderColor: IBM_COLORS.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
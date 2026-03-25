import { StyleSheet, Dimensions, Platform } from 'react-native';
import { createStyles } from '@/shared/theme/styles';

const { width } = Dimensions.get('window');

export const useLoginStyles = createStyles((utils, colors) => ({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Make sure this is transparent
  },

  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  scrollContent: {
    flexGrow: 1,
    backgroundColor: 'transparent',
    paddingVertical: 20,
  },

  scrollContentInner: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },

  webContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  header: {
    alignItems: 'center',
    marginTop: utils.spacing[8],
    marginBottom: utils.spacing[8],
  },

  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: utils.spacing[4],
    // ...(Platform.OS === 'ios' ? utils.shadows.medium : {}),
    ...(Platform.OS === 'web' ? { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } : {}),
  },

  appTitle: {
    fontSize: Platform.select({
      web: 36,
      default: 32,
    }),
    fontWeight: utils.getFontWeight('bold'),
    color: colors.textPrimary,
    marginBottom: utils.spacing[2],
    textAlign: 'center',
  },

  appSubtitle: {
    fontSize: utils.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: width * 0.8,
  },

  decorativeLine: {
    width: 60,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: utils.borderRadius.full,
    marginTop: utils.spacing[4],
  },

  formSection: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },

  formTitle: {
    fontSize: Platform.select({
      web: 28,
      default: 24,
    }),
    fontWeight: utils.getFontWeight('bold'),
    color: colors.textPrimary,
    marginBottom: utils.spacing[6],
  },

  inputWrapper: {
    marginBottom: utils.spacing[4],
  },

  forgotLink: {
    color: colors.primary,
    fontWeight: utils.getFontWeight('medium'),
    fontSize: utils.fontSize.sm,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
    marginVertical: utils.spacing[4],
    textAlign: 'right',
  },

  buttonContainer: {
    marginBottom: utils.spacing[4],
  },

  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: utils.spacing[6],
  },

  signupText: {
    color: colors.textSecondary,
  },

  signupLink: {
    color: colors.primary,
    fontWeight: utils.getFontWeight('bold'),
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },

  versionText: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: utils.fontSize.xs,
    marginTop: utils.spacing[8],
  },

  // Add these to your styles object:

  fixedContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  headerCompact: {
    marginTop: utils.spacing[2],
    marginBottom: utils.spacing[2],
  },

  appTitleCompact: {
    fontSize: Platform.select({
      ios: 24,
      android: 22,
      default: 20,
    }),
    marginBottom: utils.spacing[1],
  },

  appSubtitleCompact: {
    fontSize: utils.fontSize.xs,
  },

  decorativeLineCompact: {
    width: 40,
    marginTop: utils.spacing[2],
  },

  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingBottom: utils.spacing[6],
  },

  // Add/update these styles:

  logoBoxCompact: {
    width: 50,
    height: 50,
    borderRadius: 16,
    marginBottom: utils.spacing[2],
  },

  formTitleCompact: {
    fontSize: Platform.select({
      ios: 20,
      android: 18,
      default: 18,
    }),
    marginBottom: utils.spacing[3],
  },

  // Add these to your existing styles:

  keyboardDismiss: {
    flex: 1,
  },
}));

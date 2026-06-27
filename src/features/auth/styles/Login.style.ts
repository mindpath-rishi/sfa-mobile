// import { StyleSheet, Dimensions, Platform } from 'react-native';
// import { createStyles } from '@/shared/theme/styles';

// const { width, height } = Dimensions.get('window');

// export const useLoginStyles = createStyles((utils, colors) => ({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//     zIndex: 1,
//   },

//   gradientBackground: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: Dimensions.get('window').height * 0.5,
//     zIndex: 0,
//   },

//   topSection: {
//     height: height * 0.5,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingTop: Platform.OS === 'ios' ? 20 : 30,
//     paddingBottom: 20,
//     overflow: 'hidden',
//     flexShrink: 0,
//     zIndex: 2,
//     backgroundColor: 'transparent',
//   },

//   logoContainer: {
//     width: 70,
//     height: 70,
//     borderRadius: 18,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 10,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.1,
//         shadowRadius: 8,
//       },
//       android: {
//         elevation: 5,
//       },
//       web: {
//         boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
//       },
//     }),
//   },

//   logoImage: {
//     width: 45,
//     height: 45,
//   },

//   appTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#fff',
//     marginBottom: 4,
//     textAlign: 'center',
//   },

//   appSubtitle: {
//     fontSize: 12,
//     color: 'rgba(255,255,255,0.9)',
//     textAlign: 'center',
//     paddingHorizontal: 30,
//   },

//   bottomSection: {
//     backgroundColor: colors.background,
//     borderTopLeftRadius: 25,
//     borderTopRightRadius: 25,
//     marginTop: -50,
//     paddingHorizontal: 0,
//     paddingTop: 0,
//     paddingBottom: 0,
//     minHeight: height * 0.5 + 50,
//     flex: 0,
//     zIndex: 15,
//   },

//   formContainer: {
//     paddingHorizontal: 24,
//     paddingTop: 25,
//     paddingBottom: Platform.OS === 'ios' ? 30 : 25,
//     flex: 1,
//     justifyContent: 'space-between',
//   },

//   welcomeContainer: {
//     marginBottom: 20,
//   },

//   welcomeTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: colors.textPrimary,
//     marginBottom: 4,
//   },

//   welcomeSubtitle: {
//     fontSize: 13,
//     color: colors.textSecondary,
//   },

//   inputContainer: {
//     marginBottom: 16,
//   },

//   loginButton: {
//     height: 52,
//     borderRadius: 26,
//     marginTop: 12,
//     marginBottom: 16,
//     overflow: 'hidden',
//   },

//   loginButtonGradient: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   loginButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     letterSpacing: 0.5,
//     color: '#fff',
//   },

//   footerText: {
//     fontSize: 11,
//     color: colors.textTertiary,
//     textAlign: 'center',
//     marginTop: 6,
//     marginBottom: 8,
//   },

//   disabledButton: {
//     opacity: 0.6,
//   },
// }));

import { StyleSheet, Dimensions, Platform } from 'react-native';
import { createStyles } from '@/shared/theme/styles';

const { width, height } = Dimensions.get('window');

export const useLoginStyles = createStyles((utils, colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    zIndex: 1,
  },

  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Dimensions.get('window').height * 0.5,
    zIndex: 0,
  },

  topSection: {
    height: height * 0.5,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : 30,
    paddingBottom: 20,
    overflow: 'hidden',
    flexShrink: 0,
    zIndex: 2,
    backgroundColor: 'transparent',
  },

  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: `0px 8px 16px rgba(0,0,0,0.15)`,
      },
    }),
  },

  logoImage: {
    width: 50,
    height: 50,
  },

  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textInverse,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  appSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 18,
    fontWeight: '400',
  },

  bottomSection: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -50,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    minHeight: height * 0.5 + 50,
    flex: 0,
    zIndex: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },

  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: Platform.OS === 'ios' ? 40 : 32,
    flex: 1,
    justifyContent: 'flex-start',
  },

  welcomeContainer: {
    marginBottom: 28,
  },

  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.3,
  },

  welcomeSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '400',
    lineHeight: 20,
  },

  inputContainer: {
    marginBottom: 20,
  },

  errorHelperText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
    flexDirection: 'row',
  },

  capsLockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.warning}15`,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 8,
    borderRadius: 6,
  },

  capsLockText: {
    fontSize: 12,
    color: colors.warning,
    marginLeft: 6,
    fontWeight: '500',
  },

  passwordRequirements: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: `${colors.primary}08`,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },

  loginButton: {
    height: 56,
    borderRadius: 28,
    marginTop: 16,
    marginBottom: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  loginButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.textInverse,
  },

  forgotPasswordContainer: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },

  forgotPasswordText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    textDecorationLine: 'none',
  },

  footerText: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 0,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  disabledButton: {
    opacity: 0.5,
  },
}));

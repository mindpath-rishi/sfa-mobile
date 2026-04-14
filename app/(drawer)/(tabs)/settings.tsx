// import React, { useEffect } from 'react';
// import { View, I18nManager } from 'react-native';
// import { router } from 'expo-router';

// import { useAppTheme } from '@/shared/providers/ThemeProvider';
// import { useThemeStore } from '@/core/store/theme.store';
// import { useAuthStore } from '@/core/store/auth.store';
// import { useLanguageStore } from '@/core/store/language.store';
// import { toast } from '@/shared/utils/toast';
// import { t } from '@/shared/locales/engine/t';

// import { styleUtils } from '@/shared/theme/styles';
// import { AppButton, AppText } from '@/core/components';

// export default function SettingsScreen() {
//   const { colors } = useAppTheme();

//   const mode = useThemeStore((s) => s.mode);
//   const setMode = useThemeStore((s) => s.setMode);

//   const language = useLanguageStore((s) => s.language);
//   const setLanguage = useLanguageStore((s) => s.setLanguage);

//   const needRestart = useLanguageStore((s) => s.needRestart);
//   const isRTLFromStore = useLanguageStore((s) => s.isRTL);

//   const logout = useAuthStore((s) => s.logout);

//   const isRTL = typeof isRTLFromStore === 'boolean' ? isRTLFromStore : I18nManager.isRTL;

//   useEffect(() => {
//     if (needRestart) {
//       toast.info('Restart app to apply RTL/LTR changes');
//     }
//   }, [needRestart]);

//   const languageOptions = [
//     { key: 'en', label: t('settings.english') },
//     { key: 'hi', label: t('settings.hindi') },
//     { key: 'ur', label: t('settings.urdu') },
//   ] as const;

//   return (
//     <View
//       style={{
//         flex: 1,
//         padding: styleUtils.spacing[4],
//         backgroundColor: colors.background,
//       }}
//     >
//       {/* Restart Banner */}
//       {needRestart && (
//         <View
//           style={{
//             padding: styleUtils.spacing[3],
//             borderRadius: styleUtils.borderRadius.lg,
//             borderWidth: 1,
//             borderColor: colors.warning,
//             backgroundColor: 'rgba(255, 193, 7, 0.15)',
//             marginBottom: styleUtils.spacing[4],
//           }}
//         >
//           <AppText variant="subtitle">Restart Required</AppText>
//           <AppText variant="caption" style={{ marginTop: 4 }}>
//             Please restart the app to fully apply RTL/LTR layout changes.
//           </AppText>
//         </View>
//       )}

//       {/* Theme Section */}
//       <AppText variant="title">
//         {t('settings.themeMode')}: {mode}
//       </AppText>

//       {(['system', 'light', 'dark'] as const).map((m) => (
//         <View key={m} style={{ marginTop: styleUtils.spacing[3] }}>
//           <AppButton title={m.toUpperCase()} onPress={() => setMode(m)} disabled={mode === m} />
//         </View>
//       ))}

//       {/* Language Section */}
//       <AppText variant="title" style={{ marginTop: styleUtils.spacing[6] }}>
//         {t('settings.language')}: {language.toUpperCase()}
//       </AppText>

//       {languageOptions.map((item) => (
//         <View key={item.key} style={{ marginTop: styleUtils.spacing[3] }}>
//           <AppButton
//             title={item.label}
//             onPress={() => setLanguage(item.key)}
//             disabled={language === item.key}
//           />
//         </View>
//       ))}

//       {/* Logout */}
//       <View style={{ marginTop: styleUtils.spacing[6] }}>
//         <AppButton
//           title={t('common.logout')}
//           onPress={async () => {
//             await logout();
//             toast.info(t('common.logout'));
//             router.replace('/(auth)');
//           }}
//         />
//       </View>
//     </View>
//   );
// }

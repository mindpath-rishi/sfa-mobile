/**
 * Phone settings that background tracking needs beyond the app itself:
 * - location permission "Allow all the time"
 * - battery usage "Unrestricted" (Android battery optimization off)
 * - Autostart / background start (Xiaomi, Oppo, Realme, Vivo, OnePlus, Huawei, Asus…)
 *
 * Android cannot tell an app whether Autostart is on, so that step is confirmed
 * by the user once per phone.
 */
import { Linking, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import * as IntentLauncher from 'expo-intent-launcher';

import { storage } from '@/core/storage';

const AUTOSTART_CONFIRMED_KEY = 'background_tracking_autostart_confirmed';

export type BackgroundTrackingStatus = {
  backgroundLocation: boolean;
  /** null when the platform has no battery optimization (iOS / web). */
  batteryUnrestricted: boolean | null;
  /** This phone's maker has an Autostart / background start switch. */
  autostartNeeded: boolean;
  autostartConfirmed: boolean;
};

type Component = { packageName: string; className: string };

/** Autostart screens by manufacturer, tried in order (they move between OS versions). */
const AUTOSTART_SCREENS: Record<string, Component[]> = {
  xiaomi: [
    {
      packageName: 'com.miui.securitycenter',
      className: 'com.miui.permcenter.autostart.AutoStartManagementActivity',
    },
  ],
  oppo: [
    {
      packageName: 'com.coloros.safecenter',
      className: 'com.coloros.safecenter.permission.startup.StartupAppListActivity',
    },
    {
      packageName: 'com.coloros.safecenter',
      className: 'com.coloros.safecenter.startupapp.StartupAppListActivity',
    },
    {
      packageName: 'com.oppo.safe',
      className: 'com.oppo.safe.permission.startup.StartupAppListActivity',
    },
  ],
  vivo: [
    {
      packageName: 'com.vivo.permissionmanager',
      className: 'com.vivo.permissionmanager.activity.BgStartUpManagerActivity',
    },
    {
      packageName: 'com.iqoo.secure',
      className: 'com.iqoo.secure.ui.phoneoptimize.AddWhiteListActivity',
    },
  ],
  oneplus: [
    {
      packageName: 'com.oneplus.security',
      className: 'com.oneplus.security.chainlaunch.view.ChainLaunchAppListActivity',
    },
  ],
  huawei: [
    {
      packageName: 'com.huawei.systemmanager',
      className: 'com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity',
    },
    {
      packageName: 'com.huawei.systemmanager',
      className: 'com.huawei.systemmanager.optimize.process.ProtectActivity',
    },
  ],
  asus: [
    {
      packageName: 'com.asus.mobilemanager',
      className: 'com.asus.mobilemanager.entry.FunctionActivity',
    },
  ],
};
// Same OS families under other brand names
AUTOSTART_SCREENS.redmi = AUTOSTART_SCREENS.xiaomi;
AUTOSTART_SCREENS.poco = AUTOSTART_SCREENS.xiaomi;
AUTOSTART_SCREENS.realme = AUTOSTART_SCREENS.oppo;
AUTOSTART_SCREENS.iqoo = AUTOSTART_SCREENS.vivo;
AUTOSTART_SCREENS.honor = AUTOSTART_SCREENS.huawei;

const autostartScreens = () => {
  const maker = `${Device.manufacturer ?? ''} ${Device.brand ?? ''}`.toLowerCase();
  const key = Object.keys(AUTOSTART_SCREENS).find((name) => maker.includes(name));
  return key ? AUTOSTART_SCREENS[key] : [];
};

const packageUri = () => `package:${Application.applicationId ?? 'com.salesstream.app'}`;

const openAppDetails = async () => {
  try {
    await IntentLauncher.startActivityAsync(
      IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
      {
        data: packageUri(),
      },
    );
  } catch {
    await Linking.openSettings();
  }
};

export const getBackgroundTrackingStatus = async (): Promise<BackgroundTrackingStatus> => {
  if (Platform.OS === 'web') {
    return {
      backgroundLocation: true,
      batteryUnrestricted: null,
      autostartNeeded: false,
      autostartConfirmed: true,
    };
  }

  const permission = await Location.getBackgroundPermissionsAsync().catch(() => null);
  const backgroundLocation = permission?.status === Location.PermissionStatus.GRANTED;

  let batteryUnrestricted: boolean | null = null;
  if (Platform.OS === 'android') {
    batteryUnrestricted = await Battery.isBatteryOptimizationEnabledAsync()
      .then((optimized) => !optimized)
      .catch(() => null);
  }

  const autostartNeeded = Platform.OS === 'android' && autostartScreens().length > 0;
  const autostartConfirmed =
    !autostartNeeded || (await storage.getItem(AUTOSTART_CONFIRMED_KEY)) === 'true';

  return { backgroundLocation, batteryUnrestricted, autostartNeeded, autostartConfirmed };
};

/** Everything background tracking needs is in place. */
export const isBackgroundTrackingReady = (status: BackgroundTrackingStatus) =>
  status.backgroundLocation && status.batteryUnrestricted !== false && status.autostartConfirmed;

/**
 * Asks for "Allow all the time". Android 11+ and iOS can only grant it from the
 * app's settings page, so that page is opened when the prompt cannot help.
 */
export const requestAlwaysLocation = async () => {
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (foreground.status !== Location.PermissionStatus.GRANTED) {
    if (!foreground.canAskAgain) await openAppDetails();
    return false;
  }

  const background = await Location.requestBackgroundPermissionsAsync();
  if (background.status === Location.PermissionStatus.GRANTED) return true;

  await openAppDetails();
  return false;
};

/** Opens Android's "Let app always run in background?" dialog (sets Unrestricted). */
export const requestUnrestrictedBattery = async () => {
  if (Platform.OS !== 'android') return;
  try {
    await IntentLauncher.startActivityAsync(
      IntentLauncher.ActivityAction.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
      { data: packageUri() },
    );
  } catch {
    try {
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS,
      );
    } catch {
      await openAppDetails();
    }
  }
};

/** Opens this phone's Autostart screen, or the app's settings page as a fallback. */
export const openAutostartSettings = async () => {
  if (Platform.OS !== 'android') return;
  for (const screen of autostartScreens()) {
    try {
      await IntentLauncher.startActivityAsync('android.intent.action.MAIN', screen);
      return;
    } catch {
      // Screen not on this OS version; try the next one
    }
  }
  await openAppDetails();
};

export const confirmAutostart = (confirmed: boolean) =>
  storage.setItem(AUTOSTART_CONFIRMED_KEY, String(confirmed));

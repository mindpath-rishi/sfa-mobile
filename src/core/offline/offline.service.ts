import * as Network from 'expo-network';

import { syncService } from '@/sync/sync.service';
import { useAppEventsStore } from '@/core/store/appEvents.store';

import { useOfflineStore } from './offline.store';

const online = (state: Network.NetworkState) =>
  state.isConnected === true && state.isInternetReachable !== false;

export const isOffline = async () => !online(await Network.getNetworkStateAsync());

export const syncOfflineQueue = () => syncService.retryFailed();

export const initialiseOffline = async () => {
  await syncService.initialise();
  const state = await Network.getNetworkStateAsync();
  useOfflineStore.getState().setConnection(state.isConnected === true, online(state));
  if (online(state)) void syncService.retryFailed();
};

export const subscribeToOfflineSync = () =>
  Network.addNetworkStateListener((state) => {
    const previous = useOfflineStore.getState();
    const wasOnline = previous.isConnected && previous.isInternetReachable;
    const wasOffline = !wasOnline;
    const hasInternet = online(state);
    useOfflineStore.getState().setConnection(state.isConnected === true, hasInternet);
    // Expo can emit repeated network events while the device remains online.
    // Starting a full sync for each event repeatedly force-refreshes all
    // snapshots, including /van/mapped-routes. Sync only after reconnection.
    if (hasInternet && wasOffline) {
      void syncService.retryFailed().then(() => {
        useAppEventsStore.getState().bumpDashboardRefresh();
      });
    } else if (wasOnline) {
      // Re-run active salesman dashboard loaders after the network state has
      // changed so services read from SQLite instead of retaining API data.
      useAppEventsStore.getState().bumpDashboardRefresh();
    }
  });

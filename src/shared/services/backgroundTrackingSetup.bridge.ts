/**
 * Lets location.service.ts (outside the React tree) open the background
 * tracking setup checklist and wait until the user closes it. Same pattern as
 * backgroundLocationDisclosure.bridge.ts.
 */
type Listener = (visible: boolean) => void;

let listener: Listener | null = null;
let pendingResolve: (() => void) | null = null;

export const registerBackgroundTrackingSetupListener = (fn: Listener | null) => {
  listener = fn;
};

/** Resolves when the checklist is closed (immediately when it is not mounted). */
export const requestBackgroundTrackingSetup = (): Promise<void> =>
  new Promise((resolve) => {
    if (!listener) {
      resolve();
      return;
    }
    pendingResolve = resolve;
    listener(true);
  });

export const closeBackgroundTrackingSetup = () => {
  listener?.(false);
  const resolve = pendingResolve;
  pendingResolve = null;
  resolve?.();
};

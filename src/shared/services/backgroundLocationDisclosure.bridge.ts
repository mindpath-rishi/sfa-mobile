/**
 * Imperative bridge that lets location.service.ts (a plain module, outside
 * the React tree) open the in-app background-location disclosure screen and
 * await the user's choice - the same pattern React Native's own Alert.alert
 * uses internally to reach into the render tree from non-component code.
 */
type Listener = (visible: boolean) => void;

let listener: Listener | null = null;
let pendingResolve: ((accepted: boolean) => void) | null = null;

export const registerBackgroundLocationDisclosureListener = (fn: Listener | null) => {
  listener = fn;
};

export const requestBackgroundLocationDisclosure = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (!listener) {
      resolve(false);
      return;
    }

    pendingResolve = resolve;
    listener(true);
  });

export const resolveBackgroundLocationDisclosure = (accepted: boolean) => {
  listener?.(false);

  const resolve = pendingResolve;
  pendingResolve = null;
  resolve?.(accepted);
};

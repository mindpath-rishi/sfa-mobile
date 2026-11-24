import { useCallback, useRef, useState } from 'react';

/**
 * Wraps an async action so it can only run once at a time: repeat taps while it is
 * in flight are ignored (prevents duplicate sales, customers, top-ups, etc.).
 * `running` can be used to disable/spin the button that triggers it.
 */
export function useSingleFlight<Args extends unknown[], Result>(
  action: (...args: Args) => Promise<Result>,
) {
  const inFlightRef = useRef(false);
  const [running, setRunning] = useState(false);
  const actionRef = useRef(action);
  actionRef.current = action;

  const run = useCallback(async (...args: Args): Promise<Result | undefined> => {
    if (inFlightRef.current) return undefined;
    inFlightRef.current = true;
    setRunning(true);
    try {
      return await actionRef.current(...args);
    } finally {
      inFlightRef.current = false;
      setRunning(false);
    }
  }, []);

  return [run, running] as const;
}

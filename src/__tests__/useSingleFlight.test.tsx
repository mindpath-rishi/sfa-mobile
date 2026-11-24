import { act, renderHook } from '@testing-library/react-native';

import { useSingleFlight } from '@/shared/hooks/useSingleFlight';

const deferred = () => {
  let resolve!: (value: string) => void;
  const promise = new Promise<string>((r) => (resolve = r));
  return { promise, resolve };
};

describe('useSingleFlight', () => {
  it('ignores repeat calls while the first is in flight (double tap)', async () => {
    const pending = deferred();
    const action = jest.fn(() => pending.promise);
    const { result } = renderHook(() => useSingleFlight(action));

    let first!: Promise<string | undefined>;
    let second!: Promise<string | undefined>;
    act(() => {
      first = result.current[0]();
      second = result.current[0]();
    });

    expect(action).toHaveBeenCalledTimes(1);
    expect(result.current[1]).toBe(true);
    await expect(second).resolves.toBeUndefined();

    await act(async () => pending.resolve('sale-1'));
    await expect(first).resolves.toBe('sale-1');
    expect(result.current[1]).toBe(false);
  });

  it('allows a new call after the previous one finishes, including after an error', async () => {
    const action = jest
      .fn<Promise<string>, []>()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce('ok');
    const { result } = renderHook(() => useSingleFlight(action));

    await act(async () => {
      await expect(result.current[0]()).rejects.toThrow('network');
    });
    await act(async () => {
      await expect(result.current[0]()).resolves.toBe('ok');
    });
    expect(action).toHaveBeenCalledTimes(2);
  });

  it('always runs the latest action passed in', async () => {
    const { result, rerender } = renderHook(
      ({ fn }: { fn: () => Promise<string> }) => useSingleFlight(fn),
      { initialProps: { fn: jest.fn(async () => 'old') } },
    );
    const latest = jest.fn(async () => 'new');
    rerender({ fn: latest });

    await act(async () => {
      await expect(result.current[0]()).resolves.toBe('new');
    });
  });
});

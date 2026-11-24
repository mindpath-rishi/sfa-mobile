import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

import Button from '@/core/components/Button/Button';

describe('Button repeat-tap protection', () => {
  afterEach(() => jest.useRealTimers());

  it('runs an async onPress once on double tap and shows the spinner until it settles', async () => {
    let finish!: () => void;
    const onPress = jest.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const screen = render(<Button title="Create Sale" onPress={onPress} testID="create" />);

    fireEvent.press(screen.getByTestId('create'));
    // Spinner replaces the button while the action runs; further taps can't reach it.
    expect(screen.getByTestId('create-loading')).toBeTruthy();
    expect(screen.queryByTestId('create')).toBeNull();
    expect(onPress).toHaveBeenCalledTimes(1);

    await act(async () => finish());
    fireEvent.press(screen.getByTestId('create'));
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it('re-enables after an async onPress rejects', async () => {
    const onPress = jest.fn().mockRejectedValueOnce(new Error('fail')).mockResolvedValue(undefined);
    const screen = render(<Button title="Save" onPress={onPress} testID="save" />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('save'));
    });
    expect(screen.getByTestId('save')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByTestId('save'));
    });
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it('ignores a second tap within 600ms for sync handlers, then allows it', () => {
    jest.useFakeTimers();
    const onPress = jest.fn();
    const screen = render(<Button title="Next" onPress={onPress} testID="next" />);

    fireEvent.press(screen.getByTestId('next'));
    fireEvent.press(screen.getByTestId('next'));
    expect(onPress).toHaveBeenCalledTimes(1);

    act(() => jest.advanceTimersByTime(600));
    fireEvent.press(screen.getByTestId('next'));
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const screen = render(<Button title="Go" onPress={onPress} disabled testID="go" />);
    fireEvent.press(screen.getByTestId('go'));
    expect(onPress).not.toHaveBeenCalled();
  });
});

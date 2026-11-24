jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(async () => true),
  hideAsync: jest.fn(async () => undefined),
}));

import React from 'react';
import { Image } from 'react-native';
import { act, render } from '@testing-library/react-native';

import { AppSplash } from '@/core/screens/AppSplash';

const mockSplash = jest.requireMock('expo-splash-screen') as { hideAsync: jest.Mock };

describe('AppSplash', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockSplash.hideAsync.mockClear();
  });
  afterEach(() => jest.useRealTimers());

  const loadImage = (screen: ReturnType<typeof render>) =>
    act(() => {
      screen.UNSAFE_getByType(Image).props.onLoadEnd();
    });

  it('keeps the native splash until the icon image has loaded, then hides it', () => {
    const screen = render(<AppSplash ready={false} onHidden={jest.fn()} />);
    expect(mockSplash.hideAsync).not.toHaveBeenCalled();
    loadImage(screen);
    expect(mockSplash.hideAsync).toHaveBeenCalledTimes(1);
  });

  it('does not fade before the icon has been visible for 300ms, even if the app is ready', () => {
    const onHidden = jest.fn();
    const screen = render(<AppSplash ready onHidden={onHidden} />);
    loadImage(screen);

    act(() => jest.advanceTimersByTime(250));
    expect(onHidden).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(50 + 300 + 50)); // min visible + fade
    expect(onHidden).toHaveBeenCalledTimes(1);
  });

  it('waits for the app to be ready before fading', () => {
    const onHidden = jest.fn();
    const screen = render(<AppSplash ready={false} onHidden={onHidden} />);
    loadImage(screen);
    act(() => jest.advanceTimersByTime(5000));
    expect(onHidden).not.toHaveBeenCalled();

    screen.rerender(<AppSplash ready onHidden={onHidden} />);
    act(() => jest.advanceTimersByTime(400));
    expect(onHidden).toHaveBeenCalledTimes(1);
  });

  it('never gets stuck: if the image never loads, it hides after 2s anyway', () => {
    const onHidden = jest.fn();
    render(<AppSplash ready onHidden={onHidden} />);

    act(() => jest.advanceTimersByTime(2000));
    expect(mockSplash.hideAsync).toHaveBeenCalledTimes(1);
    act(() => jest.advanceTimersByTime(300 + 300 + 50));
    expect(onHidden).toHaveBeenCalledTimes(1);
  });
});

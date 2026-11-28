import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

import { appAlert, useAppAlertStore } from '@/core/alert/appAlert';
import { AppAlertHost } from '@/core/alert/AppAlertHost';

const reset = () => act(() => useAppAlertStore.setState({ queue: [] }));

describe('appAlert (replaces Alert.alert with the app modal)', () => {
  afterEach(reset);

  it('shows a one-button notice with OK and no "cannot be undone" note', () => {
    const screen = render(<AppAlertHost />);
    act(() => appAlert('Error', 'Phone number not available'));

    expect(screen.getByText('Error')).toBeTruthy();
    expect(screen.getByText('Phone number not available')).toBeTruthy();
    expect(screen.getByText('OK')).toBeTruthy();
    expect(screen.queryByText('Cancel')).toBeNull();
    expect(screen.queryByText('This action cannot be undone')).toBeNull();

    fireEvent.press(screen.getByText('OK'));
    expect(screen.queryByText('Phone number not available')).toBeNull();
  });

  it('maps cancel + action buttons and runs the chosen handler after closing', () => {
    const proceed = jest.fn();
    const cancel = jest.fn();
    const screen = render(<AppAlertHost />);
    act(() =>
      appAlert('Partial Payment', 'Proceed with partial payment?', [
        { text: 'Cancel', style: 'cancel', onPress: cancel },
        { text: 'Proceed', onPress: proceed },
      ]),
    );

    fireEvent.press(screen.getByText('Proceed'));
    expect(proceed).toHaveBeenCalledTimes(1);
    expect(cancel).not.toHaveBeenCalled();
    expect(screen.queryByText('Partial Payment')).toBeNull();
  });

  it('cancel runs the cancel handler, not the action', () => {
    const remove = jest.fn();
    const screen = render(<AppAlertHost />);
    act(() =>
      appAlert('Remove Photo', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: remove },
      ]),
    );

    // Destructive confirmations keep the warning note.
    expect(screen.getByText('This action cannot be undone')).toBeTruthy();
    fireEvent.press(screen.getByText('Cancel'));
    expect(remove).not.toHaveBeenCalled();
  });

  it('queues alerts and shows them one after another', () => {
    const screen = render(<AppAlertHost />);
    act(() => {
      appAlert('First', 'one');
      appAlert('Second', 'two');
    });

    expect(screen.getByText('First')).toBeTruthy();
    expect(screen.queryByText('Second')).toBeNull();
    fireEvent.press(screen.getByText('OK'));
    expect(screen.getByText('Second')).toBeTruthy();
  });

  it('a single OK button with a handler (e.g. "Invoice processed") runs it', () => {
    const goBack = jest.fn();
    const screen = render(<AppAlertHost />);
    act(() =>
      appAlert('Success', 'Invoice processed successfully', [{ text: 'OK', onPress: goBack }]),
    );
    fireEvent.press(screen.getByText('OK'));
    expect(goBack).toHaveBeenCalledTimes(1);
  });
});

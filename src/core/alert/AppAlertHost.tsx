import React from 'react';
import type { AlertButton } from 'react-native';

import { ConfirmationModal } from '@/core/components/ConfirmationModal';
import { useAppAlertStore } from './appAlert';

const ERROR_TITLE =
  /error|fail|invalid|unable|not allowed|unavailable|exceed|mismatch|missing|rejected|limit|required|blocked|empty|no items/i;
const SUCCESS_TITLE = /success|completed|marked|configured/i;

/** Renders queued appAlert() calls one at a time with the app's ConfirmationModal. */
export function AppAlertHost() {
  const current = useAppAlertStore((state) => state.queue[0]);
  const shift = useAppAlertStore((state) => state.shift);

  if (!current) return null;

  const { buttons, title, message } = current;
  const cancelButton =
    buttons.length > 1 ? (buttons.find((b) => b.style === 'cancel') ?? buttons[0]) : undefined;
  const confirmButton: AlertButton =
    buttons.find((b) => b !== cancelButton) ?? buttons[buttons.length - 1];
  const isDestructive = confirmButton.style === 'destructive';

  const type = isDestructive
    ? 'error'
    : SUCCESS_TITLE.test(title)
      ? 'success'
      : ERROR_TITLE.test(title)
        ? 'error'
        : cancelButton
          ? 'warning'
          : 'info';

  // Like Alert.alert: close first, then run the button's handler (which may
  // itself open another alert; it is queued behind this one).
  const press = (button?: AlertButton) => {
    shift();
    button?.onPress?.();
  };

  return (
    <ConfirmationModal
      key={current.id}
      visible
      title={title}
      message={message ?? ''}
      type={type}
      danger={isDestructive}
      confirmText={confirmButton.text ?? 'OK'}
      cancelText={cancelButton?.text ?? 'Cancel'}
      hideCancel={!cancelButton}
      footerNote={isDestructive ? undefined : null}
      onConfirm={() => press(confirmButton)}
      onCancel={() => press(cancelButton)}
    />
  );
}

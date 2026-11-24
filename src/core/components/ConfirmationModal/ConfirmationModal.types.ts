// ConfirmationModal.types.ts
export interface ConfirmationModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  danger?: boolean;
  variant?: 'default' | 'destructive';
  icon?: React.ReactNode;
  type?: 'success' | 'error' | 'warning' | 'info';
  /** Single-button message (e.g. an "OK" notice): hides the cancel button. */
  hideCancel?: boolean;
  /** Note under the buttons; pass null to hide it. */
  footerNote?: string | null;
}

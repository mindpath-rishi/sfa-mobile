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
}

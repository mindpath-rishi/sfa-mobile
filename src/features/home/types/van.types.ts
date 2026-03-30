export interface VanChangeModalProps {
  visible: boolean;
  vanChangeReason: string;
  onClose: () => void;
  onSelectReason: (reason: string) => void;
  onSubmit: () => void;
}

export interface Van {
  vanId: string;
  name: string;
  capacity: string;
  vanNumber: string;
}

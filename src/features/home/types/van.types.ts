export interface VanChangeModalProps {
  visible: boolean;
  vanChangeReason: string;
  onClose: () => void;
  onSelectReason: (reason: string) => void;
  onSubmit: () => void;
}

export interface Van {
  id: string;
  name: string;
  type: string;
  capacity: string;
  registration: string;
}

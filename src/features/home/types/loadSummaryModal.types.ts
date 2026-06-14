export interface LoadSummaryModalProps {
  visible: boolean;
  data: LoadSummaryData;
  onClose: () => void;
  onProceed: () => void;
  proceedLabel?: string;
}

export interface LoadSummarySKU {
  id: string;
  sku: string;
  code: string;
  carryForward: string;
  freshStock: string;
}

export interface LoadSummaryData {
  loadNumber: string;
  totalQuantity: string;
  totalValue: string;
  skuDetails: LoadSummarySKU[];
}

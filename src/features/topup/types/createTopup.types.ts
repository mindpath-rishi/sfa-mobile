// createTopup.types.ts

export interface CartItem {
  productId: string;
  productName: string;
  requestedCaseQty: number;
  requestedPieceQty: number;
  requestedQty: number;
  piecePrice: number;
  casePrice: number;
  pieceNetWeight: number;
  caseNetWeight: number;
  unitQtyInCase: number;
  requestedWeight: number;
  requestedValue: number;
}

export interface CartSummary {
  totalUnits: number;
  totalValue: number;
  totalItems: number;
  totalWeight: number;
  totalCases: number;
  totalPieces: number;
}

export interface VanStock {
  productId: string;
  cases: number;
  pieces: number;
  quantity: number;
  unitQtyInCase: number;
}

export interface CreateTopupScreenProps {
  vanId?: string;
}
// Common types and enums shared between banks

export enum Direction {
  IN = 'IN',
  OUT = 'OUT',
}

export interface CategorySummary {
  category: string;
  totalAmount: number;
  count: number;
  averageAmount: number;
}

export interface TargetSummary {
  targetName: string;
  totalAmount: number;
  count: number;
  averageAmount: number;
}

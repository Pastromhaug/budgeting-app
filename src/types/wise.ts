import { z } from 'zod';
import { Direction } from './common';

export const WiseTransactionSchema = z.object({
  ID: z.string(),
  Status: z.string(),
  Direction: z.string(),
  'Created on': z.string(),
  'Finished on': z.string(),
  'Source fee amount': z.union([z.number(), z.string()]),
  'Source fee currency': z.string(),
  'Target fee amount': z.string(),
  'Target fee currency': z.string(),
  'Source name': z.string(),
  'Source amount (after fees)': z.union([z.number(), z.string()]),
  'Source currency': z.string(),
  'Target name': z.string(),
  'Target amount (after fees)': z.union([z.number(), z.string()]),
  'Target currency': z.string(),
  'Exchange rate': z.union([z.number(), z.string()]),
  Reference: z.string(),
  Batch: z.string(),
  'Created by': z.string(),
  Category: z.string(),
  Note: z.string(),
});

export type WiseTransaction = z.infer<typeof WiseTransactionSchema>;

export interface WiseCleanTransaction {
  targetName: string;
  sourceAmount: number;
  category: string;
  direction: Direction;
  createdOn: string;
}

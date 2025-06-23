import { z } from 'zod';
import { Direction } from './common';

// Zod schema for BN Bank transaction (use actual keys from the CSV, including encoding issues)
export const BnTransactionSchema = z.object({
  'Utfrt dato': z.string(),
  'Bokfrt dato': z.string(),
  'Rentedato': z.string(),
  'Beskrivelse': z.string(),
  'Type': z.string(),
  'Undertype': z.string(),
  'Fra konto': z.string(),
  'Avsender': z.string(),
  'Til konto': z.string(),
  'Mottakernavn': z.string(),
  'Belp inn': z.string().optional(),
  'Belp ut': z.string().optional(),
  'Valuta': z.string(),
  'Status': z.string(),
  'Melding/KID/Fakt.nr': z.string(),
});

export type BnTransaction = z.infer<typeof BnTransactionSchema>;

// Cleaned up transaction with only important columns
export interface BnCleanTransaction {
  targetName: string;
  amount: number;
  category: string;
  direction: Direction;
  date: string;
}

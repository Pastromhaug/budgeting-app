import { z } from 'zod';
import { Direction } from './common';

// Zod schema for BN Bank transaction (use actual keys from the CSV, including encoding issues)
export const BnTransactionSchema = z.object({
  'Utfrt dato': z.string(),
  'Bokfrt dato': z.string(),
  Rentedato: z.string(),
  Beskrivelse: z.string(),
  Type: z.string(),
  Undertype: z.string(),
  'Fra konto': z.string(),
  Avsender: z.string(),
  'Til konto': z.string(),
  Mottakernavn: z.string(),
  'Belp inn': z.string().optional(),
  'Belp ut': z.string().optional(),
  Valuta: z.string(),
  Status: z.string(),
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

import { Direction } from './common';

// Raw CSV structure for BN Bank
export interface BnTransaction {
  'Utført dato': string; // Date
  'Bokført dato': string;
  'Rentedato': string;
  'Beskrivelse': string; // Target Name
  'Type': string;
  'Undertype': string; // Category
  'Fra konto': string;
  'Avsender': string;
  'Til konto': string;
  'Mottakernavn': string;
  'Beløp inn': string; // Amount in (may be empty)
  'Beløp ut': string; // Amount out (may be empty)
  'Valuta': string; // Should always be NOK
  'Status': string;
  'Melding/KID/Fakt.nr': string;
}

// Cleaned up transaction with only important columns
export interface BnCleanTransaction {
  targetName: string;
  amount: number;
  category: string;
  direction: Direction;
  date: string;
}

import { Direction } from './common';

// Raw CSV structure for BN Bank (use actual keys from the CSV, including encoding issues)
export interface BnTransaction {
  'Utf�rt dato': string; // Date
  'Bokf�rt dato': string;
  'Rentedato': string;
  'Beskrivelse': string; // Target Name
  'Type': string;
  'Undertype': string; // Category
  'Fra konto': string;
  'Avsender': string;
  'Til konto': string;
  'Mottakernavn': string;
  'Bel�p inn': string; // Amount in (may be empty)
  'Bel�p ut': string; // Amount out (may be empty)
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

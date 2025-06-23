// Wise-specific types and enums
import { Direction } from './common';

export enum WiseStatus {
  COMPLETED = 'COMPLETED',
}

export enum WiseCategory {
  EATING_OUT = 'Eating out',
  GROCERIES = 'Groceries',
  TRANSPORT = 'Transport',
  SHOPPING = 'Shopping',
  PERSONAL_CARE = 'Personal care',
  MONEY_ADDED = 'Money added',
  BILLS = 'Bills',
  GENERAL = 'General',
  ENTERTAINMENT = 'Entertainment',
  REWARDS = 'Rewards',
}

export enum WiseTargetName {
  LOS_TACOS_ALEXANDER_KIELL = 'Los Tacos Alexander Kiell',
  INNOM_BIRKELUNDEN = 'Innom Birkelunden',
  VOI = 'Voi',
  MESTER_GRONN = 'Mester Grønn',
  MENY = 'MENY',
  APOTEK_1 = 'Apotek 1',
  KB_38_HEGDEHAUGSVEIEN = 'Kb 38 Hegdehaugsveien',
  OSCAR_JACOBSON = 'Oscar Jacobson',
  FRETEX_ULLEVAL = 'Fretex Ullevålsveien',
  SUPREME_ROASTWO = 'Supreme Roastwo',
  OPUS = 'OPUS',
  PER_ANDRE_STROMHAUG = 'Per André Strømhaug',
  DAILY_DOSE_AS = 'Daily Dose As',
  FOY_AS = 'Foy As',
  BOLT = 'Bolt',
  KAFFELYKKE = 'Kaffelykke',
  ROSE_SYSTUE_AS = 'Rose Systue As',
  VARNERS_AVD_277 = 'Varners Avd 277',
  HOTEL_BRISTOL = 'Hotel Bristol',
  BLOMSTERISTA = 'BLOMSTERISTA',
  VINMONOPOLET = 'Vinmonopolet',
  HAKONE_MV46 = 'Hakone Mv46',
  KLASSEROMMET_A = 'Klasserommet A',
  SOLBERG_HANSEN = 'Solberg & Hansen',
  DISNEY_PLUS = 'Disney+',
  SQF_NO = 'SQF.no',
  JOTEX = 'Jotex',
  TREKANTEN = 'TREKANTEN',
  NETFLIX = 'Netflix',
  SUPABASE = 'Supabase',
  X_COM_PAID_FEATURES = 'X.com - Paid features',
  BRINNER = 'Brinner',
  WISE = 'TransferWise',
  SUBJEKT = 'Subjekt',
  ANNE_PA_LANDET = 'Anne på landet',
  SAMSUNG = 'Samsung',
  BRAUD_AS = 'Braud As',
  TAXI_VI_1048 = 'Taxi vi 1048',
  LONDON_PUB = 'London Pub',
  ROOR = 'RØØR',
  PRINDSEN_HAGE = 'Prindsen Hage',
  REMA_1000 = 'REMA 1000',
  ELKJOP = 'Elkjøp',
  FOODORA = 'Foodora',
  LOVABLE = 'Lovable',
  SUPERULTRA_INC = 'Superultra Inc.',
  DEPT_EDUCATION = 'DEPT EDUCATION',
  KID_INTERIOR = 'Kid Interiør',
  ANTHROPIC = 'Anthropic',
  CLAUDE = 'Claude',
  HRIMNIR_RAMEN = 'Hrimnir Ramen',
  SEVEN_ELEVEN = '7-Eleven',
  IKEA = 'IKEA',
  POWER = 'POWER',
  SKILTHANDELEN = 'Skilthandelen',
  OTTO_CO_AS = 'Otto Co As',
  MEDIUM_SUBSCRIPTION = 'Medium Subscription',
  ST_PAULI_BIER = 'St Pauli Bier',
  TULLINS_CAFE = 'Tullins Cafe',
}

// Raw CSV structure (all columns from the CSV)
export interface WiseTransaction {
  ID: string;
  Status: WiseStatus;
  Direction: Direction;
  'Created on': string;
  'Finished on': string;
  'Source fee amount': number;
  'Source fee currency': string;
  'Target fee amount': string;
  'Target fee currency': string;
  'Source name': string;
  'Source amount (after fees)': number;
  'Source currency': string;
  'Target name': string;
  'Target amount (after fees)': number | string;
  'Target currency': string;
  'Exchange rate': number;
  Reference: string;
  Batch: string;
  'Created by': string;
  Category: WiseCategory;
  Note: string;
}

// Cleaned up transaction with only important columns
export interface WiseCleanTransaction {
  targetName: string;
  sourceAmount: number;
  category: WiseCategory;
  direction: Direction;
  createdOn: string;
}

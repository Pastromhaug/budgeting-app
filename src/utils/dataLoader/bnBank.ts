import { parseBnBankCSV } from '../csv/bnBank';
import { BnTransaction } from '../../types/bnBank';

export interface BnDataFile {
  year: number;
  month: number;
  bank: string;
  path: string;
  displayName: string;
}

export const availableBnDataFiles: BnDataFile[] = [
  {
    year: 2025,
    month: 5,
    bank: 'bn_bank',
    path: 'data/2025/5/bn_brukskonto.csv',
    displayName: 'BN Bank - May 2025',
  },
  {
    year: 2025,
    month: 4,
    bank: 'bn_bank',
    path: 'data/2025/4/bn_brukskonto.csv',
    displayName: 'BN Bank - April 2025',
  },
].sort((a, b) => {
  if (a.year !== b.year) return b.year - a.year;
  return b.month - a.month;
});

const bnDataCache = new Map<string, BnTransaction[]>();

export interface BnBankDataResult {
  transactions: BnTransaction[];
  errors: string[];
}

export const loadBnBankDataFile = async (
  dataFile: BnDataFile
): Promise<BnTransaction[]> => {
  const cacheKey = dataFile.path;
  if (bnDataCache.has(cacheKey)) {
    const cachedData = bnDataCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }
  const response = await fetch(`/${dataFile.path}`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch CSV file: ${response.status} ${response.statusText}`
    );
  }
  const csvText = await response.text();
  // Clean CSV content: allow printable ASCII, whitespace, and Norwegian letters
  const cleanedCsvText = csvText.replace(/[^\x20-\x7E\n\r\tæøåÆØÅ]/g, '');
  const transactions: BnTransaction[] = await parseBnBankCSV(cleanedCsvText);
  bnDataCache.set(cacheKey, transactions);
  return transactions;
};

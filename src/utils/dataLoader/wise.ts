import { parseWiseCSV } from '../csv/wise';
import { WiseTransaction } from '../../types/wise';

export interface DataFile {
  year: number;
  month: number;
  bank: string;
  path: string;
  displayName: string;
}

export const availableWiseDataFiles: DataFile[] = [
  {
    year: 2025,
    month: 5,
    bank: 'wise',
    path: 'data/2025/5/wise.csv',
    displayName: 'Wise - May 2025',
  },
  {
    year: 2025,
    month: 4,
    bank: 'wise',
    path: 'data/2025/4/wise.csv',
    displayName: 'Wise - April 2025',
  },
].sort((a, b) => {
  if (a.year !== b.year) return b.year - a.year;
  return b.month - a.month;
});

const wiseDataCache = new Map<string, WiseTransaction[]>();

export const loadWiseDataFile = async (
  dataFile: DataFile
): Promise<WiseTransaction[]> => {
  const cacheKey = dataFile.path;
  if (wiseDataCache.has(cacheKey)) {
    const cachedData = wiseDataCache.get(cacheKey);
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
  const transactions = await parseWiseCSV(csvText);
  wiseDataCache.set(cacheKey, transactions);
  return transactions;
};

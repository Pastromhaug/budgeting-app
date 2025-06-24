import { DataFile as WiseDataFile } from './wise';
import { BnDataFile } from './bnBank';

export type DataFile = WiseDataFile | BnDataFile;

// Manifest of available data files by year, month, and bank
export const dataManifest = {
  2025: {
    4: {
      wise: {
        year: 2025,
        month: 4,
        bank: 'wise',
        path: 'data/2025/4/wise.csv',
        displayName: 'Wise - April 2025',
      },
      bn_bank: {
        year: 2025,
        month: 4,
        bank: 'bn_bank',
        path: 'data/2025/4/bn_brukskonto.csv',
        displayName: 'BN Bank - April 2025',
      },
    },
    5: {
      wise: {
        year: 2025,
        month: 5,
        bank: 'wise',
        path: 'data/2025/5/wise.csv',
        displayName: 'Wise - May 2025',
      },
      bn_bank: {
        year: 2025,
        month: 5,
        bank: 'bn_bank',
        path: 'data/2025/5/bn_brukskonto.csv',
        displayName: 'BN Bank - May 2025',
      },
    },
  },
};

// Utility to get all available months (as { year, month })
export function getAvailableMonths(): { year: number; month: number }[] {
  const months: { year: number; month: number }[] = [];
  for (const year of Object.keys(dataManifest)) {
    const yearObj = dataManifest[year as unknown as keyof typeof dataManifest];
    for (const month of Object.keys(yearObj)) {
      months.push({ year: Number(year), month: Number(month) });
    }
  }
  // Sort descending
  return months.sort((a, b) =>
    b.year !== a.year ? b.year - a.year : b.month - a.month
  );
}

// Utility to get DataFile for a given year, month, and bank
export function getDataFile(
  year: number,
  month: number,
  bank: 'wise' | 'bn_bank'
): DataFile | null {
  const yearObj = dataManifest[year as keyof typeof dataManifest];
  if (!yearObj) return null;
  const monthObj = yearObj[month as unknown as keyof typeof yearObj];
  if (!monthObj) return null;
  return monthObj[bank] ?? null;
}

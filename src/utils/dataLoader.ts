import { parseCSV } from './csvUtils';
import { WiseTransaction } from '../types/transactions';

// Available data files structure
export interface DataFile {
  year: number;
  month: number;
  bank: string;
  path: string;
  displayName: string;
}

// Data files configuration - add new files here as you create them
export const availableDataFiles: DataFile[] = [
  {
    year: 2025,
    month: 5,
    bank: 'wise',
    path: 'data/2025/5/wise.csv',
    displayName: 'Wise - May 2025'
  }
];

// Cache for loaded data to avoid re-fetching
const dataCache = new Map<string, WiseTransaction[]>();

// Load CSV data from a specific data file
export const loadDataFile = async (dataFile: DataFile): Promise<WiseTransaction[]> => {
  const cacheKey = dataFile.path;
  
  // Return cached data if available
  if (dataCache.has(cacheKey)) {
    const cachedData = dataCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  try {
    const response = await fetch(`/${dataFile.path}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV file: ${response.status} ${response.statusText}`);
    }
    const csvText = await response.text();
    const transactions = await parseCSV(csvText);
    
    // Cache the parsed data
    dataCache.set(cacheKey, transactions);
    
    return transactions;
  } catch (error) {
    console.error(`Error loading CSV data from ${dataFile.path}:`, error);
    throw new Error(`Could not load CSV data from ${dataFile.displayName}. Make sure the file exists in public/${dataFile.path}`);
  }
};

// Load all available data files and combine them
export const loadAllData = async (): Promise<WiseTransaction[]> => {
  try {
    const allTransactions: WiseTransaction[] = [];
    
    for (const dataFile of availableDataFiles) {
      const transactions = await loadDataFile(dataFile);
      allTransactions.push(...transactions);
    }
    
    // Sort by date (newest first)
    allTransactions.sort((a, b) => {
      const dateA = new Date(a['Created on']);
      const dateB = new Date(b['Created on']);
      return dateB.getTime() - dateA.getTime();
    });
    
    return allTransactions;
  } catch (error) {
    console.error('Error loading all data:', error);
    throw error;
  }
};

// Convenience function for loading just the Wise data (backward compatibility)
export const loadWiseData = async (): Promise<WiseTransaction[]> => {
  return loadAllData();
};

// Get month name from number
export const getMonthName = (month: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] ?? 'Unknown';
};
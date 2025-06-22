import Papa from 'papaparse';
import { WiseTransaction, CleanTransaction, CategorySummary, TargetSummary, Direction, Category } from '../types/transactions';

// Parse CSV data
export const parseCSV = (csvText: string): Promise<WiseTransaction[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transform: (value, header) => {
        // Convert numeric strings to numbers for specific fields
        if (header === 'Source amount (after fees)' || 
            header === 'Target amount (after fees)' || 
            header === 'Exchange rate' ||
            header === 'Source fee amount') {
          const num = parseFloat(value);
          return isNaN(num) ? value : num;
        }
        return value;
      },
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(results.errors);
        } else {
          resolve(results.data as WiseTransaction[]);
        }
      },
      error: (error: any) => {
        reject(error);
      }
    });
  });
};

// Clean transactions to only important columns
export const cleanTransactions = (transactions: WiseTransaction[]): CleanTransaction[] => {
  return transactions.map(transaction => ({
    targetName: transaction['Target name'],
    sourceAmount: transaction['Source amount (after fees)'],
    category: transaction.Category,
    direction: transaction.Direction,
    createdOn: transaction['Created on']
  }));
};

// Calculate total money spent (OUT transactions)
export const calculateTotalSpent = (transactions: CleanTransaction[]): number => {
  return transactions
    .filter(t => t.direction === Direction.OUT)
    .reduce((sum, t) => sum + t.sourceAmount, 0);
};

// Calculate total money received (IN transactions)
export const calculateTotalReceived = (transactions: CleanTransaction[]): number => {
  return transactions
    .filter(t => t.direction === Direction.IN)
    .reduce((sum, t) => sum + t.sourceAmount, 0);
};

// Generate category summaries
export const generateCategorySummaries = (transactions: CleanTransaction[]): CategorySummary[] => {
  const categoryMap = new Map<Category, { total: number; count: number }>();
  
  // Only include OUT transactions for spending analysis
  const spendingTransactions = transactions.filter(t => t.direction === Direction.OUT);
  
  spendingTransactions.forEach(transaction => {
    const existing = categoryMap.get(transaction.category) || { total: 0, count: 0 };
    categoryMap.set(transaction.category, {
      total: existing.total + transaction.sourceAmount,
      count: existing.count + 1
    });
  });
  
  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    totalAmount: data.total,
    count: data.count,
    averageAmount: data.total / data.count
  }));
};

// Generate target summaries
export const generateTargetSummaries = (transactions: CleanTransaction[]): TargetSummary[] => {
  const targetMap = new Map<string, { total: number; count: number }>();
  
  // Only include OUT transactions for spending analysis
  const spendingTransactions = transactions.filter(t => t.direction === Direction.OUT);
  
  spendingTransactions.forEach(transaction => {
    const existing = targetMap.get(transaction.targetName) || { total: 0, count: 0 };
    targetMap.set(transaction.targetName, {
      total: existing.total + transaction.sourceAmount,
      count: existing.count + 1
    });
  });
  
  return Array.from(targetMap.entries()).map(([targetName, data]) => ({
    targetName,
    totalAmount: data.total,
    count: data.count,
    averageAmount: data.total / data.count
  }));
};

// Sort summaries by total amount (descending)
export const sortByAmount = <T extends { totalAmount: number }>(summaries: T[]): T[] => {
  return [...summaries].sort((a, b) => b.totalAmount - a.totalAmount);
};

// Sort summaries by count (descending)
export const sortByCount = <T extends { count: number }>(summaries: T[]): T[] => {
  return [...summaries].sort((a, b) => b.count - a.count);
};
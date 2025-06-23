import Papa from 'papaparse';
import { WiseTransaction, WiseCleanTransaction, WiseCategory } from '../../types/wise';
import { CategorySummary, TargetSummary, Direction } from '../../types/common';

// Parse CSV data for Wise
export const parseWiseCSV = (csvText: string): Promise<WiseTransaction[]> => {
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
      error: (error: unknown) => {
        reject(error);
      }
    });
  });
};

// Clean transactions to only important columns
export const cleanWiseTransactions = (transactions: WiseTransaction[]): WiseCleanTransaction[] => {
  return transactions.map(transaction => ({
    targetName: transaction['Target name'],
    sourceAmount: transaction['Source amount (after fees)'],
    category: transaction.Category,
    direction: transaction.Direction,
    createdOn: transaction['Created on']
  }));
};

// Calculate total money spent (OUT transactions)
export const calculateWiseTotalSpent = (transactions: WiseCleanTransaction[]): number => {
  return transactions
    .filter(t => t.direction === Direction.OUT)
    .reduce((sum, t) => sum + t.sourceAmount, 0);
};

// Calculate total money received (IN transactions)
export const calculateWiseTotalReceived = (transactions: WiseCleanTransaction[]): number => {
  return transactions
    .filter(t => t.direction === Direction.IN)
    .reduce((sum, t) => sum + t.sourceAmount, 0);
};

// Generate category summaries
export const generateWiseCategorySummaries = (transactions: WiseCleanTransaction[]): CategorySummary[] => {
  const categoryMap = new Map<WiseCategory, { total: number; count: number }>();
  const spendingTransactions = transactions.filter(t => t.direction === Direction.OUT);
  spendingTransactions.forEach(transaction => {
    const existing = categoryMap.get(transaction.category) ?? { total: 0, count: 0 };
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
export const generateWiseTargetSummaries = (transactions: WiseCleanTransaction[]): TargetSummary[] => {
  const targetMap = new Map<string, { total: number; count: number }>();
  const spendingTransactions = transactions.filter(t => t.direction === Direction.OUT);
  spendingTransactions.forEach(transaction => {
    const existing = targetMap.get(transaction.targetName) ?? { total: 0, count: 0 };
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
export const sortWiseByAmount = <T extends { totalAmount: number }>(summaries: T[]): T[] => {
  return [...summaries].sort((a, b) => b.totalAmount - a.totalAmount);
};

// Sort summaries by count (descending)
export const sortWiseByCount = <T extends { count: number }>(summaries: T[]): T[] => {
  return [...summaries].sort((a, b) => b.count - a.count);
};

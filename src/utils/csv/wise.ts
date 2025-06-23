import Papa from 'papaparse';
import {
  WiseTransactionSchema,
  WiseCleanTransaction,
  WiseTransaction,
} from '../../types/wise';
import { CategorySummary, TargetSummary, Direction } from '../../types/common';

// Parse CSV data for Wise
export const parseWiseCSV = (csvText: string): Promise<WiseTransaction[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        const transactions: WiseTransaction[] = [];
        for (const row of results.data as WiseTransaction[]) {
          const result = WiseTransactionSchema.safeParse(row);
          if (result.success) {
            transactions.push(result.data);
          } else {
            console.error(
              'Wise CSV validation error:',
              result.error.issues,
              'Row:',
              row
            );
          }
        }
        resolve(transactions);
      },
      error: (error: unknown) => {
        reject(error);
      },
    });
  });
};

// Clean transactions to only important columns
export const cleanWiseTransactions = (
  transactions: WiseTransaction[]
): WiseCleanTransaction[] => {
  return transactions.map(transaction => ({
    targetName: transaction['Target name'],
    sourceAmount:
      typeof transaction['Source amount (after fees)'] === 'string'
        ? parseFloat(transaction['Source amount (after fees)'] as string)
        : (transaction['Source amount (after fees)'] as number),
    category: transaction['Category'],
    direction: transaction['Direction'] as Direction,
    createdOn: transaction['Created on'],
  }));
};

// ... rest of the file unchanged ...
export const calculateWiseTotalSpent = (
  transactions: WiseCleanTransaction[]
): number => {
  return transactions
    .filter(t => t.direction === Direction.OUT)
    .reduce((sum, t) => sum + t.sourceAmount, 0);
};

export const calculateWiseTotalReceived = (
  transactions: WiseCleanTransaction[]
): number => {
  return transactions
    .filter(t => t.direction === Direction.IN)
    .reduce((sum, t) => sum + t.sourceAmount, 0);
};

export const generateWiseCategorySummaries = (
  transactions: WiseCleanTransaction[]
): CategorySummary[] => {
  const categoryMap = new Map<string, { total: number; count: number }>();
  const spendingTransactions = transactions.filter(
    t => t.direction === Direction.OUT
  );
  spendingTransactions.forEach(transaction => {
    const existing = categoryMap.get(transaction.category) ?? {
      total: 0,
      count: 0,
    };
    categoryMap.set(transaction.category, {
      total: existing.total + transaction.sourceAmount,
      count: existing.count + 1,
    });
  });
  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    totalAmount: data.total,
    count: data.count,
    averageAmount: data.total / data.count,
  }));
};

export const generateWiseTargetSummaries = (
  transactions: WiseCleanTransaction[]
): TargetSummary[] => {
  const targetMap = new Map<string, { total: number; count: number }>();
  const spendingTransactions = transactions.filter(
    t => t.direction === Direction.OUT
  );
  spendingTransactions.forEach(transaction => {
    const existing = targetMap.get(transaction.targetName) ?? {
      total: 0,
      count: 0,
    };
    targetMap.set(transaction.targetName, {
      total: existing.total + transaction.sourceAmount,
      count: existing.count + 1,
    });
  });
  return Array.from(targetMap.entries()).map(([targetName, data]) => ({
    targetName,
    totalAmount: data.total,
    count: data.count,
    averageAmount: data.total / data.count,
  }));
};

export const sortWiseByAmount = <T extends { totalAmount: number }>(
  summaries: T[]
): T[] => {
  return [...summaries].sort((a, b) => b.totalAmount - a.totalAmount);
};

export const sortWiseByCount = <T extends { count: number }>(
  summaries: T[]
): T[] => {
  return [...summaries].sort((a, b) => b.count - a.count);
};

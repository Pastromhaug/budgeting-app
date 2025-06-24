import Papa from 'papaparse';
import {
  BnTransactionSchema,
  BnCleanTransaction,
  BnTransaction,
} from '../../types/bnBank';
import { Direction, CategorySummary, TargetSummary } from '../../types/common';

export interface BnBankParseResult {
  transactions: ReturnType<typeof BnTransactionSchema.parse>[];
  errors: string[];
}

// Parse CSV data for BN Bank with zod validation
export const parseBnBankCSV = (csvText: string): Promise<BnTransaction[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      delimiter: ';',
      complete: results => {
        const transactions: BnTransaction[] = [];
        for (const row of results.data as Record<string, unknown>[]) {
          const result = BnTransactionSchema.safeParse(row);
          if (result.success) {
            transactions.push(result.data);
          } else {
            throw new Error(
              'BN Bank CSV validation error: ' +
                JSON.stringify(result.error.issues) +
                '\nRow: ' +
                JSON.stringify(row)
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
export const cleanBnBankTransactions = (
  transactions: BnTransaction[]
): BnCleanTransaction[] => {
  return transactions.map(transaction => {
    const date = transaction['Utfrt dato'];
    const inn = (transaction['Belp inn'] ?? '')
      .replace(/\s/g, '')
      .replace(',', '.');
    const ut = (transaction['Belp ut'] ?? '')
      .replace(/\s/g, '')
      .replace(',', '.');
    let direction: Direction;
    let amount: number;
    if (inn && !isNaN(Number(inn))) {
      direction = Direction.IN;
      amount = parseFloat(inn);
    } else if (ut && !isNaN(Number(ut))) {
      direction = Direction.OUT;
      amount = parseFloat(ut);
    } else {
      direction = Direction.OUT;
      amount = 0;
    }
    return {
      targetName: transaction['Beskrivelse'],
      amount,
      category: transaction['Undertype'],
      direction,
      date,
    };
  });
};

// ... rest of the file unchanged ...
export const calculateBnBankTotalSpent = (
  transactions: BnCleanTransaction[]
): number => {
  return transactions
    .filter(t => t.direction === Direction.OUT)
    .reduce((sum, t) => sum + t.amount, 0);
};

export const calculateBnBankTotalReceived = (
  transactions: BnCleanTransaction[]
): number => {
  return transactions
    .filter(t => t.direction === Direction.IN)
    .reduce((sum, t) => sum + t.amount, 0);
};

export const generateBnBankCategorySummaries = (
  transactions: BnCleanTransaction[]
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
      total: existing.total + transaction.amount,
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

export const generateBnBankTargetSummaries = (
  transactions: BnCleanTransaction[]
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
      total: existing.total + transaction.amount,
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

export const sortBnBankByAmount = <T extends { totalAmount: number }>(
  summaries: T[]
): T[] => {
  return [...summaries].sort((a, b) => b.totalAmount - a.totalAmount);
};

export const sortBnBankByCount = <T extends { count: number }>(
  summaries: T[]
): T[] => {
  return [...summaries].sort((a, b) => b.count - a.count);
};

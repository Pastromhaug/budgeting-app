import Papa from 'papaparse';
import { BnTransaction, BnCleanTransaction } from '../../types/bnBank';
import { Direction } from '../../types/common';

// Parse CSV data for BN Bank
export const parseBnBankCSV = (csvText: string): Promise<BnTransaction[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(results.errors);
        } else {
          resolve(results.data as BnTransaction[]);
        }
      },
      error: (error: unknown) => {
        reject(error);
      }
    });
  });
};

// Clean transactions to only important columns
export const cleanBnBankTransactions = (transactions: BnTransaction[]): BnCleanTransaction[] => {
  return transactions.map(transaction => {
    // Determine direction and amount
    let direction: Direction;
    let amount: number;
    if (transaction['Beløp inn'] && transaction['Beløp inn'].trim() !== '') {
      direction = Direction.IN;
      amount = parseFloat(transaction['Beløp inn'].replace(',', '.'));
    } else if (transaction['Beløp ut'] && transaction['Beløp ut'].trim() !== '') {
      direction = Direction.OUT;
      amount = parseFloat(transaction['Beløp ut'].replace(',', '.'));
    } else {
      direction = Direction.OUT;
      amount = 0;
    }
    return {
      targetName: transaction['Beskrivelse'],
      amount,
      category: transaction['Undertype'],
      direction,
      date: transaction['Utført dato'],
    };
  });
};

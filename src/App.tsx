import { useState, useEffect, useCallback } from 'react';
import type { JSX } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './components/ui/card';
import { Select } from './components/ui/select';
import TransactionTable from './components/TransactionTable';
import SummaryTable from './components/SummaryTable';
import { WiseTransaction, WiseCleanTransaction } from './types/wise';
import { CategorySummary, TargetSummary } from './types/common';
import {
  cleanWiseTransactions,
  calculateWiseTotalSpent,
  calculateWiseTotalReceived,
  generateWiseCategorySummaries,
  generateWiseTargetSummaries,
  sortWiseByAmount,
} from './utils/csvUtils';
import { availableDataFiles, type DataFile } from './utils/dataLoader/common';
import { loadWiseDataFile } from './utils/dataLoader/wise';
import { loadBnBankDataFile, BnBankDataResult } from './utils/dataLoader/bnBank';
import { BnTransaction, BnCleanTransaction } from './types/bnBank';
import { cleanBnBankTransactions } from './utils/csv/bnBank';

function App(): JSX.Element {
  const [rawTransactions, setRawTransactions] = useState<
    WiseTransaction[] | BnTransaction[]
  >([]);
  const [cleanedTransactions, setCleanedTransactions] = useState<
    WiseCleanTransaction[] | BnCleanTransaction[]
  >([]);
  const [categorySummaries, setCategorySummaries] = useState<CategorySummary[]>(
    []
  );
  const [targetSummaries, setTargetSummaries] = useState<TargetSummary[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [totalReceived, setTotalReceived] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDataFile, setSelectedDataFile] = useState<DataFile | null>(
    null
  );
  const [selectedBank, setSelectedBank] = useState<'wise' | 'bn_bank'>('wise');
  const [bnBankErrors, setBnBankErrors] = useState<string[]>([]);

  const loadData = useCallback(
    async (dataFile?: DataFile) => {
      const fileToLoad =
        dataFile ??
        selectedDataFile ??
        availableDataFiles.filter(f => f.bank === selectedBank)[0];

      if (!fileToLoad) {
        setError('No data files available');
        return;
      }

      setLoading(true);
      setError(null);
      setBnBankErrors([]);
      try {
        let transactions;
        if (selectedBank === 'wise') {
          transactions = await loadWiseDataFile(
            fileToLoad as import('./utils/dataLoader/wise').DataFile
          );
          processTransactions(transactions);
        } else if (selectedBank === 'bn_bank') {
          const result: BnBankDataResult = await loadBnBankDataFile(
            fileToLoad as import('./utils/dataLoader/bnBank').BnDataFile
          );
          processBnBankTransactions(result.transactions);
          setBnBankErrors(result.errors);
        }
        if (!selectedDataFile) {
          setSelectedDataFile(fileToLoad);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError(
          `Failed to load transaction data for ${fileToLoad.displayName}. Please check that the CSV file exists.`
        );
      } finally {
        setLoading(false);
      }
    },
    [selectedDataFile, selectedBank]
  );

// ... rest of the file unchanged ...

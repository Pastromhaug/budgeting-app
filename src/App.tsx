import { useState, useEffect, useCallback } from 'react';
import type { JSX } from 'react';
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
import { loadBnBankDataFile } from './utils/dataLoader/bnBank';
import { BnTransaction, BnCleanTransaction } from './types/bnBank';
import {
  cleanBnBankTransactions,
  generateBnBankCategorySummaries,
  generateBnBankTargetSummaries,
  sortBnBankByAmount,
} from './utils/csv/bnBank';

function App(): JSX.Element {
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
      let transactions;
      if (selectedBank === 'wise') {
        transactions = await loadWiseDataFile(
          fileToLoad as import('./utils/dataLoader/wise').DataFile
        );
        processTransactions(transactions);
      } else if (selectedBank === 'bn_bank') {
        const transactions = await loadBnBankDataFile(
          fileToLoad as import('./utils/dataLoader/bnBank').BnDataFile
        );
        processBnBankTransactions(transactions);
      }
      if (!selectedDataFile) {
        setSelectedDataFile(fileToLoad);
      }
    },
    [selectedDataFile, selectedBank]
  );

  useEffect((): void => {
    loadData();
  }, [loadData]);

  const handleMonthChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const selectedPath = event.target.value;
    const dataFile = availableDataFiles.find(
      (file: DataFile) =>
        file.path === selectedPath && file.bank === selectedBank
    );
    if (dataFile) {
      setSelectedDataFile(dataFile);
      loadData(dataFile);
    }
  };

  const processTransactions = (transactions: WiseTransaction[]): void => {
    const cleaned = cleanWiseTransactions(transactions);
    setCleanedTransactions(cleaned);
    setTotalSpent(calculateWiseTotalSpent(cleaned));
    setTotalReceived(calculateWiseTotalReceived(cleaned));
    setCategorySummaries(generateWiseCategorySummaries(cleaned));
    setTargetSummaries(generateWiseTargetSummaries(cleaned));
  };

  const processBnBankTransactions = (transactions: BnTransaction[]): void => {
    const cleaned = cleanBnBankTransactions(transactions);
    setCleanedTransactions(cleaned);
    setCategorySummaries(generateBnBankCategorySummaries(cleaned));
    setTargetSummaries(generateBnBankTargetSummaries(cleaned));
    // TODO: Add BN Bank statistics here
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Budgeting App
          </h1>

          {/* Bank selector */}
          <div className="mb-4">
            <div className="flex items-center gap-4 mb-4">
              <label
                htmlFor="bank-select"
                className="text-sm font-medium text-gray-700"
              >
                Select Bank:
              </label>
              <Select
                id="bank-select"
                value={selectedBank}
                onChange={(e): void => {
                  const newBank = e.target.value as 'wise' | 'bn_bank';
                  setSelectedBank(newBank);
                  const firstFile =
                    availableDataFiles.find(f => f.bank === newBank) ?? null;
                  setSelectedDataFile(firstFile);
                }}
                className="w-48"
              >
                <option value="wise">Wise</option>
                <option value="bn_bank">BN Bank</option>
              </Select>
            </div>
          </div>

          {/* Month selector (only show if wise is selected) */}
          {selectedBank === 'wise' && (
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <label
                  htmlFor="month-select"
                  className="text-sm font-medium text-gray-700"
                >
                  Select Month:
                </label>
                <Select
                  id="month-select"
                  value={selectedDataFile?.path ?? ''}
                  onChange={handleMonthChange}
                  className="w-48"
                  disabled={loading}
                >
                  {availableDataFiles
                    .filter(f => f.bank === selectedBank)
                    .map((file: DataFile) => (
                      <option key={file.path} value={file.path}>
                        {file.displayName}
                      </option>
                    ))}
                </Select>
              </div>
              {selectedDataFile && (
                <div className="text-sm text-gray-600">
                  Viewing data: {selectedDataFile.displayName}
                </div>
              )}
              {loading && (
                <div className="text-sm text-blue-600 mt-1">
                  Loading transaction data...
                </div>
              )}
              {error && (
                <div className="text-sm text-red-600 mt-1">{error}</div>
              )}
            </div>
          )}

          {/* BN Bank Table (use TransactionTable) */}
          {selectedBank === 'bn_bank' && cleanedTransactions.length > 0 && (
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>BN Bank Transactions</CardTitle>
                  <CardDescription>
                    All BN Bank transactions (interactive table)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionTable
                    data={cleanedTransactions as BnCleanTransaction[]}
                    type="cleaned"
                    bank="bn_bank"
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Summary Cards (only for wise) */}
          {selectedBank === 'wise' && cleanedTransactions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-red-600">
                    Total Spent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${totalSpent.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-600">
                    Total Received
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${totalReceived.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {cleanedTransactions.length}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Category and Target Summaries (only for wise) */}
          {selectedBank === 'wise' && cleanedTransactions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <SummaryTable
                data={sortWiseByAmount(categorySummaries)}
                type="category"
              />
              <SummaryTable
                data={sortWiseByAmount(targetSummaries)}
                type="target"
              />
            </div>
          )}

          {/* Category and Target Summaries (only for BN Bank) */}
          {selectedBank === 'bn_bank' && cleanedTransactions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <SummaryTable
                data={sortBnBankByAmount(categorySummaries)}
                type="category"
              />
              <SummaryTable
                data={sortBnBankByAmount(targetSummaries)}
                type="target"
              />
            </div>
          )}

          {/* Transaction Table */}
          {selectedBank === 'wise' && cleanedTransactions.length > 0 && (
            <TransactionTable
              data={cleanedTransactions as WiseCleanTransaction[]}
              type="cleaned"
            />
          )}
        </header>
      </div>
    </div>
  );
}

export default App;

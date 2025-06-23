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
  cleanTransactions,
  calculateTotalSpent,
  calculateTotalReceived,
  generateCategorySummaries,
  generateTargetSummaries,
  sortByAmount,
  sortByCount,
} from './utils/csvUtils';
import {
  loadDataFile,
  availableDataFiles,
  type DataFile,
} from './utils/dataLoader';

function App(): JSX.Element {
  const [rawTransactions, setRawTransactions] = useState<WiseTransaction[]>([]);
  const [cleanedTransactions, setCleanedTransactions] = useState<
    WiseCleanTransaction[]
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
        availableDataFiles[availableDataFiles.length - 1]; // Default to latest month

      if (!fileToLoad) {
        setError('No data files available');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const transactions = await loadDataFile(fileToLoad);
        processTransactions(transactions);
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
    [selectedDataFile]
  );

  // Load data automatically on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMonthChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const selectedPath = event.target.value;
    const dataFile = availableDataFiles.find(
      file => file.path === selectedPath
    );
    if (dataFile) {
      setSelectedDataFile(dataFile);
      loadData(dataFile);
    }
  };

  const processTransactions = (transactions: WiseTransaction[]): void => {
    setRawTransactions(transactions);

    const cleaned = cleanTransactions(transactions);
    setCleanedTransactions(cleaned);

    setTotalSpent(calculateTotalSpent(cleaned));
    setTotalReceived(calculateTotalReceived(cleaned));

    setCategorySummaries(generateCategorySummaries(cleaned));
    setTargetSummaries(generateTargetSummaries(cleaned));
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
                onChange={e =>
                  setSelectedBank(e.target.value as 'wise' | 'bn_bank')
                }
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
                  {availableDataFiles.map(file => (
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

          {/* Placeholder for BN Bank */}
          {selectedBank === 'bn_bank' && (
            <div className="mb-6">
              <div className="text-lg text-gray-600">
                BN Bank support coming soon!
              </div>
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
                  <CardTitle className="text-sm font-medium text-blue-600">
                    Net Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${(totalReceived - totalSpent).toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </header>

        {/* Tabs and tables (only for wise) */}
        {selectedBank === 'wise' && cleanedTransactions.length > 0 && (
          <Tabs defaultValue="raw" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="raw">Raw CSV</TabsTrigger>
              <TabsTrigger value="cleaned">Cleaned</TabsTrigger>
              <TabsTrigger value="categories-amount">
                Categories by $
              </TabsTrigger>
              <TabsTrigger value="categories-count">
                Categories by Count
              </TabsTrigger>
              <TabsTrigger value="targets-amount">Targets by $</TabsTrigger>
              <TabsTrigger value="targets-count">Targets by Count</TabsTrigger>
            </TabsList>

            <TabsContent value="raw" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Raw CSV Data</CardTitle>
                  <CardDescription>
                    All columns from the original CSV file
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionTable data={rawTransactions} type="raw" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cleaned" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cleaned Transactions</CardTitle>
                  <CardDescription>
                    Important columns only: Target name, Amount, Category,
                    Direction, Date
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionTable data={cleanedTransactions} type="cleaned" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories-amount" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Categories by Total Amount</CardTitle>
                  <CardDescription>
                    Spending categories sorted by total amount spent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SummaryTable
                    data={sortByAmount(categorySummaries)}
                    type="category"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories-count" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Categories by Transaction Count</CardTitle>
                  <CardDescription>
                    Spending categories sorted by number of transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SummaryTable
                    data={sortByCount(categorySummaries)}
                    type="category"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="targets-amount" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Targets by Total Amount</CardTitle>
                  <CardDescription>
                    Vendors/targets sorted by total amount spent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SummaryTable
                    data={sortByAmount(targetSummaries)}
                    type="target"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="targets-count" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Targets by Transaction Count</CardTitle>
                  <CardDescription>
                    Vendors/targets sorted by number of transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SummaryTable
                    data={sortByCount(targetSummaries)}
                    type="target"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {cleanedTransactions.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No transaction data available
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Unable to Load Data
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <p className="text-sm text-red-600">
                Make sure your CSV files are placed in the{' '}
                <code className="bg-red-100 px-1 rounded">
                  public/data/YYYY/M/
                </code>{' '}
                folder structure.
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center px-4 py-2 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              Loading transaction data...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

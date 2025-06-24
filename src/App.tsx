import { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
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
import { getAvailableMonths, getDataFile } from './utils/dataLoader/common';
import { loadWiseDataFile } from './utils/dataLoader/wise';
import { loadBnBankDataFile } from './utils/dataLoader/bnBank';
import { BnTransaction, BnCleanTransaction } from './types/bnBank';
import {
  cleanBnBankTransactions,
  generateBnBankCategorySummaries,
  generateBnBankTargetSummaries,
  sortBnBankByAmount,
  calculateBnBankTotalSpent,
  calculateBnBankTotalReceived,
} from './utils/csv/bnBank';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';

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
  const [selectedBank, setSelectedBank] = useState<'wise' | 'bn_bank'>('wise');
  const [selectedMonth, setSelectedMonth] = useState<{
    year: number;
    month: number;
  } | null>(null);

  // Get all available months (sorted)
  const availableMonths = getAvailableMonths();

  // Set default selected month on mount or when availableMonths changes
  useEffect(() => {
    if (!selectedMonth && availableMonths.length > 0) {
      const firstMonth = availableMonths[0];
      if (firstMonth) setSelectedMonth(firstMonth);
    }
  }, [selectedMonth, availableMonths]);

  // Load data when bank or month changes
  useEffect(() => {
    if (!selectedMonth) return;
    const { year, month } = selectedMonth;
    const dataFile = getDataFile(year, month, selectedBank);
    if (!dataFile) {
      setCleanedTransactions([]);
      setCategorySummaries([]);
      setTargetSummaries([]);
      setTotalSpent(0);
      setTotalReceived(0);
      setError('No data');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    (async (): Promise<void> => {
      try {
        if (selectedBank === 'wise') {
          const transactions = await loadWiseDataFile(
            dataFile as import('./utils/dataLoader/wise').DataFile
          );
          processTransactions(transactions);
        } else if (selectedBank === 'bn_bank') {
          const transactions = await loadBnBankDataFile(
            dataFile as import('./utils/dataLoader/bnBank').BnDataFile
          );
          processBnBankTransactions(transactions);
        }
        setError(null);
      } catch (e) {
        setError('No data');
        setCleanedTransactions([]);
        setCategorySummaries([]);
        setTargetSummaries([]);
        setTotalSpent(0);
        setTotalReceived(0);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedBank, selectedMonth]);

  const handleMonthChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const [yearStr, monthStr] = event.target.value.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    if (!isNaN(year) && !isNaN(month)) {
      setSelectedMonth({ year, month });
    }
  };

  const handleBankChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    setSelectedBank(event.target.value as 'wise' | 'bn_bank');
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
                onChange={handleBankChange}
                className="w-48"
              >
                <option value="wise">Wise</option>
                <option value="bn_bank">BN Bank</option>
              </Select>
            </div>
          </div>

          {/* Month selector (for both banks) */}
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
                value={
                  selectedMonth
                    ? `${selectedMonth.year}-${selectedMonth.month}`
                    : ''
                }
                onChange={handleMonthChange}
                className="w-48"
                disabled={loading}
              >
                {availableMonths.map(({ year, month }) => (
                  <option key={`${year}-${month}`} value={`${year}-${month}`}>
                    {`${year} - ${month.toString().padStart(2, '0')}`}
                  </option>
                ))}
              </Select>
            </div>
            {selectedMonth && (
              <div className="text-sm text-gray-600">
                Viewing data: {selectedMonth.year} -{' '}
                {selectedMonth.month.toString().padStart(2, '0')}
              </div>
            )}
            {loading && (
              <div className="text-sm text-blue-600 mt-1">
                Loading transaction data...
              </div>
            )}
            {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
          </div>

          {/* Summary Cards (for both banks) */}
          {cleanedTransactions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {selectedBank === 'wise' ? (
                <>
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
                </>
              ) : (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-red-600">
                        Total Spent
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {Math.abs(
                          calculateBnBankTotalSpent(
                            cleanedTransactions as BnCleanTransaction[]
                          )
                        ).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        NOK
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
                        {Math.abs(
                          calculateBnBankTotalReceived(
                            cleanedTransactions as BnCleanTransaction[]
                          )
                        ).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        NOK
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
                </>
              )}
            </div>
          )}

          {/* Tabs for Categories, Targets, Transactions */}
          {cleanedTransactions.length > 0 && (
            <Tabs defaultValue="categories">
              <TabsList className="mb-4">
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="targets">Targets</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>
              <TabsContent value="categories">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
                  {selectedBank === 'wise' ? (
                    <SummaryTable
                      data={sortWiseByAmount(categorySummaries)}
                      type="category"
                      bank="wise"
                    />
                  ) : (
                    <SummaryTable
                      data={sortBnBankByAmount(categorySummaries)}
                      type="category"
                      bank="bn_bank"
                    />
                  )}
                </div>
              </TabsContent>
              <TabsContent value="targets">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
                  {selectedBank === 'wise' ? (
                    <SummaryTable
                      data={sortWiseByAmount(targetSummaries)}
                      type="target"
                      bank="wise"
                    />
                  ) : (
                    <SummaryTable
                      data={sortBnBankByAmount(targetSummaries)}
                      type="target"
                      bank="bn_bank"
                    />
                  )}
                </div>
              </TabsContent>
              <TabsContent value="transactions">
                <TransactionTable
                  data={
                    selectedBank === 'wise'
                      ? (cleanedTransactions as WiseCleanTransaction[])
                      : (cleanedTransactions as BnCleanTransaction[])
                  }
                  type="cleaned"
                  bank={selectedBank}
                />
              </TabsContent>
            </Tabs>
          )}
        </header>
      </div>
    </div>
  );
}

export default App;

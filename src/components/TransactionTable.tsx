import type { FC } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { WiseTransaction, WiseCleanTransaction } from '../types/wise';

// Register Handsontable modules
registerAllModules();

interface TransactionTableProps {
  data: WiseTransaction[] | WiseCleanTransaction[];
  type: 'raw' | 'cleaned';
}

const TransactionTable: FC<TransactionTableProps> = ({ data, type }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No transactions to display
      </div>
    );
  }

  const rawColumns = [
    { data: 'ID', title: 'ID' },
    { data: 'Status', title: 'Status' },
    { data: 'Direction', title: 'Direction' },
    { data: 'Created on', title: 'Created On' },
    { data: 'Source name', title: 'Source Name' },
    {
      data: 'Source amount (after fees)',
      title: 'Source Amount',
      type: 'numeric',
      numericFormat: { pattern: '$0,0.00' },
    },
    { data: 'Source currency', title: 'Source Currency' },
    { data: 'Target name', title: 'Target Name' },
    { data: 'Target amount (after fees)', title: 'Target Amount' },
    { data: 'Target currency', title: 'Target Currency' },
    { data: 'Category', title: 'Category' },
    { data: 'Note', title: 'Note' },
  ];

  const cleanedColumns = [
    { data: 'targetName', title: 'Target Name' },
    {
      data: 'sourceAmount',
      title: 'Amount (USD)',
      type: 'numeric',
      numericFormat: { pattern: '$0,0.00' },
    },
    { data: 'category', title: 'Category' },
    { data: 'direction', title: 'Direction' },
    { data: 'createdOn', title: 'Date' },
  ];

  const columns = type === 'raw' ? rawColumns : cleanedColumns;

  return (
    <div className="w-full overflow-x-auto">
      <HotTable
        data={data}
        columns={columns}
        rowHeaders={true}
        colHeaders={true}
        height="400"
        width="100%"
        stretchH="all"
        autoWrapRow={true}
        autoWrapCol={true}
        readOnly={true}
        columnSorting={true}
        filters={true}
        dropdownMenu={true}
        licenseKey="non-commercial-and-evaluation"
        className="htCore"
      />
    </div>
  );
};

export default TransactionTable;

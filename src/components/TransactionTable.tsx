import type { FC } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { WiseTransaction, WiseCleanTransaction } from '../types/wise';
import { BnCleanTransaction } from '../types/bnBank';
import type { ColumnSettings } from 'handsontable/settings';

// Register Handsontable modules
registerAllModules();

interface TransactionTableProps {
  data: WiseTransaction[] | WiseCleanTransaction[] | BnCleanTransaction[];
  type: 'raw' | 'cleaned';
  bank?: 'wise' | 'bn_bank';
}

const TransactionTable: FC<TransactionTableProps> = ({
  data,
  type,
  bank = 'wise',
}) => {
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

  const wiseCleanedColumns = [
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

  const bnBankCleanedColumns = [
    { data: 'targetName', title: 'Target Name' },
    {
      data: 'amount',
      title: 'Amount (NOK)',
      type: 'numeric',
      numericFormat: { pattern: '0,0.00' },
    },
    { data: 'category', title: 'Category' },
    { data: 'direction', title: 'Direction' },
    { data: 'date', title: 'Date' },
  ];

  let columns: ColumnSettings[];
  if (type === 'raw') {
    columns = rawColumns;
  } else if (type === 'cleaned' && bank === 'wise') {
    columns = wiseCleanedColumns;
  } else if (type === 'cleaned' && bank === 'bn_bank') {
    columns = bnBankCleanedColumns;
  } else {
    columns = [];
  }

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

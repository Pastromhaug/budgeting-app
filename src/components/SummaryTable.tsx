import type { FC } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { CategorySummary, TargetSummary } from '../types/common';
import type Handsontable from 'handsontable';

// Register Handsontable modules
registerAllModules();

interface SummaryTableProps {
  data: CategorySummary[] | TargetSummary[];
  type: 'category' | 'target';
  bank?: 'wise' | 'bn_bank';
}

const SummaryTable: FC<SummaryTableProps> = ({ data, type, bank = 'wise' }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No summary data to display
      </div>
    );
  }

  const currency = bank === 'bn_bank' ? 'NOK' : '$';

  const renderAmount = (
    _instance: Handsontable.Core,
    td: HTMLTableCellElement,
    _row: number,
    _col: number,
    _prop: string | number,
    value: number
  ): void => {
    const displayValue = bank === 'bn_bank' ? Math.abs(value) : value;
    td.textContent =
      displayValue != null
        ? displayValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : '';
  };

  const categoryColumns = [
    { data: 'category', title: 'Category' },
    {
      data: 'totalAmount',
      title: `Total ${currency}`,
      type: 'numeric',
      numericFormat: { pattern: bank === 'bn_bank' ? '0,0.00' : '$0,0.00' },
      renderer: renderAmount,
    },
    { data: 'count', title: 'Count', type: 'numeric' },
    {
      data: 'averageAmount',
      title: `Average ${currency}`,
      type: 'numeric',
      numericFormat: { pattern: bank === 'bn_bank' ? '0,0.00' : '$0,0.00' },
      renderer: renderAmount,
    },
  ];

  const targetColumns = [
    { data: 'targetName', title: 'Target Name' },
    {
      data: 'totalAmount',
      title: `Total ${currency}`,
      type: 'numeric',
      numericFormat: { pattern: bank === 'bn_bank' ? '0,0.00' : '$0,0.00' },
      renderer: renderAmount,
    },
    { data: 'count', title: 'Count', type: 'numeric' },
    {
      data: 'averageAmount',
      title: `Average ${currency}`,
      type: 'numeric',
      numericFormat: { pattern: bank === 'bn_bank' ? '0,0.00' : '$0,0.00' },
      renderer: renderAmount,
    },
  ];

  const columns = type === 'category' ? categoryColumns : targetColumns;

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

export default SummaryTable;

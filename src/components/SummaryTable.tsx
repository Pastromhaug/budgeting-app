import type { FC } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { CategorySummary, TargetSummary } from '../types/transactions';

// Register Handsontable modules
registerAllModules();

interface SummaryTableProps {
  data: CategorySummary[] | TargetSummary[];
  type: 'category' | 'target';
}

const SummaryTable: FC<SummaryTableProps> = ({ data, type }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No summary data to display
      </div>
    );
  }

  const categoryColumns = [
    { data: 'category', title: 'Category' },
    { data: 'totalAmount', title: 'Total $', type: 'numeric', numericFormat: { pattern: '$0,0.00' } },
    { data: 'count', title: 'Count', type: 'numeric' },
    { data: 'averageAmount', title: 'Average $', type: 'numeric', numericFormat: { pattern: '$0,0.00' } }
  ];

  const targetColumns = [
    { data: 'targetName', title: 'Target Name' },
    { data: 'totalAmount', title: 'Total $', type: 'numeric', numericFormat: { pattern: '$0,0.00' } },
    { data: 'count', title: 'Count', type: 'numeric' },
    { data: 'averageAmount', title: 'Average $', type: 'numeric', numericFormat: { pattern: '$0,0.00' } }
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
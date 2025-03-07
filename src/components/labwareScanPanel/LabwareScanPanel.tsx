import React from 'react';
import { LabwareFieldsFragment, LabwareFlaggedFieldsFragment } from '../../types/sdk';
import { motion } from '../../dependencies/motion';
import { Column, Row } from 'react-table';
import MutedText from '../MutedText';
import LockIcon from '../icons/LockIcon';
import DataTable from '../DataTable';
import RemoveButton from '../buttons/RemoveButton';
import { useLabwareContext } from '../labwareScanner/LabwareScanner';
import labwareColumns from '../dataTableColumns/labwareColumns';

/**
 * Props for {@link LabwareScanPanel}
 */
interface LabwareScanPanelProps {
  /**
   * The list of columns to display in the table
   */
  columns: Column<LabwareFieldsFragment>[];
  onRemove?: (labware: LabwareFlaggedFieldsFragment) => void;
}
const LabwareScanPanel: React.FC<LabwareScanPanelProps> = ({ columns, onRemove }) => {
  const { labwares, removeLabware, locked, enableFlaggedLabwareCheck } = useLabwareContext();

  // Memoize the data for the table
  const data = React.useMemo(() => labwares, [labwares]);

  const columnsToDisplay = React.useMemo(() => {
    return columns as Array<Column<LabwareFlaggedFieldsFragment>>;
  }, [columns]);

  // Column with actions (such as delete) to add to the end of the labwareScanTableColumns passed in
  const removeLabwareColumn = React.useMemo(() => {
    return {
      Header: '',
      id: 'actions',
      Cell: ({ row }: { row: Row<LabwareFlaggedFieldsFragment> }) => {
        if (locked) {
          return <LockIcon className="block m-2 h-5 w-5 text-gray-800" />;
        }

        return (
          <RemoveButton
            type={'button'}
            onClick={() => {
              if (row.original.barcode) {
                removeLabware(row.original.barcode);
                onRemove?.(row.original);
              }
            }}
          />
        );
      }
    };
  }, [locked, removeLabware, onRemove]);

  /**
   * Merge the columns passed in with the actionsColumn, memoizing the result.
   * When enableFlaggedLabwareCheck is set to true, the barcode column displays flag information if the labware is flagged.
   */
  const allColumns: Column<LabwareFlaggedFieldsFragment>[] = React.useMemo(() => {
    return enableFlaggedLabwareCheck
      ? [
          ...columnsToDisplay.map((c) => (c.id === 'barcode' ? labwareColumns.flaggedBarcode() : c)),
          removeLabwareColumn
        ]
      : [...columnsToDisplay, removeLabwareColumn];
  }, [columnsToDisplay, removeLabwareColumn, enableFlaggedLabwareCheck]);

  return (
    <div>
      {labwares.length === 0 && <MutedText>Scan a piece of labware to get started</MutedText>}

      {labwares.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
          <DataTable columns={allColumns} data={data} />
        </motion.div>
      )}
    </div>
  );
};

export default LabwareScanPanel;

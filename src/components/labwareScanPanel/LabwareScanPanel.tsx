import React from "react";
import { LabwareLayoutFragment } from "../../types/graphql";
import { motion } from "framer-motion";
import { Column, Row } from "react-table";
import MutedText from "../MutedText";
import LockIcon from "../icons/LockIcon";
import DataTable from "../DataTable";
import RemoveButton from "../buttons/RemoveButton";
import { useLabwareContext } from "../labwareScanner/LabwareScanner";

/**
 * Props for {@link LabwareScanPanel}
 */
interface LabwareScanPanelProps {
  /**
   * The list of columns to display in the table
   */
  columns: Column<LabwareLayoutFragment>[];
}

const LabwareScanPanel: React.FC<LabwareScanPanelProps> = ({ columns }) => {
  const { labwares, removeLabware, locked } = useLabwareContext();

  // Memoize the data for the table
  const data = React.useMemo(() => labwares, [labwares]);

  // Column with actions (such as delete) to add to the end of the labwareScanTableColumns passed in
  const actionsColumn: Column<LabwareLayoutFragment> = React.useMemo(() => {
    return {
      Header: "",
      id: "actions",
      Cell: ({ row }: { row: Row<LabwareLayoutFragment> }) => {
        if (locked) {
          return <LockIcon className="block m-2 h-5 w-5 text-gray-800" />;
        }

        return (
          <RemoveButton
            onClick={() => {
              row.original.barcode && removeLabware(row.original.barcode);
            }}
          />
        );
      },
    };
  }, [locked, removeLabware]);

  /**
   * Merge the columns passed in with the actionsColumn, memoizing the result.
   */
  const allColumns: Column<LabwareLayoutFragment>[] = [
    ...columns,
    actionsColumn,
  ];

  return (
    <div>
      {labwares.length === 0 && (
        <MutedText>Scan a piece of labware to get started</MutedText>
      )}

      {labwares.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3"
        >
          <DataTable columns={allColumns} data={data} />
        </motion.div>
      )}
    </div>
  );
};

export default LabwareScanPanel;

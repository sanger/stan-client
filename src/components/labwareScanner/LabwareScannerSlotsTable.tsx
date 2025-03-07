import React from 'react';
import { motion } from '../../dependencies/motion';
import LockIcon from '../icons/LockIcon';
import RemoveButton from '../buttons/RemoveButton';
import { useLabwareContext } from './LabwareScanner';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../Table';
import { valueFromSamples } from '../dataTableColumns';

/**
 * Table that shows all slots in a Labware. Can only be used within a {@link LabwareScanner}.
 * Unfortunately doesn't use ReactTable as that doesn't support a way to use {@code rowSpan}s, which we need here.
 */
export default function LabwareScannerSlotsTable() {
  const { labwares, removeLabware, locked } = useLabwareContext();

  return (
    <div>
      {labwares.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
          <Table>
            <TableHead>
              <tr>
                <TableHeader>Address</TableHeader>
                <TableHeader>Tissue Type</TableHeader>
                <TableHeader>Spatial Location</TableHeader>
                <TableHeader />
              </tr>
            </TableHead>

            <TableBody>
              {labwares.flatMap((lw) => {
                return lw.slots.map((slot, i) => (
                  <tr key={lw.barcode + slot.address}>
                    <TableCell>{slot.address}</TableCell>
                    <TableCell>
                      {valueFromSamples(slot, (sample) => sample.tissue.spatialLocation.tissueType.name)}
                    </TableCell>
                    <TableCell>
                      {valueFromSamples(slot, (sample) => String(sample.tissue.spatialLocation.code))}
                    </TableCell>

                    {i === 0 && (
                      <TableCell rowSpan={lw.labwareType.numRows * lw.labwareType.numColumns}>
                        {locked ? (
                          <LockIcon className="block m-2 h-5 w-5 text-gray-800" />
                        ) : (
                          <RemoveButton type={'button'} onClick={() => removeLabware(lw.barcode)} />
                        )}
                      </TableCell>
                    )}
                  </tr>
                ));
              })}
            </TableBody>
          </Table>
        </motion.div>
      )}
    </div>
  );
}

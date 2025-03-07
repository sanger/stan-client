import React from 'react';
import { motion } from '../../dependencies/motion';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../Table';
import { LabwareFlaggedFieldsFragment } from '../../types/sdk';

export default function LabwareSamplesTable({
  labware,
  showBarcode = true
}: {
  labware: LabwareFlaggedFieldsFragment;
  showBarcode?: boolean;
}) {
  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
        <Table>
          <TableHead>
            <tr>
              {showBarcode && <TableHeader>Barcode</TableHeader>}
              <TableHeader>Donor Id </TableHeader>
              <TableHeader>External Name</TableHeader>
              <TableHeader>Tissue type</TableHeader>
              <TableHeader>Section Number</TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {labware.slots.map((slot) =>
              slot.samples.map((sample) => (
                <tr key={`${labware.barcode}-${slot.id}-${sample.id}`}>
                  {showBarcode && <TableCell>{labware.barcode}</TableCell>}
                  <TableCell>{sample.tissue.donor.donorName}</TableCell>
                  <TableCell>{sample.tissue.externalName}</TableCell>
                  <TableCell>{sample.tissue.spatialLocation.tissueType.name}</TableCell>
                  <TableCell>{sample.section}</TableCell>
                </tr>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}

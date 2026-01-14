import React from 'react';
import { motion } from '../../dependencies/motion';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../Table';
import { LabwareFlaggedFieldsFragment } from '../../types/sdk';
import { sectionGroupsBySample } from '../../lib/helpers/labwareHelper';

export default function LabwareSamplesTable({
  labware,
  showBarcode = true
}: {
  labware: LabwareFlaggedFieldsFragment;
  showBarcode?: boolean;
}) {
  const labwareSectionGroups = sectionGroupsBySample(labware);
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
            {Object.values(labwareSectionGroups).map((section, index) => (
              <tr key={`${labware.barcode}-${index}`}>
                {showBarcode && <TableCell>{labware.barcode}</TableCell>}
                <TableCell>{section.source.tissue?.donor.donorName}</TableCell>
                <TableCell>{section.source.tissue?.externalName}</TableCell>
                <TableCell>{section.source.tissue?.spatialLocation.tissueType.name}</TableCell>
                <TableCell>{section.source.newSection}</TableCell>
              </tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}

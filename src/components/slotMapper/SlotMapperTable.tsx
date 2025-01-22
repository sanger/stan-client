import React from 'react';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../Table';
import { LabwareFlaggedFieldsFragment, SlotCopyContent, SlotFieldsFragment } from '../../types/sdk';
import { FlaggedBarcodeLink } from '../dataTableColumns/labwareColumns';

export type SlotMapperTableProps = {
  labware: LabwareFlaggedFieldsFragment;
  slots: SlotFieldsFragment[];
  slotCopyContent: Array<SlotCopyContent>;
};

export default function SlotMapperTable({ labware, slots, slotCopyContent }: SlotMapperTableProps) {
  const mappingForSlots = React.useMemo(() => {
    // useMemo is a hook that returns a memoized value
    const mappingsForInputSlots: { slot: SlotFieldsFragment; destinationAddress: string }[] = [];
    //There are some input slots given, so generate mappings for them
    if (slots.length > 0) {
      slots.forEach((slot) => {
        const mappings = slotCopyContent.filter(
          (scc) => scc.sourceBarcode === labware.barcode && scc.sourceAddress === slot.address
        );
        if (mappings.length > 0) {
          mappings.forEach((scc) => {
            mappingsForInputSlots.push({ slot, destinationAddress: scc.destinationAddress });
          });
        } else {
          mappingsForInputSlots.push({ slot, destinationAddress: '-' });
        }
      });
    } else {
      //Generate mappings for all slots that are mapped to this labware
      const lwSlotCopyContent = slotCopyContent.filter((scc) => scc.sourceBarcode === labware.barcode);
      lwSlotCopyContent.forEach((scc) => {
        const slot = labware.slots.find((slot) => slot.address === scc.sourceAddress);
        if (slot) {
          mappingsForInputSlots.push({ slot, destinationAddress: scc.destinationAddress });
        }
      });
    }
    return mappingsForInputSlots;
  }, [labware, slots, slotCopyContent]);

  return (
    <Table data-testid="mapping_table">
      <TableHead>
        <tr>
          <TableHeader>Source Barcode</TableHeader>
          <TableHeader>Source Address</TableHeader>
          <TableHeader>External Name</TableHeader>
          <TableHeader>Spatial Location</TableHeader>
          <TableHeader>Tissue Type</TableHeader>
          <TableHeader>Replicate Number</TableHeader>
          <TableHeader>Sections Number(s)</TableHeader>
          <TableHeader>Destination Address</TableHeader>
        </tr>
      </TableHead>

      <TableBody>
        {mappingForSlots.map(({ slot, destinationAddress }) => (
          <tr key={`${slot.address}-${slot.labwareId}-${destinationAddress}`}>
            <TableCell>{labware.flagged ? FlaggedBarcodeLink(labware.barcode) : labware.barcode}</TableCell>
            <TableCell>{slot.address}</TableCell>
            <TableCell>{slot.samples.length > 0 ? slot.samples[0].tissue.externalName : ''}</TableCell>
            <TableCell>{slot.samples.length > 0 ? slot.samples[0].tissue.spatialLocation.code : ''}</TableCell>
            <TableCell>
              {slot.samples.length > 0 ? slot.samples[0].tissue.spatialLocation.tissueType.name : ''}
            </TableCell>
            <TableCell>{slot.samples.length > 0 ? slot.samples[0].tissue.replicate : ''}</TableCell>
            <TableCell>{slot.samples.map((sample) => sample.section).join(',')}</TableCell>
            <TableCell>{destinationAddress}</TableCell>
          </tr>
        ))}
      </TableBody>
    </Table>
  );
}

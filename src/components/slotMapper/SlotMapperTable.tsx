import React from "react";
import Table, { TableBody, TableCell, TableHead, TableHeader } from "../Table";
import {
  LabwareLayoutFragment,
  SlotCopyContent,
  SlotFieldsFragment,
} from "../../types/graphql";

type SlotMapperTableProps = {
  labware: LabwareLayoutFragment;
  slot: SlotFieldsFragment;
  slotCopyContent: Array<SlotCopyContent>;
};

export default function SlotMapperTable({
  labware,
  slot,
  slotCopyContent,
}: SlotMapperTableProps) {
  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeader>Source Barcode</TableHeader>
          <TableHeader>Source Address</TableHeader>
          <TableHeader>Destination Address</TableHeader>
        </tr>
      </TableHead>

      <TableBody>
        <tr>
          <TableCell>{labware.barcode}</TableCell>
          <TableCell>{slot.address}</TableCell>
          <TableCell>
            {getDestinationAddress(labware, slot, slotCopyContent) ?? "-"}
          </TableCell>
        </tr>
      </TableBody>
    </Table>
  );
}

/**
 * Returns the mapped address for a particular labware and slot (or "-" if not mapped)
 */
function getDestinationAddress(
  labware: LabwareLayoutFragment,
  slot: LabwareLayoutFragment["slots"][number],
  slotCopyContent: Array<SlotCopyContent>
): string | undefined {
  return slotCopyContent.find(
    (scc) =>
      scc.sourceBarcode === labware.barcode &&
      scc.sourceAddress === slot.address
  )?.destinationAddress;
}

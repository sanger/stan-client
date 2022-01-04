import React from "react";
import Table, { TableBody, TableCell, TableHead, TableHeader } from "../Table";
import {
  LabwareFieldsFragment,
  SlotCopyContent,
  SlotFieldsFragment,
} from "../../types/sdk";

type SlotMapperTableProps = {
  labware: LabwareFieldsFragment;
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
          <TableHeader> External Name</TableHeader>
          <TableHeader> Spatial Location</TableHeader>
          <TableHeader> Tissue Type</TableHeader>
          <TableHeader> Replicate Number</TableHeader>
          <TableHeader> Sections Number(s)</TableHeader>
          <TableHeader>Destination Address</TableHeader>
        </tr>
      </TableHead>

      <TableBody>
        <tr>
          <TableCell>{labware.barcode}</TableCell>
          <TableCell>{slot.address}</TableCell>
          <TableCell>{slot.samples[0].tissue.externalName}</TableCell>
          <TableCell>{slot.samples[0].tissue.spatialLocation.code}</TableCell>
          <TableCell>
            {slot.samples[0].tissue.spatialLocation.tissueType.name}
          </TableCell>
          <TableCell>{slot.samples[0].tissue.replicate}</TableCell>
          <TableCell>
            {slot.samples.map((sample) => sample.section).join(",")}
          </TableCell>
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
  labware: LabwareFieldsFragment,
  slot: LabwareFieldsFragment["slots"][number],
  slotCopyContent: Array<SlotCopyContent>
): string | undefined {
  return slotCopyContent.find(
    (scc) =>
      scc.sourceBarcode === labware.barcode &&
      scc.sourceAddress === slot.address
  )?.destinationAddress;
}

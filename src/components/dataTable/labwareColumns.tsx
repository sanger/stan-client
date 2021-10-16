import React from "react";
import { CellProps, Column } from "react-table";
import {
  Labware,
  LabwareFieldsFragment,
  SampleFieldsFragment,
} from "../../types/sdk";
import Circle from "../Circle";
import { maybeFindSlotByAddress } from "../../lib/helpers/slotHelper";

/**
 * Defined type for a function that returns a column that displays some property of Labware
 */
export type ColumnFactory<E = any> = (
  meta?: E
) => Column<LabwareFieldsFragment>;

const color: ColumnFactory<Map<number, any>> = (meta) => {
  return {
    id: "color",
    Header: "",
    accessor: (originalRow) =>
      meta?.get(originalRow.slots[0]?.samples[0]?.id) ?? "#FFF",
    Cell: (props: CellProps<Labware>) => (
      <Circle backgroundColor={props.value} />
    ),
  };
};

function joinUnique(array: string[]) {
  return Array.from(new Set<string>(array)).join(", ");
}

function valueFromSamples(
  labware: LabwareFieldsFragment,
  sampleFunction: (sample: SampleFieldsFragment) => string
) {
  return joinUnique(
    labware.slots.flatMap((slot) => slot.samples).map(sampleFunction)
  );
}

/**
 * Barcode of the labware
 */
const barcode: ColumnFactory = () => {
  return {
    Header: "Barcode",
    accessor: "barcode",
  };
};

/**
 * Donor name of the first sample in the first slot of the labware
 */
const donorId: ColumnFactory = () => {
  return {
    Header: "Donor ID",
    accessor: (labware) =>
      valueFromSamples(labware, (sample) => sample.tissue.donor.donorName),
  };
};

/**
 * Name of the tissueType of the first sample in the first slot of the labware
 */
const tissueType: ColumnFactory = () => {
  return {
    Header: "Tissue type",
    accessor: (labware) =>
      valueFromSamples(
        labware,
        (sample) => sample.tissue.spatialLocation.tissueType.name
      ),
  };
};

/**
 * Spatial location code for the first sample in the first slot of the labware
 */
const spatialLocation: ColumnFactory = () => {
  return {
    Header: "Spatial location",
    accessor: (labware) =>
      valueFromSamples(labware, (sample) =>
        String(sample.tissue.spatialLocation.code)
      ),
  };
};

/**
 * Replicate number of the first sample in the first slot of the labware
 */
const replicate: ColumnFactory = () => {
  return {
    Header: "Replicate",
    accessor: (labware) =>
      valueFromSamples(labware, (sample) => String(sample.tissue.replicate)),
  };
};

/**
 * Labware's labware type
 */
const labwareType: ColumnFactory = () => {
  return {
    Header: "Labware Type",
    accessor: (labware) => labware.labwareType.name,
  };
};

/**
 * External name of the first sample in the first slot of the labware
 */
const externalName: ColumnFactory = () => {
  return {
    Header: "External ID",
    accessor: (labware) =>
      valueFromSamples(labware, (sample) => sample.tissue.externalName),
  };
};

const bioState: ColumnFactory = () => {
  return {
    Header: "Bio state",
    accessor: (labware) =>
      valueFromSamples(labware, (sample) => sample.bioState.name),
  };
};

const highestSectionForSlot: ColumnFactory = (slotAddress) => {
  return {
    Header: "Highest Section for Block",
    accessor: (labware) =>
      maybeFindSlotByAddress(labware.slots, slotAddress)?.blockHighestSection ??
      "-",
  };
};

/**
 * Name of the medium of the tissue of the first sample in the first slot of the labware
 */
const medium: ColumnFactory = () => {
  return {
    Header: "Medium",
    accessor: (labware) =>
      valueFromSamples(labware, (sample) => sample.tissue.medium.name),
  };
};

/**
 * Name of the fixative of the tissue of the first sample in the first slot of the labware
 */
const fixative: ColumnFactory = () => {
  return {
    Header: "Fixative",
    accessor: (labware) =>
      valueFromSamples(labware, (sample) => sample.tissue.fixative.name),
  };
};

const columns = {
  color,
  barcode,
  donorId,
  tissueType,
  spatialLocation,
  replicate,
  labwareType,
  externalName,
  bioState,
  highestSectionForSlot,
  medium,
  fixative,
};

export default columns;

import React from "react";
import { CellProps, Column } from "react-table";
import { Labware, LabwareFieldsFragment } from "../../types/graphql";
import LabelPrinterButton from "../LabelPrinterButton";
import { buildLabelPrinterMachine } from "../../lib/factories/machineFactory";
import Circle from "../Circle";

/**
 * Defined type for a function that returns a column that displays some property of Labware
 */
type ColumnFactory<E = any> = (meta?: E) => Column<LabwareFieldsFragment>;

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
  sampleFunction: (sample: any) => string
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
      valueFromSamples(labware, (sample) => sample.tissue.spatialLocation.code),
  };
};

/**
 * Replicate number of the first sample in the first slot of the labware
 */
const replicate: ColumnFactory = () => {
  return {
    Header: "Replicate",
    accessor: (labware) =>
      valueFromSamples(labware, (sample) => sample.tissue.replicate),
  };
};

/**
 * Show a {@link LabelPrinterButton}
 */
const printer: ColumnFactory<Parameters<typeof buildLabelPrinterMachine>> = (
  params
) => {
  return {
    id: "printer",
    Header: "",
    Cell: () => (
      <LabelPrinterButton
        labwares={params?.[0] ?? []}
        selectedPrinter={params?.[1] ?? null}
      />
    ),
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

const columns = {
  color,
  barcode,
  donorId,
  tissueType,
  spatialLocation,
  replicate,
  printer,
  labwareType,
  externalName,
  bioState,
};

export default columns;

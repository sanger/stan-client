import React from "react";
import { CellProps, Column } from "react-table";
import { Labware, LabwareLayoutFragment } from "../../types/graphql";
import LabelPrinterButton from "../LabelPrinterButton";
import { buildLabelPrinterMachine } from "../../lib/factories/machineFactory";

/**
 * Defined type for a function that returns a column that displays some property of Labware
 */
type ColumnFactory<E = any> = (meta?: E) => Column<LabwareLayoutFragment>;

const color: ColumnFactory<Map<number, any>> = (meta) => {
  return {
    id: "color",
    Header: "",
    accessor: (originalRow) =>
      meta?.get(originalRow.slots[0]?.samples[0]?.id) ?? "#FFF",
    Cell: (props: CellProps<Labware>) => (
      <span
        style={{ backgroundColor: props.value }}
        className="inline-block h-8 w-8 rounded-full"
      />
    ),
  };
};

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
    accessor: (labware) => labware.slots[0]?.samples[0]?.tissue.donor.donorName,
  };
};

/**
 * Name of the tissueType of the first sample in the first slot of the labware
 */
const tissueType: ColumnFactory = () => {
  return {
    Header: "Tissue type",
    accessor: (labware) =>
      labware.slots[0]?.samples[0]?.tissue.spatialLocation.tissueType.name,
  };
};

/**
 * Spatial location code for the first sample in the first slot of the labware
 */
const spatialLocation: ColumnFactory = () => {
  return {
    Header: "Spatial location",
    accessor: (labware) =>
      labware.slots[0]?.samples[0]?.tissue.spatialLocation.code,
  };
};

/**
 * Replicate number of the first sample in the first slot of the labware
 */
const replicate: ColumnFactory = () => {
  return {
    Header: "Replicate",
    accessor: (labware) => labware.slots[0]?.samples[0]?.tissue.replicate,
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
    accessor: (labware) => labware.slots[0]?.samples[0]?.tissue.externalName,
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
};

export default columns;

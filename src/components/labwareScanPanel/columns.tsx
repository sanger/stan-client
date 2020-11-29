import React from "react";
import { CellProps, Column } from "react-table";
import { Labware } from "../../types/graphql";

/**
 * Defined type for a function that returns a column that displays some property of Labware
 */
type ColumnFactory = (meta?: Map<number, any>) => Column<Labware>;

const meta: ColumnFactory = (meta) => {
  return {
    id: "meta",
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

const columns = {
  meta,
  barcode,
  donorId,
  tissueType,
  spatialLocation,
  replicate,
};

export default columns;

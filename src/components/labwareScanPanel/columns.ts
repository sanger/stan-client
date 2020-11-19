import { Column } from "react-table";
import { Labware } from "../../types/graphql";

/**
 * Defined type for a function that returns a column that displays some property of Labware
 */
type ColumnFactory = () => Column<Labware>;

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

export default {
  barcode,
  donorId,
  tissueType,
  spatialLocation,
  replicate,
};

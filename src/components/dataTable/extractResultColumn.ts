import { Column } from "react-table";
import { ExtractResultQuery } from "../../types/sdk";

/**
 * Defined type for a function that returns a column that displays some property of ExtractResultQuery
 */
type ColumnFactory<E = any> = (meta?: E) => Column<ExtractResultQuery>;

/**
 * Barcode of the labware
 */
const barcode: ColumnFactory = () => {
  return {
    Header: "Barcode",
    accessor: (result) => result.extractResult.labware.barcode,
  };
};

/**
 * External name of the first sample in the first slot of the labware
 */
const externalName: ColumnFactory = () => {
  return {
    Header: "External Name",
    accessor: (result) =>
      result.extractResult.labware.slots[0].samples[0].tissue.externalName,
  };
};

/**
 * Tissue type name of the first sample in the first slot of the labware
 */
const tissueType: ColumnFactory = () => {
  return {
    Header: "Tissue type",
    accessor: (result) =>
      result.extractResult.labware.slots[0].samples[0].tissue.spatialLocation
        .tissueType.name,
  };
};

/**
 * Medium name for the tissue in the first sample in the first slot of the labware
 */
const medium: ColumnFactory = () => {
  return {
    Header: "Medium",
    accessor: (result) =>
      result.extractResult.labware.slots[0].samples[0].tissue.medium.name,
  };
};

/**
 * Fixative name for the tissue in the first sample in the first slot of the labware
 */
const fixative: ColumnFactory = () => {
  return {
    Header: "Fixative",
    accessor: (result) =>
      result.extractResult.labware.slots[0].samples[0].tissue.fixative.name,
  };
};

/**
 * Fixative name for the tissue in the first sample in the first slot of the labware
 */
const nanodropResult: ColumnFactory = () => {
  return {
    Header: "Nanodrop Result",
    accessor: (result) => result.extractResult.concentration,
  };
};

const columns = {
  barcode,
  externalName,
  tissueType,
  medium,
  fixative,
  nanodropResult,
};
export default columns;

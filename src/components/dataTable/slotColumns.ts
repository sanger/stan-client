import { Column } from "react-table";
import { SlotFieldsFragment } from "../../types/sdk";
import { valueFromSamples } from "./index";

export type SlotDataTableRow = SlotFieldsFragment & {
  n: number;
  labwareBarcode: string;
  numberOfLabwareSlots: number;
};

type ColumnFactory = () => Column<SlotDataTableRow>;

const address: ColumnFactory = () => {
  return {
    Header: "Address",
    accessor: "address",
  };
};

const tissueType: ColumnFactory = () => {
  return {
    Header: "Tissue type",
    accessor: (slot) =>
      valueFromSamples(
        slot,
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

export default {
  address,
  tissueType,
  spatialLocation,
};

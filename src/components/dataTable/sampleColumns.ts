import { Column } from "react-table";
import { SampleDataTableRow } from "../../types/stan";
import { LabwareFieldsFragment } from "../../types/sdk";
import { capitalize } from "lodash";

type ColumnFactory<E = any> = (meta?: E) => Column<SampleDataTableRow>;

/**
 * Creates a list of all samples along with their slot address in a labware.
 * Most likely for use in a {@link DataTable}.
 */
export function buildSampleDataTableRows(
  labware: LabwareFieldsFragment
): Array<SampleDataTableRow> {
  return labware.slots.flatMap((slot) => {
    return slot.samples.map((sample) => {
      return { ...sample, slotAddress: slot.address };
    });
  });
}

export const slotAddress: ColumnFactory = () => ({
  Header: "Address",
  accessor: (sample) => sample.slotAddress,
});

export const tissueType: ColumnFactory = () => ({
  Header: "Tissue Type",
  accessor: (sample) => sample.tissue.spatialLocation.tissueType.name,
});

export const sectionNumber: ColumnFactory = () => ({
  Header: "Section Number",
  accessor: (sample) => sample.section,
});

export const bioState: ColumnFactory = () => ({
  Header: "BioState",
  accessor: (sample) => sample.bioState.name,
});

export const replicateNumber: ColumnFactory = () => ({
  Header: "Replicate Number",
  accessor: (sample) => sample.tissue.replicate,
});

export const spatialLocation: ColumnFactory = () => ({
  Header: "Spatial Location",
  accessor: (sample) => sample.tissue.spatialLocation.code,
});

export const lifeStage: ColumnFactory = () => ({
  Header: "Life Stage",
  accessor: (sample) => capitalize(sample.tissue.donor.lifeStage),
});

export const donorName: ColumnFactory = () => ({
  Header: "Donor",
  accessor: (sample) => sample.tissue.donor.donorName,
});

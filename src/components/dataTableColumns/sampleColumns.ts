import { Column } from 'react-table';
import { LabwareFieldsFragment, SampleFieldsFragment, SamplePositionFieldsFragment } from '../../types/sdk';
import { capitalize } from 'lodash';

/**
 * Type that can be used for displaying a Sample in a table row, along with its slot address
 */
type SampleDataTableRow = SampleFieldsFragment & { slotAddress: string } & { slotId: number | undefined } & {
  sectionPosition: string | undefined;
};

type ColumnFactory<E = any> = (meta?: E) => Column<SampleDataTableRow>;

/**
 * Creates a list of all samples along with their slot address in a labware.
 * Most likely for use in a {@link DataTable}.
 */

export function buildSampleDataTableRows(
  labware: LabwareFieldsFragment,
  samplePositionResults: SamplePositionFieldsFragment[]
): Array<SampleDataTableRow> {
  const samplePositionMap: Record<string, SamplePositionFieldsFragment> = {};
  for (const samplePosition of samplePositionResults) {
    samplePositionMap[`${samplePosition.sampleId}-${samplePosition.slotId}`] = samplePosition;
  }

  return labware.slots.flatMap((slot) => {
    return slot.samples.map((sample) => {
      return {
        ...sample,
        slotAddress: slot.address,
        slotId: slot.id,
        sectionPosition: samplePositionMap[`${sample.id}-${slot.id}`]?.region
      };
    });
  });
}

export const slotAddress: ColumnFactory = () => ({
  Header: 'Address',
  accessor: (sample) => sample.slotAddress
});

export const tissueType: ColumnFactory = () => ({
  Header: 'Tissue Type',
  accessor: (sample) => sample.tissue.spatialLocation.tissueType.name
});

export const sectionNumber: ColumnFactory = () => ({
  Header: 'Section Number',
  accessor: (sample) => sample.section
});

export const bioState: ColumnFactory = () => ({
  Header: 'BioState',
  accessor: (sample) => sample.bioState.name
});

export const replicateNumber: ColumnFactory = () => ({
  Header: 'Replicate Number',
  accessor: (sample) => sample.tissue.replicate
});

export const spatialLocation: ColumnFactory = () => ({
  Header: 'Spatial Location',
  accessor: (sample) => sample.tissue.spatialLocation.code
});

export const lifeStage: ColumnFactory = () => ({
  Header: 'Life Stage',
  accessor: (sample) => capitalize(sample.tissue.donor.lifeStage)
});

export const donorName: ColumnFactory = () => ({
  Header: 'Donor',
  accessor: (sample) => sample.tissue.donor.donorName
});

export const slotId: ColumnFactory = () => ({
  Header: 'Slot Id',
  accessor: (sample) => sample.slotId
});

export const sectionPosition: ColumnFactory = () => ({
  Header: 'section position',
  accessor: (sample) => sample.sectionPosition
});

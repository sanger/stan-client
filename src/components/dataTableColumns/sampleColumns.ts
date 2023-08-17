import { Column } from 'react-table';
import { LabwareFieldsFragment, SampleFieldsFragment, SamplePositionFieldsFragment } from '../../types/sdk';
import { capitalize } from 'lodash';

/**
 * Type that can be used for displaying a Sample in a table row, along with its slot address
 */
type SampleDataTableRow = SampleFieldsFragment & { slotAddress: string } & {
  sectionPosition: string | undefined;
};

type ColumnFactory<E = any> = (meta?: E) => Column<SampleDataTableRow>;

const samplePositionMapBySampleIdSlotId = (
  samplePositionResults: SamplePositionFieldsFragment[]
): Record<string, SamplePositionFieldsFragment> => {
  const spMap: Record<string, SamplePositionFieldsFragment> = {};
  for (const samplePosition of samplePositionResults) {
    spMap[`${samplePosition.sampleId}-${samplePosition.slotId}`] = samplePosition;
  }
  return spMap;
};

/**
 * Creates a list of all samples along with their slot address in a labware.
 * Most likely for use in a {@link DataTable}.
 */

export function buildSampleDataTableRows(
  labware: LabwareFieldsFragment,
  samplePositionResults: SamplePositionFieldsFragment[]
): Array<SampleDataTableRow> {
  const samplePositionResultsMap = samplePositionMapBySampleIdSlotId(samplePositionResults);

  return labware.slots.flatMap((slot) => {
    return slot.samples.map((sample) => {
      return {
        ...sample,
        slotAddress: slot.address,
        sectionPosition: samplePositionResultsMap[`${sample.id}-${slot.id}`]?.region
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

export const sectionPosition: ColumnFactory = () => ({
  Header: 'Section Position',
  accessor: (sample) => sample.sectionPosition
});

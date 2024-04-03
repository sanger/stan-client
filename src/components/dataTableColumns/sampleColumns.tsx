import { Column } from 'react-table';
import { LabwareFieldsFragment, SampleFieldsFragment, SamplePositionFieldsFragment } from '../../types/sdk';
import { capitalize } from 'lodash';
import MutedText from '../MutedText';

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
  accessor: (sample) => (
    <div>
      {sample.tissue.spatialLocation.code}
      <MutedText>{sample.tissue.spatialLocation.name}</MutedText>
    </div>
  )
});

export const lifeStage: ColumnFactory = () => ({
  Header: 'Life Stage',
  accessor: (sample) => (sample.tissue.donor.lifeStage ? capitalize(sample.tissue.donor.lifeStage) : 'N/A')
});

export const donorName: ColumnFactory = () => ({
  Header: 'Donor',
  accessor: (sample) => sample.tissue.donor.donorName
});

export const sectionPosition: ColumnFactory = () => ({
  Header: 'Section Position',
  accessor: (sample) => sample.sectionPosition
});

export const medium: ColumnFactory = () => ({
  Header: 'Medium',
  accessor: (sample) => sample.tissue.medium.name
});

export const fixative: ColumnFactory = () => ({
  Header: 'Fixative',
  accessor: (sample) => sample.tissue.fixative.name
});

export const externalId: ColumnFactory = () => ({
  Header: 'External ID',
  accessor: (sample) => sample.tissue.externalName
});

export const huMFre: ColumnFactory = () => {
  return {
    Header: 'HuMFre',
    accessor: (sample) => sample.tissue.hmdmc?.hmdmc
  };
};

import { Column } from 'react-table';
import {
  LabwareFieldsFragment,
  LabwareType,
  SampleBioRisk,
  SampleFieldsFragment,
  SamplePositionFieldsFragment
} from '../../types/sdk';
import { capitalize } from 'lodash';
import MutedText from '../MutedText';

/**
 * Type that can be used for displaying a Sample in a table row, along with its slot address
 */
export type SampleDataTableRow = SampleFieldsFragment & { slotAddress: string } & {
  sectionPosition?: string;
} & { barcode?: string } & { labwareType?: LabwareType } & { bioRiskCode?: string };

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
  samplePositionResults: SamplePositionFieldsFragment[],
  labwareBioRiskCodes: Array<SampleBioRisk>
): SampleDataTableRow[] {
  const samplePositionResultsMap = samplePositionMapBySampleIdSlotId(samplePositionResults);

  return labware.slots.flatMap((slot) => {
    return slot.samples.map((sample) => {
      return {
        ...sample,
        slotAddress: slot.address,
        sectionPosition: samplePositionResultsMap[`${sample.id}-${slot.id}`]?.region,
        bioRiskCode: labwareBioRiskCodes.find((sbr) => sbr.sampleId === sample.id)?.bioRiskCode
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

export const barcode: ColumnFactory = () => {
  return {
    Header: 'Barcode',
    accessor: (sample) => sample.barcode
  };
};
export const labwareType: ColumnFactory = () => {
  return {
    Header: 'Labware Type',
    accessor: (sample) => sample.labwareType?.name
  };
};

export const bioRiskCode: ColumnFactory = () => {
  return {
    Header: 'Biological Risk Number',
    accessor: (sample) => sample.bioRiskCode
  };
};

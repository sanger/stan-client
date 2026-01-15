import { Column } from 'react-table';
import { LabwareFieldsFragment, SampleBioRisk, SamplePositionFieldsFragment } from '../../types/sdk';
import { capitalize } from 'lodash';
import MutedText from '../MutedText';
import { PlannedSectionDetails } from '../../lib/machines/layout/layoutContext';
import { sectionGroupsBySample } from '../../lib/helpers/labwareHelper';

/**
 * Type that can be used for displaying a Section in a table row
 */
export type SectionDataTableRow = PlannedSectionDetails & { sectionPosition?: string } & { bioRiskCode?: string };

type ColumnFactory<E = any> = (meta?: E) => Column<SectionDataTableRow>;

export function buildSectionDataTableRows(
  labware: LabwareFieldsFragment,
  samplePositionResults: SamplePositionFieldsFragment[],
  labwareBioRiskCodes: Array<SampleBioRisk>
): SectionDataTableRow[] {
  const plannedSections = sectionGroupsBySample(labware);
  return Object.values(plannedSections).map((section) => {
    return {
      ...section,
      sectionPosition: samplePositionResults
        .filter((spr) => spr.sampleId === section.source.sampleId && section.addresses.has(spr.address))
        .map((spr) => spr.region)
        .join(', '),
      bioRiskCode: labwareBioRiskCodes.find((sbr) => sbr.sampleId === section.source.sampleId)?.bioRiskCode
    };
  });
}

export const addresses: ColumnFactory = () => ({
  Header: 'Address(es)',
  accessor: (section) => Array.from(section.addresses).join(', ')
});

export const tissueType: ColumnFactory = () => ({
  Header: 'Tissue Type',
  accessor: (section) => section.source.tissue?.spatialLocation.tissueType.name
});

export const sectionNumber: ColumnFactory = () => ({
  Header: 'Section Number',
  accessor: (section) => section.source.newSection
});

export const bioState: ColumnFactory = () => ({
  Header: 'BioState',
  accessor: (section) => section.source.bioState?.name
});

export const replicateNumber: ColumnFactory = () => ({
  Header: 'Replicate Number',
  accessor: (section) => section.source.tissue?.replicate
});

export const spatialLocation: ColumnFactory = () => ({
  Header: 'Spatial Location',
  accessor: (section) => (
    <div>
      {section.source.tissue?.spatialLocation.code}
      <MutedText>{section.source.tissue?.spatialLocation.name}</MutedText>
    </div>
  )
});

export const lifeStage: ColumnFactory = () => ({
  Header: 'Life Stage',
  accessor: (section) =>
    section.source.tissue?.donor.lifeStage ? capitalize(section.source.tissue?.donor.lifeStage) : 'N/A'
});

export const donorName: ColumnFactory = () => ({
  Header: 'Donor',
  accessor: (section) => section.source.tissue?.donor.donorName
});

export const sectionPosition: ColumnFactory = () => ({
  Header: 'Section Position',
  accessor: (section) => section.sectionPosition
});

export const medium: ColumnFactory = () => ({
  Header: 'Medium',
  accessor: (section) => section.source.tissue?.medium.name
});

export const fixative: ColumnFactory = () => ({
  Header: 'Fixative',
  accessor: (section) => section.source.tissue?.fixative.name
});

export const externalId: ColumnFactory = () => ({
  Header: 'External ID',
  accessor: (section) => section.source.tissue?.externalName
});

export const huMFre: ColumnFactory = () => {
  return {
    Header: 'HuMFre',
    accessor: (section) => section.source.tissue?.hmdmc?.hmdmc
  };
};

export const barcode: ColumnFactory = () => {
  return {
    Header: 'Barcode',
    accessor: (section) => section.source.labware.barcode
  };
};
export const labwareType: ColumnFactory = () => {
  return {
    Header: 'Labware Type',
    accessor: (section) => section.source.labware.labwareType?.name
  };
};

export const bioRiskCode: ColumnFactory = () => {
  return {
    Header: 'Biological Risk Number',
    accessor: (section) => section.bioRiskCode
  };
};

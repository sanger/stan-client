import React from 'react';
import { CellProps, Column } from 'react-table';
import {
  FlagPriority,
  LabwareFieldsFragment,
  LabwareFlaggedFieldsFragment,
  SampleFieldsFragment
} from '../../types/sdk';
import Circle from '../Circle';
import { maybeFindSlotByAddress } from '../../lib/helpers/slotHelper';
import { joinUnique, samplesFromLabwareOrSLot, valueFromSamples } from './index';
import StyledLink from '../StyledLink';
import FlagIcon from '../icons/FlagIcon';
import MutedText from '../MutedText';
import BubleChatIcon from '../icons/BubleChatIcon';

/**
 * Defined type for a function that returns a column that displays some property of Labware
 */
export type ColumnFactory<E = any> = (meta?: E) => Column<LabwareFieldsFragment>;

export type FlaggedColumnFactory<E = any> = (meta?: E) => Column<LabwareFlaggedFieldsFragment>;

const color: ColumnFactory<Map<number, any>> = (meta) => {
  return {
    id: 'color',
    Header: '',
    accessor: (originalRow: LabwareFieldsFragment) => meta?.get(originalRow.slots[0]?.samples[0]?.id) ?? '#FFF',
    Cell: (props: CellProps<LabwareFieldsFragment>) => <Circle backgroundColor={props.value} />
  };
};

/**
 * Barcode of the labware
 */
const barcode: ColumnFactory = () => {
  return {
    Header: 'Barcode',
    accessor: 'barcode',
    id: 'barcode'
  };
};

const flaggedBarcode: FlaggedColumnFactory = () => {
  return {
    Header: 'Barcode',
    accessor: (lw: LabwareFlaggedFieldsFragment) => {
      return lw.flagged ? FlaggedBarcodeLink(lw.barcode, lw.flagPriority) : lw.barcode;
    }
  };
};

export const FlaggedBarcodeLink = (barcode: string, priority?: FlagPriority | null, index?: string) => {
  return (
    <div className="whitespace-nowrap" key={index}>
      <StyledLink
        data-testid="flagged-barcode-link"
        className="text-sp bg-transparent hover:text-sp-700 active:text-sp-800"
        to={`/labware/${barcode}`}
        target="_blank"
      >
        {priority && priority === FlagPriority.Flag && <FlagIcon className="inline-block h-5 w-5 -ml-1 mr-1 mb-2" />}
        {priority && priority === FlagPriority.Note && <BubleChatIcon className="inline-block h-5 w-5 -ml-1 mr-1" />}
        {barcode}
      </StyledLink>
    </div>
  );
};

/**
 * Donor name of the first sample in the first slot of the labware
 */
const donorId: ColumnFactory = () => {
  return {
    Header: 'Donor ID',
    accessor: (labware) => valueFromSamples(labware, (sample) => sample.tissue.donor.donorName)
  };
};

/**
 * Name of the tissueType of the first sample in the first slot of the labware
 */
const tissueType: ColumnFactory = () => {
  return {
    Header: 'Tissue type',
    accessor: (labware) => valueFromSamples(labware, (sample) => sample.tissue.spatialLocation.tissueType.name)
  };
};

/**
 * Spatial location code for the first sample in the first slot of the labware
 */

export const spatialLocationColumnDiv = (samples: SampleFieldsFragment[]) => (
  <div>
    {joinUnique(samples.map((sample) => String(sample.tissue.spatialLocation.code)))}
    <MutedText>{joinUnique(samples.map((sample) => String(sample.tissue.spatialLocation.name)))}</MutedText>
  </div>
);
const spatialLocation: ColumnFactory = () => {
  return {
    Header: 'Spatial location',
    accessor: (labware) => {
      const samples = samplesFromLabwareOrSLot(labware);
      return spatialLocationColumnDiv(samples);
    }
  };
};

/**
 * Replicate number of the first sample in the first slot of the labware
 */
const replicate: ColumnFactory = () => {
  return {
    Header: 'Replicate',
    accessor: (labware) => valueFromSamples(labware, (sample) => String(sample.tissue.replicate ?? ''))
  };
};

/**
 * Labware's labware type
 */
const labwareType: ColumnFactory = () => {
  return {
    Header: 'Labware Type',
    accessor: (labware) => labware.labwareType.name
  };
};

/**
 * External name of the first sample in the first slot of the labware
 */
const externalName: ColumnFactory = () => {
  return {
    Header: 'External ID',
    accessor: (labware) => valueFromSamples(labware, (sample) => sample.tissue.externalName ?? '')
  };
};

const bioState: ColumnFactory = () => {
  return {
    Header: 'Bio state',
    accessor: (labware) => valueFromSamples(labware, (sample) => sample.bioState.name)
  };
};

const highestSectionForSlot: ColumnFactory = (slotAddress) => {
  return {
    Header: 'Highest Section for Block',
    accessor: (labware) => maybeFindSlotByAddress(labware.slots, slotAddress)?.blockHighestSection ?? '-'
  };
};

/**
 * medium of the tissue of the first sample in the first slot of the labware
 */
const medium: ColumnFactory = () => {
  return {
    Header: 'Medium',
    accessor: (labware) => (labware.slots[0].samples.length > 0 ? labware.slots[0].samples[0].tissue.medium.name : '')
  };
};

/**
 * Name of the fixative of the tissue of the first sample in the first slot of the labware
 */
const fixative: ColumnFactory = () => {
  return {
    Header: 'Fixative',
    accessor: (labware) => (labware.slots[0].samples.length > 0 ? labware.slots[0].samples[0].tissue.fixative.name : '')
  };
};

const columns = {
  color,
  barcode,
  flaggedBarcode,
  donorId,
  tissueType,
  spatialLocation,
  replicate,
  labwareType,
  externalName,
  bioState,
  highestSectionForSlot,
  medium,
  fixative
};

export default columns;

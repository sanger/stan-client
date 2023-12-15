import { LabwareFieldsFragment, LabwareFlaggedFieldsFragment, Maybe } from '../../../types/sdk';
import { Address, NewFlaggedLabwareLayout, NewLabwareLayout } from '../../../types/stan';

export interface LayoutPlan {
  /**
   * List of all the available source actions
   */
  sources: Array<Source>;

  /**
   * The labware we're laying out onto
   */
  destinationLabware: NewFlaggedLabwareLayout;

  /**
   * Map of sample ID to hex color
   */
  sampleColors: Map<number, string>;

  /**
   * Map of destination slot friendly address to planned source
   */
  plannedActions: Map<Address, Array<Source>>;
}

export interface Source {
  sampleId: number;
  labware: LabwareFieldsFragment | LabwareFlaggedFieldsFragment;
  newSection: number;
  address?: Maybe<Address>;
  region?: string;
  commentIds?: number[];
  replicateNumber?: string;
}

export interface LayoutContext {
  layoutPlan: LayoutPlan;
  possibleActions?: LayoutPlan['plannedActions'];
  selected: Maybe<Source>;
}

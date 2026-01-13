import { LabwareFieldsFragment, LabwareFlaggedFieldsFragment, Maybe, TissueFieldsFragment } from '../../../types/sdk';
import { Address, NewFlaggedLabwareLayout } from '../../../types/stan';

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
  //Map<Address, Array<Source>>;
  plannedActions: Record<string, PlannedSectionDetails>;
}

export type PlannedSectionDetails = {
  addresses: Set<Address>;
  source: Source;
};

export interface Source {
  sampleId: number;
  labware: LabwareFieldsFragment | LabwareFlaggedFieldsFragment;
  newSection: number;
  sampleThickness?: string;
  address?: Maybe<Address>;
  region?: string;
  commentIds?: number[];
  replicateNumber?: string;
  tissue?: TissueFieldsFragment;
}

export interface LayoutContext {
  layoutPlan: LayoutPlan;
  possibleActions?: LayoutPlan['plannedActions'];
  selected: Maybe<Source>;
  errorMessage?: string;
  //selected slots to assign to a section
  selectedSlots?: Set<Address>;
  // keep track of which section is currently being edited
  selectedSectionId?: number;
}

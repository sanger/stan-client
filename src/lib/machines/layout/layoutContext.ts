import {
  BioState,
  LabwareFieldsFragment,
  LabwareFlaggedFieldsFragment,
  Maybe,
  TissueFieldsFragment
} from '../../../types/sdk';
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

  // An array of planned actions. Although the UI currently allows only one
  // source per slot, we now need to support multiple actions per plan.
  // For tube sectioning, the user selects the source per labware (not per sample),
  // therefore all samples within the selected labware must be assigned to tube actions.
  plannedActions: Array<PlannedSectionDetails>;

  operationType?: string;
}

export type PlannedSectionDetails = {
  addresses: Set<Address>;
  source: Source;
  sectionGroupId?: number;
  sectioningOrder?: number;
};

export interface Source {
  sampleId: number;
  labware: LabwareFieldsFragment | LabwareFlaggedFieldsFragment;
  newSection: string;
  sampleThickness?: string;
  address?: Maybe<Address>;
  region?: string;
  commentIds?: number[];
  replicateNumber?: string;
  tissue?: TissueFieldsFragment;
  bioState?: BioState;
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

import { AnalyserScanDataFieldsFragment, CassettePosition, LabwareFlaggedFieldsFragment } from '../../types/sdk';
import { PlannedSectionDetails } from '../../lib/machines/layout/layoutContext';

export type Region = {
  roi: string;
  colorIndexNumber?: number;
  sectionGroups: Array<PlannedSectionDetails>;
};

export type AnalyserLabwareForm = {
  labware: LabwareFlaggedFieldsFragment;
  hybridisation: boolean;
  workNumber: string;
  hasSgpNumberLink?: boolean;
  position?: CassettePosition;
  regions: Array<Region>;
  analyserScanData?: AnalyserScanDataFieldsFragment;
  /**
   * Temporarily stores the color index selected by the user while defining
   * a new region in the RegionDefiner component.
   *
   * This value is cleared once region creation or removal is completed.
   */
  selectedRegionColorIndex?: number;

  /**
   * Temporarily stores the set of slot / section addresses selected by the user
   * when creating or modifying a region in the RegionDefiner component.
   *
   * This value is cleared after the region operation completes.
   */
  selectedAddresses?: Set<string>;
};

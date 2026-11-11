import { AnalyserScanDataFieldsFragment, CassettePosition, LabwareFlaggedFieldsFragment } from '../../types/sdk';
import { PlannedSectionDetails } from '../../lib/machines/layout/layoutContext';
import { GridDirection, Position } from '../../lib/helpers';

/** How a slide is drawn: the order of its slots, and where its barcode goes (below the slide if not given) */
export type SlideLayout = {
  gridDirection: GridDirection;
  barcodeInfoPosition?: Position;
};

/** Xenium analyser: the slide turned 180 degrees (A1 at the bottom right), with the barcode below it */
export const xeniumSlideLayout: SlideLayout = { gridDirection: GridDirection.LeftUp };

/** Atera run: the slide sits the opposite way round to Xenium (A1 at the top left), with the barcode above it */
export const ateraSlideLayout: SlideLayout = {
  gridDirection: GridDirection.RightDown,
  barcodeInfoPosition: Position.TopRight
};

export type Region = {
  roi: string;
  colorIndexNumber?: number;
  sectionGroups: Array<PlannedSectionDetails>;
};

/** How a page names a slide's regions: returns them sorted by slot address, each with its name */
export type RegionNaming = (regions: Array<Region>, runName: string, barcode: string) => Array<Region>;

export type AnalyserLabwareForm = {
  labware: LabwareFlaggedFieldsFragment;
  hybridisation: boolean;
  workNumber: string;
  hasSgpNumberLink?: boolean;
  position?: CassettePosition;
  /** Atera's cassette position (1 to 4); Xenium uses position instead */
  index?: number;
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

/** The form values that adding a scanned labware reads and updates */
export type AnalyserScanFormValues = {
  workNumberAll: string;
  runName: string;
  labware: Array<AnalyserLabwareForm>;
};

/** The form values the RegionDefiner component reads and updates */
export type RegionDefinerFormValues = {
  runName: string;
  labware: Array<AnalyserLabwareForm>;
};

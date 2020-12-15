import { SectioningLayoutContext } from "./sectioningLayoutContext";
import {
  SectioningLayoutSchema,
  SectioningLayoutState,
} from "./sectioningLayoutStates";
import { SectioningLayoutEvents } from "./sectioningLayoutEvents";
import { createSectioningLayoutMachine } from "./sectioningLayoutMachine";
import { Labware } from "../../../../types/graphql";
import { NewLabwareLayout } from "../../../../types/stan";

export type {
  SectioningLayoutContext,
  SectioningLayoutSchema,
  SectioningLayoutState,
  SectioningLayoutEvents,
};

export default createSectioningLayoutMachine;

/**
 * Model of a sectioning layout
 */
export interface SectioningLayout {
  /**
   * The labwares available to section from
   */
  inputLabwares: Labware[];

  /**
   * The new labware we are sectioning on to
   */
  destinationLabware: NewLabwareLayout;

  /**
   * How many labwares of this layout will we be sectioning on to
   */
  quantity: number;

  /**
   * The thinkness of each section (slice)
   */
  sectionThickness: number;

  /**
   * Map of sampleId to colors
   */
  sampleColors: Map<number, string>;

  /**
   * The barcode of the labware we're sectioning on to (for Visium LP slides)
   */
  barcode?: string;
}

import { SectioningLayoutContext } from "./sectioningLayoutContext";
import {
  SectioningLayoutSchema,
  SectioningLayoutState,
} from "./sectioningLayoutStates";
import { SectioningLayoutEvents } from "./sectioningLayoutEvents";
import { createSectioningLayoutMachine } from "./sectioningLayoutMachine";
import { Labware } from "../../../../types/graphql";
import { UnregisteredLabware } from "../../../../types/stan";

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
   * The unregistered labware we are sectioning on to
   */
  destinationLabware: UnregisteredLabware;

  /**
   * How many labwares of this layout will we be sectioning on to
   */
  quantity: number | undefined;

  /**
   * The thickness of each section (slice)
   */
  sectionThickness: number | undefined;

  /**
   * Map of sampleId to colors
   */
  sampleColors: Map<number, string>;

  /**
   * The barcode of the labware we're sectioning on to (for Visium LP slides)
   */
  barcode?: string;
}

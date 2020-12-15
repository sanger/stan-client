import { Maybe, PlanRequestAction } from "../../../types/graphql";
import {
  Address,
  SourcePlanRequestAction,
  NewLabwareLayout,
} from "../../../types/stan";

export interface LayoutPlan {
  /**
   * List of all the available source actions
   */
  sourceActions: Array<SourcePlanRequestAction>;

  /**
   * The labware we're laying out onto
   */
  destinationLabware: NewLabwareLayout;

  /**
   * Map of sample ID to hex color
   */
  sampleColors: Map<number, string>;

  /**
   * Map of friendly address to planned action
   *
   * NOTE: This will probably need to change to a list of {@link PlanRequestAction}
   * in the future as each address can actually support multiple samples
   */
  plannedActions: Map<Address, Action>;
}

export interface Action {
  sampleId: number;
  sourceBarcode: string;
  sourceAddress?: Maybe<Address>;
}

export interface LayoutContext {
  layoutPlan: LayoutPlan;
  selected: Maybe<SourcePlanRequestAction>;
}

import { LayoutEvents } from "./layoutEvents";
import { LayoutContext } from "./layoutContext";
import { LayoutSchema } from "./layoutStates";
import { createLayoutMachine, LayoutMachineType } from "./layoutMachine";
import {
  AnyLabware,
  FriendlyAddress,
  SourcePlanRequestAction,
} from "../../../types/stan";
import { PlanRequestAction } from "../../../types/graphql";

export default createLayoutMachine;

export type { LayoutMachineType, LayoutSchema, LayoutContext, LayoutEvents };

export interface LayoutPlan {
  /**
   * List of all the available source actions
   */
  sourceActions: Array<SourcePlanRequestAction>;

  /**
   * The labware we're laying out onto
   */
  destinationLabware: AnyLabware;

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
  plannedActions: Map<FriendlyAddress, PlanRequestAction>;
}

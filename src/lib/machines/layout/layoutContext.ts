import { Maybe } from "../../../types/graphql";
import { SourcePlanRequestAction } from "../../../types/stan";
import { LayoutPlan } from "./layoutMachine";

export interface LayoutContext {
  layoutPlan: LayoutPlan;
  selected: Maybe<SourcePlanRequestAction>;
}

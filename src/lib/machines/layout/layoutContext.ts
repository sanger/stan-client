import { Maybe } from "../../../types/graphql";
import { SourcePlanRequestAction } from "../../../types/stan";
import { LayoutPlan } from "./index";

export interface LayoutContext {
  layoutPlan: LayoutPlan;
  selected: Maybe<SourcePlanRequestAction>;
}

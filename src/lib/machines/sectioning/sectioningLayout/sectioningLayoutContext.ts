import { Maybe, PlanMutation } from "../../../../types/graphql";
import { ServerErrors } from "../../../../types/stan";
import * as Yup from "yup";
import { Actor } from "xstate";
import { LayoutEvents, LayoutMachineType } from "../../layout";
import { LayoutPlan } from "../../layout";
import { SectioningLayout } from "../sectioningMachine";

/**
 * Context for a {@link SectioningLayout} machine
 */
export interface SectioningLayoutContext {
  /**
   * Errors returned from the server
   */
  serverErrors: Maybe<ServerErrors>;

  /**
   * A sectioning layout
   */
  sectioningLayout: SectioningLayout;

  /**
   * Yup validator for validating the sectioning layout
   */
  validator: Yup.ObjectSchema;

  /**
   * A {@link PlanMutation} `plan` returned from the server
   */
  planResult: Maybe<PlanMutation["plan"]>;

  /**
   * Reference to a `LayoutMachine` Actor
   */
  layoutPlanRef: Maybe<Actor<LayoutMachineType["state"], LayoutEvents>>;

  /**
   * A layout plan
   */
  layoutPlan: LayoutPlan;
}

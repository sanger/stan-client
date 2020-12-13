import { Maybe, PlanMutation } from "../../../../types/graphql";
import { ServerErrors } from "../../../../types/stan";
import * as Yup from "yup";
import { Actor, ActorRef } from "xstate";
import { LayoutEvents } from "../../layout";
import { LayoutPlan } from "../../layout";
import { SectioningLayout } from "./index";
import {
  LabelPrinterEvents,
  LabelPrinterMachineType,
} from "../../labelPrinter";

interface HasLabelPrinterActor {
  actorRef: ActorRef<LabelPrinterEvents>;
}

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
   * The planner operations returned from the plan mutation
   */
  plannedOperations: PlanMutation["plan"]["operations"];

  /**
   * The planned labware returned from the plan mutation along with a LabelPrinter actor
   */
  plannedLabware: Array<
    PlanMutation["plan"]["labware"][number] & HasLabelPrinterActor
  >;

  /**
   * Reference to a `LayoutMachine` Actor
   */
  layoutPlanRef?: ActorRef<LayoutEvents>;

  /**
   * A layout plan
   */
  layoutPlan: LayoutPlan;

  /**
   * Label printer machine
   */
  labelPrinterRef?: ActorRef<LabelPrinterEvents>;

  /**
   * Message from the label printer containing details of the printer's great success
   */
  printSuccessMessage?: string;

  /**
   * Message from the label printer containing details of how the liberal media sabotaged the printer
   */
  printErrorMessage?: string;
}

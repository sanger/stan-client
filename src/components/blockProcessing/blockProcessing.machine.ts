import { LabwareType } from "../../types/sdk";
import { createMachine } from "xstate";
import { Dictionary, flatMap } from "lodash";
import { LabwareTypeName } from "../../types/stan";

interface PlanContext {
  sourceBarcode: string;
  labwareType: string;
  replicate: string;
  preBarcode?: string;
  commentId?: number;
  medium?: string;
}
export interface BlockProcessingContext {
  /**
   * The work number to associate with this confirm operation
   */
  workNumber?: string;
  /**
   * A map of labware type of a list of layout plans for that labware type
   */
  plans: Dictionary<Array<PlanContext>>;
}

type SetWorkNumberEvent = {
  type: "SET_WORK_NUMBER";
  workNumber: string;
};

type AddPlanEvent = {
  type: "ADD_PLAN";
  labwareType: string;
  numLabwares: number;
};

type SetSourceEvent = {
  type: "SET_SOURCE";
  layoutPlan: PlanContext;
  sourceBarcode: string;
};

export type BlockProcessingEvent =
  | SetWorkNumberEvent
  | AddPlanEvent
  | SetSourceEvent;

export const createBlockProcessingMachine = () =>
  createMachine<BlockProcessingContext, BlockProcessingEvent>(
    {
      id: "blockProcessing",
      context: {
        plans: {},
        workNumber: "",
      },
      initial: "ready",
      states: {
        ready: {
          on: {
            ADD_PLAN: { actions: "assignPlan", target: "editable" },
          },
        },
        editable: {
          on: {
            ADD_PLAN: { actions: "addPlan" },
            SET_SOURCE: { actions: "setSource" },
            SET_WORK_NUMBER: { actions: "setWorkNumber" },
          },
        },
      },
    },
    {
      guards: {
        isPlanExists: (ctx, evt) => flatMap(ctx.plans).length > 0,
        isNoPlanExists: (ctx, evt) => flatMap(ctx.plans).length < 0,
      },
      actions: {
        addPlan: (ctx, e) => {
          if (e.type !== "ADD_PLAN") return;
          Array<PlanContext>(e.numLabwares)
            .fill({
              sourceBarcode: "",
              labwareType: e.labwareType,
              replicate: "",
            })
            .forEach((plan) => ctx.plans[e.labwareType].push(plan));
        },
      },
    }
  );

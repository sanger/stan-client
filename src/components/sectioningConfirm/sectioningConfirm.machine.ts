import {
  ConfirmSectionLabware,
  ConfirmSectionMutation,
  FindPlanDataQuery,
  LabwareFieldsFragment,
  Maybe,
} from "../../types/sdk";
import { createMachine } from "xstate";
import { assign } from "@xstate/immer";
import { stanCore } from "../../lib/sdk";
import { LayoutPlan, Source } from "../../lib/machines/layout/layoutContext";
import _, { Dictionary, groupBy } from "lodash";
import {
  Address,
  MachineServiceDone,
  MachineServiceError,
} from "../../types/stan";
import { buildSampleColors } from "../../lib/helpers/labwareHelper";
import { ClientError } from "graphql-request";

type SectioningConfirmContext = {
  /**
   * The list of plans found after scanning in labware
   */
  plans: Array<FindPlanDataQuery>;

  /**
   * A list of deduped source labware derived from the plans
   */
  sourceLabware: Array<LabwareFieldsFragment>;

  /**
   * A map of labware type of a list of layout plans for that labware type
   */
  layoutPlansByLabwareType: Dictionary<Array<LayoutPlan>>;

  /**
   * The current list of ConfirmSectionLabware that will be sent to core with the confirmSection mutation.
   * It may not be always be valid e.g. section numbers yet to be filled in
   */
  confirmSectionLabware: Array<ConfirmSectionLabware>;

  /**
   * Useful for the UI to know if user should be allowed to confirm yet
   */
  isConfirmSectionLabwareValid: boolean;

  /**
   * Possible errors returned from stan core after a confirmSection request
   */
  serverErrors: Maybe<ClientError>;
};

type SectioningConfirmEvent =
  | {
      type: "UPDATE_PLANS";
      plans: Array<FindPlanDataQuery>;
    }
  | {
      type: "UPDATE_CONFIRM_SECTION_LABWARE";
      confirmSectionLabware: ConfirmSectionLabware;
    }
  | { type: "REMOVE_CONFIRM_SECTION_LABWARE"; labwareId: number }
  | { type: "IS_VALID" }
  | { type: "IS_INVALID" }
  | { type: "CONFIRM" }
  | MachineServiceDone<"confirmSection", ConfirmSectionMutation>
  | MachineServiceError<"confirmSection">;

export function createSectioningConfirmMachine() {
  return createMachine<SectioningConfirmContext, SectioningConfirmEvent>(
    {
      id: "sectioningConfirm",
      context: {
        plans: [],
        confirmSectionLabware: [],
        isConfirmSectionLabwareValid: false,
        layoutPlansByLabwareType: {},
        sourceLabware: [],
        serverErrors: null,
      },
      initial: "ready",
      entry: ["assignSourceLabware", "assignLayoutPlans"],
      states: {
        ready: {
          initial: "invalid",
          on: {
            UPDATE_PLANS: {
              actions: [
                "assignPlans",
                "assignSourceLabware",
                "assignLayoutPlans",
              ],
            },
            UPDATE_CONFIRM_SECTION_LABWARE: {
              target: "validating",
              actions: ["assignConfirmSectionLabware"],
            },
            REMOVE_CONFIRM_SECTION_LABWARE: {
              target: "validating",
              actions: [
                "removeConfirmSectionLabware",
                "assignSourceLabware",
                "assignLayoutPlans",
              ],
            },
          },
          states: {
            valid: {
              on: {
                CONFIRM: "#sectioningConfirm.confirming",
              },
            },
            invalid: {},
          },
        },
        validating: {
          invoke: {
            src: "validateConfirmSectionLabware",
          },
          on: {
            IS_VALID: "ready.valid",
            IS_INVALID: "ready.invalid",
          },
        },
        confirming: {
          invoke: {
            src: "confirmSection",
            onDone: {
              target: "confirmed",
              actions: "assignConfirmSection",
            },
            onError: {
              target: "ready.valid",
              actions: "assignServerError",
            },
          },
        },
        confirmed: {
          type: "final",
        },
      },
    },
    {
      actions: {
        assignConfirmSectionLabware: assign((ctx, e) => {
          if (e.type !== "UPDATE_CONFIRM_SECTION_LABWARE") return;

          const cslIndex = ctx.confirmSectionLabware.findIndex(
            (csl) => csl.barcode === e.confirmSectionLabware.barcode
          );

          if (cslIndex > -1) {
            ctx.confirmSectionLabware[cslIndex] = e.confirmSectionLabware;
          } else {
            ctx.confirmSectionLabware.push(e.confirmSectionLabware);
          }
        }),

        assignLayoutPlans: assign((ctx) => {
          ctx.layoutPlansByLabwareType = buildLayoutPlansByLabwareType(
            ctx.plans,
            ctx.sourceLabware
          );
        }),

        assignPlans: assign((ctx, e) => {
          if (e.type !== "UPDATE_PLANS") return;
          ctx.plans = e.plans;
        }),

        assignSourceLabware: assign((ctx) => {
          ctx.sourceLabware = _(ctx.plans)
            .flatMap((plan) => plan.planData.sources)
            .uniqBy((source) => source.barcode)
            .value();
        }),

        assignServerError: assign((ctx, e) => {
          if (e.type !== "error.platform.confirmSection") return;
          ctx.serverErrors = e.data;
        }),

        removeConfirmSectionLabware: assign((ctx, e) => {
          if (e.type !== "REMOVE_CONFIRM_SECTION_LABWARE") return;
          const planIndex = ctx.plans.findIndex(
            (plan) => plan.planData.destination.id === e.labwareId
          );
          if (planIndex >= 0) {
            ctx.plans.splice(planIndex, 1);
          }
        }),
      },

      services: {
        confirmSection: (context) => {
          return stanCore.ConfirmSection({
            request: { labware: context.confirmSectionLabware },
          });
        },

        validateConfirmSectionLabware: (ctx: SectioningConfirmContext) => (
          send
        ) => {
          const isValid = ctx.confirmSectionLabware.every((csl) => {
            if (csl.cancelled) {
              return true;
            }
            return (
              csl.confirmSections?.every((cs) => cs.newSection > 0) ?? false
            );
          });

          send(isValid ? "IS_VALID" : "IS_INVALID");
        },
      },
    }
  );
}

function buildLayoutPlansByLabwareType(
  plans: Array<FindPlanDataQuery>,
  sourceLabwares: Array<LabwareFieldsFragment>
) {
  const sampleColors = buildSampleColors(sourceLabwares);

  // For each plan build a LayoutPlan
  const layoutPlans: Array<LayoutPlan> = plans.map((plan) => {
    return {
      destinationLabware: plan.planData.destination,
      sampleColors,
      plannedActions: plan.planData.plan.planActions.reduce<
        Map<Address, Array<Source>>
      >((memo, planAction) => {
        const slotActions: Array<Source> = [
          {
            sampleId: planAction.sample.id,
            labware: sourceLabwares.find(
              (lw) => lw.id === planAction.source.labwareId
            )!,
            newSection: 0,
            address: planAction.source.address,
          },
        ];
        const plannedActionsForSlot = memo.get(planAction.destination.address);

        if (!plannedActionsForSlot) {
          memo.set(planAction.destination.address, slotActions);
        } else {
          memo.set(planAction.destination.address, [
            ...plannedActionsForSlot,
            ...slotActions,
          ]);
        }

        return memo;
      }, new Map()),
      sources: [],
    };
  });

  return groupBy(layoutPlans, (lp) => lp.destinationLabware.labwareType.name);
}

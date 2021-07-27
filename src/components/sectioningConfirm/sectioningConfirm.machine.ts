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
  requestError: Maybe<ClientError>;
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
        requestError: null,
      },
      initial: "ready",
      entry: ["assignSourceLabware", "assignLayoutPlans"],
      states: {
        ready: {
          initial: "invalid",
          on: {
            UPDATE_PLANS: {
              target: "validating",
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
              actions: "assignRequestError",
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

          /**
           * If a plan has been removed, make sure to also remove the ConfirmSectionLabware for that plan
           */
          const destinationBarcodes = new Set(
            ctx.plans.map((plan) => plan.planData.destination.barcode)
          );

          ctx.confirmSectionLabware = ctx.confirmSectionLabware.filter((csl) =>
            destinationBarcodes.has(csl.barcode)
          );
        }),

        assignSourceLabware: assign((ctx) => {
          ctx.sourceLabware = _(ctx.plans)
            .flatMap((plan) => plan.planData.sources)
            .uniqBy((source) => source.barcode)
            .value();
        }),

        assignRequestError: assign((ctx, e) => {
          if (e.type !== "error.platform.confirmSection") return;
          ctx.requestError = e.data;
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

/**
 * Convert the structure that comes back from core into lists of {@link LayoutPlan LayoutPlans}, grouped by their
 * labware type name (so that they're grouped when displayed on the page).
 *
 * @example
 * {
 *   tube: [layoutPlan1, layoutPlan2],
 *   slide: [layoutPlan3],
 * }
 *
 * @param plans the list of plans to confirm
 * @param sourceLabwares the list of all source labware
 */
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

      /**
       * Layout planner doesn't need to show any sources when doing section confirmation.
       * User will only be able to add or remove the number of sections in a slot.
       */
      sources: [],
    };
  });

  return groupBy(layoutPlans, (lp) => lp.destinationLabware.labwareType.name);
}

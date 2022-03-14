import {
  ConfirmSection,
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
  LabwareTypeName,
  MachineServiceDone,
  MachineServiceError,
} from "../../types/stan";
import {
  buildSampleColors,
  sortDownRight,
} from "../../lib/helpers/labwareHelper";
import { ClientError } from "graphql-request";
import { SectionNumberMode } from "./SectioningConfirm";
import { maybeFindSlotByAddress } from "../../lib/helpers/slotHelper";

type SectioningConfirmContext = {
  /**
   * The work number to associate with this confirm operation
   */
  workNumber?: string;

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
   * Created labwares returned from stan core after a confirmSection (if success)
   */
  confirmSectionResultLabwares: LabwareFieldsFragment[];

  /**
   * Numbering mode for section numbers - either auto or manual
   */
  sectionNumberMode: SectionNumberMode;

  /**
   * Section number start value
   */
  sectionNumberStart: number;

  /**
   * Possible errors returned from stan core after a confirmSection request
   */
  requestError: Maybe<ClientError>;
};

type SectioningConfirmEvent =
  | { type: "UPDATE_WORK_NUMBER"; workNumber?: string }
  | {
      type: "UPDATE_SECTION_NUMBERING_MODE";
      mode: SectionNumberMode;
    }
  | {
      type: "UPDATE_SECTION_START_NUMBER";
      start: number;
    }
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
        confirmSectionResultLabwares: [],
        sectionNumberMode: SectionNumberMode.Auto,
        sectionNumberStart: 0,
      },
      initial: "ready",
      entry: ["assignSourceLabware"],
      states: {
        ready: {
          initial: "invalid",
          on: {
            UPDATE_WORK_NUMBER: { actions: "assignWorkNumber" },
            UPDATE_PLANS: {
              target: "validating",
              actions: [
                "assignPlans",
                "assignSourceLabware",
                "assignLayoutPlans",
                "fillSectionNumbers",
              ],
            },
            UPDATE_CONFIRM_SECTION_LABWARE: {
              target: "validating",
              actions: [
                "assignConfirmSectionLabware",
                "updateSectionLayout",
                "fillSectionNumbers",
              ],
            },
            UPDATE_SECTION_NUMBERING_MODE: {
              actions: ["assignSectionNumberMode", "fillSectionNumbers"],
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
              actions: "assignConfirmSectionResults",
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
          const layoutPlans: LayoutPlan[] = Object.values(
            ctx.layoutPlansByLabwareType
          ).flatMap((plan) => plan);

          /**Remove deleted plans**/
          let updatedLayoutPlans = layoutPlans.filter((lp) =>
            Array.from(ctx.plans.values()).some(
              (plan) =>
                plan.planData.destination.barcode ===
                lp.destinationLabware.barcode
            )
          );
          /**Get newly added plans**/
          const addedPlans = ctx.plans.filter(
            (plan) =>
              !layoutPlans.some(
                (lp) =>
                  plan.planData.destination.barcode ===
                  lp.destinationLabware.barcode
              )
          );
          /**New plans are added, so create LayoutPlan for all new plans and add to the list*/
          if (addedPlans.length > 0) {
            /**Create the layoutPlans for all newly added plans**/
            const layoutPlans = buildLayoutPlans(addedPlans, ctx.sourceLabware);
            updatedLayoutPlans = [...updatedLayoutPlans, ...layoutPlans];
          }

          /**Convert the lists of  LayoutPlans, grouped by their
           * labware type name (so that they're grouped when displayed on the page).
           * @example
           * {
           *   tube: [layoutPlan1, layoutPlan2],
           *   slide: [layoutPlan3],
           * }
           */
          ctx.layoutPlansByLabwareType = groupBy(
            updatedLayoutPlans,
            (lp) => lp.destinationLabware.labwareType.name
          );
        }),
        updateSectionLayout: assign((ctx, e) => {
          if (e.type !== "UPDATE_CONFIRM_SECTION_LABWARE") {
            return;
          }
          let planInOriginalLayout: LayoutPlan | undefined = undefined;

          /**Find the layoutPlan in the list whose section info is changed*/
          for (let plans of Object.values(ctx.layoutPlansByLabwareType)) {
            const findPlan = plans.find(
              (plan) =>
                plan.destinationLabware.barcode ===
                e.confirmSectionLabware.barcode
            );
            if (findPlan) {
              planInOriginalLayout = findPlan;
              break;
            }
          }
          if (planInOriginalLayout && e.confirmSectionLabware.confirmSections) {
            /**Get total sections from existing plan**/
            const sources = Array.from(
              planInOriginalLayout?.plannedActions.values()
            ).flatMap((val) => val);
            const confirmSectionMap = e.confirmSectionLabware.confirmSections.reduce(
              (map, section) => {
                map.has(section.destinationAddress)
                  ? map.get(section.destinationAddress)?.push(section)
                  : map.set(section.destinationAddress, [section]);
                return map;
              },
              new Map<string, ConfirmSection[]>()
            );

            /**Check any change in sections**/
            if (
              sources.length === e.confirmSectionLabware.confirmSections.length
            ) {
              return;
            }

            /**There is change in section, so update the layoutPlan with new sections**/
            planInOriginalLayout!.plannedActions = new Map<string, Source[]>();
            Array.from(confirmSectionMap.keys()).forEach((key) => {
              const sections = confirmSectionMap.get(key);
              if (!sections || sections.length === 0) {
                planInOriginalLayout?.plannedActions.set(key, []);
              } else {
                const newSources = sections!.map((section, indx) => {
                  return {
                    sampleId: section.sampleId,
                    labware: planInOriginalLayout?.destinationLabware as LabwareFieldsFragment,
                    newSection: indx < sources.length ? section.newSection : 0,
                    address: section.destinationAddress,
                  };
                });
                planInOriginalLayout?.plannedActions.set(key, newSources);
              }
            });
          }
        }),

        assignPlans: assign((ctx, e) => {
          if (e.type !== "UPDATE_PLANS") return;
          ctx.plans = e.plans;
          /**
           * If a layoutPlan has been removed, make sure to also remove the ConfirmSectionLabware for that layoutPlan
           */
          const destinationBarcodes = new Set(
            ctx.plans.map((plan) => plan.planData.destination.barcode)
          );

          ctx.confirmSectionLabware = ctx.confirmSectionLabware.filter((csl) =>
            destinationBarcodes.has(csl.barcode)
          );
        }),

        assignSectionNumberMode: assign((ctx, e) => {
          if (e.type !== "UPDATE_SECTION_NUMBERING_MODE") return;
          ctx.sectionNumberMode = e.mode;
        }),

        assignSourceLabware: assign((ctx) => {
          ctx.sourceLabware = _(ctx.plans)
            .flatMap((plan) => plan.planData.sources)
            .uniqBy((source) => source.barcode)
            .value();

          const highestSectionNumber = ctx.sourceLabware.map(
            (sourceLabware) =>
              maybeFindSlotByAddress(sourceLabware.slots, "A1")
                ?.blockHighestSection ?? 0
          );
          ctx.sectionNumberStart = Math.max(...highestSectionNumber);
        }),

        assignRequestError: assign((ctx, e) => {
          if (e.type !== "error.platform.confirmSection") return;
          ctx.requestError = e.data;
        }),

        assignWorkNumber: assign((ctx, e) => {
          if (e.type !== "UPDATE_WORK_NUMBER") return;
          ctx.workNumber = e.workNumber;
        }),
        assignConfirmSectionResults: assign((ctx, e) => {
          if (e.type !== "done.invoke.confirmSection") return;
          ctx.confirmSectionResultLabwares = e.data.confirmSection.labware;
        }),

        fillSectionNumbers: assign((ctx, e) => {
          const updateSectionNumber: boolean =
            ((e.type === "UPDATE_PLANS" ||
              e.type === "UPDATE_CONFIRM_SECTION_LABWARE") &&
              ctx.sectionNumberMode === SectionNumberMode.Auto) ||
            e.type === "UPDATE_SECTION_NUMBERING_MODE";
          updateSectionNumber &&
            fillInSectionNumbersInLayoutPlan(
              ctx.sectionNumberMode,
              ctx.layoutPlansByLabwareType,
              ctx.sectionNumberStart,
              ctx.confirmSectionLabware
                .filter((csl) => csl.cancelled)
                .map((item) => item.barcode)
            );
        }),
      },

      services: {
        confirmSection: (context) => {
          return stanCore.ConfirmSection({
            request: {
              labware: context.confirmSectionLabware,
              workNumber: context.workNumber,
            },
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

/***
 * This function fills in section numbers for all given layout Plans.
 * The filling rules are
 * 1) If the fill mode is 'AUTO' all section numbers will be filled with numbers incrementally starting from 'startNum'
 * 2) Otherwise, if manual all will be filled with zeros
 * 3) First the Tubes will be numbered, followed by other labware in the order they are kept in the list.
 * 4) For slides, the numbering will be columnwise for example: proceed down first column, then down second etc
 * 5) Tubes, if cancelled will be filled with 0, if cancelled, even in 'Auto' mode.
 *
 * @param fillMode 'Auto' or 'Manual'
 * @param layoutPlanMap List of layoutPlans
 * @param startNum For 'Auto' the numbering starts from this value
 * @param cancelledBarcodes Barcodes corresponding to cancelled layout
 */
function fillInSectionNumbersInLayoutPlan(
  fillMode: SectionNumberMode,
  layoutPlanMap: Dictionary<Array<LayoutPlan>>,
  startNum: number,
  cancelledBarcodes: Array<string>
) {
  /**Auto filling of section numbers**/
  if (fillMode === SectionNumberMode.Auto) {
    let lastSectionNum = startNum;

    /**First fill in section numbers for TUBES**/
    const tubes = layoutPlanMap?.[LabwareTypeName.TUBE];
    tubes &&
      tubes.forEach((layoutPlan) => {
        lastSectionNum = autoFillSectionNumbers(
          layoutPlan,
          lastSectionNum,
          /** Tubes, if cancelled will be filled with 0, if cancelled, even in 'Auto' mode**/
          !cancelledBarcodes.some(
            (barcode) => barcode === layoutPlan.destinationLabware.barcode
          )
        );
      });
    /**Fill in section numbers for all labware which are not TUBES**/
    Object.entries(layoutPlanMap)
      .filter(
        ([labwareTypeName, _]) => labwareTypeName !== LabwareTypeName.TUBE
      )
      .forEach(([_, lps]) => {
        lps.forEach((layoutPlan) => {
          lastSectionNum = autoFillSectionNumbers(
            layoutPlan,
            lastSectionNum,
            true
          );
        });
      });
  } else {
    /**Manual filling, so fill all section numbers with default value 0 **/
    Object.entries(layoutPlanMap).forEach(([_, lps]) => {
      return lps.forEach((layoutPlan) => {
        autoFillSectionNumbers(layoutPlan, 0, false);
      });
    });
  }
}
function autoFillSectionNumbers(
  layoutPlan: LayoutPlan,
  sectionNum: number,
  incrementFill: boolean
) {
  let newSectionNum = sectionNum;
  /**Get slots column wise to fill the section numbers**/
  sortDownRight(layoutPlan.destinationLabware.slots).map((slot) => {
    const action = layoutPlan.plannedActions.get(slot.address);
    action &&
      action.length > 0 &&
      action.forEach(
        (item) => (item.newSection = incrementFill ? ++newSectionNum : 0)
      );
    return action;
  });
  return newSectionNum;
}

/**
 * Convert the structure that comes back from core into lists of {@link LayoutPlan LayoutPlans}
 *
 * @param plans the list of plans to confirm
 * @param sourceLabwares the list of all source labware
 */
function buildLayoutPlans(
  plans: Array<FindPlanDataQuery>,
  sourceLabwares: Array<LabwareFieldsFragment>
) {
  const sampleColors = buildSampleColors(sourceLabwares);

  // For each layoutPlan build a LayoutPlan
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
  return layoutPlans;
}

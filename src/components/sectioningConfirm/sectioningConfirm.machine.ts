import {
  ConfirmSectionLabware,
  ConfirmSectionMutation,
  FindPlanDataQuery,
  LabwareFieldsFragment,
  LabwareFlaggedFieldsFragment,
  Maybe,
  PlanActionFieldsFragment
} from '../../types/sdk';
import { assign, createMachine, fromCallback, fromPromise } from 'xstate';
import { stanCore } from '../../lib/sdk';
import { LayoutPlan, PlannedSectionDetails, Source } from '../../lib/machines/layout/layoutContext';
import _, { Dictionary, groupBy } from 'lodash';
import { LabwareTypeName } from '../../types/stan';
import { maybeFindSlotByAddress } from '../../lib/helpers/slotHelper';
import { ClientError } from 'graphql-request';
import { produce } from '../../dependencies/immer';
import { SectionNumberMode } from './SectioningConfirm';
import { buildSampleColors } from '../../lib/helpers/labwareHelper';

type SectioningConfirmContext = {
  /**
   * The work number to associate with this confirm operation
   */
  workNumber: string;

  /**
   * The list of plans found after scanning in labware
   */
  plans: Array<FindPlanDataQuery>;

  /**
   * A list of deduped source labware derived from the plans
   */
  sourceLabware: Array<LabwareFlaggedFieldsFragment>;

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
   * Created labwares returned from stan core after a confirmSection (if success)
   */
  confirmSectionResultLabwares: LabwareFieldsFragment[];

  /**
   * Numbering mode for section numbers - either auto or manual
   */
  sectionNumberMode: SectionNumberMode;

  /**
   * Map to store the highest section numbers for each source labware. Key is the source labware barcode
   */
  highestSectionNumbers: Map<string, number>;

  /**
   * Possible errors returned from stan core after a confirmSection request
   */
  requestError: Maybe<ClientError>;
};

type SectioningConfirmEvent =
  | { type: 'UPDATE_WORK_NUMBER'; workNumber: string }
  | {
      type: 'UPDATE_SECTION_NUMBERING_MODE';
      mode: SectionNumberMode;
    }
  | {
      type: 'UPDATE_SECTION_START_NUMBER';
      start: number;
      sourceBarcode: string;
    }
  | {
      type: 'UPDATE_SECTION_LAYOUT';
      layoutPlan: LayoutPlan;
    }
  | {
      type: 'UPDATE_SECTION_NUMBER';
      layoutPlan: LayoutPlan;
      sectionGroupId: string;
      sectionNumber: number;
    }
  | {
      type: 'UPDATE_PLANS';
      plans: Array<FindPlanDataQuery>;
    }
  | {
      type: 'UPDATE_CONFIRM_SECTION_LABWARE';
      confirmSectionLabware: ConfirmSectionLabware;
    }
  | { type: 'IS_VALID' }
  | { type: 'IS_INVALID' }
  | { type: 'CONFIRM' }
  | { type: 'xstate.done.actor.confirmSection'; output: ConfirmSectionMutation }
  | { type: 'xstate.error.actor.confirmSection'; error: ClientError }
  | {
      type: 'UPDATE_SECTION_THICKNESS';
      layoutPlan: LayoutPlan;
      sectionGroupId: string;
      sectionThickness: string;
    };

const isValidSectionLabware = (ctx: SectioningConfirmContext): boolean => {
  return ctx.confirmSectionLabware.every((csl) => {
    if (!csl.workNumber) return false;
    /**Check if plan has any Fetal waste labware and it has barcode information**/
    if (
      csl.cancelled ||
      (ctx.layoutPlansByLabwareType[LabwareTypeName.FETAL_WASTE_CONTAINER] &&
        ctx.layoutPlansByLabwareType[LabwareTypeName.FETAL_WASTE_CONTAINER].some(
          (plan) => plan.destinationLabware.barcode === csl.barcode
        ))
    ) {
      return true;
    }
    /** Has every section got a section number? **/
    const validSectionNumber = csl.confirmSections?.every((cs) => (cs.newSection ? cs.newSection > 0 : false)) ?? false;
    if (!validSectionNumber) return false;
    return true;
  });
};

export function createSectioningConfirmMachine() {
  return createMachine(
    {
      id: 'sectioningConfirm',
      types: {} as {
        context: SectioningConfirmContext;
        events: SectioningConfirmEvent;
      },
      context: {
        workNumber: '',
        plans: [],
        confirmSectionLabware: [],
        layoutPlansByLabwareType: {},
        sourceLabware: [],
        requestError: null,
        confirmSectionResultLabwares: [],
        sectionNumberMode: SectionNumberMode.Auto,
        highestSectionNumbers: new Map()
      },
      initial: 'ready',
      entry: ['assignSourceLabware'],
      states: {
        ready: {
          initial: 'invalid',
          on: {
            UPDATE_WORK_NUMBER: {
              target: 'validating',
              actions: 'assignWorkNumber'
            },
            UPDATE_PLANS: {
              target: 'validating',
              actions: ['assignPlans', 'assignSourceLabware', 'assignLayoutPlans', 'fillSectionNumbers']
            },
            UPDATE_CONFIRM_SECTION_LABWARE: {
              target: 'validating',
              actions: ['assignConfirmSectionLabware']
            },
            UPDATE_SECTION_LAYOUT: {
              target: 'validating',
              actions: ['updateSectionLayout', 'fillSectionNumbers']
            },
            UPDATE_SECTION_NUMBERING_MODE: {
              actions: ['assignSectionNumberMode', 'fillSectionNumbers']
            },
            UPDATE_SECTION_NUMBER: {
              actions: 'assignSectionNumber'
            },
            UPDATE_SECTION_THICKNESS: {
              actions: 'assignSectionThickness'
            }
          },
          states: {
            valid: {
              on: {
                CONFIRM: '#sectioningConfirm.confirming'
              }
            },
            invalid: {}
          }
        },
        validating: {
          invoke: {
            src: fromCallback(({ sendBack, input }) => {
              sendBack({ type: input.isValid ? 'IS_VALID' : 'IS_INVALID' });
            }),
            input: ({ context }) => {
              return { isValid: isValidSectionLabware(context) };
            },
            id: 'validateConfirmSectionLabware'
          },
          on: {
            IS_VALID: 'ready.valid',
            IS_INVALID: 'ready.invalid'
          }
        },
        confirming: {
          invoke: {
            src: fromPromise(({ input }) =>
              stanCore.ConfirmSection({
                request: {
                  ...input
                }
              })
            ),
            input: ({ context }) => ({
              labware: context.confirmSectionLabware
            }),
            id: 'confirmSection',
            onDone: {
              target: 'confirmed',
              actions: 'assignConfirmSectionResults'
            },
            onError: {
              target: 'ready.valid',
              actions: 'assignRequestError'
            }
          }
        },
        confirmed: {
          type: 'final'
        }
      }
    },
    {
      actions: {
        assignConfirmSectionLabware: assign(({ context, event }) => {
          if (event.type !== 'UPDATE_CONFIRM_SECTION_LABWARE') return context;
          const cslIndex = context.confirmSectionLabware.findIndex(
            (csl) => csl.barcode === event.confirmSectionLabware.barcode
          );
          let confirmLabware = event.confirmSectionLabware;
          console.log('======= UPDATE_CONFIRM_SECTION_LABWARE === ');
          console.log(confirmLabware);
          console.log(context);
          /**
           When the request is submitted for fetal waste labware, It needs to be sent with
           a ConfirmSection that has a destination address and a sample id,
           but no "newSection", since it has no section number.
           **/
          if (
            context.layoutPlansByLabwareType[LabwareTypeName.FETAL_WASTE_CONTAINER] &&
            context.layoutPlansByLabwareType[LabwareTypeName.FETAL_WASTE_CONTAINER].some(
              (plan) => plan.destinationLabware.barcode === event.confirmSectionLabware.barcode
            )
          ) {
            confirmLabware = {
              ...event.confirmSectionLabware,
              confirmSections: event.confirmSectionLabware.confirmSections
                ? event.confirmSectionLabware.confirmSections.map((cs) => {
                    return {
                      sampleId: cs.sampleId,
                      destinationAddresses: cs.destinationAddresses,
                      thickness: cs.thickness
                    };
                  })
                : []
            };
          }

          return produce(context, (draft) => {
            if (cslIndex > -1) {
              draft.confirmSectionLabware[cslIndex] = confirmLabware;
            } else {
              draft.confirmSectionLabware.push(confirmLabware);
            }
          });
        }),
        assignLayoutPlans: assign(({ context }) => {
          const layoutPlans: LayoutPlan[] = Object.values(context.layoutPlansByLabwareType).flatMap((plan) => plan);

          /**Remove deleted plans**/
          let updatedLayoutPlans = layoutPlans.filter((lp) =>
            Array.from(context.plans.values()).some(
              (plan) => plan.planData.destination.barcode === lp.destinationLabware.barcode
            )
          );
          /**Get newly added plans**/
          const addedPlans = context.plans.filter(
            (plan) => !layoutPlans.some((lp) => plan.planData.destination.barcode === lp.destinationLabware.barcode)
          );
          /**New plans are added, so create LayoutPlan for all new plans and add to the list*/
          if (addedPlans.length > 0) {
            /**Create the layoutPlans for all newly added plans**/
            const layoutPlans = buildLayoutPlans(addedPlans, context.sourceLabware);
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
          return produce(context, (draft) => {
            draft.layoutPlansByLabwareType = groupBy(
              updatedLayoutPlans,
              (lp) => lp.destinationLabware.labwareType.name
            );
          });
        }),
        updateSectionLayout: assign(({ context, event }) => {
          if (event.type !== 'UPDATE_SECTION_LAYOUT') {
            return context;
          }
          return produce(context, (draft) => {
            /**Find the layoutPlan in the list whose section info is changed*/
            const planInContext = findPlan(
              draft.layoutPlansByLabwareType,
              event.layoutPlan.destinationLabware.barcode!
            );
            if (planInContext) {
              planInContext.plannedActions = event.layoutPlan.plannedActions;
            }
          });
        }),
        assignSectionNumber: assign(({ context, event }) => {
          if (event.type !== 'UPDATE_SECTION_NUMBER') {
            return context;
          }
          return produce(context, (draft) => {
            /**Section number is changed externally in this plan, so update that in the layoutPlan in context**/
            const planInContext = findPlan(
              draft.layoutPlansByLabwareType,
              event.layoutPlan.destinationLabware.barcode!
            );
            if (planInContext) {
              const sectionGroupId = Object.keys(planInContext.plannedActions).find(
                (sectionGroupId) => sectionGroupId === event.sectionGroupId
              );
              if (sectionGroupId) {
                planInContext.plannedActions[sectionGroupId].source.newSection = event.sectionNumber;
              }
            }
          });
        }),
        assignSectionThickness: assign(({ context, event }) => {
          if (event.type !== 'UPDATE_SECTION_THICKNESS') {
            return context;
          }
          return produce(context, (draft) => {
            const planInContext = findPlan(
              draft.layoutPlansByLabwareType,
              event.layoutPlan.destinationLabware.barcode!
            );
            if (planInContext) {
              planInContext.plannedActions[event.sectionGroupId].source.sampleThickness = event.sectionThickness;
            }
          });
        }),
        assignPlans: assign(({ context, event }) => {
          if (event.type !== 'UPDATE_PLANS') return context;
          /**
           * If a layoutPlan has been removed, make sure to also remove the ConfirmSectionLabware for that layoutPlan
           */
          const destinationBarcodes = new Set(event.plans.map((plan) => plan.planData.destination.barcode));

          const confirmSectionLabware = context.confirmSectionLabware.filter((csl) =>
            destinationBarcodes.has(csl.barcode)
          );
          return { ...context, confirmSectionLabware, plans: event.plans };
        }),

        assignSectionNumberMode: assign(({ context, event }) => {
          if (event.type !== 'UPDATE_SECTION_NUMBERING_MODE') return context;
          return { ...context, sectionNumberMode: event.mode };
        }),

        assignSourceLabware: assign(({ context }) => {
          return produce(context, (draft) => {
            draft.sourceLabware = _(draft.plans)
              .flatMap((plan) => plan.planData.sources)
              .uniqBy((source) => source.barcode)
              .value();

            //Set all highest section numbers for all source labware
            draft.sourceLabware.forEach((sourceLabware) => {
              draft.highestSectionNumbers.set(
                sourceLabware.barcode,
                maybeFindSlotByAddress(sourceLabware.slots, 'A1')?.blockHighestSection ?? 0
              );
            });
          });
        }),

        assignRequestError: assign(({ context, event }) => {
          if (event.type !== 'xstate.error.actor.confirmSection') return context;
          return { ...context, requestError: event.error };
        }),

        assignWorkNumber: assign(({ context, event }) => {
          if (event.type !== 'UPDATE_WORK_NUMBER') return context;
          return produce(context, (draft) => {
            draft.workNumber = event.workNumber;
            draft.confirmSectionLabware = draft.confirmSectionLabware.map((csl) => ({
              ...csl,
              workNumber: event.workNumber
            }));
          });
        }),
        assignConfirmSectionResults: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.confirmSection') return context;
          return {
            ...context,
            confirmSectionResultLabwares: event.output.confirmSection.labware.filter((lw) => !lw.discarded)
          };
        }),

        fillSectionNumbers: assign(({ context, event }) => {
          const updateSectionNumber: boolean =
            ((event.type === 'UPDATE_PLANS' || event.type === 'UPDATE_SECTION_LAYOUT') &&
              context.sectionNumberMode === SectionNumberMode.Auto) ||
            event.type === 'UPDATE_SECTION_NUMBERING_MODE';
          if (updateSectionNumber) {
            return produce(context, (draft) => {
              fillInSectionNumbersInLayoutPlan(
                draft.sectionNumberMode,
                draft.layoutPlansByLabwareType,
                draft.highestSectionNumbers,
                draft.confirmSectionLabware.filter((csl) => csl.cancelled).map((item) => item.barcode)
              );
            });
          }
          return context;
        })
      }
    }
  );
}

/***
 * This function fills in section numbers for all given layout Plans.
 * The filling rules are
 * 1) If fill mode is 'Manual' all sections will be filled with zeros
 * 2) If the fill mode is 'AUTO',all section numbers will be filled with numbers incrementally starting from
 *    the highest section number (stored in highestSectionMap mapped to it's source labware barcode in highestSectionMap)
 * 3) First the Tubes will be numbered, followed by other labware in the order they are kept in the list.
 * 4) For slides, the numbering will be column-wise for example: proceed down first column, then down second etc
 * 5) Tubes, if cancelled will be filled with 0, if cancelled, even in 'Auto' mode.
 *
 * @param fillMode 'Auto' or 'Manual'
 * @param layoutPlanMap List of layoutPlans
 * @param highestSectionNumberMap  Highest section number for each source labware.
 *                                 Key is the source labware barcode and value is highest section number
 *                                 For 'Auto' the numbering starts from this value
 * @param cancelledBarcodes Barcodes corresponding to cancelled layout
 */
function fillInSectionNumbersInLayoutPlan(
  fillMode: SectionNumberMode,
  layoutPlanMap: Dictionary<Array<LayoutPlan>>,
  highestSectionNumberMap: Map<string, number>,
  cancelledBarcodes: Array<string>
) {
  /**Auto filling of section numbers**/
  if (fillMode === SectionNumberMode.Auto) {
    let lastSectionNumbers: Map<string, number> = new Map();
    //copy all highest section numbers, so as to avoid changing context values
    Array.from(highestSectionNumberMap.entries()).map(([key, val]) => lastSectionNumbers.set(key, val));
    /**First fill in section numbers for TUBES**/
    const tubes = layoutPlanMap?.[LabwareTypeName.TUBE];
    tubes &&
      tubes.forEach((layoutPlan) => {
        autoFillSectionNumbers(
          layoutPlan,
          /** Tubes, if cancelled will be filled with 0, if cancelled, even in 'Auto' mode**/
          !cancelledBarcodes.some((barcode) => barcode === layoutPlan.destinationLabware.barcode),
          lastSectionNumbers
        );
      });

    /**Fill in section numbers for all labware which are not TUBES**/
    Object.entries(layoutPlanMap)
      .filter(
        ([labwareTypeName, _]) =>
          labwareTypeName !== LabwareTypeName.TUBE && labwareTypeName !== LabwareTypeName.FETAL_WASTE_CONTAINER
      )
      .forEach(([_, lps]) => {
        lps.forEach((layoutPlan) => {
          autoFillSectionNumbers(layoutPlan, true, lastSectionNumbers);
        });
      });
  } else {
    /**Manual filling, so fill all section numbers with default value 0 **/
    Object.entries(layoutPlanMap).forEach(([_, lps]) => {
      return lps.forEach((layoutPlan) => {
        autoFillSectionNumbers(layoutPlan, false);
      });
    });
  }
}
function autoFillSectionNumbers(layoutPlan: LayoutPlan, incrementFill: boolean, startNumbers?: Map<string, number>) {
  /**Get slots column wise to fill the section numbers**/
  Object.entries(layoutPlan.plannedActions).forEach(([sectionGroupId, plan]) => {
    let newSectionNum = 0;
    if (startNumbers && startNumbers.has(plan.source.labware.barcode) && incrementFill) {
      //Get the highest section number of the source labware for this section
      newSectionNum = startNumbers.get(plan.source.labware.barcode)! + 1;
      //Store the current highest section number so that it will be incremental for next section
      startNumbers.set(plan.source.labware.barcode, newSectionNum);
    }
    plan.source.newSection = newSectionNum;
    //Mutate the layoutPlan so that the child will be notified of this change and the changes will be rendered
    layoutPlan.plannedActions[sectionGroupId] = { ...plan };
  });
}

/**
 * Finds the planned action whose destination address matches the given address.
 *
 * @param plannedActions - The list of planned actions to search through.
 * @param address - The destination slot address to match.
 * @returns The matching PlanAction if found, otherwise undefined.
 */
export const findPlanActionByDestinationAddress = (
  plannedActions: Array<PlanActionFieldsFragment>,
  address: string
) => {
  return plannedActions.find((pa) => pa.destination.address === address);
};
/**
 * Convert the structure that comes back from core into lists of {@link LayoutPlan LayoutPlans}
 *
 * @param plans the list of plans to confirm
 * @param sourceLabwares the list of all source labware
 */
function buildLayoutPlans(plans: Array<FindPlanDataQuery>, sourceLabwares: Array<LabwareFlaggedFieldsFragment>) {
  const sampleColors = buildSampleColors(sourceLabwares);

  // For each layoutPlan build a LayoutPlan
  const layoutPlans: Array<LayoutPlan> = plans.map((plan) => {
    const plannedActions = {} as Record<string, PlannedSectionDetails>;
    const sources: Array<Source> = [];

    plan.planData.groups.forEach((group, index) => {
      const planned = findPlanActionByDestinationAddress(plan.planData.plan.planActions, group[0]);
      if (planned) {
        const source: Source = {
          sampleId: planned.source.samples[0].id, // we only support single sample sources for sectioning,
          newSection: planned.newSection!,
          sampleThickness: planned.sampleThickness?.toString(),
          labware: plan.planData.sources.find((lw) => lw.id === planned.source.labwareId)!
        };
        sources.push(source);
        const sectionGroupId = group.length === 1 ? group[0] : index.toString();
        plannedActions[sectionGroupId] = {
          addresses: new Set(group),
          source
        };
      }
    });
    return {
      destinationLabware: plan.planData.destination,
      sampleColors,
      sources: sources,
      plannedActions: plannedActions
    };
  });
  return layoutPlans;
}

/**
 * Find LayoutPlan from the dictionary using barcode
 * @param layoutPlans
 * @param barcode
 */
function findPlan(layoutPlans: Dictionary<LayoutPlan[]>, barcode: string) {
  let planInContext: LayoutPlan | undefined = undefined;

  /**Find the layoutPlan in the list whose section info is changed*/
  for (let plans of Object.values(layoutPlans)) {
    const findPlan = plans.find((plan) => plan.destinationLabware.barcode === barcode);
    if (findPlan) {
      planInContext = findPlan;
      break;
    }
  }
  return planInContext;
}

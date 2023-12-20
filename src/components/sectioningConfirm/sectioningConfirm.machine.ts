import {
  ConfirmSection,
  ConfirmSectionLabware,
  ConfirmSectionMutation,
  FindPlanDataQuery,
  LabwareFieldsFragment,
  LabwareFlaggedFieldsFragment,
  Maybe
} from '../../types/sdk';
import { createMachine } from 'xstate';
import { assign } from '@xstate/immer';
import { stanCore } from '../../lib/sdk';
import { LayoutPlan, Source } from '../../lib/machines/layout/layoutContext';
import _, { Dictionary, groupBy } from 'lodash';
import { Address, LabwareTypeName, MachineServiceDone, MachineServiceError } from '../../types/stan';
import { buildSampleColors, sortDownRight } from '../../lib/helpers/labwareHelper';
import { ClientError } from 'graphql-request';
import { SectionNumberMode } from './SectioningConfirm';
import { maybeFindSlotByAddress } from '../../lib/helpers/slotHelper';

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
      slotAddress: string;
      sectionIndex: number;
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
  | MachineServiceDone<'confirmSection', ConfirmSectionMutation>
  | MachineServiceError<'confirmSection'>;

export function createSectioningConfirmMachine() {
  return createMachine<SectioningConfirmContext, SectioningConfirmEvent>(
    {
      id: 'sectioningConfirm',
      context: {
        workNumber: '',
        plans: [],
        confirmSectionLabware: [],
        isConfirmSectionLabwareValid: false,
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
            src: 'validateConfirmSectionLabware',
            id: 'validateConfirmSectionLabware'
          },
          on: {
            IS_VALID: 'ready.valid',
            IS_INVALID: 'ready.invalid'
          }
        },
        confirming: {
          invoke: {
            src: 'confirmSection',
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
        assignConfirmSectionLabware: assign((ctx, e) => {
          if (e.type !== 'UPDATE_CONFIRM_SECTION_LABWARE') return;
          const cslIndex = ctx.confirmSectionLabware.findIndex(
            (csl) => csl.barcode === e.confirmSectionLabware.barcode
          );
          let confirmLabware = e.confirmSectionLabware;
          /**
           When the request is submitted for fetal waste labware, It needs to be sent with
           a ConfirmSection that has a destination address and a sample id,
           but no "newSection", since it has no section number.
           **/
          if (
            ctx.layoutPlansByLabwareType[LabwareTypeName.FETAL_WASTE_CONTAINER] &&
            ctx.layoutPlansByLabwareType[LabwareTypeName.FETAL_WASTE_CONTAINER].some(
              (plan) => plan.destinationLabware.barcode === e.confirmSectionLabware.barcode
            )
          ) {
            confirmLabware = {
              ...e.confirmSectionLabware,
              confirmSections: e.confirmSectionLabware.confirmSections
                ? e.confirmSectionLabware.confirmSections.map((cs) => {
                    return {
                      sampleId: cs.sampleId,
                      destinationAddress: cs.destinationAddress
                    };
                  })
                : []
            };
          }

          if (cslIndex > -1) {
            ctx.confirmSectionLabware[cslIndex] = confirmLabware;
          } else {
            ctx.confirmSectionLabware.push(confirmLabware);
          }
        }),
        assignLayoutPlans: assign((ctx) => {
          const layoutPlans: LayoutPlan[] = Object.values(ctx.layoutPlansByLabwareType).flatMap((plan) => plan);

          /**Remove deleted plans**/
          let updatedLayoutPlans = layoutPlans.filter((lp) =>
            Array.from(ctx.plans.values()).some(
              (plan) => plan.planData.destination.barcode === lp.destinationLabware.barcode
            )
          );
          /**Get newly added plans**/
          const addedPlans = ctx.plans.filter(
            (plan) => !layoutPlans.some((lp) => plan.planData.destination.barcode === lp.destinationLabware.barcode)
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
          ctx.layoutPlansByLabwareType = groupBy(updatedLayoutPlans, (lp) => lp.destinationLabware.labwareType.name);
        }),
        updateSectionLayout: assign((ctx, e) => {
          if (e.type !== 'UPDATE_SECTION_LAYOUT') {
            return;
          }
          /**Find the layoutPlan in the list whose section info is changed*/
          const planInContext = findPlan(ctx.layoutPlansByLabwareType, e.layoutPlan.destinationLabware.barcode!);
          if (planInContext) {
            planInContext.plannedActions = e.layoutPlan.plannedActions;
          }
        }),
        assignSectionNumber: assign((ctx, e) => {
          if (e.type !== 'UPDATE_SECTION_NUMBER') {
            return;
          }
          /**Section number is changed externally in this plan, so update that in the layoutPlan in context**/
          const planInContext = findPlan(ctx.layoutPlansByLabwareType, e.layoutPlan.destinationLabware.barcode!);
          if (planInContext) {
            const source = Array.from(planInContext.plannedActions.values())
              .flatMap((sources) => sources)
              .find((source, indx) => source.address === e.slotAddress && indx === e.sectionIndex);
            if (source) {
              source.newSection = e.sectionNumber;
            }
          }
        }),
        assignPlans: assign((ctx, e) => {
          if (e.type !== 'UPDATE_PLANS') return;
          ctx.plans = e.plans;
          /**
           * If a layoutPlan has been removed, make sure to also remove the ConfirmSectionLabware for that layoutPlan
           */
          const destinationBarcodes = new Set(ctx.plans.map((plan) => plan.planData.destination.barcode));

          ctx.confirmSectionLabware = ctx.confirmSectionLabware.filter((csl) => destinationBarcodes.has(csl.barcode));
        }),

        assignSectionNumberMode: assign((ctx, e) => {
          if (e.type !== 'UPDATE_SECTION_NUMBERING_MODE') return;
          ctx.sectionNumberMode = e.mode;
        }),

        assignSourceLabware: assign((ctx) => {
          ctx.sourceLabware = _(ctx.plans)
            .flatMap((plan) => plan.planData.sources)
            .uniqBy((source) => source.barcode)
            .value();

          //Set all highest section numbers for all source labware
          ctx.sourceLabware.forEach((sourceLabware) => {
            ctx.highestSectionNumbers.set(
              sourceLabware.barcode,
              maybeFindSlotByAddress(sourceLabware.slots, 'A1')?.blockHighestSection ?? 0
            );
          });
        }),

        assignRequestError: assign((ctx, e) => {
          if (e.type !== 'error.platform.confirmSection') return;
          ctx.requestError = e.data;
        }),

        assignWorkNumber: assign((ctx, e) => {
          if (e.type !== 'UPDATE_WORK_NUMBER') return;
          ctx.workNumber = e.workNumber;
        }),
        assignConfirmSectionResults: assign((ctx, e) => {
          if (e.type !== 'done.invoke.confirmSection') return;
          ctx.confirmSectionResultLabwares = e.data.confirmSection.labware;
        }),

        fillSectionNumbers: assign((ctx, e) => {
          const updateSectionNumber: boolean =
            ((e.type === 'UPDATE_PLANS' || e.type === 'UPDATE_SECTION_LAYOUT') &&
              ctx.sectionNumberMode === SectionNumberMode.Auto) ||
            e.type === 'UPDATE_SECTION_NUMBERING_MODE';
          updateSectionNumber &&
            fillInSectionNumbersInLayoutPlan(
              ctx.sectionNumberMode,
              ctx.layoutPlansByLabwareType,
              ctx.highestSectionNumbers,
              ctx.confirmSectionLabware.filter((csl) => csl.cancelled).map((item) => item.barcode)
            );
        })
      },

      services: {
        confirmSection: (context) => {
          return stanCore.ConfirmSection({
            request: {
              labware: context.confirmSectionLabware,
              workNumber: context.workNumber
            }
          });
        },

        validateConfirmSectionLabware: (ctx: SectioningConfirmContext) => (send) => {
          const isValid =
            ctx.confirmSectionLabware.every((csl) => {
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
              const validSectionNumber =
                csl.confirmSections?.every((cs) => (cs.newSection ? cs.newSection > 0 : false)) ?? false;
              if (!validSectionNumber) return false;

              /**Create a dictionary of slot addresses
               * key is the address
               * value is array of all sections in thet address
               * **/
              let slotDictionary: Dictionary<Array<ConfirmSection>> = groupBy(
                csl.confirmSections,
                (cs) => cs.destinationAddress
              );
              let slotAddresses = Object.keys(slotDictionary);
              for (let indx = 0; indx < slotAddresses.length; indx++) {
                const sections = slotDictionary[slotAddresses[indx]];
                /**If there are multiple sections in this slot address, it should have distinct regions assigned for each section**/
                if (sections.length > 1) {
                  /** Every section in slot has a region?**/
                  let isValidRegion = sections.every((cs) => (cs.region ? cs.region.length > 0 : false)) ?? false;
                  if (!isValidRegion) return false;
                  /** Are regions defined in a slot unique? **/
                  const regionsInSection = sections.map((section) => section.region);
                  if (regionsInSection.length !== new Set(regionsInSection).size) return false;
                }
              }
              return true;
            }) && ctx.workNumber !== '';
          send(isValid ? 'IS_VALID' : 'IS_INVALID');
        }
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
  sortDownRight(layoutPlan.destinationLabware.slots).forEach((slot) => {
    const action = layoutPlan.plannedActions.get(slot.address);
    if (action) {
      action.length > 0 &&
        action.forEach((item) => {
          let newSectionNum = 0;
          if (startNumbers && item.labware && startNumbers.has(item.labware.barcode) && incrementFill) {
            //Get the highest section number of the source labware for this section
            newSectionNum = startNumbers.get(item.labware.barcode)! + 1;
            //Store the current highest section number so that it will be incremental for next section
            startNumbers.set(item.labware.barcode, newSectionNum);
          }
          item.newSection = newSectionNum;
        });
      //Mutate the layoutPlan so that the child will be notified of this change and the changes will be rendered
      layoutPlan.plannedActions.set(slot.address, [...action]);
    }
  });
}

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
    return {
      destinationLabware: plan.planData.destination,
      sampleColors,
      plannedActions: plan.planData.plan.planActions.reduce<Map<Address, Array<Source>>>((memo, planAction) => {
        const slotActions: Array<Source> = [
          {
            sampleId: planAction.sample.id,
            labware: sourceLabwares.find((lw) => lw.id === planAction.source.labwareId)!,
            newSection: 0,
            address: planAction.source.address
          }
        ];
        const plannedActionsForSlot = memo.get(planAction.destination.address);
        if (!plannedActionsForSlot) {
          memo.set(planAction.destination.address, slotActions);
        } else {
          memo.set(planAction.destination.address, [...plannedActionsForSlot, ...slotActions]);
        }

        return memo;
      }, new Map()),

      /**
       * Layout planner doesn't need to show any sources when doing section confirmation.
       * User will only be able to add or remove the number of sections in a slot.
       */
      sources: []
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

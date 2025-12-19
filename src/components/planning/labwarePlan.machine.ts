import { ActorRef, assign, createMachine, fromPromise } from 'xstate';
import { LabwareFlaggedFieldsFragment, Maybe, PlanMutation, PlanRequestLabware, SlideCosting } from '../../types/sdk';
import { LabwareTypeName, ServerErrors } from '../../types/stan';
import { LayoutPlan, PlannedSectionDetails } from '../../lib/machines/layout/layoutContext';
import { stanCore } from '../../lib/sdk';
import { createLayoutMachine } from '../../lib/machines/layout/layoutMachine';
import { PlanMutationWithGroups } from '../../pages/sectioning/Plan';

//region Events
type CreateLabwareEvent = {
  type: 'CREATE_LABWARE';
  barcode?: string;
  lotNumber?: string;
  costing?: SlideCosting;
  operationType: string;
  plannedActions: Record<string, PlannedSectionDetails>;
};

type UpdateLayoutPlanEvent = {
  type: 'UPDATE_LAYOUT_PLAN';
  layoutPlan: LayoutPlan;
};

type PlanSectionResolveEvent = {
  type: 'xstate.done.actor.planSection';
  output: PlanMutation;
};

type PlanSectionRejectEvent = {
  type: 'xstate.error.actor.planSection';
  error: ServerErrors;
};

type AssignLayoutPlanEvent = {
  type: 'ASSIGN_LAYOUT_PLAN';
  layoutPlan: LayoutPlan;
};

type CancelEditLayout = {
  type: 'CANCEL_EDIT_LAYOUT';
};

type AssignSelectedSectionId = {
  type: 'ASSIGN_SELECTED_SECTION_ID';
  sectionId: number;
};

type LabwarePlanEvent =
  | { type: 'EDIT_LAYOUT' }
  | { type: 'CANCEL_EDIT_LAYOUT' }
  | { type: 'DONE_EDIT_LAYOUT' }
  | CreateLabwareEvent
  | UpdateLayoutPlanEvent
  | PlanSectionResolveEvent
  | PlanSectionRejectEvent
  | AssignLayoutPlanEvent
  | CancelEditLayout
  | AssignSelectedSectionId;
//endregion Events

/**
 * Context for a {@link LabwarePlan} machine
 */
interface LabwarePlanContext {
  /**
   * Errors returned from the server
   */
  requestError: Maybe<ServerErrors>;

  /**
   * The plan for how sources will be mapped onto a piece of labware
   */
  layoutPlan: LayoutPlan;

  /**
   * A plan returned from core
   */
  plan?: PlanMutationWithGroups;

  /**
   * Message from the label printer containing details of the printer's success
   */
  printSuccessMessage?: string;

  /**
   * Message from the label printer containing details of how the printer failed
   */
  printErrorMessage?: string;

  /**
   * Actor reference to the layout machine, so the spawned machine can be accessed from the context
   */
  layoutMachine?: ActorRef<any, any>;

  selectedSectionId?: number;
}

/**
 * Machine for the planning how samples will be laid out onto labware.
 */

export const createLabwarePlanMachine = (initialLayoutPlan: LayoutPlan) =>
  createMachine(
    {
      types: {} as {
        context: LabwarePlanContext;
        events: LabwarePlanEvent;
      },
      id: 'labwarePlan',
      context: {
        requestError: null,
        layoutPlan: initialLayoutPlan
      },
      initial: 'prep',
      states: {
        prep: {
          initial: 'invalid',
          states: {
            valid: {
              on: {
                CREATE_LABWARE: {
                  target: '#labwarePlan.creating'
                }
              }
            },
            errored: {
              on: {
                CREATE_LABWARE: {
                  target: '#labwarePlan.creating'
                }
              }
            },
            invalid: {}
          },
          on: {
            EDIT_LAYOUT: 'editingLayout'
          }
        },
        editingLayout: {
          id: 'layoutMachine',
          entry: [
            assign({
              layoutMachine: ({ spawn, context }) => {
                return spawn(createLayoutMachine(context.layoutPlan));
              }
            })
          ],
          on: {
            ASSIGN_LAYOUT_PLAN: {
              actions: 'assignLayoutPlan',
              target: 'validatingLayout'
            },
            CANCEL_EDIT_LAYOUT: {
              actions: 'cancelEditLayout',
              target: 'prep'
            },
            ASSIGN_SELECTED_SECTION_ID: {
              actions: 'assignSelectedSectionId'
            }
          }
        },
        validatingLayout: {
          always: [{ guard: 'isLayoutValid', target: 'prep.valid' }, { target: 'prep.invalid' }]
        },
        creating: {
          invoke: {
            id: 'planSection',
            src: fromPromise(({ input }) => {
              return stanCore.Plan({
                request: { labware: input.labware, operationType: input.operationType }
              });
            }),
            input: ({ context, event }) => {
              if (event.type !== 'CREATE_LABWARE') {
                return undefined;
              }
              const planRequestLabware = buildPlanRequestLabware({
                destinationLabwareTypeName: context.layoutPlan.destinationLabware.labwareType.name,
                ...event
              });
              return {
                labware: [planRequestLabware],
                operationType: event.operationType
              };
            },
            onDone: [
              {
                guard: 'isVisiumLP',
                target: 'done',
                actions: ['assignPlanResponse']
              },
              {
                target: 'printing',
                actions: ['assignPlanResponse']
              }
            ],
            onError: {
              target: 'prep.errored',
              actions: 'assignRequestErrors'
            }
          }
        },
        printing: {},
        done: {}
      }
    },
    {
      actions: {
        assignLayoutPlan: assign(({ context, event }) => {
          if (event.type !== 'ASSIGN_LAYOUT_PLAN') {
            return context;
          }
          return { ...context, layoutPlan: event.layoutPlan };
        }),
        cancelEditLayout: assign(({ context, event }) => {
          if (event.type !== 'CANCEL_EDIT_LAYOUT') {
            return context;
          }
          return {
            ...context,
            layoutPlan: { ...context.layoutPlan, plannedActions: {} as Record<string, PlannedSectionDetails> }
          };
        }),

        assignPlanResponse: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.planSection' || !event.output) {
            return context;
          }
          context.layoutPlan.destinationLabware = event.output.plan.labware[0] as LabwareFlaggedFieldsFragment;
          const groups: Array<Array<string>> = Object.values(context.layoutPlan.plannedActions).map((planned) =>
            Array.from(planned.addresses)
          );

          return { ...context, plan: { ...event.output, groups } };
        }),

        assignRequestErrors: assign(({ context, event }) => {
          if (event.type !== 'xstate.error.actor.planSection') {
            return context;
          }
          return { context, requestError: event.error };
        }),
        assignSelectedSectionId: assign(({ context, event }) => {
          if (event.type !== 'ASSIGN_SELECTED_SECTION_ID') {
            return context;
          }
          return { ...context, selectedSectionId: event.sectionId };
        })
      },

      guards: {
        isVisiumLP: ({ context }) =>
          context.layoutPlan.destinationLabware.labwareType.name === LabwareTypeName.VISIUM_LP,

        isLayoutValid: ({ context }) => Object.keys(context.layoutPlan.plannedActions).length > 0
      }
    }
  );

type BuildPlanRequestLabwareParams = {
  destinationLabwareTypeName: string;
  plannedActions: Record<string, PlannedSectionDetails>;
  barcode?: string;
  lotNumber?: string;
  costing?: SlideCosting;
};

function buildPlanRequestLabware({
  barcode,
  destinationLabwareTypeName,
  plannedActions,
  lotNumber,
  costing
}: BuildPlanRequestLabwareParams): PlanRequestLabware {
  return {
    labwareType: destinationLabwareTypeName,
    barcode,
    lotNumber,
    costing,

    actions: Object.keys(plannedActions).map((sectionGroupId) => {
      const sectionDetail = plannedActions[sectionGroupId];
      return {
        addresses: Array.from(sectionDetail.addresses),
        sampleThickness: sectionDetail.source.sampleThickness,
        sampleId: sectionDetail.source.sampleId,
        source: {
          barcode: sectionDetail.source.labware.barcode,
          address: sectionDetail.source.address
        }
      };
    })
  };
}

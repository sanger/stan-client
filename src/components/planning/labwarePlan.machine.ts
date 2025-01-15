import { ActorRef, assign, createMachine, fromPromise } from 'xstate';
import { Maybe, PlanMutation, PlanRequestLabware, SlideCosting } from '../../types/sdk';
import { LabwareTypeName, ServerErrors } from '../../types/stan';
import { LayoutPlan } from '../../lib/machines/layout/layoutContext';
import { stanCore } from '../../lib/sdk';
import { createLayoutMachine } from '../../lib/machines/layout/layoutMachine';

//region Events
type CreateLabwareEvent = {
  type: 'CREATE_LABWARE';
  sectionThickness?: { [slotAddress: string]: number };
  barcode?: string;
  lotNumber?: string;
  costing?: SlideCosting;
  operationType: string;
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

type LabwarePlanEvent =
  | { type: 'EDIT_LAYOUT' }
  | { type: 'CANCEL_EDIT_LAYOUT' }
  | { type: 'DONE_EDIT_LAYOUT' }
  | CreateLabwareEvent
  | UpdateLayoutPlanEvent
  | PlanSectionResolveEvent
  | PlanSectionRejectEvent
  | AssignLayoutPlanEvent
  | CancelEditLayout;
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
  plan?: PlanMutation;

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
              layoutMachine: ({ spawn, context }) => spawn(createLayoutMachine(context.layoutPlan))
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
                sampleThickness: event.sectionThickness,
                lotNumber: event.lotNumber,
                costing: event.costing,
                layoutPlan: context.layoutPlan,
                destinationLabwareTypeName: context.layoutPlan.destinationLabware.labwareType.name,
                barcode: event.barcode
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
          return { ...context, layoutPlan: { ...context.layoutPlan, plannedActions: new Map() } };
        }),

        assignPlanResponse: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.planSection' || !event.output) {
            return context;
          }

          return { ...context, plan: event.output };
        }),

        assignRequestErrors: assign(({ context, event }) => {
          if (event.type !== 'xstate.error.actor.planSection') {
            return context;
          }
          return { context, requestError: event.error };
        })
      },

      guards: {
        isVisiumLP: ({ context }) =>
          context.layoutPlan.destinationLabware.labwareType.name === LabwareTypeName.VISIUM_LP,

        isLayoutValid: ({ context }) => context.layoutPlan.plannedActions.size > 0
      }
    }
  );

type BuildPlanRequestLabwareParams = {
  destinationLabwareTypeName: string;
  layoutPlan: LayoutPlan;
  barcode?: string;
  sampleThickness?: { [slotAddress: string]: number };
  lotNumber?: string;
  costing?: SlideCosting;
};

function buildPlanRequestLabware({
  barcode,
  destinationLabwareTypeName,
  layoutPlan,
  sampleThickness,
  lotNumber,
  costing
}: BuildPlanRequestLabwareParams): PlanRequestLabware {
  return {
    labwareType: destinationLabwareTypeName,
    barcode,
    lotNumber,
    costing,
    actions: Array.from(layoutPlan.plannedActions.keys()).flatMap((address) => {
      const sources = layoutPlan.plannedActions.get(address)!;
      return sources.map((source) => ({
        address,
        sampleThickness: sampleThickness ? sampleThickness[address].toString() : '',
        sampleId: source.sampleId,
        source: {
          barcode: source.labware.barcode,
          address: source.address
        }
      }));
    })
  };
}

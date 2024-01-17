import { ActorRef, assign, createMachine, fromPromise } from 'xstate';
import { Maybe, PlanMutation, PlanRequestLabware, SlideCosting } from '../../types/sdk';
import { LabwareTypeName, ServerErrors } from '../../types/stan';
import { LayoutPlan } from '../../lib/machines/layout/layoutContext';
import { stanCore } from '../../lib/sdk';
import { createLayoutMachine } from '../../lib/machines/layout/layoutMachine';

//region Events
type CreateLabwareEvent = {
  type: 'CREATE_LABWARE';
  sectionThickness?: number;
  barcode?: string;
  quantity: number;
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

type LayoutMachineDone = {
  type: 'xstate.done.actor.layoutMachine';
  output: { layoutPlan: LayoutPlan };
};

type LabwarePlanEvent =
  | { type: 'EDIT_LAYOUT' }
  | { type: 'CANCEL_EDIT_LAYOUT' }
  | { type: 'DONE_EDIT_LAYOUT' }
  | { type: 'EDIT_LAYOUT.assignLayoutMachine' }
  | { type: 'STOP_LAYOUT_MACHINE' }
  | CreateLabwareEvent
  | UpdateLayoutPlanEvent
  | PlanSectionResolveEvent
  | PlanSectionRejectEvent
  | LayoutMachineDone;
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
          entry: [
            assign({
              layoutMachine: ({ spawn, context }) => spawn(createLayoutMachine(context.layoutPlan))
            })
          ],
          onDone: {
            target: 'validatingLayout',
            actions: 'assignLayoutPlan'
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
              const labware: PlanRequestLabware[] = new Array(event.quantity).fill(planRequestLabware);
              return {
                labware,
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
        done: {},
        stopLayoutMachine: {}
      }
    },
    {
      actions: {
        assignLayoutPlan: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.layoutMachine' || !event.output) {
            return context;
          }
          context.layoutPlan = event.output.layoutPlan;
          return context;
        }),

        assignPlanResponse: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.planSection' || !event.output) {
            return context;
          }

          context.plan = event.output;
          return context;
        }),

        assignRequestErrors: assign(({ context, event }) => {
          if (event.type !== 'xstate.error.actor.planSection') {
            return context;
          }
          context.requestError = event.error;
          return context;
        }),
        stopLayoutMachine: assign(({ context, event }) => {
          if (event.type !== 'STOP_LAYOUT_MACHINE') {
            return context;
          }
          if (context.layoutMachine) {
            context.layoutMachine.stop();
          }
          return context;
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
  sampleThickness?: number;
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
        sampleThickness,
        sampleId: source.sampleId,
        source: {
          barcode: source.labware.barcode,
          address: source.address
        }
      }));
    })
  };
}

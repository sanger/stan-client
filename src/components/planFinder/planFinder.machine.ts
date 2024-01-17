import { FindPlanDataQuery, LabwareFlaggedFieldsFragment, Maybe } from '../../types/sdk';
import { assign, createMachine, fromPromise } from 'xstate';
import { stanCore } from '../../lib/sdk';
import { ServerErrors } from '../../types/stan';

type PlanFinderContext = {
  /**
   * The current value of the scan input
   */
  labware: LabwareFlaggedFieldsFragment | undefined;

  /**
   * Map of labware barcode to plan retrieved for that barcode
   */
  plans: Map<string, FindPlanDataQuery>;

  /**
   * Description of what is invalid
   */
  validationError: Maybe<string>;

  /**
   * Error returned from a core request
   */
  requestError: Maybe<ServerErrors>;
};

type PlanFinderEvent =
  | { type: 'SUBMIT_LABWARE'; labware: LabwareFlaggedFieldsFragment }
  | { type: 'REMOVE_PLAN_BY_BARCODE'; barcode: string }
  | {
      type: 'xstate.done.actor.findPlan';
      output: FindPlanDataQuery;
    }
  | {
      type: 'xstate.error.actor.findPlan';
      error: ServerErrors;
    };

export const planFinderMachine = createMachine(
  {
    id: 'planFinderMachine',
    types: {} as {
      context: PlanFinderContext;
      events: PlanFinderEvent;
    },
    initial: 'idle',
    context: ({ input }: { input: PlanFinderContext }) => ({ ...input }),
    states: {
      idle: {
        on: {
          REMOVE_PLAN_BY_BARCODE: { actions: 'removePlanByBarcode' },
          SUBMIT_LABWARE: {
            target: 'validatingBarcode',
            actions: ['assignLabware', 'clearErrors']
          }
        }
      },
      validatingBarcode: {
        always: [
          {
            // Check plan hasn't already been found for this labware
            guard: ({ context }) => context.plans.has(context.labware!.barcode),
            target: 'idle',
            actions: ['assignDuplicationError', 'resetLabware']
          },
          { target: 'searching' }
        ]
      },
      searching: {
        invoke: {
          id: 'findPlan',
          src: fromPromise(({ input }) =>
            stanCore.FindPlanData({
              barcode: input.barcode
            })
          ),
          input: ({ context }) => ({ barcode: context.labware!.barcode }),
          onDone: {
            target: 'idle',
            actions: ['assignPlan', 'resetLabware']
          },
          onError: {
            target: 'idle',
            actions: 'assignRequestError'
          }
        }
      }
    }
  },
  {
    actions: {
      assignLabware: assign(({ context, event }) => {
        if (event.type !== 'SUBMIT_LABWARE') return context;
        context.labware = event.labware;
        return context;
      }),

      assignDuplicationError: assign(({ context, event }) => {
        if (event.type !== 'SUBMIT_LABWARE') return context;
        context.validationError = `Plan has already been found for ${event.labware.barcode}`;
        return context;
      }),

      assignPlan: assign(({ context, event }) => {
        if (event.type !== 'xstate.done.actor.findPlan') return context;
        //Remove all actions, if any that doesn't belong to the labware in context
        event.output.planData.plan.planActions = event.output.planData.plan.planActions.filter(
          (action) => action.destination.labwareId === context.labware!.id
        );
        context.plans.set(context.labware!.barcode, event.output);
        return context;
      }),

      assignRequestError: assign(({ context, event }) => {
        if (event.type !== 'xstate.error.actor.findPlan') return context;
        context.requestError = event.error;
        return context;
      }),

      clearErrors: assign(({ context }) => {
        context.requestError = null;
        context.validationError = null;
        return context;
      }),

      removePlanByBarcode: assign(({ context, event }) => {
        if (event.type !== 'REMOVE_PLAN_BY_BARCODE') return context;
        context.plans.delete(event.barcode);
        return context;
      }),

      resetLabware: assign(({ context }) => {
        context.labware = undefined;
        return context;
      })
    }
  }
);

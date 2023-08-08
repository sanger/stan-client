import { LabwareFieldsFragment, Maybe, ProbeLot, ProbeOperationLabware } from '../../../types/sdk';
import { ClientError } from 'graphql-request';
import { createMachine } from 'xstate';
import { assign } from '@xstate/immer';

/**
 * Context for ProbeHybridisation
 */
export interface ProbeHybridisationContext {
  /**
   * Scanned source labware
   */
  labware: LabwareFieldsFragment[];
  /***
   * The labware involved in probe hybridisation operation
   */
  probeLabware: ProbeOperationLabware[];
  /**
   * The time when the operation was performed, if specified.
   */
  performed: string;
  /**
   * Errors from server, if any
   */
  serverErrors?: Maybe<ClientError>;
}

type UpdateLabware = {
  type: 'UPDATE_LABWARE';
  labware: Array<LabwareFieldsFragment>;
};

type SetWorkNumberForAll = {
  type: 'SET_WORK_NUMBER_ALL';
  workNumber: string;
};
type AddProbeLotForAll = {
  type: 'ADD_PROBE_LOT';
  value: ProbeLot;
};

type SetProbeLotData = {
  type: 'SET_PROBE_LOT';
  value: ProbeLot[];
};

type SaveEvent = { type: 'SAVE' };

export type ProbeHybridisationEvent =
  | UpdateLabware
  | SetWorkNumberForAll
  | AddProbeLotForAll
  | SetProbeLotData
  | SaveEvent;

export const probeHybridisationMachine = createMachine<ProbeHybridisationContext, ProbeHybridisationEvent>(
  {
    id: 'probeHybridisation',
    initial: 'ready',
    states: {
      ready: {
        on: {
          UPDATE_LABWARE: {
            actions: 'assignLabware'
          },
          SET_WORK_NUMBER_ALL: {
            actions: 'assignWorkNumberForAll'
          }
        }
      }
    }
  },
  {
    actions: {
      assignLabware: assign((ctx, e) => {
        if (e.type !== 'UPDATE_LABWARE') return;
        ctx.labware = e.labware;
      })
    },
    services: {}
  }
);
export default probeHybridisationMachine;

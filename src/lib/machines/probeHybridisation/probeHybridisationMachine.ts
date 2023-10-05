import {
  LabwareFieldsFragment,
  Maybe,
  ProbeLot,
  ProbeOperationLabware,
  RecordProbeOperationMutation,
  SlideCosting
} from '../../../types/sdk';
import { ClientError } from 'graphql-request';
import { createMachine } from 'xstate';
import { assign } from '@xstate/immer';
import { stanCore } from '../../sdk';
import { castDraft } from 'immer';
import { MachineServiceDone, MachineServiceError } from '../../../types/stan';

/**
 * Context for ProbeHybridisation
 */
export type ProbeOperationLabwareWithOptionalCosting = Omit<ProbeOperationLabware, 'probes'> & {
  probes: Array<ProbeLotWithOptionalCosting>;
};

export type ProbeLotWithOptionalCosting = Omit<ProbeLot, 'costing'> & {
  costing?: SlideCosting;
};

export interface ProbeHybridisationContext {
  /**
   * Operation type
   */
  operationType: string;
  /**
   * Scanned  labware
   */
  labware: LabwareFieldsFragment[];
  /**
   * Worknumber for all
   */
  workNumberAll: string;

  /**
   * Worknumber for all
   */
  probeLotAll: ProbeLot;

  /***
   * The labware involved in probe hybridisation operation
   */
  probeLabware: ProbeOperationLabwareWithOptionalCosting[];
  /**
   * The time when the operation was performed, if specified.
   */
  performed: string;

  /**The result returned by reagentProbeOperation api*/
  recordProbeOperationResult?: RecordProbeOperationMutation;

  /**
   * Errors from server, if any
   */
  serverErrors?: Maybe<ClientError>;

  /**
   * Date validation error
   */
  dateValidationError?: string;
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
  type: 'ADD_PROBE_LOT_ALL';
  probe: ProbeLot;
};
type UpdateProbeLotForAll = {
  type: 'UPDATE_PROBE_LOT_ALL';
  probeLot: ProbeLot;
};

type RemoveProbeLot = {
  type: 'REMOVE_PROBE_LOT';
  barcode: string;
  probeLotIndex: number;
};
type AddProbeLot = {
  type: 'ADD_PROBE_LOT';
  barcode: string;
};

type UpdateProbeLot = {
  type: 'UPDATE_PROBE_LOT';
  barcode: string;
  index: number;
  probeLot: ProbeLot;
};

type SetStartDate = {
  type: 'SET_START_DATE';
  date: string;
};

type SaveEvent = { type: 'SAVE' };

export type ProbeHybridisationEvent =
  | UpdateLabware
  | SetWorkNumberForAll
  | SetStartDate
  | AddProbeLotForAll
  | UpdateProbeLotForAll
  | AddProbeLot
  | RemoveProbeLot
  | UpdateProbeLot
  | SaveEvent
  | MachineServiceDone<'recordProbeOperation', RecordProbeOperationMutation>
  | MachineServiceError<'recordProbeOperation'>;

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
          },
          ADD_PROBE_LOT_ALL: {
            actions: 'assignProbeLotForAll'
          },
          UPDATE_PROBE_LOT_ALL: {
            actions: 'updateProbeLotForAll'
          },
          ADD_PROBE_LOT: {
            actions: 'addProbeLot'
          },
          REMOVE_PROBE_LOT: {
            actions: 'removeProbeLot'
          },
          UPDATE_PROBE_LOT: {
            actions: 'updateProbeLot'
          },
          SET_START_DATE: {
            actions: 'assignStartDate'
          },
          SAVE: {
            actions: 'saving'
          }
        }
      },
      saving: {
        entry: 'emptyServerError',
        invoke: {
          src: 'recordProbeOperation',
          id: 'recordProbeOperation',
          onDone: {
            target: 'saved',
            actions: 'assignResult'
          },
          onError: {
            target: 'ready',
            actions: 'assignServerError'
          }
        }
      },
      saved: {
        type: 'final'
      }
    }
  },
  {
    actions: {
      assignLabware: assign((ctx, e) => {
        if (e.type !== 'UPDATE_LABWARE') return;
        ctx.labware = e.labware;
        //Remove all probe labware not in scanned labware changes
        ctx.probeLabware = ctx.probeLabware.filter((probeLabware) =>
          ctx.labware.some((lw) => lw.barcode === probeLabware.barcode)
        );
        ctx.labware.forEach((lw) => {
          if (!ctx.probeLabware.some((plw) => plw.barcode === lw.barcode)) {
            ctx.probeLabware.push({
              barcode: lw.barcode,
              probes: [{ name: '', lot: '', plex: -1, costing: undefined }],
              workNumber: ctx.workNumberAll ?? ''
            });
          }
        });
      }),
      assignWorkNumberForAll: assign((ctx, e) => {
        if (e.type !== 'SET_WORK_NUMBER_ALL') return;
        ctx.workNumberAll = e.workNumber;
        ctx.probeLabware.forEach((probeLw) => {
          probeLw.workNumber = e.workNumber;
        });
      }),
      assignProbeLotForAll: assign((ctx, e) => {
        if (e.type !== 'ADD_PROBE_LOT_ALL') return;
        ctx.probeLotAll = { ...e.probe };
        ctx.probeLabware.forEach((probeLw) => {
          probeLw.probes = [...probeLw.probes, e.probe];
        });
      }),
      updateProbeLotForAll: assign((ctx, e) => {
        if (e.type !== 'UPDATE_PROBE_LOT_ALL') return;
        ctx.probeLotAll = e.probeLot;
      }),
      removeProbeLot: assign((ctx, e) => {
        if (e.type !== 'REMOVE_PROBE_LOT') return;
        const probeLabware = ctx.probeLabware.find((plw) => plw.barcode === e.barcode);
        if (!probeLabware) return;
        probeLabware.probes.splice(e.probeLotIndex, 1);
      }),
      addProbeLot: assign((ctx, e) => {
        if (e.type !== 'ADD_PROBE_LOT') return;
        const probeLabware = ctx.probeLabware.find((plw) => plw.barcode === e.barcode);
        if (!probeLabware) return;
        probeLabware.probes.push({ name: '', lot: '', plex: -1, costing: undefined });
      }),
      updateProbeLot: assign((ctx, e) => {
        if (e.type !== 'UPDATE_PROBE_LOT') return;
        const probeLw = ctx.probeLabware.find((probeLw) => probeLw.barcode === e.barcode);
        if (!probeLw) return;
        if (e.index < probeLw.probes.length) {
          probeLw.probes[e.index] = e.probeLot;
        }
      }),
      assignStartDate: assign((ctx, e) => {
        if (e.type !== 'SET_START_DATE') return;
        const isFutureDate = e.date > new Date().toISOString().split('T')[0];
        if (isFutureDate) {
          ctx.dateValidationError = `Please select a date on or before ${new Date().toLocaleDateString()}`;
        }
        ctx.performed = e.date;
      }),
      emptyServerError: assign((ctx) => {
        ctx.serverErrors = null;
      }),
      assignResult: assign((ctx, e) => {
        if (e.type !== 'done.invoke.recordProbeOperation') {
          return;
        }
        ctx.recordProbeOperationResult = e.data;
      }),

      assignServerError: assign((ctx, e) => {
        if (e.type !== 'error.platform.recordProbeOperation') {
          return;
        }
        ctx.serverErrors = castDraft(e.data);
      })
    },
    services: {
      recordProbeOperation: (ctx: ProbeHybridisationContext) => {
        if (ctx.probeLabware.length === 0 || ctx.performed.length === 0) {
          return Promise.reject();
        }
        return stanCore.RecordProbeOperation({
          request: {
            operationType: ctx.operationType,
            labware: ctx.probeLabware.map((item) => ({
              barcode: item.barcode,
              workNumber: item.workNumber,
              probes: item.probes.map((probe) => ({
                name: probe.name,
                lot: probe.lot,
                plex: probe.plex,
                costing: probe.costing!
              }))
            })),
            performed: ctx.performed
          }
        });
      }
    }
  }
);
export default probeHybridisationMachine;

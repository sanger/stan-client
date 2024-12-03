import { ConfirmLabwareContext, ConfirmLabwareEvent } from './confirmLabware.machine';
import { MachineSnapshot } from 'xstate';

export const selectConfirmOperationLabware = (
  state: MachineSnapshot<ConfirmLabwareContext, ConfirmLabwareEvent, any, any, any, any, any, any>
) => state.context.confirmSectionLabware;

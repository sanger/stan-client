import { State } from "xstate";
import { ConfirmLabwareContext } from "./confirmLabware.machine";

export const selectConfirmOperationLabware = (
  state: State<ConfirmLabwareContext>
) => state.context.confirmSectionLabware;

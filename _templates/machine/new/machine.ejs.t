---
to: src/lib/machines/<%= name %>/<%= name %>Machine.ts
---
import { Machine } from "xstate";
import { <%= Name %>Context } from "./<%= name %>Context";
import { <%= Name %>Schema, State } from "./<%= name %>States";
import { <%= Name %>Events } from "./<%= name %>Events";
import {
  Actions,
  machineOptions,
} from "./<%= name %>MachineOptions";

/**
* <%= Name %> State Machine
*/
export const create<%= Name %>Machine = () =>
  Machine<<%= Name %>Context, <%= Name %>Schema, <%= Name %>Events>(
    {
      id: "<%= name %>",
      context: {},
      initial: State.READY,
      states: {
        [State.READY]: {}
      },
    },
    machineOptions
  );

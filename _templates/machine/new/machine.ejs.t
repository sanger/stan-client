---
to: src/lib/machines/<%= name %>/<%= name %>Machine.ts
---
import { Machine, MachineOptions, send } from "xstate";
import { assign } from "@xstate/immer";
import { <%= Name %>Context, <%= Name %>Schema, State, <%= Name %>Event } from "./<%= name %>Types";
import { init } from "./<%= name %>Events";

enum Action {
  ASSIGN_MESSAGE = "assignMessage",
}

enum Activity {}

enum Delay {}

enum Guard {}

enum Service {}

/**
* <%= Name %> Machine Options
*/
const machineOptions: Partial<MachineOptions<
  <%= Name %>Context,
  <%= Name %>Event
>> = {
  actions: {
    // Assign the message from the event to context
    [Action.ASSIGN_MESSAGE]: assign((ctx, e) => {
      if (e.type !== "INIT") {
        return;
      }
      ctx.message = e.message;
    }),
  },
  activities: {},
  delays: {},
  guards: {},
  services: {},
}

/**
* <%= Name %> State Machine
*/
export const create<%= Name %>Machine = () =>
  Machine<<%= Name %>Context, <%= Name %>Schema, <%= Name %>Event>(
    {
      id: "<%= name %>",
      context: {
        message: "",
      },
      initial: State.INIT,
      states: {
        [State.INIT]: {
          entry: send(init("<%= Name %> Machine initiated!")),
          on: {
            INIT: {
              actions: Action.ASSIGN_MESSAGE
            }
          }
        }
      },
    },
    machineOptions
  );
---
to: src/lib/machines/<%= name %>/<%= name %>Machine.ts
---
import { MachineConfig, MachineOptions } from "xstate";
import { <%= Name %>Context, <%= Name %>Schema, <%= Name %>Event } from "./<%= name %>MachineTypes";
import { assign } from "@xstate/immer";
import { createMachineBuilder } from "../index";

/**
* <%= Name %> Machine Options
*/
const machineOptions: Partial<MachineOptions<
  <%= Name %>Context,
  <%= Name %>Event
>> = {
  actions: {},
  activities: {},
  delays: {},
  guards: {},
  services: {},
};

/**
* <%= Name %> Machine Config
*/
export const machineConfig: MachineConfig<
  <%= Name %>Context,
  <%= Name %>Schema,
  <%= Name %>Event
> = {
  id: "<%= name %>",
  initial: "init",
  states: {
    init: {}
  },
};

const create<%= Name %>Machine = createMachineBuilder<
  <%= Name %>Context,
  <%= Name %>Schema,
  <%= Name %>Event
>(machineConfig, machineOptions);

export default create<%= Name %>Machine;